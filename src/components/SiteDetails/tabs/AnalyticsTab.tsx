/**
 * Analytics tab component providing comprehensive monitoring statistics and
 * visualizations. Displays advanced metrics, charts, and performance analysis
 * for site monitoring.
 */

import type { MonitorType } from "@shared/types";
import type { ChartOptions } from "chart.js";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import type { ChartTimeRange } from "../../../constants";
import type { DowntimePeriod } from "../../../hooks/site/useSiteAnalytics";
import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "../../../services/chartConfig";
import type { Theme } from "../../../theme/types";

import { CHART_TIME_RANGES } from "../../../constants";
import { logger } from "../../../services/logger";
import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedProgress } from "../../../theme/components/ThemedProgress";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import { parseUptimeValue } from "../../../utils/monitoring/dataValidation";
import { ConditionalResponseTime } from "../../common/MonitorUiComponents";
import { ResponseTimeChart } from "../charts/ResponseTimeChart";
import { StatusChart } from "../charts/StatusChart";
import { UptimeChart } from "../charts/UptimeChart";

/**
 * Get color for MTTR display based on recovery status
 */
const getMttrColor = (mttrValue: number, theme: Theme): string =>
    mttrValue === 0 ? theme.colors.success : theme.colors.error;

/**
 * Get color for incidents display based on incident count
 */
const getIncidentsColor = (incidentCount: number, theme: Theme): string =>
    incidentCount === 0 ? theme.colors.success : theme.colors.error;

/**
 * Props for the AnalyticsTab component. Contains comprehensive metrics, chart
 * data, and formatting functions.
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
 * Analytics tab component displaying comprehensive monitoring analytics and
 * visualizations.
 *
 * Features:
 *
 * - Multiple chart types (line, bar, doughnut) for different metrics
 * - Key performance indicators (uptime, response time, availability)
 * - Advanced metrics (percentiles, MTTR, downtime analysis)
 * - Interactive charts with time range filtering
 * - Downtime period analysis
 * - Export capabilities for chart data
 *
 * @param props - Component props containing metrics and chart configurations.
 *
 * @returns JSX element displaying analytics interface.
 *
 * @public
 */
export const AnalyticsTab = ({
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
}: AnalyticsTabProperties): JSX.Element => {
    const {
        getAvailabilityColor: getColor,
        getAvailabilityVariant: getVariant,
    } = useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Function to get response time color based on performance
    const getResponseTimeColor = useCallback(
        (responseTime: number): string => {
            if (responseTime <= 100) {
                return currentTheme.colors.success;
            } // Green for excellent (Γëñ100ms)
            if (responseTime <= 500) {
                return currentTheme.colors.warning;
            } // Yellow for good (Γëñ500ms)
            return currentTheme.colors.error; // Red for poor (>500ms)
        },
        [
            currentTheme.colors.error,
            currentTheme.colors.success,
            currentTheme.colors.warning,
        ]
    );

    // Parse uptime value once with validation
    const uptimeValue = parseUptimeValue(uptime);

    // Error-safe wrapper functions to handle formatter errors gracefully
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe: Error type casting in catch blocks for logging */
    const safeDurationFormat = (ms: number): string => {
        try {
            return formatDuration(ms);
        } catch (error) {
            logger.error("Error formatting duration", error as Error);
            return `${Math.round(ms / 1000)}s`; // Fallback format
        }
    };

    const safeResponseTimeFormat = (time: number): string => {
        try {
            return formatResponseTime(time);
        } catch (error) {
            logger.error("Error formatting response time", error as Error);
            return `${time}ms`; // Fallback format
        }
    };

    const safeAvailabilityDescription = (percentage: number): string => {
        try {
            return getAvailabilityDescription(percentage);
        } catch (error) {
            logger.error(
                "Error getting availability description",
                error as Error
            );
            if (percentage >= 99) return "Good";
            if (percentage >= 95) return "Fair";
            return "Poor"; // Fallback descriptions
        }
    };
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after safe performance score type conversion */

    // Icon colors configuration
    const getIconColors = (): {
        analytics: string;
        charts: string;
        downtime: string;
        performance: string;
        uptime: string;
    } => {
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

    const AnalyticsIcon = AppIcons.ui.analytics;
    const CollapseIcon = AppIcons.ui.collapse;
    const DownIcon = AppIcons.status.down;
    const ExpandIcon = AppIcons.ui.expand;
    const IncidentsIcon = AppIcons.metrics.incidents;
    const ListIcon = AppIcons.layout.listAlt;
    const ResponseIcon = AppIcons.metrics.response;
    const TimeIcon = AppIcons.metrics.time;
    const UpIcon = AppIcons.status.up;
    const UptimeIcon = AppIcons.metrics.uptime;
    const variant = getVariant(uptimeValue);
    // Map variant to progress/badge variant - "danger" becomes "error" for UI
    // consistency
    const progressVariant = variant === "danger" ? "error" : variant;

    // Memoized event handlers
    const createTimeRangeHandler = useCallback(
        (range: ChartTimeRange) => (): void => {
            const previousRange = siteDetailsChartTimeRange;
            logger.user.action("Chart time range changed", {
                monitorType: monitorType,
                newRange: range,
                previousRange: previousRange,
            });
            setSiteDetailsChartTimeRange(range);
        },
        [
            monitorType,
            setSiteDetailsChartTimeRange,
            siteDetailsChartTimeRange,
        ]
    );

    const handleAdvancedMetricsToggle = useCallback(() => {
        const previousValue = showAdvancedMetrics;
        const newValue = !showAdvancedMetrics;
        logger.user.action("Advanced metrics toggle", {
            monitorType: monitorType,
            newValue: newValue,
            previousValue: previousValue,
        });
        setShowAdvancedMetrics(newValue);
    }, [
        monitorType,
        setShowAdvancedMetrics,
        showAdvancedMetrics,
    ]);

    // Memoized icons to prevent unnecessary re-renders
    const timeRangeIcon = useMemo(() => <TimeIcon />, [TimeIcon]);
    const availabilityIcon = useMemo(() => <UptimeIcon />, [UptimeIcon]);
    const responseIcon = useMemo(() => <ResponseIcon />, [ResponseIcon]);
    const downtimeIcon = useMemo(() => <IncidentsIcon />, [IncidentsIcon]);
    const checksIcon = useMemo(() => <ListIcon />, [ListIcon]);
    const expandIcon = useMemo(() => <ExpandIcon />, [ExpandIcon]);
    const collapseIcon = useMemo(() => <CollapseIcon />, [CollapseIcon]);
    const upCountIcon = useMemo(
        () => <UpIcon aria-hidden className="h-4 w-4" />,
        [UpIcon]
    );
    const downCountIcon = useMemo(
        () => <DownIcon aria-hidden className="h-4 w-4" />,
        [DownIcon]
    );

    // Colored icons with dependencies on iconColors
    const speedIconColored = useMemo(
        () => <ResponseIcon color={iconColors.performance} />,
        [iconColors.performance, ResponseIcon]
    );
    const trendingUpIconColored = useMemo(
        () => <UptimeIcon color={iconColors.performance} />,
        [iconColors.performance, UptimeIcon]
    );
    const pieChartIconColored = useMemo(
        () => <UptimeIcon color={iconColors.uptime} />,
        [iconColors.uptime, UptimeIcon]
    );
    const barChartIconColored = useMemo(
        () => <AnalyticsIcon color={iconColors.charts} />,
        [AnalyticsIcon, iconColors.charts]
    );

    // Memoized style objects to prevent object recreation
    const fiftiethPercentileStyle = useMemo(
        () => ({ color: getResponseTimeColor(p50) }),
        [getResponseTimeColor, p50]
    );
    const ninetyFifthPercentileStyle = useMemo(
        () => ({ color: getResponseTimeColor(p95) }),
        [getResponseTimeColor, p95]
    );
    const ninetyNinthPercentileStyle = useMemo(
        () => ({ color: getResponseTimeColor(p99) }),
        [getResponseTimeColor, p99]
    );
    const mttrStyle = useMemo(
        () => ({
            color: getMttrColor(mttr, currentTheme),
        }),
        [currentTheme, mttr]
    );
    const incidentsStyle = useMemo(
        () => ({
            color: getIncidentsColor(downtimePeriods.length, currentTheme),
        }),
        [currentTheme, downtimePeriods.length]
    );

    return (
        <div className="space-y-6" data-testid="analytics-tab">
            {totalChecks === 0 ? (
                <ThemedCard
                    icon={barChartIconColored}
                    title="No analytics yet"
                    variant="secondary"
                >
                    <ThemedText size="sm" variant="secondary">
                        Run a check (or wait for scheduled checks) to populate
                        uptime and response-time charts.
                    </ThemedText>
                </ThemedCard>
            ) : null}

            {/* Time Range Selector */}
            <ThemedCard icon={timeRangeIcon} title="Analytics Time Range">
                <div className="flex items-center justify-between">
                    <ThemedText size="sm" variant="secondary">
                        Select time range for analytics data:
                    </ThemedText>
                    <div className="flex gap-2">
                        {CHART_TIME_RANGES.map((range) => (
                            <ThemedButton
                                aria-pressed={
                                    siteDetailsChartTimeRange === range
                                }
                                key={range}
                                onClick={createTimeRangeHandler(range)}
                                size="sm"
                                variant={
                                    siteDetailsChartTimeRange === range
                                        ? "primary"
                                        : "secondary"
                                }
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
                    icon={availabilityIcon}
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
                            {safeAvailabilityDescription(uptimeValue)}
                        </ThemedText>
                    </div>
                </ThemedCard>

                {/* Average Response Time Card - Available for all current monitor types */}
                <ConditionalResponseTime monitorType={monitorType}>
                    <ThemedCard
                        className="flex flex-col items-center text-center"
                        hoverable
                        icon={responseIcon}
                        iconColor={iconColors.performance}
                        title="Avg Response"
                    >
                        <div className="flex flex-col items-center space-y-1">
                            <ThemedText size="xl" weight="bold">
                                {safeResponseTimeFormat(avgResponseTime)}
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
                    icon={downtimeIcon}
                    iconColor={iconColors.downtime}
                    title="Downtime"
                >
                    <div className="flex flex-col items-center space-y-1">
                        <ThemedText size="xl" variant="error" weight="bold">
                            {safeDurationFormat(totalDowntime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="secondary">
                            {downtimePeriods.length} incidents
                        </ThemedText>
                    </div>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={checksIcon}
                    iconColor={iconColors.analytics}
                    title="Total Checks"
                >
                    <div className="flex flex-col items-center space-y-1">
                        <ThemedText size="xl" weight="bold">
                            {totalChecks.toLocaleString()}
                        </ThemedText>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <ThemedBadge
                                icon={upCountIcon}
                                size="sm"
                                variant="success"
                            >
                                Up: {upCount}
                            </ThemedBadge>
                            <ThemedBadge
                                icon={downCountIcon}
                                size="sm"
                                variant="error"
                            >
                                Down: {downCount}
                            </ThemedBadge>
                        </div>
                    </div>
                </ThemedCard>
            </div>

            {/* Response Time Percentiles */}
            <ConditionalResponseTime monitorType={monitorType}>
                <ThemedCard
                    icon={speedIconColored}
                    title="Response Time Analysis"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <ThemedText size="lg" weight="semibold">
                                Percentile Analysis
                            </ThemedText>
                            <ThemedButton
                                icon={
                                    showAdvancedMetrics
                                        ? collapseIcon
                                        : expandIcon
                                }
                                onClick={handleAdvancedMetricsToggle}
                                size="sm"
                                variant="ghost"
                            >
                                {showAdvancedMetrics ? "Hide" : "Show"} Advanced
                            </ThemedButton>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center text-center">
                                <ThemedText
                                    className="mb-2"
                                    size="sm"
                                    variant="secondary"
                                >
                                    P50
                                </ThemedText>
                                <ThemedText
                                    size="lg"
                                    style={fiftiethPercentileStyle}
                                    weight="medium"
                                >
                                    {safeResponseTimeFormat(p50)}
                                </ThemedText>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ThemedText
                                    className="mb-2"
                                    size="sm"
                                    variant="secondary"
                                >
                                    P95
                                </ThemedText>
                                <ThemedText
                                    size="lg"
                                    style={ninetyFifthPercentileStyle}
                                    weight="medium"
                                >
                                    {safeResponseTimeFormat(p95)}
                                </ThemedText>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ThemedText
                                    className="mb-2"
                                    size="sm"
                                    variant="secondary"
                                >
                                    P99
                                </ThemedText>
                                <ThemedText
                                    size="lg"
                                    style={ninetyNinthPercentileStyle}
                                    weight="medium"
                                >
                                    {safeResponseTimeFormat(p99)}
                                </ThemedText>
                            </div>
                        </div>

                        {showAdvancedMetrics ? (
                            <div className="border-primary/20 grid grid-cols-2 gap-4 border-t pt-4">
                                <div className="flex flex-col items-center text-center">
                                    <ThemedText
                                        className="mb-2"
                                        size="sm"
                                        variant="secondary"
                                    >
                                        Mean Time To Recovery
                                    </ThemedText>
                                    <ThemedText
                                        size="lg"
                                        style={mttrStyle}
                                        weight="medium"
                                    >
                                        {safeDurationFormat(mttr)}
                                    </ThemedText>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <ThemedText
                                        className="mb-2"
                                        size="sm"
                                        variant="secondary"
                                    >
                                        Incidents
                                    </ThemedText>
                                    <ThemedText
                                        size="lg"
                                        style={incidentsStyle}
                                        weight="medium"
                                    >
                                        {downtimePeriods.length}
                                    </ThemedText>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </ThemedCard>
            </ConditionalResponseTime>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Response Time Chart */}
                <ConditionalResponseTime monitorType={monitorType}>
                    <ThemedCard
                        icon={trendingUpIconColored}
                        title="Response Time Trends"
                    >
                        <div className="h-64">
                            <ResponseTimeChart
                                data={lineChartData}
                                options={lineChartOptions}
                            />
                        </div>
                    </ThemedCard>
                </ConditionalResponseTime>

                {/* Uptime Doughnut Chart */}
                <ThemedCard
                    icon={pieChartIconColored}
                    title="Uptime Distribution"
                >
                    <div className="h-64">
                        <UptimeChart
                            data={uptimeChartData}
                            options={doughnutOptions}
                        />
                    </div>
                </ThemedCard>

                {/* Status Distribution Bar Chart */}
                <ThemedCard
                    className="lg:col-span-2"
                    icon={barChartIconColored}
                    title="Status Distribution"
                >
                    <div className="h-64">
                        <StatusChart
                            data={barChartData}
                            options={barChartOptions}
                        />
                    </div>
                </ThemedCard>
            </div>
        </div>
    );
};
