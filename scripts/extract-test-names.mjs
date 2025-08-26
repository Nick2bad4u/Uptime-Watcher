#!/usr/bin/env node

/**
 * Script to extract and export all test names from the project Parses test
 * files to find describe() and it() blocks and exports test names
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { basename, join, resolve } from "path";

/**
 * Extract test names from a single test file
 *
 * @param {string} filePath - Path to the test file
 *
 * @returns {Object} - Object containing test structure
 */
function extractTestNames(filePath) {
    try {
        const content = readFileSync(filePath, "utf8");
        const fileName = basename(filePath);

        const testStructure = {
            file: fileName,
            path: filePath,
            describes: /** @type {string[]} */ ([]),
            tests: /** @type {string[]} */ ([]),
        };

        // Regular expressions to match describe and it blocks
        const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]/g;
        const itRegex = /(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;

        let match;

        // Extract describe blocks
        while ((match = describeRegex.exec(content)) !== null) {
            testStructure.describes.push(match[1]);
        }

        // Extract it/test blocks
        while ((match = itRegex.exec(content)) !== null) {
            testStructure.tests.push(match[1]);
        }

        return testStructure;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error instanceof Error ? error.message : String(error));
        return null;
    }
}

/**
 * Find all test files in the project
 *
 * @param {string} dirPath - Directory to search
 * @param {Array} testFiles - Array to collect test file paths
 */
function findTestFiles(dirPath, testFiles = []) {
    try {
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
                findTestFiles(fullPath, testFiles);
            } else if (entry.isFile()) {
                // Check if it's a test file
                if (
                    entry.name.includes(".test.") ||
                    entry.name.includes(".spec.") ||
                    entry.name.endsWith(".test.ts") ||
                    entry.name.endsWith(".test.js") ||
                    entry.name.endsWith(".spec.ts") ||
                    entry.name.endsWith(".spec.js") ||
                    entry.name.endsWith(".bench.ts") ||
                    entry.name.endsWith(".bench.js")
                ) {
                    testFiles.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error instanceof Error ? error.message : String(error));
    }

    return testFiles;
}

/**
 * Format test names for different output formats
 *
 * @param {Array} testStructures - Array of test structures
 * @param {string} format - Output format ('list', 'json', 'tree', 'flat')
 */
function formatTestNames(testStructures, format = "list") {
    switch (format) {
        case "json":
            return JSON.stringify(testStructures, null, 2);

        case "tree":
            let treeOutput = "";
            testStructures.forEach((structure) => {
                if (
                    structure.describes.length > 0 ||
                    structure.tests.length > 0
                ) {
                    treeOutput += `\n📁 ${structure.file}\n`;

                    structure.describes.forEach((describe) => {
                        treeOutput += `  📝 ${describe}\n`;
                    });

                    structure.tests.forEach((test) => {
                        treeOutput += `  ✅ ${test}\n`;
                    });
                }
            });
            return treeOutput;

        case "flat":
            const allTests = [];
            testStructures.forEach((structure) => {
                structure.tests.forEach((test) => {
                    allTests.push(test);
                });
            });
            return allTests.join("\n");

        case "list":
        default:
            let listOutput = "";
            testStructures.forEach((structure) => {
                if (
                    structure.describes.length > 0 ||
                    structure.tests.length > 0
                ) {
                    listOutput += `\n=== ${structure.file} ===\n`;

                    if (structure.describes.length > 0) {
                        listOutput += "\nDescribe blocks:\n";
                        structure.describes.forEach((describe) => {
                            listOutput += `  - ${describe}\n`;
                        });
                    }

                    if (structure.tests.length > 0) {
                        listOutput += "\nTest cases:\n";
                        structure.tests.forEach((test) => {
                            listOutput += `  - ${test}\n`;
                        });
                    }
                }
            });
            return listOutput;
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);
    const format =
        args
            .find((arg) =>
                [
                    "--json",
                    "--tree",
                    "--flat",
                    "--list",
                ].includes(arg)
            )
            ?.replace("--", "") || "list";
    const projectRoot = resolve(__dirname, "..");

    console.log(`Extracting test names from: ${projectRoot}`);
    console.log(`Output format: ${format}\n`);

    try {
        // Find all test files
        const testFiles = findTestFiles(projectRoot);
        console.log(`Found ${testFiles.length} test files\n`);

        // Extract test names from all files
        const testStructures = [];
        testFiles.forEach((filePath) => {
            const structure = extractTestNames(filePath);
            if (
                structure &&
                (structure.describes.length > 0 || structure.tests.length > 0)
            ) {
                testStructures.push(structure);
            }
        });

        // Output results
        const output = formatTestNames(testStructures, format);
        console.log(output);

        // Summary
        const totalDescribes = testStructures.reduce(
            (sum, s) => sum + s.describes.length,
            0
        );
        const totalTests = testStructures.reduce(
            (sum, s) => sum + s.tests.length,
            0
        );

        console.log(`\n--- Summary ---`);
        console.log(`Files processed: ${testStructures.length}`);
        console.log(`Total describe blocks: ${totalDescribes}`);
        console.log(`Total test cases: ${totalTests}`);

        // Export to file option
        if (args.includes("--save")) {
            const outputFile = join(
                projectRoot,
                `test-names-${Date.now()}.txt`
            );
            writeFileSync(outputFile, output);
            console.log(`\nResults saved to: ${outputFile}`);
        }
    } catch (error) {
        console.error("Error during extraction:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Usage information
function showUsage() {
    console.log(`
Usage: node extract-test-names.js [options]

Options:
  --list    Default format, organized by file with describe and test blocks
  --json    Output as JSON structure
  --tree    Tree-like format with emojis
  --flat    Flat list of test names only
  --save    Save output to a timestamped file

Examples:
  node extract-test-names.js --flat
  node extract-test-names.js --json --save
  node extract-test-names.js --tree
`);
}

// Show usage if help requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showUsage();
    process.exit(0);
}

// Run the script
if (require.main === module) {
    main();
}

export default { extractTestNames, findTestFiles, formatTestNames };
