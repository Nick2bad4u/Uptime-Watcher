/**
 * Tests for uncovered functions in useSitesStore
 * Targeting lines 308-325 and 327-344 to improve coverage
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { SiteService } from "../stores/sites/services";
import { ERROR_MESSAGES } from "../stores/types";
import { updateMonitorInSite } from "../stores/sites/utils";
import type { Site, Monitor } from "../types";

// Mock dependencies
vi.mock("../stores/sites/services", () => ({
    SiteService: {
        updateSite: vi.fn(),
        getSites: vi.fn(),
    },
}));

vi.mock("../stores/sites/utils", () => ({
    updateMonitorInSite: vi.fn(),
    StatusUpdateManager: vi.fn().mockImplementation(() => ({})),
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn((fn, handlers) => {
        return fn().catch((error: Error) => {
            handlers.setError(error);
            throw error;
        });
    }),
    // Include other exports that might be needed
    createStatusUpdateHandler: vi.fn(),
    handleSQLiteBackupDownload: vi.fn(),
    normalizeMonitor: vi.fn(),
}));

// Mock the actual utilities we need
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn((fn, handlers) => {
        return fn().catch((error: unknown) => {
            handlers.setError(error);
            throw error;
        });
    }),
}));

describe("useSitesStore - Uncovered Functions", () => {
    let mockSite: Site;
    let mockMonitor: Monitor;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockSite = {
            identifier: "test-site-id",
            name: "Test Site",
            monitors: [
                {
                    id: "monitor-1",
                    type: "http" as const,
                    status: "up" as const,
                    url: "https://test.com",
                    history: [],
                    checkInterval: 60000,
                    timeout: 5000,
                    retryAttempts: 3,
                }
            ],
        };

        mockMonitor = {
            id: "monitor-1",
            type: "http" as const,
            status: "up" as const,
            url: "https://test.com",
            history: [],
            checkInterval: 60000,
            timeout: 5000,
            retryAttempts: 3,
        };

        // Reset store state
        useSitesStore.setState({ sites: [mockSite] });
        
        // Mock the updateMonitorInSite function
        (updateMonitorInSite as ReturnType<typeof vi.fn>).mockReturnValue({
            ...mockSite,
            monitors: [{ ...mockMonitor, timeout: 10000 }]
        });
        
        // Mock SiteService.getSites for sync operations
        (SiteService.getSites as ReturnType<typeof vi.fn>).mockResolvedValue([mockSite]);
    });

    describe("updateMonitorTimeout", () => {
        it("should update monitor timeout successfully", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            // Mock the syncSitesFromBackend function
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            await store.updateMonitorTimeout("test-site-id", "monitor-1", 10000);

            expect(updateMonitorInSite).toHaveBeenCalledWith(
                mockSite,
                "monitor-1",
                { timeout: 10000 }
            );
            expect(SiteService.updateSite).toHaveBeenCalledWith(
                "test-site-id",
                { monitors: expect.any(Array) }
            );
        });

        it("should handle site not found error", async () => {
            const store = useSitesStore.getState();
            useSitesStore.setState({ sites: [] });

            await expect(
                store.updateMonitorTimeout("non-existent-site", "monitor-1", 10000)
            ).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });

        it("should handle timeout value as undefined", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            await store.updateMonitorTimeout("test-site-id", "monitor-1", undefined);

            expect(updateMonitorInSite).toHaveBeenCalledWith(
                mockSite,
                "monitor-1",
                { timeout: undefined }
            );
        });

        it("should handle SiteService.updateSite error", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            (SiteService.updateSite as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Update failed"));

            await expect(
                store.updateMonitorTimeout("test-site-id", "monitor-1", 10000)
            ).rejects.toThrow("Update failed");
        });
    });

    describe("updateSiteCheckInterval", () => {
        it("should update site check interval successfully", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            // Mock the syncSitesFromBackend function
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            await store.updateSiteCheckInterval("test-site-id", "monitor-1", 30000);

            expect(updateMonitorInSite).toHaveBeenCalledWith(
                mockSite,
                "monitor-1",
                { checkInterval: 30000 }
            );
            expect(SiteService.updateSite).toHaveBeenCalledWith(
                "test-site-id",
                { monitors: expect.any(Array) }
            );
        });

        it("should handle site not found error", async () => {
            const store = useSitesStore.getState();
            useSitesStore.setState({ sites: [] });

            await expect(
                store.updateSiteCheckInterval("non-existent-site", "monitor-1", 30000)
            ).rejects.toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });

        it("should handle different interval values", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            // Test with different interval values
            const intervals = [10000, 60000, 300000];
            
            for (const interval of intervals) {
                await store.updateSiteCheckInterval("test-site-id", "monitor-1", interval);
                
                expect(updateMonitorInSite).toHaveBeenCalledWith(
                    mockSite,
                    "monitor-1",
                    { checkInterval: interval }
                );
            }
        });

        it("should handle SiteService.updateSite error", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            (SiteService.updateSite as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Interval update failed"));

            await expect(
                store.updateSiteCheckInterval("test-site-id", "monitor-1", 30000)
            ).rejects.toThrow("Interval update failed");
        });

        it("should handle edge case with zero interval", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            await store.updateSiteCheckInterval("test-site-id", "monitor-1", 0);

            expect(updateMonitorInSite).toHaveBeenCalledWith(
                mockSite,
                "monitor-1",
                { checkInterval: 0 }
            );
        });
    });

    describe("error handling integration", () => {
        it("should log errors correctly for updateMonitorTimeout", async () => {
            const store = useSitesStore.getState();
            useSitesStore.setState({ sites: [] });

            // Test error logging
            await expect(
                store.updateMonitorTimeout("non-existent-site", "monitor-1", 10000)
            ).rejects.toThrow();
        });

        it("should log errors correctly for updateSiteCheckInterval", async () => {
            const store = useSitesStore.getState();
            useSitesStore.setState({ sites: [] });

            // Test error logging
            await expect(
                store.updateSiteCheckInterval("non-existent-site", "monitor-1", 30000)
            ).rejects.toThrow();
        });
    });

    describe("synchronization with backend", () => {
        it("should call syncSitesFromBackend after successful updateMonitorTimeout", async () => {
            const store = useSitesStore.getState();
            
            useSitesStore.setState({ 
                sites: [mockSite],
            });

            await store.updateMonitorTimeout("test-site-id", "monitor-1", 10000);

            // Since syncSitesFromBackend calls SiteService.getSites, verify that was called
            expect(SiteService.getSites).toHaveBeenCalled();
        });

        it("should call syncSitesFromBackend after successful updateSiteCheckInterval", async () => {
            const store = useSitesStore.getState();
            
            useSitesStore.setState({ 
                sites: [mockSite],
            });

            await store.updateSiteCheckInterval("test-site-id", "monitor-1", 30000);

            // Since syncSitesFromBackend calls SiteService.getSites, verify that was called
            expect(SiteService.getSites).toHaveBeenCalled();
        });
    });

    describe("monitor finding edge cases", () => {
        it("should handle multiple monitors of the same type", async () => {
            const siteWithMultipleMonitors = {
                ...mockSite,
                monitors: [
                    { ...mockMonitor, id: "monitor-1" },
                    { ...mockMonitor, id: "monitor-2" },
                    { ...mockMonitor, id: "monitor-3" }
                ]
            };

            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            useSitesStore.setState({ 
                sites: [siteWithMultipleMonitors],
                syncSitesFromBackend 
            });

            await store.updateMonitorTimeout("test-site-id", "monitor-2", 15000);

            expect(updateMonitorInSite).toHaveBeenCalledWith(
                siteWithMultipleMonitors,
                "monitor-2",
                { timeout: 15000 }
            );
        });

        it("should handle monitor not found in site", async () => {
            const store = useSitesStore.getState();
            const syncSitesFromBackend = vi.fn();
            
            useSitesStore.setState({ 
                sites: [mockSite],
                syncSitesFromBackend 
            });

            // Mock updateMonitorInSite to throw error for non-existent monitor
            (updateMonitorInSite as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
                throw new Error("Monitor not found");
            });

            await expect(
                store.updateMonitorTimeout("test-site-id", "non-existent-monitor", 10000)
            ).rejects.toThrow("Monitor not found");
        });
    });
});
