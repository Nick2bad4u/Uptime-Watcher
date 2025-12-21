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
import type { UnknownRecord } from "type-fest";

import { DIAGNOSTICS_CHANNELS } from "@shared/types/preload";
import {
    buildErrorLogArguments,
    buildLogArguments,
} from "@shared/utils/logger/common";
import { isObject } from "@shared/utils/typeGuards";
import { ipcRenderer } from "electron";
import log from "electron-log/renderer";

const PRELOAD_PREFIX = "PRELOAD";
const DIAGNOSTICS_PREFIX = "PRELOAD:DIAGNOSTICS";
const DIAGNOSTICS_CHANNEL = DIAGNOSTICS_CHANNELS.reportPreloadGuard;
const PAYLOAD_PREVIEW_LIMIT = 512;

const safeInvoke = (
    invoke: (...arguments_: unknown[]) => void,
    args: readonly unknown[]
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

const serializeValue = (value: unknown): unknown => {
    if (typeof value === "function") {
        return formatFunctionPlaceholder(value.name || "");
    }

    if (typeof value === "bigint") {
        return formatBigintPlaceholder(value);
    }

    if (value instanceof Map) {
        return {
            entries: Array.from(value.entries()).slice(0, 5),
            size: value.size,
            type: "Map",
        };
    }

    if (value instanceof Set) {
        return {
            sample: Array.from(value.values()).slice(0, 5),
            size: value.size,
            type: "Set",
        };
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (value instanceof Error) {
        const { cause: errorCause, message, name, stack } = value;
        return {
            cause:
                errorCause === undefined
                    ? undefined
                    : serializeValue(errorCause),
            message,
            name,
            stack,
            type: "Error",
        };
    }

    return value;
};

const safeStringify = (value: unknown): string | undefined => {
    try {
        return JSON.stringify(
            value,
            (_key, nested) => serializeValue(nested),
            2
        );
    } catch {
        return undefined;
    }
};

export const buildPayloadPreview = (
    payload: unknown,
    limit: number = PAYLOAD_PREVIEW_LIMIT
): string | undefined => {
    if (payload === undefined) {
        return undefined;
    }

    if (typeof payload === "string") {
        return truncate(payload, limit);
    }

    if (typeof payload === "number" || typeof payload === "boolean") {
        return `${payload}`;
    }

    if (payload === null) {
        return "null";
    }

    if (Array.isArray(payload) || isObject(payload)) {
        const serialized = safeStringify(payload);
        if (serialized === undefined) {
            return undefined;
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
        ...(metadata ? { metadata } : {}),
        ...(payloadPreview ? { payloadPreview } : {}),
        ...(reason ? { reason } : {}),
        timestamp: timestamp ?? Date.now(),
    };

    try {
        await ipcRenderer.invoke(DIAGNOSTICS_CHANNEL, payload);
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
