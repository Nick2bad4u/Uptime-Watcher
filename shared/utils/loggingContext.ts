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
    "code",
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
    // targets we ship. The `u` flag is sufficient for this ASCII-only filter.
    key.toLowerCase().replaceAll(/[^a-z0-9]/gv, "");

const isSecretMetadataKey = (key: string): boolean =>
    SECRET_METADATA_KEYS.has(toCanonicalSecretKey(key));

const SECRET_FIELD_PATTERNS = [
    /bearer\s+[-\w.~+/]+=*/giu, // eslint-disable-line regexp/require-unicode-sets-regexp -- The `v` flag is not yet supported across all Electron targets we ship, so we rely on the `u` flag here.
    /api[_-]?key=[a-z0-9]+/giu, // eslint-disable-line regexp/require-unicode-sets-regexp -- The `v` flag is not yet supported across all Electron targets we ship, so we rely on the `u` flag here.
];

const maskBearerTokens = (value: string): string => {
    let sanitized = value;
    for (const pattern of SECRET_FIELD_PATTERNS) {
        sanitized = sanitized.replace(pattern, SECRET_PLACEHOLDER);
    }
    return sanitized;
};

const maskUrlSecrets = (value: string): string => {
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

export const normalizeLogValue = (value: unknown): unknown => {
    if (typeof value === "string") {
        return normalizeLogString(value);
    }

    if (Array.isArray(value)) {
        return value.map((item) => normalizeLogValue(item));
    }

    if (isRecord(value)) {
        const sanitizedRecord: Record<string, unknown> = {};
        for (const [key, entry] of Object.entries(value)) {
            if (isSecretMetadataKey(key)) {
                sanitizedRecord[key] = SECRET_PLACEHOLDER;
            } else {
                sanitizedRecord[key] = normalizeLogValue(entry);
            }
        }
        return sanitizedRecord;
    }

    return value;
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
