/**
 * Status utility functions for consistent status handling across components.
 *
 * @remarks
 * Provides emoji icons and formatting for different status types. This utility
 * module centralizes status formatting logic to ensure consistent display of
 * monitor and site statuses throughout the application interface. All status
 * values are expected to be lowercase single-word strings.
 *
 * @public
 */

import type { SiteStatus } from "@shared/types";
import type { IconType } from "react-icons";
import type { CamelCase, Tagged } from "type-fest";

import { isSiteStatus, STATUS_KIND } from "@shared/types";

import { AppIcons } from "./icons";

/**
 * Normalized representation of a status decorated with an icon glyph.
 *
 * @public
 */
export type StatusWithIcon = `${string} ${string}`;

/**
 * Strongly typed identifier derived from a status label.
 *
 * @remarks
 * Uses {@link CamelCase} to transform arbitrary status strings into a
 * predictable camelCase token, then brands the resulting string so it cannot be
 * confused with plain text identifiers. This is useful when generating DOM ids
 * or analytics keys that need to reference a specific status consistently.
 */
export type StatusIdentifier<T extends string = string> = Tagged<
    CamelCase<T>,
    "status-identifier"
>;

/**
 * Union of status literals used for UI presentation.
 *
 * @remarks
 * Mirrors the shared monitor and site status enums so that icon mapping stays
 * aligned with the canonical domain contracts.
 */
type KnownStatus = SiteStatus;

const STATUS_ICON_GLYPHS: Record<KnownStatus, string> = {
    [STATUS_KIND.DEGRADED]: "⚠️",
    [STATUS_KIND.DOWN]: "❌",
    [STATUS_KIND.MIXED]: "🔄",
    [STATUS_KIND.PAUSED]: "⏸️",
    [STATUS_KIND.PENDING]: "⏳",
    [STATUS_KIND.UNKNOWN]: "❓",
    [STATUS_KIND.UP]: "✅",
};

const STATUS_ICON_COMPONENTS: Record<KnownStatus, IconType> = {
    [STATUS_KIND.DEGRADED]: AppIcons.status.warning,
    [STATUS_KIND.DOWN]: AppIcons.status.downFilled,
    [STATUS_KIND.MIXED]: AppIcons.actions.refresh,
    [STATUS_KIND.PAUSED]: AppIcons.status.pausedFilled,
    [STATUS_KIND.PENDING]: AppIcons.status.pendingFilled,
    [STATUS_KIND.UNKNOWN]: AppIcons.ui.info,
    [STATUS_KIND.UP]: AppIcons.status.upFilled,
};

const normalizeStatus = (status: string): KnownStatus | null => {
    const candidate = status.toLowerCase();

    if (isSiteStatus(candidate)) {
        return candidate;
    }

    return null;
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
 * @param status - The status string to get an icon for.
 *
 * @returns Unicode glyph representing the status or a neutral icon for unknown
 *   statuses.
 *
 * @public
 */
export function getStatusIcon(status: string): string {
    const knownStatus = normalizeStatus(status);
    const glyph =
        knownStatus === null ? undefined : STATUS_ICON_GLYPHS[knownStatus];

    return typeof glyph === "string" ? glyph : "⚪";
}

/**
 * Format status with icon metadata and properly capitalized text.
 *
 * @remarks
 * Returns an object containing the icon component associated with the status
 * and the capitalized label for display. For multi-word statuses, consider
 * using a more sophisticated formatting function for label generation.
 *
 * @param status - The status string to format (expected to be lowercase).
 *
 * @returns Status label with capitalized first letter.
 *
 * @public
 */
export function formatStatusLabel(status: string): string {
    if (status.length === 0) {
        return "";
    }

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Combine status glyph and formatted label for display.
 *
 * @param status - Status string to decorate.
 *
 * @returns Status string prefixed with its icon glyph.
 *
 * @public
 */
export function formatStatusWithIcon(status: string): StatusWithIcon {
    const icon = getStatusIcon(status);
    const label = formatStatusLabel(status);
    return `${icon} ${label}`;
}

/**
 * Resolve the React icon component corresponding to a status string.
 *
 * @param status - Status string to convert to an icon component.
 *
 * @returns Icon component associated with the status or a neutral info icon.
 *
 * @public
 */
export function getStatusIconComponent(status: string): IconType {
    const knownStatus = normalizeStatus(status);
    const icon =
        knownStatus === null ? undefined : STATUS_ICON_COMPONENTS[knownStatus];

    return icon ?? AppIcons.ui.info;
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
): StatusIdentifier<T> {
    // Simple camelCase conversion avoiding complex regex patterns
    const words = statusText.toLowerCase().split(/[\s_\-]+/);
    const camelCased = words
        .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type-fest CamelCase utility ensures correct transformation */
    return camelCased as StatusIdentifier<T>;
}
