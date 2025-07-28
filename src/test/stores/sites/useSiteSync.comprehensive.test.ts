/**
 * Comprehensive tests for useSiteSync.ts
 * Targets 90%+ branch coverage for all site sync functions
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../../types";

// Mock all the dependencies
vi.mock("../error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            clearStoreError: vi.fn(),
            setStoreError: vi.fn(),
            setOperationLoading: vi.fn(),
        })),
    },
}));

vi.mock("../utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(async (operation) => {
        return await operation();
    }),
}));

vi.mock("../../../stores/sites/services/SiteService", () => ({
    SiteService: {
        getSites: vi.fn(),
    },
}));

vi.mock("./utils/statusUpdateHandler", () => ({
    StatusUpdateManager: vi.fn().mockImplementation(() => ({
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
    })),
}));

// Mock window.electronAPI
const mockElectronAPI = {
    stateSync: {
        onStateSyncEvent: vi.fn(),
    },
};

Object.defineProperty(global, "window", {
    value: {
        electronAPI: mockElectronAPI,
    },
    writable: true,
});

import { createSiteSyncActions } from "../../../stores/sites/useSiteSync";
import { SiteService } from "../../../stores/sites/services/SiteService";

describe("useSiteSync", () => {
    let mockDeps: any;
    let mockSites: Site[];
    let syncActions: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSites = [
            {
                identifier: "site-1",
                name: "Test Site 1",
                monitoring: true,
                monitors: [],
            },
        ];

        mockDeps = {
            getSites: vi.fn(() => mockSites),
            setSites: vi.fn(),
        };

        syncActions = createSiteSyncActions(mockDeps);
    });

    describe("subscribeToStatusUpdates", () => {
        it("should subscribe to status updates successfully", () => {
            const result = syncActions.subscribeToStatusUpdates();

            expect(result).toEqual(
                expect.objectContaining({
                    success: true,
                    subscribed: true,
                })
            );
        });
    });

    describe("subscribeToSyncEvents", () => {
        it("should subscribe to sync events successfully", () => {
            const mockCleanup = vi.fn();
            mockElectronAPI.stateSync.onStateSyncEvent.mockReturnValue(mockCleanup);

            const result = syncActions.subscribeToSyncEvents();

            expect(mockElectronAPI.stateSync.onStateSyncEvent).toHaveBeenCalledWith(expect.any(Function));
            expect(typeof result).toBe("function");
        });

        it("should handle bulk-sync events", () => {
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation((handler) => {
                eventHandler = handler;
                return vi.fn();
            });

            syncActions.subscribeToSyncEvents();

            const bulkSyncEvent = {
                action: "bulk-sync",
                sites: mockSites,
                source: "backend",
                timestamp: Date.now(),
            };

            eventHandler(bulkSyncEvent);

            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });

        it("should handle delete events", async () => {
            let eventHandler: any;
            vi.mocked(mockElectronAPI.stateSync.onStateSyncEvent).mockImplementation((handler) => {
                eventHandler = handler;
                return vi.fn();
            });

            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            syncActions.subscribeToSyncEvents();

            const deleteEvent = {
                action: "delete",
                siteIdentifier: "site-1",
                source: "backend",
                timestamp: Date.now(),
            };

            eventHandler(deleteEvent);

            // Should trigger syncSitesFromBackend
            await vi.waitFor(() => {
                expect(SiteService.getSites).toHaveBeenCalled();
            });
        });
    });

    describe("syncSitesFromBackend", () => {
        it("should sync sites from backend successfully", async () => {
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.syncSitesFromBackend();

            expect(SiteService.getSites).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });

        it("should handle sync errors", async () => {
            const error = new Error("Sync failed");
            vi.mocked(SiteService.getSites).mockRejectedValue(error);

            await expect(syncActions.syncSitesFromBackend()).rejects.toThrow("Sync failed");
        });
    });

    describe("unsubscribeFromStatusUpdates", () => {
        it("should unsubscribe from status updates successfully", () => {
            const result = syncActions.unsubscribeFromStatusUpdates();

            expect(result).toEqual({
                message: "Successfully unsubscribed from status updates",
                success: true,
                unsubscribed: true,
            });
        });
    });

    describe("Integration Tests", () => {
        it("should create independent instances with same dependencies", () => {
            const instance1 = createSiteSyncActions(mockDeps);
            const instance2 = createSiteSyncActions(mockDeps);

            expect(instance1).not.toBe(instance2);
            expect(typeof instance1.syncSitesFromBackend).toBe("function");
            expect(typeof instance2.syncSitesFromBackend).toBe("function");
        });

        it("should return all required action methods", () => {
            const actions = createSiteSyncActions(mockDeps);

            expect(actions).toHaveProperty("subscribeToStatusUpdates");
            expect(actions).toHaveProperty("subscribeToSyncEvents");
            expect(actions).toHaveProperty("syncSitesFromBackend");
            expect(actions).toHaveProperty("unsubscribeFromStatusUpdates");

            expect(typeof actions.subscribeToStatusUpdates).toBe("function");
            expect(typeof actions.subscribeToSyncEvents).toBe("function");
            expect(typeof actions.syncSitesFromBackend).toBe("function");
            expect(typeof actions.unsubscribeFromStatusUpdates).toBe("function");
        });
    });
});
