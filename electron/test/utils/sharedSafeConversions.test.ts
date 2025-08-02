/**
 * Backend coverage test for shared utilities - safeConversions
 * Moved to electron/test to ensure coverage tracking
 */

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
} from "../../../shared/utils/safeConversions";

describe("Shared Safe Conversions - Backend Coverage", () => {
    describe("safeNumberConversion", () => {
        it("should return numbers as-is", () => {
            expect(safeNumberConversion(42)).toBe(42);
            expect(safeNumberConversion(-10.5)).toBe(-10.5);
            expect(safeNumberConversion(0)).toBe(0);
        });

        it("should convert valid string numbers", () => {
            expect(safeNumberConversion("123")).toBe(123);
            expect(safeNumberConversion("12.34")).toBe(12.34);
            expect(safeNumberConversion("-5.67")).toBe(-5.67);
            expect(safeNumberConversion("0")).toBe(0);
        });

        it("should return default value for invalid inputs", () => {
            expect(safeNumberConversion("invalid")).toBe(0);
            expect(safeNumberConversion(null)).toBe(0);
            expect(safeNumberConversion(undefined)).toBe(0);
            expect(safeNumberConversion({})).toBe(0);
            expect(safeNumberConversion([])).toBe(0);
            expect(safeNumberConversion("")).toBe(0);
        });

        it("should use custom default value", () => {
            expect(safeNumberConversion("invalid", 42)).toBe(42);
            expect(safeNumberConversion(null, -1)).toBe(-1);
        });
    });

    describe("safeParseCheckInterval", () => {
        it("should return values >= 1000", () => {
            expect(safeParseCheckInterval(1000)).toBe(1000);
            expect(safeParseCheckInterval(60_000)).toBe(60_000);
            expect(safeParseCheckInterval("5000")).toBe(5000);
        });

        it("should return default for values < 1000", () => {
            expect(safeParseCheckInterval(500)).toBe(300_000);
            expect(safeParseCheckInterval("999")).toBe(300_000);
            expect(safeParseCheckInterval(0)).toBe(300_000);
        });

        it("should use custom default", () => {
            expect(safeParseCheckInterval(500, 2000)).toBe(2000);
            expect(safeParseCheckInterval("invalid", 1500)).toBe(1500);
        });
    });

    describe("safeParseFloat", () => {
        it("should parse valid float strings", () => {
            expect(safeParseFloat("123.45")).toBe(123.45);
            expect(safeParseFloat("12.34px")).toBe(12.34);
            expect(safeParseFloat("-5.67")).toBe(-5.67);
        });

        it("should return numbers as-is", () => {
            expect(safeParseFloat(42.5)).toBe(42.5);
            expect(safeParseFloat(-10)).toBe(-10);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseFloat("invalid")).toBe(0);
            expect(safeParseFloat({})).toBe(0);
            expect(safeParseFloat(null)).toBe(0);
        });
    });

    describe("safeParseInt", () => {
        it("should parse valid integer strings", () => {
            expect(safeParseInt("123")).toBe(123);
            expect(safeParseInt("123.99")).toBe(123);
            expect(safeParseInt("-45")).toBe(-45);
        });

        it("should truncate float values", () => {
            expect(safeParseInt(45.67)).toBe(45);
            expect(safeParseInt(-12.99)).toBe(-13); // Math.floor rounds toward negative infinity
            expect(safeParseInt(0.9)).toBe(0);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseInt("invalid")).toBe(0);
            expect(safeParseInt(null)).toBe(0);
            expect(safeParseInt(undefined)).toBe(0);
        });
    });

    describe("safeParsePercentage", () => {
        it("should return percentage values within 0-100", () => {
            expect(safeParsePercentage("75")).toBe(75);
            expect(safeParsePercentage(50.5)).toBe(50.5);
            expect(safeParsePercentage("0")).toBe(0);
            expect(safeParsePercentage("100")).toBe(100);
        });

        it("should clamp values outside 0-100 range", () => {
            expect(safeParsePercentage("150")).toBe(100);
            expect(safeParsePercentage("-10")).toBe(0);
            expect(safeParsePercentage(200)).toBe(100);
            expect(safeParsePercentage(-50)).toBe(0);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParsePercentage("invalid")).toBe(0);
            expect(safeParsePercentage(null)).toBe(0);
        });
    });

    describe("safeParsePort", () => {
        it("should return valid port numbers", () => {
            expect(safeParsePort("8080")).toBe(8080);
            expect(safeParsePort(443)).toBe(443);
            expect(safeParsePort("1")).toBe(1);
            expect(safeParsePort("65535")).toBe(65_535);
        });

        it("should return default for invalid ports", () => {
            expect(safeParsePort("0")).toBe(80);
            expect(safeParsePort("65536")).toBe(80);
            expect(safeParsePort("-1")).toBe(80);
            expect(safeParsePort("invalid")).toBe(80);
        });

        it("should use custom default", () => {
            expect(safeParsePort("0", 443)).toBe(443);
            expect(safeParsePort("invalid", 3000)).toBe(3000);
        });
    });

    describe("safeParsePositiveInt", () => {
        it("should return positive integers", () => {
            expect(safeParsePositiveInt("5")).toBe(5);
            expect(safeParsePositiveInt(10)).toBe(10);
            expect(safeParsePositiveInt("100")).toBe(100);
        });

        it("should return default for non-positive values", () => {
            expect(safeParsePositiveInt("0")).toBe(1);
            expect(safeParsePositiveInt("-3")).toBe(1);
            expect(safeParsePositiveInt(-10)).toBe(1);
        });

        it("should use custom default", () => {
            expect(safeParsePositiveInt("0", 5)).toBe(5);
            expect(safeParsePositiveInt("invalid", 10)).toBe(10);
        });
    });

    describe("safeParseRetryAttempts", () => {
        it("should return retry attempts within valid range", () => {
            expect(safeParseRetryAttempts("3")).toBe(3);
            expect(safeParseRetryAttempts(0)).toBe(0);
            expect(safeParseRetryAttempts("10")).toBe(10);
            expect(safeParseRetryAttempts(5)).toBe(5);
        });

        it("should clamp values to valid range", () => {
            expect(safeParseRetryAttempts("15")).toBe(3);
            expect(safeParseRetryAttempts("-1")).toBe(3);
            expect(safeParseRetryAttempts(100)).toBe(3);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseRetryAttempts("invalid")).toBe(3);
            expect(safeParseRetryAttempts(null)).toBe(3);
        });
    });

    describe("safeParseTimeout", () => {
        it("should return positive timeout values", () => {
            expect(safeParseTimeout("5000")).toBe(5000);
            expect(safeParseTimeout(1000)).toBe(1000);
            expect(safeParseTimeout("0.1")).toBe(0.1);
        });

        it("should return default for non-positive values", () => {
            expect(safeParseTimeout("0")).toBe(10_000);
            expect(safeParseTimeout("-1000")).toBe(10_000);
            expect(safeParseTimeout(-500)).toBe(10_000);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseTimeout("invalid")).toBe(10_000);
            expect(safeParseTimeout(null)).toBe(10_000);
        });
    });

    describe("safeParseTimestamp", () => {
        it("should return valid timestamps", () => {
            const validTimestamp = Date.now() - 1000;
            expect(safeParseTimestamp(validTimestamp)).toBe(validTimestamp);
            expect(safeParseTimestamp(validTimestamp.toString())).toBe(validTimestamp);
        });

        it("should return current time as default when no default provided", () => {
            const now = Date.now();
            const result = safeParseTimestamp("invalid");
            expect(result).toBeGreaterThanOrEqual(now);
            expect(result).toBeLessThanOrEqual(now + 1000);
        });

        it("should use custom default", () => {
            const customDefault = 123_456_789;
            expect(safeParseTimestamp("invalid", customDefault)).toBe(customDefault);
            expect(safeParseTimestamp("0", customDefault)).toBe(customDefault);
        });

        it("should reject timestamps too far in future", () => {
            const farFuture = Date.now() + 86_400_000 * 2; // 2 days ahead
            const now = Date.now();
            const result = safeParseTimestamp(farFuture);
            expect(result).toBeGreaterThanOrEqual(now);
            expect(result).toBeLessThanOrEqual(now + 1000);
        });

        it("should accept timestamps within 1 day ahead", () => {
            const nearFuture = Date.now() + 86_400_000 / 2; // 12 hours ahead
            expect(safeParseTimestamp(nearFuture)).toBe(nearFuture);
        });
    });
});
