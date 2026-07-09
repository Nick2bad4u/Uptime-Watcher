import { withLogContext } from "@shared/utils/loggingContext";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    dbLogger,
    diagnosticsLogger,
    logger,
    monitorLogger,
} from "../../utils/logger";

const logMocks = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

vi.mock("electron-log/main", () => ({
    default: logMocks,
}));

describe("Logger transports", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("log forwarding", () => {
        it("forwards backend logger methods with the backend prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.debug("debug message", { value: 1 });
            logger.info("info message");
            logger.warn("warn message", "extra");

            expect(logMocks.debug).toHaveBeenCalledWith(
                "[BACKEND] debug message",
                { value: 1 }
            );
            expect(logMocks.info).toHaveBeenCalledWith(
                "[BACKEND] info message"
            );
            expect(logMocks.warn).toHaveBeenCalledWith(
                "[BACKEND] warn message",
                "extra"
            );
        });

        it("serializes Error objects for backend error logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("test error");
            logger.error("failed operation", error, { attempt: 2 });

            expect(logMocks.error).toHaveBeenCalledWith(
                "[BACKEND] failed operation",
                expect.objectContaining({
                    message: "test error",
                    name: "Error",
                    stack: expect.any(String),
                }),
                { attempt: 2 }
            );
        });

        it("preserves non-Error payloads for backend error logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            logger.error("failed operation", "extra info");

            expect(logMocks.error).toHaveBeenCalledWith(
                "[BACKEND] failed operation",
                "extra info"
            );
        });

        it("inserts sanitized structured context after the formatted message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            logger.info(
                "context message",
                withLogContext({
                    component: "logger-test",
                    correlationId: "test-correlation",
                    metadata: { token: "secret-token", visible: true },
                    timestamp: 123,
                }),
                { detail: "visible" }
            );

            expect(logMocks.info).toHaveBeenCalledWith(
                "[BACKEND] context message",
                {
                    component: "logger-test",
                    correlationId: "test-correlation",
                    metadata: { token: "[redacted]", visible: true },
                    severity: "info",
                    timestamp: 123,
                },
                { detail: "visible" }
            );
        });

        it("uses specialized prefixes for database, monitor, and diagnostics loggers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            dbLogger.info("query complete");
            monitorLogger.warn("monitor slow");
            diagnosticsLogger.debug("metrics snapshot");

            expect(logMocks.info).toHaveBeenCalledWith("[DB] query complete");
            expect(logMocks.warn).toHaveBeenCalledWith(
                "[MONITOR] monitor slow"
            );
            expect(logMocks.debug).toHaveBeenCalledWith(
                "[DIAGNOSTICS] metrics snapshot"
            );
        });
    });
});
