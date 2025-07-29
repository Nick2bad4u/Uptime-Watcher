/**
 * Tests for createSiteOperationsActions module
 * Tests CRUD operations for sites and monitor management
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_MESSAGES, type Monitor, type Site } from "../../../../shared/types";

import { createSiteOperationsActions, type SiteOperationsDependencies } from "../../../stores/sites/useSiteOperations";

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

vi.mock("../../../stores/sites/services/MonitoringService", () => ({
    MonitoringService: {
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
    },
}));

vi.mock("../../../stores/sites/services/SiteService", () => ({
    SiteService: {
        addSite: vi.fn(),
        removeSite: vi.fn(),
        removeMonitor: vi.fn(),
        getSites: vi.fn(),
        updateSite: vi.fn(),
        checkSiteNow: vi.fn(),
        downloadSQLiteBackup: vi.fn(),
    },
}));

vi.mock("../../../stores/sites/utils/fileDownload", () => ({
    handleSQLiteBackupDownload: vi.fn(),
}));

vi.mock("../../../stores/sites/utils/monitorOperations", () => ({
    normalizeMonitor: vi.fn((monitor) => monitor),
    updateMonitorInSite: vi.fn((site, monitorId, updates) => ({
        ...site,
        monitors: site.monitors.map(m => m.id === monitorId ? { ...m, ...updates } : m),
    })),
}));

// Import mocked services for proper typing
import { SiteService } from "../../../stores/sites/services/SiteService";
import { MonitoringService } from "../../../stores/sites/services/MonitoringService";
import { normalizeMonitor } from "../../../stores/sites/utils/monitorOperations";

describe("createSiteOperationsActions", () => {
    let mockDeps: SiteOperationsDependencies;
    let mockSite: Site;
    let mockMonitor: Monitor;
    let actions: ReturnType<typeof createSiteOperationsActions>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockMonitor = {
            checkInterval: 60000,
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
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await actions.addMonitorToSite("test-site", mockMonitor);

            expect(SiteService.updateSite).toHaveBeenCalledWith("test-site", {
                monitors: expect.arrayContaining([mockMonitor, mockMonitor]) // Original + new
            });
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should throw error when site is not found", async () => {
            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            await expect(actions.addMonitorToSite("nonexistent-site", mockMonitor)).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });

        it("should handle normalized monitor data", async () => {
            vi.mocked(normalizeMonitor).mockReturnValue(mockMonitor);
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await actions.addMonitorToSite("test-site", mockMonitor);

            // normalizeMonitor is not called directly in addMonitorToSite
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });
    });

    describe("createSite", () => {
        it("should create a new site with minimal data", async () => {
            const newSite = { ...mockSite, name: "New Site" };
            vi.mocked(SiteService.addSite).mockResolvedValue(newSite);

            await actions.createSite({
                identifier: "new-site",
                name: "New Site",
            });

            expect(SiteService.addSite).toHaveBeenCalledWith(expect.objectContaining({
                identifier: "new-site",
                name: "New Site",
                monitoring: true,
                monitors: expect.any(Array),
            }));
            expect(mockDeps.addSite).toHaveBeenCalledWith(newSite);
        });

        it("should create a new site with full data", async () => {
            const siteData = {
                identifier: "full-site",
                monitoring: false,
                monitors: [mockMonitor],
                name: "Full Site",
            };
            const newSite = { ...mockSite, ...siteData };
            vi.mocked(SiteService.addSite).mockResolvedValue(newSite);

            await actions.createSite(siteData);

            expect(SiteService.addSite).toHaveBeenCalledWith(siteData);
        });

        it("should sync sites after creation", async () => {
            vi.mocked(SiteService.addSite).mockResolvedValue(mockSite);

            await actions.createSite({ identifier: "test", name: "Test" });

            expect(mockDeps.addSite).toHaveBeenCalled();
        });
    });

    describe("deleteSite", () => {
        it("should delete an existing site", async () => {
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);
            vi.mocked(SiteService.removeSite).mockResolvedValue(undefined);

            await actions.deleteSite("test-site");

            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(SiteService.removeSite).toHaveBeenCalledWith("test-site");
            expect(mockDeps.removeSite).toHaveBeenCalledWith("test-site");
        });

        it("should handle deletion errors", async () => {
            const error = new Error("Deletion failed");
            vi.mocked(SiteService.removeSite).mockRejectedValue(error);

            await expect(actions.deleteSite("test-site")).rejects.toThrow("Deletion failed");
        });
    });

    describe("initializeSites", () => {
        it("should initialize sites from backend", async () => {
            const mockSites = [mockSite];
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            const result = await actions.initializeSites();

            expect(SiteService.getSites).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
            expect(result).toEqual({
                message: "Successfully loaded 1 sites",
                sitesLoaded: 1,
                success: true,
            });
        });

        it("should handle empty sites list", async () => {
            vi.mocked(SiteService.getSites).mockResolvedValue([]);

            const result = await actions.initializeSites();

            expect(result).toEqual({
                message: "Successfully loaded 0 sites",
                sitesLoaded: 0,
                success: true,
            });
        });

        it("should handle initialization errors", async () => {
            vi.mocked(SiteService.getSites).mockRejectedValue(new Error("Backend error"));

            await expect(actions.initializeSites()).rejects.toThrow("Backend error");
        });
    });

    describe("modifySite", () => {
        it("should modify an existing site", async () => {
            const updates = { name: "Updated Site" };
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await actions.modifySite("test-site", updates);

            expect(SiteService.updateSite).toHaveBeenCalledWith("test-site", updates);
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should handle modification errors", async () => {
            const error = new Error("Update failed");
            vi.mocked(SiteService.updateSite).mockRejectedValue(error);

            await expect(actions.modifySite("test-site", {})).rejects.toThrow("Update failed");
        });
    });

    describe("removeMonitorFromSite", () => {
        it("should remove a monitor from an existing site", async () => {
            const siteWithMultipleMonitors = {
                ...mockSite,
                monitors: [mockMonitor, { ...mockMonitor, id: "monitor-2" }],
            };
            vi.mocked(mockDeps.getSites).mockReturnValue([siteWithMultipleMonitors]);
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);
            vi.mocked(SiteService.removeMonitor).mockResolvedValue(undefined);

            await actions.removeMonitorFromSite("test-site", "monitor-1");

            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(SiteService.removeMonitor).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should throw error when site is not found", async () => {
            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            await expect(actions.removeMonitorFromSite("nonexistent-site", "monitor-1")).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });
    });

    describe("updateMonitorRetryAttempts", () => {
        it("should update monitor retry attempts", async () => {
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await actions.updateMonitorRetryAttempts("test-site", "monitor-1", 5);

            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should throw error when site is not found", async () => {
            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            await expect(actions.updateMonitorRetryAttempts("nonexistent-site", "monitor-1", 5)).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });
    });

    describe("updateMonitorTimeout", () => {
        it("should update monitor timeout", async () => {
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await actions.updateMonitorTimeout("test-site", "monitor-1", 10000);

            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should throw error when site is not found", async () => {
            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            await expect(actions.updateMonitorTimeout("nonexistent-site", "monitor-1", 10000)).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });
    });

    describe("updateSiteCheckInterval", () => {
        it("should update site check interval", async () => {
            vi.mocked(SiteService.updateSite).mockResolvedValue(undefined);

            await actions.updateSiteCheckInterval("test-site", "monitor-1", 120000);

            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should throw error when site is not found", async () => {
            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            await expect(actions.updateSiteCheckInterval("nonexistent-site", "monitor-1", 120000)).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });
    });

    describe("edge cases and error handling", () => {
        it("should handle null/undefined monitor data", async () => {
            // This test verifies the function doesn't crash with null data
            // The actual validation would happen in the real implementation
            const invalidMonitor = null as any;

            // Since withErrorHandling is mocked to not throw, just verify it was called
            await actions.addMonitorToSite("test-site", invalidMonitor);
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should handle empty site identifier", async () => {
            // Reset the mock to avoid interference from other tests
            vi.mocked(SiteService.removeSite).mockResolvedValue(undefined);
            
            // Test that empty identifier is handled
            await actions.deleteSite("");
            // Should complete without throwing due to mock
            expect(SiteService.removeSite).toHaveBeenCalledWith("");
        });

        it("should handle negative retry attempts", async () => {
            // Test that negative values are handled
            await actions.updateMonitorRetryAttempts("test-site", "monitor-1", -1);
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should handle zero timeout", async () => {
            // Test that zero timeout is handled
            await actions.updateMonitorTimeout("test-site", "monitor-1", 0);
            expect(mockDeps.syncSitesFromBackend).toHaveBeenCalled();
        });

        it("should handle monitors array manipulation for site updates", async () => {
            const siteWithMultipleMonitors = {
                ...mockSite,
                monitors: [mockMonitor, { ...mockMonitor, id: "monitor-2" }],
            };
            vi.mocked(mockDeps.getSites).mockReturnValue([siteWithMultipleMonitors]);
            vi.mocked(SiteService.removeMonitor).mockResolvedValue(undefined);

            await actions.removeMonitorFromSite("test-site", "monitor-2");

            expect(SiteService.removeMonitor).toHaveBeenCalledWith("test-site", "monitor-2");
        });
    });
});
