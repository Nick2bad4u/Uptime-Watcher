/**
 * @file Strict coverage tests for the monitor identifier utilities.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";

import type { Monitor } from "@shared/types";
import { assertProperty } from "../../test-utils/fastcheckConfig";

const loggerErrorSpy = vi.fn();

vi.mock("@app/services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: loggerErrorSpy,
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor =>
    ({
        id: "monitor-id",
        type: "http",
        monitoring: true,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        responseTime: 0,
        status: "pending",
        history: [],
        ...overrides,
    }) as Monitor;

const portMonitorHostArbitrary = fc.oneof(
    fc.domain(),
    fc.constant("localhost")
);

const fallbackLabelArbitrary = fc
    .string({ minLength: 1, maxLength: 48 })
    .filter((value) => value.trim().length > 0);

describe("monitor identifier fallbacks (strict coverage)", () => {
    beforeEach(() => {
        loggerErrorSpy.mockReset();
        vi.resetModules();
    });

    afterEach(() => {
        vi.resetModules();
    });

    it("prefers dedicated generators for known monitor types", async () => {
        const { getMonitorDisplayIdentifier } = await import(
            "@app/utils/fallbacks"
        );

        const monitor = createMonitor({
            type: "cdn-edge-consistency",
            baselineUrl: "https://edge.example.com",
        });

        const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");

        expect(result).toBe("https://edge.example.com");
        expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it("falls back to generic URL and host heuristics when generators return undefined", async () => {
        const { getMonitorDisplayIdentifier } = await import(
            "@app/utils/fallbacks"
        );

        await assertProperty(
            fc.property(
                portMonitorHostArbitrary,
                fallbackLabelArbitrary,
                (host, siteFallback) => {
                    const monitor = createMonitor({
                        type: "port",
                        host,
                    });

                    const result = getMonitorDisplayIdentifier(
                        monitor,
                        siteFallback
                    );

                    expect(result).toBe(host);
                }
            )
        );
    });

    it("returns the provided site fallback when no identifier can be derived", async () => {
        const { getMonitorDisplayIdentifier } = await import(
            "@app/utils/fallbacks"
        );

        await assertProperty(
            fc.property(fallbackLabelArbitrary, (siteFallback) => {
                const monitor = createMonitor({
                    type: "http",
                });

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    siteFallback
                );

                expect(result).toBe(siteFallback);
            })
        );
    });

    it("logs and returns the fallback when a generator throws", async () => {
        const { getMonitorDisplayIdentifier } = await import(
            "@app/utils/fallbacks"
        );

        const monitor = createMonitor({
            type: "dns",
            recordType: "TXT",
        });
        Object.defineProperty(monitor, "host", {
            configurable: true,
            get() {
                throw new Error("host lookup failed");
            },
        });

        const result = getMonitorDisplayIdentifier(
            monitor,
            "Resilient Fallback"
        );

        expect(result).toBe("Resilient Fallback");
        expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            "Generate monitor display identifier failed",
            expect.any(Error)
        );
    });
});
