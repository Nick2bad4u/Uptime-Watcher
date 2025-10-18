/**
 * Critical Priority Tests - Store Function Coverage
 *
 * This test file targets the useSitesStore.ts file which has 0% function
 * coverage despite having 100% other metrics. We need to test the actual store
 * downloadSqliteBackup: vi.fn().mockResolvedValue({ buffer: new ArrayBuffer(8),
 * fileName: "backup.db", metadata: { createdAt: 0, originalPath:
 * "/tmp/backup.db", sizeBytes: 8, }, }),
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "@shared/types";
import type { StateSyncStatusSummary } from "@shared/types/stateSync";
import { SiteService } from "../../../stores/sites/services/SiteService";

const mockStateSyncService = vi.hoisted(() => ({
    getSyncStatus: vi.fn(),
    initialize: vi.fn(),
    onStateSyncEvent: vi.fn(),
    requestFullSync: vi.fn(),
}));

vi.mock("../../../services/StateSyncService", () => ({
    StateSyncService: mockStateSyncService,
}));

// Mock services first - these need to be hoisted above imports
vi.mock("../../../services/DataService", () => ({
    DataService: {
        isConnected: vi.fn().mockReturnValue(true),
        downloadSqliteBackup: vi
            .fn()
            .mockRejectedValue(new Error("Mock download error")),
        // Add other required methods
        getSiteStatus: vi.fn().mockResolvedValue({ status: "active" }),
        validateSiteConfiguration: vi.fn().mockResolvedValue({ isValid: true }),
    },
}));

vi.mock("../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock("../../../../shared/utils/errorHandling", () => ({
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))
    ),
    withErrorHandling: vi.fn(async (operation, context) => {
        try {
            return await operation();
        } catch (error) {
            context?.onError?.(error);
            throw error;
        }
    }),
}));

vi.mock("../../../../shared/utils", () => ({
    // Add any shared utils that might be imported
    validateInput: vi.fn().mockReturnValue({ isValid: true }),
    formatError: vi.fn((error) => error.message),
}));

vi.mock("../../utils", () => ({
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

import { useSitesStore } from "../../../stores/sites/useSitesStore";

// Mock the electron API
const mockElectronAPI = {
    sites: {
        addSite: vi.fn(),
        getSites: vi.fn(),
        updateSite: vi.fn(),
        removeSite: vi.fn(),
        addMonitorToSite: vi.fn(),
        removeMonitorFromSite: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "backup.db",
            metadata: {
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                sizeBytes: 8,
            },
        }),
    },
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
    },
    monitoring: {
        checkSiteNow: vi.fn().mockResolvedValue(undefined),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
        startMonitoringForSiteMonitor: vi.fn().mockResolvedValue(true),
        stopMonitoringForSiteMonitor: vi.fn().mockResolvedValue(true),
    },
    stateSync: {
        getSyncStatus: vi.fn(),
        onStateSyncEvent: vi.fn(),
        requestFullSync: vi.fn(),
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

        // Set up default mock responses to prevent hanging
        mockElectronAPI.sites.getSites.mockResolvedValue([]);
        mockElectronAPI.sites.addSite.mockResolvedValue({
            identifier: "default-site",
            monitoring: true,
            monitors: [],
            name: "Default Site",
        });
        mockElectronAPI.sites.updateSite.mockResolvedValue({
            identifier: "default-site",
            monitoring: true,
            monitors: [],
            name: "Default Site",
        });
        mockElectronAPI.sites.removeSite.mockResolvedValue(true);
        mockStateSyncService.getSyncStatus.mockResolvedValue({
            lastSyncAt: Date.now(),
            siteCount: 0,
            source: "cache",
            synchronized: true,
        });
        mockStateSyncService.onStateSyncEvent.mockResolvedValue(vi.fn());
        mockStateSyncService.requestFullSync.mockResolvedValue({
            completedAt: Date.now(),
            sites: [],
            siteCount: 0,
            source: "cache",
            synchronized: true,
        });

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
            expect(typeof store.downloadSqliteBackup).toBe("function");

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
            expect(store.selectedSiteIdentifier).toBeUndefined();
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

            const createdSite: Site = {
                identifier: "test-site",
                monitoring: true,
                monitors: [],
                name: "Test Site",
            };

            mockElectronAPI.sites.addSite.mockResolvedValueOnce(createdSite);

            await store.createSite({
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
            });

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "test-site",
                    monitoring: true,
                    name: "Test Site",
                })
            );
        });

        it("should properly integrate monitoring functions", async () => {
            const store = useSitesStore.getState();

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(
                true
            );
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(
                true
            );
            mockElectronAPI.monitoring.checkSiteNow.mockResolvedValueOnce({
                identifier: "default-site",
                monitoring: true,
                monitors: [],
                name: "Default Site",
            });

            await store.startSiteMonitoring("test-site");
            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith("test-site");

            await store.stopSiteMonitoring("test-site");
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site");

            await store.checkSiteNow("test-site", "monitor-id");
            expect(
                mockElectronAPI.monitoring.checkSiteNow
            ).toHaveBeenCalledWith("test-site", "monitor-id");
        });

        it("should properly integrate sync functions", async () => {
            const store = useSitesStore.getState();

            const mockSyncStatus: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: 0,
                source: "database",
                synchronized: true,
            };

            mockStateSyncService.getSyncStatus.mockResolvedValueOnce(
                mockSyncStatus
            );

            const getSitesSpy = vi.spyOn(SiteService, "getSites");
            try {
                getSitesSpy.mockResolvedValueOnce([]);
                getSitesSpy.mockResolvedValueOnce([]);

                const syncStatus = await store.getSyncStatus();
                expect(syncStatus).toEqual(mockSyncStatus);
                expect(mockStateSyncService.getSyncStatus).toHaveBeenCalled();

                await store.syncSites();
                await store.fullResyncSites();

                expect(getSitesSpy).toHaveBeenCalledTimes(2);
            } finally {
                getSitesSpy.mockRestore();
            }
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
            // Mock electronAPI to throw error directly (extraction happens in preload)
            mockElectronAPI.sites.addSite.mockRejectedValueOnce(
                new Error("Network error")
            );

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
            mockStateSyncService.getSyncStatus.mockRejectedValueOnce(
                new Error("Sync error")
            );

            // Test that sync errors are handled gracefully by returning fallback values
            const result = await store.getSyncStatus();
            expect(result).toEqual({
                lastSyncAt: null,
                siteCount: 0,
                source: "frontend",
                synchronized: false,
            });
        });
    });
});
