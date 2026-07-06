#!/usr/bin/env node

/**
 * Script to extract and export all test names from the project Parses test
 * files to find describe() and it() blocks and exports test names.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
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

const OUTPUT_FORMATS = new Set([
    "flat",
    "json",
    "list",
    "tree",
]);

/**
 * Parse command-line arguments.
 *
 * @param {string[]} args - Raw command-line arguments.
 *
 * @returns {{ format: string; help: boolean; save: boolean }} Parsed options.
 */
function parseArgs(args) {
    const parsed = {
        format: "list",
        help: false,
        save: false,
    };

    for (const arg of args) {
        switch (arg) {
            case "--help":
            case "-h": {
                parsed.help = true;
                break;
            }

            case "--save": {
                parsed.save = true;
                break;
            }

            case "--flat":
            case "--json":
            case "--list":
            case "--tree": {
                parsed.format = arg.slice(2);
                break;
            }

            default: {
                throw new Error(`Unknown option: ${arg}`);
            }
        }
    }

    return parsed;
}

/**
 * Check whether a file name matches the project test file conventions.
 *
 * @param {string} fileName - File name to inspect.
 *
 * @returns {boolean} Whether the file is a test/bench file.
 */
function isTestFileName(fileName) {
    return /\.(?:test|spec|bench)\.[cm]?[jt]sx?$/u.test(fileName);
}

/**
 * Extract test names from a single test file.
 *
 * @param {string} filePath - Path to the test file.
 *
 * @returns {object} - Object containing test structure.
 */
function extractTestNames(filePath) {
    try {
        const content = readFileSync(filePath, "utf8");
        const fileName = path.basename(filePath);

        const testStructure = {
            file: fileName,
            path: filePath,
            describes: /** @type {string[]} */ ([]),
            tests: /** @type {string[]} */ ([]),
        };

        // Regular expressions to match describe and it blocks
        // Updated to use named capture groups for better readability and ESLint compliance
        const describeRegex = /describe\s*\(\s*["'`](?<name>[^"'`]+)["'`]/g;
        const itRegex = /(?:it|test)\s*\(\s*["'`](?<name>[^"'`]+)["'`]/g;

        let match;

        // Extract describe blocks
        while ((match = describeRegex.exec(content)) !== null) {
            if (match.groups?.["name"]) {
                testStructure.describes.push(match.groups["name"]);
            }
        }

        // Extract it/test blocks
        while ((match = itRegex.exec(content)) !== null) {
            if (match.groups?.["name"]) {
                testStructure.tests.push(match.groups["name"]);
            }
        }

        return testStructure;
    } catch (error) {
        console.error(
            `Error reading file ${filePath}:`,
            error instanceof Error ? error.message : String(error)
        );
        return {
            file: path.basename(filePath),
            path: filePath,
            describes: [],
            tests: [],
        };
    }
}

/**
 * Find all test files in the project.
 *
 * @param {string} dirPath - Directory to search.
 * @param {string[]} testFiles - Array to collect test file paths.
 */
function findTestFiles(dirPath, testFiles = []) {
    try {
        const entries = readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Skip node_modules, .git, dist folders, etc.
                if (SKIPPED_DIRECTORIES.has(entry.name)) {
                    continue;
                }
                findTestFiles(fullPath, testFiles);
            } else if (
                entry.isFile() && // Check if it's a test file
                isTestFileName(entry.name)
            ) {
                testFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error(
            `Error reading directory ${dirPath}:`,
            error instanceof Error ? error.message : String(error)
        );
    }

    return testFiles;
}

/**
 * Format test names for different output formats.
 *
 * @param {object[]} testStructures - Array of test structures.
 * @param {string} format - Output format ('list', 'json', 'tree', 'flat').
 */
function formatTestNames(testStructures, format = "list") {
    if (!OUTPUT_FORMATS.has(format)) {
        throw new Error(`Unsupported output format: ${format}`);
    }

    switch (format) {
        case "json": {
            return JSON.stringify(testStructures, null, 2);
        }

        case "tree": {
            let treeOutput = "";
            testStructures.forEach((/** @type {any} */ structure) => {
                if (
                    structure.describes.length > 0 ||
                    structure.tests.length > 0
                ) {
                    treeOutput += `\n📁 ${structure.file}\n`;

                    structure.describes.forEach(
                        (/** @type {any} */ describe) => {
                            treeOutput += `  📝 ${describe}\n`;
                        }
                    );

                    structure.tests.forEach((/** @type {any} */ test) => {
                        treeOutput += `  ✅ ${test}\n`;
                    });
                }
            });
            return treeOutput;
        }

        case "flat": {
            /** @type {string[]} */
            const allTests = [];
            testStructures.forEach((/** @type {any} */ structure) => {
                structure.tests.forEach((/** @type {any} */ test) => {
                    allTests.push(test);
                });
            });
            return allTests.join("\n");
        }

        default: {
            let listOutput = "";
            testStructures.forEach((/** @type {any} */ structure) => {
                if (
                    structure.describes.length > 0 ||
                    structure.tests.length > 0
                ) {
                    listOutput += `\n=== ${structure.file} ===\n`;

                    if (structure.describes.length > 0) {
                        listOutput += "\nDescribe blocks:\n";
                        structure.describes.forEach(
                            (/** @type {any} */ describe) => {
                                listOutput += `  - ${describe}\n`;
                            }
                        );
                    }

                    if (structure.tests.length > 0) {
                        listOutput += "\nTest cases:\n";
                        structure.tests.forEach((/** @type {any} */ test) => {
                            listOutput += `  - ${test}\n`;
                        });
                    }
                }
            });
            return listOutput;
        }
    }
}

/**
 * Main function.
 *
 * @param {string[]} args - CLI arguments.
 *
 * @returns {boolean} `true` when extraction completes without a fatal error.
 */
function main(args = process.argv.slice(2)) {
    try {
        const options = parseArgs(args);
        if (options.help) {
            showUsage();
            return true;
        }

        const projectRoot = path.resolve(import.meta.dirname, "..");

        console.log(`Extracting test names from: ${projectRoot}`);
        console.log(`Output format: ${options.format}\n`);

        // Find all test files
        const testFiles = findTestFiles(projectRoot);
        console.log(`Found ${testFiles.length} test files\n`);

        // Extract test names from all files
        /** @type {object[]} */
        const testStructures = [];
        testFiles.forEach((filePath) => {
            const structure = extractTestNames(filePath);
            const structCast = /** @type {any} */ (structure);
            if (
                (structCast["describes"]?.length ?? 0) > 0 ||
                (structCast["tests"]?.length ?? 0) > 0
            ) {
                testStructures.push(structure);
            }
        });

        // Output results
        const output = formatTestNames(testStructures, options.format);
        console.log(output);

        // Summary
        const totalDescribes = testStructures.reduce((sum, s) => {
            const sCast = /** @type {any} */ (s);
            return sum + (sCast["describes"]?.length ?? 0);
        }, 0);
        const totalTests = testStructures.reduce((sum, s) => {
            const sCast = /** @type {any} */ (s);
            return sum + (sCast["tests"]?.length ?? 0);
        }, 0);

        console.log(`\n--- Summary ---`);
        console.log(`Files processed: ${testStructures.length}`);
        console.log(`Total describe blocks: ${totalDescribes}`);
        console.log(`Total test cases: ${totalTests}`);

        // Export to file option
        if (options.save) {
            const outputFile = path.join(
                projectRoot,
                `test-names-${Date.now()}.txt`
            );
            writeFileSync(outputFile, output);
            console.log(`\nResults saved to: ${outputFile}`);
        }
        return true;
    } catch (error) {
        console.error(
            "Error during extraction:",
            error instanceof Error ? error.message : String(error)
        );
        return false;
    }
}

/**
 * Print CLI usage information for the test-name extractor.
 *
 * @returns {void}
 */
function showUsage() {
    console.log(`
Usage: node scripts/extract-test-names.mjs [options]

Options:
  --list    Default format, organized by file with describe and test blocks
  --json    Output as JSON structure
  --tree    Tree-like format with emojis
  --flat    Flat list of test names only
  --save    Save output to a timestamped file

Examples:
  node scripts/extract-test-names.mjs --flat
  node scripts/extract-test-names.mjs --json --save
  node scripts/extract-test-names.mjs --tree
`);
}

/**
 * Check whether this module was executed as the CLI entrypoint.
 *
 * @returns {boolean} Whether the script is running directly.
 */
function isDirectInvocation() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectInvocation()) {
    process.exitCode = main() ? 0 : 1;
}

export {
    extractTestNames,
    findTestFiles,
    formatTestNames,
    isDirectInvocation,
    isTestFileName,
    main,
    parseArgs,
    showUsage,
};

export default {
    extractTestNames,
    findTestFiles,
    formatTestNames,
    isTestFileName,
    parseArgs,
};
