/**
 * Value normalization helpers for AddSiteForm.
 *
 * @remarks
 * These utilities centralize trimming and numeric parsing rules used by the
 * AddSiteForm submission pipeline. Keeping them in one module reduces
 * duplication across monitor builders and logging/validation helpers.
 */

/**
 * Safely trims a string value.
 *
 * @returns The trimmed string, or an empty string when `value` is not a string.
 */
export function safeTrim(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Converts a possibly-empty string into an optional, trimmed string.
 */
export function toOptionalString(value?: string): string | undefined {
    const trimmedValue = safeTrim(value);
    return trimmedValue.length > 0 ? trimmedValue : undefined;
}

/**
 * Parses a possibly-empty string as an integer.
 */
export function parseOptionalInteger(value?: string): number | undefined {
    const trimmedValue = safeTrim(value);
    if (trimmedValue.length === 0) {
        return undefined;
    }

    const parsed = Number.parseInt(trimmedValue, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
}
