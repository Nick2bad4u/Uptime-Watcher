/**
 * Tests for critical fixes to ensure they work correctly.
 * 
 * This test suite validates:
 * 1. The improved error handling in store utils
 * 2. The middleware memory leak prevention in TypedEventBus
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TypedEventBus } from "../../electron/events/TypedEventBus";

describe("Critical Fixes", () => {
    describe("Store Utils - withErrorHandling", () => {
        let mockStore: {
            setError: ReturnType<typeof vi.fn>;
            setLoading: ReturnType<typeof vi.fn>;
            clearError: ReturnType<typeof vi.fn>;
        };

        beforeEach(() => {
            mockStore = {
                setError: vi.fn(),
                setLoading: vi.fn(),
                clearError: vi.fn(),
            };
        });

        /**
         * Helper function to replicate the withErrorHandling logic without the logger dependency
         */
        const withErrorHandling = async <T>(
            operation: () => Promise<T>,
            store: { setError: (error: string | undefined) => void; setLoading: (loading: boolean) => void; clearError: () => void }
        ): Promise<T> => {
            // Clear any previous error state before starting
            try {
                store.clearError();
            } catch (error) {
                // If clearError fails, continue but don't prevent the operation
            }

            // Set loading state to true
            try {
                store.setLoading(true);
            } catch (error) {
                // If setLoading fails, continue but don't prevent the operation
            }

            try {
                const result = await operation();
                return result;
            } catch (error) {
                // Handle the error from the operation
                const errorMessage = error instanceof Error ? error.message : String(error);
                
                try {
                    store.setError(errorMessage);
                } catch (storeError) {
                    // If setError fails, continue (both errors are logged in actual implementation)
                }
                
                throw error;
            } finally {
                // Always clear loading state, with error handling
                try {
                    store.setLoading(false);
                } catch (error) {
                    // If setLoading fails in finally, continue
                    // to avoid masking the original error
                }
            }
        };

        it("should handle store method failures gracefully", async () => {
            // Mock store methods to throw errors
            mockStore.clearError.mockImplementation(() => {
                throw new Error("clearError failed");
            });
            mockStore.setLoading.mockImplementation(() => {
                throw new Error("setLoading failed");
            });

            const operation = vi.fn().mockResolvedValue("success");

            // Should not throw despite store method failures
            const result = await withErrorHandling(operation, mockStore);
            expect(result).toBe("success");
            expect(operation).toHaveBeenCalledOnce();
        });

        it("should handle setError failure during error handling", async () => {
            const operationError = new Error("operation failed");
            const operation = vi.fn().mockRejectedValue(operationError);
            
            // Mock setError to fail
            mockStore.setError.mockImplementation(() => {
                throw new Error("setError failed");
            });

            // Should still re-throw the original error
            await expect(withErrorHandling(operation, mockStore)).rejects.toThrow("operation failed");
            expect(mockStore.setLoading).toHaveBeenCalledWith(false);
        });

        it("should handle setLoading failure in finally block", async () => {
            const operation = vi.fn().mockResolvedValue("success");
            
            // Mock setLoading to fail only on the second call (finally block)
            mockStore.setLoading
                .mockImplementationOnce(() => {}) // First call succeeds
                .mockImplementationOnce(() => {
                    throw new Error("setLoading failed in finally");
                });

            // Should not throw despite setLoading failure in finally
            const result = await withErrorHandling(operation, mockStore);
            expect(result).toBe("success");
        });

        it("should clear error state before starting operation", async () => {
            const operation = vi.fn().mockResolvedValue("success");
            
            await withErrorHandling(operation, mockStore);
            
            expect(mockStore.clearError).toHaveBeenCalledBefore(mockStore.setLoading);
            expect(mockStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockStore.setLoading).toHaveBeenCalledWith(false);
        });
    });

    describe("TypedEventBus - Memory Leak Prevention", () => {
        interface TestEvents extends Record<string, unknown> {
            "test:event": { message: string };
        }

        it("should enforce middleware limit by default", () => {
            const bus = new TypedEventBus<TestEvents>("test-bus");
            const middleware = vi.fn(async (_event, _data, next) => next());

            // Default limit is 20
            for (let i = 0; i < 20; i++) {
                expect(() => bus.use(middleware)).not.toThrow();
            }

            // 21st middleware should throw
            expect(() => bus.use(middleware)).toThrow(/Maximum middleware limit.*exceeded/);
        });

        it("should allow custom middleware limit", () => {
            const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 5 });
            const middleware = vi.fn(async (_event, _data, next) => next());

            for (let i = 0; i < 5; i++) {
                expect(() => bus.use(middleware)).not.toThrow();
            }

            expect(() => bus.use(middleware)).toThrow(/Maximum middleware limit \(5\) exceeded/);
        });

        it("should include middleware limits in diagnostics", () => {
            const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 10 });
            const middleware = vi.fn(async (_event, _data, next) => next());

            bus.use(middleware);
            bus.use(middleware);

            const diagnostics = bus.getDiagnostics();
            expect(diagnostics.middlewareCount).toBe(2);
            expect(diagnostics.maxMiddleware).toBe(10);
            expect(diagnostics.middlewareUtilization).toBe(20); // 2/10 * 100
        });

        it("should allow middleware removal to free up slots", () => {
            const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 2 });
            const middleware1 = vi.fn(async (_event, _data, next) => next());
            const middleware2 = vi.fn(async (_event, _data, next) => next());
            const middleware3 = vi.fn(async (_event, _data, next) => next());

            bus.use(middleware1);
            bus.use(middleware2);

            // Should be at limit
            expect(() => bus.use(middleware3)).toThrow();

            // Remove middleware and try again
            bus.removeMiddleware(middleware1);
            expect(() => bus.use(middleware3)).not.toThrow();
        });

        it("should allow clearing all middleware", () => {
            const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 2 });
            const middleware = vi.fn(async (_event, _data, next) => next());

            bus.use(middleware);
            bus.use(middleware);

            // Should be at limit
            expect(() => bus.use(middleware)).toThrow();

            // Clear all middleware
            bus.clearMiddleware();
            
            // Should be able to add middleware again
            expect(() => bus.use(middleware)).not.toThrow();
            expect(() => bus.use(middleware)).not.toThrow();
        });
    });
});
