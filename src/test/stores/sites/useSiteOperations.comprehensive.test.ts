/**
 * Comprehensive tests for useSiteOperations.ts - Site operations store
 * These tests cover CRUD operations for sites and monitor management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Monitor, Site } from "../../../types";
import { ERROR_MESSAGES } from "../../../../shared/types";

// Create comprehensive mocks
const mockErrorStore = {
    clearStoreError: vi.fn(),
    setStoreError: vi.fn(),
    setOperationLoading: vi.fn(),
};

const mockWithErrorHandling = vi.fn().mockImplementation(async (operation) => {
    return await operation();
});

const mockLogStoreAction = vi.fn();

const mockSiteService = {
    addSite: vi.fn(),
    removeSite: vi.fn(),
    updateSite: vi.fn(),
    downloadSQLiteBackup: vi.fn(),
    removeMonitor: vi.fn(),
    getSites: vi.fn(),
};

const mockMonitoringService = {
    stopMonitoring: vi.fn(),
};

const mockHandleSQLiteBackupDownload = vi.fn();

const mockUpdateMonitorInSite = vi.fn();
const mockNormalizeMonitor = vi.fn();

// Mock all dependencies
vi.mock("../error/useErrorStore", () => ({
    useErrorStore: {
        getState: () => mockErrorStore,
    },
}));

vi.mock("../utils", () => ({
    withErrorHandling: mockWithErrorHandling,
    logStoreAction: mockLogStoreAction,
}));

vi.mock("./services/SiteService", () => ({
    SiteService: mockSiteService,
}));

vi.mock("./services/MonitoringService", () => ({
    MonitoringService: mockMonitoringService,
}));

vi.mock("./utils/fileDownload", () => ({
    handleSQLiteBackupDownload: mockHandleSQLiteBackupDownload,
}));

vi.mock("./utils/monitorOperations", () => ({
    updateMonitorInSite: mockUpdateMonitorInSite,
    normalizeMonitor: mockNormalizeMonitor,
}));

vi.mock("../../../shared/utils/environment", () => ({
    isDevelopment: () => false,
}));

vi.mock("../../services/logger", () => ({
    default: {
        warn: vi.fn(),
    },
}));

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
    value: {
        randomUUID: () => "mock-uuid-123",
    },
    writable: true,
});

// Mock window.electronAPI
Object.defineProperty(global, "window", {
    value: {
        electronAPI: {
            sites: {
                removeMonitor: vi.fn(),
            },
        },
    },
    writable: true,
});

// Import the module after mocks
import { createSiteOperationsActions } from "../../../stores/sites/useSiteOperations";

describe("useSiteOperations", () => {
    const mockSites: Site[] = [
        {
            identifier: "site-1",
            name: "Test Site 1",
            monitoring: true,
            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    history: [],
                    responseTime: 100,
                    checkInterval: 300000,
                    timeout: 5000,
                    retryAttempts: 3,
                    url: "https://example.com",
                },
            ],
        },
        {
            identifier: "site-2",
            name: "Test Site 2",
            monitoring: false,
            monitors: [
                {
                    id: "monitor-2",
                    type: "port",
                    status: "down",
                    monitoring: false,
                    history: [],
                    responseTime: -1,
                    checkInterval: 300000,
                    timeout: 5000,
                    retryAttempts: 3,
                    host: "example.com",
                    port: 80,
                },
            ],
        },
    ];

    const mockDeps = {
        addSite: vi.fn(),
        getSites: vi.fn(() => mockSites),
        removeSite: vi.fn(),
        setSites: vi.fn(),
        syncSitesFromBackend: vi.fn(),
    };

    let siteOperations: ReturnType<typeof createSiteOperationsActions>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDeps.getSites.mockReturnValue(mockSites);
        siteOperations = createSiteOperationsActions(mockDeps);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("addMonitorToSite", () => {
        const testMonitor: Monitor = {
            id: "new-monitor",
            type: "http",
            status: "pending",
            monitoring: true,
            history: [],
            responseTime: -1,
            checkInterval: 300000,
            timeout: 5000,
            retryAttempts: 3,
            url: "https://newmonitor.com",
        };

        it("should add monitor to existing site successfully", async () => {
            mockSiteService.updateSite.mockResolvedValue(undefined);
            mockDeps.syncSitesFromBackend.mockResolvedValue(undefined);

            await siteOperations.addMonitorToSite("site-1", testMonitor);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "addMonitorToSite", {
                siteId: "site-1",
                monitor: testMonitor,
            });
            expect(mockSiteService.updateSite).toHaveBeenCalledWith("site-1", {
                monitors: [mockSites[0]!.monitors[0], testMonitor],
            });
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should throw error when site not found", async () => {
            await expect(siteOperations.addMonitorToSite("non-existent", testMonitor)).rejects.toThrow(
                ERROR_MESSAGES.SITE_NOT_FOUND
            );
        });

        it("should handle service errors", async () => {
            const serviceError = new Error("Service error");
            mockSiteService.updateSite.mockRejectedValue(serviceError);

            await expect(siteOperations.addMonitorToSite("site-1", testMonitor)).rejects.toThrow("Service error");
        });
    });

    describe("createSite", () => {
        it("should create site with minimal data", async () => {
            const siteData = {
                identifier: "new-site",
                name: "New Site",
            };

            const expectedSite = {
                identifier: "new-site",
                name: "New Site",
                monitoring: true,
                monitors: [
                    {
                        history: [],
                        id: "mock-uuid-123",
                        monitoring: true,
                        status: "pending",
                        type: "http",
                    },
                ],
            };

            mockNormalizeMonitor.mockReturnValue(expectedSite.monitors[0]);
            mockSiteService.addSite.mockResolvedValue(expectedSite);

            await siteOperations.createSite(siteData);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "createSite", { siteData });
            expect(mockSiteService.addSite).toHaveBeenCalledWith(expectedSite);
            expect(mockDeps.addSite).toHaveBeenCalledWith(expectedSite);
        });

        it("should create site with provided monitors", async () => {
            const siteData = {
                identifier: "new-site",
                monitors: [
                    {
                        id: "custom-monitor",
                        type: "http" as const,
                        url: "https://custom.com",
                        history: [],
                        monitoring: true,
                        status: "pending" as const,
                        responseTime: -1,
                        checkInterval: 300000,
                        timeout: 5000,
                        retryAttempts: 3,
                    },
                ],
            };

            const normalizedMonitor = {
                id: "custom-monitor",
                type: "http",
                url: "https://custom.com",
                monitoring: true,
                status: "pending",
                history: [],
            };

            mockNormalizeMonitor.mockReturnValue(normalizedMonitor);
            mockSiteService.addSite.mockResolvedValue({
                ...siteData,
                name: "Unnamed Site",
                monitoring: true,
                monitors: [normalizedMonitor],
            });

            await siteOperations.createSite(siteData);

            expect(mockNormalizeMonitor).toHaveBeenCalledWith(siteData.monitors[0]);
        });

        it("should handle site creation errors", async () => {
            const siteData = { identifier: "new-site" };
            const creationError = new Error("Creation failed");
            mockSiteService.addSite.mockRejectedValue(creationError);

            await expect(siteOperations.createSite(siteData)).rejects.toThrow("Creation failed");
        });
    });

    describe("deleteSite", () => {
        it("should delete site and stop all monitors", async () => {
            mockMonitoringService.stopMonitoring.mockResolvedValue(undefined);
            mockSiteService.removeSite.mockResolvedValue(undefined);

            await siteOperations.deleteSite("site-1");

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "deleteSite", {
                identifier: "site-1",
            });
            expect(mockMonitoringService.stopMonitoring).toHaveBeenCalledWith("site-1", "monitor-1");
            expect(mockSiteService.removeSite).toHaveBeenCalledWith("site-1");
            expect(mockDeps.removeSite).toHaveBeenCalledWith("site-1");
        });

        it("should continue deletion even if stopping monitoring fails", async () => {
            mockMonitoringService.stopMonitoring.mockRejectedValue(new Error("Stop failed"));
            mockSiteService.removeSite.mockResolvedValue(undefined);

            await siteOperations.deleteSite("site-1");

            expect(mockSiteService.removeSite).toHaveBeenCalledWith("site-1");
            expect(mockDeps.removeSite).toHaveBeenCalledWith("site-1");
        });

        it("should handle non-existent site gracefully", async () => {
            await siteOperations.deleteSite("non-existent");

            // Should not try to stop monitors for non-existent site
            expect(mockMonitoringService.stopMonitoring).not.toHaveBeenCalled();
            expect(mockSiteService.removeSite).toHaveBeenCalledWith("non-existent");
        });

        it("should handle deletion service errors", async () => {
            const deletionError = new Error("Deletion failed");
            mockSiteService.removeSite.mockRejectedValue(deletionError);

            await expect(siteOperations.deleteSite("site-1")).rejects.toThrow("Deletion failed");
        });
    });

    describe("downloadSQLiteBackup", () => {
        it("should download SQLite backup successfully", async () => {
            const mockBackupData = new ArrayBuffer(100);
            mockSiteService.downloadSQLiteBackup.mockResolvedValue(mockBackupData);
            mockHandleSQLiteBackupDownload.mockResolvedValue(undefined);
            mockHandleSQLiteBackupDownload.mockResolvedValue(undefined);

            await siteOperations.downloadSQLiteBackup();

            expect(mockHandleSQLiteBackupDownload).toHaveBeenCalledWith(expect.any(Function));
            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "downloadSQLiteBackup", {
                message: "SQLite backup download completed",
                success: true,
            });
        });

        it("should handle backup download errors", async () => {
            const backupError = new Error("Backup failed");
            mockSiteService.downloadSQLiteBackup.mockRejectedValue(backupError);

            await expect(siteOperations.downloadSQLiteBackup()).rejects.toThrow("Backup failed");
        });
    });

    describe("initializeSites", () => {
        it("should initialize sites successfully", async () => {
            mockSiteService.getSites.mockResolvedValue(mockSites);
            
            const result = await siteOperations.initializeSites();

            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
            expect(result).toEqual({
                message: `Successfully loaded ${mockSites.length} sites`,
                sitesLoaded: mockSites.length,
                success: true,
            });
        });

        it("should handle initialization errors", async () => {
            const initError = new Error("Init failed");
            mockSiteService.getSites.mockRejectedValue(initError);

            await expect(siteOperations.initializeSites()).rejects.toThrow("Init failed");
        });
    });

    describe("modifySite", () => {
        it("should modify site successfully", async () => {
            const updates = { name: "Updated Site Name", monitoring: false };
            mockSiteService.updateSite.mockResolvedValue(undefined);
            mockDeps.syncSitesFromBackend.mockResolvedValue(undefined);

            await siteOperations.modifySite("site-1", updates);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "modifySite", {
                identifier: "site-1",
                updates,
            });
            expect(mockSiteService.updateSite).toHaveBeenCalledWith("site-1", updates);
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should handle modification errors", async () => {
            const modifyError = new Error("Modify failed");
            mockSiteService.updateSite.mockRejectedValue(modifyError);

            await expect(siteOperations.modifySite("site-1", { name: "New Name" })).rejects.toThrow("Modify failed");
        });
    });

    describe("removeMonitorFromSite", () => {
        it("should remove monitor from site with multiple monitors", async () => {
            // Create a site with multiple monitors
            const multiMonitorSite = {
                ...mockSites[0]!,
                monitors: [
                    ...mockSites[0]!.monitors,
                    {
                        id: "monitor-extra",
                        type: "port" as const,
                        status: "up" as const,
                        monitoring: true,
                        history: [],
                        responseTime: 50,
                        checkInterval: 300000,
                        timeout: 5000,
                        retryAttempts: 3,
                        host: "example.com",
                        port: 443,
                    },
                ],
            };

            mockDeps.getSites.mockReturnValue([multiMonitorSite]);
            mockMonitoringService.stopMonitoring.mockResolvedValue(undefined);
            mockSiteService.removeMonitor = vi.fn().mockResolvedValue(undefined);
            mockDeps.syncSitesFromBackend.mockResolvedValue(undefined);

            await siteOperations.removeMonitorFromSite("site-1", "monitor-1");

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "removeMonitorFromSite", {
                siteId: "site-1",
                monitorId: "monitor-1",
            });
            expect(mockMonitoringService.stopMonitoring).toHaveBeenCalledWith("site-1", "monitor-1");
            expect(mockSiteService.removeMonitor).toHaveBeenCalledWith("site-1", "monitor-1");
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should prevent removing last monitor", async () => {
            await expect(siteOperations.removeMonitorFromSite("site-1", "monitor-1")).rejects.toThrow(
                ERROR_MESSAGES.CANNOT_REMOVE_LAST_MONITOR
            );
        });

        it("should handle non-existent site", async () => {
            await expect(siteOperations.removeMonitorFromSite("non-existent", "monitor-1")).rejects.toThrow(
                ERROR_MESSAGES.SITE_NOT_FOUND
            );
        });

        it("should continue removal even if stopping monitoring fails", async () => {
            const multiMonitorSite = {
                ...mockSites[0]!,
                monitors: [...mockSites[0]!.monitors, { id: "monitor-extra" } as Monitor],
            };

            mockDeps.getSites.mockReturnValue([multiMonitorSite]);
            mockMonitoringService.stopMonitoring.mockRejectedValue(new Error("Stop failed"));
            mockSiteService.removeMonitor = vi.fn().mockResolvedValue(undefined);

            await siteOperations.removeMonitorFromSite("site-1", "monitor-1");

            expect(mockSiteService.removeMonitor).toHaveBeenCalledWith("site-1", "monitor-1");
        });
    });

    describe("updateMonitorRetryAttempts", () => {
        it("should update monitor retry attempts", async () => {
            const updatedSite = { ...mockSites[0]! };
            mockUpdateMonitorInSite.mockReturnValue(updatedSite);
            mockSiteService.updateSite.mockResolvedValue(undefined);
            mockDeps.syncSitesFromBackend.mockResolvedValue(undefined);

            await siteOperations.updateMonitorRetryAttempts("site-1", "monitor-1", 5);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "updateMonitorRetryAttempts", {
                siteId: "site-1",
                monitorId: "monitor-1",
                retryAttempts: 5,
            });
            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(mockSites[0], "monitor-1", {
                retryAttempts: 5,
            });
            expect(mockSiteService.updateSite).toHaveBeenCalledWith("site-1", {
                monitors: updatedSite.monitors,
            });
        });

        it("should handle undefined retry attempts", async () => {
            const updatedSite = { ...mockSites[0]! };
            mockUpdateMonitorInSite.mockReturnValue(updatedSite);

            await (siteOperations as any).updateMonitorRetryAttempts("site-1", "monitor-1", undefined);

            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(mockSites[0], "monitor-1", {});
        });

        it("should handle non-existent site", async () => {
            await expect(
                siteOperations.updateMonitorRetryAttempts("non-existent", "monitor-1", 5)
            ).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });
    });

    describe("updateMonitorTimeout", () => {
        it("should update monitor timeout", async () => {
            const updatedSite = { ...mockSites[0]! };
            mockUpdateMonitorInSite.mockReturnValue(updatedSite);
            mockSiteService.updateSite.mockResolvedValue(undefined);
            mockDeps.syncSitesFromBackend.mockResolvedValue(undefined);

            await siteOperations.updateMonitorTimeout("site-1", "monitor-1", 10000);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "updateMonitorTimeout", {
                siteId: "site-1",
                monitorId: "monitor-1",
                timeout: 10000,
            });
            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(mockSites[0], "monitor-1", {
                timeout: 10000,
            });
        });

        it("should handle undefined timeout", async () => {
            const updatedSite = { ...mockSites[0]! };
            mockUpdateMonitorInSite.mockReturnValue(updatedSite);

            await (siteOperations as any).updateMonitorTimeout("site-1", "monitor-1", undefined);

            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(mockSites[0], "monitor-1", {});
        });
    });

    describe("updateSiteCheckInterval", () => {
        it("should update site check interval", async () => {
            const updatedSite = { ...mockSites[0]! };
            mockUpdateMonitorInSite.mockReturnValue(updatedSite);
            mockSiteService.updateSite.mockResolvedValue(undefined);
            mockDeps.syncSitesFromBackend.mockResolvedValue(undefined);

            await siteOperations.updateSiteCheckInterval("site-1", "monitor-1", 600000);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "updateSiteCheckInterval", {
                siteId: "site-1",
                monitorId: "monitor-1",
                interval: 600000,
            });
            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(mockSites[0], "monitor-1", {
                checkInterval: 600000,
            });
            expect(mockSiteService.updateSite).toHaveBeenCalledWith("site-1", {
                monitors: updatedSite.monitors,
            });
        });

        it("should handle update interval errors", async () => {
            const updateError = new Error("Update failed");
            mockSiteService.updateSite.mockRejectedValue(updateError);

            await expect(siteOperations.updateSiteCheckInterval("site-1", "monitor-1", 600000)).rejects.toThrow(
                "Update failed"
            );
        });
    });

    describe("Error Handling", () => {
        it("should call error handlers correctly", async () => {
            const testError = new Error("Test error");
            mockSiteService.addSite.mockRejectedValue(testError);

            // Test that withErrorHandling is called with correct handlers
            await expect(
                siteOperations.createSite({ identifier: "test-site" })
            ).rejects.toThrow("Test error");

            // Verify withErrorHandling was called with proper error handlers
            expect(mockWithErrorHandling).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    clearError: expect.any(Function),
                    setError: expect.any(Function),
                    setLoading: expect.any(Function),
                })
            );
        });

        it("should handle complex error scenarios", async () => {
            // Test cascading errors
            mockMonitoringService.stopMonitoring.mockRejectedValue(new Error("Stop failed"));
            mockSiteService.removeSite.mockRejectedValue(new Error("Delete failed"));

            await expect(siteOperations.deleteSite("site-1")).rejects.toThrow("Delete failed");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty sites list", async () => {
            mockDeps.getSites.mockReturnValue([]);

            await expect(siteOperations.addMonitorToSite("any-site", {} as Monitor)).rejects.toThrow(
                ERROR_MESSAGES.SITE_NOT_FOUND
            );
        });

        it("should handle sites with no monitors", async () => {
            const siteWithNoMonitors = {
                identifier: "empty-site",
                name: "Empty Site",
                monitoring: false,
                monitors: [],
            };

            mockDeps.getSites.mockReturnValue([siteWithNoMonitors]);

            // Should not try to stop monitoring for sites with no monitors
            await siteOperations.deleteSite("empty-site");

            expect(mockMonitoringService.stopMonitoring).not.toHaveBeenCalled();
        });

        it("should handle sites with undefined monitors", async () => {
            const siteWithUndefinedMonitors = {
                identifier: "undefined-site",
                name: "Undefined Site",
                monitoring: false,
                monitors: undefined as any,
            };

            mockDeps.getSites.mockReturnValue([siteWithUndefinedMonitors]);

            await siteOperations.deleteSite("undefined-site");

            expect(mockMonitoringService.stopMonitoring).not.toHaveBeenCalled();
        });
    });
});
