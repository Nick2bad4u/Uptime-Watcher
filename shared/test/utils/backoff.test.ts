import { describe, expect, it } from "vitest";

import {
    calculateBackoffDelayMs,
    MAX_BACKOFF_DELAY_MS,
} from "../../utils/backoff";

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
                attemptIndex: NaN,
                initialDelayMs: Infinity,
                strategy: "exponential",
            })
        ).toBe(0);
    });

    it("caps exponential delays at the maximum safe timer delay", () => {
        expect(
            calculateBackoffDelayMs({
                attemptIndex: 2048,
                initialDelayMs: 1000,
                strategy: "exponential",
            })
        ).toBe(MAX_BACKOFF_DELAY_MS);
    });

    it("caps linear delays at the maximum safe timer delay", () => {
        expect(
            calculateBackoffDelayMs({
                attemptIndex: Number.MAX_SAFE_INTEGER,
                initialDelayMs: 1000,
                strategy: "linear",
            })
        ).toBe(MAX_BACKOFF_DELAY_MS);
    });
});
