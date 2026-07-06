#!/usr/bin/env node

/**
 * Post-process recorded Playwright tests with lint-compliant transforms.
 *
 * Usage: `node scripts/transform-test.mjs INPUT_FILE [output-file]`.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { applyLintCompliantTransforms } from "../playwright/codegen-template.mjs";

/**
 * Print usage information.
 *
 * @returns {void}
 */
function showHelp() {
    console.log(`
Usage: node scripts/transform-test.mjs INPUT_FILE [output-file]

Options:
  --help, -h    Show this help message
`);
}

/**
 * Parse command line arguments.
 *
 * @param {string[]} args - Raw command line arguments.
 *
 * @returns {{ inputFile: string; outputFile: string } | null} Parsed paths, or
 *   `null` when help was requested.
 */
function parseArgs(args) {
    if (args.includes("--help") || args.includes("-h")) {
        return null;
    }

    if (args.length === 0) {
        throw new Error("Missing input file. Run with --help for usage.");
    }

    if (args.length > 2) {
        throw new Error(
            `Expected at most 2 positional arguments, got ${args.length}.`
        );
    }

    const [inputFile, outputFile = inputFile] = args;
    if (!inputFile || inputFile.startsWith("-")) {
        throw new Error("Input file must be provided before any options.");
    }

    if (!outputFile || outputFile.startsWith("-")) {
        throw new Error("Output file must be a path when provided.");
    }

    const inputFilePath = path.resolve(inputFile);
    if (!existsSync(inputFilePath) || !statSync(inputFilePath).isFile()) {
        throw new Error(`Input file not found: ${inputFilePath}`);
    }

    const outputFilePath = path.resolve(outputFile);
    const outputDirectoryPath = path.dirname(outputFilePath);
    if (
        !existsSync(outputDirectoryPath) ||
        !statSync(outputDirectoryPath).isDirectory()
    ) {
        throw new Error(`Output directory not found: ${outputDirectoryPath}`);
    }

    return {
        inputFile: inputFilePath,
        outputFile: outputFilePath,
    };
}

/**
 * Transform a Playwright test file.
 *
 * @param {string} inputFile - Absolute input path.
 * @param {string} outputFile - Absolute output path.
 *
 * @returns {void}
 */
function transformTest(inputFile, outputFile) {
    console.log(`Reading test file: ${inputFile}`);
    const originalCode = readFileSync(inputFile, "utf8");

    console.log("Applying lint-compliant transformations...");
    const transformedCode = applyLintCompliantTransforms(originalCode);

    console.log(`Writing transformed test: ${outputFile}`);
    writeFileSync(outputFile, transformedCode);

    console.log("Test transformation completed.");
    console.log("\nTransformations applied:");
    console.log(
        "   - Raw locators -> Semantic locators (getByRole, getByTestId)"
    );
    console.log('   - Test titles -> "should" format');
    console.log("   - Added describe blocks");
    console.log("   - Removed networkidle usage");
    console.log("   - Added comments for problematic selectors");
}

/**
 * @param {string[]} args - CLI arguments.
 *
 * @returns {boolean} `true` when the transform completes or help is shown.
 */
function main(args = process.argv.slice(2)) {
    try {
        const parsedArgs = parseArgs(args);
        if (!parsedArgs) {
            showHelp();
            return true;
        }

        transformTest(parsedArgs.inputFile, parsedArgs.outputFile);
        return true;
    } catch (error) {
        console.error(
            "Error transforming test:",
            error instanceof Error ? error.message : String(error)
        );
        return false;
    }
}

/**
 * @returns {boolean} `true` when this file is the CLI entrypoint.
 */
function isDirectRun() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectRun()) {
    process.exitCode = main() ? 0 : 1;
}

export { isDirectRun, main, parseArgs, showHelp, transformTest };
