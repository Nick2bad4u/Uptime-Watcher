/**
 * SiteCard component displaying comprehensive monitoring information for a single site.
 * Composed of multiple sub-components for maintainability and reusability.
 */

import React from "react";

import { useSite } from "../../../hooks/site";
import { ThemedBox } from "../../../theme/components";
import { Site } from "../../../types";
import { SiteCardFooter } from "./SiteCardFooter";
import { SiteCardHeader } from "./SiteCardHeader";
import { SiteCardHistory } from "./SiteCardHistory";
import { SiteCardMetrics } from "./SiteCardMetrics";
import { SiteCardStatus } from "./SiteCardStatus";

/** Props for the SiteCard component */
interface SiteCardProps {
    /** Site data to display */
    site: Site;
}

/**
 * Main site card component using composition of smaller, focused sub-components.
 * Provides a complete overview of site monitoring status, metrics, and controls.
 *
 * Features:
 * - Real-time status indicators
 * - Historical uptime data visualization
 * - Monitor management controls
 * - Performance metrics display
 * - Click-to-expand details
 *
 * Much cleaner and more maintainable than a monolithic component approach.
 * Memoized to prevent unnecessary re-renders when parent updates.
 *
 * @param props - SiteCard component props
 * @returns JSX element containing the complete site monitoring card
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
            as="button"
            variant="secondary"
            padding="md"
            rounded="md"
            shadow="sm"
            className="flex flex-col w-full gap-2 cursor-pointer site-card text-left"
            onClick={handleCardClick}
            aria-label={`View details for ${latestSite.name ?? latestSite.identifier}`}
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
