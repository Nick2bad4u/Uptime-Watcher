/**
 * Site card history visualization component.
 * Displays monitor history data using a chart component.
 */

import React, { useMemo } from "react";

import { Monitor, StatusHistory } from "../../../types";
import { HistoryChart } from "../../common/HistoryChart";
import { useMonitorTypes } from "../../../hooks/useMonitorTypes";
import { formatTitleSuffix } from "../../../utils/monitorTitleFormatters";

/**
 * Props for the SiteCardHistory component.
 */
interface SiteCardHistoryProperties {
    /** Monitor data containing type and configuration */
    monitor: Monitor | undefined;
    /** Filtered history data for visualization */
    filteredHistory: StatusHistory[];
}

/**
 * History visualization component for site cards displaying monitor status over time.
 *
 * Features:
 * - Dynamic title generation based on monitor type and configuration
 * - Optimized with React.memo and custom comparison for performance
 * - Automatic updates when monitor history changes in store
 * - Supports up to 60 history items for visualization
 * - Handles HTTP and port monitor types with specific title formatting
 *
 * Data flow: Store → useSiteMonitor → useSite → SiteCard → SiteCardHistory
 *
 * @param props - Component props
 * @returns JSX element containing the history chart
 *
 * @example
 * ```tsx
 * <SiteCardHistory
 *   monitor={selectedMonitor}
 *   filteredHistory={recentHistory}
 * />
 * ```
 */
export const SiteCardHistory = React.memo(
    function SiteCardHistory({ filteredHistory, monitor }: SiteCardHistoryProperties) {
        // Get monitor type configurations
        const { options } = useMonitorTypes();

        // Memoize the history title calculation
        const historyTitle = useMemo(() => {
            if (!monitor) {
                return "No Monitor Selected";
            }

            // Get display name from monitor type options
            const monitorTypeOption = options.find((option) => option.value === monitor.type);
            const displayName = monitorTypeOption?.label ?? monitor.type;

            // Get type-specific suffix using dynamic formatter
            const suffix = formatTitleSuffix(monitor);

            return `${displayName} History${suffix}`;
        }, [monitor, options]);

        return <HistoryChart history={filteredHistory} title={historyTitle} maxItems={60} />;
    },
    (previousProperties, nextProperties) => {
        // Custom comparison function to ensure proper re-renders
        // Compare by history array length and last timestamp to detect changes
        const previousHistory = previousProperties.filteredHistory;
        const nextHistory = nextProperties.filteredHistory;

        // Fix: History is sorted DESC (newest first), so latest is at index 0, not length-1
        const previousLastTimestamp = previousHistory[0]?.timestamp;
        const nextLastTimestamp = nextHistory[0]?.timestamp;

        // Return true if nothing important changed (skip re-render)
        return (
            previousHistory.length === nextHistory.length &&
            previousLastTimestamp === nextLastTimestamp &&
            previousProperties.monitor?.id === nextProperties.monitor?.id
        );
    }
);
