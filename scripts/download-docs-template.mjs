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

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
/** @typedef {import("http")} http */
/** @typedef {import("https")} https */

const execFileAsync = promisify(execFile);

/* ==================== TYPE DEFINITIONS ==================== */

/**
 * @typedef {Object} ExecFileResult
 *
 * @property {string} stdout - Standard output
 * @property {string} stderr - Standard error
 */

/**
 * @typedef {Object} HttpModule
 *
 * @property {Function} get - HTTP GET method
 */

/**
 * @typedef {Object} HttpResponse
 *
 * @property {number} [statusCode] - HTTP status code
 * @property {Function} setEncoding - Set response encoding
 * @property {Function} on - Event listener
 */

/**
 * @typedef {Object} HttpRequest
 *
 * @property {Function} on - Event listener
 * @property {Function} setTimeout - Set request timeout
 * @property {Function} destroy - Destroy request
 */

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
 * @property {boolean} [force] - Force re-download ignoring cache
 */

/**
 * @typedef {Object} Paths
 *
 * @property {string} outputDir - Output directory path
 * @property {string} logFile - Log file path
 * @property {string} hashesFile - Hashes file path
 * @property {string} cacheDir - Cache directory path
 */

/**
 * @typedef {Object} DownloadTask
 *
 * @property {string} page - Page path
 * @property {string} url - Full URL to download
 * @property {string} outputPath - Output file path
 * @property {number} attempts - Number of attempts made
 */

/**
 * @typedef {Object} DownloadResult
 *
 * @property {string} page - Page path
 * @property {string} outputPath - Output file path
 * @property {boolean} success - Whether download succeeded
 * @property {string} [hash] - Content hash (if successful)
 * @property {number} [size] - Content size in bytes (if successful)
 * @property {string} [error] - Error message (if failed)
 * @property {number} attempts - Number of attempts made
 */

/**
 * @typedef {Object} InitializationResult
 *
 * @property {DownloadConfig} config - Parsed configuration
 * @property {Logger} logger - Logger instance
 * @property {Paths} paths - Path configuration
 */

/**
 * @typedef {Object} ValidationResult
 *
 * @property {boolean} isValid - Whether content is valid
 * @property {string[]} [errors] - Validation errors
 */

/**
 * @typedef {Record<string, string>} HashRecord
 */

/* ==================== ENHANCED CONFIGURATION ==================== */

/**
 * Configuration object with comprehensive options
 *
 * @type {DownloadConfig}
 */
const CONFIG = {
    // Core configuration
    docName: "Example-Package",
    baseUrl:
        "https://raw.githubusercontent.com/exampleOrg/exampleRepo/refs/heads/main ", // or master
    pages: [
        "examples/example.js",
        "examples/example2.html",
        "README.md",
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
    minContentLength: 100,
    requiredPatterns: [],
    forbiddenPatterns: [
        "404 Not Found",
        "Page not found",
        "Access denied",
    ],

    // Logging
    verbose: false,
    force: false,
};

/**
 * Parse command line arguments and merge with config
 *
 * @returns {DownloadConfig} Enhanced configuration
 */
function parseArguments() {
    /** @type {string[]} */
    const args = process.argv.slice(2);
    /** @type {DownloadConfig} */
    const config = { ...CONFIG };

    for (let i = 0; i < args.length; i++) {
        /** @type {string} */
        const arg = args[i];
        /** @type {string | undefined} */
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
            case "--force":
                config.force = true;
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
 *
 * @returns {void}
 */
function showHelp() {
    /** @type {string} */
    const msg = [
        "Universal Documentation Downloader v2.0.0",
        "",
        "USAGE:",
        "  node scripts/download-docs-template.mjs [OPTIONS]",
        "",
        "OPTIONS:",
        "  --help, -h              Show this help message",
        "  --cache                 Enable caching (default: true)",
        "  --no-cache              Disable caching",
        "  --parallel              Enable parallel processing (default: true)",
        "  --no-parallel           Disable parallel processing",
        "  --validate              Enable content validation (default: true)",
        "  --no-validate           Disable content validation",
        "  --retry <n>             Max retry attempts (default: 3)",
        "  --force                 Ignore cache & force re-download",
        "  --timeout <seconds>     Request timeout in seconds (default: 30)",
        "  --concurrency <n>       Max concurrent downloads (default: 5)",
        "  --doc-name <name>       Documentation set name",
        "  --base-url <url>        Base URL for documentation",
        "",
        "ENVIRONMENT VARIABLES:",
        "  DOCS_OUTPUT_DIR         Custom output directory",
        "  DOC_DOWNLOADER_CACHE    Cache directory override",
        "  DOC_DOWNLOADER_VERBOSE  Enable verbose logging",
        "",
        "EXAMPLES:",
        "  node scripts/download-docs-template.mjs --cache --parallel",
        "  node scripts/download-docs-template.mjs --retry=5 --timeout=60",
        "  DOCS_OUTPUT_DIR=/tmp/docs node scripts/download-docs-template.mjs",
        "",
    ].join("\n");
    try {
        /** @type {number} */
        const fd = process.stdout.fd;
        fsSync.writeFileSync(fd, msg + "\n");
    } catch {
        console.log(msg);
    }
}

/* ==================== ENHANCED UTILITIES ==================== */

/**
 * Enhanced logger with multiple levels and formatting
 */
class Logger {
    /**
     * @param {boolean} [verbose=false] - Enable verbose logging. Default is
     *   `false`
     */
    constructor(verbose = false) {
        /** @type {boolean} */
        this.verbose =
            verbose || process.env["DOC_DOWNLOADER_VERBOSE"] === "true";
        /** @type {number} */
        this.startTime = Date.now();
    }

    /**
     * @param {string} message
     * @param {...any} args
     *
     * @returns {void}
     */
    info(message, ...args) {
        console.log(`ℹ️ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {...any} args
     *
     * @returns {void}
     */
    success(message, ...args) {
        console.log(`✅ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {...any} args
     *
     * @returns {void}
     */
    warn(message, ...args) {
        console.warn(`⚠️ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {...any} args
     *
     * @returns {void}
     */
    error(message, ...args) {
        console.error(`❌ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {...any} args
     *
     * @returns {void}
     */
    debug(message, ...args) {
        if (this.verbose) {
            console.log(`🔍 ${message}`, ...args);
        }
    }

    /**
     * @param {number} current
     * @param {number} total
     * @param {string} [item=""] Default is `""`
     *
     * @returns {void}
     */
    progress(current, total, item = "") {
        /** @type {number} */
        const percent = Math.round((current / total) * 100);
        /** @type {number} */
        const elapsed = Date.now() - this.startTime;
        /** @type {number} */
        const rate = current / (elapsed / 1000);
        /** @type {number} */
        const eta = total > current ? Math.round((total - current) / rate) : 0;

        console.log(
            `📊 Progress: ${current}/${total} (${percent}%) - ${item} - ETA: ${eta}s`
        );
    }
}

/**
 * Initialize application with configuration and setup
 *
 * @returns {Promise<InitializationResult>}
 */
async function initialize() {
    /** @type {DownloadConfig} */
    const config = parseArguments();
    /** @type {Logger} */
    const logger = new Logger(config.verbose);

    // Setup paths
    /** @type {string} */
    let outputDir;
    if (process.env["DOCS_OUTPUT_DIR"]) {
        outputDir = path.isAbsolute(process.env["DOCS_OUTPUT_DIR"])
            ? process.env["DOCS_OUTPUT_DIR"]
            : path.resolve(process.cwd(), process.env["DOCS_OUTPUT_DIR"]);
    } else {
        outputDir = path.join(process.cwd(), ...config.subdirs, config.docName);
    }
    outputDir = path.resolve(outputDir);

    /** @type {Paths} */
    const paths = {
        outputDir,
        logFile: path.join(outputDir, `${config.docName}-Download-Log.md`),
        hashesFile: path.join(outputDir, `${config.docName}-Hashes.json`),
        cacheDir:
            process.env["DOC_DOWNLOADER_CACHE"] ||
            path.join(outputDir, ".cache"),
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
    /** @type {number} */
    let linkCount = 0;

    /** @type {string} */
    const processed = content.replace(
        /\((\.{1,2}\/[^\)\s]+)\)/g,
        (match, relPath) => {
            if (relPath.includes("#") || relPath.includes("?")) {
                return match; // Skip anchors and query params
            }

            try {
                /** @type {string} */
                const absUrl = new URL(relPath, baseUrl + "/").toString();
                linkCount++;
                return `(${absUrl})`;
            } catch (error) {
                logger.warn(
                    `Failed to rewrite link: ${relPath} - ${error instanceof Error ? error.message : String(error)}`
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
    /** @type {string} */
    let cleaned = content;
    /** @type {number} */
    let changesMade = 0;

    // Remove content from markers onward
    for (const marker of config.removeFromMarkers || []) {
        /** @type {number} */
        const idx = cleaned.indexOf(marker);
        if (idx !== -1) {
            /** @type {number} */
            const lineStart = cleaned.lastIndexOf("\n", idx) + 1;
            cleaned = cleaned.slice(0, lineStart);
            changesMade++;
            logger.debug(`Removed content from marker: "${marker}"`);
        }
    }

    // Remove content above markers
    for (const marker of config.removeAboveMarkers || []) {
        /** @type {number} */
        const idx = cleaned.indexOf(marker);
        if (idx !== -1) {
            /** @type {number} */
            const lineStart = cleaned.lastIndexOf("\n", idx) + 1;
            cleaned = cleaned.slice(lineStart);
            changesMade++;
            logger.debug(`Removed content above marker: "${marker}"`);
        }
    }

    // Remove lines containing markers
    if (config.removeLineMarkers && config.removeLineMarkers.length > 0) {
        /** @type {string[]} */
        const lines = cleaned.split("\n");
        /** @type {number} */
        const originalLineCount = lines.length;

        /** @type {string[]} */
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
 * Download content directly via HTTP/HTTPS
 *
 * @param {string} url - URL to download
 * @param {number} timeoutMs - Timeout in milliseconds
 *
 * @returns {Promise<string>}
 */
async function rawDownload(url, timeoutMs) {
    /** @type {HttpModule} */
    const protocol = await import(url.startsWith("https") ? "https" : "http");
    return new Promise((resolve, reject) => {
        /** @type {HttpRequest} */
        const req = /** @type {HttpRequest} */ (
            protocol.get(url, (/** @type {HttpResponse} */ res) => {
                if (res.statusCode && res.statusCode >= 400) {
                    reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                    return;
                }
                /** @type {string} */
                let data = "";
                res.setEncoding("utf8");
                res.on("data", (/** @type {string} */ c) => (data += c));
                res.on("end", () => resolve(data));
            })
        );
        req.on("error", (/** @type {Error} */ err) => reject(err));
        req.setTimeout(timeoutMs, () =>
            req.destroy(new Error("Request timeout"))
        );
    });
}

/**
 * Check if Pandoc is available on the system
 *
 * @param {Logger} logger - Logger instance
 *
 * @returns {Promise<boolean>} Whether Pandoc is available
 */
async function isPandocAvailable(logger) {
    try {
        await execFileAsync("pandoc", ["--version"], { timeout: 5000 });
        logger.debug("Pandoc is available");
        return true;
    } catch (error) {
        logger.warn(
            `Pandoc not available: ${error instanceof Error ? error.message : String(error)}`
        );
        logger.warn("Falling back to raw HTTP download");
        return false;
    }
}

/**
 * Download a single file with retry logic
 *
 * @param {DownloadTask} task - Download task
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Paths} _paths - Path configuration
 * @param {HashRecord} previousHashes - Previous file hashes
 *
 * @returns {Promise<DownloadResult>} Download result
 */
async function downloadFile(task, config, logger, _paths, previousHashes) {
    const { page, url, outputPath } = task;

    if (config.enableCache && !config.force && fsSync.existsSync(outputPath)) {
        try {
            /** @type {string} */
            const existing = await fs.readFile(outputPath, "utf8");
            /** @type {string} */
            const existingHash = crypto
                .createHash("sha256")
                .update(existing)
                .digest("hex");
            if (previousHashes[page] && previousHashes[page] === existingHash) {
                logger.info(`♻️  Cache hit (unchanged) - skipping ${page}`);
                return {
                    page,
                    outputPath,
                    success: true,
                    hash: existingHash,
                    size: existing.length,
                    attempts: 0,
                };
            }
        } catch (e) {
            logger.debug(
                `Cache check failed for ${page}: ${e instanceof Error ? e.message : String(e)}`
            );
        }
    }

    /** @type {Error | null} */
    let lastError = null;
    /** @type {boolean} */
    const canUsePandoc = await isPandocAvailable(logger);
    /** @type {boolean} */
    const useRaw =
        !canUsePandoc ||
        (config.inputFormat === config.outputFormat &&
            ["md", "markdown"].includes(config.outputExt));

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        try {
            logger.debug(
                `Downloading ${page} (attempt ${attempt}/${config.maxRetries})` +
                    (useRaw ? " [raw]" : " [pandoc]")
            );
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            /** @type {string} */
            let content;
            if (useRaw) {
                content = await rawDownload(url, config.timeout);
                if (!content || content.trim().length === 0) {
                    throw new Error("Empty content body");
                }
                await fs.writeFile(outputPath, content, "utf8");
            } else {
                /** @type {string[]} */
                const cmdArgs = [
                    "--wrap=preserve",
                    url,
                    "-f",
                    config.inputFormat,
                    "-t",
                    config.outputFormat,
                    "-o",
                    outputPath,
                ];
                await execFileAsync("pandoc", cmdArgs, {
                    timeout: config.timeout,
                    maxBuffer: 1024 * 1024 * 10,
                });
                if (!fsSync.existsSync(outputPath)) {
                    throw new Error("Pandoc reported success but file missing");
                }
                content = await fs.readFile(outputPath, "utf8");
            }
            if (!validateContent(content, config, logger)) {
                throw new Error(`Content validation failed for: ${page}`);
            }
            content = rewriteLinks(content, config.baseUrl, logger);
            content = cleanContent(content, config, logger);
            await fs.writeFile(outputPath, content, "utf8");
            /** @type {string} */
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
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));
            logger.warn(
                `Attempt ${attempt} failed for ${page}: ${lastError.message}`
            );
            if (attempt < config.maxRetries) {
                /** @type {number} */
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                logger.debug(`Retrying in ${delay}ms...`);
                await new Promise((r) => setTimeout(r, delay));
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
 * @param {DownloadTask[]} tasks - Download tasks
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Paths} paths - Path configuration
 * @param {HashRecord} previousHashes - Previous file hashes
 *
 * @returns {Promise<DownloadResult[]>} Download results
 */
async function downloadSequential(
    tasks,
    config,
    logger,
    paths,
    previousHashes
) {
    /** @type {DownloadResult[]} */
    const results = [];

    for (let i = 0; i < tasks.length; i++) {
        /** @type {DownloadTask} */
        const task = tasks[i];
        logger.progress(i + 1, tasks.length, task.page);

        /** @type {DownloadResult} */
        const result = await downloadFile(
            task,
            config,
            logger,
            paths,
            previousHashes
        );
        results.push(result);
    }

    return results;
}

/**
 * Download files in parallel with concurrency control
 *
 * @param {DownloadTask[]} tasks - Download tasks
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Paths} paths - Path configuration
 * @param {HashRecord} previousHashes - Previous file hashes
 *
 * @returns {Promise<DownloadResult[]>} Download results
 */
async function downloadParallel(tasks, config, logger, paths, previousHashes) {
    /** @type {DownloadResult[]} */
    const results = [];
    /** @type {Set<string>} */
    const inProgress = new Set();
    /** @type {number} */
    let completed = 0;

    // Process tasks in batches to control concurrency
    for (let i = 0; i < tasks.length; i += config.concurrency) {
        /** @type {DownloadTask[]} */
        const batch = tasks.slice(i, i + config.concurrency);

        /** @type {Promise<DownloadResult>[]} */
        const batchPromises = batch.map(async (task) => {
            inProgress.add(task.page);

            try {
                return await downloadFile(
                    task,
                    config,
                    logger,
                    paths,
                    previousHashes
                );
            } finally {
                inProgress.delete(task.page);
                completed++;
                logger.progress(completed, tasks.length, task.page);
            }
        });

        /** @type {DownloadResult[]} */
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}

/**
 * Generate comprehensive report of download results
 *
 * @param {DownloadResult[]} results - Download results
 * @param {DownloadConfig} config - Configuration
 * @param {Logger} logger - Logger instance
 * @param {Paths} paths - Path configuration
 * @param {HashRecord} previousHashes - Previous file hashes
 *
 * @returns {Promise<void>}
 */
async function generateReport(results, config, logger, paths, previousHashes) {
    /** @type {DownloadResult[]} */
    const successful = results.filter((r) => r.success);
    /** @type {DownloadResult[]} */
    const failed = results.filter((r) => !r.success);
    /** @type {DownloadResult[]} */
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
    /** @type {HashRecord} */
    const newHashes = {};
    successful.forEach((r) => {
        if (r.hash) {
            newHashes[r.page] = r.hash;
        }
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
        /** @type {string} */
        const timestamp = new Date().toISOString();
        /** @type {string} */
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
 *
 * @returns {Promise<void>}
 */
async function main() {
    try {
        /** @type {InitializationResult} */
        const { config, logger, paths } = await initialize();

        // Load previous hashes for change detection
        /** @type {HashRecord} */
        let previousHashes = {};
        try {
            if (fsSync.existsSync(paths.hashesFile)) {
                /** @type {string} */
                const hashData = await fs.readFile(paths.hashesFile, "utf8");
                /** @type {unknown} */
                const parsed = JSON.parse(hashData);
                if (
                    parsed &&
                    typeof parsed === "object" &&
                    !Array.isArray(parsed)
                ) {
                    previousHashes = /** @type {HashRecord} */ (parsed);
                }
            }
        } catch (error) {
            logger.warn(
                `Failed to load previous hashes: ${error instanceof Error ? error.message : String(error)}`
            );
        }

        // Create download tasks
        /** @type {DownloadTask[]} */
        const downloadTasks = config.pages.map((page) => ({
            page,
            url: `${config.baseUrl}/${page}`,
            outputPath: getOutputPath(page, config, paths),
            attempts: 0,
        }));

        logger.info(`Starting download of ${downloadTasks.length} pages...`);

        // Execute downloads
        /** @type {DownloadResult[]} */
        const results = config.enableParallel
            ? await downloadParallel(
                  downloadTasks,
                  config,
                  logger,
                  paths,
                  previousHashes
              )
            : await downloadSequential(
                  downloadTasks,
                  config,
                  logger,
                  paths,
                  previousHashes
              );

        // Process results and generate report
        await generateReport(results, config, logger, paths, previousHashes);

        logger.success(`Download completed successfully!`);
    } catch (error) {
        console.error(
            `❌ Application failed: ${error instanceof Error ? error.message : String(error)}`
        );
        if (process.env["DOC_DOWNLOADER_VERBOSE"]) {
            console.error(error instanceof Error ? error.stack : error);
        }
        process.exit(1);
    }
}

/**
 * Get output file path for a page
 *
 * @param {string} page - Page path
 * @param {DownloadConfig} config - Configuration
 * @param {Paths} paths - Path configuration
 *
 * @returns {string} Output file path
 */
function getOutputPath(page, config, paths) {
    /** @type {path.ParsedPath} */
    const parsed = path.parse(page);
    /** @type {string} */
    const fileName = path.join(
        parsed.dir,
        `${parsed.name}.${config.outputExt}`
    );
    return path.join(paths.outputDir, fileName);
}

// Execute main function if this is the main module
/** @type {string} */
const templateArgvPath = path.resolve(process.argv[1]);
/** @type {string} */
const templateMetaPath = fileURLToPath(import.meta.url);
if (templateMetaPath === templateArgvPath) {
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
