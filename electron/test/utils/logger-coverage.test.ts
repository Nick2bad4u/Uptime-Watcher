/**
 * Logger Coverage Tests
 *
 * @file Tests to ensure complete coverage of logger functionality, including
 *   all method implementations and error handling paths.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import log from "electron-log/main";

// Mock electron-log before importing the logger
vi.mock("electron-log/main", () => ({
    default: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

// Import after mocking
import { dbLogger, logger, monitorLogger } from "../../utils/logger";

describe("Logger Implementation Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Main Logger (logger)", () => {
        it("should call debug method with correct prefix and arguments", () => {
            logger.debug("Test debug message", { key: "value" });

            expect(log.debug).toHaveBeenCalledWith(
                "[BACKEND] Test debug message",
                { key: "value" }
            );
        });

        it("should call info method with correct prefix and arguments", () => {
            logger.info("Test info message", { data: 123 });

            expect(log.info).toHaveBeenCalledWith(
                "[BACKEND] Test info message",
                { data: 123 }
            );
        });

        it("should call warn method with correct prefix and arguments", () => {
            logger.warn("Test warning message", "extra", "args");

            expect(log.warn).toHaveBeenCalledWith(
                "[BACKEND] Test warning message",
                "extra",
                "args"
            );
        });

        it("should call error method with Error object", () => {
            const testError = new Error("Test error");
            testError.stack = "Stack trace here";

            logger.error("Test error message", testError, { context: "test" });

            expect(log.error).toHaveBeenCalledWith(
                "[BACKEND] Test error message",
                { message: "Test error", stack: "Stack trace here" },
                { context: "test" }
            );
        });

        it("should call error method with non-Error object", () => {
            const nonError = { type: "custom error", code: 500 };

            logger.error("Test error message", nonError, "additional");

            expect(log.error).toHaveBeenCalledWith(
                "[BACKEND] Test error message",
                nonError,
                "additional"
            );
        });

        it("should call error method without error object", () => {
            logger.error("Test error message without error object");

            expect(log.error).toHaveBeenCalledWith(
                "[BACKEND] Test error message without error object",
                undefined
            );
        });
    });

    describe("Database Logger (dbLogger)", () => {
        it("should call debug method with DB prefix", () => {
            dbLogger.debug("Database query executed", {
                sql: "SELECT * FROM sites",
            });

            expect(log.debug).toHaveBeenCalledWith(
                "[DB] Database query executed",
                { sql: "SELECT * FROM sites" }
            );
        });

        it("should call info method with DB prefix", () => {
            dbLogger.info("Database connected successfully");

            expect(log.info).toHaveBeenCalledWith(
                "[DB] Database connected successfully"
            );
        });

        it("should call warn method with DB prefix", () => {
            dbLogger.warn("Slow query detected", { duration: 5000 });

            expect(log.warn).toHaveBeenCalledWith("[DB] Slow query detected", {
                duration: 5000,
            });
        });

        it("should call error method with Error object and DB prefix", () => {
            const dbError = new Error("Connection failed");
            dbError.stack = "Database stack trace";

            dbLogger.error("Database operation failed", dbError);

            expect(log.error).toHaveBeenCalledWith(
                "[DB] Database operation failed",
                { message: "Connection failed", stack: "Database stack trace" }
            );
        });

        it("should call error method with non-Error object and DB prefix", () => {
            dbLogger.error("Database constraint violation", {
                code: "UNIQUE_VIOLATION",
            });

            expect(log.error).toHaveBeenCalledWith(
                "[DB] Database constraint violation",
                { code: "UNIQUE_VIOLATION" }
            );
        });
    });

    describe("Monitor Logger (monitorLogger)", () => {
        it("should call debug method with MONITOR prefix", () => {
            monitorLogger.debug("Monitor check initiated", {
                siteId: "abc123",
            });

            expect(log.debug).toHaveBeenCalledWith(
                "[MONITOR] Monitor check initiated",
                { siteId: "abc123" }
            );
        });

        it("should call info method with MONITOR prefix", () => {
            monitorLogger.info("All monitors healthy");

            expect(log.info).toHaveBeenCalledWith(
                "[MONITOR] All monitors healthy"
            );
        });

        it("should call warn method with MONITOR prefix", () => {
            monitorLogger.warn("High response time detected", { time: 3000 });

            expect(log.warn).toHaveBeenCalledWith(
                "[MONITOR] High response time detected",
                { time: 3000 }
            );
        });

        it("should call error method with Error object and MONITOR prefix", () => {
            const monitorError = new Error("Timeout");
            monitorError.stack = "Monitor error stack";

            monitorLogger.error("Monitor check failed", monitorError, {
                retries: 3,
            });

            expect(log.error).toHaveBeenCalledWith(
                "[MONITOR] Monitor check failed",
                { message: "Timeout", stack: "Monitor error stack" },
                { retries: 3 }
            );
        });

        it("should call error method with string error and MONITOR prefix", () => {
            monitorLogger.error("Service unavailable", "Connection refused");

            expect(log.error).toHaveBeenCalledWith(
                "[MONITOR] Service unavailable",
                "Connection refused"
            );
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle Error object without stack trace", () => {
            const errorNoStack = new Error("Error without stack");
            delete (errorNoStack as { stack?: string }).stack;

            logger.error("Error without stack", errorNoStack);

            expect(log.error).toHaveBeenCalledWith(
                "[BACKEND] Error without stack",
                { message: "Error without stack", stack: undefined }
            );
        });

        it("should handle null error object", () => {
            logger.error("Null error test", null);

            expect(log.error).toHaveBeenCalledWith(
                "[BACKEND] Null error test",
                null
            );
        });

        it("should handle undefined error object explicitly", () => {
            logger.error("Undefined error test", undefined, { extra: "data" });

            expect(log.error).toHaveBeenCalledWith(
                "[BACKEND] Undefined error test",
                undefined,
                { extra: "data" }
            );
        });

        it("should handle multiple additional arguments", () => {
            logger.info(
                "Multiple args test",
                "arg1",
                "arg2",
                { obj: "value" },
                123
            );

            expect(log.info).toHaveBeenCalledWith(
                "[BACKEND] Multiple args test",
                "arg1",
                "arg2",
                { obj: "value" },
                123
            );
        });

        it("should handle empty string messages", () => {
            logger.debug("");
            logger.info("");
            logger.warn("");
            logger.error("");

            expect(log.debug).toHaveBeenCalledWith("[BACKEND] ");
            expect(log.info).toHaveBeenCalledWith("[BACKEND] ");
            expect(log.warn).toHaveBeenCalledWith("[BACKEND] ");
            expect(log.error).toHaveBeenCalledWith("[BACKEND] ", undefined);
        });
    });

    describe("Logger Method Signatures", () => {
        it("should maintain correct method signatures for all loggers", () => {
            // Verify all loggers have the required methods
            expect(typeof logger.debug).toBe("function");
            expect(typeof logger.info).toBe("function");
            expect(typeof logger.warn).toBe("function");
            expect(typeof logger.error).toBe("function");

            expect(typeof dbLogger.debug).toBe("function");
            expect(typeof dbLogger.info).toBe("function");
            expect(typeof dbLogger.warn).toBe("function");
            expect(typeof dbLogger.error).toBe("function");

            expect(typeof monitorLogger.debug).toBe("function");
            expect(typeof monitorLogger.info).toBe("function");
            expect(typeof monitorLogger.warn).toBe("function");
            expect(typeof monitorLogger.error).toBe("function");
        });

        it("should handle method calls without additional arguments", () => {
            logger.debug("Debug only message");
            logger.info("Info only message");
            logger.warn("Warn only message");

            expect(log.debug).toHaveBeenCalledWith(
                "[BACKEND] Debug only message"
            );
            expect(log.info).toHaveBeenCalledWith(
                "[BACKEND] Info only message"
            );
            expect(log.warn).toHaveBeenCalledWith(
                "[BACKEND] Warn only message"
            );
        });
    });
});
