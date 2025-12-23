/**
 * 100% line coverage test for useSiteSync.ts Targets all uncovered lines
 * specifically identified by coverage analysis
 */

import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { Site } from "@shared/types";
import type { StatusUpdateManager } from "../../../stores/sites/utils/statusUpdateHandler";
import { createMockFunction } from "../../utils/mockFactories";

const LISTENER_NAMES = [
    "monitor:status-changed",
    "monitor:check-completed",
    "monitoring:started",
    "monitoring:stopped",
];

const buildSite = (identifier: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [],
    name: `Site ${identifier}`,
});

const buildListenerStates = (attachedCount: number) =>
    LISTENER_NAMES.map((name, index) => ({
        attached: index < attachedCount,
        name,
    }));

// Mock all dependencies
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
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))
    ),
    withErrorHandling: vi.fn(async (operation) => await operation()),
    withUtilityErrorHandling: vi.fn(),
    convertError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))
    ),
}));

vi.mock("../../../stores/sites/utils/statusUpdateHandler", () => ({
    StatusUpdateManager: vi.fn(function StatusUpdateManagerMock() {
        return {
            subscribe: vi.fn(async () => ({
                errors: [],
                expectedListeners: LISTENER_NAMES.length,
                listenersAttached: LISTENER_NAMES.length,
                listenerStates: buildListenerStates(LISTENER_NAMES.length),
                success: true,
            })),
            unsubscribe: vi.fn(),
        } as unknown as StatusUpdateManager;
    }),
}));

vi.mock("../../../types/ipc", () => ({
    safeExtractIpcData: vi.fn((response, fallback) => response ?? fallback),
}));

vi.mock("../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock("../../../utils/errorHandling", () => ({
    ensureError: vi.fn((error) => error),
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

// Mock window.electronAPI
Object.defineProperty(globalThis, "window", {
    value: {
        electronAPI: {},
    },
    writable: true,
});

// Import after mocking
import { createSiteSyncActions } from "../../../stores/sites/useSiteSync";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { withErrorHandling } from "@shared/utils/errorHandling";
import { logger } from "../../../services/logger";

describe("useSiteSync - Line Coverage Completion", () => {
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
            onSiteDelta: vi.fn(),
        };

        syncActions = createSiteSyncActions(mockDeps);

        // `useSiteSync` stores the StatusUpdateManager in a module-level
        // singleton. Reset it between tests to avoid mock leakage.
        syncActions.unsubscribeFromStatusUpdates();
        vi.clearAllMocks();
    });

    describe("Lines 224-230: getSyncStatus error handling", () => {
        it("should return fallback status when API call fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const mockErrorStore = {
                clearStoreError: vi.fn(),
                setStoreError: vi.fn(),
                setOperationLoading: vi.fn(),
            };

            vi.mocked(useErrorStore.getState).mockReturnValue(
                mockErrorStore as any
            );

            vi.mocked(withErrorHandling).mockImplementation(
                async (operation) => await operation()
            );

            mockStateSyncService.getSyncStatus.mockRejectedValue(
                new Error("status fetch failed")
            );

            const result = await syncActions.getSyncStatus();

            expect(result).toEqual({
                lastSyncAt: null,
                siteCount: 0,
                source: "frontend",
                synchronized: false,
            });
            expect(mockErrorStore.clearStoreError).not.toHaveBeenCalled();
            expect(mockErrorStore.setStoreError).not.toHaveBeenCalled();
            expect(mockErrorStore.setOperationLoading).not.toHaveBeenCalled();
        });
    });

    describe("Line 262: Logger error in subscribeToStatusUpdates", () => {
        it("returns fallback diagnostics when called without prior subscription", async () => {
            const result = await syncActions.retryStatusSubscription();

            expect(result.success).toBeFalsy();
            expect(result.subscribed).toBeFalsy();
            expect(result.errors).toContain(
                "Retry attempted without previously registered callback"
            );
            expect(mockDeps.setStatusSubscriptionSummary).toHaveBeenCalledWith(
                expect.objectContaining({
                    expectedListeners: LISTENER_NAMES.length,
                    listenersAttached: 0,
                    success: false,
                })
            );
        });

        it("clears previous diagnostics before re-subscribing", async () => {
            const statusUpdateHandlerModule =
                await import("../../../stores/sites/utils/statusUpdateHandler");
            const StatusUpdateManagerMock = vi.mocked(
                statusUpdateHandlerModule.StatusUpdateManager
            );

            StatusUpdateManagerMock.mockReset();
            const unsubscribeSpies: Mock<() => void>[] = [];
            StatusUpdateManagerMock.mockImplementation(
                function StatusUpdateManagerRetryMock() {
                    const unsubscribe = createMockFunction<() => void>();
                    unsubscribeSpies.push(unsubscribe);
                    return {
                        getExpectedListenerCount: vi.fn(
                            () => LISTENER_NAMES.length
                        ),
                        subscribe: vi.fn(async () => ({
                            errors: [],
                            expectedListeners: LISTENER_NAMES.length,
                            listenersAttached: LISTENER_NAMES.length,
                            listenerStates: buildListenerStates(
                                LISTENER_NAMES.length
                            ),
                            success: true,
                        })),
                        unsubscribe,
                    } as unknown as StatusUpdateManager;
                }
            );

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
                    expectedListeners: LISTENER_NAMES.length,
                    listenersAttached: LISTENER_NAMES.length,
                    success: true,
                })
            );
        });

        it("should log error when StatusUpdateManager.subscribe throws", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const mockCallback = vi.fn();
            const testError = new Error("Subscribe failed");

            // Mock StatusUpdateManager to throw during subscribe
            const statusUpdateHandlerModule =
                await import("../../../stores/sites/utils/statusUpdateHandler");
            const mockStatusUpdateManager = {
                getExpectedListenerCount: vi.fn(() => LISTENER_NAMES.length),
                subscribe: vi.fn(async () => {
                    throw testError;
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

            // Verify line 262: logger.error was called
            expect(logger.error).toHaveBeenCalledWith(
                "Status update subscription threw an exception",
                testError
            );

            expect(result.success).toBeFalsy();
            expect(result.errors).toContain("Subscribe failed");
            expect(mockDeps.setStatusSubscriptionSummary).toHaveBeenCalledWith(
                expect.objectContaining({
                    expectedListeners: LISTENER_NAMES.length,
                    listenersAttached: 0,
                    success: false,
                })
            );
        });
    });

    describe("Lines 298-307: Delete/update event handling", () => {
        it("should handle delete event and call syncSites (line 300)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

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
                sites: [],
                source: "frontend" as const,
                timestamp: Date.now(),
            };

            // Trigger delete event (line 296-297)
            mockDeps.getSites.mockReturnValueOnce([buildSite("site-1")]);
            eventHandler(deleteEvent);

            expect(mockDeps.setSites).toHaveBeenCalledWith([]);
        });

        it("should handle update event and apply provided snapshot", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

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
                sites: [
                    {
                        ...buildSite("site-1"),
                        name: "Updated Site 1",
                    },
                ],
                source: "frontend" as const,
                timestamp: Date.now(),
            };

            // Trigger update event (line 296-297)
            mockDeps.getSites.mockReturnValueOnce([buildSite("site-1")]);
            eventHandler(updateEvent);

            expect(mockDeps.setSites).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: "site-1",
                        name: "Updated Site 1",
                    }),
                ])
            );
            expect(mockStateSyncService.requestFullSync).not.toHaveBeenCalled();
        });

        it("should log error when event snapshot missing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
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

            const deleteEvent = {
                action: "delete" as const,
                siteIdentifier: "site-1",
                sites: undefined,
                source: "frontend" as const,
                timestamp: Date.now(),
            };

            eventHandler(deleteEvent);

            expect(logger.error).toHaveBeenCalled();
            expect(mockDeps.setSites).not.toHaveBeenCalled();
        });
    });

    describe("Lines 335-341: syncSites error handlers", () => {
        it("should call clearError, setError, and setLoading handlers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const mockErrorStore = {
                clearStoreError: vi.fn(),
                setStoreError: vi.fn(),
                setOperationLoading: vi.fn(),
            };

            vi.mocked(useErrorStore.getState).mockReturnValue(
                mockErrorStore as any
            );

            // Mock withErrorHandling to call the handlers
            vi.mocked(withErrorHandling).mockImplementationOnce(
                async (operation, handlers) => {
                    // Call all the handlers to cover lines 335-341
                    const frontendHandlers = handlers as any;
                    if (frontendHandlers?.clearError)
                        frontendHandlers.clearError();
                    if (frontendHandlers?.setError)
                        frontendHandlers.setError(new Error("test"));
                    if (frontendHandlers?.setLoading)
                        frontendHandlers.setLoading(true);
                    if (frontendHandlers?.setLoading)
                        frontendHandlers.setLoading(false);

                    return await operation();
                }
            );

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

            await syncActions.syncSites();

            // Verify the specific error handlers were called (lines 335-341)
            expect(mockErrorStore.clearStoreError).toHaveBeenCalledWith(
                "sites-sync"
            );
            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "sites-sync",
                expect.any(Error)
            );
            expect(mockErrorStore.setOperationLoading).toHaveBeenCalledWith(
                "syncSites",
                true
            );
            expect(mockErrorStore.setOperationLoading).toHaveBeenCalledWith(
                "syncSites",
                false
            );
        });
    });

    describe("Additional edge cases", () => {
        it("should handle bulk-sync with sites", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

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

            mockDeps.getSites.mockReturnValueOnce([]);
            eventHandler(bulkSyncEvent);

            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });

        it("should handle unsubscribe with existing manager", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteSync.line-coverage", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // First subscribe to create a manager
            const mockCallback = vi.fn();
            await syncActions.subscribeToStatusUpdates(mockCallback);

            // Then unsubscribe
            const result = syncActions.unsubscribeFromStatusUpdates();

            expect(result).toEqual({
                message: "Successfully unsubscribed from status updates",
                success: true,
                unsubscribed: true,
            });
        });
    });
});
