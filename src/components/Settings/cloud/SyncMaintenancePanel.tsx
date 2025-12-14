import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { JSX } from "react";

import { useCallback, useState } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { formatFullTimestamp } from "../../../utils/time";

function resolveSyncResetStatusText(args: {
    connected: boolean;
    encryptionLocked: boolean;
    encryptionMode: "none" | "passphrase";
    syncEnabled: boolean;
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

function resolveSyncResetSummary(
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

function formatOptionalEpochMs(timestamp: number | undefined): string {
    if (timestamp === undefined) {
        return "—";
    }

    return formatFullTimestamp(timestamp);
}

interface PreviewViewModel {
    readonly deviceText: null | string;
    readonly mismatchText: null | string;
    readonly otherObjectsText: null | string;
    readonly perDevice: CloudSyncResetPreview["perDevice"];
    readonly previewText: string;
}

function buildPreviewViewModel(
    preview: CloudSyncResetPreview | null
): PreviewViewModel {
    if (!preview) {
        return {
            deviceText: null,
            mismatchText: null,
            otherObjectsText: null,
            perDevice: [],
            previewText:
                "Preview not loaded yet. Refresh preview before resetting.",
        };
    }

    const previewText =
        `Remote sync objects: ${preview.syncObjectCount} ` +
        `(ops: ${preview.operationObjectCount}, snapshots: ${preview.snapshotObjectCount}, other: ${preview.otherObjectCount}).`;

    const deviceText =
        preview.deviceIds.length === 0
            ? "Known devices: none"
            : `Known devices (${preview.deviceIds.length}): ${preview.deviceIds.join(", ")}`;

    const manifestSet = new Set(preview.deviceIds);
    const opsSet = new Set(preview.operationDeviceIds);

    const devicesOnlyInManifest = preview.deviceIds.filter(
        (id) => !opsSet.has(id)
    );
    const devicesOnlyInOps = preview.operationDeviceIds.filter(
        (id) => !manifestSet.has(id)
    );

    const mismatchText =
        devicesOnlyInManifest.length > 0 || devicesOnlyInOps.length > 0
            ? `Device mismatch: manifest-only [${devicesOnlyInManifest.join(", ") || "—"}], ops-only [${devicesOnlyInOps.join(", ") || "—"}].`
            : null;

    const otherObjectsText =
        preview.otherObjectCount > 0
            ? "Some sync objects were not classified as ops/snapshots; reset will still remove them."
            : null;

    return {
        deviceText,
        mismatchText,
        otherObjectsText,
        perDevice: preview.perDevice,
        previewText,
    };
}

async function copyTextToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
}

/**
 * Props for {@link SyncMaintenancePanel}.
 */
export interface SyncMaintenancePanelProperties {
    /** Whether the cloud provider is connected. */
    readonly connected: boolean;
    /** Whether encryption is enabled but locked on this device. */
    readonly encryptionLocked: boolean;
    /** Current encryption mode. */
    readonly encryptionMode: "none" | "passphrase";
    /** Busy flag for preview refresh. */
    readonly isRefreshingPreview: boolean;
    /** Busy flag for remote sync reset. */
    readonly isResetting: boolean;
    /** Most recent reset result, if any. */
    readonly lastResult: CloudSyncResetResult | null;
    /** Action: refresh preview info. */
    readonly onRefreshPreview: () => void;
    /** Action: reset remote sync and re-seed from this device. */
    readonly onResetRemoteSyncState: () => void;
    /** Latest preview of remote sync state. */
    readonly preview: CloudSyncResetPreview | null;
    /** Whether sync is currently enabled. */
    readonly syncEnabled: boolean;
}

/**
 * Advanced maintenance panel for resetting remote sync history.
 */
export const SyncMaintenancePanel = ({
    connected,
    encryptionLocked,
    encryptionMode,
    isRefreshingPreview,
    isResetting,
    lastResult,
    onRefreshPreview,
    onResetRemoteSyncState,
    preview,
    syncEnabled,
}: SyncMaintenancePanelProperties): JSX.Element => {
    const hasPreview = preview !== null;

    const [copyResult, setCopyResult] = useState<
        | null
        | {
              kind: "error";
              message: string;
          }
        | {
              kind: "success";
          }
    >(null);

    const canReset =
        connected &&
        syncEnabled &&
        !(encryptionMode === "passphrase" && encryptionLocked) &&
        hasPreview;

    const statusText = resolveSyncResetStatusText({
        connected,
        encryptionLocked,
        encryptionMode,
        syncEnabled,
    });

    const summary = resolveSyncResetSummary(lastResult);

    const previewView = buildPreviewViewModel(preview);

    const copyDiagnostics = useCallback(
        async function copyDiagnostics(): Promise<void> {
            const computedPreview = buildPreviewViewModel(preview);
            const payload = {
                computed: {
                    deviceText: computedPreview.deviceText,
                    mismatchText: computedPreview.mismatchText,
                    otherObjectsText: computedPreview.otherObjectsText,
                    previewText: computedPreview.previewText,
                },
                generatedAtEpochMs: Date.now(),
                lastResetResult: lastResult,
                preview,
            };

            const text =
                `Uptime-Watcher Cloud Sync Reset Diagnostics\n` +
                `(No secrets; does not include passphrases or keys)\n\n${JSON.stringify(
                    payload,
                    null,
                    2
                )}`;

            setCopyResult(null);

            try {
                await copyTextToClipboard(text);
                setCopyResult({ kind: "success" });
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Unknown error";
                setCopyResult({ kind: "error", message });
            }
        },
        [lastResult, preview]
    );

    const handleCopyDiagnostics = useCallback(
        function handleCopyDiagnostics(): void {
            void copyDiagnostics();
        },
        [copyDiagnostics]
    );

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <ThemedText size="sm" variant="secondary" weight="medium">
                    Sync Maintenance
                </ThemedText>
            </div>

            <ThemedText size="sm" variant="tertiary">
                {statusText}
            </ThemedText>

            {summary ? (
                <div className="mt-2">
                    <ThemedText size="xs" variant="tertiary">
                        {summary}
                    </ThemedText>
                </div>
            ) : null}

            <div className="mt-3">
                <ThemedText size="xs" variant="tertiary">
                    {previewView.previewText}
                </ThemedText>

                {previewView.deviceText ? (
                    <ThemedText className="mt-1" size="xs" variant="tertiary">
                        {previewView.deviceText}
                    </ThemedText>
                ) : null}

                {previewView.mismatchText ? (
                    <ThemedText className="mt-1" size="xs" variant="tertiary">
                        {previewView.mismatchText}
                    </ThemedText>
                ) : null}

                {previewView.otherObjectsText ? (
                    <ThemedText className="mt-1" size="xs" variant="tertiary">
                        {previewView.otherObjectsText}
                    </ThemedText>
                ) : null}

                {previewView.perDevice.length > 0 ? (
                    <div className="mt-2 rounded-md border border-zinc-800 p-2">
                        <ThemedText
                            size="xs"
                            variant="secondary"
                            weight="medium"
                        >
                            Operation logs by device
                        </ThemedText>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                            {previewView.perDevice.map((device) => (
                                <div
                                    className="flex flex-col gap-1 rounded-md bg-zinc-950/40 p-2"
                                    key={device.deviceId}
                                >
                                    <ThemedText size="xs" variant="secondary">
                                        {device.deviceId} —{" "}
                                        {device.operationObjectCount} op
                                        object(s)
                                    </ThemedText>
                                    <ThemedText size="xs" variant="tertiary">
                                        Oldest:{" "}
                                        {formatOptionalEpochMs(
                                            device.oldestCreatedAtEpochMs
                                        )}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="tertiary">
                                        Newest:{" "}
                                        {formatOptionalEpochMs(
                                            device.newestCreatedAtEpochMs
                                        )}
                                    </ThemedText>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <ThemedButton
                    disabled={!connected || isRefreshingPreview}
                    onClick={onRefreshPreview}
                    size="sm"
                    variant="secondary"
                >
                    {isRefreshingPreview ? "Refreshing…" : "Refresh preview"}
                </ThemedButton>

                <ThemedButton
                    disabled={!hasPreview}
                    onClick={handleCopyDiagnostics}
                    size="sm"
                    variant="secondary"
                >
                    Copy diagnostics
                </ThemedButton>

                <ThemedButton
                    disabled={!canReset || isResetting}
                    onClick={onResetRemoteSyncState}
                    size="sm"
                    variant="error"
                >
                    {isResetting ? "Resetting…" : "Reset remote sync"}
                </ThemedButton>
            </div>

            {copyResult ? (
                <div className="mt-2">
                    <ThemedText size="xs" variant="tertiary">
                        {copyResult.kind === "success"
                            ? "Copied diagnostics to clipboard."
                            : `Failed to copy diagnostics: ${copyResult.message}`}
                    </ThemedText>
                </div>
            ) : null}
        </div>
    );
};
