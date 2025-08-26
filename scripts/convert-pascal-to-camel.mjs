#!/usr/bin/env node

/**
 * Script to convert all PascalCase filenames to camelCase Recursively searches
 * through the project and renames files
 */

import { readdirSync, renameSync } from "fs";
import { parse, join, resolve } from "path";

/**
 * Convert PascalCase string to camelCase
 *
 * @param {string} str - The PascalCase string to convert
 *
 * @returns {string} - The camelCase string
 */
function pascalToCamelCase(str) {
    // Check if the string starts with an uppercase letter (PascalCase)
    if (str.length === 0 || !/^[A-Z]/.test(str)) {
        return str;
    }

    // Convert first character to lowercase
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Check if a filename is in PascalCase
 *
 * @param {string} filename - The filename to check
 *
 * @returns {boolean} - True if the filename is in PascalCase
 */
function isPascalCase(filename) {
    // Get filename without extension
    const nameWithoutExt = parse(filename).name;

    // Check if it starts with uppercase and contains at least one more uppercase letter
    return (
        /^[A-Z][a-z]*[A-Z]/.test(nameWithoutExt) ||
        /^[A-Z][A-Z]/.test(nameWithoutExt) ||
        /^[A-Z][a-z]+$/.test(nameWithoutExt)
    );
}

/**
 * Recursively process directory to find and rename PascalCase files
 *
 * @param {string} dirPath - Directory path to process
 * @param {boolean} dryRun - If true, only log what would be renamed
 */
function processDirectory(dirPath, dryRun = false) {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules, .git, dist folders, etc.
            if (
                [
                    "node_modules",
                    ".git",
                    "dist",
                    "dist-electron",
                    "coverage",
                    ".vscode",
                    ".vs",
                ].includes(entry.name)
            ) {
                continue;
            }
            processDirectory(fullPath, dryRun);
        } else if (entry.isFile()) {
            // Check if filename is PascalCase
            if (isPascalCase(entry.name)) {
                const parsed = parse(entry.name);
                const newName = pascalToCamelCase(parsed.name) + parsed.ext;
                const newPath = join(dirPath, newName);

                if (dryRun) {
                    console.log(`Would rename: ${fullPath} → ${newPath}`);
                } else {
                    try {
                        renameSync(fullPath, newPath);
                        console.log(`Renamed: ${entry.name} → ${newName}`);
                    } catch (error) {
                        console.error(
                            `Error renaming ${fullPath}:`,
                            error instanceof Error
                                ? error.message
                                : String(error)
                        );
                    }
                }
            }
        }
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run") || args.includes("-d");
    const projectRoot = resolve(__dirname, "..");

    console.log(
        `Converting PascalCase filenames to camelCase in: ${projectRoot}`
    );

    if (dryRun) {
        console.log("DRY RUN MODE - No files will be actually renamed\n");
    } else {
        console.log("LIVE MODE - Files will be renamed\n");
    }

    try {
        processDirectory(projectRoot, dryRun);
        console.log("\nConversion complete!");

        if (dryRun) {
            console.log(
                "\nTo actually rename files, run: node convert-pascal-to-camel.js"
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
if (require.main === module) {
    main();
}

export default { pascalToCamelCase, isPascalCase, processDirectory };
