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

/**
 * Serialized database backup result returned to the renderer process.
 *
 * @remarks
 * Mirrors {@link DatabaseBackupResult} but replaces the Node.js {@link Buffer}
 * with an {@link ArrayBuffer} that is transferable across the IPC boundary.
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
 * Mapping of IPC invoke channel names to their parameter tuples and result
 * payloads.
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
 */
export type IpcInvokeChannel = keyof IpcInvokeChannelMap;

/**
 * Helper type extracting the parameter tuple for a specific IPC channel.
 */
type MutableTuple<TTuple extends readonly unknown[]> = {
    -readonly [Index in keyof TTuple]: TTuple[Index];
};

export type IpcInvokeChannelParams<TChannel extends IpcInvokeChannel> =
    MutableTuple<IpcInvokeChannelMap[TChannel]["params"]>;

/**
 * Helper type extracting the result payload for a specific IPC channel.
 */
export type IpcInvokeChannelResult<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelMap[TChannel]["result"];

/**
 * Union of channels whose IPC responses contain no payload (void results).
 */
export type VoidIpcInvokeChannel = {
    [TChannel in IpcInvokeChannel]: IpcInvokeChannelResult<TChannel> extends undefined
        ? TChannel
        : never;
}[IpcInvokeChannel];
