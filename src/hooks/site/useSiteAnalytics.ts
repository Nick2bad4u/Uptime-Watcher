/**
 * Custom hook for calculating comprehensive site analytics and metrics
 *
 * Provides detailed analytics for a monitor including uptime percentages,
 * response time statistics, downtime analysis, and reliability metrics. All
 * calculations are memoized for performance optimization.
 *
 * @public
 */

import type { Monitor, StatusHistory } from "@shared/types";

import { useMemo } from "react";

import type { Theme } from "../../theme/types";

import { CHART_TIME_PERIODS } from "../../constants";
import { TIME_PERIOD_LABELS, type TimePeriod } from "../../utils/time";

/**
 * Chart data structure for line charts.
 *
 * @public
 */
export interface ChartData {
    /** Chart.js compatible line chart data configuration */
    lineChartData: {
        /** Array of datasets for the chart */
        datasets: Array<{
            /** Background color for data points */
            backgroundColor: string;
            /** Border color for the line */
            borderColor: string;
            /** Width of the line border */
            borderWidth: number;
            /** Array of data points with x,y coordinates */
            data: Array<{
                /** X-axis value (typically timestamp) */
                x: number;
                /** Y-axis value (typically response time or status) */
                y: number;
            }>;
            /** Whether to fill the area under the line */
            fill: boolean;
            /** Label for the dataset in legend */
            label: string;
            /** Background colors for individual data points */
            pointBackgroundColor: string[];
            /** Border colors for individual data points */
            pointBorderColor: string[];
            /** Radius of data points when hovered */
            pointHoverRadius: number;
            /** Radius of data points in normal state */
            pointRadius: number;
            /** Curve tension for the line (0 = straight, 1 = curved) */
            tension: number;
        }>;
    };
}

/**
 * Represents a period of downtime with start, end, and duration.
 *
 * @public
 */
export interface DowntimePeriod {
    /** Duration of downtime in milliseconds */
    duration: number;
    /** Timestamp when downtime ended */
    end: number;
    /** Timestamp when downtime started */
    start: number;
}

/**
 * Comprehensive analytics data for a site monitor.
 *
 * @public
 */
export interface SiteAnalytics {
    /** Average response time in milliseconds */
    avgResponseTime: number;
    /** Number of degraded checks */
    degradedCount: number;
    /** Number of failed checks */
    downCount: number;
    /** Array of downtime periods */
    downtimePeriods: DowntimePeriod[];
    /** Fastest response time recorded */
    fastestResponse: number;
    /** Status history filtered by time range */
    filteredHistory: StatusHistory[];
    /** Number of separate downtime incidents */
    incidentCount: number;
    /** Mean Time To Recovery in milliseconds */
    mttr: number;
    /** 50th percentile response time */
    p50: number;
    /** 95th percentile response time */
    p95: number;
    /** 99th percentile response time */
    p99: number;
    /** Slowest response time recorded */
    slowestResponse: number;
    /** Total number of checks performed */
    totalChecks: number;
    /** Total downtime in milliseconds */
    totalDowntime: number;
    /** Number of successful checks */
    upCount: number;
    /** Uptime percentage as formatted string */
    uptime: string;
    /** Raw uptime percentage as number for calculations */
    uptimeRaw: number;
}

/**
 * Calculate average response time from filtered history.
 *
 * @internal
 */
function calculateAverageResponseTime(
    filteredHistory: StatusHistory[]
): number {
    const totalChecks = filteredHistory.length;
    return totalChecks > 0
        ? Math.round(
              filteredHistory.reduce((sum, h) => sum + h.responseTime, 0) /
                  totalChecks
          )
        : 0;
}

/**
 * Calculate downtime periods from filtered history.
 *
 * @internal
 */
function calculateDowntimePeriods(
    filteredHistory: StatusHistory[]
): DowntimePeriod[] {
    const downtimePeriods: DowntimePeriod[] = [];
    let downtimeEnd: number | undefined = undefined; // Most recent "down" timestamp
    let downtimeStart: number | undefined = undefined; // Earliest "down" timestamp in the period

    // Process in reverse chronological order (newest to oldest)
    for (let i = filteredHistory.length - 1; i >= 0; i--) {
        const record = filteredHistory[i];
        if (record) {
            // Process only if record is defined
            if (record.status === "down") {
                if (downtimeEnd === undefined) {
                    // This is the first "down" we've encountered, so it's the
                    // END of the period
                    downtimeEnd = record.timestamp;
                    downtimeStart = record.timestamp;
                } else {
                    // We're extending the downtime period backwards
                    downtimeStart = record.timestamp;
                }
            } else if (
                downtimeEnd !== undefined &&
                downtimeStart !== undefined
            ) {
                // We hit an "up" status, so the downtime period is complete
                const period: DowntimePeriod = {
                    duration: downtimeEnd - downtimeStart,
                    end: downtimeEnd,
                    start: downtimeStart,
                };
                downtimePeriods.push(period);

                // Reset for next period
                downtimeEnd = undefined;
                downtimeStart = undefined;
            }
        }
    }

    // Handle ongoing downtime (reached end of history while in downtime)
    if (downtimeEnd !== undefined && downtimeStart !== undefined) {
        const period: DowntimePeriod = {
            duration: downtimeEnd - downtimeStart,
            end: downtimeEnd,
            start: downtimeStart,
        };
        downtimePeriods.push(period);
    }

    return downtimePeriods;
}

/**
 * Calculate response time metrics including percentiles.
 *
 * @internal
 */
function calculateResponseMetrics(filteredHistory: StatusHistory[]): {
    fastestResponse: number;
    p50: number;
    p95: number;
    p99: number;
    slowestResponse: number;
} {
    const responseTimes = filteredHistory.map((h) => h.responseTime);
    const fastestResponse =
        responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestResponse =
        responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    // Calculate percentiles
    const sortedResponseTimes = Array.from(responseTimes).toSorted(
        (a, b) => a - b
    );
    const getPercentile = (p: number): number => {
        // Ensure p is between 0 and 1
        const safeP = Math.max(0, Math.min(1, p));
        const arrayLength = sortedResponseTimes.length;
        if (arrayLength === 0) {
            return 0;
        }
        const index = Math.floor(arrayLength * safeP);
        const safeIndex = Math.max(0, Math.min(index, arrayLength - 1));

        return sortedResponseTimes[safeIndex] ?? 0;
    };

    return {
        fastestResponse,
        p50: getPercentile(0.5),
        p95: getPercentile(0.95),
        p99: getPercentile(0.99),
        slowestResponse,
    };
}

/**
 * Filter history records based on time range.
 *
 * @internal
 */
function filterHistoryByTimeRange(
    history: StatusHistory[],
    timeRange: TimePeriod
): StatusHistory[] {
    const now = Date.now();
    // Sanitize timeRange to prevent object injection
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Object.keys() with known typed object structure
    const allowedTimeRanges = Object.keys(TIME_PERIOD_LABELS) as TimePeriod[];
    const safeTimeRange = allowedTimeRanges.includes(timeRange)
        ? timeRange
        : "24h";

    const cutoff = now - CHART_TIME_PERIODS[safeTimeRange];
    return history.filter((record) => record.timestamp >= cutoff);
}

/**
 * Generates chart-ready datasets for a site's monitor history.
 *
 * @remarks
 * Separates data preparation from component logic and applies theme-aware
 * styling to the resulting Chart.js configuration.
 *
 * @param monitor - Monitor whose history should populate the chart.
 * @param theme - Theme palette used to style the datasets.
 *
 * @returns {@link ChartData} Suitable for Chart.js line charts.
 *
 * @public
 */
export function useChartData(monitor: Monitor, theme: Theme): ChartData {
    return useMemo(() => {
        const sortedHistory = Array.from(monitor.history).toSorted(
            (a, b) => a.timestamp - b.timestamp
        );

        const lineChartData = {
            datasets: [
                {
                    backgroundColor: `${theme.colors.primary[500]}20`,
                    borderColor: theme.colors.primary[500],
                    borderWidth: 2,
                    data: sortedHistory.map((record) => ({
                        x: record.timestamp,
                        y: record.responseTime,
                    })),
                    fill: true,
                    label: "Response Time",
                    pointBackgroundColor: sortedHistory.map((record) =>
                        record.status === "up"
                            ? theme.colors.success
                            : theme.colors.error
                    ),
                    pointBorderColor: sortedHistory.map((record) =>
                        record.status === "up"
                            ? theme.colors.success
                            : theme.colors.error
                    ),
                    pointHoverRadius: 6,
                    pointRadius: 4,
                    tension: 0.1,
                },
            ],
        };

        return { lineChartData };
    }, [monitor.history, theme]);
}

/**
 * Hook for calculating comprehensive site analytics and metrics.
 *
 * Performs complex calculations on monitor data to provide detailed insights
 * including uptime statistics, response time analysis, and downtime patterns.
 * All calculations are memoized for optimal performance.
 *
 * @example
 *
 * ```tsx
 * function AnalyticsView({ monitor }) {
 *   const analytics = useSiteAnalytics(monitor, "7d");
 *
 *   return (
 *     <div>
 *       <p>Uptime: {analytics.uptime}</p>
 *       <p>Avg Response: {analytics.avgResponseTime}ms</p>
 *       <p>Incidents: {analytics.incidentCount}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param monitor - Monitor to analyze (can be `undefined`).
 * @param timeRange - Time period to analyze (defaults to `'24h'`).
 *
 * @returns Comprehensive {@link SiteAnalytics} object with all calculated
 *   metrics.
 *
 * @public
 *
 * @see {@link SiteAnalytics} for the complete interface specification.
 * @see {@link useChartData} for chart-friendly transformations.
 */
export function useSiteAnalytics(
    monitor: Monitor | undefined,
    timeRange: TimePeriod = "24h"
): SiteAnalytics {
    return useMemo(() => {
        // Defensive: handle undefined monitor
        const history = monitor?.history ?? [];
        // Filter history based on time range
        const filteredHistory = filterHistoryByTimeRange(history, timeRange);

        const totalChecks = filteredHistory.length;
        const upCount = filteredHistory.filter((h) => h.status === "up").length;
        const downCount = filteredHistory.filter(
            (h) => h.status === "down"
        ).length;
        const degradedCount = filteredHistory.filter(
            (h) => h.status === "degraded"
        ).length;

        // Basic metrics
        const uptimeRaw = totalChecks > 0 ? (upCount / totalChecks) * 100 : 0;
        const uptime = uptimeRaw.toFixed(2);
        const avgResponseTime = calculateAverageResponseTime(filteredHistory);

        // Performance metrics
        const responseMetrics = calculateResponseMetrics(filteredHistory);

        // Calculate downtime periods
        const downtimePeriods = calculateDowntimePeriods(filteredHistory);
        const totalDowntime = downtimePeriods.reduce(
            (sum, period) => sum + period.duration,
            0
        );
        const mttr =
            downtimePeriods.length > 0
                ? totalDowntime / downtimePeriods.length
                : 0;

        return {
            avgResponseTime,
            degradedCount,
            downCount,
            downtimePeriods,
            filteredHistory,
            incidentCount: downtimePeriods.length,
            mttr,
            totalChecks,
            totalDowntime,
            upCount,
            uptime,
            uptimeRaw,
            ...responseMetrics,
        };
    }, [monitor?.history, timeRange]);
}

/**
 * Utility functions for common calculations.
 *
 * @public
 */
export const SiteAnalyticsUtils = {
    /**
     * Calculate SLA compliance.
     *
     * @returns Object describing the SLA compliance evaluation.
     *
     * @public
     */
    calculateSLA(
        uptime: number,
        targetSLA = 99.9
    ): {
        /** Actual downtime percentage (0-1). */
        actualDowntime: number;
        /** Allowed downtime percentage for target SLA (0-1). */
        allowedDowntime: number;
        /** Whether the uptime meets the target SLA. */
        compliant: boolean;
        /** Percentage points below target SLA (0 if compliant). */
        deficit: number;
    } {
        const compliant = uptime >= targetSLA;
        const deficit = Math.max(0, targetSLA - uptime);
        const allowedDowntime = (100 - targetSLA) / 100;
        const actualDowntime = (100 - uptime) / 100;

        return {
            actualDowntime,
            allowedDowntime,
            compliant,
            deficit,
        };
    },
    /**
     * Get availability status based on uptime percentage.
     *
     * @remarks
     * Thresholds: `≥99.9%` = excellent, `≥99%` = good, `≥95%` = warning, `<95%`
     * = critical
     *
     * @param uptime - Uptime percentage (0-100).
     *
     * @returns Status level based on uptime thresholds.
     *
     * @public
     */
    getAvailabilityStatus(
        uptime: number
    ): "critical" | "excellent" | "good" | "warning" {
        if (uptime >= 99.9) {
            return "excellent";
        }
        if (uptime >= 99) {
            return "good";
        }
        if (uptime >= 95) {
            return "warning";
        }
        return "critical";
    },
    /**
     * Get performance status based on response time.
     *
     * @remarks
     * Thresholds: `≤200ms` = excellent, `≤500ms` = good, `≤1000ms` = warning,
     * `>1000ms` = critical
     *
     * @param responseTime - Average response time in milliseconds.
     *
     * @returns Status level based on response time thresholds.
     *
     * @public
     */
    getPerformanceStatus(
        responseTime: number
    ): "critical" | "excellent" | "good" | "warning" {
        if (responseTime <= 200) {
            return "excellent";
        }
        if (responseTime <= 500) {
            return "good";
        }
        if (responseTime <= 1000) {
            return "warning";
        }
        return "critical";
    },
};
