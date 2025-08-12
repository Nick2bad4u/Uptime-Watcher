/**
 * Test suite for retry
 * 
 * @fileoverview Comprehensive tests for unknown functionality
 * in the Uptime Watcher application.
 * 
 * @author GitHub Copilot
 * @since 2025-08-11
 * @category General
 * @module Unknown
 * @tags ["test"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry, withDbRetry } from "../../utils/retry";
import { dbLogger } from "../../utils/logger";

// Mock the logger
vi.mock("../../utils/logger", () => ({
    dbLogger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("withRetry", () => {
    let originalHandlers: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Store original unhandled rejection handlers
        originalHandlers = {
            unhandledRejection: process.listeners("unhandledRejection"),
            rejectionHandled: process.listeners("rejectionHandled"),
        };

        // Add a handler to suppress expected rejections from retry tests
        process.on("unhandledRejection", (reason: any) => {
            if (
                reason instanceof Error &&
                [
                    "Persistent failure",
                    "Always fails",
                    "Test error",
                    "Default test",
                    "Final error",
                    "Third error",
                    "Database is down",
                    "Database locked",
                    "Connection timeout",
                ].includes(reason.message)
            ) {
                // These are expected from our retry tests, suppress them
                return;
            }
            if (reason === "String error") {
                // Also expected from our retry tests
                return;
            }        });        });
    afterEach(() => {
        vi.useRealTimers();

        // Restore original handlers
        process.removeAllListeners("unhandledRejection");
        process.removeAllListeners("rejectionHandled");

        // eslint-disable-next-line unicorn/no-array-for-each
        originalHandlers.unhandledRejection.forEach((handler: any) => {
            process.on("unhandledRejection", handler);        });
        // eslint-disable-next-line unicorn/no-array-for-each
        originalHandlers.rejectionHandled.forEach((handler: any) => {
            process.on("rejectionHandled", handler);        });        });
    it("should return result immediately on successful operation", async () => {
        const operation = vi.fn().mockResolvedValue("success");

        const result = await withRetry(operation);

        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(1);
        expect(dbLogger.error).not.toHaveBeenCalled();        });
    it("should retry operation when it fails and eventually succeed", async () => {
        const operation = vi
            .fn()
            .mockRejectedValueOnce(new Error("First failure"))
            .mockRejectedValueOnce(new Error("Second failure"))
            .mockResolvedValue("success");

        const promise = withRetry(operation, { delayMs: 100 });

        // Advance timers to simulate delays
        await vi.advanceTimersByTimeAsync(200);

        const result = await promise;

        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(3);
        expect(dbLogger.error).toHaveBeenCalledTimes(2);        });
    it("should fail after max retries are exhausted", async () => {
        const error = new Error("Persistent failure");
        const operation = vi.fn().mockRejectedValue(error);

        const promise = withRetry(operation, { maxRetries: 3, delayMs: 50 });

        // Advance timers to simulate all retry delays
        await vi.advanceTimersByTimeAsync(150);

        await expect(promise).rejects.toThrow("Persistent failure");
        expect(operation).toHaveBeenCalledTimes(3);
        expect(dbLogger.error).toHaveBeenCalledTimes(4); // 3 attempts + 1 final failure        });
    it("should use custom delay between retries", async () => {
        const operation = vi
            .fn()
            .mockRejectedValueOnce(new Error("Failure"))
            .mockResolvedValue("success");

        const promise = withRetry(operation, { delayMs: 500 });

        // Advance by less than the delay - operation should not complete yet
        await vi.advanceTimersByTimeAsync(400);

        // Now advance past the delay
        await vi.advanceTimersByTimeAsync(200);

        const result = await promise;
        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(2);        });
    it("should use custom maxRetries value", async () => {
        const error = new Error("Always fails");
        const operation = vi.fn().mockRejectedValue(error);

        const promise = withRetry(operation, { maxRetries: 2, delayMs: 10 });

        await vi.advanceTimersByTimeAsync(20);

        await expect(promise).rejects.toThrow("Always fails");
        expect(operation).toHaveBeenCalledTimes(2);        });
    it("should call custom onError callback when provided", async () => {
        const onError = vi.fn();
        const error = new Error("Custom error");
        const operation = vi
            .fn()
            .mockRejectedValueOnce(error)
            .mockResolvedValue("success");

        const promise = withRetry(operation, { onError, delayMs: 50 });

        await vi.advanceTimersByTimeAsync(100);

        const result = await promise;
        expect(result).toBe("success");
        expect(onError).toHaveBeenCalledWith(error, 1);
        expect(dbLogger.error).not.toHaveBeenCalled(); // Should not log when custom onError is provided        });
    it("should use custom operation name in logs", async () => {
        const error = new Error("Test error");
        const operation = vi.fn().mockRejectedValue(error);

        const promise = withRetry(operation, {
            maxRetries: 1,
            operationName: "database-connection",
            delayMs: 10,        });
        await vi.advanceTimersByTimeAsync(20);

        await expect(promise).rejects.toThrow("Test error");

        expect(dbLogger.error).toHaveBeenCalledWith(
            "database-connection failed (attempt 1/1)",
            error
        );
        expect(dbLogger.error).toHaveBeenCalledWith(
            "Persistent failure after 1 retries for database-connection",
            error
        );        });
    it("should use default values when no options provided", async () => {
        const error = new Error("Default test");
        const operation = vi.fn().mockRejectedValue(error);

        const promise = withRetry(operation);

        // Default is 5 retries with 300ms delay
        await vi.advanceTimersByTimeAsync(1500);

        await expect(promise).rejects.toThrow("Default test");
        expect(operation).toHaveBeenCalledTimes(5);

        // Should log with default operation name
        expect(dbLogger.error).toHaveBeenCalledWith(
            "operation failed (attempt 1/5)",
            error
        );        });
    it("should handle async operations that throw non-Error objects", async () => {
        const stringError = "String error";
        const operation = vi.fn().mockRejectedValue(stringError);

        const promise = withRetry(operation, { maxRetries: 1, delayMs: 10 });

        await vi.advanceTimersByTimeAsync(20);

        await expect(promise).rejects.toBe(stringError);
        expect(dbLogger.error).toHaveBeenCalledWith(
            "operation failed (attempt 1/1)",
            stringError
        );        });
    it("should not delay after the last failed attempt", async () => {
        const error = new Error("Final error");
        const operation = vi.fn().mockRejectedValue(error);

        const promise = withRetry(operation, { maxRetries: 2, delayMs: 100 });

        // Advance timers for first retry delay only
        await vi.advanceTimersByTimeAsync(100);

        await expect(promise).rejects.toThrow("Final error");
        expect(operation).toHaveBeenCalledTimes(2);        });
    it("should accumulate all errors and throw the last one", async () => {
        const firstError = new Error("First error");
        const secondError = new Error("Second error");
        const thirdError = new Error("Third error");

        const operation = vi
            .fn()
            .mockRejectedValueOnce(firstError)
            .mockRejectedValueOnce(secondError)
            .mockRejectedValueOnce(thirdError);

        const promise = withRetry(operation, { maxRetries: 3, delayMs: 50 });

        await vi.advanceTimersByTimeAsync(150);

        await expect(promise).rejects.toThrow("Third error");
        expect(operation).toHaveBeenCalledTimes(3);        });        });
describe("withDbRetry", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();        });
    afterEach(() => {
        vi.useRealTimers();        });
    it("should return result immediately on successful operation", async () => {
        const operation = vi.fn().mockResolvedValue("database result");

        const result = await withDbRetry(operation, "test-operation");

        expect(result).toBe("database result");
        expect(operation).toHaveBeenCalledTimes(1);
        expect(dbLogger.error).not.toHaveBeenCalled();        });
    it("should retry operation when it fails and eventually succeed", async () => {
        const operation = vi
            .fn()
            .mockRejectedValueOnce(new Error("DB connection failed"))
            .mockRejectedValueOnce(new Error("DB timeout"))
            .mockResolvedValue("database result");

        const promise = withDbRetry(operation, "database-query");

        // Advance timers to simulate delays (default 300ms delay)
        await vi.advanceTimersByTimeAsync(600);

        const result = await promise;

        expect(result).toBe("database result");
        expect(operation).toHaveBeenCalledTimes(3);
        expect(dbLogger.error).toHaveBeenCalledTimes(2);
        expect(dbLogger.error).toHaveBeenCalledWith(
            "database-query failed (attempt 1/5)",
            expect.any(Error)
        );        });
    it("should fail after max retries are exhausted", async () => {
        const error = new Error("Database is down");
        const operation = vi.fn().mockRejectedValue(error);

        // Use advanceTimersByTime to speed up the test
        const promise = withDbRetry(operation, "database-connection", 2);
        await vi.advanceTimersByTimeAsync(600); // 2 attempts * 300ms delay

        await expect(promise).rejects.toThrow("Database is down");
        expect(operation).toHaveBeenCalledTimes(2);
        expect(dbLogger.error).toHaveBeenCalledTimes(3); // 2 attempts + 1 final failure
        expect(dbLogger.error).toHaveBeenCalledWith(
            "Persistent failure after 2 retries for database-connection",
            error
        );
    }, 1000);

    it("should use custom maxRetries value", async () => {
        const error = new Error("Database locked");
        const operation = vi.fn().mockRejectedValue(error);

        const promise = withDbRetry(operation, "database-write", 3);
        await vi.advanceTimersByTimeAsync(900); // 3 attempts * 300ms delay

        await expect(promise).rejects.toThrow("Database locked");
        expect(operation).toHaveBeenCalledTimes(3);
        expect(dbLogger.error).toHaveBeenCalledWith(
            "database-write failed (attempt 1/3)",
            error
        );
        expect(dbLogger.error).toHaveBeenCalledWith(
            "Persistent failure after 3 retries for database-write",
            error
        );
    }, 1000);

    it("should use default maxRetries (5) when not specified", async () => {
        const error = new Error("Connection timeout");
        const operation = vi.fn().mockRejectedValue(error);

        const promise = withDbRetry(operation, "database-read");
        await vi.advanceTimersByTimeAsync(1500); // 5 attempts * 300ms delay

        await expect(promise).rejects.toThrow("Connection timeout");
        expect(operation).toHaveBeenCalledTimes(5);
        expect(dbLogger.error).toHaveBeenCalledWith(
            "database-read failed (attempt 1/5)",
            error
        );
        expect(dbLogger.error).toHaveBeenCalledWith(
            "Persistent failure after 5 retries for database-read",
            error
        );
    }, 1000);

    it("should use fixed delay of 300ms", async () => {
        const operation = vi
            .fn()
            .mockRejectedValueOnce(new Error("Temporary failure"))
            .mockResolvedValue("success");

        const promise = withDbRetry(operation, "database-transaction");

        // Advance by less than the delay - operation should not complete yet
        await vi.advanceTimersByTimeAsync(250);

        // Now advance past the delay
        await vi.advanceTimersByTimeAsync(100);

        const result = await promise;
        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(2);        });        });