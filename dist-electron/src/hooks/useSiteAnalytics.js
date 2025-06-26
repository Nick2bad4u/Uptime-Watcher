"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteAnalyticsUtils = void 0;
exports.useSiteAnalytics = useSiteAnalytics;
exports.useChartData = useChartData;
const react_1 = require("react");
const constants_1 = require("../constants");
const time_1 = require("../utils/time");
/**
 * Advanced hook for monitor analytics calculations
 * Memoizes expensive calculations and provides comprehensive metrics
 */
function useSiteAnalytics(monitor, timeRange = "24h") {
    return (0, react_1.useMemo)(() => {
        // Defensive: handle undefined monitor
        const history = monitor?.history ?? [];
        // Filter history based on time range
        const now = Date.now();
        // Sanitize timeRange to prevent object injection
        const allowedTimeRanges = Object.keys(time_1.TIME_PERIOD_LABELS);
        const safeTimeRange = allowedTimeRanges.includes(timeRange) ? timeRange : "24h";
        // eslint-disable-next-line security/detect-object-injection -- false positive: safeTimeRange is validated against allowedTimeRanges
        const cutoff = now - constants_1.CHART_TIME_PERIODS[safeTimeRange];
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
            // Ensure p is between 0 and 1
            const safeP = Math.max(0, Math.min(1, p));
            const arrLen = sortedResponseTimes.length;
            if (arrLen === 0)
                return 0;
            const idx = Math.floor(arrLen * safeP);
            const safeIdx = Math.max(0, Math.min(idx, arrLen - 1));
            // eslint-disable-next-line security/detect-object-injection -- safeIdx is validated and sanitized
            return sortedResponseTimes[safeIdx];
        };
        const p50 = getPercentile(0.5);
        const p95 = getPercentile(0.95);
        const p99 = getPercentile(0.99);
        // Calculate downtime periods
        const downtimePeriods = [];
        // eslint-disable-next-line functional/no-let -- this is necessary for mutable state
        let currentDowntime = undefined;
        // Process in reverse chronological order for proper downtime calculation
        for (const record of [...filteredHistory].reverse()) {
            if (record.status === "down") {
                if (!currentDowntime) {
                    currentDowntime = {
                        duration: 0,
                        end: record.timestamp,
                        start: record.timestamp,
                    };
                }
                else {
                    currentDowntime.end = record.timestamp;
                }
            }
            else if (currentDowntime) {
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
 * Hook for generating chart data
 * Separates data preparation from component logic
 */
function useChartData(monitor, theme) {
    return (0, react_1.useMemo)(() => {
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
                    pointBackgroundColor: sortedHistory.map((record) => record.status === "up" ? theme.colors.success : theme.colors.error),
                    pointBorderColor: sortedHistory.map((record) => record.status === "up" ? theme.colors.success : theme.colors.error),
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
 * Utility functions for common calculations
 */
exports.SiteAnalyticsUtils = {
    /**
     * Calculate SLA compliance
     */
    calculateSLA(uptime, targetSLA = 99.9) {
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
};
