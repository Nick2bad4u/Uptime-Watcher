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
export const SiteCardHistory = React.memo(function SiteCardHistory({ filteredHistory, monitor }: SiteCardHistoryProps) {
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

    return <HistoryChart history={filteredHistory} title={historyTitle} maxItems={20} />;
});
