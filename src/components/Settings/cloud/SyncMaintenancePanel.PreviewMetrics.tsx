import type { JSX } from "react";

import type { PreviewStats } from "./SyncMaintenancePanel.model";

import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link SyncMaintenancePreviewMetrics}.
 */
export interface SyncMaintenancePreviewMetricsProperties {
    readonly stats: PreviewStats;
}

/**
 * Metrics grid for preview counts.
 */
export const SyncMaintenancePreviewMetrics = ({
    stats,
}: SyncMaintenancePreviewMetricsProperties): JSX.Element => (
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
