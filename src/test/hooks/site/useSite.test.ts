/**
 * Comprehensive tests for useSite.ts
 *
 * @file Src/test/hooks/site/useSite.test.ts
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSite } from "../../../hooks/site/useSite";
import { createMockSite } from "../../utils/mockFactories";

// Define types locally since they are not exported from types
interface Site {
    identifier: string;
    name: string;
    monitoring: boolean;
    monitors: any[];
}

// Mock all the sub-hooks
vi.mock("../../../hooks/site/useSiteMonitor", () => ({
    useSiteMonitor: vi.fn(() => ({
        filteredHistory: [
            { timestamp: Date.now(), status: "up", responseTime: 100 },
        ],
        monitor: {
            id: "monitor-1",
            name: "Test Monitor",
            type: "http",
            monitoring: true,
        },
        selectedMonitorId: "monitor-1",
        monitorIds: ["monitor-1"],
        handleMonitorIdChange: vi.fn(),
        isMonitoring: true,
        latestSite: {},
        status: "up",
        responseTime: 100,
    })),
}));

vi.mock("../../../hooks/site/useSiteStats", () => ({
    useSiteStats: vi.fn(() => ({
        uptime: 99.5,
        averageResponseTime: 150,
        checkCount: 100,
    })),
}));

vi.mock("../../../hooks/site/useSiteActions", () => ({
    useSiteActions: vi.fn(() => ({
        handleCheckNow: vi.fn(),
        handleStartMonitoring: vi.fn(),
        handleStopMonitoring: vi.fn(),
        handleCardClick: vi.fn(),
        handleStartSiteMonitoring: vi.fn(),
        handleStopSiteMonitoring: vi.fn(),
    })),
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        isLoading: false,
        error: null,
        setError: vi.fn(),
        clearError: vi.fn(),
    })),
}));

import { useSiteMonitor } from "../../../hooks/site/useSiteMonitor";
import { useSiteStats } from "../../../hooks/site/useSiteStats";
import { useSiteActions } from "../../../hooks/site/useSiteActions";
import { useErrorStore } from "../../../stores/error/useErrorStore";

describe("useSite Hook - Coverage Tests", () => {
    const mockSite: Site = createMockSite({
        identifier: "site-1",
        name: "Test Site",
    });

    beforeEach(() => {
        vi.clearAllMocks();
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

            expect(useSiteMonitor).toHaveBeenCalledWith(mockSite);
            expect(useSiteStats).toHaveBeenCalledWith([
                {
                    timestamp: expect.any(Number),
                    status: "up",
                    responseTime: 100,
                },
            ]);
            expect(useSiteActions).toHaveBeenCalledWith(mockSite, {
                id: "monitor-1",
                name: "Test Monitor",
                type: "http",
                monitoring: true,
            });
            expect(useErrorStore).toHaveBeenCalled();
        });

        it("should pass filteredHistory from monitor to stats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const mockFilteredHistory = [
                {
                    timestamp: Date.now() - 1000,
                    status: "up",
                    responseTime: 50,
                },
                { timestamp: Date.now(), status: "down", responseTime: 0 },
            ];

            (useSiteMonitor as any).mockReturnValueOnce({
                filteredHistory: mockFilteredHistory,
                monitor: {
                    id: "monitor-1",
                    name: "Test Monitor",
                    type: "http",
                },
                selectedMonitorId: "monitor-1",
                monitorIds: ["monitor-1"],
                handleMonitorIdChange: vi.fn(),
                isMonitoring: true,
                latestSite: {},
                status: "up",
                responseTime: 100,
            });

            renderHook(() => useSite(mockSite));

            expect(useSiteStats).toHaveBeenCalledWith(mockFilteredHistory);
        });

        it("should pass monitor from monitor hook to actions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const mockMonitor = {
                id: "monitor-2",
                name: "Custom Monitor",
                type: "port",
                monitoring: false,
            };

            (useSiteMonitor as any).mockReturnValueOnce({
                filteredHistory: [],
                monitor: mockMonitor,
                selectedMonitorId: "monitor-2",
                monitorIds: ["monitor-2"],
                handleMonitorIdChange: vi.fn(),
                isMonitoring: false,
                latestSite: {},
                status: "down",
                responseTime: 0,
            });

            renderHook(() => useSite(mockSite));

            expect(useSiteActions).toHaveBeenCalledWith(mockSite, mockMonitor);
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

            const { result } = renderHook(() => useSite(mockSite));

            // Should include monitor data
            expect(result.current.filteredHistory).toBeDefined();
            expect(result.current.monitor).toBeDefined();
            expect(result.current.selectedMonitorId).toBeDefined();
            expect(result.current.handleMonitorIdChange).toBeDefined();

            // Should include stats data
            expect(result.current.uptime).toBe(99.5);
            expect(result.current.averageResponseTime).toBe(150);
            expect(result.current.checkCount).toBe(100);

            // Should include actions
            expect(result.current.handleCheckNow).toBeDefined();
            expect(result.current.handleStartMonitoring).toBeDefined();
            expect(result.current.handleStopMonitoring).toBeDefined();
            expect(result.current.handleCardClick).toBeDefined();

            // Should include loading state
            expect(result.current.isLoading).toBe(false);
        });

        it("should have isLoading property that does not get overwritten", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Mock error store to return loading: true
            (useErrorStore as any).mockReturnValueOnce({
                isLoading: true,
                error: null,
                setError: vi.fn(),
                clearError: vi.fn(),
            });

            const { result } = renderHook(() => useSite(mockSite));

            expect(result.current.isLoading).toBe(true);
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

            // Mock overlapping properties to test precedence
            (useSiteMonitor as any).mockReturnValueOnce({
                filteredHistory: [],
                monitor: { id: "monitor", type: "http" },
                commonProp: "from-monitor",
                selectedMonitorId: "monitor",
                monitorIds: ["monitor"],
                handleMonitorIdChange: vi.fn(),
                isMonitoring: true,
                latestSite: {},
                status: "up",
                responseTime: 100,
            });

            (useSiteStats as any).mockReturnValueOnce({
                uptime: 99,
                commonProp: "from-stats",
                averageResponseTime: 150,
                checkCount: 100,
            });

            (useSiteActions as any).mockReturnValueOnce({
                handleCheckNow: vi.fn(),
                commonProp: "from-actions",
                handleStartMonitoring: vi.fn(),
                handleStopMonitoring: vi.fn(),
                handleCardClick: vi.fn(),
                handleStartSiteMonitoring: vi.fn(),
                handleStopSiteMonitoring: vi.fn(),
            });

            const { result } = renderHook(() => useSite(mockSite));

            // Actions should take precedence (last spread wins)
            expect((result.current as any).commonProp).toBe("from-actions");
            expect(result.current.isLoading).toBe(false); // Added last, should not be overwritten
        });
    });
});
