/**
 * Comprehensive tests for useSiteActions hook.
 * Tests all action handlers with full coverage including error scenarios.
 */

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useSiteActions } from "../hooks/site/useSiteActions";
import logger from "../services/logger";
import { Site, Monitor } from "../types";

// Mock window.electronAPI
Object.defineProperty(window, "electronAPI", {
    value: {
        monitoring: {
            startMonitoringForSite: vi.fn(),
            stopMonitoringForSite: vi.fn(),
        },
        sites: {
            getSites: vi.fn().mockResolvedValue([]),
            checkSiteNow: vi.fn().mockResolvedValue(undefined),
        },
    },
    writable: true,
});

// Mock the logger
vi.mock("../services/logger", () => ({
    default: {
        error: vi.fn(),
        user: {
            action: vi.fn(),
        },
        site: {
            error: vi.fn(),
        },
    },
}));

// Mock the store
const mockSitesStore = {
    checkSiteNow: vi.fn().mockResolvedValue(undefined),
    setSelectedMonitorId: vi.fn(),
    startSiteMonitorMonitoring: vi.fn().mockResolvedValue(undefined),
    stopSiteMonitorMonitoring: vi.fn().mockResolvedValue(undefined),
};

const mockUIStore = {
    setSelectedSite: vi.fn(),
    setShowSiteDetails: vi.fn(),
};

vi.mock("../stores", () => ({
    useSitesStore: () => mockSitesStore,
    useUIStore: () => mockUIStore,
}));

describe("useSiteActions", () => {
    const mockSite: Site = {
        identifier: "test-site-id",
        name: "Test Site",
        monitors: [],
        monitoring: true,
    };

    const mockHttpMonitor: Monitor = {
        id: "monitor-1",
        type: "http",
        url: "https://example.com",
        status: "up",
        responseTime: 150,
        lastChecked: new Date(),
        history: [],
        monitoring: true,
        checkInterval: 60000,
    };

    const mockPortMonitor: Monitor = {
        id: "monitor-2",
        type: "port",
        host: "example.com",
        port: 8080,
        status: "down",
        responseTime: 200,
        lastChecked: new Date(),
        history: [],
        monitoring: false,
        checkInterval: 30000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Hook Initialization", () => {
        it("should return all required action handlers", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            expect(result.current).toHaveProperty("handleStartMonitoring");
            expect(result.current).toHaveProperty("handleStopMonitoring");
            expect(result.current).toHaveProperty("handleCheckNow");
            expect(result.current).toHaveProperty("handleCardClick");

            expect(typeof result.current.handleStartMonitoring).toBe("function");
            expect(typeof result.current.handleStopMonitoring).toBe("function");
            expect(typeof result.current.handleCheckNow).toBe("function");
            expect(typeof result.current.handleCardClick).toBe("function");
        });

        it("should work with undefined monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, undefined));

            expect(result.current).toHaveProperty("handleStartMonitoring");
            expect(result.current).toHaveProperty("handleStopMonitoring");
            expect(result.current).toHaveProperty("handleCheckNow");
            expect(result.current).toHaveProperty("handleCardClick");
        });

        it("should work with site without name", () => {
            const siteWithoutName: Site = {
                identifier: "test-site-id",
                monitors: [],
                monitoring: true,
            };

            const { result } = renderHook(() => useSiteActions(siteWithoutName, mockHttpMonitor));

            expect(result.current).toBeDefined();
            expect(typeof result.current.handleCardClick).toBe("function");
        });
    });

    describe("handleStartMonitoring", () => {
        it("should start monitoring successfully with HTTP monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            act(() => {
                result.current.handleStartMonitoring();
            });

            expect(mockSitesStore.startSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-1");

            expect(logger.user.action).toHaveBeenCalledWith("Started site monitoring", {
                monitorId: "monitor-1",
                monitorType: "http",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should start monitoring successfully with port monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, mockPortMonitor));

            act(() => {
                result.current.handleStartMonitoring();
            });

            expect(mockSitesStore.startSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-2");

            expect(logger.user.action).toHaveBeenCalledWith("Started site monitoring", {
                monitorId: "monitor-2",
                monitorType: "port",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should handle undefined monitor gracefully", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, undefined));

            act(() => {
                result.current.handleStartMonitoring();
            });

            expect(mockSitesStore.startSiteMonitorMonitoring).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(
                "Attempted to start monitoring without valid monitor",
                undefined,
                {
                    siteId: "test-site-id",
                    siteName: "Test Site",
                }
            );
        });

        it("should handle site without name when monitor is undefined", () => {
            const siteWithoutName: Site = {
                identifier: "test-site-id",
                monitors: [],
                monitoring: true,
            };

            const { result } = renderHook(() => useSiteActions(siteWithoutName, undefined));

            act(() => {
                result.current.handleStartMonitoring();
            });

            expect(logger.error).toHaveBeenCalledWith(
                "Attempted to start monitoring without valid monitor",
                undefined,
                {
                    siteId: "test-site-id",
                    siteName: undefined,
                }
            );
        });

        it("should handle store errors and log them", () => {
            const error = new Error("Store operation failed");
            mockSitesStore.startSiteMonitorMonitoring.mockImplementation(() => {
                throw error;
            });

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            act(() => {
                result.current.handleStartMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", error);
        });

        it("should handle non-Error exceptions", () => {
            const error = "String error";
            mockSitesStore.startSiteMonitorMonitoring.mockImplementation(() => {
                throw error;
            });

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            act(() => {
                result.current.handleStartMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", "String error");
        });
    });

    describe("handleStopMonitoring", () => {
        it("should stop monitoring successfully with HTTP monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            act(() => {
                result.current.handleStopMonitoring();
            });

            expect(mockSitesStore.stopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-1");

            expect(logger.user.action).toHaveBeenCalledWith("Stopped site monitoring", {
                monitorId: "monitor-1",
                monitorType: "http",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should stop monitoring successfully with port monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, mockPortMonitor));

            act(() => {
                result.current.handleStopMonitoring();
            });

            expect(mockSitesStore.stopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-2");

            expect(logger.user.action).toHaveBeenCalledWith("Stopped site monitoring", {
                monitorId: "monitor-2",
                monitorType: "port",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should handle undefined monitor gracefully", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, undefined));

            act(() => {
                result.current.handleStopMonitoring();
            });

            expect(mockSitesStore.stopSiteMonitorMonitoring).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith("Attempted to stop monitoring without valid monitor", undefined, {
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should handle site without name when monitor is undefined", () => {
            const siteWithoutName: Site = {
                identifier: "test-site-id",
                monitors: [],
                monitoring: true,
            };

            const { result } = renderHook(() => useSiteActions(siteWithoutName, undefined));

            act(() => {
                result.current.handleStopMonitoring();
            });

            expect(logger.error).toHaveBeenCalledWith("Attempted to stop monitoring without valid monitor", undefined, {
                siteId: "test-site-id",
                siteName: undefined,
            });
        });

        it("should handle store errors and log them", () => {
            const error = new Error("Store operation failed");
            mockSitesStore.stopSiteMonitorMonitoring.mockImplementation(() => {
                throw error;
            });

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            act(() => {
                result.current.handleStopMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", error);
        });

        it("should handle non-Error exceptions", () => {
            const error = "String error";
            mockSitesStore.stopSiteMonitorMonitoring.mockImplementation(() => {
                throw error;
            });

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            act(() => {
                result.current.handleStopMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", "String error");
        });
    });

    describe("handleCheckNow", () => {
        it("should perform immediate check successfully", async () => {
            mockSitesStore.checkSiteNow.mockResolvedValue(undefined);

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            await act(async () => {
                result.current.handleCheckNow();
            });

            expect(logger.user.action).toHaveBeenCalledWith("Manual site check initiated", {
                monitorId: "monitor-1",
                monitorType: "http",
                siteId: "test-site-id",
                siteName: "Test Site",
            });

            expect(mockSitesStore.checkSiteNow).toHaveBeenCalledWith("test-site-id", "monitor-1");

            // Wait for the promise to resolve
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(logger.user.action).toHaveBeenCalledWith("Manual site check completed successfully", {
                monitorId: "monitor-1",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should perform immediate check with port monitor", async () => {
            mockSitesStore.checkSiteNow.mockResolvedValue(undefined);

            const { result } = renderHook(() => useSiteActions(mockSite, mockPortMonitor));

            await act(async () => {
                result.current.handleCheckNow();
            });

            expect(logger.user.action).toHaveBeenCalledWith("Manual site check initiated", {
                monitorId: "monitor-2",
                monitorType: "port",
                siteId: "test-site-id",
                siteName: "Test Site",
            });

            expect(mockSitesStore.checkSiteNow).toHaveBeenCalledWith("test-site-id", "monitor-2");
        });

        it("should handle undefined monitor gracefully", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, undefined));

            act(() => {
                result.current.handleCheckNow();
            });

            expect(mockSitesStore.checkSiteNow).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith("Attempted to check site without valid monitor", undefined, {
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should handle site without name when monitor is undefined", () => {
            const siteWithoutName: Site = {
                identifier: "test-site-id",
                monitors: [],
                monitoring: true,
            };

            const { result } = renderHook(() => useSiteActions(siteWithoutName, undefined));

            act(() => {
                result.current.handleCheckNow();
            });

            expect(logger.error).toHaveBeenCalledWith("Attempted to check site without valid monitor", undefined, {
                siteId: "test-site-id",
                siteName: undefined,
            });
        });

        it("should handle checkSiteNow errors with Error objects", async () => {
            const error = new Error("Check failed");
            mockSitesStore.checkSiteNow.mockRejectedValue(error);

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            await act(async () => {
                result.current.handleCheckNow();
            });

            // Wait for the promise to reject
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", error);
            expect(logger.error).toHaveBeenCalledWith("Manual site check failed", error, {
                monitorId: "monitor-1",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should handle checkSiteNow errors with non-Error objects", async () => {
            const error = "String error";
            mockSitesStore.checkSiteNow.mockRejectedValue(error);

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            await act(async () => {
                result.current.handleCheckNow();
            });

            // Wait for the promise to reject
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", "String error");
            expect(logger.error).toHaveBeenCalledWith("Manual site check failed", "String error", {
                monitorId: "monitor-1",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });
    });

    describe("handleCardClick", () => {
        it("should handle card click with monitor successfully", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            act(() => {
                result.current.handleCardClick();
            });

            expect(logger.user.action).toHaveBeenCalledWith("Site card clicked - navigating to details", {
                monitorId: "monitor-1",
                monitorType: "http",
                siteId: "test-site-id",
                siteName: "Test Site",
            });

            expect(mockUIStore.setSelectedSite).toHaveBeenCalledWith(mockSite);
            expect(mockSitesStore.setSelectedMonitorId).toHaveBeenCalledWith("test-site-id", "monitor-1");
            expect(mockUIStore.setShowSiteDetails).toHaveBeenCalledWith(true);
        });

        it("should handle card click with port monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, mockPortMonitor));

            act(() => {
                result.current.handleCardClick();
            });

            expect(logger.user.action).toHaveBeenCalledWith("Site card clicked - navigating to details", {
                monitorId: "monitor-2",
                monitorType: "port",
                siteId: "test-site-id",
                siteName: "Test Site",
            });

            expect(mockUIStore.setSelectedSite).toHaveBeenCalledWith(mockSite);
            expect(mockSitesStore.setSelectedMonitorId).toHaveBeenCalledWith("test-site-id", "monitor-2");
            expect(mockUIStore.setShowSiteDetails).toHaveBeenCalledWith(true);
        });

        it("should handle card click without monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, undefined));

            act(() => {
                result.current.handleCardClick();
            });

            expect(logger.user.action).toHaveBeenCalledWith("Site card clicked - navigating to details", {
                monitorId: undefined,
                monitorType: undefined,
                siteId: "test-site-id",
                siteName: "Test Site",
            });

            expect(mockUIStore.setSelectedSite).toHaveBeenCalledWith(mockSite);
            expect(mockSitesStore.setSelectedMonitorId).not.toHaveBeenCalled();
            expect(mockUIStore.setShowSiteDetails).toHaveBeenCalledWith(true);
        });

        it("should handle card click with site without name", () => {
            const siteWithoutName: Site = {
                identifier: "test-site-id",
                monitors: [],
                monitoring: true,
            };

            const { result } = renderHook(() => useSiteActions(siteWithoutName, mockHttpMonitor));

            act(() => {
                result.current.handleCardClick();
            });

            expect(logger.user.action).toHaveBeenCalledWith("Site card clicked - navigating to details", {
                monitorId: "monitor-1",
                monitorType: "http",
                siteId: "test-site-id",
                siteName: undefined,
            });

            expect(mockUIStore.setSelectedSite).toHaveBeenCalledWith(siteWithoutName);
            expect(mockSitesStore.setSelectedMonitorId).toHaveBeenCalledWith("test-site-id", "monitor-1");
            expect(mockUIStore.setShowSiteDetails).toHaveBeenCalledWith(true);
        });
    });

    describe("Callback Stability", () => {
        it("should have stable callback references when dependencies don't change", () => {
            const { result, rerender } = renderHook(({ site, monitor }) => useSiteActions(site, monitor), {
                initialProps: { site: mockSite, monitor: mockHttpMonitor },
            });

            const firstRender = result.current;

            // Rerender with same props
            rerender({ site: mockSite, monitor: mockHttpMonitor });

            const secondRender = result.current;

            expect(firstRender.handleStartMonitoring).toBe(secondRender.handleStartMonitoring);
            expect(firstRender.handleStopMonitoring).toBe(secondRender.handleStopMonitoring);
            expect(firstRender.handleCheckNow).toBe(secondRender.handleCheckNow);
            expect(firstRender.handleCardClick).toBe(secondRender.handleCardClick);
        });

        it("should update callbacks when site changes", () => {
            const { result, rerender } = renderHook(({ site, monitor }) => useSiteActions(site, monitor), {
                initialProps: { site: mockSite, monitor: mockHttpMonitor },
            });

            const firstRender = result.current;

            const newSite: Site = {
                identifier: "new-site-id",
                name: "New Site",
                monitors: [],
                monitoring: true,
            };

            // Rerender with different site
            rerender({ site: newSite, monitor: mockHttpMonitor });

            const secondRender = result.current;

            expect(firstRender.handleStartMonitoring).not.toBe(secondRender.handleStartMonitoring);
            expect(firstRender.handleStopMonitoring).not.toBe(secondRender.handleStopMonitoring);
            expect(firstRender.handleCheckNow).not.toBe(secondRender.handleCheckNow);
            expect(firstRender.handleCardClick).not.toBe(secondRender.handleCardClick);
        });

        it("should update callbacks when monitor changes", () => {
            const { result, rerender } = renderHook(({ site, monitor }) => useSiteActions(site, monitor), {
                initialProps: { site: mockSite, monitor: mockHttpMonitor },
            });

            const firstRender = result.current;

            // Rerender with different monitor
            rerender({ site: mockSite, monitor: mockPortMonitor });

            const secondRender = result.current;

            expect(firstRender.handleStartMonitoring).not.toBe(secondRender.handleStartMonitoring);
            expect(firstRender.handleStopMonitoring).not.toBe(secondRender.handleStopMonitoring);
            expect(firstRender.handleCheckNow).not.toBe(secondRender.handleCheckNow);
            expect(firstRender.handleCardClick).not.toBe(secondRender.handleCardClick);
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle complete workflow: start monitoring, check now, stop monitoring", async () => {
            mockSitesStore.checkSiteNow.mockResolvedValue(undefined);

            const { result } = renderHook(() => useSiteActions(mockSite, mockHttpMonitor));

            // Start monitoring
            act(() => {
                result.current.handleStartMonitoring();
            });

            expect(mockSitesStore.startSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-1");

            // Check now
            await act(async () => {
                result.current.handleCheckNow();
            });

            expect(mockSitesStore.checkSiteNow).toHaveBeenCalledWith("test-site-id", "monitor-1");

            // Stop monitoring
            act(() => {
                result.current.handleStopMonitoring();
            });

            expect(mockSitesStore.stopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-1");

            // Verify all logging calls
            expect(logger.user.action).toHaveBeenCalledWith("Started site monitoring", expect.any(Object));
            expect(logger.user.action).toHaveBeenCalledWith("Manual site check initiated", expect.any(Object));
            expect(logger.user.action).toHaveBeenCalledWith("Stopped site monitoring", expect.any(Object));
        });

        it("should handle all actions without monitor", () => {
            const { result } = renderHook(() => useSiteActions(mockSite, undefined));

            act(() => {
                result.current.handleStartMonitoring();
                result.current.handleStopMonitoring();
                result.current.handleCheckNow();
                result.current.handleCardClick();
            });

            // Verify store methods were not called for monitoring actions
            expect(mockSitesStore.startSiteMonitorMonitoring).not.toHaveBeenCalled();
            expect(mockSitesStore.stopSiteMonitorMonitoring).not.toHaveBeenCalled();
            expect(mockSitesStore.checkSiteNow).not.toHaveBeenCalled();

            // But card click should still work
            expect(mockUIStore.setSelectedSite).toHaveBeenCalledWith(mockSite);
            expect(mockUIStore.setShowSiteDetails).toHaveBeenCalledWith(true);

            // Verify error logging for invalid operations
            expect(logger.error).toHaveBeenCalledTimes(3); // Start, stop, check now
        });
    });
});
