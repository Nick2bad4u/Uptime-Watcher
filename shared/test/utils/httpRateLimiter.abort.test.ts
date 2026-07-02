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
});
