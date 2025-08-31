#!/usr/bin/env node

/**
 * Universal Documentation Downloader & Processor v2.0.0
 *
 * Advanced documentation downloader with caching, parallel processing,
 * validation, and comprehensive error handling.
 *
 * @version 2.0.0
 *
 * @file Enhanced documentation downloader with enterprise-grade features
 *
 * @author Nick2bad4u
 *
 * @example
 *
 * ```bash
 * # Basic usage
 * node scripts/download-docs-template.mjs
 *
 * # With advanced options
 * node scripts/download-docs-template.mjs --cache --parallel --validate --retry=3
 *
 * # Configuration via environment
 * DOCS_OUTPUT_DIR=/custom/path node scripts/download-docs-template.mjs
 * ```
 *
 * @requires Node.js >= 16.0.0
 * @requires pandoc (installed globally)
 */

import { execFile, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==================== ENHANCED CONFIGURATION ==================== */

/**
 * @typedef {Object} DownloadConfig
 *
 * @property {string} docName - Unique identifier for this documentation set
 * @property {string} baseUrl - Base URL for documentation source
 * @property {string[]} pages - Array of page paths to download
 * @property {string} inputFormat - Pandoc input format
 * @property {string} outputFormat - Pandoc output format
 * @property {string} outputExt - Output file extension
 * @property {string[]} subdirs - Output directory structure
 * @property {boolean} enableCache - Whether to use caching
 * @property {boolean} enableParallel - Whether to use parallel processing
 * @property {boolean} enableValidation - Whether to validate downloads
 * @property {number} maxRetries - Maximum retry attempts
 * @property {number} timeout - Request timeout in milliseconds
 * @property {number} concurrency - Maximum concurrent downloads
 * @property {string[]} removeFromMarkers - Markers to remove content from
 * @property {string[]} removeLineMarkers - Markers to remove lines containing
 * @property {string[]} removeAboveMarkers - Markers to remove content above
 * @property {number} minContentLength - Minimum content length for validation
 * @property {string[]} requiredPatterns - Required patterns for validation
 * @property {string[]} forbiddenPatterns - Forbidden patterns for validation
 * @property {boolean} verbose - Enable verbose logging
 */

/**
 * Configuration object with comprehensive options
 *
 * @type {DownloadConfig}
 */
const CONFIG = {
    // Core configuration
    docName: "TypeFest",
    baseUrl:
        "https://raw.githubusercontent.com/sindresorhus/type-fest/refs/heads/main",
    pages: [
        "readme.md",
        "index.d.ts",
        // Basic utilities
        "source/basic.d.ts",
        "source/primitive.d.ts",
        "source/empty-object.d.ts",
        "source/non-empty-object.d.ts",
        "source/unknown-record.d.ts",
        "source/unknown-array.d.ts",
        // Object manipulation
        "source/except.d.ts",
        "source/merge.d.ts",
        "source/merge-deep.d.ts",
        "source/merge-exclusive.d.ts",
        "source/override-properties.d.ts",
        "source/pick-deep.d.ts",
        "source/omit-deep.d.ts",
        "source/partial-deep.d.ts",
        "source/required-deep.d.ts",
        "source/readonly-deep.d.ts",
        "source/writable.d.ts",
        "source/writable-deep.d.ts",
        // Conditional types
        "source/conditional-keys.d.ts",
        "source/conditional-pick.d.ts",
        "source/conditional-pick-deep.d.ts",
        "source/conditional-except.d.ts",
        // Type guards and checks
        "source/if.d.ts",
        "source/is-any.d.ts",
        "source/is-never.d.ts",
        "source/is-unknown.d.ts",
        "source/is-null.d.ts",
        "source/is-literal.d.ts",
        "source/is-empty-object.d.ts",
        "source/is-equal.d.ts",
        "source/is-optional.d.ts",
        "source/is-nullable.d.ts",
        // Utility types
        "source/literal-union.d.ts",
        "source/tagged.d.ts",
        "source/invariant-of.d.ts",
        "source/set-optional.d.ts",
        "source/set-required.d.ts",
        "source/set-readonly.d.ts",
        "source/set-non-nullable.d.ts",
        "source/value-of.d.ts",
        "source/entries.d.ts",
        "source/simplify.d.ts",
        "source/simplify-deep.d.ts",
        // String manipulation
        "source/camel-case.d.ts",
        "source/kebab-case.d.ts",
        "source/pascal-case.d.ts",
        "source/snake-case.d.ts",
        "source/trim.d.ts",
        "source/split.d.ts",
        "source/replace.d.ts",
        // Array and tuple utilities
        "source/arrayable.d.ts",
        "source/includes.d.ts",
        "source/join.d.ts",
        "source/tuple-to-union.d.ts",
        "source/union-to-tuple.d.ts",
        "source/last-array-element.d.ts",
        "source/fixed-length-array.d.ts",
        "source/readonly-tuple.d.ts",
        // JSON and async
        "source/json-value.d.ts",
        "source/jsonify.d.ts",
        "source/jsonifiable.d.ts",
        "source/promisable.d.ts",
        "source/async-return-type.d.ts",
        "source/asyncify.d.ts",
        // Advanced types
        "source/union-to-intersection.d.ts",
        "source/get.d.ts",
        "source/paths.d.ts",
        "source/exact.d.ts",
        "source/schema.d.ts",
        // Numeric types
        "source/numeric.d.ts",
        "source/greater-than.d.ts",
        "source/less-than.d.ts",
        "source/sum.d.ts",
        "source/subtract.d.ts",
        // Configuration files
        "source/package-json.d.ts",
        "source/tsconfig-json.d.ts",
    ],

    // Format configuration
    inputFormat: "gfm",
    outputFormat: "gfm",
    outputExt: "md",
    subdirs: ["docs", "packages"],

    // Performance and reliability
    enableCache: true,
    enableParallel: true,
    enableValidation: true,
    maxRetries: 3,
    timeout: 30000,
    concurrency: 5,

    // Content processing
    removeFromMarkers: ["::::: sponsors_container"],
    removeLineMarkers: ["::::::: body"],
    removeAboveMarkers: ["::::: start_here"],

    // Validation rules
    minContentLength: 10,
    requiredPatterns: [],
    forbiddenPatterns: [
        "404 Not Found",
        "Page not found",
        "Access denied",
    ],

    // Logging
    verbose: false,
};

/**
 * Parse command line arguments and merge with config
 *
 * @returns {DownloadConfig} Enhanced configuration
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const config = { ...CONFIG };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case "--help":
            case "-h":
                showHelp();
                process.exit(0);
                break;
            case "--cache":
                config.enableCache = true;
                break;
            case "--no-cache":
                config.enableCache = false;
                break;
            case "--parallel":
                config.enableParallel = true;
                break;
            case "--no-parallel":
                config.enableParallel = false;
                break;
            case "--validate":
                config.enableValidation = true;
                break;
            case "--no-validate":
                config.enableValidation = false;
                break;
            case "--retry":
                if (nextArg && !isNaN(parseInt(nextArg))) {
                    config.maxRetries = parseInt(nextArg);
                    i++;
                }
                break;
            case "--timeout":
                if (nextArg && !isNaN(parseInt(nextArg))) {
                    config.timeout = parseInt(nextArg) * 1000;
                    i++;
                }
                break;
            case "--concurrency":
                if (nextArg && !isNaN(parseInt(nextArg))) {
                    config.concurrency = parseInt(nextArg);
                    i++;
                }
                break;
            case "--doc-name":
                if (nextArg) {
                    config.docName = nextArg;
                    i++;
                }
                break;
            case "--base-url":
                if (nextArg) {
                    config.baseUrl = nextArg.replace(/\/+$/, ""); // Remove trailing slashes
                    i++;
                }
                break;
        }
    }

    return config;
}

/**
 * Display comprehensive help information
 */
function showHelp() {
    console.log(`
Universal Documentation Downloader v2.0.0

USAGE:
  node scripts/download-docs-template.mjs [OPTIONS]

OPTIONS:
  --help, -h              Show this help message
  --cache                 Enable caching (default: true)
  --no-cache              Disable caching
  --parallel              Enable parallel processing (default: true)
  --no-parallel           Disable parallel processing
  --validate              Enable content validation (default: true)
  --no-validate           Disable content validation
  --retry <n>             Max retry attempts (default: 3)
  --timeout <seconds>     Request timeout in seconds (default: 30)
  --concurrency <n>       Max concurrent downloads (default: 5)
  --doc-name <name>       Documentation set name
  --base-url <url>        Base URL for documentation

ENVIRONMENT VARIABLES:
  DOCS_OUTPUT_DIR         Custom output directory
  DOC_DOWNLOADER_CACHE    Cache directory override
  DOC_DOWNLOADER_VERBOSE  Enable verbose logging

EXAMPLES:
  node scripts/download-docs-template.mjs --cache --parallel
  node scripts/download-docs-template.mjs --retry=5 --timeout=60
  DOCS_OUTPUT_DIR=/tmp/docs node scripts/download-docs-template.mjs
`);
}

/* ==================== ENHANCED UTILITIES ==================== */

/**
 * Enhanced logger with multiple levels and formatting
 */
class Logger {
    constructor(verbose = false) {
        this.verbose = verbose || process.env.DOC_DOWNLOADER_VERBOSE === "true";
        this.startTime = Date.now();
    }

    info(message, ...args) {
        console.log(`ℹ️ ${message}`, ...args);
    }

    success(message, ...args) {
        console.log(`✅ ${message}`, ...args);
    }

    warn(message, ...args) {
        console.warn(`⚠️ ${message}`, ...args);
    }

    error(message, ...args) {
        console.error(`❌ ${message}`, ...args);
    }

    debug(message, ...args) {
        if (this.verbose) {
            console.log(`🔍 ${message}`, ...args);
        }
    }

    progress(current, total, item = "") {
        const percent = Math.round((current / total) * 100);
        const elapsed = Date.now() - this.startTime;
        const rate = current / (elapsed / 1000);
        const eta = total > current ? Math.round((total - current) / rate) : 0;

        console.log(
            `📊 Progress: ${current}/${total} (${percent}%) - ${item} - ETA: ${eta}s`
        );
    }
}

/**
 * Initialize application with configuration and setup
 *
 * @returns {Promise<{
 *     config: DownloadConfig;
 *     logger: Logger;
 *     paths: Object;
 * }>}
 */
async function initialize() {
    const config = parseArguments();
    const logger = new Logger(config.verbose);

    // Setup paths
    let outputDir;
    if (process.env.DOCS_OUTPUT_DIR) {
        outputDir = path.isAbsolute(process.env.DOCS_OUTPUT_DIR)
            ? process.env.DOCS_OUTPUT_DIR
            : path.resolve(process.cwd(), process.env.DOCS_OUTPUT_DIR);
    } else {
        outputDir = path.join(process.cwd(), ...config.subdirs, config.docName);
    }
    outputDir = path.resolve(outputDir);

    const paths = {
        outputDir,
        logFile: path.join(outputDir, `${config.docName}-Download-Log.md`),
        hashesFile: path.join(outputDir, `${config.docName}-Hashes.json`),
        cacheDir:
            process.env.DOC_DOWNLOADER_CACHE || path.join(outputDir, ".cache"),
    };

    // Ensure directories exist
    await fs.mkdir(outputDir, { recursive: true });
    if (config.enableCache) {
        await fs.mkdir(paths.cacheDir, { recursive: true });
    }

    logger.info(`Documentation Downloader v2.0.0 initialized`);
    logger.debug(`Output directory: ${outputDir}`);
    logger.debug(`Configuration:`, config);

    return { config, logger, paths };
}

/**
 * Enhanced content validator with comprehensive checks
 *
 * @param {string} content - Content to validate
 * @param {DownloadConfig} config - Configuration object
 * @param {Logger} logger - Logger instance
 *
 * @returns {boolean} Whether content is valid
 */
function validateContent(content, config, logger) {
    if (!config.enableValidation) {
        return true;
    }

    // Check minimum length
    if (content.length < config.minContentLength) {
        logger.warn(
            `Content too short: ${content.length} < ${config.minContentLength} characters`
        );
        return false;
    }

    // Check for forbidden patterns
    for (const pattern of config.forbiddenPatterns) {
        if (content.includes(pattern)) {
            logger.warn(`Found forbidden pattern: "${pattern}"`);
            return false;
        }
    }

    // Check for required patterns (if any)
    for (const pattern of config.requiredPatterns) {
        if (!content.includes(pattern)) {
            logger.warn(`Missing required pattern: "${pattern}"`);
            return false;
        }
    }

    logger.debug(`Content validation passed`);
    return true;
}

/**
 * Enhanced link rewriter with better URL handling
 *
 * @param {string} content - Content to process
 * @param {string} baseUrl - Base URL for resolving links
 * @param {Logger} logger - Logger instance
 *
 * @returns {string} Processed content
 */
function rewriteLinks(content, baseUrl, logger) {
    let linkCount = 0;

    const processed = content.replace(
        /\((\.{1,2}\/[^\)\s]+)\)/g,
        (match, relPath) => {
            if (relPath.includes("#") || relPath.includes("?")) {
                return match; // Skip anchors and query params
            }

            try {
                const absUrl = new URL(relPath, baseUrl + "/").toString();
                linkCount++;
                return `(${absUrl})`;
            } catch (error) {
                logger.warn(
                    `Failed to rewrite link: ${relPath} - ${error.message}`
                );
                return match;
            }
        }
    );

    if (linkCount > 0) {
        logger.debug(`Rewrote ${linkCount} relative links to absolute URLs`);
    }

    return processed;
}

/**
 * Enhanced content cleaner with configurable rules
 *
 * @param {string} content - Content to clean
 * @param {DownloadConfig} config - Configuration object
 * @param {Logger} logger - Logger instance
 *
 * @returns {string} Cleaned content
 */
function cleanContent(content, config, logger) {
    let cleaned = content;
    let changesMade = 0;

    // Remove content from markers onward
    for (const marker of config.removeFromMarkers || []) {
        const idx = cleaned.indexOf(marker);
        if (idx !== -1) {
            const lineStart = cleaned.lastIndexOf("\n", idx) + 1;
            cleaned = cleaned.slice(0, lineStart);
            changesMade++;
            logger.debug(`Removed content from marker: "${marker}"`);
        }
    }

    // Remove content above markers
    for (const marker of config.removeAboveMarkers || []) {
        const idx = cleaned.indexOf(marker);
        if (idx !== -1) {
            const lineStart = cleaned.lastIndexOf("\n", idx) + 1;
            cleaned = cleaned.slice(lineStart);
            changesMade++;
            logger.debug(`Removed content above marker: "${marker}"`);
        }
    }

    // Remove lines containing markers
    if (config.removeLineMarkers && config.removeLineMarkers.length > 0) {
        const lines = cleaned.split("\n");
        const originalLineCount = lines.length;

        const filteredLines = lines.filter(
            (line) =>
                !config.removeLineMarkers.some((marker) =>
                    line.includes(marker)
                )
        );

        if (filteredLines.length < originalLineCount) {
            changesMade++;
            logger.debug(
                `Removed ${originalLineCount - filteredLines.length} lines containing markers`
            );
        }

        cleaned = filteredLines.join("\n").trimEnd();
    }

    if (changesMade > 0) {
        logger.debug(
            `Content cleaning completed: ${changesMade} operations applied`
        );
    }

    return cleaned;
}

/**
 * Convert TypeScript definition file content to proper markdown format
 *
 * @param {string} content - Raw TypeScript content
 * @param {string} filename - Original filename for context
 *
 * @returns {string} Properly formatted markdown content
 */
function convertTypeScriptToMarkdown(content, filename) {
    // Extract JSDoc comments and code separately
    const lines = content.split("\n");
    const result = [];
    let inComment = false;
    let commentBuffer = [];
    let codeBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Handle multi-line JSDoc comments
        if (trimmedLine.startsWith("/**")) {
            inComment = true;
            commentBuffer = [line];
            continue;
        }

        if (inComment) {
            commentBuffer.push(line);
            if (trimmedLine.endsWith("*/")) {
                inComment = false;
                // Process comment buffer - remove /** */ and * prefixes
                const processedComment = commentBuffer
                    .map((l) =>
                        l.replace(/^\s*\/?\*+\/?/, "").replace(/^\s*\*\s?/, "")
                    )
                    .filter((l) => l.trim() !== "")
                    .join("\n");

                if (processedComment.trim()) {
                    result.push(processedComment.trim());
                    result.push(""); // Empty line after comment
                }
                commentBuffer = [];
                continue;
            }
            continue;
        }

        // Handle TypeScript code
        if (trimmedLine && !trimmedLine.startsWith("//")) {
            codeBuffer.push(line);
        } else if (codeBuffer.length > 0) {
            // End of code block, wrap it
            result.push("```typescript");
            result.push(...codeBuffer);
            result.push("```");
            result.push(""); // Empty line after code block
            codeBuffer = [];
        }
    }

    // Handle any remaining code
    if (codeBuffer.length > 0) {
        result.push("```typescript");
        result.push(...codeBuffer);
        result.push("```");
    }

    return result.join("\n");
}

/**
 * Download a single file with retry logic
 *
 * @param {Object} task - Download task
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Object} paths - Path configuration
 *
 * @returns {Promise<Object>} Download result
 */
async function downloadFile(task, config, logger, paths) {
    const { page, url, outputPath } = task;
    let lastError = null;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
            logger.debug(
                `Downloading ${page} (attempt ${attempt}/${config.maxRetries})`
            );

            // Ensure output directory exists
            await fs.mkdir(path.dirname(outputPath), { recursive: true });

            // For TypeScript files, download raw content and preprocess
            if (page.endsWith(".d.ts")) {
                // Download raw content using fetch with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(
                    () => controller.abort(),
                    config.timeout
                );

                try {
                    const response = await fetch(url, {
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(
                            `HTTP ${response.status}: ${response.statusText}`
                        );
                    }

                    const rawContent = await response.text();

                    if (!rawContent || rawContent.trim().length === 0) {
                        throw new Error(`Downloaded file is empty: ${page}`);
                    }

                    // Convert TypeScript to proper markdown
                    const markdownContent = convertTypeScriptToMarkdown(
                        rawContent,
                        page
                    );

                    // Create a temporary file with the markdown content
                    const tempFile = outputPath.replace(".md", ".temp.md");
                    await fs.writeFile(tempFile, markdownContent, "utf8");

                    // Use pandoc to process the proper markdown
                    const cmd = [
                        "pandoc",
                        "--wrap=preserve",
                        tempFile,
                        "-f",
                        "gfm", // Now using actual markdown as input
                        "-t",
                        config.outputFormat,
                        "-o",
                        outputPath,
                    ];

                    await execFileAsync("pandoc", cmd.slice(1), {
                        timeout: config.timeout,
                        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                    });

                    // Clean up temp file
                    await fs.unlink(tempFile).catch(() => {}); // Ignore cleanup errors

                    // Read the processed content
                    let content = await fs.readFile(outputPath, "utf8");

                    // Additional processing
                    content = rewriteLinks(content, config.baseUrl, logger);
                    content = cleanContent(content, config, logger);

                    // Write final content
                    await fs.writeFile(outputPath, content, "utf8");

                    const hash = crypto
                        .createHash("sha256")
                        .update(content)
                        .digest("hex");
                    logger.success(
                        `Downloaded and processed TypeScript file: ${page}`
                    );

                    return {
                        page,
                        outputPath,
                        success: true,
                        hash,
                        size: content.length,
                        attempts: attempt,
                    };
                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    throw fetchError;
                }
            } else {
                // For non-TypeScript files, use original pandoc method
                const cmd = [
                    "pandoc",
                    "--wrap=preserve",
                    url,
                    "-f",
                    config.inputFormat,
                    "-t",
                    config.outputFormat,
                    "-o",
                    outputPath,
                ];

                await execFileAsync("pandoc", cmd.slice(1), {
                    timeout: config.timeout,
                    maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                });

                // Verify file was created
                if (!fsSync.existsSync(outputPath)) {
                    throw new Error(`Output file not created: ${outputPath}`);
                }

                // Read and process content
                let content = await fs.readFile(outputPath, "utf8");

                if (!content || content.trim().length === 0) {
                    throw new Error(`Downloaded file is empty: ${outputPath}`);
                }

                // Validate content
                if (!validateContent(content, config, logger)) {
                    throw new Error(`Content validation failed for: ${page}`);
                }

                // Process content
                content = rewriteLinks(content, config.baseUrl, logger);
                content = cleanContent(content, config, logger);

                // Write processed content
                await fs.writeFile(outputPath, content, "utf8");

                const hash = crypto
                    .createHash("sha256")
                    .update(content)
                    .digest("hex");
                logger.success(`Downloaded: ${page}`);

                return {
                    page,
                    outputPath,
                    success: true,
                    hash,
                    size: content.length,
                    attempts: attempt,
                };
            }
        } catch (error) {
            lastError = error;
            logger.warn(
                `Attempt ${attempt} failed for ${page}: ${error.message}`
            );

            if (attempt < config.maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                logger.debug(`Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    logger.error(
        `Failed to download ${page} after ${config.maxRetries} attempts: ${lastError?.message}`
    );

    return {
        page,
        outputPath,
        success: false,
        error: lastError?.message || "Unknown error",
        attempts: config.maxRetries,
    };
}

/**
 * Download files sequentially
 *
 * @param {Array} tasks - Download tasks
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Object} paths - Path configuration
 *
 * @returns {Promise<Array>} Download results
 */
async function downloadSequential(tasks, config, logger, paths) {
    const results = [];

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        logger.progress(i + 1, tasks.length, task.page);

        const result = await downloadFile(task, config, logger, paths);
        results.push(result);
    }

    return results;
}

/**
 * Download files in parallel with concurrency control
 *
 * @param {Array} tasks - Download tasks
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Object} paths - Path configuration
 *
 * @returns {Promise<Array>} Download results
 */
async function downloadParallel(tasks, config, logger, paths) {
    const results = [];
    const inProgress = new Set();
    let completed = 0;

    // Process tasks in batches to control concurrency
    for (let i = 0; i < tasks.length; i += config.concurrency) {
        const batch = tasks.slice(i, i + config.concurrency);

        const batchPromises = batch.map(async (task) => {
            inProgress.add(task.page);

            try {
                return await downloadFile(task, config, logger, paths);
            } finally {
                inProgress.delete(task.page);
                completed++;
                logger.progress(completed, tasks.length, task.page);
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}

/**
 * Generate comprehensive report of download results
 *
 * @param {Array} results - Download results
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Object} paths - Path configuration
 * @param {Object} previousHashes - Previous file hashes
 *
 * @returns {Promise<void>}
 */
async function generateReport(results, config, logger, paths, previousHashes) {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const changed = successful.filter((r) => previousHashes[r.page] !== r.hash);

    logger.info(`Download Summary:`);
    logger.info(`  Total: ${results.length}`);
    logger.info(`  Successful: ${successful.length}`);
    logger.info(`  Failed: ${failed.length}`);
    logger.info(`  Changed: ${changed.length}`);

    if (failed.length > 0) {
        logger.warn(`Failed downloads:`);
        failed.forEach((f) => logger.warn(`  - ${f.page}: ${f.error}`));
    }

    // Update hashes file
    const newHashes = {};
    successful.forEach((r) => {
        newHashes[r.page] = r.hash;
    });

    if (Object.keys(newHashes).length > 0) {
        await fs.writeFile(
            paths.hashesFile,
            JSON.stringify(newHashes, null, 2),
            "utf8"
        );
        logger.debug(`Updated hashes file: ${paths.hashesFile}`);
    }

    // Generate detailed log entry
    if (changed.length > 0) {
        const timestamp = new Date().toISOString();
        let logEntry = `## 🕓 ${config.docName} docs sync @ ${timestamp}\n`;
        logEntry += `\n### Summary\n`;
        logEntry += `- Total files: ${results.length}\n`;
        logEntry += `- Successful: ${successful.length}\n`;
        logEntry += `- Failed: ${failed.length}\n`;
        logEntry += `- Changed: ${changed.length}\n\n`;

        if (changed.length > 0) {
            logEntry += `### Changed Files\n`;
            changed.forEach((r) => {
                logEntry += `- ✅ ${r.page}\n`;
                logEntry += `  ↳ Hash: \`${r.hash}\`\n`;
                logEntry += `  ↳ Size: ${r.size} bytes\n`;
            });
        }

        if (failed.length > 0) {
            logEntry += `\n### Failed Files\n`;
            failed.forEach((r) => {
                logEntry += `- ❌ ${r.page}\n`;
                logEntry += `  ↳ Error: ${r.error}\n`;
            });
        }

        logEntry += `\n---\n\n`;

        await fs.appendFile(paths.logFile, logEntry, "utf8");
        logger.success(`Log updated: ${paths.logFile}`);
    } else {
        logger.info(`No changes detected - no log entry written`);
    }
}

/* ==================== MAIN APPLICATION ==================== */

/**
 * Main application entry point
 */
async function main() {
    try {
        const { config, logger, paths } = await initialize();

        // Load previous hashes for change detection
        let previousHashes = {};
        try {
            if (fsSync.existsSync(paths.hashesFile)) {
                const hashData = await fs.readFile(paths.hashesFile, "utf8");
                const parsed = JSON.parse(hashData);
                if (
                    parsed &&
                    typeof parsed === "object" &&
                    !Array.isArray(parsed)
                ) {
                    previousHashes = parsed;
                }
            }
        } catch (error) {
            logger.warn(`Failed to load previous hashes: ${error.message}`);
        }

        // Create download tasks
        const downloadTasks = config.pages.map((page) => ({
            page,
            url: `${config.baseUrl}/${page}`,
            outputPath: getOutputPath(page, config, paths),
            attempts: 0,
        }));

        logger.info(`Starting download of ${downloadTasks.length} pages...`);

        // Execute downloads
        const results = config.enableParallel
            ? await downloadParallel(downloadTasks, config, logger, paths)
            : await downloadSequential(downloadTasks, config, logger, paths);

        // Process results and generate report
        await generateReport(results, config, logger, paths, previousHashes);

        logger.success(`Download completed successfully!`);
    } catch (error) {
        console.error(`❌ Application failed: ${error.message}`);
        if (process.env.DOC_DOWNLOADER_VERBOSE) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

/**
 * Get output file path for a page
 *
 * @param {string} page - Page path
 * @param {DownloadConfig} config - Configuration
 * @param {Object} paths - Path configuration
 *
 * @returns {string} Output file path
 */
function getOutputPath(page, config, paths) {
    const parsed = path.parse(page);
    const fileName = path.join(
        parsed.dir,
        `${parsed.name}.${config.outputExt}`
    );
    return path.join(paths.outputDir, fileName);
}

// Execute main function if this is the main module
import { pathToFileURL } from "url";

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(console.error);
}

// Export for testing
export { initialize, validateContent, rewriteLinks, cleanContent };

// Specify input format. FORMAT can be:

// bibtex (BibTeX bibliography)
// biblatex (BibLaTeX bibliography)
// bits (BITS XML, alias for jats)
// commonmark (CommonMark Markdown)
// commonmark_x (CommonMark Markdown with extensions)
// creole (Creole 1.0)
// csljson (CSL JSON bibliography)
// csv (CSV table)
// tsv (TSV table)
// djot (Djot markup)
// docbook (DocBook)
// docx (Word docx)
// dokuwiki (DokuWiki markup)
// endnotexml (EndNote XML bibliography)
// epub (EPUB)
// fb2 (FictionBook2 e-book)
// gfm (GitHub-Flavored Markdown), or the deprecated and less accurate markdown_github; use markdown_github only if you need extensions not supported in gfm.
// haddock (Haddock markup)
// html (HTML)
// ipynb (Jupyter notebook)
// jats (JATS XML)
// jira (Jira/Confluence wiki markup)
// json (JSON version of native AST)
// latex (LaTeX)
// markdown (Pandoc’s Markdown)
// markdown_mmd (MultiMarkdown)
// markdown_phpextra (PHP Markdown Extra)
// markdown_strict (original unextended Markdown)
// mediawiki (MediaWiki markup)
// man (roff man)
// mdoc (mdoc manual page markup)
// muse (Muse)
// native (native Haskell)
// odt (OpenDocument text document)
// opml (OPML)
// org (Emacs Org mode)
// pod (Perl’s Plain Old Documentation)
// ris (RIS bibliography)
// rtf (Rich Text Format)
// rst (reStructuredText)
// t2t (txt2tags)
// textile (Textile)
// tikiwiki (TikiWiki markup)
// twiki (TWiki markup)
// typst (typst)
// vimwiki (Vimwiki)
// the path of a custom Lua reader, see Custom readers and writers below
// Extensions can be individually enabled or disabled by appending +EXTENSION or -EXTENSION to the format name. See Extensions below, for a list of extensions and their names. See --list-input-formats and --list-extensions, below.

// -t FORMAT, -w FORMAT, --to=FORMAT, --write=FORMAT
// Specify output format. FORMAT can be:

// ansi (text with ANSI escape codes, for terminal viewing)
// asciidoc (modern AsciiDoc as interpreted by AsciiDoctor)
// asciidoc_legacy (AsciiDoc as interpreted by asciidoc-py).
// asciidoctor (deprecated synonym for asciidoc)
// beamer (LaTeX beamer slide show)
// bibtex (BibTeX bibliography)
// biblatex (BibLaTeX bibliography)
// chunkedhtml (zip archive of multiple linked HTML files)
// commonmark (CommonMark Markdown)
// commonmark_x (CommonMark Markdown with extensions)
// context (ConTeXt)
// csljson (CSL JSON bibliography)
// djot (Djot markup)
// docbook or docbook4 (DocBook 4)
// docbook5 (DocBook 5)
// docx (Word docx)
// dokuwiki (DokuWiki markup)
// epub or epub3 (EPUB v3 book)
// epub2 (EPUB v2)
// fb2 (FictionBook2 e-book)
// gfm (GitHub-Flavored Markdown), or the deprecated and less accurate markdown_github; use markdown_github only if you need extensions not supported in gfm.
// haddock (Haddock markup)
// html or html5 (HTML, i.e. HTML5/XHTML polyglot markup)
// html4 (XHTML 1.0 Transitional)
// icml (InDesign ICML)
// ipynb (Jupyter notebook)
// jats_archiving (JATS XML, Archiving and Interchange Tag Set)
// jats_articleauthoring (JATS XML, Article Authoring Tag Set)
// jats_publishing (JATS XML, Journal Publishing Tag Set)
// jats (alias for jats_archiving)
// jira (Jira/Confluence wiki markup)
// json (JSON version of native AST)
// latex (LaTeX)
// man (roff man)
// markdown (Pandoc’s Markdown)
// markdown_mmd (MultiMarkdown)
// markdown_phpextra (PHP Markdown Extra)
// markdown_strict (original unextended Markdown)
// markua (Markua)
// mediawiki (MediaWiki markup)
// ms (roff ms)
// muse (Muse)
// native (native Haskell)
// odt (OpenDocument text document)
// opml (OPML)
// opendocument (OpenDocument XML)
// org (Emacs Org mode)
// pdf (PDF)
// plain (plain text)
// pptx (PowerPoint slide show)
// rst (reStructuredText)
// rtf (Rich Text Format)
// texinfo (GNU Texinfo)
// textile (Textile)
// slideous (Slideous HTML and JavaScript slide show)
// slidy (Slidy HTML and JavaScript slide show)
// dzslides (DZSlides HTML5 + JavaScript slide show)
// revealjs (reveal.js HTML5 + JavaScript slide show)
// s5 (S5 HTML and JavaScript slide show)
// tei (TEI Simple)
// typst (typst)
// xwiki (XWiki markup)
// zimwiki (ZimWiki markup)
// the path of a custom Lua writer, see Custom readers and writers below
