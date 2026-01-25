import * as path from "node:path";

/**
 * Normalize a path string for consistent comparisons across platforms.
 *
 * @remarks
 * - Converts to absolute paths before comparison
 * - Normalizes path separators
 * - On Windows, comparisons are case-insensitive
 */
export function normalizePathForComparison(value: string): string {
    const normalized = path.resolve(value);
    return process.platform === "win32"
        ? normalized.toLowerCase()
        : normalized;
}

/**
 * Checks if a path is within a directory (inclusive) after normalization.
 */
export function isPathWithinDirectory(
    value: string,
    directory: string
): boolean {
    const normalizedValue = normalizePathForComparison(value);
    const normalizedDirectory = normalizePathForComparison(directory);

    if (normalizedValue === normalizedDirectory) {
        return true;
    }

    const directoryPrefix = normalizedDirectory.endsWith(path.sep)
        ? normalizedDirectory
        : `${normalizedDirectory}${path.sep}`;

    return normalizedValue.startsWith(directoryPrefix);
}

/**
 * Resolve the production distribution directory used for file:// navigation.
 */
export function getProductionDistDirectory(currentDirectory: string): string {
    return path.resolve(path.join(currentDirectory, "../dist"));
}
