import { describe, expect, it, vi } from "vitest";

import { HttpRateLimiter } from "@shared/utils/httpRateLimiter";

describe("HttpRateLimiter abort support", () => {
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
                resolveSlow = () => resolve(true);
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
