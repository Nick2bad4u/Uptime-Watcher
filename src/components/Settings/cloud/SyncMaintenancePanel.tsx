import type { CloudStatusSummary } from "@shared/types/cloud";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { JSX } from "react";

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { useCallback, useMemo, useState } from "react";

import type {
    MaintenanceTone,
    SyncMaintenanceCopyResult,
} from "./SyncMaintenancePanel.model";

import { AppIcons, getIconSize } from "../../../utils/icons";
import { SyncMaintenanceDangerZoneCard } from "./SyncMaintenancePanel.DangerZoneCard";
import { SyncMaintenanceDeviceIdsDetails } from "./SyncMaintenancePanel.DeviceIdsDetails";
import { SyncMaintenanceMismatchNoticeCard } from "./SyncMaintenancePanel.MismatchNoticeCard";
import { SyncMaintenanceOperationLogsDetails } from "./SyncMaintenancePanel.OperationLogsDetails";
import { SyncMaintenancePreviewSummaryCard } from "./SyncMaintenancePanel.PreviewSummaryCard";
import { SyncMaintenanceStatusCard } from "./SyncMaintenancePanel.StatusCard";
import { SyncMaintenanceToolsCard } from "./SyncMaintenancePanel.ToolsCard";
import {
    buildDiagnosticsPayload,
    buildDiagnosticsText,
    buildPreviewStats,
    buildPreviewViewModel,
    copyTextToClipboard,
    resolveSyncResetStatusText,
    resolveSyncResetSummary,
} from "./SyncMaintenancePanel.utils";

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
    const xsIconSize = getIconSize("xs");

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
        () => <InfoIcon aria-hidden size={xsIconSize} />,
        [InfoIcon, xsIconSize]
    );

    const warningIcon = useMemo(
        () => <WarningIcon aria-hidden size={xsIconSize} />,
        [WarningIcon, xsIconSize]
    );

    const [copyResult, setCopyResult] = useState<SyncMaintenanceCopyResult>(
        null
    );

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

    const previewStats = useMemo(() => buildPreviewStats(preview), [preview]);

    const buildCurrentDiagnostics = useCallback(
        (generatedAtEpochMs: number) => {
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

    const copyDiagnostics = useCallback(async (): Promise<void> => {
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
    }, [buildCurrentDiagnostics]);

    const copyDiagnosticsJson = useCallback(async (): Promise<void> => {
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
    }, [buildCurrentDiagnostics]);

    const handleCopyDiagnostics = useCallback((): void => {
        void copyDiagnostics();
    }, [copyDiagnostics]);

    const handleCopyDiagnosticsJson = useCallback((): void => {
        void copyDiagnosticsJson();
    }, [copyDiagnosticsJson]);

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
            <SyncMaintenanceStatusCard
                infoIcon={infoIcon}
                statusText={statusText}
                summary={summary}
                tone={tone}
                warningIcon={warningIcon}
            />

            <SyncMaintenancePreviewSummaryCard
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
                <SyncMaintenanceMismatchNoticeCard
                    mismatchText={previewView.mismatchText}
                    warningIcon={warningIcon}
                />
            ) : null}

            {preview && preview.deviceIds.length > 0 ? (
                <SyncMaintenanceDeviceIdsDetails
                    deviceIds={preview.deviceIds}
                    infoIcon={infoIcon}
                />
            ) : null}

            {previewView.perDevice.length > 0 ? (
                <SyncMaintenanceOperationLogsDetails
                    infoIcon={infoIcon}
                    perDevice={previewView.perDevice}
                />
            ) : null}

            <SyncMaintenanceToolsCard
                copyIcon={copyIcon}
                copyJsonIcon={copyJsonIcon}
                copyResult={copyResult}
                disabled={false}
                onCopy={handleCopyDiagnostics}
                onCopyJson={handleCopyDiagnosticsJson}
                previewText={diagnosticsPreview}
            />

            <SyncMaintenanceDangerZoneCard
                canReset={canReset}
                isResetting={isResetting}
                onReset={onResetRemoteSyncState}
                resetIcon={resetIcon}
            />
        </div>
    );
};
