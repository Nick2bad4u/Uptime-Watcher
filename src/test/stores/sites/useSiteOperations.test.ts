/**
 * @file useSiteOperations.test.ts
 * @description Test suite for useSiteOperations module
 * This module handles CRUD operations for sites and monitor management.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Site, Monitor, MonitorType } from "../../../types";

import { createSiteOperationsActions, type SiteOperationsDependencies } from "../../../stores/sites/useSiteOperations";

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

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(
        async (
            fn: () => Promise<unknown>,
            store: { setLoading: (loading: boolean) => void; clearError: () => void; setError: (error: string) => void }
        ) => {
            store.setLoading(true);
            store.clearError();
            try {
                return await fn();
            } catch (error) {
                store.setError(error instanceof Error ? error.message : String(error));
                throw error;
            } finally {
                store.setLoading(false);
            }
        }
    ),
}));

// Mock dynamic imports
vi.mock("../../../stores/sites/utils", async () => {
    const actual = await vi.importActual("../../../stores/sites/utils");
    return {
        ...actual,
        handleSQLiteBackupDownload: vi.fn(),
        normalizeMonitor: vi.fn((monitor: Monitor) => monitor),
        updateMonitorInSite: vi.fn((site: Site, monitorId: string, updates: Partial<Monitor>) => ({
            ...site,
            monitors: site.monitors.map((m: Monitor) => (m.id === monitorId ? { ...m, ...updates } : m)),
        })),
    };
});

// Import mocked services
import { SiteService, MonitoringService } from "../../../stores";
import { normalizeMonitor, updateMonitorInSite, handleSQLiteBackupDownload } from "../../../stores/sites/utils";
import { logStoreAction } from "../../../stores/utils";

describe("useSiteOperations", () => {
    let mockDependencies: SiteOperationsDependencies;
    let operations: ReturnType<typeof createSiteOperationsActions>;

    // Mock data
    const mockSite: Site = {
        identifier: "example.com",
        monitors: [
            {
                checkInterval: 30000,
                history: [],
                id: "monitor-1",
                monitoring: true,
                retryAttempts: 3,
                status: "up" as const,
                timeout: 10000,
                type: "http" as MonitorType,
                url: "https://example.com",
            },
        ],
        name: "Example Site",
    };

    const mockMonitor: Monitor = {
        checkInterval: 30000,
        history: [],
        id: "monitor-2",
        monitoring: true,
        retryAttempts: 3,
        status: "pending" as const,
        timeout: 10000,
        type: "http" as MonitorType,
        url: "https://test.com",
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock dependencies
        mockDependencies = {
            addSite: vi.fn(),
            getSites: vi.fn(() => [mockSite]),
            removeSite: vi.fn(),
            setSites: vi.fn(),
            syncSitesFromBackend: vi.fn(),
        };

        operations = createSiteOperationsActions(mockDependencies);
    });

    describe("initializeSites", () => {
        it("should initialize sites from backend", async () => {
            const mockSites = [mockSite];
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await operations.initializeSites();

            expect(SiteService.getSites).toHaveBeenCalledTimes(1);
            expect(mockDependencies.setSites).toHaveBeenCalledWith(mockSites);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "initializeSites", {
                message: "Successfully loaded 1 sites",
                sitesLoaded: 1,
                success: true,
            });
        });
    });

    describe("createSite", () => {
        it("should create a new site with default HTTP monitor", async () => {
            const siteData = {
                identifier: "new-site.com",
                name: "New Site",
            };
            const createdSite = { ...siteData, monitors: [mockMonitor] };

            vi.mocked(SiteService.addSite).mockResolvedValue(createdSite);
            vi.mocked(normalizeMonitor).mockImplementation((monitor: Partial<Monitor>) => monitor as Monitor);

            await operations.createSite(siteData);

            expect(SiteService.addSite).toHaveBeenCalledWith({
                ...siteData,
                monitors: expect.arrayContaining([
                    expect.objectContaining({
                        monitoring: true,
                        status: "pending",
                        type: "http",
                    }),
                ]),
            });
            expect(mockDependencies.addSite).toHaveBeenCalledWith(createdSite);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "createSite", { siteData });
        });

        it("should create a site with provided monitors", async () => {
            const siteData = {
                identifier: "new-site.com",
                monitors: [mockMonitor],
                name: "New Site",
            };
            const createdSite = { ...siteData };

            vi.mocked(SiteService.addSite).mockResolvedValue(createdSite);
            vi.mocked(normalizeMonitor).mockImplementation((monitor: Partial<Monitor>) => monitor as Monitor);

            await operations.createSite(siteData);

            expect(SiteService.addSite).toHaveBeenCalledWith({
                ...siteData,
                monitors: [mockMonitor],
            });
            expect(mockDependencies.addSite).toHaveBeenCalledWith(createdSite);
        });
    });

    describe("deleteSite", () => {
        it("should delete a site and stop monitoring", async () => {
            const siteId = "example.com";
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);
            vi.mocked(SiteService.removeSite).mockResolvedValue(undefined);

            await operations.deleteSite(siteId);

            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith(siteId, "monitor-1");
            expect(SiteService.removeSite).toHaveBeenCalledWith(siteId);
            expect(mockDependencies.removeSite).toHaveBeenCalledWith(siteId);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "deleteSite", { identifier: siteId });
        });

        it("should handle site not found during deletion", async () => {
            const siteId = "non-existent-site";
            vi.mocked(mockDependencies.getSites).mockReturnValue([]);
            vi.mocked(SiteService.removeSite).mockResolvedValue(undefined);

            await operations.deleteSite(siteId);

            expect(MonitoringService.stopMonitoring).not.toHaveBeenCalled();
            expect(SiteService.removeSite).toHaveBeenCalledWith(siteId);
            expect(mockDependencies.removeSite).toHaveBeenCalledWith(siteId);
        });
    });

    describe("modifySite", () => {
        it("should modify an existing site", async () => {
            const siteId = "example.com";
            const updates = { name: "Updated Site Name" };

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await operations.modifySite(siteId, updates);

            expect(SiteService.updateSite).toHaveBeenCalledWith(siteId, updates);
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "modifySite", { identifier: siteId, updates });
        });
    });

    describe("addMonitorToSite", () => {
        it("should add a monitor to an existing site", async () => {
            const siteId = "example.com";
            const newMonitor = { ...mockMonitor, id: "monitor-3" };

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await operations.addMonitorToSite(siteId, newMonitor);

            expect(SiteService.updateSite).toHaveBeenCalledWith(siteId, {
                monitors: expect.arrayContaining([
                    expect.objectContaining({ id: "monitor-1" }),
                    expect.objectContaining({ id: "monitor-3" }),
                ]),
            });
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "addMonitorToSite", {
                monitor: newMonitor,
                siteId,
            });
        });
    });

    describe("updateSiteCheckInterval", () => {
        it("should update check interval for a monitor", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const interval = 60000;

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await operations.updateSiteCheckInterval(siteId, monitorId, interval);

            expect(updateMonitorInSite).toHaveBeenCalledWith(mockSite, monitorId, { checkInterval: interval });
            expect(SiteService.updateSite).toHaveBeenCalledWith(siteId, {
                monitors: expect.any(Array),
            });
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "updateSiteCheckInterval", {
                interval,
                monitorId,
                siteId,
            });
        });
    });

    describe("updateMonitorRetryAttempts", () => {
        it("should update retry attempts for a monitor", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const retryAttempts = 5;

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await operations.updateMonitorRetryAttempts(siteId, monitorId, retryAttempts);

            expect(updateMonitorInSite).toHaveBeenCalledWith(mockSite, monitorId, { retryAttempts });
            expect(SiteService.updateSite).toHaveBeenCalledWith(siteId, {
                monitors: expect.any(Array),
            });
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "updateMonitorRetryAttempts", {
                monitorId,
                retryAttempts,
                siteId,
            });
        });

        it("should handle undefined retry attempts", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const retryAttempts = undefined;

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await operations.updateMonitorRetryAttempts(siteId, monitorId, retryAttempts);

            expect(updateMonitorInSite).toHaveBeenCalledWith(mockSite, monitorId, { retryAttempts: undefined });
            expect(SiteService.updateSite).toHaveBeenCalledWith(siteId, {
                monitors: expect.any(Array),
            });
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateMonitorTimeout", () => {
        it("should update timeout for a monitor", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const timeout = 15000;

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await operations.updateMonitorTimeout(siteId, monitorId, timeout);

            expect(updateMonitorInSite).toHaveBeenCalledWith(mockSite, monitorId, { timeout });
            expect(SiteService.updateSite).toHaveBeenCalledWith(siteId, {
                monitors: expect.any(Array),
            });
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "updateMonitorTimeout", {
                monitorId,
                siteId,
                timeout,
            });
        });

        it("should handle undefined timeout", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const timeout = undefined;

            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await operations.updateMonitorTimeout(siteId, monitorId, timeout);

            expect(updateMonitorInSite).toHaveBeenCalledWith(mockSite, monitorId, { timeout: undefined });
            expect(SiteService.updateSite).toHaveBeenCalledWith(siteId, {
                monitors: expect.any(Array),
            });
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
        });
    });

    describe("downloadSQLiteBackup", () => {
        it("should download SQLite backup", async () => {
            const mockBuffer = new ArrayBuffer(1024);
            const mockBackupData = { buffer: mockBuffer, fileName: "backup.db" };

            vi.mocked(SiteService.downloadSQLiteBackup).mockResolvedValue(mockBackupData);

            // Mock handleSQLiteBackupDownload to call its function parameter
            vi.mocked(handleSQLiteBackupDownload).mockImplementation(async (fn) => {
                await fn();
            });

            await operations.downloadSQLiteBackup();

            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "downloadSQLiteBackup", {
                message: "SQLite backup download completed",
                success: true,
            });
            expect(handleSQLiteBackupDownload).toHaveBeenCalledWith(expect.any(Function));
            expect(SiteService.downloadSQLiteBackup).toHaveBeenCalledTimes(1);
        });
    });
});
