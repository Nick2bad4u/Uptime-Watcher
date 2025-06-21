import { useMemo, useEffect, useState } from "react";
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
import { Site, StatusHistory } from "../types";
import { useTheme, useAvailabilityColors } from "../theme/useTheme";
import { useStore } from "../store";
import { formatStatusWithIcon } from "../utils/status";
import { formatResponseTime, formatFullTimestamp, formatDuration } from "../utils/time";
import { AUTO_REFRESH_INTERVAL } from "../constants";
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
    ThemedIconButton,
    ThemedInput,
} from "../theme/components";
import "chartjs-adapter-date-fns";
import "./SiteDetails.css";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiRefreshCw, FiX, FiTrash2, FiSave } from "react-icons/fi";
import { MdAccessTime, MdBolt, MdBarChart, MdSettings, MdHistory, MdSpeed, MdOutlineFactCheck } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";
import { FaListOl } from "react-icons/fa";
import React from "react";
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
    site: Site;
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
        isMonitoring,
        setMonitoring,
        // Synchronized UI state from store
        activeSiteDetailsTab,
        setActiveSiteDetailsTab,
        siteDetailsChartTimeRange,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        setShowAdvancedMetrics,
    } = useStore();

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isMonitoring && !isLoading && !isRefreshing) {
                await handleCheckNow(true);
            }
        }, AUTO_REFRESH_INTERVAL); // Auto-refresh every 30 seconds

        return () => clearInterval(interval);
    }, [isMonitoring, isLoading, isRefreshing]);

    // Use the updated site from store if available, always get the latest data
    const currentSite = sites.find((s) => s.url === site.url) || site;

    // Use analytics hook for all calculations
    const analytics = useSiteAnalytics(currentSite, siteDetailsChartTimeRange);

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

    // Enhanced handler functions
    const handleCheckNow = async (isAutoRefresh = false) => {
        if (isAutoRefresh) {
            setIsRefreshing(true);
        } else {
            clearError(); // Clear previous errors
        }

        try {
            await checkSiteNow(currentSite.url);
            if (!isAutoRefresh) {
                logger.user.action("Manual site check", { url: currentSite.url });
            }
        } catch (error) {
            logger.site.error(currentSite.url, error instanceof Error ? error : String(error));
            // Error is already handled by the store action
        } finally {
            if (isAutoRefresh) {
                setIsRefreshing(false);
            }
        }
    };

    const handleRemoveSite = async () => {
        if (!window.confirm(`Are you sure you want to remove ${currentSite.name || currentSite.url}?`)) {
            return;
        }

        clearError(); // Clear previous errors

        try {
            await deleteSite(currentSite.url);
            logger.site.removed(currentSite.url);
            onClose(); // Close the details view after removing
        } catch (error) {
            logger.site.error(currentSite.url, error instanceof Error ? error : String(error));
            // Error is already handled by the store action
        }
    };
    // Tab component with enhanced icons
    const tabIcons: Record<string, React.ReactNode> = {
        Overview: <MdBarChart />,
        Analytics: <BsGraphUp />,
        History: <MdHistory />,
        Settings: <MdSettings />,
    };
    const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => {
        const { currentTheme } = useTheme();
        const labelText = label.replace(/^[^ ]+ /, "");
        const icon = tabIcons[labelText] || null;
        return (
            <ThemedButton
                variant={isActive ? "primary" : "ghost"}
                size="sm"
                onClick={onClick}
                className={`px-4 py-2 ${isActive ? "shadow-sm" : ""}`}
                icon={icon}
                style={
                    isActive
                        ? {
                              backgroundColor: currentTheme.colors.primary[400],
                              borderColor: currentTheme.colors.primary[400],
                              color: currentTheme.colors.text.inverse,
                          }
                        : undefined
                }
            >
                {labelText}
            </ThemedButton>
        );
    };

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
                                    url={currentSite.url}
                                    siteName={currentSite.name || currentSite.url}
                                />
                                <div className="site-details-status-indicator">
                                    <StatusIndicator status={currentSite.status} size="lg" />
                                    {isRefreshing && (
                                        <div className="site-details-loading-spinner">
                                            <div className="site-details-spinner"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <ThemedText size="2xl" weight="bold" className="site-details-title truncate">
                                        {currentSite.name || currentSite.url}
                                    </ThemedText>
                                    {currentSite.name && (
                                        <a
                                            href={currentSite.url}
                                            className="site-details-url truncate"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            tabIndex={0}
                                            aria-label={`Open ${currentSite.url} in browser`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (hasOpenExternal(window.electronAPI)) {
                                                    window.electronAPI.openExternal(currentSite.url);
                                                } else {
                                                    window.open(currentSite.url, "_blank", "noopener");
                                                }
                                            }}
                                        >
                                            {currentSite.url}
                                        </a>
                                    )}
                                    <div className="site-details-meta">
                                        <ThemedText size="xs" variant="tertiary" className="site-details-last-checked">
                                            Last checked:{" "}
                                            {formatFullTimestamp(
                                                typeof currentSite.lastChecked === "number"
                                                    ? currentSite.lastChecked
                                                    : Date.now()
                                            )}
                                        </ThemedText>
                                    </div>
                                </div>
                            </div>
                            {/* Monitoring enabled indicator moved above the actions */}
                            {isMonitoring && (
                                <div className="site-details-monitoring-indicator flex flex-col items-center justify-center gap-1 mt-2">
                                    <div className="site-details-refresh-indicator" />
                                    <ThemedText
                                        size="xs"
                                        variant="success"
                                        className="site-details-refresh-text text-center"
                                    >
                                        Monitoring enabled
                                    </ThemedText>
                                </div>
                            )}
                            <div className="site-details-actions">
                                <ThemedIconButton
                                    icon={isMonitoring ? <FaPause /> : <FaPlay />}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMonitoring(!isMonitoring)}
                                    tooltip={isMonitoring ? "Pause monitoring" : "Resume monitoring"}
                                />
                                <ThemedIconButton
                                    icon={<FiRefreshCw />}
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCheckNow}
                                    loading={isLoading}
                                    tooltip="Check now"
                                />
                                <ThemedIconButton
                                    icon={<FiX />}
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    tooltip="Close"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <ThemedBox variant="secondary" padding="lg" className="border-b">
                        <div className="flex flex-wrap gap-2">
                            <TabButton
                                label="📊 Overview"
                                isActive={activeSiteDetailsTab === "overview"}
                                onClick={() => setActiveSiteDetailsTab("overview")}
                            />
                            <TabButton
                                label="📈 Analytics"
                                isActive={activeSiteDetailsTab === "analytics"}
                                onClick={() => setActiveSiteDetailsTab("analytics")}
                            />
                            <TabButton
                                label="📜 History"
                                isActive={activeSiteDetailsTab === "history"}
                                onClick={() => setActiveSiteDetailsTab("history")}
                            />
                            <TabButton
                                label="⚙️ Settings"
                                isActive={activeSiteDetailsTab === "settings"}
                                onClick={() => setActiveSiteDetailsTab("settings")}
                            />
                        </div>

                        {/* Time Range Selector for Analytics */}
                        {activeSiteDetailsTab === "analytics" && (
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
                                currentSite={currentSite}
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

                        {activeSiteDetailsTab === "analytics" && (
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
                            />
                        )}

                        {activeSiteDetailsTab === "history" && <HistoryTab currentSite={currentSite} />}

                        {activeSiteDetailsTab === "settings" && (
                            <SettingsTab
                                currentSite={currentSite}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                            />
                        )}
                    </ThemedBox>
                </ThemedBox>
            </div>
        </div>
    );
}

// Tab Components
interface OverviewTabProps {
    currentSite: Site;
    uptime: string;
    avgResponseTime: number;
    totalChecks: number;
    fastestResponse: number;
    slowestResponse: number;
    formatResponseTime: (time: number) => string;
    handleRemoveSite: () => Promise<void>;
    isLoading: boolean;
}

function OverviewTab({
    currentSite,
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
                    <StatusIndicator status={currentSite.status} size="lg" showText />
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Response Time Chart */}
                <ThemedBox surface="base" padding="md" border rounded="lg">
                    <div className="h-64">
                        <Line data={lineChartData as any} options={lineChartOptions as any} />
                    </div>
                </ThemedBox>

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
    currentSite: Site;
}

function HistoryTab({ currentSite }: HistoryTabProps) {
    const [historyFilter, setHistoryFilter] = useState<"all" | "up" | "down">("all");
    const [historyLimit, setHistoryLimit] = useState(50);

    const filteredHistoryRecords = currentSite.history
        .filter((record) => historyFilter === "all" || record.status === historyFilter)
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
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={currentSite.history.length}>All ({currentSite.history.length})</option>
                    </select>
                </div>
            </div>

            {/* History List */}
            <ThemedBox surface="base" padding="md" border rounded="lg" className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                    {filteredHistoryRecords.map((record, index) => (
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
                                        Check #{currentSite.history.length - index}
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

// Enhanced Settings Tab Component
interface SettingsTabProps {
    currentSite: Site;
    handleRemoveSite: () => Promise<void>;
    isLoading: boolean;
}

function SettingsTab({ currentSite, handleRemoveSite, isLoading }: SettingsTabProps) {
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
            await modifySite(currentSite.url, updates);
            setHasUnsavedChanges(false);
            logger.user.action("Updated site name", { url: currentSite.url, name: localName.trim() });
        } catch (error) {
            logger.site.error(currentSite.url, error instanceof Error ? error : String(error));
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
                            Site URL
                        </ThemedText>
                        <ThemedInput type="url" value={currentSite.url} disabled className="opacity-70" />
                        <ThemedText size="xs" variant="tertiary" className="mt-1">
                            URL cannot be changed after creation
                        </ThemedText>
                    </div>
                </div>
            </ThemedCard>

            {/* Site Information */}
            <ThemedCard icon="📊" title="Site Information" padding="xl" rounded="xl" shadow="md" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Site ID:
                            </ThemedText>
                            <ThemedBadge variant="secondary" size="xs">
                                {currentSite.id}
                            </ThemedBadge>
                        </div>
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Total History Records:
                            </ThemedText>
                            <ThemedBadge variant="info" size="xs">
                                {currentSite.history.length}
                            </ThemedBadge>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Last Checked:
                            </ThemedText>
                            <ThemedText size="xs" variant="tertiary">
                                {currentSite.lastChecked ? new Date(currentSite.lastChecked).toLocaleString() : "Never"}
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
    const [hovered, setHovered] = React.useState(false);
    const [overlayVars, setOverlayVars] = React.useState<React.CSSProperties>({});
    const { themeName } = useTheme();
    const linkRef = React.useRef<HTMLAnchorElement>(null);
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`;

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        if (hasOpenExternal(window.electronAPI)) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, "_blank", "noopener");
        }
    }

    // Position overlay above or below the thumbnail, always fit in viewport
    React.useEffect(() => {
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
    }, [hovered]);

    // Portal overlay for enlarged preview
    const overlay = hovered
        ? createPortal(
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
          )
        : null;
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
            >
                <img
                    src={screenshotUrl}
                    alt={`Screenshot of ${siteName}`}
                    className="site-details-thumbnail-img"
                    loading="lazy"
                />
                <span className="site-details-thumbnail-caption">Preview: {siteName}</span>
            </a>
            {overlay}
        </>
    );
}
