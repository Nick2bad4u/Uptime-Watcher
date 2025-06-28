import React from "react";

import { useSite } from "../../../hooks/site";
import { ThemedBox } from "../../../theme/components";
import { Site } from "../../../types";
import { SiteCardFooter } from "./SiteCardFooter";
import { SiteCardHeader } from "./SiteCardHeader";
import { SiteCardHistory } from "./SiteCardHistory";
import { SiteCardMetrics } from "./SiteCardMetrics";
import { SiteCardStatus } from "./SiteCardStatus";

interface SiteCardProps {
    site: Site;
}

/**
 * Refactored SiteCard component using composition of smaller components
 * Much cleaner and more maintainable than the original monolithic component
 * Memoized to prevent unnecessary re-renders when parent updates
 */
export const SiteCard = React.memo(function SiteCard({ site }: SiteCardProps) {
    // Use our custom hook to get all the data and functionality we need
    const {
        checkCount,
        filteredHistory,
        handleCardClick,
        handleCheckNow,
        handleMonitorIdChange,
        // Action handlers
        handleStartMonitoring,
        handleStopMonitoring,
        // UI state
        isLoading,
        isMonitoring,
        // Site monitor data
        latestSite,
        monitor,
        responseTime,
        selectedMonitorId,
        status,
        // Site statistics
        uptime,
    } = useSite(site);

    return (
        <ThemedBox
            variant="secondary"
            padding="md"
            rounded="md"
            shadow="sm"
            className="flex flex-col gap-2 cursor-pointer site-card w-full"
            onClick={handleCardClick}
        >
            <SiteCardHeader
                site={latestSite}
                selectedMonitorId={selectedMonitorId}
                onMonitorIdChange={handleMonitorIdChange}
                onCheckNow={handleCheckNow}
                onStartMonitoring={handleStartMonitoring}
                onStopMonitoring={handleStopMonitoring}
                isLoading={isLoading}
                isMonitoring={isMonitoring}
                hasMonitor={!!monitor}
            />

            <SiteCardStatus selectedMonitorId={selectedMonitorId} status={status} />

            <SiteCardMetrics status={status} uptime={uptime} responseTime={responseTime} checkCount={checkCount} />

            <SiteCardHistory monitor={monitor} filteredHistory={filteredHistory} />

            <SiteCardFooter />
        </ThemedBox>
    );
});
