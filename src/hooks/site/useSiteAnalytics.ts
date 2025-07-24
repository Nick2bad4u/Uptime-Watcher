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
}

/**
 * Hook for generating chart data
 * Separates data preparation from component logic
 */
export function useChartData(monitor: Monitor, theme: Theme) {
    return useMemo(() => {
        const sortedHistory = [...monitor.history].sort((a, b) => a.timestamp - b.timestamp);

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
        const now = Date.now();
        // Sanitize timeRange to prevent object injection
        const allowedTimeRanges = Object.keys(TIME_PERIOD_LABELS) as TimePeriod[];
        const safeTimeRange = allowedTimeRanges.includes(timeRange) ? timeRange : "24h";
        // eslint-disable-next-line security/detect-object-injection -- false positive: safeTimeRange is validated against allowedTimeRanges
        const cutoff = now - CHART_TIME_PERIODS[safeTimeRange];
        const filteredHistory = history.filter((record) => record.timestamp >= cutoff);

        const totalChecks = filteredHistory.length;
        const upCount = filteredHistory.filter((h) => h.status === "up").length;
        const downCount = filteredHistory.filter((h) => h.status === "down").length;

        // Basic metrics
        const uptime = totalChecks > 0 ? ((upCount / totalChecks) * 100).toFixed(2) : "0";
        const avgResponseTime =
            totalChecks > 0 ? Math.round(filteredHistory.reduce((sum, h) => sum + h.responseTime, 0) / totalChecks) : 0;

        // Performance metrics
        const responseTimes = filteredHistory.map((h) => h.responseTime);
        const fastestResponse = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
        const slowestResponse = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

        // Calculate percentiles
        const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
        const getPercentile = (p: number): number => {
            // Ensure p is between 0 and 1
            const safeP = Math.max(0, Math.min(1, p));
            const arrayLength = sortedResponseTimes.length;
            if (arrayLength === 0) {
                return 0;
            }
            const index = Math.floor(arrayLength * safeP);
            const safeIndex = Math.max(0, Math.min(index, arrayLength - 1));
            // eslint-disable-next-line security/detect-object-injection -- safeIdx is validated and sanitized
            return sortedResponseTimes[safeIndex] ?? 0;
        };

        const p50 = getPercentile(0.5);
        const p95 = getPercentile(0.95);
        const p99 = getPercentile(0.99);

        // Calculate downtime periods
        const downtimePeriods: DowntimePeriod[] = [];

        let currentDowntime: DowntimePeriod | undefined;

        // Process in reverse chronological order for proper downtime calculation
        for (const record of [...filteredHistory].toReversed()) {
            if (record.status === "down") {
                if (currentDowntime) {
                    currentDowntime.end = record.timestamp;
                } else {
                    currentDowntime = {
                        duration: 0,
                        end: record.timestamp,
                        start: record.timestamp,
                    };
                }
            } else if (currentDowntime) {
                currentDowntime.duration = currentDowntime.end - currentDowntime.start;
                downtimePeriods.push(currentDowntime);
                currentDowntime = undefined;
            }
        }

        // Handle ongoing downtime
        if (currentDowntime) {
            currentDowntime.duration = currentDowntime.end - currentDowntime.start;
            downtimePeriods.push(currentDowntime);
        }

        const totalDowntime = downtimePeriods.reduce((sum, period) => sum + period.duration, 0);
        const mttr = downtimePeriods.length > 0 ? totalDowntime / downtimePeriods.length : 0;

        return {
            avgResponseTime,
            downCount,
            downtimePeriods,
            fastestResponse,
            filteredHistory,
            incidentCount: downtimePeriods.length,
            mttr,
            p50,
            p95,
            p99,
            slowestResponse,
            totalChecks,
            totalDowntime,
            upCount,
            uptime,
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
