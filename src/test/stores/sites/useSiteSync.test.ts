/**
 * @file useSiteSync.test.ts
 * @description Test suite for useSiteSync module
 * This module handles syncing data from backend and status update subscriptions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Site, MonitorType } from "../../../types";

import { createSiteSyncActions, type SiteSyncDependencies } from "../../../stores/sites/useSiteSync";

// Mock dependencies
vi.mock("../../../stores/sites/services", () => ({
    SiteService: {
        getSites: vi.fn(),
    },
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(
        async (
            fn: () => Promise<void>,
            store: { setError: (error: string) => void; setLoading: (loading: boolean) => void; clearError: () => void }
        ) => {
            try {
                return await fn();
            } catch (error) {
                store.setError(error instanceof Error ? error.message : String(error));
                // Don't rethrow in tests to allow testing error handling
                return undefined;
            }
        }
    ),
}));

vi.mock("../../../stores/sites/utils", () => ({
    createStatusUpdateHandler: vi.fn(),
    StatusUpdateManager: vi.fn().mockImplementation(() => ({
        subscribe: vi.fn().mockResolvedValue(undefined),
        unsubscribe: vi.fn(),
    })),
}));

// Import mocked services
import { SiteService } from "../../../stores/sites/services";
import { createStatusUpdateHandler } from "../../../stores/sites/utils";
import { logStoreAction } from "../../../stores/utils";

describe("useSiteSync", () => {
    let mockDependencies: SiteSyncDependencies;
    let syncActions: ReturnType<typeof createSiteSyncActions>;

    // Mock data
    const mockSite: Site = {
        identifier: "example.com",
        monitors: [
            {
                history: [],
                id: "monitor-1",
                monitoring: true,
                status: "up" as const,
                type: "http" as MonitorType,
                url: "https://example.com",
            },
        ],
        name: "Example Site",
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock dependencies
        mockDependencies = {
            getSites: vi.fn(() => [mockSite]),
            setSites: vi.fn(),
        };

        syncActions = createSiteSyncActions(mockDependencies);
    });

    describe("syncSitesFromBackend", () => {
        it("should sync sites from backend", async () => {
            const mockSites = [mockSite];
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.syncSitesFromBackend();

            expect(SiteService.getSites).toHaveBeenCalledTimes(1);
            expect(mockDependencies.setSites).toHaveBeenCalledWith(mockSites);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "syncSitesFromBackend", {
                message: "Sites synchronized from backend",
                sitesCount: 1,
                success: true,
            });
        });

        it("should handle errors during sync", async () => {
            const error = new Error("Sync failed");
            vi.mocked(SiteService.getSites).mockRejectedValue(error);

            // The withErrorHandling mock should allow the promise to resolve without throwing
            await expect(syncActions.syncSitesFromBackend()).resolves.toBeUndefined();

            expect(SiteService.getSites).toHaveBeenCalledTimes(1);
            expect(mockDependencies.setSites).not.toHaveBeenCalled();
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "error", { error: "Sync failed" });
        });

        it("should handle empty sites array", async () => {
            const mockEmptySites: Site[] = [];
            vi.mocked(SiteService.getSites).mockResolvedValue(mockEmptySites);

            await syncActions.syncSitesFromBackend();

            expect(SiteService.getSites).toHaveBeenCalledTimes(1);
            expect(mockDependencies.setSites).toHaveBeenCalledWith(mockEmptySites);
        });
    });

    describe("fullSyncFromBackend", () => {
        it("should perform full sync by calling syncSitesFromBackend", async () => {
            const mockSites = [mockSite];
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.fullSyncFromBackend();

            expect(SiteService.getSites).toHaveBeenCalledTimes(1);
            expect(mockDependencies.setSites).toHaveBeenCalledWith(mockSites);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "fullSyncFromBackend", {
                message: "Full backend synchronization completed",
                success: true,
            });
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "syncSitesFromBackend", {
                message: "Sites synchronized from backend",
                sitesCount: 1,
                success: true,
            });
        });

        it("should handle errors during full sync", async () => {
            const error = new Error("Full sync failed");
            vi.mocked(SiteService.getSites).mockRejectedValue(error);

            await expect(syncActions.fullSyncFromBackend()).resolves.toBeUndefined();

            expect(SiteService.getSites).toHaveBeenCalledTimes(1);
            expect(mockDependencies.setSites).not.toHaveBeenCalled();
        });
    });

    describe("subscribeToStatusUpdates", () => {
        it("should subscribe to status updates with proper handler", () => {
            const mockCallback = vi.fn();
            const mockHandler = vi.fn();

            vi.mocked(createStatusUpdateHandler).mockReturnValue(mockHandler);

            syncActions.subscribeToStatusUpdates(mockCallback);

            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "subscribeToStatusUpdates", {
                message: "Successfully subscribed to status updates",
                subscribed: true,
                success: true,
            });
            expect(createStatusUpdateHandler).toHaveBeenCalledWith({
                fullSyncFromBackend: syncActions.fullSyncFromBackend,
                getSites: mockDependencies.getSites,
                onUpdate: mockCallback,
                setSites: mockDependencies.setSites,
            });
        });
    });

    describe("unsubscribeFromStatusUpdates", () => {
        it("should unsubscribe from status updates", () => {
            syncActions.unsubscribeFromStatusUpdates();

            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "unsubscribeFromStatusUpdates", {
                message: "Successfully unsubscribed from status updates",
                success: true,
                unsubscribed: true,
            });
        });
    });

    describe("status update handler creation", () => {
        it("should create handler with correct dependencies", () => {
            const mockCallback = vi.fn();
            const mockHandler = vi.fn();

            vi.mocked(createStatusUpdateHandler).mockReturnValue(mockHandler);

            syncActions.subscribeToStatusUpdates(mockCallback);

            expect(createStatusUpdateHandler).toHaveBeenCalledWith({
                fullSyncFromBackend: expect.any(Function),
                getSites: mockDependencies.getSites,
                onUpdate: mockCallback,
                setSites: mockDependencies.setSites,
            });
        });

        it("should pass the callback function correctly", () => {
            const mockCallback = vi.fn();

            syncActions.subscribeToStatusUpdates(mockCallback);

            const handlerArgs = vi.mocked(createStatusUpdateHandler).mock.calls[0]?.[0];
            expect(handlerArgs?.onUpdate).toBe(mockCallback);
        });

        it("should pass dependency functions correctly", () => {
            const mockCallback = vi.fn();

            syncActions.subscribeToStatusUpdates(mockCallback);

            const handlerArgs = vi.mocked(createStatusUpdateHandler).mock.calls[0]?.[0];
            expect(handlerArgs?.getSites).toBe(mockDependencies.getSites);
            expect(handlerArgs?.setSites).toBe(mockDependencies.setSites);
            expect(typeof handlerArgs?.fullSyncFromBackend).toBe("function");
        });
    });

    describe("action logging", () => {
        it("should log all sync actions", async () => {
            const mockCallback = vi.fn();
            vi.mocked(SiteService.getSites).mockResolvedValue([mockSite]);

            await syncActions.syncSitesFromBackend();
            await syncActions.fullSyncFromBackend();
            syncActions.subscribeToStatusUpdates(mockCallback);
            syncActions.unsubscribeFromStatusUpdates();

            expect(logStoreAction).toHaveBeenCalledTimes(5);
            expect(logStoreAction).toHaveBeenNthCalledWith(1, "SitesStore", "syncSitesFromBackend", {
                message: "Sites synchronized from backend",
                sitesCount: 1,
                success: true,
            });
            expect(logStoreAction).toHaveBeenNthCalledWith(2, "SitesStore", "syncSitesFromBackend", {
                message: "Sites synchronized from backend",
                sitesCount: 1,
                success: true,
            }); // Called again by fullSyncFromBackend
            expect(logStoreAction).toHaveBeenNthCalledWith(3, "SitesStore", "fullSyncFromBackend", {
                message: "Full backend synchronization completed",
                success: true,
            });
            expect(logStoreAction).toHaveBeenNthCalledWith(4, "SitesStore", "subscribeToStatusUpdates", {
                message: "Successfully subscribed to status updates",
                subscribed: true,
                success: true,
            });
            expect(logStoreAction).toHaveBeenNthCalledWith(5, "SitesStore", "unsubscribeFromStatusUpdates", {
                message: "Successfully unsubscribed from status updates",
                success: true,
                unsubscribed: true,
            });
        });
    });

    describe("dependency integration", () => {
        it("should use getSites dependency correctly", () => {
            const mockCallback = vi.fn();

            syncActions.subscribeToStatusUpdates(mockCallback);

            const handlerArgs = vi.mocked(createStatusUpdateHandler).mock.calls[0]?.[0];
            const result = handlerArgs?.getSites();

            expect(result).toEqual([mockSite]);
            expect(mockDependencies.getSites).toHaveBeenCalledTimes(1);
        });

        it("should use setSites dependency correctly", async () => {
            const mockSites = [mockSite];
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.syncSitesFromBackend();

            expect(mockDependencies.setSites).toHaveBeenCalledWith(mockSites);
        });
    });

    describe("error handling", () => {
        it("should handle service errors without throwing", async () => {
            const error = new Error("Service error");
            vi.mocked(SiteService.getSites).mockRejectedValue(error);

            await expect(syncActions.syncSitesFromBackend()).resolves.toBeUndefined();
            await expect(syncActions.fullSyncFromBackend()).resolves.toBeUndefined();
        });
    });
});
