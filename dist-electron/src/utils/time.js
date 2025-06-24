"use strict";
// Centralized utility functions for time and formatting
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIME_PERIOD_LABELS = void 0;
exports.formatResponseTime = formatResponseTime;
exports.formatTimestamp = formatTimestamp;
exports.formatFullTimestamp = formatFullTimestamp;
exports.formatLastChecked = formatLastChecked;
exports.formatDuration = formatDuration;
/**
 * Format response time in a human-readable format
 * @param time - Response time in milliseconds
 * @returns Formatted time string (e.g., "234ms" or "1.23s")
 */
function formatResponseTime(time) {
    if (!time && time !== 0)
        return "N/A";
    if (time < 1000)
        return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
}
/**
 * Format timestamp in a human-readable format (relative time)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted timestamp string
 */
function formatTimestamp(timestamp) {
    const ms = Date.now() - timestamp;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0)
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0)
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (seconds > 0)
        return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    return "Just now";
}
/**
 * Format timestamp as a full date/time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date/time string
 */
function formatFullTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}
/**
 * Format last checked time for site cards
 * @param lastChecked - Unix timestamp in milliseconds, Date object, or undefined
 * @returns Formatted relative time string
 */
function formatLastChecked(lastChecked) {
    if (!lastChecked)
        return "Never";
    // Handle both timestamp numbers and Date objects
    let timestamp;
    if (lastChecked instanceof Date) {
        timestamp = lastChecked.getTime();
    }
    else if (typeof lastChecked === "number") {
        timestamp = lastChecked;
    }
    else {
        return "Never";
    }
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins === 0)
        return "Just now";
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffMins < 1440)
        return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
}
/**
 * Format duration in a human-readable format
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 15m", "45s")
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
/**
 * Format time periods for display
 */
exports.TIME_PERIOD_LABELS = {
    "1h": "Last Hour",
    "24h": "Last 24 Hours",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
};
