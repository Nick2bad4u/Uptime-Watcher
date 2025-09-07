import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { test, fc } from "@fast-check/vitest";
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
    describe(formatDuration, () => {
        it("should format seconds only", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatDuration(5000)).toBe("5s");
            expect(formatDuration(30_000)).toBe("30s");
            expect(formatDuration(59_000)).toBe("59s");
        });

        it("should format minutes and seconds", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatDuration(60_000)).toBe("1m 0s");
            expect(formatDuration(90_000)).toBe("1m 30s");
            expect(formatDuration(150_000)).toBe("2m 30s");
            expect(formatDuration(3_540_000)).toBe("59m 0s");
        });

        it("should format hours and minutes", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatDuration(3_600_000)).toBe("1h 0m");
            expect(formatDuration(3_690_000)).toBe("1h 1m");
            expect(formatDuration(5_400_000)).toBe("1h 30m");
            expect(formatDuration(7_200_000)).toBe("2h 0m");
            expect(formatDuration(7_380_000)).toBe("2h 3m");
        });

        it("should handle zero and very small values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatDuration(0)).toBe("0s");
            expect(formatDuration(500)).toBe("0s");
            expect(formatDuration(999)).toBe("0s");
        });

        it("should handle very large values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatDuration(86_400_000)).toBe("24h 0m"); // 1 day
            expect(formatDuration(90_061_000)).toBe("25h 1m"); // 25 hours 1 minute
        });

        it("should handle edge cases with rounding", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatDuration(1500)).toBe("1s"); // 1.5 seconds rounds down
            expect(formatDuration(61_500)).toBe("1m 1s"); // 61.5 seconds = 1m 1s
        });
    });

    describe(formatFullTimestamp, () => {
        it("should format timestamp as locale string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const timestamp = 1_640_995_200_000; // January 1, 2022 00:00:00 UTC
            const result = formatFullTimestamp(timestamp);

            // The exact format depends on locale and timezone, but should contain date/time info
            expect(result).toMatch(/2021|2022|21|22/); // Should contain year (timezone dependent)
            expect(result).toMatch(/Jan|Dec|1|31|01|12/); // Should contain month or day (timezone dependent)
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(5);
        });

        it("should handle different timestamps", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const timestamps = [
                Date.now(),
                1_577_836_800_000, // Jan 1, 2020
                1_704_067_200_000, // Jan 1, 2024
            ];

            for (const timestamp of timestamps) {
                const result = formatFullTimestamp(timestamp);
                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThan(5);
            }
        });

        it("should handle zero timestamp", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = formatFullTimestamp(0);
            expect(typeof result).toBe("string");
            expect(result).toMatch(/1969|1970|69|70/); // Unix epoch (timezone dependent)
        });
    });

    describe(formatIntervalDuration, () => {
        it("should format seconds for values under 1 minute", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatIntervalDuration(5000)).toBe("5s");
            expect(formatIntervalDuration(30_000)).toBe("30s");
            expect(formatIntervalDuration(59_999)).toBe("60s"); // Rounds up
        });

        it("should format minutes for values under 1 hour", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatIntervalDuration(60_000)).toBe("1m");
            expect(formatIntervalDuration(150_000)).toBe("3m"); // 2.5 minutes rounds up
            expect(formatIntervalDuration(1_800_000)).toBe("30m");
            expect(formatIntervalDuration(3_599_999)).toBe("60m"); // Just under 1 hour
        });

        it("should format hours for values 1 hour and above", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatIntervalDuration(3_600_000)).toBe("1h");
            expect(formatIntervalDuration(5_400_000)).toBe("2h"); // 1.5 hours rounds up
            expect(formatIntervalDuration(7_200_000)).toBe("2h");
            expect(formatIntervalDuration(86_400_000)).toBe("24h"); // 1 day
        });

        it("should handle edge cases and rounding", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatIntervalDuration(0)).toBe("0s");
            expect(formatIntervalDuration(500)).toBe("1s"); // 0.5 seconds rounds up
            expect(formatIntervalDuration(59_500)).toBe("60s"); // 59.5 seconds rounds up
            expect(formatIntervalDuration(119_500)).toBe("2m"); // 1.99 minutes rounds up
        });

        it("should handle very large values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatIntervalDuration(172_800_000)).toBe("48h"); // 2 days
            expect(formatIntervalDuration(604_800_000)).toBe("168h"); // 1 week
        });
    });

    describe(formatRelativeTimestamp, () => {
        let mockNow: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            // Mock Date.now to return a fixed timestamp
            mockNow = vi.spyOn(Date, "now").mockReturnValue(1_640_995_200_000); // Jan 1, 2022 00:00:00 UTC
        });

        afterEach(() => {
            mockNow.mockRestore();
        });

        it("should return 'Just now' for recent timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const recentTimestamp = 1_640_995_200_000 - 30_000; // 30 seconds ago
            expect(formatRelativeTimestamp(recentTimestamp)).toBe("Just now");

            const veryRecentTimestamp = 1_640_995_200_000 - 5000; // 5 seconds ago
            expect(formatRelativeTimestamp(veryRecentTimestamp)).toBe(
                "Just now"
            );
        });

        it("should format seconds ago for timestamps 31+ seconds old", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const timestamp = 1_640_995_200_000 - 45_000; // 45 seconds ago
            expect(formatRelativeTimestamp(timestamp)).toBe("45 seconds ago");

            const timestamp2 = 1_640_995_200_000 - 59_000; // 59 seconds ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("59 seconds ago");
        });

        it("should format minutes ago", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const timestamp1 = 1_640_995_200_000 - 60_000; // 1 minute ago
            expect(formatRelativeTimestamp(timestamp1)).toBe("1 minute ago");

            const timestamp2 = 1_640_995_200_000 - 120_000; // 2 minutes ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("2 minutes ago");

            const timestamp3 = 1_640_995_200_000 - 1_800_000; // 30 minutes ago
            expect(formatRelativeTimestamp(timestamp3)).toBe("30 minutes ago");
        });

        it("should format hours ago", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const timestamp1 = 1_640_995_200_000 - 3_600_000; // 1 hour ago
            expect(formatRelativeTimestamp(timestamp1)).toBe("1 hour ago");

            const timestamp2 = 1_640_995_200_000 - 7_200_000; // 2 hours ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("2 hours ago");

            const timestamp3 = 1_640_995_200_000 - 21_600_000; // 6 hours ago
            expect(formatRelativeTimestamp(timestamp3)).toBe("6 hours ago");
        });

        it("should format days ago", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const timestamp1 = 1_640_995_200_000 - 86_400_000; // 1 day ago
            expect(formatRelativeTimestamp(timestamp1)).toBe("1 day ago");

            const timestamp2 = 1_640_995_200_000 - 172_800_000; // 2 days ago
            expect(formatRelativeTimestamp(timestamp2)).toBe("2 days ago");

            const timestamp3 = 1_640_995_200_000 - 604_800_000; // 7 days ago
            expect(formatRelativeTimestamp(timestamp3)).toBe("7 days ago");
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Exactly 30 seconds
            const thirtySecondsAgo = 1_640_995_200_000 - 30_000;
            expect(formatRelativeTimestamp(thirtySecondsAgo)).toBe("Just now");

            // Exactly 31 seconds
            const thirtyOneSecondsAgo = 1_640_995_200_000 - 31_000;
            expect(formatRelativeTimestamp(thirtyOneSecondsAgo)).toBe(
                "31 seconds ago"
            );

            // Current timestamp (0 difference)
            expect(formatRelativeTimestamp(1_640_995_200_000)).toBe("Just now");
        });

        it("should handle future timestamps gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const futureTimestamp = 1_640_995_200_000 + 60_000; // 1 minute in future
            // Should handle negative differences gracefully (implementation dependent)
            const result = formatRelativeTimestamp(futureTimestamp);
            expect(typeof result).toBe("string");
        });
    });

    describe(formatResponseDuration, () => {
        it("should format milliseconds for values under 1 second", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseDuration(0)).toBe("0ms");
            expect(formatResponseDuration(123)).toBe("123ms");
            expect(formatResponseDuration(500)).toBe("500ms");
            expect(formatResponseDuration(999)).toBe("999ms");
        });

        it("should format seconds for values under 1 minute", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseDuration(1000)).toBe("1s");
            expect(formatResponseDuration(5000)).toBe("5s");
            expect(formatResponseDuration(30_000)).toBe("30s");
            expect(formatResponseDuration(59_999)).toBe("60s"); // Rounds up
        });

        it("should format minutes for values under 1 hour", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseDuration(60_000)).toBe("1m");
            expect(formatResponseDuration(150_000)).toBe("3m"); // 2.5 minutes rounds up
            expect(formatResponseDuration(1_800_000)).toBe("30m");
            expect(formatResponseDuration(3_599_999)).toBe("60m");
        });

        it("should format hours for values 1 hour and above", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseDuration(3_600_000)).toBe("1h");
            expect(formatResponseDuration(5_400_000)).toBe("2h"); // 1.5 hours rounds up
            expect(formatResponseDuration(7_200_000)).toBe("2h");
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseDuration(999.9)).toBe("999.9ms");
            expect(formatResponseDuration(1000.1)).toBe("1s");
        });
    });

    describe(formatResponseTime, () => {
        it("should return 'N/A' for undefined, null, or missing values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseTime(undefined)).toBe("N/A");
            expect(formatResponseTime()).toBe("N/A");
            expect(formatResponseTime(null as any)).toBe("N/A");
        });

        it("should format zero as milliseconds", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseTime(0)).toBe("0ms");
        });

        it("should format values under 1000ms as milliseconds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseTime(1)).toBe("1ms");
            expect(formatResponseTime(123)).toBe("123ms");
            expect(formatResponseTime(500)).toBe("500ms");
            expect(formatResponseTime(999)).toBe("999ms");
        });

        it("should format values 1000ms and above as seconds with decimal", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseTime(1000)).toBe("1.00s");
            expect(formatResponseTime(1234)).toBe("1.23s");
            expect(formatResponseTime(5000)).toBe("5.00s");
            expect(formatResponseTime(12_345)).toBe("12.35s"); // Rounds to 2 decimal places
        });

        it("should handle edge cases with rounding", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseTime(999.9)).toBe("999.9ms");
            expect(formatResponseTime(1000.1)).toBe("1.00s");
            expect(formatResponseTime(1234.567)).toBe("1.23s"); // Rounds down
            expect(formatResponseTime(1234.999)).toBe("1.23s"); // Rounds down
        });

        it("should handle very large values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatResponseTime(60_000)).toBe("60.00s");
            expect(formatResponseTime(123_456)).toBe("123.46s");
        });
    });

    describe(getIntervalLabel, () => {
        it("should format numeric intervals using formatIntervalDuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getIntervalLabel(5000)).toBe("5s");
            expect(getIntervalLabel(60_000)).toBe("1m");
            expect(getIntervalLabel(3_600_000)).toBe("1h");
        });

        it("should use custom label when provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                getIntervalLabel({ value: 5000, label: "Every 5 seconds" })
            ).toBe("Every 5 seconds");
            expect(
                getIntervalLabel({ value: 60_000, label: "Custom minute" })
            ).toBe("Custom minute");
            expect(
                getIntervalLabel({ value: 3_600_000, label: "Hourly Check" })
            ).toBe("Hourly Check");
        });

        it("should fall back to formatIntervalDuration when label is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getIntervalLabel({ value: 5000, label: "" })).toBe("5s");
            expect(getIntervalLabel({ value: 60_000 })).toBe("1m");
            expect(getIntervalLabel({ value: 3_600_000 })).toBe("1h");
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getIntervalLabel(0)).toBe("0s");
            expect(getIntervalLabel({ value: 0, label: "Instant" })).toBe(
                "Instant"
            );
            expect(getIntervalLabel({ value: 1000 })).toBe("1s");
        });
    });

    describe(formatRetryAttemptsText, () => {
        it("should return special message for 0 attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatRetryAttemptsText(0)).toBe(
                "(Retry disabled - immediate failure detection)"
            );
        });

        it("should use singular 'time' for 1 attempt", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatRetryAttemptsText(1)).toBe(
                "(Retry 1 time before marking down)"
            );
        });

        it("should use plural 'times' for multiple attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test negative values (not expected but should be handled)
            expect(formatRetryAttemptsText(-1)).toBe(
                "(Retry -1 times before marking down)"
            );

            // Test very large values
            expect(formatRetryAttemptsText(100)).toBe(
                "(Retry 100 times before marking down)"
            );
        });

        it("should handle decimal values (though not expected in normal use)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(formatRetryAttemptsText(1.5)).toBe(
                "(Retry 1.5 times before marking down)"
            );
            expect(formatRetryAttemptsText(2.7)).toBe(
                "(Retry 2.7 times before marking down)"
            );
        });
    });

    describe("TIME_PERIOD_LABELS", () => {
        it("should contain all expected time period labels", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(TIME_PERIOD_LABELS).toEqual({
                "1h": "Last Hour",
                "7d": "Last 7 Days",
                "12h": "Last 12 Hours",
                "24h": "Last 24 Hours",
                "30d": "Last 30 Days",
            });
        });

        it("should have correct types for all keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const periods: TimePeriod[] = [
                "1h",
                "12h",
                "24h",
                "7d",
                "30d",
            ];

            for (const period of periods) {
                expect(TIME_PERIOD_LABELS[period]).toBeDefined();
                expect(typeof TIME_PERIOD_LABELS[period]).toBe("string");
            }
        });

        it("should provide meaningful labels", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            for (const label of Object.values(TIME_PERIOD_LABELS)) {
                expect(label).toMatch(/^Last/); // All labels start with "Last"
                expect(label.length).toBeGreaterThan(5); // Meaningful length
            }
        });
    });

    describe("Edge cases and robustness", () => {
        it("should handle very large numbers gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const largeNumber = Number.MAX_SAFE_INTEGER;

            // These should not throw errors
            expect(() => formatDuration(largeNumber)).not.toThrow();
            expect(() => formatIntervalDuration(largeNumber)).not.toThrow();
            expect(() => formatResponseDuration(largeNumber)).not.toThrow();
            expect(() => formatResponseTime(largeNumber)).not.toThrow();
        });

        it("should handle negative numbers gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // These should not throw errors, though behavior may vary
            expect(() => formatDuration(-1000)).not.toThrow();
            expect(() => formatIntervalDuration(-1000)).not.toThrow();
            expect(() => formatResponseDuration(-1000)).not.toThrow();
            expect(() => formatResponseTime(-1000)).not.toThrow();
        });

        it("should handle floating point precision issues", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: time", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test common floating point edge cases
            const result1 = formatResponseTime(0.1 + 0.2); // Often equals 0.30000000000000004
            expect(result1).toBe("0.30000000000000004ms");

            const result2 = formatDuration(999.9999); // Should floor to 999ms = 0s
            expect(result2).toBe("0s");
        });
    });

    /**
     * Fast-check property-based tests for comprehensive time utility
     * validation. These tests use property-based testing to systematically
     * explore edge cases and validate invariants across all time formatting
     * functions.
     */
    describe("Property-Based Fuzzing Tests", () => {
        describe("formatDuration property tests", () => {
            test.prop([fc.integer({ min: 0, max: 1_000_000_000 })])(
                "should always return a valid time format string",
                (ms) => {
                    const result = formatDuration(ms);

                    // Property: Result should be a non-empty string
                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);

                    // Property: Should match expected format patterns
                    const patterns = [
                        /^\d+s$/, // seconds only
                        /^\d+m \d+s$/, // minutes and seconds
                        /^\d+h \d+m$/, // hours and minutes
                    ];
                    expect(
                        patterns.some((pattern) => pattern.test(result))
                    ).toBeTruthy();

                    // Property: No negative values should appear in output
                    expect(result).not.toMatch(/-\d/);
                }
            );

            test.prop([fc.integer({ min: 0, max: 59_999 })])(
                "should format seconds only for durations under 1 minute",
                (ms) => {
                    const result = formatDuration(ms);
                    expect(result).toMatch(/^\d+s$/);

                    // Property: Seconds value should match floor division
                    const expectedSeconds = Math.floor(ms / 1000);
                    expect(result).toBe(`${expectedSeconds}s`);
                }
            );

            test.prop([fc.integer({ min: 60_000, max: 3_599_999 })])(
                "should format minutes and seconds for durations 1min-1hr",
                (ms) => {
                    const result = formatDuration(ms);
                    expect(result).toMatch(/^\d+m \d+s$/);

                    // Property: Minutes should be between 1-59
                    const minutesMatch = result.match(/^(?<minutes>\d+)m/);
                    expect(minutesMatch).toBeTruthy();
                    const minutesCapture = minutesMatch![1];
                    if (!minutesCapture) {
                        throw new Error(
                            "Expected minutes capture group to be defined"
                        );
                    }
                    const minutes = Number.parseInt(minutesCapture, 10);
                    expect(minutes).toBeGreaterThanOrEqual(1);
                    expect(minutes).toBeLessThanOrEqual(59);

                    // Property: Seconds should be between 0-59
                    const secondsMatch = result.match(/(?<seconds>\d+)s$/);
                    expect(secondsMatch).toBeTruthy();
                    const secondsCapture = secondsMatch![1];
                    if (!secondsCapture) {
                        throw new Error(
                            "Expected seconds capture group to be defined"
                        );
                    }
                    const seconds = Number.parseInt(secondsCapture, 10);
                    expect(seconds).toBeGreaterThanOrEqual(0);
                    expect(seconds).toBeLessThanOrEqual(59);
                }
            );

            test.prop([fc.integer({ min: 3_600_000, max: 86_400_000 })])(
                "should format hours and minutes for durations >= 1 hour",
                (ms) => {
                    const result = formatDuration(ms);
                    expect(result).toMatch(/^\d+h \d+m$/);

                    // Property: Hours should be at least 1
                    const hoursMatch = result.match(/^(?<hours>\d+)h/);
                    expect(hoursMatch).toBeTruthy();
                    const hoursCapture = hoursMatch![1];
                    if (!hoursCapture) {
                        throw new Error(
                            "Expected hours capture group to be defined"
                        );
                    }
                    const hours = Number.parseInt(hoursCapture, 10);
                    expect(hours).toBeGreaterThanOrEqual(1);

                    // Property: Minutes should be between 0-59
                    const minutesMatch = result.match(/(?<minutes>\d+)m$/);
                    expect(minutesMatch).toBeTruthy();
                    const minutesCapture = minutesMatch![1];
                    if (!minutesCapture) {
                        throw new Error(
                            "Expected minutes capture group to be defined"
                        );
                    }
                    const minutes = Number.parseInt(minutesCapture, 10);
                    expect(minutes).toBeGreaterThanOrEqual(0);
                    expect(minutes).toBeLessThanOrEqual(59);
                }
            );
        });

        describe("formatFullTimestamp property tests", () => {
            test.prop([fc.integer({ min: 0, max: Date.now() + 86_400_000 })])(
                "should return valid locale string for valid timestamps",
                (timestamp) => {
                    const result = formatFullTimestamp(timestamp);

                    // Property: Result should be a non-empty string
                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);

                    // Property: Should not throw and produce valid date string
                    expect(() =>
                        new Date(timestamp).toLocaleString()
                    ).not.toThrow();
                    expect(result).toBe(new Date(timestamp).toLocaleString());
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(Number.NaN),
                    fc.constant(Infinity),
                    fc.constant(-Infinity)
                ),
            ])(
                "should handle special timestamp values gracefully",
                (timestamp) => {
                    const result = formatFullTimestamp(timestamp);

                    // Property: Should not throw with special values
                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);
                }
            );
        });

        describe("formatIntervalDuration property tests", () => {
            test.prop([fc.integer({ min: 0, max: 59_999 })])(
                "should format seconds for intervals < 1 minute",
                (ms) => {
                    const result = formatIntervalDuration(ms);

                    expect(result).toMatch(/^\d+s$/);
                    const expectedSeconds = Math.round(ms / 1000);
                    expect(result).toBe(`${expectedSeconds}s`);
                }
            );

            test.prop([fc.integer({ min: 60_000, max: 3_599_999 })])(
                "should format minutes for intervals 1min-1hr",
                (ms) => {
                    const result = formatIntervalDuration(ms);

                    expect(result).toMatch(/^\d+m$/);
                    const expectedMinutes = Math.round(ms / 60_000);
                    expect(result).toBe(`${expectedMinutes}m`);
                }
            );

            test.prop([fc.integer({ min: 3_600_000, max: 86_400_000 })])(
                "should format hours for intervals >= 1 hour",
                (ms) => {
                    const result = formatIntervalDuration(ms);

                    expect(result).toMatch(/^\d+h$/);
                    const expectedHours = Math.round(ms / 3_600_000);
                    expect(result).toBe(`${expectedHours}h`);
                }
            );
        });

        describe("formatRelativeTimestamp property tests", () => {
            test.prop([fc.integer({ min: 0, max: 30_000 })])(
                "should return 'Just now' for recent timestamps (< 30s ago)",
                (offset) => {
                    vi.useFakeTimers();
                    const now = 1_000_000_000_000; // Fixed timestamp
                    vi.setSystemTime(now);

                    const timestamp = now - offset;
                    const result = formatRelativeTimestamp(timestamp);

                    if (offset <= 30_000) {
                        expect(result).toBe("Just now");
                    }

                    vi.useRealTimers();
                }
            );

            test.prop([fc.integer({ min: 31_000, max: 3_599_000 })])(
                "should format seconds or minutes for recent timestamps",
                (offset) => {
                    vi.useFakeTimers();
                    const now = 1_000_000_000_000;
                    vi.setSystemTime(now);

                    const timestamp = now - offset;
                    const result = formatRelativeTimestamp(timestamp);

                    // Property: Should contain time units
                    expect(result).toMatch(/(?:second|minute)s? ago$/);

                    // Property: Should not be negative
                    expect(result).not.toMatch(/-\d/);

                    vi.useRealTimers();
                }
            );

            test.prop([fc.integer({ min: 3_600_000, max: 86_400_000 - 1 })])(
                "should format hours for timestamps 1-24 hours ago",
                (offset) => {
                    vi.useFakeTimers();
                    const now = 1_000_000_000_000;
                    vi.setSystemTime(now);

                    const timestamp = now - offset;
                    const result = formatRelativeTimestamp(timestamp);

                    expect(result).toMatch(/^\d+ hours? ago$/);

                    vi.useRealTimers();
                }
            );

            test.prop([fc.integer({ min: 86_400_000, max: 2_592_000_000 })])(
                "should format days for timestamps > 24 hours ago",
                (offset) => {
                    vi.useFakeTimers();
                    const now = 1_000_000_000_000;
                    vi.setSystemTime(now);

                    const timestamp = now - offset;
                    const result = formatRelativeTimestamp(timestamp);

                    expect(result).toMatch(/^\d+ days? ago$/);

                    vi.useRealTimers();
                }
            );
        });

        describe("formatResponseDuration property tests", () => {
            test.prop([fc.integer({ min: 0, max: 999 })])(
                "should format milliseconds for values < 1000ms",
                (ms) => {
                    const result = formatResponseDuration(ms);

                    expect(result).toMatch(/^\d+ms$/);
                    expect(result).toBe(`${ms}ms`);
                }
            );

            test.prop([fc.integer({ min: 1000, max: 59_999 })])(
                "should format seconds for values 1s-59s",
                (ms) => {
                    const result = formatResponseDuration(ms);

                    expect(result).toMatch(/^\d+s$/);
                    const expectedSeconds = Math.round(ms / 1000);
                    expect(result).toBe(`${expectedSeconds}s`);
                }
            );

            test.prop([fc.integer({ min: 60_000, max: 3_599_999 })])(
                "should format minutes for values 1m-59m",
                (ms) => {
                    const result = formatResponseDuration(ms);

                    expect(result).toMatch(/^\d+m$/);
                    const expectedMinutes = Math.round(ms / 60_000);
                    expect(result).toBe(`${expectedMinutes}m`);
                }
            );

            test.prop([fc.integer({ min: 3_600_000, max: 86_400_000 })])(
                "should format hours for values >= 1h",
                (ms) => {
                    const result = formatResponseDuration(ms);

                    expect(result).toMatch(/^\d+h$/);
                    const expectedHours = Math.round(ms / 3_600_000);
                    expect(result).toBe(`${expectedHours}h`);
                }
            );
        });

        describe("formatResponseTime property tests", () => {
            test.prop([fc.integer({ min: 0, max: 999 })])(
                "should format milliseconds for times < 1000ms",
                (time) => {
                    const result = formatResponseTime(time);

                    expect(result).toBe(`${time}ms`);
                }
            );

            test.prop([fc.integer({ min: 1000, max: 60_000 })])(
                "should format seconds with decimals for times >= 1000ms",
                (time) => {
                    const result = formatResponseTime(time);

                    expect(result).toMatch(/^\d+\.\d{2}s$/);
                    const expectedValue = (time / 1000).toFixed(2);
                    expect(result).toBe(`${expectedValue}s`);
                }
            );

            test.prop([fc.oneof(fc.constant(undefined))])(
                "should return fallback for invalid values",
                (time) => {
                    const result = formatResponseTime(time);

                    // Property: Should return the fallback message (N/A)
                    expect(result).toBe("N/A");
                }
            );

            test.prop([fc.constant(0)])(
                "should handle zero correctly",
                (time) => {
                    const result = formatResponseTime(time);

                    // Property: Zero should be formatted as 0ms, not fallback
                    expect(result).toBe("0ms");
                }
            );
        });

        describe("formatRetryAttemptsText property tests", () => {
            test.prop([fc.constant(0)])(
                "should handle zero attempts correctly",
                (attempts) => {
                    const result = formatRetryAttemptsText(attempts);

                    expect(result).toBe(
                        "(Retry disabled - immediate failure detection)"
                    );
                }
            );

            test.prop([fc.constant(1)])(
                "should use singular 'time' for one attempt",
                (attempts) => {
                    const result = formatRetryAttemptsText(attempts);

                    expect(result).toBe("(Retry 1 time before marking down)");
                }
            );

            test.prop([fc.integer({ min: 2, max: 20 })])(
                "should use plural 'times' for multiple attempts",
                (attempts) => {
                    const result = formatRetryAttemptsText(attempts);

                    expect(result).toBe(
                        `(Retry ${attempts} times before marking down)`
                    );
                }
            );

            test.prop([fc.integer({ min: -10, max: -1 })])(
                "should handle negative attempts gracefully",
                (attempts) => {
                    const result = formatRetryAttemptsText(attempts);

                    // Property: Should format negative values as-is with plural
                    expect(result).toBe(
                        `(Retry ${attempts} times before marking down)`
                    );
                }
            );
        });

        describe("getIntervalLabel property tests", () => {
            test.prop([fc.integer({ min: 1000, max: 3_600_000 })])(
                "should format numeric intervals using formatIntervalDuration",
                (interval) => {
                    const result = getIntervalLabel(interval);
                    const expected = formatIntervalDuration(interval);

                    expect(result).toBe(expected);
                }
            );

            test.prop([
                fc.record({
                    value: fc.integer({ min: 1000, max: 3_600_000 }),
                    label: fc.string({ minLength: 1, maxLength: 20 }),
                }),
            ])("should return custom label when provided", (interval) => {
                const result = getIntervalLabel(interval);

                expect(result).toBe(interval.label);
            });

            test.prop([
                fc.record({
                    value: fc.integer({ min: 1000, max: 3_600_000 }),
                }),
            ])(
                "should format value when no label provided in object",
                (interval) => {
                    const result = getIntervalLabel(interval);
                    const expected = formatIntervalDuration(interval.value);

                    expect(result).toBe(expected);
                }
            );
        });

        describe("Cross-function property tests", () => {
            test.prop([fc.integer({ min: 0, max: 86_400_000 })])(
                "formatDuration and formatResponseDuration should handle same inputs consistently",
                (ms) => {
                    const duration = formatDuration(ms);
                    const response = formatResponseDuration(ms);

                    // Property: Both should return non-empty strings
                    expect(duration.length).toBeGreaterThan(0);
                    expect(response.length).toBeGreaterThan(0);

                    // Property: Both should not contain negative values
                    expect(duration).not.toMatch(/-\d/);
                    expect(response).not.toMatch(/-\d/);
                }
            );

            test.prop([fc.integer({ min: 0, max: 1000 })])(
                "TIME_PERIOD_LABELS should have consistent structure",
                () => {
                    const labels = TIME_PERIOD_LABELS;

                    // Property: All values should be non-empty strings
                    for (const label of Object.values(labels)) {
                        expect(typeof label).toBe("string");
                        expect(label.length).toBeGreaterThan(0);
                    }

                    // Property: Should have expected keys
                    expect(labels).toHaveProperty("1h");
                    expect(labels).toHaveProperty("12h");
                    expect(labels).toHaveProperty("24h");
                    expect(labels).toHaveProperty("7d");
                    expect(labels).toHaveProperty("30d");
                }
            );
        });
    });
});
