/**
 * Site details view component with comprehensive tabbed interface.
 *
 * @remarks
 * This component provides a detailed view of a single site's monitoring data,
 * statistics, and configuration options. It uses a composition pattern with
 * specialized child components for maintainability and clear separation of concerns.
 *
 * The component integrates multiple advanced features:
 * - Real-time status monitoring and visualization
 * - Historical data charts with Chart.js integration
 * - Analytics and performance metrics
 * - Configuration management for monitoring settings
 * - Responsive design with theme support
 *
 * Uses custom hooks for state management and Chart.js for data visualization
 * with zoom, pan, and time-based charting capabilities.
 *
 * @param site - Site object containing monitoring data and configuration
 *
 * @example
 * ```tsx
 * <SiteDetails
 *   site={{
 *     identifier: "site-123",
 *     name: "My Website",
 *     monitors: [],
 *     monitoring: true
 *   }}
 * />
 * ```
 *
 * @public
 */

/* eslint-disable tailwind/no-arbitrary-value -- Modal component with specific layout requirements */

import type { JSX } from "react/jsx-runtime";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Site } from "../../types";

// eslint-disable-next-line import-x/no-unassigned-import -- Chart.js initialization
import "../../services/chartSetup";
import { useSiteDetails } from "../../hooks/site/useSiteDetails";
import { ChartConfigService } from "../../services/chartConfig";
import { ThemedBox } from "../../theme/components";
import { useTheme } from "../../theme/useTheme";
import { parseUptimeValue } from "../../utils/monitoring/dataValidation";
import { formatStatusWithIcon } from "../../utils/status";
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
 * Site details component with tabbed interface for comprehensive site monitoring.
 * Provides overview, history, analytics, and settings views for a monitored site.
 *
 * Uses composition pattern with specialized tab components and custom hooks for
 * state management and data fetching.
 *
 * @param props - Component props
 * @returns JSX element containing the site details interface
 *
 * @example
 * ```tsx
 * <SiteDetails
 *   site={selectedSite}
 *   onClose={() => setSelectedSite(null)}
 * />
 * ```
 */
export const SiteDetails = ({
    onClose,
    site,
}: SiteDetailsProperties): JSX.Element | null => {
    const { currentTheme } = useTheme();
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    // Add global escape key handler
    useEffect(() => {
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            document.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [onClose]);

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
        // eslint-disable-next-line ex/no-unhandled -- site prop is guaranteed to be valid by parent component
    } = useSiteDetails({ site });

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
        [chartConfig, analytics.totalChecks]
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

    const barChartData = useMemo(
        () => ({
            datasets: [
                {
                    backgroundColor: [
                        currentTheme.colors.success,
                        currentTheme.colors.error,
                    ],
                    borderColor: [
                        currentTheme.colors.success,
                        currentTheme.colors.error,
                    ],
                    borderWidth: 1,
                    data: [analytics.upCount, analytics.downCount],
                    label: "Status Distribution",
                },
            ],
            labels: ["Up", "Down"],
        }),
        [analytics.upCount, analytics.downCount, currentTheme]
    );

    const doughnutChartData = useMemo(
        () => ({
            datasets: [
                {
                    backgroundColor: [
                        currentTheme.colors.success,
                        currentTheme.colors.error,
                    ],
                    borderColor: [
                        currentTheme.colors.success,
                        currentTheme.colors.error,
                    ],
                    borderWidth: 1,
                    data: [analytics.upCount, analytics.downCount],
                },
            ],
            labels: ["Up", "Down"],
        }),
        [analytics.upCount, analytics.downCount, currentTheme]
    );

    // Memoized event handlers to prevent unnecessary re-renders
    const handleToggleCollapse = useCallback(() => {
        setIsHeaderCollapsed(!isHeaderCollapsed);
    }, [isHeaderCollapsed]);

    const handleCheckNowClick = useCallback(() => {
        void handleCheckNow();
    }, [handleCheckNow]);

    const handleSaveIntervalClick = useCallback(() => {
        void handleSaveInterval();
    }, [handleSaveInterval]);

    // Don't render if site doesn't exist
    if (!siteExists) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm md:p-8">
            <button
                aria-label="Close modal"
                className="absolute inset-0 cursor-pointer border-none bg-transparent"
                onClick={onClose}
                type="button"
            />
            <dialog
                aria-label="Site details"
                className="relative mx-auto flex max-h-[90vh] w-full max-w-[1400px] flex-col sm:max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-4rem)] lg:max-w-[1400px]"
                open
            >
                <ThemedBox
                    className="flex h-[90vh] flex-col overflow-hidden"
                    padding="lg"
                    rounded="lg"
                    shadow="xl"
                    surface="overlay"
                >
                    <SiteDetailsHeader
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
                        isLoading={isLoading}
                        isMonitoring={isMonitoring}
                        selectedMonitorId={selectedMonitorId}
                        setActiveSiteDetailsTab={setActiveSiteDetailsTab}
                    />

                    {/* Tab Content */}
                    <ThemedBox
                        className={`custom-scrollbar flex-1 overflow-y-auto ${currentTheme.isDark ? "dark" : ""}`}
                        padding="lg"
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

                        {activeSiteDetailsTab === "monitor-overview" &&
                        selectedMonitor ? (
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
                        ) : null}

                        {activeSiteDetailsTab ===
                            `${selectedMonitorId}-analytics` &&
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
                                getAvailabilityDescription={
                                    getAvailabilityDescription
                                }
                                lineChartData={lineChartData}
                                lineChartOptions={lineChartOptions}
                                monitorType={selectedMonitor.type}
                                mttr={analytics.mttr}
                                p50={analytics.p50}
                                p95={analytics.p95}
                                p99={analytics.p99}
                                setShowAdvancedMetrics={setShowAdvancedMetrics}
                                setSiteDetailsChartTimeRange={
                                    setSiteDetailsChartTimeRange
                                }
                                showAdvancedMetrics={showAdvancedMetrics}
                                siteDetailsChartTimeRange={
                                    siteDetailsChartTimeRange
                                }
                                totalChecks={analytics.totalChecks}
                                totalDowntime={analytics.totalDowntime}
                                upCount={analytics.upCount}
                                uptime={analytics.uptime}
                                uptimeChartData={doughnutChartData}
                            />
                        ) : null}

                        {activeSiteDetailsTab === "history" &&
                        selectedMonitor ? (
                            <HistoryTab
                                formatFullTimestamp={formatFullTimestamp}
                                formatResponseTime={formatResponseTime}
                                formatStatusWithIcon={formatStatusWithIcon}
                                selectedMonitor={selectedMonitor}
                            />
                        ) : null}

                        {activeSiteDetailsTab === "settings" &&
                        selectedMonitor ? (
                            <SettingsTab
                                currentSite={currentSite}
                                handleIntervalChange={handleIntervalChange}
                                handleRemoveSite={handleRemoveSite}
                                handleRetryAttemptsChange={
                                    handleRetryAttemptsChange
                                }
                                handleSaveInterval={handleSaveIntervalClick}
                                handleSaveName={handleSaveName}
                                handleSaveRetryAttempts={
                                    handleSaveRetryAttempts
                                }
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
                        ) : null}
                    </ThemedBox>
                </ThemedBox>
            </dialog>
        </div>
    );
};

/**
 * Gets a descriptive label for availability percentage.
 *
 * @param percentage - Availability percentage (0-100)
 * @returns Description string ("Excellent", "Good", or "Poor")
 */
function getAvailabilityDescription(percentage: number): string {
    if (percentage >= 99) {
        return "Excellent";
    }
    if (percentage >= 95) {
        return "Good";
    }
    return "Poor";
}

/* eslint-enable tailwind/no-arbitrary-value */
