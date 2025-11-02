/**
 * Complete coverage for shared logging helpers and contract interfaces.
 */

import { describe, expect, it } from "vitest";

import {
    buildErrorLogArguments,
    buildLogArguments,
    formatLogMessage,
    serializeError,
} from "@shared/utils/logger/common";

import type {
    AppLogger,
    BaseLogger,
    ExtendedLogger,
    SiteLogger,
    SystemLogger,
} from "@shared/utils/logger/interfaces";

describe(formatLogMessage, () => {
    it("applies standard prefix formatting", () => {
        expect(formatLogMessage("CORE", "hello world")).toBe(
            "[CORE] hello world"
        );
    });
});

describe(serializeError, () => {
    it("returns null for non-error values", () => {
        expect(serializeError({})).toBeNull();
    });

    it("serializes standard errors with stack traces", () => {
        const error = new Error("boom");
        error.name = "BoomError";
        error.stack = "fake-stack";

        expect(serializeError(error)).toStrictEqual({
            message: "boom",
            name: "BoomError",
            stack: "fake-stack",
        });
    });

    it("preserves error causes when present", () => {
        const error = new Error("boom");
        (error as Error & { cause?: unknown }).cause = { reason: "exploded" };

        const serialized = serializeError(error);

        expect(serialized).toMatchObject({
            cause: { reason: "exploded" },
            message: "boom",
            name: "Error",
        });
        expect(
            typeof serialized?.stack === "string" ||
                serialized?.stack === undefined
        ).toBeTruthy();
    });
});

describe(buildLogArguments, () => {
    it("prepends formatted messages to argument lists", () => {
        const args = buildLogArguments("RENDERER", "initialized", [
            { context: "bootstrap" },
        ]);

        expect(args).toStrictEqual([
            "[RENDERER] initialized",
            { context: "bootstrap" },
        ]);
    });
});

describe(buildErrorLogArguments, () => {
    it("omits error payload when undefined", () => {
        const args = buildErrorLogArguments("CORE", "ready", undefined, [42]);

        expect(args).toStrictEqual(["[CORE] ready", 42]);
    });

    it("passes unknown error values through untouched", () => {
        const args = buildErrorLogArguments("CORE", "warn", "failure", []);

        expect(args).toStrictEqual(["[CORE] warn", "failure"]);
    });

    it("serializes Error instances for transport", () => {
        const error = new Error("network broke");
        error.stack = "stack";

        const args = buildErrorLogArguments("BACKEND", "failed", error, [
            { retry: true },
        ]);

        expect(args[0]).toBe("[BACKEND] failed");
        expect(args[1]).toStrictEqual({
            message: "network broke",
            name: "Error",
            stack: "stack",
        });
        expect(args[2]).toStrictEqual({ retry: true });
    });
});

describe("logger interface contracts", () => {
    it("accepts concrete implementations for each interface", async () => {
        await import("@shared/utils/logger/interfaces");

        const baseLogger: BaseLogger = {
            debug: () => {
                /* noop */
            },
            error: () => {
                /* noop */
            },
            info: () => {
                /* noop */
            },
            warn: () => {
                /* noop */
            },
        };

        const extendedLogger: ExtendedLogger = {
            ...baseLogger,
            silly: () => {
                /* noop */
            },
            verbose: () => {
                /* noop */
            },
        };

        const appLogger: AppLogger = {
            error: () => {
                /* noop */
            },
            performance: () => {
                /* noop */
            },
            started: () => {
                /* noop */
            },
            stopped: () => {
                /* noop */
            },
        };

        const siteLogger: SiteLogger = {
            added: () => {
                /* noop */
            },
            check: () => {
                /* noop */
            },
            error: () => {
                /* noop */
            },
            removed: () => {
                /* noop */
            },
            statusChange: () => {
                /* noop */
            },
        };

        const systemLogger: SystemLogger = {
            notification: () => {
                /* noop */
            },
            tray: () => {
                /* noop */
            },
            window: () => {
                /* noop */
            },
        };

        expect(baseLogger).toBeDefined();
        expect(extendedLogger).toBeDefined();
        expect(appLogger).toBeDefined();
        expect(siteLogger).toBeDefined();
        expect(systemLogger).toBeDefined();
    });
});
