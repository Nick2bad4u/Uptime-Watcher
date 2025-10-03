/**
 * Status utility functions for consistent status handling across components.
 *
 * @remarks
 * Provides emoji icons and formatting for different status types. This utility
 * module centralizes status formatting logic to ensure consistent display of
 * monitor and site statuses throughout the application interface. All status
 * values are expected to be lowercase single-word strings.
 */

import type { IconType } from "react-icons";
import type { CamelCase } from "type-fest";

import { AppIcons } from "./icons";

/**
 * Normalized representation of a status decorated with an icon glyph.
 */
export type StatusWithIcon = `${string} ${string}`;

const STATUS_ICON_GLYPHS: Record<string, string> = {
    degraded: "⚠️",
    down: "❌",
    mixed: "🔄",
    paused: "⏸️",
    pending: "⏳",
    unknown: "❓",
    up: "✅",
};

const STATUS_ICON_COMPONENTS: Record<string, IconType> = {
    degraded: AppIcons.status.warning,
    down: AppIcons.status.downFilled,
    mixed: AppIcons.actions.refresh,
    paused: AppIcons.status.pausedFilled,
    pending: AppIcons.status.pendingFilled,
    unknown: AppIcons.ui.info,
    up: AppIcons.status.upFilled,
};
/**
 * Get the icon component for a given status. Provides visual indicators for
 * different monitoring states using the shared {@link AppIcons} catalog.
 *
 * @remarks
 * Status comparison is case-insensitive. Supports standard monitoring states:
 * down, mixed, paused, pending, unknown, up. Unknown statuses return a neutral
 * icon.
 *
 * @param status - The status string to get an icon for
 *
 * @returns Icon component representing the status (defaults to neutral info
 *   icon for unknown statuses)
 */
export function getStatusIcon(status: string): string {
    const normalizedStatus = status.toLowerCase();
    return STATUS_ICON_GLYPHS[normalizedStatus] ?? "⚪";
}

/**
 * Format status with icon metadata and properly capitalized text.
 *
 * @remarks
 * Returns an object containing the icon component associated with the status
 * and the capitalized label for display. For multi-word statuses, consider
 * using a more sophisticated formatting function for label generation.
 *
 * @param status - The status string to format (expected to be lowercase)
 *
 * @returns Object containing icon component and formatted label
 */
export function formatStatusLabel(status: string): string {
    if (status.length === 0) {
        return "";
    }

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function formatStatusWithIcon(status: string): StatusWithIcon {
    const icon = getStatusIcon(status);
    const label = formatStatusLabel(status);
    return `${icon} ${label}`;
}

export function getStatusIconComponent(status: string): IconType {
    const normalizedStatus = status.toLowerCase();
    return STATUS_ICON_COMPONENTS[normalizedStatus] ?? AppIcons.ui.info;
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
