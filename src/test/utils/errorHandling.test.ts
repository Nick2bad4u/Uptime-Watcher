/**
 * Tests for error handling utility functions
 *
 * @file Comprehensive tests covering all branches and edge cases for error
 *   handling utilities used throughout the application.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
    ensureError,
    withUtilityErrorHandling,
} from "../../utils/errorHandling";

// Mock the logger module
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

describe("Error Handling Utilities", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe(ensureError, () => {
        describe("Error instance handling", () => {
            it("should return the same Error object when input is already an Error", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const originalError = new Error("Test error message");
                const result = ensureError(originalError);

                expect(result).toBe(originalError);
                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("Test error message");
            });

            it("should handle Error subclasses correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const customTypeError = new TypeError("Type error message");
                const result = ensureError(customTypeError);

                expect(result).toBe(customTypeError);
                expect(result).toBeInstanceOf(Error);
                expect(result).toBeInstanceOf(TypeError);
                expect(result.message).toBe("Type error message");
            });

            it("should handle custom Error classes", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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
            it("should convert string to Error object", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const errorString = "Something went wrong";
                const result = ensureError(errorString);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("Something went wrong");
                expect(result).not.toBe(errorString);
            });

            it("should convert number to Error object", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const errorNumber = 404;
                const result = ensureError(errorNumber);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("404");
            });

            it("should convert object to Error object", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const errorObject = {
                    status: 500,
                    message: "Internal Server Error",
                };
                const result = ensureError(errorObject);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("[object Object]");
            });

            it("should convert array to Error object", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const errorArray = ["error1", "error2"];
                const result = ensureError(errorArray);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("error1,error2");
            });

            it("should handle null value", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = ensureError(null);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("null");
            });

            it("should handle undefined value", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = ensureError(undefined);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("undefined");
            });

            it("should handle boolean values", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const resultTrue = ensureError(true);
                const resultFalse = ensureError(false);

                expect(resultTrue).toBeInstanceOf(Error);
                expect(resultTrue.message).toBe("true");

                expect(resultFalse).toBeInstanceOf(Error);
                expect(resultFalse.message).toBe("false");
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = ensureError("");

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("");
            });

            it("should handle symbols", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const symbolValue = Symbol("test");
                const result = ensureError(symbolValue);

                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe("Symbol(test)");
            });
        });
    });

    describe(withUtilityErrorHandling, () => {
        describe("Successful operations", () => {
            it("should return the operation result when operation succeeds", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockResolvedValue("success result");

                const result = await withUtilityErrorHandling(
                    operation,
                    "test operation"
                );

                expect(result).toBe("success result");
                expect(operation).toHaveBeenCalledTimes(1);
            });

            it("should return complex object results", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const complexResult = {
                    data: [
                        1,
                        2,
                        3,
                    ],
                    status: "ok",
                };
                const operation = vi.fn().mockResolvedValue(complexResult);

                const result = await withUtilityErrorHandling(
                    operation,
                    "complex operation"
                );

                expect(result).toEqual(complexResult);
                expect(result).toBe(complexResult);
            });

            it("should handle operations returning null", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockResolvedValue(null);

                const result = await withUtilityErrorHandling(
                    operation,
                    "null operation"
                );

                expect(result).toBeNull();
            });

            it("should handle operations returning undefined", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockResolvedValue(undefined);

                const result = await withUtilityErrorHandling(
                    operation,
                    "undefined operation"
                );

                expect(result).toBeUndefined();
            });
        });

        describe("Error handling with shouldThrow=true", () => {
            it("should throw the wrapped error when shouldThrow is true", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

                expect(operation).toHaveBeenCalledTimes(1);
            });

            it("should log error before throwing when shouldThrow is true", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

                expect(logger.logger.error).toHaveBeenCalledWith(
                    "logging test failed",
                    originalError
                );
            });

            it("should wrap non-Error objects before throwing", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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
            it("should return fallback value when operation fails and shouldThrow is false", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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
                expect(operation).toHaveBeenCalledTimes(1);
            });

            it("should log error before returning fallback value", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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
                expect(logger.logger.error).toHaveBeenCalledWith(
                    "fallback test failed",
                    originalError
                );
            });

            it("should handle null as a valid fallback value", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

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

            it("should handle primitive fallback values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

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
                expect(booleanResult).toBeTruthy();

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
            it("should throw error when shouldThrow=false but no fallback value provided", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

            it("should throw error when fallback is explicitly undefined", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

            it("should log original error before throwing fallback error", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

                expect(logger.logger.error).toHaveBeenCalledWith(
                    "logging original failed",
                    originalError
                );
            });
        });

        describe("Default parameter behavior", () => {
            it("should default shouldThrow to false", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockRejectedValue(new Error("Test"));

                await expect(
                    withUtilityErrorHandling(
                        operation,
                        "default test",
                        "fallback"
                    )
                ).resolves.toBe("fallback");
            });

            it("should handle operations without optional parameters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockRejectedValue(new Error("Test"));

                await expect(
                    withUtilityErrorHandling(operation, "minimal test")
                ).rejects.toThrow(
                    "minimal test failed and no fallback value provided"
                );
            });
        });

        describe("Real-world scenarios", () => {
            it("should handle async operations that take time", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

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

            it("should handle network-like errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

            it("should handle JSON parsing errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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
            it("should handle operations that throw non-Error objects", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

            it("should handle operations that throw objects", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

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

            it("should handle very long operation names", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

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

            it("should handle empty operation name", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorHandling", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockRejectedValue(new Error("Test"));

                await expect(
                    withUtilityErrorHandling(operation, "", undefined, false)
                ).rejects.toThrow(" failed and no fallback value provided");
            });
        });
    });

    /**
     * Fast-check property-based tests for comprehensive edge case coverage.
     * These tests systematically explore error handling behavior under
     * various conditions including arbitrary error types, different fallback
     * values, operation results, and edge cases in error conversion patterns.
     */
    describe("Property-based tests", () => {
        describe("ensureError function", () => {
            test.prop([fc.string()])(
                "should convert strings to Error instances",
                (input) => {
                    const result = ensureError(input);
                    expect(result).toBeInstanceOf(Error);
                    expect(result.message).toBe(input);
                }
            );

            test.prop([fc.integer()])(
                "should convert numbers to Error instances",
                (input) => {
                    const result = ensureError(input);
                    expect(result).toBeInstanceOf(Error);
                    expect(result.message).toBe(String(input));
                }
            );

            test.prop([fc.string().map(msg => new Error(msg))])(
                "should return Error instances unchanged",
                (error) => {
                    const result = ensureError(error);
                    expect(result).toBe(error);
                    expect(result.message).toBe(error.message);
                }
            );
        });

        describe("withUtilityErrorHandling function", () => {
            test.prop([fc.string()])(
                "should return operation result on success",
                async (expectedResult) => {
                    const operation = vi.fn().mockResolvedValue(expectedResult);
                    const result = await withUtilityErrorHandling(operation, "test");
                    expect(result).toBe(expectedResult);
                    expect(operation).toHaveBeenCalledTimes(1);
                }
            );

            test.prop([fc.string().filter(s => s.length > 0), fc.string()])(
                "should return fallback on error",
                async (operationName, fallbackValue) => {
                    const error = new Error("Test error");
                    const operation = vi.fn().mockRejectedValue(error);

                    const result = await withUtilityErrorHandling(
                        operation,
                        operationName,
                        fallbackValue,
                        false
                    );

                    expect(result).toBe(fallbackValue);
                    expect(operation).toHaveBeenCalledTimes(1);
                }
            );

            test.prop([fc.string().filter(s => s.length > 0)])(
                "should throw when shouldThrow is true",
                async (operationName) => {
                    const error = new Error("Test error");
                    const operation = vi.fn().mockRejectedValue(error);

                    await expect(
                        withUtilityErrorHandling(operation, operationName, undefined, true)
                    ).rejects.toBe(error);

                    expect(operation).toHaveBeenCalledTimes(1);
                }
            );
        });
    });
});
