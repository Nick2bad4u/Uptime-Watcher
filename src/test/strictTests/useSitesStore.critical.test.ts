/**
 * Comprehensive test suite for useSitesStore function coverage.
 *
 * This test focuses on achieving function coverage for the store composition,
 * exercising all store functions to improve coverage metrics.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../../shared/types";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { mockElectronAPI } from "../setup";
import { SiteService } from "../../stores/sites/services/SiteService";
import { MonitoringService } from "../../stores/sites/services/MonitoringService";

const mockStateSyncService = vi.hoisted(() => ({
    getSyncStatus: vi.fn(),
    initialize: vi.fn(),
    onStateSyncEvent: vi.fn(),
    requestFullSync: vi.fn(),
}));

vi.mock("../../services/StateSyncService", () => ({
    StateSyncService: mockStateSyncService,
}));

// Mock IPC functions that are used by the store operations
vi.mock("../../types/ipc", () => ({
    extractIpcData: vi.fn((data) => data),
    safeExtractIpcData: vi.fn((data) => data),
    isIpcResponse: vi.fn(() => true),
}));

// Mock SiteService that the store operations use
vi.mock("../../stores/sites/services/SiteService", () => ({
    SiteService: {
        addSite: vi.fn(),
        getSites: vi.fn(),
        updateSite: vi.fn(),
        removeSite: vi.fn(),
        initialize: vi.fn(),
    },
}));

// Mock MonitoringService that monitoring operations use
vi.mock("../../stores/sites/services/MonitoringService", () => ({
    MonitoringService: {
        startSiteMonitoring: vi.fn(),
        stopSiteMonitoring: vi.fn(),
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
        checkSiteNow: vi.fn(),
        initialize: vi.fn(),
    },
}));

describe("useSitesStore Function Coverage Tests", () => {
    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();

        // Set up default mock responses to prevent hanging
        mockElectronAPI.sites.getSites.mockResolvedValue([]);
        mockElectronAPI.sites.addSite.mockResolvedValue(undefined);
        mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);
        mockElectronAPI.sites.removeSite.mockResolvedValue(true);
        mockStateSyncService.getSyncStatus.mockResolvedValue({
            lastSyncAt: Date.now(),
            siteCount: 0,
            source: "cache",
            synchronized: true,
        });

        // Set up SiteService mocks
        vi.mocked(SiteService.addSite).mockResolvedValue({
            identifier: "new-site",
            name: "New Site",
            monitoring: true,
            monitors: [],
        } as Site);
        vi.mocked(SiteService.getSites).mockResolvedValue([]);
        vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);
        vi.mocked(SiteService.removeSite).mockResolvedValue(true);
        vi.mocked(SiteService.initialize).mockResolvedValue(undefined);

        // Set up MonitoringService mocks
        vi.mocked(MonitoringService.checkSiteNow).mockResolvedValue(undefined);
        vi.mocked(MonitoringService.startSiteMonitoring).mockResolvedValue(
            undefined
        );
        vi.mocked(MonitoringService.stopSiteMonitoring).mockResolvedValue(
            undefined
        );
        vi.mocked(MonitoringService.startMonitoring).mockResolvedValue(
            undefined
        );
        vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(
            undefined
        );
        vi.mocked(MonitoringService.initialize).mockResolvedValue(undefined);

        // Reset store to initial state before each test
        const store = useSitesStore.getState();
        store.setSites([]);
        store.selectSite(undefined);
    });

    describe("Store Creation and Composition", () => {
        it("should create store with all required functions", () => {
            const store = useSitesStore.getState();

            // Verify core state properties exist
            expect(Array.isArray(store.sites)).toBeTruthy();
            expect(
                store.selectedSiteIdentifier === undefined ||
                    typeof store.selectedSiteIdentifier === "string"
            ).toBeTruthy();
            expect(typeof store.selectedMonitorIds).toBe("object");

            // Verify state management functions
            expect(typeof store.addSite).toBe("function");
            expect(typeof store.removeSite).toBe("function");
            expect(typeof store.setSites).toBe("function");
            expect(typeof store.selectSite).toBe("function");
            expect(typeof store.getSelectedSite).toBe("function");
            expect(typeof store.setSelectedMonitorId).toBe("function");
            expect(typeof store.getSelectedMonitorId).toBe("function");

            // Verify operation functions
            expect(typeof store.createSite).toBe("function");
            expect(typeof store.deleteSite).toBe("function");
            expect(typeof store.modifySite).toBe("function");
            expect(typeof store.addMonitorToSite).toBe("function");
            expect(typeof store.removeMonitorFromSite).toBe("function");
            expect(typeof store.initializeSites).toBe("function");

            // Verify sync functions
            expect(typeof store.getSyncStatus).toBe("function");
            expect(typeof store.syncSites).toBe("function");
            expect(typeof store.fullResyncSites).toBe("function");

            // Verify monitoring functions
            expect(typeof store.startSiteMonitoring).toBe("function");
            expect(typeof store.stopSiteMonitoring).toBe("function");
        });

        it("should have correct initial state", () => {
            const store = useSitesStore.getState();

            expect(store.sites).toEqual([]);
            expect(store.selectedSiteIdentifier).toBeUndefined();
            expect(store.selectedMonitorIds).toEqual({});
        });

        it("should exercise local state manipulation functions", () => {
            const store = useSitesStore.getState();

            const testSite: Site = {
                identifier: "test-site-1",
                name: "Test Site 1",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "pending",
                        monitoring: true,
                        history: [],
                        checkInterval: 60_000,
                        responseTime: 0,
                        retryAttempts: 3,
                        timeout: 5000,
                    },
                ],
                monitoring: true,
            };

            // Test addSite (local state function)
            store.addSite(testSite);
            expect(useSitesStore.getState().sites).toHaveLength(1);
            expect(useSitesStore.getState().sites[0]).toEqual(testSite);

            // Test selectSite
            store.selectSite(testSite);
            expect(useSitesStore.getState().selectedSiteIdentifier).toBe(
                testSite.identifier
            );

            // Test getSelectedSite
            const selectedSite = store.getSelectedSite();
            expect(selectedSite).toEqual(testSite);

            // Test setSelectedMonitorId
            store.setSelectedMonitorId(testSite.identifier, "monitor-1");
            expect(
                useSitesStore.getState().selectedMonitorIds[testSite.identifier]
            ).toBe("monitor-1");

            // Test getSelectedMonitorId
            const selectedMonitorId = store.getSelectedMonitorId(
                testSite.identifier
            );
            expect(selectedMonitorId).toBe("monitor-1");

            // Test removeSite
            store.removeSite(testSite.identifier);
            expect(useSitesStore.getState().sites).toHaveLength(0);
            expect(
                useSitesStore.getState().selectedSiteIdentifier
            ).toBeUndefined();
        });
    });

    describe("Async Operations Function Coverage", () => {
        it("should exercise createSite operation", async () => {
            // Mock successful IPC response
            mockElectronAPI.sites.addSite.mockResolvedValueOnce(undefined);

            const store = useSitesStore.getState();

            // Test createSite function - this adds a default HTTP monitor
            await store.createSite({
                identifier: "new-site",
                name: "New Site",
            });

            // Verify SiteService was called instead of electronAPI directly
            expect(SiteService.addSite).toHaveBeenCalled();
        });

        it("should exercise sync status functions", async () => {
            // Mock sync status response
            mockStateSyncService.getSyncStatus.mockResolvedValueOnce({
                lastSyncAt: Date.now(),
                siteCount: 2,
                source: "database",
                synchronized: true,
            });

            const store = useSitesStore.getState();

            // Test getSyncStatus
            const syncStatus = await store.getSyncStatus();

            // The function should return proper status object
            expect(syncStatus).toBeDefined();
            expect(typeof syncStatus.synchronized).toBe("boolean");
            expect(typeof syncStatus.siteCount).toBe("number");
            expect(
                syncStatus.lastSyncAt === null ||
                    typeof syncStatus.lastSyncAt === "number"
            ).toBeTruthy();
            expect(typeof syncStatus.source).toBe("string");
            expect(mockStateSyncService.getSyncStatus).toHaveBeenCalled();
        });

        it("should exercise initialization functions", async () => {
            // Mock initialization response
            mockElectronAPI.sites.getSites.mockResolvedValueOnce([]);

            const store = useSitesStore.getState();

            // Test initializeSites
            const result = await store.initializeSites();

            expect(result).toBeDefined();
            expect(typeof result.success).toBe("boolean");
            expect(typeof result.sitesLoaded).toBe("number");
            expect(typeof result.message).toBe("string");
            expect(SiteService.getSites).toHaveBeenCalled();
        });

        it("should exercise monitoring operations", async () => {
            const store = useSitesStore.getState();

            // Test monitoring functions
            await store.startSiteMonitoring("site-id");
            expect(MonitoringService.startSiteMonitoring).toHaveBeenCalledWith(
                "site-id"
            );

            await store.stopSiteMonitoring("site-id");
            expect(MonitoringService.stopSiteMonitoring).toHaveBeenCalledWith(
                "site-id"
            );

            await store.checkSiteNow("site-id", "monitor-id");
            expect(MonitoringService.checkSiteNow).toHaveBeenCalledWith(
                "site-id",
                "monitor-id"
            );
        });

        it("should exercise site modification operations", async () => {
            // Mock site modification response
            mockElectronAPI.sites.updateSite.mockResolvedValueOnce(undefined);
            mockElectronAPI.sites.getSites.mockResolvedValueOnce([]);

            const store = useSitesStore.getState();

            // Test modifySite
            await store.modifySite("site-id", { name: "Updated Name" });
            expect(SiteService.updateSite).toHaveBeenCalledWith("site-id", {
                name: "Updated Name",
            });
        });

        it("should exercise deletion operations", async () => {
            // Add a test site first
            const testSite: Site = {
                identifier: "delete-site",
                name: "Site to Delete",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "pending",
                        monitoring: true,
                        history: [],
                        checkInterval: 60_000,
                        responseTime: 0,
                        retryAttempts: 3,
                        timeout: 5000,
                    },
                ],
                monitoring: true,
            };

            const store = useSitesStore.getState();
            store.addSite(testSite);

            // Mock deletion responses
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(
                true
            );
            mockElectronAPI.sites.removeSite.mockResolvedValueOnce(true);
            mockElectronAPI.sites.getSites.mockResolvedValueOnce([]);

            // Test deleteSite
            await store.deleteSite("delete-site");
            expect(SiteService.removeSite).toHaveBeenCalledWith("delete-site");
        });

        it("should exercise sync operations", async () => {
            // Mock sync responses
            mockElectronAPI.sites.getSites.mockResolvedValueOnce([]);

            const store = useSitesStore.getState();

            // Test syncSites
            await store.syncSites();
            expect(SiteService.getSites).toHaveBeenCalled();

            // Test fullResyncSites
            await store.fullResyncSites();
            // Should call getSites again for full sync
            expect(SiteService.getSites).toHaveBeenCalledTimes(2);
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle getSyncStatus errors with fallback", async () => {
            // Mock error response
            mockStateSyncService.getSyncStatus.mockRejectedValueOnce(
                new Error("Sync failed")
            );

            const store = useSitesStore.getState();

            // Test getSyncStatus error handling
            const syncStatus = await store.getSyncStatus();

            // Should return fallback values on error
            expect(syncStatus.synchronized).toBeFalsy();
            expect(syncStatus.siteCount).toBe(0);
            expect(syncStatus.lastSyncAt).toBeNull();
            expect(syncStatus.source).toBe("frontend");
        });

        it("should handle operation errors gracefully", async () => {
            // Mock error responses
            vi.mocked(SiteService.addSite).mockRejectedValueOnce(
                new Error("Add failed")
            );

            const store = useSitesStore.getState();

            // Test createSite error handling
            await expect(
                store.createSite({
                    identifier: "error-site",
                    name: "Error Site",
                })
            ).rejects.toThrow();
        });

        it("should handle missing site selections gracefully", () => {
            const store = useSitesStore.getState();

            // Test getSelectedSite with no selection
            const selectedSite = store.getSelectedSite();
            expect(selectedSite).toBeUndefined();

            // Test getSelectedMonitorId with non-existent site
            const selectedMonitorId =
                store.getSelectedMonitorId("non-existent");
            expect(selectedMonitorId).toBeUndefined();
        });
    });
});
