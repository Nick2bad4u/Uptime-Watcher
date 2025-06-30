/**
 * Analytics tab component providing comprehensive monitoring statistics and visualizations.
 * Displays advanced metrics, charts, and performance analysis for site monitoring.
 */

import { Line, Bar, Doughnut } from "react-chartjs-2";

import { DowntimePeriod } from "../../../hooks/site/useSiteAnalytics";
import logger from "../../../services/logger";
import { ThemedBox, ThemedText, ThemedButton } from "../../../theme/components";
import { MonitorType } from "../../../types";

/**
 * Props for the AnalyticsTab component.
 * Contains comprehensive metrics, chart data, and formatting functions.
 */
/**
 * Props for the AnalyticsTab component.
 * Contains comprehensive metrics, chart data, and formatting functions.
 */
interface AnalyticsTabProps {
    /** Average response time across all checks */
    readonly avgResponseTime: number;
    /** Chart.js data configuration for bar chart */
    readonly barChartData: Record<string, unknown>;
    /** Chart.js options configuration for bar chart */
    readonly barChartOptions: Record<string, unknown>;
    /** Current time range for charts (e.g., "24h", "7d") */
    readonly chartTimeRange: string;
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
    /** Function to get color based on availability percentage */
    readonly getAvailabilityColor: (percentage: number) => string;
    /** Function to get description based on availability percentage */
    readonly getAvailabilityDescription: (percentage: number) => string;
    /** Function to get variant based on availability percentage */
    readonly getAvailabilityVariant: (percentage: number) => "success" | "warning" | "danger";
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
    /** Whether advanced metrics are currently shown */
    readonly showAdvancedMetrics: boolean;
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
    chartTimeRange,
    doughnutOptions,
    downCount,
    downtimePeriods,
    formatDuration,
    formatResponseTime,
    getAvailabilityColor,
    getAvailabilityDescription,
    getAvailabilityVariant,
    lineChartData,
    lineChartOptions,
    monitorType,
    mttr,
    p50,
    p95,
    p99,
    setShowAdvancedMetrics,
    showAdvancedMetrics,
    totalChecks,
    totalDowntime,
    upCount,
    uptime,
    uptimeChartData,
}: AnalyticsTabProps) {
    return (
        <div className="space-y-6">
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ThemedBox
                    surface="base"
                    padding="lg"
                    border
                    rounded="lg"
                    className="flex flex-col items-center text-center"
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
                        className="flex flex-col items-center text-center"
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
                    className="flex flex-col items-center text-center"
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

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col items-center text-center">
                            <ThemedText size="sm" variant="secondary" className="mb-4">
                                P50
                            </ThemedText>
                            <ThemedText size="lg" weight="medium">
                                {formatResponseTime(p50)}
                            </ThemedText>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <ThemedText size="sm" variant="secondary" className="mb-4">
                                P95
                            </ThemedText>
                            <ThemedText size="lg" weight="medium">
                                {formatResponseTime(p95)}
                            </ThemedText>
                        </div>
                        <div className="flex flex-col items-center text-center">
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
                            <div className="flex flex-col items-center text-center">
                                <ThemedText size="sm" variant="secondary" className="mb-4">
                                    Mean Time To Recovery
                                </ThemedText>
                                <ThemedText size="lg" weight="medium">
                                    {formatDuration(mttr)}
                                </ThemedText>
                            </div>
                            <div className="flex flex-col items-center text-center">
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Response Time Chart */}
                {(monitorType === "http" || monitorType === "port") && (
                    <ThemedBox surface="base" padding="md" border rounded="lg">
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
                    </ThemedBox>
                )}

                {/* Uptime Doughnut Chart */}
                <ThemedBox surface="base" padding="md" border rounded="lg">
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
                </ThemedBox>

                {/* Status Distribution Bar Chart */}
                <ThemedBox surface="base" padding="md" border rounded="lg" className="lg:col-span-2">
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
                </ThemedBox>
            </div>
        </div>
    );
}
