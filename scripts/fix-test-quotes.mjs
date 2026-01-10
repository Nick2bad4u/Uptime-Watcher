#!/usr/bin/env node

/**
 * Test Quote Fixer for TypeScript Test Files Automatically fixes quote issues
 * in test files that can occur after automated modifications
 *
 * Usage: node scripts/fix-test-quotes.mjs [options]
 *
 * Options: --dry-run, -d Show what would be changed without making changes
 * --pattern, -p Glob pattern for test files --help, -h Show this help message
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

const __dirname = import.meta.dirname;

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes("--dry-run") || args.includes("-d"),
    pattern: getArgValue("--pattern", "-p") || "*.test.ts",
    help: args.includes("--help") || args.includes("-h"),
};

/**
 * @param {string} longForm
 * @param {string} shortForm
 */
function getArgValue(longForm, shortForm) {
    const index = args.findIndex(
        (arg) => arg === longForm || arg === shortForm
    );
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

if (options.help) {
    console.log(`
Test Quote Fixer for TypeScript Test Files

Usage:
  node scripts/fix-test-quotes.mjs [options]

Options:
  --dry-run, -d     Show what would be changed without making changes
  --pattern, -p     Glob pattern for test files (default: *.test.ts)
  --help, -h        Show this help message

Examples:
  node scripts/fix-test-quotes.mjs --dry-run
  node scripts/fix-test-quotes.mjs --pattern "electron/*.test.ts"
`);
    process.exit(0);
}

/**
 * Fix quote issues in a single file
 *
 * @param {string} filePath - Path to the file to fix
 *
 * @returns {boolean} Whether the file was modified
 */
function fixFileQuotes(filePath) {
    try {
        let content = readFileSync(filePath, "utf8");
        let hasChanges = false;
        const originalContent = content;

        // Common quote fixing patterns
        const fixPatterns = [
            // Fix escaped quotes in test names
            {
                find: /it\("should return \\"(?<temp2>[^"]+)\\" for (?<temp1>[^"]+)", async \({/g,
                replace: String.raw`it("should return \"$1\" for $2", async ({`,
            },
            {
                find: /it\('should return "(?<temp2>[^"]+)" for (?<temp1>[^']+)', async \({/g,
                replace: "it('should return \"$1\" for $2', async ({",
            },
            // Fix unterminated string literals
            {
                find: /it\("(?<temp3>[^"]*)"(?<temp2>[^"]*)"(?<temp1>[^"]*)", async \({/g,
                replace: String.raw`it("$1\"$2\"$3", async ({`,
            },
            // Fix mixed quote issues
            {
                find: /it\("(?<temp2>[^"]*)'(?<temp1>[^"]*)", async \({/g,
                replace: 'it("$1\'$2", async ({',
            },
            // Fix unnecessary escape characters
            {
                find: /\\"/g,
                replace: '"',
            },
            // Fix double escaped quotes
            {
                find: /\\\\"/g,
                replace: String.raw`\"`,
            },
        ];

        for (const pattern of fixPatterns) {
            const before = content;
            content = content.replace(pattern.find, pattern.replace);
            if (content !== before) {
                hasChanges = true;
            }
        }

        // Additional fixes for specific syntax errors
        // Fix incomplete string patterns
        content = content.replaceAll(
            /should return "(?<temp2>[^"]+)" for (?<temp1>[^"),]+)"/g,
            'should return "$1" for $2'
        );

        // Check if we made any changes
        if (content !== originalContent) {
            hasChanges = true;
        }

        if (hasChanges) {
            if (options.dryRun) {
                console.log(`🔍 [DRY RUN] Would fix quotes in: ${filePath}`);
                return true;
            }
            writeFileSync(filePath, content);
            console.log(`✅ Fixed quotes in: ${filePath}`);
            return true;
        }

        console.log(`📝 No quote issues found: ${filePath}`);
        return false;
    } catch (error) {
        console.error(
            `❌ Error fixing ${filePath}:`,
            error instanceof Error ? error.message : String(error)
        );
        return false;
    }
}

/**
 * Recursively find test files matching the pattern
 *
 * @param {string} dir - Directory to search
 * @param {string} pattern - File pattern to match
 *
 * @returns {string[]} Array of test file paths
 */
function findTestFiles(dir, pattern) {
    const files = [];

    try {
        const items = readdirSync(dir);

        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = statSync(itemPath);

            if (
                stat.isDirectory() &&
                !item.startsWith(".") &&
                ![
                    "node_modules",
                    "dist",
                    "coverage",
                ].includes(item)
            ) {
                files.push(...findTestFiles(itemPath, pattern));
            } else if (stat.isFile() && item.endsWith(".test.ts")) {
                files.push(itemPath);
            }
        }
    } catch (error) {
        console.error(
            `Error reading directory ${dir}:`,
            error instanceof Error ? error.message : String(error)
        );
    }

    return files;
}

/**
 * Main execution function
 */
function main() {
    console.log("🔧 Test Quote Fixer");
    console.log(`📁 Pattern: ${options.pattern}`);
    console.log(`🔍 Mode: ${options.dryRun ? "DRY RUN" : "EXECUTE"}`);
    console.log("");

    const projectRoot = path.resolve(__dirname, "..");
    const testFiles = findTestFiles(projectRoot, options.pattern);

    console.log(`📊 Found ${testFiles.length} test files`);
    console.log("");

    let processed = 0;
    let fixed = 0;
    let errors = 0;

    for (const filePath of testFiles) {
        processed++;
        try {
            if (fixFileQuotes(filePath)) {
                fixed++;
            }
        } catch (error) {
            console.error(
                `❌ Error processing ${filePath}:`,
                error instanceof Error ? error.message : String(error)
            );
            errors++;
        }
    }

    console.log("");
    console.log("📊 Summary:");
    console.log(`   📁 Files processed: ${processed}`);
    console.log(`   ✅ Files fixed: ${fixed}`);
    console.log(`   ❌ Errors: ${errors}`);

    if (options.dryRun) {
        console.log("");
        console.log(
            "🔍 This was a dry run. Use without --dry-run to apply changes."
        );
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { fixFileQuotes };
