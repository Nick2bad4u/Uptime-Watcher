/**
 * Tests for createSiteOperationsActions module
 * Tests CRUD operations for sites and monitor management
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Monitor, type Site } from "../../../../shared/types";
import { ERROR_CATALOG } from "../../../../shared/utils/errorCatalog";

import {
    createSiteOperationsActions,
    type SiteOperationsDependencies,
} from "../../../stores/sites/useSiteOperations";

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
    withErrorHandling: vi.fn(async (fn, handlers) => {
        try {
            const result = await fn();
            handlers.setLoading?.(false);
            return result;
        } catch (error) {
            handlers.setError?.(error);
            handlers.setLoading?.(false);
            throw error;
        }
    }),
}));

vi.mock("../../../stores/sites/utils/fileDownload", () => ({
    handleSQLiteBackupDownload: vi.fn(async (callback) => {
        // Actually call the callback to trigger the electron API call
        return await callback();
    }),
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
    safeExtractIpcData: vi.fn((response, fallback) => response ?? fallback),
}));

// Access the global electronAPI mock
const mockElectronAPI = globalThis.electronAPI as any;

describe("createSiteOperationsActions", () => {
    let mockDeps: SiteOperationsDependencies;
    let mockSite: Site;
    let mockMonitor: Monitor;
    let actions: ReturnType<typeof createSiteOperationsActions>;

    beforeEach(() => {
        vi.clearAllMocks();

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

        mockDeps = {
            addSite: vi.fn(),
            getSites: vi.fn(() => [mockSite]),
            removeSite: vi.fn(),
            setSites: vi.fn(),
            syncSitesFromBackend: vi.fn(),
        };

        actions = createSiteOperationsActions(mockDeps);
    });

    describe("addMonitorToSite", () => {
        it("should add a monitor to an existing site", async () => {
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);

            await actions.addMonitorToSite("test-site", mockMonitor);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                {
                    monitors: expect.arrayContaining([
                        mockMonitor,
                        mockMonitor,
                    ]), // Original + new
                }
            );
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should throw error when site is not found", async () => {
            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            await expect(
                actions.addMonitorToSite("nonexistent-site", mockMonitor)
            ).rejects.toThrow(ERROR_CATALOG.sites.NOT_FOUND);
        });
    });

    describe("createSite", () => {
        it("should create a new site with minimal data", async () => {
            const _newSite = {
                identifier: "new-site",
                name: "New Site",
                monitoring: true,
                monitors: [
                    {
                        history: [],
                        id: expect.any(String),
                        monitoring: true,
                        status: "pending",
                        type: "http",
                    },
                ],
            };
            void _newSite;
            // Mock will return the passed site, but implementation uses safeExtractIpcData with completeSite as fallback
            mockElectronAPI.sites.addSite.mockResolvedValue(undefined);

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
            expect(mockDeps.addSite).toHaveBeenCalledWith(
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
        });

        it("should create a new site with full data", async () => {
            const siteData = {
                identifier: "full-site",
                monitoring: false,
                monitors: [mockMonitor],
                name: "Full Site",
            };
            const newSite = { ...mockSite, ...siteData };
            mockElectronAPI.sites.addSite.mockResolvedValue(newSite);

            await actions.createSite(siteData);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining(siteData)
            );
        });
    });

    describe("deleteSite", () => {
        it("should delete a site and stop monitoring", async () => {
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(
                undefined
            );
            mockElectronAPI.sites.removeSite.mockResolvedValue(undefined);

            await actions.deleteSite("test-site");

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith(
                "test-site"
            );
            expect(mockDeps.removeSite).toHaveBeenCalledWith("test-site");
        });

        it("should handle deletion errors", async () => {
            const error = new Error("Delete failed");
            mockElectronAPI.sites.removeSite.mockRejectedValue(error);

            await expect(actions.deleteSite("test-site")).rejects.toThrow(
                "Delete failed"
            );
        });
    });

    describe("initializeSites", () => {
        it("should initialize sites from backend", async () => {
            const mockSites = [mockSite];
            mockElectronAPI.sites.getSites.mockResolvedValue({
                success: true,
                data: mockSites,
            });

            const result = await actions.initializeSites();

            expect(mockElectronAPI.sites.getSites).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
            expect(result).toEqual({
                message: "Successfully loaded 1 sites",
                sitesLoaded: 1,
                success: true,
            });
        });

        it("should handle empty sites list", async () => {
            mockElectronAPI.sites.getSites.mockResolvedValue({
                success: true,
                data: [],
            });

            const result = await actions.initializeSites();

            expect(result).toEqual({
                message: "Successfully loaded 0 sites",
                sitesLoaded: 0,
                success: true,
            });
        });

        it("should handle initialization errors", async () => {
            mockElectronAPI.sites.getSites.mockRejectedValue(
                new Error("Backend error")
            );

            await expect(actions.initializeSites()).rejects.toThrow(
                "Backend error"
            );
        });
    });

    describe("modifySite", () => {
        it("should modify a site successfully", async () => {
            const updates = { name: "Updated Site" };
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);

            await actions.modifySite("test-site", updates);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "test-site",
                updates
            );
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should handle modify errors", async () => {
            const error = new Error("Update failed");
            mockElectronAPI.sites.updateSite.mockRejectedValue(error);

            await expect(
                actions.modifySite("test-site", { name: "Updated" })
            ).rejects.toThrow("Update failed");
        });
    });

    describe("removeMonitorFromSite", () => {
        it("should remove a monitor from a site", async () => {
            // Add a second monitor to the site so removal is allowed
            const secondMonitor = { ...mockMonitor, id: "monitor-2" };
            const siteWithMultipleMonitors = {
                ...mockSite,
                monitors: [mockMonitor, secondMonitor],
            };
            mockDeps.getSites = vi.fn(() => [siteWithMultipleMonitors]);

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(
                undefined
            );
            mockElectronAPI.sites.removeMonitor.mockResolvedValue(undefined);

            await actions.removeMonitorFromSite("test-site", "monitor-1");

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockElectronAPI.sites.removeMonitor).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });
    });

    describe("Monitor configuration updates", () => {
        it("should update monitor retry attempts", async () => {
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);

            await actions.updateMonitorRetryAttempts(
                "test-site",
                "monitor-1",
                5
            );

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalled();
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should update monitor timeout", async () => {
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);

            await actions.updateMonitorTimeout("test-site", "monitor-1", 10_000);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalled();
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should update site check interval", async () => {
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);

            await actions.updateSiteCheckInterval(
                "test-site",
                "monitor-1",
                30_000
            );

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalled();
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });
    });

    describe("downloadSQLiteBackup", () => {
        it("should download SQLite backup", async () => {
            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({
                success: true,
                data: { buffer: new ArrayBuffer(8), fileName: "backup.sqlite" },
            });

            await actions.downloadSQLiteBackup();

            expect(
                mockElectronAPI.data.downloadSQLiteBackup
            ).toHaveBeenCalled();
        });
    });
});
