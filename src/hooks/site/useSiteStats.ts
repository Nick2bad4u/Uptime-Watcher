/**
 * Site statistics calculation hook.
 * Provides utilities for computing uptime, response time averages,
 * and check counts from monitor history data.
 */

import { useMemo } from "react";

import { StatusHistory } from "../../types";

interface SiteStats {
    averageResponseTime: number;
    checkCount: number;
    uptime: number;
}

/**
 * Custom hook to calculate statistics based on a monitor's history
 *
 * @param history - Array of status history records
 * @returns Object containing calculated statistics (uptime, checkCount, averageResponseTime)
 */
export function useSiteStats(history: StatusHistory[]): SiteStats {
    // Memoize the calculations to avoid recalculating on every render
    return useMemo(() => {
        if (!history || history.length === 0) {
            return {
                averageResponseTime: 0,
                checkCount: 0,
                uptime: 0,
            };
        }

        const checkCount = history.length;

        // Calculate uptime percentage
        const upCount = history.filter((record) => record.status === "up").length;
        const uptime = Math.round((upCount / checkCount) * 100);

        // Calculate average response time
        const validResponseTimes = history.filter((record) => typeof record.responseTime === "number");
        const averageResponseTime =
            validResponseTimes.length > 0
                ? Math.round(
                      validResponseTimes.reduce((sum, record) => sum + (record.responseTime || 0), 0) /
                          validResponseTimes.length
                  )
                : 0;

        return {
            averageResponseTime,
            checkCount,
            uptime,
        };
    }, [history]);
}
