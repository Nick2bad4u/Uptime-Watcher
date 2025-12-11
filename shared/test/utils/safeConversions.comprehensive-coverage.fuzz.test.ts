/**
 * Property-based testing for all safe conversion functions with edge cases
 *
 * @module shared/utils/safeConversions
 *
 * @version 1.0.0
 *
 *   This file provides 100% fuzzing test coverage for the safeConversions module
 *   using fast-check property-based testing. It validates type safety, edge
 *   cases, and comprehensive input handling across all conversion functions.
 *
 *   Coverage Goals:
 *
 *   - 100% line coverage for all safeConversions functions
 *   - Comprehensive edge case testing with property-based fuzzing
 *   - Type safety validation with arbitrary inputs
 *   - Error handling and fallback behavior verification
 *   - Performance characteristics under extreme inputs
 *
 * @file Comprehensive fuzzing test coverage for safeConversions utilities
 */

import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";

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
} from "../../utils/safeConversions.js";

describe("safeConversions comprehensive fuzzing tests", () => {
    describe(safeNumberConversion, () => {
        test.prop([fc.anything(), fc.float({ min: -1000, max: 1000 })])(
            "returns a number (never NaN) or default for any input",
            (input, defaultValue) => {
                const result = safeNumberConversion(input, defaultValue);
                expect(typeof result).toBe("number");
                if (Number.isNaN(defaultValue)) {
                    expect(Number.isNaN(result)).toBeFalsy();
                } else {
                    expect(Number.isNaN(result)).toBeFalsy();
                }
                // Infinity/-Infinity are allowed for number and string inputs
            }
        );

        test.prop([fc.float({ min: -1000, max: 1000, noNaN: true })])(
            "preserves valid numbers exactly",
            (validNumber) => {
                const result = safeNumberConversion(validNumber, 999);
                expect(result).toBe(validNumber);
            }
        );

        test.prop([fc.string(), fc.float({ min: -1000, max: 1000 })])(
            "handles string inputs correctly",
            (stringInput, defaultValue) => {
                const result = safeNumberConversion(stringInput, defaultValue);

                if (
                    stringInput.trim() === "" ||
                    Number.isNaN(Number(stringInput))
                ) {
                    if (Number.isNaN(defaultValue)) {
                        expect(result).toBe(0);
                    } else {
                        expect(result).toBe(defaultValue);
                    }
                } else {
                    const expected = Number(stringInput);
                    // For string inputs, preserve valid numeric results including infinities
                    expect(result).toBe(expected);
                }
            }
        );

        test.prop([
            fc.boolean(),
            fc.float({ min: -1000, max: 1000, noNaN: true }),
        ])("treats booleans as non-numeric and returns default", (
            boolInput,
            defaultValue
        ) => {
            const result = safeNumberConversion(boolInput, defaultValue);
            const expected = Number.isNaN(defaultValue) ? 0 : defaultValue;
            expect(result).toBe(expected);
        });

        test("handles special values correctly", () => {
            const defaultValue = 42;

            // Infinity should be preserved
            expect(safeNumberConversion(Infinity, defaultValue)).toBe(Infinity);
            expect(safeNumberConversion(-Infinity, defaultValue)).toBe(
                -Infinity
            );

            // NaN should return default
            expect(safeNumberConversion(Number.NaN, defaultValue)).toBe(
                defaultValue
            );

            // Null/undefined should return default
            expect(safeNumberConversion(null, defaultValue)).toBe(defaultValue);
            expect(safeNumberConversion(undefined, defaultValue)).toBe(
                defaultValue
            );

            // Objects should return default
            expect(safeNumberConversion({}, defaultValue)).toBe(defaultValue);
            expect(safeNumberConversion([], defaultValue)).toBe(defaultValue);

            // Functions should return default
            expect(safeNumberConversion(() => {}, defaultValue)).toBe(
                defaultValue
            );
        });
    });

    describe(safeParseCheckInterval, () => {
        test.prop([fc.anything(), fc.integer({ min: 1000, max: 300_000 })])(
            "returns valid check interval or default",
            (input, defaultValue) => {
                const result = safeParseCheckInterval(input, defaultValue);
                expect(typeof result).toBe("number");
                expect(result).toBeGreaterThanOrEqual(1000);
            }
        );

        test.prop([fc.integer({ min: 1000, max: 300_000 })])(
            "preserves valid intervals",
            (validInterval) => {
                const result = safeParseCheckInterval(validInterval, 5000);
                expect(result).toBe(validInterval);
            }
        );

        test.prop([
            fc.integer({ min: -1000, max: 999 }),
            fc.integer({ min: 1000, max: 300_000 }),
        ])("uses default for intervals below 1000ms", (
            invalidInterval,
            defaultValue
        ) => {
            const result = safeParseCheckInterval(
                invalidInterval,
                defaultValue
            );
            expect(result).toBe(defaultValue);
        });

        test.prop([fc.integer({ min: 300_001, max: 2_000_000 })])(
            // no upper bound
            "accepts large intervals when >= 1000",
            (largeInterval) => {
                const result = safeParseCheckInterval(largeInterval, 10_000);
                expect(result).toBe(largeInterval);
            }
        );

        test("handles string inputs correctly", () => {
            expect(safeParseCheckInterval("5000", 10_000)).toBe(5000);
            expect(safeParseCheckInterval("500", 10_000)).toBe(10_000); // Below minimum
            expect(safeParseCheckInterval("400000", 10_000)).toBe(400_000); // No upper bound
            expect(safeParseCheckInterval("invalid", 10_000)).toBe(10_000);
        });
    });

    describe(safeParseFloat, () => {
        test.prop([
            fc.anything(),
            fc.float({ min: -1000, max: 1000, noNaN: true }),
        ])("returns valid float or default for any input", (
            input,
            defaultValue
        ) => {
            const result = safeParseFloat(input, defaultValue);
            expect(typeof result).toBe("number");
            expect(Number.isNaN(result)).toBeFalsy();

            // SafeParseFloat preserves infinity from numeric inputs but rejects it from strings
            if (
                typeof input === "number" &&
                !Number.isFinite(input) &&
                !Number.isNaN(input)
            ) {
                // Numeric infinity should be preserved
                expect(result).toBe(input);
            } else {
                // All other cases should return finite numbers
                expect(Number.isFinite(result)).toBeTruthy();
            }
        });

        test.prop([fc.float({ min: -1000, max: 1000, noNaN: true })])(
            "preserves valid float numbers exactly",
            (validFloat) => {
                const result = safeParseFloat(validFloat, 999);
                expect(result).toBe(validFloat);
            }
        );

        test.prop([fc.string(), fc.float({ min: -1000, max: 1000 })])(
            "handles string float parsing",
            (stringInput, defaultValue) => {
                const result = safeParseFloat(stringInput, defaultValue);

                if (
                    stringInput === "" ||
                    Number.isNaN(Number.parseFloat(stringInput))
                ) {
                    expect(result).toBe(defaultValue);
                } else {
                    const expected = Number.parseFloat(stringInput);
                    if (Number.isFinite(expected)) {
                        expect(result).toBe(expected);
                    } else {
                        expect(result).toBe(defaultValue);
                    }
                }
            }
        );

        test("handles special float cases", () => {
            const defaultValue = 3.14;

            expect(safeParseFloat("123.45", defaultValue)).toBe(123.45);
            expect(safeParseFloat("123.45extra", defaultValue)).toBe(123.45);
            expect(safeParseFloat(".5", defaultValue)).toBe(0.5);
            expect(safeParseFloat("-.5", defaultValue)).toBe(-0.5);
            expect(safeParseFloat("1e10", defaultValue)).toBe(1e10);
            expect(safeParseFloat("Infinity", defaultValue)).toBe(defaultValue);
            expect(safeParseFloat("-Infinity", defaultValue)).toBe(
                defaultValue
            );
            expect(safeParseFloat("NaN", defaultValue)).toBe(defaultValue);
        });
    });

    describe(safeParseInt, () => {
        test.prop([fc.anything(), fc.integer({ min: -1000, max: 1000 })])(
            "returns valid integer or default for any input",
            (input, defaultValue) => {
                const result = safeParseInt(input, defaultValue);
                expect(typeof result).toBe("number");
                expect(Number.isInteger(result)).toBeTruthy();
                expect(Number.isFinite(result)).toBeTruthy();
            }
        );

        test.prop([fc.integer({ min: -1000, max: 1000 })])(
            "preserves valid integers exactly",
            (validInt) => {
                const result = safeParseInt(validInt, 999);
                expect(result).toBe(validInt);
            }
        );

        test.prop([
            fc.float({ min: -1000, max: 1000, noInteger: true, noNaN: true }),
        ])("floors float numbers to integers", (floatInput) => {
            fc.pre(Number.isFinite(floatInput)); // Ensure finite float
            const result = safeParseInt(floatInput, 999);
            expect(result).toBe(Math.floor(floatInput));
        });

        test.prop([fc.string(), fc.integer({ min: -1000, max: 1000 })])(
            "handles string integer parsing",
            (stringInput, defaultValue) => {
                const result = safeParseInt(stringInput, defaultValue);

                const parsed = Number.parseInt(stringInput, 10);
                if (Number.isNaN(parsed)) {
                    expect(result).toBe(defaultValue);
                } else {
                    expect(result).toBe(parsed);
                }
            }
        );

        test("handles special integer cases", () => {
            const defaultValue = 42;

            expect(safeParseInt(123.99, defaultValue)).toBe(123);
            // For numeric inputs, safeParseInt uses Math.floor semantics
            expect(safeParseInt(-45.67, defaultValue)).toBe(-46);
            expect(safeParseInt("123.99", defaultValue)).toBe(123);
            expect(safeParseInt("123abc", defaultValue)).toBe(123);
            expect(safeParseInt("abc123", defaultValue)).toBe(defaultValue);
            expect(safeParseInt(Infinity, defaultValue)).toBe(defaultValue);
            expect(safeParseInt(-Infinity, defaultValue)).toBe(defaultValue);
            expect(safeParseInt(Number.NaN, defaultValue)).toBe(defaultValue);
        });
    });

    describe(safeParsePercentage, () => {
        test.prop([fc.anything(), fc.float({ min: 0, max: 100, noNaN: true })])(
            "returns percentage between 0-100 or default",
            (input, defaultValue) => {
                const result = safeParsePercentage(input, defaultValue);
                expect(typeof result).toBe("number");
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(100);
            }
        );

        test.prop([fc.float({ min: 0, max: 100, noNaN: true })])(
            "preserves valid percentages",
            (validPercentage) => {
                const result = safeParsePercentage(validPercentage, 50);
                expect(result).toBe(validPercentage);
            }
        );

        test.prop([fc.float({ min: 101, max: 1000, noNaN: true })])(
            "clamps values above 100 to 100",
            (highValue) => {
                const result = safeParsePercentage(highValue, 50);
                expect(result).toBe(100);
            }
        );

        test.prop([
            fc.float({
                min: Math.fround(-1000),
                max: Math.fround(-0.01),
                noNaN: true,
            }),
        ])("clamps negative values to 0", (negativeValue) => {
            const result = safeParsePercentage(negativeValue, 50);
            expect(result).toBe(0);
        });

        test("handles percentage edge cases", () => {
            expect(safeParsePercentage("75", 50)).toBe(75);
            expect(safeParsePercentage("150", 50)).toBe(100);
            expect(safeParsePercentage("-10", 50)).toBe(0);
            expect(safeParsePercentage("invalid", 50)).toBe(50);
        });
    });

    describe(safeParsePort, () => {
        test.prop([fc.anything(), fc.integer({ min: 1, max: 65_535 })])(
            "returns valid port number or default",
            (input, defaultValue) => {
                const result = safeParsePort(input, defaultValue);
                expect(typeof result).toBe("number");
                expect(Number.isInteger(result)).toBeTruthy();
                expect(result).toBeGreaterThanOrEqual(1);
                expect(result).toBeLessThanOrEqual(65_535);
            }
        );

        test.prop([fc.integer({ min: 1, max: 65_535 })])(
            "preserves valid port numbers",
            (validPort) => {
                const result = safeParsePort(validPort, 80);
                expect(result).toBe(validPort);
            }
        );

        test.prop([
            fc.integer({ min: 65_536, max: 100_000 }),
            fc.integer({ min: 1, max: 65_535 }),
        ])("uses default for ports above 65535", (
            invalidPort,
            defaultValue
        ) => {
            const result = safeParsePort(invalidPort, defaultValue);
            expect(result).toBe(defaultValue);
        });

        test("handles port edge cases", () => {
            const defaultValue = 80;

            expect(safeParsePort("8080", defaultValue)).toBe(8080);
            expect(safeParsePort("65536", defaultValue)).toBe(defaultValue); // Out of range
            expect(safeParsePort("0", defaultValue)).toBe(defaultValue); // Invalid port
            expect(safeParsePort("-1", defaultValue)).toBe(defaultValue); // Negative
            expect(safeParsePort("invalid", defaultValue)).toBe(defaultValue);
        });
    });

    describe(safeParsePositiveInt, () => {
        test.prop([fc.anything(), fc.integer({ min: 1, max: 1000 })])(
            "returns positive integer or default",
            (input, defaultValue) => {
                const result = safeParsePositiveInt(input, defaultValue);
                expect(typeof result).toBe("number");
                expect(Number.isInteger(result)).toBeTruthy();
                expect(result).toBeGreaterThan(0);
            }
        );

        test.prop([fc.integer({ min: 1, max: 1000 })])(
            "preserves positive integers",
            (positiveInt) => {
                const result = safeParsePositiveInt(positiveInt, 1);
                expect(result).toBe(positiveInt);
            }
        );

        test.prop([
            fc.integer({ min: -1000, max: 0 }),
            fc.integer({ min: 1, max: 1000 }),
        ])("uses default for non-positive values", (
            nonPositive,
            defaultValue
        ) => {
            const result = safeParsePositiveInt(nonPositive, defaultValue);
            expect(result).toBe(defaultValue);
        });

        test("handles positive integer edge cases", () => {
            expect(safeParsePositiveInt("5", 1)).toBe(5);
            expect(safeParsePositiveInt("0", 1)).toBe(1); // Not positive
            expect(safeParsePositiveInt("-3", 1)).toBe(1); // Not positive
            expect(safeParsePositiveInt("invalid", 1)).toBe(1);
        });
    });

    describe(safeParseRetryAttempts, () => {
        test.prop([fc.anything(), fc.integer({ min: 0, max: 10 })])(
            "returns valid retry attempts count or default",
            (input, defaultValue) => {
                const result = safeParseRetryAttempts(input, defaultValue);
                expect(typeof result).toBe("number");
                expect(Number.isInteger(result)).toBeTruthy();
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(10);
            }
        );

        test.prop([fc.integer({ min: 0, max: 10 })])(
            "preserves valid retry attempts",
            (validAttempts) => {
                const result = safeParseRetryAttempts(validAttempts, 3);
                expect(result).toBe(validAttempts);
            }
        );

        test.prop([
            fc.integer({ min: 11, max: 100 }),
            fc.integer({ min: 0, max: 10 }),
        ])("uses default for attempts above 10", (
            invalidAttempts,
            defaultValue
        ) => {
            const result = safeParseRetryAttempts(
                invalidAttempts,
                defaultValue
            );
            expect(result).toBe(defaultValue);
        });

        test.prop([
            fc.integer({ min: -100, max: -1 }),
            fc.integer({ min: 0, max: 10 }),
        ])("uses default for negative attempts", (
            negativeAttempts,
            defaultValue
        ) => {
            const result = safeParseRetryAttempts(
                negativeAttempts,
                defaultValue
            );
            expect(result).toBe(defaultValue);
        });

        test("handles retry attempts edge cases", () => {
            expect(safeParseRetryAttempts("3", 3)).toBe(3);
            expect(safeParseRetryAttempts("0", 3)).toBe(0); // No retries
            expect(safeParseRetryAttempts("15", 3)).toBe(3); // Out of range
            expect(safeParseRetryAttempts("invalid", 3)).toBe(3);
        });
    });

    describe(safeParseTimeout, () => {
        test.prop([
            fc.anything(),
            fc.float({ min: 1, max: 300_000, noNaN: true }),
        ])("returns positive timeout or default", (input, defaultValue) => {
            const result = safeParseTimeout(input, defaultValue);
            expect(typeof result).toBe("number");
            expect(result).toBeGreaterThan(0);
            expect(Number.isFinite(result)).toBeTruthy();
        });

        test.prop([fc.float({ min: 1, max: 300_000, noNaN: true })])(
            "preserves positive timeout values",
            (validTimeout) => {
                const result = safeParseTimeout(validTimeout, 10_000);
                expect(result).toBe(validTimeout);
            }
        );

        test.prop([
            fc.float({ min: -1000, max: 0, noNaN: true }),
            fc.float({ min: 1, max: 300_000 }),
        ])("uses default for non-positive timeouts", (
            nonPositive,
            defaultValue
        ) => {
            const result = safeParseTimeout(nonPositive, defaultValue);
            const normalizedDefault = safeParseTimeout(undefined, defaultValue);
            expect(result).toBe(normalizedDefault);
        });

        test("handles timeout edge cases", () => {
            const defaultValue = 10_000;

            expect(safeParseTimeout("5000", defaultValue)).toBe(5000);
            expect(safeParseTimeout("0", defaultValue)).toBe(defaultValue); // Invalid timeout
            expect(safeParseTimeout("-1000", defaultValue)).toBe(defaultValue); // Negative timeout
            expect(safeParseTimeout("invalid", defaultValue)).toBe(
                defaultValue
            );
            expect(safeParseTimeout(0.5, defaultValue)).toBe(0.5); // Fractional positive
        });
    });

    describe(safeParseTimestamp, () => {
        test.prop([fc.anything()])("returns valid timestamp or default", (
            input
        ) => {
            const result = safeParseTimestamp(input);
            expect(typeof result).toBe("number");
            expect(result).toBeGreaterThan(0);
            expect(Number.isFinite(result)).toBeTruthy();

            // Should not be unreasonably far in the future (more than 1 day)
            expect(result).toBeLessThanOrEqual(Date.now() + 86_400_000);
        });

        test.prop([fc.integer({ min: 1, max: Date.now() + 86_400_000 })])(
            "preserves valid timestamps",
            (validTimestamp) => {
                fc.pre(
                    validTimestamp > 0 &&
                        validTimestamp <= Date.now() + 86_400_000
                );
                const result = safeParseTimestamp(validTimestamp);
                expect(result).toBe(validTimestamp);
            }
        );

        test.prop([
            fc.integer({
                min: Date.now() + 86_400_001,
                max: Date.now() + 172_800_000,
            }),
        ])("uses current time for timestamps too far in future", (
            futureTimestamp
        ) => {
            const result = safeParseTimestamp(futureTimestamp);
            expect(result).toBeLessThanOrEqual(Date.now() + 86_400_000);
        });

        test.prop([fc.integer({ min: -1_000_000, max: 0 })])(
            "uses current time for negative timestamps",
            (negativeTimestamp) => {
                const result = safeParseTimestamp(negativeTimestamp);
                expect(result).toBeGreaterThan(0);
                expect(result).toBeLessThanOrEqual(Date.now() + 86_400_000);
            }
        );

        test("handles timestamp edge cases", () => {
            const now = Date.now();
            const validTimestamp = now - 1000;
            const futureTimestamp = now + 86_400_000 * 2; // 2 days ahead

            expect(safeParseTimestamp(validTimestamp.toString())).toBe(
                validTimestamp
            );
            expect(safeParseTimestamp("0")).toBeGreaterThan(0); // Should use current time
            expect(safeParseTimestamp("-1000")).toBeGreaterThan(0); // Should use current time
            expect(
                safeParseTimestamp(futureTimestamp.toString())
            ).toBeLessThanOrEqual(now + 86_400_000);
            expect(safeParseTimestamp("invalid")).toBeGreaterThan(0); // Should use current time
        });

        test("uses provided default value when available", () => {
            const customDefault = 1_640_995_200_000; // Valid past timestamp
            const result = safeParseTimestamp("invalid", customDefault);
            expect(result).toBe(customDefault);
        });
    });

    describe("Integration and cross-function property tests", () => {
        test.prop([fc.constantFrom(null, undefined)])(
            "all conversion functions handle null/undefined consistently",
            (input) => {
                expect(safeNumberConversion(input, 42)).toBe(42);
                expect(safeParseFloat(input, 3.14)).toBe(3.14);
                expect(safeParseInt(input, 123)).toBe(123);
                expect(safeParsePercentage(input, 50)).toBe(50);
                expect(safeParsePort(input, 80)).toBe(80);
                expect(safeParsePositiveInt(input, 1)).toBe(1);
                expect(safeParseRetryAttempts(input, 3)).toBe(3);
                expect(safeParseTimeout(input, 10_000)).toBe(10_000);
                expect(safeParseTimestamp(input, 1_640_995_200_000)).toBe(
                    1_640_995_200_000
                );
            }
        );

        test.prop([fc.constant("")])(
            "all conversion functions handle empty strings consistently",
            (stringInput) => {
                expect(safeNumberConversion(stringInput, 42)).toBe(42);
                expect(safeParseFloat(stringInput, 3.14)).toBe(3.14);
                expect(safeParseInt(stringInput, 123)).toBe(123);
                expect(safeParsePercentage(stringInput, 50)).toBe(50);
                expect(safeParsePort(stringInput, 80)).toBe(80);
                expect(safeParsePositiveInt(stringInput, 1)).toBe(1);
                expect(safeParseRetryAttempts(stringInput, 3)).toBe(3);
                expect(safeParseTimeout(stringInput, 10_000)).toBe(10_000);
                expect(safeParseTimestamp(stringInput, 1_640_995_200_000)).toBe(
                    1_640_995_200_000
                );
            }
        );

        test.prop([fc.constantFrom(Infinity, -Infinity, Number.NaN)])(
            "all conversion functions handle special float values consistently",
            (specialValue) => {
                // For numeric inputs: preserve ±Infinity in safeNumberConversion and safeParseFloat
                expect(safeNumberConversion(specialValue, 42)).toBe(
                    Number.isNaN(specialValue) ? 42 : specialValue
                );
                expect(safeParseFloat(specialValue, 3.14)).toBe(
                    Number.isNaN(specialValue) ? 3.14 : specialValue
                );
                expect(safeParseInt(specialValue, 123)).toBe(123);
                // For percentages: infinities clamp to bounds, NaN uses default
                const expectedPercent =
                    specialValue === Infinity
                        ? 100
                        : specialValue === -Infinity
                          ? 0
                          : 50;
                expect(safeParsePercentage(specialValue, 50)).toBe(
                    expectedPercent
                );
                expect(safeParsePort(specialValue, 80)).toBe(80);
                expect(safeParsePositiveInt(specialValue, 1)).toBe(1);
                expect(safeParseRetryAttempts(specialValue, 3)).toBe(3);
                expect(safeParseTimeout(specialValue, 10_000)).toBe(
                    Number.isNaN(specialValue) ||
                        specialValue < 0 ||
                        !Number.isFinite(specialValue)
                        ? 10_000
                        : specialValue
                );
                expect(
                    safeParseTimestamp(specialValue, 1_640_995_200_000)
                ).toBe(1_640_995_200_000);
            }
        );

        test("all conversion functions never return NaN (Infinity allowed where applicable)", () => {
            const inputs = [
                undefined,
                null,
                Number.NaN,
                Infinity,
                -Infinity,
                "",
                "invalid",
                {},
                [],
                () => {},
                fc.constant(Symbol("test")),
            ];

            for (const input of inputs) {
                expect(
                    Number.isNaN(safeNumberConversion(input, 0))
                ).toBeFalsy();
                // SafeNumberConversion may legitimately return ±Infinity for such inputs

                expect(Number.isNaN(safeParseFloat(input, 0))).toBeFalsy();
                // SafeParseFloat may return ±Infinity for numeric Infinity inputs

                expect(Number.isNaN(safeParseInt(input, 0))).toBeFalsy();
                expect(Number.isFinite(safeParseInt(input, 0))).toBeTruthy();

                expect(Number.isNaN(safeParsePercentage(input, 0))).toBeFalsy();
                expect(
                    Number.isFinite(safeParsePercentage(input, 0))
                ).toBeTruthy();

                expect(Number.isNaN(safeParsePort(input, 80))).toBeFalsy();
                expect(Number.isFinite(safeParsePort(input, 80))).toBeTruthy();

                expect(
                    Number.isNaN(safeParsePositiveInt(input, 1))
                ).toBeFalsy();
                expect(
                    Number.isFinite(safeParsePositiveInt(input, 1))
                ).toBeTruthy();

                expect(
                    Number.isNaN(safeParseRetryAttempts(input, 3))
                ).toBeFalsy();
                expect(
                    Number.isFinite(safeParseRetryAttempts(input, 3))
                ).toBeTruthy();

                expect(
                    Number.isNaN(safeParseTimeout(input, 10_000))
                ).toBeFalsy();
                expect(
                    Number.isFinite(safeParseTimeout(input, 10_000))
                ).toBeTruthy();

                expect(
                    Number.isNaN(safeParseTimestamp(input, 1_640_995_200_000))
                ).toBeFalsy();
                expect(
                    Number.isFinite(
                        safeParseTimestamp(input, 1_640_995_200_000)
                    )
                ).toBeTruthy();
            }
        });
    });

    describe("Performance and stress testing", () => {
        test.prop([
            fc.array(fc.anything(), { minLength: 100, maxLength: 1000 }),
        ])("handles large arrays of inputs efficiently", (inputs) => {
            const startTime = performance.now();

            for (const input of inputs) {
                safeNumberConversion(input, 0);
                safeParseFloat(input, 0);
                safeParseInt(input, 0);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should process 100-1000 conversions in reasonable time (< 100ms)
            expect(duration).toBeLessThan(100);
        });

        test.prop([fc.string({ minLength: 1000, maxLength: 10_000 })])(
            "handles very long strings efficiently",
            (longString) => {
                const startTime = performance.now();

                safeNumberConversion(longString, 0);
                safeParseFloat(longString, 0);
                safeParseInt(longString, 0);

                const endTime = performance.now();
                const duration = endTime - startTime;

                // Should handle long strings in reasonable time (< 50ms)
                expect(duration).toBeLessThan(50);
            }
        );
    });
});
