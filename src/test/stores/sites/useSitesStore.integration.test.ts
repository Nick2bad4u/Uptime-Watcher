/**
 * Integration tests for the refactored sites store modules.
 * Tests the integration between different modules and their composed functionality.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site, Monitor } from "../../../types";

import {
    createSiteMonitoringActions,
    createSiteOperationsActions,
    createSitesStateActions,
    initialSitesState,
    createSiteSyncActions,
} from "../../../stores";

// Mock all dependencies
vi.mock("../../../stores/sites/services", () => ({
    MonitoringService: {
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
    },
    SiteService: {
        addSite: vi.fn(),
        checkSiteNow: vi.fn(),
        downloadSQLiteBackup: vi.fn(),
        getSites: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    },
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(async (fn: () => Promise<unknown>) => {
        return await fn();
    }),
}));

describe("Sites Store Modules Integration Tests", () => {
    let mockState: { sites: Site[]; selectedSiteId?: string; selectedMonitorIds: Record<string, string> };
    let mockSet: ReturnType<typeof vi.fn>;
    let mockGet: ReturnType<typeof vi.fn>;
    let stateActions: ReturnType<typeof createSitesStateActions>;
    let syncActions: ReturnType<typeof createSiteSyncActions>;
    let monitoringActions: ReturnType<typeof createSiteMonitoringActions>;
    let operationsActions: ReturnType<typeof createSiteOperationsActions>;
    let mockSite: Site;
    let mockMonitor: Monitor;

    beforeEach(() => {
        vi.clearAllMocks();

        mockMonitor = {
            checkInterval: 30000,
            history: [],
            id: "monitor-1",
            lastChecked: new Date(),
            monitoring: true,
            status: "up",
            type: "http" as const,
            url: "https://example.com",
            responseTime: 0,
            timeout: 0,
            retryAttempts: 0,
        };

        mockSite = {
            identifier: "example.com",
            monitors: [mockMonitor],
            name: "Example Site",
            monitoring: false,
        };

        mockState = {
            selectedMonitorIds: {},
            sites: [],
        } as { sites: Site[]; selectedSiteId?: string; selectedMonitorIds: Record<string, string> };

        mockSet = vi.fn((updater) => {
            if (typeof updater === "function") {
                const newState = updater(mockState);
                Object.assign(mockState, newState);
            } else {
                Object.assign(mockState, updater);
            }
        });

        mockGet = vi.fn(() => mockState);

        // Create all action modules
        stateActions = createSitesStateActions(mockSet, mockGet);

        syncActions = createSiteSyncActions({
            getSites: () => mockState.sites,
            setSites: stateActions.setSites,
        });

        monitoringActions = createSiteMonitoringActions({
            syncSitesFromBackend: syncActions.syncSitesFromBackend,
        });

        operationsActions = createSiteOperationsActions({
            addSite: stateActions.addSite,
            getSites: () => mockState.sites,
            removeSite: stateActions.removeSite,
            setSites: stateActions.setSites,
            syncSitesFromBackend: syncActions.syncSitesFromBackend,
        });
    });

    describe("Module Integration", () => {
        it("should integrate state and sync modules correctly", async () => {
            const { SiteService } = await import("../../../stores");
            vi.mocked(SiteService.getSites).mockResolvedValue([mockSite]);

            // Start with empty state
            expect(mockState.sites).toEqual([]);

            // Sync should fetch and set sites
            await syncActions.syncSitesFromBackend();

            expect(SiteService.getSites).toHaveBeenCalledTimes(1);
            expect(mockSet).toHaveBeenCalled();
        });

        it("should integrate operations and sync modules", async () => {
            const { SiteService } = await import("../../../stores");
            vi.mocked(SiteService.addSite).mockResolvedValue(mockSite);

            const siteData = {
                identifier: "new-site.com",
                name: "New Site",
            };

            // Check initial state
            expect(mockState.sites).toHaveLength(0);

            await operationsActions.createSite(siteData);

            expect(SiteService.addSite).toHaveBeenCalled();
            // Check that the site was added to the state
            expect(mockState.sites).toHaveLength(1);
            expect(mockState.sites[0]).toEqual(mockSite);
        });

        it("should integrate monitoring and sync modules", async () => {
            const { MonitoringService, SiteService } = await import("../../../stores");
            vi.mocked(MonitoringService.startMonitoring).mockResolvedValue(undefined);
            vi.mocked(SiteService.getSites).mockResolvedValue([mockSite]);

            await monitoringActions.startSiteMonitorMonitoring("example.com", "monitor-1");

            expect(MonitoringService.startMonitoring).toHaveBeenCalledWith("example.com", "monitor-1");
            // The monitoring action should trigger a sync, which calls SiteService.getSites
            expect(SiteService.getSites).toHaveBeenCalled();
        });

        it("should handle complete site lifecycle through modules", async () => {
            const { MonitoringService, SiteService } = await import("../../../stores/sites/services");

            // Setup mocks
            vi.mocked(SiteService.addSite).mockResolvedValue(mockSite);
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);
            vi.mocked(SiteService.removeSite).mockResolvedValue(undefined);
            vi.mocked(MonitoringService.startMonitoring).mockResolvedValue(undefined);
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);

            // 1. Create site
            await operationsActions.createSite({
                identifier: "test.com",
                name: "Test Site",
            });

            expect(SiteService.addSite).toHaveBeenCalled();

            // 2. Start monitoring
            await monitoringActions.startSiteMonitorMonitoring("test.com", "monitor-1");
            expect(MonitoringService.startMonitoring).toHaveBeenCalledWith("test.com", "monitor-1");

            // 3. Update site
            await operationsActions.modifySite("test.com", { name: "Updated Test Site" });
            expect(SiteService.updateSite).toHaveBeenCalledWith("test.com", { name: "Updated Test Site" });

            // 4. Delete site (should stop monitoring first)
            mockState.sites = [mockSite]; // Simulate site exists
            await operationsActions.deleteSite("example.com");

            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith("example.com", "monitor-1");
            expect(SiteService.removeSite).toHaveBeenCalledWith("example.com");
        });
    });

    describe("Error Propagation Between Modules", () => {
        it("should propagate errors from sync to operations", async () => {
            const { SiteService } = await import("../../../stores/sites/services");
            vi.mocked(SiteService.addSite).mockResolvedValue(mockSite);
            vi.mocked(SiteService.getSites).mockRejectedValue(new Error("Sync failed"));

            // Operations should still complete even if sync fails
            await operationsActions.createSite({
                identifier: "test.com",
                name: "Test Site",
            });

            expect(SiteService.addSite).toHaveBeenCalled();
        });

        it("should handle monitoring service failures gracefully", async () => {
            const { MonitoringService } = await import("../../../stores/sites/services");
            vi.mocked(MonitoringService.startMonitoring).mockRejectedValue(new Error("Monitoring failed"));

            await expect(monitoringActions.startSiteMonitorMonitoring("test.com", "monitor-1")).rejects.toThrow(
                "Monitoring failed"
            );
        });
    });

    describe("State Consistency Across Modules", () => {
        it("should maintain state consistency during concurrent operations", async () => {
            const { SiteService } = await import("../../../stores/sites/services");
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);
            vi.mocked(SiteService.getSites).mockResolvedValue([]);

            // Simulate concurrent state updates
            const site1 = { ...mockSite, identifier: "site1.com" };
            const site2 = { ...mockSite, identifier: "site2.com" };

            mockState.sites = [site1, site2];

            // Concurrent operations
            const operations = [
                operationsActions.updateSiteCheckInterval("site1.com", "monitor-1", 30000),
                operationsActions.updateMonitorRetryAttempts("site2.com", "monitor-1", 3),
            ];

            await Promise.all(operations);

            expect(SiteService.updateSite).toHaveBeenCalledTimes(2);
            // Each operation should trigger a sync, so SiteService.getSites should be called twice
            expect(SiteService.getSites).toHaveBeenCalledTimes(2);
        });

        it("should handle state access during operations", () => {
            // Add sites to state
            stateActions.setSites([mockSite]);

            // Select site and monitor
            stateActions.setSelectedSite(mockSite);
            stateActions.setSelectedMonitorId(mockSite.identifier, mockMonitor.id);

            // Verify state is correctly accessed
            expect(mockState.selectedSiteId).toBe(mockSite.identifier);
            expect(mockState.selectedMonitorIds[mockSite.identifier]).toBe(mockMonitor.id);

            // Remove site should clear selections
            stateActions.removeSite(mockSite.identifier);

            expect(mockState.sites).toHaveLength(0);
            expect(mockState.selectedSiteId).toBeUndefined();
            expect(mockState.selectedMonitorIds[mockSite.identifier]).toBeUndefined();
        });
    });

    describe("Module Initialization", () => {
        it("should have correct initial state", () => {
            expect(initialSitesState).toEqual({
                selectedMonitorIds: {},
                selectedSiteId: undefined,
                sites: [],
            });
        });

        it("should create all modules with correct dependencies", () => {
            expect(stateActions).toHaveProperty("addSite");
            expect(stateActions).toHaveProperty("removeSite");
            expect(stateActions).toHaveProperty("setSites");

            expect(syncActions).toHaveProperty("syncSitesFromBackend");

            expect(monitoringActions).toHaveProperty("startSiteMonitorMonitoring");
            expect(monitoringActions).toHaveProperty("stopSiteMonitorMonitoring");
            expect(monitoringActions).toHaveProperty("checkSiteNow");

            expect(operationsActions).toHaveProperty("createSite");
            expect(operationsActions).toHaveProperty("deleteSite");
            expect(operationsActions).toHaveProperty("modifySite");
        });
    });
});
