/**
 * Logger Coverage Tests
 *
 * @file Tests to ensure complete coverage of logger functionality, including
 *   all method implementations and error handling paths.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the logger utilities - electron-log is already mocked in setup.ts
import { dbLogger, logger, monitorLogger } from "../../utils/logger";

describe("Logger Implementation Coverage", () => {
    let mockElectronLog: any;

    beforeEach(async () => {
        // Get the mocked electron-log instance from the module
        const electronLogModule = await import("electron-log/main");
        mockElectronLog = electronLogModule.default;

        // Clear all mock function call history
        vi.clearAllMocks();
    });

    describe("Main Logger (logger)", () => {
        it("should call debug method with correct prefix and arguments", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.debug("Test debug message", { key: "value" });

            expect(mockElectronLog.debug).toHaveBeenCalledWith(
                "[BACKEND] Test debug message",
                { key: "value" }
            );
        });

        it("should call info method with correct prefix and arguments", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.info("Test info message", { data: 123 });

            expect(mockElectronLog.info).toHaveBeenCalledWith(
                "[BACKEND] Test info message",
                { data: 123 }
            );
        });

        it("should call warn method with correct prefix and arguments", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.warn("Test warning message", "extra", "args");

            expect(mockElectronLog.warn).toHaveBeenCalledWith(
                "[BACKEND] Test warning message",
                "extra",
                "args"
            );
        });

        it("should call error method with Error object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const testError = new Error("Test error");
            testError.stack = "Stack trace here";

            logger.error("Test error message", testError, { context: "test" });

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[BACKEND] Test error message",
                expect.objectContaining({
                    message: "Test error",
                    name: "Error",
                    stack: "Stack trace here",
                }),
                { context: "test" }
            );
        });

        it("should call error method with non-Error object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const nonError = { type: "custom error", code: 500 };

            logger.error("Test error message", nonError, "additional");

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[BACKEND] Test error message",
                nonError,
                "additional"
            );
        });

        it("should call error method without error object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            logger.error("Test error message without error object");

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[BACKEND] Test error message without error object"
            );
        });
    });

    describe("Database Logger (dbLogger)", () => {
        it("should call debug method with DB prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            dbLogger.debug("Database query executed", {
                sql: "SELECT * FROM sites",
            });

            expect(mockElectronLog.debug).toHaveBeenCalledWith(
                "[DB] Database query executed",
                { sql: "SELECT * FROM sites" }
            );
        });

        it("should call info method with DB prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            dbLogger.info("Database connected successfully");

            expect(mockElectronLog.info).toHaveBeenCalledWith(
                "[DB] Database connected successfully"
            );
        });

        it("should call warn method with DB prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            dbLogger.warn("Slow query detected", { duration: 5000 });

            expect(mockElectronLog.warn).toHaveBeenCalledWith(
                "[DB] Slow query detected",
                {
                    duration: 5000,
                }
            );
        });

        it("should call error method with Error object and DB prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const dbError = new Error("Connection failed");
            dbError.stack = "Database stack trace";

            dbLogger.error("Database operation failed", dbError);

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[DB] Database operation failed",
                expect.objectContaining({
                    message: "Connection failed",
                    name: "Error",
                    stack: "Database stack trace",
                })
            );
        });

        it("should call error method with non-Error object and DB prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            dbLogger.error("Database constraint violation", {
                code: "UNIQUE_VIOLATION",
            });

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[DB] Database constraint violation",
                { code: "UNIQUE_VIOLATION" }
            );
        });
    });

    describe("Monitor Logger (monitorLogger)", () => {
        it("should call debug method with MONITOR prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            monitorLogger.debug("Monitor check initiated", {
                siteId: "abc123",
            });

            expect(mockElectronLog.debug).toHaveBeenCalledWith(
                "[MONITOR] Monitor check initiated",
                { siteId: "abc123" }
            );
        });

        it("should call info method with MONITOR prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            monitorLogger.info("All monitors healthy");

            expect(mockElectronLog.info).toHaveBeenCalledWith(
                "[MONITOR] All monitors healthy"
            );
        });

        it("should call warn method with MONITOR prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            monitorLogger.warn("High response time detected", { time: 3000 });

            expect(mockElectronLog.warn).toHaveBeenCalledWith(
                "[MONITOR] High response time detected",
                { time: 3000 }
            );
        });

        it("should call error method with Error object and MONITOR prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitorError = new Error("Timeout");
            monitorError.stack = "Monitor error stack";

            monitorLogger.error("Monitor check failed", monitorError, {
                retries: 3,
            });

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[MONITOR] Monitor check failed",
                expect.objectContaining({
                    message: "Timeout",
                    name: "Error",
                    stack: "Monitor error stack",
                }),
                { retries: 3 }
            );
        });

        it("should call error method with string error and MONITOR prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            monitorLogger.error("Service unavailable", "Connection refused");

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[MONITOR] Service unavailable",
                "Connection refused"
            );
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle Error object without stack trace", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorNoStack = new Error("Error without stack");
            delete (errorNoStack as { stack?: string }).stack;

            logger.error("Error without stack", errorNoStack);

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[BACKEND] Error without stack",
                expect.objectContaining({
                    message: "Error without stack",
                    name: "Error",
                })
            );
        });

        it("should handle null error object", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            logger.error("Null error test", null);

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[BACKEND] Null error test",
                null
            );
        });

        it("should handle undefined error object explicitly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            logger.error("Undefined error test", undefined, { extra: "data" });

            expect(mockElectronLog.error).toHaveBeenCalledWith(
                "[BACKEND] Undefined error test",
                { extra: "data" }
            );
        });

        it("should handle multiple additional arguments", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.info(
                "Multiple args test",
                "arg1",
                "arg2",
                { obj: "value" },
                123
            );

            expect(mockElectronLog.info).toHaveBeenCalledWith(
                "[BACKEND] Multiple args test",
                "arg1",
                "arg2",
                { obj: "value" },
                123
            );
        });

        it("should handle empty string messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.debug("");
            logger.info("");
            logger.warn("");
            logger.error("");

            expect(mockElectronLog.debug).toHaveBeenCalledWith("[BACKEND] ");
            expect(mockElectronLog.info).toHaveBeenCalledWith("[BACKEND] ");
            expect(mockElectronLog.warn).toHaveBeenCalledWith("[BACKEND] ");
            expect(mockElectronLog.error).toHaveBeenCalledWith("[BACKEND] ");
        });
    });

    describe("Logger Method Signatures", () => {
        it("should maintain correct method signatures for all loggers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle method calls without additional arguments", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.debug("Debug only message");
            logger.info("Info only message");
            logger.warn("Warn only message");

            expect(mockElectronLog.debug).toHaveBeenCalledWith(
                "[BACKEND] Debug only message"
            );
            expect(mockElectronLog.info).toHaveBeenCalledWith(
                "[BACKEND] Info only message"
            );
            expect(mockElectronLog.warn).toHaveBeenCalledWith(
                "[BACKEND] Warn only message"
            );
        });
    });
});
