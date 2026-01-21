import type { UnknownRecord } from "type-fest";

import { generateCorrelationId } from "@shared/utils/correlation";
import { isRecord } from "@shared/utils/typeHelpers";

/** Supported logging severity levels emitted by the structured logger. */
export type LogSeverity = "debug" | "error" | "info" | "warn";

/** Shape of contextual metadata accepted by logging helpers. */
export interface LogContextInput {
    readonly channel?: string;
    readonly component?: string;
    readonly correlationId?: string;
    readonly event?: string;
    readonly metadata?: unknown;
    readonly monitorId?: string;
    readonly operation?: string;
    readonly severity?: LogSeverity;
    readonly siteIdentifier?: string;
    readonly timestamp?: number;
    readonly userAction?: string;
}

/** Normalized and sanitized log context forwarded to sinks. */
export interface SanitizedLogContext {
    readonly channel?: string;
    readonly component?: string;
    readonly correlationId: string;
    readonly event?: string;
    readonly metadata?: unknown;
    readonly monitorHash?: string;
    readonly operation?: string;
    readonly severity: LogSeverity;
    readonly siteHash?: string;
    readonly timestamp: number;
    readonly userAction?: string;
}

type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};

export const LOG_CONTEXT_SYMBOL: unique symbol = Symbol(
    "uptime-watcher-log-context"
);

/** Tagged log context stored on arguments after normalization. */
export type StructuredLogContext = LogContextInput & {
    readonly [LOG_CONTEXT_SYMBOL]: true;
};

const SECRET_QUERY_KEYS = new Set([
    "access_token",
    "api_key",
    "apikey",
    "auth",
    "auth_token",
    "client_secret",
    "code",
    "code_challenge",
    "code_verifier",
    "id_token",
    "password",
    "refresh_token",
    "state",
    "token",
]);

const SECRET_METADATA_KEYS = new Set([
    "accesstoken",
    "apikey",
    "auth",
    "authorization",
    "authtoken",
    "bearer",
    "clientsecret",
    "codechallenge",
    "codeverifier",
    "cookie",
    "csrftoken",
    "idtoken",
    "password",
    "refreshtoken",
    "secret",
    "session",
    "sessionid",
    "setcookie",
    "state",
    "token",
    "xcsrftoken",
    "xsrftoken",
]);

const SECRET_PLACEHOLDER = "[redacted]" as const;

const toCanonicalSecretKey = (key: string): string =>
    // Do not use the `v` flag here; it is not available across all Electron
    // targets we ship. This is an ASCII-only filter, so no Unicode flags are
    // required.

    key.toLowerCase().replaceAll(/[^\da-z]/gu, "");

const isSecretMetadataKey = (key: string): boolean =>
    SECRET_METADATA_KEYS.has(toCanonicalSecretKey(key));

type SecretReplacement = Readonly<{
    endIndex: number;
    replacement: string;
    startIndex: number;
}>;

const collectSecretReplacementsForKey = (args: {
    isBoundaryBeforeKey: (matchIndex: number) => boolean;
    key: string;
    lower: string;
}): SecretReplacement[] => {
    const replacements: SecretReplacement[] = [];
    const needle = `${args.key}=`;

    let index = 0;
    while (index < args.lower.length) {
        const matchIndex = args.lower.indexOf(needle, index);
        if (matchIndex === -1) {
            break;
        }

        const valueStart = matchIndex + needle.length;
        if (args.isBoundaryBeforeKey(matchIndex)) {
            let valueEnd = valueStart;
            while (valueEnd < args.lower.length) {
                const char = args.lower[valueEnd] ?? "";
                if (char === "&" || /\s/u.test(char)) {
                    break;
                }
                valueEnd += 1;
            }

            replacements.push({
                endIndex: valueEnd,
                replacement: `${args.key}=${SECRET_PLACEHOLDER}`,
                startIndex: matchIndex,
            });

            index = valueEnd;
        } else {
            index = valueStart;
        }
    }

    return replacements;
};

const collectSecretReplacements = (value: string): SecretReplacement[] => {
    const lower = value.toLowerCase();
    const replacements: SecretReplacement[] = [];

    const isBoundaryBeforeKey = (matchIndex: number): boolean => {
        if (matchIndex === 0) {
            return true;
        }

        const previousChar = lower[matchIndex - 1] ?? "";
        // Only treat `key=` patterns as secret-bearing when they appear at a
        // boundary (i.e., not in the middle of another identifier). This
        // prevents substring matches such as `token=` inside `access_token=`.
        return !/[a-z0-9_]/u.test(previousChar);
    };

    for (const key of SECRET_QUERY_KEYS) {
        replacements.push(
            ...collectSecretReplacementsForKey({
                isBoundaryBeforeKey,
                key,
                lower,
            })
        );
    }

    return replacements;
};

const applySecretReplacements = (
    value: string,
    replacements: readonly SecretReplacement[]
): string => {
    if (replacements.length === 0) {
        return value;
    }

    const sorted = Array.from(replacements).toSorted(
        (left, right) => right.startIndex - left.startIndex
    );

    let result = value;
    for (const replacement of sorted) {
        result =
            result.slice(0, replacement.startIndex) +
            replacement.replacement +
            result.slice(replacement.endIndex);
    }

    return result;
};

const maskBearerTokens = (value: string): string => {
    const bearerMasked = value.replaceAll(
        // Strip the entire scheme+token (policy/tests prefer not leaking even
        // the presence of a Bearer header).
        /bearer\s+[-\w.~+/]+=*/giu,
        SECRET_PLACEHOLDER
    );

    return applySecretReplacements(
        bearerMasked,
        collectSecretReplacements(bearerMasked)
    );
};

const maskUrlSecrets = (value: string): string => {
    // Avoid treating arbitrary strings with a colon (e.g. `ReferenceError:`)
    // as URLs. Only redact true URL-like values.
    if (!/^(?:https?|wss?):\/\//iu.test(value)) {
        return value;
    }

    try {
        const url = new URL(value);
        if (url.username) {
            url.username = SECRET_PLACEHOLDER;
        }
        if (url.password) {
            url.password = SECRET_PLACEHOLDER;
        }

        for (const key of SECRET_QUERY_KEYS) {
            if (url.searchParams.has(key)) {
                url.searchParams.set(key, SECRET_PLACEHOLDER);
            }
        }

        return url.toString();
    } catch {
        return value;
    }
};

const normalizeLogString = (value: string): string =>
    maskBearerTokens(maskUrlSecrets(value));

const computeIdentifierHash = (value: string): string => {
    let hash = 0;
    for (const char of value) {
        const codePoint = char.codePointAt(0) ?? 0;
        hash = (hash * 31 + codePoint) % 0xff_ff_ff_ff;
    }
    return hash.toString(16).padStart(8, "0");
};

const computeOptionalIdentifierHash = (
    value: string | undefined
): string | undefined => (value ? computeIdentifierHash(value) : undefined);

const buildBaseLogContext = (
    context: StructuredLogContext | undefined,
    severity: LogSeverity
): Pick<SanitizedLogContext, "correlationId" | "severity" | "timestamp"> => ({
    correlationId: context?.correlationId?.trim() ?? generateCorrelationId(),
    severity: context?.severity ?? severity,
    timestamp: context?.timestamp ?? Date.now(),
});

function normalizeNonPlainObject(
    candidate: object,
    normalize: (value: unknown) => unknown
):
    | { readonly kind: "none" }
    | { readonly kind: "normalized"; readonly value: unknown } {
    if (candidate instanceof Date) {
        return { kind: "normalized", value: candidate.toISOString() };
    }

    if (candidate instanceof URL) {
        return {
            kind: "normalized",
            value: normalizeLogString(candidate.toString()),
        };
    }

    if (candidate instanceof Error) {
        const errorWithCause = candidate as Error & { cause?: unknown };
        return {
            kind: "normalized",
            value: {
                message: normalizeLogString(candidate.message),
                name: normalizeLogString(candidate.name),
                ...(candidate.stack
                    ? { stack: normalizeLogString(candidate.stack) }
                    : {}),
                ...("cause" in errorWithCause
                    ? { cause: normalize(errorWithCause.cause) }
                    : {}),
            } satisfies UnknownRecord,
        };
    }

    if (candidate instanceof ArrayBuffer) {
        return {
            kind: "normalized",
            value: {
                byteLength: candidate.byteLength,
                type: "ArrayBuffer",
            } satisfies UnknownRecord,
        };
    }

    if (candidate instanceof Map) {
        return {
            kind: "normalized",
            value: {
                size: candidate.size,
                type: "Map",
            } satisfies UnknownRecord,
        };
    }

    if (candidate instanceof Set) {
        return {
            kind: "normalized",
            value: {
                size: candidate.size,
                type: "Set",
            } satisfies UnknownRecord,
        };
    }

    return { kind: "none" };
}

export const normalizeLogValue = (value: unknown): unknown => {
    const seen = new WeakSet<object>();

    const normalize = (candidate: unknown): unknown => {
        if (typeof candidate === "string") {
            return normalizeLogString(candidate);
        }

        if (typeof candidate === "object" && candidate !== null) {
            if (seen.has(candidate)) {
                return "[Circular]";
            }

            seen.add(candidate);

            const result = normalizeNonPlainObject(candidate, normalize);
            if (result.kind === "normalized") {
                return result.value;
            }
        }

        if (Array.isArray(candidate)) {
            return candidate.map((item) => normalize(item));
        }

        if (isRecord(candidate)) {
            const sanitizedRecord: UnknownRecord = {};
            for (const [key, entry] of Object.entries(candidate)) {
                if (isSecretMetadataKey(key)) {
                    sanitizedRecord[key] = SECRET_PLACEHOLDER;
                } else {
                    sanitizedRecord[key] = normalize(entry);
                }
            }
            return sanitizedRecord;
        }

        return candidate;
    };

    return normalize(value);
};

const collectOptionalFields = (
    context: StructuredLogContext | undefined
): Partial<Mutable<SanitizedLogContext>> => {
    if (!context) {
        return {};
    }

    const optionalFields: Partial<Mutable<SanitizedLogContext>> = {};

    if (context.channel) {
        optionalFields.channel = context.channel;
    }

    if (context.component) {
        optionalFields.component = context.component;
    }

    if (context.event) {
        optionalFields.event = context.event;
    }

    const monitorHash = computeOptionalIdentifierHash(context.monitorId);
    if (monitorHash) {
        optionalFields.monitorHash = monitorHash;
    }

    if (context.operation) {
        optionalFields.operation = context.operation;
    }

    const siteHash = computeOptionalIdentifierHash(context.siteIdentifier);
    if (siteHash) {
        optionalFields.siteHash = siteHash;
    }

    if (context.userAction) {
        optionalFields.userAction = context.userAction;
    }

    if (context.metadata !== undefined) {
        optionalFields.metadata = normalizeLogValue(context.metadata);
    }

    return optionalFields;
};

export const withLogContext = (
    context: LogContextInput
): StructuredLogContext => ({
    ...context,
    [LOG_CONTEXT_SYMBOL]: true,
});

export const isStructuredLogContext = (
    value: unknown
): value is StructuredLogContext =>
    typeof value === "object" && value !== null && LOG_CONTEXT_SYMBOL in value;

export const normalizeLogContext = (
    context: StructuredLogContext | undefined,
    severity: LogSeverity
): SanitizedLogContext => {
    const normalizedBase = buildBaseLogContext(context, severity);
    const optionalFields = collectOptionalFields(context);

    return {
        ...normalizedBase,
        ...optionalFields,
    } satisfies SanitizedLogContext;
};

/** Tuple containing an optional context and remaining log arguments. */
export interface ExtractedLogContext {
    readonly context?: SanitizedLogContext;
    readonly remaining: readonly unknown[];
}

export const extractLogContext = (
    args: readonly unknown[],
    severity: LogSeverity
): ExtractedLogContext => {
    if (args.length === 0) {
        return { remaining: args };
    }

    const [first, ...rest] = args;
    if (isStructuredLogContext(first)) {
        return {
            context: normalizeLogContext(first, severity),
            remaining: rest,
        };
    }

    return { remaining: args };
};
