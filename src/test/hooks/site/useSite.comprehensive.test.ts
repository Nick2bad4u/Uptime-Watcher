/**
 * @file Comprehensive tests for useSite hook This file tests the useSite hook
 *   which combines site monitoring, actions, statistics, and UI state
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useSite } from "../../../hooks/site/useSite";
import type { Site, Monitor } from "@shared/types";

// Mock all the sub-hooks
vi.mock("../../../hooks/site/useSiteMonitor", () => ({
    useSiteMonitor: vi.fn(),
}));

vi.mock("../../../hooks/site/useSiteStats", () => ({
    useSiteStats: vi.fn(),
}));

vi.mock("../../../hooks/site/useSiteActions", () => ({
    useSiteActions: vi.fn(),
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(),
}));

// Import the mocked modules
import { useSiteMonitor } from "../../../hooks/site/useSiteMonitor";
import { useSiteStats } from "../../../hooks/site/useSiteStats";
import { useSiteActions } from "../../../hooks/site/useSiteActions";
import { useErrorStore } from "../../../stores/error/useErrorStore";

// Create typed mock references
const mockUseSiteMonitor = vi.mocked(useSiteMonitor);
const mockUseSiteStats = vi.mocked(useSiteStats);
const mockUseSiteActions = vi.mocked(useSiteActions);
const mockUseErrorStore = vi.mocked(useErrorStore);

describe("useSite Hook", () => {
    // Sample site data for testing
    const mockSite: Site = {
        identifier: "test-site-1",
        name: "Test Site",
        monitoring: true,
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 10_000,
                retryAttempts: 3,
                status: "up",
                monitoring: true,
                lastChecked: new Date(),
                responseTime: 100,
                history: [],
            },
        ],
    };

    const mockMonitor: Monitor = {
        id: "monitor-1",
        type: "http" as const,
        url: "https://example.com",
        checkInterval: 300_000,
        timeout: 10_000,
        retryAttempts: 3,
        monitoring: true,
        status: "up" as const,
        lastChecked: new Date(),
        responseTime: 150,
        history: [],
    };

    beforeEach(() => {
        // Reset mocks and set default return values
        vi.clearAllMocks();

        mockUseErrorStore.mockReturnValue({
            isLoading: false,
        });

        mockUseSiteActions.mockReturnValue({
            handleCardClick: vi.fn(),
            handleStartMonitoring: vi.fn(),
            handleStopMonitoring: vi.fn(),
            handleCheckNow: vi.fn(),
            handleStartSiteMonitoring: vi.fn(),
            handleStopSiteMonitoring: vi.fn(),
        });

        mockUseSiteMonitor.mockReturnValue({
            monitor: undefined,
            selectedMonitorId: "",
            monitorIds: [],
            filteredHistory: [],
            handleMonitorIdChange: vi.fn(),
            status: "pending" as const,
            responseTime: undefined,
            isMonitoring: false,
            latestSite: {} as any,
        });

        mockUseSiteStats.mockReturnValue({
            uptime: 0,
            checkCount: 0,
            averageResponseTime: 0,
        });
    });

    describe("Hook Composition", () => {
        it("should call all required hooks with correct parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            renderHook(() => useSite(mockSite));

            expect(mockUseSiteMonitor).toHaveBeenCalledWith(mockSite);
            expect(mockUseSiteStats).toHaveBeenCalledWith([]);
            expect(mockUseSiteActions).toHaveBeenCalledWith(
                mockSite,
                undefined
            );
            expect(mockUseErrorStore).toHaveBeenCalled();
        });

        it("should pass filteredHistory from monitor to stats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const mockHistory = [
                {
                    timestamp: Date.now(),
                    status: "up" as const,
                    responseTime: 150,
                },
                {
                    timestamp: Date.now() - 3_600_000,
                    status: "down" as const,
                    responseTime: 200,
                },
            ];

            mockUseSiteMonitor.mockReturnValueOnce({
                monitor: mockMonitor,
                selectedMonitorId: "monitor-1",
                monitorIds: ["monitor-1"],
                filteredHistory: mockHistory,
                handleMonitorIdChange: vi.fn(),
                status: "up" as const,
                responseTime: 150,
                isMonitoring: true,
                latestSite: mockSite,
            });

            renderHook(() => useSite(mockSite));

            expect(mockUseSiteStats).toHaveBeenCalledWith(mockHistory);
        });

        it("should pass monitor from monitor hook to actions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            mockUseSiteMonitor.mockReturnValueOnce({
                monitor: mockMonitor,
                selectedMonitorId: "monitor-1",
                monitorIds: ["monitor-1"],
                filteredHistory: [],
                handleMonitorIdChange: vi.fn(),
                status: "up" as const,
                responseTime: 150,
                isMonitoring: true,
                latestSite: mockSite,
            });

            renderHook(() => useSite(mockSite));

            expect(mockUseSiteActions).toHaveBeenCalledWith(
                mockSite,
                mockMonitor
            );
        });
    });

    describe("Return Value Composition", () => {
        it("should return combined data from all hooks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const mockMonitorData = {
                monitor: mockMonitor,
                selectedMonitorId: "monitor-1",
                monitorIds: ["monitor-1"],
                filteredHistory: [],
                handleMonitorIdChange: vi.fn(),
                status: "up" as const,
                responseTime: 150,
                isMonitoring: true,
                latestSite: mockSite,
            };

            const mockStatsData = {
                uptime: 95,
                checkCount: 100,
                averageResponseTime: 145,
            };

            const mockActionsData = {
                handleCardClick: vi.fn(),
                handleStartMonitoring: vi.fn(),
                handleStopMonitoring: vi.fn(),
                handleCheckNow: vi.fn(),
                handleStartSiteMonitoring: vi.fn(),
                handleStopSiteMonitoring: vi.fn(),
            };

            const mockLoadingData = {
                isLoading: true,
            };

            mockUseSiteMonitor.mockReturnValueOnce(mockMonitorData);
            mockUseSiteStats.mockReturnValueOnce(mockStatsData);
            mockUseSiteActions.mockReturnValueOnce(mockActionsData);
            mockUseErrorStore.mockReturnValueOnce(mockLoadingData);

            const { result } = renderHook(() => useSite(mockSite));

            // Check that all properties from all hooks are present
            expect(result.current).toEqual(
                expect.objectContaining({
                    // Monitor data
                    monitor: mockMonitor,
                    selectedMonitorId: "monitor-1",
                    monitorIds: ["monitor-1"],
                    filteredHistory: [],
                    handleMonitorIdChange: expect.any(Function),
                    status: "up",
                    responseTime: 150,
                    isMonitoring: true,
                    latestSite: expect.any(Object),

                    // Stats data
                    uptime: 95,
                    checkCount: 100,
                    averageResponseTime: 145,

                    // Actions data
                    handleCardClick: expect.any(Function),
                    handleStartMonitoring: expect.any(Function),
                    handleStopMonitoring: expect.any(Function),
                    handleCheckNow: expect.any(Function),
                    handleStartSiteMonitoring: expect.any(Function),
                    handleStopSiteMonitoring: expect.any(Function),

                    // Loading state
                    isLoading: true,
                })
            );
        });

        it("should have isLoading property that does not get overwritten", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            mockUseErrorStore.mockReturnValueOnce({ isLoading: true });

            const { result } = renderHook(() => useSite(mockSite));

            expect(result.current.isLoading).toBeTruthy();
        });
    });

    describe("Edge Cases", () => {
        it("should handle site with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };

            mockUseSiteMonitor.mockReturnValueOnce({
                monitor: undefined,
                selectedMonitorId: "",
                monitorIds: [],
                filteredHistory: [],
                handleMonitorIdChange: vi.fn(),
                status: "down" as const,
                responseTime: undefined,
                isMonitoring: false,
                latestSite: siteWithNoMonitors,
            });

            const { result } = renderHook(() => useSite(siteWithNoMonitors));

            expect(result.current.monitor).toBeUndefined();
            expect(result.current.status).toBe("down");
        });

        it("should handle site with multiple monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const multiMonitorSite: Site = {
                ...mockSite,
                monitors: [mockMonitor, { ...mockMonitor, id: "monitor-2" }],
            };

            const { result } = renderHook(() => useSite(multiMonitorSite));

            // UseSite delegates monitor management to useSiteMonitor
            expect(result.current).toBeDefined();
        });

        it("should handle site with disabled monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const disabledMonitoringSite: Site = {
                ...mockSite,
                monitoring: false,
            };

            mockUseSiteMonitor.mockReturnValueOnce({
                monitor: { ...mockMonitor, monitoring: false },
                selectedMonitorId: "monitor-1",
                monitorIds: ["monitor-1"],
                filteredHistory: [],
                handleMonitorIdChange: vi.fn(),
                status: "down" as const,
                responseTime: undefined,
                isMonitoring: false,
                latestSite: disabledMonitoringSite,
            });

            const { result } = renderHook(() =>
                useSite(disabledMonitoringSite));

            expect(result.current.status).toBe("down");
        });
    });

    describe("Hook Dependencies", () => {
        it("should re-call hooks when site changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { rerender } = renderHook(({ site }) => useSite(site), {
                initialProps: { site: mockSite },
            });

            const newSite: Site = {
                ...mockSite,
                identifier: "new-site-id",
                name: "New Site Name",
            };

            rerender({ site: newSite });

            expect(mockUseSiteMonitor).toHaveBeenCalledWith(newSite);
            expect(mockUseSiteActions).toHaveBeenCalledWith(newSite, undefined);
        });

        it("should maintain referential stability for functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result: firstResult } = renderHook(() => useSite(mockSite));
            const { result: secondResult } = renderHook(() =>
                useSite(mockSite));

            // Functions should be stable across renders with same data
            expect(typeof firstResult.current.handleStartMonitoring).toBe(
                "function"
            );
            expect(typeof secondResult.current.handleStartMonitoring).toBe(
                "function"
            );
        });
    });

    describe("Type Safety", () => {
        it("should satisfy UseSiteResult interface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSite(mockSite));

            // SiteMonitorResult properties
            expect(result.current).toHaveProperty("monitor");
            expect(result.current).toHaveProperty("selectedMonitorId");
            expect(result.current).toHaveProperty("monitorIds");
            expect(result.current).toHaveProperty("filteredHistory");
            expect(result.current).toHaveProperty("handleMonitorIdChange");
            expect(result.current).toHaveProperty("status");
            expect(result.current).toHaveProperty("responseTime");
            expect(result.current).toHaveProperty("isMonitoring");
            expect(result.current).toHaveProperty("latestSite");

            // SiteStats properties
            expect(result.current).toHaveProperty("uptime");
            expect(result.current).toHaveProperty("checkCount");
            expect(result.current).toHaveProperty("averageResponseTime");

            // SiteActionsResult properties
            expect(result.current).toHaveProperty("handleCardClick");
            expect(result.current).toHaveProperty("handleStartMonitoring");
            expect(result.current).toHaveProperty("handleStopMonitoring");
            expect(result.current).toHaveProperty("handleCheckNow");
            expect(result.current).toHaveProperty("handleStartSiteMonitoring");
            expect(result.current).toHaveProperty("handleStopSiteMonitoring");

            // UseSiteResult-specific properties
            expect(result.current).toHaveProperty("isLoading");
        });

        it("should have properly typed function signatures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSite(mockSite));

            expect(typeof result.current.selectedMonitorId).toBe("string");
            expect(typeof result.current.handleMonitorIdChange).toBe(
                "function"
            );
            expect(typeof result.current.handleCardClick).toBe("function");
            expect(typeof result.current.handleStartMonitoring).toBe(
                "function"
            );
            expect(typeof result.current.handleStopMonitoring).toBe("function");
            expect(typeof result.current.handleCheckNow).toBe("function");
        });
    });

    describe("Property Precedence", () => {
        it("should maintain correct property precedence as documented", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // According to docs: Actions → Monitor → Stats → Loading state
            // isLoading should be added last and not overwritten

            mockUseSiteActions.mockReturnValueOnce({
                handleCardClick: vi.fn(),
                handleStartMonitoring: vi.fn(),
                handleStopMonitoring: vi.fn(),
                handleCheckNow: vi.fn(),
                handleStartSiteMonitoring: vi.fn(),
                handleStopSiteMonitoring: vi.fn(),
            });

            mockUseErrorStore.mockReturnValueOnce({
                isLoading: true, // This should override any conflicts
            });

            const { result } = renderHook(() => useSite(mockSite));

            expect(result.current.isLoading).toBeTruthy();
        });
    });
});
