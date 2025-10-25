/**
 * @file Comprehensive tests for useSelectedSite hook.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mocked } from "vitest";
import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { StateSyncStatusSummary } from "@shared/types/stateSync";
import type { SitesStore } from "../../stores/sites/types";
import type { SiteDetailsTab, UIStore } from "../../stores/ui/types";
import { DEFAULT_SITE_TABLE_COLUMN_WIDTHS } from "../../stores/ui/useUiStore";
import type { ChartTimeRange } from "../../stores/types";

let useSelectedSite: typeof import("../../hooks/useSelectedSite").useSelectedSite;
let renderHook: typeof import("@testing-library/react").renderHook;

vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(),
}));

vi.mock("../../stores/ui/useUiStore", async () => {
    const actual = await vi.importActual<
        typeof import("../../stores/ui/useUiStore")
    >("../../stores/ui/useUiStore");
    return {
        ...actual,
        useUIStore: vi.fn(),
    };
});

type SitesModule = typeof import("../../stores/sites/useSitesStore");
type UiModule = typeof import("../../stores/ui/useUiStore");

let mockUseSitesStore: Mocked<SitesModule>["useSitesStore"];
let mockUseUIStore: Mocked<UiModule>["useUIStore"];

const defaultChartTimeRange: ChartTimeRange = "24h";

const createMockUiStore = (overrides: Partial<UIStore> = {}): UIStore => ({
    activeSiteDetailsTab: "site-overview",
    openExternal: (_url: string, _context?: { siteName?: string }) => {},
    selectedSiteIdentifier: undefined,
    selectSite: (_site: Site | undefined) => {},
    setActiveSiteDetailsTab: (_tab: SiteDetailsTab) => {},
    setShowAddSiteModal: (_show: boolean) => {},
    setShowAdvancedMetrics: (_show: boolean) => {},
    setShowSettings: (_show: boolean) => {},
    setShowSiteDetails: (_show: boolean) => {},
    setSidebarCollapsedPreference: vi.fn(),
    setSiteCardPresentation: (_presentation) => {},
    setSiteDetailsChartTimeRange: (_range: ChartTimeRange) => {},
    setSiteDetailsHeaderCollapsed: vi.fn(),
    setSiteListLayout: (_layout) => {},
    setSiteTableColumnWidths: () => {},
    showAddSiteModal: false,
    showAdvancedMetrics: false,
    showSettings: false,
    showSiteDetails: false,
    siteCardPresentation: "stacked",
    siteDetailsChartTimeRange: defaultChartTimeRange,
    siteDetailsHeaderCollapsedState: {},
    siteDetailsTabState: {},
    siteListLayout: "card-compact",
    siteTableColumnWidths: { ...DEFAULT_SITE_TABLE_COLUMN_WIDTHS },
    sidebarCollapsedPreference: false,
    syncActiveSiteDetailsTab: (_siteIdentifier: string) => {},
    toggleSiteDetailsHeaderCollapsed: vi.fn(),
    ...overrides,
});

const createMockSitesStore = (
    overrides: Partial<SitesStore> = {}
): SitesStore => ({
    addMonitorToSite: async (_siteId: string, _monitor: Monitor) => {},
    addSite: (_site: Site) => {},
    checkSiteNow: async () => {},
    createSite: async () => {},
    deleteSite: async () => {},
    downloadSqliteBackup: async () => {},
    fullResyncSites: async () => {},
    getSelectedMonitorId: (_siteId: string) => undefined,
    getSelectedSite: () => undefined,
    getSyncStatus: async (): Promise<StateSyncStatusSummary> => ({
        lastSyncAt: null,
        siteCount: 0,
        source: "frontend",
        synchronized: true,
    }),
    initializeSites: async () => ({
        message: "",
        sitesLoaded: 0,
        success: true,
    }),
    modifySite: async () => {},
    removeMonitorFromSite: async () => {},
    removeSite: (_identifier: string) => {},
    retryStatusSubscription: async (
        _callback?: (update: StatusUpdate) => void
    ) => ({
        errors: [],
        expectedListeners: 0,
        listenersAttached: 0,
        listenerStates: [],
        message: "Subscription retried",
        subscribed: true,
        success: true,
    }),
    selectSite: (_site: Site | undefined) => {},
    setSelectedMonitorId: (_siteId: string, _monitorId: string) => {},
    setSites: (_sites: Site[]) => {},
    setStatusSubscriptionSummary: (_summary) => {},
    recordSiteSyncDelta: (_delta) => {},
    startSiteMonitoring: async () => {},
    startSiteMonitorMonitoring: async () => {},
    stopSiteMonitoring: async () => {},
    stopSiteMonitorMonitoring: async () => {},
    subscribeToStatusUpdates: async (
        _callback?: (update: StatusUpdate) => void
    ) => ({
        errors: [],
        expectedListeners: 0,
        listenersAttached: 0,
        listenerStates: [],
        message: "",
        subscribed: true,
        success: true,
    }),
    subscribeToSyncEvents: () => () => {},
    syncSites: async () => {},
    unsubscribeFromStatusUpdates: () => ({
        message: "Unsubscribed",
        success: true,
        unsubscribed: true,
    }),
    updateMonitorRetryAttempts: async () => {},
    updateMonitorTimeout: async () => {},
    updateSiteCheckInterval: async () => {},
    selectedMonitorIds: {},
    selectedSiteIdentifier: undefined,
    sites: [],
    statusSubscriptionSummary: undefined,
    lastSyncDelta: undefined,
    ...overrides,
});

const baselineMonitor: Monitor = {
    activeOperations: [],
    certificateWarningDays: 30,
    checkInterval: 60_000,
    history: [],
    id: "monitor-base",
    monitoring: true,
    responseTime: 0,
    retryAttempts: 0,
    status: "up",
    timeout: 30_000,
    type: "http",
    url: "https://example.com",
};

const mockSites: Site[] = [
    {
        identifier: "site-1",
        monitoring: true,
        monitors: [{ ...baselineMonitor, id: "monitor-1" }],
        name: "Test Site 1",
    },
    {
        identifier: "site-2",
        monitoring: true,
        monitors: [{ ...baselineMonitor, id: "monitor-2" }],
        name: "Test Site 2",
    },
    {
        identifier: "site-3",
        monitoring: true,
        monitors: [{ ...baselineMonitor, id: "monitor-3" }],
        name: "Test Site 3",
    },
];

beforeAll(async () => {
    ({ renderHook } = await import("@testing-library/react"));
    ({ useSelectedSite } = await import("../../hooks/useSelectedSite"));
});

beforeEach(async () => {
    vi.clearAllMocks();

    const sitesModule = await import("../../stores/sites/useSitesStore");
    const uiModule = await import("../../stores/ui/useUiStore");

    mockUseSitesStore = vi.mocked(sitesModule).useSitesStore;
    mockUseUIStore = vi.mocked(uiModule).useUIStore;
});

describe("useSelectedSite", () => {
    describe("basic behaviour", () => {
        it("returns undefined when nothing selected", () => {
            mockUseUIStore.mockReturnValue(null);
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });

        it("returns the matching site when identifier exists", () => {
            mockUseUIStore.mockReturnValue("site-2");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toEqual(mockSites[1]);
        });

        it("returns undefined for unknown identifier", () => {
            mockUseUIStore.mockReturnValue("missing");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });
    });

    describe("store integration", () => {
        it("passes selector to useUIStore", () => {
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            renderHook(() => useSelectedSite());

            expect(mockUseUIStore).toHaveBeenCalledWith(expect.any(Function));
            const selector = mockUseUIStore.mock.calls[0]?.[0];
            const selection = selector?.(
                createMockUiStore({
                    selectedSiteIdentifier: "abc",
                })
            );
            expect(selection).toBe("abc");
        });

        it("passes selector to useSitesStore", () => {
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            renderHook(() => useSelectedSite());

            expect(mockUseSitesStore).toHaveBeenCalledWith(
                expect.any(Function)
            );
            const selector = mockUseSitesStore.mock.calls[0]?.[0];
            const sites = selector?.(
                createMockSitesStore({ sites: mockSites })
            );
            expect(sites).toEqual(mockSites);
        });
    });

    describe("memoisation behaviour", () => {
        it("does not recompute when dependencies do not change", () => {
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            const findSpy = vi.spyOn(Array.prototype, "find");

            const { rerender } = renderHook(() => useSelectedSite());

            findSpy.mockClear();
            rerender();

            expect(findSpy).not.toHaveBeenCalled();
            findSpy.mockRestore();
        });

        it("recomputes when selectedSiteIdentifier changes", () => {
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            const findSpy = vi.spyOn(Array.prototype, "find");

            const { rerender } = renderHook(() => useSelectedSite());

            findSpy.mockClear();
            mockUseUIStore.mockReturnValue("site-2");
            rerender();

            expect(findSpy).toHaveBeenCalledTimes(1);
            findSpy.mockRestore();
        });

        it("recomputes when sites array reference changes", () => {
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            const findSpy = vi.spyOn(Array.prototype, "find");

            const { rerender } = renderHook(() => useSelectedSite());

            findSpy.mockClear();
            mockUseSitesStore.mockReturnValue(Array.from(mockSites));
            rerender();

            expect(findSpy).toHaveBeenCalledTimes(1);
            findSpy.mockRestore();
        });

        it("skips lookup when selectedSiteIdentifier is null", () => {
            mockUseUIStore.mockReturnValue(null);
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });
    });

    describe("state updates", () => {
        it("reacts to store changes", () => {
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result, rerender } = renderHook(() => useSelectedSite());
            expect(result.current?.identifier).toBe("site-1");

            mockUseUIStore.mockReturnValue("site-3");
            rerender();

            expect(result.current?.identifier).toBe("site-3");
        });

        it("clears selection when site removed", () => {
            mockUseUIStore.mockReturnValue("site-2");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result, rerender } = renderHook(() => useSelectedSite());
            expect(result.current?.identifier).toBe("site-2");

            const filteredSites = mockSites.filter(
                (site) => site.identifier !== "site-2"
            );
            mockUseSitesStore.mockReturnValue(filteredSites);
            rerender();

            expect(result.current).toBeUndefined();
        });
    });
});
