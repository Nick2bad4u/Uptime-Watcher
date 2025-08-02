/**
 * Comprehensive tests for safeConversions utility functions.
 */

import { describe, it, expect } from "vitest";

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

describe("Safe Conversions", () => {
    describe("safeNumberConversion", () => {
        it("should return numbers as-is", () => {
            expect(safeNumberConversion(123)).toBe(123);
            expect(safeNumberConversion(0)).toBe(0);
            expect(safeNumberConversion(-45.67)).toBe(-45.67);
            expect(safeNumberConversion(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
        });

        it("should convert valid string numbers", () => {
            expect(safeNumberConversion("123")).toBe(123);
            expect(safeNumberConversion("12.34")).toBe(12.34);
            expect(safeNumberConversion("-45")).toBe(-45);
            expect(safeNumberConversion("0")).toBe(0);
            expect(safeNumberConversion("1e3")).toBe(1000);
            expect(safeNumberConversion("0xFF")).toBe(255);
        });

        it("should return default value for invalid inputs", () => {
            expect(safeNumberConversion("invalid")).toBe(0);
            expect(safeNumberConversion(null)).toBe(0);
            expect(safeNumberConversion(undefined)).toBe(0);
            expect(safeNumberConversion({})).toBe(0);
            expect(safeNumberConversion([])).toBe(0);
            expect(safeNumberConversion("")).toBe(0);
            expect(safeNumberConversion("abc")).toBe(0);
        });

        it("should use custom default value", () => {
            expect(safeNumberConversion("invalid", 42)).toBe(42);
            expect(safeNumberConversion(null, 100)).toBe(100);
            expect(safeNumberConversion(undefined, -1)).toBe(-1);
        });
    });

    describe("safeParseCheckInterval", () => {
        it("should return values >= 1000", () => {
            expect(safeParseCheckInterval(5000)).toBe(5000);
            expect(safeParseCheckInterval("10000")).toBe(10_000);
            expect(safeParseCheckInterval(1000)).toBe(1000);
        });

        it("should return default for values < 1000", () => {
            expect(safeParseCheckInterval(500)).toBe(300_000);
            expect(safeParseCheckInterval("999")).toBe(300_000);
            expect(safeParseCheckInterval(0)).toBe(300_000);
        });

        it("should use custom default", () => {
            expect(safeParseCheckInterval(500, 60_000)).toBe(60_000);
            expect(safeParseCheckInterval("invalid", 120_000)).toBe(120_000);
        });
    });

    describe("safeParseFloat", () => {
        it("should parse valid float strings", () => {
            expect(safeParseFloat("12.34")).toBe(12.34);
            expect(safeParseFloat("0.5")).toBe(0.5);
            expect(safeParseFloat("-45.67")).toBe(-45.67);
        });

        it("should return numbers as-is", () => {
            expect(safeParseFloat(123.45)).toBe(123.45);
            expect(safeParseFloat(0)).toBe(0);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseFloat("invalid")).toBe(0);
            expect(safeParseFloat(null)).toBe(0);
            expect(safeParseFloat("")).toBe(0);
        });
    });

    describe("safeParseInt", () => {
        it("should parse valid integer strings", () => {
            expect(safeParseInt("123")).toBe(123);
            expect(safeParseInt("0")).toBe(0);
            expect(safeParseInt("-45")).toBe(-45);
        });

        it("should truncate float values", () => {
            expect(safeParseInt("12.99")).toBe(12);
            expect(safeParseInt(45.67)).toBe(45);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseInt("invalid")).toBe(0);
            expect(safeParseInt(null)).toBe(0);
        });
    });

    describe("safeParsePercentage", () => {
        it("should return percentage values within 0-100", () => {
            expect(safeParsePercentage(50)).toBe(50);
            expect(safeParsePercentage("75")).toBe(75);
            expect(safeParsePercentage(0)).toBe(0);
            expect(safeParsePercentage(100)).toBe(100);
        });

        it("should clamp values outside 0-100 range", () => {
            expect(safeParsePercentage(-10)).toBe(0);
            expect(safeParsePercentage(150)).toBe(100);
            expect(safeParsePercentage("-5")).toBe(0);
            expect(safeParsePercentage("110")).toBe(100);
        });

        it("should return default for invalid inputs", () => {
            expect(safeParsePercentage("invalid")).toBe(0);
            expect(safeParsePercentage(null)).toBe(0);
        });
    });

    describe("safeParsePort", () => {
        it("should return valid port numbers", () => {
            expect(safeParsePort(80)).toBe(80);
            expect(safeParsePort("443")).toBe(443);
            expect(safeParsePort(8080)).toBe(8080);
            expect(safeParsePort(65_535)).toBe(65_535);
        });

        it("should return default for invalid ports", () => {
            expect(safeParsePort(0)).toBe(80);
            expect(safeParsePort(-1)).toBe(80);
            expect(safeParsePort(65_536)).toBe(80);
            expect(safeParsePort("invalid")).toBe(80);
        });

        it("should use custom default", () => {
            expect(safeParsePort(-1, 3000)).toBe(3000);
            expect(safeParsePort("invalid", 8000)).toBe(8000);
        });
    });

    describe("safeParsePositiveInt", () => {
        it("should return positive integers", () => {
            expect(safeParsePositiveInt(5)).toBe(5);
            expect(safeParsePositiveInt("10")).toBe(10);
            expect(safeParsePositiveInt(1)).toBe(1);
        });

        it("should return default for non-positive values", () => {
            expect(safeParsePositiveInt(0)).toBe(1);
            expect(safeParsePositiveInt(-5)).toBe(1);
            expect(safeParsePositiveInt("0")).toBe(1);
        });

        it("should use custom default", () => {
            expect(safeParsePositiveInt(-1, 10)).toBe(10);
            expect(safeParsePositiveInt("invalid", 20)).toBe(20);
        });
    });

    describe("safeParseRetryAttempts", () => {
        it("should return retry attempts within valid range", () => {
            expect(safeParseRetryAttempts(1)).toBe(1);
            expect(safeParseRetryAttempts("5")).toBe(5);
            expect(safeParseRetryAttempts(10)).toBe(10);
        });

        it("should clamp values to valid range", () => {
            expect(safeParseRetryAttempts(-1)).toBe(3); // Out of range, returns default
            expect(safeParseRetryAttempts(15)).toBe(3); // Out of range, returns default
            expect(safeParseRetryAttempts("20")).toBe(3); // Out of range, returns default
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseRetryAttempts("invalid")).toBe(3);
            expect(safeParseRetryAttempts(null)).toBe(3);
        });
    });

    describe("safeParseTimeout", () => {
        it("should return positive timeout values", () => {
            expect(safeParseTimeout(5000)).toBe(5000);
            expect(safeParseTimeout("10_000")).toBe(10_000);
            expect(safeParseTimeout(30_000)).toBe(30_000);
        });

        it("should return default for non-positive values", () => {
            expect(safeParseTimeout(0)).toBe(10_000); // Non-positive, returns default
            expect(safeParseTimeout(-500)).toBe(10_000); // Negative, returns default
        });

        it("should return default for invalid inputs", () => {
            expect(safeParseTimeout("invalid")).toBe(10_000);
            expect(safeParseTimeout(null)).toBe(10_000);
        });
    });

    describe("safeParseTimestamp", () => {
        it("should return valid timestamps", () => {
            const now = Date.now();
            expect(safeParseTimestamp(now)).toBe(now);
            expect(safeParseTimestamp(String(now))).toBe(now);
        });

        it("should return current time as default when no default provided", () => {
            const before = Date.now();
            const result = safeParseTimestamp("invalid");
            const after = Date.now();

            expect(result).toBeGreaterThanOrEqual(before);
            expect(result).toBeLessThanOrEqual(after);
        });

        it("should use custom default", () => {
            const customDefault = 1_000_000;
            expect(safeParseTimestamp("invalid", customDefault)).toBe(customDefault);
            expect(safeParseTimestamp(null, customDefault)).toBe(customDefault);
        });
    });
});
