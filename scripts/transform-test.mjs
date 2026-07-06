#!/usr/bin/env node

/**
 * Post-process recorded Playwright tests with lint-compliant transforms.
 *
 * Usage: `node scripts/transform-test.mjs INPUT_FILE [output-file]`.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import * as path from "node:path";
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
 * @returns {{ inputFile: string; outputFile: string }} Parsed paths.
 */
function parseArgs(args) {
    if (args.includes("--help") || args.includes("-h")) {
        showHelp();
        process.exit(0);
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

try {
    const { inputFile, outputFile } = parseArgs(process.argv.slice(2));

    console.log(`📖 Reading test file: ${inputFile}`);
    const originalCode = readFileSync(inputFile, "utf8");

    console.log("🔄 Applying lint-compliant transformations...");
    const transformedCode = applyLintCompliantTransforms(originalCode);

    console.log(`📝 Writing transformed test: ${outputFile}`);
    writeFileSync(outputFile, transformedCode);

    console.log("✅ Test transformation completed!");
    console.log("\n🎯 Transformations applied:");
    console.log(
        "   • Raw locators → Semantic locators (getByRole, getByTestId)"
    );
    console.log('   • Test titles → "should" format');
    console.log("   • Added describe blocks");
    console.log("   • Removed networkidle usage");
    console.log("   • Added comments for problematic selectors");
} catch (error) {
    console.error(
        "❌ Error transforming test:",
        error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
}
