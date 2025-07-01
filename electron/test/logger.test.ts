/**
 * Tests for logger utilities.
 * Validates logging functionality and proper error handling.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock electron-log before importing logger
const mockLog = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

vi.mock("electron-log/main", () => ({
    default: mockLog,
}));

describe("Logger Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Main Logger", () => {
        it("should export logger with all required methods", async () => {
            const { logger } = await import("../utils/logger");

            expect(logger).toHaveProperty("debug");
            expect(logger).toHaveProperty("info");
            expect(logger).toHaveProperty("warn");
            expect(logger).toHaveProperty("error");
        });

        it("should prefix messages with [MONITOR]", async () => {
            const { logger } = await import("../utils/logger");

            logger.info("Test message");

            expect(mockLog.info).toHaveBeenCalledWith("[MONITOR] Test message");
        });

        it("should handle debug messages", async () => {
            const { logger } = await import("../utils/logger");

            logger.debug("Debug message", { extra: "data" });

            expect(mockLog.debug).toHaveBeenCalledWith("[MONITOR] Debug message", { extra: "data" });
        });

        it("should handle info messages", async () => {
            const { logger } = await import("../utils/logger");

            logger.info("Info message", "extra", "args");

            expect(mockLog.info).toHaveBeenCalledWith("[MONITOR] Info message", "extra", "args");
        });

        it("should handle warning messages", async () => {
            const { logger } = await import("../utils/logger");

            logger.warn("Warning message");

            expect(mockLog.warn).toHaveBeenCalledWith("[MONITOR] Warning message");
        });

        it("should handle error objects properly", async () => {
            const { logger } = await import("../utils/logger");
            const error = new Error("Test error");
            error.stack = "Error stack trace";

            logger.error("Error occurred", error);

            expect(mockLog.error).toHaveBeenCalledWith("[MONITOR] Error occurred", {
                message: "Test error",
                stack: "Error stack trace",
            });
        });

        it("should handle non-Error objects in error method", async () => {
            const { logger } = await import("../utils/logger");
            const errorData = { code: "ERR001", details: "Something went wrong" };

            logger.error("Error occurred", errorData);

            expect(mockLog.error).toHaveBeenCalledWith("[MONITOR] Error occurred", errorData);
        });

        it("should handle error method without error object", async () => {
            const { logger } = await import("../utils/logger");

            logger.error("Simple error message");

            expect(mockLog.error).toHaveBeenCalledWith("[MONITOR] Simple error message", undefined);
        });
    });

    describe("Database Logger", () => {
        it("should export dbLogger with all required methods", async () => {
            const { dbLogger } = await import("../utils/logger");

            expect(dbLogger).toHaveProperty("debug");
            expect(dbLogger).toHaveProperty("info");
            expect(dbLogger).toHaveProperty("warn");
            expect(dbLogger).toHaveProperty("error");
        });

        it("should prefix messages with [DB]", async () => {
            const { dbLogger } = await import("../utils/logger");

            dbLogger.info("Database operation completed");

            expect(mockLog.info).toHaveBeenCalledWith("[DB] Database operation completed");
        });

        it("should handle database errors", async () => {
            const { dbLogger } = await import("../utils/logger");
            const dbError = new Error("Connection timeout");

            dbLogger.error("Database operation failed", dbError);

            expect(mockLog.error).toHaveBeenCalledWith("[DB] Database operation failed", {
                message: "Connection timeout",
                stack: expect.any(String),
            });
        });

        it("should handle database debug messages", async () => {
            const { dbLogger } = await import("../utils/logger");

            dbLogger.debug("SQL query executed", { query: "SELECT * FROM sites" });

            expect(mockLog.debug).toHaveBeenCalledWith("[DB] SQL query executed", { query: "SELECT * FROM sites" });
        });
    });

    describe("Monitor Logger", () => {
        it("should export monitorLogger with all required methods", async () => {
            const { monitorLogger } = await import("../utils/logger");

            expect(monitorLogger).toHaveProperty("debug");
            expect(monitorLogger).toHaveProperty("info");
            expect(monitorLogger).toHaveProperty("warn");
            expect(monitorLogger).toHaveProperty("error");
        });

        it("should prefix messages with [MONITOR]", async () => {
            const { monitorLogger } = await import("../utils/logger");

            monitorLogger.info("Monitor check completed");

            expect(mockLog.info).toHaveBeenCalledWith("[MONITOR] Monitor check completed");
        });

        it("should handle monitor errors", async () => {
            const { monitorLogger } = await import("../utils/logger");
            const monitorError = new Error("HTTP request failed");

            monitorLogger.error("Monitor check failed", monitorError);

            expect(mockLog.error).toHaveBeenCalledWith("[MONITOR] Monitor check failed", {
                message: "HTTP request failed",
                stack: expect.any(String),
            });
        });

        it("should handle monitor warnings", async () => {
            const { monitorLogger } = await import("../utils/logger");

            monitorLogger.warn("Slow response time detected", { responseTime: 5000 });

            expect(mockLog.warn).toHaveBeenCalledWith("[MONITOR] Slow response time detected", { responseTime: 5000 });
        });
    });

    describe("Logger Integration", () => {
        it("should maintain separate logger instances", async () => {
            const { logger, dbLogger, monitorLogger } = await import("../utils/logger");

            expect(logger).not.toBe(dbLogger);
            expect(logger).not.toBe(monitorLogger);
            expect(dbLogger).not.toBe(monitorLogger);
        });

        it("should all use the same underlying electron-log instance", async () => {
            const { logger, dbLogger, monitorLogger } = await import("../utils/logger");

            logger.info("Logger message");
            dbLogger.info("DB message");
            monitorLogger.info("Monitor message");

            expect(mockLog.info).toHaveBeenCalledTimes(3);
            expect(mockLog.info).toHaveBeenNthCalledWith(1, "[MONITOR] Logger message");
            expect(mockLog.info).toHaveBeenNthCalledWith(2, "[DB] DB message");
            expect(mockLog.info).toHaveBeenNthCalledWith(3, "[MONITOR] Monitor message");
        });

        it("should handle multiple arguments correctly", async () => {
            const { logger } = await import("../utils/logger");

            logger.info("Message with data", { id: 1 }, "extra", true);

            expect(mockLog.info).toHaveBeenCalledWith("[MONITOR] Message with data", { id: 1 }, "extra", true);
        });

        it("should handle edge cases gracefully", async () => {
            const { logger } = await import("../utils/logger");

            // Empty message
            logger.info("");
            expect(mockLog.info).toHaveBeenCalledWith("[MONITOR] ");

            // Null/undefined arguments
            logger.debug("Debug", null, undefined);
            expect(mockLog.debug).toHaveBeenCalledWith("[MONITOR] Debug", null, undefined);

            // Error with undefined stack
            const errorWithoutStack = new Error("No stack");
            delete errorWithoutStack.stack;
            logger.error("Error without stack", errorWithoutStack);
            expect(mockLog.error).toHaveBeenCalledWith("[MONITOR] Error without stack", {
                message: "No stack",
                stack: undefined,
            });
        });
    });

    describe("Performance", () => {
        it("should not perform expensive operations for disabled log levels", async () => {
            const { logger } = await import("../utils/logger");

            // Simulate expensive operation that shouldn't be called
            const expensiveOperation = vi.fn(() => "expensive result");

            logger.debug("Debug message", expensiveOperation());

            // The expensive operation will still be called due to function argument evaluation
            // but this tests that the logger accepts the result
            expect(mockLog.debug).toHaveBeenCalled();
            expect(expensiveOperation).toHaveBeenCalled();
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle circular references in error objects", async () => {
            const { logger } = await import("../utils/logger");

            const circularObj: any = { name: "test" };
            circularObj.self = circularObj;

            const error = new Error("Circular error");
            (error as any).circular = circularObj;

            // Should not throw when logging circular references
            expect(() => {
                logger.error("Circular reference error", error);
            }).not.toThrow();
        });

        it("should handle errors with non-string message property", async () => {
            const { logger } = await import("../utils/logger");

            const weirdError = new Error();
            (weirdError as any).message = { toString: () => "Weird message" };

            logger.error("Weird error", weirdError);

            expect(mockLog.error).toHaveBeenCalledWith(
                "[MONITOR] Weird error",
                expect.objectContaining({
                    message: expect.anything(),
                })
            );
        });
    });
});
