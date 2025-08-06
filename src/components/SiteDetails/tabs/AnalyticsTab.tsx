/**
 * Analytics tab component providing comprehensive monitoring statistics and visualizations.
 * Displays advanced metrics, charts, and performance analysis for site monitoring.
 */

import type { JSX } from "react/jsx-runtime";

import { FiActivity, FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { MdAnalytics, MdPieChart, MdSpeed, MdTrendingUp } from "react-icons/md";

import { CHART_TIME_RANGES, ChartTimeRange } from "../../../constants";
import { DowntimePeriod } from "../../../hooks/site/useSiteAnalytics";
import { ResponseTimeChartData, StatusBarChartData, UptimeChartData } from "../../../services/chartConfig";
import { ChartOptions } from "../../../services/chartSetup";
import logger from "../../../services/logger";
import { ThemedBadge, ThemedButton, ThemedCard, ThemedProgress, ThemedText } from "../../../theme/components";
import { Theme } from "../../../theme/types";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";
import { MonitorType } from "../../../types";
import { parseUptimeValue } from "../../../utils/monitoring/dataValidation";
import { ConditionalResponseTime } from "../../common/MonitorUiComponents";
import { ResponseTimeChart, StatusChart, UptimeChart } from "../charts/ChartComponents";

/**
 * Get color for MTTR display based on recovery status
 */
const getMttrColor = (mttrValue: number, theme: Theme): string => {
    return mttrValue === 0 ? theme.colors.success : theme.colors.error;
};

/**
 * Get color for incidents display based on incident count
 */
const getIncidentsColor = (incidentCount: number, theme: Theme): string => {
    return incidentCount === 0 ? theme.colors.success : theme.colors.error;
};

/**
 * Props for the AnalyticsTab component.
 * Contains comprehensive metrics, chart data, and formatting functions.
 *
 * @public
 */
export interface AnalyticsTabProperties {
    /** Average response time across all checks */
    readonly avgResponseTime: number;
    /** Chart.js data configuration for bar chart */
    readonly barChartData: StatusBarChartData;
    /** Chart.js options configuration for bar chart */
    readonly barChartOptions: ChartOptions<"bar">;
    /** Chart.js options configuration for doughnut chart */
    readonly doughnutOptions: ChartOptions<"doughnut">;
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
    readonly lineChartData: ResponseTimeChartData;
    /** Chart.js options configuration for line chart */
    readonly lineChartOptions: ChartOptions<"line">;
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
    readonly setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;
    /** Whether advanced metrics are currently shown */
    readonly showAdvancedMetrics: boolean;
    /** Current chart time range selection */
    readonly siteDetailsChartTimeRange: ChartTimeRange;
    /** Total number of checks performed */
    readonly totalChecks: number;
    /** Total downtime in milliseconds */
    readonly totalDowntime: number;
    /** Number of successful checks */
    readonly upCount: number;
    /** Uptime percentage as string */
    readonly uptime: string;
    /** Chart.js data configuration for uptime chart */
    readonly uptimeChartData: UptimeChartData;
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
}: AnalyticsTabProperties): JSX.Element {
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

    // Parse uptime value once with validation
    const uptimeValue = parseUptimeValue(uptime);

    // Icon colors configuration
    const getIconColors = () => {
        const availabilityColor = getColor(uptimeValue);
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
    const variant = getVariant(uptimeValue);
    // Map variant to progress/badge variant - "danger" becomes "error" for UI consistency
    const progressVariant = variant === "danger" ? "error" : variant;

    return (
        <div className="space-y-6" data-testid="analytics-tab">
            {/* Time Range Selector */}
            <ThemedCard icon={<MdAnalytics />} title="Analytics Time Range">
                <div className="flex items-center justify-between">
                    <ThemedText size="sm" variant="secondary">
                        Select time range for analytics data:
                    </ThemedText>
                    <div className="flex gap-2">
                        {CHART_TIME_RANGES.map((range) => (
                            <ThemedButton
                                key={range}
                                onClick={() => {
                                    const previousRange = siteDetailsChartTimeRange;
                                    logger.user.action("Chart time range changed", {
                                        monitorType: monitorType,
                                        newRange: range,
                                        previousRange: previousRange,
                                    });
                                    setSiteDetailsChartTimeRange(range);
                                }}
                                size="sm"
                                variant={siteDetailsChartTimeRange === range ? "primary" : "ghost"}
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
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={<MdAnalytics />}
                    iconColor={iconColors.uptime}
                    title="Availability"
                >
                    <div className="flex flex-col items-center space-y-2">
                        <ThemedProgress
                            className="flex flex-col items-center"
                            showLabel
                            value={uptimeValue}
                            variant={progressVariant}
                        />
                        <ThemedBadge size="sm" variant={progressVariant}>
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
                        className="flex flex-col items-center text-center"
                        hoverable
                        icon={<MdTrendingUp />}
                        iconColor={iconColors.performance}
                        title="Avg Response"
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
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={<FiActivity />}
                    iconColor={iconColors.downtime}
                    title="Downtime"
                >
                    <div className="flex flex-col items-center space-y-1">
                        <ThemedText size="xl" variant="error" weight="bold">
                            {formatDuration(totalDowntime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="secondary">
                            {downtimePeriods.length} incidents
                        </ThemedText>
                    </div>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={<FiTrendingUp />}
                    iconColor={iconColors.analytics}
                    title="Total Checks"
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
                                onClick={() => {
                                    const previousValue = showAdvancedMetrics;
                                    const newValue = !showAdvancedMetrics;
                                    logger.user.action("Advanced metrics toggle", {
                                        monitorType: monitorType,
                                        newValue: newValue,
                                        previousValue: previousValue,
                                    });
                                    setShowAdvancedMetrics(newValue);
                                }}
                                size="sm"
                                variant="ghost"
                            >
                                {showAdvancedMetrics ? "Hide" : "Show"} Advanced
                            </ThemedButton>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center text-center">
                                <ThemedText className="mb-2" size="sm" variant="secondary">
                                    P50
                                </ThemedText>
                                <ThemedText size="lg" style={{ color: getResponseTimeColor(p50) }} weight="medium">
                                    {formatResponseTime(p50)}
                                </ThemedText>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ThemedText className="mb-2" size="sm" variant="secondary">
                                    P95
                                </ThemedText>
                                <ThemedText size="lg" style={{ color: getResponseTimeColor(p95) }} weight="medium">
                                    {formatResponseTime(p95)}
                                </ThemedText>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ThemedText className="mb-2" size="sm" variant="secondary">
                                    P99
                                </ThemedText>
                                <ThemedText size="lg" style={{ color: getResponseTimeColor(p99) }} weight="medium">
                                    {formatResponseTime(p99)}
                                </ThemedText>
                            </div>
                        </div>

                        {showAdvancedMetrics && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
                                <div className="flex flex-col items-center text-center">
                                    <ThemedText className="mb-2" size="sm" variant="secondary">
                                        Mean Time To Recovery
                                    </ThemedText>
                                    <ThemedText
                                        size="lg"
                                        style={{
                                            color: getMttrColor(mttr, currentTheme),
                                        }}
                                        weight="medium"
                                    >
                                        {formatDuration(mttr)}
                                    </ThemedText>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <ThemedText className="mb-2" size="sm" variant="secondary">
                                        Incidents
                                    </ThemedText>
                                    <ThemedText
                                        size="lg"
                                        style={{
                                            color: getIncidentsColor(downtimePeriods.length, currentTheme),
                                        }}
                                        weight="medium"
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
                            <ResponseTimeChart data={lineChartData} options={lineChartOptions} />
                        </div>
                    </ThemedCard>
                </ConditionalResponseTime>

                {/* Uptime Doughnut Chart */}
                <ThemedCard icon={<MdPieChart color={iconColors.uptime} />} title="Uptime Distribution">
                    <div className="h-64">
                        <UptimeChart data={uptimeChartData} options={doughnutOptions} />
                    </div>
                </ThemedCard>

                {/* Status Distribution Bar Chart */}
                <ThemedCard
                    className="lg:col-span-2"
                    icon={<FiBarChart2 color={iconColors.charts} />}
                    title="Status Distribution"
                >
                    <div className="h-64">
                        <StatusChart data={barChartData} options={barChartOptions} />
                    </div>
                </ThemedCard>
            </div>
        </div>
    );
}
