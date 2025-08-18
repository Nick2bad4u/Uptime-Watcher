/**
 * Shared utilities for form field components in the AddSiteForm module.
 *
 * @remarks
 * Provides helper functions for accessibility and validation patterns across
 * all form components. These utilities ensure consistent accessibility patterns
 * and reduce code duplication in form field implementations.
 *
 * Key features:
 *
 * - Accessibility label generation with required field indicators
 * - ARIA attribute management for form fields
 * - Consistent form validation patterns
 * - Helper functions for error and help text handling
 *
 * @example
 *
 * ```typescript
 * import { createAriaLabel, getAriaDescribedBy } from "./form-utils";
 *
 * // Create accessible label
 * const ariaLabel = createAriaLabel("Site Name", true); // "Site Name (required)"
 *
 * // Handle ARIA describedby for errors
 * const describedBy = getAriaDescribedBy(
 *     "field-id",
 *     errorMessage,
 *     helpText
 * );
 * ```
 *
 * @packageDocumentation
 */

/** Suffix for required field accessibility labels */
export const REQUIRED_SUFFIX = " (required)";

/**
 * Creates an accessible aria-label string, appending a required indicator if
 * needed.
 *
 * @example
 *
 * ```ts
 * createAriaLabel("Site Name", true); // "Site Name (required)"
 * ```
 *
 * @param label - The base label text for the field.
 * @param required - Whether the field is required.
 *
 * @returns The formatted aria-label string.
 */
export const createAriaLabel = (label: string, required: boolean): string =>
    `${label}${required ? REQUIRED_SUFFIX : ""}`;

/**
 * Determines the appropriate aria-describedby value for a form field.
 *
 * @remarks
 * If both error and helpText are present, error takes precedence for
 * accessibility.
 *
 * @param id - The unique field ID.
 * @param error - Error message, if present.
 * @param helpText - Help text, if present.
 *
 * @returns The aria-describedby value or undefined if neither error nor
 *   helpText is present.
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
