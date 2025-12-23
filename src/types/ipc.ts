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
    IpcValidationResponse as SharedIpcValidationResponse,
    PreloadGuardDiagnosticsReport as SharedPreloadGuardDiagnosticsReport,
    SerializedDatabaseBackupResult as SharedSerializedDatabaseBackupResult,
    SerializedDatabaseRestorePayload as SharedSerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult as SharedSerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import {
    extractIpcResponseData,
    isIpcResponseEnvelope,
    safeExtractIpcResponseData,
} from "@shared/utils/ipcResponse";

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
/** Standard renderer validation response envelope. */
export type IpcValidationResponse = SharedIpcValidationResponse;
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
// eslint-disable-next-line etc/no-misused-generics -- Type parameter must be explicitly provided for type guard
export function isIpcResponse<T>(
    value: unknown
): value is IpcResponse<T> {
    return isIpcResponseEnvelope(value);
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
// eslint-disable-next-line etc/no-misused-generics, @typescript-eslint/no-unnecessary-type-parameters -- Type parameter must be explicitly provided for type assertion
export function extractIpcData<T>(response: unknown): T {
    return extractIpcResponseData<T>(response, { requireData: false });
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
export function safeExtractIpcData<T>(response: unknown, fallback: T): T {
    return safeExtractIpcResponseData<T>(response, fallback);
}
