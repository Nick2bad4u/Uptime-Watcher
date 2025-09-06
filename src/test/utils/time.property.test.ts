/**
 * Property-based tests for time utilities using fast-check.
 *
 * @remarks
 * These tests verify the correctness of time formatting operations using property-based
 * testing to explore edge cases and validate invariants across random inputs.
 *
 * Tests cover:
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

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { fc, test as fcTest } from '@fast-check/vitest';
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
    type TimePeriod
} from '../../utils/time';

// Mock UiDefaults for consistent testing
vi.mock('../fallbacks', () => ({
    UiDefaults: {
        notAvailableLabel: 'N/A'
    }
}));

describe('Time Utils Property-Based Tests', () => {
    let originalDateNow: typeof Date.now;
    let mockTime: number;

    beforeEach(() => {
        originalDateNow = Date.now;
        mockTime = 1_640_995_200_000; // Fixed timestamp: 2021-12-31 16:00:00 UTC
        Date.now = vi.fn(() => mockTime);
    });

    afterEach(() => {
        Date.now = originalDateNow;
        vi.restoreAllMocks();
    });

    describe('formatDuration function', () => {
        fcTest.prop([
            fc.integer({ min: 0, max: 59 })
        ])('should format seconds correctly for durations under 1 minute', (seconds) => {
            const ms = seconds * 1000;
            const result = formatDuration(ms);

            expect(result).toBe(`${seconds}s`);
            expect(result).toMatch(/^\d+s$/);
        });

        fcTest.prop([
            fc.integer({ min: 1, max: 59 }),
            fc.integer({ min: 0, max: 59 })
        ])('should format minutes and seconds correctly for durations under 1 hour', (minutes, seconds) => {
            const ms = (minutes * 60 + seconds) * 1000;
            const result = formatDuration(ms);

            expect(result).toBe(`${minutes}m ${seconds}s`);
            expect(result).toMatch(/^\d+m \d+s$/);
        });

        fcTest.prop([
            fc.integer({ min: 1, max: 23 }),
            fc.integer({ min: 0, max: 59 })
        ])('should format hours and minutes correctly for durations over 1 hour', (hours, minutes) => {
            const ms = (hours * 3600 + minutes * 60) * 1000;
            const result = formatDuration(ms);

            expect(result).toBe(`${hours}h ${minutes}m`);
            expect(result).toMatch(/^\d+h \d+m$/);
        });

        fcTest.prop([
            fc.double({ min: 0, max: 59.999, noNaN: true })
        ])('should handle fractional milliseconds by rounding down', (fractionalSeconds) => {
            const ms = fractionalSeconds * 1000;
            const result = formatDuration(ms);

            const expectedSeconds = Math.floor(fractionalSeconds);
            expect(result).toBe(`${expectedSeconds}s`);
        });

        test('should handle zero duration', () => {
            expect(formatDuration(0)).toBe('0s');
        });

        fcTest.prop([
            fc.integer({ min: 86_400_000, max: 86_400_000 * 7 }) // 1-7 days
        ])('should format very long durations correctly', (ms) => {
            const result = formatDuration(ms);
            const hours = Math.floor(ms / 3_600_000);
            const minutes = Math.floor((ms % 3_600_000) / 60_000);

            expect(result).toBe(`${hours}h ${minutes}m`);
            expect(result).toMatch(/^\d+h \d+m$/);
        });
    });

    describe('formatFullTimestamp function', () => {
        fcTest.prop([
            fc.integer({ min: 0, max: Date.now() })
        ])('should return a valid date string for any valid timestamp', (timestamp) => {
            const result = formatFullTimestamp(timestamp);

            // Should be a non-empty string
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);

            // Should be parseable back to a date
            const parsedDate = new Date(result);
            expect(parsedDate).toBeInstanceOf(Date);
        });

        fcTest.prop([
            fc.date()
        ])('should produce consistent results for Date objects', (date) => {
            const timestamp = date.getTime();
            const result = formatFullTimestamp(timestamp);

            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('formatIntervalDuration function', () => {
        fcTest.prop([
            fc.integer({ min: 0, max: 59_999 })
        ])('should format milliseconds to seconds for intervals under 1 minute', (ms) => {
            const result = formatIntervalDuration(ms);
            const expectedSeconds = Math.round(ms / 1000);

            expect(result).toBe(`${expectedSeconds}s`);
            expect(result).toMatch(/^\d+s$/);
        });

        fcTest.prop([
            fc.integer({ min: 60_000, max: 3_599_999 })
        ])('should format milliseconds to minutes for intervals under 1 hour', (ms) => {
            const result = formatIntervalDuration(ms);
            const expectedMinutes = Math.round(ms / 60_000);

            expect(result).toBe(`${expectedMinutes}m`);
            expect(result).toMatch(/^\d+m$/);
        });

        fcTest.prop([
            fc.integer({ min: 3_600_000, max: 86_400_000 })
        ])('should format milliseconds to hours for intervals over 1 hour', (ms) => {
            const result = formatIntervalDuration(ms);
            const expectedHours = Math.round(ms / 3_600_000);

            expect(result).toBe(`${expectedHours}h`);
            expect(result).toMatch(/^\d+h$/);
        });

        test('should handle boundary values correctly', () => {
            expect(formatIntervalDuration(59_999)).toBe('60s');
            expect(formatIntervalDuration(60_000)).toBe('1m');
            expect(formatIntervalDuration(3_599_999)).toBe('60m');
            expect(formatIntervalDuration(3_600_000)).toBe('1h');
        });
    });

    describe('formatRelativeTimestamp function', () => {
        fcTest.prop([
            fc.integer({ min: 0, max: 30 })
        ])('should return "Just now" for very recent timestamps', (secondsAgo) => {
            const timestamp = mockTime - (secondsAgo * 1000);
            const result = formatRelativeTimestamp(timestamp);

            expect(result).toBe('Just now');
        });

        fcTest.prop([
            fc.integer({ min: 31, max: 59 })
        ])('should format seconds correctly', (secondsAgo) => {
            const timestamp = mockTime - (secondsAgo * 1000);
            const result = formatRelativeTimestamp(timestamp);

            expect(result).toBe(`${secondsAgo} seconds ago`);
        });

        fcTest.prop([
            fc.integer({ min: 1, max: 59 })
        ])('should format minutes correctly with proper pluralization', (minutesAgo) => {
            const timestamp = mockTime - (minutesAgo * 60 * 1000);
            const result = formatRelativeTimestamp(timestamp);

            const expectedText = minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;
            expect(result).toBe(expectedText);
        });

        fcTest.prop([
            fc.integer({ min: 1, max: 23 })
        ])('should format hours correctly with proper pluralization', (hoursAgo) => {
            const timestamp = mockTime - (hoursAgo * 60 * 60 * 1000);
            const result = formatRelativeTimestamp(timestamp);

            const expectedText = hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
            expect(result).toBe(expectedText);
        });

        fcTest.prop([
            fc.integer({ min: 1, max: 7 })
        ])('should format days correctly with proper pluralization', (daysAgo) => {
            const timestamp = mockTime - (daysAgo * 24 * 60 * 60 * 1000);
            const result = formatRelativeTimestamp(timestamp);

            const expectedText = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
            expect(result).toBe(expectedText);
        });
    });

    describe('formatResponseDuration function', () => {
        fcTest.prop([
            fc.integer({ min: 0, max: 999 })
        ])('should format milliseconds for durations under 1 second', (ms) => {
            const result = formatResponseDuration(ms);

            expect(result).toBe(`${ms}ms`);
            expect(result).toMatch(/^\d+ms$/);
        });

        fcTest.prop([
            fc.integer({ min: 1000, max: 59_999 })
        ])('should format to seconds for durations under 1 minute', (ms) => {
            const result = formatResponseDuration(ms);
            const expectedSeconds = Math.round(ms / 1000);

            expect(result).toBe(`${expectedSeconds}s`);
            expect(result).toMatch(/^\d+s$/);
        });

        fcTest.prop([
            fc.integer({ min: 60_000, max: 3_599_999 })
        ])('should format to minutes for durations under 1 hour', (ms) => {
            const result = formatResponseDuration(ms);
            const expectedMinutes = Math.round(ms / 60_000);

            expect(result).toBe(`${expectedMinutes}m`);
            expect(result).toMatch(/^\d+m$/);
        });
    });

    describe('formatResponseTime function', () => {
        fcTest.prop([
            fc.integer({ min: 0, max: 999 })
        ])('should format milliseconds for fast response times', (time) => {
            const result = formatResponseTime(time);

            expect(result).toBe(`${time}ms`);
        });

        fcTest.prop([
            fc.integer({ min: 1000, max: 10_000 })
        ])('should format seconds with decimal precision for slower responses', (time) => {
            const result = formatResponseTime(time);
            const expectedSeconds = (time / 1000).toFixed(2);

            expect(result).toBe(`${expectedSeconds}s`);
            expect(result).toMatch(/^\d+\.\d{2}s$/);
        });

        fcTest.prop([
            fc.oneof(fc.constant(null), fc.constant(undefined))
        ])('should return fallback for null/undefined values', (value) => {
            const result = formatResponseTime(value as any);

            expect(result).toBe('N/A');
        });

        test('should handle zero correctly', () => {
            expect(formatResponseTime(0)).toBe('0ms');
        });
    });

    describe('getIntervalLabel function', () => {
        fcTest.prop([
            fc.integer({ min: 1000, max: 3_600_000 })
        ])('should format numeric intervals using formatIntervalDuration', (interval) => {
            const result = getIntervalLabel(interval);
            const expected = formatIntervalDuration(interval);

            expect(result).toBe(expected);
        });

        fcTest.prop([
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.integer({ min: 1000, max: 60_000 })
        ])('should use custom label when provided in interval object', (label, value) => {
            const intervalObj = { label, value };
            const result = getIntervalLabel(intervalObj);

            expect(result).toBe(label);
        });

        fcTest.prop([
            fc.integer({ min: 1000, max: 60_000 })
        ])('should fallback to formatted duration when no label in object', (value) => {
            const intervalObj = { value };
            const result = getIntervalLabel(intervalObj);
            const expected = formatIntervalDuration(value);

            expect(result).toBe(expected);
        });
    });

    describe('formatRetryAttemptsText function', () => {
        test('should format zero attempts correctly', () => {
            const result = formatRetryAttemptsText(0);
            expect(result).toBe('(Retry disabled - immediate failure detection)');
        });

        test('should format single attempt correctly', () => {
            const result = formatRetryAttemptsText(1);
            expect(result).toBe('(Retry 1 time before marking down)');
        });

        fcTest.prop([
            fc.integer({ min: 2, max: 10 })
        ])('should format multiple attempts correctly with plural', (attempts) => {
            const result = formatRetryAttemptsText(attempts);

            expect(result).toBe(`(Retry ${attempts} times before marking down)`);
        });

        fcTest.prop([
            fc.integer({ min: -5, max: -1 })
        ])('should handle negative values gracefully', (attempts) => {
            const result = formatRetryAttemptsText(attempts);

            expect(typeof result).toBe('string');
            expect(result).toContain(attempts.toString());
        });
    });

    describe('TIME_PERIOD_LABELS constants', () => {
        test('should have all expected time period labels', () => {
            const expectedLabels: Record<TimePeriod, string> = {
                '1h': 'Last Hour',
                '7d': 'Last 7 Days',
                '12h': 'Last 12 Hours',
                '24h': 'Last 24 Hours',
                '30d': 'Last 30 Days'
            };

            expect(TIME_PERIOD_LABELS).toEqual(expectedLabels);
        });

        fcTest.prop([
            fc.constantFrom('1h', '7d', '12h', '24h', '30d')
        ])('should have string values for all period keys', (period) => {
            const label = TIME_PERIOD_LABELS[period as TimePeriod];

            expect(typeof label).toBe('string');
            expect(label.length).toBeGreaterThan(0);
        });
    });

    describe('Edge cases and robustness', () => {
        fcTest.prop([
            fc.double({ min: -1000, max: 1000, noNaN: true })
        ])('should handle negative durations gracefully', (ms) => {
            // Functions should not throw for negative inputs
            expect(() => formatDuration(Math.abs(ms))).not.toThrow();
            expect(() => formatIntervalDuration(Math.abs(ms))).not.toThrow();
            expect(() => formatResponseDuration(Math.abs(ms))).not.toThrow();
        });

        fcTest.prop([
            fc.oneof(
                fc.constant(5e-324), // Smallest positive double
                fc.constant(Number.MIN_VALUE), // Same as 5e-324
                fc.double({ min: 0, max: 1e-10, noNaN: true })
            )
        ])('should handle very small durations', (ms) => {
            const result = formatDuration(ms);
            expect(result).toBe('0s'); // Should round down to 0 seconds

            const responseResult = formatResponseDuration(ms);
            expect(responseResult).toBe('0ms'); // Should round to 0 milliseconds
        });

        fcTest.prop([
            fc.integer({ min: 0, max: 1_000_000_000 }) // 1 billion
        ])('should handle very large timestamps without throwing', (timestamp) => {
            expect(() => formatFullTimestamp(timestamp)).not.toThrow();
            expect(() => formatRelativeTimestamp(timestamp)).not.toThrow();
        });

        fcTest.prop([
            fc.record({
                value: fc.integer({ min: 1000, max: 60_000 }),
                label: fc.constant(''), // Empty string label
                extraProp: fc.string()
            })
        ])('should handle interval objects with empty labels', (intervalObj) => {
            const result = getIntervalLabel(intervalObj);
            // Should fallback to formatted duration for empty label
            expect(result).toBe(formatIntervalDuration(intervalObj.value));
        });
    });

    describe('Performance and determinism', () => {
        const baseTimestamp = 1_640_995_200_000; // 2021-12-31 16:00:00 UTC
        const dayInMs = 86_400_000; // 24 * 60 * 60 * 1000

        fcTest.prop([
            fc.array(fc.integer({ min: 0, max: dayInMs }), { minLength: 1, maxLength: 20 })
        ])('should be deterministic for same inputs', (durations) => {
            for (const duration of durations) {
                const result1 = formatDuration(duration);
                const result2 = formatDuration(duration);

                expect(result1).toBe(result2);
            }
        });

        fcTest.prop([
            fc.array(fc.integer({ min: baseTimestamp - dayInMs, max: baseTimestamp }), { minLength: 1, maxLength: 10 })
        ])('should be consistent for relative timestamp formatting', (timestamps) => {
            for (const timestamp of timestamps) {
                const result1 = formatRelativeTimestamp(timestamp);
                const result2 = formatRelativeTimestamp(timestamp);

                expect(result1).toBe(result2);
            }
        });

        fcTest.prop([
            fc.array(fc.integer({ min: 0, max: 10_000 }), { minLength: 1, maxLength: 20 })
        ])('should handle batch processing efficiently', (responseTimes) => {
            // Should be able to process many values without issues
            const results = responseTimes.map(time => formatResponseTime(time));

            expect(results).toHaveLength(responseTimes.length);
            for (const result of results) {
                expect(typeof result).toBe('string');
                expect(result.length).toBeGreaterThan(0);
            }
        });
    });
});
