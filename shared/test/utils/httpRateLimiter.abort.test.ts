import type { HttpRateLimiterConfig } from "@shared/utils/httpRateLimiter";

import {
    HttpRateLimiter,
    HttpRateLimitQueueTimeoutError,
} from "@shared/utils/httpRateLimiter";
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

    it("redacts malformed URL keys before rejecting at the queue deadline", async () => {
        vi.useFakeTimers();

        try {
            const onMaxWaitExceeded = vi.fn();
            const limiter = new HttpRateLimiter({
                maxConcurrent: 1,
                maxWaitMs: 0,
                minIntervalMs: 0,
                onMaxWaitExceeded,
            });
            const sensitiveMalformedUrl =
                "not a url access_token=secret-token password=secret-password";

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
            const fastOperation = vi.fn(async () => "fast");

            const first = limiter.schedule(
                sensitiveMalformedUrl,
                slowOperation
            );
            const second = limiter.schedule(
                sensitiveMalformedUrl,
                fastOperation
            );

            await expect(second).rejects.toMatchObject({
                key: "[unparseable-url]",
                name: "HttpRateLimitQueueTimeoutError",
            });
            expect(onMaxWaitExceeded).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: "[unparseable-url]",
                })
            );
            expect(onMaxWaitExceeded).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    key: expect.stringContaining("secret-token"),
                })
            );
            expect(fastOperation).not.toHaveBeenCalled();

            resolveSlow();
            await expect(first).resolves.toBe("slow");
        } finally {
            vi.useRealTimers();
        }
    });

    it("never exceeds max concurrency when queued operations time out", async () => {
        vi.useFakeTimers();

        try {
            const limiter = new HttpRateLimiter({
                maxConcurrent: 1,
                maxWaitMs: 50,
                minIntervalMs: 0,
            });
            let activeOperations = 0;
            let maxActiveOperations = 0;
            let releaseFirst: () => void = () => {};
            const firstBarrier = new Promise<void>((resolve) => {
                releaseFirst = resolve;
            });

            const first = limiter.schedule(
                "https://example.com/first",
                async () => {
                    activeOperations += 1;
                    maxActiveOperations = Math.max(
                        maxActiveOperations,
                        activeOperations
                    );
                    await firstBarrier;
                    activeOperations -= 1;
                    return "first";
                }
            );
            const queuedOperations = Array.from({ length: 10 }, (_, index) =>
                limiter
                    .schedule(
                        `https://example.com/queued-${index}`,
                        async () => {
                            activeOperations += 1;
                            maxActiveOperations = Math.max(
                                maxActiveOperations,
                                activeOperations
                            );
                            activeOperations -= 1;
                            return index;
                        }
                    )
                    .then((value) => ({
                        status: "fulfilled" as const,
                        value,
                    }))
                    .catch((error: unknown) => ({
                        reason: error,
                        status: "rejected" as const,
                    }))
            );

            await vi.advanceTimersByTimeAsync(50);

            const settledQueued = await Promise.all(queuedOperations);
            expect(
                settledQueued.every(
                    (result) =>
                        result.status === "rejected" &&
                        result.reason instanceof HttpRateLimitQueueTimeoutError
                )
            ).toBeTruthy();
            expect(maxActiveOperations).toBe(1);

            releaseFirst();
            await expect(first).resolves.toBe("first");
        } finally {
            vi.useRealTimers();
        }
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
