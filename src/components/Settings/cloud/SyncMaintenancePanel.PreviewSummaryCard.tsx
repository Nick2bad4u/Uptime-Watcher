import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { JSX } from "react";

import { useCallback } from "react";

import type {
    PreviewStats,
    PreviewViewModel,
} from "./SyncMaintenancePanel.model";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { SyncMaintenancePreviewMetrics } from "./SyncMaintenancePanel.PreviewMetrics";

/**
 * Props for {@link SyncMaintenancePreviewSummaryCard}.
 */
export interface SyncMaintenancePreviewSummaryCardProperties {
    readonly connected: boolean;
    readonly infoIcon: JSX.Element;
    readonly isRefreshingPreview: boolean;
    readonly onRefreshPreview: () => void;
    readonly preview: CloudSyncResetPreview | null;
    readonly previewStats: null | PreviewStats;
    readonly previewView: PreviewViewModel;
    readonly refreshIcon: JSX.Element;
}

/**
 * Summary card for the remote preview.
 */
export const SyncMaintenancePreviewSummaryCard = ({
    connected,
    infoIcon,
    isRefreshingPreview,
    onRefreshPreview,
    preview,
    previewStats,
    previewView,
    refreshIcon,
}: SyncMaintenancePreviewSummaryCardProperties): JSX.Element => {
    const handleRefreshPreviewClick = useCallback((): void => {
        onRefreshPreview();
    }, [onRefreshPreview]);

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
                        onClick={handleRefreshPreviewClick}
                        size="sm"
                        variant="secondary"
                    >
                        Refresh preview
                    </ThemedButton>
                </div>
            </div>

            {previewStats ? (
                <SyncMaintenancePreviewMetrics stats={previewStats} />
            ) : (
                <ThemedText
                    as="p"
                    className="mt-3"
                    size="xs"
                    variant="tertiary"
                >
                    {previewView.previewText}
                </ThemedText>
            )}

            {preview?.operationObjectCount === 0 ? (
                <ThemedText
                    as="p"
                    className="mt-3"
                    size="xs"
                    variant="tertiary"
                >
                    No change history has been uploaded yet. This is normal on
                    the first device until you make changes with Sync enabled.
                </ThemedText>
            ) : null}

            {previewView.otherObjectsText ? (
                <ThemedText
                    as="p"
                    className="mt-2"
                    size="xs"
                    variant="tertiary"
                >
                    {previewView.otherObjectsText}
                </ThemedText>
            ) : null}
        </div>
    );
};
