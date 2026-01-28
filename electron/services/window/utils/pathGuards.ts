import * as path from "node:path";

/**
 * Normalize a path string for consistent comparisons across platforms.
 *
 * @remarks
 * - Converts to absolute paths before comparison
 * - Normalizes path separators
 * - On Windows, comparisons are case-insensitive
 */
export function normalizePathForComparison(
    value: string,
    platform: NodeJS.Platform = process.platform
): string {
    const normalized = path.resolve(value);
    return platform === "win32"
        ? normalized.toLowerCase()
        : normalized;
}

/**
 * Checks if a path is within a directory (inclusive) after normalization.
 */
export function isPathWithinDirectory(
    value: string,
    directory: string,
    platform: NodeJS.Platform = process.platform
): boolean {
    const normalizedValue = normalizePathForComparison(value, platform);
    const normalizedDirectory = normalizePathForComparison(directory, platform);

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
