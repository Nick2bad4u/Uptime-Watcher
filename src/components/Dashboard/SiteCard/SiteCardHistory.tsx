import React, { useMemo } from "react";

import { Monitor, StatusHistory } from "../../../types";
import { HistoryChart } from "../../common/HistoryChart";

interface SiteCardHistoryProps {
    monitor: Monitor | undefined;
    filteredHistory: StatusHistory[];
}

/**
 * History visualization section of the site card
 * Memoized to prevent unnecessary re-renders and calculations
 *
 * Data flow: Store -\> useSiteMonitor -\> useSite -\> SiteCard -\> SiteCardHistory
 * Updates automatically when monitor.history changes in the store
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
