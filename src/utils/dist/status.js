"use strict";
/**
 * Status utility functions for consistent status handling across components
 */
exports.__esModule = true;
exports.formatStatusWithIcon = exports.getStatusIcon = void 0;
/**
 * Get the emoji icon for a given status
 */
function getStatusIcon(status) {
    switch (status.toLowerCase()) {
        case "up":
            return "✅";
        case "down":
            return "❌";
        case "pending":
            return "⏳";
        case "unknown":
            return "❓";
        default:
            return "⚪";
    }
}
exports.getStatusIcon = getStatusIcon;
/**
 * Format status with emoji and properly capitalized text
 */
function formatStatusWithIcon(status) {
    var icon = getStatusIcon(status);
    var text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return icon + " " + text;
}
exports.formatStatusWithIcon = formatStatusWithIcon;
