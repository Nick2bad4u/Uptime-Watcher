/**
 * Value normalization helpers for AddSiteForm.
 *
 * @remarks
 * These utilities centralize trimming and numeric parsing rules used by the
 * AddSiteForm submission pipeline. Keeping them in one module reduces
 * duplication across monitor builders and logging/validation helpers.
 */

import { isSafeInteger } from "ts-extras";

const DECIMAL_NUMBER_PATTERN = /^[+-]?(?:\d+|\d+\.\d*|\.\d+)$/u;

/**
 * Parses a possibly-empty string as an integer.
 */
export function parseOptionalInteger(value?: string): number | undefined {
    const trimmedValue = safeTrim(value);
    if (trimmedValue.length === 0) {
        return undefined;
    }

    if (!/^\d+$/u.test(trimmedValue)) {
        return undefined;
    }

    const parsed = Number.parseInt(trimmedValue, 10);
    return isSafeInteger(parsed) ? parsed : undefined;
}

/**
 * Parses a possibly-empty string as a finite decimal number.
 *
 * @remarks
 * This intentionally rejects JavaScript-specific numeric notation such as
 * `0x10`, `1e3`, and `Infinity`; form inputs should accept only values users
 * would reasonably type as plain decimal numbers.
 */
export function parseOptionalDecimalNumber(value?: string): number | undefined {
    const trimmedValue = safeTrim(value);
    if (trimmedValue.length === 0) {
        return undefined;
    }

    if (!DECIMAL_NUMBER_PATTERN.test(trimmedValue)) {
        return undefined;
    }

    const parsed = Number(trimmedValue);
    return Number.isFinite(parsed) ? parsed : undefined;
}

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
