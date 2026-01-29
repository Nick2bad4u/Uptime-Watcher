/**
 * IPC response type definitions and utilities for type-safe frontend-backend
 * communication.
 *
 * @remarks
 * This module provides TypeScript interfaces and utility functions that mirror
 * the backend IpcResponse interface, ensuring type safety across the Electron
 * IPC boundary. All standardized IPC handlers in the application return
 * responses in the defined format.
 *
 * The module includes:
 *
 * - Standardized response format interface
 * - Type guards for runtime type checking
 * - Data extraction utilities with error handling
 * - Safe fallback mechanisms for failed operations
 *
 * These utilities are essential for maintaining type safety when communicating
 * between the renderer process (frontend) and main process (backend) in the
 * Electron application.
 *
 * @example
 *
 * ```typescript
 * import { SiteService } from "../services/SiteService";
 *
 * // Preferred: use the renderer service facade, which handles bridge readiness
 * // and validation internally.
 * const sites = await SiteService.getSites();
 * setSites(sites);
 *
 * // Low-level example for preload authors wiring a new invoke channel.
 * // In the preload layer, handlers return `IpcResponse<T>` instances, which
 * // are validated and unwrapped by the typed bridge factory before reaching
 * // `window.electronAPI`.
 * // Avoid direct ipcRenderer usage in app code.
 * // Preload should use: createTypedInvoker(SITES_CHANNELS.getSites)
 * // Renderer should use: src/services/* wrappers.
 * if (isIpcResponse<Site[]>(rawResponse)) {
 *     const sites = extractIpcData<Site[]>(rawResponse);
 *     setSites(sites);
 * }
 *
 * // Safe extraction with fallback when raw responses are unavoidable (e.g.
 * // diagnostics helpers that must operate on untyped IPC calls).
 * const sites = safeExtractIpcData(rawResponse, []);
 * ```
 *
 * @packageDocumentation
 */

import type { SerializedDatabaseBackupMetadata as SharedSerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";
import type {
    IpcResponse,
    IpcDiagnosticsChannel as SharedIpcDiagnosticsChannel,
    IpcDiagnosticsEvent as SharedIpcDiagnosticsEvent,
    IpcHandlerVerificationResult as SharedIpcHandlerVerificationResult,
    IpcInvokeChannel as SharedIpcInvokeChannel,
    IpcInvokeChannelMap as SharedIpcInvokeChannelMap,
    IpcInvokeChannelParams as SharedIpcInvokeChannelParams,
    IpcInvokeChannelResult as SharedIpcInvokeChannelResult,
    PreloadGuardDiagnosticsReport as SharedPreloadGuardDiagnosticsReport,
    SerializedDatabaseBackupResult as SharedSerializedDatabaseBackupResult,
    SerializedDatabaseRestorePayload as SharedSerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult as SharedSerializedDatabaseRestoreResult,
} from "@shared/types/ipc";
import type * as z from "zod";

import {
    extractIpcResponseData,
    isIpcResponseEnvelope,
    safeExtractIpcResponseData,
} from "@shared/utils/ipcResponse";
import { castUnchecked } from "@shared/utils/typeHelpers";

/** Renderer-facing IPC diagnostics channels. */
export type IpcDiagnosticsChannel = SharedIpcDiagnosticsChannel;
/** Renderer-facing IPC diagnostics events. */
export type IpcDiagnosticsEvent = SharedIpcDiagnosticsEvent;
/** Structured result returned when verifying IPC handlers. */
export type IpcHandlerVerificationResult = SharedIpcHandlerVerificationResult;
/** Renderer alias for the shared IPC invoke channel union. */
export type IpcInvokeChannel = SharedIpcInvokeChannel;
/** Mapping of invoke channels to request/response signatures. */
export type IpcInvokeChannelMap = SharedIpcInvokeChannelMap;
/** Parameter tuples for each IPC invoke channel. */
export type IpcInvokeChannelParams<TChannel extends IpcInvokeChannel> =
    SharedIpcInvokeChannelParams<TChannel>;
/** Renderer view of invoke channel response payloads. */
export type IpcInvokeChannelResult<TChannel extends IpcInvokeChannel> =
    SharedIpcInvokeChannelResult<TChannel>;
/** Diagnostics report emitted by preload guard instrumentation. */
export type PreloadGuardDiagnosticsReport = SharedPreloadGuardDiagnosticsReport;
/** Metadata accompanying serialized database backups. */
export type SerializedDatabaseBackupMetadata =
    SharedSerializedDatabaseBackupMetadata;
/** Serialized backup payloads returned by the database exporter. */
export type SerializedDatabaseBackupResult =
    SharedSerializedDatabaseBackupResult;
/** Renderer payload structure for requesting a SQLite restore. */
export type SerializedDatabaseRestorePayload =
    SharedSerializedDatabaseRestorePayload;
/** Renderer-facing restore summary returned by the backend. */
export type SerializedDatabaseRestoreResult =
    SharedSerializedDatabaseRestoreResult;

/**
 * Type guard to check if a value is an IPC response.
 *
 * @param value - The value to check
 *
 * @returns True if the value is an IPC response
 *
 * @public
 */
/**
 * Runtime type guard for IPC response envelopes.
 *
 * @remarks
 * If a `schema` is provided and the response indicates success, the schema is
 * used to validate `data`.
 */
export function isIpcResponse<T>(
    value: unknown,
    schema?: z.ZodType<T>
): value is IpcResponse<T> {
    if (!isIpcResponseEnvelope(value)) {
        return false;
    }

    if (!value.success) {
        return true;
    }

    if (!schema) {
        return true;
    }

    return schema.safeParse(value.data).success;
}

/**
 * Extracts data from an IPC response or throws an error.
 *
 * @param response - The IPC response to extract data from
 *
 * @returns The data from the response
 *
 * @throws Error if the response indicates failure
 *
 * @public
 */
export function extractIpcData<T>(response: unknown, schema?: z.ZodType<T>): T {
    const extracted = extractIpcResponseData<unknown>(response, {
        requireData: false,
    });

    if (!schema) {
        return castUnchecked<T>(extracted);
    }

    return schema.parse(extracted);
}

/**
 * Safely handles IPC responses with fallback values.
 *
 * @param response - The IPC response
 * @param fallback - Fallback value if operation failed
 *
 * @returns The data or fallback value
 *
 * @public
 */
export function safeExtractIpcData<T>(
    response: unknown,
    fallback: T,
    schema?: z.ZodType<T>
): T {
    if (!schema) {
        return safeExtractIpcResponseData<T>(response, fallback);
    }

    try {
        return extractIpcData(response, schema);
    } catch {
        return fallback;
    }
}
