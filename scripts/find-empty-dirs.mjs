#!/usr/bin/env node

/**
 * Finds all empty directories recursively under specified folders. Optionally
 * deletes them when the --delete flag is provided.
 *
 * @remarks
 * Run this script from the project root. Requires Node.js.
 *
 * @example
 *
 * ```bash
 * # Find empty directories in default folders (electron, src, shared)
 * node scripts/find-empty-dirs.mjs
 *
 * # Find and delete empty directories
 * node scripts/find-empty-dirs.mjs --delete
 * node scripts/find-empty-dirs.mjs -d
 *
 * # Specify custom directories to check
 * node scripts/find-empty-dirs.mjs --dirs "src,dist,build"
 * node scripts/find-empty-dirs.mjs --dirs="electron" --dirs="custom-folder"
 *
 * # Exclude specific directories from search
 * node scripts/find-empty-dirs.mjs --exclude "node_modules,.git,dist"
 *
 * # Quiet mode (only show summary)
 * node scripts/find-empty-dirs.mjs --quiet
 *
 * # Verbose mode (show detailed information)
 * node scripts/find-empty-dirs.mjs --verbose
 *
 * # JSON output format
 * node scripts/find-empty-dirs.mjs --format json
 * ```
 *
 * @throws This script may fail due to:
 *
 *   - Permission errors when accessing certain directories or files.
 *   - Missing target directories in the project root.
 *   - Filesystem access issues such as EACCES, ENOENT, or other I/O errors.
 *   - Permission errors when attempting to delete directories (with --delete flag).
 */

import * as path from "node:path";
import { stat, readdir, rmdir } from "node:fs/promises";

/**
 * The absolute path to the project root directory where the script is executed.
 */
const ROOT_DIR = process.cwd();
const DEFAULT_TARGET_DIRS = [
    "electron",
    "src",
    "shared",
];

// Parse command line arguments
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = await yargs(hideBin(process.argv))
    .option("delete", {
        alias: "d",
        type: "boolean",
        description: "Delete empty directories",
        default: false,
    })
    .option("dirs", {
        type: "array",
        description:
            "Directories to search (comma-separated or multiple --dirs flags)",
        default: DEFAULT_TARGET_DIRS,
        coerce: (dirs) => {
            // Handle comma-separated values and flatten arrays
            const flattened = dirs.flatMap((/** @type {string} */ dir) =>
                typeof dir === "string"
                    ? dir.split(",").map((d) => d.trim())
                    : dir
            );
            return flattened.filter(
                (/** @type {string | any[]} */ d) => d.length > 0
            );
        },
    })
    .option("exclude", {
        alias: "x",
        type: "array",
        description:
            "Directories to exclude from search (comma-separated or multiple --exclude flags)",
        default: [
            ".git",
            "node_modules",
            ".vscode",
        ],
        coerce: (excludes) => {
            const flattened = excludes.flatMap(
                (/** @type {string} */ exclude) =>
                    typeof exclude === "string"
                        ? exclude.split(",").map((e) => e.trim())
                        : exclude
            );
            return flattened.filter(
                (/** @type {string | any[]} */ e) => e.length > 0
            );
        },
    })
    .option("quiet", {
        alias: "q",
        type: "boolean",
        description: "Quiet mode - only show summary",
        default: false,
    })
    .option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Verbose mode - show detailed information",
        default: false,
    })
    .option("format", {
        alias: "f",
        type: "string",
        choices: ["text", "json"],
        description: "Output format",
        default: "text",
    })
    .option("check-only", {
        type: "boolean",
        description:
            "Only check if directories exist without searching for empty ones",
        default: false,
    })
    .help().argv;

const shouldDelete = argv.delete;
const targetDirs = argv.dirs;
const excludeDirs = new Set(argv.exclude);
const isQuiet = argv.quiet;
const isVerbose = argv.verbose;
const outputFormat = argv.format;
const checkOnly = argv["check-only"];

// Validate conflicting options
if (isQuiet && isVerbose) {
    console.error("❌ Cannot use both --quiet and --verbose flags together");
    process.exit(1);
}

if (shouldDelete && outputFormat === "json") {
    console.error("❌ JSON output format is not compatible with delete mode");
    process.exit(1);
}

if (!isQuiet && outputFormat === "text") {
    if (shouldDelete) {
        console.log(
            "🗑️  Delete mode enabled - empty directories will be removed"
        );
    } else {
        console.log(
            "🔍 Find mode - empty directories will be listed (use --delete or -d to remove them)"
        );
    }

    if (isVerbose) {
        console.log(`📁 Target directories: ${targetDirs.join(", ")}`);
        console.log(
            `🚫 Excluded directories: ${Array.from(excludeDirs).join(", ")}`
        );
    }
}

// Validate that ROOT_DIR contains all TARGET_DIRS before proceeding
/** @type {string[]} */
const validTargetDirs = [];
for (const dir of targetDirs) {
    const absPath = path.join(ROOT_DIR, dir);
    try {
        const stats = await stat(absPath);
        if (!stats.isDirectory()) {
            if (!isQuiet) {
                console.warn(
                    `⚠️  Expected directory '${dir}' is not a directory in ${ROOT_DIR}`
                );
            }
            continue;
        }
        validTargetDirs.push(dir);
        if (isVerbose) {
            console.log(`✅ Found target directory: ${dir}`);
        }
    } catch (error) {
        if (!isQuiet) {
            console.warn(
                `⚠️  Expected directory '${dir}' not found in ${ROOT_DIR}`
            );
        }
        if (isVerbose) {
            console.log(
                `   Error: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

if (validTargetDirs.length === 0) {
    console.error("❌ No valid target directories found");
    process.exit(1);
}

if (checkOnly) {
    if (outputFormat === "json") {
        console.log(
            JSON.stringify(
                {
                    found: validTargetDirs,
                    missing: targetDirs.filter(
                        (/** @type {any} */ d) => !validTargetDirs.includes(d)
                    ),
                    total: targetDirs.length,
                    valid: validTargetDirs.length,
                },
                null,
                2
            )
        );
    } else {
        console.log(`📊 Directory Check Summary:`);
        console.log(`   Total specified: ${targetDirs.length}`);
        console.log(`   Found: ${validTargetDirs.length}`);
        console.log(
            `   Missing: ${targetDirs.length - validTargetDirs.length}`
        );
    }
    process.exit(0);
}

/**
 * Helper to check if a directory should be excluded from search.
 *
 * @param {string} dirName - Directory name to check
 *
 * @returns {boolean} - True if directory should be excluded
 */
function shouldExcludeDir(dirName) {
    return excludeDirs.has(dirName);
}

/**
 * Helper to check if a path is a directory, with error handling.
 *
 * @param {string} path
 *
 * @returns {Promise<boolean>}
 */
async function isDirectory(path) {
    try {
        const stats = await stat(path);
        return stats.isDirectory();
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "EACCES"
        ) {
            console.warn(`Permission denied: ${path}`);
        } else {
            console.warn(
                `Error accessing ${path}:`,
                error instanceof Error ? error.message : String(error)
            );
        }
        return false;
    }
}

/**
 * Helper to get directory entries, with error handling. Returns an empty array
 * if the directory cannot be read due to an error.
 *
 * @param {string} dir
 *
 * @returns {Promise<string[]>}
 */
async function safeReadDir(dir) {
    try {
        return await readdir(dir);
    } catch (error) {
        console.warn(
            `Error reading directory ${dir}:`,
            error instanceof Error ? error.message : String(error)
        );
        return [];
    }
}

/**
 * Recursively finds all empty directories under a given directory.
 *
 * If the input path is not a directory or cannot be accessed, returns an empty
 * array. Handles permission errors and inaccessible directories gracefully by
 * skipping them. Respects exclusion patterns for directory names.
 *
 * @param {string} dir - Directory to search
 *
 * @returns {Promise<string[]>} - Array of empty directory paths, each relative
 *   to ROOT_DIR.
 */
async function findEmptyDirs(dir) {
    if (!(await isDirectory(dir))) return [];

    const entries = await safeReadDir(dir);
    if (entries.length === 0) {
        return [path.relative(ROOT_DIR, dir)];
    }

    let emptyDirs = [];

    // Filter out excluded directories
    const filteredEntries = entries.filter((entry) => !shouldExcludeDir(entry));

    if (isVerbose && entries.length !== filteredEntries.length) {
        const excluded = entries.filter((entry) => shouldExcludeDir(entry));
        console.log(
            `   Excluded from ${path.relative(ROOT_DIR, dir)}: ${excluded.join(", ")}`
        );
    }

    // Prepare promises for all non-excluded entries
    const results = await Promise.all(
        filteredEntries.map(async (entry) => {
            const fullPath = path.join(dir, entry);
            if (await isDirectory(fullPath)) {
                return await findEmptyDirs(fullPath);
            }
            return null; // Mark as non-empty
        })
    );

    // Flatten results and determine if all entries are empty directories
    emptyDirs = results.filter((r) => Array.isArray(r)).flat();

    // Only mark as empty if all entries are directories and those directories are empty
    const allEntriesAreDirs = results.every((r) => r !== null);
    const allDirsEmpty =
        allEntriesAreDirs &&
        results.every((r) => Array.isArray(r) && r.length > 0);

    if (filteredEntries.length > 0 && allDirsEmpty) {
        emptyDirs.push(path.relative(ROOT_DIR, dir));
    }
    return emptyDirs;
}

/**
 * Safely deletes an empty directory with error handling. Only deletes
 * directories that are empty; does not handle non-empty directories.
 *
 * @param {string} dirPath - Absolute path to the directory to delete
 *
 * @returns {Promise<boolean>} - True if successfully deleted, false otherwise
 */
async function safeDeleteDir(dirPath) {
    try {
        // Double-check that the directory is actually empty before deletion
        const entries = await safeReadDir(dirPath);
        if (entries.length > 0) {
            console.error(
                `❌ Cannot delete ${path.relative(ROOT_DIR, dirPath)}: Directory is not empty`
            );
            return false;
        }

        // Use rmdir for empty directories instead of rm
        await rmdir(dirPath);
        console.log(`✅ Deleted: ${path.relative(ROOT_DIR, dirPath)}`);
        return true;
    } catch (error) {
        console.error(
            `❌ Failed to delete ${path.relative(ROOT_DIR, dirPath)}:`,
            error instanceof Error ? error.message : String(error)
        );
        return false;
    }
}

async function main() {
    let totalFound = 0;
    let totalDeleted = 0;
    const results = {};

    for (const target of validTargetDirs) {
        const absTarget = path.join(ROOT_DIR, target);
        try {
            const targetStat = await stat(absTarget);
            if (!targetStat.isDirectory()) continue;
        } catch {
            continue;
        }

        if (isVerbose) {
            console.log(`\n🔍 Searching in: ${target}`);
        }

        const emptyDirs = await findEmptyDirs(absTarget);
        /** @type {any} */ (results)[target] = emptyDirs;

        if (emptyDirs.length > 0) {
            if (!isQuiet && outputFormat === "text") {
                console.log(`\nEmpty directories under '${target}':`);
            }
            totalFound += emptyDirs.length;

            if (shouldDelete) {
                // Sort by depth (deepest first) to ensure we delete child directories before parents
                const sortedDirs = emptyDirs
                    .map((dir) => ({
                        path: dir,
                        depth: dir.split(/[/\\]/).length,
                    }))
                    .toSorted((a, b) => b.depth - a.depth)
                    .map((item) => item.path);

                for (const d of sortedDirs) {
                    if (!isQuiet) {
                        console.log(`🗂️  ${d}`);
                    }
                    const absPath = path.join(ROOT_DIR, d);
                    if (await safeDeleteDir(absPath)) {
                        totalDeleted++;
                    }
                }
            } else if (!isQuiet && outputFormat === "text") {
                for (const d of emptyDirs) {
                    console.log(`🗂️  ${d}`);
                }
            }
        } else if (!isQuiet && outputFormat === "text") {
            console.log(`No empty directories found under '${target}'.`);
        }
    }

    // Output results
    if (outputFormat === "json") {
        const jsonOutput = {
            summary: {
                totalFound,
                totalDeleted: shouldDelete ? totalDeleted : undefined,
                totalFailed: shouldDelete
                    ? totalFound - totalDeleted
                    : undefined,
            },
            results,
            options: {
                delete: shouldDelete,
                targetDirs: validTargetDirs,
                excludeDirs: Array.from(excludeDirs),
            },
        };
        console.log(JSON.stringify(jsonOutput, null, 2));
    } else {
        // Summary
        console.log(`\n📊 Summary:`);
        console.log(`   Found: ${totalFound} empty directories`);
        if (shouldDelete) {
            console.log(`   Deleted: ${totalDeleted} directories`);
            if (totalDeleted < totalFound) {
                console.log(
                    `   Failed: ${totalFound - totalDeleted} directories (see errors above)`
                );
            }
        }

        if (isVerbose) {
            console.log(
                `   Searched directories: ${validTargetDirs.join(", ")}`
            );
            console.log(
                `   Excluded patterns: ${Array.from(excludeDirs).join(", ")}`
            );
        }
    }
}

// Use top-level await instead of promise chain
try {
    await main();
} catch (error) {
    console.error(
        "An error occurred while running the find-empty-dirs script:",
        error
    );
    if (error && error instanceof Error && error.stack) {
        console.error("Stack trace:", error.stack);
    }
    process.exit(1);
}
