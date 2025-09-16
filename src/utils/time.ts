/**
 * Centralized utility functions for time and formatting.
 *
 * @remarks
 * Provides consistent time formatting throughout the application with support
 * for various time scales: milliseconds for precise measurements,
 * seconds/minutes/hours for human-readable durations, and relative timestamps
 * for recent events.
 *
 * All functions handle edge cases gracefully and provide fallback values for
 * invalid inputs. Time formatting is optimized for readability in monitoring
 * contexts.
 *
 * @packageDocumentation
 */

import type { CHART_TIME_PERIODS } from "../constants";

import { UiDefaults } from "./fallbacks";

/**
 * Type for time period keys used in chart configurations.
 */
export type TimePeriod = keyof typeof CHART_TIME_PERIODS;

/**
 * Formats duration in a human-readable format with appropriate time units.
 *
 * @remarks
 * Automatically selects the most appropriate time units for readability. Shows
 * hours and minutes for longer durations, minutes and seconds for medium
 * durations, and seconds only for short durations.
 *
 * @example
 *
 * ```typescript
 * formatDuration(7200000); // "2h 0m"
 * formatDuration(135000); // "2m 15s"
 * formatDuration(45000); // "45s"
 * ```
 *
 * @param ms - Duration in milliseconds
 *
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * Formats timestamp as a full localized date/time string.
 *
 * @remarks
 * Uses the user's locale settings to format the timestamp according to their
 * regional preferences. Suitable for displaying detailed timestamp information
 * in logs or detailed views.
 *
 * @example
 *
 * ```typescript
 * formatFullTimestamp(1640995200000); // "12/31/2021, 4:00:00 PM" (US locale)
 * ```
 *
 * @param timestamp - Unix timestamp in milliseconds
 *
 * @returns Localized date/time string
 */
export function formatFullTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

/**
 * Formats time duration for monitoring intervals in a concise format.
 *
 * @remarks
 * Used for displaying check intervals in monitoring contexts where space is
 * limited. Automatically selects the most appropriate unit (seconds, minutes,
 * or hours) and rounds to whole numbers for simplicity.
 *
 * @example
 *
 * ```typescript
 * formatIntervalDuration(30000); // "30s"
 * formatIntervalDuration(300000); // "5m"
 * formatIntervalDuration(3600000); // "1h"
 * ```
 *
 * @param milliseconds - Time duration in milliseconds
 *
 * @returns Concise formatted time string
 */
export function formatIntervalDuration(milliseconds: number): string {
    if (milliseconds < 60_000) {
        return `${Math.round(milliseconds / 1000)}s`;
    }
    if (milliseconds < 3_600_000) {
        return `${Math.round(milliseconds / 60_000)}m`;
    }
    return `${Math.round(milliseconds / 3_600_000)}h`;
}

/**
 * Formats timestamp in a human-readable relative format.
 *
 * @remarks
 * Shows how long ago the timestamp occurred relative to the current time.
 * Provides appropriate granularity based on the time difference: days for old
 * events, hours and minutes for recent events, and "Just now" for very recent
 * events.
 *
 * @example
 *
 * ```typescript
 * formatRelativeTimestamp(Date.now() - 120000); // "2 minutes ago"
 * formatRelativeTimestamp(Date.now() - 86400000); // "1 day ago"
 * formatRelativeTimestamp(Date.now() - 10000); // "Just now"
 * ```
 *
 * @param timestamp - Unix timestamp in milliseconds
 *
 * @returns Relative time description
 */
export function formatRelativeTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }
    if (hours > 0) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }
    if (seconds > 30) {
        return `${seconds} seconds ago`;
    }
    return "Just now";
}

/**
 * Format time duration with milliseconds for response times (detailed format).
 * Used for displaying response times and performance metrics.
 *
 * @param milliseconds - Time duration in milliseconds
 *
 * @returns Formatted time string (e.g., "123ms", "30s", "5m", "1h")
 */
export function formatResponseDuration(milliseconds: number): string {
    // Handle extremely small values (effectively zero) by rounding to 0
    // Only round to 0 for values smaller than or equal to 1e-10 to avoid scientific notation
    if (milliseconds <= 1e-10 && milliseconds > 0) {
        return "0ms";
    }
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    }
    if (milliseconds < 60_000) {
        return `${Math.round(milliseconds / 1000)}s`;
    }
    if (milliseconds < 3_600_000) {
        return `${Math.round(milliseconds / 60_000)}m`;
    }
    return `${Math.round(milliseconds / 3_600_000)}h`;
}

/**
 * Formats response time in a human-readable format with automatic unit
 * selection.
 *
 * @remarks
 * Automatically chooses between milliseconds and seconds based on the magnitude
 * of the response time. Provides a fallback message for undefined or null
 * values. Optimized for displaying network response times in monitoring
 * interfaces.
 *
 * @example
 *
 * ```typescript
 * formatResponseTime(234); // "234ms"
 * formatResponseTime(1230); // "1.23s"
 * formatResponseTime(0); // "0ms"
 * formatResponseTime(null); // "N/A" (or configured fallback)
 * ```
 *
 * @param time - Response time in milliseconds (optional)
 *
 * @returns Formatted time string or fallback message
 */
export function formatResponseTime(time?: number): string {
    if (!time && time !== 0) {
        return UiDefaults.notAvailableLabel;
    }
    if (time < 1000) {
        return `${time}ms`;
    }
    return `${(time / 1000).toFixed(2)}s`;
}

/**
 * Get display label for interval value. Handles both numeric intervals and
 * interval objects with custom labels.
 *
 * @param interval - Interval configuration (number or object with value/label)
 *
 * @returns Human readable label for the interval
 */
export function getIntervalLabel(
    interval: number | { label?: string; value: number }
): string {
    if (typeof interval === "number") {
        return formatIntervalDuration(interval);
    }

    if (interval.label) {
        return interval.label;
    }

    return formatIntervalDuration(interval.value);
}

/**
 * Format time periods for display Maps time period keys to human-readable
 * labels.
 *
 * @public
 */
export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
    "1h": "Last Hour",
    "7d": "Last 7 Days",
    "12h": "Last 12 Hours",

    "24h": "Last 24 Hours",
    "30d": "Last 30 Days",
} as const;

/**
 * Format retry attempts with descriptive text.
 *
 * @remarks
 * Handles edge cases: 0 attempts means no retries (immediate failure), negative
 * values are not expected but will be formatted as-is. The function provides
 * user-friendly text explaining the retry behavior.
 *
 * @param attempts - Number of retry attempts (expected range: 0-10)
 *
 * @returns Descriptive text explaining retry behavior
 */
export function formatRetryAttemptsText(attempts: number): string {
    if (attempts === 0) {
        return "(Retry disabled - immediate failure detection)";
    }

    const timesText = attempts === 1 ? "time" : "times";
    return `(Retry ${attempts} ${timesText} before marking down)`;
}
