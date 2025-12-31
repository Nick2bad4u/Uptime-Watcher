/**
 * Path separator normalization helpers.
 *
 * @remarks
 * These helpers intentionally perform _only_ separator normalization.
 *
 * - No trimming
 * - No path traversal checks
 * - No collapsing of duplicate slashes
 *
 * Callers should apply any additional validation/normalization rules that are
 * specific to their domain (cloud object keys, filesystem paths, URLs, etc.).
 *
 * @packageDocumentation
 */

/**
 * Converts Windows path separators (`\`) to POSIX separators (`/`).
 *
 * @param value - Any string that may contain Windows path separators.
 *
 * @returns The input string with all `\` replaced by `/`.
 */
export function normalizePathSeparatorsToPosix(value: string): string {
    return value.replaceAll("\\", "/");
}
