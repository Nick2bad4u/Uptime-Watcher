/**
 * Tests for time utility functions.
 */

import { describe, expect, it } from "vitest";

import {
    formatResponseTime,
    formatFullTimestamp,
    formatDuration,
    TIME_PERIOD_LABELS,
    type TimePeriod,
} from "../utils/time";

describe("Time Utils", () => {
    describe("formatResponseTime", () => {
        it("formats response time correctly", () => {
            expect(formatResponseTime(123)).toBe("123ms");
            expect(formatResponseTime(1500)).toBe("1.50s");
            expect(formatResponseTime(0)).toBe("0ms");
        });

        it("handles undefined response time", () => {
            expect(formatResponseTime()).toBe("N/A");
        });

        it("handles edge cases", () => {
            expect(formatResponseTime(999)).toBe("999ms");
            expect(formatResponseTime(1000)).toBe("1.00s");
            expect(formatResponseTime(10000)).toBe("10.00s");
        });
    });

    describe("formatFullTimestamp", () => {
        it("formats timestamp as full date/time string", () => {
            const timestamp = 1640995200000; // 2022-01-01 00:00:00 UTC
            const result = formatFullTimestamp(timestamp);

            // Should contain date and time components
            expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date part
            expect(result).toMatch(/\d{1,2}:\d{2}/); // Time part
        });

        it("handles different timestamp values", () => {
            expect(formatFullTimestamp(0)).toBeDefined();
            expect(formatFullTimestamp(Date.now())).toBeDefined();
        });
    });

    describe("formatDuration", () => {
        it("formats seconds correctly", () => {
            expect(formatDuration(5000)).toBe("5s");
            expect(formatDuration(30000)).toBe("30s");
            expect(formatDuration(59000)).toBe("59s");
        });

        it("formats minutes and seconds correctly", () => {
            expect(formatDuration(60000)).toBe("1m 0s");
            expect(formatDuration(90000)).toBe("1m 30s");
            expect(formatDuration(3540000)).toBe("59m 0s");
        });

        it("formats hours and minutes correctly", () => {
            expect(formatDuration(3600000)).toBe("1h 0m");
            expect(formatDuration(3900000)).toBe("1h 5m");
            expect(formatDuration(7380000)).toBe("2h 3m");
        });

        it("handles edge cases", () => {
            expect(formatDuration(0)).toBe("0s");
            expect(formatDuration(500)).toBe("0s");
            expect(formatDuration(999)).toBe("0s");
        });
    });

    describe("TIME_PERIOD_LABELS", () => {
        it("exports correct time period labels", () => {
            expect(TIME_PERIOD_LABELS["1h"]).toBe("Last Hour");
            expect(TIME_PERIOD_LABELS["12h"]).toBe("Last 12 Hours");
            expect(TIME_PERIOD_LABELS["24h"]).toBe("Last 24 Hours");
            expect(TIME_PERIOD_LABELS["7d"]).toBe("Last 7 Days");
            expect(TIME_PERIOD_LABELS["30d"]).toBe("Last 30 Days");
        });

        it("has all required time periods", () => {
            const expectedPeriods: TimePeriod[] = ["1h", "12h", "24h", "7d", "30d"];
            for (const period of expectedPeriods) {
                expect(TIME_PERIOD_LABELS[period]).toBeDefined();
                expect(typeof TIME_PERIOD_LABELS[period]).toBe("string");
            }
        });

        it("has correct object structure", () => {
            expect(Object.keys(TIME_PERIOD_LABELS)).toHaveLength(5);
            for (const label of Object.values(TIME_PERIOD_LABELS)) {
                expect(typeof label).toBe("string");
                expect(label.length).toBeGreaterThan(0);
            }
        });
    });

    describe("TimePeriod type", () => {
        it("should allow valid time period values", () => {
            const validPeriods: TimePeriod[] = ["1h", "12h", "24h", "7d", "30d"];

            // This test ensures TypeScript compilation is correct
            for (const period of validPeriods) {
                expect(TIME_PERIOD_LABELS[period]).toBeDefined();
            }
        });
    });
});
