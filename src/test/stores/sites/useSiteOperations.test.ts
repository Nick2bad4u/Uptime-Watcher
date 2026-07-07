/**
 * Tests for createSiteOperationsActions module Tests CRUD operations for sites
 * and monitor management
 */

import type { Monitor, Site } from "@shared/types";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { DuplicateSiteIdentifierError } from "@shared/validation/siteIntegrity";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { objectAssign } from "ts-extras";

import type { SiteOperationsDependencies } from "../../../stores/sites/types";
import type { ElectronAPI } from "../../../types";

import { createSiteOperationsActions } from "../../../stores/sites/useSiteOperations";
import * as siteOperationHelpers from "../../../stores/sites/utils/operationHelpers";
import { logStoreAction } from "../../../stores/utils";

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
    handleSQLiteBackupDownload: vi.fn(
        async (callback) =>
            // Actually call the callback to trigger the electron API call
            await callback()
    ),
}));

vi.mock("../../../stores/sites/utils/monitorOperations", () => ({
    addMonitorToSite: vi.fn((site, monitor) => ({
        ...site,
        monitors: [...site.monitors, monitor],
    })),
    createDefaultMonitor: vi.fn(() => ({
        history: [],
        id: "default-monitor",
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: "pending",
        timeout: 30_000,
        type: "http",
        url: "https://example.com",
    })),
    normalizeMonitor: vi.fn((monitor) => monitor),
    removeMonitorFromSite: vi.fn((site, monitorId) => ({
        ...site,
        monitors: site.monitors.filter(
            (monitor: Monitor) => monitor.id !== monitorId
        ),
    })),
    updateMonitorInSite: vi.fn((site, monitorId, updates) => ({
        ...site,
        monitors: site.monitors.map((monitor: Monitor) =>
            monitor.id === monitorId ? { ...monitor, ...updates } : monitor
        ),
    })),
    validateMonitorExists: vi.fn((site, monitorId) => {
        if (
            !site?.monitors.some((monitor: Monitor) => monitor.id === monitorId)
        ) {
            throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
        }
    }),
}));

// Access the global electronAPI mock
const mockElectronAPI = (
    globalThis as typeof globalThis & { electronAPI: ElectronAPI }
).electronAPI;
if (!mockElectronAPI.data.restoreSqliteBackup) {
    objectAssign(mockElectronAPI.data, {
        restoreSqliteBackup: vi.fn(async () => ({
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "restore-checksum",
                createdAt: Date.now(),
                originalPath: "restore.sqlite",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 0,
            },
            preRestoreFileName: "pre-restore.sqlite",
            restoredAt: Date.now(),
        })),
    });
}
const mockDataApi = {
    downloadSqliteBackup: vi.mocked(mockElectronAPI.data.downloadSqliteBackup),
    restoreSqliteBackup: vi.mocked(mockElectronAPI.data.restoreSqliteBackup),
    saveSqliteBackup: vi.mocked(mockElectronAPI.data.saveSqliteBackup),
};
const mockMonitoringApi = {
    stopMonitoringForSite: vi.mocked(
        mockElectronAPI.monitoring.stopMonitoringForSite
    ),
};
const mockSitesApi = {
    addSite: vi.mocked(mockElectronAPI.sites.addSite),
    removeMonitor: vi.mocked(mockElectronAPI.sites.removeMonitor),
    removeSite: vi.mocked(mockElectronAPI.sites.removeSite),
    updateSite: vi.mocked(mockElectronAPI.sites.updateSite),
};
const getRestoreMock = () => mockDataApi.restoreSqliteBackup;

describe(createSiteOperationsActions, () => {
    let mockDeps: SiteOperationsDependencies;
    let mockSite: Site;
    let mockMonitor: Monitor;
    let actions: ReturnType<typeof createSiteOperationsActions>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockMonitoringApi.stopMonitoringForSite.mockResolvedValue(true);

        mockSitesApi.removeMonitor.mockImplementation(
            async (siteIdentifier: string, monitorId: string) => {
                const sitesSnapshot = mockDeps?.getSites?.() ?? [mockSite];
                const targetSite =
                    sitesSnapshot.find(
                        (site) => site.identifier === siteIdentifier
                    ) ?? mockSite;

                return {
                    ...targetSite,
                    monitors: targetSite.monitors.filter(
                        (monitor) => monitor.id !== monitorId
                    ),
                } satisfies Site;
            }
        );

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

        mockSitesApi.updateSite.mockImplementation(
            async (identifier: string, updates: Partial<Site>) => ({
                ...mockSite,
                ...updates,
                identifier,
            })
        );

        const dataService = {
            downloadSqliteBackup: vi.fn(async () =>
                mockDataApi.downloadSqliteBackup()
            ),
            saveSqliteBackup: vi.fn(async () => mockDataApi.saveSqliteBackup()),
            restoreSqliteBackup: vi.fn(async (payload) =>
                mockDataApi.restoreSqliteBackup(payload)
            ),
        };

        const siteService = {
            addSite: vi.fn(async (site: Site) => mockSitesApi.addSite(site)),
            getSites: vi.fn(async () => mockElectronAPI.sites.getSites()),
            removeMonitor: vi.fn(
                async (siteIdentifier: string, monitorId: string) =>
                    mockSitesApi.removeMonitor(siteIdentifier, monitorId)
            ),
            removeSite: vi.fn(async (identifier: string) =>
                mockSitesApi.removeSite(identifier)
            ),
            updateSite: vi.fn(
                async (identifier: string, updates: Partial<Site>) =>
                    mockSitesApi.updateSite(identifier, updates)
            ),
        };

        mockDeps = {
            getSites: vi.fn(() => [mockSite]),
            removeSite: vi.fn(),
            setLastBackupMetadata: vi.fn(),
            setSites: vi.fn(),
            syncSites: vi.fn(async () => undefined),
            services: {
                data: dataService,
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
            const updateCall = mockSitesApi.updateSite.mock.calls.at(-1);
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

        it("should redact monitor URL telemetry when adding a monitor", async () => {
            const sensitiveMonitor: Monitor = {
                ...mockMonitor,
                url: "https://user:pass@example.com/status?access_token=secret#frag",
            };

            await actions.addMonitorToSite("test-site", sensitiveMonitor);

            const telemetryCalls = vi
                .mocked(logStoreAction)
                .mock.calls.filter(
                    ([storeName, actionName]) =>
                        storeName === "SitesStore" &&
                        actionName === "addMonitorToSite"
                );

            expect(telemetryCalls).not.toHaveLength(0);
            expect(telemetryCalls[0]?.[2]).toMatchObject({
                monitorId: sensitiveMonitor.id,
                monitorType: sensitiveMonitor.type,
                monitorUrl: "https://example.com/status",
                siteIdentifier: "test-site",
            });

            const serializedTelemetry = JSON.stringify(
                telemetryCalls.map((call) => call[2])
            );
            expect(serializedTelemetry).not.toContain("access_token");
            expect(serializedTelemetry).not.toContain("secret");
            expect(serializedTelemetry).not.toContain("frag");
            expect(serializedTelemetry).not.toContain("pass");
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

            const newSite: Site = {
                identifier: "new-site",
                name: "New Site",
                monitoring: true,
                monitors: [
                    {
                        checkInterval: 60_000,
                        history: [],
                        id: "test-monitor-id",
                        monitoring: true,
                        responseTime: -1,
                        retryAttempts: 3,
                        status: "pending" as const,
                        timeout: 30_000,
                        type: "http" as const,
                    },
                ],
            };
            // Mock preload API to return extracted Site data directly
            mockSitesApi.addSite.mockResolvedValue(newSite);

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
            mockSitesApi.addSite.mockResolvedValue(newSite);

            await actions.createSite(siteData);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining(siteData)
            );
        });

        it("should summarize and redact create-site telemetry", async () => {
            const siteData = {
                identifier:
                    "https://create.example.com/site?access_token=create-secret#frag",
                monitoring: false,
                monitors: [
                    {
                        ...mockMonitor,
                        url: "https://user:pass@monitor.example.com/path?refresh_token=monitor-secret#hash",
                    },
                ],
                name: "Name should not be logged",
            };
            mockSitesApi.addSite.mockResolvedValue({
                ...mockSite,
                ...siteData,
            });

            await actions.createSite(siteData);

            const telemetryCalls = vi
                .mocked(logStoreAction)
                .mock.calls.filter(
                    ([storeName, actionName]) =>
                        storeName === "SitesStore" &&
                        actionName === "createSite"
                );

            expect(telemetryCalls).not.toHaveLength(0);
            expect(telemetryCalls[0]?.[2]).toMatchObject({
                monitorCount: 1,
                monitorTypes: ["http"],
                monitorUrls: ["https://monitor.example.com/path"],
                monitoring: false,
                siteIdentifier: "https://create.example.com/site",
            });

            const serializedTelemetry = JSON.stringify(
                telemetryCalls.map((call) => call[2])
            );
            expect(serializedTelemetry).not.toContain(
                "Name should not be logged"
            );
            expect(serializedTelemetry).not.toContain("access_token");
            expect(serializedTelemetry).not.toContain("refresh_token");
            expect(serializedTelemetry).not.toContain("secret");
            expect(serializedTelemetry).not.toContain("frag");
            expect(serializedTelemetry).not.toContain("pass");
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

            mockSitesApi.addSite.mockResolvedValueOnce(backendSite);

            await actions.createSite({
                identifier: "existing-site",
                name: "Existing Site Updated",
            });

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
        it("should delete a site via orchestrator-managed removal", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

            mockSitesApi.removeSite.mockResolvedValue(true);

            await actions.deleteSite("test-site");

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
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
            mockSitesApi.removeSite.mockRejectedValue(error);

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

            mockSitesApi.removeSite.mockResolvedValueOnce(false);

            await expect(actions.deleteSite("test-site")).rejects.toThrow(
                "Site removal failed for test-site: Backend returned false"
            );
            expect(mockDeps.removeSite).not.toHaveBeenCalled();
        });
    });

    describe("initializeSites", () => {
        it("should initialize sites from backend using state sync", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            const mockSites = [mockSite];
            vi.mocked(mockDeps.getSites).mockReturnValue(mockSites);

            const result = await actions.initializeSites();

            expect(mockDeps.syncSites).toHaveBeenCalledTimes(1);
            expect(mockDeps.setSites).not.toHaveBeenCalled();
            expect(result).toEqual({
                message: "Synchronized 1 sites from backend",
                sitesLoaded: 1,
                success: true,
            });
        });

        it("should handle empty sites list", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(mockDeps.getSites).mockReturnValueOnce([]);

            const result = await actions.initializeSites();

            expect(result).toEqual({
                message: "Synchronized 0 sites from backend",
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

            vi.mocked(mockDeps.syncSites).mockRejectedValue(
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
            mockSitesApi.updateSite.mockResolvedValueOnce(updatedSite);

            const applySavedSiteSpy = vi.spyOn(
                siteOperationHelpers,
                "applySavedSiteToStore"
            );

            try {
                await actions.modifySite("test-site", updates);

                expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                    "test-site",
                    updates
                );
                expect(applySavedSiteSpy).toHaveBeenCalledTimes(1);
                expect(applySavedSiteSpy).toHaveBeenCalledWith(
                    expect.objectContaining({ identifier: "test-site" }),
                    mockDeps
                );
                expect(mockDeps.setSites).toHaveBeenCalledWith([updatedSite]);
                expect(mockDeps.syncSites).not.toHaveBeenCalled();
            } finally {
                applySavedSiteSpy.mockRestore();
            }
        });

        it("should handle modify errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Update failed");
            mockSitesApi.updateSite.mockRejectedValue(error);

            await expect(
                actions.modifySite("test-site", { name: "Updated" })
            ).rejects.toThrow("Update failed");
            expect(mockDeps.setSites).not.toHaveBeenCalled();
        });

        it("should surface duplicate identifier errors from the helper", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteOperations", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const duplicateError = new DuplicateSiteIdentifierError(
                [
                    {
                        identifier: mockSite.identifier,
                        occurrences: 2,
                    },
                ],
                "SitesStore.applySavedSiteToStore"
            );

            const applySavedSiteSpy = vi
                .spyOn(siteOperationHelpers, "applySavedSiteToStore")
                .mockImplementation(() => {
                    throw duplicateError;
                });

            mockSitesApi.updateSite.mockResolvedValueOnce({
                ...mockSite,
                name: "Conflicting",
            });

            try {
                await expect(
                    actions.modifySite("test-site", { name: "Conflicting" })
                ).rejects.toBe(duplicateError);

                expect(mockDeps.setSites).not.toHaveBeenCalled();
                expect(applySavedSiteSpy).toHaveBeenCalledTimes(1);
            } finally {
                applySavedSiteSpy.mockRestore();
            }
        });

        it("should summarize and redact modify-site telemetry", async () => {
            const updates: Partial<Site> = {
                monitors: [
                    {
                        ...mockMonitor,
                        url: "https://user:pass@updated.example.com/path?access_token=update-secret#hash",
                    },
                ],
                name: "Updated name should not be logged",
            };
            mockSitesApi.updateSite.mockResolvedValueOnce({
                ...mockSite,
                ...updates,
            });

            await actions.modifySite(
                "https://modify.example.com/site?refresh_token=site-secret#frag",
                updates
            );

            const telemetryCalls = vi
                .mocked(logStoreAction)
                .mock.calls.filter(
                    ([storeName, actionName]) =>
                        storeName === "SitesStore" &&
                        actionName === "modifySite"
                );

            expect(telemetryCalls).not.toHaveLength(0);
            expect(telemetryCalls[0]?.[2]).toMatchObject({
                monitorCount: 1,
                monitorTypes: ["http"],
                monitorUrls: ["https://updated.example.com/path"],
                siteIdentifier: "https://modify.example.com/site",
                updateFields: ["monitors", "name"],
            });

            const serializedTelemetry = JSON.stringify(
                telemetryCalls.map((call) => call[2])
            );
            expect(serializedTelemetry).not.toContain(
                "Updated name should not be logged"
            );
            expect(serializedTelemetry).not.toContain("access_token");
            expect(serializedTelemetry).not.toContain("refresh_token");
            expect(serializedTelemetry).not.toContain("secret");
            expect(serializedTelemetry).not.toContain("frag");
            expect(serializedTelemetry).not.toContain("pass");
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
            vi.spyOn(mockDeps, "getSites").mockReturnValue([
                siteWithMultipleMonitors,
            ]);

            await actions.removeMonitorFromSite("test-site", "monitor-1");

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(mockElectronAPI.sites.removeMonitor).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(mockElectronAPI.sites.updateSite).not.toHaveBeenCalled();
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
            mockSitesApi.updateSite.mockResolvedValue(updatedSite);

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
            mockSitesApi.updateSite.mockResolvedValue(updatedSite);

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
            mockSitesApi.updateSite.mockResolvedValue(updatedSite);

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

            mockDataApi.downloadSqliteBackup.mockResolvedValue({
                buffer: new ArrayBuffer(8),
                fileName: "backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: 0,
                    originalPath: "/tmp/backup.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 8,
                },
            });

            const result = await actions.downloadSqliteBackup();

            expect(
                mockElectronAPI.data.downloadSqliteBackup
            ).toHaveBeenCalled();
            expect(mockDeps.setLastBackupMetadata).toHaveBeenCalledWith(
                result.metadata
            );
        });
    });

    describe("restoreSqliteBackup", () => {
        it("restores backup and syncs sites", async () => {
            const summary = {
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "restore-checksum",
                    createdAt: Date.now(),
                    originalPath: "restore.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 64,
                },
                preRestoreFileName: "pre-restore.sqlite",
                restoredAt: Date.now(),
            };
            getRestoreMock().mockResolvedValue(summary);

            const payload = {
                buffer: new ArrayBuffer(64),
                fileName: "restore.sqlite",
            };
            const result = await actions.restoreSqliteBackup(payload);

            expect(
                mockElectronAPI.data.restoreSqliteBackup
            ).toHaveBeenCalledWith(payload);
            expect(mockDeps.setLastBackupMetadata).toHaveBeenCalledWith(
                summary.metadata
            );
            expect(mockDeps.syncSites).toHaveBeenCalled();
            expect(result).toEqual(summary);
        });

        it("propagates restore errors", async () => {
            getRestoreMock().mockRejectedValueOnce(new Error("Restore failed"));

            await expect(
                actions.restoreSqliteBackup({
                    buffer: new ArrayBuffer(8),
                    fileName: "restore.sqlite",
                })
            ).rejects.toThrow("Restore failed");
        });
    });
});
