/**
 * Compre it("should return Error instance as-is", async ({ task, annotate, })
 * => { await annotate(`Testing: ${task.name}`, "functional"); await
 * annotate("Component: errorHandling", "component"); await annotate("Category:
 * Utility", "category"); await annotate("Type: Error Handling", "type");
 *
 * ```
 *         const originalError = new Error("test error");
 *         const result = convertError(originalError);
 *
 *         expect(result.error).toBe(originalError);
 *         expect(result.error).toBeInstanceOf(Error);
 *         expect(result.error.message).toBe("test error");
 *         expect(result.originalType).toBe("Error");
 *         expect(result.wasError).toBeTruthy();
 *     });te for error handling utilities. Provides 100% coverage
 * ```
 *
 * For error handling functions.
 */

import { describe, expect, it, vi } from "vitest";
import {
    convertError,
    ensureError,
    withUtilityErrorHandling,
} from "@shared/utils/errorHandling";

describe("Error Handling Utilities - Comprehensive Coverage", () => {
    describe(convertError, () => {
        it("should return same Error instance when passed an Error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const originalError = new Error("test error");
            const result = convertError(originalError);

            expect(result.error).toBe(originalError);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("test error");
            expect(result.wasError).toBeTruthy();
            expect(result.originalType).toBe("Error");
        });

        it("should convert string to Error instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const result = convertError("string error");

            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("string error");
            expect(result.originalType).toBe("string");
            expect(result.wasError).toBeFalsy();
        });

        it("should convert number to Error instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const result = convertError(404);

            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("404");
            expect(result.originalType).toBe("number");
            expect(result.wasError).toBeFalsy();
        });

        it("should convert undefined to Error instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const result = convertError(undefined);

            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("undefined");
            expect(result.originalType).toBe("undefined");
            expect(result.wasError).toBeFalsy();
        });

        it("should convert null to Error instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const result = convertError(null);

            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("null");
            expect(result.originalType).toBe("object");
            expect(result.wasError).toBeFalsy();
        });

        it("should convert object to Error instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const objectError = { message: "custom error", code: 500 };
            const result = convertError(objectError);

            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("[object Object]");
            expect(result.originalType).toBe("object");
            expect(result.wasError).toBeFalsy();
        });
    });

    describe(ensureError, () => {
        it("should return Error instance for Error input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const originalError = new Error("test error");
            const result = ensureError(originalError);

            expect(result).toBe(originalError);
            expect(result).toBeInstanceOf(Error);
        });

        it("should convert non-Error to Error instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const result = ensureError("string error");

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("string error");
        });
    });

    describe(withUtilityErrorHandling, () => {
        it("should return operation result when operation succeeds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const successfulOperation = async () => "success result";

            const result = await withUtilityErrorHandling(
                successfulOperation,
                "test operation"
            );

            expect(result).toBe("success result");
        });

        it("should return fallback value when operation fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failingOperation = async () => {
                throw new Error("operation failed");
            };

            // Mock console.error to avoid noise in test output
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const result = await withUtilityErrorHandling(
                failingOperation,
                "test operation",
                "fallback value"
            );

            expect(result).toBe("fallback value");
            expect(consoleSpy).toHaveBeenCalledWith(
                "test operation failed",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it("should throw error when shouldThrow is true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failingOperation = async () => {
                throw new Error("operation failed");
            };

            // Mock console.error to avoid noise in test output
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            await expect(
                withUtilityErrorHandling(
                    failingOperation,
                    "test operation",
                    undefined,
                    true
                )
            ).rejects.toThrowError("operation failed");

            expect(consoleSpy).toHaveBeenCalledWith(
                "test operation failed",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it("should throw error when no fallback value provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failingOperation = async () => {
                throw new Error("operation failed");
            };

            // Mock console.error to avoid noise in test output
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            await expect(
                withUtilityErrorHandling(failingOperation, "test operation")
            ).rejects.toThrowError(
                "test operation failed and no fallback value provided. When shouldThrow is false, you must provide a fallbackValue parameter."
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                "test operation failed",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it("should handle non-Error thrown values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failingOperation = async () => {
                throw "string error";
            };

            // Mock console.error to avoid noise in test output
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const result = await withUtilityErrorHandling(
                failingOperation,
                "test operation",
                "fallback value"
            );

            expect(result).toBe("fallback value");
            expect(consoleSpy).toHaveBeenCalledWith(
                "test operation failed",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it("should handle complex fallback values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failingOperation = async () => {
                throw new Error("operation failed");
            };

            const complexFallback = { data: [], error: "fallback used" };

            // Mock console.error to avoid noise in test output
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const result = await withUtilityErrorHandling(
                failingOperation,
                "test operation",
                complexFallback
            );

            expect(result).toEqual(complexFallback);
            expect(consoleSpy).toHaveBeenCalledWith(
                "test operation failed",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it("should preserve original error in cause when throwing with no fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorHandling", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const originalError = new Error("original error");
            const failingOperation = async () => {
                throw originalError;
            };

            // Mock console.error to avoid noise in test output
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            try {
                await withUtilityErrorHandling(
                    failingOperation,
                    "test operation"
                );
                // Should not reach here
                expect.fail("Expected function to throw");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe(
                    "test operation failed and no fallback value provided. When shouldThrow is false, you must provide a fallbackValue parameter."
                );
                expect((error as Error).cause).toBe(originalError);
            }

            consoleSpy.mockRestore();
        });
    });
});
