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

import { STATUS_HISTORY_VALUES } from "@shared/types";
import { typedObjectKeys } from "@shared/utils/objectSafety";
import { useMemo } from "react";
import {
    arrayIncludes,
    isDefined,
    isFinite as isFiniteNumber,
} from "ts-extras";

import { CHART_TIME_PERIODS } from "../../constants";
import { isValidHistoryTimestamp } from "../../utils/monitoring/monitorHistoryTime";
import { TIME_PERIOD_LABELS, type TimePeriod } from "../../utils/time";

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

const createDowntimePeriod = (start: number, end: number): DowntimePeriod => ({
    duration: end - start,
    end,
    start,
});

function isAnalyticsHistoryRecord(record: StatusHistory): boolean {
    return (
        isValidHistoryTimestamp(record.timestamp) &&
        isFiniteNumber(record.responseTime) &&
        record.responseTime >= -1 &&
        arrayIncludes(STATUS_HISTORY_VALUES, record.status)
    );
}

function isResponseTimeHistoryRecord(record: StatusHistory): boolean {
    return isAnalyticsHistoryRecord(record) && record.responseTime >= 0;
}

const isActiveDowntimeWindow = (args: {
    downtimeEnd: number | undefined;
    downtimeStart: number | undefined;
}): args is {
    downtimeEnd: number;
    downtimeStart: number;
} => isDefined(args.downtimeEnd) && isDefined(args.downtimeStart);

const startOrExtendDowntimeWindow = (args: {
    downtimeStart: number | undefined;
    record: StatusHistory;
}): {
    downtimeEnd: number;
    downtimeStart: number;
} => ({
    downtimeEnd: args.record.timestamp,
    downtimeStart: args.downtimeStart ?? args.record.timestamp,
});

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
    /** Filtered history entries used for analytics */
    filteredHistory: readonly StatusHistory[];
    /** Number of separate downtime incidents */
    incidentCount: number;
    /** Mean Time To Recovery in milliseconds */
    mttr: number;
    /** Response time percentiles */
    percentileMetrics: {
        p50: number;
        p95: number;
        p99: number;
    };
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
    filteredHistory: readonly StatusHistory[]
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
    filteredHistory: readonly StatusHistory[]
): DowntimePeriod[] {
    const downtimePeriods: DowntimePeriod[] = [];
    let downtimeEnd: number | undefined;
    let downtimeStart: number | undefined;

    for (const record of filteredHistory) {
        if (record.status === "down") {
            const {
                downtimeEnd: nextDowntimeEnd,
                downtimeStart: nextDowntimeStart,
            } = startOrExtendDowntimeWindow({
                downtimeStart,
                record,
            });
            downtimeEnd = nextDowntimeEnd;
            downtimeStart = nextDowntimeStart;
        } else {
            const activeDowntimeWindow = { downtimeEnd, downtimeStart };
            if (isActiveDowntimeWindow(activeDowntimeWindow)) {
                downtimePeriods.push(
                    createDowntimePeriod(
                        activeDowntimeWindow.downtimeStart,
                        record.timestamp
                    )
                );

                downtimeEnd = undefined;
                downtimeStart = undefined;
            }
        }
    }

    // Handle ongoing downtime (reached end of history while in downtime)
    const remainingDowntimeWindow = { downtimeEnd, downtimeStart };
    if (isActiveDowntimeWindow(remainingDowntimeWindow)) {
        const period = createDowntimePeriod(
            remainingDowntimeWindow.downtimeStart,
            remainingDowntimeWindow.downtimeEnd
        );
        downtimePeriods.push(period);
    }

    return downtimePeriods;
}

/**
 * Calculate response time metrics including percentiles.
 *
 * @internal
 */
function calculateResponseMetrics(filteredHistory: readonly StatusHistory[]): {
    fastestResponse: number;
    percentileMetrics: {
        p50: number;
        p95: number;
        p99: number;
    };
    slowestResponse: number;
} {
    const responseTimes = filteredHistory.map((h) => h.responseTime);
    const fastestResponse =
        responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestResponse =
        responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    // Calculate percentiles
    const sortedResponseTimes = [...responseTimes].toSorted((a, b) => a - b);
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
        percentileMetrics: {
            p50: getPercentile(0.5),
            p95: getPercentile(0.95),
            p99: getPercentile(0.99),
        },
        slowestResponse,
    };
}

/**
 * Filter history records based on time range.
 *
 * @internal
 */
function filterHistoryByTimeRange(
    history: readonly StatusHistory[],
    timeRange: TimePeriod
): StatusHistory[] {
    const now = Date.now();
    // Sanitize timeRange to prevent object injection
    const allowedTimeRanges = typedObjectKeys(TIME_PERIOD_LABELS);
    const safeTimeRange = arrayIncludes(allowedTimeRanges, timeRange)
        ? timeRange
        : "24h";

    const cutoff = now - CHART_TIME_PERIODS[safeTimeRange];
    return history.filter(
        (record) =>
            isAnalyticsHistoryRecord(record) && record.timestamp >= cutoff
    );
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
        const responseTimeHistory = filteredHistory.filter(
            isResponseTimeHistoryRecord
        );
        const chronologicalHistory = filteredHistory.toSorted(
            (a, b) => a.timestamp - b.timestamp
        );

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
        const avgResponseTime =
            calculateAverageResponseTime(responseTimeHistory);

        // Performance metrics
        const responseMetrics = calculateResponseMetrics(responseTimeHistory);

        // Calculate downtime periods
        const downtimePeriods = calculateDowntimePeriods(chronologicalHistory);
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
