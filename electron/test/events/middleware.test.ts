/**
 * Tests for the event middleware used by UptimeOrchestrator.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EventPayloadValue } from "../../events/TypedEventBus";

import {
    createErrorHandlingMiddleware,
    createLoggingMiddleware,
} from "../../events/middleware";
import { logger } from "../../utils/logger";

vi.mock("../../utils/logger", () => ({
    diagnosticsLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

const asEventPayload = (value: unknown): EventPayloadValue =>
    value as EventPayloadValue;

describe("event middleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe(createLoggingMiddleware, () => {
        it("logs events without payload data by default", async () => {
            const middleware = createLoggingMiddleware({ level: "info" });
            const next = vi.fn();

            await middleware(
                "site:added",
                asEventPayload({ id: "site-1" }),
                next
            );

            expect(logger.info).toHaveBeenCalledWith(
                "[EventBus] Event emitted",
                { event: "site:added" }
            );
            expect(next).toHaveBeenCalledTimes(1);
        });

        it("safely clones loggable payload data when requested", async () => {
            const middleware = createLoggingMiddleware({
                includeData: true,
                level: "debug",
            });
            const next = vi.fn();
            const payload = { nested: { value: 1 } };

            await middleware("monitor:up", asEventPayload(payload), next);

            payload.nested.value = 2;

            expect(logger.debug).toHaveBeenCalledWith(
                "[EventBus] Event emitted",
                {
                    data: { nested: { value: 1 } },
                    event: "monitor:up",
                }
            );
            expect(next).toHaveBeenCalledTimes(1);
        });

        it("uses a placeholder for circular payloads", async () => {
            const middleware = createLoggingMiddleware({
                includeData: true,
                level: "warn",
            });
            const next = vi.fn();
            const payload: { self?: unknown } = {};
            payload.self = payload;

            await middleware("system:error", asEventPayload(payload), next);

            expect(logger.warn).toHaveBeenCalledWith(
                "[EventBus] Event emitted",
                expect.objectContaining({
                    data: expect.stringContaining("[Unserializable object]"),
                    event: "system:error",
                })
            );
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe(createErrorHandlingMiddleware, () => {
        it("logs and swallows downstream middleware failures when configured", async () => {
            const onError = vi.fn();
            const middleware = createErrorHandlingMiddleware({
                continueOnError: true,
                onError,
            });
            const error = new Error("listener failed");

            await expect(
                middleware(
                    "monitor:down",
                    asEventPayload({ id: "monitor-1" }),
                    () => {
                        throw error;
                    }
                )
            ).resolves.toBeUndefined();

            expect(logger.error).toHaveBeenCalledWith(
                "[EventBus] Error in event 'monitor:down': listener failed",
                error,
                expect.objectContaining({ event: "monitor:down" })
            );
            expect(onError).toHaveBeenCalledWith(
                error,
                expect.objectContaining({
                    data: { id: "monitor-1" },
                    event: "monitor:down",
                })
            );
        });

        it("rethrows downstream middleware failures when configured", async () => {
            const middleware = createErrorHandlingMiddleware({
                continueOnError: false,
            });
            const error = new Error("listener failed");

            await expect(
                middleware(
                    "monitor:down",
                    asEventPayload({ id: "monitor-1" }),
                    () => {
                        throw error;
                    }
                )
            ).rejects.toThrow(error);
        });
    });
});
