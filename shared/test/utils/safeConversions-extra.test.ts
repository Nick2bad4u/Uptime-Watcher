/**
 * Comprehensive test suite for shared/utils/safeConversions.ts
 *
 * Tests for type-safe conversion utilities that handle user input and data
 * transformation with proper error handling and fallback values.
 *
 * @file Tests for safe conversion utility functions
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
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
} from "@shared/utils/safeConversions";

describe("safeNumberConversion", () => {
    it("should return the number when given a valid number", () => {
        expect(safeNumberConversion(123)).toBe(123);
        expect(safeNumberConversion(0)).toBe(0);
        expect(safeNumberConversion(-456)).toBe(-456);
        expect(safeNumberConversion(3.14159)).toBe(3.14159);
    });

    it("should convert valid numeric strings to numbers", () => {
        expect(safeNumberConversion("123")).toBe(123);
        expect(safeNumberConversion("0")).toBe(0);
        expect(safeNumberConversion("-456")).toBe(-456);
        expect(safeNumberConversion("3.14159")).toBe(3.14159);
        expect(safeNumberConversion("1e3")).toBe(1000);
        expect(safeNumberConversion("0xFF")).toBe(255);
        expect(safeNumberConversion("1.23e-4")).toBe(0.000123);
    });

    it("should return default value for invalid strings", () => {
        expect(safeNumberConversion("invalid")).toBe(0);
        expect(safeNumberConversion("")).toBe(0);
        expect(safeNumberConversion("not a number")).toBe(0);
        expect(safeNumberConversion("123abc")).toBe(0);
        expect(safeNumberConversion("NaN")).toBe(0);
    });

    it("should return default value for non-string, non-number types", () => {
        expect(safeNumberConversion(null)).toBe(0);
        expect(safeNumberConversion(undefined)).toBe(0);
        expect(safeNumberConversion({})).toBe(0);
        expect(safeNumberConversion([])).toBe(0);
        expect(safeNumberConversion(true)).toBe(0);
        expect(safeNumberConversion(false)).toBe(0);
    });

    it("should use custom default value when provided", () => {
        expect(safeNumberConversion("invalid", 42)).toBe(42);
        expect(safeNumberConversion(null, -1)).toBe(-1);
        expect(safeNumberConversion(undefined, 100)).toBe(100);
    });

    it("should handle special numeric values", () => {
        expect(safeNumberConversion(Infinity)).toBe(Infinity);
        expect(safeNumberConversion(-Infinity)).toBe(-Infinity);
        expect(safeNumberConversion(NaN)).toBe(0); // NaN is a number but should use default
    });

    it("should handle edge cases with string representation of special values", () => {
        expect(safeNumberConversion("Infinity")).toBe(Infinity);
        expect(safeNumberConversion("-Infinity")).toBe(-Infinity);
        expect(safeNumberConversion("NaN")).toBe(0);
    });
});

describe("safeParseCheckInterval", () => {
    it("should return valid check intervals unchanged", () => {
        expect(safeParseCheckInterval(1000)).toBe(1000);
        expect(safeParseCheckInterval(5000)).toBe(5000);
        expect(safeParseCheckInterval(300000)).toBe(300000);
        expect(safeParseCheckInterval("60000")).toBe(60000);
    });

    it("should enforce minimum check interval of 1000ms", () => {
        expect(safeParseCheckInterval(500)).toBe(300000); // default
        expect(safeParseCheckInterval(999)).toBe(300000); // default
        expect(safeParseCheckInterval("0")).toBe(300000); // default
        expect(safeParseCheckInterval("-1000")).toBe(300000); // default
    });

    it("should use custom default value", () => {
        expect(safeParseCheckInterval(500, 5000)).toBe(5000);
        expect(safeParseCheckInterval("invalid", 10000)).toBe(10000);
    });

    it("should handle invalid inputs", () => {
        expect(safeParseCheckInterval("invalid")).toBe(300000);
        expect(safeParseCheckInterval(null)).toBe(300000);
        expect(safeParseCheckInterval(undefined)).toBe(300000);
    });
});

describe("safeParseFloat", () => {
    it("should return the number when given a valid number", () => {
        expect(safeParseFloat(123.45)).toBe(123.45);
        expect(safeParseFloat(0)).toBe(0);
        expect(safeParseFloat(-456.789)).toBe(-456.789);
    });

    it("should parse valid floating-point strings", () => {
        expect(safeParseFloat("123.45")).toBe(123.45);
        expect(safeParseFloat("0")).toBe(0);
        expect(safeParseFloat("-456.789")).toBe(-456.789);
        expect(safeParseFloat("3.14159")).toBe(3.14159);
        expect(safeParseFloat(".5")).toBe(0.5);
        expect(safeParseFloat("5.")).toBe(5);
    });

    it("should handle partial parsing behavior of parseFloat", () => {
        expect(safeParseFloat("123.45px")).toBe(123.45);
        expect(safeParseFloat("12.34 units")).toBe(12.34);
        expect(safeParseFloat("5.5abc")).toBe(5.5);
    });

    it("should return default value for invalid strings", () => {
        expect(safeParseFloat("invalid")).toBe(0);
        expect(safeParseFloat("")).toBe(0);
        expect(safeParseFloat("abc123")).toBe(0);
        expect(safeParseFloat("not a number")).toBe(0);
    });

    it("should return default value for non-string, non-number types", () => {
        expect(safeParseFloat(null)).toBe(0);
        expect(safeParseFloat(undefined)).toBe(0);
        expect(safeParseFloat({})).toBe(0);
        expect(safeParseFloat([])).toBe(0);
        expect(safeParseFloat(true)).toBe(0);
    });

    it("should use custom default value when provided", () => {
        expect(safeParseFloat("invalid", 1.5)).toBe(1.5);
        expect(safeParseFloat(null, -2.5)).toBe(-2.5);
    });

    it("should handle special numeric values", () => {
        expect(safeParseFloat(Infinity)).toBe(Infinity);
        expect(safeParseFloat(-Infinity)).toBe(-Infinity);
        expect(safeParseFloat(NaN)).toBe(0); // NaN is a number but should use default
    });
});

describe("safeParseInt", () => {
    it("should return integers unchanged", () => {
        expect(safeParseInt(123)).toBe(123);
        expect(safeParseInt(0)).toBe(0);
        expect(safeParseInt(-456)).toBe(-456);
    });

    it("should floor floating-point numbers", () => {
        expect(safeParseInt(123.99)).toBe(123);
        expect(safeParseInt(45.67)).toBe(45);
        expect(safeParseInt(-12.34)).toBe(-13); // Math.floor(-12.34) = -13
        expect(safeParseInt(0.99)).toBe(0);
    });

    it("should parse valid integer strings", () => {
        expect(safeParseInt("123")).toBe(123);
        expect(safeParseInt("0")).toBe(0);
        expect(safeParseInt("-456")).toBe(-456);
        expect(safeParseInt("007")).toBe(7);
    });

    it("should handle parseInt behavior with mixed strings", () => {
        expect(safeParseInt("123abc")).toBe(123);
        expect(safeParseInt("456 units")).toBe(456);
        expect(safeParseInt("789.99")).toBe(789);
    });

    it("should return default value for invalid strings", () => {
        expect(safeParseInt("invalid")).toBe(0);
        expect(safeParseInt("")).toBe(0);
        expect(safeParseInt("abc123")).toBe(0);
        expect(safeParseInt("not a number")).toBe(0);
    });

    it("should return default value for non-string, non-number types", () => {
        expect(safeParseInt(null)).toBe(0);
        expect(safeParseInt(undefined)).toBe(0);
        expect(safeParseInt({})).toBe(0);
        expect(safeParseInt([])).toBe(0);
        expect(safeParseInt(true)).toBe(0);
    });

    it("should use custom default value when provided", () => {
        expect(safeParseInt("invalid", 10)).toBe(10);
        expect(safeParseInt(null, -5)).toBe(-5);
    });

    it("should handle special numeric values", () => {
        expect(safeParseInt(Infinity)).toBe(Infinity); // Infinity is a number, Math.floor(Infinity) = Infinity
        expect(safeParseInt(-Infinity)).toBe(-Infinity); // -Infinity is a number, Math.floor(-Infinity) = -Infinity
        expect(safeParseInt(NaN)).toBe(0); // NaN should use default
    });
});

describe("safeParsePercentage", () => {
    it("should return valid percentages unchanged", () => {
        expect(safeParsePercentage(75)).toBe(75);
        expect(safeParsePercentage(0)).toBe(0);
        expect(safeParsePercentage(100)).toBe(100);
        expect(safeParsePercentage("50.5")).toBe(50.5);
    });

    it("should clamp values above 100 to 100", () => {
        expect(safeParsePercentage(150)).toBe(100);
        expect(safeParsePercentage(200)).toBe(100);
        expect(safeParsePercentage("999")).toBe(100);
        expect(safeParsePercentage(Infinity)).toBe(100);
    });

    it("should clamp values below 0 to 0", () => {
        expect(safeParsePercentage(-10)).toBe(0);
        expect(safeParsePercentage(-50)).toBe(0);
        expect(safeParsePercentage("-25")).toBe(0);
        expect(safeParsePercentage(-Infinity)).toBe(0);
    });

    it("should use default value for invalid inputs", () => {
        expect(safeParsePercentage("invalid")).toBe(0);
        expect(safeParsePercentage(null)).toBe(0);
        expect(safeParsePercentage(undefined)).toBe(0);
    });

    it("should use custom default value", () => {
        expect(safeParsePercentage("invalid", 50)).toBe(50);
        expect(safeParsePercentage(null, 25)).toBe(25);
    });

    it("should handle edge cases with clamping", () => {
        expect(safeParsePercentage(100.1)).toBe(100);
        expect(safeParsePercentage(-0.1)).toBe(0);
        expect(safeParsePercentage("100.99")).toBe(100);
        expect(safeParsePercentage("-0.01")).toBe(0);
    });
});

describe("safeParsePort", () => {
    it("should return valid port numbers unchanged", () => {
        expect(safeParsePort(80)).toBe(80);
        expect(safeParsePort(443)).toBe(443);
        expect(safeParsePort(8080)).toBe(8080);
        expect(safeParsePort(65535)).toBe(65535);
        expect(safeParsePort("3000")).toBe(3000);
    });

    it("should return default for port 0 (reserved)", () => {
        expect(safeParsePort(0)).toBe(80);
        expect(safeParsePort("0")).toBe(80);
    });

    it("should return default for negative ports", () => {
        expect(safeParsePort(-1)).toBe(80);
        expect(safeParsePort(-8080)).toBe(80);
        expect(safeParsePort("-443")).toBe(80);
    });

    it("should return default for ports above 65535", () => {
        expect(safeParsePort(65536)).toBe(80);
        expect(safeParsePort(100000)).toBe(80);
        expect(safeParsePort("70000")).toBe(80);
    });

    it("should use custom default value", () => {
        expect(safeParsePort(0, 3000)).toBe(3000);
        expect(safeParsePort(65536, 8080)).toBe(8080);
        expect(safeParsePort("invalid", 443)).toBe(443);
    });

    it("should handle invalid inputs", () => {
        expect(safeParsePort("invalid")).toBe(80);
        expect(safeParsePort(null)).toBe(80);
        expect(safeParsePort(undefined)).toBe(80);
        expect(safeParsePort({})).toBe(80);
    });

    it("should handle edge cases", () => {
        expect(safeParsePort(1)).toBe(1); // minimum valid port
        expect(safeParsePort("1")).toBe(1);
        expect(safeParsePort(65535)).toBe(65535); // maximum valid port
        expect(safeParsePort("65535")).toBe(65535);
    });

    it("should handle floating point numbers by flooring them", () => {
        expect(safeParsePort(80.9)).toBe(80);
        expect(safeParsePort("443.7")).toBe(443);
        expect(safeParsePort(0.9)).toBe(80); // floors to 0, which is invalid
    });
});

describe("safeParsePositiveInt", () => {
    it("should return positive integers unchanged", () => {
        expect(safeParsePositiveInt(1)).toBe(1);
        expect(safeParsePositiveInt(5)).toBe(5);
        expect(safeParsePositiveInt(100)).toBe(100);
        expect(safeParsePositiveInt("42")).toBe(42);
    });

    it("should return default for zero", () => {
        expect(safeParsePositiveInt(0)).toBe(1);
        expect(safeParsePositiveInt("0")).toBe(1);
    });

    it("should return default for negative numbers", () => {
        expect(safeParsePositiveInt(-1)).toBe(1);
        expect(safeParsePositiveInt(-5)).toBe(1);
        expect(safeParsePositiveInt("-10")).toBe(1);
    });

    it("should use custom default value", () => {
        expect(safeParsePositiveInt(0, 10)).toBe(10);
        expect(safeParsePositiveInt(-5, 20)).toBe(20);
        expect(safeParsePositiveInt("invalid", 3)).toBe(3);
    });

    it("should handle invalid inputs", () => {
        expect(safeParsePositiveInt("invalid")).toBe(1);
        expect(safeParsePositiveInt(null)).toBe(1);
        expect(safeParsePositiveInt(undefined)).toBe(1);
        expect(safeParsePositiveInt({})).toBe(1);
    });

    it("should handle floating point numbers by flooring them", () => {
        expect(safeParsePositiveInt(5.9)).toBe(5);
        expect(safeParsePositiveInt("10.7")).toBe(10);
        expect(safeParsePositiveInt(0.9)).toBe(1); // floors to 0, then uses default
    });

    it("should handle edge cases", () => {
        expect(safeParsePositiveInt(1)).toBe(1); // minimum positive
        expect(safeParsePositiveInt("1")).toBe(1);
        expect(safeParsePositiveInt(Number.MAX_SAFE_INTEGER)).toBe(
            Number.MAX_SAFE_INTEGER
        );
    });
});

describe("safeParseRetryAttempts", () => {
    it("should return valid retry attempts unchanged", () => {
        expect(safeParseRetryAttempts(0)).toBe(0);
        expect(safeParseRetryAttempts(3)).toBe(3);
        expect(safeParseRetryAttempts(5)).toBe(5);
        expect(safeParseRetryAttempts(10)).toBe(10);
        expect(safeParseRetryAttempts("7")).toBe(7);
    });

    it("should return default for negative numbers", () => {
        expect(safeParseRetryAttempts(-1)).toBe(3);
        expect(safeParseRetryAttempts(-5)).toBe(3);
        expect(safeParseRetryAttempts("-2")).toBe(3);
    });

    it("should return default for numbers above 10", () => {
        expect(safeParseRetryAttempts(11)).toBe(3);
        expect(safeParseRetryAttempts(15)).toBe(3);
        expect(safeParseRetryAttempts("20")).toBe(3);
        expect(safeParseRetryAttempts(100)).toBe(3);
    });

    it("should use custom default value", () => {
        expect(safeParseRetryAttempts(-1, 5)).toBe(5);
        expect(safeParseRetryAttempts(15, 2)).toBe(2);
        expect(safeParseRetryAttempts("invalid", 1)).toBe(1);
    });

    it("should handle invalid inputs", () => {
        expect(safeParseRetryAttempts("invalid")).toBe(3);
        expect(safeParseRetryAttempts(null)).toBe(3);
        expect(safeParseRetryAttempts(undefined)).toBe(3);
        expect(safeParseRetryAttempts({})).toBe(3);
    });

    it("should handle edge cases", () => {
        expect(safeParseRetryAttempts(0)).toBe(0); // minimum valid (no retries)
        expect(safeParseRetryAttempts("0")).toBe(0);
        expect(safeParseRetryAttempts(10)).toBe(10); // maximum valid
        expect(safeParseRetryAttempts("10")).toBe(10);
    });

    it("should handle floating point numbers by flooring them", () => {
        expect(safeParseRetryAttempts(5.9)).toBe(5);
        expect(safeParseRetryAttempts("7.3")).toBe(7);
        expect(safeParseRetryAttempts(10.9)).toBe(10);
        expect(safeParseRetryAttempts(-0.5)).toBe(3); // floors to -1, which is invalid
    });
});

describe("safeParseTimeout", () => {
    it("should return positive timeout values unchanged", () => {
        expect(safeParseTimeout(1000)).toBe(1000);
        expect(safeParseTimeout(5000)).toBe(5000);
        expect(safeParseTimeout(30000)).toBe(30000);
        expect(safeParseTimeout("15000")).toBe(15000);
    });

    it("should accept fractional timeout values", () => {
        expect(safeParseTimeout(1000.5)).toBe(1000.5);
        expect(safeParseTimeout("2500.75")).toBe(2500.75);
        expect(safeParseTimeout(0.1)).toBe(0.1);
    });

    it("should return default for zero timeout", () => {
        expect(safeParseTimeout(0)).toBe(10000);
        expect(safeParseTimeout("0")).toBe(10000);
    });

    it("should return default for negative timeout", () => {
        expect(safeParseTimeout(-1000)).toBe(10000);
        expect(safeParseTimeout(-5000)).toBe(10000);
        expect(safeParseTimeout("-2500")).toBe(10000);
    });

    it("should use custom default value", () => {
        expect(safeParseTimeout(0, 5000)).toBe(5000);
        expect(safeParseTimeout(-1000, 15000)).toBe(15000);
        expect(safeParseTimeout("invalid", 20000)).toBe(20000);
    });

    it("should handle invalid inputs", () => {
        expect(safeParseTimeout("invalid")).toBe(10000);
        expect(safeParseTimeout(null)).toBe(10000);
        expect(safeParseTimeout(undefined)).toBe(10000);
        expect(safeParseTimeout({})).toBe(10000);
    });

    it("should handle special numeric values", () => {
        expect(safeParseTimeout(Infinity)).toBe(Infinity);
        expect(safeParseTimeout(-Infinity)).toBe(10000); // negative, so use default
        expect(safeParseTimeout(NaN)).toBe(10000); // NaN should use default
    });

    it("should handle very small positive numbers", () => {
        expect(safeParseTimeout(0.001)).toBe(0.001);
        expect(safeParseTimeout("0.1")).toBe(0.1);
        expect(safeParseTimeout(Number.MIN_VALUE)).toBe(Number.MIN_VALUE);
    });
});

describe("safeParseTimestamp", () => {
    const CURRENT_TIME = 1640995200000; // 2022-01-01 00:00:00 UTC
    const ONE_DAY = 86400000; // 24 hours in milliseconds

    beforeEach(() => {
        vi.spyOn(Date, "now").mockReturnValue(CURRENT_TIME);
    });

    it("should return valid timestamps unchanged", () => {
        const validTimestamp = CURRENT_TIME - 1000; // 1 second ago
        expect(safeParseTimestamp(validTimestamp)).toBe(validTimestamp);
        expect(safeParseTimestamp(validTimestamp.toString())).toBe(
            validTimestamp
        );
    });

    it("should return current time for timestamps that are zero or negative", () => {
        expect(safeParseTimestamp(0)).toBe(CURRENT_TIME);
        expect(safeParseTimestamp(-1000)).toBe(CURRENT_TIME);
        expect(safeParseTimestamp("-500")).toBe(CURRENT_TIME);
    });

    it("should return current time for timestamps too far in the future", () => {
        const tooFarFuture = CURRENT_TIME + ONE_DAY + 1000; // More than 1 day ahead
        expect(safeParseTimestamp(tooFarFuture)).toBe(CURRENT_TIME);
        expect(safeParseTimestamp(tooFarFuture.toString())).toBe(CURRENT_TIME);
    });

    it("should accept timestamps up to 1 day in the future", () => {
        const almostOneDayFuture = CURRENT_TIME + ONE_DAY - 1000; // Just under 1 day ahead
        const exactlyOneDayFuture = CURRENT_TIME + ONE_DAY; // Exactly 1 day ahead

        expect(safeParseTimestamp(almostOneDayFuture)).toBe(almostOneDayFuture);
        expect(safeParseTimestamp(exactlyOneDayFuture)).toBe(
            exactlyOneDayFuture
        );
    });

    it("should use custom default value when provided", () => {
        const customDefault = CURRENT_TIME - 5000;
        expect(safeParseTimestamp(0, customDefault)).toBe(customDefault);
        expect(safeParseTimestamp(-1000, customDefault)).toBe(customDefault);
        expect(safeParseTimestamp("invalid", customDefault)).toBe(
            customDefault
        );
    });

    it("should handle invalid inputs", () => {
        expect(safeParseTimestamp("invalid")).toBe(CURRENT_TIME);
        expect(safeParseTimestamp(null)).toBe(CURRENT_TIME);
        expect(safeParseTimestamp(undefined)).toBe(CURRENT_TIME);
        expect(safeParseTimestamp({})).toBe(CURRENT_TIME);
    });

    it("should handle current time as valid", () => {
        expect(safeParseTimestamp(CURRENT_TIME)).toBe(CURRENT_TIME);
        expect(safeParseTimestamp(CURRENT_TIME.toString())).toBe(CURRENT_TIME);
    });

    it("should handle edge cases with the future limit", () => {
        // Exactly at the limit
        const limitTimestamp = CURRENT_TIME + ONE_DAY;
        expect(safeParseTimestamp(limitTimestamp)).toBe(limitTimestamp);

        // Just over the limit
        const overLimitTimestamp = CURRENT_TIME + ONE_DAY + 1;
        expect(safeParseTimestamp(overLimitTimestamp)).toBe(CURRENT_TIME);
    });

    it("should handle very old timestamps", () => {
        const oldTimestamp = 1000000000000; // Year 2001
        expect(safeParseTimestamp(oldTimestamp)).toBe(oldTimestamp);
        expect(safeParseTimestamp("1000000000000")).toBe(oldTimestamp);
    });

    it("should handle special numeric values", () => {
        expect(safeParseTimestamp(Infinity)).toBe(CURRENT_TIME); // Too far in future
        expect(safeParseTimestamp(-Infinity)).toBe(CURRENT_TIME); // Negative
        expect(safeParseTimestamp(NaN)).toBe(CURRENT_TIME); // Invalid
    });

    it("should use current time as default when no defaultValue provided", () => {
        // Test multiple calls to ensure Date.now() is called as fallback
        expect(safeParseTimestamp("invalid")).toBe(CURRENT_TIME);
        expect(safeParseTimestamp(null)).toBe(CURRENT_TIME);
    });
});

// Function Coverage Validation: Ensure all exported functions are called for coverage
describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", () => {
        // Call each function with valid inputs to ensure they execute
        expect(safeNumberConversion(123)).toBe(123);
        expect(safeParseCheckInterval(60000)).toBe(60000);
        expect(safeParseFloat(3.14)).toBe(3.14);
        expect(safeParseInt(42)).toBe(42);
        expect(safeParsePercentage(85.5)).toBe(85.5);
        expect(safeParsePort(8080)).toBe(8080);
        expect(safeParsePositiveInt(5)).toBe(5);
        expect(safeParseRetryAttempts(3)).toBe(3);
        expect(safeParseTimeout(5000)).toBe(5000);
        expect(safeParseTimestamp(Date.now())).toBeGreaterThan(0);

        // Verify functions handle edge cases
        expect(safeNumberConversion("invalid")).toBe(0);
        expect(safeParseCheckInterval("invalid")).toBe(300000);
        expect(safeParseFloat("invalid")).toBe(0);
        expect(safeParseInt("invalid")).toBe(0);
        expect(safeParsePercentage("invalid")).toBe(0);
        expect(safeParsePort("invalid")).toBe(80);
        expect(safeParsePositiveInt("invalid")).toBe(1);
        expect(safeParseRetryAttempts("invalid")).toBe(3);
        expect(safeParseTimeout("invalid")).toBe(10000);
        expect(safeParseTimestamp("invalid")).toBeGreaterThan(0);
    });
});
