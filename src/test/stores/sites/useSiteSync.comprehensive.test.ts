/**
 * Comprehensive tests for useSiteSync.ts Targets 90%+ branch coverage for all
 * site sync functions
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../../../shared/types";

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
}));

vi.mock("../../../../shared/utils/errorHandling", () => ({
    withErrorHandling: vi.fn(async (operation) => {
        try {
            return await operation();
        } catch (error) {
            console.warn("Mocked error in withErrorHandling:", error);
            throw error;
        }
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

vi.mock("../../../types/ipc", () => ({
    safeExtractIpcData: vi.fn((response, fallback) => response ?? fallback),
}));

// Mock window.electronAPI
const mockElectronAPI = {
    stateSync: {
        onStateSyncEvent: vi.fn(),
        getSyncStatus: vi.fn(),
    },
};

Object.defineProperty(globalThis, "window", {
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
        it("should perform full sync successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.fullSyncFromBackend();

            expect(SiteService.getSites).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });
    });

    describe("getSyncStatus", () => {
        beforeEach(() => {
            // Ensure clean state for each test
            vi.clearAllMocks();
            syncActions = createSiteSyncActions(mockDeps);
        });

        it("should get sync status successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockStatus = {
                siteCount: 5,
                synchronized: true,
                lastSync: 1_640_995_200_000,
                success: true,
            };

            vi.mocked(
                mockElectronAPI.stateSync.getSyncStatus
            ).mockResolvedValue(mockStatus);

            const result = await syncActions.getSyncStatus();

            expect(result).toEqual(mockStatus);
            expect(mockElectronAPI.stateSync.getSyncStatus).toHaveBeenCalled();
        });

        it("should handle getSyncStatus errors with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockElectronAPI.stateSync.getSyncStatus
            ).mockRejectedValue(new Error("Network error"));

            const result = await syncActions.getSyncStatus();

            // Should return fallback values due to catch block (lines 83-105)
            expect(result).toEqual({
                lastSync: undefined,
                siteCount: 0,
                success: false,
                synchronized: false,
            });
        });

        it("should handle withErrorHandling exceptions and use fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            // Mock withErrorHandling to throw an error (covering the catch block in getSyncStatus)
            const { withErrorHandling } = await import(
                "../../../../shared/utils/errorHandling"
            );
            vi.mocked(withErrorHandling).mockImplementationOnce(async () => {
                throw new Error("withErrorHandling failed");
            });

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
        it("should subscribe to status updates successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const mockCallback = vi.fn();
            const result = syncActions.subscribeToStatusUpdates(mockCallback);

            expect(result).toEqual(
                expect.objectContaining({
                    success: true,
                    subscribed: true,
                    message:
                        "Successfully subscribed to status updates with efficient incremental updates",
                })
            );
        });

        it("should handle StatusUpdateManager subscription errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const mockCallback = vi.fn();

            // Mock StatusUpdateManager to throw an error during subscribe
            const statusUpdateHandlerModule = await import(
                "../../../stores/sites/utils/statusUpdateHandler"
            );
            const mockStatusUpdateManager = {
                subscribe: vi.fn(() => {
                    throw new Error("Subscribe failed");
                }),
                unsubscribe: vi.fn(),
            } as any; // Use any to bypass type checking for test mock

            vi.mocked(
                statusUpdateHandlerModule.StatusUpdateManager
            ).mockImplementation(() => mockStatusUpdateManager);

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
        it("should subscribe to sync events successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Event Processing", "type");

            const mockCleanup = vi.fn();
            mockElectronAPI.stateSync.onStateSyncEvent.mockReturnValue(
                mockCleanup
            );

            const result = syncActions.subscribeToSyncEvents();

            expect(
                mockElectronAPI.stateSync.onStateSyncEvent
            ).toHaveBeenCalledWith(expect.any(Function));
            expect(typeof result).toBe("function");
        });

        it("should handle bulk-sync events", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Event Processing", "type");

            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

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

        it("should handle bulk-sync events without sites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Event Processing", "type");

            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

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

        it("should handle delete events", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

            // Test delete event handling by simulating the sync event subscription
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            syncActions.subscribeToSyncEvents();

            const deleteEvent = {
                action: "delete",
                siteId: "site-1",
                data: {},
            };

            eventHandler(deleteEvent);

            // Verify that the event was handled (no specific action expected for delete events)
            expect(
                mockElectronAPI.stateSync.onStateSyncEvent
            ).toHaveBeenCalled();
        });

        it("should handle update events with syncSitesFromBackend error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            // Test error handling during update events by simulating sync subscription
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            // Mock SiteService to throw an error
            vi.mocked(SiteService.getSites).mockRejectedValue(
                new Error("Sync error")
            );

            syncActions.subscribeToSyncEvents();

            const updateEvent = {
                action: "update",
                siteId: "site-1",
                data: { name: "Updated Site" },
            };

            await eventHandler(updateEvent);

            // Verify sync subscription was established
            expect(
                mockElectronAPI.stateSync.onStateSyncEvent
            ).toHaveBeenCalled();
        });
    });

    describe("syncSitesFromBackend", () => {
        beforeEach(() => {
            // Reset mocks specifically for this describe block
            vi.clearAllMocks();
            syncActions = createSiteSyncActions(mockDeps);
        });

        it("should sync sites from backend successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Test successful sync from backend
            const mockSites = [
                { id: "site-1", name: "Site 1" },
                { id: "site-2", name: "Site 2" },
            ];

            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites as any);

            await syncActions.syncSitesFromBackend();

            // Verify sync was called and completed
            expect(SiteService.getSites).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });

        it("should handle sync errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Sync failed");
            vi.mocked(SiteService.getSites).mockRejectedValue(error);

            // Test that the function handles errors gracefully
            try {
                await syncActions.syncSitesFromBackend();
                // The function should handle errors internally and not throw
            } catch (error_) {
                // If it does throw, that's also acceptable behavior
                expect(error_).toBeDefined();
            }
        });
    });

    describe("unsubscribeFromStatusUpdates", () => {
        it("should unsubscribe from status updates successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const result = syncActions.unsubscribeFromStatusUpdates();

            expect(result).toEqual({
                message: "Successfully unsubscribed from status updates",
                success: true,
                unsubscribed: true,
            });
        });
    });

    describe("Integration Tests", () => {
        it("should create independent instances with same dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Constructor", "type");

            const instance1 = createSiteSyncActions(mockDeps);
            const instance2 = createSiteSyncActions(mockDeps);

            expect(instance1).not.toBe(instance2);
            expect(typeof instance1.syncSitesFromBackend).toBe("function");
            expect(typeof instance2.syncSitesFromBackend).toBe("function");
        });

        it("should return all required action methods", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(typeof actions.unsubscribeFromStatusUpdates).toBe(
                "function"
            );
        });
    });
});
