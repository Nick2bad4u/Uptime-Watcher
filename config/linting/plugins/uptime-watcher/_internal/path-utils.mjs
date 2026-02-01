/**
 * @file Shared internal path utilities for uptime-watcher ESLint rules.
 */

/**
 * Normalizes a file path to POSIX separators for uniform rule matching.
 *
 * @param {string} filename - File path to normalize.
 *
 * @returns {string} Normalized POSIX-style path.
 */
export function normalizePath(filename) {
    return filename.replace(/\\/gu, "/");
}
