/**
 * Comprehensive tests for useUIStore. Ensures complete coverage of UI state
 * management functionality.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../../shared/types";
import type { SiteListLayoutMode } from "../../../stores/ui/types";

import { useUIStore } from "../../../stores/ui/useUiStore";

// Mock the shared utils
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock localStorage for persistence testing
const localStorageMock = {
    clear: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(),
};

Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
});

describe(useUIStore, () => {
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
            store.selectSite(undefined);
            store.setShowAdvancedMetrics(false);
            store.setShowSettings(false);
            store.setShowSiteDetails(false);
            store.setSiteDetailsChartTimeRange("24h");
            store.setSiteListLayout("card-large");
        });
        vi.clearAllMocks();
        localStorageMock.clear();
        localStorageMock.getItem.mockReturnValue(null);
    });

    describe("Initial State", () => {
        it("should initialize with correct default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useUIStore());

            expect(result.current.activeSiteDetailsTab).toBe("site-overview");
            expect(result.current.selectedSiteId).toBeUndefined();
            expect(result.current.showAdvancedMetrics).toBeFalsy();
            expect(result.current.showSettings).toBeFalsy();
            expect(result.current.showSiteDetails).toBeFalsy();
            expect(result.current.siteDetailsChartTimeRange).toBe("24h");
            expect(result.current.siteListLayout).toBe("card-large");
        });

        it("should have all required action methods", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            expect(typeof result.current.setActiveSiteDetailsTab).toBe(
                "function"
            );
            expect(typeof result.current.selectSite).toBe("function");
            expect(typeof result.current.setShowAdvancedMetrics).toBe(
                "function"
            );
            expect(typeof result.current.setShowSettings).toBe("function");
            expect(typeof result.current.setShowSiteDetails).toBe("function");
            expect(typeof result.current.setSiteDetailsChartTimeRange).toBe(
                "function"
            );
            expect(typeof result.current.setSiteListLayout).toBe("function");
        });
    });

    describe("Site Details Tab Management", () => {
        it("should set active site details tab", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setActiveSiteDetailsTab("analytics");
            });

            expect(result.current.activeSiteDetailsTab).toBe("analytics");
        });

        it("should handle different tab names", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const tabs = [
                "site-overview",
                "analytics",
                "history",
                "settings",
            ];

            for (const tab of tabs) {
                act(() => {
                    result.current.setActiveSiteDetailsTab(tab);
                });
                expect(result.current.activeSiteDetailsTab).toBe(tab);
            }
        });

        it("should handle empty string tab", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setActiveSiteDetailsTab("");
            });

            expect(result.current.activeSiteDetailsTab).toBe("");
        });

        it("should handle special characters in tab names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const specialTab = "tab-with-special-chars!@#$%";

            act(() => {
                result.current.setActiveSiteDetailsTab(specialTab);
            });

            expect(result.current.activeSiteDetailsTab).toBe(specialTab);
        });
    });

    describe("Site Selection Management", () => {
        it("should set selected site with site object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.selectSite(mockSite);
            });

            expect(result.current.selectedSiteId).toBe(mockSite.identifier);
        });

        it("should clear selected site with undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // First set a site
            act(() => {
                result.current.selectSite(mockSite);
            });
            expect(result.current.selectedSiteId).toBe(mockSite.identifier);

            // Then clear it
            act(() => {
                result.current.selectSite(undefined);
            });
            expect(result.current.selectedSiteId).toBeUndefined();
        });

        it("should handle site with different identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const differentSite: Site = {
                ...mockSite,
                identifier: "different-site-456",
            };

            act(() => {
                result.current.selectSite(differentSite);
            });

            expect(result.current.selectedSiteId).toBe("different-site-456");
        });

        it("should handle site with empty identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const emptySite: Site = {
                ...mockSite,
                identifier: "",
            };

            act(() => {
                result.current.selectSite(emptySite);
            });

            expect(result.current.selectedSiteId).toBe("");
        });

        it("should overwrite previous selection", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const site1: Site = { ...mockSite, identifier: "site-1" };
            const site2: Site = { ...mockSite, identifier: "site-2" };

            act(() => {
                result.current.selectSite(site1);
            });
            expect(result.current.selectedSiteId).toBe("site-1");

            act(() => {
                result.current.selectSite(site2);
            });
            expect(result.current.selectedSiteId).toBe("site-2");
        });
    });

    describe("Advanced Metrics Visibility", () => {
        it("should show advanced metrics", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowAdvancedMetrics(true);
            });

            expect(result.current.showAdvancedMetrics).toBeTruthy();
        });

        it("should hide advanced metrics", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // First show them
            act(() => {
                result.current.setShowAdvancedMetrics(true);
            });
            expect(result.current.showAdvancedMetrics).toBeTruthy();

            // Then hide them
            act(() => {
                result.current.setShowAdvancedMetrics(false);
            });
            expect(result.current.showAdvancedMetrics).toBeFalsy();
        });

        it("should toggle advanced metrics multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            for (let i = 0; i < 5; i++) {
                act(() => {
                    result.current.setShowAdvancedMetrics(true);
                });
                expect(result.current.showAdvancedMetrics).toBeTruthy();

                act(() => {
                    result.current.setShowAdvancedMetrics(false);
                });
                expect(result.current.showAdvancedMetrics).toBeFalsy();
            }
        });
    });

    describe("Site List Layout", () => {
        it("should update layout preference", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            expect(result.current.siteListLayout).toBe("card-large");

            act(() => {
                result.current.setSiteListLayout("list");
            });

            expect(result.current.siteListLayout).toBe("list");
        });

        it("should handle multiple layout switches", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const layouts: SiteListLayoutMode[] = [
                "card-large",
                "card-compact",
                "list",
                "card-large",
            ];

            for (const mode of layouts) {
                act(() => {
                    result.current.setSiteListLayout(mode);
                });
                expect(result.current.siteListLayout).toBe(mode);
            }
        });
    });

    describe("Settings Modal Management", () => {
        it("should show settings modal", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSettings(true);
            });

            expect(result.current.showSettings).toBeTruthy();
        });

        it("should hide settings modal", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // First show it
            act(() => {
                result.current.setShowSettings(true);
            });
            expect(result.current.showSettings).toBeTruthy();

            // Then hide it
            act(() => {
                result.current.setShowSettings(false);
            });
            expect(result.current.showSettings).toBeFalsy();
        });

        it("should toggle settings modal multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            for (let i = 0; i < 3; i++) {
                act(() => {
                    result.current.setShowSettings(true);
                });
                expect(result.current.showSettings).toBeTruthy();

                act(() => {
                    result.current.setShowSettings(false);
                });
                expect(result.current.showSettings).toBeFalsy();
            }
        });
    });

    describe("Site Details Modal Management", () => {
        it("should show site details modal", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSiteDetails(true);
            });

            expect(result.current.showSiteDetails).toBeTruthy();
        });

        it("should hide site details modal", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // First show it
            act(() => {
                result.current.setShowSiteDetails(true);
            });
            expect(result.current.showSiteDetails).toBeTruthy();

            // Then hide it
            act(() => {
                result.current.setShowSiteDetails(false);
            });
            expect(result.current.showSiteDetails).toBeFalsy();
        });

        it("should handle simultaneous modal states", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSettings(true);
                result.current.setShowSiteDetails(true);
            });

            expect(result.current.showSettings).toBeTruthy();
            expect(result.current.showSiteDetails).toBeTruthy();
        });
    });

    describe("Chart Time Range Management", () => {
        it("should set chart time range to 1h", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("1h");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("1h");
        });

        it("should set chart time range to 24h", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("24h");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("24h");
        });

        it("should set chart time range to 7d", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("7d");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });

        it("should set chart time range to 30d", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsChartTimeRange("30d");
            });

            expect(result.current.siteDetailsChartTimeRange).toBe("30d");
        });

        it("should handle all valid time ranges", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const timeRanges = [
                "1h",
                "24h",
                "7d",
                "30d",
            ] as const;

            for (const range of timeRanges) {
                act(() => {
                    result.current.setSiteDetailsChartTimeRange(range);
                });
                expect(result.current.siteDetailsChartTimeRange).toBe(range);
            }
        });

        it("should change time range multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

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
        it("should maintain state across multiple hook instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result: result1 } = renderHook(() => useUIStore());
            const { result: result2 } = renderHook(() => useUIStore());

            act(() => {
                result1.current.setShowAdvancedMetrics(true);
            });

            expect(result2.current.showAdvancedMetrics).toBeTruthy();
        });

        it("should react to state changes immediately", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            expect(result.current.showSettings).toBeFalsy();

            act(() => {
                result.current.setShowSettings(true);
            });

            expect(result.current.showSettings).toBeTruthy();
        });

        it("should handle rapid state changes", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setShowSettings(true);
                result.current.setShowSiteDetails(true);
                result.current.setShowAdvancedMetrics(true);
                result.current.setActiveSiteDetailsTab("analytics");
                result.current.setSiteDetailsChartTimeRange("7d");
            });

            expect(result.current.showSettings).toBeTruthy();
            expect(result.current.showSiteDetails).toBeTruthy();
            expect(result.current.showAdvancedMetrics).toBeTruthy();
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });
    });

    describe("Complex Scenarios", () => {
        it("should handle full workflow scenario", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // User opens settings
            act(() => {
                result.current.setShowSettings(true);
            });
            expect(result.current.showSettings).toBeTruthy();

            // User enables advanced metrics
            act(() => {
                result.current.setShowAdvancedMetrics(true);
            });
            expect(result.current.showAdvancedMetrics).toBeTruthy();

            // User closes settings
            act(() => {
                result.current.setShowSettings(false);
            });
            expect(result.current.showSettings).toBeFalsy();

            // User selects a site
            act(() => {
                result.current.selectSite(mockSite);
            });
            expect(result.current.selectedSiteId).toBe(mockSite.identifier);

            // User opens site details
            act(() => {
                result.current.setShowSiteDetails(true);
            });
            expect(result.current.showSiteDetails).toBeTruthy();

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
            expect(result.current.showSiteDetails).toBeFalsy();

            // Advanced metrics should still be enabled
            expect(result.current.showAdvancedMetrics).toBeTruthy();
            // Tab and time range should be preserved
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
        });

        it("should handle multiple site selections", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const sites = [
                { ...mockSite, identifier: "site-1" },
                { ...mockSite, identifier: "site-2" },
                { ...mockSite, identifier: "site-3" },
            ];

            for (const site of sites) {
                act(() => {
                    result.current.selectSite(site);
                });
                expect(result.current.selectedSiteId).toBe(site.identifier);
            }

            // Clear selection
            act(() => {
                result.current.selectSite(undefined);
            });
            expect(result.current.selectedSiteId).toBeUndefined();
        });

        it("should handle edge case with multiple simultaneous changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // Simulate rapid UI interactions
            act(() => {
                result.current.selectSite(mockSite);
                result.current.setShowSiteDetails(true);
                result.current.setActiveSiteDetailsTab("history");
                result.current.setSiteDetailsChartTimeRange("30d");
                result.current.setShowAdvancedMetrics(true);
                result.current.setShowSettings(false);
            });

            expect(result.current.selectedSiteId).toBe(mockSite.identifier);
            expect(result.current.showSiteDetails).toBeTruthy();
            expect(result.current.activeSiteDetailsTab).toBe("history");
            expect(result.current.siteDetailsChartTimeRange).toBe("30d");
            expect(result.current.showAdvancedMetrics).toBeTruthy();
            expect(result.current.showSettings).toBeFalsy();
        });

        it("should maintain independent state for different properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

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

            expect(result.current.showAdvancedMetrics).toBeTruthy();
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.showSettings).toBeTruthy();

            // Change one property
            act(() => {
                result.current.setShowAdvancedMetrics(false);
            });

            // Others should remain unchanged
            expect(result.current.activeSiteDetailsTab).toBe("analytics");
            expect(result.current.showSettings).toBeTruthy();
            expect(result.current.showAdvancedMetrics).toBeFalsy();
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle setting same values multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // Set the same value multiple times
            for (let i = 0; i < 5; i++) {
                act(() => {
                    result.current.setShowSettings(true);
                });
                expect(result.current.showSettings).toBeTruthy();
            }

            for (let i = 0; i < 5; i++) {
                act(() => {
                    result.current.setActiveSiteDetailsTab("analytics");
                });
                expect(result.current.activeSiteDetailsTab).toBe("analytics");
            }
        });

        it("should handle undefined site selection gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // Set a site first
            act(() => {
                result.current.selectSite(mockSite);
            });
            expect(result.current.selectedSiteId).toBe(mockSite.identifier);

            // Clear with undefined multiple times
            act(() => {
                result.current.selectSite(undefined);
                result.current.selectSite(undefined);
                result.current.selectSite(undefined);
            });
            expect(result.current.selectedSiteId).toBeUndefined();
        });

        it("should handle boolean state transitions correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

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

            for (const [index, action] of booleanActions.entries()) {
                const getState = booleanStates[index]!;

                // Should start false
                expect(getState!()).toBeFalsy();

                // Set true
                act(() => {
                    action(true);
                });
                expect(getState!()).toBeTruthy();

                // Set false
                act(() => {
                    action(false);
                });
                expect(getState!()).toBeFalsy();

                // Set true again
                act(() => {
                    action(true);
                });
                expect(getState!()).toBeTruthy();
            }
        });
    });
});
