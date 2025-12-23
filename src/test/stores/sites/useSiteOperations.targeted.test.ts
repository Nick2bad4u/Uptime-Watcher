/**
 * Targeted test coverage for useSiteOperations uncovered lines Focuses on
 * specific error handling paths and edge cases
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Site } from "@shared/types";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";

import { createSiteOperationsActions } from "../../../stores/sites/useSiteOperations";
import { applySavedSiteToStore } from "../../../stores/sites/utils/operationHelpers";
import type { SiteOperationsDependencies } from "../../../stores/sites/types";
import { logger } from "../../../services/logger";

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
    withErrorHandling: vi.fn(async (fn, handlers) => {
        try {
            return await fn().then((result: any) => {
                handlers.setLoading?.(false);
                return result;
            });
        } catch (error: unknown) {
            handlers.setError?.(error);
            handlers.setLoading?.(false);
            throw error;
        }
    }),
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

describe("useSiteOperations - Targeted Coverage", () => {
    let mockElectronAPI: any;
    let mockSiteDeps: SiteOperationsDependencies;
    let actions: ReturnType<typeof createSiteOperationsActions>;
    let siteService: any;

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
        monitors: [mockSiteWithMultipleMonitors.monitors[0]!],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockElectronAPI = {
            sites: {
                removeMonitor: vi.fn(
                    async (siteIdentifier: string, monitorId: string) => ({
                        ...mockSiteWithMultipleMonitors,
                        identifier: siteIdentifier,
                        monitors: mockSiteWithMultipleMonitors.monitors.filter(
                            (monitor) => monitor.id !== monitorId
                        ),
                    })
                ),
                removeSite: vi.fn().mockResolvedValue(true),
            },
            monitoring: {
                stopMonitoringForSite: vi.fn().mockResolvedValue(true),
            },
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
            },
        };

        // Mock global electronAPI
        globalThis.window = {
            ...globalThis.window,
            electronAPI: mockElectronAPI,
        } as any;

        const getSitesFn = vi.fn(() => [
            mockSiteWithMultipleMonitors,
            mockSiteWithSingleMonitor,
        ]);

        const dataService = {
            downloadSqliteBackup: vi.fn(async () =>
                mockElectronAPI.data.downloadSqliteBackup()
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
            ).rejects.toThrowError("Delete failed");

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
            (logger.error as any).mockClear?.();

            await expect(actions.downloadSqliteBackup()).rejects.toThrowError(
                "Backup download failed"
            );

            // Verify logger.error was called (lines 147-148)
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
                    mockSiteWithSingleMonitor.monitors[0]!.id
                )
            ).rejects.toThrowError(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);

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
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );

            expect(siteService.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();

            expect(mockSiteDeps.setSites).toHaveBeenCalled();
            const updatedSites =
                vi.mocked(mockSiteDeps.setSites).mock.calls.at(-1)?.[0] ?? [];
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
            siteService.removeMonitor.mockRejectedValueOnce(removalError);

            await expect(
                actions.removeMonitorFromSite(
                    mockSiteWithMultipleMonitors.identifier,
                    mockSiteWithMultipleMonitors.monitors[0]!.id
                )
            ).rejects.toThrowError("Monitor removal failed");

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
                        history: Array.from(monitor.history),
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
                baseSite.monitors[0]!.id
            );

            expect(
                statefulDeps.services.site.removeMonitor
            ).toHaveBeenCalledWith(
                baseSite.identifier,
                baseSite.monitors[0]!.id
            );
            expect(sitesState[0]?.monitors).toHaveLength(
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

            expect(sitesState[0]?.monitors).toEqual(syncSnapshot.monitors);
            expect(statefulDeps.syncSites).not.toHaveBeenCalled();
        });
    });

    describe("Branch Coverage Edge Cases", () => {
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
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );

            expect(siteService.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[0]!.id
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
