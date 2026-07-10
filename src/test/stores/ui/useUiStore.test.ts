/**
 * Comprehensive tests for useUIStore. Ensures complete coverage of UI state
 * management functionality.
 */

import type { Site } from "@shared/types";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    SiteDetailsTab,
    SiteListLayoutMode,
} from "../../../stores/ui/types";

import { useUIStore } from "../../../stores/ui/useUiStore";
import { logStoreAction } from "../../../stores/utils";

// Mock the store utils (partial) so createPersistConfig remains available.
vi.mock("../../../stores/utils", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../stores/utils")>();
    return {
        ...actual,
        logStoreAction: vi.fn(),
        // Prior bridge helper mock removed
    };
});

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

    const analyticsTab: SiteDetailsTab = "monitor-1-analytics";

    beforeEach(() => {
        // Reset store state before each test
        const store = useUIStore.getState();
        act(() => {
            useUIStore.setState({
                siteDetailsHeaderCollapsedState: Object.create(null) as Record<
                    string,
                    boolean
                >,
                siteDetailsTabState: Object.create(null) as Record<
                    string,
                    SiteDetailsTab
                >,
                siteTableColumnWidths: {
                    ...useUIStore.getInitialState().siteTableColumnWidths,
                },
            });
            store.setActiveSiteDetailsTab("site-overview");
            store.selectSite(undefined);
            store.setShowAdvancedMetrics(false);
            store.setShowSettings(false);
            store.setShowSiteDetails(false);
            store.setSiteDetailsChartTimeRange("24h");
            store.setSiteCardPresentation("grid");
            store.setSiteListLayout("list");
            store.setSurfaceDensity("compact");
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
            expect(result.current.selectedSiteIdentifier).toBeUndefined();
            expect(result.current.showAdvancedMetrics).toBeFalsy();
            expect(result.current.showSettings).toBeFalsy();
            expect(result.current.showSiteDetails).toBeFalsy();
            expect(result.current.siteDetailsChartTimeRange).toBe("24h");
            expect(result.current.siteCardPresentation).toBe("grid");
            expect(result.current.siteListLayout).toBe("list");
            expect(result.current.siteDetailsHeaderCollapsedState).toEqual({});
            expect(
                Object.getPrototypeOf(
                    result.current.siteDetailsHeaderCollapsedState
                )
            ).toBeNull();
            expect(
                Object.getPrototypeOf(result.current.siteDetailsTabState)
            ).toBeNull();
            expect(result.current.siteTableColumnWidths).toMatchObject({
                controls: 16,
                monitor: 14,
                response: 12,
                running: 10,
                site: 24,
                status: 12,
                uptime: 12,
            });
            expect(result.current.surfaceDensity).toBe("compact");
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
            expect(typeof result.current.setSiteTableColumnWidths).toBe(
                "function"
            );
            expect(typeof result.current.setSiteDetailsHeaderCollapsed).toBe(
                "function"
            );
            expect(typeof result.current.toggleSiteDetailsHeaderCollapsed).toBe(
                "function"
            );
        });
    });

    describe("Table Column Resizing", () => {
        it("should update specific column widths while leaving others intact", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteTableColumnWidths({
                    site: 28,
                    response: 10,
                });
            });

            expect(result.current.siteTableColumnWidths.site).toBe(28);
            expect(result.current.siteTableColumnWidths.response).toBe(10);
            expect(result.current.siteTableColumnWidths.controls).toBe(16);
        });

        it("should ignore invalid column widths", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Validation", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteTableColumnWidths({
                    controls: Infinity,
                    monitor: -Infinity,
                    response: Number.NaN,
                    running: 0,
                    site: -1,
                    status: 18,
                });
            });

            expect(result.current.siteTableColumnWidths.controls).toBe(16);
            expect(result.current.siteTableColumnWidths.monitor).toBe(14);
            expect(result.current.siteTableColumnWidths.response).toBe(12);
            expect(result.current.siteTableColumnWidths.running).toBe(10);
            expect(result.current.siteTableColumnWidths.site).toBe(24);
            expect(result.current.siteTableColumnWidths.status).toBe(18);
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
                result.current.setActiveSiteDetailsTab(analyticsTab);
            });

            expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);
        });

        it("should handle different tab names", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            const tabs: SiteDetailsTab[] = [
                "site-overview",
                "monitor-overview",
                analyticsTab,
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
                result.current.setActiveSiteDetailsTab("" as SiteDetailsTab);
            });

            expect(result.current.activeSiteDetailsTab).toBe(
                "" as SiteDetailsTab
            );
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

            const specialTab: SiteDetailsTab =
                "tab-with-special-chars!@#$%-analytics";

            act(() => {
                result.current.setActiveSiteDetailsTab(specialTab);
            });

            expect(result.current.activeSiteDetailsTab).toBe(specialTab);
        });

        it("should persist tab selection per site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Persistence", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.selectSite(mockSite);
                result.current.setActiveSiteDetailsTab("history");
            });

            expect(result.current.activeSiteDetailsTab).toBe("history");
            expect(
                result.current.siteDetailsTabState[mockSite.identifier]
            ).toBe("history");
        });

        it("should preserve prototype-named site keys in tab state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Safety", "type");

            const { result } = renderHook(() => useUIStore());
            const prototypeNamedSite: Site = {
                ...mockSite,
                identifier: "__proto__",
            };

            act(() => {
                result.current.selectSite(prototypeNamedSite);
                result.current.setActiveSiteDetailsTab("history");
            });

            expect(
                Object.getPrototypeOf(result.current.siteDetailsTabState)
            ).toBeNull();
            expect(
                Object.hasOwn(result.current.siteDetailsTabState, "__proto__")
            ).toBe(true);
            expect(
                Object.getOwnPropertyDescriptor(
                    result.current.siteDetailsTabState,
                    "__proto__"
                )?.value
            ).toBe("history");
        });

        it("should summarize and redact selected site telemetry", () => {
            const sensitiveSite: Site = {
                identifier:
                    "https://user:pass@ui.example.com/path?access_token=site-secret#frag",
                monitoring: true,
                monitors: [
                    {
                        checkInterval: 300,
                        history: [],
                        id: "monitor-1",
                        monitoring: true,
                        responseTime: 200,
                        retryAttempts: 3,
                        status: "up",
                        timeout: 30,
                        type: "http",
                        url: "https://user:pass@monitor.example.com/check?refresh_token=monitor-secret#hash",
                    },
                ],
                name: "Sensitive UI site name",
            };
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.selectSite(sensitiveSite);
            });

            const telemetry = vi
                .mocked(logStoreAction)
                .mock.calls.filter(
                    ([storeName, actionName]) =>
                        storeName === "UIStore" && actionName === "selectSite"
                )
                .map((call) => call[2]);

            expect(telemetry).not.toHaveLength(0);
            expect(telemetry.at(-1)).toMatchObject({
                monitorCount: 1,
                monitorTypes: ["http"],
                monitorUrls: ["https://monitor.example.com/check"],
                monitoring: true,
                selected: true,
                siteIdentifier: "https://ui.example.com/path",
            });

            const serializedTelemetry = JSON.stringify(telemetry);
            expect(serializedTelemetry).not.toContain("Sensitive UI site name");
            expect(serializedTelemetry).not.toContain("access_token");
            expect(serializedTelemetry).not.toContain("refresh_token");
            expect(serializedTelemetry).not.toContain("site-secret");
            expect(serializedTelemetry).not.toContain("monitor-secret");
            expect(serializedTelemetry).not.toContain("pass");
            expect(serializedTelemetry).not.toContain("frag");
            expect(serializedTelemetry).not.toContain("hash");
        });

        it("should sync tab from persisted state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Persistence", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.selectSite(mockSite);
                result.current.setActiveSiteDetailsTab(analyticsTab);
            });

            act(() => {
                result.current.selectSite(undefined);
                result.current.setActiveSiteDetailsTab("site-overview");
            });

            act(() => {
                result.current.syncActiveSiteDetailsTab(mockSite.identifier);
            });

            expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);
        });

        it("should fall back to default tab when no persisted state exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Persistence", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.syncActiveSiteDetailsTab("non-existent-site");
            });

            expect(result.current.activeSiteDetailsTab).toBe("site-overview");
            expect(
                result.current.siteDetailsTabState["non-existent-site"]
            ).toBe("site-overview");
        });
    });

    describe("Site Details Header Collapse", () => {
        it("should set collapse state for a site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.setSiteDetailsHeaderCollapsed(
                    mockSite.identifier,
                    true
                );
            });

            expect(
                result.current.siteDetailsHeaderCollapsedState[
                    mockSite.identifier
                ]
            ).toBeTruthy();

            act(() => {
                result.current.setSiteDetailsHeaderCollapsed(
                    mockSite.identifier,
                    false
                );
            });

            expect(
                result.current.siteDetailsHeaderCollapsedState[
                    mockSite.identifier
                ]
            ).toBeFalsy();
        });

        it("should preserve prototype-named site keys in collapse state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Safety", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.toggleSiteDetailsHeaderCollapsed("__proto__");
            });

            expect(
                Object.getPrototypeOf(
                    result.current.siteDetailsHeaderCollapsedState
                )
            ).toBeNull();
            expect(
                Object.hasOwn(
                    result.current.siteDetailsHeaderCollapsedState,
                    "__proto__"
                )
            ).toBe(true);
            expect(
                Object.getOwnPropertyDescriptor(
                    result.current.siteDetailsHeaderCollapsedState,
                    "__proto__"
                )?.value
            ).toBe(true);

            act(() => {
                result.current.setSiteDetailsHeaderCollapsed(
                    "__proto__",
                    false
                );
            });

            expect(
                Object.getOwnPropertyDescriptor(
                    result.current.siteDetailsHeaderCollapsedState,
                    "__proto__"
                )?.value
            ).toBe(false);
        });

        it("should toggle collapse state", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State", "type");

            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.toggleSiteDetailsHeaderCollapsed(
                    mockSite.identifier
                );
            });

            expect(
                result.current.siteDetailsHeaderCollapsedState[
                    mockSite.identifier
                ]
            ).toBeTruthy();

            act(() => {
                result.current.toggleSiteDetailsHeaderCollapsed(
                    mockSite.identifier
                );
            });

            expect(
                result.current.siteDetailsHeaderCollapsedState[
                    mockSite.identifier
                ]
            ).toBeFalsy();
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

            expect(result.current.selectedSiteIdentifier).toBe(
                mockSite.identifier
            );
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
            expect(result.current.selectedSiteIdentifier).toBe(
                mockSite.identifier
            );

            // Then clear it
            act(() => {
                result.current.selectSite(undefined);
            });
            expect(result.current.selectedSiteIdentifier).toBeUndefined();
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

            expect(result.current.selectedSiteIdentifier).toBe(
                "different-site-456"
            );
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

            expect(result.current.selectedSiteIdentifier).toBe("");
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
            expect(result.current.selectedSiteIdentifier).toBe("site-1");

            act(() => {
                result.current.selectSite(site2);
            });
            expect(result.current.selectedSiteIdentifier).toBe("site-2");
        });

        it("should close details when the removed site is still selected", () => {
            const { result } = renderHook(() => useUIStore());

            act(() => {
                result.current.selectSite(mockSite);
                result.current.setShowSiteDetails(true);
                result.current.closeSiteDetailsForSite(mockSite.identifier);
            });

            expect(result.current.selectedSiteIdentifier).toBeUndefined();
            expect(result.current.showSiteDetails).toBeFalsy();
        });

        it("should preserve a newer selection when an older deletion finishes", () => {
            const { result } = renderHook(() => useUIStore());
            const newerSite: Site = {
                ...mockSite,
                identifier: "newer-site",
            };

            act(() => {
                result.current.selectSite(newerSite);
                result.current.setShowSiteDetails(true);
                result.current.closeSiteDetailsForSite(mockSite.identifier);
            });

            expect(result.current.selectedSiteIdentifier).toBe(
                newerSite.identifier
            );
            expect(result.current.showSiteDetails).toBeTruthy();
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

            expect(result.current.siteListLayout).toBe("list");

            act(() => {
                result.current.setSiteListLayout("card-compact");
            });

            expect(result.current.siteListLayout).toBe("card-compact");
        });

        it("should migrate old persisted layout preferences to enterprise defaults", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Migration", "type");

            const migrate = useUIStore.persist.getOptions().migrate;
            expect(migrate).toBeTypeOf("function");

            const migrated = await migrate?.(
                {
                    showAdvancedMetrics: true,
                    sidebarCollapsedPreference: true,
                    siteCardPresentation: "stacked",
                    siteListLayout: "card-large",
                    surfaceDensity: "comfortable",
                },
                0
            );

            expect(migrated).toMatchObject({
                showAdvancedMetrics: true,
                sidebarCollapsedPreference: true,
                siteCardPresentation: "grid",
                siteListLayout: "list",
                surfaceDensity: "compact",
            });
        });

        it("should ignore invalid persisted UI preferences during migration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Migration", "type");

            const migrate = useUIStore.persist.getOptions().migrate;
            expect(migrate).toBeTypeOf("function");

            const migrated = await migrate?.(
                {
                    activeSiteDetailsTab: "not-a-tab",
                    showAdvancedMetrics: "true",
                    sidebarCollapsedPreference: true,
                    siteCardPresentation: "carousel",
                    siteDetailsChartTimeRange: "forever",
                    siteDetailsHeaderCollapsedState: {
                        ignored: "yes",
                        siteA: true,
                    },
                    siteDetailsTabState: {
                        siteA: "history",
                        siteB: "broken",
                    },
                    siteListLayout: "masonry",
                    siteTableColumnWidths: {
                        response: "wide",
                        site: 28,
                        status: 18,
                    },
                    surfaceDensity: "dense",
                },
                1
            );

            expect(migrated).toMatchObject({
                activeSiteDetailsTab: "site-overview",
                showAdvancedMetrics: false,
                sidebarCollapsedPreference: true,
                siteCardPresentation: "grid",
                siteDetailsChartTimeRange: "24h",
                siteDetailsHeaderCollapsedState: {
                    siteA: true,
                },
                siteDetailsTabState: {
                    siteA: "history",
                },
                siteListLayout: "list",
                siteTableColumnWidths: {
                    response: 12,
                    site: 28,
                    status: 18,
                },
                surfaceDensity: "compact",
            });
        });

        it("should normalize current-version persisted UI preferences during merge", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Persistence", "type");

            const merge = useUIStore.persist.getOptions().merge;
            expect(merge).toBeTypeOf("function");

            if (!merge) {
                throw new TypeError("UI store persist merge is missing");
            }

            const currentState = useUIStore.getState();
            const merged = merge(
                {
                    activeSiteDetailsTab: "broken-tab",
                    showAdvancedMetrics: "yes",
                    showSettings: true,
                    siteDetailsHeaderCollapsedState: {
                        ignored: "true",
                        siteA: true,
                    },
                    siteDetailsTabState: {
                        siteA: "history",
                        siteB: "unknown",
                    },
                    siteListLayout: "masonry",
                    siteTableColumnWidths: {
                        response: "wide",
                        site: 30,
                        status: 18,
                    },
                    surfaceDensity: "cozy",
                },
                currentState
            );

            expect(merged).toMatchObject({
                activeSiteDetailsTab: currentState.activeSiteDetailsTab,
                showAdvancedMetrics: currentState.showAdvancedMetrics,
                showSettings: currentState.showSettings,
                siteDetailsHeaderCollapsedState: {
                    siteA: true,
                },
                siteDetailsTabState: {
                    siteA: "history",
                },
                siteListLayout: currentState.siteListLayout,
                siteTableColumnWidths: {
                    response: 12,
                    site: 30,
                    status: 18,
                },
                surfaceDensity: "cozy",
            });
            expect(merged.selectSite).toBe(currentState.selectSite);
        });

        it("should preserve prototype-named site keys during migration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useUiStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Migration", "type");

            const migrate = useUIStore.persist.getOptions().migrate;
            expect(migrate).toBeTypeOf("function");

            const collapsedState = Object.create(null) as Record<
                string,
                boolean
            >;
            Object.defineProperty(collapsedState, "__proto__", {
                configurable: true,
                enumerable: true,
                value: true,
                writable: true,
            });

            const tabState = Object.create(null) as Record<string, string>;
            Object.defineProperty(tabState, "__proto__", {
                configurable: true,
                enumerable: true,
                value: "history",
                writable: true,
            });

            const migrated = await migrate?.(
                {
                    siteDetailsHeaderCollapsedState: collapsedState,
                    siteDetailsTabState: tabState,
                },
                1
            );
            const migratedCollapsedState =
                migrated?.siteDetailsHeaderCollapsedState ?? {};
            const migratedTabState = migrated?.siteDetailsTabState ?? {};

            expect(Object.getPrototypeOf(migratedCollapsedState)).toBeNull();
            expect(Object.getPrototypeOf(migratedTabState)).toBeNull();
            expect(Object.hasOwn(migratedCollapsedState, "__proto__")).toBe(
                true
            );
            expect(
                Object.getOwnPropertyDescriptor(
                    migratedCollapsedState,
                    "__proto__"
                )?.value
            ).toBe(true);
            expect(Object.hasOwn(migratedTabState, "__proto__")).toBe(true);
            expect(
                Object.getOwnPropertyDescriptor(migratedTabState, "__proto__")
                    ?.value
            ).toBe("history");
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
                "7d",
                "24h",
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
                result.current.setActiveSiteDetailsTab(analyticsTab);
                result.current.setSiteDetailsChartTimeRange("7d");
            });

            expect(result.current.showSettings).toBeTruthy();
            expect(result.current.showSiteDetails).toBeTruthy();
            expect(result.current.showAdvancedMetrics).toBeTruthy();
            expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);
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
            expect(result.current.selectedSiteIdentifier).toBe(
                mockSite.identifier
            );

            // User opens site details
            act(() => {
                result.current.setShowSiteDetails(true);
            });
            expect(result.current.showSiteDetails).toBeTruthy();

            // User switches to analytics tab
            act(() => {
                result.current.setActiveSiteDetailsTab(analyticsTab);
            });
            expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);

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
            expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);
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
                expect(result.current.selectedSiteIdentifier).toBe(
                    site.identifier
                );
            }

            // Clear selection
            act(() => {
                result.current.selectSite(undefined);
            });
            expect(result.current.selectedSiteIdentifier).toBeUndefined();
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

            expect(result.current.selectedSiteIdentifier).toBe(
                mockSite.identifier
            );
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
                result.current.setActiveSiteDetailsTab(analyticsTab);
            });

            // Verify they're independent
            act(() => {
                result.current.setShowSettings(true);
            });

            expect(result.current.showAdvancedMetrics).toBeTruthy();
            expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);
            expect(result.current.showSettings).toBeTruthy();

            // Change one property
            act(() => {
                result.current.setShowAdvancedMetrics(false);
            });

            // Others should remain unchanged
            expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);
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
                    result.current.setActiveSiteDetailsTab(analyticsTab);
                });
                expect(result.current.activeSiteDetailsTab).toBe(analyticsTab);
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
            expect(result.current.selectedSiteIdentifier).toBe(
                mockSite.identifier
            );

            // Clear with undefined multiple times
            act(() => {
                result.current.selectSite(undefined);
                result.current.selectSite(undefined);
                result.current.selectSite(undefined);
            });
            expect(result.current.selectedSiteIdentifier).toBeUndefined();
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
                expect(getState()).toBeFalsy();

                // Set true
                act(() => {
                    action(true);
                });
                expect(getState()).toBeTruthy();

                // Set false
                act(() => {
                    action(false);
                });
                expect(getState()).toBeFalsy();

                // Set true again
                act(() => {
                    action(true);
                });
                expect(getState()).toBeTruthy();
            }
        });
    });
});
