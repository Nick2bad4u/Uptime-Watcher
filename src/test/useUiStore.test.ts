/**
 * Test suite for useUIStore.
 * Comprehensive tests for UI store functionality.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUIStore } from "../stores/ui/useUiStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import type { Site, ChartTimeRange } from "../stores/types";

// Mock the logger
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

// Mock the sites store
vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: {
        getState: vi.fn(),
    },
}));

const mockGetState = vi.mocked(useSitesStore.getState);

// Helper function to create mock sites state
const createMockSitesState = (sites: Site[] = []) => {
    return {
        sites,
        selectedMonitorIds: {},
        selectedSiteId: undefined,
        // Mock all the actions as no-ops since we only need the state
        initializeSites: vi.fn(),
        createSite: vi.fn(),
        deleteSite: vi.fn(),
        checkSiteNow: vi.fn(),
        modifySite: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
        addMonitorToSite: vi.fn(),
        syncSitesFromBackend: vi.fn(),
        fullSyncFromBackend: vi.fn(),
        setSites: vi.fn(),
        addSite: vi.fn(),
        removeSite: vi.fn(),
        setSelectedSite: vi.fn(),
        setSelectedMonitorId: vi.fn(),
        getSelectedMonitorId: vi.fn(),
        getSelectedSite: vi.fn(),
        subscribeToStatusUpdates: vi.fn(),
        unsubscribeFromStatusUpdates: vi.fn(),
        downloadSQLiteBackup: vi.fn(),
    };
};

describe("useUIStore", () => {
    beforeEach(() => {
        // Reset the store before each test
        useUIStore.setState({
            activeSiteDetailsTab: "overview",
            selectedSiteId: undefined,
            showAdvancedMetrics: false,
            showSettings: false,
            showSiteDetails: false,
            siteDetailsChartTimeRange: "24h",
        });
        
        // Reset mocks
        vi.clearAllMocks();
    });

    describe("site details tab management", () => {
        it("should initialize with overview tab", () => {
            const { result } = renderHook(() => useUIStore());
            
            expect(result.current.activeSiteDetailsTab).toBe("overview");
        });

        it("should set active site details tab", () => {
            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setActiveSiteDetailsTab("analytics");
            });
            
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
        });

        it("should handle different tab values", () => {
            const { result } = renderHook(() => useUIStore());
            
            const tabs = ["overview", "analytics", "history", "settings"];
            
            for (const tab of tabs) {
                act(() => {
                    result.current.setActiveSiteDetailsTab(tab);
                });
                
                expect(result.current.activeSiteDetailsTab).toBe(tab);
            }
        });
    });

    describe("site selection", () => {
        const mockSite: Site = {
            identifier: "site1",
            name: "Test Site",
            monitors: [],
        };

        it("should set selected site", () => {
            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setSelectedSite(mockSite);
            });
            
            expect(result.current.selectedSiteId).toBe("site1");
        });

        it("should clear selected site", () => {
            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setSelectedSite(mockSite);
            });
            
            expect(result.current.selectedSiteId).toBe("site1");
            
            act(() => {
                result.current.setSelectedSite(undefined);
            });
            
            expect(result.current.selectedSiteId).toBeUndefined();
        });

        it("should get selected site from sites store", () => {
            const mockSitesState = createMockSitesState([mockSite]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setSelectedSite(mockSite);
            });
            
            const selectedSite = result.current.getSelectedSite();
            expect(selectedSite).toEqual(mockSite);
        });

        it("should return undefined when no site is selected", () => {
            const { result } = renderHook(() => useUIStore());
            
            const selectedSite = result.current.getSelectedSite();
            expect(selectedSite).toBeUndefined();
        });

        it("should return undefined when selected site is not found", () => {
            const mockSitesState = createMockSitesState([]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setSelectedSite(mockSite);
            });
            
            const selectedSite = result.current.getSelectedSite();
            expect(selectedSite).toBeUndefined();
        });
    });

    describe("modal and visibility states", () => {
        it("should set show advanced metrics", () => {
            const { result } = renderHook(() => useUIStore());
            
            expect(result.current.showAdvancedMetrics).toBe(false);
            
            act(() => {
                result.current.setShowAdvancedMetrics(true);
            });
            
            expect(result.current.showAdvancedMetrics).toBe(true);
            
            act(() => {
                result.current.setShowAdvancedMetrics(false);
            });
            
            expect(result.current.showAdvancedMetrics).toBe(false);
        });

        it("should set show settings", () => {
            const { result } = renderHook(() => useUIStore());
            
            expect(result.current.showSettings).toBe(false);
            
            act(() => {
                result.current.setShowSettings(true);
            });
            
            expect(result.current.showSettings).toBe(true);
            
            act(() => {
                result.current.setShowSettings(false);
            });
            
            expect(result.current.showSettings).toBe(false);
        });

        it("should set show site details", () => {
            const { result } = renderHook(() => useUIStore());
            
            expect(result.current.showSiteDetails).toBe(false);
            
            act(() => {
                result.current.setShowSiteDetails(true);
            });
            
            expect(result.current.showSiteDetails).toBe(true);
            
            act(() => {
                result.current.setShowSiteDetails(false);
            });
            
            expect(result.current.showSiteDetails).toBe(false);
        });
    });

    describe("chart time range", () => {
        it("should initialize with 24h time range", () => {
            const { result } = renderHook(() => useUIStore());
            
            expect(result.current.siteDetailsChartTimeRange).toBe("24h");
        });

        it("should set site details chart time range", () => {
            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setSiteDetailsChartTimeRange("7d");
            });
            
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });

        it("should handle different time range values", () => {
            const { result } = renderHook(() => useUIStore());
            
            const timeRanges: ChartTimeRange[] = ["1h", "24h", "7d", "30d"];
            
            for (const range of timeRanges) {
                act(() => {
                    result.current.setSiteDetailsChartTimeRange(range);
                });
                
                expect(result.current.siteDetailsChartTimeRange).toBe(range);
            }
        });
    });

    describe("complex scenarios", () => {
        it("should handle multiple state changes", () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [],
            };

            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setSelectedSite(mockSite);
                result.current.setActiveSiteDetailsTab("analytics");
                result.current.setShowSiteDetails(true);
                result.current.setShowAdvancedMetrics(true);
                result.current.setSiteDetailsChartTimeRange("7d");
            });
            
            expect(result.current.selectedSiteId).toBe("site1");
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.showSiteDetails).toBe(true);
            expect(result.current.showAdvancedMetrics).toBe(true);
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });

        it("should handle site change and tab persistence", () => {
            const mockSite1: Site = {
                identifier: "site1",
                name: "Test Site 1",
                monitors: [],
            };

            const mockSite2: Site = {
                identifier: "site2",
                name: "Test Site 2",
                monitors: [],
            };

            const { result } = renderHook(() => useUIStore());
            
            act(() => {
                result.current.setSelectedSite(mockSite1);
                result.current.setActiveSiteDetailsTab("analytics");
            });
            
            expect(result.current.selectedSiteId).toBe("site1");
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            
            act(() => {
                result.current.setSelectedSite(mockSite2);
            });
            
            expect(result.current.selectedSiteId).toBe("site2");
            expect(result.current.activeSiteDetailsTab).toBe("analytics"); // Should persist
        });
    });
});
