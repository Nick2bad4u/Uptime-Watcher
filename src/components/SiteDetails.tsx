import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Site, StatusHistory, MonitorType, Monitor } from "../types";
import { useTheme, useAvailabilityColors } from "../theme/useTheme";
import { useStore } from "../store";
import { formatStatusWithIcon } from "../utils/status";
import { formatResponseTime, formatFullTimestamp, formatDuration } from "../utils/time";
import { AUTO_REFRESH_INTERVAL, CHECK_INTERVALS } from "../constants";
import { ChartConfigService } from "../services/chartConfig";
import logger from "../services/logger";
import { useSiteAnalytics, type DowntimePeriod } from "../hooks/useSiteAnalytics";
import {
    ThemedBox,
    ThemedText,
    ThemedButton,
    StatusIndicator,
    ThemedCard,
    ThemedBadge,
    ThemedProgress,
    ThemedInput,
    ThemedSelect,
} from "../theme/components";
import "chartjs-adapter-date-fns";
import "./SiteDetails.css";
import { FaListOl } from "react-icons/fa";
import { FiTrash2, FiSave } from "react-icons/fi";
import { MdAccessTime, MdBolt, MdSpeed, MdOutlineFactCheck } from "react-icons/md";
import { createPortal } from "react-dom";

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

interface SiteDetailsProps {
    site: Site; // Accepts a site object, but we will use its identifier to look up the latest
    onClose: () => void;
}

export function SiteDetails({ site, onClose }: SiteDetailsProps) {
    const { currentTheme } = useTheme();
    const { getAvailabilityColor, getAvailabilityVariant, getAvailabilityDescription } = useAvailabilityColors();
    const {
        sites,
        deleteSite,
        checkSiteNow,
        isLoading,
        clearError,
        startSiteMonitorMonitoring,
        stopSiteMonitorMonitoring,
        updateSiteCheckInterval,
        // Synchronized UI state from store
        activeSiteDetailsTab,
        setActiveSiteDetailsTab,
        siteDetailsChartTimeRange,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        setShowAdvancedMetrics,
        setSelectedMonitorId,
        getSelectedMonitorId,
    } = useStore();

    const [isRefreshing, setIsRefreshing] = useState(false);
    // Always call hooks first, use fallback for currentSite
    const currentSite = sites.find((s) => s.identifier === site.identifier) || {
        monitors: [],
        identifier: site.identifier,
    };
    const monitorIds = currentSite.monitors.map((m) => m.id);
    const defaultMonitorId = monitorIds[0] || "";
    const selectedMonitorId = getSelectedMonitorId(currentSite.identifier) || defaultMonitorId;
    const selectedMonitor = currentSite.monitors.find((m) => m.id === selectedMonitorId) || currentSite.monitors[0];
    const isMonitoring = selectedMonitor?.monitoring !== false;

    // Handler for check now
    const handleCheckNow = useCallback(
        async (isAutoRefresh = false) => {
            if (isAutoRefresh) {
                setIsRefreshing(true);
            } else {
                clearError();
            }
            try {
                await checkSiteNow(currentSite.identifier, selectedMonitorId);
                if (!isAutoRefresh) {
                    logger.user.action("Manual site check", {
                        identifier: currentSite.identifier,
                        monitorId: selectedMonitorId,
                    });
                }
            } catch (error) {
                logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
            } finally {
                if (isAutoRefresh) {
                    setIsRefreshing(false);
                }
            }
        },
        [checkSiteNow, clearError, currentSite.identifier, selectedMonitorId]
    );

    // Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isMonitoring && !isLoading && !isRefreshing) {
                await handleCheckNow(true);
            }
        }, AUTO_REFRESH_INTERVAL); // Auto-refresh every 30 seconds

        return () => clearInterval(interval);
    }, [isMonitoring, isLoading, isRefreshing, selectedMonitorId, handleCheckNow]);

    // Use analytics hook (pass only selectedMonitor and timeRange)
    const analytics = useSiteAnalytics(selectedMonitor, siteDetailsChartTimeRange); // <-- Make sure the hook uses only this monitor's history

    // Create chart config service instance
    const chartConfig = useMemo(() => new ChartConfigService(currentTheme), [currentTheme]);
    // Chart configurations using the service
    const lineChartOptions = useMemo(() => chartConfig.getLineChartConfig(), [chartConfig]);
    const barChartOptions = useMemo(() => chartConfig.getBarChartConfig(), [chartConfig]);

    // Chart data using analytics
    const lineChartData = useMemo(
        () => ({
            labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
            datasets: [
                {
                    label: "Response Time (ms)",
                    data: analytics.filteredHistory.map((h) => h.responseTime),
                    borderColor: currentTheme.colors.primary[500],
                    backgroundColor: currentTheme.colors.primary[500] + "20",
                    fill: true,
                    tension: 0.1,
                },
            ],
        }),
        [analytics.filteredHistory, currentTheme]
    );

    const barChartData = useMemo(
        () => ({
            labels: ["Up", "Down"],
            datasets: [
                {
                    data: [analytics.upCount, analytics.downCount],
                    backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                },
            ],
        }),
        [analytics.upCount, analytics.downCount, currentTheme]
    );

    const doughnutChartData = useMemo(
        () => ({
            labels: ["Up", "Down"],
            datasets: [
                {
                    data: [analytics.upCount, analytics.downCount],
                    backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                },
            ],
        }),
        [analytics.upCount, analytics.downCount, currentTheme]
    );

    const doughnutOptions = useMemo(
        () => chartConfig.getDoughnutChartConfig(analytics.totalChecks),
        [chartConfig, analytics.totalChecks]
    );

    // Handler for monitor selection change (dropdown)
    const handleMonitorIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setSelectedMonitorId(currentSite.identifier, newId);
        // If current tab is an analytics tab, switch to the new monitor's analytics tab
        if (activeSiteDetailsTab.endsWith("-analytics")) {
            setActiveSiteDetailsTab(`${newId}-analytics`);
        }
    };

    const handleRemoveSite = async () => {
        if (!window.confirm(`Are you sure you want to remove ${currentSite.name || currentSite.identifier}?`)) {
            return;
        }

        clearError(); // Clear previous errors

        try {
            await deleteSite(currentSite.identifier);
            logger.site.removed(currentSite.identifier);
            onClose(); // Close the details view after removing
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
            // Error is already handled by the store action
        }
    };

    // Handler for per-monitor monitoring
    const handleStartMonitoring = () => {
        startSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
    };
    const handleStopMonitoring = () => {
        stopSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
    };

    // Check interval state and handlers
    const [localCheckInterval, setLocalCheckInterval] = useState<number>(selectedMonitor?.checkInterval || 60000);
    const [intervalChanged, setIntervalChanged] = useState(false);
    useEffect(() => {
        setLocalCheckInterval(selectedMonitor?.checkInterval || 60000);
        setIntervalChanged(false);
    }, [selectedMonitor?.checkInterval, selectedMonitor?.type, currentSite.identifier]);
    const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalCheckInterval(Number(e.target.value));
        setIntervalChanged(Number(e.target.value) !== selectedMonitor?.checkInterval);
    };
    const handleSaveInterval = async () => {
        // Always use currentSite.identifier as the first argument
        await updateSiteCheckInterval(currentSite.identifier, selectedMonitorId, localCheckInterval);
        setIntervalChanged(false);
    };

    // Only return null after all hooks
    if (!sites.find((s) => s.identifier === site.identifier)) return null;

    return (
        <div className="site-details-modal" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <ThemedBox
                    surface="overlay"
                    padding="lg"
                    rounded="lg"
                    shadow="xl"
                    className="site-details-content overflow-hidden animate-scale-in"
                >
                    {/* Enhanced Header with Theme-Aware Styling */}
                    <div className="site-details-header">
                        <div className="site-details-header-overlay"></div>
                        <div className="site-details-header-content">
                            {/* Left accent bar */}
                            <div className="site-details-header-accent" />
                            <div className="site-details-header-info flex items-center gap-4">
                                {/* Website Screenshot Thumbnail */}
                                <ScreenshotThumbnail
                                    url={selectedMonitor?.type === "http" ? (selectedMonitor?.url ?? "") : ""}
                                    siteName={currentSite.name || currentSite.identifier}
                                />
                                <div className="site-details-status-indicator">
                                    <StatusIndicator status={selectedMonitor?.status ?? "unknown"} size="lg" />
                                    {isRefreshing && (
                                        <div className="site-details-loading-spinner">
                                            <div className="site-details-spinner"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <ThemedText size="2xl" weight="bold" className="site-details-title truncate">
                                        {site.name || site.identifier}
                                    </ThemedText>
                                    {/* Show URL for HTTP, host:port for port monitor */}
                                    {selectedMonitor?.type === "http" && selectedMonitor?.url && (
                                        <a
                                            href={selectedMonitor.url}
                                            className="site-details-url truncate"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            tabIndex={0}
                                            aria-label={`Open ${selectedMonitor.url} in browser`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const url = selectedMonitor.url || "";
                                                if (hasOpenExternal(window.electronAPI)) {
                                                    window.electronAPI.openExternal(url);
                                                } else {
                                                    window.open(url, "_blank");
                                                }
                                            }}
                                        >
                                            {selectedMonitor.url}
                                        </a>
                                    )}
                                    {/* Fallback if no monitor is available */}
                                    {!selectedMonitor && (
                                        <ThemedText variant="warning" size="md">
                                            No monitor data available for this site.
                                        </ThemedText>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation + Monitor Type Selector (integrated) */}
                    <ThemedBox variant="secondary" padding="lg" className="border-b">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Tab navigation buttons (left) */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <ThemedButton
                                    variant={activeSiteDetailsTab === "overview" ? "primary" : "secondary"}
                                    onClick={() => setActiveSiteDetailsTab("overview")}
                                >
                                    📊 Overview
                                </ThemedButton>
                                {/* Render analytics tab for selected monitor type only */}
                                <ThemedButton
                                    key={selectedMonitorId}
                                    variant={
                                        activeSiteDetailsTab === `${selectedMonitorId}-analytics`
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() => setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`)}
                                >
                                    {`📈 ${selectedMonitorId.toUpperCase()}`}
                                </ThemedButton>
                                <ThemedButton
                                    variant={activeSiteDetailsTab === "history" ? "primary" : "secondary"}
                                    onClick={() => setActiveSiteDetailsTab("history")}
                                >
                                    📜 History
                                </ThemedButton>
                                <ThemedButton
                                    variant={activeSiteDetailsTab === "settings" ? "primary" : "secondary"}
                                    onClick={() => setActiveSiteDetailsTab("settings")}
                                >
                                    ⚙️ Settings
                                </ThemedButton>
                            </div>
                            {/* Controls (right, before monitor type selector) */}
                            <div className="ml-auto flex items-center gap-2">
                                <ThemedText size="sm" variant="secondary">
                                    Interval:
                                </ThemedText>
                                <ThemedSelect value={localCheckInterval} onChange={handleIntervalChange}>
                                    {CHECK_INTERVALS.map((interval) => {
                                        // Support both number and object forms
                                        const value = typeof interval === "number" ? interval : interval.value;
                                        const label =
                                            typeof interval === "number"
                                                ? value < 60000
                                                    ? `${value / 1000}s`
                                                    : value < 3600000
                                                      ? `${value / 60000}m`
                                                      : `${value / 3600000}h`
                                                : interval.label ||
                                                  (interval.value < 60000
                                                      ? `${interval.value / 1000}s`
                                                      : interval.value < 3600000
                                                        ? `${interval.value / 60000}m`
                                                        : `${interval.value / 3600000}h`);
                                        return (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </ThemedSelect>
                                {intervalChanged && (
                                    <ThemedButton variant="primary" size="sm" onClick={handleSaveInterval}>
                                        Save
                                    </ThemedButton>
                                )}
                                {/* Updated: Use square ghost ThemedButton for check-now, matching SiteCard */}
                                <ThemedButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCheckNow}
                                    className="min-w-[32px]"
                                    aria-label="Check Now"
                                    disabled={isLoading}
                                >
                                    <span>🔄</span>
                                </ThemedButton>
                                {isMonitoring ? (
                                    <ThemedButton
                                        variant="error"
                                        size="sm"
                                        onClick={handleStopMonitoring}
                                        aria-label="Stop Monitoring"
                                        className="flex items-center gap-1"
                                    >
                                        <span className="inline-block">⏸️</span>
                                        <span className="hidden sm:inline">Stop</span>
                                    </ThemedButton>
                                ) : (
                                    <ThemedButton
                                        variant="success"
                                        size="sm"
                                        onClick={handleStartMonitoring}
                                        aria-label="Start Monitoring"
                                        className="flex items-center gap-1"
                                    >
                                        <span className="inline-block">▶️</span>
                                        <span className="hidden sm:inline">Start</span>
                                    </ThemedButton>
                                )}
                                {/* Monitor type selector (far right) */}
                                <ThemedText variant="secondary" size="base">
                                    Monitor:
                                </ThemedText>
                                <ThemedSelect value={selectedMonitorId} onChange={handleMonitorIdChange}>
                                    {currentSite.monitors.map((monitor) => (
                                        <option key={monitor.id} value={monitor.id}>
                                            {monitor.type.toUpperCase()}
                                        </option>
                                    ))}
                                </ThemedSelect>
                            </div>
                        </div>
                        {/* Time Range Selector for Analytics Tab (show for both http and port) */}
                        {activeSiteDetailsTab === `${selectedMonitorId}-analytics` &&
                            (selectedMonitorId === "http" || selectedMonitorId === "port") && (
                                <div className="flex items-center flex-wrap gap-3 mt-4">
                                    <ThemedText size="sm" variant="secondary" className="mr-2">
                                        Time Range:
                                    </ThemedText>
                                    <div className="flex flex-wrap gap-1">
                                        {(["1h", "24h", "7d", "30d"] as const).map((range) => (
                                            <ThemedButton
                                                key={range}
                                                variant={siteDetailsChartTimeRange === range ? "primary" : "ghost"}
                                                size="xs"
                                                onClick={() => setSiteDetailsChartTimeRange(range)}
                                            >
                                                {range}
                                            </ThemedButton>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </ThemedBox>

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
                        {/* Only show analytics for selected monitor type and tab */}
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
                                getAvailabilityColor={getAvailabilityColor}
                                getAvailabilityVariant={getAvailabilityVariant}
                                getAvailabilityDescription={getAvailabilityDescription}
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
                                currentSite={site}
                                selectedMonitor={selectedMonitor}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                                localCheckInterval={localCheckInterval}
                                intervalChanged={intervalChanged}
                                handleIntervalChange={handleIntervalChange}
                                handleSaveInterval={handleSaveInterval}
                            />
                        )}
                    </ThemedBox>
                </ThemedBox>
            </div>
        </div>
    );
}

// Tab Components
// Update OverviewTabProps
type OverviewTabProps = {
    selectedMonitor: Monitor;
    uptime: string;
    avgResponseTime: number;
    totalChecks: number;
    fastestResponse: number;
    slowestResponse: number;
    formatResponseTime: (time: number) => string;
    handleRemoveSite: () => Promise<void>;
    isLoading: boolean;
};

function OverviewTab({
    selectedMonitor,
    uptime,
    avgResponseTime,
    totalChecks,
    fastestResponse,
    slowestResponse,
    formatResponseTime,
    handleRemoveSite,
    isLoading,
}: OverviewTabProps) {
    const { getAvailabilityVariant, getAvailabilityColor } = useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Map availability variant to progress/badge variant
    const mapAvailabilityToBadgeVariant = (availability: number): "success" | "warning" | "error" => {
        const variant = getAvailabilityVariant(availability);
        return variant === "danger" ? "error" : variant;
    };

    const uptimeValue = parseFloat(uptime);
    const progressVariant = mapAvailabilityToBadgeVariant(uptimeValue);

    // Icon colors from theme/availability
    const statusIconColor = getAvailabilityColor(uptimeValue); // Status icon color by availability
    const uptimeIconColor = getAvailabilityColor(uptimeValue); // Uptime icon color by availability
    const responseIconColor = currentTheme.colors.warning; // Response time icon uses theme warning
    const checksIconColor = currentTheme.colors.primary[500]; // Checks icon uses theme primary
    const fastestIconColor = currentTheme.colors.success; // Fastest uses theme success
    const slowestIconColor = currentTheme.colors.warning; // Slowest uses theme warning
    const quickActionIconColor = currentTheme.colors.error; // Quick action uses theme error

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ThemedCard
                    icon={<MdOutlineFactCheck />}
                    iconColor={statusIconColor}
                    title="Status"
                    hoverable
                    className="text-center flex flex-col items-center"
                >
                    <StatusIndicator status={selectedMonitor.status} size="lg" showText />
                </ThemedCard>

                <ThemedCard
                    icon={<MdAccessTime />}
                    iconColor={uptimeIconColor}
                    title="Uptime"
                    hoverable
                    className="text-center flex flex-col items-center"
                >
                    <ThemedProgress
                        value={uptimeValue}
                        variant={progressVariant}
                        showLabel
                        className="flex flex-col items-center"
                    />
                    <ThemedBadge variant={progressVariant} size="sm" className="mt-2">
                        {uptime}%
                    </ThemedBadge>
                </ThemedCard>

                <ThemedCard
                    icon={<MdSpeed />}
                    iconColor={responseIconColor}
                    title="Response Time"
                    hoverable
                    className="text-center flex flex-col items-center"
                >
                    <ThemedText size="xl" weight="bold">
                        {formatResponseTime(avgResponseTime)}
                    </ThemedText>
                </ThemedCard>

                <ThemedCard
                    icon={<FaListOl />}
                    iconColor={checksIconColor}
                    title="Total Checks"
                    hoverable
                    className="text-center flex flex-col items-center"
                >
                    <ThemedText size="xl" weight="bold">
                        {totalChecks}
                    </ThemedText>
                </ThemedCard>
            </div>

            {/* Performance Metrics */}
            <ThemedCard icon={<MdBolt color={fastestIconColor} />} title="Performance Overview">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <ThemedText size="sm" variant="secondary">
                            Fastest Response
                        </ThemedText>
                        <ThemedBadge variant="success" icon={<MdBolt />} iconColor={fastestIconColor} className="ml-4">
                            {formatResponseTime(fastestResponse)}
                        </ThemedBadge>
                    </div>
                    <div>
                        <ThemedText size="sm" variant="secondary">
                            Slowest Response
                        </ThemedText>
                        <ThemedBadge
                            variant="warning"
                            icon={<MdAccessTime />}
                            iconColor={slowestIconColor}
                            className="ml-4"
                        >
                            {formatResponseTime(slowestResponse)}
                        </ThemedBadge>
                    </div>
                </div>
            </ThemedCard>

            {/* Quick Actions */}
            <ThemedCard icon={<MdBolt color={quickActionIconColor} />} title="Quick Actions">
                <div className="flex space-x-3">
                    <ThemedButton
                        variant="error"
                        size="sm"
                        onClick={handleRemoveSite}
                        disabled={isLoading}
                        icon={<FiTrash2 />}
                    >
                        Remove Site
                    </ThemedButton>
                </div>
            </ThemedCard>
        </div>
    );
}

interface AnalyticsTabProps {
    filteredHistory: StatusHistory[];
    upCount: number;
    downCount: number;
    totalChecks: number;
    uptime: string;
    avgResponseTime: number;
    p50: number;
    p95: number;
    p99: number;
    mttr: number;
    totalDowntime: number;
    downtimePeriods: DowntimePeriod[];
    chartTimeRange: string;
    lineChartData: Record<string, unknown>;
    lineChartOptions: Record<string, unknown>;
    barChartData: Record<string, unknown>;
    barChartOptions: Record<string, unknown>;
    uptimeChartData: Record<string, unknown>;
    doughnutOptions: Record<string, unknown>;
    formatResponseTime: (time: number) => string;
    formatDuration: (ms: number) => string;
    showAdvancedMetrics: boolean;
    setShowAdvancedMetrics: (show: boolean) => void;
    getAvailabilityColor: (percentage: number) => string;
    getAvailabilityVariant: (percentage: number) => "success" | "warning" | "danger";
    getAvailabilityDescription: (percentage: number) => string;
    monitorType: MonitorType;
}

function AnalyticsTab({
    upCount,
    downCount,
    totalChecks,
    uptime,
    avgResponseTime,
    p50,
    p95,
    p99,
    mttr,
    totalDowntime,
    downtimePeriods,
    chartTimeRange,
    lineChartData,
    lineChartOptions,
    barChartData,
    barChartOptions,
    uptimeChartData,
    doughnutOptions,
    formatResponseTime,
    formatDuration,
    showAdvancedMetrics,
    setShowAdvancedMetrics,
    getAvailabilityColor,
    getAvailabilityVariant,
    getAvailabilityDescription,
    monitorType,
}: AnalyticsTabProps) {
    return (
        <div className="space-y-6">
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ThemedBox
                    surface="base"
                    padding="lg"
                    border
                    rounded="lg"
                    className="text-center flex flex-col items-center"
                >
                    <ThemedText size="sm" variant="secondary">
                        Availability ({chartTimeRange})
                    </ThemedText>
                    <ThemedText
                        size="3xl"
                        weight="bold"
                        variant={getAvailabilityVariant(parseFloat(uptime))}
                        style={{ color: getAvailabilityColor(parseFloat(uptime)) }}
                    >
                        {uptime}%
                    </ThemedText>
                    <ThemedText size="xs" variant="tertiary">
                        {upCount} up / {downCount} down
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary" className="mt-1">
                        {getAvailabilityDescription(parseFloat(uptime))}
                    </ThemedText>
                </ThemedBox>

                {/* Hide avg response time for port monitors */}
                {(monitorType === "http" || monitorType === "port") && (
                    <ThemedBox
                        surface="base"
                        padding="lg"
                        border
                        rounded="lg"
                        className="text-center flex flex-col items-center"
                    >
                        <ThemedText size="sm" variant="secondary">
                            Avg Response Time
                        </ThemedText>
                        <ThemedText size="3xl" weight="bold">
                            {formatResponseTime(avgResponseTime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            Based on {totalChecks} checks
                        </ThemedText>
                    </ThemedBox>
                )}

                <ThemedBox
                    surface="base"
                    padding="lg"
                    border
                    rounded="lg"
                    className="text-center flex flex-col items-center"
                >
                    <ThemedText size="sm" variant="secondary">
                        Total Downtime
                    </ThemedText>
                    <ThemedText size="3xl" weight="bold" variant="danger">
                        {formatDuration(totalDowntime)}
                    </ThemedText>
                    <ThemedText size="xs" variant="tertiary">
                        {downtimePeriods.length} incidents
                    </ThemedText>
                </ThemedBox>
            </div>

            {/* Response Time Percentiles */}
            {(monitorType === "http" || monitorType === "port") && (
                <ThemedBox surface="base" padding="lg" border rounded="lg">
                    <div className="flex items-center justify-between mb-4">
                        <ThemedText size="lg" weight="semibold">
                            Response Time Analysis
                        </ThemedText>
                        <ThemedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                        >
                            {showAdvancedMetrics ? "Hide" : "Show"} Advanced
                        </ThemedButton>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center flex flex-col items-center">
                            <ThemedText size="sm" variant="secondary" className="mb-4">
                                P50
                            </ThemedText>
                            <ThemedText size="lg" weight="medium">
                                {formatResponseTime(p50)}
                            </ThemedText>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <ThemedText size="sm" variant="secondary" className="mb-4">
                                P95
                            </ThemedText>
                            <ThemedText size="lg" weight="medium">
                                {formatResponseTime(p95)}
                            </ThemedText>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <ThemedText size="sm" variant="secondary" className="mb-4">
                                P99
                            </ThemedText>
                            <ThemedText size="lg" weight="medium">
                                {formatResponseTime(p99)}
                            </ThemedText>
                        </div>
                    </div>

                    {showAdvancedMetrics && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center flex flex-col items-center">
                                <ThemedText size="sm" variant="secondary" className="mb-4">
                                    Mean Time To Recovery
                                </ThemedText>
                                <ThemedText size="lg" weight="medium">
                                    {formatDuration(mttr)}
                                </ThemedText>
                            </div>
                            <div className="text-center flex flex-col items-center">
                                <ThemedText size="sm" variant="secondary" className="mb-4">
                                    Incidents
                                </ThemedText>
                                <ThemedText size="lg" weight="medium">
                                    {downtimePeriods.length}
                                </ThemedText>
                            </div>
                        </div>
                    )}
                </ThemedBox>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Response Time Chart */}
                {(monitorType === "http" || monitorType === "port") && (
                    <ThemedBox surface="base" padding="md" border rounded="lg">
                        <div className="h-64">
                            <Line data={lineChartData as any} options={lineChartOptions as any} />
                        </div>
                    </ThemedBox>
                )}

                {/* Uptime Doughnut Chart */}
                <ThemedBox surface="base" padding="md" border rounded="lg">
                    <div className="h-64">
                        <Doughnut data={uptimeChartData as any} options={doughnutOptions as any} />
                    </div>
                </ThemedBox>

                {/* Status Distribution Bar Chart */}
                <ThemedBox surface="base" padding="md" border rounded="lg" className="lg:col-span-2">
                    <div className="h-64">
                        <Bar data={barChartData as any} options={barChartOptions as any} />
                    </div>
                </ThemedBox>
            </div>
        </div>
    );
}

interface HistoryTabProps {
    selectedMonitor: any; // Adjusted type for selectedMonitor
    formatResponseTime: (time: number) => string;
    formatFullTimestamp: (timestamp: number) => string;
    formatStatusWithIcon: (status: string) => string;
}

function HistoryTab({
    selectedMonitor,
    formatResponseTime,
    formatFullTimestamp,
    formatStatusWithIcon,
}: Omit<HistoryTabProps, "site">) {
    const { settings } = useStore();
    const [historyFilter, setHistoryFilter] = useState<"all" | "up" | "down">("all");
    const historyLength = (selectedMonitor.history || []).length;
    const backendLimit = settings.historyLimit || 25;
    // Dropdown options: 25, 50, 100, All (clamped to backendLimit and available history)
    const maxShow = Math.min(backendLimit, historyLength);
    const showOptions = [10, 25, 50, 100, 250, 500, 1000, 10000].filter(opt => opt <= maxShow);
    // Always include 'All' if there are fewer than backendLimit
    if (historyLength > 0 && historyLength <= backendLimit && !showOptions.includes(historyLength)) {
        showOptions.push(historyLength);
    }
    // Default to 50, but never more than backendLimit or available history
    const defaultHistoryLimit = Math.min(50, backendLimit, historyLength);
    const [historyLimit, setHistoryLimit] = useState(defaultHistoryLimit);
    useEffect(() => {
        setHistoryLimit(Math.min(50, backendLimit, (selectedMonitor.history || []).length));
    }, [settings.historyLimit, selectedMonitor.history?.length]);

    const filteredHistoryRecords = (selectedMonitor.history || [])
        .filter((record: any) => historyFilter === "all" || record.status === historyFilter)
        .slice(0, historyLimit);

    return (
        <div className="space-y-6">
            {/* History Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <ThemedText size="lg" weight="semibold">
                        Check History
                    </ThemedText>
                    <div className="flex space-x-1">
                        {(["all", "up", "down"] as const).map((filter) => (
                            <ThemedButton
                                key={filter}
                                variant={historyFilter === filter ? "primary" : "ghost"}
                                size="xs"
                                onClick={() => setHistoryFilter(filter)}
                                className="capitalize ml-4"
                            >
                                {filter === "all" ? "All" : filter === "up" ? "✅ Up" : "❌ Down"}
                            </ThemedButton>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <ThemedText size="sm" variant="secondary">
                        Show:
                    </ThemedText>
                    <select
                        value={historyLimit}
                        onChange={(e) => setHistoryLimit(Number(e.target.value))}
                        className="px-2 py-1 border rounded"
                        aria-label="History limit"
                    >
                        {showOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        {historyLength > backendLimit && (
                            <option value={historyLength}>All ({historyLength})</option>
                        )}
                    </select>
                    <ThemedText size="sm" variant="secondary">
                        of {historyLength} checks
                    </ThemedText>
                </div>
            </div>

            {/* History List */}
            <ThemedBox surface="base" padding="md" border rounded="lg" className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                    {filteredHistoryRecords.map((record: any, index: number) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <StatusIndicator status={record.status} size="sm" />
                                <div>
                                    <ThemedText size="sm" weight="medium">
                                        {formatFullTimestamp(record.timestamp)}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="ml-4">
                                        Check #{(selectedMonitor.history || []).length - index}
                                    </ThemedText>
                                </div>
                            </div>
                            <div className="text-right">
                                <ThemedText size="sm" weight="medium">
                                    {formatResponseTime(record.responseTime)}
                                </ThemedText>
                                <ThemedText size="xs" variant="secondary" className="ml-4">
                                    {formatStatusWithIcon(record.status)}
                                </ThemedText>
                            </div>
                        </div>
                    ))}
                </div>
            </ThemedBox>

            {filteredHistoryRecords.length === 0 && (
                <div className="text-center py-8">
                    <ThemedText variant="secondary">No records found for the selected filter.</ThemedText>
                </div>
            )}
        </div>
    );
}

// Update SettingsTab to accept and render the interval bar
interface SettingsTabProps {
    currentSite: Site;
    selectedMonitor: Monitor;
    handleRemoveSite: () => Promise<void>;
    isLoading: boolean;
    localCheckInterval: number;
    intervalChanged: boolean;
    handleIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleSaveInterval: () => void;
}

function SettingsTab({
    currentSite,
    selectedMonitor,
    handleRemoveSite,
    isLoading,
    localCheckInterval,
    intervalChanged,
    handleIntervalChange,
    handleSaveInterval,
}: SettingsTabProps) {
    const { modifySite, clearError } = useStore();
    const [localName, setLocalName] = useState(currentSite.name || "");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track changes
    useEffect(() => {
        setHasUnsavedChanges(localName !== (currentSite.name || ""));
    }, [localName, currentSite.name]);

    const handleSaveName = async () => {
        if (!hasUnsavedChanges) return;

        clearError();

        try {
            const updates = { name: localName.trim() || undefined };
            await modifySite(currentSite.identifier, updates);
            setHasUnsavedChanges(false);
            logger.user.action("Updated site name", { identifier: currentSite.identifier, name: localName.trim() });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    };

    return (
        <div className="space-y-10">
            {/* Site Configuration */}
            <ThemedCard icon="⚙️" title="Site Configuration" padding="xl" rounded="xl" shadow="lg" className="mb-6">
                <div className="space-y-8">
                    {/* Site Name */}
                    <div>
                        <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                            Site Name
                        </ThemedText>
                        <div className="flex gap-3 items-center">
                            <ThemedInput
                                type="text"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                placeholder="Enter a custom name for this site"
                                className="flex-1"
                            />
                            <ThemedButton
                                variant={hasUnsavedChanges ? "primary" : "secondary"}
                                size="sm"
                                onClick={handleSaveName}
                                disabled={!hasUnsavedChanges || isLoading}
                                loading={isLoading}
                                icon={<FiSave />}
                                className="min-w-[90px]"
                            >
                                Save
                            </ThemedButton>
                        </div>
                        {hasUnsavedChanges && (
                            <ThemedBadge variant="warning" size="xs" className="mt-2">
                                ⚠️ Unsaved changes
                            </ThemedBadge>
                        )}
                    </div>

                    {/* Site URL */}
                    <div>
                        <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                            Site Identifier
                        </ThemedText>
                        <ThemedInput
                            type="text"
                            value={selectedMonitor?.url ?? currentSite.identifier}
                            disabled
                            className="opacity-70"
                        />
                        <ThemedText size="xs" variant="tertiary" className="mt-1">
                            Identifier cannot be changed
                        </ThemedText>
                    </div>
                </div>
            </ThemedCard>

            {/* Per-site check interval control (moved here) */}
            <ThemedBox variant="secondary" padding="md" className="flex items-center gap-3 mb-4">
                <ThemedText size="sm" variant="secondary">
                    Check every:
                </ThemedText>
                <ThemedSelect value={localCheckInterval} onChange={handleIntervalChange}>
                    {CHECK_INTERVALS.map((interval) => {
                        // Support both number and object forms
                        const value = typeof interval === "number" ? interval : interval.value;
                        const label =
                            typeof interval === "number"
                                ? value < 60000
                                    ? `${value / 1000}s`
                                    : value < 3600000
                                      ? `${value / 60000}m`
                                      : `${value / 3600000}h`
                                : interval.label ||
                                  (interval.value < 60000
                                      ? `${interval.value / 1000}s`
                                      : interval.value < 3600000
                                        ? `${interval.value / 60000}m`
                                        : `${interval.value / 3600000}h`);
                        return (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        );
                    })}
                </ThemedSelect>
                <ThemedButton
                    variant={intervalChanged ? "primary" : "secondary"}
                    size="sm"
                    onClick={handleSaveInterval}
                    disabled={!intervalChanged}
                >
                    Save
                </ThemedButton>
                <ThemedText size="xs" variant="tertiary" className="ml-2">
                    (This monitor checks every {Math.round(localCheckInterval / 1000)}s)
                </ThemedText>
            </ThemedBox>

            {/* Site Information */}
            <ThemedCard icon="📊" title="Site Information" padding="xl" rounded="xl" shadow="md" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Site Identifier:
                            </ThemedText>
                            <ThemedBadge variant="secondary" size="xs">
                                {currentSite.identifier}
                            </ThemedBadge>
                        </div>
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Total Monitor History Records:
                            </ThemedText>
                            <ThemedBadge variant="info" size="xs">
                                {(selectedMonitor.history || []).length}
                            </ThemedBadge>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Last Checked:
                            </ThemedText>
                            <ThemedText size="xs" variant="tertiary">
                                {selectedMonitor.lastChecked
                                    ? new Date(selectedMonitor.lastChecked).toLocaleString()
                                    : "Never"}
                            </ThemedText>
                        </div>
                    </div>
                </div>
            </ThemedCard>

            {/* Danger Zone */}
            <ThemedCard
                icon="⚠️"
                title="Danger Zone"
                variant="tertiary"
                padding="xl"
                rounded="xl"
                shadow="md"
                className="border-2 border-error/30"
            >
                <div className="space-y-6">
                    <div>
                        <ThemedText size="sm" weight="medium" variant="error" className="mb-2">
                            Remove Site
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary" className="mb-4 ml-1 block">
                            This action cannot be undone. All history data for this site will be lost.
                        </ThemedText>
                        <ThemedButton
                            variant="error"
                            size="md"
                            onClick={handleRemoveSite}
                            loading={isLoading}
                            icon={<FiTrash2 />}
                            className="w-full"
                        >
                            Remove Site
                        </ThemedButton>
                    </div>
                </div>
            </ThemedCard>
        </div>
    );
}

// Ensure hasOpenExternal is defined at the top (after imports):
function hasOpenExternal(api: any): api is { openExternal: (url: string) => void } {
    return typeof api?.openExternal === "function";
}

// Update ScreenshotThumbnail to use only CSS classes for overlay/image
function ScreenshotThumbnail({ url, siteName }: { url: string; siteName: string }) {
    const [hovered, setHovered] = useState(false);
    const [overlayVars, setOverlayVars] = useState<React.CSSProperties>({});
    const linkRef = useRef<HTMLAnchorElement>(null);
    const { themeName } = useTheme();
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`;

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        if (hasOpenExternal(window.electronAPI)) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, "_blank", "noopener");
        }
    }

    useEffect(() => {
        if (hovered && linkRef.current) {
            const rect = linkRef.current.getBoundingClientRect();
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            const maxImgW = Math.min(viewportW * 0.9, 900); // 90vw or 900px max
            const maxImgH = Math.min(viewportH * 0.9, 700); // 90vh or 700px max
            let overlayW = maxImgW;
            let overlayH = maxImgH;
            let top = rect.top - overlayH - 16; // 16px gap above
            let left = rect.left + rect.width / 2 - overlayW / 2;
            if (top < 0) {
                top = rect.bottom + 16;
            }
            if (left < 8) left = 8;
            if (left + overlayW > viewportW - 8) left = viewportW - overlayW - 8;
            if (top < 8) top = 8;
            if (top + overlayH > viewportH - 8) top = viewportH - overlayH - 8;
            setOverlayVars({
                "--overlay-top": `${top}px`,
                "--overlay-left": `${left}px`,
                "--overlay-width": `${overlayW}px`,
                "--overlay-height": `${overlayH}px`,
            } as React.CSSProperties);
        } else if (!hovered) {
            setOverlayVars({});
        }
    }, [hovered, url, siteName]);
    return (
        <>
            <a
                ref={linkRef}
                href={url}
                tabIndex={0}
                aria-label={`Open ${url} in browser`}
                onClick={handleClick}
                className="site-details-thumbnail-link"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={() => setHovered(true)}
                onBlur={() => setHovered(false)}
            >
                <img
                    src={screenshotUrl}
                    alt={`Screenshot of ${siteName}`}
                    className="site-details-thumbnail-img"
                    loading="lazy"
                />
                <span className="site-details-thumbnail-caption">Preview: {siteName}</span>
            </a>
            {hovered &&
                createPortal(
                    <div className={`site-details-thumbnail-portal-overlay theme-${themeName}`} style={overlayVars}>
                        <div className="site-details-thumbnail-portal-img-wrapper">
                            <img
                                src={screenshotUrl}
                                alt={`Large screenshot of ${siteName}`}
                                className="site-details-thumbnail-img-portal"
                                loading="lazy"
                                tabIndex={0}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
