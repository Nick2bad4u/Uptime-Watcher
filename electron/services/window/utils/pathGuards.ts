import * as path from "node:path";

interface PathComparisonModule {
    readonly resolve: (value: string) => string;
    readonly sep: string;
}

function getPathModule(platform: NodeJS.Platform): PathComparisonModule {
    return platform === "win32" ? path.win32 : path.posix;
}

/**
 * Resolve the production distribution directory used for file:// navigation.
 */
export function getProductionDistDirectory(currentDirectory: string): string {
    return path.resolve(path.join(currentDirectory, "../dist"));
}

/**
 * Checks if a path is within a directory (inclusive) after normalization.
 */
export function isPathWithinDirectory(
    value: string,
    directory: string,
    platform: NodeJS.Platform = process.platform
): boolean {
    const pathModule = getPathModule(platform);
    const normalizedValue = normalizePathForComparison(value, platform);
    const normalizedDirectory = normalizePathForComparison(directory, platform);

    if (normalizedValue === normalizedDirectory) {
        return true;
    }

    const directoryPrefix = normalizedDirectory.endsWith(pathModule.sep)
        ? normalizedDirectory
        : `${normalizedDirectory}${pathModule.sep}`;

    return normalizedValue.startsWith(directoryPrefix);
}

/**
 * Normalize a path string for consistent comparisons across platforms.
 *
 * @remarks
 * -
 *
 * Converts to absolute paths before comparison
 *
 * - Normalizes path separators
 * - On Windows, comparisons are case-insensitive
 */
export function normalizePathForComparison(
    value: string,
    platform: NodeJS.Platform = process.platform
): string {
    const normalized = getPathModule(platform).resolve(value);
    return platform === "win32" ? normalized.toLowerCase() : normalized;
}
