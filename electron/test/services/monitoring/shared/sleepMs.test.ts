import { afterEach, describe, expect, it, vi } from "vitest";

import { sleepMs } from "../../../../services/monitoring/shared/sleepMs";

describe(sleepMs, () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it.each([Number.NaN, Infinity, -Infinity, -1, 0])(
        "resolves immediately for invalid duration %s",
        async (durationMs) => {
            await expect(sleepMs(durationMs)).resolves.toBeUndefined();
        }
    );

    it("waits for finite positive durations", async () => {
        vi.useFakeTimers();

        const promise = sleepMs(25.8);
        await vi.advanceTimersByTimeAsync(25);

        let resolved = false;
        void promise.then(() => {
            resolved = true;
        });
        await Promise.resolve();

        expect(resolved).toBeFalsy();

        await vi.advanceTimersByTimeAsync(1);
        await expect(promise).resolves.toBeUndefined();
    });
});
