/**
 * Status utility functions for consistent status handling across components.
 *
 * @remarks
 * Provides emoji icons and formatting for different status types. This utility
 * module centralizes status formatting logic to ensure consistent display of
 * monitor and site statuses throughout the application interface. All status
 * values are expected to be lowercase single-word strings.
 */

import type { CamelCase } from "type-fest";
/**
 * Get the emoji icon for a given status. Provides visual indicators for
 * different monitoring states.
 *
 * @remarks
 * Status comparison is case-insensitive. Supports standard monitoring states:
 * down, mixed, paused, pending, unknown, up. Unknown statuses return a neutral
 * icon.
 *
 * @param status - The status string to get an icon for
 *
 * @returns Emoji string representing the status (defaults to "⚪" for unknown
 *   statuses)
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
 * Format status with emoji icon and properly capitalized text. Combines status
 * icon with formatted text for display.
 *
 * @remarks
 * Uses simple capitalization logic suitable for single-word status values. For
 * multi-word statuses, consider using a more sophisticated formatting
 * function.
 *
 * @param status - The status string to format (expected to be lowercase)
 *
 * @returns Formatted string with emoji and capitalized text (e.g., "✅ Up")
 */
export function formatStatusWithIcon(status: string): string {
    const icon = getStatusIcon(status);
    const text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return `${icon} ${text}`;
}

/**
 * Type-safe status identifier generator using CamelCase transformation.
 *
 * @remarks
 * Uses type-fest's CamelCase utility to generate type-safe identifiers from
 * status strings. This demonstrates the practical usage of type-fest string
 * transformation utilities for API design and identifier generation.
 *
 * @example Type-safe status identifiers:
 *
 * ```typescript
 * const statusId = createStatusIdentifier("service down");
 * // Result: "serviceDown" with type CamelCase<"service down">
 *
 * const compositeId = createStatusIdentifier("monitor status check");
 * // Result: "monitorStatusCheck" with proper type inference
 * ```
 *
 * @param statusText - Status text to convert to camelCase identifier
 *
 * @returns CamelCase identifier with proper type inference
 *
 * @public
 */
export function createStatusIdentifier<T extends string>(
    statusText: T
): CamelCase<T> {
    // Simple camelCase conversion avoiding complex regex patterns
    const words = statusText.toLowerCase().split(/[\s\-_]+/v);
    const camelCased = words
        .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("");

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type-fest CamelCase utility ensures correct transformation */
    return camelCased as CamelCase<T>;
}
