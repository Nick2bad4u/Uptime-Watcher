import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    formatDuration,
    formatFullTimestamp,
    formatIntervalDuration,
    formatRelativeTimestamp,
    formatResponseDuration,
    formatResponseTime,
    getIntervalLabel,
    formatRetryAttemptsText,
    TIME_PERIOD_LABELS,
    type TimePeriod,
} from "../../utils/time";

describe("Time Utilities", () => {
    describe("formatDuration", () => {
        it("should format seconds only", () => {
            expect(formatDuration(5000)).toBe("5s");
            expect(formatDuration(30000)).toBe("30s");
            expect(formatDuration(59000)).toBe("59s");
        });

        it("should format minutes and seconds", () => {
            expect(formatDuration(60000)).toBe("1m 0s");
            expect(formatDuration(90000)).toBe("1m 30s");
            expect(formatDuration(150000)).toBe("2m 30s");
            expect(formatDuration(3540000)).toBe("59m 0s");
        });

        it("should format hours and minutes", () => {
            expect(formatDuration(3600000)).toBe("1h 0m");
            expect(formatDuration(3690000)).toBe("1h 1m");
            expect(formatDuration(5400000)).toBe("1h 30m");
            expect(formatDuration(7200000)).toBe("2h 0m");
            expect(formatDuration(7380000)).toBe("2h 3m");
        });

        it("should handle zero and very small values", () => {
            expect(formatDuration(0)).toBe("0s");
            expect(formatDuration(500)).toBe("0s");
            expect(formatDuration(999)).toBe("0s");
        });

        it("should handle very large values", () => {
            expect(formatDuration(86400000)).toBe("24h 0m"); // 1 day
            expect(formatDuration(90061000)).toBe("25h 1m"); // 25 hours 1 minute
        });

        it("should handle edge cases with rounding", () => {
            expect(formatDuration(1500)).toBe("1s"); // 1.5 seconds rounds down
            expect(formatDuration(61500)).toBe("1m 1s"); // 61.5 seconds = 1m 1s
        });
    });

    describe("formatFullTimestamp", () => {
        it("should format timestamp as locale string", () => {
            const timestamp = 1640995200000; // January 1, 2022 00:00:00 UTC
            const result = formatFullTimestamp(timestamp);

            // The exact format depends on locale and timezone, but should contain date/time info
            expect(result).toMatch(/2021|2022|21|22/); // Should contain year (timezone dependent)
            expect(result).toMatch(/Jan|Dec|1|31|01|12/); // Should contain month or day (timezone dependent)
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(5);
        });

        it("should handle different timestamps", () => {
            const timestamps = [
                Date.now(),
                1577836800000, // Jan 1, 2020
                1704067200000, // Jan 1, 2024
            ];

            timestamps.forEach((timestamp) => {
                const result = formatFullTimestamp(timestamp);
                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThan(5);
            });
        });

        it("should handle zero timestamp", () => {
            const result = formatFullTimestamp(0);
            expect(typeof result).toBe("string");
            expect(result).toMatch(/1969|1970|69|70/); // Unix epoch (timezone dependent)
        });
    });

    describe("formatIntervalDuration", () => {
        it("should format seconds for values under 1 minute", () => {
            expect(formatIntervalDuration(5000)).toBe("5s");
            expect(formatIntervalDuration(30000)).toBe("30s");
            expect(formatIntervalDuration(59999)).toBe("60s"); // Rounds up
        });

        it("should format minutes for values under 1 hour", () => {
            expect(formatIntervalDuration(60000)).toBe("1m");
            expect(formatIntervalDuration(150000)).toBe("3m"); // 2.5 minutes rounds up
            expect(formatIntervalDuration(1800000)).toBe("30m");
            expect(formatIntervalDuration(3599999)).toBe("60m"); // Just under 1 hour
        });

        it("should format hours for values 1 hour and above", () => {
            expect(formatIntervalDuration(3600000)).toBe("1h");
            expect(formatIntervalDuration(5400000)).toBe("2h"); // 1.5 hours rounds up
            expect(formatIntervalDuration(7200000)).toBe("2h");
            expect(formatIntervalDuration(86400000)).toBe("24h"); // 1 day
        });

        it("should handle edge cases and rounding", () => {
            expect(formatIntervalDuration(0)).toBe("0s");
            expect(formatIntervalDuration(500)).toBe("1s"); // 0.5 seconds rounds up
            expect(formatIntervalDuration(59500)).toBe("60s"); // 59.5 seconds rounds up
            expect(formatIntervalDuration(119500)).toBe("2m"); // 1.99 minutes rounds up
        });

        it("should handle very large values", () => {
            expect(formatIntervalDuration(172800000)).toBe("48h"); // 2 days
            expect(formatIntervalDuration(604800000)).toBe("168h"); // 1 week
        });
    });

    describe("formatRelativeTimestamp", () => {
        let mockNow: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            // Mock Date.now to return a fixed timestamp
            mockNow = vi.spyOn(Date, "now").mockReturnValue(1640995200000); // Jan 1, 2022 00:00:00 UTC
        });

        afterEach(() => {
            mockNow.mockRestore();
        });

        it("should return 'Just now' for recent timestamps", () => {
            const recentTimestamp = 1640995200000 - 30000; // 30 seconds ago
            expect(formatRelativeTimestamp(recentTimestamp)).toBe("Just now");

            const veryRecentTimestamp = 1640995200000 - 5000; // 5 seconds ago
            expect(formatRelativeTimestamp(veryRecentTimestamp)).toBe(
                "Just now"
            );
        });

        it("should format seconds ago for timestamps 31+ seconds old", () => {
            const timestamp = 1640995200000 - 45000; // 45 seconds ago
            expect(formatRelativeTimestamp(timestamp)).toBe("45 seconds ago");

            const timestamp2 = 1640995200000 - 59000; // 59 seconds ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("59 seconds ago");
        });

        it("should format minutes ago", () => {
            const timestamp1 = 1640995200000 - 60000; // 1 minute ago
            expect(formatRelativeTimestamp(timestamp1)).toBe("1 minute ago");

            const timestamp2 = 1640995200000 - 120000; // 2 minutes ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("2 minutes ago");

            const timestamp3 = 1640995200000 - 1800000; // 30 minutes ago
            expect(formatRelativeTimestamp(timestamp3)).toBe("30 minutes ago");
        });

        it("should format hours ago", () => {
            const timestamp1 = 1640995200000 - 3600000; // 1 hour ago
            expect(formatRelativeTimestamp(timestamp1)).toBe("1 hour ago");

            const timestamp2 = 1640995200000 - 7200000; // 2 hours ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("2 hours ago");

            const timestamp3 = 1640995200000 - 21600000; // 6 hours ago
            expect(formatRelativeTimestamp(timestamp3)).toBe("6 hours ago");
        });

        it("should format days ago", () => {
            const timestamp1 = 1640995200000 - 86400000; // 1 day ago
            expect(formatRelativeTimestamp(timestamp1)).toBe("1 day ago");

            const timestamp2 = 1640995200000 - 172800000; // 2 days ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("2 days ago");

            const timestamp3 = 1640995200000 - 604800000; // 7 days ago
            expect(formatRelativeTimestamp(timestamp3)).toBe("7 days ago");
        });

        it("should handle edge cases", () => {
            // Exactly 30 seconds
            const thirtySecondsAgo = 1640995200000 - 30000;
            expect(formatRelativeTimestamp(thirtySecondsAgo)).toBe("Just now");

            // Exactly 31 seconds
            const thirtyOneSecondsAgo = 1640995200000 - 31000;
            expect(formatRelativeTimestamp(thirtyOneSecondsAgo)).toBe(
                "31 seconds ago"
            );

            // Current timestamp (0 difference)
            expect(formatRelativeTimestamp(1640995200000)).toBe("Just now");
        });

        it("should handle future timestamps gracefully", () => {
            const futureTimestamp = 1640995200000 + 60000; // 1 minute in future
            // Should handle negative differences gracefully (implementation dependent)
            const result = formatRelativeTimestamp(futureTimestamp);
            expect(typeof result).toBe("string");
        });
    });

    describe("formatResponseDuration", () => {
        it("should format milliseconds for values under 1 second", () => {
            expect(formatResponseDuration(0)).toBe("0ms");
            expect(formatResponseDuration(123)).toBe("123ms");
            expect(formatResponseDuration(500)).toBe("500ms");
            expect(formatResponseDuration(999)).toBe("999ms");
        });

        it("should format seconds for values under 1 minute", () => {
            expect(formatResponseDuration(1000)).toBe("1s");
            expect(formatResponseDuration(5000)).toBe("5s");
            expect(formatResponseDuration(30000)).toBe("30s");
            expect(formatResponseDuration(59999)).toBe("60s"); // Rounds up
        });

        it("should format minutes for values under 1 hour", () => {
            expect(formatResponseDuration(60000)).toBe("1m");
            expect(formatResponseDuration(150000)).toBe("3m"); // 2.5 minutes rounds up
            expect(formatResponseDuration(1800000)).toBe("30m");
            expect(formatResponseDuration(3599999)).toBe("60m");
        });

        it("should format hours for values 1 hour and above", () => {
            expect(formatResponseDuration(3600000)).toBe("1h");
            expect(formatResponseDuration(5400000)).toBe("2h"); // 1.5 hours rounds up
            expect(formatResponseDuration(7200000)).toBe("2h");
        });

        it("should handle edge cases", () => {
            expect(formatResponseDuration(999.9)).toBe("999.9ms");
            expect(formatResponseDuration(1000.1)).toBe("1s");
        });
    });

    describe("formatResponseTime", () => {
        it("should return 'N/A' for undefined, null, or missing values", () => {
            expect(formatResponseTime(undefined)).toBe("N/A");
            expect(formatResponseTime()).toBe("N/A");
            expect(formatResponseTime(null as any)).toBe("N/A");
        });

        it("should format zero as milliseconds", () => {
            expect(formatResponseTime(0)).toBe("0ms");
        });

        it("should format values under 1000ms as milliseconds", () => {
            expect(formatResponseTime(1)).toBe("1ms");
            expect(formatResponseTime(123)).toBe("123ms");
            expect(formatResponseTime(500)).toBe("500ms");
            expect(formatResponseTime(999)).toBe("999ms");
        });

        it("should format values 1000ms and above as seconds with decimal", () => {
            expect(formatResponseTime(1000)).toBe("1.00s");
            expect(formatResponseTime(1234)).toBe("1.23s");
            expect(formatResponseTime(5000)).toBe("5.00s");
            expect(formatResponseTime(12345)).toBe("12.35s"); // Rounds to 2 decimal places
        });

        it("should handle edge cases with rounding", () => {
            expect(formatResponseTime(999.9)).toBe("999.9ms");
            expect(formatResponseTime(1000.1)).toBe("1.00s");
            expect(formatResponseTime(1234.567)).toBe("1.23s"); // Rounds down
            expect(formatResponseTime(1234.999)).toBe("1.23s"); // Rounds down
        });

        it("should handle very large values", () => {
            expect(formatResponseTime(60000)).toBe("60.00s");
            expect(formatResponseTime(123456)).toBe("123.46s");
        });
    });

    describe("getIntervalLabel", () => {
        it("should format numeric intervals using formatIntervalDuration", () => {
            expect(getIntervalLabel(5000)).toBe("5s");
            expect(getIntervalLabel(60000)).toBe("1m");
            expect(getIntervalLabel(3600000)).toBe("1h");
        });

        it("should use custom label when provided", () => {
            expect(
                getIntervalLabel({ value: 5000, label: "Every 5 seconds" })
            ).toBe("Every 5 seconds");
            expect(
                getIntervalLabel({ value: 60000, label: "Custom minute" })
            ).toBe("Custom minute");
            expect(
                getIntervalLabel({ value: 3600000, label: "Hourly Check" })
            ).toBe("Hourly Check");
        });

        it("should fall back to formatIntervalDuration when label is empty", () => {
            expect(getIntervalLabel({ value: 5000, label: "" })).toBe("5s");
            expect(getIntervalLabel({ value: 60000 })).toBe("1m");
            expect(getIntervalLabel({ value: 3600000 })).toBe("1h");
        });

        it("should handle edge cases", () => {
            expect(getIntervalLabel(0)).toBe("0s");
            expect(getIntervalLabel({ value: 0, label: "Instant" })).toBe(
                "Instant"
            );
            expect(getIntervalLabel({ value: 1000 })).toBe("1s");
        });
    });

    describe("formatRetryAttemptsText", () => {
        it("should return special message for 0 attempts", () => {
            expect(formatRetryAttemptsText(0)).toBe(
                "(Retry disabled - immediate failure detection)"
            );
        });

        it("should use singular 'time' for 1 attempt", () => {
            expect(formatRetryAttemptsText(1)).toBe(
                "(Retry 1 time before marking down)"
            );
        });

        it("should use plural 'times' for multiple attempts", () => {
            expect(formatRetryAttemptsText(2)).toBe(
                "(Retry 2 times before marking down)"
            );
            expect(formatRetryAttemptsText(3)).toBe(
                "(Retry 3 times before marking down)"
            );
            expect(formatRetryAttemptsText(5)).toBe(
                "(Retry 5 times before marking down)"
            );
            expect(formatRetryAttemptsText(10)).toBe(
                "(Retry 10 times before marking down)"
            );
        });

        it("should handle edge cases", () => {
            // Test negative values (not expected but should be handled)
            expect(formatRetryAttemptsText(-1)).toBe(
                "(Retry -1 times before marking down)"
            );

            // Test very large values
            expect(formatRetryAttemptsText(100)).toBe(
                "(Retry 100 times before marking down)"
            );
        });

        it("should handle decimal values (though not expected in normal use)", () => {
            expect(formatRetryAttemptsText(1.5)).toBe(
                "(Retry 1.5 times before marking down)"
            );
            expect(formatRetryAttemptsText(2.7)).toBe(
                "(Retry 2.7 times before marking down)"
            );
        });
    });

    describe("TIME_PERIOD_LABELS", () => {
        it("should contain all expected time period labels", () => {
            expect(TIME_PERIOD_LABELS).toEqual({
                "1h": "Last Hour",
                "7d": "Last 7 Days",
                "12h": "Last 12 Hours",
                "24h": "Last 24 Hours",
                "30d": "Last 30 Days",
            });
        });

        it("should have correct types for all keys", () => {
            const periods: TimePeriod[] = [
                "1h",
                "12h",
                "24h",
                "7d",
                "30d",
            ];

            periods.forEach((period) => {
                expect(TIME_PERIOD_LABELS[period]).toBeDefined();
                expect(typeof TIME_PERIOD_LABELS[period]).toBe("string");
            });
        });

        it("should provide meaningful labels", () => {
            Object.values(TIME_PERIOD_LABELS).forEach((label) => {
                expect(label).toMatch(/^Last/); // All labels start with "Last"
                expect(label.length).toBeGreaterThan(5); // Meaningful length
            });
        });
    });

    describe("Edge cases and robustness", () => {
        it("should handle very large numbers gracefully", () => {
            const largeNumber = Number.MAX_SAFE_INTEGER;

            // These should not throw errors
            expect(() => formatDuration(largeNumber)).not.toThrow();
            expect(() => formatIntervalDuration(largeNumber)).not.toThrow();
            expect(() => formatResponseDuration(largeNumber)).not.toThrow();
            expect(() => formatResponseTime(largeNumber)).not.toThrow();
        });

        it("should handle negative numbers gracefully", () => {
            // These should not throw errors, though behavior may vary
            expect(() => formatDuration(-1000)).not.toThrow();
            expect(() => formatIntervalDuration(-1000)).not.toThrow();
            expect(() => formatResponseDuration(-1000)).not.toThrow();
            expect(() => formatResponseTime(-1000)).not.toThrow();
        });

        it("should handle floating point precision issues", () => {
            // Test common floating point edge cases
            const result1 = formatResponseTime(0.1 + 0.2); // Often equals 0.30000000000000004
            expect(result1).toBe("0.30000000000000004ms");

            const result2 = formatDuration(999.9999); // Should floor to 999ms = 0s
            expect(result2).toBe("0s");
        });
    });
});
