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
export function SiteDetails({ onClose, site }: SiteDetailsProps) {
    const { currentTheme } = useTheme();

    /**
     * Get availability variant based on percentage
     * @param percentage - Availability percentage
     * @returns Variant type for theming
     */
    const getAvailabilityVariant = (percentage: number): "success" | "warning" | "danger" => {
        if (percentage >= 99) return "success";
        if (percentage >= 95) return "warning";
        return "danger";
    };

    /**
     * Get availability description based on percentage
     * @param percentage - Availability percentage
     * @returns Human-readable description
     */
    const getAvailabilityDescription = (percentage: number): string => {
        if (percentage >= 99) return "Excellent";
        if (percentage >= 95) return "Good";
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
        handleRemoveSite,
        handleRetryAttemptsChange,
        handleSaveInterval,
        handleSaveName,
        handleSaveRetryAttempts,
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
    if (!siteExists) return undefined;

    return (
        <div className="site-details-modal">
            <button
                type="button"
                className="modal-backdrop"
                onClick={onClose}
                onKeyDown={handleKeyDown}
                aria-label="Close modal"
                style={{ background: "none", border: "none", inset: "0", position: "absolute" }}
            />
            <dialog open className="modal-dialog" aria-label="Site details">
                <ThemedBox
                    surface="overlay"
                    padding="lg"
                    rounded="lg"
                    shadow="xl"
                    className="overflow-hidden site-details-content animate-scale-in"
                >
                    <SiteDetailsHeader site={currentSite} {...(selectedMonitor ? { selectedMonitor } : {})} />

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
                        {activeSiteDetailsTab === "overview" && selectedMonitor && (
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
                                getAvailabilityVariant={getAvailabilityVariant}
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
                                handleSaveInterval={handleSaveInterval}
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
