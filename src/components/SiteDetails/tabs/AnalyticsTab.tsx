/**
 * Analytics tab component providing comprehensive monitoring statistics and visualizations.
 * Displays advanced metrics, charts, and performance analysis for site monitoring.
 */

import { Line, Bar, Doughnut } from "react-chartjs-2";
import { FiActivity, FiTrendingUp, FiBarChart2 } from "react-icons/fi";
import { MdAnalytics, MdTrendingUp, MdSpeed, MdPieChart } from "react-icons/md";

import { ConditionalResponseTime } from "../../dynamic-monitor-ui";
import { DowntimePeriod } from "../../../hooks/site/useSiteAnalytics";
import { logger } from "../../../services";
import {
    ThemedText,
    ThemedButton,
    ThemedCard,
    ThemedBadge,
    ThemedProgress,
    useTheme,
    useAvailabilityColors,
} from "../../../theme";
import { MonitorType } from "../../../types";

/**
 * Props for the AnalyticsTab component.
 * Contains comprehensive metrics, chart data, and formatting functions.
 */
interface AnalyticsTabProperties {
    /** Average response time across all checks */
    readonly avgResponseTime: number;
    /** Chart.js data configuration for bar chart */
    readonly barChartData: Record<string, unknown>;
    /** Chart.js options configuration for bar chart */
    readonly barChartOptions: Record<string, unknown>;
    /** Chart.js options configuration for doughnut chart */
    readonly doughnutOptions: Record<string, unknown>;
    /** Number of failed checks */
    readonly downCount: number;
    /** Array of downtime periods with durations */
    readonly downtimePeriods: DowntimePeriod[];
    /** Function to format duration values */
    readonly formatDuration: (ms: number) => string;
    /** Function to format response time values */
    readonly formatResponseTime: (time: number) => string;
    /** Function to get description based on availability percentage */
    readonly getAvailabilityDescription: (percentage: number) => string;
    /** Chart.js data configuration for line chart */
    readonly lineChartData: Record<string, unknown>;
    /** Chart.js options configuration for line chart */
    readonly lineChartOptions: Record<string, unknown>;
    /** Type of monitor being analyzed */
    readonly monitorType: MonitorType;
    /** Mean time to recovery in milliseconds */
    readonly mttr: number;
    /** 50th percentile response time */
    readonly p50: number;
    /** 95th percentile response time */
    readonly p95: number;
    /** 99th percentile response time */
    readonly p99: number;
    /** Function to toggle advanced metrics visibility */
    readonly setShowAdvancedMetrics: (show: boolean) => void;
    /** Function to set the chart time range */
    readonly setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") => void;
    /** Whether advanced metrics are currently shown */
    readonly showAdvancedMetrics: boolean;
    /** Current chart time range selection */
    readonly siteDetailsChartTimeRange: "1h" | "24h" | "7d" | "30d";
    /** Total number of checks performed */
    readonly totalChecks: number;
    /** Total downtime in milliseconds */
    readonly totalDowntime: number;
    /** Number of successful checks */
    readonly upCount: number;
    /** Uptime percentage as string */
    readonly uptime: string;
    /** Chart.js data configuration for uptime chart */
    readonly uptimeChartData: Record<string, unknown>;
}

/**
 * Analytics tab component displaying comprehensive monitoring analytics and visualizations.
 *
 * Features:
 * - Multiple chart types (line, bar, doughnut) for different metrics
 * - Key performance indicators (uptime, response time, availability)
 * - Advanced metrics (percentiles, MTTR, downtime analysis)
 * - Interactive charts with time range filtering
 * - Downtime period analysis
 * - Export capabilities for chart data
 *
 * @param props - Component props containing metrics and chart configurations
 * @returns JSX element displaying analytics interface
 */
export function AnalyticsTab({
    avgResponseTime,
    barChartData,
    barChartOptions,
    doughnutOptions,
    downCount,
    downtimePeriods,
    formatDuration,
    formatResponseTime,
    getAvailabilityDescription,
    lineChartData,
    lineChartOptions,
    monitorType,
    mttr,
    p50,
    p95,
    p99,
    setShowAdvancedMetrics,
    setSiteDetailsChartTimeRange,
    showAdvancedMetrics,
    siteDetailsChartTimeRange,
    totalChecks,
    totalDowntime,
    upCount,
    uptime,
    uptimeChartData,
}: AnalyticsTabProperties) {
    const { getAvailabilityColor: getColor, getAvailabilityVariant: getVariant } = useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Function to get response time color based on performance
    const getResponseTimeColor = (responseTime: number): string => {
        if (responseTime <= 100) {
            return currentTheme.colors.success;
        } // Green for excellent (≤100ms)
        if (responseTime <= 500) {
            return currentTheme.colors.warning;
        } // Yellow for good (≤500ms)
        return currentTheme.colors.error; // Red for poor (>500ms)
    };

    // Icon colors configuration
    const getIconColors = () => {
        const availabilityColor = getColor(Number.parseFloat(uptime));
        const responseTimeColor = getResponseTimeColor(avgResponseTime);
        return {
            analytics: currentTheme.colors.primary[500],
            charts: currentTheme.colors.primary[600],
            downtime: currentTheme.colors.error,
            performance: responseTimeColor,
            uptime: availabilityColor,
        };
    };

    const iconColors = getIconColors();
    const uptimeValue = Number.parseFloat(uptime);
    const variant = getVariant(uptimeValue);
    const progressVariant = variant === "danger" ? "error" : variant;

    return (
        <div data-testid="analytics-tab" className="space-y-6">
            {/* Time Range Selector */}
            <ThemedCard icon={<MdAnalytics />} title="Analytics Time Range">
                <div className="flex items-center justify-between">
                    <ThemedText size="sm" variant="secondary">
                        Select time range for analytics data:
                    </ThemedText>
                    <div className="flex gap-2">
                        {(["1h", "24h", "7d", "30d"] as const).map((range) => (
                            <ThemedButton
                                key={range}
                                variant={siteDetailsChartTimeRange === range ? "primary" : "ghost"}
                                size="sm"
                                onClick={() => {
                                    logger.user.action("Chart time range changed", {
                                        monitorType: monitorType,

                                        newRange: range,
                                    });
                                    setSiteDetailsChartTimeRange(range);
                                }}
                            >
                                {range}
                            </ThemedButton>
                        ))}
                    </div>
                </div>
            </ThemedCard>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ThemedCard
                    icon={<MdAnalytics />}
                    iconColor={iconColors.uptime}
                    title="Availability"
                    hoverable
                    className="flex flex-col items-center text-center"
                >
                    <div className="flex flex-col items-center space-y-2">
                        <ThemedProgress
                            value={uptimeValue}
                            variant={progressVariant}
                            showLabel
                            className="flex flex-col items-center"
                        />
                        <ThemedBadge variant={progressVariant} size="sm">
                            {uptime}%
                        </ThemedBadge>
                        <ThemedText size="xs" variant="secondary">
                            {getAvailabilityDescription(uptimeValue)}
                        </ThemedText>
                    </div>
                </ThemedCard>

                {/* Average Response Time Card - Available for all current monitor types */}
                <ConditionalResponseTime monitorType={monitorType}>
                    <ThemedCard
                        icon={<MdTrendingUp />}
                        iconColor={iconColors.performance}
                        title="Avg Response"
                        hoverable
                        className="flex flex-col items-center text-center"
                    >
                        <div className="flex flex-col items-center space-y-1">
                            <ThemedText size="xl" weight="bold">
                                {formatResponseTime(avgResponseTime)}
                            </ThemedText>
                            <ThemedText size="xs" variant="secondary">
                                {totalChecks} checks
                            </ThemedText>
                        </div>
                    </ThemedCard>
                </ConditionalResponseTime>

                <ThemedCard
                    icon={<FiActivity />}
                    iconColor={iconColors.downtime}
                    title="Downtime"
                    hoverable
                    className="flex flex-col items-center text-center"
                >
                    <div className="flex flex-col items-center space-y-1">
                        <ThemedText size="xl" weight="bold" variant="error">
                            {formatDuration(totalDowntime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="secondary">
                            {downtimePeriods.length} incidents
                        </ThemedText>
                    </div>
                </ThemedCard>

                <ThemedCard
                    icon={<FiTrendingUp />}
                    iconColor={iconColors.analytics}
                    title="Total Checks"
                    hoverable
                    className="flex flex-col items-center text-center"
                >
                    <div className="flex flex-col items-center space-y-1">
                        <ThemedText size="xl" weight="bold">
                            {totalChecks.toLocaleString()}
                        </ThemedText>
                        <ThemedText size="xs" variant="secondary">
                            Up: {upCount} / Down: {downCount}
                        </ThemedText>
                    </div>
                </ThemedCard>
            </div>

            {/* Response Time Percentiles */}
            <ConditionalResponseTime monitorType={monitorType}>
                <ThemedCard icon={<MdSpeed color={iconColors.performance} />} title="Response Time Analysis">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <ThemedText size="lg" weight="semibold">
                                Percentile Analysis
                            </ThemedText>
                            <ThemedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const newValue = !showAdvancedMetrics;
                                    logger.user.action("Advanced metrics toggle", {
                                        monitorType: monitorType,

                                        newValue: newValue,
                                    });
                                    setShowAdvancedMetrics(newValue);
                                }}
                            >
                                {showAdvancedMetrics ? "Hide" : "Show"} Advanced
                            </ThemedButton>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center text-center">
                                <ThemedText size="sm" variant="secondary" className="mb-2">
                                    P50
                                </ThemedText>
                                <ThemedText size="lg" weight="medium" style={{ color: getResponseTimeColor(p50) }}>
                                    {formatResponseTime(p50)}
                                </ThemedText>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ThemedText size="sm" variant="secondary" className="mb-2">
                                    P95
                                </ThemedText>
                                <ThemedText size="lg" weight="medium" style={{ color: getResponseTimeColor(p95) }}>
                                    {formatResponseTime(p95)}
                                </ThemedText>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ThemedText size="sm" variant="secondary" className="mb-2">
                                    P99
                                </ThemedText>
                                <ThemedText size="lg" weight="medium" style={{ color: getResponseTimeColor(p99) }}>
                                    {formatResponseTime(p99)}
                                </ThemedText>
                            </div>
                        </div>

                        {showAdvancedMetrics && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col items-center text-center">
                                    <ThemedText size="sm" variant="secondary" className="mb-2">
                                        Mean Time To Recovery
                                    </ThemedText>
                                    <ThemedText
                                        size="lg"
                                        weight="medium"
                                        style={{
                                            color: mttr === 0 ? currentTheme.colors.success : iconColors.downtime,
                                        }}
                                    >
                                        {formatDuration(mttr)}
                                    </ThemedText>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <ThemedText size="sm" variant="secondary" className="mb-2">
                                        Incidents
                                    </ThemedText>
                                    <ThemedText
                                        size="lg"
                                        weight="medium"
                                        style={{
                                            color:
                                                downtimePeriods.length === 0
                                                    ? currentTheme.colors.success
                                                    : iconColors.downtime,
                                        }}
                                    >
                                        {downtimePeriods.length}
                                    </ThemedText>
                                </div>
                            </div>
                        )}
                    </div>
                </ThemedCard>
            </ConditionalResponseTime>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Response Time Chart */}
                <ConditionalResponseTime monitorType={monitorType}>
                    <ThemedCard icon={<FiTrendingUp color={iconColors.performance} />} title="Response Time Trends">
                        <div className="h-64">
                            <Line
                                data={
                                    lineChartData as unknown as import("chart.js").ChartData<
                                        "line",
                                        (number | import("chart.js").Point | null)[],
                                        unknown
                                    >
                                }
                                options={lineChartOptions as unknown as import("chart.js").ChartOptions<"line">}
                            />
                        </div>
                    </ThemedCard>
                </ConditionalResponseTime>

                {/* Uptime Doughnut Chart */}
                <ThemedCard icon={<MdPieChart color={iconColors.uptime} />} title="Uptime Distribution">
                    <div className="h-64">
                        <Doughnut
                            data={
                                uptimeChartData as unknown as import("chart.js").ChartData<
                                    "doughnut",
                                    number[],
                                    unknown
                                >
                            }
                            options={doughnutOptions as unknown as import("chart.js").ChartOptions<"doughnut">}
                        />
                    </div>
                </ThemedCard>

                {/* Status Distribution Bar Chart */}
                <ThemedCard
                    icon={<FiBarChart2 color={iconColors.charts} />}
                    title="Status Distribution"
                    className="lg:col-span-2"
                >
                    <div className="h-64">
                        <Bar
                            data={
                                barChartData as unknown as import("chart.js").ChartData<
                                    "bar",
                                    (number | [number, number] | null)[],
                                    unknown
                                >
                            }
                            options={barChartOptions as unknown as import("chart.js").ChartOptions<"bar">}
                        />
                    </div>
                </ThemedCard>
            </div>
        </div>
    );
}
