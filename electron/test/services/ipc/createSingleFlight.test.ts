/**
 * Tests for the IPC handler single-flight helper.
 *
 * @remarks
 * This module protects the Electron main process from renderer-side request
 * amplification by deduplicating concurrent calls to expensive operations.
 */

import { describe, expect, it, vi } from "vitest";

import { createSingleFlight } from "@shared/utils/singleFlight";

interface Deferred<T> {
    readonly promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;

    const promise = new Promise<T>((innerResolve, innerReject) => {
        resolve = innerResolve;
        reject = innerReject;
    });

    return { promise, reject, resolve };
}

async function flushMicrotasks(): Promise<void> {
    // Yield once to allow any pending promise jobs to run. This keeps the
    // assertions robust even if the implementation uses microtask scheduling
    // in the future.
    await Promise.resolve();
}

describe(createSingleFlight, () => {
    it("deduplicates concurrent calls", async () => {
        const deferred = createDeferred<number>();
        const fn = vi.fn(async () => deferred.promise);

        const singleFlight = createSingleFlight(fn);

        const first = singleFlight();
        const second = singleFlight();

        await flushMicrotasks();

        expect(fn).toHaveBeenCalledTimes(1);

        deferred.resolve(42);

        await expect(first).resolves.toBe(42);
        await expect(second).resolves.toBe(42);
    });

    it("runs again after the in-flight promise settles", async () => {
        const deferred = createDeferred<number>();
        const fn = vi.fn(async () => deferred.promise);

        const singleFlight = createSingleFlight(fn);

        const first = singleFlight();

        await flushMicrotasks();
        expect(fn).toHaveBeenCalledTimes(1);

        deferred.resolve(1);
        await expect(first).resolves.toBe(1);

        const secondDeferred = createDeferred<number>();
        fn.mockImplementationOnce(async () => secondDeferred.promise);

        const second = singleFlight();

        await flushMicrotasks();
        expect(fn).toHaveBeenCalledTimes(2);

        secondDeferred.resolve(2);
        await expect(second).resolves.toBe(2);
    });

    it("propagates rejections and clears state", async () => {
        const deferred = createDeferred<number>();
        const fn = vi.fn(async () => deferred.promise);

        const singleFlight = createSingleFlight(fn);

        const first = singleFlight();
        const second = singleFlight();

        await flushMicrotasks();
        expect(fn).toHaveBeenCalledTimes(1);

        const error = new Error("boom");
        deferred.reject(error);

        await expect(first).rejects.toBe(error);
        await expect(second).rejects.toBe(error);

        const thirdDeferred = createDeferred<number>();
        fn.mockImplementationOnce(async () => thirdDeferred.promise);

        const third = singleFlight();

        await flushMicrotasks();
        expect(fn).toHaveBeenCalledTimes(2);

        thirdDeferred.resolve(7);
        await expect(third).resolves.toBe(7);
    });

    it("converts synchronous throws into a rejected promise", async () => {
        const fn = vi.fn((): Promise<number> => {
            throw new Error("sync boom");
        });

        const singleFlight = createSingleFlight(fn);

        await expect(singleFlight()).rejects.toThrowError("sync boom");
        // State should clear after the rejection.
        await expect(singleFlight()).rejects.toThrowError("sync boom");
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("preserves arguments for the first call", async () => {
        const deferred = createDeferred<string>();
        const fn = vi.fn(async (value: string) => {
            expect(value).toBe("first");
            return deferred.promise;
        });

        const singleFlight = createSingleFlight(fn);

        const first = singleFlight("first");
        const second = singleFlight("second");

        await flushMicrotasks();
        expect(fn).toHaveBeenCalledTimes(1);

        deferred.resolve("ok");

        await expect(first).resolves.toBe("ok");
        await expect(second).resolves.toBe("ok");
    });
});
