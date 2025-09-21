/**
 * Comprehensive tests for Frontend Cache Synchronization utilities. Tests cache
 * invalidation event handling and frontend cache clearing.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { logger } from "../../services/logger";
import { ensureError } from "@shared/utils/errorHandling";
import { clearMonitorTypeCache } from "../../utils/monitorTypeHelper";
import { setupCacheSync } from "../../utils/cacheSync";

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

// Mock electronAPI for various scenarios
const createMockElectronAPI = (_hasAPI = true, hasEvents = true) => ({
    data: {
        downloadSQLiteBackup: vi.fn(),
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
        checkSiteNow: vi.fn(),
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

describe("cacheSync", () => {
    const mockLogger = vi.mocked(logger);
    const mockEnsureError = vi.mocked(ensureError);
    const mockClearMonitorTypeCache = vi.mocked(clearMonitorTypeCache);

    beforeEach(() => {
        vi.clearAllMocks();
        mockEnsureError.mockImplementation((error) =>
            error instanceof Error ? error : new Error(String(error))
        );

        // Clean up any existing window.electronAPI
        if (globalThis.window !== undefined) {
            // Delete window.electronAPI;
            (globalThis as any).electronAPI = undefined;
        }
    });

    describe(setupCacheSync, () => {
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

                const cleanup = setupCacheSync();

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Cache invalidation events not available - frontend cache sync disabled"
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

                globalThis.window.electronAPI.events.onCacheInvalidated =
                    mockOnCacheInvalidated;
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

                expect(mockOnCacheInvalidated).toHaveBeenCalledWith(
                    expect.any(Function)
                );
                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Cache synchronization enabled"
                );
                expect(cleanup).toBe(mockCleanup);
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

                expect(mockEnsureError).toHaveBeenCalledWith(testError);
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[CacheSync] Failed to clear monitorType cache:",
                    testError
                );
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

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "[CacheSync] Clearing all frontend caches"
                );
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[CacheSync] Failed to clear monitorType cache:",
                    testError
                );
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

                invalidationHandler(invalidationData);

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

                const cleanup = setupCacheSync();

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Cache invalidation events not available - frontend cache sync disabled"
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

                globalThis.window.electronAPI.events.onCacheInvalidated =
                    mockOnCacheInvalidated;
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

                globalThis.window.electronAPI.events.onCacheInvalidated =
                    mockOnCacheInvalidated;

                setupCacheSync();
                const invalidationHandler =
                    mockOnCacheInvalidated.mock.calls[0]?.[0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Empty identifier test",
                    identifier: "",
                };

                invalidationHandler(invalidationData);

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

            globalThis.window.electronAPI.events.onCacheInvalidated =
                mockOnCacheInvalidated;
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
            (environment) => {
                // Setup different environment configurations
                if (!environment.hasWindow) {
                    delete (globalThis as any).window;
                } else if (!environment.hasElectronAPI) {
                    (globalThis as any).window = {};
                } else if (!environment.hasEvents) {
                    (globalThis as any).window = {
                        electronAPI: {
                            ...createMockElectronAPI(true, false),
                            events: undefined,
                        },
                    };
                }

                // Property: setupCacheSync should always return a function
                const cleanup = setupCacheSync();
                expect(typeof cleanup).toBe("function");

                // Property: Cleanup function should not throw
                expect(() => cleanup()).not.toThrow();

                // Property: Warning should be logged when cache sync is not available
                if (
                    !environment.hasWindow ||
                    !environment.hasElectronAPI ||
                    !environment.hasEvents
                ) {
                    expect(mockLogger.warn).toHaveBeenCalledWith(
                        "Cache invalidation events not available - frontend cache sync disabled"
                    );
                }
            }
        );
    });
});
