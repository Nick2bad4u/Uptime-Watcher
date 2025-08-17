/**
 * Comprehensive tests for shared error handling utilities. Tests both frontend
 * and backend usage patterns of withErrorHandling function.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    ErrorHandlingBackendContext,
    ErrorHandlingFrontendStore,
} from "../../utils/errorHandling";
import { withErrorHandling } from "../../utils/errorHandling";

describe("Error Handling Utilities - Comprehensive Coverage", () => {
    let mockStore: ErrorHandlingFrontendStore;
    let mockBackendContext: ErrorHandlingBackendContext;
    let mockConsole: typeof console;

    beforeEach(() => {
        // Mock frontend store
        mockStore = {
            clearError: vi.fn(),
            setError: vi.fn(),
            setLoading: vi.fn(),
        };

        // Mock backend context
        mockBackendContext = {
            logger: {
                error: vi.fn(),
            },
            operationName: "test-operation",
        };

        // Mock console for testing store operations
        mockConsole = {
            warn: vi.fn(),
            error: vi.fn(),
        } as unknown as typeof console;

        // Replace global console temporarily
        globalThis.console = mockConsole;
    });

    describe("Frontend Store Integration", () => {
        it("should successfully execute operation with frontend store", async () => {
            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await withErrorHandling(mockOperation, mockStore);

            expect(result).toBe("success");
            expect(mockStore.clearError).toHaveBeenCalledTimes(1);
            expect(mockStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockStore.setLoading).toHaveBeenCalledWith(false);
            expect(mockStore.setError).not.toHaveBeenCalled();
        });

        it("should handle operation errors with frontend store", async () => {
            const testError = new Error("Test error");
            const mockOperation = vi.fn().mockRejectedValue(testError);

            await expect(
                withErrorHandling(mockOperation, mockStore)
            ).rejects.toThrow("Test error");

            expect(mockStore.clearError).toHaveBeenCalledTimes(1);
            expect(mockStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockStore.setLoading).toHaveBeenCalledWith(false);
            expect(mockStore.setError).toHaveBeenCalledWith("Test error");
        });

        it("should handle store operation failures gracefully", async () => {
            const mockOperation = vi.fn().mockResolvedValue("success");
            mockStore.clearError = vi.fn().mockImplementation(() => {
                throw new Error("Store error");
            });

            const result = await withErrorHandling(mockOperation, mockStore);

            expect(result).toBe("success");
            expect(mockConsole.warn).toHaveBeenCalledWith(
                "Store operation failed for:",
                "clear error state",
                expect.any(Error)
            );
        });

        it("should handle non-Error objects as error messages", async () => {
            const mockOperation = vi.fn().mockRejectedValue("String error");

            await expect(
                withErrorHandling(mockOperation, mockStore)
            ).rejects.toBe("String error");

            expect(mockStore.setError).toHaveBeenCalledWith("String error");
        });
    });

    describe("Backend Context Integration", () => {
        it("should successfully execute operation with backend context", async () => {
            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await withErrorHandling(
                mockOperation,
                mockBackendContext
            );

            expect(result).toBe("success");
            expect(mockBackendContext.logger.error).not.toHaveBeenCalled();
        });

        it("should handle operation errors with backend logging", async () => {
            const testError = new Error("Backend error");
            const mockOperation = vi.fn().mockRejectedValue(testError);

            await expect(
                withErrorHandling(mockOperation, mockBackendContext)
            ).rejects.toThrow("Backend error");

            expect(mockBackendContext.logger.error).toHaveBeenCalledWith(
                "Failed to test-operation",
                testError
            );
        });

        it("should handle backend context without operation name", async () => {
            const contextWithoutName = {
                logger: {
                    error: vi.fn(),
                },
            };
            const testError = new Error("Backend error");
            const mockOperation = vi.fn().mockRejectedValue(testError);

            await expect(
                withErrorHandling(mockOperation, contextWithoutName)
            ).rejects.toThrow("Backend error");

            expect(contextWithoutName.logger.error).toHaveBeenCalledWith(
                "Async operation failed",
                testError
            );
        });
    });

    describe("Store Context Detection", () => {
        it("should correctly identify frontend store context", async () => {
            const mockOperation = vi.fn().mockResolvedValue("frontend");

            const result = await withErrorHandling(mockOperation, mockStore);

            expect(result).toBe("frontend");
            expect(mockStore.clearError).toHaveBeenCalled();
        });

        it("should correctly identify backend context", async () => {
            const mockOperation = vi.fn().mockResolvedValue("backend");

            const result = await withErrorHandling(
                mockOperation,
                mockBackendContext
            );

            expect(result).toBe("backend");
            expect(mockBackendContext.logger).toBeDefined();
        });

        it("should handle objects that might partially match store interface", async () => {
            const partialStore = {
                setError: vi.fn(),
                // Missing clearError and setLoading
            };
            const mockOperation = vi.fn().mockResolvedValue("partial");

            const result = await withErrorHandling(
                mockOperation,
                partialStore as any
            );

            expect(result).toBe("partial");
            // Should be treated as backend context since it doesn't have all store methods
        });
    });

    describe("Edge Cases and Error Scenarios", () => {
        it("should handle store setError throwing an error", async () => {
            const testError = new Error("Operation error");
            const storeError = new Error("Store setError error");
            const mockOperation = vi.fn().mockRejectedValue(testError);

            mockStore.setError = vi.fn().mockImplementation(() => {
                throw storeError;
            });

            await expect(
                withErrorHandling(mockOperation, mockStore)
            ).rejects.toThrow("Operation error");

            expect(mockConsole.warn).toHaveBeenCalledWith(
                "Store operation failed for:",
                "set error state",
                storeError
            );
            expect(mockConsole.error).toHaveBeenCalledWith(
                "Original operation error:",
                testError
            );
        });

        it("should handle store setLoading(false) throwing in finally block", async () => {
            const mockOperation = vi.fn().mockResolvedValue("success");
            const finallyError = new Error("Finally setLoading error");

            // Mock setLoading to succeed for true, fail for false
            mockStore.setLoading = vi
                .fn()
                .mockImplementation((loading: boolean) => {
                    if (!loading) {
                        throw finallyError;
                    }
                });

            const result = await withErrorHandling(mockOperation, mockStore);

            expect(result).toBe("success");
            expect(mockConsole.warn).toHaveBeenCalledWith(
                "Store operation failed for:",
                "clear loading state in finally block",
                finallyError
            );
        });

        it("should handle complex error objects", async () => {
            const complexError = {
                message: "Complex error",
                code: 500,
                details: { nested: "data" },
            };
            const mockOperation = vi.fn().mockRejectedValue(complexError);

            await expect(
                withErrorHandling(mockOperation, mockStore)
            ).rejects.toBe(complexError);

            expect(mockStore.setError).toHaveBeenCalledWith("[object Object]");
        });

        it("should handle null and undefined errors", async () => {
            const mockOperation = vi.fn().mockRejectedValue(null);

            await expect(
                withErrorHandling(mockOperation, mockStore)
            ).rejects.toBe(null);

            expect(mockStore.setError).toHaveBeenCalledWith("null");
        });

        it("should handle number and boolean errors", async () => {
            const mockOperation = vi.fn().mockRejectedValue(42);

            await expect(
                withErrorHandling(mockOperation, mockStore)
            ).rejects.toBe(42);

            expect(mockStore.setError).toHaveBeenCalledWith("42");
        });
    });

    describe("Integration Testing", () => {
        it("should maintain operation return types correctly", async () => {
            // Test with different return types
            const stringOperation = vi.fn().mockResolvedValue("string result");
            const numberOperation = vi.fn().mockResolvedValue(123);
            const objectOperation = vi.fn().mockResolvedValue({ data: "test" });

            const stringResult = await withErrorHandling(
                stringOperation,
                mockStore
            );
            const numberResult = await withErrorHandling(
                numberOperation,
                mockStore
            );
            const objectResult = await withErrorHandling(
                objectOperation,
                mockStore
            );

            expect(stringResult).toBe("string result");
            expect(numberResult).toBe(123);
            expect(objectResult).toEqual({ data: "test" });
        });

        it("should handle multiple consecutive operations", async () => {
            const operations = [
                vi.fn().mockResolvedValue("first"),
                vi.fn().mockResolvedValue("second"),
                vi.fn().mockRejectedValue(new Error("third failed")),
                vi.fn().mockResolvedValue("fourth"),
            ];

            const firstResult = await withErrorHandling(
                operations[0]!,
                mockStore
            );
            expect(firstResult).toBe("first");

            const secondResult = await withErrorHandling(
                operations[1]!,
                mockStore
            );
            expect(secondResult).toBe("second");

            await expect(
                withErrorHandling(operations[2]!, mockStore)
            ).rejects.toThrow("third failed");

            const fourthResult = await withErrorHandling(
                operations[3]!,
                mockStore
            );
            expect(fourthResult).toBe("fourth");

            // Verify that each operation properly managed loading state
            expect(mockStore.setLoading).toHaveBeenCalledTimes(8); // 4 operations × 2 calls each (true/false)
        });
    });
});
