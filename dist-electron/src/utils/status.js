"use strict";
/**
 * Status utility functions for consistent status handling across components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusIcon = getStatusIcon;
exports.formatStatusWithIcon = formatStatusWithIcon;
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
/**
 * Format status with emoji and properly capitalized text
 */
function formatStatusWithIcon(status) {
    const icon = getStatusIcon(status);
    const text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return `${icon} ${text}`;
}
