"use strict";
// Centralized utility functions for time and formatting
exports.__esModule = true;
exports.TIME_PERIOD_LABELS = exports.formatDuration = exports.formatLastChecked = exports.formatFullTimestamp = exports.formatTimestamp = exports.formatResponseTime = void 0;
/**
 * Format response time in a human-readable format
 * @param time - Response time in milliseconds
 * @returns Formatted time string (e.g., "234ms" or "1.23s")
 */
function formatResponseTime(time) {
    if (!time && time !== 0)
        return "N/A";
    if (time < 1000)
        return time + "ms";
    return (time / 1000).toFixed(2) + "s";
}
exports.formatResponseTime = formatResponseTime;
/**
 * Format timestamp in a human-readable format (relative time)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted timestamp string
 */
function formatTimestamp(timestamp) {
    var ms = Date.now() - timestamp;
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    if (days > 0)
        return days + " day" + (days > 1 ? "s" : "") + " ago";
    if (hours > 0)
        return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
    if (minutes > 0)
        return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
    if (seconds > 0)
        return seconds + " second" + (seconds > 1 ? "s" : "") + " ago";
    return "Just now";
}
exports.formatTimestamp = formatTimestamp;
/**
 * Format timestamp as a full date/time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date/time string
 */
function formatFullTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}
exports.formatFullTimestamp = formatFullTimestamp;
/**
 * Format last checked time for site cards
 * @param lastChecked - Unix timestamp in milliseconds, Date object, or undefined
 * @returns Formatted relative time string
 */
function formatLastChecked(lastChecked) {
    if (!lastChecked)
        return "Never";
    // Handle both timestamp numbers and Date objects
    // eslint-disable-next-line functional/no-let -- timestamp is not assigned at declaration and may be assigned in multiple branches, you must use let here.
    var timestamp;
    if (lastChecked instanceof Date) {
        timestamp = lastChecked.getTime();
    }
    else if (typeof lastChecked === "number") {
        timestamp = lastChecked;
    }
    else {
        return "Never";
    }
    var diffMs = Date.now() - timestamp;
    var diffMins = Math.floor(diffMs / 60000);
    if (diffMins === 0)
        return "Just now";
    if (diffMins < 60)
        return diffMins + "m ago";
    if (diffMins < 1440)
        return Math.floor(diffMins / 60) + "h ago";
    return Math.floor(diffMins / 1440) + "d ago";
}
exports.formatLastChecked = formatLastChecked;
/**
 * Format duration in a human-readable format
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 15m", "45s")
 */
function formatDuration(ms) {
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    if (hours > 0)
        return hours + "h " + minutes % 60 + "m";
    if (minutes > 0)
        return minutes + "m " + seconds % 60 + "s";
    return seconds + "s";
}
exports.formatDuration = formatDuration;
/**
 * Format time periods for display
 */
exports.TIME_PERIOD_LABELS = {
    "1h": "Last Hour",
    "12h": "Last 12 Hours",
    "24h": "Last 24 Hours",
    // eslint-disable-next-line perfectionist/sort-objects -- keep in ascending order
    "7d": "Last 7 Days",
    "30d": "Last 30 Days"
};
