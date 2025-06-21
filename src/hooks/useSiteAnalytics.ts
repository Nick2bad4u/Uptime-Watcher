import { useMemo } from "react";
import { Site } from "../types";
import { CHART_TIME_PERIODS } from "../constants";

// Enhanced types for better IntelliSense and error catching
export interface DowntimePeriod {
    start: number;
    end: number;
    duration: number;
}

export interface SiteAnalytics {
    // Basic metrics
    totalChecks: number;
    upCount: number;
    downCount: number;
    uptime: string;
    avgResponseTime: number;
    
    // Performance metrics
    fastestResponse: number;
    slowestResponse: number;
    
    // Percentiles
    p50: number;
    p95: number;
    p99: number;
    
    // Reliability metrics
    downtimePeriods: DowntimePeriod[];
    totalDowntime: number;
    mttr: number; // Mean Time To Recovery
    incidentCount: number;
    
    // Filtered data
    filteredHistory: any[];
}

export type TimePeriod = keyof typeof CHART_TIME_PERIODS;

/**
 * Advanced hook for site analytics calculations
 * Memoizes expensive calculations and provides comprehensive metrics
 */
export function useSiteAnalytics(site: Site, timeRange: TimePeriod = "24h"): SiteAnalytics {
    return useMemo(() => {
        // Filter history based on time range
        const now = Date.now();
        const cutoff = now - CHART_TIME_PERIODS[timeRange];
        const filteredHistory = site.history.filter((record) => record.timestamp >= cutoff);
        
        const totalChecks = filteredHistory.length;
        const upCount = filteredHistory.filter((h) => h.status === "up").length;
        const downCount = filteredHistory.filter((h) => h.status === "down").length;
        
        // Basic metrics
        const uptime = totalChecks > 0 ? ((upCount / totalChecks) * 100).toFixed(2) : "0";
        const avgResponseTime = totalChecks > 0 
            ? Math.round(filteredHistory.reduce((sum, h) => sum + h.responseTime, 0) / totalChecks) 
            : 0;
        
        // Performance metrics
        const responseTimes = filteredHistory.map((h) => h.responseTime);
        const fastestResponse = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
        const slowestResponse = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
        
        // Calculate percentiles
        const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
        const getPercentile = (p: number) => {
            const index = Math.floor(sortedResponseTimes.length * p);
            return sortedResponseTimes[index] || 0;
        };
        
        const p50 = getPercentile(0.5);
        const p95 = getPercentile(0.95);
        const p99 = getPercentile(0.99);
        
        // Calculate downtime periods
        const downtimePeriods: DowntimePeriod[] = [];
        let currentDowntime: DowntimePeriod | null = null;
        
        // Process in reverse chronological order for proper downtime calculation
        for (const record of [...filteredHistory].reverse()) {
            if (record.status === "down") {
                if (!currentDowntime) {
                    currentDowntime = { 
                        start: record.timestamp, 
                        end: record.timestamp, 
                        duration: 0 
                    };
                } else {
                    currentDowntime.end = record.timestamp;
                }
            } else if (currentDowntime) {
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
    }, [site.history, timeRange]);
}

/**
 * Hook for generating chart data
 * Separates data preparation from component logic
 */
export function useChartData(site: Site, theme: any) {
    return useMemo(() => {
        const sortedHistory = [...site.history].sort((a, b) => a.timestamp - b.timestamp);
        
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
                    pointBackgroundColor: sortedHistory.map((record) =>
                        record.status === "up" ? theme.colors.success : theme.colors.error
                    ),
                    pointBorderColor: sortedHistory.map((record) =>
                        record.status === "up" ? theme.colors.success : theme.colors.error
                    ),
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
        
        return { lineChartData };
    }, [site.history, theme]);
}

/**
 * Utility functions for common calculations
 */
export const SiteAnalyticsUtils = {
    /**
     * Get availability status based on uptime percentage
     */
    getAvailabilityStatus(uptime: number): "excellent" | "good" | "warning" | "critical" {
        if (uptime >= 99.9) return "excellent";
        if (uptime >= 99) return "good";
        if (uptime >= 95) return "warning";
        return "critical";
    },
    
    /**
     * Get performance status based on response time
     */
    getPerformanceStatus(responseTime: number): "excellent" | "good" | "warning" | "critical" {
        if (responseTime <= 200) return "excellent";
        if (responseTime <= 500) return "good";
        if (responseTime <= 1000) return "warning";
        return "critical";
    },
    
    /**
     * Calculate SLA compliance
     */
    calculateSLA(uptime: number, targetSLA: number = 99.9): {
        compliant: boolean;
        deficit: number;
        allowedDowntime: number;
        actualDowntime: number;
    } {
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
