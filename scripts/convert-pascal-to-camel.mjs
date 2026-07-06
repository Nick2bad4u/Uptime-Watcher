#!/usr/bin/env node

/**
 * Script to convert all PascalCase filenames to camelCase Recursively searches
 * through the project and renames files.
 */

import { existsSync, readdirSync, renameSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const SKIPPED_DIRECTORIES = new Set([
    ".cache",
    ".git",
    ".vs",
    ".vscode",
    "build",
    "coverage",
    "dist",
    "dist-bench",
    "dist-configs",
    "dist-playwright",
    "html",
    "node_modules",
    "playwright-report",
    "release",
    "reports",
    "storybook-static",
    "temp",
    "test-results",
]);

/**
 * Show command usage.
 */
function showHelp() {
    console.log(`
Convert PascalCase filenames to camelCase.

Usage: node scripts/convert-pascal-to-camel.mjs [options]

Options:
  --dry-run, -d  Preview renames without changing files (default)
  --write        Rename files on disk
  --help, -h     Show this help
`);
}

/**
 * Parse command-line arguments.
 *
 * @param {string[]} args - Raw command-line arguments.
 *
 * @returns {{ dryRun: boolean; help: boolean }} Parsed options.
 */
function parseArgs(args) {
    const options = {
        dryRun: true,
        help: false,
    };

    for (const arg of args) {
        switch (arg) {
            case "--dry-run":
            case "-d": {
                options.dryRun = true;
                break;
            }

            case "--write": {
                options.dryRun = false;
                break;
            }

            case "--help":
            case "-h": {
                options.help = true;
                break;
            }

            default: {
                throw new Error(`Unknown option: ${arg}`);
            }
        }
    }

    return options;
}

/**
 * Convert PascalCase string to camelCase.
 *
 * @param {string} str - The PascalCase string to convert.
 *
 * @returns {string} - The camelCase string.
 */
function pascalToCamelCase(str) {
    // Check if the string starts with an uppercase letter (PascalCase)
    if (str.length === 0 || !/^[A-Z]/.test(str)) {
        return str;
    }

    const leadingAcronym = /^(?<acronym>[A-Z]+)(?=[A-Z][a-z])/u.exec(str);
    if (leadingAcronym?.groups?.["acronym"]) {
        const acronym = leadingAcronym.groups["acronym"];
        return acronym.toLowerCase() + str.slice(acronym.length);
    }

    // Convert first character to lowercase
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Check if a filename is in PascalCase.
 *
 * @param {string} filename - The filename to check.
 *
 * @returns {boolean} - True if the filename is in PascalCase.
 */
function isPascalCase(filename) {
    // Get filename without extension
    const nameWithoutExt = path.parse(filename).name;

    if (!/^[A-Z][A-Za-z0-9]*$/u.test(nameWithoutExt)) {
        return false;
    }

    // All-caps names such as README, SUPPORT, and UNLICENSE are not PascalCase.
    return /[a-z]/u.test(nameWithoutExt);
}

/**
 * Recursively process directory to find and rename PascalCase files.
 *
 * @param {string} dirPath - Directory path to process.
 * @param {boolean} dryRun - If true, only log what would be renamed.
 */
function processDirectory(dirPath, dryRun = false) {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules, .git, dist folders, etc.
            if (SKIPPED_DIRECTORIES.has(entry.name)) {
                continue;
            }
            processDirectory(fullPath, dryRun);
        } else if (
            entry.isFile() && // Check if filename is PascalCase
            isPascalCase(entry.name)
        ) {
            const parsed = path.parse(entry.name);
            const newName = pascalToCamelCase(parsed.name) + parsed.ext;
            const newPath = path.join(dirPath, newName);

            if (existsSync(newPath)) {
                console.error(
                    `Skipping rename because target already exists: ${fullPath} → ${newPath}`
                );
                continue;
            }

            if (dryRun) {
                console.log(`Would rename: ${fullPath} → ${newPath}`);
            } else {
                try {
                    renameSync(fullPath, newPath);
                    console.log(`Renamed: ${entry.name} → ${newName}`);
                } catch (error) {
                    console.error(
                        `Error renaming ${fullPath}:`,
                        error instanceof Error ? error.message : String(error)
                    );
                }
            }
        }
    }
}

/**
 * Main function.
 */
function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        if (options.help) {
            showHelp();
            return;
        }

        const projectRoot = path.resolve(import.meta.dirname, "..");

        console.log(
            `Converting PascalCase filenames to camelCase in: ${projectRoot}`
        );

        if (options.dryRun) {
            console.log("DRY RUN MODE - No files will be actually renamed\n");
        } else {
            console.log("LIVE MODE - Files will be renamed\n");
        }

        processDirectory(projectRoot, options.dryRun);
        console.log("\nConversion complete!");

        if (options.dryRun) {
            console.log(
                "\nTo actually rename files, run: node scripts/convert-pascal-to-camel.mjs --write"
            );
        }
    } catch (error) {
        console.error(
            "Error during conversion:",
            error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
    }
}

// Run the script
if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
    main();
}

export default { parseArgs, pascalToCamelCase, isPascalCase, processDirectory };
