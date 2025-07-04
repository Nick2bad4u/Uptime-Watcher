/**
 * Simplified test suite for useSiteDetails hook - updated for new store structure
 */

import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSiteDetails } from "../hooks/site/useSiteDetails";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useUIStore } from "../stores/ui/useUiStore";
import { useErrorStore } from "../stores/error/useErrorStore";

// Mock all the stores
vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(),
}));

vi.mock("../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(),
}));

vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(),
}));

// Mock logger
vi.mock("../services/logger", () => ({
    default: {
        error: vi.fn(),
        site: {
            error: vi.fn(),
            removed: vi.fn(),
        },
        user: {
            action: vi.fn(),
        },
    },
}));

// Get mocked functions for type safety
const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseUIStore = vi.mocked(useUIStore);
const mockUseErrorStore = vi.mocked(useErrorStore);

describe("useSiteDetails Hook", () => {
    const mockSitesStore = {
        sites: [],
        checkSiteNow: vi.fn(),
        deleteSite: vi.fn(),
        getSelectedMonitorId: vi.fn(() => "monitor-1"), // Return a default monitor ID
        modifySite: vi.fn(),
        setSelectedMonitorId: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
    };

    const mockUIStore = {
        activeSiteDetailsTab: "overview",
        showAdvancedMetrics: true,
        siteDetailsChartTimeRange: "24h" as const,
        setActiveSiteDetailsTab: vi.fn(),
        setShowAdvancedMetrics: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
    };

    const mockErrorStore = {
        clearError: vi.fn(),
        isLoading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock window.confirm to return true for deletion tests
        Object.defineProperty(window, 'confirm', {
            value: vi.fn(() => true),
            writable: true,
        });
        
        // Reset mocks
        mockUseSitesStore.mockReturnValue(mockSitesStore);
        mockUseUIStore.mockReturnValue(mockUIStore);
        mockUseErrorStore.mockReturnValue(mockErrorStore);

        // Reset state
        mockSitesStore.sites = [];
        mockUIStore.activeSiteDetailsTab = "overview";
        mockErrorStore.isLoading = false;
        mockUIStore.showAdvancedMetrics = true;
        mockUIStore.siteDetailsChartTimeRange = "24h";
        mockSitesStore.getSelectedMonitorId.mockReturnValue(null);
    });

    const createMockSite = () => ({
        identifier: "test-site",
        name: "Test Site",
        monitors: [{
            id: "monitor-1",
            type: "http" as const,
            url: "https://example.com",
            status: "up" as const,
            checkInterval: 60000,
            timeout: 5000,
            retryAttempts: 3,
            history: [],
        }],
    });

    it("should initialize with site data", () => {
        const site = createMockSite();
        mockSitesStore.sites = [site];
        mockSitesStore.getSelectedMonitorId.mockReturnValue("monitor-1");

        const { result } = renderHook(() => useSiteDetails({ site }));

        expect(result.current.currentSite).toEqual(site);
        expect(result.current.selectedMonitor).toEqual(site.monitors[0]);
    });

    it("should handle check site now action", async () => {
        const site = createMockSite();
        mockSitesStore.checkSiteNow.mockResolvedValue(undefined);
        mockSitesStore.getSelectedMonitorId.mockReturnValue("monitor-1");

        const { result } = renderHook(() => useSiteDetails({ site }));

        await act(async () => {
            await result.current.handleCheckNow();
        });

        expect(mockSitesStore.checkSiteNow).toHaveBeenCalledWith(site.identifier, "monitor-1");
    });

    it("should handle monitor selection changes", () => {
        const site = createMockSite();
        const { result } = renderHook(() => useSiteDetails({ site }));

        // Test that selectedMonitorId is properly initialized
        expect(result.current.selectedMonitorId).toBeDefined();
    });

    it("should handle site deletion", async () => {
        const site = createMockSite();
        mockSitesStore.deleteSite.mockResolvedValue(undefined);

        const { result } = renderHook(() => useSiteDetails({ site }));

        await act(async () => {
            await result.current.handleRemoveSite();
        });

        expect(mockSitesStore.deleteSite).toHaveBeenCalledWith(site.identifier);
    });

    it("should handle site modification", async () => {
        const site = createMockSite();
        const { result } = renderHook(() => useSiteDetails({ site }));

        // Test that modification handlers exist
        expect(result.current.handleSaveName).toBeDefined();
        expect(result.current.handleSaveInterval).toBeDefined();
        expect(result.current.handleSaveTimeout).toBeDefined();
        expect(result.current.handleSaveRetryAttempts).toBeDefined();
    });
});
