/**
 * Simple tests for useSiteDetails hook.
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSiteDetails } from "../hooks/site/useSiteDetails";
import type { Site } from "../types";

// Mock the stores
const mockUseSitesStore = {
    sites: [] as Site[],
    getSelectedMonitorId: vi.fn(),
    setSelectedMonitorId: vi.fn(),
    checkSiteNow: vi.fn(),
    startSiteMonitorMonitoring: vi.fn(),
    stopSiteMonitorMonitoring: vi.fn(),
    updateSiteCheckInterval: vi.fn(),
    updateMonitorTimeout: vi.fn(),
    updateMonitorRetryAttempts: vi.fn(),
    modifySite: vi.fn(),
    deleteSite: vi.fn(),
};

const mockUseErrorStore = {
    clearError: vi.fn(),
    setError: vi.fn(),
    isLoading: false,
};

const mockUseUIStore = {
    activeSiteDetailsTab: "overview",
    setActiveSiteDetailsTab: vi.fn(),
    setShowAdvancedMetrics: vi.fn(),
    setSiteDetailsChartTimeRange: vi.fn(),
    showAdvancedMetrics: false,
    siteDetailsChartTimeRange: "24h",
};

const mockUseSiteAnalytics = {
    uptimePercentage: 95.5,
    avgResponseTime: 120,
    statusChanges: 3,
    isLoading: false,
    error: undefined,
};

// Mock the modules
vi.mock("../stores", () => ({
    useSitesStore: () => mockUseSitesStore,
    useErrorStore: () => mockUseErrorStore,
    useUIStore: () => mockUseUIStore,
}));

vi.mock("../hooks/site/useSiteAnalytics", () => ({
    useSiteAnalytics: () => mockUseSiteAnalytics,
}));

vi.mock("../services/logger", () => ({
    default: {
        user: { action: vi.fn() },
        site: { error: vi.fn() },
        error: vi.fn(),
    },
}));

vi.mock("../constants", () => ({
    DEFAULT_CHECK_INTERVAL: 300000,
    DEFAULT_REQUEST_TIMEOUT_SECONDS: 30,
    CHART_TIME_PERIODS: {
        "1h": 60 * 60 * 1000,
        "12h": 12 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
    },
}));

describe("useSiteDetails", () => {
    const createMockSite = (): Site => ({
        identifier: "test-site",
        name: "Test Site",
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                status: "up",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
                monitoring: true,
                history: [],
            },
        ],
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseErrorStore.isLoading = false;
        mockUseSitesStore.getSelectedMonitorId.mockReturnValue("monitor-1");
        mockUseSitesStore.sites = [];
    });

    it("should initialize with basic state when site is in store", () => {
        const site = createMockSite();
        mockUseSitesStore.sites = [site];
        
        const { result } = renderHook(() => useSiteDetails({ site }));

        expect(result.current.currentSite).toEqual(site);
        expect(result.current.selectedMonitorId).toBe("monitor-1");
        expect(result.current.isLoading).toBe(false);
    });

    it("should handle site not in store with fallback", () => {
        const site = createMockSite();
        mockUseSitesStore.sites = []; // Site not in store
        
        const { result } = renderHook(() => useSiteDetails({ site }));

        expect(result.current.currentSite.identifier).toBe("test-site");
        expect(result.current.currentSite.monitors).toHaveLength(0);
        expect(result.current.siteExists).toBe(false);
    });

    it("should provide analytics data", () => {
        const site = createMockSite();
        mockUseSitesStore.sites = [site];
        
        const { result } = renderHook(() => useSiteDetails({ site }));

        expect(result.current.analytics).toEqual(mockUseSiteAnalytics);
    });

    it("should handle empty monitors array", () => {
        const site = { ...createMockSite(), monitors: [] };
        mockUseSitesStore.sites = [site];
        
        const { result } = renderHook(() => useSiteDetails({ site }));

        expect(result.current.selectedMonitor).toBeUndefined();
        expect(result.current.isMonitoring).toBe(false);
    });

    it("should return basic UI state", () => {
        const site = createMockSite();
        mockUseSitesStore.sites = [site];
        
        const { result } = renderHook(() => useSiteDetails({ site }));

        expect(result.current.activeSiteDetailsTab).toBe("overview");
        expect(result.current.showAdvancedMetrics).toBe(false);
        expect(result.current.siteDetailsChartTimeRange).toBe("24h");
    });
});
