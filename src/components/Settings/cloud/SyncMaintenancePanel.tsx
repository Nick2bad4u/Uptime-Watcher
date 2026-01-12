import type { CloudStatusSummary } from "@shared/types/cloud";
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
    readonly copyJsonIcon: JSX.Element;
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
    readonly onCopyJson: () => void;
    readonly previewText: null | string;
}): JSX.Element => {
    const {
        copyIcon,
        copyJsonIcon,
        copyResult,
        disabled,
        onCopy,
        onCopyJson,
        previewText,
    } = props;

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

                    <ThemedButton
                        disabled={disabled}
                        icon={copyJsonIcon}
                        onClick={onCopyJson}
                        size="sm"
                        variant="secondary"
                    >
                        Copy JSON
                    </ThemedButton>
                </div>
            </div>

            <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
                Includes provider status and remote sync preview. Does not
                include passphrases, encryption keys, or OAuth tokens.
            </ThemedText>

            {previewText ? (
                <details className="settings-details mt-3">
                    <summary className="settings-details__summary">
                        <span className="settings-details__summary-inner">
                            <ThemedText
                                as="span"
                                size="xs"
                                variant="secondary"
                                weight="medium"
                            >
                                Preview copied text
                            </ThemedText>
                        </span>
                    </summary>

                    <pre className="settings-mono-block">{previewText}</pre>
                </details>
            ) : null}

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

interface DiagnosticsPayload {
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

function buildDiagnosticsPayload(args: {
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
            ...(args.status?.lastError ? { lastError: args.status.lastError } : {}),
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

function buildDiagnosticsText(args: {
    readonly payload: DiagnosticsPayload;
}): { readonly json: string; readonly text: string; } {
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

    /** Optional cloud status summary for richer diagnostics context. */
    readonly status: CloudStatusSummary | null;
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
    status,
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
    const copyJsonIcon = useMemo(
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

    const buildCurrentDiagnostics = useCallback(
        (generatedAtEpochMs: number): { json: string; text: string; } => {
            const payload = buildDiagnosticsPayload({
                canReset,
                encryptionLocked,
                encryptionMode,
                generatedAtEpochMs,
                lastResult,
                preview,
                status,
                statusText,
                summary,
                syncEnabled,
            });

            return buildDiagnosticsText({ payload });
        },
        [
            canReset,
            encryptionLocked,
            encryptionMode,
            lastResult,
            preview,
            status,
            statusText,
            summary,
            syncEnabled,
        ]
    );

    const copyDiagnostics = useCallback(
        async function copyDiagnostics(): Promise<void> {
            const { text } = buildCurrentDiagnostics(Date.now());

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
        [buildCurrentDiagnostics]
    );

    const copyDiagnosticsJson = useCallback(
        async function copyDiagnosticsJson(): Promise<void> {
            const { json } = buildCurrentDiagnostics(Date.now());

            setCopyResult(null);

            try {
                await copyTextToClipboard(json);
                setCopyResult({ kind: "success" });
            } catch (error: unknown) {
                setCopyResult({
                    kind: "error",
                    message: getUserFacingErrorDetail(error),
                });
            }
        },
        [buildCurrentDiagnostics]
    );

    const handleCopyDiagnostics = useCallback(
        function handleCopyDiagnostics(): void {
            void copyDiagnostics();
        },
        [copyDiagnostics]
    );

    const handleCopyDiagnosticsJson = useCallback(
        function handleCopyDiagnosticsJson(): void {
            void copyDiagnosticsJson();
        },
        [copyDiagnosticsJson]
    );

    const previewGeneratedAtEpochMs = useMemo(() => {
        if (preview) {
            return preview.fetchedAt;
        }

        if (lastResult) {
            return lastResult.completedAt;
        }

        return 0;
    }, [lastResult, preview]);

    const diagnosticsPreview = useMemo(
        () => buildCurrentDiagnostics(previewGeneratedAtEpochMs).text,
        [buildCurrentDiagnostics, previewGeneratedAtEpochMs]
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
                copyJsonIcon={copyJsonIcon}
                copyResult={copyResult}
                disabled={false}
                onCopy={handleCopyDiagnostics}
                onCopyJson={handleCopyDiagnosticsJson}
                previewText={diagnosticsPreview}
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
