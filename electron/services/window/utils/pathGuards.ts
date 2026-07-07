import * as path from "node:path";

interface PathComparisonModule {
    readonly isAbsolute: (value: string) => boolean;
    readonly relative: (from: string, to: string) => string;
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
    const relativeValue = pathModule.relative(
        normalizedDirectory,
        normalizedValue
    );

    return (
        relativeValue === "" ||
        (relativeValue !== ".." &&
            !relativeValue.startsWith(`..${pathModule.sep}`) &&
            !pathModule.isAbsolute(relativeValue))
    );
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
function normalizePathForComparison(
    value: string,
    platform: NodeJS.Platform = process.platform
): string {
    const normalized = getPathModule(platform).resolve(value);
    return platform === "win32" ? normalized.toLowerCase() : normalized;
}
