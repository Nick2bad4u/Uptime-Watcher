/**
 * Tests for useSite hook.
 * Tests the comprehensive site hook that combines monitor, stats, and actions.
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useSite } from "../hooks/site/useSite";
import { useSiteActions } from "../hooks/site/useSiteActions";
import { useSiteMonitor } from "../hooks/site/useSiteMonitor";
import { useSiteStats } from "../hooks/site/useSiteStats";
import { useErrorStore } from "../stores";
import { Site, Monitor } from "../types";

// Mock all the sub-hooks
const mockSiteMonitorResult = {
    filteredHistory: [
        { responseTime: 200, status: "up" as const, timestamp: 1640995200000 },
        { responseTime: 0, status: "down" as const, timestamp: 1640991600000 },
    ],
    handleMonitorIdChange: vi.fn(),
    isMonitoring: true,
    latestSite: {} as Site,
    monitor: {
        history: [],
        id: "monitor-1",
        status: "up",
        type: "http",
        responseTime: 0,
        monitoring: true,
        checkInterval: 30000,
        timeout: 5000,
        retryAttempts: 3,
    } as Monitor,
    monitorIds: ["monitor-1"],
    responseTime: 200,
    selectedMonitorId: "monitor-1",
    status: "up" as const,
};

const mockSiteStatsResult = {
    averageResponseTime: 200,
    checkCount: 2,
    uptime: 50,
};

const mockSiteActionsResult = {
    handleCardClick: vi.fn(),
    handleCheckNow: vi.fn(),
    handleStartMonitoring: vi.fn(),
    handleStopMonitoring: vi.fn(),
};

vi.mock("../hooks/site/useSiteMonitor", () => ({
    useSiteMonitor: vi.fn(() => mockSiteMonitorResult),
}));

vi.mock("../hooks/site/useSiteStats", () => ({
    useSiteStats: vi.fn(() => mockSiteStatsResult),
}));

vi.mock("../hooks/site/useSiteActions", () => ({
    useSiteActions: vi.fn(() => mockSiteActionsResult),
}));

vi.mock("../stores", () => ({
    useErrorStore: vi.fn(),
}));

// Get mocked functions for type safety
const mockUseErrorStore = vi.mocked(useErrorStore);

describe("useSite", () => {
    const mockSite: Site = {
        identifier: "site-1",
        monitors: [
            {
                history: [],
                id: "monitor-1",
                status: "up",
                type: "http",
                responseTime: 0,
                monitoring: true,
                checkInterval: 30000,
                timeout: 5000,
                retryAttempts: 3,
            } as Monitor,
        ],
        name: "Test Site",
        monitoring: false,
    };

    const mockErrorStore = {
        isLoading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseErrorStore.mockReturnValue(mockErrorStore);
    });

    describe("Integration", () => {
        it("should combine all sub-hook results", () => {
            const { result } = renderHook(() => useSite(mockSite));

            // Should include monitor data
            expect(result.current.filteredHistory).toEqual(mockSiteMonitorResult.filteredHistory);
            expect(result.current.monitor).toEqual(mockSiteMonitorResult.monitor);
            expect(result.current.latestSite).toEqual(mockSiteMonitorResult.latestSite);
            expect(result.current.selectedMonitorId).toBe(mockSiteMonitorResult.selectedMonitorId);
            expect(result.current.status).toBe(mockSiteMonitorResult.status);
            expect(result.current.responseTime).toBe(mockSiteMonitorResult.responseTime);
            expect(result.current.isMonitoring).toBe(mockSiteMonitorResult.isMonitoring);
            expect(result.current.monitorIds).toEqual(mockSiteMonitorResult.monitorIds);
            expect(result.current.handleMonitorIdChange).toBe(mockSiteMonitorResult.handleMonitorIdChange);

            // Should include stats data
            expect(result.current.uptime).toBe(mockSiteStatsResult.uptime);
            expect(result.current.checkCount).toBe(mockSiteStatsResult.checkCount);
            expect(result.current.averageResponseTime).toBe(mockSiteStatsResult.averageResponseTime);

            // Should include actions
            expect(result.current.handleCheckNow).toBe(mockSiteActionsResult.handleCheckNow);
            expect(result.current.handleCardClick).toBe(mockSiteActionsResult.handleCardClick);
            expect(result.current.handleStartMonitoring).toBe(mockSiteActionsResult.handleStartMonitoring);
            expect(result.current.handleStopMonitoring).toBe(mockSiteActionsResult.handleStopMonitoring);

            // Should include store state
            expect(result.current.isLoading).toBe(mockErrorStore.isLoading);
        });

        it("should pass correct parameters to sub-hooks", () => {
            renderHook(() => useSite(mockSite));

            // Should call useSiteMonitor with the site
            expect(vi.mocked(useSiteMonitor)).toHaveBeenCalledWith(mockSite);

            // Should call useSiteStats with filtered history from monitor hook
            expect(vi.mocked(useSiteStats)).toHaveBeenCalledWith(mockSiteMonitorResult.filteredHistory);

            // Should call useSiteActions with site and monitor from monitor hook
            expect(vi.mocked(useSiteActions)).toHaveBeenCalledWith(mockSite, mockSiteMonitorResult.monitor);
        });
    });

    describe("Loading State", () => {
        it("should reflect store loading state", () => {
            mockErrorStore.isLoading = true;

            const { result } = renderHook(() => useSite(mockSite));

            expect(result.current.isLoading).toBe(true);
        });

        it("should update when loading state changes", () => {
            mockErrorStore.isLoading = false;

            const { rerender, result } = renderHook(() => useSite(mockSite));

            expect(result.current.isLoading).toBe(false);

            mockErrorStore.isLoading = true;
            rerender();

            expect(result.current.isLoading).toBe(true);
        });
    });

    describe("Data Flow", () => {
        it("should pass filtered history from monitor to stats", () => {
            const customHistory = [{ responseTime: 300, status: "up" as const, timestamp: 1640995200000 }];

            // Mock different filtered history
            vi.mocked(useSiteMonitor).mockReturnValue({
                ...mockSiteMonitorResult,
                filteredHistory: customHistory,
            });

            renderHook(() => useSite(mockSite));

            expect(vi.mocked(useSiteStats)).toHaveBeenCalledWith(customHistory);
        });

        it("should pass monitor from monitor hook to actions", () => {
            const customMonitor: Monitor = {
                history: [],
                id: "custom-monitor",
                status: "down",
                type: "port",
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            // Mock different monitor
            vi.mocked(useSiteMonitor).mockReturnValue({
                ...mockSiteMonitorResult,
                monitor: customMonitor,
            });

            renderHook(() => useSite(mockSite));

            expect(vi.mocked(useSiteActions)).toHaveBeenCalledWith(mockSite, customMonitor);
        });
    });

    describe("Return Value Shape", () => {
        it("should have all expected properties", () => {
            const { result } = renderHook(() => useSite(mockSite));

            // Monitor properties
            expect(result.current).toHaveProperty("filteredHistory");
            expect(result.current).toHaveProperty("monitor");
            expect(result.current).toHaveProperty("latestSite");
            expect(result.current).toHaveProperty("selectedMonitorId");
            expect(result.current).toHaveProperty("status");
            expect(result.current).toHaveProperty("responseTime");
            expect(result.current).toHaveProperty("isMonitoring");
            expect(result.current).toHaveProperty("monitorIds");
            expect(result.current).toHaveProperty("handleMonitorIdChange");

            // Stats properties
            expect(result.current).toHaveProperty("uptime");
            expect(result.current).toHaveProperty("checkCount");
            expect(result.current).toHaveProperty("averageResponseTime");

            // Action properties
            expect(result.current).toHaveProperty("handleCheckNow");
            expect(result.current).toHaveProperty("handleCardClick");
            expect(result.current).toHaveProperty("handleStartMonitoring");
            expect(result.current).toHaveProperty("handleStopMonitoring");

            // Store properties
            expect(result.current).toHaveProperty("isLoading");
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined monitor from monitor hook", () => {
            vi.mocked(useSiteMonitor).mockReturnValue({
                ...mockSiteMonitorResult,
                monitor: undefined,
            });

            renderHook(() => useSite(mockSite));

            expect(vi.mocked(useSiteActions)).toHaveBeenCalledWith(mockSite, undefined);
        });

        it("should handle empty filtered history", () => {
            vi.mocked(useSiteMonitor).mockReturnValue({
                ...mockSiteMonitorResult,
                filteredHistory: [],
            });

            renderHook(() => useSite(mockSite));

            expect(vi.mocked(useSiteStats)).toHaveBeenCalledWith([]);
        });

        it("should handle site without monitors", () => {
            const emptySite: Site = {
                identifier: "empty-site",
                monitors: [],
                name: "",
                monitoring: false,
            };

            renderHook(() => useSite(emptySite));

            // Should still call all hooks without errors
            expect(vi.mocked(useSiteMonitor)).toHaveBeenCalledWith(emptySite);
            expect(vi.mocked(useSiteStats)).toHaveBeenCalled();
            expect(vi.mocked(useSiteActions)).toHaveBeenCalled();
        });
    });
});
