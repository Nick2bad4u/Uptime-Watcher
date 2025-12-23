/**
 * Property-based tests for safe conversion utilities using fast-check.
 *
 * @remarks
 * These tests use property-based testing to verify safe conversion behavior
 * across a wide range of inputs, ensuring robustness and proper fallback
 * handling.
 */

import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
    safeNumberConversion,
    safeParseCheckInterval,
    safeParseFloat,
    safeParseInt,
    safeParsePercentage,
    safeParsePort,
    safeParsePositiveInt,
    safeParseRetryAttempts,
    safeParseTimeout,
    safeParseTimestamp,
} from "../../utils/safeConversions";

describe("SafeConversions - Property-Based Tests", () => {
    describe(safeNumberConversion, () => {
        test.prop({
            value: fc.float(),
        })("should return the same number for valid number inputs", (props) => {
            const result = safeNumberConversion(props.value);

            if (Number.isNaN(props.value)) {
                expect(result).toBe(0); // Default fallback for NaN
            } else {
                expect(result).toBe(props.value);
            }
            expect(typeof result).toBe("number");
        });

        test.prop({
            value: fc
                .string()
                .filter((s) => !Number.isNaN(Number(s)) && s.trim() !== ""),
        })("should convert valid numeric strings correctly", (props) => {
            const result = safeNumberConversion(props.value);
            const expected = Number(props.value);

            expect(result).toBe(expected);
            expect(typeof result).toBe("number");
        });

        test.prop({
            value: fc.string().filter((s) => Number.isNaN(Number(s))),
            defaultValue: fc.float({ noNaN: true }),
        })("should return default value for invalid strings", (props) => {
            const result = safeNumberConversion(
                props.value,
                props.defaultValue
            );
            expect(result).toBe(props.defaultValue);
        });

        test.prop({
            value: fc.oneof(
                fc.boolean(),
                fc.object(),
                fc.constant(null),
                fc.constant(undefined)
            ),
            defaultValue: fc.float({ noNaN: true }),
        })("should return default value for non-numeric types", (props) => {
            const result = safeNumberConversion(
                props.value,
                props.defaultValue
            );
            expect(result).toBe(props.defaultValue);
        });
    });

    describe(safeParseCheckInterval, () => {
        test.prop({
            value: fc.integer({ min: 1000, max: 1_000_000 }),
        })(
            "should return the same value for valid intervals >= 1000ms",
            (props) => {
                const result = safeParseCheckInterval(props.value);
                expect(result).toBe(props.value);
                expect(result).toBeGreaterThanOrEqual(1000);
            }
        );

        test.prop({
            value: fc.integer({ min: 0, max: 999 }),
            defaultValue: fc.integer({ min: 1000, max: 1_000_000 }),
        })("should return default for intervals < 1000ms", (props) => {
            const result = safeParseCheckInterval(
                props.value,
                props.defaultValue
            );
            expect(result).toBe(props.defaultValue);
            expect(result).toBeGreaterThanOrEqual(1000);
        });
    });

    describe(safeParseFloat, () => {
        test.prop({
            value: fc.float(),
        })("should return the same float for valid float inputs", (props) => {
            const result = safeParseFloat(props.value);

            if (Number.isNaN(props.value)) {
                expect(result).toBe(0); // Default fallback
            } else {
                expect(result).toBe(props.value);
            }
        });

        test.prop({
            intPart: fc.integer({ min: -1000, max: 1000 }),
            fracPart: fc.integer({ min: 0, max: 999 }),
        })("should parse decimal strings correctly", (props) => {
            const valueStr = `${props.intPart}.${props.fracPart}`;
            const result = safeParseFloat(valueStr);
            const expected = Number.parseFloat(valueStr);

            expect(result).toBeCloseTo(expected, 3);
        });

        test.prop({
            value: fc
                .string()
                .filter((s) => Number.isNaN(Number.parseFloat(s))),
            defaultValue: fc.float(),
        })("should return default for unparseable strings", (props) => {
            const result = safeParseFloat(props.value, props.defaultValue);
            expect(result).toBe(props.defaultValue);
        });
    });

    describe(safeParseInt, () => {
        test.prop({
            value: fc.integer(),
        })(
            "should return the same integer for valid integer inputs",
            (props) => {
                const result = safeParseInt(props.value);
                expect(result).toBe(props.value);
                expect(Number.isInteger(result)).toBeTruthy();
            }
        );

        test.prop({
            value: fc
                .float({ min: Math.fround(-1000), max: Math.fround(1000) })
                .filter((n) => !Number.isInteger(n) && Number.isFinite(n)),
        })("should floor floating point numbers", (props) => {
            const result = safeParseInt(props.value);
            expect(result).toBe(Math.floor(props.value));
            expect(Number.isInteger(result)).toBeTruthy();
        });

        test.prop({
            value: fc.integer({ min: -999, max: 999 }),
        })("should parse integer strings correctly", (props) => {
            const valueStr = props.value.toString();
            const result = safeParseInt(valueStr);
            expect(result).toBe(props.value);
        });

        test("should handle special float cases correctly", () => {
            const specialCases = [
                [Number.POSITIVE_INFINITY, 0],
                [Number.NEGATIVE_INFINITY, 0],
                [Number.NaN, 0],
            ];

            for (const [input, expected] of specialCases) {
                const result = safeParseInt(input);
                expect(result).toBe(expected);
            }
        });
    });

    describe(safeParsePercentage, () => {
        test.prop({
            value: fc
                .float({ min: Math.fround(0), max: Math.fround(100) })
                .filter((n) => Number.isFinite(n)),
        })("should return the same value for valid percentages", (props) => {
            const result = safeParsePercentage(props.value);
            expect(result).toBeCloseTo(props.value, 5);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
        });

        test.prop({
            value: fc
                .float({ min: Math.fround(101), max: Math.fround(1000) })
                .filter((n) => Number.isFinite(n)),
        })("should clamp values > 100 to 100", (props) => {
            const result = safeParsePercentage(props.value);
            expect(result).toBe(100);
        });

        test.prop({
            value: fc.float({
                min: Math.fround(-1000),
                max: Math.fround(-0.1),
            }),
        })("should clamp negative values to 0", (props) => {
            const result = safeParsePercentage(props.value);
            expect(result).toBe(0);
        });
    });

    describe(safeParsePort, () => {
        test.prop({
            value: fc.integer({ min: 1, max: 65_535 }),
        })("should return valid ports unchanged", (props) => {
            const result = safeParsePort(props.value);
            expect(result).toBe(props.value);
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(65_535);
        });

        test.prop({
            value: fc.oneof(
                fc.integer({ min: -1000, max: 0 }),
                fc.integer({ min: 65_536, max: 100_000 })
            ),
            defaultValue: fc.integer({ min: 1, max: 65_535 }),
        })("should return default for invalid port ranges", (props) => {
            const result = safeParsePort(props.value, props.defaultValue);
            expect(result).toBe(props.defaultValue);
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(65_535);
        });

        test("should handle common port string representations", () => {
            const portCases = [
                ["80", 80],
                ["443", 443],
                ["8080", 8080],
                ["3000", 3000],
            ];

            for (const [input, expected] of portCases) {
                const result = safeParsePort(input);
                expect(result).toBe(expected);
            }
        });
    });

    describe(safeParsePositiveInt, () => {
        test.prop({
            value: fc.integer({ min: 1, max: 100_000 }),
        })("should return positive integers unchanged", (props) => {
            const result = safeParsePositiveInt(props.value);
            expect(result).toBe(props.value);
            expect(result).toBeGreaterThan(0);
        });

        test.prop({
            value: fc.integer({ min: -1000, max: 0 }),
            defaultValue: fc.integer({ min: 1, max: 100 }),
        })("should return default for non-positive integers", (props) => {
            const result = safeParsePositiveInt(
                props.value,
                props.defaultValue
            );
            expect(result).toBe(props.defaultValue);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe(safeParseRetryAttempts, () => {
        test.prop({
            value: fc.integer({ min: 0, max: 10 }),
        })("should return valid retry counts unchanged", (props) => {
            const result = safeParseRetryAttempts(props.value);
            expect(result).toBe(props.value);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(10);
        });

        test.prop({
            value: fc.oneof(
                fc.integer({ min: -100, max: -1 }),
                fc.integer({ min: 11, max: 100 })
            ),
            defaultValue: fc.integer({ min: 0, max: 10 }),
        })("should return default for out-of-range values", (props) => {
            const result = safeParseRetryAttempts(
                props.value,
                props.defaultValue
            );
            expect(result).toBe(props.defaultValue);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(10);
        });
    });

    describe(safeParseTimeout, () => {
        test.prop({
            value: fc
                .float({
                    min: Math.fround(0.1),
                    max: Math.fround(100_000),
                })
                .filter((n) => Number.isFinite(n)),
        })("should return positive timeouts unchanged", (props) => {
            const result = safeParseTimeout(props.value);
            expect(result).toBe(props.value);
            expect(result).toBeGreaterThan(0);
        });

        test.prop({
            value: fc
                .float({ min: Math.fround(-1000), max: Math.fround(0) })
                .filter((n) => Number.isFinite(n)),
            defaultValue: fc
                .float({
                    min: Math.fround(1),
                    max: Math.fround(100_000),
                })
                .filter((n) => Number.isFinite(n)),
        })("should return default for non-positive timeouts", (props) => {
            const result = safeParseTimeout(props.value, props.defaultValue);
            expect(result).toBe(props.defaultValue);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe(safeParseTimestamp, () => {
        test.prop({
            pastOffset: fc.integer({ min: 0, max: 86_400_000 }), // Up to 1 day ago
        })("should return valid past timestamps", (props) => {
            const now = Date.now();
            const pastTimestamp = now - props.pastOffset;
            const result = safeParseTimestamp(pastTimestamp);

            expect(result).toBe(pastTimestamp);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(now + 86_400_000);
        });

        test.prop({
            futureOffset: fc.integer({ min: 1, max: 86_400_000 }), // Up to 1 day ahead
        })("should return valid near-future timestamps", (props) => {
            const now = Date.now();
            const futureTimestamp = now + props.futureOffset;
            const result = safeParseTimestamp(futureTimestamp);

            expect(result).toBe(futureTimestamp);
            expect(result).toBeGreaterThan(0);
        });

        test.prop({
            farFutureOffset: fc.integer({
                min: 86_400_001,
                max: 86_400_000 * 10,
            }),
        })("should return default for far-future timestamps", (props) => {
            const now = Date.now();
            const farFutureTimestamp = now + props.farFutureOffset;
            const result = safeParseTimestamp(farFutureTimestamp);

            expect(result).not.toBe(farFutureTimestamp);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(now + 86_400_000);
        });

        test.prop({
            invalidValue: fc.float({
                min: Math.fround(-100_000),
                max: Math.fround(0),
            }),
        })("should return default for negative/zero timestamps", (props) => {
            const result = safeParseTimestamp(props.invalidValue);

            expect(result).not.toBe(props.invalidValue);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe("Cross-function consistency", () => {
        test.prop({
            input: fc.anything(),
        })(
            "all functions should handle arbitrary input gracefully",
            (props) => {
                const functions = [
                    () => safeNumberConversion(props.input),
                    () => safeParseCheckInterval(props.input),
                    () => safeParseFloat(props.input),
                    () => safeParseInt(props.input),
                    () => safeParsePercentage(props.input),
                    () => safeParsePort(props.input),
                    () => safeParsePositiveInt(props.input),
                    () => safeParseRetryAttempts(props.input),
                    () => safeParseTimeout(props.input),
                    () => safeParseTimestamp(props.input),
                ];

                for (const fn of functions) {
                    expect(() => fn()).not.toThrowError();
                    const result = fn();
                    expect(typeof result).toBe("number");
                    expect(Number.isNaN(result)).toBeFalsy();
                }
            }
        );

        test.prop({
            stringValue: fc.string({ minLength: 1, maxLength: 20 }),
        })("string parsing should be consistent between functions", (props) => {
            // Always perform at least one assertion for the test to be valid
            expect(typeof props.stringValue).toBe("string");

            // Functions that should behave similarly for numeric strings
            if (/^-?\d+(?:\.\d+)?$/.test(props.stringValue)) {
                const numberResult = safeNumberConversion(props.stringValue);
                const floatResult = safeParseFloat(props.stringValue);

                if (!Number.isNaN(numberResult)) {
                    expect(numberResult).toBeCloseTo(floatResult, 5);
                }
            }
        });
    });
});
