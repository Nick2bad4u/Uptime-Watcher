/**
 * Test suite for retry utilities
 *
 * @module Retry
 *
 * @file Comprehensive tests for retry utility functions in the Uptime Watcher
 *   application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Backend Utilities
 *
 * @tags ["test", "electron", "utils", "retry", "resilience"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the logger dependency before importing the module under test
vi.mock("../../utils/logger.js", () => {
    const createLoggerMock = () => ({
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    });
    return {
        dbLogger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

// Import the module under test and mocked dependencies
import { withDbRetry, withRetry } from "../../utils/retry.js";
import { dbLogger } from "../../utils/logger.js";

describe("Retry Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe(withRetry, () => {
        describe("Success scenarios", () => {
            it("should return result when operation succeeds on first try", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockResolvedValue("success");

                const result = await withRetry(operation);

                expect(result).toBe("success");
                expect(operation).toHaveBeenCalledTimes(1);
                expect(dbLogger.error).not.toHaveBeenCalled();
            });

            it("should return result when operation succeeds after retries", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("failure 1"))
                    .mockRejectedValueOnce(new Error("failure 2"))
                    .mockResolvedValueOnce("success");

                const resultPromise = withRetry(operation);

                // Fast-forward through delays
                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("success");
                expect(operation).toHaveBeenCalledTimes(3);
                expect(dbLogger.error).toHaveBeenCalledTimes(2); // Called for the 2 failures
            });

            it("should handle different return types correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const numberOperation = vi.fn().mockResolvedValue(42);
                const objectOperation = vi
                    .fn()
                    .mockResolvedValue({ key: "value" });
                const arrayOperation = vi.fn().mockResolvedValue([
                    1,
                    2,
                    3,
                ]);

                await expect(withRetry(numberOperation)).resolves.toBe(42);
                await expect(withRetry(objectOperation)).resolves.toEqual({
                    key: "value",
                });
                await expect(withRetry(arrayOperation)).resolves.toEqual([
                    1,
                    2,
                    3,
                ]);
            });
        });

        describe("Failure scenarios", () => {
            it("should throw last error when all retries are exhausted", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const error1 = new Error("error 1");
                const error2 = new Error("error 2");
                const error3 = new Error("error 3");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(error1)
                    .mockRejectedValueOnce(error2)
                    .mockRejectedValueOnce(error3);

                const resultPromise = withRetry(operation, { maxRetries: 3 });

                // Fast-forward through delays
                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError("error 3");
                expect(operation).toHaveBeenCalledTimes(3);
                expect(dbLogger.error).toHaveBeenCalledTimes(4); // 3 failures + 1 persistent failure log
            });

            it("should handle non-Error thrown values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce("string error")
                    .mockRejectedValueOnce(404)
                    .mockRejectedValueOnce(null);

                const resultPromise = withRetry(operation, { maxRetries: 3 });

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toBe(null);
                expect(operation).toHaveBeenCalledTimes(3);
            });
        });

        describe("Configuration options", () => {
            it("should use custom delay between retries", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("failure"))
                    .mockResolvedValueOnce("success");

                const resultPromise = withRetry(operation, { delayMs: 1000 });

                // Should not resolve immediately after first failure
                await vi.advanceTimersByTimeAsync(500);
                expect(operation).toHaveBeenCalledTimes(1);

                // Should retry after full delay
                await vi.advanceTimersByTimeAsync(500);
                const result = await resultPromise;

                expect(result).toBe("success");
                expect(operation).toHaveBeenCalledTimes(2);
            });

            it("should respect custom maxRetries setting", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("always fails"));

                const resultPromise = withRetry(operation, { maxRetries: 2 });

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError(
                    "always fails"
                );
                expect(operation).toHaveBeenCalledTimes(2);
            });

            it("should use custom operation name in logs", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("test error"));

                const resultPromise = withRetry(operation, {
                    maxRetries: 1,
                    operationName: "Custom Test Operation",
                });

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError("test error");

                expect(dbLogger.error).toHaveBeenCalledWith(
                    "Custom Test Operation failed (attempt 1/1)",
                    expect.any(Error)
                );
                expect(dbLogger.error).toHaveBeenCalledWith(
                    "Persistent failure after 1 retries for Custom Test Operation",
                    expect.any(Error)
                );
            });

            it("should call custom onError callback when provided", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const onError = vi.fn();
                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("error 1"))
                    .mockRejectedValueOnce(new Error("error 2"))
                    .mockResolvedValueOnce("success");

                const resultPromise = withRetry(operation, { onError });

                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("success");
                expect(onError).toHaveBeenCalledTimes(2);
                expect(onError).toHaveBeenNthCalledWith(
                    1,
                    expect.any(Error),
                    1
                );
                expect(onError).toHaveBeenNthCalledWith(
                    2,
                    expect.any(Error),
                    2
                );

                // Should not call default logger when custom onError is provided (no attempt logs)
                expect(dbLogger.error).toHaveBeenCalledTimes(0); // No logs since operation succeeded
            });

            it("should use default values when options are not provided", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockResolvedValue("default success");

                const result = await withRetry(operation);

                expect(result).toBe("default success");
                expect(operation).toHaveBeenCalledTimes(1);
            });

            it("should handle empty options object", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockResolvedValue("empty options success");

                const result = await withRetry(operation, {});

                expect(result).toBe("empty options success");
                expect(operation).toHaveBeenCalledTimes(1);
            });
        });

        describe("Edge cases and error handling", () => {
            it("should handle maxRetries of 0", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("immediate failure"));

                const resultPromise = withRetry(operation, { maxRetries: 0 });

                await expect(resultPromise).rejects.toThrowError(
                    "immediate failure"
                );
                expect(operation).not.toHaveBeenCalled();
            });

            it("should handle maxRetries of 1", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("single attempt"));

                const resultPromise = withRetry(operation, { maxRetries: 1 });

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError(
                    "single attempt"
                );
                expect(operation).toHaveBeenCalledTimes(1);
            });

            it("should handle very high maxRetries", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("failure"))
                    .mockResolvedValueOnce("eventual success");

                const resultPromise = withRetry(operation, {
                    maxRetries: 1000,
                });

                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("eventual success");
                expect(operation).toHaveBeenCalledTimes(2);
            });

            it("should handle operation that throws synchronously", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockImplementation(() => {
                    throw new Error("synchronous error");
                });

                const resultPromise = withRetry(operation, { maxRetries: 2 });

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError(
                    "synchronous error"
                );
                expect(operation).toHaveBeenCalledTimes(2);
            });

            it("should handle negative delay", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("failure"))
                    .mockResolvedValueOnce("success");

                const resultPromise = withRetry(operation, { delayMs: -100 });

                // Should still work with negative delay (treated as 0)
                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("success");
                expect(operation).toHaveBeenCalledTimes(2);
            });
        });

        describe("Timing and concurrency", () => {
            it("should respect precise timing for delays", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("failure"))
                    .mockResolvedValueOnce("success");

                const resultPromise = withRetry(operation, { delayMs: 500 });

                // Should not retry before delay is complete
                await vi.advanceTimersByTimeAsync(499);
                expect(operation).toHaveBeenCalledTimes(1);

                // Should retry after delay
                await vi.advanceTimersByTimeAsync(1);
                const result = await resultPromise;

                expect(result).toBe("success");
                expect(operation).toHaveBeenCalledTimes(2);
            });

            it("should handle multiple concurrent retry operations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation1 = vi.fn().mockResolvedValue("result1");
                const operation2 = vi.fn().mockResolvedValue("result2");

                const [result1, result2] = await Promise.all([
                    withRetry(operation1),
                    withRetry(operation2),
                ]);

                expect(result1).toBe("result1");
                expect(result2).toBe("result2");
                expect(operation1).toHaveBeenCalledTimes(1);
                expect(operation2).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe(withDbRetry, () => {
        describe("Function behavior", () => {
            it("should use optimized database settings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockResolvedValue("db success");

                const result = await withDbRetry(
                    operation,
                    "test db operation"
                );

                expect(result).toBe("db success");
                expect(operation).toHaveBeenCalledTimes(1);
            });

            it("should use default maxRetries of 5", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("db error"));

                const resultPromise = withDbRetry(
                    operation,
                    "test db operation"
                );

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError("db error");
                expect(operation).toHaveBeenCalledTimes(5);
            });

            it("should accept custom maxRetries parameter", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("db error"));

                const resultPromise = withDbRetry(
                    operation,
                    "test db operation",
                    3
                );

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError("db error");
                expect(operation).toHaveBeenCalledTimes(3);
            });

            it("should use 300ms delay for database operations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("db failure"))
                    .mockResolvedValueOnce("db success");

                const resultPromise = withDbRetry(
                    operation,
                    "test db operation"
                );

                // Should not retry before 300ms delay
                await vi.advanceTimersByTimeAsync(299);
                expect(operation).toHaveBeenCalledTimes(1);

                // Should retry after 300ms delay
                await vi.advanceTimersByTimeAsync(1);
                const result = await resultPromise;

                expect(result).toBe("db success");
                expect(operation).toHaveBeenCalledTimes(2);
            });

            it("should pass operation name to logging", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("db connection error"));

                const resultPromise = withDbRetry(
                    operation,
                    "database initialization"
                );

                await vi.runAllTimersAsync();

                await expect(resultPromise).rejects.toThrowError(
                    "db connection error"
                );

                expect(dbLogger.error).toHaveBeenCalledWith(
                    "database initialization failed (attempt 1/5)",
                    expect.any(Error)
                );
            });

            it("should handle database-specific error types", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                // Mock common database error scenarios
                const sqliteError = new Error(
                    "SQLITE_BUSY: database is locked"
                );
                const connectionError = new Error("Connection timeout");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(sqliteError)
                    .mockRejectedValueOnce(connectionError)
                    .mockResolvedValueOnce("db recovered");

                const resultPromise = withDbRetry(operation, "database query");

                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("db recovered");
                expect(operation).toHaveBeenCalledTimes(3);
            });

            it("should work with different database operation return types", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const insertOp = vi
                    .fn()
                    .mockResolvedValue({ insertId: 1, changes: 1 });
                const selectOp = vi
                    .fn()
                    .mockResolvedValue([{ id: 1, name: "test" }]);
                const countOp = vi.fn().mockResolvedValue(42);

                const insertResult = await withDbRetry(
                    insertOp,
                    "insert operation"
                );
                const selectResult = await withDbRetry(
                    selectOp,
                    "select operation"
                );
                const countResult = await withDbRetry(
                    countOp,
                    "count operation"
                );

                expect(insertResult).toEqual({ insertId: 1, changes: 1 });
                expect(selectResult).toEqual([{ id: 1, name: "test" }]);
                expect(countResult).toBe(42);
            });
        });

        describe("Integration with withRetry", () => {
            it("should be a wrapper around withRetry with specific parameters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockResolvedValue("wrapped result");

                const result = await withDbRetry(operation, "wrapper test");

                expect(result).toBe("wrapped result");
                // Should use the same error logging as withRetry
                expect(dbLogger.error).not.toHaveBeenCalled();
            });

            it("should preserve all withRetry functionality", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("transient error"))
                    .mockResolvedValueOnce("eventual success");

                const resultPromise = withDbRetry(
                    operation,
                    "functionality test"
                );

                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("eventual success");
                expect(operation).toHaveBeenCalledTimes(2);
                expect(dbLogger.error).toHaveBeenCalledTimes(1); // One failure logged
            });
        });

        describe("Real-world database scenarios", () => {
            it("should handle database lock contention", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const lockError = new Error("SQLITE_BUSY");
                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(lockError)
                    .mockRejectedValueOnce(lockError)
                    .mockResolvedValueOnce("lock resolved");

                const resultPromise = withDbRetry(operation, "database write");

                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("lock resolved");
                expect(operation).toHaveBeenCalledTimes(3);
            });

            it("should handle connection pool exhaustion", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const poolError = new Error("Connection pool exhausted");
                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(poolError)
                    .mockResolvedValueOnce("connection available");

                const resultPromise = withDbRetry(operation, "connection test");

                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("connection available");
                expect(operation).toHaveBeenCalledTimes(2);
            });

            it("should handle transaction deadlocks", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: retry", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const deadlockError = new Error(
                    "Transaction deadlock detected"
                );
                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(deadlockError)
                    .mockResolvedValueOnce("transaction completed");

                const resultPromise = withDbRetry(
                    operation,
                    "transaction retry"
                );

                await vi.runAllTimersAsync();
                const result = await resultPromise;

                expect(result).toBe("transaction completed");
                expect(operation).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("Error collection and reporting", () => {
        it("should collect all errors during retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: retry", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errors = [
                new Error("error 1"),
                new Error("error 2"),
                new Error("error 3"),
            ];

            const operation = vi
                .fn()
                .mockRejectedValueOnce(errors[0])
                .mockRejectedValueOnce(errors[1])
                .mockRejectedValueOnce(errors[2]);

            const resultPromise = withRetry(operation, { maxRetries: 3 });

            await vi.runAllTimersAsync();

            await expect(resultPromise).rejects.toBe(errors[2]); // Last error is thrown

            // All errors should be logged
            expect(dbLogger.error).toHaveBeenCalledWith(
                "operation failed (attempt 1/3)",
                errors[0]
            );
            expect(dbLogger.error).toHaveBeenCalledWith(
                "operation failed (attempt 2/3)",
                errors[1]
            );
            expect(dbLogger.error).toHaveBeenCalledWith(
                "operation failed (attempt 3/3)",
                errors[2]
            );
        });
    });

    describe("Performance and memory considerations", () => {
        it("should not leak memory with many retries", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: retry", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Create fresh operations for each retry to avoid shared state
            const promises = Array.from({ length: 100 }, (_, i) => {
                const operation = vi
                    .fn()
                    .mockRejectedValueOnce(new Error("failure"))
                    .mockResolvedValueOnce(`success-${i}`);
                return withRetry(operation, { maxRetries: 2 });
            });

            await vi.runAllTimersAsync();
            const results = await Promise.all(promises);

            expect(results).toHaveLength(100);
            expect(results.every((r, i) => r === `success-${i}`)).toBeTruthy();
        });

        it("should handle rapid-fire operations efficiently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: retry", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const operations = Array.from({ length: 10 }, (_, i) =>
                vi.fn().mockResolvedValue(`result-${i}`)
            );

            const promises = operations.map((op, i) =>
                withRetry(op, { operationName: `operation-${i}` })
            );

            const results = await Promise.all(promises);

            expect(results).toEqual(
                Array.from({ length: 10 }, (_, i) => `result-${i}`)
            );
            for (const op of operations) {
                expect(op).toHaveBeenCalledTimes(1);
            }
        });
    });
});
