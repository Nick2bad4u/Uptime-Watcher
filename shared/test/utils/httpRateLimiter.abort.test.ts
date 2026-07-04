import type { HttpRateLimiterConfig } from "@shared/utils/httpRateLimiter";

import { HttpRateLimiter } from "@shared/utils/httpRateLimiter";
import { describe, expect, it, vi } from "vitest";

describe("HttpRateLimiter abort support", () => {
    it("normalizes malformed numeric config before scheduling", async () => {
        const operation = vi.fn(async () => "ok");
        const limiter = new HttpRateLimiter({
            maxConcurrent: 0,
            maxWaitMs: Number.NaN,
            minIntervalMs: -1,
        });

        await expect(
            limiter.schedule("https://example.com/status", operation)
        ).resolves.toBe("ok");

        expect(operation).toHaveBeenCalledTimes(1);
    });

    it("does not invoke config accessors while normalizing options", async () => {
        let getterCalls = 0;
        const config = {
            maxConcurrent: 1,
            minIntervalMs: 0,
        } satisfies Partial<HttpRateLimiterConfig> as HttpRateLimiterConfig &
            Record<string, unknown>;

        Object.defineProperty(config, "maxWaitMs", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("maxWaitMs getter should not run");
            },
        });
        Object.defineProperty(config, "unexpected", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("unexpected getter should not run");
            },
        });

        const operation = vi.fn(async () => "ok");
        const limiter = new HttpRateLimiter(config);

        await expect(
            limiter.schedule("https://example.com/status", operation)
        ).resolves.toBe("ok");

        expect(operation).toHaveBeenCalledTimes(1);
        expect(getterCalls).toBe(0);
    });

    it("rejects without invoking the operation when aborted while waiting for a slot", async () => {
        vi.useFakeTimers();

        try {
            const limiter = new HttpRateLimiter({
                maxConcurrent: 1,
                maxWaitMs: 30_000,
                minIntervalMs: 5000,
                toKey: () => "same-key",
            });

            let resolveSlow: () => void = () => {};
            const slowBarrier = new Promise<boolean>((resolve) => {
                resolveSlow = () => {
                    resolve(true);
                };
            });

            const slowOperation = vi.fn(async () => {
                await slowBarrier;
                return "slow";
            });

            const controller = new AbortController();
            const fastOperation = vi.fn(async () => "fast");

            const first = limiter.schedule(
                "https://example.com/a",
                slowOperation
            );
            const second = limiter.schedule(
                "https://example.com/b",
                fastOperation,
                {
                    signal: controller.signal,
                }
            );

            // The second schedule call should be blocked by the global
            // concurrency limit and waiting inside sleepUnref.
            controller.abort("stop monitoring");

            await expect(second).rejects.toMatchObject({
                name: "AbortError",
            });
            expect(fastOperation).not.toHaveBeenCalled();

            resolveSlow();
            await expect(first).resolves.toBe("slow");
        } finally {
            vi.useRealTimers();
        }
    });

    it("does not invoke reason accessors on signal-shaped aborted inputs", async () => {
        let getterCalls = 0;
        const signal = {
            aborted: true,
            get reason() {
                getterCalls += 1;
                throw new Error("reason getter should not run");
            },
        };
        const operation = vi.fn(async () => "ok");
        const limiter = new HttpRateLimiter({
            maxConcurrent: 1,
            minIntervalMs: 0,
        });

        await expect(
            limiter.schedule("https://example.com/status", operation, {
                signal: signal as unknown as AbortSignal,
            })
        ).rejects.toMatchObject({ name: "AbortError" });

        expect(operation).not.toHaveBeenCalled();
        expect(getterCalls).toBe(0);
    });
});
