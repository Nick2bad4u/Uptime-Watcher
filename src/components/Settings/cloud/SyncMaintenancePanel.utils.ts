import type { CloudStatusSummary } from "@shared/types/cloud";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";

import type {
    DiagnosticsPayload,
    DiagnosticsText,
    PreviewStats,
    PreviewViewModel,
} from "./SyncMaintenancePanel.model";

import { SystemService } from "../../../services/SystemService";
import { formatFullTimestamp } from "../../../utils/time";

/**
 * Derives the user-facing status text shown above the reset tools.
 */
export function resolveSyncResetStatusText(args: {
    readonly connected: boolean;
    readonly encryptionLocked: boolean;
    readonly encryptionMode: "none" | "passphrase";
    readonly syncEnabled: boolean;
}): string {
    if (!args.connected) {
        return "Connect a provider to reset remote sync.";
    }

    if (!args.syncEnabled) {
        return "Enable sync before resetting remote sync.";
    }

    if (args.encryptionMode === "passphrase" && args.encryptionLocked) {
        return "Unlock encryption on this device before resetting remote sync.";
    }

    return "This operation clears remote sync history and re-seeds from this device.";
}

/**
 * Formats a short summary for the last reset operation.
 */
export function resolveSyncResetSummary(
    lastResult: CloudSyncResetResult | null
): null | string {
    if (!lastResult) {
        return null;
    }

    const seededLabel = lastResult.seededSnapshotKey
        ? `seeded snapshot ${lastResult.seededSnapshotKey}`
        : "seeded";

    return `Last reset: ${lastResult.deletedObjects} deleted, ${lastResult.failedDeletions.length} failed, ${seededLabel}.`;
}

/**
 * Formats an optional epoch timestamp.
 */
export function formatOptionalEpochMs(timestamp: number | undefined): string {
    if (timestamp === undefined) {
        return "—";
    }

    return formatFullTimestamp(timestamp);
}

/**
 * Builds the preview view model used by the maintenance UI.
 */
export function buildPreviewViewModel(
    preview: CloudSyncResetPreview | null
): PreviewViewModel {
    if (!preview) {
        return {
            mismatchText: null,
            otherObjectsText: null,
            perDevice: [],
            previewText:
                "Preview not loaded yet. Refresh preview before resetting.",
        };
    }

    const previewText =
        `Sync history files: ${preview.syncObjectCount} ` +
        `(snapshots: ${preview.snapshotObjectCount}, changes: ${preview.operationObjectCount}, other: ${preview.otherObjectCount}).`;

    const manifestSet = new Set(preview.deviceIds);
    const opsSet = new Set(preview.operationDeviceIds);

    const devicesOnlyInManifest = preview.deviceIds.filter(
        (id) => !opsSet.has(id)
    );
    const devicesOnlyInOps = preview.operationDeviceIds.filter(
        (id) => !manifestSet.has(id)
    );

    let mismatchText: null | string = null;
    if (
        preview.operationObjectCount > 0 &&
        (devicesOnlyInManifest.length > 0 || devicesOnlyInOps.length > 0)
    ) {
        mismatchText = `Device mismatch: manifest-only [${devicesOnlyInManifest.join(", ") || "—"}], ops-only [${devicesOnlyInOps.join(", ") || "—"}].`;
    }

    const otherObjectsText =
        preview.otherObjectCount > 0
            ? "Some sync objects were not classified as ops/snapshots; reset will still remove them."
            : null;

    return {
        mismatchText,
        otherObjectsText,
        perDevice: preview.perDevice,
        previewText,
    };
}

/**
 * Computes the metrics displayed at the top of the preview section.
 */
export function buildPreviewStats(
    preview: CloudSyncResetPreview | null
): null | PreviewStats {
    if (!preview) {
        return null;
    }

    return {
        changes: preview.operationObjectCount,
        devices: preview.deviceIds.length,
        other: preview.otherObjectCount,
        snapshots: preview.snapshotObjectCount,
        total: preview.syncObjectCount,
    };
}

/**
 * Writes diagnostics text to the OS clipboard.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
    await SystemService.writeClipboardText(text);
}

function extractBasenameForDiagnostics(path: string): string {
    const normalized = path.replaceAll("\\", "/");
    const parts = normalized.split("/").filter((part) => part.length > 0);
    return parts.at(-1) ?? path;
}

function buildProviderDetailsForDiagnostics(
    status: CloudStatusSummary | null
): unknown {
    const provider = status?.provider;
    const details = status?.providerDetails;

    if (!provider || !details) {
        return undefined;
    }

    switch (details.kind) {
        case "dropbox":
        case "google-drive":
        case "webdav": {
            return {
                hasAccountLabel: typeof details.accountLabel === "string",
                kind: details.kind,
            };
        }
        case "filesystem": {
            return {
                baseDirectoryBasename: extractBasenameForDiagnostics(
                    details.baseDirectory
                ),
                kind: details.kind,
            };
        }
        default: {
            return undefined;
        }
    }
}

/**
 * Builds the structured diagnostics payload.
 */
export function buildDiagnosticsPayload(args: {
    readonly canReset: boolean;
    readonly encryptionLocked: boolean;
    readonly encryptionMode: "none" | "passphrase";
    readonly generatedAtEpochMs: number;
    readonly lastResult: CloudSyncResetResult | null;
    readonly preview: CloudSyncResetPreview | null;
    readonly status: CloudStatusSummary | null;
    readonly statusText: string;
    readonly summary: null | string;
    readonly syncEnabled: boolean;
}): DiagnosticsPayload {
    const providerDetails = buildProviderDetailsForDiagnostics(args.status);
    const computedPreview = buildPreviewViewModel(args.preview);

    return {
        computedPreview: {
            mismatchText: computedPreview.mismatchText,
            otherObjectsText: computedPreview.otherObjectsText,
            previewText: computedPreview.previewText,
        },
        context: {
            provider: args.status?.provider ?? null,
            ...(providerDetails ? { providerDetails } : {}),
            configured: args.status?.configured ?? false,
            connected: args.status?.connected ?? false,
            encryptionLocked: args.encryptionLocked,
            encryptionMode: args.status?.encryptionMode ?? args.encryptionMode,
            lastBackupAt: args.status?.lastBackupAt ?? null,
            lastSyncAt: args.status?.lastSyncAt ?? null,
            syncEnabled: args.syncEnabled,
            ...(args.status?.lastError
                ? { lastError: args.status.lastError }
                : {}),
        },
        generatedAtEpochMs: args.generatedAtEpochMs,
        lastResetResult: args.lastResult,
        preview: args.preview,
        resetMaintenance: {
            canReset: args.canReset,
            statusText: args.statusText,
            summary: args.summary,
        },
        schemaVersion: 1,
    };
}

/**
 * Builds the copy-ready diagnostics output.
 */
export function buildDiagnosticsText(args: {
    readonly payload: DiagnosticsPayload;
}): DiagnosticsText {
    const json = JSON.stringify(args.payload, null, 2);
    const generatedAt =
        args.payload.generatedAtEpochMs > 0
            ? formatFullTimestamp(args.payload.generatedAtEpochMs)
            : "—";

    const lines: string[] = [
        "Uptime Watcher — Cloud Sync Diagnostics",
        "(No secrets; does not include passphrases, encryption keys, or OAuth tokens)",
        "",
        `Generated: ${generatedAt}`,
        "",
        "Context",
        `- Provider: ${args.payload.context.provider ?? "none"}`,
        `- Connected: ${args.payload.context.connected}`,
        `- Configured: ${args.payload.context.configured}`,
        `- Sync enabled: ${args.payload.context.syncEnabled}`,
        `- Encryption: ${args.payload.context.encryptionMode} (locked: ${args.payload.context.encryptionLocked})`,
        `- Last sync: ${args.payload.context.lastSyncAt === null ? "—" : formatFullTimestamp(args.payload.context.lastSyncAt)}`,
        `- Last backup: ${args.payload.context.lastBackupAt === null ? "—" : formatFullTimestamp(args.payload.context.lastBackupAt)}`,
        `- Last error: ${args.payload.context.lastError ?? "—"}`,
        "",
        "Reset maintenance",
        `- Can reset now: ${args.payload.resetMaintenance.canReset}`,
        `- Status: ${args.payload.resetMaintenance.statusText}`,
        `- Last reset summary: ${args.payload.resetMaintenance.summary ?? "—"}`,
        "",
        "Remote preview",
        `- ${args.payload.computedPreview.previewText}`,
        `- Mismatch: ${args.payload.computedPreview.mismatchText ?? "—"}`,
        `- Other objects note: ${args.payload.computedPreview.otherObjectsText ?? "—"}`,
        "",
        "Raw JSON",
        json,
    ];

    return { json, text: lines.join("\n") };
}
