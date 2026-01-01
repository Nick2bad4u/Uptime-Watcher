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

import { ApplicationError } from "@shared/utils/errorHandling";
import { isObject } from "@shared/utils/typeGuards";
import {
    formatZodIssues,
    type ZodIssueLike,
    type ZodIssuePathPart,
} from "@shared/utils/zodIssueFormatting";

const hasIssueArray = (
    value: unknown
): value is { readonly issues: unknown[] } =>
    isObject(value) &&
    "issues" in value &&
    Array.isArray((value as { issues?: unknown }).issues);

const normalizeZodIssueLikeArray = (issues: unknown[]): ZodIssueLike[] => {
    const normalized: ZodIssueLike[] = [];

    for (const issue of issues) {
        if (isObject(issue)) {
            const rawMessage = issue["message"];

            if (typeof rawMessage === "string") {
                const rawPath = issue["path"];
                const path = Array.isArray(rawPath)
                    ? (rawPath as readonly ZodIssuePathPart[])
                    : undefined;

                if (path) {
                    normalized.push({ message: rawMessage, path });
                } else {
                    normalized.push({ message: rawMessage });
                }
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
    readonly diagnostics?: Record<string, unknown>;
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

const stringifyDiagnostics = (
    diagnostics: Record<string, unknown> | undefined
): string => {
    if (!diagnostics) {
        return "";
    }

    try {
        return ` | diagnostics=${JSON.stringify(diagnostics)}`;
    } catch {
        return " | diagnostics=[unserializable]";
    }
};

const describeValidationFailureReason = (
    cause: unknown
): string | undefined => {
    if (typeof cause === "string") {
        const trimmed = cause.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    if (cause instanceof Error) {
        const trimmed = cause.message.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    if (isObject(cause)) {
        const messageCandidate = cause["message"];
        if (typeof messageCandidate === "string") {
            const trimmed = messageCandidate.trim();
            return trimmed.length > 0 ? trimmed : undefined;
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
    const parsed: SafeParseResult<T> = ((): SafeParseResult<T> => {
        try {
            return validator(value);
        } catch (error: unknown) {
            const diagnosticSuffix = stringifyDiagnostics(diagnostics);

            // eslint-disable-next-line ex/use-error-cause -- ApplicationError preserves the underlying cause via its constructor options.
            throw new ApplicationError({
                cause: error,
                code: "RENDERER_SERVICE_VALIDATOR_THREW",
                details: {
                    ...(diagnostics ? { diagnostics } : {}),
                    operation,
                    serviceName,
                },
                message: `[${serviceName}] ${operation} threw during validation${diagnosticSuffix}`,
                operation,
            });
        }
    })();

    if (!parsed.success) {
        const errorForEnsure = (parsed as { readonly error: unknown }).error;
        const issues = hasIssueArray(errorForEnsure)
            ? normalizeZodIssueLikeArray(errorForEnsure.issues)
            : [];

        const formattedIssues = formatZodIssues(issues, {
            includePath: false,
        }).join(", ");

        const fallbackReason = describeValidationFailureReason(errorForEnsure);

        const messages =
            formattedIssues.length > 0
                ? formattedIssues
                : (fallbackReason ?? "unknown validation error");
        const diagnosticSuffix = stringifyDiagnostics(diagnostics);

        throw new ApplicationError({
            cause: errorForEnsure,
            code: "RENDERER_SERVICE_INVALID_PAYLOAD",
            details: {
                ...(diagnostics ? { diagnostics } : {}),
                issues: messages,
                operation,
                serviceName,
            },
            message: `[${serviceName}] ${operation} returned invalid payload: ${messages}${diagnosticSuffix}`,
            operation,
        });
    }

    return parsed.data;
}
