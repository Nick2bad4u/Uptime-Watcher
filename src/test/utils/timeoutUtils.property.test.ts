/**
 * Uses fast-check to systematically test timeout conversion and clamping logic
 * across numeric inputs and edge cases. Validates mathematical properties,
 * boundary conditions, and defensive handling of extreme values.
 *
 * @file Comprehensive property-based tests for timeout utilities
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-05
 */

import { test } from "@fast-check/vitest";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
    TIMEOUT_CONSTRAINTS,
} from "../../constants";
import {
    clampTimeoutSeconds,
    getTimeoutSeconds,
    timeoutSecondsToMs,
} from "../../utils/timeoutUtils";

describe("timeoutUtils Property-Based Tests", () => {
    /**
     * Custom arbitraries for testing timeout values using doubles for better
     * precision
     */
    const validTimeoutSeconds = fc.double({
        max: TIMEOUT_CONSTRAINTS.MAX,
        min: TIMEOUT_CONSTRAINTS.MIN,
        noNaN: true,
    });

    const validTimeoutMs = fc.double({
        max: TIMEOUT_CONSTRAINTS.MAX * 1000,
        min: TIMEOUT_CONSTRAINTS.MIN * 1000,
        noNaN: true,
    });

    describe(clampTimeoutSeconds, () => {
        test.prop([validTimeoutSeconds])(
            "should return input unchanged for valid timeout values",
            (validTimeout) => {
                const result = clampTimeoutSeconds(validTimeout);

                expect(result).toBeCloseTo(validTimeout, 2);
            }
        );

        test.prop([
            fc.double({
                max: TIMEOUT_CONSTRAINTS.MIN - 0.1,
                min: -10_000,
                noNaN: true,
            }),
        ])(
            "should return minimum value for inputs below minimum",
            (belowMin) => {
                const result = clampTimeoutSeconds(belowMin);

                expect(result).toBe(TIMEOUT_CONSTRAINTS.MIN);
            }
        );

        test.prop([
            fc.double({
                max: 10_000,
                min: TIMEOUT_CONSTRAINTS.MAX + 0.1,
                noNaN: true,
            }),
        ])(
            "should return maximum value for inputs above maximum",
            (aboveMax) => {
                const result = clampTimeoutSeconds(aboveMax);

                expect(result).toBe(TIMEOUT_CONSTRAINTS.MAX);
            }
        );

        test.prop([fc.double()])(
            "should always return a value within valid range",
            (anyTimeout) => {
                const result = clampTimeoutSeconds(anyTimeout);

                expect(result).toBeGreaterThanOrEqual(TIMEOUT_CONSTRAINTS.MIN);
                expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS.MAX);
            }
        );

        test.prop([
            fc.oneof(
                fc.constant(NaN),
                fc.constant(Infinity),
                fc.constant(Number.NEGATIVE_INFINITY)
            ),
        ])("should handle special numeric values", (specialValue) => {
            expect(() => clampTimeoutSeconds(specialValue)).not.toThrow();

            const result = clampTimeoutSeconds(specialValue);

            expect(result).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });
    });

    describe(timeoutSecondsToMs, () => {
        test.prop([fc.double({ noNaN: true })])(
            "should correctly convert seconds to milliseconds",
            (timeoutSeconds) => {
                const result = timeoutSecondsToMs(timeoutSeconds);

                expect(result).toBeCloseTo(timeoutSeconds * 1000, 5);
            }
        );

        test.prop([fc.integer({ max: 100, min: 1 })])(
            "should produce exact results for integer second values",
            (wholeSeconds) => {
                const result = timeoutSecondsToMs(wholeSeconds);
                const expected = wholeSeconds * 1000;

                expect(result).toBe(expected);
            }
        );

        test.prop([fc.constant(0)])("should handle zero correctly", (zero) => {
            const result = timeoutSecondsToMs(zero);

            expect(result).toBe(0);
        });

        test.prop([fc.double({ max: 100, min: 0.1, noNaN: true })])(
            "should be invertible through getTimeoutSeconds for reasonable values",
            (timeoutSeconds) => {
                const ms = timeoutSecondsToMs(timeoutSeconds);
                const backToSeconds = getTimeoutSeconds(ms);

                expect(backToSeconds).toBeCloseTo(timeoutSeconds, 5);
            }
        );
    });

    describe("conversion round-trip properties", () => {
        test.prop([fc.double({ max: 1000, min: 0.001, noNaN: true })])(
            "should maintain precision in round-trip conversions (seconds -> ms -> seconds)",
            (originalSeconds) => {
                const ms = timeoutSecondsToMs(originalSeconds);
                const backToSeconds = getTimeoutSeconds(ms);

                expect(backToSeconds).toBeCloseTo(originalSeconds, 5);
            }
        );

        test.prop([fc.double({ max: 1_000_000, min: 1, noNaN: true })])(
            "should maintain precision in round-trip conversions (ms -> seconds -> ms)",
            (originalMs) => {
                const seconds = getTimeoutSeconds(originalMs);
                const backToMs = timeoutSecondsToMs(seconds);

                expect(backToMs).toBeCloseTo(originalMs, 3);
            }
        );
    });

    describe(getTimeoutSeconds, () => {
        test.prop([validTimeoutMs])(
            "should convert valid millisecond timeouts to seconds",
            (timeoutMs) => {
                const result = getTimeoutSeconds(timeoutMs);
                const expected = timeoutMs / 1000;

                expect(result).toBeCloseTo(expected, 5);
            }
        );

        it("should return default when no timeout provided", () => {
            const result = getTimeoutSeconds();

            expect(result).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        it("should return default when undefined provided", () => {
            const result = getTimeoutSeconds(undefined);

            expect(result).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        test.prop([
            fc.oneof(fc.constant(0), fc.constant(null), fc.constant(false)),
        ])("should return default for falsy values", (falsyValue) => {
            const result = getTimeoutSeconds(falsyValue as any);

            expect(result).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        test.prop([
            fc
                .double({ max: 1_000_000, min: 1, noNaN: true })
                .filter((n) => n !== 0),
        ])(
            "should convert truthy numeric values correctly",
            (truthyTimeout) => {
                const result = getTimeoutSeconds(truthyTimeout);
                const expected = truthyTimeout / 1000;

                expect(result).toBeCloseTo(expected, 5);
            }
        );
    });

    describe("invariant properties", () => {
        test.prop([fc.double({ max: 1000, min: 1, noNaN: true })])(
            "clamping should always produce valid values",
            (timeout) => {
                const clampedSeconds = clampTimeoutSeconds(timeout);

                expect(clampedSeconds).toBeGreaterThanOrEqual(
                    TIMEOUT_CONSTRAINTS.MIN
                );
                expect(clampedSeconds).toBeLessThanOrEqual(
                    TIMEOUT_CONSTRAINTS.MAX
                );
            }
        );

        test.prop([validTimeoutSeconds])(
            "valid values should remain unchanged after clamping",
            (validSeconds) => {
                expect(clampTimeoutSeconds(validSeconds)).toBe(validSeconds);
            }
        );

        test.prop([fc.double({ max: 1000, min: 0.001, noNaN: true })])(
            "conversion should preserve mathematical relationships",
            (value) => {
                fc.pre(Number.isFinite(value) && value > 0);

                const seconds = value;
                const ms = timeoutSecondsToMs(seconds);

                // Skip if result would be infinite due to overflow
                fc.pre(Number.isFinite(ms));

                // Basic mathematical relationship: ms should be 1000 times seconds
                expect(ms).toBeCloseTo(seconds * 1000, 5);

                // Converting back should give original value
                const backToSeconds = getTimeoutSeconds(ms);

                expect(backToSeconds).toBeCloseTo(seconds, 5);
            }
        );
    });

    describe("edge cases and special values", () => {
        it("should handle zero timeout conversions", () => {
            expect(timeoutSecondsToMs(0)).toBe(0);
            expect(getTimeoutSeconds(0)).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        it("should handle negative timeout conversions", () => {
            expect(timeoutSecondsToMs(-5)).toBe(-5000);
            expect(getTimeoutSeconds(-5000)).toBe(
                DEFAULT_REQUEST_TIMEOUT_SECONDS
            );
        });

        it("should handle fractional seconds correctly", () => {
            const fractionalSeconds = 1.5;
            const ms = timeoutSecondsToMs(fractionalSeconds);

            expect(ms).toBe(1500);

            const backToSeconds = getTimeoutSeconds(ms);

            expect(backToSeconds).toBe(fractionalSeconds);
        });

        it("should handle very large numbers", () => {
            const largeNumber = 999_999_999;

            expect(() => {
                clampTimeoutSeconds(largeNumber);
                getTimeoutSeconds(largeNumber);
                timeoutSecondsToMs(largeNumber);
            }).not.toThrow();
        });
    });
});
