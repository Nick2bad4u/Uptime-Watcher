/**
 * Preload logging utilities with structured diagnostics forwarding.
 *
 * @remarks
 * Provides typed logging helpers for preload domains and bridges, ensuring
 * guard violations and diagnostics use consistent formatting while forwarding
 * telemetry to the main process.
 */

import type { PreloadGuardDiagnosticsReport } from "@shared/types/ipc";
import type { Logger } from "@shared/utils/logger/interfaces";
import type { UnknownArray, UnknownRecord } from "type-fest";

import { createIpcCorrelationEnvelope } from "@shared/types/ipc";
import { DIAGNOSTICS_CHANNELS } from "@shared/types/preload";
import { generateCorrelationId } from "@shared/utils/correlation";
import {
    getErrorStringProperty,
    getOwnDataProperty,
} from "@shared/utils/errorPropertyAccess";
import { validateVoidIpcResponse } from "@shared/utils/ipcResponse";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import {
    buildErrorLogArguments,
    buildLogArguments,
} from "@shared/utils/logger/common";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { isObject } from "@shared/utils/typeGuards";
import { getSafeUrlForLogging } from "@shared/utils/urlSafety";
import { ipcRenderer } from "electron";
import log from "electron-log/renderer";
import { isDefined, isFinite as isFiniteNumber, objectKeys } from "ts-extras";

const PRELOAD_PREFIX = "PRELOAD";
const DIAGNOSTICS_PREFIX = "PRELOAD:DIAGNOSTICS";
const DIAGNOSTICS_CHANNEL = DIAGNOSTICS_CHANNELS.reportPreloadGuard;
const PAYLOAD_PREVIEW_LIMIT = 512;
const MAX_PREVIEW_STRING = 256;

const MAX_PREVIEW_OBJECT_KEYS = 25;
const MAX_PREVIEW_ARRAY_ITEMS = 25;

const REDACTED_PLACEHOLDER = "[REDACTED]";
const ACCESSOR_PLACEHOLDER = "[Accessor]";
const CIRCULAR_PLACEHOLDER = "[Circular]";
const INVALID_DATE_PLACEHOLDER = "[Invalid Date]";
const INVALID_URL_PLACEHOLDER = "[Invalid URL]";
const UNKNOWN_SIZE_PLACEHOLDER = "[Unknown]";

const SENSITIVE_KEY_PATTERN =
    /api[-_]?key|authorization|passphrase|password|refresh|secret|token/iu;

type NativeGetter = (this: unknown) => unknown;
type NativeMethod = (this: unknown, ...arguments_: unknown[]) => unknown;

function isNativeGetter(value: unknown): value is NativeGetter {
    return typeof value === "function";
}

function isNativeMethod(value: unknown): value is NativeMethod {
    return typeof value === "function";
}

function getPrototypeObject(value: object): object | null {
    const prototype: unknown = Object.getPrototypeOf(value);

    return typeof prototype === "object" && prototype !== null
        ? prototype
        : null;
}

function getNativeGetter(
    holder: object,
    key: PropertyKey
): NativeGetter | undefined {
    let current: object | null = holder;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        const getter = descriptor
            ? getOwnDataProperty(descriptor, "get")
            : { found: false as const };

        if (getter.found && isNativeGetter(getter.value)) {
            return getter.value;
        }

        current = getPrototypeObject(current);
    }

    return undefined;
}

function getNativeMethod(
    holder: object,
    key: PropertyKey
): NativeMethod | undefined {
    let current: object | null = holder;

    while (current) {
        const method = getOwnDataProperty(current, key);
        if (method.found && isNativeMethod(method.value)) {
            return method.value;
        }

        current = getPrototypeObject(current);
    }

    return undefined;
}

function isIterable(value: unknown): value is Iterable<unknown> {
    return (
        isObject(value) && getNativeMethod(value, Symbol.iterator) !== undefined
    );
}

function isSensitiveKeyName(candidate: string): boolean {
    return SENSITIVE_KEY_PATTERN.test(candidate);
}

const safeInvoke = (
    invoke: (...arguments_: unknown[]) => void,
    args: Readonly<UnknownArray>
): void => {
    try {
        invoke(...args);
    } catch {
        // Deliberately swallow logging failures to avoid crashing preload.
    }
};

const createLogger = (prefix: string): Logger => ({
    debug: (message: string, ...args: unknown[]): void => {
        const formatted = buildLogArguments(prefix, message, args);
        safeInvoke(log.debug.bind(log), formatted);
    },
    error: (message: string, error?: unknown, ...args: unknown[]): void => {
        const formatted = buildErrorLogArguments(prefix, message, error, args);
        safeInvoke(log.error.bind(log), formatted);
    },
    info: (message: string, ...args: unknown[]): void => {
        const formatted = buildLogArguments(prefix, message, args);
        safeInvoke(log.info.bind(log), formatted);
    },
    warn: (message: string, ...args: unknown[]): void => {
        const formatted = buildLogArguments(prefix, message, args);
        safeInvoke(log.warn.bind(log), formatted);
    },
});

export const preloadLogger: Logger = createLogger(PRELOAD_PREFIX);
export const preloadDiagnosticsLogger: Logger =
    createLogger(DIAGNOSTICS_PREFIX);

const formatFunctionPlaceholder = (name: string): string =>
    `[Function ${name.length > 0 ? name : "anonymous"}]`;

const formatBigintPlaceholder = (value: bigint): string => value.toString();

const truncate = (value: string, limit: number): string =>
    value.length > limit ? `${value.slice(0, limit)}…` : value;

const serializeDate = (value: Date): string => {
    const getTime = getNativeMethod(Date.prototype, "getTime");
    const toISOString = getNativeMethod(Date.prototype, "toISOString");
    if (!getTime || !toISOString) {
        return INVALID_DATE_PLACEHOLDER;
    }

    try {
        const timestamp = Reflect.apply(getTime, value, []);
        if (typeof timestamp !== "number" || !isFiniteNumber(timestamp)) {
            return INVALID_DATE_PLACEHOLDER;
        }

        const serialized = Reflect.apply(toISOString, value, []);
        return typeof serialized === "string"
            ? serialized
            : INVALID_DATE_PLACEHOLDER;
    } catch {
        return INVALID_DATE_PLACEHOLDER;
    }
};

const serializeUrl = (value: URL): string => {
    const toString = getNativeMethod(URL.prototype, "toString");
    if (!toString) {
        return INVALID_URL_PLACEHOLDER;
    }

    try {
        const serialized = Reflect.apply(toString, value, []);
        return typeof serialized === "string"
            ? getSafeUrlForLogging(serialized)
            : INVALID_URL_PLACEHOLDER;
    } catch {
        return INVALID_URL_PLACEHOLDER;
    }
};

const getNativeCollectionSize = (
    value: Map<unknown, unknown> | Set<unknown>,
    prototype: typeof Map.prototype | typeof Set.prototype
): number | string => {
    const sizeGetter = getNativeGetter(prototype, "size");
    if (!sizeGetter) {
        return UNKNOWN_SIZE_PLACEHOLDER;
    }

    try {
        const size = Reflect.apply(sizeGetter, value, []);
        return typeof size === "number" && Number.isSafeInteger(size)
            ? size
            : UNKNOWN_SIZE_PLACEHOLDER;
    } catch {
        return UNKNOWN_SIZE_PLACEHOLDER;
    }
};

const getNativeByteLength = (
    value: ArrayBuffer | ArrayBufferView,
    prototype: object
): number | string => {
    const byteLengthGetter = getNativeGetter(prototype, "byteLength");
    if (!byteLengthGetter) {
        return UNKNOWN_SIZE_PLACEHOLDER;
    }

    try {
        const byteLength = Reflect.apply(byteLengthGetter, value, []);
        return typeof byteLength === "number" &&
            Number.isSafeInteger(byteLength) &&
            byteLength >= 0
            ? byteLength
            : UNKNOWN_SIZE_PLACEHOLDER;
    } catch {
        return UNKNOWN_SIZE_PLACEHOLDER;
    }
};

const sanitizePreviewString = (value: string): string => {
    try {
        const normalized = normalizeLogValue(value);
        return typeof normalized === "string" ? normalized : value;
    } catch {
        return value;
    }
};

function serializeErrorCause(value: Error, seen: WeakSet<object>): unknown {
    const cause = getOwnDataProperty(value, "cause");

    return cause.found && isDefined(cause.value)
        ? serializeValue(cause.value, seen)
        : undefined;
}

function serializeObjectPreview(
    value: UnknownRecord,
    seen: WeakSet<object>
): UnknownRecord {
    const keys = objectKeys(value);
    const preview = createNullPrototypeObject<UnknownRecord>();

    for (const key of keys.slice(0, MAX_PREVIEW_OBJECT_KEYS)) {
        const previewValue = (() => {
            if (isSensitiveKeyName(key)) {
                return REDACTED_PLACEHOLDER;
            }

            const dataValue = getOwnDataProperty(value, key);
            return dataValue.found
                ? serializeValue(dataValue.value, seen)
                : ACCESSOR_PLACEHOLDER;
        })();

        Object.defineProperty(preview, key, {
            configurable: true,
            enumerable: true,
            value: previewValue,
            writable: true,
        });
    }

    if (keys.length > MAX_PREVIEW_OBJECT_KEYS) {
        Object.defineProperty(preview, "previewTruncatedKeys", {
            configurable: true,
            enumerable: true,
            value: keys.length - MAX_PREVIEW_OBJECT_KEYS,
            writable: true,
        });
    }

    return preview;
}

function serializeArrayItems(
    value: readonly unknown[],
    seen: WeakSet<object>,
    limit: number
): unknown[] {
    const sample: unknown[] = [];
    const sampleLength = Math.min(value.length, limit);
    sample.length = sampleLength;

    for (let index = 0; index < sampleLength; index += 1) {
        const item = getOwnDataProperty(value, index);
        if (!item.found) {
            continue;
        }

        Object.defineProperty(sample, index, {
            configurable: true,
            enumerable: true,
            value: serializeValue(item.value, seen),
            writable: true,
        });
    }

    return sample;
}

function serializeMapPreview(
    value: Map<unknown, unknown>,
    seen: WeakSet<object>
): UnknownRecord {
    const entriesMethod = getNativeMethod(Map.prototype, "entries");
    const entries: unknown[] = [];

    if (entriesMethod) {
        try {
            const nativeEntries = Reflect.apply(entriesMethod, value, []);
            let index = 0;
            if (!isIterable(nativeEntries)) {
                return {
                    entries,
                    size: getNativeCollectionSize(value, Map.prototype),
                    type: "Map",
                };
            }

            for (const entry of nativeEntries) {
                if (index >= 5) {
                    break;
                }

                if (!Array.isArray(entry)) {
                    continue;
                }

                const entryKey = getOwnDataProperty(entry, 0);
                const entryValue = getOwnDataProperty(entry, 1);
                if (!entryKey.found || !entryValue.found) {
                    continue;
                }

                const serializedKey = serializeValue(entryKey.value, seen);

                entries.push([
                    serializedKey,
                    typeof entryKey.value === "string" &&
                    isSensitiveKeyName(entryKey.value)
                        ? REDACTED_PLACEHOLDER
                        : serializeValue(entryValue.value, seen),
                ]);
                index += 1;
            }
        } catch {
            entries.length = 0;
        }
    }

    return {
        entries,
        size: getNativeCollectionSize(value, Map.prototype),
        type: "Map",
    };
}

function serializeSetPreview(
    value: Set<unknown>,
    seen: WeakSet<object>
): UnknownRecord {
    const valuesMethod = getNativeMethod(Set.prototype, "values");
    const sample: unknown[] = [];

    if (valuesMethod) {
        try {
            const nativeValues = Reflect.apply(valuesMethod, value, []);
            let index = 0;
            if (!isIterable(nativeValues)) {
                return {
                    sample,
                    size: getNativeCollectionSize(value, Set.prototype),
                    type: "Set",
                };
            }

            for (const entryValue of nativeValues) {
                if (index >= 5) {
                    break;
                }

                sample.push(serializeValue(entryValue, seen));
                index += 1;
            }
        } catch {
            sample.length = 0;
        }
    }

    return {
        sample,
        size: getNativeCollectionSize(value, Set.prototype),
        type: "Set",
    };
}

function serializeArrayBufferView(value: ArrayBufferView): UnknownRecord {
    const prototype = getPrototypeObject(value);
    const constructor = prototype
        ? getOwnDataProperty(prototype, "constructor")
        : { found: false as const };
    const constructorName =
        constructor.found &&
        typeof constructor.value === "function" &&
        typeof constructor.value.name === "string"
            ? constructor.value.name
            : "ArrayBufferView";

    return {
        byteLength: prototype
            ? getNativeByteLength(value, prototype)
            : UNKNOWN_SIZE_PLACEHOLDER,
        constructor: constructorName,
        type: "ArrayBufferView",
    };
}

function serializeValue(value: unknown, seen: WeakSet<object>): unknown {
    if (typeof value === "function") {
        return formatFunctionPlaceholder(value.name || "");
    }

    if (typeof value === "bigint") {
        return formatBigintPlaceholder(value);
    }

    if (typeof value === "string") {
        try {
            // Accept any parseable URL (including mailto/file) for redaction.
            const parsedUrl = new URL(value);
            return serializeUrl(parsedUrl);
        } catch {
            // not a URL
        }

        const sanitized = sanitizePreviewString(value);
        if (sanitized.length <= MAX_PREVIEW_STRING) {
            return sanitized;
        }

        return {
            length: sanitized.length,
            preview: truncate(sanitized, MAX_PREVIEW_STRING),
            type: "string",
        };
    }

    if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
            return CIRCULAR_PLACEHOLDER;
        }

        seen.add(value);
    }

    if (value instanceof Map) {
        return serializeMapPreview(value, seen);
    }

    if (value instanceof Set) {
        return serializeSetPreview(value, seen);
    }

    if (value instanceof Date) {
        return serializeDate(value);
    }

    if (value instanceof URL) {
        return serializeUrl(value);
    }

    if (value instanceof ArrayBuffer) {
        return {
            byteLength: getNativeByteLength(value, ArrayBuffer.prototype),
            type: "ArrayBuffer",
        };
    }

    if (ArrayBuffer.isView(value)) {
        return serializeArrayBufferView(value);
    }

    if (Error.isError(value)) {
        const message = getErrorStringProperty(value, "message") ?? "";
        const name = getErrorStringProperty(value, "name");
        const stack = getErrorStringProperty(value, "stack");

        return {
            cause: serializeErrorCause(value, seen),
            message,
            ...(name && { name }),
            ...(stack && { stack }),
            type: "Error",
        };
    }

    if (Array.isArray(value)) {
        if (value.length <= MAX_PREVIEW_ARRAY_ITEMS) {
            return serializeArrayItems(value, seen, MAX_PREVIEW_ARRAY_ITEMS);
        }

        return {
            length: value.length,
            sample: serializeArrayItems(value, seen, MAX_PREVIEW_ARRAY_ITEMS),
            type: "Array",
        };
    }

    if (isObject(value)) {
        return serializeObjectPreview(value, seen);
    }

    return value;
}

const safeStringify = (value: unknown): string | undefined => {
    const seen = new WeakSet<object>();

    try {
        return JSON.stringify(serializeValue(value, seen), undefined, 2);
    } catch {
        return undefined;
    }
};

export const buildPayloadPreview = (
    payload: unknown,
    limit: number = PAYLOAD_PREVIEW_LIMIT
): string | undefined => {
    if (!isDefined(payload)) {
        return undefined;
    }

    if (typeof payload === "string") {
        return truncate(sanitizePreviewString(payload), limit);
    }

    if (typeof payload === "number" || typeof payload === "boolean") {
        return `${payload}`;
    }

    if (payload === null) {
        return "null";
    }

    if (Array.isArray(payload) || isObject(payload)) {
        const serialized = safeStringify(payload);
        if (!serialized) {
            return truncate("[unserializable-payload]", limit);
        }

        return truncate(serialized, limit);
    }

    return undefined;
};

/**
 * Context payload describing why a preload guard rejected a value or operation.
 */
export interface GuardFailureContext {
    readonly channel: string;
    readonly guard: string;
    readonly metadata?: UnknownRecord;
    readonly payloadPreview?: string;
    readonly reason?: string;
    readonly timestamp?: number;
}

export const reportPreloadGuardFailure = async (
    context: GuardFailureContext
): Promise<void> => {
    const { channel, guard, metadata, payloadPreview, reason, timestamp } =
        context;

    const payload: PreloadGuardDiagnosticsReport = {
        channel,
        guard,
        ...(metadata && { metadata }),
        ...(payloadPreview && { payloadPreview }),
        ...(reason && { reason }),
        timestamp: timestamp ?? Date.now(),
    };

    try {
        const correlationId = generateCorrelationId();
        const response: unknown = await ipcRenderer.invoke(
            DIAGNOSTICS_CHANNEL,
            payload,
            createIpcCorrelationEnvelope(correlationId)
        );

        // Best-effort: validate that the main process returned a proper void
        // response envelope. Failures are logged but never allowed to crash
        // preload.
        validateVoidIpcResponse(response);
    } catch (error) {
        preloadDiagnosticsLogger.warn(
            "[Diagnostics] Failed forwarding preload guard failure",
            { channel, guard }
        );
        preloadDiagnosticsLogger.debug(
            "[Diagnostics] Forwarding failure details",
            error
        );
    }
};
