/**
 * Basic tests for useSiteDetails.ts
 * @file src/test/hooks/site/useSiteDetails.test.ts
 */

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSiteDetails } from "../../../hooks/site/useSiteDetails";

// Define types locally since they are not exported from types
interface Site {
    identifier: string;
    name: string;
    monitoring: boolean;
    monitors: any[];
}

// Mock all dependencies
vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        checkSiteNow: vi.fn(),
        deleteSite: vi.fn(),
        getSelectedMonitorId: vi.fn(() => "monitor-1"),
        modifySite: vi.fn(),
        removeMonitorFromSite: vi.fn(),
        setSelectedMonitorId: vi.fn(),
        sites: [],
        startSiteMonitoring: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
    })),
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        isLoading: false,
    })),
}));

vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(() => ({
        activeSiteDetailsTab: "overview",
        setActiveSiteDetailsTab: vi.fn(),
        setShowAdvancedMetrics: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
        showAdvancedMetrics: false,
        siteDetailsChartTimeRange: "1h",
    })),
}));

vi.mock("../../../hooks/site/useSiteAnalytics", () => ({
    useSiteAnalytics: vi.fn(() => ({
        chartData: [],
        isLoading: false,
        error: null,
    })),
}));

import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { useSiteAnalytics } from "../../../hooks/site/useSiteAnalytics";

describe("useSiteDetails Hook - Basic Coverage", () => {
    const mockSite: Site = {
        identifier: "site-1",
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
                monitoring: true,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock sites store to return the current site
        (useSitesStore as any).mockReturnValue({
            checkSiteNow: vi.fn(),
            deleteSite: vi.fn(),
            getSelectedMonitorId: vi.fn(() => "monitor-1"),
            modifySite: vi.fn(),
            removeMonitorFromSite: vi.fn(),
            setSelectedMonitorId: vi.fn(),
            sites: [mockSite],
            startSiteMonitoring: vi.fn(),
            startSiteMonitorMonitoring: vi.fn(),
            stopSiteMonitoring: vi.fn(),
            stopSiteMonitorMonitoring: vi.fn(),
            updateMonitorRetryAttempts: vi.fn(),
            updateMonitorTimeout: vi.fn(),
            updateSiteCheckInterval: vi.fn(),
        });
    });

    describe("Hook Initialization", () => {
        it("should initialize with site data", () => {
            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.currentSite).toEqual(mockSite);
            expect(result.current.selectedMonitorId).toBe("monitor-1");
            expect(result.current.isLoading).toBe(false);
        });

        it("should handle site with no monitors", () => {
            const siteWithNoMonitors = {
                ...mockSite,
                monitors: [],
            };

            // Mock empty sites array for this test
            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => null),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [siteWithNoMonitors],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: siteWithNoMonitors })
            );

            expect(result.current.selectedMonitor).toBeUndefined();
            expect(result.current.isMonitoring).toBe(false);
        });

        it("should handle site not found in store", () => {
            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => null),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [], // Empty sites array
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.currentSite.name).toBe("Unnamed Site");
            expect(result.current.currentSite.monitoring).toBe(true);
            expect(result.current.currentSite.monitors).toEqual([]);
        });
    });

    describe("State Management", () => {
        it("should track local name changes", () => {
            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.localName).toBe("Test Site");
            expect(result.current.hasUnsavedChanges).toBe(false);

            // Simulate name change using act for state updates
            act(() => {
                result.current.setLocalName("New Site Name");
            });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        it("should track monitoring state", () => {
            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.isMonitoring).toBe(true);
            expect(result.current.selectedMonitor).toBeDefined();
        });

        it("should have default values for monitor settings", () => {
            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.localCheckInterval).toBe(60_000);
            expect(result.current.localTimeout).toBeDefined();
            expect(result.current.localRetryAttempts).toBe(3);
        });
    });

    describe("Handler Functions", () => {
        it("should provide all required handlers", () => {
            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(typeof result.current.handleCheckNow).toBe("function");
            expect(typeof result.current.handleMonitorIdChange).toBe(
                "function"
            );
            expect(typeof result.current.handleRemoveMonitor).toBe("function");
            expect(typeof result.current.handleRemoveSite).toBe("function");
            expect(typeof result.current.handleStartMonitoring).toBe(
                "function"
            );
            expect(typeof result.current.handleStopMonitoring).toBe("function");
            expect(typeof result.current.handleSaveName).toBe("function");
        });

        it("should call store functions when handlers are invoked", async () => {
            const mockCheckSiteNow = vi.fn();
            (useSitesStore as any).mockReturnValue({
                checkSiteNow: mockCheckSiteNow,
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await result.current.handleCheckNow();

            expect(mockCheckSiteNow).toHaveBeenCalledWith(
                "site-1",
                "monitor-1"
            );
        });
    });

    describe("Analytics Integration", () => {
        it("should integrate with site analytics", () => {
            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.analytics).toBeDefined();
            expect(useSiteAnalytics).toHaveBeenCalled();
        });
    });

    describe("UI Store Integration", () => {
        it("should integrate with UI store", () => {
            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.activeSiteDetailsTab).toBe("overview");
            expect(result.current.showAdvancedMetrics).toBe(false);
            expect(result.current.siteDetailsChartTimeRange).toBe("1h");
            expect(typeof result.current.setActiveSiteDetailsTab).toBe(
                "function"
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle loading state from error store", () => {
            (useErrorStore as any).mockReturnValue({
                clearError: vi.fn(),
                isLoading: true,
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.isLoading).toBe(true);
        });
    });

    describe("Monitor Selection", () => {
        it("should handle monitor ID changes", () => {
            const mockSetSelectedMonitorId = vi.fn();
            const mockSetActiveSiteDetailsTab = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            (useUIStore as any).mockReturnValue({
                activeSiteDetailsTab: "monitor-1-analytics",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
                setShowAdvancedMetrics: vi.fn(),
                setSiteDetailsChartTimeRange: vi.fn(),
                showAdvancedMetrics: false,
                siteDetailsChartTimeRange: "1h",
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            result.current.handleMonitorIdChange(mockEvent);

            expect(mockSetSelectedMonitorId).toHaveBeenCalledWith(
                "site-1",
                "monitor-2"
            );
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith(
                "monitor-2-analytics"
            );
        });
    });
});
