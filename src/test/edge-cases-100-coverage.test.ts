/**
 * Comprehensive edge case tests for 100% coverage of critical utility
 * functions.
 *
 * @remarks
 * This test suite focuses on edge cases and error paths that might be missed in
 * regular unit tests to achieve complete code coverage.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Import utilities to test
import { generateUuid } from "../utils/data/generateUuid";
import { ensureError, withUtilityErrorHandling } from "../utils/errorHandling";
import { isNullOrUndefined, withAsyncErrorHandling } from "../utils/fallbacks";

// Mock logger
vi.mock("../services/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("100% Coverage Edge Cases", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("UUID Generation Edge Cases", () => {
        it("should handle crypto.randomUUID throwing an error", () => {
            // Mock crypto that throws
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: {
                    randomUUID: vi.fn().mockImplementation(() => {
                        throw new Error("Crypto error");
                    }),
                },
            });

            const uuid = generateUuid();
            expect(uuid).toMatch(/^site-\w+-\d+$/);
        });

        it("should handle undefined crypto", () => {
            // Ensure crypto is undefined
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: undefined,
            });

            const uuid = generateUuid();
            expect(uuid).toMatch(/^site-\w+-\d+$/);
        });

        it("should handle crypto without randomUUID method", () => {
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: {},
            });

            const uuid = generateUuid();
            expect(uuid).toMatch(/^site-\w+-\d+$/);
        });

        it("should use crypto.randomUUID when available", () => {
            const mockUuid = "123e4567-e89b-12d3-a456-426614174000";
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: {
                    randomUUID: vi.fn().mockReturnValue(mockUuid),
                },
            });

            const uuid = generateUuid();
            expect(uuid).toBe(mockUuid);
            expect(crypto.randomUUID).toHaveBeenCalled();
        });

        it("should generate consistent fallback format", () => {
            Object.defineProperty(globalThis, "crypto", {
                configurable: true,
                value: undefined,
            });

            const uuid1 = generateUuid();
            const uuid2 = generateUuid();

            expect(uuid1).toMatch(/^site-\w+-\d+$/);
            expect(uuid2).toMatch(/^site-\w+-\d+$/);
            expect(uuid1).not.toBe(uuid2); // Should be different
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle Error instances", () => {
            const error = new Error("Test error");
            const result = ensureError(error);
            expect(result).toBe(error);
        });

        it("should handle string errors", () => {
            const error = "String error";
            const result = ensureError(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("String error");
        });

        it("should handle null errors", () => {
            const result = ensureError(null);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("null");
        });

        it("should handle undefined errors", () => {
            const result = ensureError(undefined);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("undefined");
        });

        it("should handle object errors", () => {
            const error = { message: "Object error" };
            const result = ensureError(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("[object Object]");
        });

        it("should handle number errors", () => {
            const error = 123;
            const result = ensureError(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("123");
        });

        it("should handle boolean errors", () => {
            const result = ensureError(false);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("false");
        });

        it("should handle symbol errors", () => {
            const symbol = Symbol("test");
            const result = ensureError(symbol);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Symbol(test)");
        });

        it("should handle array errors", () => {
            const error = [
                1,
                2,
                3,
            ];
            const result = ensureError(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("1,2,3");
        });
    });

    describe("Async Error Handling Edge Cases", () => {
        it("should handle async operation success", async () => {
            const operation = vi.fn().mockResolvedValue("success");
            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );
            expect(result).toBe("success");
            expect(operation).toHaveBeenCalled();
        });

        it("should handle async operation failure with fallback", async () => {
            const operation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            const { logger } = await import("../services/logger");

            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );

            expect(result).toBe("fallback");
            expect(logger.error).toHaveBeenCalledWith(
                "test-operation failed",
                expect.any(Error)
            );
        });

        it("should handle async operation failure with throw", async () => {
            const operation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            await expect(
                withUtilityErrorHandling(
                    operation,
                    "test-operation",
                    undefined,
                    true
                )
            ).rejects.toThrow("Async error");
        });

        it("should handle async operation failure without fallback", async () => {
            const operation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            await expect(
                withUtilityErrorHandling(operation, "test-operation")
            ).rejects.toThrow(
                "test-operation failed and no fallback value provided"
            );
        });

        it("should handle non-Error rejection", async () => {
            const operation = vi.fn().mockRejectedValue("string error");
            const { logger } = await import("../services/logger");

            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );

            expect(result).toBe("fallback");
            expect(logger.error).toHaveBeenCalledWith(
                "test-operation failed",
                expect.any(Error)
            );
        });

        it("should handle operation that returns undefined", async () => {
            const operation = vi.fn().mockResolvedValue(undefined);
            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );
            expect(result).toBeUndefined();
        });

        it("should handle operation that returns null", async () => {
            const operation = vi.fn().mockResolvedValue(null);
            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );
            expect(result).toBeNull();
        });

        it("should handle operation that returns falsy values", async () => {
            const operation = vi.fn().mockResolvedValue(0);
            const result = await withUtilityErrorHandling(
                operation,
                "test-operation",
                "fallback",
                false
            );
            expect(result).toBe(0);
        });
    });

    describe("Fallback Utilities Edge Cases", () => {
        it("should identify null values", () => {
            expect(isNullOrUndefined(null)).toBeTruthy();
        });

        it("should identify undefined values", () => {
            expect(isNullOrUndefined(undefined)).toBeTruthy();
        });

        it("should identify non-null/undefined values", () => {
            expect(isNullOrUndefined("")).toBeFalsy();
            expect(isNullOrUndefined(0)).toBeFalsy();
            expect(isNullOrUndefined(false)).toBeFalsy();
            expect(isNullOrUndefined([])).toBeFalsy();
            expect(isNullOrUndefined({})).toBeFalsy();
            expect(isNullOrUndefined("test")).toBeFalsy();
            expect(isNullOrUndefined(1)).toBeFalsy();
            expect(isNullOrUndefined(true)).toBeFalsy();
        });

        it("should handle async error wrapper success", async () => {
            const asyncOp = vi.fn().mockResolvedValue(undefined);
            const wrapper = withAsyncErrorHandling(asyncOp, "test-async");

            expect(typeof wrapper).toBe("function");
            await wrapper();
            expect(asyncOp).toHaveBeenCalled();
        });

        it("should handle async error wrapper with success case", async () => {
            const asyncOp = vi.fn().mockResolvedValue(undefined);
            const wrapper = withAsyncErrorHandling(asyncOp, "test-async");

            expect(typeof wrapper).toBe("function");
            expect(() => wrapper()).not.toThrow();

            // Wait for async operation to complete
            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(asyncOp).toHaveBeenCalled();
        });

        it("should handle multiple async wrapper calls", async () => {
            const asyncOp = vi.fn().mockResolvedValue(undefined);
            const wrapper = withAsyncErrorHandling(asyncOp, "test-async");

            await wrapper();
            await wrapper();
            await wrapper();

            expect(asyncOp).toHaveBeenCalledTimes(3);
        });
    });

    describe("Type Guard Edge Cases", () => {
        it("should handle various falsy values", () => {
            const falsyValues = [
                null,
                undefined,
                false,
                0,
                "",
                Number.NaN,
            ];

            for (const value of falsyValues) {
                if (value === null || value === undefined) {
                    expect(isNullOrUndefined(value)).toBeTruthy();
                } else {
                    expect(isNullOrUndefined(value)).toBeFalsy();
                }
            }
        });

        it("should handle various truthy values", () => {
            const truthyValues = [
                true,
                1,
                "test",
                [],
                {},
                Symbol("test"),
            ];

            for (const value of truthyValues) {
                expect(isNullOrUndefined(value)).toBeFalsy();
            }
        });
    });

    describe("Error Conversion Edge Cases", () => {
        it("should handle complex nested objects", () => {
            const complexObject = {
                nested: {
                    deep: {
                        error: "deeply nested error",
                    },
                },
                array: [
                    1,
                    2,
                    3,
                ],
                toString: () => "Custom toString",
            };

            const result = ensureError(complexObject);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Custom toString");
        });

        it("should handle functions as errors", () => {
            const functionError = () => "I am a function";
            const result = ensureError(functionError);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain("function");
        });

        it("should handle Date objects as errors", () => {
            const dateError = new Date("2023-01-01");
            const result = ensureError(dateError);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain("2022"); // Date parses to the day before due to timezone
        });

        it("should handle RegExp objects as errors", () => {
            const regexError = /test-pattern/gi;
            const result = ensureError(regexError);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("/test-pattern/gi");
        });
    });

    describe("Edge Case Combinations", () => {
        it("should handle multiple error conversions in sequence", () => {
            const errors = [
                "string error",
                123,
                null,
                undefined,
                { custom: "object" },
                new Error("actual error"),
            ];

            const results = errors.map((error) => ensureError(error));

            for (const result of results) {
                expect(result).toBeInstanceOf(Error);
                expect(typeof result.message).toBe("string");
            }

            // Last one should be the same instance
            expect(results.at(-1)).toBe(errors.at(-1));
        });

        it("should handle rapid async operations", async () => {
            const operations = Array.from({ length: 10 }, (_, i) =>
                vi.fn().mockResolvedValue(`result-${i}`)
            );

            const promises = operations.map((op, i) =>
                withUtilityErrorHandling(
                    op,
                    `operation-${i}`,
                    `fallback-${i}`,
                    false
                )
            );

            const results = await Promise.all(promises);

            for (const [i, result] of results.entries()) {
                expect(result).toBe(`result-${i}`);
            }
        });

        it("should handle mixed success/failure async operations", async () => {
            const operations = [
                vi.fn().mockResolvedValue("success-1"),
                vi.fn().mockRejectedValue(new Error("error-1")),
                vi.fn().mockResolvedValue("success-2"),
                vi.fn().mockRejectedValue("string-error"),
            ];

            const promises = operations.map((op, i) =>
                withUtilityErrorHandling(
                    op,
                    `operation-${i}`,
                    `fallback-${i}`,
                    false
                )
            );

            const results = await Promise.all(promises);

            expect(results[0]).toBe("success-1");
            expect(results[1]).toBe("fallback-1");
            expect(results[2]).toBe("success-2");
            expect(results[3]).toBe("fallback-3");
        });
    });

    describe("Boundary Conditions", () => {
        it("should handle extremely long error messages", () => {
            const longMessage = "x".repeat(10_000);
            const result = ensureError(longMessage);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe(longMessage);
        });

        it("should handle empty string errors", () => {
            const result = ensureError("");
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("");
        });

        it("should handle zero as error", () => {
            const result = ensureError(0);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("0");
        });

        it("should handle negative numbers as errors", () => {
            const result = ensureError(-123);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("-123");
        });

        it("should handle Infinity as error", () => {
            const result = ensureError(Infinity);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Infinity");
        });

        it("should handle -Infinity as error", () => {
            const result = ensureError(-Infinity);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("-Infinity");
        });

        it("should handle NaN as error", () => {
            const result = ensureError(Number.NaN);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("NaN");
        });
    });
});
