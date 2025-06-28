/**
 * Site card history visualization component.
 * Displays monitor history data using a chart component.
 */

import React, { useMemo } from "react";

import { Monitor, StatusHistory } from "../../../types";
import { HistoryChart } from "../../common/HistoryChart";

/**
 * Props for the SiteCardHistory component.
 */
interface SiteCardHistoryProps {
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
    function SiteCardHistory({ filteredHistory, monitor }: SiteCardHistoryProps) {
        // Memoize the history title calculation
        const historyTitle = useMemo(() => {
            if (!monitor) {
                return "No Monitor Selected";
            }

            switch (monitor.type) {
                case "http":
                    return `HTTP History${monitor.url ? ` (${monitor.url})` : ""}`;
                case "port":
                    return `Port History${
                        monitor.port ? ` (${monitor.host}:${monitor.port})` : monitor.host ? ` (${monitor.host})` : ""
                    }`;
                default:
                    return `${monitor.type} History`;
            }
        }, [monitor]);

        return <HistoryChart history={filteredHistory} title={historyTitle} maxItems={60} />;
    },
    (prevProps, nextProps) => {
        // Custom comparison function to ensure proper re-renders
        // Compare by history array length and last timestamp to detect changes
        const prevHistory = prevProps.filteredHistory;
        const nextHistory = nextProps.filteredHistory;

        if (prevHistory.length !== nextHistory.length) {
            return false; // Re-render if history length changed
        }

        // Fix: History is sorted DESC (newest first), so latest is at index 0, not length-1
        const prevLastTimestamp = prevHistory[0]?.timestamp;
        const nextLastTimestamp = nextHistory[0]?.timestamp;

        if (prevLastTimestamp !== nextLastTimestamp) {
            return false; // Re-render if last timestamp changed
        }

        // Compare monitor ID to handle monitor switching
        if (prevProps.monitor?.id !== nextProps.monitor?.id) {
            return false; // Re-render if monitor changed
        }

        return true; // Skip re-render if nothing important changed
    }
);
