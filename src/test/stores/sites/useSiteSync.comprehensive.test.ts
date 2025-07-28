/**
 * Comprehensive tests for useSiteSync.ts
 * Targets 90%+ branch coverage for all site sync functions
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../../types";

// Mock all the dependencies
vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            clearStoreError: vi.fn(),
            setStoreError: vi.fn(),
            setOperationLoading: vi.fn(),
        })),
    },
}));

vi.mock("../../../stores/utils", () => ({
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

vi.mock("../../../stores/sites/utils/statusUpdateHandler", () => ({
    StatusUpdateManager: vi.fn().mockImplementation(() => ({
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
    })),
}));

// Mock window.electronAPI
const mockElectronAPI = {
    stateSync: {
        onStateSyncEvent: vi.fn(),
        getSyncStatus: vi.fn(),
    },
};

Object.defineProperty(global, "window", {
    value: {
        electronAPI: mockElectronAPI,
    },
    writable: true,
});

// Import the modules after mocking
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

    describe("fullSyncFromBackend", () => {
        it("should perform full sync successfully", async () => {
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.fullSyncFromBackend();

            expect(SiteService.getSites).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });
    });

    describe("getSyncStatus", () => {
        it("should get sync status successfully", async () => {
            const mockStatus = {
                siteCount: 5,
                synchronized: true,
                lastSync: 1640995200000,
                success: true,
            };

            vi.mocked(mockElectronAPI.stateSync.getSyncStatus).mockResolvedValue(mockStatus);

            const result = await syncActions.getSyncStatus();

            expect(result).toEqual(mockStatus);
            expect(mockElectronAPI.stateSync.getSyncStatus).toHaveBeenCalled();
        });

        it("should handle getSyncStatus errors with fallback", async () => {
            // Mock withErrorHandling to simulate an error and use the fallback
            const { withErrorHandling } = await import("../../../stores/utils");
            vi.mocked(withErrorHandling).mockImplementation(async (operation, handlers) => {
                try {
                    return await operation();
                } catch (error) {
                    throw error;
                }
            });

            vi.mocked(mockElectronAPI.stateSync.getSyncStatus).mockRejectedValue(new Error("Network error"));

            const result = await syncActions.getSyncStatus();

            // Should return fallback values due to catch block (lines 83-105)
            expect(result).toEqual({
                lastSync: undefined,
                siteCount: 0,
                success: false,
                synchronized: false,
            });
        });

        it("should handle withErrorHandling exceptions and use fallback", async () => {
            // Mock withErrorHandling to throw an error (covering the catch block in getSyncStatus)
            const { withErrorHandling } = await import("../../../stores/utils");
            vi.mocked(withErrorHandling).mockRejectedValue(new Error("withErrorHandling failed"));

            const result = await syncActions.getSyncStatus();

            // Should use fallback values when withErrorHandling throws
            expect(result).toEqual({
                lastSync: undefined,
                siteCount: 0,
                success: false,
                synchronized: false,
            });
        });
    });

    describe("subscribeToStatusUpdates", () => {
        it("should subscribe to status updates successfully", () => {
            const mockCallback = vi.fn();
            const result = syncActions.subscribeToStatusUpdates(mockCallback);

            expect(result).toEqual(
                expect.objectContaining({
                    success: true,
                    subscribed: true,
                    message: "Successfully subscribed to status updates with efficient incremental updates",
                })
            );
        });

        it("should handle StatusUpdateManager subscription errors", async () => {
            const mockCallback = vi.fn();
            
            // Mock StatusUpdateManager to throw an error during subscribe
            const statusUpdateHandlerModule = await import("./utils/statusUpdateHandler");
            const mockStatusUpdateManager = {
                subscribe: vi.fn(() => {
                    throw new Error("Subscribe failed");
                }),
                unsubscribe: vi.fn(),
            };
            
            vi.mocked(statusUpdateHandlerModule.StatusUpdateManager).mockImplementation(() => mockStatusUpdateManager);

            // Should still return success even if subscribe throws (error is caught and logged)
            const result = syncActions.subscribeToStatusUpdates(mockCallback);

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

        it("should handle bulk-sync events without sites", () => {
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation((handler) => {
                eventHandler = handler;
                return vi.fn();
            });

            syncActions.subscribeToSyncEvents();

            const bulkSyncEvent = {
                action: "bulk-sync",
                sites: undefined, // Test case where sites is undefined
                source: "backend",
                timestamp: Date.now(),
            };

            eventHandler(bulkSyncEvent);

            // setSites should not be called when sites is undefined
            expect(mockDeps.setSites).not.toHaveBeenCalled();
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

        it("should handle update events with syncSitesFromBackend error", async () => {
            let eventHandler: any;
            vi.mocked(mockElectronAPI.stateSync.onStateSyncEvent).mockImplementation((handler) => {
                eventHandler = handler;
                return vi.fn();
            });

            // Mock syncSitesFromBackend to throw an error to cover line 158
            vi.mocked(SiteService.getSites).mockRejectedValue(new Error("Sync error"));

            syncActions.subscribeToSyncEvents();

            const updateEvent = {
                action: "update",
                siteIdentifier: "site-1",
                source: "backend",
                timestamp: Date.now(),
            };

            // This should trigger the catch block in line 158 of useSiteSync.ts
            eventHandler(updateEvent);

            // Should trigger syncSitesFromBackend and handle the error
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

            expect(actions).toHaveProperty("fullSyncFromBackend");
            expect(actions).toHaveProperty("getSyncStatus");
            expect(actions).toHaveProperty("subscribeToStatusUpdates");
            expect(actions).toHaveProperty("subscribeToSyncEvents");
            expect(actions).toHaveProperty("syncSitesFromBackend");
            expect(actions).toHaveProperty("unsubscribeFromStatusUpdates");

            expect(typeof actions.fullSyncFromBackend).toBe("function");
            expect(typeof actions.getSyncStatus).toBe("function");
            expect(typeof actions.subscribeToStatusUpdates).toBe("function");
            expect(typeof actions.subscribeToSyncEvents).toBe("function");
            expect(typeof actions.syncSitesFromBackend).toBe("function");
            expect(typeof actions.unsubscribeFromStatusUpdates).toBe("function");
        });
    });
});
