/**
 * Comprehensive tests for Frontend Cache Synchronization utilities. Tests cache
 * invalidation event handling and frontend cache clearing.
 */

import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import { fc, test } from "@fast-check/vitest";
import { logger } from "../../services/logger";
import { ensureError } from "@shared/utils/errorHandling";
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

const mockEventsService = {
    onCacheInvalidated: vi.fn(),
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
            ? vi.fn()
            : vi.fn().mockReturnValue(() => {}),
        onMonitorDown: vi.fn(),
        onMonitoringStarted: vi.fn(),
        onMonitoringStopped: vi.fn(),
        onMonitorStatusChanged: vi.fn(),
        onMonitorUp: vi.fn(),
        onTestEvent: vi.fn(),
        onUpdateStatus: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        checkSiteNow: vi.fn(),
        startMonitoring: vi.fn().mockResolvedValue(true),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(true),
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
        quitAndInstall: vi.fn(),
    },
});

type MockElectronAPI = ReturnType<typeof createMockElectronAPI>;

const setOnCacheInvalidatedHandler = (
    handler: ReturnType<typeof vi.fn>
): void => {
    mockEventsService.onCacheInvalidated.mockImplementation(async (callback) =>
        handler(callback)
    );

    const electronWindow = globalThis.window as typeof globalThis.window & {
        electronAPI: MockElectronAPI;
    };

    electronWindow.electronAPI.events.onCacheInvalidated = handler;
};

const flushAsyncOperations = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
};

let setupCacheSync: (typeof import("../../utils/cacheSync"))["setupCacheSync"];
let monitorStoreModule: typeof import("../../stores/monitor/useMonitorTypesStore");
let sitesStoreModule: typeof import("../../stores/sites/useSitesStore");
let monitorRefreshSpy!: ReturnType<typeof vi.spyOn>;
let sitesResyncSpy!: ReturnType<typeof vi.spyOn>;

beforeAll(async () => {
    ({ setupCacheSync } = await import("../../utils/cacheSync"));
    monitorStoreModule = await import(
        "../../stores/monitor/useMonitorTypesStore"
    );
    sitesStoreModule = await import("../../stores/sites/useSitesStore");
    const monitorState = monitorStoreModule.useMonitorTypesStore.getState();
    monitorRefreshSpy = vi
        .spyOn(monitorState, "refreshMonitorTypes")
        .mockImplementation(mockRefreshMonitorTypes);
    const sitesState = sitesStoreModule.useSitesStore.getState();
    sitesResyncSpy = vi
        .spyOn(sitesState, "fullResyncSites")
        .mockImplementation(mockFullResyncSites);
});

afterAll(() => {
    monitorRefreshSpy.mockRestore();
    sitesResyncSpy.mockRestore();
});

describe("cacheSync", () => {
    const mockLogger = vi.mocked(logger);
    const mockEnsureError = vi.mocked(ensureError);
    const mockClearMonitorTypeCache = vi.mocked(clearMonitorTypeCache);

    beforeEach(() => {
        vi.clearAllMocks();
        mockEnsureError.mockImplementation((error) =>
            error instanceof Error ? error : new Error(String(error))
        );
        monitorRefreshSpy.mockImplementation(mockRefreshMonitorTypes);
        sitesResyncSpy.mockImplementation(mockFullResyncSites);
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "Full cache refresh requested",
                };

                invalidationHandler(invalidationData);
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
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

            it("should handle 'monitor' cache invalidation type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Monitor configuration updated",
                    identifier: "monitor-123",
                };

                invalidationHandler(invalidationData);
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Global monitor refresh",
                };

                invalidationHandler(invalidationData);
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "site" as const,
                    reason: "Site data updated",
                    identifier: "site-456",
                };

                invalidationHandler(invalidationData);
                await flushAsyncOperations();

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "site" as const,
                    reason: "General site refresh",
                };

                invalidationHandler(invalidationData);
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

            it("should handle unknown cache invalidation type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheSync", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "unknown",
                    reason: "Invalid type test",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "Error test",
                };

                invalidationHandler(invalidationData);
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "Cache clear error test",
                };

                invalidationHandler(invalidationData);
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Full test data",
                    identifier: "test-monitor-789",
                };

                expect(
                    monitorStoreModule.useMonitorTypesStore.getState()
                        .refreshMonitorTypes
                ).toBe(monitorRefreshSpy);

                const refreshCall = new Promise<void>((resolve) => {
                    monitorRefreshSpy.mockImplementationOnce(async () => {
                        await mockRefreshMonitorTypes();
                        resolve();
                    });
                });

                invalidationHandler(invalidationData);
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "site" as const,
                    reason: "Minimal test",
                };

                invalidationHandler(invalidationData);
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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "Force resync failure",
                };

                invalidationHandler(invalidationData);

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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "site" as const,
                    reason: "Resync failure",
                };

                invalidationHandler(invalidationData);

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

                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                // Test with null data (should throw error and be caught)
                invalidationHandler(null);

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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Error test",
                };

                invalidationHandler(invalidationData);

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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "",
                };

                invalidationHandler(invalidationData);

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
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Empty identifier test",
                    identifier: "",
                };

                invalidationHandler(invalidationData);
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

        test.prop([
            fc.record({
                type: fc.constantFrom("all", "monitor", "site" as const),
                reason: fc.string({ minLength: 1, maxLength: 100 }),
                identifier: fc.option(fc.string({ maxLength: 50 }), {
                    nil: undefined,
                }),
            }),
        ])(
            "should handle all valid cache invalidation data combinations",
            (invalidationData) => {
                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                // Property: All valid cache invalidation data should be processed without errors
                expect(() =>
                    invalidationHandler(invalidationData)
                ).not.toThrow();

                // Property: Logger should be called for all valid invalidation types
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    invalidationData
                );

                // Property: Appropriate cache clearers should be called based on type
                if (
                    invalidationData.type === "all" ||
                    invalidationData.type === "monitor"
                ) {
                    expect(mockClearMonitorTypeCache).toHaveBeenCalled();
                }
            }
        );

        test.prop([
            fc.record({
                type: fc.constantFrom("monitor", "site" as const),
                reason: fc.string({ minLength: 1, maxLength: 50 }),
                identifier: fc.string({ minLength: 0, maxLength: 100 }),
            }),
        ])(
            "should handle cache invalidation with various identifier patterns",
            (invalidationData) => {
                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                invalidationHandler(invalidationData);

                // Property: All identifier strings should be logged correctly
                if (invalidationData.type === "monitor") {
                    expect(mockLogger.debug).toHaveBeenCalledWith(
                        "[CacheSync] Clearing monitor-related caches",
                        { identifier: invalidationData.identifier }
                    );
                } else if (invalidationData.type === "site") {
                    expect(mockLogger.debug).toHaveBeenCalledWith(
                        "[CacheSync] Clearing site-related caches",
                        { identifier: invalidationData.identifier }
                    );
                }

                // Property: Monitor type cache should be cleared for monitor invalidations
                if (invalidationData.type === "monitor") {
                    expect(mockClearMonitorTypeCache).toHaveBeenCalled();
                }
            }
        );

        test.prop([
            fc.record({
                type: fc.constantFrom("all", "monitor", "site" as const),
                reason: fc.oneof(
                    fc.string({ minLength: 1, maxLength: 200 }),
                    fc.constant(""),
                    fc
                        .string()
                        .map((s) =>
                            s.repeat(Math.fround(Math.random() * 3) + 1)
                        )
                ),
                identifier: fc.option(fc.string({ maxLength: 30 }), {
                    nil: undefined,
                }),
            }),
        ])(
            "should handle cache invalidation with various reason strings",
            (invalidationData) => {
                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                // Property: Any reason string should not cause processing to fail
                expect(() =>
                    invalidationHandler(invalidationData)
                ).not.toThrow();

                // Property: Reason should be included in the logged event data
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "Received cache invalidation event",
                    expect.objectContaining({
                        reason: invalidationData.reason,
                        type: invalidationData.type,
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
            (errorMessages) => {
                // Test that cache clearing errors are properly handled
                const testErrors = errorMessages.map((msg) => new Error(msg));
                let errorIndex = 0;

                mockClearMonitorTypeCache.mockImplementation(() => {
                    if (errorIndex < testErrors.length) {
                        throw testErrors[errorIndex++];
                    }
                });

                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "Error handling test",
                };

                // Property: Cache clearing errors should not prevent handler completion
                expect(() =>
                    invalidationHandler(invalidationData)
                ).not.toThrow();

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
                    async (callback) => {
                        if (
                            !normalizedEnvironment.hasElectronAPI ||
                            !normalizedEnvironment.hasEvents
                        ) {
                            throw new Error("Cache events unavailable");
                        }

                        return mockOnCacheInvalidated(callback);
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
