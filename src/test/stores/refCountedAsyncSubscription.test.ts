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
});
