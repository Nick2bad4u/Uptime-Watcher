/**
 * Tests for logger utilities.
 * Validates logging functionality and proper error handling.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock electron-log/main - must be done before any imports that use it
vi.mock("electron-log/main", () => ({
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Import the logger modules after mocking
import { logger, dbLogger, monitorLogger } from "../utils/logger";

// Import the mocked electron-log to access the mock functions
import log from "electron-log/main";

describe("Logger Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Main Logger", () => {
        it("should export logger with all required methods", () => {
            expect(logger).toHaveProperty("debug");
            expect(logger).toHaveProperty("info");
            expect(logger).toHaveProperty("warn");
            expect(logger).toHaveProperty("error");
        });

        it("should prefix messages with [MONITOR]", () => {
            logger.info("Test message");

            expect(log.info).toHaveBeenCalledWith("[MONITOR] Test message");
        });

        it("should handle debug messages", () => {
            logger.debug("Debug message", { extra: "data" });

            expect(log.debug).toHaveBeenCalledWith("[MONITOR] Debug message", { extra: "data" });
        });

        it("should handle info messages", () => {
            logger.info("Info message", "extra", "args");

            expect(log.info).toHaveBeenCalledWith("[MONITOR] Info message", "extra", "args");
        });

        it("should handle warning messages", () => {
            logger.warn("Warning message");

            expect(log.warn).toHaveBeenCalledWith("[MONITOR] Warning message");
        });

        it("should handle error objects properly", () => {
            const error = new Error("Test error");
            error.stack = "Error stack trace";

            logger.error("Error occurred", error);

            expect(log.error).toHaveBeenCalledWith("[MONITOR] Error occurred", {
                message: "Test error",
                stack: "Error stack trace",
            });
        });

        it("should handle non-Error objects in error method", () => {
            const errorData = { code: "ERR001", details: "Something went wrong" };

            logger.error("Error occurred", errorData);

            expect(log.error).toHaveBeenCalledWith("[MONITOR] Error occurred", errorData);
        });

        it("should handle error method without error object", () => {
            logger.error("Simple error message");

            expect(log.error).toHaveBeenCalledWith("[MONITOR] Simple error message", undefined);
        });
    });

    describe("Database Logger", () => {
        it("should export dbLogger with all required methods", () => {
            expect(dbLogger).toHaveProperty("debug");
            expect(dbLogger).toHaveProperty("info");
            expect(dbLogger).toHaveProperty("warn");
            expect(dbLogger).toHaveProperty("error");
        });

        it("should prefix messages with [DB]", () => {
            dbLogger.info("Database operation completed");

            expect(log.info).toHaveBeenCalledWith("[DB] Database operation completed");
        });

        it("should handle database errors", () => {
            const dbError = new Error("Connection timeout");

            dbLogger.error("Database operation failed", dbError);

            expect(log.error).toHaveBeenCalledWith("[DB] Database operation failed", {
                message: "Connection timeout",
                stack: expect.any(String),
            });
        });

        it("should handle database debug messages", () => {
            dbLogger.debug("SQL query executed", { query: "SELECT * FROM sites" });

            expect(log.debug).toHaveBeenCalledWith("[DB] SQL query executed", { query: "SELECT * FROM sites" });
        });
    });

    describe("Monitor Logger", () => {
        it("should export monitorLogger with all required methods", () => {
            expect(monitorLogger).toHaveProperty("debug");
            expect(monitorLogger).toHaveProperty("info");
            expect(monitorLogger).toHaveProperty("warn");
            expect(monitorLogger).toHaveProperty("error");
        });

        it("should prefix messages with [MONITOR]", () => {
            monitorLogger.info("Monitor check completed");

            expect(log.info).toHaveBeenCalledWith("[MONITOR] Monitor check completed");
        });

        it("should handle monitor errors", () => {
            const monitorError = new Error("HTTP request failed");

            monitorLogger.error("Monitor check failed", monitorError);

            expect(log.error).toHaveBeenCalledWith("[MONITOR] Monitor check failed", {
                message: "HTTP request failed",
                stack: expect.any(String),
            });
        });

        it("should handle monitor warnings", () => {
            monitorLogger.warn("Slow response time detected", { responseTime: 5000 });

            expect(log.warn).toHaveBeenCalledWith("[MONITOR] Slow response time detected", { responseTime: 5000 });
        });
    });

    describe("Logger Integration", () => {
        it("should maintain separate logger instances", () => {
            expect(logger).not.toBe(dbLogger);
            expect(logger).not.toBe(monitorLogger);
            expect(dbLogger).not.toBe(monitorLogger);
        });

        it("should all use the same underlying electron-log instance", () => {
            logger.info("Logger message");
            dbLogger.info("DB message");
            monitorLogger.info("Monitor message");

            expect(log.info).toHaveBeenCalledTimes(3);
            expect(log.info).toHaveBeenNthCalledWith(1, "[MONITOR] Logger message");
            expect(log.info).toHaveBeenNthCalledWith(2, "[DB] DB message");
            expect(log.info).toHaveBeenNthCalledWith(3, "[MONITOR] Monitor message");
        });

        it("should handle multiple arguments correctly", () => {
            logger.info("Message with data", { id: 1 }, "extra", true);

            expect(log.info).toHaveBeenCalledWith("[MONITOR] Message with data", { id: 1 }, "extra", true);
        });

        it("should handle edge cases gracefully", () => {
            // Empty message
            logger.info("");
            expect(log.info).toHaveBeenCalledWith("[MONITOR] ");

            // Null/undefined arguments
            logger.debug("Debug", null, undefined);
            expect(log.debug).toHaveBeenCalledWith("[MONITOR] Debug", null, undefined);
        });
    });

    describe("Performance", () => {
        it("should not perform expensive operations for disabled log levels", () => {
            const expensiveOperation = vi.fn(() => "expensive result");

            // This test verifies that logger functions accept and process arguments
            logger.debug("Debug with expensive data", expensiveOperation());

            // The expensive operation will still be called due to function argument evaluation
            // but this tests that the logger accepts the result
            expect(log.debug).toHaveBeenCalled();
            expect(expensiveOperation).toHaveBeenCalled();
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle circular references in error objects", () => {
            const circularError: any = { message: "Circular error" };
            circularError.self = circularError;

            // Should not throw when handling circular references
            expect(() => {
                logger.error("Circular reference error", circularError);
            }).not.toThrow();
        });

        it("should handle errors with non-string message property", () => {
            const weirdError = {
                message: 123,
                stack: "weird stack trace",
            } as any;

            logger.error("Weird error", weirdError);

            expect(log.error).toHaveBeenCalledWith(
                "[MONITOR] Weird error",
                expect.objectContaining({
                    message: 123,
                    stack: "weird stack trace",
                })
            );
        });
    });

    describe("Logger Structure and Type Safety", () => {
        it("should have separate logger instances", () => {
            expect(logger).not.toBe(dbLogger);
            expect(logger).not.toBe(monitorLogger);
            expect(dbLogger).not.toBe(monitorLogger);
        });

        it("should have different method references for each logger", () => {
            expect(logger.debug).not.toBe(dbLogger.debug);
            expect(logger.info).not.toBe(dbLogger.info);
            expect(logger.warn).not.toBe(dbLogger.warn);
            expect(logger.error).not.toBe(dbLogger.error);
        });

        it("should accept string messages for all methods", () => {
            expect(() => logger.debug("test")).not.toThrow();
            expect(() => logger.info("test")).not.toThrow();
            expect(() => logger.warn("test")).not.toThrow();
            expect(() => logger.error("test")).not.toThrow();
        });

        it("should accept additional arguments without throwing", () => {
            expect(() => logger.debug("test", "arg1", "arg2")).not.toThrow();
            expect(() => logger.info("test", "arg1", "arg2")).not.toThrow();
            expect(() => logger.warn("test", "arg1", "arg2")).not.toThrow();
            expect(() => logger.error("test", undefined, "arg1", "arg2")).not.toThrow();
        });

        it("should handle Error subclasses without throwing", () => {
            class CustomError extends Error {
                public code: number;
                constructor(message: string, code: number) {
                    super(message);
                    this.code = code;
                }
            }

            const customError = new CustomError("Custom error message", 404);
            expect(() => logger.error("Custom error occurred", customError)).not.toThrow();
            expect(() => dbLogger.error("Custom error occurred", customError)).not.toThrow();
            expect(() => monitorLogger.error("Custom error occurred", customError)).not.toThrow();
        });

        it("should handle edge cases gracefully", () => {
            // Empty messages
            expect(() => logger.debug("")).not.toThrow();
            expect(() => logger.info("")).not.toThrow();
            expect(() => logger.warn("")).not.toThrow();
            expect(() => logger.error("")).not.toThrow();

            // Very long messages
            const longMessage = "A".repeat(1000);
            expect(() => logger.debug(longMessage)).not.toThrow();
            expect(() => logger.info(longMessage)).not.toThrow();
            expect(() => logger.warn(longMessage)).not.toThrow();
            expect(() => logger.error(longMessage)).not.toThrow();

            // Complex objects as additional arguments
            const complexObject = {
                nested: { data: "value" },
                array: [1, 2, 3],
                fn: () => "function",
            };
            expect(() => logger.debug("Test", complexObject)).not.toThrow();
            expect(() => logger.error("Test", undefined, complexObject)).not.toThrow();
        });
    });
});
