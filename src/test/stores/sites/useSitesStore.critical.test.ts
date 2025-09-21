/**
 * Critical Priority Tests - Store Function Coverage
 *
 * This test file targets the useSitesStore.ts file which has 0% function
 * coverage despite having 100% other metrics. We need to test the actual store
 * creation and function composition.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../../../shared/types";
import { useSitesStore } from "../../../stores/sites/useSitesStore";

// Mock the electron API
const mockElectronAPI = {
    sites: {
        addSite: vi.fn(),
        getSites: vi.fn(),
        updateSite: vi.fn(),
        deleteSite: vi.fn(),
        addMonitorToSite: vi.fn(),
        removeMonitorFromSite: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
        downloadSQLiteBackup: vi.fn(),
        checkSiteNow: vi.fn(),
    },
    monitoring: {
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
        startMonitoringForSiteMonitor: vi.fn().mockResolvedValue(true),
        stopMonitoringForSiteMonitor: vi.fn().mockResolvedValue(true),
    },
    stateSync: {
        fullResyncSites: vi.fn(),
        syncSites: vi.fn(),
        getSyncStatus: vi.fn(),
        subscribeToSyncEvents: vi.fn(),
    },
    notifications: {
        subscribeToStatusUpdates: vi.fn(),
        unsubscribeFromStatusUpdates: vi.fn(),
    },
};

// Mock the global electronAPI
Object.defineProperty(global, "window", {
    value: {
        electronAPI: mockElectronAPI,
    },
    writable: true,
});

describe("useSitesStore Function Coverage Tests", () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Reset store state
        const store = useSitesStore.getState();
        store.setSites([]);
        store.selectSite(undefined);
    });

    describe("Store Creation and Composition", () => {
        it("should create store with all required functions", () => {
            const store = useSitesStore.getState();

            // Verify all state functions exist
            expect(typeof store.addSite).toBe("function");
            expect(typeof store.removeSite).toBe("function");
            expect(typeof store.modifySite).toBe("function");
            expect(typeof store.setSites).toBe("function");
            expect(typeof store.selectSite).toBe("function");
            expect(typeof store.getSelectedSite).toBe("function");
            expect(typeof store.setSelectedMonitorId).toBe("function");
            expect(typeof store.getSelectedMonitorId).toBe("function");

            // Verify all operation functions exist
            expect(typeof store.createSite).toBe("function");
            expect(typeof store.deleteSite).toBe("function");
            expect(typeof store.addMonitorToSite).toBe("function");
            expect(typeof store.removeMonitorFromSite).toBe("function");
            expect(typeof store.updateMonitorTimeout).toBe("function");
            expect(typeof store.updateMonitorRetryAttempts).toBe("function");
            expect(typeof store.updateSiteCheckInterval).toBe("function");
            expect(typeof store.downloadSQLiteBackup).toBe("function");

            // Verify all monitoring functions exist
            expect(typeof store.checkSiteNow).toBe("function");
            expect(typeof store.startSiteMonitoring).toBe("function");
            expect(typeof store.stopSiteMonitoring).toBe("function");
            expect(typeof store.startSiteMonitorMonitoring).toBe("function");
            expect(typeof store.stopSiteMonitorMonitoring).toBe("function");

            // Verify all sync functions exist
            expect(typeof store.fullResyncSites).toBe("function");
            expect(typeof store.syncSites).toBe("function");
            expect(typeof store.getSyncStatus).toBe("function");
            expect(typeof store.subscribeToSyncEvents).toBe("function");

            // Verify subscription functions exist
            expect(typeof store.subscribeToStatusUpdates).toBe("function");
            expect(typeof store.unsubscribeFromStatusUpdates).toBe("function");
        });

        it("should have initial state properties", () => {
            const store = useSitesStore.getState();

            expect(Array.isArray(store.sites)).toBeTruthy();
            expect(store.sites).toHaveLength(0);
            expect(store.selectedSiteId).toBeUndefined();
            expect(typeof store.selectedMonitorIds).toBe("object");
        });

        it("should create shared functions correctly", () => {
            const store = useSitesStore.getState();

            // Test that getSites function works
            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: false,
            };

            store.addSite(testSite);
            // Read fresh state after mutation to avoid stale snapshot
            const sites = useSitesStore.getState().sites;
            expect(sites).toHaveLength(1);
            expect(sites[0]).toEqual(testSite);
        });
    });

    describe("Function Integration Tests", () => {
        it("should properly integrate state and operations", async () => {
            const store = useSitesStore.getState();

            // Mock successful site creation
            mockElectronAPI.sites.addSite.mockResolvedValueOnce({
                success: true,
                data: { identifier: "test-site" },
            });
            mockElectronAPI.sites.getSites.mockResolvedValueOnce({
                success: true,
                data: [],
            });

            // Test createSite function
            await store.createSite({
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
            });

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: expect.arrayContaining([
                        expect.objectContaining({
                            type: "http",
                            status: "pending",
                            monitoring: true,
                        }),
                    ]),
                })
            );
        });

        it("should properly integrate monitoring functions", async () => {
            const store = useSitesStore.getState();

            // Mock monitoring operations
            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(
                {
                    success: true,
                    data: undefined,
                }
            );
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(
                {
                    success: true,
                    data: undefined,
                }
            );
            mockElectronAPI.sites.checkSiteNow.mockResolvedValueOnce({
                success: true,
                data: undefined,
            });

            // Test monitoring functions
            await store.startSiteMonitoring("test-site");
            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith("test-site");

            await store.stopSiteMonitoring("test-site");
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site");

            await store.checkSiteNow("test-site", "monitor-id");
            expect(mockElectronAPI.sites.checkSiteNow).toHaveBeenCalledWith(
                "test-site",
                "monitor-id"
            );
        });

        it("should properly integrate sync functions", async () => {
            const store = useSitesStore.getState();

            // Mock sync operations
            const mockSyncStatus = {
                success: true,
                synchronized: true,
                siteCount: 0,
                lastSync: Date.now(),
            };

            mockElectronAPI.stateSync.getSyncStatus.mockResolvedValueOnce({
                success: true,
                data: mockSyncStatus,
            });
            // Mock getSites for syncSites
            mockElectronAPI.sites.getSites.mockResolvedValueOnce({
                success: true,
                data: [],
            });
            mockElectronAPI.stateSync.syncSites.mockResolvedValueOnce({
                success: true,
                data: [],
            });
            mockElectronAPI.stateSync.fullResyncSites.mockResolvedValueOnce({
                success: true,
                data: [],
            });

            // Test sync functions
            const syncStatus = await store.getSyncStatus();
            expect(syncStatus).toEqual(mockSyncStatus);
            expect(mockElectronAPI.stateSync.getSyncStatus).toHaveBeenCalled();

            await store.syncSites();
            expect(mockElectronAPI.sites.getSites).toHaveBeenCalled();

            await store.fullResyncSites();
            // FullResyncSites calls syncSites which calls SiteService.getSites()
            expect(mockElectronAPI.sites.getSites).toHaveBeenCalled();
        });
    });

    describe("Store State Management", () => {
        it("should manage selected site state correctly", () => {
            const store = useSitesStore.getState();

            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: false,
            };

            // First add the site to the sites array so it can be found
            store.setSites([testSite]);

            // Test setting selected site
            store.selectSite(testSite);
            expect(store.getSelectedSite()).toEqual(testSite);

            // Test clearing selected site
            store.selectSite(undefined);
            expect(store.getSelectedSite()).toBeUndefined();
        });

        it("should manage monitor selection state correctly", () => {
            const store = useSitesStore.getState();

            // Test setting monitor ID
            store.setSelectedMonitorId("site-1", "monitor-1");
            expect(store.getSelectedMonitorId("site-1")).toBe("monitor-1");

            // Test getting undefined for unknown site
            expect(store.getSelectedMonitorId("unknown-site")).toBeUndefined();
        });

        it("should manage sites array correctly", () => {
            const store = useSitesStore.getState();

            // Verify initial state is empty
            expect(store.sites).toHaveLength(0);

            const site1: Site = {
                identifier: "site-1",
                name: "Site 1",
                monitors: [],
                monitoring: false,
            };

            const site2: Site = {
                identifier: "site-2",
                name: "Site 2",
                monitors: [],
                monitoring: false,
            };

            // Test adding sites
            store.addSite(site1);
            // Get fresh state after adding
            const updatedStore1 = useSitesStore.getState();
            expect(updatedStore1.sites).toHaveLength(1);

            store.addSite(site2);
            // Get fresh state after adding second site
            const updatedStore2 = useSitesStore.getState();
            expect(updatedStore2.sites).toHaveLength(2);

            // Test setting all sites
            store.setSites([site1]);
            const updatedStore3 = useSitesStore.getState();
            expect(updatedStore3.sites).toHaveLength(1);
            expect(updatedStore3.sites[0]).toEqual(site1);

            // Test removing site
            store.removeSite("site-1");
            const updatedStore4 = useSitesStore.getState();
            expect(updatedStore4.sites).toHaveLength(0);
        });
    });

    describe("Error Handling in Store Functions", () => {
        it("should handle errors in async operations gracefully", async () => {
            const store = useSitesStore.getState();

            // Mock error for create site
            // Mock error response
            mockElectronAPI.sites.addSite.mockResolvedValueOnce({
                success: false,
                error: "Network error",
            });

            // Test that errors are handled gracefully (thrown after state management)
            await expect(
                store.createSite({
                    identifier: "test-site",
                    name: "Test Site",
                })
            ).rejects.toThrow("Network error");
        });

        it("should handle errors in monitoring operations gracefully", async () => {
            const store = useSitesStore.getState();

            // Mock error for monitoring
            // Mock rejection for monitoring APIs (they don't use IPC wrapper)
            mockElectronAPI.monitoring.startMonitoringForSite.mockRejectedValueOnce(
                new Error("Monitoring error")
            );

            // Test that errors are handled gracefully (thrown after state management)
            await expect(
                store.startSiteMonitoring("test-site")
            ).rejects.toThrow("Monitoring error");
        });

        it("should handle errors in sync operations gracefully", async () => {
            const store = useSitesStore.getState();

            // Mock error for sync
            mockElectronAPI.stateSync.getSyncStatus.mockResolvedValueOnce({
                success: false,
                error: "Sync error",
            });

            // Test that sync errors are handled gracefully by returning fallback values
            const result = await store.getSyncStatus();
            expect(result).toEqual({
                lastSync: undefined,
                siteCount: 0,
                success: false,
                synchronized: false,
            });
        });
    });
});
