/**
 * Tests for specific uncovered line 190 in store.ts
 * This tests the finally block that sets loading to false
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "@testing-library/react";
import type { Monitor } from "../types";

// Mock window.electronAPI
const mockElectronAPI = {
    data: {
        exportData: vi.fn(),
        importData: vi.fn(),
        downloadSQLiteBackup: vi.fn(),
    },
    events: {
        onStatusUpdate: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
        startMonitoringForSite: vi.fn(),
        stopMonitoringForSite: vi.fn(),
    },
    settings: {
        getHistoryLimit: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
    sites: {
        getSites: vi.fn(),
        addSite: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
        checkSiteNow: vi.fn(),
    },
    system: {
        quitAndInstall: vi.fn(),
    },
};

describe("Store Line 190 Coverage", () => {
    // Helper to create a valid monitor object
    const createTestMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
        id: "test-monitor-id",
        type: "http",
        status: "pending",
        history: [],
        checkInterval: 60000,
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(global, "window", {
            value: {
                electronAPI: mockElectronAPI,
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        if ("window" in global) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (global as any).window;
        }
    });

    it("should call setLoading(false) in finally block when addMonitorToSite succeeds", async () => {
        // Import the store after mocking
        const { useStore } = await import("../store");

        // Set up initial state with a test site
        useStore.setState({
            sites: [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [],
                },
            ],
        });

        // Mock successful responses
        mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);
        mockElectronAPI.sites.getSites.mockResolvedValue([]);

        const testMonitor = createTestMonitor();

        // Spy on setLoading to verify finally block execution
        const setLoadingSpy = vi.spyOn(useStore.getState(), "setLoading");

        // Call addMonitorToSite and verify it completes successfully
        await act(async () => {
            await useStore.getState().addMonitorToSite("site1", testMonitor);
        });

        // Verify that setLoading was called with true at start and false at end (finally block)
        expect(setLoadingSpy).toHaveBeenCalledWith(true);
        expect(setLoadingSpy).toHaveBeenLastCalledWith(false);

        // Verify that updateSite was called (indicating success path)
        expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site1", {
            monitors: [testMonitor],
        });
    });

    it("should call setLoading(false) in finally block when addMonitorToSite fails", async () => {
        // Import the store after mocking
        const { useStore } = await import("../store");

        // Set up initial state with a test site
        useStore.setState({
            sites: [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [],
                },
            ],
        });

        // Mock failed updateSite
        mockElectronAPI.sites.updateSite.mockRejectedValue(new Error("Update failed"));

        const testMonitor = createTestMonitor();

        // Spy on setLoading to verify finally block execution
        const setLoadingSpy = vi.spyOn(useStore.getState(), "setLoading");

        // Call addMonitorToSite and expect it to throw
        await act(async () => {
            try {
                await useStore.getState().addMonitorToSite("site1", testMonitor);
            } catch {
                // Expected error
            }
        });

        // Verify that setLoading was called with true at start and false at end (finally block)
        expect(setLoadingSpy).toHaveBeenCalledWith(true);
        expect(setLoadingSpy).toHaveBeenLastCalledWith(false);

        // Verify that updateSite was called (indicating we reached the failure point)
        expect(mockElectronAPI.sites.updateSite).toHaveBeenCalled();

        // Verify error was set
        expect(useStore.getState().lastError).toContain("Failed to add monitor");
    });

    it("should call setLoading(false) in finally block when site is not found", async () => {
        // Import the store after mocking
        const { useStore } = await import("../store");

        // Set up initial state with NO sites (to trigger "site not found")
        useStore.setState({
            sites: [],
        });

        const testMonitor = createTestMonitor();

        // Spy on setLoading to verify finally block execution
        const setLoadingSpy = vi.spyOn(useStore.getState(), "setLoading");

        // Try to add monitor to non-existent site
        await act(async () => {
            try {
                await useStore.getState().addMonitorToSite("non-existent-site", testMonitor);
            } catch {
                // Expected error
            }
        });

        // Verify that setLoading was called with true at start and false at end (finally block)
        expect(setLoadingSpy).toHaveBeenCalledWith(true);
        expect(setLoadingSpy).toHaveBeenLastCalledWith(false);

        // Verify error was set
        expect(useStore.getState().lastError).toContain("Failed to add monitor: Site not found");
    });
});
