/**
 * Shared utilities for form field components.
 * Provides helper functions for accessibility and validation.
 *
 * @remarks
 * These utilities ensure consistent accessibility patterns across all form
 * components.
 */

/** Suffix for required field accessibility labels */
export const REQUIRED_SUFFIX = " (required)";

/**
 * Creates an accessible aria-label string, appending a required indicator if
 * needed.
 *
 * @param label - The base label text for the field.
 * @param required - Whether the field is required.
 * @returns The formatted aria-label string.
 *
 * @example
 * ```ts
 * createAriaLabel("Site Name", true); // "Site Name (required)"
 * ```
 */
export const createAriaLabel = (label: string, required: boolean): string =>
    `${label}${required ? REQUIRED_SUFFIX : ""}`;

/**
 * Determines the appropriate aria-describedby value for a form field.
 *
 * @param id - The unique field ID.
 * @param error - Error message, if present.
 * @param helpText - Help text, if present.
 * @returns The aria-describedby value or undefined if neither error nor helpText is present.
 *
 * @remarks
 * If both error and helpText are present, error takes precedence for
 * accessibility.
 */
export const getAriaDescribedBy = (
    id: string,
    error?: string,
    helpText?: string
): string | undefined => {
    if (error) {
        return `${id}-error`;
    }
    if (helpText) {
        return `${id}-help`;
    }
    return undefined;
};
