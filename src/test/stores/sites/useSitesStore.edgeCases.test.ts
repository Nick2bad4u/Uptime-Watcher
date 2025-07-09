/**
 * Edge case and error scenario tests for the refactored sites store modules.
 * Tests boundary conditions, error handling, and unusual scenarios.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site, Monitor } from "../../../types";

import { createSiteMonitoringActions } from "../../../stores/sites/useSiteMonitoring";
import { createSiteOperationsActions } from "../../../stores/sites/useSiteOperations";
import { createSiteSyncActions } from "../../../stores/sites/useSiteSync";

// Mock dependencies
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

vi.mock("../../../stores/sites/utils/monitorOperations", () => ({
    normalizeMonitor: vi.fn(),
    updateMonitorInSite: vi.fn(),
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(
        async (
            fn: () => Promise<unknown>,
            store?: {
                setLoading: (loading: boolean) => void;
                clearError: () => void;
                setError: (error: string) => void;
            }
        ) => {
            if (store) {
                store.setLoading(true);
                store.clearError();
            }
            try {
                return await fn();
            } catch (error) {
                if (store) {
                    store.setError(error instanceof Error ? error.message : String(error));
                    console.error(
                        "Error in withErrorHandling:",
                        error instanceof Error ? error.message : String(error)
                    );
                }
                throw error;
            } finally {
                if (store) {
                    store.setLoading(false);
                }
            }
        }
    ),
}));

describe("Sites Store Modules - Edge Cases and Error Scenarios", () => {
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
        };

        mockSite = {
            identifier: "example.com",
            monitors: [mockMonitor],
            name: "Example Site",
        };
    });

    describe("useSiteSync Error Scenarios", () => {
        it("should handle sync errors gracefully", async () => {
            const mockSetSites = vi.fn();
            const syncActions = createSiteSyncActions({
                getSites: () => [],
                setSites: mockSetSites,
            });

            const { SiteService } = await import("../../../stores/sites/services");
            vi.mocked(SiteService.getSites).mockRejectedValue(new Error("Network error"));

            await expect(syncActions.syncSitesFromBackend()).rejects.toThrow("Network error");
            expect(mockSetSites).not.toHaveBeenCalled();
        });


        it("should handle malformed site data", async () => {
            const mockSetSites = vi.fn();
            const syncActions = createSiteSyncActions({
                getSites: () => [],
                setSites: mockSetSites,
            });

            const { SiteService } = await import("../../../stores/sites/services");
            const malformedSites = [
                { identifier: "test.com" }, // missing name and monitors
                { name: "Test" }, // missing identifier and monitors
                null, // null site
                undefined, // undefined site
            ];

            // @ts-expect-error - Testing edge case
            vi.mocked(SiteService.getSites).mockResolvedValue(malformedSites);

            await syncActions.syncSitesFromBackend();
            expect(mockSetSites).toHaveBeenCalledWith(malformedSites);
        });
    });

    describe("useSiteOperations Error Scenarios", () => {
        it("should handle operations when sites array is corrupted", async () => {
            const mockDependencies = {
                addSite: vi.fn(),
                getSites: vi.fn(() => [mockSite] as Site[]),
                removeSite: vi.fn(),
                setSites: vi.fn(),
                syncSitesFromBackend: vi.fn(),
            };

            const operations = createSiteOperationsActions(mockDependencies);

            // Should not crash when dealing with corrupted sites array
            const { MonitoringService } = await import("../../../stores/sites/services");
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);

            await operations.deleteSite("example.com");
            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith("example.com", "monitor-1");
        });

        it("should handle site creation with empty or invalid monitor data", async () => {
            const mockDependencies = {
                addSite: vi.fn(),
                getSites: vi.fn(() => []),
                removeSite: vi.fn(),
                setSites: vi.fn(),
                syncSitesFromBackend: vi.fn(),
            };

            const operations = createSiteOperationsActions(mockDependencies);
            const { SiteService } = await import("../../../stores/sites/services");

            const siteData = {
                identifier: "test.com",
                monitors: [
                    null, // null monitor
                    undefined, // undefined monitor
                    { id: "valid-monitor", type: "http" as const }, // partial valid monitor
                ],
                name: "Test Site",
            };

            const normalizeMonitorModule = await import("../../../stores/sites/utils/monitorOperations");
            vi.mocked(normalizeMonitorModule.normalizeMonitor).mockImplementation((monitor) => monitor as Monitor);
            vi.mocked(SiteService.addSite).mockResolvedValue(mockSite);

            // @ts-expect-error - Testing edge case
            await operations.createSite(siteData);

            expect(SiteService.addSite).toHaveBeenCalled();
        });

        it("should handle monitor updates on non-existent sites", async () => {
            const mockDependencies = {
                addSite: vi.fn(),
                getSites: vi.fn(() => []), // empty sites array
                removeSite: vi.fn(),
                setSites: vi.fn(),
                syncSitesFromBackend: vi.fn(),
            };

            const operations = createSiteOperationsActions(mockDependencies);

            // Should throw errors when trying to update monitors on non-existent sites
            await expect(operations.updateSiteCheckInterval("non-existent-site", "monitor-1", 60000)).rejects.toThrow(
                "Site not found"
            );
            await expect(operations.updateMonitorRetryAttempts("non-existent-site", "monitor-1", 3)).rejects.toThrow(
                "Site not found"
            );
            await expect(operations.updateMonitorTimeout("non-existent-site", "monitor-1", 15000)).rejects.toThrow(
                "Site not found"
            );

            // Should not sync since operations failed
            expect(mockDependencies.syncSitesFromBackend).not.toHaveBeenCalled();
        });

        it("should handle extreme values for monitor updates", async () => {
            const mockDependencies = {
                addSite: vi.fn(),
                getSites: vi.fn(() => [mockSite]),
                removeSite: vi.fn(),
                setSites: vi.fn(),
                syncSitesFromBackend: vi.fn(),
            };

            const operations = createSiteOperationsActions(mockDependencies);
            const { SiteService } = await import("../../../stores/sites/services");
            const { updateMonitorInSite } = await import("../../../stores/sites/utils");

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);
            vi.mocked(updateMonitorInSite).mockReturnValue(mockSite);

            // Test extreme values
            await operations.updateSiteCheckInterval("example.com", "monitor-1", Number.MAX_SAFE_INTEGER);
            await operations.updateSiteCheckInterval("example.com", "monitor-1", 0);
            await operations.updateSiteCheckInterval("example.com", "monitor-1", -1);

            await operations.updateMonitorRetryAttempts("example.com", "monitor-1", Number.MAX_SAFE_INTEGER);
            await operations.updateMonitorRetryAttempts("example.com", "monitor-1", 0);
            await operations.updateMonitorRetryAttempts("example.com", "monitor-1", -1);

            await operations.updateMonitorTimeout("example.com", "monitor-1", Number.MAX_SAFE_INTEGER);
            await operations.updateMonitorTimeout("example.com", "monitor-1", 0);
            await operations.updateMonitorTimeout("example.com", "monitor-1", -1);

            expect(SiteService.updateSite).toHaveBeenCalledTimes(9);
        });
    });

    describe("useSiteMonitoring Error Scenarios", () => {
        it("should handle monitoring operations with invalid site data", async () => {
            const mockSyncSitesFromBackend = vi.fn();
            const monitoringActions = createSiteMonitoringActions({
                syncSitesFromBackend: mockSyncSitesFromBackend,
            });

            const { MonitoringService } = await import("../../../stores/sites/services");
            vi.mocked(MonitoringService.startMonitoring).mockRejectedValue(new Error("Monitoring service unavailable"));

            // Should handle errors gracefully
            await expect(monitoringActions.startSiteMonitorMonitoring("test-site", "monitor-1")).rejects.toThrow(
                "Monitoring service unavailable"
            );
        });

        it("should handle stop monitoring for non-existent monitors", async () => {
            const mockSyncSitesFromBackend = vi.fn();
            const monitoringActions = createSiteMonitoringActions({
                syncSitesFromBackend: mockSyncSitesFromBackend,
            });

            const { MonitoringService } = await import("../../../stores/sites/services");
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);

            // Should not crash when stopping non-existent monitors
            await monitoringActions.stopSiteMonitorMonitoring("non-existent-site", "non-existent-monitor");
            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith("non-existent-site", "non-existent-monitor");
        });

        it("should handle check site now with various error conditions", async () => {
            const mockSyncSitesFromBackend = vi.fn();
            const monitoringActions = createSiteMonitoringActions({
                syncSitesFromBackend: mockSyncSitesFromBackend,
            });

            const { SiteService } = await import("../../../stores/sites/services");

            // Test network timeout
            vi.mocked(SiteService.checkSiteNow).mockRejectedValueOnce(new Error("Network timeout"));
            await expect(monitoringActions.checkSiteNow("test-site", "monitor-1")).rejects.toThrow("Network timeout");

            // Test malformed response
            vi.mocked(SiteService.checkSiteNow).mockRejectedValueOnce(new Error("Malformed response"));
            await expect(monitoringActions.checkSiteNow("test-site", "monitor-1")).rejects.toThrow(
                "Malformed response"
            );

            // Test service unavailable
            vi.mocked(SiteService.checkSiteNow).mockRejectedValueOnce(new Error("Service unavailable"));
            await expect(monitoringActions.checkSiteNow("test-site", "monitor-1")).rejects.toThrow(
                "Service unavailable"
            );
        });
    });

    describe("Memory and Performance Edge Cases", () => {
        it("should handle large numbers of sites and monitors", () => {
            // Create monitors outside the nested structure to avoid deep nesting
            const createMonitor = (siteIndex: number, monitorIndex: number): Monitor => ({
                checkInterval: 30000,
                history: [],
                id: `monitor-${siteIndex}-${monitorIndex}`,
                lastChecked: new Date(),
                monitoring: true,
                status: "up",
                type: "http" as const,
                url: `https://site-${siteIndex}.com/endpoint-${monitorIndex}`,
            });

            const createMonitors = (siteIndex: number): Monitor[] => {
                const monitors: Monitor[] = [];
                for (let j = 0; j < 10; j++) {
                    monitors.push(createMonitor(siteIndex, j));
                }
                return monitors;
            };

            const createSite = (index: number): Site => ({
                identifier: `site-${index}.com`,
                monitors: createMonitors(index),
                name: `Site ${index}`,
            });

            const largeSitesArray: Site[] = [];
            for (let i = 0; i < 1000; i++) {
                largeSitesArray.push(createSite(i));
            }

            const mockDependencies = {
                addSite: vi.fn(),
                getSites: vi.fn(() => largeSitesArray),
                removeSite: vi.fn(),
                setSites: vi.fn(),
                syncSitesFromBackend: vi.fn(),
            };

            const operations = createSiteOperationsActions(mockDependencies);

            // Should handle large datasets without crashing
            expect(() => operations.deleteSite("site-500.com")).not.toThrow();
            expect(mockDependencies.getSites).toHaveBeenCalled();
        });

        it("should handle circular references in site data", () => {
            const circularSite: any = {
                identifier: "circular.com",
                monitors: [],
                name: "Circular Site",
            };

            // Create circular reference
            circularSite.self = circularSite;
            circularSite.monitors = [
                {
                    id: "monitor-1",
                    parent: circularSite, // circular reference
                    type: "http",
                    url: "https://circular.com",
                },
            ];

            const mockDependencies = {
                addSite: vi.fn(),
                getSites: vi.fn(() => [circularSite]),
                removeSite: vi.fn(),
                setSites: vi.fn(),
                syncSitesFromBackend: vi.fn(),
            };

            const operations = createSiteOperationsActions(mockDependencies);

            // Should handle circular references without infinite loops
            expect(() => operations.deleteSite("circular.com")).not.toThrow();
        });
    });

    describe("Concurrent Operations", () => {
        it("should handle concurrent site operations", async () => {
            const mockDependencies = {
                addSite: vi.fn(),
                getSites: vi.fn(() => [mockSite]),
                removeSite: vi.fn(),
                setSites: vi.fn(),
                syncSitesFromBackend: vi.fn().mockResolvedValue(undefined),
            };

            const operations = createSiteOperationsActions(mockDependencies);
            const { SiteService } = await import("../../../stores/sites/services");
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            // Simulate concurrent operations
            const promises = [
                operations.updateSiteCheckInterval("example.com", "monitor-1", 30000),
                operations.updateMonitorRetryAttempts("example.com", "monitor-1", 3),
                operations.updateMonitorTimeout("example.com", "monitor-1", 15000),
                operations.modifySite("example.com", { name: "Updated Site" }),
            ];

            // Should handle concurrent operations without issues
            await expect(Promise.all(promises)).resolves.not.toThrow();
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(4);
        });
    });
});
