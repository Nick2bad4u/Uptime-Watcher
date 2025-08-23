/**
 * Test suite for middleware
 *
 * @module Unknown
 *
 * @file Comprehensive tests for unknown functionality in the Uptime Watcher
 *   application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category General
 *
 * @tags ["test"]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    createLoggingMiddleware,
    createMetricsMiddleware,
    createErrorHandlingMiddleware,
    createRateLimitMiddleware,
    createValidationMiddleware,
    createFilterMiddleware,
    createDebugMiddleware,
    composeMiddleware,
    MIDDLEWARE_STACKS,
} from "../events/middleware";
import { logger } from "../utils/logger";

// Mock logger
vi.mock("../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("middleware.ts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe("createLoggingMiddleware", () => {
        it("logs at correct level with data", async () => {
            const next = vi.fn();
            const mw = createLoggingMiddleware({
                level: "debug",
                includeData: true,
            });
            await mw("eventA", { foo: 1 }, next);
            expect(logger.debug).toHaveBeenCalledWith(expect.any(String), {
                data: { foo: 1 },
                event: "eventA",
            });
            expect(next).toHaveBeenCalled();
        });
        it("logs at info level without data", async () => {
            const next = vi.fn();
            const mw = createLoggingMiddleware({ level: "info" });
            await mw("eventB", { bar: 2 }, next);
            expect(logger.info).toHaveBeenCalledWith(expect.any(String), {
                event: "eventB",
            });
        });
        it("respects filter", async () => {
            const next = vi.fn();
            const mw = createLoggingMiddleware({
                filter: (e) => e === "allowed",
            });
            await mw("blocked", {}, next);
            expect(logger.info).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });
    describe("createMetricsMiddleware", () => {
        it("tracks counts and timings, calls metricsCallback", async () => {
            const metricsCallback = vi.fn();
            const next = vi.fn();
            const mw = createMetricsMiddleware({ metricsCallback });
            await mw("eventC", {}, next);
            expect(metricsCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "events.eventC.count",
                    type: "counter",
                })
            );
            expect(metricsCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "events.eventC.duration",
                    type: "timing",
                })
            );
            expect(next).toHaveBeenCalled();
        });
        it("can disable counts or timings", async () => {
            const metricsCallback = vi.fn();
            const next = vi.fn();
            const mw = createMetricsMiddleware({
                metricsCallback,
                trackCounts: false,
                trackTiming: false,
            });
            await mw("eventD", {}, next);
            expect(metricsCallback).not.toHaveBeenCalled();
        });
    });
    describe("createErrorHandlingMiddleware", () => {
        it("catches errors and logs, calls onError, continues if continueOnError", async () => {
            const onError = vi.fn();
            const error = new Error("fail");
            const next = vi.fn().mockRejectedValue(error);
            const mw = createErrorHandlingMiddleware({
                onError,
                continueOnError: true,
            });
            await mw("eventE", { x: 1 }, next);
            expect(logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Middleware error"),
                expect.any(Object)
            );
            expect(onError).toHaveBeenCalledWith(error, "eventE", { x: 1 });
        });
        it("throws if continueOnError is false", async () => {
            const next = vi.fn().mockRejectedValue(new Error("fail2"));
            const mw = createErrorHandlingMiddleware({
                continueOnError: false,
            });
            await expect(mw("eventF", {}, next)).rejects.toThrow("fail2");
        });
    });
    describe("createRateLimitMiddleware", () => {
        it("allows events under the limit", async () => {
            const next = vi.fn();
            const mw = createRateLimitMiddleware({
                burstLimit: 2,
                maxEventsPerSecond: 2,
            });
            await mw("eventG", {}, next);
            expect(next).toHaveBeenCalled();
        });
        it("blocks events over burst limit", async () => {
            const next = vi.fn();
            const onRateLimit = vi.fn();
            const mw = createRateLimitMiddleware({
                burstLimit: 1,
                maxEventsPerSecond: 10,
                onRateLimit,
            });
            // First call allowed
            await mw("eventH", {}, next);
            // Second call blocked
            await mw("eventH", {}, next);
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining("burst limit")
            );
            expect(onRateLimit).toHaveBeenCalledWith("eventH", {});
        });
        it("blocks events over rate limit", async () => {
            const next = vi.fn();
            const onRateLimit = vi.fn();
            const mw = createRateLimitMiddleware({
                burstLimit: 10,
                maxEventsPerSecond: 1,
                onRateLimit,
            });
            // First call allowed
            await mw("eventI", {}, next);
            // Second call blocked (simulate within 1s)
            await mw("eventI", {}, next);
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining("rate limit")
            );
            expect(onRateLimit).toHaveBeenCalledWith("eventI", {});
        });
    });
    describe("createValidationMiddleware", () => {
        it("passes valid data", async () => {
            const next = vi.fn();
            const validators = { eventJ: (data: any) => data === 42 };
            const mw =
                createValidationMiddleware<typeof validators>(validators);
            await mw("eventJ", 42, next);
            expect(next).toHaveBeenCalled();
        });
        it("throws on invalid boolean validator", async () => {
            const next = vi.fn();
            const validators = { eventK: (_data: any) => false };
            const mw =
                createValidationMiddleware<typeof validators>(validators);
            await expect(mw("eventK", 1, next)).rejects.toThrow(
                "Validation failed for event 'eventK'"
            );
            expect(logger.error).toHaveBeenCalled();
        });
        it("throws on invalid object validator", async () => {
            const next = vi.fn();
            const validators = {
                eventL: (_: any) => ({ isValid: false, error: "bad" }),
            };
            const mw =
                createValidationMiddleware<typeof validators>(validators);
            await expect(mw("eventL", 1, next)).rejects.toThrow("bad");
            expect(logger.error).toHaveBeenCalled();
        });
    });
    describe("createFilterMiddleware", () => {
        it("blocks events not in allowList", async () => {
            const next = vi.fn();
            const mw = createFilterMiddleware({ allowList: ["eventM"] });
            await mw("eventN", {}, next);
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("allow list")
            );
            expect(next).not.toHaveBeenCalled();
        });
        it("blocks events in blockList", async () => {
            const next = vi.fn();
            const mw = createFilterMiddleware({ blockList: ["eventO"] });
            await mw("eventO", {}, next);
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("block list")
            );
            expect(next).not.toHaveBeenCalled();
        });
        it("blocks by custom condition", async () => {
            const next = vi.fn();
            const mw = createFilterMiddleware({ condition: () => false });
            await mw("eventP", {}, next);
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("custom condition")
            );
            expect(next).not.toHaveBeenCalled();
        });
        it("allows event if not blocked", async () => {
            const next = vi.fn();
            const mw = createFilterMiddleware({});
            await mw("eventQ", {}, next);
            expect(next).toHaveBeenCalled();
        });
    });
    describe("createDebugMiddleware", () => {
        it("logs debug info when enabled", async () => {
            const next = vi.fn();
            const mw = createDebugMiddleware({ enabled: true, verbose: true });
            await mw("eventR", { foo: "bar" }, next);
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Processing event 'eventR'"),
                expect.objectContaining({
                    event: "eventR",
                    data: { foo: "bar" },
                    timestamp: expect.any(Number),
                })
            );
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Completed event 'eventR' in")
            );
            expect(next).toHaveBeenCalled();
        });
        it("skips logging when not enabled", async () => {
            const next = vi.fn();
            const mw = createDebugMiddleware({ enabled: false });
            await mw("eventS", {}, next);
            expect(logger.debug).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });
    describe("composeMiddleware", () => {
        it("runs all middleware in order", async () => {
            const calls: string[] = [];
            const mw1 = async (_e: string, _d: unknown, next: () => void) => {
                calls.push("mw1");
                await next();
            };
            const mw2 = async (_e: string, _d: unknown, next: () => void) => {
                calls.push("mw2");
                await next();
            };
            const composed = composeMiddleware(mw1, mw2);
            const next = vi.fn();
            await composed("eventT", {}, next);
            expect(calls).toEqual(["mw1", "mw2"]);
            expect(next).toHaveBeenCalled();
        });
        it("handles empty middleware array", async () => {
            const next = vi.fn();
            const composed = composeMiddleware();
            await composed("eventU", {}, next);
            expect(next).toHaveBeenCalled();
        });
    });
    describe("MIDDLEWARE_STACKS", () => {
        it("custom stack composes given middleware", async () => {
            const calls: string[] = [];
            const mw = async (_e: string, _d: unknown, next: () => void) => {
                calls.push("custom");
                await next();
            };
            const stack = MIDDLEWARE_STACKS.custom([mw]);
            const next = vi.fn();
            await stack("eventV", {}, next);
            expect(calls).toEqual(["custom"]);
            expect(next).toHaveBeenCalled();
        });
        it("development stack runs all middleware", async () => {
            const next = vi.fn();
            const stack = MIDDLEWARE_STACKS.development();
            await stack("eventW", { foo: 1 }, next);
            expect(next).toHaveBeenCalled();
        });
        it("production stack runs all middleware", async () => {
            const next = vi.fn();
            const stack = MIDDLEWARE_STACKS.production();
            await stack("eventX", { foo: 2 }, next);
            expect(next).toHaveBeenCalled();
        });
        it("testing stack runs all middleware", async () => {
            const next = vi.fn();
            const stack = MIDDLEWARE_STACKS.testing();
            await stack("eventY", { foo: 3 }, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
