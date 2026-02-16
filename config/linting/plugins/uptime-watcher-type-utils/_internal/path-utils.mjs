/**
 * @file Shared internal path utilities for uptime-watcher-type-utils ESLint rules.
 */

/**
 * Normalizes a file path to POSIX separators for uniform rule matching.
 *
 * @param {string} filename - File path to normalize.
 *
 * @returns {string} Normalized POSIX-style path.
 */
export function normalizePath(filename) {
    const withForwardSlashes = filename.replaceAll("\\", "/");

    // Normalize Windows drive letter casing so absolute-path prefix checks
    // (`startsWith`) behave consistently across Node APIs.
    return withForwardSlashes.replace(
        /^(?<drive>[A-Za-z]):\//v,
        (_match, drive) => `${String(drive).toLowerCase()}:/`
    );
}
