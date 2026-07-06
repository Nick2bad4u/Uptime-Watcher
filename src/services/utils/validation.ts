/**
 * Shared validation helpers for renderer services.
 *
 * @remarks
 * Normalises `safeParse`-style results from shared Zod schemas into
 * service-specific error messages while preserving the original error as the
 * {@link Error.cause}. Centralising this logic keeps data-oriented services (for
 * example {@link DataService} and {@link MonitorTypesService}) consistent and
 * makes it easier to evolve diagnostics formatting over time.
 */

import type { UnknownRecord } from "type-fest";

import { ApplicationError } from "@shared/utils/errorHandling";
import {
    getOwnDataProperty,
    getOwnStringDataProperty,
} from "@shared/utils/errorPropertyAccess";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import { isRecord } from "@shared/utils/typeHelpers";
import { isObject } from "@shared/utils/typeGuards";
import {
    formatZodIssues,
    type ZodIssueLike,
    type ZodIssuePathPart,
} from "@shared/utils/zodIssueFormatting";
import { arrayJoin } from "ts-extras";

const MAX_RENDERER_SERVICE_DIAGNOSTICS_CHARS = 1000;

const getOwnArrayDataProperty = (
    value: unknown,
    key: string
): unknown[] | undefined => {
    if (!isObject(value)) {
        return undefined;
    }

    const property = getOwnDataProperty(value, key);

    return property.found && Array.isArray(property.value)
        ? property.value
        : undefined;
};

const isZodIssuePathPart = (value: unknown): value is ZodIssuePathPart => {
    const valueType = typeof value;
    return (
        valueType === "number" ||
        valueType === "string" ||
        valueType === "symbol"
    );
};

const normalizeValidationMessage = (value: string): string => {
    const normalized = normalizeLogValue(value);
    return typeof normalized === "string" ? normalized : value;
};

const normalizeValidationMessageOrUndefined = (
    value: string
): string | undefined => {
    const trimmed = normalizeValidationMessage(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeZodIssueLikeArray = (issues: unknown[]): ZodIssueLike[] => {
    const normalized: ZodIssueLike[] = [];

    for (const issue of issues) {
        if (!isObject(issue)) {
            continue;
        }

        const rawMessage = getOwnStringDataProperty(issue, "message");

        if (rawMessage) {
            const message = normalizeValidationMessage(rawMessage);
            const rawPath = getOwnDataProperty(issue, "path");
            const path =
                rawPath.found &&
                Array.isArray(rawPath.value) &&
                rawPath.value.every(isZodIssuePathPart)
                    ? rawPath.value
                    : undefined;

            if (path) {
                normalized.push({ message, path });
            } else {
                normalized.push({ message });
            }
        }
    }

    return normalized;
};

type SafeParseResult<T> =
    | { readonly data: T; readonly success: true }
    | { readonly error: unknown; readonly success: false };

type Validator<T> = (value: unknown) => SafeParseResult<T>;

interface ValidationContext {
    /**
     * Optional diagnostics payload attached to error messages to aid
     * troubleshooting. This object is JSON-stringified defensively; if
     * serialization fails a placeholder token is used instead.
     */
    readonly diagnostics?: UnknownRecord;
    /**
     * Logical operation name used when constructing error messages.
     *
     * @example DownloadSqliteBackup or "getMonitorTypes".
     */
    readonly operation: string;
    /**
     * Service prefix injected into error messages.
     *
     * @example DataService or "MonitorTypesService".
     */
    readonly serviceName: string;
}

interface NormalizedDiagnostics {
    readonly details?: UnknownRecord;
    readonly suffix: string;
}

const truncateDiagnostics = (
    value: string
): {
    readonly truncated: boolean;
    readonly value: string;
} =>
    value.length <= MAX_RENDERER_SERVICE_DIAGNOSTICS_CHARS
        ? { truncated: false, value }
        : {
              truncated: true,
              value: `${value.slice(
                  0,
                  MAX_RENDERER_SERVICE_DIAGNOSTICS_CHARS
              )}...`,
          };

const normalizeDiagnostics = (
    diagnostics: undefined | UnknownRecord
): NormalizedDiagnostics => {
    if (!diagnostics) {
        return { suffix: "" };
    }

    try {
        const normalized = normalizeLogValue(diagnostics);
        const serialized = JSON.stringify(normalized);

        if (typeof serialized !== "string") {
            return {
                details: { diagnostics: "[unserializable]" },
                suffix: " | diagnostics=[unserializable]",
            };
        }

        const compacted = serialized.replaceAll(/\s+/gu, " ");
        const truncated = truncateDiagnostics(compacted);
        const normalizedRecord = isRecord(normalized) ? normalized : undefined;

        return {
            details:
                normalizedRecord && !truncated.truncated
                    ? normalizedRecord
                    : {
                          diagnosticsPreview: truncated.value,
                          diagnosticsTruncated: truncated.truncated,
                      },
            suffix: ` | diagnostics=${truncated.value}`,
        };
    } catch {
        return {
            details: { diagnostics: "[unserializable]" },
            suffix: " | diagnostics=[unserializable]",
        };
    }
};

const describeValidationFailureReason = (
    cause: unknown
): string | undefined => {
    if (typeof cause === "string") {
        return normalizeValidationMessageOrUndefined(cause);
    }

    if (Error.isError(cause)) {
        const message = getOwnStringDataProperty(cause, "message");
        if (message) {
            return normalizeValidationMessageOrUndefined(message);
        }
    }

    if (isObject(cause)) {
        const messageCandidate = getOwnStringDataProperty(cause, "message");
        if (messageCandidate) {
            return normalizeValidationMessageOrUndefined(messageCandidate);
        }
    }

    return undefined;
};

/**
 * Validates a payload using a shared Zod schema and unwraps the typed result.
 *
 * @remarks
 * This helper is intentionally opinionated about the resulting error messages,
 * following the pattern used by data-oriented services:
 *
 * - When the validator throws, the error message uses the form:
 *
 *   - `"[ServiceName] <operation> threw during validation"`.
 * - When validation fails, the message uses the form:
 *
 *   - `"[ServiceName] <operation> returned invalid payload: <issues>"`.
 *
 * In both cases, the original error (validator exception or Zod error) is
 * attached via `Error.cause`. Callers are expected to allow these errors to
 * propagate into the existing service wrappers (for example
 * `getIpcServiceHelpers().wrap()`), which handle logging and error surfacing.
 *
 * @param validator - Function returning a `safeParse`-style result.
 * @param value - Raw value to validate.
 * @param context - Service/operation context used to format errors.
 *
 * @returns Parsed data when validation succeeds.
 *
 * @throws Error when validation fails or the validator itself throws.
 */
export function validateServicePayload<T>(
    validator: Validator<T>,
    value: unknown,
    context: ValidationContext
): T {
    const { diagnostics, operation, serviceName } = context;
    const normalizedDiagnostics = normalizeDiagnostics(diagnostics);
    const parsed: SafeParseResult<T> = ((): SafeParseResult<T> => {
        try {
            return validator(value);
        } catch (error: unknown) {
            throw new ApplicationError({
                cause: error,
                code: "RENDERER_SERVICE_VALIDATOR_THREW",
                details: {
                    ...(normalizedDiagnostics.details && {
                        diagnostics: normalizedDiagnostics.details,
                    }),
                    operation,
                    serviceName,
                },
                message: `[${serviceName}] ${operation} threw during validation${normalizedDiagnostics.suffix}`,
                operation,
            });
        }
    })();

    if (!parsed.success) {
        const errorForEnsure = parsed.error;
        const rawIssues = getOwnArrayDataProperty(errorForEnsure, "issues");
        const issues = rawIssues ? normalizeZodIssueLikeArray(rawIssues) : [];

        const formattedIssues = arrayJoin(
            formatZodIssues(issues, {
                includePath: false,
            }),
            ", "
        );

        const fallbackReason = describeValidationFailureReason(errorForEnsure);

        const messages =
            formattedIssues.length > 0
                ? formattedIssues
                : (fallbackReason ?? "unknown validation error");

        throw new ApplicationError({
            cause: errorForEnsure,
            code: "RENDERER_SERVICE_INVALID_PAYLOAD",
            details: {
                ...(normalizedDiagnostics.details && {
                    diagnostics: normalizedDiagnostics.details,
                }),
                issues: messages,
                operation,
                serviceName,
            },
            message: `[${serviceName}] ${operation} returned invalid payload: ${messages}${normalizedDiagnostics.suffix}`,
            operation,
        });
    }

    return parsed.data;
}

/**
 * Validates a renderer service response that should be a boolean.
 *
 * @param operation - Logical operation name used in diagnostics.
 * @param value - Raw value returned by the preload bridge.
 * @param context - Service-specific diagnostics.
 *
 * @returns The boolean value when valid.
 *
 * @throws {@link ApplicationError} When the response is not a boolean.
 */
export function parseServiceBooleanResponse(
    operation: string,
    value: unknown,
    context: {
        readonly details?: UnknownRecord;
        readonly serviceName: string;
    }
): boolean {
    if (typeof value === "boolean") {
        return value;
    }

    throw new ApplicationError({
        code: "RENDERER_SERVICE_INVALID_PAYLOAD",
        details: {
            ...context.details,
            operation,
            receivedType: typeof value,
            serviceName: context.serviceName,
        },
        message: `[${context.serviceName}] ${operation} returned invalid boolean response`,
    });
}
