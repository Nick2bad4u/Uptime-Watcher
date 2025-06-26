"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.SiteAnalyticsUtils = exports.useChartData = exports.useSiteAnalytics = void 0;
var react_1 = require("react");
var constants_1 = require("../constants");
var time_1 = require("../utils/time");
/**
 * Advanced hook for monitor analytics calculations
 * Memoizes expensive calculations and provides comprehensive metrics
 */
function useSiteAnalytics(monitor, timeRange) {
    if (timeRange === void 0) { timeRange = "24h"; }
    return react_1.useMemo(function () {
        var _a;
        // Defensive: handle undefined monitor
        var history = (_a = monitor === null || monitor === void 0 ? void 0 : monitor.history) !== null && _a !== void 0 ? _a : [];
        // Filter history based on time range
        var now = Date.now();
        // Sanitize timeRange to prevent object injection
        var allowedTimeRanges = Object.keys(time_1.TIME_PERIOD_LABELS);
        var safeTimeRange = allowedTimeRanges.includes(timeRange) ? timeRange : "24h";
        // eslint-disable-next-line security/detect-object-injection -- false positive: safeTimeRange is validated against allowedTimeRanges
        var cutoff = now - constants_1.CHART_TIME_PERIODS[safeTimeRange];
        var filteredHistory = history.filter(function (record) { return record.timestamp >= cutoff; });
        var totalChecks = filteredHistory.length;
        var upCount = filteredHistory.filter(function (h) { return h.status === "up"; }).length;
        var downCount = filteredHistory.filter(function (h) { return h.status === "down"; }).length;
        // Basic metrics
        var uptime = totalChecks > 0 ? ((upCount / totalChecks) * 100).toFixed(2) : "0";
        var avgResponseTime = totalChecks > 0 ? Math.round(filteredHistory.reduce(function (sum, h) { return sum + h.responseTime; }, 0) / totalChecks) : 0;
        // Performance metrics
        var responseTimes = filteredHistory.map(function (h) { return h.responseTime; });
        var fastestResponse = responseTimes.length > 0 ? Math.min.apply(Math, responseTimes) : 0;
        var slowestResponse = responseTimes.length > 0 ? Math.max.apply(Math, responseTimes) : 0;
        // Calculate percentiles
        var sortedResponseTimes = __spreadArrays(responseTimes).sort(function (a, b) { return a - b; });
        var getPercentile = function (p) {
            // Ensure p is between 0 and 1
            var safeP = Math.max(0, Math.min(1, p));
            var arrLen = sortedResponseTimes.length;
            if (arrLen === 0)
                return 0;
            var idx = Math.floor(arrLen * safeP);
            var safeIdx = Math.max(0, Math.min(idx, arrLen - 1));
            // eslint-disable-next-line security/detect-object-injection -- safeIdx is validated and sanitized
            return sortedResponseTimes[safeIdx];
        };
        var p50 = getPercentile(0.5);
        var p95 = getPercentile(0.95);
        var p99 = getPercentile(0.99);
        // Calculate downtime periods
        var downtimePeriods = [];
        // eslint-disable-next-line functional/no-let -- this is necessary for mutable state
        var currentDowntime = undefined;
        // Process in reverse chronological order for proper downtime calculation
        for (var _i = 0, _b = __spreadArrays(filteredHistory).reverse(); _i < _b.length; _i++) {
            var record = _b[_i];
            if (record.status === "down") {
                if (!currentDowntime) {
                    currentDowntime = {
                        duration: 0,
                        end: record.timestamp,
                        start: record.timestamp
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
        var totalDowntime = downtimePeriods.reduce(function (sum, period) { return sum + period.duration; }, 0);
        var mttr = downtimePeriods.length > 0 ? totalDowntime / downtimePeriods.length : 0;
        return {
            avgResponseTime: avgResponseTime,
            downCount: downCount,
            downtimePeriods: downtimePeriods,
            fastestResponse: fastestResponse,
            filteredHistory: filteredHistory,
            incidentCount: downtimePeriods.length,
            mttr: mttr,
            p50: p50,
            p95: p95,
            p99: p99,
            slowestResponse: slowestResponse,
            totalChecks: totalChecks,
            totalDowntime: totalDowntime,
            upCount: upCount,
            uptime: uptime
        };
    }, [monitor === null || monitor === void 0 ? void 0 : monitor.history, timeRange]);
}
exports.useSiteAnalytics = useSiteAnalytics;
/**
 * Hook for generating chart data
 * Separates data preparation from component logic
 */
function useChartData(monitor, theme) {
    return react_1.useMemo(function () {
        var sortedHistory = __spreadArrays(monitor.history).sort(function (a, b) { return a.timestamp - b.timestamp; });
        var lineChartData = {
            datasets: [
                {
                    backgroundColor: theme.colors.primary[500] + "20",
                    borderColor: theme.colors.primary[500],
                    borderWidth: 2,
                    data: sortedHistory.map(function (record) { return ({
                        x: record.timestamp,
                        y: record.responseTime
                    }); }),
                    fill: true,
                    label: "Response Time",
                    pointBackgroundColor: sortedHistory.map(function (record) {
                        return record.status === "up" ? theme.colors.success : theme.colors.error;
                    }),
                    pointBorderColor: sortedHistory.map(function (record) {
                        return record.status === "up" ? theme.colors.success : theme.colors.error;
                    }),
                    pointHoverRadius: 6,
                    pointRadius: 4,
                    tension: 0.1
                },
            ]
        };
        return { lineChartData: lineChartData };
    }, [monitor.history, theme]);
}
exports.useChartData = useChartData;
/**
 * Utility functions for common calculations
 */
exports.SiteAnalyticsUtils = {
    /**
     * Calculate SLA compliance
     */
    calculateSLA: function (uptime, targetSLA) {
        if (targetSLA === void 0) { targetSLA = 99.9; }
        var compliant = uptime >= targetSLA;
        var deficit = Math.max(0, targetSLA - uptime);
        var allowedDowntime = (100 - targetSLA) / 100;
        var actualDowntime = (100 - uptime) / 100;
        return {
            actualDowntime: actualDowntime,
            allowedDowntime: allowedDowntime,
            compliant: compliant,
            deficit: deficit
        };
    },
    /**
     * Get availability status based on uptime percentage
     */
    getAvailabilityStatus: function (uptime) {
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
    getPerformanceStatus: function (responseTime) {
        if (responseTime <= 200)
            return "excellent";
        if (responseTime <= 500)
            return "good";
        if (responseTime <= 1000)
            return "warning";
        return "critical";
    }
};
