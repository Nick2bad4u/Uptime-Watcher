/**
 * @fileoverview Fuzzing tests for safeConversions utilities
 * @author AI Generated
 * @since 2024
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";
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

describe("SafeConversions utilities fuzzing tests", () => {
    describe("safeNumberConversion", () => {
        test.prop([fc.float().filter(n => !Number.isNaN(n))])(
            "should return numbers unchanged",
            (num) => {
                const result = safeNumberConversion(num);
                expect(result).toBe(num);
            }
        );

        it("should return default for NaN input", () => {
            expect(safeNumberConversion(Number.NaN)).toBe(0);
            expect(safeNumberConversion(Number.NaN, 42)).toBe(42);
        });

        test.prop([fc.string()])(
            "should convert valid numeric strings",
            (str) => {
                const result = safeNumberConversion(str);
                const expected = Number(str);

                if (Number.isNaN(expected)) {
                    expect(result).toBe(0);
                } else {
                    expect(result).toBe(expected);
                }
            }
        );

        test.prop([fc.anything(), fc.float()])(
            "should use default value for non-convertible values",
            (value, defaultValue) => {
                fc.pre(typeof value !== "number" && (typeof value !== "string" || Number.isNaN(Number(value))));

                const result = safeNumberConversion(value, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test.prop([fc.anything()])(
            "should never throw errors",
            (value) => {
                expect(() => safeNumberConversion(value)).not.toThrow();
                expect(typeof safeNumberConversion(value)).toBe("number");
            }
        );

        it("should handle edge cases", () => {
            expect(safeNumberConversion(null)).toBe(0);
            expect(safeNumberConversion(undefined)).toBe(0);
            expect(safeNumberConversion("")).toBe(0);
            expect(safeNumberConversion("0")).toBe(0);
            expect(safeNumberConversion("123")).toBe(123);
            expect(safeNumberConversion("-456")).toBe(-456);
            expect(safeNumberConversion("12.34")).toBe(12.34);
            expect(safeNumberConversion("invalid", 99)).toBe(99);
        });
    });

    describe("safeParseCheckInterval", () => {
        test.prop([fc.integer({ min: 1000 })])(
            "should return valid intervals unchanged",
            (interval) => {
                const result = safeParseCheckInterval(interval);
                expect(result).toBe(interval);
            }
        );

        test.prop([fc.integer({ max: 999 })])(
            "should return default for intervals less than 1000",
            (interval) => {
                const defaultValue = 300_000;
                const result = safeParseCheckInterval(interval, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test.prop([fc.anything(), fc.integer({ min: 1000 })])(
            "should use custom default value",
            (value, customDefault) => {
                const result = safeParseCheckInterval(value, customDefault);

                if (typeof value === "number" && value >= 1000) {
                    expect(result).toBe(value);
                } else if (typeof value === "string") {
                    const parsed = Number(value);
                    if (!Number.isNaN(parsed) && parsed >= 1000) {
                        expect(result).toBe(parsed);
                    } else {
                        expect(result).toBe(customDefault);
                    }
                } else {
                    expect(result).toBe(customDefault);
                }
            }
        );
    });

    describe("safeParseFloat", () => {
        test.prop([fc.float()])(
            "should return floats unchanged",
            (num) => {
                const result = safeParseFloat(num);
                expect(result).toBe(num);
            }
        );

        test.prop([fc.string()])(
            "should parse valid float strings",
            (str) => {
                const result = safeParseFloat(str);
                const expected = Number.parseFloat(str);

                if (Number.isNaN(expected)) {
                    expect(result).toBe(0);
                } else {
                    expect(result).toBe(expected);
                }
            }
        );

        test.prop([fc.anything()])(
            "should never throw errors",
            (value) => {
                expect(() => safeParseFloat(value)).not.toThrow();
                expect(typeof safeParseFloat(value)).toBe("number");
            }
        );

        it("should handle edge cases", () => {
            expect(safeParseFloat("123.45")).toBe(123.45);
            expect(safeParseFloat("12.34px")).toBe(12.34);
            expect(safeParseFloat("invalid")).toBe(0);
            expect(safeParseFloat({})).toBe(0);
            expect(safeParseFloat(null, 1.5)).toBe(1.5);
        });
    });

    describe("safeParseInt", () => {
        test.prop([fc.integer()])(
            "should return integers unchanged",
            (num) => {
                const result = safeParseInt(num);
                expect(result).toBe(num);
            }
        );

        test.prop([fc.float()])(
            "should floor non-integer numbers",
            (num) => {
                const result = safeParseInt(num);
                expect(result).toBe(Number.isInteger(num) ? num : Math.floor(num));
            }
        );

        test.prop([fc.string()])(
            "should parse valid integer strings",
            (str) => {
                const result = safeParseInt(str);
                const expected = Number.parseInt(str, 10);

                if (Number.isNaN(expected)) {
                    expect(result).toBe(0);
                } else {
                    expect(result).toBe(expected);
                }
            }
        );

        test.prop([fc.anything()])(
            "should never throw errors",
            (value) => {
                expect(() => safeParseInt(value)).not.toThrow();
                expect(typeof safeParseInt(value)).toBe("number");
                expect(Number.isInteger(safeParseInt(value))).toBe(true);
            }
        );

        it("should handle edge cases", () => {
            expect(safeParseInt("123")).toBe(123);
            expect(safeParseInt("123.99")).toBe(123);
            expect(safeParseInt(45.67)).toBe(45);
            expect(safeParseInt("invalid")).toBe(0);
            expect(safeParseInt(null, 10)).toBe(10);
        });
    });

    describe("safeParsePercentage", () => {
        test.prop([fc.float({ min: 0, max: 100 })])(
            "should return valid percentages unchanged",
            (percentage) => {
                const result = safeParsePercentage(percentage);
                expect(result).toBe(percentage);
            }
        );

        test.prop([fc.float({ min: 101 })])(
            "should clamp values above 100",
            (value) => {
                const result = safeParsePercentage(value);
                expect(result).toBe(100);
            }
        );

        test.prop([fc.float({ max: Math.fround(-0.1) })])(
            "should clamp values below 0",
            (value) => {
                const result = safeParsePercentage(value);
                expect(result).toBe(0);
            }
        );

        test.prop([fc.anything()])(
            "should always return value between 0 and 100",
            (value) => {
                const result = safeParsePercentage(value);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(100);
            }
        );

        it("should handle edge cases", () => {
            expect(safeParsePercentage("75")).toBe(75);
            expect(safeParsePercentage("150")).toBe(100);
            expect(safeParsePercentage("-10")).toBe(0);
            expect(safeParsePercentage("invalid")).toBe(0);
        });
    });

    describe("safeParsePort", () => {
        test.prop([fc.integer({ min: 1, max: 65_535 })])(
            "should return valid ports unchanged",
            (port) => {
                const result = safeParsePort(port);
                expect(result).toBe(port);
            }
        );

        test.prop([fc.integer().filter(n => n < 1 || n > 65_535)])(
            "should return default for invalid ports",
            (port) => {
                const defaultValue = 80;
                const result = safeParsePort(port, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test.prop([fc.anything()])(
            "should always return valid port number",
            (value) => {
                const result = safeParsePort(value);
                expect(result).toBeGreaterThanOrEqual(1);
                expect(result).toBeLessThanOrEqual(65_535);
            }
        );

        it("should handle edge cases", () => {
            expect(safeParsePort("8080")).toBe(8080);
            expect(safeParsePort("65536")).toBe(80);
            expect(safeParsePort("0")).toBe(80);
            expect(safeParsePort("invalid")).toBe(80);
            expect(safeParsePort(-1, 443)).toBe(443);
        });
    });

    describe("safeParsePositiveInt", () => {
        test.prop([fc.integer({ min: 1 })])(
            "should return positive integers unchanged",
            (num) => {
                const result = safeParsePositiveInt(num);
                expect(result).toBe(num);
            }
        );

        test.prop([fc.integer({ max: 0 })])(
            "should return default for non-positive values",
            (num) => {
                const defaultValue = 1;
                const result = safeParsePositiveInt(num, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test.prop([fc.anything()])(
            "should always return positive integer",
            (value) => {
                const result = safeParsePositiveInt(value);
                expect(result).toBeGreaterThan(0);
                expect(Number.isInteger(result)).toBe(true);
            }
        );

        it("should handle edge cases", () => {
            expect(safeParsePositiveInt("5")).toBe(5);
            expect(safeParsePositiveInt("0")).toBe(1);
            expect(safeParsePositiveInt("-3")).toBe(1);
            expect(safeParsePositiveInt("invalid")).toBe(1);
        });
    });

    describe("safeParseRetryAttempts", () => {
        test.prop([fc.integer({ min: 0, max: 10 })])(
            "should return valid retry attempts unchanged",
            (attempts) => {
                const result = safeParseRetryAttempts(attempts);
                expect(result).toBe(attempts);
            }
        );

        test.prop([fc.integer().filter(n => n < 0 || n > 10)])(
            "should return default for out-of-range values",
            (attempts) => {
                const defaultValue = 3;
                const result = safeParseRetryAttempts(attempts, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test.prop([fc.anything()])(
            "should always return value between 0 and 10",
            (value) => {
                const result = safeParseRetryAttempts(value);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(10);
            }
        );

        it("should handle edge cases", () => {
            expect(safeParseRetryAttempts("3")).toBe(3);
            expect(safeParseRetryAttempts("0")).toBe(0);
            expect(safeParseRetryAttempts("15")).toBe(3);
            expect(safeParseRetryAttempts("invalid")).toBe(3);
        });
    });

    describe("safeParseTimeout", () => {
        test.prop([fc.float({ min: Math.fround(0.1) })])(
            "should return positive timeouts unchanged",
            (timeout) => {
                const result = safeParseTimeout(timeout);
                expect(result).toBe(timeout);
            }
        );

        test.prop([fc.float({ max: Math.fround(0) })])(
            "should return default for non-positive timeouts",
            (timeout) => {
                const defaultValue = 10_000;
                const result = safeParseTimeout(timeout, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test.prop([fc.anything()])(
            "should always return positive timeout",
            (value) => {
                const result = safeParseTimeout(value);
                expect(result).toBeGreaterThan(0);
            }
        );

        it("should handle edge cases", () => {
            expect(safeParseTimeout("5000")).toBe(5000);
            expect(safeParseTimeout("0")).toBe(10_000);
            expect(safeParseTimeout("-1000")).toBe(10_000);
            expect(safeParseTimeout("invalid")).toBe(10_000);
        });
    });

    describe("safeParseTimestamp", () => {
        test.prop([fc.integer({ min: 1, max: Date.now() + 86_400_000 })])(
            "should return valid timestamps unchanged",
            (timestamp) => {
                const result = safeParseTimestamp(timestamp);
                expect(result).toBe(timestamp);
            }
        );

        test.prop([fc.integer({ max: 0 })])(
            "should return current time for invalid timestamps",
            (timestamp) => {
                const beforeCall = Date.now();
                const result = safeParseTimestamp(timestamp);
                const afterCall = Date.now();

                expect(result).toBeGreaterThanOrEqual(beforeCall);
                expect(result).toBeLessThanOrEqual(afterCall);
            }
        );

        it("should return current time for far future timestamps", () => {
            const farFutureTimestamp = Date.now() + 86_400_001; // More than 1 day in future
            const beforeCall = Date.now();
            const result = safeParseTimestamp(farFutureTimestamp);
            const afterCall = Date.now();

            expect(result).toBeGreaterThanOrEqual(beforeCall);
            expect(result).toBeLessThanOrEqual(afterCall);
        });

        test.prop([fc.anything()])(
            "should always return positive timestamp",
            (value) => {
                const result = safeParseTimestamp(value);
                expect(result).toBeGreaterThan(0);
            }
        );

        it("should handle custom default values", () => {
            const customDefault = 1_640_995_200_000; // Fixed timestamp
            const result = safeParseTimestamp("invalid", customDefault);
            expect(result).toBe(customDefault);
        });

        it("should handle edge cases", () => {
            expect(safeParseTimestamp("1640995200000")).toBe(1_640_995_200_000);
            expect(safeParseTimestamp("0")).toBeGreaterThan(0);
            expect(safeParseTimestamp("-1000")).toBeGreaterThan(0);
        });
    });

    describe("Integration and consistency", () => {
        test.prop([fc.anything()])(
            "all functions should never throw errors",
            (value) => {
                expect(() => safeNumberConversion(value)).not.toThrow();
                expect(() => safeParseCheckInterval(value)).not.toThrow();
                expect(() => safeParseFloat(value)).not.toThrow();
                expect(() => safeParseInt(value)).not.toThrow();
                expect(() => safeParsePercentage(value)).not.toThrow();
                expect(() => safeParsePort(value)).not.toThrow();
                expect(() => safeParsePositiveInt(value)).not.toThrow();
                expect(() => safeParseRetryAttempts(value)).not.toThrow();
                expect(() => safeParseTimeout(value)).not.toThrow();
                expect(() => safeParseTimestamp(value)).not.toThrow();
            }
        );

        test.prop([fc.anything()])(
            "all functions should return numbers",
            (value) => {
                expect(typeof safeNumberConversion(value)).toBe("number");
                expect(typeof safeParseCheckInterval(value)).toBe("number");
                expect(typeof safeParseFloat(value)).toBe("number");
                expect(typeof safeParseInt(value)).toBe("number");
                expect(typeof safeParsePercentage(value)).toBe("number");
                expect(typeof safeParsePort(value)).toBe("number");
                expect(typeof safeParsePositiveInt(value)).toBe("number");
                expect(typeof safeParseRetryAttempts(value)).toBe("number");
                expect(typeof safeParseTimeout(value)).toBe("number");
                expect(typeof safeParseTimestamp(value)).toBe("number");
            }
        );

        test.prop([fc.string()])(
            "functions should handle numeric strings without throwing",
            (numStr) => {
                // All functions should return numbers without throwing
                expect(() => safeNumberConversion(numStr)).not.toThrow();
                expect(() => safeParseFloat(numStr)).not.toThrow();
                expect(() => safeParseInt(numStr)).not.toThrow();

                const baseNum = safeNumberConversion(numStr);
                const floatNum = safeParseFloat(numStr);
                const intNum = safeParseInt(numStr);

                expect(typeof baseNum).toBe("number");
                expect(typeof floatNum).toBe("number");
                expect(typeof intNum).toBe("number");
                expect(Number.isInteger(intNum)).toBe(true);
            }
        );

        test.prop([fc.integer()])(
            "constrained functions should respect their bounds",
            (num) => {
                const percentage = safeParsePercentage(num);
                const port = safeParsePort(num);
                const positive = safeParsePositiveInt(num);
                const retries = safeParseRetryAttempts(num);
                const timeout = safeParseTimeout(num);
                const timestamp = safeParseTimestamp(num);

                expect(percentage).toBeGreaterThanOrEqual(0);
                expect(percentage).toBeLessThanOrEqual(100);

                expect(port).toBeGreaterThanOrEqual(1);
                expect(port).toBeLessThanOrEqual(65_535);

                expect(positive).toBeGreaterThan(0);

                expect(retries).toBeGreaterThanOrEqual(0);
                expect(retries).toBeLessThanOrEqual(10);

                expect(timeout).toBeGreaterThan(0);

                expect(timestamp).toBeGreaterThan(0);
            }
        );

        it("should maintain performance with repeated conversions", () => {
            const iterations = 1000;
            const startTime = Date.now();

            for (let i = 0; i < iterations; i++) {
                safeNumberConversion(i.toString());
                safeParseInt(i.toString());
                safeParseFloat(i.toString());
            }

            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(100); // Should complete within 100ms
        });
    });
});
