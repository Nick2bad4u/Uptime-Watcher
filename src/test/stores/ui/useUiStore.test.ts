/**
 * Comprehensive tests for useUIStore.
 * Ensures complete coverage of UI state management functionality.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../../shared/types";

import { useUIStore } from "../../../stores/ui/useUiStore";

// Mock the shared utils
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

// Mock localStorage for persistence testing
const localStorageMock = {
    clear: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

describe("useUIStore", () => {
    const mockSite: Site = {
        identifier: "test-site-123",
        name: "Test Site",
        monitoring: true,
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                status: "up",
                monitoring: true,
                responseTime: 200,
                checkInterval: 300,
                timeout: 30,
                retryAttempts: 3,
                history: [],
                url: "https://example.com",
            },
        ],
    };

    beforeEach(() => {
        // Reset store state before each test
        const store = useUIStore.getState();
        act(() => {
            store.setActiveSiteDetailsTab("site-overview");
            store.setSelectedSite(undefined);
            store.setShowAdvancedMetrics(false);
            store.setShowSettings(false);
            store.setShowSiteDetails(false);
            store.setSiteDetailsChartTimeRange("24h");
        });
        vi.clearAllMocks();
        localStorageMock.clear();
        localStorageMock.getItem.mockReturnValue(null);
    });

    describe("Initial State", () => {
        it("should initialize with correct default values", () => {
            const { result } = renderHook(() => useUIStore());

            expect(result.current.activeSiteDetailsTab).toBe("site-overview");
            expect(result.current.selectedSiteId).toBeUndefined();
            expect(result.current.showAdvancedMetrics).toBe(false);
            expect(result.current.showSettings).toBe(false);
            expect(result.current.showSiteDetails).toBe(false);
            expect(result.current.siteDetailsChartTimeRange).toBe("24h");
        });

        it("should have all required action methods", () => {
            const { result } = renderHook(() => useUIStore());

            expect(typeof result.current.setActiveSiteDetailsTab).toBe("function");
            expect(typeof result.current.setSelectedSite).toBe("function");
            expect(typeof result.current.setShowAdvancedMetrics).toBe("function");
            expect(typeof result.current.setShowSettings).toBe("function");
            expect(typeof result.current.setShowSiteDetails).toBe("function");
            expect(typeof result.current.setSiteDetailsChartTimeRange).toBe("function");
        });
    });

    describe("Site Details Tab Management", () => {
        it("should set active site details tab", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setActiveSiteDetailsTab("analytics");
            });

            expect(result.current.activeSiteDetailsTab).toBe("analytics");
        });

        it("should handle different tab names", () => {
            const { result } = renderHook(() => useUIStore());

            const tabs = ["site-overview", "analytics", "history", "settings"];

            tabs.forEach((tab) => {
                act(() => {
                    result.current.setActiveSiteDetailsTab(tab);
                });
                expect(result.current.activeSiteDetailsTab).toBe(tab);
            });
        });

        it("should handle empty string tab", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setActiveSiteDetailsTab("");
            });

            expect(result.current.activeSiteDetailsTab).toBe("");
        });

        it("should handle special characters in tab names", () => {
            const { result } = renderHook(() => useUIStore());

            const specialTab = "tab-with-special-chars!@#$%";

            act(() => {
                result.current.setActiveSiteDetailsTab(specialTab);
            });

            expect(result.current.activeSiteDetailsTab).toBe(specialTab);
        });
    });

    describe("Site Selection Management", () => {
        it("should set selected site with site object", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSelectedSite(mockSite);
            });

            expect(result.current.selectedSiteId).toBe(mockSite.identifier);
        });

        it("should clear selected site with undefined", () => {
            const { result } = renderHook(() => useUIStore());

            // First set a site
            act(() => {
                result.current.setSelectedSite(mockSite);
            });
            expect(result.current.selectedSiteId).toBe(mockSite.identifier);

            // Then clear it
            act(() => {
                result.current.setSelectedSite(undefined);
            });
            expect(result.current.selectedSiteId).toBeUndefined();
        });

        it("should handle site with different identifier", () => {
            const { result } = renderHook(() => useUIStore());

            const differentSite: Site = {
                ...mockSite,
                identifier: "different-site-456",
            };

            act(() => {
                result.current.setSelectedSite(differentSite);
            });

            expect(result.current.selectedSiteId).toBe("different-site-456");
        });

        it("should handle site with empty identifier", () => {
            const { result } = renderHook(() => useUIStore());

            const emptySite: Site = {
                ...mockSite,
                identifier: "",
            };

            act(() => {
                result.current.setSelectedSite(emptySite);
            });

            expect(result.current.selectedSiteId).toBe("");
        });

        it("should overwrite previous selection", () => {
            const { result } = renderHook(() => useUIStore());

            const site1: Site = { ...mockSite, identifier: "site-1" };
            const site2: Site = { ...mockSite, identifier: "site-2" };

            act(() => {
                result.current.setSelectedSite(site1);
            });
            expect(result.current.selectedSiteId).toBe("site-1");

            act(() => {
                result.current.setSelectedSite(site2);
            });
            expect(result.current.selectedSiteId).toBe("site-2");
        });
    });

    describe("Advanced Metrics Visibility", () => {
        it("should show advanced metrics", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowAdvancedMetrics(true);
            });

            expect(result.current.showAdvancedMetrics).toBe(true);
        });

        it("should hide advanced metrics", () => {
            const { result } = renderHook(() => useUIStore());

            // First show them
            act(() => {
                result.current.setShowAdvancedMetrics(true);
            });
            expect(result.current.showAdvancedMetrics).toBe(true);

            // Then hide them
            act(() => {
                result.current.setShowAdvancedMetrics(false);
            });
            expect(result.current.showAdvancedMetrics).toBe(false);
        });

        it("should toggle advanced metrics multiple times", () => {
            const { result } = renderHook(() => useUIStore());

            for (let i = 0; i < 5; i++) {
                act(() => {
                    result.current.setShowAdvancedMetrics(true);
                });
                expect(result.current.showAdvancedMetrics).toBe(true);

                act(() => {
                    result.current.setShowAdvancedMetrics(false);
                });
                expect(result.current.showAdvancedMetrics).toBe(false);
            }
        });
    });

    describe("Settings Modal Management", () => {
        it("should show settings modal", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSettings(true);
            });

            expect(result.current.showSettings).toBe(true);
        });

        it("should hide settings modal", () => {
            const { result } = renderHook(() => useUIStore());

            // First show it
            act(() => {
                result.current.setShowSettings(true);
            });
            expect(result.current.showSettings).toBe(true);

            // Then hide it
            act(() => {
                result.current.setShowSettings(false);
            });
            expect(result.current.showSettings).toBe(false);
        });

        it("should toggle settings modal multiple times", () => {
            const { result } = renderHook(() => useUIStore());

            for (let i = 0; i < 3; i++) {
                act(() => {
                    result.current.setShowSettings(true);
                });
                expect(result.current.showSettings).toBe(true);

                act(() => {
                    result.current.setShowSettings(false);
                });
                expect(result.current.showSettings).toBe(false);
            }
        });
    });

    describe("Site Details Modal Management", () => {
        it("should show site details modal", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSiteDetails(true);
            });

            expect(result.current.showSiteDetails).toBe(true);
        });

        it("should hide site details modal", () => {
            const { result } = renderHook(() => useUIStore());

            // First show it
            act(() => {
                result.current.setShowSiteDetails(true);
            });
            expect(result.current.showSiteDetails).toBe(true);

            // Then hide it
            act(() => {
                result.current.setShowSiteDetails(false);
            });
            expect(result.current.showSiteDetails).toBe(false);
        });

        it("should handle simultaneous modal states", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSettings(true);
                result.current.setShowSiteDetails(true);
            });

            expect(result.current.showSettings).toBe(true);
            expect(result.current.showSiteDetails).toBe(true);
        });
    });

    describe("Chart Time Range Management", () => {
        it("should set chart time range to 1h", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("1h");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("1h");
        });

        it("should set chart time range to 24h", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("24h");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("24h");
        });

        it("should set chart time range to 7d", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("7d");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });

        it("should set chart time range to 30d", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("30d");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("30d");
        });

        it("should handle all valid time ranges", () => {
            const { result } = renderHook(() => useUIStore());

            const timeRanges = ["1h", "24h", "7d", "30d"] as const;

            timeRanges.forEach((range) => {
                act(() => {
                    result.current.setSiteDetailsChartTimeRange(range);
                });
                expect(result.current.siteDetailsChartTimeRange).toBe(range);
            });
        });

        it("should change time range multiple times", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("1h");
            });
            expect(result.current.siteDetailsChartTimeRange).toBe("1h");

            act(() => {
                result.current.setSiteDetailsChartTimeRange("7d");
            });
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");

            act(() => {
                result.current.setSiteDetailsChartTimeRange("30d");
            });
            expect(result.current.siteDetailsChartTimeRange).toBe("30d");
        });
    });

    describe("State Persistence and Reactivity", () => {
        it("should maintain state across multiple hook instances", () => {
            const { result: result1 } = renderHook(() => useUIStore());
            const { result: result2 } = renderHook(() => useUIStore());

            act(() => {
                result1.current.setShowAdvancedMetrics(true);
            });

            expect(result2.current.showAdvancedMetrics).toBe(true);
        });

        it("should react to state changes immediately", () => {
            const { result } = renderHook(() => useUIStore());

            expect(result.current.showSettings).toBe(false);

            act(() => {
                result.current.setShowSettings(true);
            });

            expect(result.current.showSettings).toBe(true);
        });

        it("should handle rapid state changes", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSettings(true);
                result.current.setShowSiteDetails(true);
                result.current.setShowAdvancedMetrics(true);
                result.current.setActiveSiteDetailsTab("analytics");
                result.current.setSiteDetailsChartTimeRange("7d");
            });

            expect(result.current.showSettings).toBe(true);
            expect(result.current.showSiteDetails).toBe(true);
            expect(result.current.showAdvancedMetrics).toBe(true);
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });
    });

    describe("Complex Scenarios", () => {
        it("should handle full workflow scenario", () => {
            const { result } = renderHook(() => useUIStore());

            // User opens settings
            act(() => {
                result.current.setShowSettings(true);
            });
            expect(result.current.showSettings).toBe(true);

            // User enables advanced metrics
            act(() => {
                result.current.setShowAdvancedMetrics(true);
            });
            expect(result.current.showAdvancedMetrics).toBe(true);

            // User closes settings
            act(() => {
                result.current.setShowSettings(false);
            });
            expect(result.current.showSettings).toBe(false);

            // User selects a site
            act(() => {
                result.current.setSelectedSite(mockSite);
            });
            expect(result.current.selectedSiteId).toBe(mockSite.identifier);

            // User opens site details
            act(() => {
                result.current.setShowSiteDetails(true);
            });
            expect(result.current.showSiteDetails).toBe(true);

            // User switches to analytics tab
            act(() => {
                result.current.setActiveSiteDetailsTab("analytics");
            });
            expect(result.current.activeSiteDetailsTab).toBe("analytics");

            // User changes time range
            act(() => {
                result.current.setSiteDetailsChartTimeRange("7d");
            });
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");

            // User closes site details
            act(() => {
                result.current.setShowSiteDetails(false);
            });
            expect(result.current.showSiteDetails).toBe(false);

            // Advanced metrics should still be enabled
            expect(result.current.showAdvancedMetrics).toBe(true);
            // Tab and time range should be preserved
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });

        it("should handle multiple site selections", () => {
            const { result } = renderHook(() => useUIStore());

            const sites = [
                { ...mockSite, identifier: "site-1" },
                { ...mockSite, identifier: "site-2" },
                { ...mockSite, identifier: "site-3" },
            ];

            sites.forEach((site) => {
                act(() => {
                    result.current.setSelectedSite(site);
                });
                expect(result.current.selectedSiteId).toBe(site.identifier);
            });

            // Clear selection
            act(() => {
                result.current.setSelectedSite(undefined);
            });
            expect(result.current.selectedSiteId).toBeUndefined();
        });

        it("should handle edge case with multiple simultaneous changes", () => {
            const { result } = renderHook(() => useUIStore());

            // Simulate rapid UI interactions
            act(() => {
                result.current.setSelectedSite(mockSite);
                result.current.setShowSiteDetails(true);
                result.current.setActiveSiteDetailsTab("history");
                result.current.setSiteDetailsChartTimeRange("30d");
                result.current.setShowAdvancedMetrics(true);
                result.current.setShowSettings(false);
            });

            expect(result.current.selectedSiteId).toBe(mockSite.identifier);
            expect(result.current.showSiteDetails).toBe(true);
            expect(result.current.activeSiteDetailsTab).toBe("history");
            expect(result.current.siteDetailsChartTimeRange).toBe("30d");
            expect(result.current.showAdvancedMetrics).toBe(true);
            expect(result.current.showSettings).toBe(false);
        });

        it("should maintain independent state for different properties", () => {
            const { result } = renderHook(() => useUIStore());

            // Set some state
            act(() => {
                result.current.setShowAdvancedMetrics(true);
                result.current.setActiveSiteDetailsTab("analytics");
            });

            // Verify they're independent
            act(() => {
                result.current.setShowSettings(true);
            });

            expect(result.current.showAdvancedMetrics).toBe(true);
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.showSettings).toBe(true);

            // Change one property
            act(() => {
                result.current.setShowAdvancedMetrics(false);
            });

            // Others should remain unchanged
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.showSettings).toBe(true);
            expect(result.current.showAdvancedMetrics).toBe(false);
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle setting same values multiple times", () => {
            const { result } = renderHook(() => useUIStore());

            // Set the same value multiple times
            for (let i = 0; i < 5; i++) {
                act(() => {
                    result.current.setShowSettings(true);
                });
                expect(result.current.showSettings).toBe(true);
            }

            for (let i = 0; i < 5; i++) {
                act(() => {
                    result.current.setActiveSiteDetailsTab("analytics");
                });
                expect(result.current.activeSiteDetailsTab).toBe("analytics");
            }
        });

        it("should handle undefined site selection gracefully", () => {
            const { result } = renderHook(() => useUIStore());

            // Set a site first
            act(() => {
                result.current.setSelectedSite(mockSite);
            });
            expect(result.current.selectedSiteId).toBe(mockSite.identifier);

            // Clear with undefined multiple times
            act(() => {
                result.current.setSelectedSite(undefined);
                result.current.setSelectedSite(undefined);
                result.current.setSelectedSite(undefined);
            });
            expect(result.current.selectedSiteId).toBeUndefined();
        });

        it("should handle boolean state transitions correctly", () => {
            const { result } = renderHook(() => useUIStore());

            const booleanActions = [
                result.current.setShowSettings,
                result.current.setShowSiteDetails,
                result.current.setShowAdvancedMetrics,
            ];

            const booleanStates = [
                () => result.current.showSettings,
                () => result.current.showSiteDetails,
                () => result.current.showAdvancedMetrics,
            ];

            booleanActions.forEach((action, index) => {
                const getState = booleanStates[index]!;

                // Should start false
                expect(getState!()).toBe(false);

                // Set true
                act(() => {
                    action(true);
                });
                expect(getState!()).toBe(true);

                // Set false
                act(() => {
                    action(false);
                });
                expect(getState!()).toBe(false);

                // Set true again
                act(() => {
                    action(true);
                });
                expect(getState!()).toBe(true);
            });
        });
    });
});
