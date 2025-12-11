/**
 * Uses fast-check to systematically test timeout conversion, validation, and
 * clamping logic across all possible numeric inputs and edge cases. Validates
 * mathematical properties, boundary conditions, and defensive handling of
 * extreme values.
 *
 * @file Comprehensive property-based tests for timeout utilities
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-05
 */

import { describe, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";

import {
    clampTimeoutMs,
    clampTimeoutSeconds,
    timeoutMsToSeconds,
    timeoutSecondsToMs,
    getTimeoutSeconds,
    isValidTimeoutMs,
    isValidTimeoutSeconds,
} from "../../utils/timeoutUtils";

import {
    TIMEOUT_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS_MS,
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
} from "../../constants";

describe("TimeoutUtils Property-Based Tests", () => {
    /**
     * Custom arbitraries for testing timeout values using doubles for better
     * precision
     */
    const validTimeoutSeconds = fc.double({
        min: TIMEOUT_CONSTRAINTS.MIN,
        max: TIMEOUT_CONSTRAINTS.MAX,
        noNaN: true,
    });

    const validTimeoutMs = fc.double({
        min: TIMEOUT_CONSTRAINTS_MS.MIN,
        max: TIMEOUT_CONSTRAINTS_MS.MAX,
        noNaN: true,
    });

    const invalidTimeoutSeconds = fc.oneof(
        fc.double({
            min: -1000,
            max: TIMEOUT_CONSTRAINTS.MIN - 0.1,
            noNaN: true,
        }), // Below minimum
        fc.double({
            min: TIMEOUT_CONSTRAINTS.MAX + 0.1,
            max: 10_000,
            noNaN: true,
        }), // Above maximum
        fc.constant(Number.NEGATIVE_INFINITY),
        fc.constant(Number.POSITIVE_INFINITY),
        fc.constant(Number.NaN)
    );

    const invalidTimeoutMs = fc.oneof(
        fc.double({
            min: -1_000_000,
            max: TIMEOUT_CONSTRAINTS_MS.MIN - 1,
            noNaN: true,
        }), // Below minimum
        fc.double({
            min: TIMEOUT_CONSTRAINTS_MS.MAX + 1,
            max: 10_000_000,
            noNaN: true,
        }), // Above maximum
        fc.constant(Number.NEGATIVE_INFINITY),
        fc.constant(Number.POSITIVE_INFINITY),
        fc.constant(Number.NaN)
    );

    describe(clampTimeoutMs, () => {
        test.prop([validTimeoutMs])(
            "should return input unchanged for valid timeout values",
            (validTimeout) => {
                const result = clampTimeoutMs(validTimeout);
                expect(result).toBeCloseTo(validTimeout, 2);
            }
        );

        test.prop([
            fc.double({
                min: -10_000_000,
                max: TIMEOUT_CONSTRAINTS_MS.MIN - 1,
                noNaN: true,
            }),
        ])("should return minimum value for inputs below minimum", (
            belowMin
        ) => {
            const result = clampTimeoutMs(belowMin);
            expect(result).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
        });

        test.prop([
            fc.double({
                min: TIMEOUT_CONSTRAINTS_MS.MAX + 1,
                max: 10_000_000,
                noNaN: true,
            }),
        ])("should return maximum value for inputs above maximum", (
            aboveMax
        ) => {
            const result = clampTimeoutMs(aboveMax);
            expect(result).toBe(TIMEOUT_CONSTRAINTS_MS.MAX);
        });

        test.prop([fc.double()])(
            "should always return a value within valid range",
            (anyTimeout) => {
                // Skip NaN and Infinity cases for this test
                fc.pre(
                    !Number.isNaN(anyTimeout) && Number.isFinite(anyTimeout)
                );

                const result = clampTimeoutMs(anyTimeout);
                expect(result).toBeGreaterThanOrEqual(
                    TIMEOUT_CONSTRAINTS_MS.MIN
                );
                expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS_MS.MAX);
            }
        );

        test.prop([
            fc.oneof(
                fc.constant(Number.NaN),
                fc.constant(Number.POSITIVE_INFINITY),
                fc.constant(Number.NEGATIVE_INFINITY)
            ),
        ])("should handle special numeric values", (specialValue) => {
            // Test that it doesn't crash on special values
            expect(() => clampTimeoutMs(specialValue)).not.toThrowError();
            const result = clampTimeoutMs(specialValue);
            // For NaN, Math.max/min behavior is to return NaN, but we want to verify behavior
            expect(
                Number.isFinite(result) || Number.isNaN(result)
            ).toBeTruthy();
        });
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
                min: -10_000,
                max: TIMEOUT_CONSTRAINTS.MIN - 0.1,
                noNaN: true,
            }),
        ])("should return minimum value for inputs below minimum", (
            belowMin
        ) => {
            const result = clampTimeoutSeconds(belowMin);
            expect(result).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        test.prop([
            fc.double({
                min: TIMEOUT_CONSTRAINTS.MAX + 0.1,
                max: 10_000,
                noNaN: true,
            }),
        ])("should return maximum value for inputs above maximum", (
            aboveMax
        ) => {
            const result = clampTimeoutSeconds(aboveMax);
            expect(result).toBe(TIMEOUT_CONSTRAINTS.MAX);
        });

        test.prop([fc.double()])(
            "should always return a value within valid range",
            (anyTimeout) => {
                // Skip NaN and Infinity cases for this test
                fc.pre(
                    !Number.isNaN(anyTimeout) && Number.isFinite(anyTimeout)
                );

                const result = clampTimeoutSeconds(anyTimeout);
                expect(result).toBeGreaterThanOrEqual(TIMEOUT_CONSTRAINTS.MIN);
                expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS.MAX);
            }
        );
    });

    describe(timeoutMsToSeconds, () => {
        test.prop([fc.double({ noNaN: true })])(
            "should correctly convert milliseconds to seconds",
            (timeoutMs) => {
                const result = timeoutMsToSeconds(timeoutMs);
                expect(result).toBeCloseTo(timeoutMs / 1000, 5);
            }
        );

        test.prop([fc.integer({ min: 1000, max: 10_000 })])(
            "should produce exact results for integer millisecond values",
            (wholeMs) => {
                const result = timeoutMsToSeconds(wholeMs);
                const expected = wholeMs / 1000;
                expect(result).toBe(expected);
            }
        );

        test.prop([fc.constant(0)])("should handle zero correctly", (zero) => {
            const result = timeoutMsToSeconds(zero);
            expect(result).toBe(0);
        });

        test.prop([fc.double({ min: 100, max: 5000, noNaN: true })])(
            "should be invertible with timeoutSecondsToMs for reasonable values",
            (timeoutMs) => {
                const seconds = timeoutMsToSeconds(timeoutMs);
                const backToMs = timeoutSecondsToMs(seconds);
                expect(backToMs).toBeCloseTo(timeoutMs, 3);
            }
        );
    });

    describe(timeoutSecondsToMs, () => {
        test.prop([fc.double({ noNaN: true })])(
            "should correctly convert seconds to milliseconds",
            (timeoutSeconds) => {
                const result = timeoutSecondsToMs(timeoutSeconds);
                expect(result).toBeCloseTo(timeoutSeconds * 1000, 5);
            }
        );

        test.prop([fc.integer({ min: 1, max: 100 })])(
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

        test.prop([fc.double({ min: 0.1, max: 100, noNaN: true })])(
            "should be invertible with timeoutMsToSeconds for reasonable values",
            (timeoutSeconds) => {
                const ms = timeoutSecondsToMs(timeoutSeconds);
                const backToSeconds = timeoutMsToSeconds(ms);
                expect(backToSeconds).toBeCloseTo(timeoutSeconds, 5);
            }
        );
    });

    describe("Conversion round-trip properties", () => {
        test.prop([fc.double({ min: 0.001, max: 1000, noNaN: true })])(
            "should maintain precision in round-trip conversions (seconds -> ms -> seconds)",
            (originalSeconds) => {
                const ms = timeoutSecondsToMs(originalSeconds);
                const backToSeconds = timeoutMsToSeconds(ms);
                expect(backToSeconds).toBeCloseTo(originalSeconds, 5);
            }
        );

        test.prop([fc.double({ min: 1, max: 1_000_000, noNaN: true })])(
            "should maintain precision in round-trip conversions (ms -> seconds -> ms)",
            (originalMs) => {
                const seconds = timeoutMsToSeconds(originalMs);
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

        test("should return default when no timeout provided", () => {
            const result = getTimeoutSeconds();
            expect(result).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        test("should return default when undefined provided", () => {
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
                .double({ min: 1, max: 1_000_000, noNaN: true })
                .filter((n) => n !== 0),
        ])("should convert truthy numeric values correctly", (
            truthyTimeout
        ) => {
            const result = getTimeoutSeconds(truthyTimeout);
            const expected = truthyTimeout / 1000;
            expect(result).toBeCloseTo(expected, 5);
        });
    });

    describe(isValidTimeoutMs, () => {
        test.prop([validTimeoutMs])(
            "should return true for all valid timeout values in milliseconds",
            (validTimeout) => {
                const result = isValidTimeoutMs(validTimeout);
                expect(result).toBeTruthy();
            }
        );

        test.prop([invalidTimeoutMs])(
            "should return false for invalid timeout values in milliseconds",
            (invalidTimeout) => {
                // Skip NaN case as NaN comparisons are always false
                fc.pre(!Number.isNaN(invalidTimeout));
                const result = isValidTimeoutMs(invalidTimeout);
                expect(result).toBeFalsy();
            }
        );

        test("should return false for NaN", () => {
            const result = isValidTimeoutMs(Number.NaN);
            expect(result).toBeFalsy();
        });

        test("should return true for exact boundary values", () => {
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBeTruthy();
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBeTruthy();
        });

        test("should return false for just outside boundary values", () => {
            expect(
                isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN - 1)
            ).toBeFalsy();
            expect(
                isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX + 1)
            ).toBeFalsy();
        });
    });

    describe(isValidTimeoutSeconds, () => {
        test.prop([validTimeoutSeconds])(
            "should return true for all valid timeout values in seconds",
            (validTimeout) => {
                const result = isValidTimeoutSeconds(validTimeout);
                expect(result).toBeTruthy();
            }
        );

        test.prop([invalidTimeoutSeconds])(
            "should return false for invalid timeout values in seconds",
            (invalidTimeout) => {
                // Skip NaN case as NaN comparisons are always false
                fc.pre(!Number.isNaN(invalidTimeout));
                const result = isValidTimeoutSeconds(invalidTimeout);
                expect(result).toBeFalsy();
            }
        );

        test("should return false for NaN", () => {
            const result = isValidTimeoutSeconds(Number.NaN);
            expect(result).toBeFalsy();
        });

        test("should return true for exact boundary values", () => {
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBeTruthy();
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBeTruthy();
        });

        test("should return false for just outside boundary values", () => {
            expect(
                isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN - 0.1)
            ).toBeFalsy();
            expect(
                isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX + 0.1)
            ).toBeFalsy();
        });
    });

    describe("Invariant properties", () => {
        test.prop([fc.double({ min: 1, max: 1000, noNaN: true })])(
            "clamping should always produce valid values",
            (timeout) => {
                const clampedMs = clampTimeoutMs(timeout * 1000);
                const clampedSeconds = clampTimeoutSeconds(timeout);

                expect(isValidTimeoutMs(clampedMs)).toBeTruthy();
                expect(isValidTimeoutSeconds(clampedSeconds)).toBeTruthy();
            }
        );

        test.prop([validTimeoutSeconds, validTimeoutMs])(
            "valid values should remain unchanged after clamping",
            (validSeconds, validMs) => {
                expect(clampTimeoutSeconds(validSeconds)).toBe(validSeconds);
                expect(clampTimeoutMs(validMs)).toBe(validMs);
            }
        );

        test.prop([fc.double({ min: 0.001, max: 1000, noNaN: true })])(
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
                const backToSeconds = timeoutMsToSeconds(ms);
                expect(backToSeconds).toBeCloseTo(seconds, 5);
            }
        );
    });

    describe("Edge cases and special values", () => {
        test("should handle zero timeout conversions", () => {
            expect(timeoutSecondsToMs(0)).toBe(0);
            expect(timeoutMsToSeconds(0)).toBe(0);
            expect(isValidTimeoutMs(0)).toBeFalsy(); // Zero is below minimum
            expect(isValidTimeoutSeconds(0)).toBeFalsy(); // Zero is below minimum
        });

        test("should handle negative timeout conversions", () => {
            expect(timeoutSecondsToMs(-5)).toBe(-5000);
            expect(timeoutMsToSeconds(-5000)).toBe(-5);
            expect(isValidTimeoutMs(-5000)).toBeFalsy();
            expect(isValidTimeoutSeconds(-5)).toBeFalsy();
        });

        test("should handle fractional seconds correctly", () => {
            const fractionalSeconds = 1.5;
            const ms = timeoutSecondsToMs(fractionalSeconds);
            expect(ms).toBe(1500);

            const backToSeconds = timeoutMsToSeconds(ms);
            expect(backToSeconds).toBe(fractionalSeconds);
        });

        test("should handle very large numbers", () => {
            const largeNumber = 999_999_999;
            expect(() => {
                clampTimeoutMs(largeNumber);
                clampTimeoutSeconds(largeNumber);
                timeoutSecondsToMs(largeNumber);
                timeoutMsToSeconds(largeNumber);
            }).not.toThrowError();
        });
    });
});
