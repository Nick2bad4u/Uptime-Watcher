/**
 * Comprehensive tests for Frontend Cache Synchronization utilities.
 * Tests cache invalidation event handling and frontend cache clearing.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import logger from "../../services/logger";
import { ensureError } from "../../utils/errorHandling";
import { clearMonitorTypeCache } from "../../utils/monitorTypeHelper";
import { setupCacheSync } from "../../utils/cacheSync";

// Mock dependencies
vi.mock("../../services/logger");
vi.mock("../../utils/errorHandling");
vi.mock("../../utils/monitorTypeHelper", () => ({
    clearMonitorTypeCache: vi.fn(), // <-- ensure this is a real mock function that records arguments
}));

// Mock electronAPI for various scenarios
const createMockElectronAPI = (hasAPI = true, hasEvents = true) => ({
    events: hasEvents
        ? {
              onCacheInvalidated: vi.fn(),
          }
        : undefined,
});

describe("cacheSync", () => {
    const mockLogger = vi.mocked(logger);
    const mockEnsureError = vi.mocked(ensureError);
    const mockClearMonitorTypeCache = vi.mocked(clearMonitorTypeCache);

    beforeEach(() => {
        vi.clearAllMocks();
        mockEnsureError.mockImplementation((error) => (error instanceof Error ? error : new Error(String(error))));

        // Clean up any existing window.electronAPI
        if (typeof window !== "undefined") {
            // @ts-expect-error - Testing environment cleanup
            // delete window.electronAPI;
            window.electronAPI = undefined;
        }
    });

    describe("setupCacheSync", () => {
        describe("when window is undefined (SSR/Node environment)", () => {
            it("should return no-op cleanup function and warn", () => {
                // Mock window as undefined
                const originalWindow = global.window;
                // @ts-expect-error - Testing environment manipulation
                delete global.window;

                const cleanup = setupCacheSync();

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Cache invalidation events not available - frontend cache sync disabled"
                );
                expect(cleanup).toBeInstanceOf(Function);

                // Test no-op cleanup
                cleanup();

                // Restore window
                global.window = originalWindow;
            });
        });

        describe("when electronAPI is not available", () => {
            it("should return no-op cleanup function and warn", () => {
                // @ts-expect-error - Testing environment setup
                global.window = {};

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

                // @ts-expect-error - Testing environment setup
                global.window = {
                    electronAPI: createMockElectronAPI(true, true),
                };
                // @ts-expect-error - Mock API setup
                global.window.electronAPI.events.onCacheInvalidated = mockOnCacheInvalidated;
            });

            it("should set up cache invalidation listener and return cleanup function", () => {
                const cleanup = setupCacheSync();

                expect(mockOnCacheInvalidated).toHaveBeenCalledWith(expect.any(Function));
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Cache synchronization enabled");
                expect(cleanup).toBe(mockCleanup);
            });

            it("should handle 'all' cache invalidation type", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "Full cache refresh requested",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing all frontend caches");
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Cleared monitorType cache");
            });

            it("should handle 'monitor' cache invalidation type", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Monitor configuration updated",
                    identifier: "monitor-123",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing monitor-related caches", {
                    identifier: "monitor-123",
                });
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
            });

            it("should handle 'monitor' cache invalidation type without identifier", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Global monitor refresh",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing monitor-related caches", {
                    identifier: undefined,
                });
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
            });

            it("should handle 'site' cache invalidation type", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "site" as const,
                    reason: "Site data updated",
                    identifier: "site-456",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing site-related caches", {
                    identifier: "site-456",
                });
                // Note: Currently no site-specific cache clearers implemented
            });

            it("should handle 'site' cache invalidation type without identifier", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "site" as const,
                    reason: "General site refresh",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing site-related caches", {
                    identifier: undefined,
                });
            });

            it("should handle unknown cache invalidation type", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    // @ts-expect-error - Testing invalid type
                    type: "unknown",
                    reason: "Invalid type test",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.warn).toHaveBeenCalledWith("Unknown cache invalidation type:", "unknown");
            });

            it("should handle errors in cache invalidation handler", () => {
                const testError = new Error("Cache clearing failed");
                mockClearMonitorTypeCache.mockImplementation(() => {
                    throw testError;
                });

                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

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

            it("should handle errors when clearing specific cache types", () => {
                const testError = new Error("MonitorType cache clear failed");
                mockClearMonitorTypeCache.mockImplementation(() => {
                    throw testError;
                });

                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "Cache clear error test",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing all frontend caches");
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[CacheSync] Failed to clear monitorType cache:",
                    testError
                );
            });

            it("should handle cache invalidation with all optional properties", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Full test data",
                    identifier: "test-monitor-789",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing monitor-related caches", {
                    identifier: "test-monitor-789",
                });
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
            });

            it("should handle cache invalidation with minimal required properties", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "site" as const,
                    reason: "Minimal test",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing site-related caches", {
                    identifier: undefined,
                });
            });
        });

        describe("when electronAPI exists but events is missing", () => {
            it("should handle missing events property gracefully", () => {
                // @ts-expect-error - Testing environment setup
                global.window = {
                    electronAPI: createMockElectronAPI(true, false),
                };

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

                // @ts-expect-error - Testing environment setup
                global.window = {
                    electronAPI: createMockElectronAPI(true, true),
                };
                // @ts-expect-error - Mock API setup
                global.window.electronAPI.events.onCacheInvalidated = mockOnCacheInvalidated;
            });

            it("should handle null invalidation data gracefully", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                // Test with null data (should throw error and be caught)
                invalidationHandler(null);

                expect(mockLogger.error).toHaveBeenCalledWith("Error handling cache invalidation:", expect.any(Error));
            });

            it("should handle cache clearing function throwing errors", () => {
                const clearError = new Error("Clear function error");
                mockClearMonitorTypeCache.mockImplementation(() => {
                    throw clearError;
                });

                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Error test",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.error).toHaveBeenCalledWith("Error handling cache invalidation:", clearError);
            });

            it("should handle empty reason string", () => {
                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "all" as const,
                    reason: "",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("Received cache invalidation event", invalidationData);
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
            });

            it("should handle empty identifier string", () => {
                mockOnCacheInvalidated = vi.fn();
                mockCleanup = vi.fn();
                mockOnCacheInvalidated.mockReturnValue(mockCleanup);

                // @ts-expect-error - Testing environment setup
                global.window = {
                    electronAPI: createMockElectronAPI(true, true),
                };
                // @ts-expect-error - Mock API setup
                global.window.electronAPI.events.onCacheInvalidated = mockOnCacheInvalidated;

                setupCacheSync();
                const invalidationHandler = mockOnCacheInvalidated.mock.calls[0][0];

                const invalidationData = {
                    type: "monitor" as const,
                    reason: "Empty identifier test",
                    identifier: "",
                };

                invalidationHandler(invalidationData);

                expect(mockLogger.debug).toHaveBeenCalledWith("[CacheSync] Clearing monitor-related caches", {
                    identifier: "",
                });
                expect(mockClearMonitorTypeCache).toHaveBeenCalledWith();
            });
        });
    });
});
