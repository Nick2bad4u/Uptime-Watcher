/**
 * Shared IPC channel type definitions ensuring parity between renderer and main
 * processes.
 *
 * @remarks
 * Provides strongly typed parameter and result mappings for every IPC channel
 * exposed through the preload bridge. This file is consumed by both the
 * Electron main process (for handler registration) and the renderer (for typed
 * invokers), satisfying ADR-005's strict typing requirements.
 */
import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { ValidationResult } from "@shared/types/validation";
import type { UnknownRecord } from "type-fest";

/**
 * Standardized IPC response envelope shared across renderer, preload, and main.
 */
export interface IpcResponse<T = unknown> {
    /** Response data returned on success. */
    data?: T;
    /** Error message when the handler fails. */
    error?: string;
    /** Optional metadata emitted by the handler. */
    metadata?: UnknownRecord;
    /** Indicates whether the IPC call succeeded. */
    success: boolean;
    /** Optional non-fatal warnings emitted alongside the result. */
    warnings?: readonly string[];
}

/**
 * Specialized response contract for validation handlers.
 */
export interface IpcValidationResponse extends IpcResponse<ValidationResult> {
    /** Validation error messages, when present. */
    errors: readonly string[];
    /** Whether the validation succeeded. */
    success: boolean;
}

/**
 * Serialized database backup result returned to the renderer process.
 *
 * @remarks
 * Mirrors the {@link DatabaseBackupResult} structure from the Electron main
 * process but replaces the Node.js {@link Buffer} with an {@link ArrayBuffer}
 * that is transferable across the IPC boundary.
 *
 * @public
 */
export interface SerializedDatabaseBackupResult {
    /** Array buffer containing the SQLite database backup payload. */
    buffer: ArrayBuffer;
    /** Generated filename for the backup artifact. */
    fileName: string;
    /** Metadata describing the backup operation. */
    metadata: {
        /** Backup creation timestamp in milliseconds since the Unix epoch. */
        createdAt: number;
        /** Original database file path on disk. */
        originalPath: string;
        /** Size of the backup in bytes. */
        sizeBytes: number;
    };
}

/**
 * Response structure returned by the diagnostics IPC handler verification.
 *
 * @public
 */
export interface IpcHandlerVerificationResult {
    /** Ordered list of registered IPC channels exposed by the main process. */
    availableChannels: readonly string[];
    /** Channel name that was requested by the preload bridge. */
    channel: string;
    /**
     * Indicates whether the requested channel is registered in the main
     * process.
     */
    registered: boolean;
}

/**
 * Structured payload emitted when a preload guard rejects an incoming event.
 *
 * @remarks
 * Enables centralized diagnostics by forwarding guard failures, along with
 * contextual metadata, to the Electron main process.
 */
export interface PreloadGuardDiagnosticsReport {
    /** IPC channel associated with the rejected payload. */
    channel: string;
    /** Name of the guard function that rejected the payload. */
    guard: string;
    /** Additional metadata describing the guard context. */
    metadata?: Record<string, unknown>;
    /** Serialized preview of the rejected payload for debugging. */
    payloadPreview?: string;
    /** Optional human-readable reason supplied by the guard. */
    reason?: string;
    /** Timestamp (milliseconds since Unix epoch) when the guard triggered. */
    timestamp: number;
}

/**
 * Mapping of IPC invoke channel names to their parameter tuples and result
 * payloads.
 *
 * @public
 */
export interface IpcInvokeChannelMap {
    "add-site": {
        params: readonly [site: Site];
        result: Site;
    };
    "check-site-now": {
        params: readonly [siteIdentifier: string, monitorId: string];
        result: StatusUpdate | undefined;
    };
    "delete-all-sites": {
        params: readonly [];
        result: number;
    };
    "diagnostics:report-preload-guard": {
        params: readonly [report: PreloadGuardDiagnosticsReport];
        result: undefined;
    };
    "diagnostics:verify-ipc-handler": {
        params: readonly [channel: string];
        result: IpcHandlerVerificationResult;
    };
    "download-sqlite-backup": {
        params: readonly [];
        result: SerializedDatabaseBackupResult;
    };
    "export-data": {
        params: readonly [];
        result: string;
    };
    "format-monitor-detail": {
        params: readonly [monitorType: string, details: string];
        result: string;
    };
    "format-monitor-title-suffix": {
        params: readonly [monitorType: string, monitor: Monitor];
        result: string;
    };
    "get-history-limit": {
        params: readonly [];
        result: number;
    };
    "get-monitor-types": {
        params: readonly [];
        result: MonitorTypeConfig[];
    };
    "get-sites": {
        params: readonly [];
        result: Site[];
    };
    "get-sync-status": {
        params: readonly [];
        result: StateSyncStatusSummary;
    };
    "import-data": {
        params: readonly [data: string];
        result: boolean;
    };
    "open-external": {
        params: readonly [url: string];
        result: boolean;
    };
    "remove-monitor": {
        params: readonly [siteIdentifier: string, monitorId: string];
        result: boolean;
    };
    "remove-site": {
        params: readonly [identifier: string];
        result: boolean;
    };
    "request-full-sync": {
        params: readonly [];
        result: StateSyncFullSyncResult;
    };
    "reset-settings": {
        params: readonly [];
        result: undefined;
    };
    "start-monitoring": {
        params: readonly [];
        result: boolean;
    };
    "start-monitoring-for-site": {
        params: readonly [siteIdentifier: string, monitorId?: string];
        result: boolean;
    };
    "stop-monitoring": {
        params: readonly [];
        result: boolean;
    };
    "stop-monitoring-for-site": {
        params: readonly [siteIdentifier: string, monitorId?: string];
        result: boolean;
    };
    "update-history-limit": {
        params: readonly [limitDays: number];
        result: number;
    };
    "update-site": {
        params: readonly [identifier: string, updates: Partial<Site>];
        result: Site;
    };
    "validate-monitor-data": {
        params: readonly [monitorType: string, data: unknown];
        result: ValidationResult;
    };
}

/**
 * Union of all IPC channel identifiers supported by {@link IpcInvokeChannelMap}.
 *
 * @public
 */
export type IpcInvokeChannel = keyof IpcInvokeChannelMap;

/**
 * Mutable clone of a readonly tuple.
 *
 * @internal
 */
type MutableTuple<TTuple extends readonly unknown[]> = {
    -readonly [Index in keyof TTuple]: TTuple[Index];
};

/**
 * Helper type extracting the parameter tuple for a specific IPC channel.
 *
 * @public
 */
export type IpcInvokeChannelParams<TChannel extends IpcInvokeChannel> =
    MutableTuple<IpcInvokeChannelMap[TChannel]["params"]>;

/**
 * Helper type extracting the result payload for a specific IPC channel.
 *
 * @public
 */
export type IpcInvokeChannelResult<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelMap[TChannel]["result"];

/**
 * Union of channels whose IPC responses contain no payload (void results).
 *
 * @public
 */
export type VoidIpcInvokeChannel = {
    [TChannel in IpcInvokeChannel]: IpcInvokeChannelResult<TChannel> extends undefined
        ? TChannel
        : never;
}[IpcInvokeChannel];
