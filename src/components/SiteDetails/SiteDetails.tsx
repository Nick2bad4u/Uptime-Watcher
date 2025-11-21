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

import {
    type EscapeKeyModalConfig,
    useEscapeKeyModalHandler,
} from "@shared/utils/modalHandlers";
import { useCallback, useMemo, useState } from "react";

import { useSiteDetails } from "../../hooks/site/useSiteDetails";
import { ChartConfigService } from "../../services/chartConfig";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { useAvailabilityColors, useTheme } from "../../theme/useTheme";
import { parseUptimeValue } from "../../utils/monitoring/dataValidation";
import {
    formatDuration,
    formatFullTimestamp,
    formatResponseTime,
} from "../../utils/time";
import { waitForAnimation } from "../../utils/time/waitForAnimation";
import { SurfaceContainer } from "../shared/SurfaceContainer";
import { SiteDetailsHeader } from "./SiteDetailsHeader";
import { SiteDetailsNavigation } from "./SiteDetailsNavigation";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { SiteOverviewTab } from "./tabs/SiteOverviewTab";

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
 * @param props - Component props.
 *
 * @returns JSX element containing the site details interface.
 *
 * @public
 */
export const SiteDetails = ({
    onClose,
    site,
}: SiteDetailsProperties): JSX.Element | null => {
    const { currentTheme, isDark } = useTheme();
    const { getAvailabilityDescription } = useAvailabilityColors();
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback((): void => {
        setIsClosing(true);
        void (async (): Promise<void> => {
            await waitForAnimation();
            onClose();
        })();
    }, [onClose]);

    // Add global escape key handler
    const modalConfigs = useMemo<EscapeKeyModalConfig[]>(
        (): EscapeKeyModalConfig[] => [
            {
                isOpen: true, // SiteDetails is always considered "open" when rendered
                onClose: handleClose,
                priority: 1,
            },
        ],
        [handleClose]
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
                handleClose();
            }
        },
        [handleClose]
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
                handleClose();
            }
        },
        [handleClose]
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
            } ${isClosing ? "modal-overlay--closing" : ""}`}
            onClick={handleOverlayClick}
            onKeyDown={handleOverlayKeyDown}
            role="button"
            tabIndex={0}
        >
            <ThemedBox
                aria-label="Site details"
                as="dialog"
                className={`modal-shell modal-shell--site-details modal-shell--accent-success site-details-modal ${
                    isClosing ? "modal-shell--closing" : ""
                }`}
                data-testid="site-details-modal"
                open
                padding="xl"
                rounded="xl"
                shadow="xl"
                surface="overlay"
            >
                <div className="site-details-modal__body">
                    <div
                        className={`site-details-modal__content-wrapper custom-scrollbar ${isDark ? "dark" : ""}`}
                        style={scrollContainerStyle}
                    >
                        <SiteDetailsHeader
                            onClose={handleClose}
                            site={currentSite}
                            {...(selectedMonitor ? { selectedMonitor } : {})}
                        />

                        <SiteDetailsNavigation
                            activeSiteDetailsTab={activeSiteDetailsTab}
                            currentSite={currentSite}
                            handleMonitorIdChange={handleMonitorIdChange}
                            handleStartMonitoring={handleStartMonitoring}
                            handleStartSiteMonitoring={
                                handleStartSiteMonitoring
                            }
                            handleStopMonitoring={handleStopMonitoring}
                            handleStopSiteMonitoring={handleStopSiteMonitoring}
                            isLoading={isLoading}
                            isMonitoring={isMonitoring}
                            selectedMonitorId={selectedMonitorId}
                            setActiveSiteDetailsTab={setActiveSiteDetailsTab}
                        />

                        <SurfaceContainer
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
                        </SurfaceContainer>
                    </div>
                </div>
            </ThemedBox>
        </div>
    );
};
