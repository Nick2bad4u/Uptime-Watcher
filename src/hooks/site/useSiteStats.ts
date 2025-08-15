/**
 * Site statistics calculation hook. Provides utilities for computing uptime,
 * response time averages, and check counts from monitor history data.
 */

import type { StatusHistory } from "@shared/types";

import { useMemo } from "react";

/**
 * Interface for site statistics data
 *
 * @remarks
 * All values are computed from StatusHistory records:
 *
 * - Uptime: Integer percentage (0-100) based on status="up" ratio
 * - CheckCount: Total number of history records processed
 * - AverageResponseTime: Mean response time for successful checks only
 *
 * @public
 */
export interface SiteStats {
    /**
     * Average response time in milliseconds (only for successful "up" checks)
     */
    averageResponseTime: number;
    /** Total number of checks performed */
    checkCount: number;
    /** Uptime percentage as integer (0-100) */
    uptime: number;
}

/**
 * Custom hook to calculate statistics based on a monitor's history
 *
 * @remarks
 * This hook provides memoized statistical calculations for monitor performance
 * analysis. It handles edge cases including:
 *
 * - Empty history arrays (returns zero values safely)
 * - Records without response times (filters them out of average calculation)
 * - Mixed status records (separates up/down for accurate uptime calculation)
 *
 * The uptime calculation uses integer percentage (0-100) for display
 * consistency. Average response time only includes successful "up" checks with
 * valid response times. All calculations are memoized to prevent unnecessary
 * recalculation on each render.
 *
 * @example
 *
 * ```tsx
 * function MonitorStats({ monitor }) {
 *   const { uptime, checkCount, averageResponseTime } = useSiteStats(monitor.history);
 *
 *   return (
 *     <div>
 *       <p>Uptime: {uptime}% ({checkCount} checks)</p>
 *       <p>Avg Response: {averageResponseTime}ms</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param history - StatusHistory[] - Array of status history records for
 *   calculation
 *
 * @returns Object containing calculated statistics (uptime, checkCount,
 *   averageResponseTime)
 *
 * @see {@link SiteStats} for the complete interface specification
 */
export function useSiteStats(history: StatusHistory[]): SiteStats {
    // Memoize the calculations to avoid recalculating on every render
    return useMemo(() => {
        if (history.length === 0) {
            return {
                averageResponseTime: 0,
                checkCount: 0,
                uptime: 0,
            };
        }

        const checkCount = history.length;

        // Calculate uptime percentage
        const upCount = history.filter(
            (record) => record.status === "up"
        ).length;
        const uptime = Math.round((upCount / checkCount) * 100);

        // Calculate average response time (only for successful "up" checks)
        const upRecordsWithResponseTime = history.filter(
            (record) =>
                record.status === "up" &&
                typeof record.responseTime === "number" &&
                record.responseTime > 0
        );
        const averageResponseTime =
            upRecordsWithResponseTime.length > 0
                ? Math.round(
                      upRecordsWithResponseTime.reduce(
                          (sum, record) => sum + record.responseTime,
                          0
                      ) / upRecordsWithResponseTime.length
                  )
                : 0;

        return {
            averageResponseTime,
            checkCount,
            uptime,
        };
    }, [history]);
}
