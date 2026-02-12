import { describe, expect, it } from "vitest";

import { calculateBackoffDelayMs } from "../../utils/backoff";

describe(calculateBackoffDelayMs, () => {
    it("returns initial delay for first exponential retry (attemptIndex=0)", () => {
        expect(
            calculateBackoffDelayMs({
                attemptIndex: 0,
                initialDelayMs: 1000,
                strategy: "exponential",
            })
        ).toBe(1000);
    });

    it("doubles delay for second exponential retry (attemptIndex=1)", () => {
        expect(
            calculateBackoffDelayMs({
                attemptIndex: 1,
                initialDelayMs: 1000,
                strategy: "exponential",
            })
        ).toBe(2000);
    });

    it("uses multiplier when provided", () => {
        expect(
            calculateBackoffDelayMs({
                attemptIndex: 2,
                initialDelayMs: 100,
                multiplier: 3,
                strategy: "exponential",
            })
        ).toBe(900);
    });

    it("scales linearly using attemptIndex+1", () => {
        expect(
            calculateBackoffDelayMs({
                attemptIndex: 0,
                initialDelayMs: 250,
                strategy: "linear",
            })
        ).toBe(250);

        expect(
            calculateBackoffDelayMs({
                attemptIndex: 1,
                initialDelayMs: 250,
                strategy: "linear",
            })
        ).toBe(500);
    });

    it("treats negative or non-finite inputs as 0", () => {
        expect(
            calculateBackoffDelayMs({
                attemptIndex: -1,
                initialDelayMs: 100,
                strategy: "linear",
            })
        ).toBe(100);

        expect(
            calculateBackoffDelayMs({
                attemptIndex: 1,
                initialDelayMs: -100,
                strategy: "exponential",
            })
        ).toBe(0);

        expect(
            calculateBackoffDelayMs({
                attemptIndex: Number.NaN,
                initialDelayMs: Number.POSITIVE_INFINITY,
                strategy: "exponential",
            })
        ).toBe(0);
    });
});
