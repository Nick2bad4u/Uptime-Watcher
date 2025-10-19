/**
 * Tests for createSiteOperationsActions module Tests CRUD operations for sites
 * and monitor management
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Monitor, type Site } from "@shared/types";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";

import { createSiteOperationsActions } from "../../../stores/sites/useSiteOperations";
import type { SiteOperationsDependencies } from "../../../stores/sites/types";

// Mock external dependencies
vi.mock("../../../services/logger");

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
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
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
    handleSQLiteBackupDownload: vi.fn(
        async (callback) =>
            // Actually call the callback to trigger the electron API call
            await callback()
    ),
}));

vi.mock("../../../stores/sites/utils/monitorOperations", () => ({
    normalizeMonitor: vi.fn((monitor) => monitor),
    updateMonitorInSite: vi.fn((site, monitorId, updates) => ({
        ...site,
        monitors: site.monitors.map((m: any) =>
            m.id === monitorId ? { ...m, ...updates } : m
        ),
    })),
}));

// Mock IPC extraction
vi.mock("../../types/ipc", () => ({
    extractIpcData: vi.fn((response) => response),
    safeExtractIpcData: vi.fn((response, fallback) => response ?? fallback),
}));

// Access the global electronAPI mock
const mockElectronAPI = (globalThis as any).electronAPI;

describe(createSiteOperationsActions, () => {
    let mockDeps: SiteOperationsDependencies;
    let mockSite: Site;
    let mockMonitor: Monitor;
    let actions: ReturnType<typeof createSiteOperationsActions>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(
            true
        );

        mockElectronAPI.sites.removeMonitor.mockResolvedValue(true);

        mockMonitor = {
            checkInterval: 60_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            responseTime: 100,
            retryAttempts: 3,
            status: "up",
            timeout: 5000,
            type: "http",
            url: "https://example.com",
        };

        mockSite = {
            identifier: "test-site",
            monitoring: true,
            monitors: [mockMonitor],
            name: "Test Site",
        };

        mockElectronAPI.sites.updateSite.mockImplementation(
            async (identifier: string, updates: Partial<Site>) => ({
                ...mockSite,
                ...updates,
                identifier,
            })
        );

        const dataService = {
            downloadSqliteBackup: vi.fn(async () =>
                mockElectronAPI.data.downloadSqliteBackup()
            ),
        };

        const siteService = {
            addSite: vi.fn(async (site: Site) =>
                mockElectronAPI.sites.addSite(site)
            ),
            getSites: vi.fn(async () => mockElectronAPI.sites.getSites()),
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
            updateSite: vi.fn(async (identifier: string, updates: unknown) =>
                mockElectronAPI.sites.updateSite(identifier, updates)
            ),
        };

        const monitoringService = {
            startMonitoring: vi.fn(
                async (siteIdentifier: string, monitorId: string) =>
                    mockElectronAPI.monitoring.startMonitoringForSite(
                        siteIdentifier,
                        monitorId
                    )
            ),
            startSiteMonitoring: vi.fn(async (siteIdentifier: string) =>
                mockElectronAPI.monitoring.startMonitoringForSite(
                    siteIdentifier
                )
            ),
            stopMonitoring: vi.fn(
                async (siteIdentifier: string, monitorId: string) =>
                    mockElectronAPI.monitoring.stopMonitoringForSite(
                        siteIdentifier,
                        monitorId
                    )
            ),
            stopSiteMonitoring: vi.fn(async (siteIdentifier: string) =>
                mockElectronAPI.monitoring.stopMonitoringForSite(siteIdentifier)
            ),
        };

        mockDeps = {
            addSite: vi.fn(),
            getSites: vi.fn(() => [mockSite]),
            removeSite: vi.fn(),
            setSites: vi.fn(),
            syncSites: vi.fn(),
            services: {
                data: dataService,
                monitoring: monitoringService,
                site: siteService,
            },
        } satisfies SiteOperationsDependencies;

        actions = createSiteOperationsActions(mockDeps);
    });

    describe("addMonitorToSite", () => {
        it("should add a monitor to an existing site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            await actions.addMonitorToSite("test-site", mockMonitor);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                expect.objectContaining({ monitors: expect.any(Array) })
            );
            const updateCall =
                mockElectronAPI.sites.updateSite.mock.calls.at(-1);
            const updatedMonitors = updateCall?.[1]?.monitors ?? [];
            expect(updatedMonitors).toHaveLength(2);
            expect(mockDeps.setSites).toHaveBeenCalled();
            const reconciledSites =
                vi.mocked(mockDeps.setSites).mock.calls.at(-1)?.[0] ?? [];
            const reconciledSite = reconciledSites.find(
                (site: Site) => site.identifier === "test-site"
            );
            expect(reconciledSite?.monitors).toHaveLength(2);
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
        });

        it("should throw error when site is not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            await expect(
                actions.addMonitorToSite("nonexistent-site", mockMonitor)
            ).rejects.toThrow(ERROR_CATALOG.sites.NOT_FOUND);
        });
    });

    describe("createSite", () => {
        it("should create a new site with minimal data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Constructor", "type");

            const newSite = {
                identifier: "new-site",
                name: "New Site",
                monitoring: true,
                monitors: [
                    {
                        history: [],
                        id: "test-monitor-id",
                        monitoring: true,
                        status: "pending" as const,
                        type: "http" as const,
                    },
                ],
            };
            // Mock preload API to return extracted Site data directly
            mockElectronAPI.sites.addSite.mockResolvedValue(newSite);

            await actions.createSite({
                identifier: "new-site",
                name: "New Site",
            });

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "new-site",
                    name: "New Site",
                    monitoring: true,
                    monitors: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(String),
                            type: "http",
                            status: "pending",
                            monitoring: true,
                            history: [],
                        }),
                    ]),
                })
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: "test-site",
                    }),
                    expect.objectContaining({
                        identifier: "new-site",
                        name: "New Site",
                        monitoring: true,
                        monitors: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.any(String),
                                type: "http",
                                status: "pending",
                                monitoring: true,
                                history: [],
                            }),
                        ]),
                    }),
                ])
            );
            expect(mockDeps.addSite).not.toHaveBeenCalled();
        });

        it("should create a new site with full data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Constructor", "type");

            const siteData = {
                identifier: "full-site",
                monitoring: false,
                monitors: [mockMonitor],
                name: "Full Site",
            };
            const newSite = { ...mockSite, ...siteData };
            // Mock preload API to return extracted Site data directly
            mockElectronAPI.sites.addSite.mockResolvedValue(newSite);

            await actions.createSite(siteData);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining(siteData)
            );
        });

        it("should merge backend site snapshot when identifier already exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Management", "type");

            const existingSite: Site = {
                identifier: "existing-site",
                monitoring: true,
                monitors: [
                    {
                        checkInterval: 60_000,
                        history: [],
                        id: "monitor-existing",
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        status: "pending",
                        timeout: 5000,
                        type: "http",
                        url: "https://example.com",
                    },
                ],
                name: "Existing Site",
            };

            let currentSites: Site[] = [existingSite];
            vi.mocked(mockDeps.getSites).mockImplementation(() => currentSites);
            vi.mocked(mockDeps.setSites).mockImplementation((sites: Site[]) => {
                currentSites = sites;
            });

            const backendSite: Site = {
                ...existingSite,
                name: "Existing Site Updated",
                monitors: existingSite.monitors.map((monitor) => ({
                    ...monitor,
                    id: "monitor-backend",
                    status: "up",
                })),
            };

            mockElectronAPI.sites.addSite.mockResolvedValueOnce(backendSite);

            await actions.createSite({
                identifier: "existing-site",
                name: "Existing Site Updated",
            });

            expect(mockDeps.addSite).not.toHaveBeenCalled();
            expect(currentSites).toHaveLength(1);
            expect(currentSites[0]).toEqual(
                expect.objectContaining({
                    identifier: "existing-site",
                    name: "Existing Site Updated",
                })
            );
        });
    });

    describe("deleteSite", () => {
        it("should delete a site and stop monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(
                true
            );
            mockElectronAPI.sites.removeSite.mockResolvedValue(true);

            await actions.deleteSite("test-site");

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith(
                "test-site"
            );
            expect(mockDeps.removeSite).toHaveBeenCalledWith("test-site");
        });

        it("should handle deletion errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Delete failed");
            mockElectronAPI.sites.removeSite.mockRejectedValue(error);

            await expect(actions.deleteSite("test-site")).rejects.toThrow(
                "Delete failed"
            );
            expect(mockDeps.removeSite).not.toHaveBeenCalled();
        });

        it("should not remove from store when backend reports failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.sites.removeSite.mockResolvedValueOnce(false);

            await expect(actions.deleteSite("test-site")).rejects.toThrow(
                "Site removal failed for test-site: Backend returned false"
            );
            expect(mockDeps.removeSite).not.toHaveBeenCalled();
        });
    });

    describe("initializeSites", () => {
        it("should initialize sites from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            const mockSites = [mockSite];
            // Mock preload API to return extracted Site array directly
            mockElectronAPI.sites.getSites.mockResolvedValue(mockSites);

            const result = await actions.initializeSites();

            expect(mockElectronAPI.sites.getSites).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
            expect(result).toEqual({
                message: "Successfully loaded 1 sites",
                sitesLoaded: 1,
                success: true,
            });
        });

        it("should handle empty sites list", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Mock preload API to return extracted empty array directly
            mockElectronAPI.sites.getSites.mockResolvedValue([]);

            const result = await actions.initializeSites();

            expect(result).toEqual({
                message: "Successfully loaded 0 sites",
                sitesLoaded: 0,
                success: true,
            });
        });

        it("should handle initialization errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            mockElectronAPI.sites.getSites.mockRejectedValue(
                new Error("Backend error")
            );

            await expect(actions.initializeSites()).rejects.toThrow(
                "Backend error"
            );
        });
    });

    describe("modifySite", () => {
        it("should modify a site successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const updates = { name: "Updated Site" };
            const updatedSite: Site = {
                ...mockSite,
                name: "Updated Site",
            };
            mockElectronAPI.sites.updateSite.mockResolvedValueOnce(updatedSite);

            await actions.modifySite("test-site", updates);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                updates
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith([updatedSite]);
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
        });

        it("should handle modify errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Update failed");
            mockElectronAPI.sites.updateSite.mockRejectedValue(error);

            await expect(
                actions.modifySite("test-site", { name: "Updated" })
            ).rejects.toThrow("Update failed");
            expect(mockDeps.setSites).not.toHaveBeenCalled();
        });
    });

    describe("removeMonitorFromSite", () => {
        it("should remove a monitor from a site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

            // Add a second monitor to the site so removal is allowed
            const secondMonitor = { ...mockMonitor, id: "monitor-2" };
            const siteWithMultipleMonitors = {
                ...mockSite,
                monitors: [mockMonitor, secondMonitor],
            };
            mockDeps.getSites = vi.fn(() => [siteWithMultipleMonitors]);

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(
                true
            );
            mockElectronAPI.sites.removeMonitor.mockResolvedValue(true);

            await actions.removeMonitorFromSite("test-site", "monitor-1");

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                expect.objectContaining({ monitors: expect.any(Array) })
            );
            const updateArgs =
                mockElectronAPI.sites.updateSite.mock.calls.at(-1);
            const monitorsAfterRemoval = updateArgs?.[1]?.monitors ?? [];
            expect(monitorsAfterRemoval).toHaveLength(1);
            expect(mockDeps.setSites).toHaveBeenCalled();
            const reconciledSites =
                vi.mocked(mockDeps.setSites).mock.calls.at(-1)?.[0] ?? [];
            const reconciledSite = reconciledSites.find(
                (site: Site) => site.identifier === "test-site"
            );
            expect(reconciledSite?.monitors).toHaveLength(1);
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
        });
    });

    describe("Monitor configuration updates", () => {
        it("should update monitor retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const updatedSite: Site = {
                ...mockSite,
                monitors: [
                    {
                        ...mockMonitor,
                        retryAttempts: 5,
                    },
                ],
            };
            mockElectronAPI.sites.updateSite.mockResolvedValue(updatedSite);

            await actions.updateMonitorRetryAttempts(
                "test-site",
                "monitor-1",
                5
            );

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                {
                    monitors: updatedSite.monitors,
                }
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith([updatedSite]);
            expect(mockDeps.setSites).toHaveBeenCalledTimes(1);
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
        });

        it("should update monitor timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const updatedSite: Site = {
                ...mockSite,
                monitors: [
                    {
                        ...mockMonitor,
                        timeout: 10_000,
                    },
                ],
            };
            mockElectronAPI.sites.updateSite.mockResolvedValue(updatedSite);

            await actions.updateMonitorTimeout(
                "test-site",
                "monitor-1",
                10_000
            );

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                {
                    monitors: updatedSite.monitors,
                }
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith([updatedSite]);
            expect(mockDeps.setSites).toHaveBeenCalledTimes(1);
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
        });

        it("should update site check interval", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const updatedSite: Site = {
                ...mockSite,
                monitors: [
                    {
                        ...mockMonitor,
                        checkInterval: 30_000,
                    },
                ],
            };
            mockElectronAPI.sites.updateSite.mockResolvedValue(updatedSite);

            await actions.updateSiteCheckInterval(
                "test-site",
                "monitor-1",
                30_000
            );

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                {
                    monitors: updatedSite.monitors,
                }
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith([updatedSite]);
            expect(mockDeps.setSites).toHaveBeenCalledTimes(1);
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
        });
    });

    describe("downloadSqliteBackup", () => {
        it("should download SQLite backup", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Backup Operation", "type");

            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue({
                buffer: new ArrayBuffer(8),
                fileName: "backup.sqlite",
                metadata: {
                    createdAt: 0,
                    originalPath: "/tmp/backup.sqlite",
                    sizeBytes: 8,
                },
            });

            await actions.downloadSqliteBackup();

            expect(
                mockElectronAPI.data.downloadSqliteBackup
            ).toHaveBeenCalled();
        });
    });
});
