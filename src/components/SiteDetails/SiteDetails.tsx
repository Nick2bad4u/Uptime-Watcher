/**
 * Site details view component with tabbed interface
 *
 * Provides a comprehensive view of a monitored site including:
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
import { useMemo } from "react";
import "chartjs-adapter-date-fns";

import { useSiteDetails } from "../../hooks/site/useSiteDetails";
import { ChartConfigService } from "../../services/chartConfig";
import { ThemedBox } from "../../theme/components";
import { useTheme } from "../../theme/useTheme";
import { Site } from "../../types";
import { formatStatusWithIcon } from "../../utils/status";
import { formatResponseTime, formatFullTimestamp, formatDuration } from "../../utils/time";
import "./SiteDetails.css";
import { SiteDetailsHeader } from "./SiteDetailsHeader";
import { SiteDetailsNavigation } from "./SiteDetailsNavigation";
import { AnalyticsTab, HistoryTab, OverviewTab, SettingsTab } from "./tabs";

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
interface SiteDetailsProps {
    /** The site object to display details for */
    site: Site;
    /** Callback function to close the site details view */
    onClose: () => void;
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
export function SiteDetails({ onClose, site }: SiteDetailsProps) {
    const { currentTheme } = useTheme();

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
        handleRemoveSite,
        handleSaveInterval,
        handleSaveName,
        handleSaveTimeout,
        handleStartMonitoring,
        handleStopMonitoring,
        handleTimeoutChange,
        // Name state
        hasUnsavedChanges,
        // Interval state
        intervalChanged,
        isLoading,
        isMonitoring,
        isRefreshing,
        localCheckInterval,
        localName,
        localTimeout,
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
                    backgroundColor: currentTheme.colors.primary[500] + "20",
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

    // Don't render if site doesn't exist
    if (!siteExists) return undefined;

    return (
        <div className="site-details-modal" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <ThemedBox
                    surface="overlay"
                    padding="lg"
                    rounded="lg"
                    shadow="xl"
                    className="overflow-hidden site-details-content animate-scale-in"
                >
                    <SiteDetailsHeader
                        site={currentSite}
                        selectedMonitor={selectedMonitor}
                        isRefreshing={isRefreshing}
                    />

                    <SiteDetailsNavigation
                        activeSiteDetailsTab={activeSiteDetailsTab}
                        currentSite={currentSite}
                        handleIntervalChange={handleIntervalChange}
                        handleMonitorIdChange={handleMonitorIdChange}
                        handleSaveInterval={handleSaveInterval}
                        handleSaveTimeout={handleSaveTimeout}
                        handleStartMonitoring={handleStartMonitoring}
                        handleStopMonitoring={handleStopMonitoring}
                        handleTimeoutChange={handleTimeoutChange}
                        intervalChanged={intervalChanged}
                        isLoading={isLoading}
                        isMonitoring={isMonitoring}
                        localCheckInterval={localCheckInterval}
                        localTimeout={localTimeout}
                        onCheckNow={() => handleCheckNow()}
                        selectedMonitorId={selectedMonitorId}
                        setActiveSiteDetailsTab={setActiveSiteDetailsTab}
                        setSiteDetailsChartTimeRange={(range: string) =>
                            setSiteDetailsChartTimeRange(range as "1h" | "24h" | "7d" | "30d")
                        }
                        siteDetailsChartTimeRange={siteDetailsChartTimeRange}
                        timeoutChanged={timeoutChanged}
                    />

                    {/* Tab Content */}
                    <ThemedBox variant="primary" padding="lg" className="max-h-[70vh] overflow-y-auto">
                        {activeSiteDetailsTab === "overview" && (
                            <OverviewTab
                                selectedMonitor={selectedMonitor}
                                uptime={analytics.uptime}
                                avgResponseTime={analytics.avgResponseTime}
                                totalChecks={analytics.totalChecks}
                                fastestResponse={analytics.fastestResponse}
                                slowestResponse={analytics.slowestResponse}
                                formatResponseTime={formatResponseTime}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                            />
                        )}

                        {activeSiteDetailsTab === `${selectedMonitorId}-analytics` && (
                            <AnalyticsTab
                                filteredHistory={analytics.filteredHistory}
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
                                chartTimeRange={siteDetailsChartTimeRange}
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
                                getAvailabilityColor={() => currentTheme.colors.primary[500]}
                                getAvailabilityVariant={(percentage: number) =>
                                    percentage >= 99 ? "success" : percentage >= 95 ? "warning" : "danger"
                                }
                                getAvailabilityDescription={(percentage: number) =>
                                    percentage >= 99 ? "Excellent" : percentage >= 95 ? "Good" : "Poor"
                                }
                                monitorType={selectedMonitor?.type}
                            />
                        )}

                        {activeSiteDetailsTab === "history" && (
                            <HistoryTab
                                selectedMonitor={selectedMonitor}
                                formatResponseTime={formatResponseTime}
                                formatFullTimestamp={formatFullTimestamp}
                                formatStatusWithIcon={formatStatusWithIcon}
                            />
                        )}

                        {activeSiteDetailsTab === "settings" && (
                            <SettingsTab
                                currentSite={currentSite}
                                selectedMonitor={selectedMonitor}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                                localCheckInterval={localCheckInterval}
                                intervalChanged={intervalChanged}
                                handleIntervalChange={handleIntervalChange}
                                handleSaveInterval={handleSaveInterval}
                                handleSaveTimeout={handleSaveTimeout}
                                handleTimeoutChange={handleTimeoutChange}
                                localName={localName}
                                localTimeout={localTimeout}
                                setLocalName={setLocalName}
                                hasUnsavedChanges={hasUnsavedChanges}
                                handleSaveName={handleSaveName}
                                timeoutChanged={timeoutChanged}
                            />
                        )}
                    </ThemedBox>
                </ThemedBox>
            </div>
        </div>
    );
}
