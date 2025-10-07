/**
 * Site details view component with comprehensive tabbed interface.
 *
 * @remarks
 * This component provides a detailed view of a single site's monitoring data,
 * statistics, and configuration options. It uses a composition pattern with
 * specialized child components for maintainability and clear separation of
 * concerns.
 *
 * The component integrates multiple advanced features:
 *
 * - Real-time status monitoring and visualization
 * - Historical data charts with Chart.js integration
 * - Analytics and performance metrics
 * - Configuration management for monitoring settings
 * - Responsive design with theme support
 *
 * Uses custom hooks for state management and Chart.js for data visualization
 * with zoom, pan, and time-based charting capabilities.
 *
 * @example
 *
 * ```tsx
 * <SiteDetails
 *     site={{
 *         identifier: "site-123",
 *         name: "My Website",
 *         monitors: [],
 *         monitoring: true,
 *     }}
 * />;
 * ```
 *
 * @param site - Site object containing monitoring data and configuration
 *
 * @public
 */

import type { Site } from "@shared/types";
import type { MouseEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { JSX } from "react/jsx-runtime";

import { useEscapeKeyModalHandler } from "@shared/utils/modalHandlers";
import { useCallback, useMemo, useRef, useState } from "react";

import { useSiteDetails } from "../../hooks/site/useSiteDetails";
import { useMount } from "../../hooks/useMount";
import { ChartConfigService } from "../../services/chartConfig";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { useAvailabilityColors, useTheme } from "../../theme/useTheme";
import { parseUptimeValue } from "../../utils/monitoring/dataValidation";
import "./SiteDetails.css";
import {
    formatDuration,
    formatFullTimestamp,
    formatResponseTime,
} from "../../utils/time";
import { SiteDetailsHeader } from "./SiteDetailsHeader";
import { SiteDetailsNavigation } from "./SiteDetailsNavigation";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { SiteOverviewTab } from "./tabs/SiteOverviewTab";

const HEADER_COLLAPSE_SCROLL_THRESHOLD = 96;
const HEADER_EXPAND_SCROLL_THRESHOLD = 32;

/**
 * Props for the SiteDetails component
 *
 * @public
 */
export interface SiteDetailsProperties {
    /** Callback function to close the site details view */
    readonly onClose: () => void;
    /** The site object to display details for */
    readonly site: Site;
}

/**
 * Site details component with tabbed interface for comprehensive site
 * monitoring. Provides overview, history, analytics, and settings views for a
 * monitored site.
 *
 * Uses composition pattern with specialized tab components and custom hooks for
 * state management and data fetching.
 *
 * @example
 *
 * ```tsx
 * <SiteDetails
 *     site={selectedSite}
 *     onClose={() => setSelectedSite(null)}
 * />;
 * ```
 *
 * @param props - Component props
 *
 * @returns JSX element containing the site details interface
 */
export const SiteDetails = ({
    onClose,
    site,
}: SiteDetailsProperties): JSX.Element | null => {
    const { currentTheme, isDark } = useTheme();
    const { getAvailabilityDescription } = useAvailabilityColors();
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const contentElementRef = useRef<HTMLDivElement | null>(null);
    const collapseSentinelRef = useRef<HTMLDivElement | null>(null);
    const collapseObserverRef = useRef<IntersectionObserver | null>(null);
    const expandObserverRef = useRef<IntersectionObserver | null>(null);
    const manualCollapseRef = useRef(false);
    const scrollFallbackHandlerRef = useRef<EventListener | null>(null);
    const scrollFallbackContainerRef = useRef<HTMLElement | null>(null);

    // Add global escape key handler
    const modalConfigs = useMemo(
        () => [
            {
                isOpen: true, // SiteDetails is always considered "open" when rendered
                onClose,
                priority: 1,
            },
        ],
        [onClose]
    );

    useEscapeKeyModalHandler(modalConfigs);

    // Memoize scroll container style to avoid inline object creation
    const scrollContainerStyle = useMemo(
        () => ({
            display: "flex",
            flex: 1,
            flexDirection: "column" as const,
            minHeight: 0,
        }),
        []
    );

    // Drive header collapse via a sentinel instead of raw scrollTop to avoid
    // oscillation when the header's height animates.
    useMount(
        useCallback(function setupScrollObservers(): void {
            const contentElement = contentElementRef.current;
            const sentinelElement = collapseSentinelRef.current;

            if (!contentElement || !sentinelElement) {
                return;
            }

            const collapseObserver = new IntersectionObserver(
                (entries) => {
                    const [entry] = entries;

                    if (!entry || entry.isIntersecting) {
                        return;
                    }

                    setIsHeaderCollapsed((previous) => {
                        if (previous) {
                            return previous;
                        }

                        manualCollapseRef.current = false;
                        return true;
                    });
                },
                {
                    root: contentElement,
                    rootMargin: `-${HEADER_COLLAPSE_SCROLL_THRESHOLD}px 0px 0px 0px`,
                    threshold: 0,
                }
            );

            const expandObserver = new IntersectionObserver(
                (entries) => {
                    const [entry] = entries;

                    if (
                        !entry ||
                        manualCollapseRef.current ||
                        !entry.isIntersecting
                    ) {
                        return;
                    }

                    setIsHeaderCollapsed((previous) => {
                        if (!previous) {
                            return previous;
                        }

                        manualCollapseRef.current = false;
                        return false;
                    });
                },
                {
                    root: contentElement,
                    rootMargin: `-${HEADER_EXPAND_SCROLL_THRESHOLD}px 0px 0px 0px`,
                    threshold: 0,
                }
            );

            collapseObserver.observe(sentinelElement);
            expandObserver.observe(sentinelElement);

            collapseObserverRef.current = collapseObserver;
            expandObserverRef.current = expandObserver;
            scrollFallbackContainerRef.current = contentElement;

            const handleScroll: EventListener = (_event) => {
                const { scrollTop } = contentElement;
                const shouldCollapse =
                    scrollTop > HEADER_COLLAPSE_SCROLL_THRESHOLD;

                if (shouldCollapse) {
                    setIsHeaderCollapsed((previous) => {
                        if (previous) {
                            return previous;
                        }

                        manualCollapseRef.current = false;
                        return true;
                    });
                    return;
                }

                if (manualCollapseRef.current) {
                    return;
                }

                setIsHeaderCollapsed((previous) => {
                    if (!previous) {
                        return previous;
                    }

                    manualCollapseRef.current = false;
                    return false;
                });
            };

            scrollFallbackHandlerRef.current = handleScroll;
            contentElement.addEventListener("scroll", handleScroll, {
                passive: true,
            });

            handleScroll(new Event("scroll"));
        }, []),
        useCallback(function cleanupScrollObservers(): void {
            collapseObserverRef.current?.disconnect();
            expandObserverRef.current?.disconnect();
            collapseObserverRef.current = null;
            expandObserverRef.current = null;

            const handler = scrollFallbackHandlerRef.current;
            const container = scrollFallbackContainerRef.current;

            if (handler && container) {
                container.removeEventListener("scroll", handler);
            }

            if (handler) {
                contentElementRef.current?.removeEventListener(
                    "scroll",
                    handler
                );
            }

            scrollFallbackHandlerRef.current = null;
            scrollFallbackContainerRef.current = null;
        }, [])
    );

    // Use our custom hook to get all the data and functionality we need
    const {
        // UI state
        activeSiteDetailsTab,
        // Analytics
        analytics,
        // Site data
        currentSite,
        // Handlers
        handleCheckNow,
        handleIntervalChange,
        handleMonitorIdChange,
        handleRemoveMonitor,
        handleRemoveSite,
        handleRetryAttemptsChange,
        handleSaveInterval,
        handleSaveName,
        handleSaveRetryAttempts,
        handleSaveTimeout,
        handleStartMonitoring,
        handleStartSiteMonitoring,
        handleStopMonitoring,
        handleStopSiteMonitoring,
        handleTimeoutChange,
        // Name state
        hasUnsavedChanges,
        // Interval state
        intervalChanged,
        isLoading,
        isMonitoring,
        localCheckInterval,
        localName,
        localRetryAttempts,
        localTimeout,
        retryAttemptsChanged,
        selectedMonitor,
        selectedMonitorId,
        // Store actions
        setActiveSiteDetailsTab,
        setLocalName,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
        siteExists,
        timeoutChanged,
        // eslint-disable-next-line ex/no-unhandled -- Site prop is guaranteed to be valid by parent component's site selection logic and type validation
    } = useSiteDetails(useMemo(() => ({ site }), [site]));

    // Create chart config service instance
    const chartConfig = useMemo(
        () => new ChartConfigService(currentTheme),
        [currentTheme]
    );

    // Chart configurations using the service
    const lineChartOptions = useMemo(
        () => chartConfig.getLineChartConfig(),
        [chartConfig]
    );
    const barChartOptions = useMemo(
        () => chartConfig.getBarChartConfig(),
        [chartConfig]
    );
    const doughnutOptions = useMemo(
        () => chartConfig.getDoughnutChartConfig(analytics.totalChecks),
        [analytics.totalChecks, chartConfig]
    );

    // Chart data using analytics
    const lineChartData = useMemo(
        () => ({
            datasets: [
                {
                    backgroundColor: `${currentTheme.colors.primary[500]}20`,
                    borderColor: currentTheme.colors.primary[500],
                    data: analytics.filteredHistory.map((h) => h.responseTime),
                    fill: true,
                    label: "Response Time (ms)",
                    tension: 0.1,
                },
            ],
            labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
        }),
        [analytics.filteredHistory, currentTheme]
    );

    const barChartData = useMemo(() => {
        // Build dynamic chart data based on which statuses exist
        const chartLabels: string[] = [];
        const chartData: number[] = [];
        const chartBackgroundColors: string[] = [];
        const chartBorderColors: string[] = [];

        // Always include "Up" status
        chartLabels.push("Up");
        chartData.push(analytics.upCount);
        chartBackgroundColors.push(currentTheme.colors.success);
        chartBorderColors.push(currentTheme.colors.success);

        // Include "Degraded" status if it exists
        if (analytics.degradedCount > 0) {
            chartLabels.push("Degraded");
            chartData.push(analytics.degradedCount);
            chartBackgroundColors.push(currentTheme.colors.warning);
            chartBorderColors.push(currentTheme.colors.warning);
        }

        // Always include "Down" status
        chartLabels.push("Down");
        chartData.push(analytics.downCount);
        chartBackgroundColors.push(currentTheme.colors.error);
        chartBorderColors.push(currentTheme.colors.error);

        return {
            datasets: [
                {
                    backgroundColor: chartBackgroundColors,
                    borderColor: chartBorderColors,
                    borderWidth: 1,
                    data: chartData,
                    label: "Status Distribution",
                },
            ],
            labels: chartLabels,
        };
    }, [
        analytics.degradedCount,
        analytics.downCount,
        analytics.upCount,
        currentTheme,
    ]);

    const doughnutChartData = useMemo(() => {
        // Build dynamic chart data based on which statuses exist
        const chartLabels: string[] = [];
        const chartData: number[] = [];
        const chartBackgroundColors: string[] = [];
        const chartBorderColors: string[] = [];

        // Always include "Up" status
        chartLabels.push("Up");
        chartData.push(analytics.upCount);
        chartBackgroundColors.push(currentTheme.colors.success);
        chartBorderColors.push(currentTheme.colors.success);

        // Include "Degraded" status if it exists
        if (analytics.degradedCount > 0) {
            chartLabels.push("Degraded");
            chartData.push(analytics.degradedCount);
            chartBackgroundColors.push(currentTheme.colors.warning);
            chartBorderColors.push(currentTheme.colors.warning);
        }

        // Always include "Down" status
        chartLabels.push("Down");
        chartData.push(analytics.downCount);
        chartBackgroundColors.push(currentTheme.colors.error);
        chartBorderColors.push(currentTheme.colors.error);

        return {
            datasets: [
                {
                    backgroundColor: chartBackgroundColors,
                    borderColor: chartBorderColors,
                    borderWidth: 1,
                    data: chartData,
                },
            ],
            labels: chartLabels,
        };
    }, [
        analytics.degradedCount,
        analytics.downCount,
        analytics.upCount,
        currentTheme,
    ]);

    // Memoized event handlers to prevent unnecessary re-renders
    const handleToggleCollapse = useCallback(() => {
        setIsHeaderCollapsed((previous) => {
            const next = !previous;
            manualCollapseRef.current = next;
            return next;
        });
    }, []);

    const handleCheckNowClick = useCallback(() => {
        void handleCheckNow();
    }, [handleCheckNow]);

    const handleSaveIntervalClick = useCallback(() => {
        void handleSaveInterval();
    }, [handleSaveInterval]);

    /**
     * Handles overlay click interactions to support closing the dialog when the
     * user clicks outside the modal surface.
     */
    const handleOverlayClick = useCallback(
        (event: MouseEvent<HTMLDivElement>): void => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    const handleOverlayKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLDivElement>): void => {
            if (event.target !== event.currentTarget) {
                return;
            }

            const shouldClose =
                event.key === "Escape" ||
                event.key === "Enter" ||
                event.key === " ";

            if (shouldClose) {
                event.preventDefault();
                onClose();
            }
        },
        [onClose]
    );

    // Extract tab JSX to avoid IIFE pattern and complex conditional rendering
    const monitorOverviewTab =
        activeSiteDetailsTab === "monitor-overview" && selectedMonitor ? (
            <OverviewTab
                avgResponseTime={analytics.avgResponseTime}
                fastestResponse={analytics.fastestResponse}
                formatResponseTime={formatResponseTime}
                handleIntervalChange={handleIntervalChange}
                handleRemoveMonitor={handleRemoveMonitor}
                handleSaveInterval={handleSaveInterval}
                handleSaveTimeout={handleSaveTimeout}
                handleTimeoutChange={handleTimeoutChange}
                intervalChanged={intervalChanged}
                isLoading={isLoading}
                localCheckInterval={localCheckInterval}
                localTimeout={localTimeout}
                onCheckNow={handleCheckNowClick}
                selectedMonitor={selectedMonitor}
                slowestResponse={analytics.slowestResponse}
                timeoutChanged={timeoutChanged}
                totalChecks={analytics.totalChecks}
                uptime={analytics.uptime}
            />
        ) : null;

    const analyticsTab =
        activeSiteDetailsTab === `${selectedMonitorId}-analytics` &&
        selectedMonitor ? (
            <AnalyticsTab
                avgResponseTime={analytics.avgResponseTime}
                barChartData={barChartData}
                barChartOptions={barChartOptions}
                doughnutOptions={doughnutOptions}
                downCount={analytics.downCount}
                downtimePeriods={analytics.downtimePeriods}
                formatDuration={formatDuration}
                formatResponseTime={formatResponseTime}
                getAvailabilityDescription={getAvailabilityDescription}
                lineChartData={lineChartData}
                lineChartOptions={lineChartOptions}
                monitorType={selectedMonitor.type}
                mttr={analytics.mttr}
                p50={analytics.p50}
                p95={analytics.p95}
                p99={analytics.p99}
                setShowAdvancedMetrics={setShowAdvancedMetrics}
                setSiteDetailsChartTimeRange={setSiteDetailsChartTimeRange}
                showAdvancedMetrics={showAdvancedMetrics}
                siteDetailsChartTimeRange={siteDetailsChartTimeRange}
                totalChecks={analytics.totalChecks}
                totalDowntime={analytics.totalDowntime}
                upCount={analytics.upCount}
                uptime={analytics.uptime}
                uptimeChartData={doughnutChartData}
            />
        ) : null;

    const historyTab =
        activeSiteDetailsTab === "history" && selectedMonitor ? (
            <HistoryTab
                formatFullTimestamp={formatFullTimestamp}
                formatResponseTime={formatResponseTime}
                selectedMonitor={selectedMonitor}
            />
        ) : null;

    const settingsTab =
        activeSiteDetailsTab === "settings" && selectedMonitor ? (
            <SettingsTab
                currentSite={currentSite}
                handleIntervalChange={handleIntervalChange}
                handleRemoveSite={handleRemoveSite}
                handleRetryAttemptsChange={handleRetryAttemptsChange}
                handleSaveInterval={handleSaveIntervalClick}
                handleSaveName={handleSaveName}
                handleSaveRetryAttempts={handleSaveRetryAttempts}
                handleSaveTimeout={handleSaveTimeout}
                handleTimeoutChange={handleTimeoutChange}
                hasUnsavedChanges={hasUnsavedChanges}
                intervalChanged={intervalChanged}
                isLoading={isLoading}
                localCheckInterval={localCheckInterval}
                localName={localName}
                localRetryAttempts={localRetryAttempts}
                localTimeout={localTimeout}
                retryAttemptsChanged={retryAttemptsChanged}
                selectedMonitor={selectedMonitor}
                setLocalName={setLocalName}
                timeoutChanged={timeoutChanged}
            />
        ) : null;

    // Don't render if site doesn't exist
    if (!siteExists) {
        return null;
    }

    return (
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- Modal backdrop uses button role to provide keyboard-equivalent dismissal without invalid nested button markup
        <div
            aria-label="Close site details"
            className={`modal-overlay modal-overlay--immersive site-details-modal-overlay ${
                isDark ? "dark" : ""
            }`}
            onClick={handleOverlayClick}
            onKeyDown={handleOverlayKeyDown}
            role="button"
            tabIndex={0}
        >
            <ThemedBox
                aria-label="Site details"
                as="dialog"
                className="modal-shell modal-shell--site-details modal-shell--accent-success site-details-modal"
                open
                padding="xl"
                rounded="xl"
                shadow="xl"
                surface="overlay"
            >
                <div className="site-details-modal__body">
                    <SiteDetailsHeader
                        onClose={onClose}
                        site={currentSite}
                        {...(selectedMonitor ? { selectedMonitor } : {})}
                        isCollapsed={isHeaderCollapsed}
                        onToggleCollapse={handleToggleCollapse}
                    />

                    <SiteDetailsNavigation
                        activeSiteDetailsTab={activeSiteDetailsTab}
                        currentSite={currentSite}
                        handleMonitorIdChange={handleMonitorIdChange}
                        handleStartMonitoring={handleStartMonitoring}
                        handleStartSiteMonitoring={handleStartSiteMonitoring}
                        handleStopMonitoring={handleStopMonitoring}
                        handleStopSiteMonitoring={handleStopSiteMonitoring}
                        isHeaderCollapsed={isHeaderCollapsed}
                        isLoading={isLoading}
                        isMonitoring={isMonitoring}
                        selectedMonitorId={selectedMonitorId}
                        setActiveSiteDetailsTab={setActiveSiteDetailsTab}
                    />

                    <div
                        className={`site-details-modal__content-wrapper custom-scrollbar ${isDark ? "dark" : ""}`}
                        ref={contentElementRef}
                        style={scrollContainerStyle}
                    >
                        <div
                            aria-hidden="true"
                            className="site-details-modal__sentinel"
                            ref={collapseSentinelRef}
                        />
                        <ThemedBox
                            className={`site-details-modal__content flex flex-col gap-6${isDark ? "dark" : ""}`}
                            padding="xl"
                            rounded="lg"
                            surface="elevated"
                            variant="primary"
                        >
                            {activeSiteDetailsTab === "site-overview" && (
                                <SiteOverviewTab
                                    avgResponseTime={analytics.avgResponseTime}
                                    handleRemoveSite={handleRemoveSite}
                                    handleStartSiteMonitoring={
                                        handleStartSiteMonitoring
                                    }
                                    handleStopSiteMonitoring={
                                        handleStopSiteMonitoring
                                    }
                                    isLoading={isLoading}
                                    site={currentSite}
                                    totalChecks={analytics.totalChecks}
                                    uptime={parseUptimeValue(analytics.uptime)}
                                />
                            )}

                            {monitorOverviewTab}

                            {analyticsTab}

                            {historyTab}

                            {settingsTab}
                        </ThemedBox>
                    </div>
                </div>
            </ThemedBox>
        </div>
    );
};
