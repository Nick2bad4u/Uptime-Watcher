/**
 * Site details view component with tabbed interface
 *
 * Use our custom hook to get all the data and functionality we needed including:
 * - Overview with basic statistics
 * - History charts and response time data
 * - Analytics with advanced metrics
 * - Settings for monitoring configuration
 *
 * Uses composition pattern with smaller specialized components for maintainability.
 * Integrates with Chart.js for visualization and custom hooks for state management.
 */

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
    DoughnutController,
    ArcElement,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useMemo, useState } from "react";
import "chartjs-adapter-date-fns";

import { useSiteDetails } from "../../hooks/site/useSiteDetails";
import { ChartConfigService } from "../../services/chartConfig";
import { ThemedBox, useTheme } from "../../theme";
import { Site } from "../../types";
import { formatStatusWithIcon } from "../../utils/status";
import { formatResponseTime, formatFullTimestamp, formatDuration } from "../../utils/time";
import "./SiteDetails.css";
import { SiteDetailsHeader } from "./SiteDetailsHeader";
import { SiteDetailsNavigation } from "./SiteDetailsNavigation";
import { AnalyticsTab, HistoryTab, OverviewTab, SettingsTab, SiteOverviewTab } from "./tabs";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
    DoughnutController,
    ArcElement,
    zoomPlugin
);

/** Props for the SiteDetails component */
interface SiteDetailsProperties {
    /** The site object to display details for */
    readonly site: Site;
    /** Callback function to close the site details view */
    readonly onClose: () => void;
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
export function SiteDetails({ onClose, site }: SiteDetailsProperties) {
    const { currentTheme } = useTheme();
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    /**
     * Get availability description based on percentage
     * @param percentage - Availability percentage
     * @returns Human-readable description
     */
    const getAvailabilityDescription = (percentage: number): string => {
        if (percentage >= 99) {
            return "Excellent";
        }
        if (percentage >= 95) {
            return "Good";
        }
        return "Poor";
    };

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
    } = useSiteDetails({ site });

    // Create chart config service instance
    const chartConfig = useMemo(() => new ChartConfigService(currentTheme), [currentTheme]);

    // Chart configurations using the service
    const lineChartOptions = useMemo(() => chartConfig.getLineChartConfig(), [chartConfig]);
    const barChartOptions = useMemo(() => chartConfig.getBarChartConfig(), [chartConfig]);
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
                    backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                    data: [analytics.upCount, analytics.downCount],
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
                    backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                    data: [analytics.upCount, analytics.downCount],
                },
            ],
            labels: ["Up", "Down"],
        }),
        [analytics.upCount, analytics.downCount, currentTheme]
    );

    /**
     * Handle keyboard events for modal accessibility
     * @param event - Keyboard event
     */
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            onClose();
        }
    };

    // Don't render if site doesn't exist
    if (!siteExists) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm">
            <button
                type="button"
                className="absolute inset-0 bg-transparent border-none cursor-pointer"
                onClick={onClose}
                onKeyDown={handleKeyDown}
                aria-label="Close modal"
            />
            <dialog
                open
                className="relative w-full max-w-[1400px] max-h-[90vh] mx-auto flex flex-col sm:max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-4rem)] lg:max-w-[1400px]"
                aria-label="Site details"
            >
                <ThemedBox
                    surface="overlay"
                    padding="lg"
                    rounded="lg"
                    shadow="xl"
                    className="flex flex-col h-[90vh] overflow-hidden"
                >
                    <SiteDetailsHeader
                        site={currentSite}
                        {...(selectedMonitor ? { selectedMonitor } : {})}
                        isCollapsed={isHeaderCollapsed}
                        onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
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
                        variant="primary"
                        padding="lg"
                        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
                    >
                        {activeSiteDetailsTab === "site-overview" && (
                            <SiteOverviewTab
                                site={currentSite}
                                uptime={Number.parseFloat(analytics.uptime)}
                                avgResponseTime={analytics.avgResponseTime}
                                totalChecks={analytics.totalChecks}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                                handleStartSiteMonitoring={handleStartSiteMonitoring}
                                handleStopSiteMonitoring={handleStopSiteMonitoring}
                            />
                        )}

                        {activeSiteDetailsTab === "monitor-overview" && selectedMonitor && (
                            <OverviewTab
                                selectedMonitor={selectedMonitor}
                                uptime={analytics.uptime}
                                avgResponseTime={analytics.avgResponseTime}
                                totalChecks={analytics.totalChecks}
                                fastestResponse={analytics.fastestResponse}
                                slowestResponse={analytics.slowestResponse}
                                formatResponseTime={formatResponseTime}
                                handleRemoveMonitor={handleRemoveMonitor}
                                handleIntervalChange={handleIntervalChange}
                                handleSaveInterval={handleSaveInterval}
                                handleSaveTimeout={handleSaveTimeout}
                                handleTimeoutChange={handleTimeoutChange}
                                intervalChanged={intervalChanged}
                                localCheckInterval={localCheckInterval}
                                localTimeout={localTimeout}
                                onCheckNow={() => {
                                    void handleCheckNow();
                                }}
                                timeoutChanged={timeoutChanged}
                                isLoading={isLoading}
                            />
                        )}

                        {activeSiteDetailsTab === `${selectedMonitorId}-analytics` && selectedMonitor && (
                            <AnalyticsTab
                                upCount={analytics.upCount}
                                downCount={analytics.downCount}
                                totalChecks={analytics.totalChecks}
                                uptime={analytics.uptime}
                                avgResponseTime={analytics.avgResponseTime}
                                p50={analytics.p50}
                                p95={analytics.p95}
                                p99={analytics.p99}
                                mttr={analytics.mttr}
                                totalDowntime={analytics.totalDowntime}
                                downtimePeriods={analytics.downtimePeriods}
                                lineChartData={lineChartData}
                                lineChartOptions={lineChartOptions}
                                barChartData={barChartData}
                                barChartOptions={barChartOptions}
                                uptimeChartData={doughnutChartData}
                                doughnutOptions={doughnutOptions}
                                formatResponseTime={formatResponseTime}
                                formatDuration={formatDuration}
                                showAdvancedMetrics={showAdvancedMetrics}
                                setShowAdvancedMetrics={setShowAdvancedMetrics}
                                setSiteDetailsChartTimeRange={setSiteDetailsChartTimeRange}
                                siteDetailsChartTimeRange={siteDetailsChartTimeRange}
                                getAvailabilityDescription={getAvailabilityDescription}
                                monitorType={selectedMonitor.type}
                            />
                        )}

                        {activeSiteDetailsTab === "history" && selectedMonitor && (
                            <HistoryTab
                                selectedMonitor={selectedMonitor}
                                formatResponseTime={formatResponseTime}
                                formatFullTimestamp={formatFullTimestamp}
                                formatStatusWithIcon={formatStatusWithIcon}
                            />
                        )}

                        {activeSiteDetailsTab === "settings" && selectedMonitor && (
                            <SettingsTab
                                currentSite={currentSite}
                                selectedMonitor={selectedMonitor}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                                localCheckInterval={localCheckInterval}
                                intervalChanged={intervalChanged}
                                handleIntervalChange={handleIntervalChange}
                                handleSaveInterval={() => {
                                    void handleSaveInterval();
                                }}
                                handleRetryAttemptsChange={handleRetryAttemptsChange}
                                handleSaveRetryAttempts={handleSaveRetryAttempts}
                                handleSaveTimeout={handleSaveTimeout}
                                handleTimeoutChange={handleTimeoutChange}
                                localName={localName}
                                localRetryAttempts={localRetryAttempts}
                                localTimeout={localTimeout}
                                setLocalName={setLocalName}
                                hasUnsavedChanges={hasUnsavedChanges}
                                handleSaveName={handleSaveName}
                                retryAttemptsChanged={retryAttemptsChanged}
                                timeoutChanged={timeoutChanged}
                            />
                        )}
                    </ThemedBox>
                </ThemedBox>
            </dialog>
        </div>
    );
}
