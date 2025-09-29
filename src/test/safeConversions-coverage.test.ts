/**
 * @module shared/utils/safeConversions.test
 *
 * @file Direct function call tests for safeConversions to ensure coverage
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
} from "@shared/utils/safeConversions";

describe("safeConversions Direct Function Coverage", () => {
    it("should call safeNumberConversion function", () => {
        expect(safeNumberConversion("123")).toBe(123);
        expect(safeNumberConversion("invalid")).toBe(0);
        const defaultNaN = Number.NaN;
        expect(
            Number.isNaN(safeNumberConversion("invalid", defaultNaN))
        ).toBeTruthy();
    });

    it("should call safeParseCheckInterval function", () => {
        expect(safeParseCheckInterval(60_000)).toBe(60_000);
        expect(safeParseCheckInterval("invalid")).toBe(300_000); // Default is 300_000
    });

    it("should call safeParseFloat function", () => {
        expect(safeParseFloat("3.14")).toBe(3.14);
        expect(safeParseFloat("invalid")).toBe(0);
    });

    it("should call safeParseInt function", () => {
        expect(safeParseInt("42")).toBe(42);
        expect(safeParseInt("invalid")).toBe(0);
    });

    it("should call safeParsePercentage function", () => {
        expect(safeParsePercentage(50)).toBe(50);
        expect(safeParsePercentage("invalid")).toBe(0);
    });

    it("should call safeParsePort function", () => {
        expect(safeParsePort(8080)).toBe(8080);
        expect(safeParsePort("invalid")).toBe(80);
    });

    it("should call safeParsePositiveInt function", () => {
        expect(safeParsePositiveInt(5)).toBe(5);
        expect(safeParsePositiveInt("invalid")).toBe(1);
    });

    it("should call safeParseRetryAttempts function", () => {
        expect(safeParseRetryAttempts(3)).toBe(3);
        expect(safeParseRetryAttempts("invalid")).toBe(3);
    });

    it("should call safeParseTimeout function", () => {
        expect(safeParseTimeout(5000)).toBe(5000);
        expect(safeParseTimeout("invalid")).toBe(10_000); // Default is 10_000
    });

    it("should call safeParseTimestamp function", () => {
        const now = Date.now();
        expect(safeParseTimestamp(now)).toBe(now);
        // For invalid, it returns current time as default, so we can't predict exact value
        const result = safeParseTimestamp("invalid");
        expect(result).toBeGreaterThan(now - 1000); // Allow some time variance
        expect(result).toBeLessThanOrEqual(Date.now() + 1000);
    });
});
