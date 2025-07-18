/**
 * Status utility functions for consistent status handling across components.
 * Provides emoji icons and formatting for different status types.
 */

/**
 * Format status with emoji icon and properly capitalized text.
 * Combines status icon with formatted text for display.
 *
 * @param status - The status string to format
 * @returns Formatted string with emoji and capitalized text (e.g., "✅ Up")
 */
export function formatStatusWithIcon(status: string): string {
    const icon = getStatusIcon(status);
    const text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return `${icon} ${text}`;
}

/**
 * Get the emoji icon for a given status.
 * Provides visual indicators for different monitoring states.
 *
 * @param status - The status string to get an icon for
 * @returns Emoji string representing the status
 */
export function getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
        case "down": {
            return "❌";
        }
        case "mixed": {
            return "🔄";
        }
        case "paused": {
            return "⏸️";
        }
        case "pending": {
            return "⏳";
        }
        case "unknown": {
            return "❓";
        }
        case "up": {
            return "✅";
        }
        default: {
            return "⚪";
        }
    }
}
