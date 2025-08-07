/**
 * Tests for error handling utility functions
 *
 * @fileoverview Comprehensive tests covering all branches and edge cases
 * for error handling utilities used throughout the application.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    ensureError,
    withUtilityErrorHandling,
} from "../../utils/errorHandling";

// Mock the logger module
vi.mock("../../services/logger", () => ({
    default: {
        error: vi.fn(),
    },
}));

describe("Error Handling Utilities", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe("ensureError", () => {
        describe("Error instance handling", () => {
            it("should return the same Error object when input is already an Error", () => {
                const originalError = new Error("Test error message");
                const result = ensureError(originalError);

                expect(result).toBe(originalError);
                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("Test error message");
            });

            it("should handle Error subclasses correctly", () => {
                const typeError = new TypeError("Type error message");
                const result = ensureError(typeError);

                expect(result).toBe(typeError);
                expect(result).toBeInstanceOf(Error);
                expect(result).toBeInstanceOf(TypeError);
                expect(result.message).toBe("Type error message");
            });

            it("should handle custom Error classes", () => {
                class CustomError extends Error {
                    constructor(message: string) {
                        super(message);
                        this.name = "CustomError";
                    }
                }

                const customError = new CustomError("Custom error message");
                const result = ensureError(customError);

                expect(result).toBe(customError);
                expect(result).toBeInstanceOf(Error);
                expect(result).toBeInstanceOf(CustomError);
                expect(result.message).toBe("Custom error message");
                expect(result.name).toBe("CustomError");
            });
        });

        describe("Non-error value conversion", () => {
            it("should convert string to Error object", () => {
                const errorString = "Something went wrong";
                const result = ensureError(errorString);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("Something went wrong");
                expect(result).not.toBe(errorString);
            });

            it("should convert number to Error object", () => {
                const errorNumber = 404;
                const result = ensureError(errorNumber);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("404");
            });

            it("should convert object to Error object", () => {
                const errorObject = {
                    status: 500,
                    message: "Internal Server Error",
                };
                const result = ensureError(errorObject);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("[object Object]");
            });

            it("should convert array to Error object", () => {
                const errorArray = ["error1", "error2"];
                const result = ensureError(errorArray);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("error1,error2");
            });

            it("should handle null value", () => {
                const result = ensureError(null);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("null");
            });

            it("should handle undefined value", () => {
                const result = ensureError(undefined);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("undefined");
            });

            it("should handle boolean values", () => {
                const resultTrue = ensureError(true);
                const resultFalse = ensureError(false);

                expect(resultTrue).toBeInstanceOf(Error);
                expect(resultTrue.message).toBe("true");

                expect(resultFalse).toBeInstanceOf(Error);
                expect(resultFalse.message).toBe("false");
            });

            it("should handle empty string", () => {
                const result = ensureError("");

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("");
            });

            it("should handle symbols", () => {
                const symbolValue = Symbol("test");
                const result = ensureError(symbolValue);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("Symbol(test)");
            });
        });
    });

    describe("withUtilityErrorHandling", () => {
        describe("Successful operations", () => {
            it("should return the operation result when operation succeeds", async () => {
                const operation = vi.fn().mockResolvedValue("success result");

                const result = await withUtilityErrorHandling(
                    operation,
                    "test operation"
                );

                expect(result).toBe("success result");
                expect(operation).toHaveBeenCalledOnce();
            });

            it("should return complex object results", async () => {
                const complexResult = { data: [1, 2, 3], status: "ok" };
                const operation = vi.fn().mockResolvedValue(complexResult);

                const result = await withUtilityErrorHandling(
                    operation,
                    "complex operation"
                );

                expect(result).toEqual(complexResult);
                expect(result).toBe(complexResult);
            });

            it("should handle operations returning null", async () => {
                const operation = vi.fn().mockResolvedValue(null);

                const result = await withUtilityErrorHandling(
                    operation,
                    "null operation"
                );

                expect(result).toBeNull();
            });

            it("should handle operations returning undefined", async () => {
                const operation = vi.fn().mockResolvedValue(undefined);

                const result = await withUtilityErrorHandling(
                    operation,
                    "undefined operation"
                );

                expect(result).toBeUndefined();
            });
        });

        describe("Error handling with shouldThrow=true", () => {
            it("should throw the wrapped error when shouldThrow is true", async () => {
                const originalError = new Error("Original error");
                const operation = vi.fn().mockRejectedValue(originalError);

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "test operation",
                        undefined,
                        true
                    )
                ).rejects.toThrow("Original error");

                expect(operation).toHaveBeenCalledOnce();
            });

            it("should log error before throwing when shouldThrow is true", async () => {
                const logger = await import("../../services/logger");
                const originalError = new Error("Test error");
                const operation = vi.fn().mockRejectedValue(originalError);

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "logging test",
                        undefined,
                        true
                    )
                ).rejects.toThrow("Test error");

                expect(logger.default.error).toHaveBeenCalledWith(
                    "logging test failed",
                    originalError
                );
            });

            it("should wrap non-Error objects before throwing", async () => {
                const operation = vi.fn().mockRejectedValue("string error");

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "string error test",
                        undefined,
                        true
                    )
                ).rejects.toThrow("string error");
            });
        });

        describe("Error handling with shouldThrow=false and fallback values", () => {
            it("should return fallback value when operation fails and shouldThrow is false", async () => {
                const originalError = new Error("Operation failed");
                const operation = vi.fn().mockRejectedValue(originalError);
                const fallbackValue = "fallback result";

                const result = await withUtilityErrorHandling(
                    operation,
                    "test operation",
                    fallbackValue,
                    false
                );

                expect(result).toBe(fallbackValue);
                expect(operation).toHaveBeenCalledOnce();
            });

            it("should log error before returning fallback value", async () => {
                const logger = await import("../../services/logger");
                const originalError = new Error("Test error");
                const operation = vi.fn().mockRejectedValue(originalError);

                const result = await withUtilityErrorHandling(
                    operation,
                    "fallback test",
                    "fallback",
                    false
                );

                expect(result).toBe("fallback");
                expect(logger.default.error).toHaveBeenCalledWith(
                    "fallback test failed",
                    originalError
                );
            });

            it("should handle null as a valid fallback value", async () => {
                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("Failed"));

                const result = await withUtilityErrorHandling(
                    operation,
                    "null fallback test",
                    null,
                    false
                );

                expect(result).toBeNull();
            });

            it("should handle primitive fallback values", async () => {
                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("Failed"));

                // Number fallback
                const numberResult = await withUtilityErrorHandling(
                    operation,
                    "number test",
                    42,
                    false
                );
                expect(numberResult).toBe(42);

                // Boolean fallback
                const booleanResult = await withUtilityErrorHandling(
                    operation,
                    "boolean test",
                    true,
                    false
                );
                expect(booleanResult).toBe(true);

                // Array fallback
                const arrayResult = await withUtilityErrorHandling(
                    operation,
                    "array test",
                    [],
                    false
                );
                expect(arrayResult).toEqual([]);
            });
        });

        describe("Error handling without fallback values", () => {
            it("should throw error when shouldThrow=false but no fallback value provided", async () => {
                const originalError = new Error("Operation failed");
                const operation = vi.fn().mockRejectedValue(originalError);

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "no fallback test",
                        undefined,
                        false
                    )
                ).rejects.toThrow(
                    "no fallback test failed and no fallback value provided"
                );
            });

            it("should throw error when fallback is explicitly undefined", async () => {
                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("Failed"));

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "explicit undefined test",
                        undefined,
                        false
                    )
                ).rejects.toThrow(
                    "explicit undefined test failed and no fallback value provided"
                );
            });

            it("should log original error before throwing fallback error", async () => {
                const logger = await import("../../services/logger");
                const originalError = new Error("Original error");
                const operation = vi.fn().mockRejectedValue(originalError);

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "logging original",
                        undefined,
                        false
                    )
                ).rejects.toThrow(
                    "logging original failed and no fallback value provided"
                );

                expect(logger.default.error).toHaveBeenCalledWith(
                    "logging original failed",
                    originalError
                );
            });
        });

        describe("Default parameter behavior", () => {
            it("should default shouldThrow to false", async () => {
                const operation = vi.fn().mockRejectedValue(new Error("Test"));

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "default test",
                        "fallback"
                    )
                ).resolves.toBe("fallback");
            });

            it("should handle operations without optional parameters", async () => {
                const operation = vi.fn().mockRejectedValue(new Error("Test"));

                await expect(
                    withUtilityErrorHandling(operation, "minimal test")
                ).rejects.toThrow(
                    "minimal test failed and no fallback value provided"
                );
            });
        });

        describe("Real-world scenarios", () => {
            it("should handle async operations that take time", async () => {
                const operation = vi.fn().mockImplementation(async () => {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    throw new Error("Delayed error");
                });

                const start = Date.now();
                const result = await withUtilityErrorHandling(
                    operation,
                    "delayed operation",
                    "fallback"
                );
                const end = Date.now();

                expect(result).toBe("fallback");
                expect(end - start).toBeGreaterThanOrEqual(10);
            });

            it("should handle network-like errors", async () => {
                const networkError = new Error("Network timeout");
                (networkError as any).code = "ECONNRESET";
                const operation = vi.fn().mockRejectedValue(networkError);

                const result = await withUtilityErrorHandling(
                    operation,
                    "network operation",
                    {
                        data: null,
                        error: true,
                    }
                );

                expect(result).toEqual({ data: null, error: true });
            });

            it("should handle JSON parsing errors", async () => {
                const parseError = new SyntaxError("Unexpected token in JSON");
                const operation = vi.fn().mockRejectedValue(parseError);

                const result = await withUtilityErrorHandling(
                    operation,
                    "JSON parse",
                    {},
                    false
                );

                expect(result).toEqual({});
            });
        });

        describe("Edge cases", () => {
            it("should handle operations that throw non-Error objects", async () => {
                const operation = vi.fn().mockImplementation(async () => {
                    throw "String error";
                });

                const result = await withUtilityErrorHandling(
                    operation,
                    "string throw test",
                    "fallback"
                );

                expect(result).toBe("fallback");
            });

            it("should handle operations that throw objects", async () => {
                const operation = vi.fn().mockImplementation(async () => {
                    throw { message: "Object error", code: 500 };
                });

                const result = await withUtilityErrorHandling(
                    operation,
                    "object throw test",
                    "fallback"
                );

                expect(result).toBe("fallback");
            });

            it("should handle very long operation names", async () => {
                const longName = "a".repeat(1000);
                const operation = vi.fn().mockRejectedValue(new Error("Test"));

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        longName,
                        undefined,
                        false
                    )
                ).rejects.toThrow(
                    `${longName} failed and no fallback value provided`
                );
            });

            it("should handle empty operation name", async () => {
                const operation = vi.fn().mockRejectedValue(new Error("Test"));

                await expect(
                    withUtilityErrorHandling(operation, "", undefined, false)
                ).rejects.toThrow(" failed and no fallback value provided");
            });
        });
    });
});
