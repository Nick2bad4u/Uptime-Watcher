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

import type { SiteCardPresentation } from "../../../stores/ui/types";

import { useSite } from "../../../hooks/site/useSite";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons } from "../../../utils/icons";
import { SiteCardFooter } from "./SiteCardFooter";
import { SiteCardHeader } from "./SiteCardHeader";
import { SiteCardHistory } from "./SiteCardHistory";
import { SiteCardMetrics } from "./SiteCardMetrics";
import { SiteCardMonitorList } from "./SiteCardMonitorList";
import { SiteCardStatus } from "./SiteCardStatus";

/**
 * Props for the SiteCard component
 *
 * @public
 */
export interface SiteCardProperties {
    /** Presentation variant for large card layout. */
    readonly presentation?: SiteCardPresentation;
    /** Site data to display */
    readonly site: Site;
}

type UiStoreState = ReturnType<typeof useUIStore.getState>;

const selectSelectedSiteId = (state: UiStoreState): string | undefined =>
    state.selectedSiteId;

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
    function SiteCard({ presentation = "grid", site }: SiteCardProperties) {
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

        const selectedSiteId = useUIStore(selectSelectedSiteId);

        const runningMonitorCount = useMemo(
            () => latestSite.monitors.filter((mon) => mon.monitoring).length,
            [latestSite.monitors]
        );

        // Calculate if all monitors are running for the site monitoring button
        const allMonitorsRunning =
            latestSite.monitors.length > 0 &&
            latestSite.monitors.every((mon) => mon.monitoring);

        const isStacked = presentation === "stacked";

        const isActiveCard = selectedSiteId === latestSite.identifier;

        const cardClassName = useMemo(() => {
            const classes = [
                "group",
                "site-card",
                "site-card--modern",
                "w-full",
                "cursor-pointer",
                "text-left",
                "flex",
                "flex-col",
                isStacked ? "site-card--stacked" : "gap-4",
                isActiveCard ? "site-card--active" : "",
            ];
            return classes.filter(Boolean).join(" ");
        }, [isActiveCard, isStacked]);

        const metricsClassName = isStacked
            ? "site-card__metrics site-card__metrics--expanded"
            : "site-card__metrics";

        const cardPadding = isStacked ? "lg" : "md";

        const statusSection = (
            <div className="site-card__status">
                <SiteCardStatus
                    selectedMonitorId={selectedMonitorId}
                    status={status}
                />
            </div>
        );

        const ResponseIcon = AppIcons.metrics.response;
        const ActivityIcon = AppIcons.metrics.activity;
        const TimeIcon = AppIcons.metrics.time;

        const stackedInsights = isStacked ? (
            <div className="site-card__insights">
                <div className="site-card__insight">
                    <div className="site-card__insight-icon">
                        <ActivityIcon size={16} />
                    </div>
                    <div className="site-card__insight-meta">
                        <ThemedText
                            className="site-card__insight-label"
                            size="xs"
                            variant="secondary"
                        >
                            Running Monitors
                        </ThemedText>
                        <ThemedText
                            className="site-card__insight-value"
                            size="sm"
                            weight="semibold"
                        >
                            {runningMonitorCount}/{latestSite.monitors.length}
                        </ThemedText>
                    </div>
                </div>

                <div className="site-card__insight">
                    <div className="site-card__insight-icon">
                        <TimeIcon size={16} />
                    </div>
                    <div className="site-card__insight-meta">
                        <ThemedText
                            className="site-card__insight-label"
                            size="xs"
                            variant="secondary"
                        >
                            Checks Logged
                        </ThemedText>
                        <ThemedText
                            className="site-card__insight-value"
                            size="sm"
                            weight="semibold"
                        >
                            {checkCount}
                        </ThemedText>
                    </div>
                </div>

                <div className="site-card__insight">
                    <div className="site-card__insight-icon">
                        <ResponseIcon size={16} />
                    </div>
                    <div className="site-card__insight-meta">
                        <ThemedText
                            className="site-card__insight-label"
                            size="xs"
                            variant="secondary"
                        >
                            Last Response
                        </ThemedText>
                        <ThemedText
                            className="site-card__insight-value"
                            size="sm"
                            weight="semibold"
                        >
                            {responseTime === undefined
                                ? "No data"
                                : `${responseTime} ms`}
                        </ThemedText>
                    </div>
                </div>
            </div>
        ) : null;

        const metricsSection = (
            <div className={metricsClassName}>
                <SiteCardMetrics
                    checkCount={checkCount}
                    status={status}
                    {...(responseTime !== undefined && { responseTime })}
                    uptime={uptime}
                />
            </div>
        );

        const historySection = (
            <SiteCardHistory
                filteredHistory={filteredHistory}
                monitor={monitor}
            />
        );

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
                className={cardClassName}
                data-site-id={latestSite.identifier}
                data-state={isActiveCard ? "active" : "idle"}
                data-testid="site-card"
                onClick={handleCardClick}
                padding={cardPadding}
                rounded="md"
                shadow="sm"
                variant="secondary"
            >
                <div className="site-card__header">
                    <SiteCardHeader {...siteCardHeaderProps} />
                </div>
                {isStacked ? (
                    <div className="site-card__stacked-grid">
                        <div className="site-card__stacked-column site-card__stacked-column--overview">
                            {statusSection}
                            {metricsSection}
                            {stackedInsights}
                        </div>
                        <div className="site-card__stacked-column site-card__stacked-column--monitors">
                            <SiteCardMonitorList
                                monitors={latestSite.monitors}
                                selectedMonitorId={selectedMonitorId}
                            />
                        </div>
                        <div className="site-card__stacked-column site-card__stacked-column--history">
                            {historySection}
                        </div>
                    </div>
                ) : (
                    <>
                        {statusSection}
                        {metricsSection}
                        {historySection}
                    </>
                )}

                <SiteCardFooter />
            </ThemedBox>
        );
    }
);
