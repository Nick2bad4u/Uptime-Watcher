#!/usr/bin/env node

/**
 * Post-process recorded Playwright tests with lint-compliant transforms.
 *
 * Usage: `node scripts/transform-test.mjs INPUT_FILE [output-file]`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { applyLintCompliantTransforms } from "../playwright/codegen-template.mjs";

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile;

if (!inputFile) {
    console.error(
        "Usage: node scripts/transform-test.mjs INPUT_FILE [output-file]"
    );
    process.exit(1);
}

try {
    console.log(`📖 Reading test file: ${inputFile}`);
    const originalCode = readFileSync(inputFile, "utf8");

    console.log("🔄 Applying lint-compliant transformations...");
    const transformedCode = applyLintCompliantTransforms(originalCode);

    console.log(`📝 Writing transformed test: ${outputFile}`);
    if (outputFile) {
        writeFileSync(outputFile, transformedCode);
    }

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
