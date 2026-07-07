/**
 * Comprehensive tests for timeout utilities. Tests all timeout conversion and
 * validation functions with edge cases.
 *
 * @remarks
 * Enhanced with fast-check property-based testing to systematically explore
 * edge cases and validate invariants across all timeout utility functions.
 * Tests both traditional scenarios and property-based fuzzing for robustness.
 */

import { fc, test } from "@fast-check/vitest";
import { standardTestAnnotationAsync } from "@shared/test/testUtils";
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

describe("timeout Utilities", () => {
    describe(clampTimeoutSeconds, () => {
        it("should return the input when within valid range", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validTimeout = 30; // 30 seconds

            expect(clampTimeoutSeconds(validTimeout)).toBe(validTimeout);
        });

        it("should clamp to minimum when below range", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const belowMin = TIMEOUT_CONSTRAINTS.MIN - 1;

            expect(clampTimeoutSeconds(belowMin)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should clamp to maximum when above range", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const aboveMax = TIMEOUT_CONSTRAINTS.MAX + 1;

            expect(clampTimeoutSeconds(aboveMax)).toBe(TIMEOUT_CONSTRAINTS.MAX);
        });

        it("should handle edge values", async ({ annotate, task }) => {
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutSeconds(0)).toBe(TIMEOUT_CONSTRAINTS.MIN);
            expect(clampTimeoutSeconds(-5)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should clamp non-finite values to the minimum", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutSeconds(Number.NaN)).toBe(
                TIMEOUT_CONSTRAINTS.MIN
            );
            expect(clampTimeoutSeconds(Infinity)).toBe(TIMEOUT_CONSTRAINTS.MIN);
            expect(clampTimeoutSeconds(Number.NEGATIVE_INFINITY)).toBe(
                TIMEOUT_CONSTRAINTS.MIN
            );
        });

        it("should handle fractional values", async ({ annotate, task }) => {
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const timeoutMs = 15_000; // 15 seconds

            expect(getTimeoutSeconds(timeoutMs)).toBe(15);
        });

        it("should return default when monitor timeout is undefined", async ({
            annotate,
            task,
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

        it("should handle zero timeout", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(0)).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        it("should handle fractional milliseconds", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(1500)).toBe(1.5);
        });

        it("should handle large timeout values", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(60_000)).toBe(60);
        });
    });

    describe(timeoutSecondsToMs, () => {
        it("should convert seconds to milliseconds correctly", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(1)).toBe(1000);
            expect(timeoutSecondsToMs(5)).toBe(5000);
            expect(timeoutSecondsToMs(30)).toBe(30_000);
        });

        it("should handle zero", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(0)).toBe(0);
        });

        it("should handle fractional seconds", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(1.5)).toBe(1500);
            expect(timeoutSecondsToMs(2.75)).toBe(2750);
        });

        it("should handle large values", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(60)).toBe(60_000);
            expect(timeoutSecondsToMs(300)).toBe(300_000);
        });

        it("should preserve precision for small values", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(0.001)).toBe(1);
            expect(timeoutSecondsToMs(0.1)).toBe(100);
        });

        it("should handle edge cases", async ({ annotate, task }) => {
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

    describe("conversion consistency", () => {
        it("should maintain round-trip conversion accuracy", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalMs = 15_000;
            const convertedSeconds = getTimeoutSeconds(originalMs);
            const backToMs = timeoutSecondsToMs(convertedSeconds);

            expect(backToMs).toBe(originalMs);
        });

        it("should maintain round-trip conversion for fractional values", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalSeconds = 15.5;
            const convertedMs = timeoutSecondsToMs(originalSeconds);
            const backToSeconds = getTimeoutSeconds(convertedMs);

            expect(backToSeconds).toBe(originalSeconds);
        });
    });

    describe("integration with constants", () => {
        it("should work correctly with constraint constants", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(TIMEOUT_CONSTRAINTS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS.MIN * 1000
            );
            expect(timeoutSecondsToMs(TIMEOUT_CONSTRAINTS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS.MAX * 1000
            );
        });

        it("should work correctly with default timeout constant", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds()).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBeGreaterThanOrEqual(
                TIMEOUT_CONSTRAINTS.MIN
            );
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBeLessThanOrEqual(
                TIMEOUT_CONSTRAINTS.MAX
            );
        });
    });

    /**
     * Fast-check property-based tests for comprehensive edge case coverage.
     * These tests use property-based testing to systematically explore the
     * timeout utility function behavior across all possible inputs.
     */
    describe("property-Based Fuzzing Tests", () => {
        describe("clampTimeoutSeconds property tests", () => {
            test.prop([fc.integer()])(
                "should always return a value within valid bounds",
                (input) => {
                    const result = clampTimeoutSeconds(input);

                    // Property: Result must be within valid range
                    expect(result).toBeGreaterThanOrEqual(
                        TIMEOUT_CONSTRAINTS.MIN
                    );
                    expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS.MAX);

                    // Property: If input is within bounds, should return input unchanged
                    if (
                        input >= TIMEOUT_CONSTRAINTS.MIN &&
                        input <= TIMEOUT_CONSTRAINTS.MAX
                    ) {
                        expect(result).toBe(input);
                    }
                }
            );

            test.prop([
                fc.float({ max: Math.fround(1000), min: 0, noNaN: true }),
            ])("should handle fractional seconds correctly", (input) => {
                const result = clampTimeoutSeconds(input);

                // Property: Result should preserve precision when within bounds
                expect(Number.isFinite(result)).toBe(true);
                expect(result).toBeGreaterThanOrEqual(TIMEOUT_CONSTRAINTS.MIN);
                expect(result).toBeLessThanOrEqual(TIMEOUT_CONSTRAINTS.MAX);
            });
        });

        describe("timeoutSecondsToMs property tests", () => {
            test.prop([fc.integer({ max: 1000, min: 1 })])(
                "should accurately convert seconds to milliseconds",
                (seconds) => {
                    const result = timeoutSecondsToMs(seconds);

                    // Property: Conversion should be exact multiplication by 1000
                    expect(result).toBe(seconds * 1000);

                    // Property: Converting back with the public reader should yield original value
                    expect(getTimeoutSeconds(result)).toBe(seconds);
                }
            );

            test.prop([
                fc
                    .float({ max: Math.fround(1000), min: Math.fround(0) })
                    .filter(
                        (num) => Number.isFinite(num) && !Number.isNaN(num)
                    ),
            ])("should handle fractional seconds", (seconds) => {
                const result = timeoutSecondsToMs(seconds);

                // Property: Should maintain precision
                expect(result / 1000).toBeCloseTo(seconds);
            });
        });

        describe("getTimeoutSeconds property tests", () => {
            test.prop([fc.integer({ max: 300_000, min: 1000 })])(
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

        describe("cross-function property tests", () => {
            test.prop([fc.integer({ max: 1000, min: 1 })])(
                "ms->seconds->ms conversion should be identity for whole seconds",
                (seconds) => {
                    const ms = timeoutSecondsToMs(seconds);
                    const backToSeconds = getTimeoutSeconds(ms);
                    const backToMs = timeoutSecondsToMs(backToSeconds);

                    // Property: Round-trip conversion should preserve values
                    expect(backToMs).toBe(ms);
                    expect(backToSeconds).toBe(seconds);
                }
            );

            test.prop([
                fc.integer({
                    max: TIMEOUT_CONSTRAINTS.MAX,
                    min: TIMEOUT_CONSTRAINTS.MIN,
                }),
            ])(
                "valid second values should remain valid after clamping",
                (validSeconds) => {
                    const clamped = clampTimeoutSeconds(validSeconds);

                    // Property: Valid inputs should be unchanged by clamping
                    expect(clamped).toBe(validSeconds);
                    expect(clamped).toBeGreaterThanOrEqual(
                        TIMEOUT_CONSTRAINTS.MIN
                    );
                    expect(clamped).toBeLessThanOrEqual(
                        TIMEOUT_CONSTRAINTS.MAX
                    );
                }
            );

            test.prop([fc.integer()])(
                "clamped values should always be valid",
                (input) => {
                    const clampedSeconds = clampTimeoutSeconds(input);

                    // Property: Clamping should always produce valid values
                    expect(clampedSeconds).toBeGreaterThanOrEqual(
                        TIMEOUT_CONSTRAINTS.MIN
                    );
                    expect(clampedSeconds).toBeLessThanOrEqual(
                        TIMEOUT_CONSTRAINTS.MAX
                    );
                }
            );
        });
    });
});
