/**
 * Comprehensive tests for timeout utilities. Tests all timeout conversion and
 * validation functions with edge cases.
 *
 * @remarks
 * Enhanced with fast-check property-based testing to systematically explore
 * edge cases and validate invariants across all timeout utility functions.
 * Tests both traditional scenarios and property-based fuzzing for robustness.
 */

import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";

import {
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
    TIMEOUT_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS_MS,
} from "../../constants";
import {
    clampTimeoutMs,
    clampTimeoutSeconds,
    getTimeoutSeconds,
    isValidTimeoutMs,
    isValidTimeoutSeconds,
    timeoutMsToSeconds,
    timeoutSecondsToMs,
} from "../../utils/timeoutUtils";

describe("Timeout Utilities", () => {
    describe(clampTimeoutMs, () => {
        it("should return the input when within valid range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validTimeout = 30_000; // 30 seconds
            expect(clampTimeoutMs(validTimeout)).toBe(validTimeout);
        });

        it("should clamp to minimum when below range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const belowMin = TIMEOUT_CONSTRAINTS_MS.MIN - 1000;
            expect(clampTimeoutMs(belowMin)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
        });

        it("should clamp to maximum when above range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const aboveMax = TIMEOUT_CONSTRAINTS_MS.MAX + 1000;
            expect(clampTimeoutMs(aboveMax)).toBe(TIMEOUT_CONSTRAINTS_MS.MAX);
        });

        it("should handle edge values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MIN
            );
            expect(clampTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MAX
            );
        });

        it("should handle zero and negative values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutMs(0)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
            expect(clampTimeoutMs(-5000)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractional = 15_000.5;
            expect(clampTimeoutMs(fractional)).toBe(fractional);
        });
    });

    describe(clampTimeoutSeconds, () => {
        it("should return the input when within valid range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validTimeout = 30; // 30 seconds
            expect(clampTimeoutSeconds(validTimeout)).toBe(validTimeout);
        });

        it("should clamp to minimum when below range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const belowMin = TIMEOUT_CONSTRAINTS.MIN - 1;
            expect(clampTimeoutSeconds(belowMin)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should clamp to maximum when above range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const aboveMax = TIMEOUT_CONSTRAINTS.MAX + 1;
            expect(clampTimeoutSeconds(aboveMax)).toBe(TIMEOUT_CONSTRAINTS.MAX);
        });

        it("should handle edge values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS.MIN
            );
            expect(clampTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS.MAX
            );
        });

        it("should handle zero and negative values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutSeconds(0)).toBe(TIMEOUT_CONSTRAINTS.MIN);
            expect(clampTimeoutSeconds(-5)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractional = 15.5;
            expect(clampTimeoutSeconds(fractional)).toBe(fractional);
        });
    });

    describe(getTimeoutSeconds, () => {
        it("should convert monitor timeout from ms to seconds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const timeoutMs = 15_000; // 15 seconds
            expect(getTimeoutSeconds(timeoutMs)).toBe(15);
        });

        it("should return default when monitor timeout is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            expect(getTimeoutSeconds()).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(getTimeoutSeconds(undefined)).toBe(
                DEFAULT_REQUEST_TIMEOUT_SECONDS
            );
        });

        it("should handle zero timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(0)).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        it("should handle fractional milliseconds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(1500)).toBe(1.5);
        });

        it("should handle large timeout values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(60_000)).toBe(60);
        });
    });

    describe(isValidTimeoutMs, () => {
        it("should return true for valid timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(5000)).toBeTruthy();
            expect(isValidTimeoutMs(30_000)).toBeTruthy();
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBeTruthy();
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBeTruthy();
        });

        it("should return false for values below minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN - 1)).toBeFalsy(
                
            );
            expect(isValidTimeoutMs(0)).toBeFalsy();
            expect(isValidTimeoutMs(-1000)).toBeFalsy();
        });

        it("should return false for values above maximum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX + 1)).toBeFalsy(
                
            );
            expect(isValidTimeoutMs(Number.MAX_SAFE_INTEGER)).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(Number.POSITIVE_INFINITY)).toBeFalsy();
            expect(isValidTimeoutMs(Number.NEGATIVE_INFINITY)).toBeFalsy();
            expect(isValidTimeoutMs(Number.NaN)).toBeFalsy();
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractionalValid = TIMEOUT_CONSTRAINTS_MS.MIN + 0.5;
            expect(isValidTimeoutMs(fractionalValid)).toBeTruthy();
        });
    });

    describe(isValidTimeoutSeconds, () => {
        it("should return true for valid timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(5)).toBeTruthy();
            expect(isValidTimeoutSeconds(30)).toBeTruthy();
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBeTruthy();
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBeTruthy();
        });

        it("should return false for values below minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN - 1)).toBeFalsy(
                
            );
            expect(isValidTimeoutSeconds(0)).toBeFalsy();
            expect(isValidTimeoutSeconds(-1)).toBeFalsy();
        });

        it("should return false for values above maximum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX + 1)).toBeFalsy(
                
            );
            expect(isValidTimeoutSeconds(Number.MAX_SAFE_INTEGER)).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(Number.POSITIVE_INFINITY)).toBeFalsy();
            expect(isValidTimeoutSeconds(Number.NEGATIVE_INFINITY)).toBeFalsy();
            expect(isValidTimeoutSeconds(Number.NaN)).toBeFalsy();
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractionalValid = TIMEOUT_CONSTRAINTS.MIN + 0.5;
            expect(isValidTimeoutSeconds(fractionalValid)).toBeTruthy();
        });
    });

    describe(timeoutMsToSeconds, () => {
        it("should convert milliseconds to seconds correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(1000)).toBe(1);
            expect(timeoutMsToSeconds(5000)).toBe(5);
            expect(timeoutMsToSeconds(30_000)).toBe(30);
        });

        it("should handle zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(0)).toBe(0);
        });

        it("should handle fractional milliseconds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(1500)).toBe(1.5);
            expect(timeoutMsToSeconds(2750)).toBe(2.75);
        });

        it("should handle large values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(60_000)).toBe(60);
            expect(timeoutMsToSeconds(300_000)).toBe(300);
        });

        it("should preserve precision for small values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(1)).toBe(0.001);
            expect(timeoutMsToSeconds(100)).toBe(0.1);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(Number.MAX_SAFE_INTEGER)).toBe(
                Number.MAX_SAFE_INTEGER / 1000
            );
            expect(timeoutMsToSeconds(Number.MIN_VALUE)).toBe(
                Number.MIN_VALUE / 1000
            );
        });
    });

    describe(timeoutSecondsToMs, () => {
        it("should convert seconds to milliseconds correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(1)).toBe(1000);
            expect(timeoutSecondsToMs(5)).toBe(5000);
            expect(timeoutSecondsToMs(30)).toBe(30_000);
        });

        it("should handle zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(0)).toBe(0);
        });

        it("should handle fractional seconds", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(1.5)).toBe(1500);
            expect(timeoutSecondsToMs(2.75)).toBe(2750);
        });

        it("should handle large values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(60)).toBe(60_000);
            expect(timeoutSecondsToMs(300)).toBe(300_000);
        });

        it("should preserve precision for small values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(0.001)).toBe(1);
            expect(timeoutSecondsToMs(0.1)).toBe(100);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(Number.MAX_SAFE_INTEGER)).toBe(
                Number.MAX_SAFE_INTEGER * 1000
            );
            expect(timeoutSecondsToMs(Number.MIN_VALUE)).toBe(
                Number.MIN_VALUE * 1000
            );
        });
    });

    describe("Conversion consistency", () => {
        it("should maintain round-trip conversion accuracy", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalMs = 15_000;
            const convertedSeconds = timeoutMsToSeconds(originalMs);
            const backToMs = timeoutSecondsToMs(convertedSeconds);
            expect(backToMs).toBe(originalMs);
        });

        it("should maintain round-trip conversion for fractional values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalSeconds = 15.5;
            const convertedMs = timeoutSecondsToMs(originalSeconds);
            const backToSeconds = timeoutMsToSeconds(convertedMs);
            expect(backToSeconds).toBe(originalSeconds);
        });
    });

    describe("Integration with constants", () => {
        it("should work correctly with constraint constants", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test that MIN/MAX constants work with validation functions
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBeTruthy();
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBeTruthy();
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBeTruthy();
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBeTruthy();

            // Test conversion consistency with constants
            expect(timeoutSecondsToMs(TIMEOUT_CONSTRAINTS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MIN
            );
            expect(timeoutSecondsToMs(TIMEOUT_CONSTRAINTS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MAX
            );
        });

        it("should work correctly with default timeout constant", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds()).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(isValidTimeoutSeconds(DEFAULT_REQUEST_TIMEOUT_SECONDS)).toBeTruthy(
                
            );
        });
    });

    /**
     * Fast-check property-based tests for comprehensive edge case coverage.
     * These tests use property-based testing to systematically explore
     * the timeout utility function behavior across all possible inputs.
     */
    describe("Property-Based Fuzzing Tests", () => {
        describe("clampTimeoutMs property tests", () => {
            test.prop([fc.integer()])(
                "should always return a value within valid bounds",
                (input) => {
                    const result = clampTimeoutMs(input);

                    // Property: Result must be within valid range
                    expect(result).toBeGreaterThanOrEqual(TIMEOUT_CONSTRAINTS_MS.MIN);
                    expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS_MS.MAX);

                    // Property: If input is within bounds, should return input unchanged
                    if (input >= TIMEOUT_CONSTRAINTS_MS.MIN && input <= TIMEOUT_CONSTRAINTS_MS.MAX) {
                        expect(result).toBe(input);
                    }

                    // Property: If input is below minimum, should return minimum
                    if (input < TIMEOUT_CONSTRAINTS_MS.MIN) {
                        expect(result).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
                    }

                    // Property: If input is above maximum, should return maximum
                    if (input > TIMEOUT_CONSTRAINTS_MS.MAX) {
                        expect(result).toBe(TIMEOUT_CONSTRAINTS_MS.MAX);
                    }
                }
            );

            test.prop([fc.float({ noNaN: true })])(
                "should handle floating point inputs correctly",
                (input) => {
                    const result = clampTimeoutMs(input);

                    // Property: Result should be finite and within bounds
                    expect(Number.isFinite(result)).toBeTruthy();
                    expect(result).toBeGreaterThanOrEqual(TIMEOUT_CONSTRAINTS_MS.MIN);
                    expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS_MS.MAX);
                }
            );

            test.prop([fc.oneof(fc.constant(Number.NaN), fc.constant(Infinity), fc.constant(-Infinity))])(
                "should handle special numeric values safely",
                (input) => {
                    const result = clampTimeoutMs(input);

                    // Property: Should handle special values gracefully
                    // NaN with Math.max/min returns NaN, which is the actual behavior
                    if (Number.isNaN(input)) {
                        expect(Number.isNaN(result)).toBeTruthy();
                    }
                    // Infinity should clamp to max
                    if (input === Infinity) {
                        expect(result).toBe(TIMEOUT_CONSTRAINTS_MS.MAX);
                    }
                    // -Infinity should clamp to min
                    if (input === -Infinity) {
                        expect(result).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
                    }
                }
            );
        });

        describe("clampTimeoutSeconds property tests", () => {
            test.prop([fc.integer()])(
                "should always return a value within valid bounds",
                (input) => {
                    const result = clampTimeoutSeconds(input);

                    // Property: Result must be within valid range
                    expect(result).toBeGreaterThanOrEqual(TIMEOUT_CONSTRAINTS.MIN);
                    expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS.MAX);

                    // Property: If input is within bounds, should return input unchanged
                    if (input >= TIMEOUT_CONSTRAINTS.MIN && input <= TIMEOUT_CONSTRAINTS.MAX) {
                        expect(result).toBe(input);
                    }
                }
            );

            test.prop([fc.float({ min: 0, max: Math.fround(1000), noNaN: true })])(
                "should handle fractional seconds correctly",
                (input) => {
                    const result = clampTimeoutSeconds(input);

                    // Property: Result should preserve precision when within bounds
                    expect(Number.isFinite(result)).toBeTruthy();
                    expect(result).toBeGreaterThanOrEqual(TIMEOUT_CONSTRAINTS.MIN);
                    expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS.MAX);
                }
            );
        });

        describe("timeoutMsToSeconds property tests", () => {
            test.prop([fc.integer({ min: 0, max: 1_000_000 })])(
                "should accurately convert milliseconds to seconds",
                (ms) => {
                    const result = timeoutMsToSeconds(ms);

                    // Property: Conversion should be exact division by 1000
                    expect(result).toBe(ms / 1000);

                    // Property: Converting back should yield original value (within precision)
                    expect(timeoutSecondsToMs(result)).toBeCloseTo(ms);
                }
            );

            test.prop([fc.float({ min: 0, max: Math.fround(1_000_000) }).filter(x => !Number.isNaN(x))])(
                "should handle fractional milliseconds",
                (ms) => {
                    const result = timeoutMsToSeconds(ms);

                    // Property: Should maintain precision
                    expect(result * 1000).toBeCloseTo(ms);
                }
            );

            test.prop([fc.oneof(fc.constant(0), fc.constant(1000), fc.constant(5000))])(
                "should handle common timeout values correctly",
                (ms) => {
                    const result = timeoutMsToSeconds(ms);

                    // Property: Common values should convert exactly
                    if (ms === 0) expect(result).toBe(0);
                    if (ms === 1000) expect(result).toBe(1);
                    if (ms === 5000) expect(result).toBe(5);
                }
            );
        });

        describe("timeoutSecondsToMs property tests", () => {
            test.prop([fc.integer({ min: 0, max: 1000 })])(
                "should accurately convert seconds to milliseconds",
                (seconds) => {
                    const result = timeoutSecondsToMs(seconds);

                    // Property: Conversion should be exact multiplication by 1000
                    expect(result).toBe(seconds * 1000);

                    // Property: Converting back should yield original value
                    expect(timeoutMsToSeconds(result)).toBe(seconds);
                }
            );

            test.prop([fc.float({ min: 0, max: Math.fround(1000) })])(
                "should handle fractional seconds",
                (seconds) => {
                    const result = timeoutSecondsToMs(seconds);

                    // Property: Should maintain precision
                    expect(result / 1000).toBeCloseTo(seconds);
                }
            );
        });

        describe("isValidTimeoutMs property tests", () => {
            test.prop([fc.integer({ min: TIMEOUT_CONSTRAINTS_MS.MIN, max: TIMEOUT_CONSTRAINTS_MS.MAX })])(
                "should return true for all values within valid range",
                (timeoutMs) => {
                    expect(isValidTimeoutMs(timeoutMs)).toBeTruthy();
                }
            );

            test.prop([fc.integer({ max: TIMEOUT_CONSTRAINTS_MS.MIN - 1 })])(
                "should return false for values below minimum",
                (timeoutMs) => {
                    expect(isValidTimeoutMs(timeoutMs)).toBeFalsy();
                }
            );

            test.prop([fc.integer({ min: TIMEOUT_CONSTRAINTS_MS.MAX + 1 })])(
                "should return false for values above maximum",
                (timeoutMs) => {
                    expect(isValidTimeoutMs(timeoutMs)).toBeFalsy();
                }
            );

            test.prop([fc.oneof(fc.constant(Number.NaN), fc.constant(Infinity), fc.constant(-Infinity))])(
                "should handle special numeric values",
                (input) => {
                    const result = isValidTimeoutMs(input);

                    // Property: Special values should be invalid
                    expect(result).toBeFalsy();
                }
            );
        });

        describe("isValidTimeoutSeconds property tests", () => {
            test.prop([fc.integer({ min: TIMEOUT_CONSTRAINTS.MIN, max: TIMEOUT_CONSTRAINTS.MAX })])(
                "should return true for all values within valid range",
                (timeoutSeconds) => {
                    expect(isValidTimeoutSeconds(timeoutSeconds)).toBeTruthy();
                }
            );

            test.prop([fc.float({ min: TIMEOUT_CONSTRAINTS.MIN, max: Math.fround(TIMEOUT_CONSTRAINTS.MAX) })])(
                "should handle fractional seconds within range",
                (timeoutSeconds) => {
                    expect(isValidTimeoutSeconds(timeoutSeconds)).toBeTruthy();
                }
            );

            test.prop([fc.oneof(
                fc.integer({ max: TIMEOUT_CONSTRAINTS.MIN - 1 }),
                fc.float({ max: Math.fround(TIMEOUT_CONSTRAINTS.MIN - 0.1) })
            )])(
                "should return false for values below minimum",
                (timeoutSeconds) => {
                    expect(isValidTimeoutSeconds(timeoutSeconds)).toBeFalsy();
                }
            );

            test.prop([fc.oneof(
                fc.integer({ min: TIMEOUT_CONSTRAINTS.MAX + 1 }),
                fc.float({ min: Math.fround(TIMEOUT_CONSTRAINTS.MAX + 0.1) })
            )])(
                "should return false for values above maximum",
                (timeoutSeconds) => {
                    expect(isValidTimeoutSeconds(timeoutSeconds)).toBeFalsy();
                }
            );
        });

        describe("getTimeoutSeconds property tests", () => {
            test.prop([fc.integer({ min: 1000, max: 300_000 })])(
                "should convert valid milliseconds to seconds correctly",
                (monitorTimeout) => {
                    const result = getTimeoutSeconds(monitorTimeout);

                    // Property: Should convert milliseconds to seconds
                    expect(result).toBe(monitorTimeout / 1000);
                }
            );

            test.prop([fc.oneof(fc.constant(undefined))])(
                "should return default timeout when no input provided",
                (input) => {
                    const result = getTimeoutSeconds(input);

                    // Property: Should return default when no monitor timeout provided
                    expect(result).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
                }
            );

            test.prop([fc.constant(0)])(
                "should handle zero timeout gracefully",
                (monitorTimeout) => {
                    const result = getTimeoutSeconds(monitorTimeout);

                    // Property: Zero is falsy, so should return default timeout
                    expect(result).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
                }
            );
        });

        describe("Cross-function property tests", () => {
            test.prop([fc.integer({ min: 0, max: 1000 })])(
                "ms->seconds->ms conversion should be identity for whole seconds",
                (seconds) => {
                    const ms = timeoutSecondsToMs(seconds);
                    const backToSeconds = timeoutMsToSeconds(ms);
                    const backToMs = timeoutSecondsToMs(backToSeconds);

                    // Property: Round-trip conversion should preserve values
                    expect(backToMs).toBe(ms);
                    expect(backToSeconds).toBe(seconds);
                }
            );

            test.prop([fc.integer({ min: TIMEOUT_CONSTRAINTS_MS.MIN, max: TIMEOUT_CONSTRAINTS_MS.MAX })])(
                "valid ms values should remain valid after clamping",
                (validMs) => {
                    const clamped = clampTimeoutMs(validMs);

                    // Property: Valid inputs should be unchanged by clamping
                    expect(clamped).toBe(validMs);
                    expect(isValidTimeoutMs(clamped)).toBeTruthy();
                }
            );

            test.prop([fc.integer({ min: TIMEOUT_CONSTRAINTS.MIN, max: TIMEOUT_CONSTRAINTS.MAX })])(
                "valid second values should remain valid after clamping",
                (validSeconds) => {
                    const clamped = clampTimeoutSeconds(validSeconds);

                    // Property: Valid inputs should be unchanged by clamping
                    expect(clamped).toBe(validSeconds);
                    expect(isValidTimeoutSeconds(clamped)).toBeTruthy();
                }
            );

            test.prop([fc.integer()])(
                "clamped values should always be valid",
                (input) => {
                    const clampedMs = clampTimeoutMs(input);
                    const clampedSeconds = clampTimeoutSeconds(input);

                    // Property: Clamping should always produce valid values
                    expect(isValidTimeoutMs(clampedMs)).toBeTruthy();
                    expect(isValidTimeoutSeconds(clampedSeconds)).toBeTruthy();
                }
            );
        });
    });
});
