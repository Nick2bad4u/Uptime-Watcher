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
import type {
    Monitor,
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
    StatusUpdate,
} from "@shared/types";
import type {
    CloudBackupEntry,
    CloudEnableSyncConfig,
    CloudFilesystemProviderConfig,
    CloudStatusSummary,
} from "@shared/types/cloud";
import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";
import type { CorrelationId } from "@shared/types/events";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type {
    AppNotificationRequest,
    NotificationPreferenceUpdate,
} from "@shared/types/notifications";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { ValidationResult } from "@shared/types/validation";
import type { ExclusifyUnion, Simplify, UnknownRecord } from "type-fest";

import { isRecord } from "@shared/utils/typeHelpers";

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

const IPC_CONTEXT_FLAG = "__uptimeWatcherIpcContext" as const;

/**
 * Metadata envelope appended to IPC invocations for tracing.
 */
export interface IpcCorrelationEnvelope {
    readonly correlationId: CorrelationId;
    readonly [IPC_CONTEXT_FLAG]: true;
}

export const createIpcCorrelationEnvelope = (
    correlationId: CorrelationId
): IpcCorrelationEnvelope => ({
    correlationId,
    [IPC_CONTEXT_FLAG]: true,
});

export const isIpcCorrelationEnvelope = (
    value: unknown
): value is IpcCorrelationEnvelope => {
    if (!isRecord(value)) {
        return false;
    }

    return (
        value[IPC_CONTEXT_FLAG] === true &&
        typeof value["correlationId"] === "string"
    );
};

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
/**
 * Renderer-safe structure representing a completed database backup.
 */
export interface SerializedDatabaseBackupResult {
    buffer: ArrayBuffer;
    fileName: string;
    metadata: SerializedDatabaseBackupMetadata;
}

/**
 * Result returned when saving a SQLite backup via the main process.
 *
 * @remarks
 * This channel exists to avoid transferring large backup buffers over IPC.
 */
export type SerializedDatabaseBackupSaveResult = Simplify<
    ExclusifyUnion<
        | {
              /** Indicates the user dismissed the save dialog. */
              canceled: true;
          }
        | {
              canceled: false;
              /** File name written to disk (basename of {@link filePath}). */
              fileName: string;
              /** Absolute path where the backup was written. */
              filePath: string;
              /** Metadata describing the created backup. */
              metadata: SerializedDatabaseBackupMetadata;
          }
    >
>;

/**
 * Payload supplied by renderer processes when restoring SQLite backups.
 */
export interface SerializedDatabaseRestorePayload {
    buffer: ArrayBuffer;
    fileName?: string;
}

/**
 * Result metadata returned to the renderer after a successful restore.
 */
export interface SerializedDatabaseRestoreResult {
    metadata: SerializedDatabaseBackupMetadata;
    /** Optional filename of the safety snapshot captured before restore */
    preRestoreFileName?: string | undefined;
    restoredAt: number;
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
 * Runtime type guard for {@link IpcHandlerVerificationResult}.
 *
 * @remarks
 * The preload bridge uses this guard when validating responses from the
 * diagnostics verification channel.
 */
export const isIpcHandlerVerificationResult = (
    value: unknown
): value is IpcHandlerVerificationResult => {
    if (!isRecord(value)) {
        return false;
    }

    const { availableChannels, channel, registered } = value;

    if (
        typeof channel !== "string" ||
        typeof registered !== "boolean" ||
        !Array.isArray(availableChannels)
    ) {
        return false;
    }

    return availableChannels.every(
        (availableChannel) => typeof availableChannel === "string"
    );
};

/**
 * Structured metadata logged when verifying IPC handler registration.
 */
export interface IpcHandlerVerificationLogMetadata {
    /** Ordered list of registered IPC channel identifiers. */
    availableChannels: readonly string[];
    /** Channel name requested by the preload bridge. */
    channel: string;
}

/**
 * Structured payload emitted when a preload guard rejects an incoming event.
 *
 * @remarks
 * Enables centralized diagnostics by forwarding guard failures, along with
 * contextual metadata, to the Electron main process.
 */
export type PreloadGuardDiagnosticsReport = Simplify<{
    /** IPC channel associated with the rejected payload. */
    channel: string;
    /** Name of the guard function that rejected the payload. */
    guard: string;
    /** Additional metadata describing the guard context. */
    metadata?: UnknownRecord;
    /** Serialized preview of the rejected payload for debugging. */
    payloadPreview?: string;
    /** Optional human-readable reason supplied by the guard. */
    reason?: string;
    /** Timestamp (milliseconds since Unix epoch) when the guard triggered. */
    timestamp: number;
}>;

/**
 * Log metadata emitted when a preload guard rejects an incoming payload.
 */
export interface PreloadGuardDiagnosticsLogMetadata {
    channel: string;
    guard: string;
    metadata?: UnknownRecord;
    payloadPreview?: string;
    reason?: string;
    timestamp: number;
}

type RawDiagnosticsEvent =
    | {
          channel: "diagnostics-report-preload-guard";
          payload: PreloadGuardDiagnosticsReport;
          type: "preload-guard";
      }
    | {
          channel: "diagnostics-verify-ipc-handler";
          payload: IpcHandlerVerificationResult;
          type: "handler-verification";
      };

/**
 * Tagged union describing all diagnostics payloads emitted over IPC.
 */
export type IpcDiagnosticsEvent = Simplify<ExclusifyUnion<RawDiagnosticsEvent>>;

/**
 * Supported IPC diagnostics channels constrained by {@link IpcDiagnosticsEvent}.
 */
export type IpcDiagnosticsChannel = IpcDiagnosticsEvent["channel"];

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
    "cloud-clear-encryption-key": {
        params: readonly [];
        result: CloudStatusSummary;
    };
    "cloud-configure-filesystem-provider": {
        params: readonly [config: CloudFilesystemProviderConfig];
        result: CloudStatusSummary;
    };
    "cloud-connect-dropbox": {
        params: readonly [];
        result: CloudStatusSummary;
    };
    "cloud-connect-google-drive": {
        params: readonly [];
        result: CloudStatusSummary;
    };
    "cloud-delete-backup": {
        params: readonly [key: string];
        result: CloudBackupEntry[];
    };
    "cloud-disconnect": {
        params: readonly [];
        result: CloudStatusSummary;
    };
    "cloud-enable-sync": {
        params: readonly [config: CloudEnableSyncConfig];
        result: CloudStatusSummary;
    };
    "cloud-get-status": {
        params: readonly [];
        result: CloudStatusSummary;
    };
    "cloud-list-backups": {
        params: readonly [];
        result: CloudBackupEntry[];
    };
    "cloud-migrate-backups": {
        params: readonly [config: CloudBackupMigrationRequest];
        result: CloudBackupMigrationResult;
    };
    "cloud-preview-reset-remote-sync": {
        params: readonly [];
        result: CloudSyncResetPreview;
    };
    "cloud-request-sync-now": {
        params: readonly [];
        result: undefined;
    };
    "cloud-reset-remote-sync": {
        params: readonly [];
        result: CloudSyncResetResult;
    };
    "cloud-restore-backup": {
        params: readonly [key: string];
        result: SerializedDatabaseRestoreResult;
    };
    "cloud-set-encryption-passphrase": {
        params: readonly [passphrase: string];
        result: CloudStatusSummary;
    };
    "cloud-upload-latest-backup": {
        params: readonly [];
        result: CloudBackupEntry;
    };
    "delete-all-sites": {
        params: readonly [];
        result: number;
    };
    "diagnostics-report-preload-guard": {
        params: readonly [report: PreloadGuardDiagnosticsReport];
        result: undefined;
    };
    "diagnostics-verify-ipc-handler": {
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
    "notify-app-event": {
        params: readonly [request: AppNotificationRequest];
        result: undefined;
    };
    "open-external": {
        params: readonly [url: string];
        result: boolean;
    };
    "quit-and-install": {
        params: readonly [];
        result: boolean;
    };
    "remove-monitor": {
        params: readonly [siteIdentifier: string, monitorId: string];
        result: Site;
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
    "restore-sqlite-backup": {
        params: readonly [payload: SerializedDatabaseRestorePayload];
        result: SerializedDatabaseRestoreResult;
    };
    "save-sqlite-backup": {
        params: readonly [];
        result: SerializedDatabaseBackupSaveResult;
    };
    "start-monitoring": {
        params: readonly [];
        result: MonitoringStartSummary;
    };
    "start-monitoring-for-monitor": {
        params: readonly [siteIdentifier: string, monitorId: string];
        result: boolean;
    };
    "start-monitoring-for-site": {
        params: readonly [siteIdentifier: string];
        result: boolean;
    };
    "stop-monitoring": {
        params: readonly [];
        result: MonitoringStopSummary;
    };
    "stop-monitoring-for-monitor": {
        params: readonly [siteIdentifier: string, monitorId: string];
        result: boolean;
    };
    "stop-monitoring-for-site": {
        params: readonly [siteIdentifier: string];
        result: boolean;
    };
    "update-history-limit": {
        params: readonly [limitDays: number];
        result: number;
    };
    "update-notification-preferences": {
        params: readonly [preferences: NotificationPreferenceUpdate];
        result: undefined;
    };
    "update-site": {
        params: readonly [identifier: string, updates: Partial<Site>];
        result: Site;
    };
    "validate-monitor-data": {
        params: readonly [monitorType: string, data: unknown];
        result: ValidationResult;
    };
    "write-clipboard-text": {
        params: readonly [text: string];
        result: boolean;
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
/**
 * Helper type extracting the parameter tuple for a specific IPC channel.
 *
 * @remarks
 * Parameters are modeled as readonly tuples. This keeps the channel contract
 * accurate while avoiding mapped-type instantiation edge cases that can
 * confuse downstream tooling.
 *
 * @public
 */
export type IpcInvokeChannelParams<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelMap[TChannel]["params"];

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
