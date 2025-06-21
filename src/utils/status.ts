/**
 * Status utility functions for consistent status handling across components
 */

export type StatusType = "up" | "down" | "pending" | "unknown";

/**
 * Get the emoji icon for a given status
 */
export function getStatusIcon(status: string): string {
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
export function formatStatusWithIcon(status: string): string {
    const icon = getStatusIcon(status);
    const text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return `${icon} ${text}`;
}
