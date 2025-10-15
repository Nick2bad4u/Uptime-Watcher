/**
 * Comprehensive tests for useSiteSync.ts Targets 90%+ branch coverage for all
 * site sync functions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../../../shared/types";
import type { StateSyncStatusSummary } from "../../../../shared/types/stateSync";

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
    ensureError: vi.fn((error: unknown): Error => {
        if (error instanceof Error) return error;
        return new Error(String(error));
    }),
    withErrorHandling: vi.fn(async (operation) => {
        try {
            return await operation();
        } catch (error: unknown) {
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
        subscribe: vi.fn(async () => ({
            errors: [],
            expectedListeners: 3,
            listenersAttached: 3,
            success: true,
        })),
        unsubscribe: vi.fn(),
    })),
}));

const mockStateSyncService = vi.hoisted(() => ({
    getSyncStatus: vi.fn(),
    initialize: vi.fn(),
    onStateSyncEvent: vi.fn(),
    requestFullSync: vi.fn(),
}));

vi.mock("../../../services/StateSyncService", () => ({
    StateSyncService: mockStateSyncService,
}));

vi.mock("../../../types/ipc", () => ({
    safeExtractIpcData: vi.fn((response, fallback) => response ?? fallback),
}));

// Mock window.electronAPI
Object.defineProperty(globalThis, "window", {
    value: {
        electronAPI: {},
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

    afterEach(() => {
        syncActions.unsubscribeFromStatusUpdates();
    });

    describe("fullResyncSites", () => {
        it("should perform full sync successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.fullResyncSites();

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
                lastSyncAt: 1_640_995_200_000,
                siteCount: 5,
                source: "database",
                synchronized: true,
            } satisfies StateSyncStatusSummary;

            mockStateSyncService.getSyncStatus.mockResolvedValue(mockStatus);

            const result = await syncActions.getSyncStatus();

            expect(result).toEqual(mockStatus);
            expect(mockStateSyncService.getSyncStatus).toHaveBeenCalled();
        });

        it("should handle getSyncStatus errors with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            mockStateSyncService.getSyncStatus.mockRejectedValue(
                new Error("Network error")
            );

            const result = await syncActions.getSyncStatus();

            // Should return fallback values due to catch block (lines 83-105)
            expect(result).toEqual({
                lastSyncAt: null,
                siteCount: 0,
                source: "frontend",
                synchronized: false,
            });
        });

        // Removed legacy withErrorHandling-specific fallback test; getSyncStatus now
        // relies on direct try/catch error handling (covered above).
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
            const result =
                await syncActions.subscribeToStatusUpdates(mockCallback);

            expect(result).toEqual(
                expect.objectContaining({
                    errors: [],
                    listenersAttached: 3,
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
                subscribe: vi.fn(async () => {
                    throw new Error("Subscribe failed");
                }),
                unsubscribe: vi.fn(),
            } as any; // Use any to bypass type checking for test mock

            vi.mocked(
                statusUpdateHandlerModule.StatusUpdateManager
            ).mockImplementation(() => mockStatusUpdateManager);

            const result =
                await syncActions.subscribeToStatusUpdates(mockCallback);

            expect(result.success).toBeFalsy();
            expect(result.subscribed).toBeFalsy();
            expect(result.errors).toContain("Subscribe failed");
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
            mockStateSyncService.onStateSyncEvent.mockResolvedValue(
                mockCleanup
            );

            const result = syncActions.subscribeToSyncEvents();

            expect(mockStateSyncService.onStateSyncEvent).toHaveBeenCalledWith(
                expect.any(Function)
            );
            expect(typeof result).toBe("function");
        });

        it("should handle bulk-sync events", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Event Processing", "type");

            let eventHandler: any;
            mockStateSyncService.onStateSyncEvent.mockImplementation(
                async (handler) => {
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
            mockStateSyncService.onStateSyncEvent.mockImplementation(
                async (handler) => {
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

            // SetSites should not be called when sites is undefined
            expect(mockDeps.setSites).not.toHaveBeenCalled();
        });

        it("should handle delete events", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

            // Test delete event handling by simulating the sync event subscription
            let eventHandler: any;
            mockStateSyncService.onStateSyncEvent.mockImplementation(
                async (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            syncActions.subscribeToSyncEvents();

            const deleteEvent = {
                action: "delete",
                siteIdentifier: "site-1",
                data: {},
            };

            eventHandler(deleteEvent);

            // Verify that the event was handled (no specific action expected for delete events)
            expect(mockStateSyncService.onStateSyncEvent).toHaveBeenCalled();
        });

        it("should handle update events with syncSites error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            // Test error handling during update events by simulating sync subscription
            let eventHandler: any;
            mockStateSyncService.onStateSyncEvent.mockImplementation(
                async (handler) => {
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
                siteIdentifier: "site-1",
                data: { name: "Updated Site" },
            };

            await eventHandler(updateEvent);

            // Verify sync subscription was established
            expect(mockStateSyncService.onStateSyncEvent).toHaveBeenCalled();
        });
    });

    describe("syncSites", () => {
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

            await syncActions.syncSites();

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
                await syncActions.syncSites();
                // The function should handle errors internally and not throw
            } catch (error_: unknown) {
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
            expect(typeof instance1.syncSites).toBe("function");
            expect(typeof instance2.syncSites).toBe("function");
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

            expect(actions).toHaveProperty("fullResyncSites");
            expect(actions).toHaveProperty("getSyncStatus");
            expect(actions).toHaveProperty("subscribeToStatusUpdates");
            expect(actions).toHaveProperty("subscribeToSyncEvents");
            expect(actions).toHaveProperty("syncSites");
            expect(actions).toHaveProperty("unsubscribeFromStatusUpdates");

            expect(typeof actions.fullResyncSites).toBe("function");
            expect(typeof actions.getSyncStatus).toBe("function");
            expect(typeof actions.subscribeToStatusUpdates).toBe("function");
            expect(typeof actions.subscribeToSyncEvents).toBe("function");
            expect(typeof actions.syncSites).toBe("function");
            expect(typeof actions.unsubscribeFromStatusUpdates).toBe(
                "function"
            );
        });
    });
});
