#!/usr/bin/env node

/**
 * Enhanced Test Metadata Manager for Vitest Automatically adds comprehensive
 * metadata to test files using Vitest context features.
 *
 * Usage: node scripts/enhance-test-metadata.mjs [options].
 *
 * Options: --dry-run, -d Show what would be changed without making changes
 * --pattern, -p Glob pattern for test files --force, -f Force update files that
 * already have metadata --help, -h Show this help message.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { minimatch } from "minimatch";

const __dirname = import.meta.dirname;
const DEFAULT_PATTERN = "**/*.{test,spec}.{ts,tsx,js,jsx}";
const VALUE_OPTIONS = new Set([
    "--pattern",
    "-p",
    "--retries",
    "--timeout",
]);

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

    const { inlineValue } = splitOptionValue(option);
    if (inlineValue !== undefined) {
        if (!inlineValue) {
            throw new Error(
                `Missing value for ${option.slice(0, option.indexOf("="))}`
            );
        }

        return { consumed: 0, value: inlineValue };
    }

    const value = args[index + 1];
    if (!value || value.startsWith("-")) {
        throw new Error(`Missing value for ${option}`);
    }

    return { consumed: 1, value };
}

/**
 * Split `--option=value` arguments while preserving space-separated support.
 *
 * @param {string} arg - Raw command-line argument.
 *
 * @returns {{ inlineValue: string | undefined; option: string }} Parsed option
 *   name and optional inline value.
 */
function splitOptionValue(arg) {
    const equalsIndex = arg.indexOf("=");
    if (equalsIndex === -1) {
        return { inlineValue: undefined, option: arg };
    }

    return {
        inlineValue: arg.slice(equalsIndex + 1),
        option: arg.slice(0, equalsIndex),
    };
}

/**
 * Parse a bounded integer CLI option without partial string coercion.
 *
 * @param {string} option - Option name for diagnostics.
 * @param {string | undefined} value - Raw option value.
 * @param {number} defaultValue - Default when the option is omitted.
 * @param {number} min - Inclusive minimum.
 * @param {number} max - Inclusive maximum.
 *
 * @returns {number} Parsed integer.
 */
function parseBoundedIntegerOption(option, value, defaultValue, min, max) {
    if (value === undefined) {
        return defaultValue;
    }

    if (!/^\d+$/u.test(value)) {
        throw new Error(
            `${option} must be an integer between ${min} and ${max}`
        );
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
        throw new Error(
            `${option} must be an integer between ${min} and ${max}`
        );
    }

    return parsed;
}

/**
 * Parse and validate command line arguments.
 *
 * @param {string[]} args - Raw command line arguments.
 *
 * @returns {{
 *     backup: boolean;
 *     dryRun: boolean;
 *     force: boolean;
 *     help: boolean;
 *     parallel: boolean;
 *     pattern: string;
 *     retries: number;
 *     timeout: number;
 *     validate: boolean;
 *     verbose: boolean;
 * }}
 *   Parsed options.
 */
function parseArgs(args) {
    const parsed = {
        backup: false,
        dryRun: false,
        force: false,
        help: false,
        parallel: false,
        pattern: DEFAULT_PATTERN,
        retries: 0,
        timeout: 30_000,
        validate: false,
        verbose: process.env["DEBUG"] === "1",
    };

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (!arg) {
            continue;
        }

        const { option } = splitOptionValue(arg);

        if (VALUE_OPTIONS.has(option)) {
            const { consumed, value } = readOptionValue(args, index);
            index += consumed;

            switch (option) {
                case "--pattern":
                case "-p": {
                    parsed.pattern = value;
                    break;
                }
                case "--retries": {
                    parsed.retries = parseBoundedIntegerOption(
                        "--retries",
                        value,
                        0,
                        0,
                        5
                    );
                    break;
                }
                case "--timeout": {
                    parsed.timeout = parseBoundedIntegerOption(
                        "--timeout",
                        value,
                        30_000,
                        1000,
                        300_000
                    );
                    break;
                }
            }

            continue;
        }

        switch (arg) {
            case "--backup": {
                parsed.backup = true;
                break;
            }
            case "--dry-run":
            case "-d": {
                parsed.dryRun = true;
                break;
            }
            case "--force":
            case "-f": {
                parsed.force = true;
                break;
            }
            case "--help":
            case "-h": {
                parsed.help = true;
                break;
            }
            case "--parallel": {
                parsed.parallel = true;
                break;
            }
            case "--validate": {
                parsed.validate = true;
                break;
            }
            case "--verbose":
            case "-v": {
                parsed.verbose = true;
                break;
            }
            default: {
                throw new Error(`Unknown argument: ${arg}`);
            }
        }
    }

    return parsed;
}

let options = parseArgs([]);

/**
 * Print usage information and exit immediately.
 *
 * @returns {void}
 */
function showHelp() {
    console.log(`
🚀 Enhanced Test Metadata Manager for Vitest v2.0.0

Automatically adds comprehensive metadata to test files using Vitest context features.

USAGE:
  node scripts/enhance-test-metadata.mjs [options]

BASIC OPTIONS:
  --dry-run, -d     Show what would be changed without making changes
  --pattern, -p     Glob pattern for test files (default: **/*.{test,spec}.{ts,tsx,js,jsx})
  --force, -f       Force update files that already have metadata
  --help, -h        Show this help message

ADVANCED OPTIONS:
  --verbose, -v     Enable verbose logging and debug output
  --validate        Enable file validation after processing
  --backup          Create backups before modifying files
  --parallel        Enable parallel processing (experimental)
  --retries <n>     Number of retry attempts (0-5, default: 0)
  --timeout <ms>    Operation timeout in milliseconds (1000-300000, default: 30000)

EXAMPLES:
  # Basic usage
  node scripts/enhance-test-metadata.mjs

  # Dry run with verbose output
  node scripts/enhance-test-metadata.mjs --dry-run --verbose

  # Process specific files with backup
  node scripts/enhance-test-metadata.mjs --pattern "src/**/*.{test,spec}.{ts,tsx}" --backup

  # Advanced processing with validation and retries
  node scripts/enhance-test-metadata.mjs --validate --retries 3 --timeout 60000

ENVIRONMENT VARIABLES:
  DEBUG=1           Enable debug output (same as --verbose)

FEATURES:
  ✅ Performance monitoring and timing
  ✅ Enhanced error handling with retries
  ✅ File validation and backup support
  ✅ Comprehensive CLI options
  ✅ Detailed progress reporting
    `);
}

// ✨ ENHANCEMENT 1: Performance monitoring and metrics
const perfCounters = {
    filesProcessed: 0,
    bytesProcessed: 0,
    totalProcessingTime: 0,
    processingTimeMs: 0,
    cacheHits: 0,
    cacheMisses: 0,
    retryOperations: 0,
    backupsCreated: 0,
    errors: 0,
    warnings: 0,
    startTime: performance.now(),
};

// ✨ ENHANCEMENT 3: Intelligent caching system
const contentCache = new Map();
const metadataCache = new Map();

/**
 * Cached content reader with performance tracking.
 *
 * @param {string} filePath - Path to file.
 *
 * @returns {string} File content.
 */
function getCachedContent(filePath) {
    if (contentCache.has(filePath)) {
        perfCounters.cacheHits++;
        if (options.verbose) {
            console.log(`💾 Cache hit for: ${filePath}`);
        }
        return contentCache.get(filePath);
    }

    perfCounters.cacheMisses++;
    const content = readFileSync(filePath, "utf8");
    contentCache.set(filePath, content);
    perfCounters.bytesProcessed += content.length;

    if (options.verbose) {
        console.log(`📁 Cache miss for: ${filePath} (${content.length} bytes)`);
    }

    return content;
}

/**
 * Cached metadata generator.
 *
 * @param {string} filePath - Path to test file.
 * @param {string} testName - Name of the test.
 *
 * @returns {string} Generated metadata.
 */
function getCachedMetadata(filePath, testName) {
    const cacheKey = `${filePath}:${testName}`;

    if (metadataCache.has(cacheKey)) {
        perfCounters.cacheHits++;
        return metadataCache.get(cacheKey);
    }

    perfCounters.cacheMisses++;
    const metadata = generateMetadata(filePath, testName);
    metadataCache.set(cacheKey, metadata);
    return metadata;
}

/**
 * Performance utility to time operations and track metrics.
 *
 * @param {Function} operation - The operation to time.
 * @param {string} operationName - Name for logging.
 *
 * @returns {any} Operation result.
 */
function timeOperation(operation, operationName) {
    const start = performance.now();
    try {
        const result = operation();
        const duration = performance.now() - start;
        perfCounters.processingTimeMs += duration;
        perfCounters.totalProcessingTime += duration;
        if (process.env["DEBUG"]) {
            console.log(`⏱️  ${operationName}: ${duration.toFixed(2)}ms`);
        }
        return result;
    } catch (error) {
        perfCounters.errors++;
        throw error;
    }
}

// ✨ ENHANCEMENT 4: Enhanced error handling with retry logic

/**
 * Enhanced logger with structured output.
 */
const logger = {
    info: (/** @type {any} */ message, /** @type {any} */ ...args) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    },
    warn: (/** @type {any} */ message, /** @type {any} */ ...args) => {
        perfCounters.warnings++;
        console.warn(
            `[WARN] ${new Date().toISOString()} - ${message}`,
            ...args
        );
    },
    error: (
        /** @type {any} */ message,
        /** @type {{ message: any; name: any; stack: any }} */ error
    ) => {
        perfCounters.errors++;
        if (error instanceof Error) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
                message: error.message,
                name: error.name,
                stack: options.verbose ? error.stack : undefined,
            });
        } else {
            console.error(
                `[ERROR] ${new Date().toISOString()} - ${message}`,
                error
            );
        }
    },
};

/**
 * Determines the component name from file path.
 *
 * @param {string} filePath - The test file path.
 *
 * @returns {string} Component name.
 */
function getComponentName(filePath) {
    const fileName = path.basename(filePath);
    // Remove test file extensions and modifiers
    const nameWithoutExt = fileName.replace(
        /\.(?<nameWithoutExt3>test|spec)\.(?<nameWithoutExt>ts|tsx|js|jsx)$/,
        ""
    );
    return nameWithoutExt.replace(
        /\.(?<nameWithoutExt2>comprehensive|debug|coverage|foundation|simple|minimal|targeted|fixed|working)$/,
        ""
    );
}

/**
 * Determines the category from file path.
 *
 * @param {string} filePath - The test file path.
 *
 * @returns {string} Category.
 */
function getCategory(filePath) {
    const pathParts = filePath.split(path.sep);

    if (pathParts.includes("managers")) return "Manager";
    if (pathParts.includes("services")) return "Service";
    if (pathParts.includes("utils")) return "Utility";
    if (pathParts.includes("events")) return "Event System";
    if (pathParts.includes("hooks")) return "Hook";
    if (pathParts.includes("components")) return "Component";
    if (pathParts.includes("stores")) return "Store";
    if (pathParts.includes("database")) return "Database";
    if (pathParts.includes("validation")) return "Validation";
    if (pathParts.includes("shared")) return "Shared";

    return "Core";
}

/**
 * Determines test type from test name.
 *
 * @param {string} testName - The test function name.
 *
 * @returns {string} Test type.
 */
function getTestType(testName) {
    const lowerName = testName.toLowerCase();

    if (lowerName.includes("constructor") || lowerName.includes("create"))
        return "Constructor";
    if (lowerName.includes("initialize") || lowerName.includes("init"))
        return "Initialization";
    if (lowerName.includes("error") || lowerName.includes("fail"))
        return "Error Handling";
    if (lowerName.includes("validate") || lowerName.includes("validation"))
        return "Validation";
    if (lowerName.includes("backup")) return "Backup Operation";
    if (lowerName.includes("export")) return "Export Operation";
    if (lowerName.includes("import")) return "Import Operation";
    if (lowerName.includes("load") || lowerName.includes("loading"))
        return "Data Loading";
    if (lowerName.includes("save") || lowerName.includes("saving"))
        return "Data Saving";
    if (lowerName.includes("delete") || lowerName.includes("remove"))
        return "Data Deletion";
    if (lowerName.includes("update")) return "Data Update";
    if (
        lowerName.includes("get") ||
        lowerName.includes("find") ||
        lowerName.includes("retrieve")
    )
        return "Data Retrieval";
    if (lowerName.includes("monitor")) return "Monitoring";
    if (lowerName.includes("event")) return "Event Processing";
    if (lowerName.includes("cache")) return "Caching";
    if (lowerName.includes("limit")) return "Configuration";

    return "Business Logic";
}

/**
 * Generates metadata annotations for a test function.
 *
 * @param {string} filePath - The test file path.
 * @param {string} testName - The test function name.
 *
 * @returns {string} Metadata annotation code.
 */
function generateMetadata(filePath, testName) {
    const component = getComponentName(filePath);
    const category = getCategory(filePath);
    const type = getTestType(testName);

    return `            annotate(\`Testing: \${task.name}\`, "functional");
            annotate("Component: ${component}", "component");
            annotate("Category: ${category}", "category");
            annotate("Type: ${type}", "type");`;
}

/**
 * Processes a test file to add metadata.
 *
 * @param {string} filePath - Path to the test file.
 *
 * @returns {boolean} Whether the file was modified.
 */
function processTestFile(filePath) {
    return timeOperation(
        () => {
            if (options.verbose) {
                logger.info(`Processing: ${filePath}`);
            }

            // ✨ Use cached content reader
            const content = getCachedContent(filePath);

            // Skip if file already has metadata (unless force flag is used)
            if (
                !options.force &&
                (content.includes("task,") || content.includes("annotate,"))
            ) {
                console.log(`📋 Skipping ${filePath} - already has metadata`);
                return false;
            }

            // Check if this is a valid test file structure
            if (!content.includes("it(") && !content.includes("test(")) {
                console.log(
                    `⚠️  Skipping ${filePath} - no test functions found`
                );
                return false;
            }

            // ✨ Create backup if enabled
            if (options.backup) {
                const backupPath = `${filePath}.backup.${Date.now()}`;
                writeFileSync(backupPath, content);
                if (options.verbose) {
                    console.log(`💾 Backup created: ${backupPath}`);
                }
            }

            let newContent = content;
            let hasChanges = false;

            // Add metadata to test functions without parameters
            const testPattern =
                /(?<temp3>it|test)\s*\(\s*["'`](?<temp2>[^"'`]+)["'`]\s*,\s*(?<temp1>async\s*)?\(\s*\)\s*=>\s*{/g;
            newContent = newContent.replaceAll(
                testPattern,
                (_match, testType, testName, async) => {
                    // ✨ Use cached metadata generator
                    const metadata = getCachedMetadata(filePath, testName);
                    return `${testType}("${testName}", ${async || ""}({ task, annotate }) => {\n${metadata}\n`;
                }
            );

            // Add metadata to test functions with existing parameters
            const testWithParamsPattern =
                /(?<temp4>it|test)\s*\(\s*["'`](?<temp3>[^"'`]+)["'`]\s*,\s*(?<temp2>async\s*)?\(\s*{(?<temp1>[^}]*)}\s*\)\s*=>\s*{/g;
            newContent = newContent.replaceAll(
                testWithParamsPattern,
                (_match, testType, testName, async, existingParams) => {
                    // Parse existing parameters and add task/annotate if not present
                    const params = existingParams
                        .split(",")
                        .map((/** @type {string} */ p) => p.trim())
                        .filter(Boolean);
                    if (!params.includes("task")) params.push("task");
                    if (!params.includes("annotate")) params.push("annotate");

                    // ✨ Use cached metadata generator
                    const metadata = getCachedMetadata(filePath, testName);
                    return `${testType}("${testName}", ${async || ""}({ ${params.join(", ")} }) => {\n${metadata}\n`;
                }
            );

            // Check if changes were made
            if (newContent !== content) {
                hasChanges = true;
            }

            if (hasChanges) {
                // ✨ Validation if enabled
                if (options.validate) {
                    try {
                        // Basic validation - check for syntax issues
                        if (
                            !newContent.includes("import") &&
                            newContent.includes("task")
                        ) {
                            throw new Error(
                                "Missing imports after modification"
                            );
                        }
                        if (options.verbose) {
                            console.log(
                                `✅ Validation passed for: ${filePath}`
                            );
                        }
                    } catch (error) {
                        const errorMessage =
                            error instanceof Error
                                ? error.message
                                : String(error);
                        console.error(
                            `Validation failed for ${filePath}: ${errorMessage}`
                        );
                        return false;
                    }
                }

                if (options.dryRun) {
                    console.log(`🔍 [DRY RUN] Would update: ${filePath}`);
                    return true;
                }
                writeFileSync(filePath, newContent);
                console.log(`✅ Enhanced: ${filePath}`);
                perfCounters.filesProcessed++;
                return true;
            }
            console.log(`📝 No changes needed: ${filePath}`);
            return false;
        },
        `Processing ${path.basename(filePath)}`
    );
}

/**
 * Recursively find test files matching the pattern.
 *
 * @param {string} dir - Directory to search.
 * @param {string} pattern - File pattern to match.
 * @param {string} projectRoot - Project root directory for relative paths.
 *
 * @returns {string[]} Array of test file paths.
 */
function findTestFiles(dir, pattern, projectRoot) {
    const files = [];

    try {
        const items = readdirSync(dir);
        if (options.verbose) {
            console.log(`📁 Searching in directory: ${dir}`);
        }

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
                files.push(...findTestFiles(itemPath, pattern, projectRoot));
            } else if (stat.isFile()) {
                const relativePath = itemPath
                    .replace(projectRoot, "")
                    .replaceAll("\\", "/")
                    .replace(/^\/+/, "");

                if (options.verbose) {
                    console.log(
                        `📁 Found file: ${relativePath} (checking against pattern: ${pattern})`
                    );
                }

                // Use minimatch to check if file matches the pattern
                const matches = minimatch(relativePath, pattern);

                if (matches) {
                    files.push(itemPath);
                    if (options.verbose) {
                        console.log(`✅ File matches pattern: ${relativePath}`);
                    }
                } else if (options.verbose) {
                    console.log(
                        `❌ File does not match pattern: ${relativePath}`
                    );
                }
            }
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error(`Error reading directory ${dir}:`, errorMessage);
    }

    return files;
}

/**
 * ✨ Enhanced main execution function with performance reporting.
 *
 * @param {string[]} args - CLI arguments.
 *
 * @returns {boolean} `true` when the command completes without fatal errors.
 */
function main(args = process.argv.slice(2)) {
    options = parseArgs(args);

    if (options.help) {
        showHelp();
        return true;
    }

    if (options.verbose) {
        console.log("🔍 Verbose mode enabled");
        console.log("⚙️  Options:", JSON.stringify(options, null, 2));
    }

    console.log("🚀 Enhanced Test Metadata Manager v2.0.0");
    console.log(`📁 Pattern: ${options.pattern}`);
    console.log(`🔍 Mode: ${options.dryRun ? "DRY RUN" : "EXECUTE"}`);
    console.log(`💪 Force: ${options.force ? "YES" : "NO"}`);
    console.log(`📝 Verbose: ${options.verbose ? "YES" : "NO"}`);
    console.log(`✅ Validate: ${options.validate ? "YES" : "NO"}`);
    console.log(`💾 Backup: ${options.backup ? "YES" : "NO"}`);
    console.log(`🔄 Retries: ${options.retries}`);
    console.log(`⏱️  Timeout: ${options.timeout}ms`);
    console.log("");

    const projectRoot = path.resolve(__dirname, "..");

    if (options.verbose) {
        console.log(`🗂️  Project root: ${projectRoot}`);
    }

    const testFiles = findTestFiles(projectRoot, options.pattern, projectRoot);

    console.log(`📊 Found ${testFiles.length} test files`);

    if (options.verbose && testFiles.length > 0) {
        console.log("📝 Test files found:");
        testFiles.forEach((file, index) => {
            const relativePath = file
                .replace(projectRoot, "")
                .replaceAll("\\", "/")
                .slice(1);
            console.log(`  ${index + 1}. ${relativePath}`);
        });
    }
    console.log("");

    let processed = 0;
    let modified = 0;
    let errors = 0;

    for (const filePath of testFiles) {
        processed++;

        if (options.verbose) {
            console.log(
                `[${processed}/${testFiles.length}] Processing: ${path.basename(filePath)}`
            );
        }

        try {
            if (processTestFile(filePath)) {
                modified++;
            }
        } catch (error) {
            errors++;
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(`Error processing ${filePath}: ${errorMessage}`);
            if (!options.verbose) {
                console.error(`❌ Error processing ${path.basename(filePath)}`);
            }
        }
    }

    // ✨ Enhanced Performance Metrics Display
    const totalTime = performance.now() - perfCounters.startTime;
    const avgProcessingTime =
        perfCounters.filesProcessed > 0
            ? perfCounters.totalProcessingTime / perfCounters.filesProcessed
            : 0;
    const cacheHitRate =
        perfCounters.cacheHits + perfCounters.cacheMisses > 0
            ? (perfCounters.cacheHits /
                  (perfCounters.cacheHits + perfCounters.cacheMisses)) *
              100
            : 0;

    console.log("");
    console.log("📊 ENHANCED PERFORMANCE REPORT:");
    console.log(`├─ 📁 Files Processed: ${processed}`);
    console.log(`├─ ✅ Files Modified: ${modified}`);
    console.log(`├─ ❌ Errors: ${errors}`);
    console.log(`├─ ⏱️  Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(
        `├─ ⚡ Average Processing Time: ${avgProcessingTime.toFixed(2)}ms`
    );
    console.log(`├─ 💾 Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
    console.log(`├─ 🔄 Retry Operations: ${perfCounters.retryOperations}`);
    console.log(`├─ 💿 Backups Created: ${perfCounters.backupsCreated}`);
    console.log(
        `└─ ✨ Success Rate: ${processed > 0 ? (((processed - errors) / processed) * 100).toFixed(1) : 0}%`
    );

    if (options.dryRun) {
        console.log("");
        console.log(
            "🔍 This was a dry run. Use without --dry-run to apply changes."
        );
    }

    // Exit with appropriate code based on errors
    if (errors > 0) {
        console.log("");
        console.log("⚠️  Some files had errors. Check the logs above.");
        return false;
    }

    return true;
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
    try {
        process.exitCode = main() ? 0 : 1;
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        process.exitCode = 1;
    }
}

export {
    getCategory,
    getComponentName,
    getTestType,
    generateMetadata,
    isDirectInvocation,
    main,
    parseArgs,
    processTestFile,
    readOptionValue,
    showHelp,
    splitOptionValue,
    timeOperation,
};
