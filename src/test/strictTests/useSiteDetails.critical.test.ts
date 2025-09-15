/**
 * Critical coverage test for useSiteDetails hook - targeting uncovered edge
 * cases
 *
 * @file UseSiteDetails.critical.test.ts
 */

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSiteDetails } from "../../hooks/site/useSiteDetails";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { logger } from "../../services/logger";
import { useUIStore } from "../../stores/ui/useUiStore";
import type { Monitor, Site } from "../../../shared/types";
// import type { ChangeEvent } from "react";

// Mock modules
vi.mock("../../stores/sites/useSitesStore");
vi.mock("../../services/logger");
vi.mock("../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        isLoading: false,
        error: null,
    })),
}));
vi.mock("../../stores/ui/useUiStore");
vi.mock("../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(
        async (fn, _context, _defaultValue, _throwOnError) => await fn()
    ),
}));

describe("useSiteDetails - Critical Coverage Tests", () => {
    const mockSite: Site = {
        identifier: "test-site-id",
        name: "Test Site",
        monitors: [],
        monitoring: true,
    };

    const mockMonitor: Monitor = {
        id: "monitor-1",
        type: "http",
        url: "https://example.com",
        host: "example.com",
        port: 443,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        monitoring: true,
        status: "up",
        responseTime: 0,
        history: [],
    };

    // Helper to create consistent mock store
    const createMockStore = (overrides: any = {}) => ({
        getSiteById: vi.fn().mockReturnValue(mockSite),
        removeSiteMonitor: vi.fn(),
        getSelectedMonitorId: vi.fn().mockReturnValue(null),
        setSelectedMonitorId: vi.fn(),
        sites: [mockSite],
        removeMonitorFromSite: vi.fn(),
        deleteSite: vi.fn(),
        modifySite: vi.fn(),
        checkSiteNow: vi.fn(),
        startSiteMonitoring: vi.fn(),
        stopSiteMonitoring: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
        error: null,
        clearError: vi.fn(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock logger with the correct structure
        (logger as any).site = {
            error: vi.fn(),
            removed: vi.fn(),
        };
        (logger as any).user = {
            action: vi.fn(),
        };

        // Mock UI store
        let activeTab = "overview";
        (useUIStore as any).mockReturnValue({
            activeSiteDetailsTab: activeTab,
            setActiveSiteDetailsTab: vi.fn((tab: string) => {
                activeTab = tab;
            }),
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "last24Hours" as const,
        });
    });

    it("should handle removeMonitor when no monitor is selected (line 390-394)", async () => {
        // Setup store without selected monitor
        const mockStore = createMockStore();

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

        // Attempt to remove monitor when none is selected (selectedMonitor will be undefined)
        await act(async () => {
            await result.current.handleRemoveMonitor();
        });

        // Should log error and not attempt removal
        expect(logger.site.error).toHaveBeenCalledWith(
            mockSite.identifier,
            "No monitor selected for removal"
        );
        expect(mockStore.removeMonitorFromSite).not.toHaveBeenCalled();
    });

    it("should handle removeMonitor when monitor not found in site (edge case)", async () => {
        const mockStore = createMockStore({
            getSelectedMonitorId: vi
                .fn()
                .mockReturnValue("non-existent-monitor"),
        });

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

        await act(async () => {
            await result.current.handleRemoveMonitor();
        });

        // Should log error and not attempt removal (same error as no monitor since selectedMonitor is undefined)
        expect(logger.site.error).toHaveBeenCalledWith(
            mockSite.identifier,
            "No monitor selected for removal"
        );
        expect(mockStore.removeMonitorFromSite).not.toHaveBeenCalled();
    });

    it("should handle confirmation dialog cancellation for removeMonitor", async () => {
        const siteWithMonitor: Site = {
            ...mockSite,
            monitors: [mockMonitor],
        };

        const mockStore = createMockStore({
            getSelectedMonitorId: vi.fn().mockReturnValue("monitor-1"),
            sites: [siteWithMonitor],
        });

        (useSitesStore as any).mockReturnValue(mockStore);

        // Mock window.confirm to return false (cancel)
        global.confirm = vi.fn().mockReturnValue(false);

        const { result } = renderHook(() =>
            useSiteDetails({ site: siteWithMonitor })
        );

        await act(async () => {
            await result.current.handleRemoveMonitor();
        });

        // Should not remove monitor when confirmation is cancelled
        expect(mockStore.removeMonitorFromSite).not.toHaveBeenCalled();
        expect(global.confirm).toHaveBeenCalledWith(
            'Are you sure you want to remove the monitor "https://example.com" from Test Site?'
        );
    });

    it("should handle successful removeMonitor with confirmation", async () => {
        const siteWithMonitor: Site = {
            ...mockSite,
            monitors: [mockMonitor],
        };

        const mockStore = createMockStore({
            getSelectedMonitorId: vi.fn().mockReturnValue("monitor-1"),
            sites: [siteWithMonitor],
        });

        (useSitesStore as any).mockReturnValue(mockStore);

        // Mock window.confirm to return true (confirm)
        global.confirm = vi.fn().mockReturnValue(true);

        const { result } = renderHook(() =>
            useSiteDetails({ site: siteWithMonitor })
        );

        await act(async () => {
            await result.current.handleRemoveMonitor();
        });

        // Should remove monitor when confirmed
        expect(mockStore.removeMonitorFromSite).toHaveBeenCalledWith(
            siteWithMonitor.identifier,
            "monitor-1"
        );
        expect(logger.user.action).toHaveBeenCalledWith(
            "Monitor removed successfully",
            {
                monitorId: "monitor-1",
                monitorType: "http",
                siteId: siteWithMonitor.identifier,
            }
        );
    });

    it("should handle removeSite confirmation dialog cancellation", async () => {
        const mockStore = {
            getSiteById: vi.fn().mockReturnValue(mockSite),
            removeSite: vi.fn(),
            getSelectedMonitorId: vi.fn().mockReturnValue(null),
            setSelectedMonitorId: vi.fn(),
            sites: [mockSite],
            removeMonitorFromSite: vi.fn(),
            deleteSite: vi.fn(),
            modifySite: vi.fn(),
            checkSiteNow: vi.fn(),
            startSiteMonitoring: vi.fn(),
            stopSiteMonitoring: vi.fn(),
            startSiteMonitorMonitoring: vi.fn(),
            stopSiteMonitorMonitoring: vi.fn(),
            updateMonitorTimeout: vi.fn(),
            updateMonitorRetryAttempts: vi.fn(),
            updateSiteCheckInterval: vi.fn(),
        };

        (useSitesStore as any).mockReturnValue(mockStore);

        // Mock window.confirm to return false (cancel)
        global.confirm = vi.fn().mockReturnValue(false);

        const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

        await act(async () => {
            await result.current.handleRemoveSite();
        });

        // Should not remove site when confirmation is cancelled
        expect(mockStore.deleteSite).not.toHaveBeenCalled();
        expect(global.confirm).toHaveBeenCalledWith(
            "Are you sure you want to remove Test Site?"
        );
    });

    it("should handle monitor name formatting with special characters", async () => {
        const specialMonitor: Monitor = {
            ...mockMonitor,
            id: "special-monitor",
            type: "dns",
            url: "special-host", // Changed from undefined to match type requirement
            host: "special-host",
            port: 8080,
        };

        const siteWithSpecialMonitor: Site = {
            ...mockSite,
            monitors: [specialMonitor],
        };

        const mockStore = {
            getSiteById: vi.fn().mockReturnValue(siteWithSpecialMonitor),
            removeSiteMonitor: vi.fn(),
            getSelectedMonitorId: vi.fn().mockReturnValue("special-monitor"),
            setSelectedMonitorId: vi.fn(),
            sites: [siteWithSpecialMonitor],
            removeMonitorFromSite: vi.fn(),
            deleteSite: vi.fn(),
            modifySite: vi.fn(),
            checkSiteNow: vi.fn(),
            startSiteMonitoring: vi.fn(),
            stopSiteMonitoring: vi.fn(),
            startSiteMonitorMonitoring: vi.fn(),
            stopSiteMonitorMonitoring: vi.fn(),
            updateMonitorTimeout: vi.fn(),
            updateMonitorRetryAttempts: vi.fn(),
            updateSiteCheckInterval: vi.fn(),
        };

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() =>
            useSiteDetails({ site: siteWithSpecialMonitor })
        );

        // Check that monitor name formatting handles DNS type
        expect(result.current.currentSite).toBeDefined();
        expect(result.current.selectedMonitor).toEqual(specialMonitor);
    });

    it("should handle tab navigation to monitoring when no monitors exist", async () => {
        const siteWithoutMonitors: Site = {
            ...mockSite,
            monitors: [],
        };

        const mockStore = {
            getSiteById: vi.fn().mockReturnValue(siteWithoutMonitors),
            removeSiteMonitor: vi.fn(),
            getSelectedMonitorId: vi.fn().mockReturnValue(null),
            setSelectedMonitorId: vi.fn(),
            sites: [siteWithoutMonitors],
            removeMonitorFromSite: vi.fn(),
            deleteSite: vi.fn(),
            modifySite: vi.fn(),
            checkSiteNow: vi.fn(),
            startSiteMonitoring: vi.fn(),
            stopSiteMonitoring: vi.fn(),
            startSiteMonitorMonitoring: vi.fn(),
            stopSiteMonitorMonitoring: vi.fn(),
            updateMonitorTimeout: vi.fn(),
            updateMonitorRetryAttempts: vi.fn(),
            updateSiteCheckInterval: vi.fn(),
        };

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() =>
            useSiteDetails({ site: siteWithoutMonitors })
        );

        // Should handle empty monitors array gracefully
        expect(result.current.currentSite?.monitors).toEqual([]);
        expect(result.current.selectedMonitor).toBeUndefined();
    });

    it("should handle activeTab change events", async () => {
        const mockUIStore = {
            activeSiteDetailsTab: "overview",
            setActiveSiteDetailsTab: vi.fn(),
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "last24Hours" as const,
        };

        (useUIStore as any).mockReturnValue(mockUIStore);

        const mockStore = createMockStore();
        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

        // Test tab change
        await act(async () => {
            result.current.setActiveSiteDetailsTab("analytics");
        });

        expect(mockUIStore.setActiveSiteDetailsTab).toHaveBeenCalledWith(
            "analytics"
        );
    });

    it("should handle monitoring control when site has no monitors", async () => {
        const siteWithoutMonitors: Site = {
            ...mockSite,
            monitors: [],
        };

        const mockStore = createMockStore({
            sites: [siteWithoutMonitors],
        });

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() =>
            useSiteDetails({ site: siteWithoutMonitors })
        );

        // Should handle monitoring controls gracefully with no monitors
        await act(async () => {
            await result.current.handleStartSiteMonitoring();
        });

        await act(async () => {
            await result.current.handleStopSiteMonitoring();
        });

        expect(mockStore.startSiteMonitoring).toHaveBeenCalledWith(
            siteWithoutMonitors.identifier
        );
        expect(mockStore.stopSiteMonitoring).toHaveBeenCalledWith(
            siteWithoutMonitors.identifier
        );
        expect(logger.user.action).toHaveBeenCalledWith(
            "Started site monitoring",
            {
                monitorCount: 0,
                siteId: siteWithoutMonitors.identifier,
            }
        );
        expect(logger.user.action).toHaveBeenCalledWith(
            "Stopped site monitoring",
            {
                monitorCount: 0,
                siteId: siteWithoutMonitors.identifier,
            }
        );
    });

    it("should handle monitor selection when monitor does not exist", async () => {
        const mockStore = {
            getSiteById: vi.fn().mockReturnValue(mockSite),
            removeSiteMonitor: vi.fn(),
            getSelectedMonitorId: vi
                .fn()
                .mockReturnValue("non-existent-monitor"),
            setSelectedMonitorId: vi.fn(),
            sites: [mockSite],
            removeMonitorFromSite: vi.fn(),
            deleteSite: vi.fn(),
            modifySite: vi.fn(),
            checkSiteNow: vi.fn(),
            startSiteMonitoring: vi.fn(),
            stopSiteMonitoring: vi.fn(),
            startSiteMonitorMonitoring: vi.fn(),
            stopSiteMonitorMonitoring: vi.fn(),
            updateMonitorTimeout: vi.fn(),
            updateMonitorRetryAttempts: vi.fn(),
            updateSiteCheckInterval: vi.fn(),
        };

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

        // Should handle non-existent monitor selection gracefully
        expect(result.current.selectedMonitor).toBeUndefined();
    });

    it("should handle edge case with monitor type validation", async () => {
        const invalidTypeMonitor: Monitor = {
            ...mockMonitor,
            id: "invalid-monitor",
            type: "ping",
        };

        const siteWithInvalidMonitor: Site = {
            ...mockSite,
            monitors: [invalidTypeMonitor],
        };

        const mockStore = {
            getSiteById: vi.fn().mockReturnValue(siteWithInvalidMonitor),
            removeSiteMonitor: vi.fn(),
            getSelectedMonitorId: vi.fn().mockReturnValue("invalid-monitor"),
            setSelectedMonitorId: vi.fn(),
            sites: [siteWithInvalidMonitor],
            removeMonitorFromSite: vi.fn(),
            deleteSite: vi.fn(),
            modifySite: vi.fn(),
            checkSiteNow: vi.fn(),
            startSiteMonitoring: vi.fn(),
            stopSiteMonitoring: vi.fn(),
            startSiteMonitorMonitoring: vi.fn(),
            stopSiteMonitorMonitoring: vi.fn(),
            updateMonitorTimeout: vi.fn(),
            updateMonitorRetryAttempts: vi.fn(),
            updateSiteCheckInterval: vi.fn(),
        };

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() =>
            useSiteDetails({ site: siteWithInvalidMonitor })
        );

        // Should handle different monitor type gracefully
        expect(result.current.selectedMonitor).toEqual(invalidTypeMonitor);
    });

    it("should handle error scenarios in monitoring operations", async () => {
        const mockStore = createMockStore({
            startSiteMonitoring: vi
                .fn()
                .mockRejectedValue(new Error("Monitoring failed")),
            stopSiteMonitoring: vi
                .fn()
                .mockRejectedValue(new Error("Stop failed")),
        });

        (useSitesStore as any).mockReturnValue(mockStore);

        const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

        // Should handle monitoring errors gracefully
        await act(async () => {
            try {
                await result.current.handleStartSiteMonitoring();
            } catch (error) {
                // Expected to fail
            }
        });

        await act(async () => {
            try {
                await result.current.handleStopSiteMonitoring();
            } catch (error) {
                // Expected to fail
            }
        });

        expect(mockStore.startSiteMonitoring).toHaveBeenCalledWith(
            mockSite.identifier
        );
        expect(mockStore.stopSiteMonitoring).toHaveBeenCalledWith(
            mockSite.identifier
        );
    });
});
