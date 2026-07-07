import type { UnknownArray, UnknownRecord, Writable } from "type-fest";

import { generateCorrelationId } from "@shared/utils/correlation";
import {
    getErrorStringProperty,
    getOwnDataProperty,
} from "@shared/utils/errorPropertyAccess";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { isRecord } from "@shared/utils/typeHelpers";
import {
    isDefined,
    isEmpty,
    isFinite as isFiniteNumber,
    setHas,
} from "ts-extras";

/** Supported logging severity levels emitted by the structured logger. */
export type LogSeverity =
    | "debug"
    | "error"
    | "info"
    | "warn";

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

type Mutable<T> = Writable<T>;

const LOG_CONTEXT_SYMBOL: unique symbol = Symbol("uptime-watcher-log-context");

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
    "passphrase",
    "password",
    "recovery_key",
    "refresh_token",
    "state",
    "token",
]);

const SECRET_COLON_KEYS = new Set([
    "access_token",
    "api_key",
    "apikey",
    "auth_token",
    "client_secret",
    "code_challenge",
    "code_verifier",
    "id_token",
    "passphrase",
    "password",
    "recovery_key",
    "refresh_token",
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
    "encryptionkey",
    "encryptionpassphrase",
    "idtoken",
    "passphrase",
    "password",
    "recoverykey",
    "refreshtoken",
    "secret",
    "session",
    "sessionid",
    "setcookie",
    "state",
    "token",
    "xamzsecuritytoken",
    "xapikey",
    "xcsrftoken",
    "xgoogapikey",
    "xsrftoken",
]);

const SECRET_PLACEHOLDER = "[redacted]" as const;
const INVALID_DATE_PLACEHOLDER = "[Invalid Date]" as const;
const INVALID_URL_PLACEHOLDER = "[Invalid URL]" as const;

type NativePrototypeFunction = (this: unknown) => unknown;

function isNativePrototypeFunction(
    value: unknown
): value is NativePrototypeFunction {
    return typeof value === "function";
}

function getNativePrototypeFunction(
    holder: object,
    key: PropertyKey
): NativePrototypeFunction | undefined {
    const property = getOwnDataProperty(holder, key);

    return property.found && isNativePrototypeFunction(property.value)
        ? property.value
        : undefined;
}

const toCanonicalSecretKey = (key: string): string =>
    // Do not use the `v` flag here; it is not available across all Electron
    // targets we ship. This is an ASCII-only filter, so no Unicode flags are
    // required.

    key.toLowerCase().replaceAll(/[^\da-z]/gu, "");

const isSecretMetadataKey = (key: string): boolean =>
    setHas(SECRET_METADATA_KEYS, toCanonicalSecretKey(key));

type SecretReplacement = Readonly<{
    endIndex: number;
    replacement: string;
    startIndex: number;
}>;

const collectSecretReplacementsForKey = (args: {
    isBoundaryBeforeKey: (matchIndex: number) => boolean;
    key: string;
    lower: string;
    value: string;
}): SecretReplacement[] => {
    const replacements: SecretReplacement[] = [];

    let index = 0;
    while (index < args.lower.length) {
        const matchIndex = args.lower.indexOf(args.key, index);
        if (matchIndex === -1) {
            break;
        }

        const keyEnd = matchIndex + args.key.length;
        let separatorIndex = keyEnd;
        while (/\s/u.test(args.lower[separatorIndex] ?? "")) {
            separatorIndex += 1;
        }

        const separator = args.lower[separatorIndex] ?? "";
        if (
            args.isBoundaryBeforeKey(matchIndex) &&
            (separator === "=" ||
                (separator === ":" && setHas(SECRET_COLON_KEYS, args.key)))
        ) {
            let valueStart = separatorIndex + 1;
            while (/\s/u.test(args.lower[valueStart] ?? "")) {
                valueStart += 1;
            }

            let valueEnd = valueStart;
            while (valueEnd < args.lower.length) {
                const char = args.lower[valueEnd] ?? "";
                if (
                    char === "&" ||
                    char === "," ||
                    char === ";" ||
                    /\s/u.test(char)
                ) {
                    break;
                }
                valueEnd += 1;
            }

            replacements.push({
                endIndex: valueEnd,
                replacement: `${args.value.slice(
                    matchIndex,
                    valueStart
                )}${SECRET_PLACEHOLDER}`,
                startIndex: matchIndex,
            });

            index = valueEnd;
        } else {
            index = keyEnd;
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
        // Only treat key/value patterns as secret-bearing when they appear at
        // a boundary, not in the middle of another identifier. This prevents
        // substring matches such as `token=` inside `access_token=`.
        return !/[0-9_a-z]/u.test(previousChar);
    };

    for (const key of SECRET_QUERY_KEYS) {
        replacements.push(
            ...collectSecretReplacementsForKey({
                isBoundaryBeforeKey,
                key,
                lower,
                value,
            })
        );
    }

    return replacements;
};

const applySecretReplacements = (
    value: string,
    replacements: readonly SecretReplacement[]
): string => {
    if (isEmpty(replacements)) {
        return value;
    }

    const sorted = [...replacements].toSorted(
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

const maskAuthTokens = (value: string): string => {
    const masked = value.replaceAll(
        // Strip the entire scheme+token (policy/tests prefer not leaking even
        // the presence of auth headers).
        /(?:basic|bearer|token)\s+[\w+\-./~]+=*/giu,
        () => SECRET_PLACEHOLDER
    );

    return applySecretReplacements(masked, collectSecretReplacements(masked));
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
    maskAuthTokens(maskUrlSecrets(value));

const normalizeLogDate = (value: Date): string => {
    const getTime = getNativePrototypeFunction(Date.prototype, "getTime");
    const toISOString = getNativePrototypeFunction(
        Date.prototype,
        "toISOString"
    );
    if (!getTime || !toISOString) {
        return INVALID_DATE_PLACEHOLDER;
    }

    try {
        const timestamp: unknown = Reflect.apply(getTime, value, []);
        if (typeof timestamp !== "number" || !isFiniteNumber(timestamp)) {
            return INVALID_DATE_PLACEHOLDER;
        }

        const serialized: unknown = Reflect.apply(toISOString, value, []);
        return typeof serialized === "string"
            ? serialized
            : INVALID_DATE_PLACEHOLDER;
    } catch {
        return INVALID_DATE_PLACEHOLDER;
    }
};

const normalizeLogUrl = (value: URL): string => {
    const toString = getNativePrototypeFunction(URL.prototype, "toString");
    if (!toString) {
        return INVALID_URL_PLACEHOLDER;
    }

    try {
        const serialized: unknown = Reflect.apply(toString, value, []);
        return typeof serialized === "string"
            ? normalizeLogString(serialized)
            : INVALID_URL_PLACEHOLDER;
    } catch {
        return INVALID_URL_PLACEHOLDER;
    }
};

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
): Pick<
    SanitizedLogContext,
    | "correlationId"
    | "severity"
    | "timestamp"
> => ({
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
        return { kind: "normalized", value: normalizeLogDate(candidate) };
    }

    if (candidate instanceof URL) {
        return {
            kind: "normalized",
            value: normalizeLogUrl(candidate),
        };
    }

    if (Error.isError(candidate)) {
        const causeDescriptor = getOwnDataProperty(candidate, "cause");
        const cause = causeDescriptor.found ? causeDescriptor.value : undefined;

        const message = getErrorStringProperty(candidate, "message") ?? "";
        const name = getErrorStringProperty(candidate, "name");
        const stack = getErrorStringProperty(candidate, "stack");

        return {
            kind: "normalized",
            value: {
                message: normalizeLogString(message),
                ...(name && { name: normalizeLogString(name) }),
                ...(stack && { stack: normalizeLogString(stack) }),
                ...(isDefined(cause) && { cause: normalize(cause) }),
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

function normalizeLogArray(
    candidate: readonly unknown[],
    normalize: (value: unknown) => unknown
): unknown[] {
    const sanitizedArray: unknown[] = [];
    sanitizedArray.length = candidate.length;

    for (let index = 0; index < candidate.length; index += 1) {
        const item = getOwnDataProperty(candidate, index);
        if (!item.found) {
            continue;
        }

        Object.defineProperty(sanitizedArray, index, {
            configurable: true,
            enumerable: true,
            value: normalize(item.value),
            writable: true,
        });
    }

    return sanitizedArray;
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
            return normalizeLogArray(candidate, normalize);
        }

        if (isRecord(candidate)) {
            const sanitizedRecord = createNullPrototypeObject<UnknownRecord>();
            for (const key of Reflect.ownKeys(candidate)) {
                if (typeof key !== "string") {
                    continue;
                }

                const descriptor = Object.getOwnPropertyDescriptor(
                    candidate,
                    key
                );
                if (!descriptor?.enumerable || !("value" in descriptor)) {
                    continue;
                }

                const entry = descriptor.value as unknown;
                Object.defineProperty(sanitizedRecord, key, {
                    configurable: true,
                    enumerable: true,
                    value: isSecretMetadataKey(key)
                        ? SECRET_PLACEHOLDER
                        : normalize(entry),
                    writable: true,
                });
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

    if (isDefined(context.metadata)) {
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

const isStructuredLogContext = (
    value: unknown
): value is StructuredLogContext => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const marker = getOwnDataProperty(value, LOG_CONTEXT_SYMBOL);
    return marker.found && marker.value === true;
};

const normalizeLogContext = (
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
    readonly remaining: Readonly<UnknownArray>;
}

export const extractLogContext = (
    args: Readonly<UnknownArray>,
    severity: LogSeverity
): ExtractedLogContext => {
    if (isEmpty(args)) {
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
