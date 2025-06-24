import { useMemo } from "react";
import { CHART_TIME_PERIODS } from "../constants";
/**
 * Advanced hook for monitor analytics calculations
 * Memoizes expensive calculations and provides comprehensive metrics
 */
export function useSiteAnalytics(monitor, timeRange = "24h") {
    return useMemo(() => {
        // Defensive: handle undefined monitor
        const history = monitor?.history ?? [];
        // Filter history based on time range
        const now = Date.now();
        const cutoff = now - CHART_TIME_PERIODS[timeRange];
        const filteredHistory = history.filter((record) => record.timestamp >= cutoff);
        const totalChecks = filteredHistory.length;
        const upCount = filteredHistory.filter((h) => h.status === "up").length;
        const downCount = filteredHistory.filter((h) => h.status === "down").length;
        // Basic metrics
        const uptime = totalChecks > 0 ? ((upCount / totalChecks) * 100).toFixed(2) : "0";
        const avgResponseTime = totalChecks > 0 ? Math.round(filteredHistory.reduce((sum, h) => sum + h.responseTime, 0) / totalChecks) : 0;
        // Performance metrics
        const responseTimes = filteredHistory.map((h) => h.responseTime);
        const fastestResponse = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
        const slowestResponse = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
        // Calculate percentiles
        const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
        const getPercentile = (p) => {
            const index = Math.floor(sortedResponseTimes.length * p);
            return sortedResponseTimes[index] || 0;
        };
        const p50 = getPercentile(0.5);
        const p95 = getPercentile(0.95);
        const p99 = getPercentile(0.99);
        // Calculate downtime periods
        const downtimePeriods = [];
        let currentDowntime = null;
        // Process in reverse chronological order for proper downtime calculation
        for (const record of [...filteredHistory].reverse()) {
            if (record.status === "down") {
                if (!currentDowntime) {
                    currentDowntime = {
                        start: record.timestamp,
                        end: record.timestamp,
                        duration: 0,
                    };
                }
                else {
                    currentDowntime.end = record.timestamp;
                }
            }
            else if (currentDowntime) {
                currentDowntime.duration = currentDowntime.end - currentDowntime.start;
                downtimePeriods.push(currentDowntime);
                currentDowntime = null;
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
            totalChecks,
            upCount,
            downCount,
            uptime,
            avgResponseTime,
            fastestResponse,
            slowestResponse,
            p50,
            p95,
            p99,
            downtimePeriods,
            totalDowntime,
            mttr,
            incidentCount: downtimePeriods.length,
            filteredHistory,
        };
    }, [monitor?.history, timeRange]);
}
/**
 * Hook for generating chart data
 * Separates data preparation from component logic
 */
export function useChartData(monitor, theme) {
    return useMemo(() => {
        const sortedHistory = [...monitor.history].sort((a, b) => a.timestamp - b.timestamp);
        const lineChartData = {
            datasets: [
                {
                    label: "Response Time",
                    data: sortedHistory.map((record) => ({
                        x: record.timestamp,
                        y: record.responseTime,
                    })),
                    borderColor: theme.colors.primary[500],
                    backgroundColor: `${theme.colors.primary[500]}20`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    pointBackgroundColor: sortedHistory.map((record) => record.status === "up" ? theme.colors.success : theme.colors.error),
                    pointBorderColor: sortedHistory.map((record) => record.status === "up" ? theme.colors.success : theme.colors.error),
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
        return { lineChartData };
    }, [monitor.history, theme]);
}
/**
 * Utility functions for common calculations
 */
export const SiteAnalyticsUtils = {
    /**
     * Get availability status based on uptime percentage
     */
    getAvailabilityStatus(uptime) {
        if (uptime >= 99.9)
            return "excellent";
        if (uptime >= 99)
            return "good";
        if (uptime >= 95)
            return "warning";
        return "critical";
    },
    /**
     * Get performance status based on response time
     */
    getPerformanceStatus(responseTime) {
        if (responseTime <= 200)
            return "excellent";
        if (responseTime <= 500)
            return "good";
        if (responseTime <= 1000)
            return "warning";
        return "critical";
    },
    /**
     * Calculate SLA compliance
     */
    calculateSLA(uptime, targetSLA = 99.9) {
        const compliant = uptime >= targetSLA;
        const deficit = Math.max(0, targetSLA - uptime);
        const allowedDowntime = (100 - targetSLA) / 100;
        const actualDowntime = (100 - uptime) / 100;
        return {
            compliant,
            deficit,
            allowedDowntime,
            actualDowntime,
        };
    },
};
