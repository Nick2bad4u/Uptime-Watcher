/**
 * Custom hook for calculating comprehensive site analytics and metrics
 *
 * Provides detailed analytics for a monitor including uptime percentages,
 * response time statistics, downtime analysis, and reliability metrics.
 * All calculations are memoized for performance optimization.
 */

import { useMemo } from "react";

import type { Theme } from "../../theme/types";

import { CHART_TIME_PERIODS } from "../../constants";
import { Monitor, StatusHistory } from "../../types";
import { TIME_PERIOD_LABELS, type TimePeriod } from "../../utils/time";

/** Chart data structure for line charts */
export interface ChartData {
    lineChartData: {
        datasets: Array<{
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
            data: Array<{
                x: number;
                y: number;
            }>;
            fill: boolean;
            label: string;
            pointBackgroundColor: string[];
            pointBorderColor: string[];
            pointHoverRadius: number;
            pointRadius: number;
            tension: number;
        }>;
    };
}

/** Represents a period of downtime with start, end, and duration */
export interface DowntimePeriod {
    /** Duration of downtime in milliseconds */
    duration: number;
    /** Timestamp when downtime ended */
    end: number;
    /** Timestamp when downtime started */
    start: number;
}

/** Comprehensive analytics data for a site monitor */
export interface SiteAnalytics {
    /** Average response time in milliseconds */
    avgResponseTime: number;
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
 * Hook for generating chart data
 * Separates data preparation from component logic
 */
export function useChartData(monitor: Monitor, theme: Theme): ChartData {
    return useMemo(() => {
        const sortedHistory = Array.from(monitor.history).sort((a, b) => a.timestamp - b.timestamp);

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
                        record.status === "up" ? theme.colors.success : theme.colors.error
                    ),
                    pointBorderColor: sortedHistory.map((record) =>
                        record.status === "up" ? theme.colors.success : theme.colors.error
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
 * @param monitor - The monitor to analyze (can be undefined)
 * @param timeRange - Time period to analyze (defaults to "24h")
 * @returns Comprehensive analytics object with all calculated metrics
 * @see {@link SiteAnalytics} for the complete interface specification
 *
 * @example
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
 */
export function useSiteAnalytics(monitor: Monitor | undefined, timeRange: TimePeriod = "24h"): SiteAnalytics {
    return useMemo(() => {
        // Defensive: handle undefined monitor
        const history = monitor?.history ?? [];
        // Filter history based on time range
        const filteredHistory = filterHistoryByTimeRange(history, timeRange);

        const totalChecks = filteredHistory.length;
        const upCount = filteredHistory.filter((h) => h.status === "up").length;
        const downCount = filteredHistory.filter((h) => h.status === "down").length;

        // Basic metrics
        const uptimeRaw = totalChecks > 0 ? (upCount / totalChecks) * 100 : 0;
        const uptime = uptimeRaw.toFixed(2);
        const avgResponseTime = calculateAverageResponseTime(filteredHistory);

        // Performance metrics
        const responseMetrics = calculateResponseMetrics(filteredHistory);

        // Calculate downtime periods
        const downtimePeriods = calculateDowntimePeriods(filteredHistory);
        const totalDowntime = downtimePeriods.reduce((sum, period) => sum + period.duration, 0);
        const mttr = downtimePeriods.length > 0 ? totalDowntime / downtimePeriods.length : 0;

        return {
            avgResponseTime,
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
 * Utility functions for common calculations
 */
export const SiteAnalyticsUtils = {
    /**
     * Calculate SLA compliance
     */
    calculateSLA(
        uptime: number,
        targetSLA = 99.9
    ): {
        actualDowntime: number;
        allowedDowntime: number;
        compliant: boolean;
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
     * Get availability status based on uptime percentage
     *
     * @param uptime - Uptime percentage (0-100)
     * @returns Status level based on uptime thresholds
     *
     * @remarks
     * Thresholds: ≥99.9% = excellent, ≥99% = good, ≥95% = warning, \<95% = critical
     */
    getAvailabilityStatus(uptime: number): "critical" | "excellent" | "good" | "warning" {
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
     * Get performance status based on response time
     *
     * @param responseTime - Average response time in milliseconds
     * @returns Status level based on response time thresholds
     *
     * @remarks
     * Thresholds: ≤200ms = excellent, ≤500ms = good, ≤1000ms = warning, \>1000ms = critical
     */
    getPerformanceStatus(responseTime: number): "critical" | "excellent" | "good" | "warning" {
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

/**
 * Calculate average response time from filtered history
 */
function calculateAverageResponseTime(filteredHistory: StatusHistory[]): number {
    const totalChecks = filteredHistory.length;
    return totalChecks > 0 ? Math.round(filteredHistory.reduce((sum, h) => sum + h.responseTime, 0) / totalChecks) : 0;
}

/**
 * Calculate downtime periods from filtered history
 */
function calculateDowntimePeriods(filteredHistory: StatusHistory[]): DowntimePeriod[] {
    const downtimePeriods: DowntimePeriod[] = [];
    let downtimeEnd: number | undefined; // Most recent "down" timestamp
    let downtimeStart: number | undefined; // Earliest "down" timestamp in the period

    // Process in reverse chronological order (newest to oldest)
    for (let i = filteredHistory.length - 1; i >= 0; i--) {
        const record = filteredHistory[i];
        if (!record) {
            continue; // Skip if record is undefined
        }

        if (record.status === "down") {
            if (downtimeEnd === undefined) {
                // This is the first "down" we've encountered, so it's the END of the period
                downtimeEnd = record.timestamp;
                downtimeStart = record.timestamp;
            } else {
                // We're extending the downtime period backwards
                downtimeStart = record.timestamp;
            }
        } else if (downtimeEnd !== undefined && downtimeStart !== undefined) {
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
 * Calculate response time metrics including percentiles
 */
function calculateResponseMetrics(filteredHistory: StatusHistory[]): {
    fastestResponse: number;
    p50: number;
    p95: number;
    p99: number;
    slowestResponse: number;
} {
    const responseTimes = filteredHistory.map((h) => h.responseTime);
    const fastestResponse = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestResponse = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    // Calculate percentiles
    const sortedResponseTimes = Array.from(responseTimes).sort((a, b) => a - b);
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
 * Filter history records based on time range
 */
function filterHistoryByTimeRange(history: StatusHistory[], timeRange: TimePeriod): StatusHistory[] {
    const now = Date.now();
    // Sanitize timeRange to prevent object injection
    const allowedTimeRanges = Object.keys(TIME_PERIOD_LABELS) as TimePeriod[];
    const safeTimeRange = allowedTimeRanges.includes(timeRange) ? timeRange : "24h";

    const cutoff = now - CHART_TIME_PERIODS[safeTimeRange];
    return history.filter((record) => record.timestamp >= cutoff);
}
