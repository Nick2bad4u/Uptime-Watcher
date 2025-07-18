/**
 * Centralized utility functions for time and formatting.
 * Provides consistent time formatting throughout the application.
 */

/**
 * Type for time period keys
 */
export type TimePeriod = keyof typeof CHART_TIME_PERIODS;

/**
 * Format duration in a human-readable format
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 15m", "45s")
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
 * Format timestamp as a full date/time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date/time string
 */
export function formatFullTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

/**
 * Format time duration for monitoring intervals (simple format).
 * Used for displaying check intervals in a concise format.
 * @param milliseconds - Time duration in milliseconds
 * @returns Formatted time string (e.g., "30s", "5m", "1h")
 */
export function formatIntervalDuration(milliseconds: number): string {
    if (milliseconds < 60_000) {
        return `${milliseconds / 1000}s`;
    }
    if (milliseconds < 3_600_000) {
        return `${milliseconds / 60_000}m`;
    }
    return `${milliseconds / 3_600_000}h`;
}

/**
 * Format timestamp in a human-readable relative format.
 * Shows how long ago the timestamp occurred.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative timestamp string (e.g., "2 minutes ago")
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
 * @param milliseconds - Time duration in milliseconds
 * @returns Formatted time string (e.g., "123ms", "30s", "5m", "1h")
 */
export function formatResponseDuration(milliseconds: number): string {
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
 * Format response time in a human-readable format.
 * Automatically chooses between milliseconds and seconds based on magnitude.
 *
 * @param time - Response time in milliseconds
 * @returns Formatted time string (e.g., "234ms" or "1.23s")
 */
export function formatResponseTime(time?: number): string {
    if (!time && time !== 0) {
        return "N/A";
    }
    if (time < 1000) {
        return `${time}ms`;
    }
    return `${(time / 1000).toFixed(2)}s`;
}

import { CHART_TIME_PERIODS } from "../constants";

/**
 * Get display label for interval value.
 * Handles both numeric intervals and interval objects with custom labels.
 * @param interval - Interval configuration (number or object with value/label)
 * @returns Human readable label for the interval
 */
export function getIntervalLabel(interval: number | { label?: string; value: number }): string {
    if (typeof interval === "number") {
        return formatIntervalDuration(interval);
    }

    if (interval.label) {
        return interval.label;
    }

    return formatIntervalDuration(interval.value);
}

/**
 * Format time periods for display
 */
export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
    "1h": "Last Hour",
    "7d": "Last 7 Days",
    "12h": "Last 12 Hours",

    "24h": "Last 24 Hours",
    "30d": "Last 30 Days",
} as const;
