import { describe, expect, it, vi } from "vitest";

import { createRefCountedAsyncSubscription } from "../../stores/utils/refCountedAsyncSubscription";

describe(createRefCountedAsyncSubscription, () => {
    it("starts only once and cleans up when last subscriber unsubscribes", async () => {
        const cleanup = vi.fn();

        let resolveStart!: (cleanupHandler: () => void) => void;
        const startPromise = new Promise<() => void>((resolve) => {
            resolveStart = resolve;
        });

        const start = vi.fn<() => Promise<() => void>>(() => startPromise);

        const subscription = createRefCountedAsyncSubscription({
            start,
        });

        const unsubscribeA = subscription.subscribe();
        const unsubscribeB = subscription.subscribe();

        expect(start).toHaveBeenCalledTimes(1);
        expect(subscription.getRefCount()).toBe(2);

        unsubscribeA();

        expect(subscription.getRefCount()).toBe(1);

        resolveStart(cleanup);
        await Promise.resolve();

        expect(cleanup).not.toHaveBeenCalled();

        unsubscribeB();

        expect(subscription.getRefCount()).toBe(0);
        expect(cleanup).toHaveBeenCalledTimes(1);

        // Idempotent
        unsubscribeB();

        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("cleans up immediately when unsubscribed before setup completes", async () => {
        const cleanup = vi.fn();

        let resolveStart!: (cleanupHandler: () => void) => void;
        const startPromise = new Promise<() => void>((resolve) => {
            resolveStart = resolve;
        });

        const start = vi.fn<() => Promise<() => void>>(() => startPromise);

        const subscription = createRefCountedAsyncSubscription({
            start,
        });

        const unsubscribe = subscription.subscribe();

        expect(subscription.getRefCount()).toBe(1);

        unsubscribe();

        expect(subscription.getRefCount()).toBe(0);

        resolveStart(cleanup);
        await Promise.resolve();

        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("retries a transient setup failure without another subscriber", async () => {
        vi.useFakeTimers();
        try {
            const cleanup = vi.fn();
            const onSetupError = vi.fn();
            const start = vi
                .fn<() => Promise<() => void>>()
                .mockRejectedValueOnce(new Error("bridge unavailable"))
                .mockResolvedValueOnce(cleanup);
            const subscription = createRefCountedAsyncSubscription({
                maxSetupAttempts: 3,
                onSetupError,
                retryDelayMs: 25,
                start,
            });

            const unsubscribe = subscription.subscribe();
            await Promise.resolve();
            await Promise.resolve();

            expect(start).toHaveBeenCalledTimes(1);
            expect(onSetupError).toHaveBeenCalledTimes(1);

            await vi.advanceTimersByTimeAsync(25);

            expect(start).toHaveBeenCalledTimes(2);
            expect(subscription.getRefCount()).toBe(1);

            unsubscribe();
            expect(cleanup).toHaveBeenCalledTimes(1);
        } finally {
            vi.useRealTimers();
        }
    });

    it("cancels a scheduled retry when the last subscriber leaves", async () => {
        vi.useFakeTimers();
        try {
            const start = vi
                .fn<() => Promise<() => void>>()
                .mockRejectedValue(new Error("bridge unavailable"));
            const subscription = createRefCountedAsyncSubscription({
                maxSetupAttempts: 3,
                retryDelayMs: 25,
                start,
            });

            const unsubscribe = subscription.subscribe();
            await Promise.resolve();
            await Promise.resolve();
            unsubscribe();

            await vi.advanceTimersByTimeAsync(25);

            expect(start).toHaveBeenCalledTimes(1);
            expect(subscription.getRefCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it("isolates throwing lifecycle hooks from setup and cleanup", async () => {
        const cleanup = vi.fn(() => {
            throw new Error("cleanup hook failed");
        });
        const start = vi.fn(async () => cleanup);
        const subscription = createRefCountedAsyncSubscription({
            onCleanupError: () => {
                throw new Error("cleanup reporting failed");
            },
            onReady: () => {
                throw new Error("ready hook failed");
            },
            onStarted: () => {
                throw new Error("started hook failed");
            },
            start,
        });

        const unsubscribe = subscription.subscribe();
        await vi.waitFor(() => {
            expect(start).toHaveBeenCalledTimes(1);
        });

        expect(subscription.getRefCount()).toBe(1);
        expect(() => unsubscribe()).not.toThrow();
        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(subscription.getRefCount()).toBe(0);
    });

    it("retries when the setup error hook throws", async () => {
        vi.useFakeTimers();
        try {
            const cleanup = vi.fn();
            const start = vi
                .fn<() => Promise<() => void>>()
                .mockRejectedValueOnce(new Error("setup failed"))
                .mockResolvedValueOnce(cleanup);
            const subscription = createRefCountedAsyncSubscription({
                maxSetupAttempts: 2,
                onSetupError: () => {
                    throw new Error("setup reporting failed");
                },
                retryDelayMs: 10,
                start,
            });

            const unsubscribe = subscription.subscribe();
            await Promise.resolve();
            await Promise.resolve();
            await vi.advanceTimersByTimeAsync(10);

            expect(start).toHaveBeenCalledTimes(2);
            unsubscribe();
            expect(cleanup).toHaveBeenCalledTimes(1);
        } finally {
            vi.useRealTimers();
        }
    });
});
