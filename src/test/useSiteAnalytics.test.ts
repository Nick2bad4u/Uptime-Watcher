/**
 * Comprehensive tests for useSiteAnalytics hook.
 * Tests all analytics calculations with full coverage including edge cases.
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useSiteAnalytics, useChartData, SiteAnalyticsUtils } from "../hooks/site/useSiteAnalytics";
import { Monitor, StatusHistory } from "../types";
import type { Theme } from "../theme/types";
import type { TimePeriod } from "../utils/time";

// Mock constants to avoid dependency issues
vi.mock("../constants", () => ({
    CHART_TIME_PERIODS: {
        "1h": 60 * 60 * 1000,
        "12h": 12 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
    },
}));

vi.mock("../utils/time", () => ({
    TIME_PERIOD_LABELS: {
        "1h": "Last Hour",
        "12h": "Last 12 Hours", 
        "24h": "Last 24 Hours",
        "7d": "Last 7 Days",
        "30d": "Last 30 Days",
    },
}));

describe("useSiteAnalytics", () => {
    const now = Date.now();
    const twoHoursAgo = now - (2 * 60 * 60 * 1000);
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const createStatusRecord = (timestamp: number, status: "up" | "down", responseTime: number): StatusHistory => ({
        timestamp,
        status,
        responseTime,
    });

    const mockMonitorEmpty: Monitor = {
        id: "monitor-empty",
        type: "http",
        url: "https://example.com",
        status: "up",
        history: [],
        monitoring: true,
        checkInterval: 60000,
    };

    const mockMonitorWithHistory: Monitor = {
        id: "monitor-with-history",
        type: "http",
        url: "https://example.com",
        status: "up",
        history: [
            createStatusRecord(now - 1000, "up", 200),
            createStatusRecord(now - 2000, "down", 0),
            createStatusRecord(now - 3000, "up", 150),
            createStatusRecord(now - 4000, "up", 300),
            createStatusRecord(now - 5000, "down", 0),
            createStatusRecord(twoHoursAgo, "up", 100),
            createStatusRecord(threeDaysAgo, "up", 250),
            createStatusRecord(oneWeekAgo, "down", 0),
        ],
        monitoring: true,
        checkInterval: 60000,
    };

    const mockPortMonitor: Monitor = {
        id: "port-monitor",
        type: "port",
        host: "example.com",
        port: 8080,
        status: "down",
        history: [
            createStatusRecord(now - 1000, "down", 5000),
            createStatusRecord(now - 2000, "up", 50),
            createStatusRecord(now - 3000, "up", 75),
        ],
        monitoring: false,
        checkInterval: 30000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Date.now() to ensure consistent test results
        vi.spyOn(Date, 'now').mockReturnValue(now);
    });

    describe("Hook Initialization", () => {
        it("should return default analytics for undefined monitor", () => {
            const { result } = renderHook(() => useSiteAnalytics(undefined, "24h"));

            expect(result.current).toEqual({
                totalChecks: 0,
                upCount: 0,
                downCount: 0,
                uptime: "0",
                avgResponseTime: 0,
                fastestResponse: 0,
                slowestResponse: 0,
                p50: 0,
                p95: 0,
                p99: 0,
                downtimePeriods: [],
                totalDowntime: 0,
                mttr: 0,
                incidentCount: 0,
                filteredHistory: [],
            });
        });

        it("should return default analytics for monitor with empty history", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorEmpty, "24h"));

            expect(result.current).toEqual({
                totalChecks: 0,
                upCount: 0,
                downCount: 0,
                uptime: "0",
                avgResponseTime: 0,
                fastestResponse: 0,
                slowestResponse: 0,
                p50: 0,
                p95: 0,
                p99: 0,
                downtimePeriods: [],
                totalDowntime: 0,
                mttr: 0,
                incidentCount: 0,
                filteredHistory: [],
            });
        });

        it("should use default time range when not provided", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory));

            // Should default to "24h" and filter out older records
            expect(result.current.totalChecks).toBe(6); // Only records within last 24h
            expect(result.current.filteredHistory).toHaveLength(6);
        });

        it("should sanitize invalid time range to default", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "invalid" as TimePeriod));

            // Should default to "24h" when invalid time range is provided
            expect(result.current.totalChecks).toBe(6);
            expect(result.current.filteredHistory).toHaveLength(6);
        });
    });

    describe("Time Range Filtering", () => {
        it("should filter history by 1h time range", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "1h"));

            // Only records within last hour (5 records)
            expect(result.current.totalChecks).toBe(5);
            expect(result.current.upCount).toBe(3);
            expect(result.current.downCount).toBe(2);
        });

        it("should filter history by 24h time range", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "24h"));

            // Records within last 24 hours (6 records)
            expect(result.current.totalChecks).toBe(6);
            expect(result.current.upCount).toBe(4);
            expect(result.current.downCount).toBe(2);
        });

        it("should filter history by 7d time range", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "7d"));

            // Records within last 7 days (8 records - oneWeekAgo is exactly at the boundary)
            expect(result.current.totalChecks).toBe(8);
            expect(result.current.upCount).toBe(5);
            expect(result.current.downCount).toBe(3);
        });

        it("should filter history by 30d time range", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "30d"));

            // All records (8 records)
            expect(result.current.totalChecks).toBe(8);
            expect(result.current.upCount).toBe(5);
            expect(result.current.downCount).toBe(3);
        });
    });

    describe("Basic Metrics Calculation", () => {
        it("should calculate uptime percentage correctly", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "1h"));

            // Within 1h: 4 records (now-1000, now-2000, now-3000, now-4000)
            // 3 up out of 5 total = 60%
            expect(result.current.uptime).toBe("60.00");
        });

        it("should calculate average response time correctly", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "1h"));

            // (200 + 0 + 150 + 300 + 0) / 5 = 130
            expect(result.current.avgResponseTime).toBe(130);
        });

        it("should handle zero total checks gracefully", () => {
            const emptyMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [createStatusRecord(oneWeekAgo, "up", 100)], // Outside 24h range
            };

            const { result } = renderHook(() => useSiteAnalytics(emptyMonitor, "24h"));

            expect(result.current.uptime).toBe("0");
            expect(result.current.avgResponseTime).toBe(0);
        });
    });

    describe("Performance Metrics", () => {
        it("should calculate fastest and slowest response times", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "1h"));

            expect(result.current.fastestResponse).toBe(0); // Down status has 0 response time
            expect(result.current.slowestResponse).toBe(300);
        });

        it("should handle empty response times", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorEmpty, "24h"));

            expect(result.current.fastestResponse).toBe(0);
            expect(result.current.slowestResponse).toBe(0);
        });

        it("should calculate percentiles correctly", () => {
            // Create monitor with sorted response times: [0, 150, 200, 300]
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "1h"));

            expect(result.current.p50).toBe(150); // 50th percentile (median)
            expect(result.current.p95).toBe(300); // 95th percentile
            expect(result.current.p99).toBe(300); // 99th percentile
        });

        it("should handle single response time for percentiles", () => {
            const singleRecordMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [createStatusRecord(now - 1000, "up", 500)],
            };

            const { result } = renderHook(() => useSiteAnalytics(singleRecordMonitor, "24h"));

            expect(result.current.p50).toBe(500);
            expect(result.current.p95).toBe(500);
            expect(result.current.p99).toBe(500);
        });

        it("should handle edge cases in percentile calculation", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorEmpty, "24h"));

            expect(result.current.p50).toBe(0);
            expect(result.current.p95).toBe(0);
            expect(result.current.p99).toBe(0);
        });
    });

    describe("Downtime Period Calculation", () => {
        it("should calculate downtime periods correctly", () => {
            const downtimeMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [
                    createStatusRecord(now - 1000, "up", 200),
                    createStatusRecord(now - 2000, "down", 0),
                    createStatusRecord(now - 3000, "down", 0),
                    createStatusRecord(now - 4000, "up", 150),
                    createStatusRecord(now - 5000, "down", 0),
                    createStatusRecord(now - 6000, "up", 100),
                ],
            };

            const { result } = renderHook(() => useSiteAnalytics(downtimeMonitor, "24h"));

            expect(result.current.incidentCount).toBe(2);
            expect(result.current.downtimePeriods).toHaveLength(2);

            // Check first downtime period (oldest: now-5000 single point)
            expect(result.current.downtimePeriods[0]).toEqual({
                start: now - 5000,
                end: now - 5000,
                duration: 0,
            });

            // Check second downtime period (newest: now-3000 to now-2000)
            expect(result.current.downtimePeriods[1]).toEqual({
                start: now - 3000,
                end: now - 2000,
                duration: 1000,
            });
        });

        it("should handle ongoing downtime at the start of records", () => {
            const ongoingDowntimeMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [
                    createStatusRecord(now - 1000, "down", 0),
                    createStatusRecord(now - 2000, "down", 0),
                    createStatusRecord(now - 3000, "up", 200),
                ],
            };

            const { result } = renderHook(() => useSiteAnalytics(ongoingDowntimeMonitor, "24h"));

            expect(result.current.incidentCount).toBe(1);
            expect(result.current.downtimePeriods[0]).toEqual({
                start: now - 2000,
                end: now - 1000,
                duration: 1000,
            });
        });

        it("should handle downtime that continues to the oldest record", () => {
            const continuousDowntimeMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [
                    createStatusRecord(now - 1000, "up", 200),
                    createStatusRecord(now - 2000, "down", 0),
                    createStatusRecord(now - 3000, "down", 0),
                ],
            };

            const { result } = renderHook(() => useSiteAnalytics(continuousDowntimeMonitor, "24h"));

            expect(result.current.incidentCount).toBe(1);
            expect(result.current.downtimePeriods[0]).toEqual({
                start: now - 3000,
                end: now - 2000,
                duration: 1000,
            });
        });

        it("should handle no downtime periods", () => {
            const alwaysUpMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [
                    createStatusRecord(now - 1000, "up", 200),
                    createStatusRecord(now - 2000, "up", 150),
                    createStatusRecord(now - 3000, "up", 300),
                ],
            };

            const { result } = renderHook(() => useSiteAnalytics(alwaysUpMonitor, "24h"));

            expect(result.current.incidentCount).toBe(0);
            expect(result.current.downtimePeriods).toHaveLength(0);
            expect(result.current.totalDowntime).toBe(0);
            expect(result.current.mttr).toBe(0);
        });

        it("should calculate total downtime and MTTR correctly", () => {
            const multipleDowntimeMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [
                    createStatusRecord(now - 1000, "up", 200),
                    createStatusRecord(now - 2000, "down", 0),
                    createStatusRecord(now - 4000, "up", 150),
                    createStatusRecord(now - 5000, "down", 0),
                    createStatusRecord(now - 8000, "up", 100),
                ],
            };

            const { result } = renderHook(() => useSiteAnalytics(multipleDowntimeMonitor, "24h"));

            expect(result.current.incidentCount).toBe(2);
            expect(result.current.totalDowntime).toBe(0); // Both periods have duration 0
            expect(result.current.mttr).toBe(0); // 0 / 2
        });
    });

    describe("Monitor Types", () => {
        it("should handle HTTP monitors correctly", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockMonitorWithHistory, "24h"));

            expect(result.current.totalChecks).toBeGreaterThan(0);
            expect(result.current.filteredHistory).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ status: expect.any(String), responseTime: expect.any(Number) })
                ])
            );
        });

        it("should handle port monitors correctly", () => {
            const { result } = renderHook(() => useSiteAnalytics(mockPortMonitor, "24h"));

            expect(result.current.totalChecks).toBe(3);
            expect(result.current.upCount).toBe(2);
            expect(result.current.downCount).toBe(1);
            expect(result.current.uptime).toBe("66.67");
        });
    });

    describe("Memoization", () => {
        it("should memoize results when dependencies don't change", () => {
            const { result, rerender } = renderHook(
                ({ monitor, timeRange }) => useSiteAnalytics(monitor, timeRange),
                {
                    initialProps: { monitor: mockMonitorWithHistory, timeRange: "24h" as TimePeriod },
                }
            );

            const firstResult = result.current;

            // Rerender with same props
            rerender({ monitor: mockMonitorWithHistory, timeRange: "24h" as TimePeriod });

            expect(result.current).toBe(firstResult); // Should be the exact same object reference
        });

        it("should recalculate when monitor history changes", () => {
            const { result, rerender } = renderHook(
                ({ monitor, timeRange }) => useSiteAnalytics(monitor, timeRange),
                {
                    initialProps: { monitor: mockMonitorWithHistory, timeRange: "24h" as TimePeriod },
                }
            );

            const firstResult = result.current;

            const newMonitor: Monitor = {
                ...mockMonitorWithHistory,
                history: [...mockMonitorWithHistory.history, createStatusRecord(now - 500, "up", 400)],
            };

            rerender({ monitor: newMonitor, timeRange: "24h" as TimePeriod });

            expect(result.current).not.toBe(firstResult);
            expect(result.current.totalChecks).toBe(firstResult.totalChecks + 1);
        });

        it("should recalculate when time range changes", () => {
            const { result, rerender } = renderHook(
                ({ monitor, timeRange }) => useSiteAnalytics(monitor, timeRange),
                {
                    initialProps: { monitor: mockMonitorWithHistory, timeRange: "24h" as TimePeriod },
                }
            );

            const firstResult = result.current;

            rerender({ monitor: mockMonitorWithHistory, timeRange: "1h" as TimePeriod });

            expect(result.current).not.toBe(firstResult);
            expect(result.current.totalChecks).toBeLessThan(firstResult.totalChecks);
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor without optional fields", () => {
            const minimalMonitor: Monitor = {
                id: "minimal",
                type: "http",
                status: "up",
                history: [createStatusRecord(now - 1000, "up", 200)],
                monitoring: true,
            };

            const { result } = renderHook(() => useSiteAnalytics(minimalMonitor, "24h"));

            expect(result.current.totalChecks).toBe(1);
            expect(result.current.uptime).toBe("100.00");
        });

        it("should handle very large response times", () => {
            const largeResponseMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [
                    createStatusRecord(now - 1000, "up", 999999),
                    createStatusRecord(now - 2000, "up", 1000000),
                ],
            };

            const { result } = renderHook(() => useSiteAnalytics(largeResponseMonitor, "24h"));

            expect(result.current.avgResponseTime).toBe(1000000); // Math.round(999999.5) = 1000000
            expect(result.current.slowestResponse).toBe(1000000);
        });

        it("should handle zero response times", () => {
            const zeroResponseMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [
                    createStatusRecord(now - 1000, "up", 0),
                    createStatusRecord(now - 2000, "down", 0),
                ],
            };

            const { result } = renderHook(() => useSiteAnalytics(zeroResponseMonitor, "24h"));

            expect(result.current.avgResponseTime).toBe(0);
            expect(result.current.fastestResponse).toBe(0);
            expect(result.current.slowestResponse).toBe(0);
        });

        it("should handle empty filtered history after time range filtering", () => {
            const oldHistoryMonitor: Monitor = {
                ...mockMonitorEmpty,
                history: [createStatusRecord(oneWeekAgo - 1000, "up", 200)], // Outside even 30d range
            };

            const { result } = renderHook(() => useSiteAnalytics(oldHistoryMonitor, "1h"));

            expect(result.current.totalChecks).toBe(0);
            expect(result.current.uptime).toBe("0");
            expect(result.current.filteredHistory).toHaveLength(0);
        });
    });
});

describe("useChartData", () => {
    const mockTheme: Theme = {
        colors: {
            primary: {
                500: "#3b82f6",
            },
            success: "#10b981",
            error: "#ef4444",
        },
    } as Theme;

    const mockMonitor: Monitor = {
        id: "chart-monitor",
        type: "http",
        status: "up",
        history: [
            { timestamp: 1000, status: "up", responseTime: 200 },
            { timestamp: 2000, status: "down", responseTime: 0 },
            { timestamp: 3000, status: "up", responseTime: 150 },
        ],
        monitoring: true,
    };

    it("should generate chart data with correct structure", () => {
        const { result } = renderHook(() => useChartData(mockMonitor, mockTheme));

        expect(result.current.lineChartData).toBeDefined();
        expect(result.current.lineChartData.datasets).toHaveLength(1);

        const dataset = result.current.lineChartData.datasets[0];
        expect(dataset.label).toBe("Response Time");
        expect(dataset.borderColor).toBe("#3b82f6");
        expect(dataset.backgroundColor).toBe("#3b82f620");
        expect(dataset.data).toHaveLength(3);
    });

    it("should map data points correctly", () => {
        const { result } = renderHook(() => useChartData(mockMonitor, mockTheme));

        const dataset = result.current.lineChartData.datasets[0];
        expect(dataset.data).toEqual([
            { x: 1000, y: 200 },
            { x: 2000, y: 0 },
            { x: 3000, y: 150 },
        ]);
    });

    it("should color points based on status", () => {
        const { result } = renderHook(() => useChartData(mockMonitor, mockTheme));

        const dataset = result.current.lineChartData.datasets[0];
        expect(dataset.pointBackgroundColor).toEqual([
            "#10b981", // up - success color
            "#ef4444", // down - error color  
            "#10b981", // up - success color
        ]);
        expect(dataset.pointBorderColor).toEqual([
            "#10b981",
            "#ef4444",
            "#10b981",
        ]);
    });

    it("should handle empty history", () => {
        const emptyMonitor: Monitor = {
            ...mockMonitor,
            history: [],
        };

        const { result } = renderHook(() => useChartData(emptyMonitor, mockTheme));

        const dataset = result.current.lineChartData.datasets[0];
        expect(dataset.data).toHaveLength(0);
        expect(dataset.pointBackgroundColor).toHaveLength(0);
    });

    it("should sort history by timestamp", () => {
        const unsortedMonitor: Monitor = {
            ...mockMonitor,
            history: [
                { timestamp: 3000, status: "up", responseTime: 150 },
                { timestamp: 1000, status: "up", responseTime: 200 },
                { timestamp: 2000, status: "down", responseTime: 0 },
            ],
        };

        const { result } = renderHook(() => useChartData(unsortedMonitor, mockTheme));

        const dataset = result.current.lineChartData.datasets[0];
        expect(dataset.data).toEqual([
            { x: 1000, y: 200 },
            { x: 2000, y: 0 },
            { x: 3000, y: 150 },
        ]);
    });

    it("should memoize chart data correctly", () => {
        const { result, rerender } = renderHook(
            ({ monitor, theme }) => useChartData(monitor, theme),
            {
                initialProps: { monitor: mockMonitor, theme: mockTheme },
            }
        );

        const firstResult = result.current;

        // Rerender with same props
        rerender({ monitor: mockMonitor, theme: mockTheme });

        expect(result.current).toBe(firstResult);
    });

    it("should recalculate when monitor history changes", () => {
        const { result, rerender } = renderHook(
            ({ monitor, theme }) => useChartData(monitor, theme),
            {
                initialProps: { monitor: mockMonitor, theme: mockTheme },
            }
        );

        const firstResult = result.current;

        const newMonitor: Monitor = {
            ...mockMonitor,
            history: [...mockMonitor.history, { timestamp: 4000, status: "up", responseTime: 300 }],
        };

        rerender({ monitor: newMonitor, theme: mockTheme });

        expect(result.current).not.toBe(firstResult);
        expect(result.current.lineChartData.datasets[0].data).toHaveLength(4);
    });
});

describe("SiteAnalyticsUtils", () => {
    describe("calculateSLA", () => {
        it("should calculate SLA compliance correctly for compliant uptime", () => {
            const result = SiteAnalyticsUtils.calculateSLA(99.95, 99.9);

            expect(result.compliant).toBe(true);
            expect(result.deficit).toBe(0);
            expect(result.allowedDowntime).toBeCloseTo(0.001, 10); // (100 - 99.9) / 100
            expect(result.actualDowntime).toBeCloseTo(0.0005, 10); // (100 - 99.95) / 100
        });

        it("should calculate SLA compliance correctly for non-compliant uptime", () => {
            const result = SiteAnalyticsUtils.calculateSLA(99.5, 99.9);

            expect(result.compliant).toBe(false);
            expect(result.deficit).toBeCloseTo(0.4, 10);
            expect(result.allowedDowntime).toBeCloseTo(0.001, 10);
            expect(result.actualDowntime).toBe(0.005);
        });

        it("should use default SLA target of 99.9%", () => {
            const result = SiteAnalyticsUtils.calculateSLA(99.95);

            expect(result.allowedDowntime).toBeCloseTo(0.001, 10);
        });

        it("should handle 100% uptime", () => {
            const result = SiteAnalyticsUtils.calculateSLA(100, 99.9);

            expect(result.compliant).toBe(true);
            expect(result.deficit).toBe(0);
            expect(result.actualDowntime).toBe(0);
        });

        it("should handle 0% uptime", () => {
            const result = SiteAnalyticsUtils.calculateSLA(0, 99.9);

            expect(result.compliant).toBe(false);
            expect(result.deficit).toBe(99.9);
            expect(result.actualDowntime).toBe(1);
        });
    });

    describe("getAvailabilityStatus", () => {
        it("should return excellent for 99.9%+ uptime", () => {
            expect(SiteAnalyticsUtils.getAvailabilityStatus(99.9)).toBe("excellent");
            expect(SiteAnalyticsUtils.getAvailabilityStatus(100)).toBe("excellent");
        });

        it("should return good for 99%+ uptime", () => {
            expect(SiteAnalyticsUtils.getAvailabilityStatus(99)).toBe("good");
            expect(SiteAnalyticsUtils.getAvailabilityStatus(99.8)).toBe("good");
        });

        it("should return warning for 95%+ uptime", () => {
            expect(SiteAnalyticsUtils.getAvailabilityStatus(95)).toBe("warning");
            expect(SiteAnalyticsUtils.getAvailabilityStatus(98)).toBe("warning");
        });

        it("should return critical for <95% uptime", () => {
            expect(SiteAnalyticsUtils.getAvailabilityStatus(94.9)).toBe("critical");
            expect(SiteAnalyticsUtils.getAvailabilityStatus(0)).toBe("critical");
        });

        it("should handle edge cases", () => {
            expect(SiteAnalyticsUtils.getAvailabilityStatus(99.0)).toBe("good");
            expect(SiteAnalyticsUtils.getAvailabilityStatus(95.0)).toBe("warning");
        });
    });

    describe("getPerformanceStatus", () => {
        it("should return excellent for ≤200ms response time", () => {
            expect(SiteAnalyticsUtils.getPerformanceStatus(200)).toBe("excellent");
            expect(SiteAnalyticsUtils.getPerformanceStatus(100)).toBe("excellent");
            expect(SiteAnalyticsUtils.getPerformanceStatus(0)).toBe("excellent");
        });

        it("should return good for ≤500ms response time", () => {
            expect(SiteAnalyticsUtils.getPerformanceStatus(500)).toBe("good");
            expect(SiteAnalyticsUtils.getPerformanceStatus(300)).toBe("good");
        });

        it("should return warning for ≤1000ms response time", () => {
            expect(SiteAnalyticsUtils.getPerformanceStatus(1000)).toBe("warning");
            expect(SiteAnalyticsUtils.getPerformanceStatus(750)).toBe("warning");
        });

        it("should return critical for >1000ms response time", () => {
            expect(SiteAnalyticsUtils.getPerformanceStatus(1001)).toBe("critical");
            expect(SiteAnalyticsUtils.getPerformanceStatus(5000)).toBe("critical");
        });

        it("should handle edge cases", () => {
            expect(SiteAnalyticsUtils.getPerformanceStatus(500.0)).toBe("good");
            expect(SiteAnalyticsUtils.getPerformanceStatus(1000.0)).toBe("warning");
        });
    });
});
