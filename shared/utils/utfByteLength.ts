/**
 * UTF byte-length helper.
 *
 * @remarks
 * Used across multiple trust boundaries to enforce payload size budgets.
 * Keeping this in one place prevents subtle inconsistencies.
 */

/**
 * Returns the UTF-8 encoded byte length of a string.
 */
const textEncoder = typeof TextEncoder === "undefined" ? null : new TextEncoder();

/**
 * Returns the UTF-8 encoded byte length of a string.
 */
export function getUtfByteLength(value: string): number {
    // IMPORTANT: The fallback branch mirrors the existing diagnosticsLimits
    // behavior, keeping this helper robust in environments that may not
    // provide TextEncoder (primarily older runtimes).
    return textEncoder ? textEncoder.encode(value).length : value.length * 2;
}
