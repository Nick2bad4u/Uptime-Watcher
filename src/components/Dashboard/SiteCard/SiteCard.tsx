/**
 * SiteCard component displaying comprehensive monitoring information for a
 * single site.
 *
 * @remarks
 * Composed of multiple sub-components for maintainability and reusability. This
 * component provides a complete overview of site monitoring status, metrics,
 * and controls in a card-based layout. Uses composition pattern to break down
 * complex UI into manageable, focused sub-components.
 *
 * @example
 *
 * ```tsx
 * <SiteCard site={siteData} />;
 * ```
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import { memo, type NamedExoticComponent, useMemo } from "react";

import { useSite } from "../../../hooks/site/useSite";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { SiteCardFooter } from "./SiteCardFooter";
import { SiteCardHeader } from "./SiteCardHeader";
import { SiteCardHistory } from "./SiteCardHistory";
import { SiteCardMetrics } from "./SiteCardMetrics";
import { SiteCardStatus } from "./SiteCardStatus";

/**
 * Props for the SiteCard component
 *
 * @public
 */
export interface SiteCardProperties {
    /** Site data to display */
    readonly site: Site;
}

/**
 * Main site card component using composition of smaller, focused
 * sub-components.
 *
 * @remarks
 * Provides a complete overview of site monitoring status, metrics, and
 * controls. Uses the composition pattern to break down complex UI into
 * manageable pieces. Memoized to prevent unnecessary re-renders when parent
 * updates.
 *
 * Features:
 *
 * - Real-time status indicators
 * - Historical uptime data visualization
 * - Monitor management controls
 * - Performance metrics display
 * - Click-to-expand details
 *
 * @param props - SiteCard component props
 *
 * @returns JSX element containing the complete site monitoring card
 */

/**
 * SiteCard component implementation using composition pattern.
 *
 * @param props - SiteCard component props
 *
 * @returns JSX.Element containing the complete site monitoring card
 */
export const SiteCard: NamedExoticComponent<SiteCardProperties> = memo(
    function SiteCard({ site }: SiteCardProperties) {
        // Use our custom hook to get all the data and functionality we need
        const {
            checkCount,
            filteredHistory,
            handleCardClick,
            handleCheckNow,
            handleMonitorIdChange,
            // Action handlers
            handleStartMonitoring,
            handleStartSiteMonitoring,
            handleStopMonitoring,
            handleStopSiteMonitoring,
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

        // Calculate if all monitors are running for the site monitoring button
        const allMonitorsRunning =
            latestSite.monitors.length > 0 &&
            latestSite.monitors.every((mon) => mon.monitoring);

        // Memoize the complete props object to prevent unnecessary re-renders
        const siteCardHeaderProps = useMemo(
            () => ({
                display: {
                    isLoading,
                },
                interactions: {
                    onCheckNow: handleCheckNow,
                    onMonitorIdChange: handleMonitorIdChange,
                    onStartMonitoring: handleStartMonitoring,
                    onStartSiteMonitoring: handleStartSiteMonitoring,
                    onStopMonitoring: handleStopMonitoring,
                    onStopSiteMonitoring: handleStopSiteMonitoring,
                },
                monitoring: {
                    allMonitorsRunning,
                    hasMonitor: Boolean(monitor),
                    isMonitoring,
                    selectedMonitorId,
                },
                site: {
                    site: latestSite,
                },
            }),
            [
                allMonitorsRunning,
                handleCheckNow,
                handleMonitorIdChange,
                handleStartMonitoring,
                handleStartSiteMonitoring,
                handleStopMonitoring,
                handleStopSiteMonitoring,
                isLoading,
                isMonitoring,
                latestSite,
                monitor,
                selectedMonitorId,
            ]
        );

        return (
            <ThemedBox
                aria-label={`View details for ${latestSite.name}`}
                className="group site-card site-card--modern flex w-full cursor-pointer flex-col gap-4 text-left"
                data-testid="site-card"
                onClick={handleCardClick}
                padding="md"
                rounded="md"
                shadow="sm"
                variant="secondary"
            >
                <div className="site-card__header">
                    <SiteCardHeader {...siteCardHeaderProps} />
                </div>

                <div className="site-card__status">
                    <SiteCardStatus
                        selectedMonitorId={selectedMonitorId}
                        status={status}
                    />
                </div>

                <div className="site-card__metrics">
                    <SiteCardMetrics
                        status={status}
                        uptime={uptime}
                        {...(responseTime !== undefined && { responseTime })}
                        checkCount={checkCount}
                    />
                </div>

                <SiteCardHistory
                    filteredHistory={filteredHistory}
                    monitor={monitor}
                />

                {/* SiteCardFooter requires no props as it displays static interactive hint text */}
                <SiteCardFooter />
            </ThemedBox>
        );
    }
);
