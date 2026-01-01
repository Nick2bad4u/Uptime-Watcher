import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { JSX } from "react";

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { useCallback, useMemo, useState } from "react";

import { SystemService } from "../../../services/SystemService";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { formatFullTimestamp } from "../../../utils/time";

/* eslint-disable react/no-multi-comp -- Sync Maintenance UI is clearer with co-located presentational components. */

type MaintenanceTone = "info" | "warning";

interface PreviewStats {
    readonly changes: number;
    readonly devices: number;
    readonly other: number;
    readonly snapshots: number;
    readonly total: number;
}

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

const MaintenanceStatusCard = (props: {
    readonly infoIcon: JSX.Element;
    readonly statusText: string;
    readonly summary: null | string;
    readonly tone: MaintenanceTone;
    readonly warningIcon: JSX.Element;
}): JSX.Element => {
    const { infoIcon, statusText, summary, tone, warningIcon } = props;

    const statusIcon = tone === "warning" ? warningIcon : infoIcon;
    const statusAccentClass =
        tone === "warning"
            ? "settings-accent--warning"
            : "settings-accent--primary";
    const statusCardClass =
        tone === "warning"
            ? "settings-subcard settings-subcard--warning"
            : "settings-subcard settings-subcard--info";

    return (
        <div className={statusCardClass}>
            <div className="settings-subcard__header">
                <div className="settings-subcard__title">
                    <span aria-hidden className={statusAccentClass}>
                        {statusIcon}
                    </span>
                    <ThemedText
                        as="div"
                        size="xs"
                        variant="secondary"
                        weight="medium"
                    >
                        About this action
                    </ThemedText>
                </div>
            </div>

            <ThemedText as="p" className="mt-2" size="sm" variant="tertiary">
                {statusText}
            </ThemedText>

            {summary ? (
                <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
                    {summary}
                </ThemedText>
            ) : null}
        </div>
    );
};

const PreviewMetrics = (props: {
    readonly stats: PreviewStats;
}): JSX.Element => {
    const { stats } = props;

    return (
        <div className="settings-metrics mt-3">
            <div className="settings-metric">
                <ThemedText as="div" size="xs" variant="tertiary">
                    Sync history files
                </ThemedText>
                <ThemedText
                    as="div"
                    className="settings-metric__value"
                    size="sm"
                    variant="secondary"
                >
                    {stats.total}
                </ThemedText>
            </div>

            <div className="settings-metric">
                <ThemedText as="div" size="xs" variant="tertiary">
                    Devices
                </ThemedText>
                <ThemedText
                    as="div"
                    className="settings-metric__value"
                    size="sm"
                    variant="secondary"
                >
                    {stats.devices}
                </ThemedText>
            </div>

            <div className="settings-metric settings-metric--wide">
                <ThemedText as="div" size="xs" variant="tertiary">
                    Objects breakdown
                </ThemedText>

                <div className="settings-metric__breakdown">
                    <div className="settings-metric__breakdown-item">
                        <ThemedText as="div" size="xs" variant="tertiary">
                            Snapshots
                        </ThemedText>
                        <ThemedText
                            as="div"
                            className="settings-metric__value"
                            size="sm"
                            variant="secondary"
                        >
                            {stats.snapshots}
                        </ThemedText>
                    </div>

                    <div className="settings-metric__breakdown-item">
                        <ThemedText as="div" size="xs" variant="tertiary">
                            Changes
                        </ThemedText>
                        <ThemedText
                            as="div"
                            className="settings-metric__value"
                            size="sm"
                            variant="secondary"
                        >
                            {stats.changes}
                        </ThemedText>
                    </div>

                    <div className="settings-metric__breakdown-item">
                        <ThemedText as="div" size="xs" variant="tertiary">
                            Other
                        </ThemedText>
                        <ThemedText
                            as="div"
                            className="settings-metric__value"
                            size="sm"
                            variant="secondary"
                        >
                            {stats.other}
                        </ThemedText>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PreviewSummaryCard = (props: {
    readonly connected: boolean;
    readonly infoIcon: JSX.Element;
    readonly isRefreshingPreview: boolean;
    readonly onRefreshPreview: () => void;
    readonly preview: CloudSyncResetPreview | null;
    readonly previewStats: null | PreviewStats;
    readonly previewView: PreviewViewModel;
    readonly refreshIcon: JSX.Element;
}): JSX.Element => {
    const {
        connected,
        infoIcon,
        isRefreshingPreview,
        onRefreshPreview,
        preview,
        previewStats,
        previewView,
        refreshIcon,
    } = props;

    return (
        <div className="settings-subcard settings-subcard--info">
            <div className="settings-subcard__header">
                <div className="settings-subcard__title">
                    <span aria-hidden className="settings-accent--primary">
                        {infoIcon}
                    </span>
                    <ThemedText
                        as="div"
                        size="xs"
                        variant="secondary"
                        weight="medium"
                    >
                        Preview summary
                    </ThemedText>
                </div>

                <div className="settings-subcard__actions">
                    <ThemedButton
                        disabled={!connected || isRefreshingPreview}
                        icon={refreshIcon}
                        loading={isRefreshingPreview}
                        onClick={onRefreshPreview}
                        size="sm"
                        variant="secondary"
                    >
                        Refresh preview
                    </ThemedButton>
                </div>
            </div>

            {previewStats ? (
                <PreviewMetrics stats={previewStats} />
            ) : (
                <ThemedText as="p" className="mt-3" size="xs" variant="tertiary">
                    {previewView.previewText}
                </ThemedText>
            )}

            {preview?.operationObjectCount === 0 ? (
                <ThemedText as="p" className="mt-3" size="xs" variant="tertiary">
                    No change history has been uploaded yet. This is normal on
                    the first device until you make changes with Sync enabled.
                </ThemedText>
            ) : null}

            {previewView.otherObjectsText ? (
                <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
                    {previewView.otherObjectsText}
                </ThemedText>
            ) : null}
        </div>
    );
};

const MismatchNoticeCard = (props: {
    readonly mismatchText: string;
    readonly warningIcon: JSX.Element;
}): JSX.Element => {
    const { mismatchText, warningIcon } = props;

    return (
        <div className="settings-subcard settings-subcard--warning">
            <div className="settings-subcard__header">
                <div className="settings-subcard__title">
                    <span aria-hidden className="settings-accent--warning">
                        {warningIcon}
                    </span>
                    <ThemedText
                        as="div"
                        size="xs"
                        variant="secondary"
                        weight="medium"
                    >
                        Device mismatch detected
                    </ThemedText>
                </div>
            </div>

            <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
                {mismatchText}
            </ThemedText>
        </div>
    );
};

const DeviceIdsDetails = (props: {
    readonly deviceIds: readonly string[];
    readonly infoIcon: JSX.Element;
}): JSX.Element => {
    const { deviceIds, infoIcon } = props;

    return (
        <details className="settings-details">
            <summary className="settings-details__summary">
                <span className="settings-details__summary-inner">
                    <span aria-hidden className="settings-accent--primary">
                        {infoIcon}
                    </span>
                    <ThemedText
                        as="span"
                        size="xs"
                        variant="secondary"
                        weight="medium"
                    >
                        View device IDs
                    </ThemedText>
                </span>
            </summary>

            <pre className="settings-mono-block">{deviceIds.join("\n")}</pre>
        </details>
    );
};

const OperationLogsDetails = (props: {
    readonly infoIcon: JSX.Element;
    readonly perDevice: CloudSyncResetPreview["perDevice"];
}): JSX.Element => {
    const { infoIcon, perDevice } = props;

    return (
        <details className="settings-details">
            <summary className="settings-details__summary">
                <span className="settings-details__summary-inner">
                    <span aria-hidden className="settings-accent--success">
                        {infoIcon}
                    </span>
                    <ThemedText
                        as="span"
                        size="xs"
                        variant="secondary"
                        weight="medium"
                    >
                        Operation logs by device
                    </ThemedText>
                </span>
            </summary>

            <div className="settings-paragraph-stack mt-3">
                {perDevice.map((device) => (
                    <div
                        className="settings-subcard settings-subcard--compact"
                        key={device.deviceId}
                    >
                        <ThemedText as="div" size="xs" variant="secondary">
                            {device.deviceId} — {device.operationObjectCount} op
                            object(s)
                        </ThemedText>
                        <div className="settings-paragraph-stack mt-2">
                            <ThemedText as="p" size="xs" variant="tertiary">
                                Oldest:{" "}
                                {formatOptionalEpochMs(
                                    device.oldestCreatedAtEpochMs
                                )}
                            </ThemedText>
                            <ThemedText as="p" size="xs" variant="tertiary">
                                Newest:{" "}
                                {formatOptionalEpochMs(
                                    device.newestCreatedAtEpochMs
                                )}
                            </ThemedText>
                        </div>
                    </div>
                ))}
            </div>
        </details>
    );
};

const ToolsCard = (props: {
    readonly copyIcon: JSX.Element;
    readonly copyResult:
        | null
        | {
              kind: "error";
              message: string;
          }
        | {
              kind: "success";
          };
    readonly disabled: boolean;
    readonly onCopy: () => void;
}): JSX.Element => {
    const { copyIcon, copyResult, disabled, onCopy } = props;

    return (
        <div className="settings-subcard settings-subcard--compact settings-maintenance__tools">
            <div className="settings-subcard__header">
                <ThemedText
                    as="div"
                    size="xs"
                    variant="secondary"
                    weight="medium"
                >
                    Tools
                </ThemedText>

                <div className="settings-subcard__actions">
                    <ThemedButton
                        disabled={disabled}
                        icon={copyIcon}
                        onClick={onCopy}
                        size="sm"
                        variant="secondary"
                    >
                        Copy diagnostics
                    </ThemedButton>
                </div>
            </div>

            {copyResult ? (
                <div className="mt-2">
                    <ThemedText as="p" size="xs" variant="tertiary">
                        {copyResult.kind === "success"
                            ? "Copied diagnostics to clipboard."
                            : `Failed to copy diagnostics: ${copyResult.message}`}
                    </ThemedText>
                </div>
            ) : null}
        </div>
    );
};

const DangerZoneCard = (props: {
    readonly canReset: boolean;
    readonly isResetting: boolean;
    readonly onReset: () => void;
    readonly resetIcon: JSX.Element;
}): JSX.Element => {
    const { canReset, isResetting, onReset, resetIcon } = props;

    return (
        <div className="settings-subcard settings-subcard--danger mt-3">
            <div className="settings-subcard__header">
                <ThemedText
                    as="div"
                    size="xs"
                    variant="secondary"
                    weight="medium"
                >
                    Danger zone
                </ThemedText>

                <div className="settings-subcard__actions">
                    <ThemedButton
                        disabled={!canReset || isResetting}
                        icon={resetIcon}
                        loading={isResetting}
                        onClick={onReset}
                        size="sm"
                        variant="error"
                    >
                        Reset remote sync
                    </ThemedButton>
                </div>
            </div>

            <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
                Resetting remote sync deletes remote history and re-seeds from
                this device. Other devices may need to resync.
            </ThemedText>
        </div>
    );
};

async function copyTextToClipboard(text: string): Promise<void> {
    await SystemService.writeClipboardText(text);
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

    const buttonIconSize = getIconSize("sm");
    const CopyIcon = AppIcons.actions.copy;
    const InfoIcon = AppIcons.ui.info;
    const RefreshIcon = AppIcons.actions.refresh;
    const ResetIcon = AppIcons.actions.refreshAlt;
    const WarningIcon = AppIcons.status.warning;

    const refreshIcon = useMemo(
        () => <RefreshIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, RefreshIcon]
    );
    const copyIcon = useMemo(
        () => <CopyIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, CopyIcon]
    );
    const resetIcon = useMemo(
        () => <ResetIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, ResetIcon]
    );

    const infoIcon = useMemo(
        () => <InfoIcon aria-hidden size={getIconSize("xs")} />,
        [InfoIcon]
    );

    const warningIcon = useMemo(
        () => <WarningIcon aria-hidden size={getIconSize("xs")} />,
        [WarningIcon]
    );

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

    const previewStats = useMemo(() => {
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
    }, [preview]);

    const copyDiagnostics = useCallback(
        async function copyDiagnostics(): Promise<void> {
            const computedPreview = buildPreviewViewModel(preview);
            const payload = {
                computed: {
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
            } catch (error: unknown) {
                setCopyResult({
                    kind: "error",
                    message: getUserFacingErrorDetail(error),
                });
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

    const tone: MaintenanceTone = connected && syncEnabled ? "warning" : "info";

    return (
        <div className="settings-maintenance-modal">
            <MaintenanceStatusCard
                infoIcon={infoIcon}
                statusText={statusText}
                summary={summary}
                tone={tone}
                warningIcon={warningIcon}
            />

            <PreviewSummaryCard
                connected={connected}
                infoIcon={infoIcon}
                isRefreshingPreview={isRefreshingPreview}
                onRefreshPreview={onRefreshPreview}
                preview={preview}
                previewStats={previewStats}
                previewView={previewView}
                refreshIcon={refreshIcon}
            />

            {previewView.mismatchText ? (
                <MismatchNoticeCard
                    mismatchText={previewView.mismatchText}
                    warningIcon={warningIcon}
                />
            ) : null}

            {preview && preview.deviceIds.length > 0 ? (
                <DeviceIdsDetails deviceIds={preview.deviceIds} infoIcon={infoIcon} />
            ) : null}

            {previewView.perDevice.length > 0 ? (
                <OperationLogsDetails infoIcon={infoIcon} perDevice={previewView.perDevice} />
            ) : null}

            <ToolsCard
                copyIcon={copyIcon}
                copyResult={copyResult}
                disabled={!hasPreview}
                onCopy={handleCopyDiagnostics}
            />

            <DangerZoneCard
                canReset={canReset}
                isResetting={isResetting}
                onReset={onResetRemoteSyncState}
                resetIcon={resetIcon}
            />
        </div>
    );
};

/* eslint-enable react/no-multi-comp -- Restore default rule after co-located Sync Maintenance view components. */
