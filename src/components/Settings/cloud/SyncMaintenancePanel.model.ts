import type { CloudStatusSummary } from "@shared/types/cloud";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";

/**
 * Tone used for the maintenance status callout.
 */
export type MaintenanceTone = "info" | "warning";

/**
 * Aggregated counts shown in the preview metrics grid.
 */
export interface PreviewStats {
    readonly changes: number;
    readonly devices: number;
    readonly other: number;
    readonly snapshots: number;
    readonly total: number;
}

/**
 * Derived view model based on the sync reset preview.
 */
export interface PreviewViewModel {
    readonly mismatchText: null | string;
    readonly otherObjectsText: null | string;
    readonly perDevice: CloudSyncResetPreview["perDevice"];
    readonly previewText: string;
}

/**
 * Copy outcome used by the tools card.
 */
export type SyncMaintenanceCopyResult =
    | null
    | {
          readonly kind: "error";
          readonly message: string;
      }
    | {
          readonly kind: "success";
      };

/**
 * Structured diagnostic payload copied by the Sync Maintenance tools.
 */
export interface DiagnosticsPayload {
    readonly computedPreview: {
        readonly mismatchText: null | string;
        readonly otherObjectsText: null | string;
        readonly previewText: string;
    };
    readonly context: {
        readonly configured: boolean;
        readonly connected: boolean;
        readonly encryptionLocked: boolean;
        readonly encryptionMode: CloudStatusSummary["encryptionMode"];
        readonly lastBackupAt: null | number;
        readonly lastError?: string;
        readonly lastSyncAt: null | number;
        readonly provider: CloudStatusSummary["provider"] | null;
        readonly providerDetails?: unknown;
        readonly syncEnabled: boolean;
    };
    readonly generatedAtEpochMs: number;
    readonly lastResetResult: CloudSyncResetResult | null;
    readonly preview: CloudSyncResetPreview | null;
    readonly resetMaintenance: {
        readonly canReset: boolean;
        readonly statusText: string;
        readonly summary: null | string;
    };
    readonly schemaVersion: 1;
}

/**
 * Plain text + JSON diagnostics output.
 */
export interface DiagnosticsText {
    readonly json: string;
    readonly text: string;
}
