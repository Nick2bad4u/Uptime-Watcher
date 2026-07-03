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
import { validateVoidIpcResponse } from "@shared/utils/ipcResponse";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import {
    buildErrorLogArguments,
    buildLogArguments,
} from "@shared/utils/logger/common";
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

const SENSITIVE_KEY_PATTERN =
    /api[-_]?key|authorization|passphrase|password|refresh|secret|token/iu;

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
    const timestamp = value.getTime();
    return isFiniteNumber(timestamp)
        ? value.toISOString()
        : INVALID_DATE_PLACEHOLDER;
};

const sanitizePreviewString = (value: string): string => {
    try {
        const normalized = normalizeLogValue(value);
        return typeof normalized === "string" ? normalized : value;
    } catch {
        return value;
    }
};

function getOwnDataValue(
    holder: object,
    key: string
):
    | { readonly found: false }
    | { readonly found: true; readonly value: unknown } {
    const descriptor = Object.getOwnPropertyDescriptor(holder, key);

    if (!descriptor || !("value" in descriptor)) {
        return { found: false };
    }

    return { found: true, value: descriptor.value };
}

function serializeErrorCause(value: Error, seen: WeakSet<object>): unknown {
    const cause = getOwnDataValue(value, "cause");

    return cause.found && isDefined(cause.value)
        ? serializeValue(cause.value, seen)
        : undefined;
}

function serializeObjectPreview(
    value: UnknownRecord,
    seen: WeakSet<object>
): UnknownRecord {
    const keys = objectKeys(value);
    const preview: UnknownRecord = {};

    for (const key of keys.slice(0, MAX_PREVIEW_OBJECT_KEYS)) {
        if (isSensitiveKeyName(key)) {
            preview[key] = REDACTED_PLACEHOLDER;
            continue;
        }

        const dataValue = getOwnDataValue(value, key);
        preview[key] = dataValue.found
            ? serializeValue(dataValue.value, seen)
            : ACCESSOR_PLACEHOLDER;
    }

    if (keys.length > MAX_PREVIEW_OBJECT_KEYS) {
        preview["previewTruncatedKeys"] = keys.length - MAX_PREVIEW_OBJECT_KEYS;
    }

    return preview;
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
            return getSafeUrlForLogging(parsedUrl.toString());
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
        return {
            entries: [...value].slice(0, 5).map(([entryKey, entryValue]) => {
                const serializedKey = serializeValue(entryKey, seen);

                return [
                    serializedKey,
                    typeof entryKey === "string" && isSensitiveKeyName(entryKey)
                        ? REDACTED_PLACEHOLDER
                        : serializeValue(entryValue, seen),
                ];
            }),
            size: value.size,
            type: "Map",
        };
    }

    if (value instanceof Set) {
        return {
            sample: [...value]
                .slice(0, 5)
                .map((entryValue) => serializeValue(entryValue, seen)),
            size: value.size,
            type: "Set",
        };
    }

    if (value instanceof Date) {
        return serializeDate(value);
    }

    if (value instanceof URL) {
        return getSafeUrlForLogging(value.toString());
    }

    if (value instanceof ArrayBuffer) {
        return {
            byteLength: value.byteLength,
            type: "ArrayBuffer",
        };
    }

    if (ArrayBuffer.isView(value)) {
        return {
            byteLength: value.byteLength,
            constructor: value.constructor.name,
            type: "ArrayBufferView",
        };
    }

    if (Error.isError(value)) {
        return {
            cause: serializeErrorCause(value, seen),
            message: value.message,
            name: value.name,
            stack: value.stack,
            type: "Error",
        };
    }

    if (Array.isArray(value)) {
        if (value.length <= MAX_PREVIEW_ARRAY_ITEMS) {
            return value.map((item) => serializeValue(item, seen));
        }

        return {
            length: value.length,
            sample: value
                .slice(0, MAX_PREVIEW_ARRAY_ITEMS)
                .map((item) => serializeValue(item, seen)),
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
