/**
 * Comprehensive tests for Frontend Cache Synchronization utilities. Tests cache
 * invalidation event handling and frontend cache clearing.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { logger } from "../../services/logger";
import { ensureError } from "@shared/utils/errorHandling";
import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
} from "@shared/types";
import {
    CACHE_INVALIDATION_REASON,
    CACHE_INVALIDATION_REASON_VALUES,
    CACHE_INVALIDATION_TYPE,
    CACHE_INVALIDATION_TYPE_VALUES,
    type CacheInvalidatedEventData,
} from "@shared/types/events";
import { clearMonitorTypeCache } from "../../utils/monitorTypeHelper";

// Mock dependencies
vi.mock("../../services/logger");
vi.mock("@shared/utils/errorHandling", () => ({
    ensureError: vi.fn(),
    convertError: vi.fn(),
    withErrorHandling: vi.fn(),
    withUtilityErrorHandling: vi.fn(),
}));
vi.mock("../../utils/monitorTypeHelper", () => ({
    clearMonitorTypeCache: vi.fn(), // <-- ensure this is a real mock function that records arguments
}));

type AsyncStoreOperation = () => Promise<void>;

const monitorStoreState: { refreshMonitorTypes: AsyncStoreOperation } = {
    refreshMonitorTypes: async () => undefined,
};

const sitesStoreState: { fullResyncSites: AsyncStoreOperation } = {
    fullResyncSites: async () => undefined,
};

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    __esModule: true,
    useMonitorTypesStore: {
        getState: () => monitorStoreState,
    },
}));

vi.mock("../../stores/sites/useSitesStore", () => ({
    __esModule: true,
    useSitesStore: {
        getState: () => sitesStoreState,
    },
}));

const noopCleanup = (): void => {};

const createSubscriptionMock = () =>
    vi.fn(async (_callback: unknown) => noopCleanup);

const mockEventsService = {
    initialize: vi.fn(async () => undefined),
    onCacheInvalidated: createSubscriptionMock(),
    onMonitorCheckCompleted: createSubscriptionMock(),
    onHistoryLimitUpdated: createSubscriptionMock(),
    onMonitorDown: createSubscriptionMock(),
    onMonitoringStarted: createSubscriptionMock(),
    onMonitoringStopped: createSubscriptionMock(),
    onMonitorStatusChanged: createSubscriptionMock(),
    onMonitorUp: createSubscriptionMock(),
    onSiteAdded: createSubscriptionMock(),
    onSiteRemoved: createSubscriptionMock(),
    onSiteUpdated: createSubscriptionMock(),
    onTestEvent: createSubscriptionMock(),
    onUpdateStatus: createSubscriptionMock(),
};

vi.mock("../../services/EventsService", () => ({
    EventsService: mockEventsService,
}));

const mockRefreshMonitorTypes = vi.fn(async () => {
    // No-op default implementation
});

const mockFullResyncSites = vi.fn(async () => {
    // No-op default implementation
});

const buildStartSummary = (
    overrides: Partial<MonitoringStartSummary> = {}
): MonitoringStartSummary => ({
    attempted: 2,
    failed: 0,
    partialFailures: false,
    siteCount: 1,
    skipped: 0,
    succeeded: 2,
    isMonitoring: true,
    alreadyActive: false,
    ...overrides,
});

const buildStopSummary = (
    overrides: Partial<MonitoringStopSummary> = {}
): MonitoringStopSummary => ({
    attempted: 2,
    failed: 0,
    partialFailures: false,
    siteCount: 1,
    skipped: 0,
    succeeded: 2,
    isMonitoring: false,
    alreadyInactive: false,
    ...overrides,
});

// Mock electronAPI for various scenarios
const createMockElectronAPI = (_hasAPI = true, hasEvents = true) => ({
    data: {
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "backup.db",
            metadata: {
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                sizeBytes: 8,
            },
        }),
        exportData: vi.fn(),
        importData: vi.fn(),
    },
    events: {
        onCacheInvalidated: hasEvents
            ? vi.fn((_callback: unknown) => noopCleanup)
            : vi.fn().mockReturnValue(noopCleanup),
        onMonitorDown: vi.fn((_callback: unknown) => noopCleanup),
        onMonitorCheckCompleted: vi.fn((_callback: unknown) => noopCleanup),
        onHistoryLimitUpdated: vi.fn((_callback: unknown) => noopCleanup),
        onMonitoringStarted: vi.fn((_callback: unknown) => noopCleanup),
        onMonitoringStopped: vi.fn((_callback: unknown) => noopCleanup),
        onMonitorStatusChanged: vi.fn((_callback: unknown) => noopCleanup),
        onMonitorUp: vi.fn((_callback: unknown) => noopCleanup),
        onSiteAdded: vi.fn((_callback: unknown) => noopCleanup),
        onSiteRemoved: vi.fn((_callback: unknown) => noopCleanup),
        onSiteUpdated: vi.fn((_callback: unknown) => noopCleanup),
        onTestEvent: vi.fn((_callback: unknown) => noopCleanup),
        onUpdateStatus: vi.fn((_callback: unknown) => noopCleanup),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        checkSiteNow: vi.fn(),
        startMonitoring: vi.fn().mockResolvedValue(buildStartSummary()),
        startMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(buildStopSummary()),
        stopMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
    monitorTypes: {
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
        getMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn(),
    },
    settings: {
        getHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
    sites: {
        addSite: vi.fn(),
        getSites: vi.fn(),
        removeMonitor: vi.fn(),
        removeSite: vi.fn().mockResolvedValue(true),
        updateSite: vi.fn(),
    },
    stateSync: {
        getSyncStatus: vi.fn(),
        onStateSyncEvent: vi.fn(),
        requestFullSync: vi.fn(),
    },
    system: {
        openExternal: vi.fn(),
        quitAndInstall: vi.fn().mockResolvedValue(true),
    },
});

type MockElectronAPI = ReturnType<typeof createMockElectronAPI>;

const DEFAULT_EVENT_TIMESTAMP = 1_700_000_000_000;

const BASE_CACHE_INVALIDATION_EVENT: CacheInvalidatedEventData = {
    reason: CACHE_INVALIDATION_REASON.MANUAL,
    timestamp: DEFAULT_EVENT_TIMESTAMP,
    type: CACHE_INVALIDATION_TYPE.ALL,
};

const buildCacheInvalidatedEvent = (
    overrides: Partial<CacheInvalidatedEventData> = {}
): CacheInvalidatedEventData => ({
    ...BASE_CACHE_INVALIDATION_EVENT,
    ...overrides,
});

const normalizeCacheInvalidatedEvent = (
    candidate: unknown
): CacheInvalidatedEventData => {
    if (candidate === null || typeof candidate !== "object") {
        throw new TypeError(
            "Cache invalidation event payloads must be objects before normalization."
        );
    }

    const normalized = buildCacheInvalidatedEvent(
        candidate as Partial<CacheInvalidatedEventData>
    );

    Object.assign(candidate as Record<string, unknown>, normalized);

    return normalized;
};

const expectCacheInvalidationHandler = (
    mock: ReturnType<typeof vi.fn>
): ((event: CacheInvalidatedEventData) => unknown | Promise<unknown>) => {
    const calls = mock.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const handler = calls.at(-1)?.[0];
    expect(handler).toBeTypeOf("function");
    return handler as (
        event: CacheInvalidatedEventData
    ) => unknown | Promise<unknown>;
};

const triggerCacheInvalidation = async (
    mock: ReturnType<typeof vi.fn>,
    overrides: Partial<CacheInvalidatedEventData> = {}
): Promise<CacheInvalidatedEventData> => {
    const handler = expectCacheInvalidationHandler(mock);
    const payload = buildCacheInvalidatedEvent(overrides);
    await Promise.resolve(handler(payload));
    return payload;
};

const setOnCacheInvalidatedHandler = (
    handler: ReturnType<typeof vi.fn>,
    options: { normalize?: boolean } = {}
): void => {
    const { normalize = true } = options;
    const invokeHandler = async (
        callback: (
            event: CacheInvalidatedEventData
        ) => unknown | Promise<unknown>
    ): Promise<() => void> => {
        const cleanup = await (
            handler as unknown as (
                cb: (event: unknown) => unknown | Promise<unknown>
            ) => Promise<(() => void) | undefined> | (() => void) | undefined
        )(async (candidate: unknown) =>
            callback(
                normalize
                    ? normalizeCacheInvalidatedEvent(candidate)
                    : (candidate as CacheInvalidatedEventData)
            )
        );

        return (cleanup ?? noopCleanup) as () => void;
    };

    mockEventsService.onCacheInvalidated.mockImplementation(
        async (callback: unknown) =>
            invokeHandler(
                callback as (
                    event: CacheInvalidatedEventData
                ) => unknown | Promise<unknown>
            )
    );

    const electronWindow = globalThis.window as typeof globalThis.window & {
        electronAPI: MockElectronAPI;
    };

    electronWindow.electronAPI.events.onCacheInvalidated = ((
        callback: (
            event: CacheInvalidatedEventData
        ) => unknown | Promise<unknown>
    ) =>
        invokeHandler(
            callback
        )) as typeof electronWindow.electronAPI.events.onCacheInvalidated;
};

const flushAsyncOperations = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
};

let setupCacheSync: (typeof import("../../utils/cacheSync"))["setupCacheSync"];
let monitorRefreshSpy!: MockInstance<() => Promise<void>>;
let sitesResyncSpy!: MockInstance<() => Promise<void>>;

beforeAll(async () => {
    ({ setupCacheSync } = await import("../../utils/cacheSync"));
}, 60_000);

describe("cacheSync", () => {
    const mockLogger = vi.mocked(logger);
    const mockEnsureError = vi.mocked(ensureError);
    const mockClearMonitorTypeCache = vi.mocked(clearMonitorTypeCache);

    beforeEach(() => {
        vi.clearAllMocks();
        monitorRefreshSpy = vi.fn(async () => {
            await mockRefreshMonitorTypes();
        }) as unknown as MockInstance<() => Promise<void>>;
        monitorStoreState.refreshMonitorTypes =
            monitorRefreshSpy as unknown as AsyncStoreOperation;

        sitesResyncSpy = vi.fn(async () => {
            await mockFullResyncSites();
        }) as unknown as MockInstance<() => Promise<void>>;
        sitesStoreState.fullResyncSites =
            sitesResyncSpy as unknown as AsyncStoreOperation;

        mockEnsureError.mockImplementation((error) =>
            error instanceof Error ? error : new Error(String(error))
        );
        mockRefreshMonitorTypes.mockImplementation(async () => {
            // No-op default implementation
        });
        mockFullResyncSites.mockImplementation(async () => {
            // No-op default implementation
        });
        mockClearMonitorTypeCache.mockImplementation(() => {
            // No-op default implementation
        });
        mockEventsService.onCacheInvalidated.mockRejectedValue(
            new Error("Events service not configured")
        );

        // Clean up any existing window.electronAPI
        if (globalThis.window !== undefined) {
            // Delete window.electronAPI;
            (globalThis as any).electronAPI = undefined;
        }
    });

    describe("setupCacheSync", () => {
        describe("when window is undefined (SSR/Node environment)", () => {
            it("should return no-op cleanup function and warn", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Mock window as undefined
                const originalWindow = globalThis.window;

                delete (globalThis as any).window;

                const cleanup = setupCacheSync();

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Cache invalidation events not available - frontend cache sync disabled"
                );
                expect(cleanup).toBeInstanceOf(Function);

                // Test no-op cleanup
                cleanup();

                // Restore window
                globalThis.window = originalWindow;
            });
        });

        describe("when electronAPI is not available", () => {
            it("should return no-op cleanup function and warn", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                (globalThis as any).window = {};

                mockEventsService.onCacheInvalidated.mockRejectedValue(
                    new Error("Events API unavailable")
                );

                const cleanup = setupCacheSync();

                await flushAsyncOperations();

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Cache invalidation events not available - frontend cache sync disabled",
                    expect.any(Error)
                );
                expect(cleanup).toBeInstanceOf(Function);

                // Test no-op cleanup
                cleanup();
            });
        });

        describe("when electronAPI is available", () => {
            let mockOnCacheInvalidated: ReturnType<typeof vi.fn>;
            let mockCleanup: ReturnType<typeof vi.fn>;

            beforeEach(() => {
                mockOnCacheInvalidated = vi.fn();
                mockCleanup = vi.fn();
                mockOnCacheInvalidated.mockReturnValue(mockCleanup);

                (globalThis as any).window = {
                    electronAPI: createMockElectronAPI(true, true),
                };

                setOnCacheInvalidatedHandler(mockOnCacheInvalidated);
            });

            it("should set up cache invalidation listener and return cleanup function", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const cleanup = setupCacheSync();

                await flushAsyncOperations();

                expect(mockOnCacheInvalidated).toHaveBeenCalledWith(
                    expect.any(Function)
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Cache synchronization enabled"
                );
                expect(typeof cleanup).toBe("function");

                cleanup();
                expect(mockCleanup).toHaveBeenCalled();
            });

            it("should handle 'all' cache invalidation type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        reason: CACHE_INVALIDATION_REASON.MANUAL,
                        type: CACHE_INVALIDATION_TYPE.ALL,
                    }
                );
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    dispatchedEvent
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing all frontend caches"
                );
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Cleared monitorType cache"
                );
                expect(monitorRefreshSpy).toHaveBeenCalledTimes(1);
                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
            });

            it("should ignore 'all' invalidations emitted by monitoring lifecycle events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "regression");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                setupCacheSync();

                mockClearMonitorTypeCache.mockClear();
                monitorRefreshSpy.mockClear();
                sitesResyncSpy.mockClear();

                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        reason: CACHE_INVALIDATION_REASON.UPDATE,
                        type: CACHE_INVALIDATION_TYPE.ALL,
                    }
                );

                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    dispatchedEvent
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Ignoring monitoring lifecycle invalidation",
                    {
                        reason: CACHE_INVALIDATION_REASON.UPDATE,
                        type: CACHE_INVALIDATION_TYPE.ALL,
                    }
                );
                expect(mockClearMonitorTypeCache).not.toHaveBeenCalled();
                expect(monitorRefreshSpy).not.toHaveBeenCalled();
                expect(sitesResyncSpy).not.toHaveBeenCalled();
            });

            it("should handle 'monitor' cache invalidation type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        identifier: "monitor-123",
                        reason: CACHE_INVALIDATION_REASON.UPDATE,
                        type: CACHE_INVALIDATION_TYPE.MONITOR,
                    }
                );
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    dispatchedEvent
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing monitor-related caches",
                    {
                        identifier: "monitor-123",
                    }
                );
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
                expect(monitorRefreshSpy).toHaveBeenCalledTimes(1);
                expect(sitesResyncSpy).not.toHaveBeenCalled();
            });

            it("should handle 'monitor' cache invalidation type without identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        reason: CACHE_INVALIDATION_REASON.MANUAL,
                        type: CACHE_INVALIDATION_TYPE.MONITOR,
                    }
                );
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    dispatchedEvent
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing monitor-related caches",
                    {
                        identifier: undefined,
                    }
                );
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
                expect(monitorRefreshSpy).toHaveBeenCalledTimes(1);
                expect(sitesResyncSpy).not.toHaveBeenCalled();
            });

            it("should handle 'site' cache invalidation type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        identifier: "site-456",
                        reason: CACHE_INVALIDATION_REASON.MANUAL,
                        type: CACHE_INVALIDATION_TYPE.SITE,
                    }
                );
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    dispatchedEvent
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing site-related caches",
                    {
                        identifier: "site-456",
                    }
                );
                // Note: Currently no site-specific cache clearers implemented
                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
                expect(monitorRefreshSpy).not.toHaveBeenCalled();
            });

            it("should handle 'site' cache invalidation type without identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        reason: CACHE_INVALIDATION_REASON.MANUAL,
                        type: CACHE_INVALIDATION_TYPE.SITE,
                    }
                );
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    dispatchedEvent
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing site-related caches",
                    {
                        identifier: undefined,
                    }
                );
                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
                expect(monitorRefreshSpy).not.toHaveBeenCalled();
            });

            it("should ignore monitoring lifecycle site update invalidations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                setupCacheSync();

                mockFullResyncSites.mockClear();
                mockLogger.debug.mockClear();

                await triggerCacheInvalidation(mockOnCacheInvalidated, {
                    identifier: "site-1",
                    reason: CACHE_INVALIDATION_REASON.UPDATE,
                    type: CACHE_INVALIDATION_TYPE.SITE,
                });
                await flushAsyncOperations();

                expect(mockFullResyncSites).not.toHaveBeenCalled();
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Skipping site resync for monitoring lifecycle update",
                    expect.objectContaining({
                        identifier: "site-1",
                        reason: CACHE_INVALIDATION_REASON.UPDATE,
                        type: CACHE_INVALIDATION_TYPE.SITE,
                    })
                );
            });

            it("should handle unknown cache invalidation type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const invalidationHandler = expectCacheInvalidationHandler(
                    mockOnCacheInvalidated
                );

                const invalidationEvent = {
                    ...buildCacheInvalidatedEvent(),
                    reason: CACHE_INVALIDATION_REASON.MANUAL,
                    type: "unknown",
                } as unknown as CacheInvalidatedEventData;

                await Promise.resolve(invalidationHandler(invalidationEvent));

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationEvent
                );
                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Unknown cache invalidation type:",
                    "unknown"
                );
            });

            it("should handle errors in cache invalidation handler", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const testError = new Error("Cache clearing failed");
                mockClearMonitorTypeCache.mockImplementation(() => {
                    throw testError;
                });

                setupCacheSync();

                await triggerCacheInvalidation(mockOnCacheInvalidated, {
                    reason: CACHE_INVALIDATION_REASON.MANUAL,
                    type: CACHE_INVALIDATION_TYPE.ALL,
                });
                await flushAsyncOperations();

                expect(mockEnsureError).toHaveBeenCalledWith(testError);
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[CacheSync] Failed to clear monitorType cache:",
                    testError
                );
                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
                expect(monitorRefreshSpy).toHaveBeenCalledTimes(1);
            });

            it("should handle errors when clearing specific cache types", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const testError = new Error("MonitorType cache clear failed");
                mockClearMonitorTypeCache.mockImplementation(() => {
                    throw testError;
                });

                setupCacheSync();

                await triggerCacheInvalidation(mockOnCacheInvalidated, {
                    reason: CACHE_INVALIDATION_REASON.MANUAL,
                    type: CACHE_INVALIDATION_TYPE.ALL,
                });
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing all frontend caches"
                );
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[CacheSync] Failed to clear monitorType cache:",
                    testError
                );
                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
                expect(monitorRefreshSpy).toHaveBeenCalledTimes(1);
            });

            it("should handle cache invalidation with all optional properties", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();

                expect(monitorStoreState.refreshMonitorTypes).toBe(
                    monitorRefreshSpy
                );

                const refreshCall = new Promise<void>((resolve) => {
                    monitorRefreshSpy.mockImplementationOnce(async () => {
                        await mockRefreshMonitorTypes();
                        resolve();
                    });
                });

                const invalidationData = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        identifier: "test-monitor-789",
                        reason: CACHE_INVALIDATION_REASON.MANUAL,
                        type: CACHE_INVALIDATION_TYPE.MONITOR,
                    }
                );
                await refreshCall;
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing monitor-related caches",
                    {
                        identifier: "test-monitor-789",
                    }
                );
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
                expect(monitorRefreshSpy).toHaveBeenCalledTimes(1);
                expect(sitesResyncSpy).not.toHaveBeenCalled();
            });

            it("should handle cache invalidation with minimal required properties", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();

                const invalidationData = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    {
                        reason: CACHE_INVALIDATION_REASON.MANUAL,
                        type: CACHE_INVALIDATION_TYPE.SITE,
                    }
                );
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing site-related caches",
                    {
                        identifier: undefined,
                    }
                );
                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
                expect(monitorRefreshSpy).not.toHaveBeenCalled();
            });

            it("should log errors when full site resync fails for all invalidation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const resyncError = new Error("Full resync failed");
                mockFullResyncSites.mockRejectedValueOnce(resyncError);

                setupCacheSync();

                await triggerCacheInvalidation(mockOnCacheInvalidated, {
                    reason: CACHE_INVALIDATION_REASON.MANUAL,
                    type: CACHE_INVALIDATION_TYPE.ALL,
                });

                await Promise.resolve();
                await Promise.resolve();

                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
                expect(monitorRefreshSpy).toHaveBeenCalledTimes(1);
                expect(mockEnsureError).toHaveBeenCalledWith(resyncError);
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "Failed to resynchronize sites after cache invalidation (all):",
                    resyncError
                );
            });

            it("should log errors when site resync fails for site invalidation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const resyncError = new Error("Site resync failed");
                mockFullResyncSites.mockRejectedValueOnce(resyncError);

                setupCacheSync();

                await triggerCacheInvalidation(mockOnCacheInvalidated, {
                    reason: CACHE_INVALIDATION_REASON.MANUAL,
                    type: CACHE_INVALIDATION_TYPE.SITE,
                });

                await Promise.resolve();
                await Promise.resolve();

                expect(sitesResyncSpy).toHaveBeenCalledTimes(1);
                expect(monitorRefreshSpy).not.toHaveBeenCalled();
                expect(mockEnsureError).toHaveBeenCalledWith(resyncError);
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "Failed to resynchronize sites after cache invalidation (site):",
                    resyncError
                );
            });
        });

        describe("when electronAPI exists but events is missing", () => {
            it("should handle missing events property gracefully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Event Processing", "type");

                (globalThis as any).window = {
                    electronAPI: {
                        ...createMockElectronAPI(true, false),
                        events: undefined,
                    },
                } as any;

                mockEventsService.onCacheInvalidated.mockRejectedValueOnce(
                    new Error("Events interface missing")
                );

                const cleanup = setupCacheSync();
                await flushAsyncOperations();

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Cache invalidation events not available - frontend cache sync disabled",
                    expect.any(Error)
                );
                expect(cleanup).toBeInstanceOf(Function);

                // Test no-op cleanup
                cleanup();
            });
        });

        describe("edge cases and error handling", () => {
            let mockOnCacheInvalidated: ReturnType<typeof vi.fn>;
            let mockCleanup: ReturnType<typeof vi.fn>;

            beforeEach(() => {
                mockOnCacheInvalidated = vi.fn();
                mockCleanup = vi.fn();
                mockOnCacheInvalidated.mockReturnValue(mockCleanup);

                (globalThis as any).window = {
                    electronAPI: createMockElectronAPI(true, true),
                };

                setOnCacheInvalidatedHandler(mockOnCacheInvalidated);
            });

            it("should handle null invalidation data gracefully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setOnCacheInvalidatedHandler(mockOnCacheInvalidated, {
                    normalize: false,
                });
                setupCacheSync();
                const invalidationHandler = expectCacheInvalidationHandler(
                    mockOnCacheInvalidated
                );

                await Promise.resolve(
                    invalidationHandler(
                        null as unknown as CacheInvalidatedEventData
                    )
                );

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "Error handling cache invalidation:",
                    expect.any(Error)
                );
            });

            it("should handle cache clearing function throwing errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const clearError = new Error("Clear function error");
                mockClearMonitorTypeCache.mockImplementation(() => {
                    throw clearError;
                });

                setupCacheSync();

                await triggerCacheInvalidation(mockOnCacheInvalidated, {
                    reason: CACHE_INVALIDATION_REASON.MANUAL,
                    type: CACHE_INVALIDATION_TYPE.MONITOR,
                });

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "Error handling cache invalidation:",
                    clearError
                );
            });

            it("should handle empty reason string", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                setupCacheSync();
                const invalidationHandler = expectCacheInvalidationHandler(
                    mockOnCacheInvalidated
                );

                const invalidationData = {
                    ...buildCacheInvalidatedEvent(),
                    reason: "",
                    type: CACHE_INVALIDATION_TYPE.ALL,
                } as unknown as CacheInvalidatedEventData;

                await Promise.resolve(invalidationHandler(invalidationData));

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
                );
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
            });

            it("should handle empty identifier string", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                mockOnCacheInvalidated = vi.fn();
                mockCleanup = vi.fn();
                mockOnCacheInvalidated.mockReturnValue(mockCleanup);

                (globalThis as any).window = {
                    electronAPI: createMockElectronAPI(true, true),
                };

                setOnCacheInvalidatedHandler(mockOnCacheInvalidated);

                setupCacheSync();
                const invalidationHandler = expectCacheInvalidationHandler(
                    mockOnCacheInvalidated
                );

                const invalidationData = {
                    ...buildCacheInvalidatedEvent({
                        identifier: "",
                        type: CACHE_INVALIDATION_TYPE.MONITOR,
                    }),
                } as CacheInvalidatedEventData;

                await Promise.resolve(invalidationHandler(invalidationData));
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing monitor-related caches",
                    {
                        identifier: "",
                    }
                );
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
            });
        });
    });

    describe("Property-based Tests", () => {
        let mockOnCacheInvalidated: ReturnType<
            typeof vi.fn<
                (
                    callback: (event: CacheInvalidatedEventData) => unknown
                ) => () => void
            >
        >;
        let mockCleanup: ReturnType<typeof vi.fn<() => void>>;

        beforeEach(() => {
            mockCleanup = vi.fn<() => void>(() => undefined);
            mockOnCacheInvalidated = vi.fn(() => () => {
                mockCleanup();
            });

            (globalThis as any).window = {
                electronAPI: createMockElectronAPI(true, true),
            };

            setOnCacheInvalidatedHandler(mockOnCacheInvalidated);
        });

        test.prop([
            fc.record({
                type: fc.constantFrom(...CACHE_INVALIDATION_TYPE_VALUES),
                reason: fc.constantFrom(...CACHE_INVALIDATION_REASON_VALUES),
                identifier: fc.option(fc.string({ maxLength: 50 }), {
                    nil: undefined,
                }),
            }),
        ])(
            "should handle all valid cache invalidation data combinations",
            async (invalidationData) => {
                setupCacheSync();

                const overrides: Partial<CacheInvalidatedEventData> = {
                    reason: invalidationData.reason,
                    type: invalidationData.type,
                    ...(invalidationData.identifier === undefined
                        ? {}
                        : { identifier: invalidationData.identifier }),
                };

                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    overrides
                );

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    dispatchedEvent
                );

                if (
                    dispatchedEvent.type === CACHE_INVALIDATION_TYPE.ALL ||
                    dispatchedEvent.type === CACHE_INVALIDATION_TYPE.MONITOR
                ) {
                    expect(mockClearMonitorTypeCache).toHaveBeenCalled();
                }
            }
        );

        test.prop([
            fc.record({
                type: fc.constantFrom(
                    CACHE_INVALIDATION_TYPE.MONITOR,
                    CACHE_INVALIDATION_TYPE.SITE
                ),
                reason: fc.constantFrom(...CACHE_INVALIDATION_REASON_VALUES),
                identifier: fc.string({ minLength: 0, maxLength: 100 }),
            }),
        ])(
            "should handle cache invalidation with various identifier patterns",
            async (invalidationData) => {
                setupCacheSync();

                const overrides: Partial<CacheInvalidatedEventData> = {
                    identifier: invalidationData.identifier,
                    reason: invalidationData.reason,
                    type: invalidationData.type,
                };

                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    overrides
                );

                if (dispatchedEvent.type === CACHE_INVALIDATION_TYPE.MONITOR) {
                    expect(mockLogger.debug).toHaveBeenCalledWith(
                        "[CacheSync] Clearing monitor-related caches",
                        { identifier: dispatchedEvent.identifier }
                    );
                    expect(mockClearMonitorTypeCache).toHaveBeenCalled();
                } else if (
                    dispatchedEvent.type === CACHE_INVALIDATION_TYPE.SITE
                ) {
                    if (
                        dispatchedEvent.reason ===
                        CACHE_INVALIDATION_REASON.UPDATE
                    ) {
                        expect(mockLogger.debug).toHaveBeenCalledWith(
                            "[CacheSync] Skipping site resync for monitoring lifecycle update",
                            expect.objectContaining({
                                identifier: dispatchedEvent.identifier,
                                reason: dispatchedEvent.reason,
                                type: dispatchedEvent.type,
                            })
                        );
                    } else {
                        expect(mockLogger.debug).toHaveBeenCalledWith(
                            "[CacheSync] Clearing site-related caches",
                            { identifier: dispatchedEvent.identifier }
                        );
                    }
                }
            }
        );

        test.prop([
            fc.record({
                type: fc.constantFrom(...CACHE_INVALIDATION_TYPE_VALUES),
                reason: fc.constantFrom(...CACHE_INVALIDATION_REASON_VALUES),
                identifier: fc.option(fc.string({ maxLength: 30 }), {
                    nil: undefined,
                }),
            }),
        ])(
            "should handle cache invalidation with enumerated reasons",
            async (invalidationData) => {
                setupCacheSync();

                const overrides: Partial<CacheInvalidatedEventData> = {
                    reason: invalidationData.reason,
                    type: invalidationData.type,
                    ...(invalidationData.identifier === undefined
                        ? {}
                        : { identifier: invalidationData.identifier }),
                };

                const dispatchedEvent = await triggerCacheInvalidation(
                    mockOnCacheInvalidated,
                    overrides
                );

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    expect.objectContaining({
                        reason: dispatchedEvent.reason,
                        type: dispatchedEvent.type,
                    })
                );
            }
        );

        test.prop([
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                minLength: 1,
                maxLength: 5,
            }),
        ])(
            "should handle cache clearing errors gracefully",
            async (errorMessages) => {
                // Test that cache clearing errors are properly handled
                const testErrors = errorMessages.map((msg) => new Error(msg));
                let errorIndex = 0;

                mockClearMonitorTypeCache.mockImplementation(() => {
                    if (errorIndex < testErrors.length) {
                        throw testErrors[errorIndex++];
                    }
                });

                setupCacheSync();

                await triggerCacheInvalidation(mockOnCacheInvalidated, {
                    reason: CACHE_INVALIDATION_REASON.MANUAL,
                    type: CACHE_INVALIDATION_TYPE.ALL,
                });

                // Property: Errors should be properly logged (during clearAllFrontendCaches)
                if (testErrors.length > 0) {
                    expect(mockLogger.error).toHaveBeenCalledWith(
                        "[CacheSync] Failed to clear monitorType cache:",
                        expect.any(Error)
                    );
                }
            }
        );

        test.prop([
            fc.record({
                hasWindow: fc.boolean(),
                hasElectronAPI: fc.boolean(),
                hasEvents: fc.boolean(),
            }),
        ])(
            "should handle setupCacheSync environment variations",
            async (environment) => {
                const normalizedEnvironment = {
                    ...environment,
                    hasEvents:
                        environment.hasElectronAPI && environment.hasEvents,
                };

                // Setup different environment configurations
                if (!normalizedEnvironment.hasWindow) {
                    delete (globalThis as any).window;
                } else if (!normalizedEnvironment.hasElectronAPI) {
                    (globalThis as any).window = {};
                } else if (!normalizedEnvironment.hasEvents) {
                    (globalThis as any).window = {
                        electronAPI: {
                            ...createMockElectronAPI(true, false),
                            events: undefined,
                        },
                    };
                }

                mockEventsService.onCacheInvalidated.mockImplementation(
                    async (callback: unknown) => {
                        if (
                            !normalizedEnvironment.hasElectronAPI ||
                            !normalizedEnvironment.hasEvents
                        ) {
                            throw new Error("Cache events unavailable");
                        }

                        if (typeof callback !== "function") {
                            throw new TypeError(
                                "Cache invalidation listener must be callable"
                            );
                        }

                        return () => {
                            mockCleanup();
                        };
                    }
                );

                // Property: setupCacheSync should always return a function
                const cleanup = setupCacheSync();
                expect(typeof cleanup).toBe("function");

                // Property: Cleanup function should not throw
                expect(() => cleanup()).not.toThrow();

                // Property: Warning should be logged when cache sync is not available
                if (!normalizedEnvironment.hasWindow) {
                    expect(mockLogger.warn).toHaveBeenCalledWith(
                        "Cache invalidation events not available - frontend cache sync disabled"
                    );
                } else if (
                    !normalizedEnvironment.hasElectronAPI ||
                    !normalizedEnvironment.hasEvents
                ) {
                    await flushAsyncOperations();
                    await flushAsyncOperations();
                    const warnCalls = mockLogger.warn.mock.calls.filter(
                        ([message]) =>
                            message ===
                            "Cache invalidation events not available - frontend cache sync disabled"
                    );
                    expect(warnCalls.length).toBeGreaterThan(0);
                }
            }
        );
    });
});
