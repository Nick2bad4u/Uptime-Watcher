/**
 * Status utility functions for consistent status handling across components.
 * Provides emoji icons and formatting for different status types.
 *
 * @remarks
 * This utility module centralizes status formatting logic to ensure consistent
 * display of monitor and site statuses throughout the application interface.
 * All status values are expected to be lowercase single-word strings.
 */
/**
 * Get the emoji icon for a given status.
 * Provides visual indicators for different monitoring states.
 *
 * @param status - The status string to get an icon for
 * @returns Emoji string representing the status (defaults to "⚪" for unknown statuses)
 *
 * @remarks
 * Status comparison is case-insensitive. Supports standard monitoring states:
 * down, mixed, paused, pending, unknown, up. Unknown statuses return a neutral
 * icon.
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

/**
 * Format status with emoji icon and properly capitalized text.
 * Combines status icon with formatted text for display.
 *
 * @param status - The status string to format (expected to be lowercase)
 * @returns Formatted string with emoji and capitalized text (e.g., "✅ Up")
 *
 * @remarks
 * Uses simple capitalization logic suitable for single-word status values.
 * For multi-word statuses, consider using a more sophisticated formatting
 * function.
 */
export function formatStatusWithIcon(status: string): string {
    const icon = getStatusIcon(status);
    const text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return `${icon} ${text}`;
}
