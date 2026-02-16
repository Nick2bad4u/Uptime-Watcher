/**
 * @file Shared internal path utilities for uptime-watcher-type-utils ESLint
 *   rules.
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

/**
 * Converts an absolute/unknown file path to a repo-relative path when possible.
 *
 * @param {string} filePath - Candidate file path to relativize.
 *
 * @returns {string} Repo-relative path when the repository marker is present;
 * otherwise the normalized input path.
 */
export function toRepoRelativePath(filePath) {
    const normalizedPath = normalizePath(filePath);
    const repoMarker = "/uptime-watcher/";
    const markerIndex = normalizedPath.toLowerCase().indexOf(repoMarker);

    if (markerIndex === -1) {
        return normalizedPath;
    }

    return normalizedPath.slice(markerIndex + repoMarker.length);
}
