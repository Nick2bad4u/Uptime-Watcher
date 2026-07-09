/**
 * Property-based tests for time utilities using fast-check.
 *
 * @remarks
 * These tests verify the correctness of time formatting operations using
 * property-based testing to explore edge cases and validate invariants across
 * random inputs.
 *
 * Tests cover:
 *
 * - Duration formatting with automatic unit selection
 * - Relative timestamp formatting with appropriate granularity
 * - Response time formatting with millisecond/second handling
 * - Interval duration formatting for monitoring contexts
 * - Full timestamp localization
 * - Retry attempt text formatting
 * - Time period label mappings
 *
 * @file
 */

import { fc, test as fcTest } from "@fast-check/vitest";
import { arrayJoin, isInteger } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    formatDuration,
    formatFullTimestamp,
    formatIntervalDuration,
    formatRelativeTimestamp,
    formatResponseTime,
    formatRetryAttemptsText,
    getIntervalLabel,
    TIME_PERIOD_LABELS,
    type TimePeriod,
} from "../../utils/time";

// Mock UiDefaults for consistent testing
vi.mock("../fallbacks", () => ({
    UiDefaults: {
        notAvailableLabel: "N/A",
    },
}));

describe("time Utils Property-Based Tests", () => {
    let originalDateNow: typeof Date.now;
    let mockTime: number;

    beforeEach(() => {
        originalDateNow = Date.now;
        mockTime = 1_640_995_200_000; // Fixed timestamp: 2021-12-31 16:00:00 UTC
        vi.spyOn(Date, "now").mockImplementation(() => mockTime);
    });

    afterEach(() => {
        Date.now = originalDateNow;
        vi.restoreAllMocks();
    });

    describe("formatDuration function", () => {
        fcTest.prop([fc.integer({ max: 59, min: 0 })])(
            "should format seconds correctly for durations under 1 minute",
            (seconds) => {
                const ms = seconds * 1000;
                const result = formatDuration(ms);

                expect(result).toBe(`${seconds}s`);
                expect(result).toMatch(/^\d+s$/v);
            }
        );

        fcTest.prop([
            fc.integer({ max: 59, min: 1 }),
            fc.integer({ max: 59, min: 0 }),
        ])(
            "should format minutes and seconds correctly for durations under 1 hour",
            (minutes, seconds) => {
                const ms = (minutes * 60 + seconds) * 1000;
                const result = formatDuration(ms);

                expect(result).toBe(`${minutes}m ${seconds}s`);
                expect(result).toMatch(/^\d+m \d+s$/v);
            }
        );

        fcTest.prop([
            fc.integer({ max: 23, min: 1 }),
            fc.integer({ max: 59, min: 0 }),
        ])(
            "should format hours and minutes correctly for durations over 1 hour",
            (hours, minutes) => {
                const ms = (hours * 3600 + minutes * 60) * 1000;
                const result = formatDuration(ms);

                expect(result).toBe(`${hours}h ${minutes}m`);
                expect(result).toMatch(/^\d+h \d+m$/v);
            }
        );

        fcTest.prop([fc.double({ max: 59.999, min: 0, noNaN: true })])(
            "should handle fractional milliseconds by rounding down",
            (fractionalSeconds) => {
                const ms = fractionalSeconds * 1000;
                const result = formatDuration(ms);

                const expectedSeconds = Math.floor(fractionalSeconds);

                expect(result).toBe(`${expectedSeconds}s`);
            }
        );

        it("should handle zero duration", () => {
            expect(formatDuration(0)).toBe("0s");
        });

        fcTest.prop([
            fc.integer({ max: 86_400_000 * 7, min: 86_400_000 }), // 1-7 days
        ])("should format very long durations correctly", (ms) => {
            const result = formatDuration(ms);
            const hours = Math.floor(ms / 3_600_000);
            const minutes = Math.floor((ms % 3_600_000) / 60_000);

            expect(result).toBe(`${hours}h ${minutes}m`);
            expect(result).toMatch(/^\d+h \d+m$/v);
        });

        fcTest.prop([fc.constantFrom(Number.NaN, Infinity, -Infinity)])(
            "should return fallback for non-finite durations",
            (ms) => {
                expect(formatDuration(ms)).toBe("N/A");
            }
        );
    });

    describe("formatFullTimestamp function", () => {
        fcTest.prop([fc.integer({ max: Date.now(), min: 0 })])(
            "should return a valid date string for any valid timestamp",
            (timestamp) => {
                const result = formatFullTimestamp(timestamp);

                // Should be a non-empty string
                expect(result).toBeTypeOf("string");
                expect(result.length).toBeGreaterThan(0);

                // Should be parseable back to a date
                const parsedDate = new Date(result);

                expect(parsedDate).toBeInstanceOf(Date);
            }
        );

        fcTest.prop([fc.date()])(
            "should produce consistent results for Date objects",
            (date) => {
                const timestamp = date.getTime();
                const result = formatFullTimestamp(timestamp);

                expect(result).toBeTypeOf("string");
                expect(result.length).toBeGreaterThan(0);
            }
        );

        fcTest.prop([
            fc.constantFrom(Number.NaN, Infinity, -Infinity, 8.64e15 + 1),
        ])("should return fallback for invalid timestamps", (timestamp) => {
            expect(formatFullTimestamp(timestamp)).toBe("N/A");
        });
    });

    describe("formatIntervalDuration function", () => {
        fcTest.prop([fc.integer({ max: 59_999, min: 0 })])(
            "should format milliseconds to seconds for intervals under 1 minute",
            (ms) => {
                const result = formatIntervalDuration(ms);
                const expectedSeconds = Math.round(ms / 1000);

                expect(result).toBe(`${expectedSeconds}s`);
                expect(result).toMatch(/^\d+s$/v);
            }
        );

        fcTest.prop([fc.integer({ max: 3_599_999, min: 60_000 })])(
            "should format milliseconds to minutes for intervals under 1 hour",
            (ms) => {
                const result = formatIntervalDuration(ms);
                const expectedMinutes = Math.round(ms / 60_000);

                expect(result).toBe(`${expectedMinutes}m`);
                expect(result).toMatch(/^\d+m$/v);
            }
        );

        fcTest.prop([fc.integer({ max: 86_400_000, min: 3_600_000 })])(
            "should format milliseconds to hours for intervals over 1 hour",
            (ms) => {
                const result = formatIntervalDuration(ms);
                const expectedHours = Math.round(ms / 3_600_000);

                expect(result).toBe(`${expectedHours}h`);
                expect(result).toMatch(/^\d+h$/v);
            }
        );

        it("should handle boundary values correctly", () => {
            expect(formatIntervalDuration(59_999)).toBe("60s");
            expect(formatIntervalDuration(60_000)).toBe("1m");
            expect(formatIntervalDuration(3_599_999)).toBe("60m");
            expect(formatIntervalDuration(3_600_000)).toBe("1h");
        });

        fcTest.prop([fc.constantFrom(Number.NaN, Infinity, -Infinity)])(
            "should return fallback for non-finite durations",
            (ms) => {
                expect(formatIntervalDuration(ms)).toBe("N/A");
            }
        );
    });

    describe("formatRelativeTimestamp function", () => {
        fcTest.prop([fc.integer({ max: 30, min: 0 })])(
            'should return "Just now" for very recent timestamps',
            (secondsAgo) => {
                const timestamp = mockTime - secondsAgo * 1000;
                const result = formatRelativeTimestamp(timestamp);

                expect(result).toBe("Just now");
            }
        );

        fcTest.prop([fc.integer({ max: 59, min: 31 })])(
            "should format seconds correctly",
            (secondsAgo) => {
                const timestamp = mockTime - secondsAgo * 1000;
                const result = formatRelativeTimestamp(timestamp);

                expect(result).toBe(`${secondsAgo} seconds ago`);
            }
        );

        fcTest.prop([fc.integer({ max: 59, min: 1 })])(
            "should format minutes correctly with proper pluralization",
            (minutesAgo) => {
                const timestamp = mockTime - minutesAgo * 60 * 1000;
                const result = formatRelativeTimestamp(timestamp);

                const expectedText =
                    minutesAgo === 1
                        ? "1 minute ago"
                        : `${minutesAgo} minutes ago`;

                expect(result).toBe(expectedText);
            }
        );

        fcTest.prop([fc.integer({ max: 23, min: 1 })])(
            "should format hours correctly with proper pluralization",
            (hoursAgo) => {
                const timestamp = mockTime - hoursAgo * 60 * 60 * 1000;
                const result = formatRelativeTimestamp(timestamp);

                const expectedText =
                    hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;

                expect(result).toBe(expectedText);
            }
        );

        fcTest.prop([fc.integer({ max: 7, min: 1 })])(
            "should format days correctly with proper pluralization",
            (daysAgo) => {
                const timestamp = mockTime - daysAgo * 24 * 60 * 60 * 1000;
                const result = formatRelativeTimestamp(timestamp);

                const expectedText =
                    daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

                expect(result).toBe(expectedText);
            }
        );

        fcTest.prop([
            fc.constantFrom(Number.NaN, Infinity, -Infinity, 8.64e15 + 1),
        ])("should return fallback for invalid timestamps", (timestamp) => {
            expect(formatRelativeTimestamp(timestamp)).toBe("N/A");
        });

        fcTest.prop([fc.integer({ max: 86_400, min: 1 })])(
            "should return fallback for future timestamps",
            (secondsAhead) => {
                const timestamp = mockTime + secondsAhead * 1000;

                expect(formatRelativeTimestamp(timestamp)).toBe("N/A");
            }
        );
    });

    describe("formatResponseTime function", () => {
        fcTest.prop([fc.integer({ max: 999, min: 0 })])(
            "should format milliseconds for fast response times",
            (time) => {
                const result = formatResponseTime(time);

                expect(result).toBe(`${time}ms`);
            }
        );

        fcTest.prop([fc.integer({ max: 10_000, min: 1000 })])(
            "should format seconds with decimal precision for slower responses",
            (time) => {
                const result = formatResponseTime(time);
                const expectedSeconds = (time / 1000).toFixed(2);

                expect(result).toBe(`${expectedSeconds}s`);
                expect(result).toMatch(/^\d+\.\d{2}s$/v);
            }
        );

        fcTest.prop([fc.oneof(fc.constant(null), fc.constant(undefined))])(
            "should return fallback for null/undefined values",
            (value) => {
                const result = formatResponseTime(value);

                expect(result).toBe("N/A");
            }
        );

        fcTest.prop([fc.constantFrom(Number.NaN, Infinity, -Infinity)])(
            "should return fallback for non-finite values",
            (time) => {
                expect(formatResponseTime(time)).toBe("N/A");
            }
        );

        it("should handle zero correctly", () => {
            expect(formatResponseTime(0)).toBe("0ms");
        });
    });

    describe("getIntervalLabel function", () => {
        fcTest.prop([fc.integer({ max: 3_600_000, min: 1000 })])(
            "should format numeric intervals using formatIntervalDuration",
            (interval) => {
                const result = getIntervalLabel(interval);
                const expected = formatIntervalDuration(interval);

                expect(result).toBe(expected);
            }
        );

        fcTest.prop([
            fc
                .string({ maxLength: 20, minLength: 1 })
                .filter((label) => label.trim().length > 0),
            fc.integer({ max: 60_000, min: 1000 }),
        ])(
            "should use trimmed custom label when provided in interval object",
            (label, value) => {
                const intervalObj = { label, value };
                const result = getIntervalLabel(intervalObj);

                expect(result).toBe(label.trim());
            }
        );

        fcTest.prop([
            fc
                .array(fc.constantFrom(" ", "\t", "\n", "\r"), {
                    maxLength: 20,
                })
                .map((characters) => arrayJoin(characters, "")),
            fc.integer({ max: 60_000, min: 1000 }),
        ])(
            "should fallback to formatted duration for blank labels",
            (label, value) => {
                const intervalObj = { label, value };
                const result = getIntervalLabel(intervalObj);
                const expected = formatIntervalDuration(value);

                expect(result).toBe(expected);
            }
        );

        fcTest.prop([fc.integer({ max: 60_000, min: 1000 })])(
            "should fallback to formatted duration when no label in object",
            (value) => {
                const intervalObj = { value };
                const result = getIntervalLabel(intervalObj);
                const expected = formatIntervalDuration(value);

                expect(result).toBe(expected);
            }
        );
    });

    describe("formatRetryAttemptsText function", () => {
        it("should format zero attempts correctly", () => {
            const result = formatRetryAttemptsText(0);

            expect(result).toBe(
                "(Retry disabled - immediate failure detection)"
            );
        });

        it("should format single attempt correctly", () => {
            const result = formatRetryAttemptsText(1);

            expect(result).toBe("(Retry 1 time before marking down)");
        });

        fcTest.prop([fc.integer({ max: 10, min: 2 })])(
            "should format multiple attempts correctly with plural",
            (attempts) => {
                const result = formatRetryAttemptsText(attempts);

                expect(result).toBe(
                    `(Retry ${attempts} times before marking down)`
                );
            }
        );

        fcTest.prop([fc.integer({ max: -1, min: -5 })])(
            "should return fallback for negative values",
            (attempts) => {
                const result = formatRetryAttemptsText(attempts);

                expect(result).toBe("N/A");
            }
        );

        fcTest.prop([fc.integer({ max: 100, min: 11 })])(
            "should return fallback for values above the configured range",
            (attempts) => {
                const result = formatRetryAttemptsText(attempts);

                expect(result).toBe("N/A");
            }
        );

        fcTest.prop([
            fc
                .double({
                    max: 10,
                    min: 0,
                    noDefaultInfinity: true,
                    noNaN: true,
                })
                .filter((attempts) => !isInteger(attempts)),
        ])("should return fallback for fractional values", (attempts) => {
            const result = formatRetryAttemptsText(attempts);

            expect(result).toBe("N/A");
        });

        fcTest.prop([
            fc.constantFrom(Number.NaN, Infinity, Number.NEGATIVE_INFINITY),
        ])("should return fallback for non-finite values", (attempts) => {
            const result = formatRetryAttemptsText(attempts);

            expect(result).toBe("N/A");
        });
    });

    describe("tIME_PERIOD_LABELS constants", () => {
        it("should have all expected time period labels", () => {
            const expectedLabels: Record<TimePeriod, string> = {
                "1h": "Last Hour",
                "7d": "Last 7 Days",
                "12h": "Last 12 Hours",
                "24h": "Last 24 Hours",
                "30d": "Last 30 Days",
            };

            expect(TIME_PERIOD_LABELS).toEqual(expectedLabels);
        });

        fcTest.prop([fc.constantFrom("1h", "7d", "12h", "24h", "30d")])(
            "should have string values for all period keys",
            (period) => {
                const label = TIME_PERIOD_LABELS[period];

                expect(label).toBeTypeOf("string");
                expect(label.length).toBeGreaterThan(0);
            }
        );
    });

    describe("edge cases and robustness", () => {
        fcTest.prop([
            fc.double({ max: -Number.MIN_VALUE, min: -1000, noNaN: true }),
        ])("should handle negative durations gracefully", (negativeMs) => {
            expect(formatDuration(negativeMs)).toBe("N/A");
            expect(formatIntervalDuration(negativeMs)).toBe("N/A");
        });

        fcTest.prop([
            fc.oneof(
                fc.constant(Number.MIN_VALUE), // Smallest positive double
                fc.constant(Number.MIN_VALUE), // Same as 5e-324
                fc.double({ max: 1e-10, min: 0, noNaN: true })
            ),
        ])("should handle very small durations", (ms) => {
            const result = formatDuration(ms);

            expect(result).toBe("0s"); // Should round down to 0 seconds
        });

        fcTest.prop([
            fc.integer({ max: 1_000_000_000, min: 0 }), // 1 billion
        ])(
            "should handle very large timestamps without throwing",
            (timestamp) => {
                expect(() => formatFullTimestamp(timestamp)).not.toThrow();
                expect(() => formatRelativeTimestamp(timestamp)).not.toThrow();
            }
        );

        fcTest.prop([
            fc.record({
                extraProp: fc.string(),
                label: fc.constant(""), // Empty string label
                value: fc.integer({ max: 60_000, min: 1000 }),
            }),
        ])(
            "should handle interval objects with empty labels",
            (intervalObj) => {
                const result = getIntervalLabel(intervalObj);

                // Should fallback to formatted duration for empty label
                expect(result).toBe(formatIntervalDuration(intervalObj.value));
            }
        );
    });

    describe("performance and determinism", () => {
        const baseTimestamp = 1_640_995_200_000; // 2021-12-31 16:00:00 UTC
        const dayInMs = 86_400_000; // 24 * 60 * 60 * 1000

        fcTest.prop([
            fc.array(fc.integer({ max: dayInMs, min: 0 }), {
                maxLength: 20,
                minLength: 1,
            }),
        ])("should be deterministic for same inputs", (durations) => {
            for (const duration of durations) {
                const result1 = formatDuration(duration);
                const result2 = formatDuration(duration);

                expect(result1).toBe(result2);
            }
        });

        fcTest.prop([
            fc.array(
                fc.integer({
                    max: baseTimestamp,
                    min: baseTimestamp - dayInMs,
                }),
                { maxLength: 10, minLength: 1 }
            ),
        ])(
            "should be consistent for relative timestamp formatting",
            (timestamps) => {
                for (const timestamp of timestamps) {
                    const result1 = formatRelativeTimestamp(timestamp);
                    const result2 = formatRelativeTimestamp(timestamp);

                    expect(result1).toBe(result2);
                }
            }
        );

        fcTest.prop([
            fc.array(fc.integer({ max: 10_000, min: 0 }), {
                maxLength: 20,
                minLength: 1,
            }),
        ])("should handle batch processing efficiently", (responseTimes) => {
            // Should be able to process many values without issues
            const results = responseTimes.map((time) =>
                formatResponseTime(time)
            );

            expect(results).toHaveLength(responseTimes.length);

            for (const result of results) {
                expect(result).toBeTypeOf("string");
                expect(result.length).toBeGreaterThan(0);
            }
        });
    });
});
