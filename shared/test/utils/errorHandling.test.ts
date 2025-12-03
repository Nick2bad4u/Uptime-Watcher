/**
 * Tests for shared error handling utilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    withErrorHandling,
    type ErrorHandlingBackendContext,
    type ErrorHandlingFrontendStore,
} from "../../utils/errorHandling";

describe("Error Handling Utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("withErrorHandling - Frontend Store", () => {
        const mockFrontendStore: ErrorHandlingFrontendStore = {
            clearError: vi.fn(),
            setError: vi.fn(),
            setLoading: vi.fn(),
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should handle successful operation", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const operation = vi.fn().mockResolvedValue("success");

            const result = await withErrorHandling(
                operation,
                mockFrontendStore
            );

            expect(result).toBe("success");
            expect(mockFrontendStore.clearError).toHaveBeenCalledTimes(1);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(false);
            expect(mockFrontendStore.setError).not.toHaveBeenCalled();
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it("should handle operation failure with Error object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Test error");
            const operation = vi.fn().mockRejectedValue(error);

            await expect(
                withErrorHandling(operation, mockFrontendStore)
            ).rejects.toThrowError("Test error");

            expect(mockFrontendStore.clearError).toHaveBeenCalledTimes(1);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(false);
            expect(mockFrontendStore.setError).toHaveBeenCalledWith(
                "Test error"
            );
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it("should handle operation failure with string error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = "String error";
            const operation = vi.fn().mockRejectedValue(error);

            await expect(
                withErrorHandling(operation, mockFrontendStore)
            ).rejects.toBe("String error");

            expect(mockFrontendStore.clearError).toHaveBeenCalledTimes(1);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(false);
            expect(mockFrontendStore.setError).toHaveBeenCalledWith(
                "String error"
            );
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it("should handle operation failure with unknown error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = { custom: "error" };
            const operation = vi.fn().mockRejectedValue(error);

            await expect(
                withErrorHandling(operation, mockFrontendStore)
            ).rejects.toEqual({ custom: "error" });

            expect(mockFrontendStore.clearError).toHaveBeenCalledTimes(1);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(false);
            expect(mockFrontendStore.setError).toHaveBeenCalledWith(
                "[object Object]"
            );
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it("should set loading to false even if clearError throws", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(mockFrontendStore.clearError).mockImplementation(() => {
                throw new Error("Clear error failed");
            });
            const operation = vi.fn().mockResolvedValue("success");

            const result = await withErrorHandling(
                operation,
                mockFrontendStore
            );

            expect(result).toBe("success");
            expect(mockFrontendStore.setLoading).toHaveBeenCalledWith(false);
        });
    });

    describe("withErrorHandling - Backend Context", () => {
        const mockLogger = {
            error: vi.fn(),
        };

        const mockBackendContext: ErrorHandlingBackendContext = {
            logger: mockLogger,
            operationName: "testOperation",
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should handle successful operation", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const operation = vi.fn().mockResolvedValue("success");

            const result = await withErrorHandling(
                operation,
                mockBackendContext
            );

            expect(result).toBe("success");
            expect(mockLogger.error).not.toHaveBeenCalled();
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it("should handle operation failure and log error with operation name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Test error");
            const operation = vi.fn().mockRejectedValue(error);

            await expect(
                withErrorHandling(operation, mockBackendContext)
            ).rejects.toThrowError("Test error");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to testOperation",
                error
            );
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it("should handle operation failure and log error without operation name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const contextWithoutName = { logger: mockLogger };
            const error = new Error("Test error");
            const operation = vi.fn().mockRejectedValue(error);

            await expect(
                withErrorHandling(operation, contextWithoutName)
            ).rejects.toThrowError("Test error");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Async operation failed",
                error
            );
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it("should preserve original error type and details", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const originalError = new TypeError("Type error");
            originalError.stack = "original stack trace";
            const operation = vi.fn().mockRejectedValue(originalError);

            let caughtError: any = undefined;
            try {
                await withErrorHandling(operation, mockBackendContext);
            } catch (error) {
                caughtError = error;
            }

            expect(caughtError).toBe(originalError);
            expect(caughtError.message).toBe("Type error");
            expect(caughtError.stack).toBe("original stack trace");
            expect(caughtError instanceof TypeError).toBeTruthy();
        });
    });

    describe("Context detection", () => {
        it("should correctly identify frontend store", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const frontendStore: ErrorHandlingFrontendStore = {
                clearError: vi.fn(),
                setError: vi.fn(),
                setLoading: vi.fn(),
            };
            const operation = vi.fn().mockResolvedValue("test");

            await withErrorHandling(operation, frontendStore);

            expect(frontendStore.clearError).toHaveBeenCalled();
        });

        it("should correctly identify backend context", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const backendContext: ErrorHandlingBackendContext = {
                logger: { error: vi.fn() },
                operationName: "test",
            };
            const operation = vi.fn().mockResolvedValue("test");

            await withErrorHandling(operation, backendContext);

            expect(backendContext.logger.error).not.toHaveBeenCalled();
        });
    });
});
