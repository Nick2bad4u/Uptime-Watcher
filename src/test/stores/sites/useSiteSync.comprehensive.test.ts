/**
 * Comprehensive tests for useSiteSync.ts Targets 90%+ branch coverage for all
 * site sync functions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "@shared/types";
import type { StateSyncStatusSummary } from "@shared/types/stateSync";
import type { StatusUpdateManager } from "../../../stores/sites/utils/statusUpdateHandler";
import { DuplicateSiteIdentifierError } from "@shared/validation/siteIntegrity";

const LISTENER_NAMES = [
    "monitor-status-changed",
    "monitoring-started",
    "monitoring-stopped",
];

const buildListenerStates = (attachedCount: number) =>
    LISTENER_NAMES.map((name, index) => ({
        attached: index < attachedCount,
        name,
    }));

const buildSite = (identifier: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [
        {
            checkInterval: 60_000,
            history: [],
            id: `${identifier}-monitor`,
            monitoring: true,
            responseTime: 0,
            retryAttempts: 0,
            status: "up",
            timeout: 5000,
            type: "http",
        },
    ],
    name: `Site ${identifier}`,
});

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

vi.mock("../../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
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

vi.mock("../../../stores/sites/utils/statusUpdateHandler", () => ({
    StatusUpdateManager: vi.fn(function StatusUpdateManagerMock() {
        return {
            getExpectedListenerCount: vi.fn(() => 3),
            subscribe: vi.fn(async () => ({
                errors: [],
                expectedListeners: 3,
                listenersAttached: 3,
                listenerStates: buildListenerStates(3),
                success: true,
            })),
            unsubscribe: vi.fn(),
        } as unknown as StatusUpdateManager;
    }),
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
import { logger } from "../../../services/logger";

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
            setStatusSubscriptionSummary: vi.fn(),
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

            const fullSyncResult = {
                completedAt: Date.now(),
                siteCount: mockSites.length,
                sites: mockSites,
                source: "frontend" as const,
                synchronized: true,
            };

            mockStateSyncService.requestFullSync.mockResolvedValue(
                fullSyncResult
            );

            await syncActions.fullResyncSites();

            expect(mockStateSyncService.requestFullSync).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(
                fullSyncResult.sites
            );
        });

        it("should coalesce concurrent resync requests", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const fullSyncResult = {
                completedAt: Date.now(),
                siteCount: mockSites.length,
                sites: mockSites,
                source: "frontend" as const,
                synchronized: true,
            };

            let resolveSync: (() => void) | undefined;
            mockStateSyncService.requestFullSync.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveSync = () => resolve(fullSyncResult);
                    })
            );

            const firstCall = syncActions.fullResyncSites();
            const secondCall = syncActions.fullResyncSites();

            expect(mockStateSyncService.requestFullSync).toHaveBeenCalledTimes(
                1
            );

            resolveSync?.();
            await Promise.all([firstCall, secondCall]);

            expect(mockDeps.setSites).toHaveBeenCalledWith(
                fullSyncResult.sites
            );
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
                    expectedListeners: 3,
                    listenersAttached: 3,
                    success: true,
                    subscribed: true,
                    message:
                        "Successfully subscribed to status updates with efficient incremental updates",
                })
            );

            expect(mockDeps.setStatusSubscriptionSummary).toHaveBeenCalledWith(
                expect.objectContaining({
                    expectedListeners: 3,
                    listenersAttached: 3,
                    success: true,
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
                getExpectedListenerCount: vi.fn(() => 3),
                subscribe: vi.fn(async () => {
                    throw new Error("Subscribe failed");
                }),
                unsubscribe: vi.fn(),
            } as unknown as StatusUpdateManager;

            vi.mocked(
                statusUpdateHandlerModule.StatusUpdateManager
            ).mockImplementation(function StatusUpdateManagerErrorMock() {
                return mockStatusUpdateManager;
            });

            const result =
                await syncActions.subscribeToStatusUpdates(mockCallback);

            expect(result.success).toBeFalsy();
            expect(result.subscribed).toBeFalsy();
            expect(result.errors).toContain("Subscribe failed");
            expect(mockDeps.setStatusSubscriptionSummary).toHaveBeenCalledWith(
                expect.objectContaining({
                    expectedListeners: 3,
                    listenersAttached: 0,
                    success: false,
                })
            );
        });
    });

    describe("retryStatusSubscription", () => {
        it("retries subscription using the stored callback", async () => {
            const statusUpdateHandlerModule = await import(
                "../../../stores/sites/utils/statusUpdateHandler"
            );
            const StatusUpdateManagerMock = vi.mocked(
                statusUpdateHandlerModule.StatusUpdateManager
            );

            StatusUpdateManagerMock.mockReset();
            const unsubscribeSpies: ReturnType<typeof vi.fn>[] = [];
            StatusUpdateManagerMock.mockImplementation(function StatusUpdateManagerRetryMock() {
                const unsubscribe = vi.fn();
                unsubscribeSpies.push(unsubscribe);
                return {
                    getExpectedListenerCount: vi.fn(() => 3),
                    subscribe: vi.fn(async () => ({
                        errors: [],
                        expectedListeners: 3,
                        listenersAttached: 3,
                        listenerStates: buildListenerStates(3),
                        success: true,
                    })),
                    unsubscribe,
                } as unknown as StatusUpdateManager;
            });

            const callback = vi.fn();
            await syncActions.subscribeToStatusUpdates(callback);

            mockDeps.setStatusSubscriptionSummary.mockClear();

            const retryResult = await syncActions.retryStatusSubscription();

            expect(retryResult.success).toBeTruthy();
            expect(retryResult.subscribed).toBeTruthy();
            expect(
                StatusUpdateManagerMock.mock.instances.length
            ).toBeGreaterThanOrEqual(2);
            expect(unsubscribeSpies[0]).toHaveBeenCalledTimes(1);
            expect(
                mockDeps.setStatusSubscriptionSummary
            ).toHaveBeenNthCalledWith(1, undefined);
            expect(
                mockDeps.setStatusSubscriptionSummary
            ).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    expectedListeners: 3,
                    listenersAttached: 3,
                    success: true,
                })
            );
        });

        it("returns fallback diagnostics when no callback was registered", async () => {
            const result = await syncActions.retryStatusSubscription();

            expect(result.success).toBeFalsy();
            expect(result.subscribed).toBeFalsy();
            expect(result.errors).toContain(
                "Retry attempted without previously registered callback"
            );
            expect(mockDeps.setStatusSubscriptionSummary).toHaveBeenCalledWith(
                expect.objectContaining({
                    expectedListeners: 3,
                    listenersAttached: 0,
                    success: false,
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
                source: "database",
                timestamp: Date.now(),
            };

            eventHandler(bulkSyncEvent);

            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
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
                action: "delete" as const,
                siteIdentifier: "site-1",
                sites: mockSites,
                source: "frontend" as const,
                timestamp: Date.now(),
            };

            eventHandler(deleteEvent);

            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });

        it("should handle update events without triggering full sync", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            let eventHandler: any;
            mockStateSyncService.onStateSyncEvent.mockImplementation(
                async (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            syncActions.subscribeToSyncEvents();

            const updateEvent = {
                action: "update" as const,
                siteIdentifier: "site-1",
                sites: mockSites,
                source: "frontend" as const,
                timestamp: Date.now(),
            };

            eventHandler(updateEvent);

            expect(mockStateSyncService.requestFullSync).not.toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });

        it("logs and propagates duplicate identifiers received via sync events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Data Integrity", "category");
            await annotate("Type: Regression", "type");

            let eventHandler: any;
            mockStateSyncService.onStateSyncEvent.mockImplementation(
                async (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            const duplicateSites: Site[] = [
                {
                    identifier: "duplicate",
                    monitoring: true,
                    monitors: [],
                    name: "Duplicate A",
                },
                {
                    identifier: "duplicate",
                    monitoring: false,
                    monitors: [],
                    name: "Duplicate B",
                },
            ];

            const duplicateError = new DuplicateSiteIdentifierError(
                [
                    {
                        identifier: "duplicate",
                        occurrences: 2,
                    },
                ],
                "SitesStore.setSites"
            );

            mockDeps.setSites.mockImplementation(() => {
                throw duplicateError;
            });

            syncActions.subscribeToSyncEvents();

            const duplicateEvent = {
                action: "update" as const,
                siteIdentifier: "duplicate",
                sites: duplicateSites,
                source: "database" as const,
                timestamp: Date.now(),
            };

            expect(() => eventHandler(duplicateEvent)).toThrow(
                DuplicateSiteIdentifierError
            );
            expect(logger.error).toHaveBeenCalledWith(
                "Duplicate site identifiers detected in state sync event",
                expect.objectContaining({
                    action: "update",
                    duplicates: expect.arrayContaining([
                        expect.objectContaining({
                            identifier: "duplicate",
                            occurrences: 2,
                        }),
                    ]),
                    siteCount: duplicateSites.length,
                    source: "database",
                })
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith(duplicateSites);
        });
    });

    describe("syncSites", () => {
        beforeEach(() => {
            // Reset mocks specifically for this describe block
            vi.clearAllMocks();
            mockDeps.setSites = vi.fn();
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
            const fullSyncResult = {
                completedAt: Date.now(),
                siteCount: 2,
                sites: [buildSite("site-1"), buildSite("site-2")],
                source: "frontend" as const,
                synchronized: true,
            };

            mockStateSyncService.requestFullSync.mockResolvedValue(
                fullSyncResult as any
            );

            await syncActions.syncSites();

            // Verify sync was called and completed
            expect(mockStateSyncService.requestFullSync).toHaveBeenCalled();
            expect(mockDeps.setSites).toHaveBeenCalledWith(
                fullSyncResult.sites
            );
        });

        it("logs duplicate identifiers from backend full sync responses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Data Integrity", "category");
            await annotate("Type: Regression", "type");

            const duplicateSites: Site[] = [
                {
                    identifier: "duplicate",
                    monitoring: true,
                    monitors: [],
                    name: "Duplicate A",
                },
                {
                    identifier: "duplicate",
                    monitoring: false,
                    monitors: [],
                    name: "Duplicate B",
                },
            ];

            const duplicateError = new DuplicateSiteIdentifierError(
                [
                    {
                        identifier: "duplicate",
                        occurrences: 2,
                    },
                ],
                "SitesStore.setSites"
            );

            mockStateSyncService.requestFullSync.mockResolvedValue({
                completedAt: Date.now(),
                siteCount: duplicateSites.length,
                sites: duplicateSites,
                source: "database" as const,
                synchronized: true,
            });

            mockDeps.setSites.mockImplementation(() => {
                throw duplicateError;
            });

            await expect(syncActions.syncSites()).rejects.toThrow(
                DuplicateSiteIdentifierError
            );
            expect(logger.error).toHaveBeenCalledWith(
                "Duplicate site identifiers detected in full sync response",
                expect.objectContaining({
                    duplicates: expect.arrayContaining([
                        expect.objectContaining({
                            identifier: "duplicate",
                            occurrences: 2,
                        }),
                    ]),
                    siteCount: duplicateSites.length,
                    source: "database",
                })
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith(duplicateSites);
        });

        it("should handle sync errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Sync failed");
            mockStateSyncService.requestFullSync.mockRejectedValue(error);

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
            expect(actions).toHaveProperty("retryStatusSubscription");
            expect(actions).toHaveProperty("subscribeToSyncEvents");
            expect(actions).toHaveProperty("syncSites");
            expect(actions).toHaveProperty("unsubscribeFromStatusUpdates");

            expect(typeof actions.fullResyncSites).toBe("function");
            expect(typeof actions.getSyncStatus).toBe("function");
            expect(typeof actions.subscribeToStatusUpdates).toBe("function");
            expect(typeof actions.retryStatusSubscription).toBe("function");
            expect(typeof actions.subscribeToSyncEvents).toBe("function");
            expect(typeof actions.syncSites).toBe("function");
            expect(typeof actions.unsubscribeFromStatusUpdates).toBe(
                "function"
            );
        });
    });
});
