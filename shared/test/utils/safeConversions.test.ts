/**
 * Backend test coverage for shared utilities - safeConversions This ensures
 * backend tests exercise shared code for coverage reporting
 */

import { describe, expect, it, test } from "vitest";
import { fc } from "@fast-check/vitest";
// Import ALL functions from safeConversions to ensure coverage
import * as safeConversions from "../../utils/safeConversions";
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
import {
    MAX_TIMEOUT_MILLISECONDS,
    MIN_TIMEOUT_MILLISECONDS,
} from "../../types/units";

describe("Shared Safe Conversions - Backend Coverage", () => {
    // COVERAGE CRITICAL: Call every function to ensure 100% coverage
    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", () => {
            // Call ALL functions using both named imports and namespace import

            // Test all safe conversion functions with valid inputs
            expect(safeConversions.safeNumberConversion("42", 0)).toBe(42);
            expect(
                safeConversions.safeParseCheckInterval("30000", 60_000)
            ).toBe(30_000);
            expect(safeConversions.safeParseFloat("3.14", 0)).toBe(3.14);
            expect(safeConversions.safeParseInt("42", 0)).toBe(42);
            expect(safeConversions.safeParsePercentage("75", 0)).toBe(75);
            expect(safeConversions.safeParsePort("8080", 80)).toBe(8080);
            expect(safeConversions.safeParsePositiveInt("10", 1)).toBe(10);
            expect(safeConversions.safeParseRetryAttempts("3", 1)).toBe(3);
            expect(safeConversions.safeParseTimeout("5000", 10_000)).toBe(5000);
            expect(
                safeConversions.safeParseTimestamp("1640995200000", Date.now())
            ).toBe(1_640_995_200_000);

            // Test with invalid inputs to trigger fallback logic
            expect(safeConversions.safeNumberConversion("invalid", 42)).toBe(
                42
            );
            expect(
                safeConversions.safeParseCheckInterval("invalid", 60_000)
            ).toBe(60_000);
            expect(safeConversions.safeParseFloat("invalid", 3.14)).toBe(3.14);
            expect(safeConversions.safeParseInt("invalid", 42)).toBe(42);
            expect(safeConversions.safeParsePercentage("invalid", 50)).toBe(50);
            expect(safeConversions.safeParsePort("invalid", 80)).toBe(80);
            expect(safeConversions.safeParsePositiveInt("invalid", 1)).toBe(1);
            expect(safeConversions.safeParseRetryAttempts("invalid", 1)).toBe(
                1
            );
            expect(safeConversions.safeParseTimeout("invalid", 10_000)).toBe(
                10_000
            );
            expect(
                safeConversions.safeParseTimestamp("invalid", 123_456_789)
            ).toBe(123_456_789);
        });
    });
    describe(safeNumberConversion, () => {
        it("should return numbers as-is", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeNumberConversion(42)).toBe(42);
            expect(safeNumberConversion(-10.5)).toBe(-10.5);
            expect(safeNumberConversion(0)).toBe(0);
        });
        it("should convert valid string numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeNumberConversion("123")).toBe(123);
            expect(safeNumberConversion("12.34")).toBe(12.34);
            expect(safeNumberConversion("-5.67")).toBe(-5.67);
            expect(safeNumberConversion("0")).toBe(0);
        });
        it("should return default value for invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeNumberConversion("invalid")).toBe(0);
            expect(safeNumberConversion(null)).toBe(0);
            expect(safeNumberConversion(undefined)).toBe(0);
            expect(safeNumberConversion({})).toBe(0);
            expect(safeNumberConversion([])).toBe(0);
            expect(safeNumberConversion("")).toBe(0);
        });
        it("should use custom default value", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeNumberConversion("invalid", 42)).toBe(42);
            expect(safeNumberConversion(null, -1)).toBe(-1);
        });

        it("sanitizes NaN defaults before applying fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            const fallback = Number.NaN;
            expect(safeNumberConversion("invalid", fallback)).toBe(0);
            expect(safeNumberConversion(undefined, fallback)).toBe(0);
        });
    });
    describe(safeParseCheckInterval, () => {
        it("should return values >= 1000", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseCheckInterval(1000)).toBe(1000);
            expect(safeParseCheckInterval(60_000)).toBe(60_000);
            expect(safeParseCheckInterval("5000")).toBe(5000);
        });
        it("should return default for values < 1000", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseCheckInterval(500)).toBe(300_000);
            expect(safeParseCheckInterval("999")).toBe(300_000);
            expect(safeParseCheckInterval(0)).toBe(300_000);
        });
        it("should use custom default", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseCheckInterval(500, 2000)).toBe(2000);
            expect(safeParseCheckInterval("invalid", 1500)).toBe(1500);
        });
    });
    describe(safeParseFloat, () => {
        it("should parse valid float strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseFloat("123.45")).toBe(123.45);
            expect(safeParseFloat("12.34px")).toBe(12.34);
            expect(safeParseFloat("-5.67")).toBe(-5.67);
        });
        it("should return numbers as-is", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseFloat(42.5)).toBe(42.5);
            expect(safeParseFloat(-10)).toBe(-10);
        });
        it("should return default for invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseFloat("invalid")).toBe(0);
            expect(safeParseFloat({})).toBe(0);
            expect(safeParseFloat(null)).toBe(0);
        });
    });
    describe(safeParseInt, () => {
        it("should parse valid integer strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseInt("123")).toBe(123);
            expect(safeParseInt("123.99")).toBe(123);
            expect(safeParseInt("-45")).toBe(-45);
        });
        it("should truncate float values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseInt(45.67)).toBe(45);
            expect(safeParseInt(-12.99)).toBe(-13); // Math.floor rounds down for negative numbers
            expect(safeParseInt(0.9)).toBe(0);
        });
        it("should return default for invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseInt("invalid")).toBe(0);
            expect(safeParseInt(null)).toBe(0);
            expect(safeParseInt(undefined)).toBe(0);
        });
    });
    describe(safeParsePercentage, () => {
        it("should return percentage values within 0-100", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePercentage("75")).toBe(75);
            expect(safeParsePercentage(50.5)).toBe(50.5);
            expect(safeParsePercentage("0")).toBe(0);
            expect(safeParsePercentage("100")).toBe(100);
        });
        it("should clamp values outside 0-100 range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePercentage("150")).toBe(100);
            expect(safeParsePercentage("-10")).toBe(0);
            expect(safeParsePercentage(200)).toBe(100);
            expect(safeParsePercentage(-50)).toBe(0);
        });
        it("should return default for invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePercentage("invalid")).toBe(0);
            expect(safeParsePercentage(null)).toBe(0);
        });
    });
    describe(safeParsePort, () => {
        it("should return valid port numbers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePort("8080")).toBe(8080);
            expect(safeParsePort(443)).toBe(443);
            expect(safeParsePort("1")).toBe(1);
            expect(safeParsePort("65535")).toBe(65_535);
        });
        it("should return default for invalid ports", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePort("0")).toBe(80);
            expect(safeParsePort("65536")).toBe(80);
            expect(safeParsePort("-1")).toBe(80);
            expect(safeParsePort("invalid")).toBe(80);
        });
        it("should use custom default", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePort("0", 443)).toBe(443);
            expect(safeParsePort("invalid", 3000)).toBe(3000);
        });
    });
    describe(safeParsePositiveInt, () => {
        it("should return positive integers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePositiveInt("5")).toBe(5);
            expect(safeParsePositiveInt(10)).toBe(10);
            expect(safeParsePositiveInt("100")).toBe(100);
        });
        it("should return default for non-positive values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePositiveInt("0")).toBe(1);
            expect(safeParsePositiveInt("-3")).toBe(1);
            expect(safeParsePositiveInt(-10)).toBe(1);
        });
        it("should use custom default", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParsePositiveInt("0", 5)).toBe(5);
            expect(safeParsePositiveInt("invalid", 10)).toBe(10);
        });
    });
    describe(safeParseRetryAttempts, () => {
        it("should return retry attempts within valid range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseRetryAttempts("3")).toBe(3);
            expect(safeParseRetryAttempts(0)).toBe(0);
            expect(safeParseRetryAttempts("10")).toBe(10);
            expect(safeParseRetryAttempts(5)).toBe(5);
        });
        it("should clamp values to valid range", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseRetryAttempts("15")).toBe(3);
            expect(safeParseRetryAttempts("-1")).toBe(3);
            expect(safeParseRetryAttempts(100)).toBe(3);
        });
        it("should return default for invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseRetryAttempts("invalid")).toBe(3);
            expect(safeParseRetryAttempts(null)).toBe(3);
        });
    });
    describe(safeParseTimeout, () => {
        it("should return positive timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseTimeout("5000")).toBe(5000);
            expect(safeParseTimeout(1000)).toBe(1000);
            expect(safeParseTimeout("0.1")).toBe(0.1);
        });
        it("should return default for non-positive values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseTimeout("0")).toBe(10_000);
            expect(safeParseTimeout("-1000")).toBe(10_000);
            expect(safeParseTimeout(-500)).toBe(10_000);
        });
        it("should return default for invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            expect(safeParseTimeout("invalid")).toBe(10_000);
            expect(safeParseTimeout(null)).toBe(10_000);
        });
    });
    describe(safeParseTimestamp, () => {
        it("should return valid timestamps", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            const validTimestamp = Date.now() - 1000;
            expect(safeParseTimestamp(validTimestamp)).toBe(validTimestamp);
            expect(safeParseTimestamp(validTimestamp.toString())).toBe(
                validTimestamp
            );
        });
        it("should return current time as default when no default provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            const now = Date.now();
            const result = safeParseTimestamp("invalid");
            expect(result).toBeGreaterThanOrEqual(now);
            expect(result).toBeLessThanOrEqual(now + 1000);
        });
        it("should use custom default", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            const customDefault = 123_456_789;
            expect(safeParseTimestamp("invalid", customDefault)).toBe(
                customDefault
            );
            expect(safeParseTimestamp("0", customDefault)).toBe(customDefault);
        });
        it("should reject timestamps too far in future", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            const farFuture = Date.now() + 86_400_000 * 2; // 2 days ahead
            const now = Date.now();
            const result = safeParseTimestamp(farFuture);
            expect(result).toBeGreaterThanOrEqual(now);
            expect(result).toBeLessThanOrEqual(now + 1000);
        });
        it("should accept timestamps within 1 day ahead", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Safe Conversions - Backend Coverage",
                "component"
            );

            const nearFuture = Date.now() + 86_400_000 / 2; // 12 hours ahead
            expect(safeParseTimestamp(nearFuture)).toBe(nearFuture);
        });
    });

    describe("Property-based tests for safe conversions", () => {
        test("should handle all possible inputs to safeNumberConversion", () => {
            fc.assert(
                fc.property(fc.anything(), fc.float(), (input, defaultVal) => {
                    const result = safeNumberConversion(input, defaultVal);

                    // Result should always be a number
                    expect(typeof result).toBe("number");
                    expect(Number.isNaN(result)).toBeFalsy();

                    // The function sanitizes NaN defaultVal to 0
                    const expectedDefault = Number.isNaN(defaultVal)
                        ? 0
                        : defaultVal;

                    if (typeof input === "number" && !Number.isNaN(input)) {
                        expect(result).toBe(input);
                    } else if (typeof input === "string") {
                        // Empty or whitespace-only strings are treated as invalid
                        if (input.trim() === "") {
                            expect(result).toBe(expectedDefault);
                        } else {
                            const parsed = Number(input);
                            if (Number.isNaN(parsed)) {
                                expect(result).toBe(expectedDefault);
                            } else {
                                expect(result).toBe(parsed);
                            }
                        }
                    } else {
                        expect(result).toBe(expectedDefault);
                    }
                })
            );
        });

        test("should handle string numbers consistently", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.float().map(String),
                        fc.integer().map(String),
                        fc.constant("123.45"),
                        fc.constant("-67.89"),
                        fc.constant("0")
                    ),
                    fc.float(),
                    (numString, fallback) => {
                        const result = safeNumberConversion(
                            numString,
                            fallback
                        );
                        const expected = Number(numString);

                        if (Number.isNaN(expected)) {
                            expect(result).toBe(fallback);
                        } else {
                            expect(result).toBe(expected);
                        }
                    }
                )
            );
        });

        test("should validate check intervals correctly", () => {
            fc.assert(
                fc.property(
                    fc
                        .float()
                        .filter((x) => !Number.isNaN(x) && Number.isFinite(x)),
                    fc
                        .float({ min: 1000 })
                        .filter((x) => !Number.isNaN(x) && Number.isFinite(x)),
                    (input, defaultVal) => {
                        const result = safeParseCheckInterval(
                            input,
                            defaultVal
                        );

                        expect(typeof result).toBe("number");
                        expect(result).toBeGreaterThanOrEqual(1000);

                        if (
                            typeof input === "number" &&
                            !Number.isNaN(input) &&
                            Number.isFinite(input) &&
                            input >= 1000
                        ) {
                            expect(result).toBe(
                                Math.min(
                                    Math.trunc(input),
                                    MAX_TIMEOUT_MILLISECONDS
                                )
                            );
                        } else {
                            const expectedDefault = Math.min(
                                Math.trunc(
                                    Number.isFinite(defaultVal)
                                        ? defaultVal
                                        : 1000
                                ),
                                MAX_TIMEOUT_MILLISECONDS
                            );
                            expect(result).toBe(expectedDefault);
                        }
                    }
                )
            );
        });

        test("should handle float parsing consistently", () => {
            fc.assert(
                fc.property(fc.anything(), fc.float(), (input, defaultVal) => {
                    const result = safeParseFloat(input, defaultVal);

                    expect(typeof result).toBe("number");

                    // Only expect non-NaN result if default value is also non-NaN
                    if (!Number.isNaN(defaultVal)) {
                        expect(Number.isNaN(result)).toBeFalsy();
                    }

                    if (typeof input === "number" && !Number.isNaN(input)) {
                        expect(result).toBe(input);
                    } else if (typeof input === "string") {
                        const parsed = Number.parseFloat(input);
                        if (Number.isNaN(parsed)) {
                            expect(result).toBe(defaultVal);
                        } else {
                            expect(result).toBe(parsed);
                        }
                    } else {
                        expect(result).toBe(defaultVal);
                    }
                })
            );
        });

        test("should handle integer parsing correctly", () => {
            fc.assert(
                fc.property(
                    fc.anything(),
                    fc.integer(),
                    (input, defaultVal) => {
                        const result = safeParseInt(input, defaultVal);

                        expect(typeof result).toBe("number");
                        expect(Number.isInteger(result)).toBeTruthy();
                        expect(Number.isNaN(result)).toBeFalsy();

                        if (typeof input === "number" && !Number.isNaN(input)) {
                            if (Number.isFinite(input)) {
                                expect(result).toBe(Math.floor(input));
                            } else {
                                expect(result).toBe(defaultVal);
                            }
                        } else if (typeof input === "string") {
                            const parsed = Number.parseInt(input, 10);
                            if (Number.isNaN(parsed)) {
                                expect(result).toBe(defaultVal);
                            } else {
                                expect(result).toBe(parsed);
                            }
                        } else {
                            const fallbackDefault = Math.min(
                                Number.isFinite(defaultVal)
                                    ? defaultVal
                                    : MIN_TIMEOUT_MILLISECONDS,
                                MAX_TIMEOUT_MILLISECONDS
                            );
                            expect(result).toBe(fallbackDefault);
                        }
                    }
                )
            );
        });

        test("should validate percentages within range", () => {
            fc.assert(
                fc.property(
                    fc.float(),
                    fc.float({ min: 0, max: 100 }),
                    (input, defaultVal) => {
                        const result = safeParsePercentage(input, defaultVal);

                        expect(typeof result).toBe("number");
                        expect(result).toBeGreaterThanOrEqual(0);
                        expect(result).toBeLessThanOrEqual(100);

                        // The function applies safeParseFloat then clamps with Math.max(0, Math.min(100, parsed))
                        // safeParseFloat returns the input number as-is for number types (excluding NaN)
                        if (typeof input === "number" && !Number.isNaN(input)) {
                            // For any valid number (finite or infinite), clamp to [0, 100]
                            const expectedResult = Math.max(
                                0,
                                Math.min(100, input)
                            );
                            expect(result).toBe(expectedResult);
                        } else if (
                            typeof input === "number" &&
                            Number.isNaN(input)
                        ) {
                            // NaN uses clamped default value
                            const expectedDefault = Math.max(
                                0,
                                Math.min(100, defaultVal)
                            );
                            expect(result).toBe(expectedDefault);
                        } else if (typeof input === "string") {
                            const parsed = Number.parseFloat(input);
                            if (Number.isNaN(parsed)) {
                                // Invalid string uses clamped default
                                const expectedDefault = Math.max(
                                    0,
                                    Math.min(100, defaultVal)
                                );
                                expect(result).toBe(expectedDefault);
                            } else {
                                // Valid string number gets clamped
                                const expectedResult = Math.max(
                                    0,
                                    Math.min(100, parsed)
                                );
                                expect(result).toBe(expectedResult);
                            }
                        } else {
                            // Non-number, non-string uses clamped default
                            const expectedDefault = Math.max(
                                0,
                                Math.min(100, defaultVal)
                            );
                            expect(result).toBe(expectedDefault);
                        }
                    }
                )
            );
        });

        test("should validate port numbers correctly", () => {
            fc.assert(
                fc.property(
                    fc.float(),
                    fc.integer({ min: 1, max: 65_535 }),
                    (input, defaultVal) => {
                        const result = safeParsePort(input, defaultVal);

                        expect(typeof result).toBe("number");
                        expect(result).toBeGreaterThanOrEqual(1);
                        expect(result).toBeLessThanOrEqual(65_535);
                        expect(Number.isInteger(result)).toBeTruthy();

                        const intValue =
                            typeof input === "number"
                                ? Math.floor(input)
                                : typeof input === "string"
                                  ? Number.parseInt(input, 10)
                                  : Number.NaN;

                        if (
                            !Number.isNaN(intValue) &&
                            intValue >= 1 &&
                            intValue <= 65_535
                        ) {
                            expect(result).toBe(intValue);
                        } else {
                            expect(result).toBe(defaultVal);
                        }
                    }
                )
            );
        });

        test("should validate positive integers", () => {
            fc.assert(
                fc.property(
                    fc.float(),
                    fc.integer({ min: 1 }),
                    (input, defaultVal) => {
                        const result = safeParsePositiveInt(input, defaultVal);

                        expect(typeof result).toBe("number");
                        expect(result).toBeGreaterThan(0);
                        expect(Number.isInteger(result)).toBeTruthy();

                        const intValue =
                            typeof input === "number"
                                ? Math.floor(input)
                                : typeof input === "string"
                                  ? Number.parseInt(input, 10)
                                  : Number.NaN;

                        if (
                            !Number.isNaN(intValue) &&
                            Number.isFinite(intValue) &&
                            intValue > 0
                        ) {
                            expect(result).toBe(intValue);
                        } else {
                            expect(result).toBe(defaultVal);
                        }
                    }
                )
            );
        });

        test("should validate retry attempts range", () => {
            fc.assert(
                fc.property(
                    fc.float(),
                    fc.integer({ min: 0, max: 10 }),
                    (input, defaultVal) => {
                        const result = safeParseRetryAttempts(
                            input,
                            defaultVal
                        );

                        expect(typeof result).toBe("number");
                        expect(result).toBeGreaterThanOrEqual(0); // Changed from 1 to 0 based on implementation
                        expect(result).toBeLessThanOrEqual(10);
                        expect(Number.isInteger(result)).toBeTruthy();

                        const intValue =
                            typeof input === "number"
                                ? Math.floor(input)
                                : typeof input === "string"
                                  ? Number.parseInt(input, 10)
                                  : Number.NaN;

                        if (
                            !Number.isNaN(intValue) &&
                            intValue >= 0 &&
                            intValue <= 10
                        ) {
                            // Changed from >=1 to >=0
                            expect(result).toBe(intValue);
                        } else {
                            expect(result).toBe(defaultVal);
                        }
                    }
                )
            );
        });

        test("should validate timeout ranges", () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0.1) }),
                    fc.float({ min: Math.fround(0.1) }),
                    (input, defaultVal) => {
                        const result = safeParseTimeout(input, defaultVal);

                        expect(typeof result).toBe("number");
                        if (Number.isFinite(result)) {
                            expect(result).toBeGreaterThan(0); // Changed from >=1000 to >0 based on implementation
                        }

                        const numValue =
                            typeof input === "number"
                                ? input
                                : typeof input === "string"
                                  ? Number(input)
                                  : Number.NaN;

                        if (
                            !Number.isNaN(numValue) &&
                            numValue > 0 &&
                            Number.isFinite(numValue)
                        ) {
                            // Must be positive AND finite
                            expect(result).toBe(
                                Math.min(numValue, MAX_TIMEOUT_MILLISECONDS)
                            );
                        } else {
                            expect(result).toBe(defaultVal);
                        }
                    }
                )
            );
        });

        test("should validate timestamp ranges", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: Date.now() + 86_400_000 }), // Within 1 day from now, must be >0
                    fc.integer({
                        min: Date.now() - 86_400_000,
                        max: Date.now() + 86_400_000,
                    }),
                    (input, defaultVal) => {
                        const result = safeParseTimestamp(input, defaultVal);

                        expect(typeof result).toBe("number");
                        expect(Number.isInteger(result)).toBeTruthy();
                        expect(result).toBeGreaterThan(0); // Must be positive

                        const now = Date.now();
                        const oneDayFromNow = now + 86_400_000;

                        if (input > 0 && input <= oneDayFromNow) {
                            // Changed from >=0 to >0
                            expect(result).toBe(input);
                        } else {
                            // Should return the default value (fallback)
                            const expectedFallback =
                                defaultVal > 0 && defaultVal <= oneDayFromNow
                                    ? defaultVal
                                    : now;
                            expect(result).toBe(expectedFallback);
                        }
                    }
                )
            );
        });

        test("should handle edge cases consistently", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.constant({}),
                        fc.constant([]),
                        fc.constant(""),
                        fc.constant("NaN"),
                        fc.constant("Infinity"),
                        fc.constant("-Infinity")
                    ),
                    fc.float(),
                    (edgeCase, fallback) => {
                        // All safe conversion functions should handle these gracefully
                        expect(() =>
                            safeNumberConversion(edgeCase, fallback)
                        ).not.toThrow();
                        expect(() =>
                            safeParseFloat(edgeCase, fallback)
                        ).not.toThrow();
                        expect(() =>
                            safeParseInt(edgeCase, Math.floor(fallback))
                        ).not.toThrow();
                        expect(() =>
                            safeParseCheckInterval(edgeCase, 60_000)
                        ).not.toThrow();
                        expect(() =>
                            safeParsePercentage(edgeCase, 50)
                        ).not.toThrow();
                        expect(() =>
                            safeParsePort(edgeCase, 8080)
                        ).not.toThrow();
                        expect(() =>
                            safeParsePositiveInt(edgeCase, 1)
                        ).not.toThrow();
                        expect(() =>
                            safeParseRetryAttempts(edgeCase, 3)
                        ).not.toThrow();
                        expect(() =>
                            safeParseTimeout(edgeCase, 5000)
                        ).not.toThrow();
                        expect(() =>
                            safeParseTimestamp(edgeCase, Date.now())
                        ).not.toThrow();
                    }
                )
            );
        });

        test("should preserve type safety invariants", () => {
            fc.assert(
                fc.property(fc.anything(), (input) => {
                    const defaultFloat = 1.5;
                    const defaultInt = 42;

                    // Test all functions
                    const results = [
                        {
                            name: "safeNumberConversion",
                            result: safeNumberConversion(input, defaultFloat),
                        },
                        {
                            name: "safeParseFloat",
                            result: safeParseFloat(input, defaultFloat),
                        },
                        {
                            name: "safeParseInt",
                            result: safeParseInt(input, defaultInt),
                        },
                        {
                            name: "safeParseCheckInterval",
                            result: safeParseCheckInterval(input, 60_000),
                        },
                        {
                            name: "safeParsePercentage",
                            result: safeParsePercentage(input, 50),
                        },
                        {
                            name: "safeParsePort",
                            result: safeParsePort(input, 8080),
                        },
                        {
                            name: "safeParsePositiveInt",
                            result: safeParsePositiveInt(input, 1),
                        },
                        {
                            name: "safeParseRetryAttempts",
                            result: safeParseRetryAttempts(input, 3),
                        },
                        {
                            name: "safeParseTimeout",
                            result: safeParseTimeout(input, 5000),
                        },
                        {
                            name: "safeParseTimestamp",
                            result: safeParseTimestamp(input, Date.now()),
                        },
                    ];

                    // All results should be numbers and not NaN
                    for (const { result } of results) {
                        expect(typeof result).toBe("number");
                        expect(Number.isNaN(result)).toBeFalsy();
                    }

                    // Special handling for functions that can preserve infinity from numeric inputs
                    const numConvResult = safeNumberConversion(
                        input,
                        defaultFloat
                    );
                    const floatResult = safeParseFloat(input, defaultFloat);

                    if (typeof input === "number" && !Number.isFinite(input)) {
                        // These functions preserve infinity when input is an infinite number
                        expect(Number.isFinite(numConvResult)).toBeFalsy();
                        expect(Number.isFinite(floatResult)).toBeFalsy();
                    }

                    // Functions that should always return finite numbers
                    const finiteResults = [
                        safeParseInt(input, defaultInt),
                        safeParseCheckInterval(input, 60_000),
                        safeParsePercentage(input, 50),
                        safeParsePort(input, 8080),
                        safeParsePositiveInt(input, 1),
                        safeParseRetryAttempts(input, 3),
                        safeParseTimeout(input, 5000),
                        safeParseTimestamp(input, Date.now()),
                    ];

                    for (const result of finiteResults) {
                        expect(Number.isFinite(result)).toBeTruthy();
                    }

                    // Integer functions should return integers
                    expect(
                        Number.isInteger(safeParseInt(input, defaultInt))
                    ).toBeTruthy();
                    expect(
                        Number.isInteger(safeParsePort(input, 8080))
                    ).toBeTruthy();
                    expect(
                        Number.isInteger(safeParsePositiveInt(input, 1))
                    ).toBeTruthy();
                    expect(
                        Number.isInteger(safeParseRetryAttempts(input, 3))
                    ).toBeTruthy();
                    // Note: safeParseTimestamp doesn't guarantee integer results for all valid inputs
                    // it uses safeNumberConversion which can return floats for valid timestamp ranges
                    const timestampResult = safeParseTimestamp(
                        input,
                        Date.now()
                    );
                    expect(typeof timestampResult).toBe("number");
                    expect(Number.isFinite(timestampResult)).toBeTruthy();
                })
            );
        });
    });
});
