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
import { getMonitorTypeDisplayLabel } from "../../../utils/fallbacks";
import { AppIcons } from "../../../utils/icons";
import { getLatestHistoryTimestamp } from "../../../utils/monitoring/monitorHistoryTime";
import { getMonitorRuntimeSummary } from "../../../utils/monitoring/monitorRuntime";
import {
    formatFullTimestamp,
    formatIntervalDuration,
    formatRelativeTimestamp,
} from "../../../utils/time";
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

const selectSelectedSiteIdentifier = (
    state: UiStoreState
): string | undefined => state.selectedSiteIdentifier;

const formatStatus = (value: string): string => {
    if (!value) {
        return "Unknown";
    }
    const lowerCased = value.toLowerCase();
    return lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1);
};

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
    function SiteCardComponent({ presentation = "grid", site }: SiteCardProperties) {
        // Use our custom hook to get all the data and functionality we need
        const {
            averageResponseTime,
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

        const selectedSiteIdentifier = useUIStore(selectSelectedSiteIdentifier);

        const monitorRuntime = useMemo(
            () => getMonitorRuntimeSummary(latestSite.monitors),
            [latestSite.monitors]
        );

        const {
            allRunning: allMonitorsRunning,
            runningCount: runningMonitorCount,
            totalCount: totalMonitorCount,
        } = monitorRuntime;

        const isStacked = presentation === "stacked";

        const isActiveCard = selectedSiteIdentifier === latestSite.identifier;

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

        const monitorStatusLabel = monitor
            ? getMonitorTypeDisplayLabel(monitor.type)
            : "Monitor";

        const statusSection = (
            <div className="site-card__status">
                <SiteCardStatus
                    monitorLabel={monitorStatusLabel}
                    status={status}
                />
            </div>
        );

        const ActivityIcon = AppIcons.metrics.activity;
        const TimeIcon = AppIcons.metrics.time;
        const HistoryIcon = AppIcons.ui.history;

        const statusLabel = formatStatus(status);
        const uptimeDisplay = Number.isFinite(uptime)
            ? `${uptime.toFixed(1)}%`
            : "—";
        const lastResponseDisplay =
            responseTime === undefined ? "—" : `${responseTime} ms`;
        const avgResponseDisplay =
            checkCount === 0 ? "—" : `${averageResponseTime} ms`;
        const checksDisplay = checkCount.toLocaleString();
        const lastCheckTimestamp = useMemo(
            () =>
                monitor
                    ? getLatestHistoryTimestamp(monitor.history)
                    : undefined,
            [monitor]
        );
        const lastCheckLabel = lastCheckTimestamp
            ? formatRelativeTimestamp(lastCheckTimestamp)
            : "No data";
        const lastCheckTooltip = lastCheckTimestamp
            ? formatFullTimestamp(lastCheckTimestamp)
            : undefined;

        const siteMetrics = useMemo(
            () => [
                {
                    key: "status",
                    label: "Status",
                    value: statusLabel,
                },
                {
                    key: "uptime",
                    label: "Uptime",
                    tooltip: "Overall uptime calculated from monitor history",
                    value: uptimeDisplay,
                },
                {
                    key: "last-response",
                    label: "Last Response",
                    value: lastResponseDisplay,
                },
                {
                    key: "avg-response",
                    label: "Avg Response",
                    tooltip:
                        "Average response time across recent successful checks",
                    value: avgResponseDisplay,
                },
                {
                    key: "checks",
                    label: "Checks Logged",
                    value: checksDisplay,
                },
                {
                    key: "last-check",
                    label: "Last Check",
                    value: lastCheckLabel,
                    ...(lastCheckTooltip && { tooltip: lastCheckTooltip }),
                },
            ],
            [
                avgResponseDisplay,
                checksDisplay,
                lastCheckLabel,
                lastCheckTooltip,
                lastResponseDisplay,
                statusLabel,
                uptimeDisplay,
            ]
        );

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
                            {runningMonitorCount}/{totalMonitorCount}
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
                            Check Interval
                        </ThemedText>
                        <ThemedText
                            className="site-card__insight-value"
                            size="sm"
                            weight="semibold"
                        >
                            {monitor?.checkInterval
                                ? formatIntervalDuration(monitor.checkInterval)
                                : "Manual"}
                        </ThemedText>
                    </div>
                </div>

                <div className="site-card__insight">
                    <div className="site-card__insight-icon">
                        <HistoryIcon size={16} />
                    </div>
                    <div className="site-card__insight-meta">
                        <ThemedText
                            className="site-card__insight-label"
                            size="xs"
                            variant="secondary"
                        >
                            Last Check
                        </ThemedText>
                        <ThemedText
                            className="site-card__insight-value"
                            size="sm"
                            weight="semibold"
                        >
                            {lastCheckLabel}
                        </ThemedText>
                    </div>
                </div>
            </div>
        ) : null;

        const normalizedStatusLabel = statusLabel.toLowerCase();
        const metricsSummary = siteMetrics
            .map(({ label, value }) => `${label}: ${value}`)
            .join(" | ");

        const metricsSection = (
            <div
                className={metricsClassName}
                data-testid={`site-card-metrics-${latestSite.identifier}-${normalizedStatusLabel}`}
            >
                <span
                    className="sr-only"
                    data-testid={`site-card-metrics-summary-${latestSite.identifier}`}
                >
                    {metricsSummary}
                </span>
                <SiteCardMetrics metrics={siteMetrics} />
            </div>
        );

        const historySection = (
            <div className="mt-auto w-full">
                <SiteCardHistory
                    filteredHistory={filteredHistory}
                    monitor={monitor}
                />
            </div>
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
                data-site-identifier={latestSite.identifier}
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
            </ThemedBox>
        );
    }
);
