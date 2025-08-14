/**
 * Site card history visualization component.
 * Displays monitor history data using a chart component.
 */

import type { Monitor, StatusHistory } from "@shared/types";

import React, { useMemo } from "react";

import { useMonitorTypes } from "../../../hooks/useMonitorTypes";
import { formatTitleSuffix } from "../../../utils/monitorTitleFormatters";
import { HistoryChart } from "../../common/HistoryChart";

/** Maximum number of history items to display in the chart */
const MAX_HISTORY_ITEMS = 60;

/**
 * Props for the SiteCardHistory component.
 *
 * @public
 */
export interface SiteCardHistoryProperties {
    /** Filtered history data for visualization */
    readonly filteredHistory: StatusHistory[];
    /** Monitor data containing type and configuration */
    readonly monitor: Monitor | undefined;
}

/**
 * Compare SiteCardHistory props to determine if re-render is needed.
 * Broken into smaller functions to reduce complexity.
 */

function areHistoryPropsEqual(
    previous: SiteCardHistoryProperties,
    next: SiteCardHistoryProperties
): boolean {
    // Compare history arrays
    if (previous.filteredHistory.length !== next.filteredHistory.length) {
        return false;
    }
    const prevTimestamp = previous.filteredHistory[0]?.timestamp;
    const nextTimestamp = next.filteredHistory[0]?.timestamp;
    if (prevTimestamp !== nextTimestamp) {
        return false;
    }

    // Compare monitor objects
    const prevMonitor = previous.monitor;
    const nextMonitor = next.monitor;
    if (prevMonitor === undefined && nextMonitor === undefined) {
        return true;
    }
    if (prevMonitor === undefined || nextMonitor === undefined) {
        return false;
    }
    if (
        prevMonitor.id !== nextMonitor.id ||
        prevMonitor.type !== nextMonitor.type
    ) {
        return false;
    }
    return !(
        prevMonitor.url !== nextMonitor.url ||
        prevMonitor.port !== nextMonitor.port ||
        prevMonitor.host !== nextMonitor.host
    );
}

/**
 * History visualization component for site cards displaying monitor status
 * over time.
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
export const SiteCardHistory: React.NamedExoticComponent<SiteCardHistoryProperties> =
    React.memo(
        function SiteCardHistory({
            filteredHistory,
            monitor,
        }: SiteCardHistoryProperties) {
            // Get monitor type configurations
            const { options } = useMonitorTypes();

            // Memoize the history title calculation with optimized dependencies
            const historyTitle = useMemo(() => {
                if (!monitor) {
                    return "No Monitor Selected";
                }

                // Get display name from monitor type options
                const monitorTypeOption = options.find(
                    (option) => option.value === monitor.type
                );
                const displayName = monitorTypeOption?.label ?? monitor.type;

                // Get type-specific suffix using dynamic formatter
                const suffix = formatTitleSuffix(monitor);

                return `${displayName} History${suffix}`;
            }, [monitor, options]);

            return (
                <HistoryChart
                    history={filteredHistory}
                    maxItems={MAX_HISTORY_ITEMS}
                    title={historyTitle}
                />
            );
        },
        (previousProperties, nextProperties) =>
            areHistoryPropsEqual(previousProperties, nextProperties)
    );
