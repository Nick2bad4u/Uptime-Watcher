/**
 * Tests useSiteOperations error handling paths and edge cases.
 */

import type { Monitor, Site } from "@shared/types";

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { arrayAt, arrayFirst } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SiteOperationsDependencies } from "../../../stores/sites/types";

import { logger } from "../../../services/logger";
import { createSiteOperationsActions } from "../../../stores/sites/useSiteOperations";
import { applySavedSiteToStore } from "../../../stores/sites/utils/operationHelpers";

// Mock logger to control development mode checks
vi.mock("../../../services/logger", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

const mockErrorStore = {
    clearStoreError: vi.fn(),
    setStoreError: vi.fn(),
    setOperationLoading: vi.fn(),
};

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => mockErrorStore),
    },
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(
        async <T>(
            fn: () => Promise<T>,
            handlers: {
                setError?: (error: unknown) => void;
                setLoading?: (isLoading: boolean) => void;
            }
        ) => {
            try {
                const result = await fn();
                handlers.setLoading?.(false);
                return result;
            } catch (error: unknown) {
                handlers.setError?.(error);
                handlers.setLoading?.(false);
                throw error;
            }
        }
    ),
}));

vi.mock("../../../stores/sites/utils/fileDownload", () => ({
    handleSQLiteBackupDownload: vi.fn(async (callback) => await callback()),
}));

vi.mock("../../../utils/safeExtractIpcData", () => ({
    safeExtractIpcData: vi.fn((response, _defaultValue) => {
        if (response.success) {
            return response.data;
        }
        throw new Error("Failed to extract IPC data");
    }),
}));

const createMockElectronAPI = (mockSiteWithMultipleMonitors: Site) => ({
    data: {
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(1024),
            fileName: "backup.db",
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "mock-checksum",
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 1024,
            },
        }),
        restoreSqliteBackup: vi.fn().mockResolvedValue({
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "restore-checksum",
                createdAt: 0,
                originalPath: "/tmp/restore.db",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 1024,
            },
            preRestoreFileName: "pre-restore.db",
            restoredAt: 0,
        }),
        saveSqliteBackup: vi.fn().mockResolvedValue({
            canceled: true as const,
        }),
    },
    monitoring: {
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
    sites: {
        removeMonitor: vi.fn(
            async (siteIdentifier: string, monitorId: string) => ({
                ...mockSiteWithMultipleMonitors,
                identifier: siteIdentifier,
                monitors: mockSiteWithMultipleMonitors.monitors.filter(
                    (monitor: Monitor) => monitor.id !== monitorId
                ),
            })
        ),
        removeSite: vi.fn().mockResolvedValue(true),
    },
});

describe("useSiteOperations behavior", () => {
    let mockElectronAPI: ReturnType<typeof createMockElectronAPI>;
    let mockSiteDeps: SiteOperationsDependencies;
    let actions: ReturnType<typeof createSiteOperationsActions>;
    let siteService: SiteOperationsDependencies["services"]["site"];

    // Test site with multiple monitors
    const mockSiteWithMultipleMonitors: Site = {
        identifier: "test-site-multi",
        name: "Test Site Multi",
        monitoring: true,
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                status: "up",
                lastChecked: new Date(),
                responseTime: 100,
                monitoring: true,
                retryAttempts: 3,
                history: [],
            },
            {
                id: "monitor-2",
                type: "http",
                url: "https://example.com/api",
                checkInterval: 60_000,
                timeout: 5000,
                status: "up",
                lastChecked: new Date(),
                responseTime: 150,
                monitoring: true,
                retryAttempts: 3,
                history: [],
            },
        ],
    };

    // Test site with single monitor
    const mockSiteWithSingleMonitor: Site = {
        ...mockSiteWithMultipleMonitors,
        identifier: "test-site-single",
        monitors: [arrayFirst(mockSiteWithMultipleMonitors.monitors)!],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockElectronAPI = createMockElectronAPI(mockSiteWithMultipleMonitors);

        const getSitesFn = vi.fn(() => [
            mockSiteWithMultipleMonitors,
            mockSiteWithSingleMonitor,
        ]);

        const dataService = {
            downloadSqliteBackup: vi.fn(async () =>
                mockElectronAPI.data.downloadSqliteBackup()
            ),
            saveSqliteBackup: vi.fn(async () =>
                mockElectronAPI.data.saveSqliteBackup()
            ),
            restoreSqliteBackup: vi.fn(async (payload) =>
                mockElectronAPI.data.restoreSqliteBackup(payload)
            ),
        };

        siteService = {
            addSite: vi.fn(async (site: Site) => site),
            getSites: vi.fn(async () => getSitesFn()),
            removeMonitor: vi.fn(
                async (siteIdentifier: string, monitorId: string) =>
                    mockElectronAPI.sites.removeMonitor(
                        siteIdentifier,
                        monitorId
                    )
            ),
            removeSite: vi.fn(async (identifier: string) =>
                mockElectronAPI.sites.removeSite(identifier)
            ),
            updateSite: vi.fn(
                async (identifier: string, updates: Partial<Site>) => ({
                    ...mockSiteWithMultipleMonitors,
                    ...updates,
                    identifier,
                })
            ),
        };

        mockSiteDeps = {
            getSites: getSitesFn,
            removeSite: vi.fn(),
            setLastBackupMetadata: vi.fn(),
            setSites: vi.fn(),
            syncSites: vi.fn(),
            services: {
                data: dataService,
                site: siteService,
            },
        } satisfies SiteOperationsDependencies;

        actions = createSiteOperationsActions(mockSiteDeps);
    });

    describe("deleteSite orchestrator alignment", () => {
        it("should avoid monitoring stop calls while removing a site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

            mockElectronAPI.sites.removeSite.mockResolvedValue(true);

            await actions.deleteSite(mockSiteWithMultipleMonitors.identifier);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier
            );
            expect(mockSiteDeps.removeSite).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier
            );
            expect(logger.warn).not.toHaveBeenCalled();
        });

        it("should continue to avoid monitoring stop calls when deletion fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Delete failed");
            mockElectronAPI.sites.removeSite.mockRejectedValueOnce(error);

            await expect(
                actions.deleteSite(mockSiteWithSingleMonitor.identifier)
            ).rejects.toThrow("Delete failed");

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(mockSiteDeps.removeSite).not.toHaveBeenCalled();
            expect(logger.warn).not.toHaveBeenCalled();
        });
    });

    describe("downloadSqliteBackup Error Handling (Lines 147-151)", () => {
        it("should handle and rethrow errors when SQLite backup download fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const downloadError = new Error("Backup download failed");
            mockElectronAPI.data.downloadSqliteBackup.mockRejectedValueOnce(
                downloadError
            );

            // Logger.error should be called and error should be rethrown
            vi.mocked(logger.error).mockClear();

            await expect(actions.downloadSqliteBackup()).rejects.toThrow(
                "Backup download failed"
            );

            // Verify logger.error was called.
            expect(logger.error).toHaveBeenCalledWith(
                "Failed to download SQLite backup:",
                downloadError
            );
        });

        it("should handle successful backup download", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Backup Operation", "type");

            await actions.downloadSqliteBackup();

            expect(
                mockElectronAPI.data.downloadSqliteBackup
            ).toHaveBeenCalled();
        });
    });

    describe("removeMonitorFromSite Edge Cases (Line 203)", () => {
        it("should throw error when trying to remove the last monitor from a site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            // Try to remove the only monitor from a site with single monitor
            await expect(
                actions.removeMonitorFromSite(
                    mockSiteWithSingleMonitor.identifier,
                    arrayFirst(mockSiteWithSingleMonitor.monitors)!.id
                )
            ).rejects.toThrow(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);

            // Verify no backend calls were made since validation failed early
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(siteService.removeMonitor).not.toHaveBeenCalled();
            expect(mockSiteDeps.setSites).not.toHaveBeenCalled();
            expect(mockSiteDeps.syncSites).not.toHaveBeenCalled();
        });
    });

    describe("removeMonitorFromSite execution", () => {
        it("should call SiteService.removeMonitor and update the local store", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            await actions.removeMonitorFromSite(
                mockSiteWithMultipleMonitors.identifier,
                arrayFirst(mockSiteWithMultipleMonitors.monitors)!.id
            );

            expect(siteService.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                arrayFirst(mockSiteWithMultipleMonitors.monitors)!.id
            );
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();

            expect(mockSiteDeps.setSites).toHaveBeenCalled();
            const updatedSites =
                arrayAt(vi.mocked(mockSiteDeps.setSites).mock.calls, -1)?.[0] ??
                [];
            const reconciledSite = updatedSites.find(
                (site: Site) =>
                    site.identifier === mockSiteWithMultipleMonitors.identifier
            );
            expect(reconciledSite?.monitors).toHaveLength(1);
            expect(mockSiteDeps.syncSites).not.toHaveBeenCalled();
        });

        it("should propagate errors when SiteService.removeMonitor fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const removalError = new Error("Monitor removal failed");
            vi.mocked(siteService.removeMonitor).mockRejectedValueOnce(
                removalError
            );

            await expect(
                actions.removeMonitorFromSite(
                    mockSiteWithMultipleMonitors.identifier,
                    arrayFirst(mockSiteWithMultipleMonitors.monitors)!.id
                )
            ).rejects.toThrow("Monitor removal failed");

            expect(mockSiteDeps.setSites).not.toHaveBeenCalled();
            expect(mockSiteDeps.syncSites).not.toHaveBeenCalled();
        });

        it("should remain consistent when a backend sync event overwrites the optimistic state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const baseSite: Site = {
                ...mockSiteWithMultipleMonitors,
                monitors: mockSiteWithMultipleMonitors.monitors.map(
                    (monitor) => ({
                        ...monitor,
                        history: [...monitor.history],
                    })
                ),
            };

            const sitesState: Site[] = [baseSite];

            const statefulDeps: SiteOperationsDependencies = {
                getSites: vi.fn(() => sitesState),
                removeSite: vi.fn(),
                setLastBackupMetadata: vi.fn(),
                setSites: vi.fn((sites: Site[]) => {
                    sitesState.length = 0;
                    for (const site of sites) {
                        sitesState.push(site);
                    }
                }),
                syncSites: vi.fn(),
                services: {
                    data: mockSiteDeps.services.data,
                    site: {
                        ...mockSiteDeps.services.site,
                        removeMonitor: vi.fn(
                            async (_identifier, removedMonitorId) => ({
                                ...baseSite,
                                monitors: baseSite.monitors.filter(
                                    (monitor) => monitor.id !== removedMonitorId
                                ),
                            })
                        ),
                    },
                },
            } satisfies SiteOperationsDependencies;

            const statefulActions = createSiteOperationsActions(statefulDeps);

            await statefulActions.removeMonitorFromSite(
                baseSite.identifier,
                arrayFirst(baseSite.monitors)!.id
            );

            expect(
                statefulDeps.services.site.removeMonitor
            ).toHaveBeenCalledWith(
                baseSite.identifier,
                arrayFirst(baseSite.monitors)!.id
            );
            expect(arrayFirst(sitesState)?.monitors).toHaveLength(
                mockSiteWithMultipleMonitors.monitors.length - 1
            );

            const syncSnapshot: Site = {
                ...baseSite,
                monitors: baseSite.monitors.slice(1).map((monitor) => ({
                    ...monitor,
                    status: "up",
                })),
            };

            applySavedSiteToStore(syncSnapshot, statefulDeps);

            expect(arrayFirst(sitesState)?.monitors).toEqual(
                syncSnapshot.monitors
            );
            expect(statefulDeps.syncSites).not.toHaveBeenCalled();
        });
    });

    describe("Branch behavior edge cases", () => {
        it("should handle successful monitor removal with successful stop monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            await actions.removeMonitorFromSite(
                mockSiteWithMultipleMonitors.identifier,
                arrayFirst(mockSiteWithMultipleMonitors.monitors)!.id
            );

            expect(siteService.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                arrayFirst(mockSiteWithMultipleMonitors.monitors)!.id
            );
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(mockSiteDeps.setSites).toHaveBeenCalled();
            expect(mockSiteDeps.syncSites).not.toHaveBeenCalled();
        });

        it("should handle sites with exactly 2 monitors when removing one", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            // Site with exactly 2 monitors should allow removal
            await actions.removeMonitorFromSite(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[1]!.id
            );

            expect(siteService.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[1]!.id
            );
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(mockSiteDeps.setSites).toHaveBeenCalled();
            expect(mockSiteDeps.syncSites).not.toHaveBeenCalled();
        });
    });
});
