#!/usr/bin/env node

/**
 * Test Quote Fixer for TypeScript Test Files Automatically fixes quote issues
 * in test files that can occur after automated modifications.
 *
 * Usage: node scripts/fix-test-quotes.mjs [options].
 *
 * Options: --dry-run, -d Show what would be changed without making changes
 * --pattern, -p Glob pattern for test files --help, -h Show this help message.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { minimatch } from "minimatch";

const __dirname = import.meta.dirname;
const DEFAULT_PATTERN = "*.test.ts";
const VALUE_OPTIONS = new Set(["--pattern", "-p"]);

let options = {
    dryRun: false,
    help: false,
    pattern: DEFAULT_PATTERN,
};

/**
 * Read a value for an option that supports either `--flag=value` or `--flag
 * value`.
 *
 * @param {string[]} args - Raw command line arguments.
 * @param {number} index - Current argument index.
 *
 * @returns {{ consumed: number; value: string }} Parsed value and number of
 *   extra arguments consumed.
 */
function readOptionValue(args, index) {
    const option = args[index];
    if (!option) {
        throw new Error("Missing option name");
    }

    const equalIndex = option.indexOf("=");
    if (equalIndex >= 0) {
        const value = option.slice(equalIndex + 1);
        if (!value) {
            throw new Error(`Missing value for ${option.slice(0, equalIndex)}`);
        }

        return { consumed: 0, value };
    }

    const value = args[index + 1];
    if (!value || value.startsWith("-")) {
        throw new Error(`Missing value for ${option}`);
    }

    return { consumed: 1, value };
}

/**
 * Parse command line arguments.
 *
 * @param {string[]} args - Raw command line arguments.
 *
 * @returns {{ dryRun: boolean; help: boolean; pattern: string }} Parsed
 *   options.
 */
function parseArgs(args) {
    const parsed = {
        dryRun: false,
        help: false,
        pattern: DEFAULT_PATTERN,
    };

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (!arg) {
            continue;
        }

        const optionName = arg.includes("=")
            ? arg.slice(0, arg.indexOf("="))
            : arg;

        if (VALUE_OPTIONS.has(optionName)) {
            const { consumed, value } = readOptionValue(args, index);
            index += consumed;
            parsed.pattern = value;
            continue;
        }

        switch (arg) {
            case "--dry-run":
            case "-d": {
                parsed.dryRun = true;
                break;
            }
            case "--help":
            case "-h": {
                parsed.help = true;
                break;
            }
            default: {
                throw new Error(`Unknown argument: ${arg}`);
            }
        }
    }

    return parsed;
}

/**
 * Print usage information and exit immediately.
 *
 * @returns {never}
 */
function showHelp() {
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
 * Fix quote issues in a single file.
 *
 * @param {string} filePath - Path to the file to fix.
 *
 * @returns {boolean} Whether the file was modified.
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
 * Recursively find test files matching the pattern.
 *
 * @param {string} filePath - File path to test.
 * @param {string} rootDir - Root directory used to build relative paths.
 * @param {string} pattern - Glob pattern to match.
 *
 * @returns {boolean} Whether the file matches the glob pattern.
 */
function matchesPattern(filePath, rootDir, pattern) {
    const relativePath = path.relative(rootDir, filePath).replaceAll("\\", "/");
    const normalizedPattern = pattern.replaceAll("\\", "/");

    return minimatch(relativePath, normalizedPattern, {
        dot: false,
        matchBase: !normalizedPattern.includes("/"),
    });
}

/**
 * Recursively find test files matching the pattern.
 *
 * @param {string} dir - Directory to search.
 * @param {string} pattern - File pattern to match.
 * @param {string} rootDir - Root directory used to build relative paths.
 *
 * @returns {string[]} Array of test file paths.
 */
function findTestFiles(dir, pattern, rootDir = dir) {
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
                files.push(...findTestFiles(itemPath, pattern, rootDir));
            } else if (
                stat.isFile() &&
                item.endsWith(".test.ts") &&
                matchesPattern(itemPath, rootDir, pattern)
            ) {
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
 * Main execution function.
 */
function main() {
    options = parseArgs(process.argv.slice(2));

    if (options.help) {
        showHelp();
    }

    console.log("🔧 Test Quote Fixer");
    console.log(`📁 Pattern: ${options.pattern}`);
    console.log(`🔍 Mode: ${options.dryRun ? "DRY RUN" : "EXECUTE"}`);
    console.log("");

    const projectRoot = path.resolve(__dirname, "..");
    const testFiles = findTestFiles(projectRoot, options.pattern, projectRoot);

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

/**
 * Check whether this module was executed as the CLI entrypoint.
 *
 * @returns {boolean} Whether the script is running directly.
 */
function isDirectInvocation() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(process.argv[1]).href
    );
}

// Execute if run directly
if (isDirectInvocation()) {
    try {
        main();
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
    }
}

export { fixFileQuotes };
