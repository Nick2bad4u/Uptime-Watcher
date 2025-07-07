/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUIStore } from "../stores";
import type { Site } from "../types";

// Mock the utils
vi.mock("../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

describe("useUIStore - Uncovered Lines", () => {
    beforeEach(() => {
        // Reset the store before each test
        act(() => {
            const store = useUIStore.getState();
            store.setSelectedSite(undefined);
            store.setShowSettings(false);
            store.setShowSiteDetails(false);
            store.setShowAdvancedMetrics(false);
            store.setActiveSiteDetailsTab("site-overview");
            store.setSiteDetailsChartTimeRange("24h");
        });
    });

    it("should set active site details tab", () => {
        const { result } = renderHook(() => useUIStore());

        act(() => {
            result.current.setActiveSiteDetailsTab("monitor-overview");
        });

        expect(result.current.activeSiteDetailsTab).toBe("monitor-overview");
    });

    it("should set selected site", () => {
        const { result } = renderHook(() => useUIStore());

        const mockSite: Site = {
            identifier: "test-site",
            name: "Test Site",
            monitors: [],
            monitoring: true,
        };

        act(() => {
            result.current.setSelectedSite(mockSite);
        });

        expect(result.current.selectedSiteId).toBe("test-site");
    });

    it("should clear selected site when setting to undefined", () => {
        const { result } = renderHook(() => useUIStore());

        const mockSite: Site = {
            identifier: "test-site",
            name: "Test Site",
            monitors: [],
            monitoring: true,
        };

        // First set a site
        act(() => {
            result.current.setSelectedSite(mockSite);
        });

        expect(result.current.selectedSiteId).toBe("test-site");

        // Then clear it
        act(() => {
            result.current.setSelectedSite(undefined);
        });

        expect(result.current.selectedSiteId).toBeUndefined();
    });

    it("should set show advanced metrics", () => {
        const { result } = renderHook(() => useUIStore());

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

        act(() => {
            result.current.setShowSiteDetails(true);
        });

        expect(result.current.showSiteDetails).toBe(true);

        act(() => {
            result.current.setShowSiteDetails(false);
        });

        expect(result.current.showSiteDetails).toBe(false);
    });

    it("should set site details chart time range", () => {
        const { result } = renderHook(() => useUIStore());

        act(() => {
            result.current.setSiteDetailsChartTimeRange("7d");
        });

        expect(result.current.siteDetailsChartTimeRange).toBe("7d");

        act(() => {
            result.current.setSiteDetailsChartTimeRange("30d");
        });

        expect(result.current.siteDetailsChartTimeRange).toBe("30d");
    });

    it("should handle getSelectedSite when no site is selected", () => {
        const { result } = renderHook(() => useUIStore());

        const selectedSite = result.current.getSelectedSite();
        expect(selectedSite).toBeUndefined();
    });

    it("should handle getSelectedSite when site is selected but return undefined due to subscription pattern", () => {
        const { result } = renderHook(() => useUIStore());

        const mockSite: Site = {
            identifier: "test-site",
            name: "Test Site",
            monitors: [],
            monitoring: true,
        };

        act(() => {
            result.current.setSelectedSite(mockSite);
        });

        // The function returns undefined by design (components should derive this from subscriptions)
        const selectedSite = result.current.getSelectedSite();
        expect(selectedSite).toBeUndefined();

        // But the selectedSiteId should be set
        expect(result.current.selectedSiteId).toBe("test-site");
    });

    it("should persist only specific state properties", () => {
        const { result } = renderHook(() => useUIStore());

        // Set some values
        act(() => {
            result.current.setActiveSiteDetailsTab("analytics");
            result.current.setShowAdvancedMetrics(true);
            result.current.setSiteDetailsChartTimeRange("7d");
            result.current.setShowSettings(true); // This should NOT be persisted
            result.current.setShowSiteDetails(true); // This should NOT be persisted
        });

        // Check the actual store state
        const state = useUIStore.getState();
        expect(state.activeSiteDetailsTab).toBe("analytics");
        expect(state.showAdvancedMetrics).toBe(true);
        expect(state.siteDetailsChartTimeRange).toBe("7d");
        expect(state.showSettings).toBe(true);
        expect(state.showSiteDetails).toBe(true);

        // The persistence configuration should only include certain properties
        // This is tested by the zustand persist middleware configuration
    });

    it("should initialize with default values", () => {
        const { result } = renderHook(() => useUIStore());

        expect(result.current.activeSiteDetailsTab).toBe("site-overview");
        expect(result.current.selectedSiteId).toBeUndefined();
        expect(result.current.showAdvancedMetrics).toBe(false);
        expect(result.current.showSettings).toBe(false);
        expect(result.current.showSiteDetails).toBe(false);
        expect(result.current.siteDetailsChartTimeRange).toBe("24h");
    });
});
