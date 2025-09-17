/**
 * CSpell Custom Words Manager
 *
 * Automatically appends new unknown words found by cspell to custom-words.txt.
 * Provides intelligent filtering, validation, and configuration options.
 *
 * @version 2.0.0
 *
 * @file Enhanced CSpell dictionary management tool with advanced features
 *
 * @author Nick2bad4u
 *
 * @example
 *
 * ```bash
 * # Basic usage
 * node scripts/add-cspell-words.mjs
 *
 * # Custom words file
 * node scripts/add-cspell-words.mjs /path/to/custom-words.txt
 *
 * # With options
 * node scripts/add-cspell-words.mjs --dry-run --verbose --min-length=3
 * ```
 *
 * @requires Node.js >= 16.0.0
 * @requires cspell (installed globally or via npx)
 */

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname;

const cspellConfigPath = "--config .cspell.json";

/**
 * Configuration object for the script with validation and defaults
 *
 * @typedef {Object} Config
 *
 * @property {string} customWordsFile - Path to custom words file
 * @property {string[]} filePatterns - File patterns to check
 * @property {boolean} dryRun - Whether to perform a dry run
 * @property {boolean} verbose - Whether to show verbose output
 * @property {boolean} interactive - Whether to prompt for confirmation
 * @property {number} minWordLength - Minimum word length to include
 * @property {number} maxWordLength - Maximum word length to include
 * @property {string[]} excludePatterns - Patterns to exclude from words
 * @property {boolean} sortWords - Whether to sort words alphabetically
 * @property {boolean} createBackup - Whether to create backup before changes
 */

/**
 * Default configuration
 *
 * @type {Config}
 */
const DEFAULT_CONFIG = {
    customWordsFile: path.join(__dirname, "..", "custom-words.txt"),
    filePatterns: ["**/*.{js,jsx,ts,tsx,md,css,scss,json,html,yml,yaml}"],
    dryRun: false,
    verbose: false,
    interactive: false,
    minWordLength: 2,
    maxWordLength: 50,
    excludePatterns: [
        String.raw`^\d+$`, // Pure numbers
        "^[a-f0-9]{32,}$", // Long hex strings (hashes)
        "^[A-Z_]{2,}$", // All caps constants (likely intentional)
        String.raw`\.(com|org|net|edu|gov)$`, // Domain extensions
        "^(http|https|ftp|ssh)$", // Protocols
    ],
    sortWords: true,
    createBackup: true,
};

/**
 * Parse command line arguments and return configuration
 *
 * @returns {Config} Parsed configuration
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };

    // Handle help flag
    if (args.includes("--help") || args.includes("-h")) {
        showHelp();

        process.exit(0);
    }

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case "--dry-run":
            case "-d": {
                config.dryRun = true;
                break;
            }
            case "--verbose":
            case "-v": {
                config.verbose = true;
                break;
            }
            case "--interactive":
            case "-i": {
                config.interactive = true;
                break;
            }
            case "--no-backup": {
                config.createBackup = false;
                break;
            }
            case "--no-sort": {
                config.sortWords = false;
                break;
            }
            case "--min-length": {
                if (nextArg && !Number.isNaN(Number.parseInt(nextArg, 10))) {
                    config.minWordLength = Number.parseInt(nextArg, 10);
                    i++;
                }
                break;
            }
            case "--max-length": {
                if (nextArg && !Number.isNaN(Number.parseInt(nextArg, 10))) {
                    config.maxWordLength = Number.parseInt(nextArg, 10);
                    i++;
                }
                break;
            }
            case "--patterns": {
                if (nextArg) {
                    config.filePatterns = nextArg.split(",");
                    i++;
                }
                break;
            }
            default: {
                // First positional argument is custom words file path
                if (
                    arg &&
                    !arg.startsWith("-") &&
                    !config.customWordsFile.includes(arg)
                ) {
                    config.customWordsFile = path.resolve(arg);
                }
            }
        }
    }

    // Apply environment variables
    if (process.env["CUSTOM_WORDS_FILE"]) {
        config.customWordsFile = path.resolve(process.env["CUSTOM_WORDS_FILE"]);
    }
    if (process.env["CSPELL_VERBOSE"] === "true") {
        config.verbose = true;
    }

    return config;
}

/**
 * Display help information
 */
function showHelp() {
    console.log(`
CSpell Custom Words Manager v2.0.0

USAGE:
  node scripts/add-cspell-words.mjs [OPTIONS] [CUSTOM_WORDS_FILE]

OPTIONS:
  --dry-run, -d           Show what would be added without making changes
  --verbose, -v           Show detailed output
  --interactive, -i       Prompt for confirmation before adding words
  --no-backup             Don't create backup file before changes
  --no-sort               Don't sort words alphabetically
  --min-length <n>        Minimum word length to include (default: 2)
  --max-length <n>        Maximum word length to include (default: 50)
  --patterns <patterns>   Comma-separated file patterns (default: js,jsx,ts,tsx,md,css,scss,json,html,yml,yaml)
  --help, -h              Show this help message

ENVIRONMENT VARIABLES:
  CUSTOM_WORDS_FILE       Path to custom words file
  CSPELL_VERBOSE          Set to 'true' to enable verbose output

EXAMPLES:
  node scripts/add-cspell-words.mjs
  node scripts/add-cspell-words.mjs --dry-run --verbose
  node scripts/add-cspell-words.mjs /path/to/custom-words.txt --interactive
  node scripts/add-cspell-words.mjs --min-length=3 --patterns="*.ts,*.js"
`);
}

/**
 * Logger utility with different log levels
 */
class Logger {
    constructor(verbose = false) {
        this.verbose = verbose;
    }

    /**
     * @param {string} message
     * @param {undefined[]} args
     */
    info(message, ...args) {
        console.log(`ℹ️ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {undefined[]} args
     */
    success(message, ...args) {
        console.log(`✅ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {undefined[]} args
     */
    warn(message, ...args) {
        console.warn(`⚠️ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {undefined[]} args
     */
    error(message, ...args) {
        console.error(`❌ ${message}`, ...args);
    }

    /**
     * @param {string} message
     * @param {(Config | undefined)[]} args
     */
    debug(message, ...args) {
        if (this.verbose) {
            console.log(`🔍 ${message}`, ...args);
        }
    }

    /**
     * @param {string[]} data
     */
    table(data) {
        console.table(data);
    }
}

/**
 * Validate a word against exclusion patterns and length constraints
 *
 * @param {string} word - Word to validate
 * @param {Config} config - Configuration object
 *
 * @returns {boolean} Whether the word is valid
 */
function isValidWord(word, config) {
    // Check length constraints
    if (
        word.length < config.minWordLength ||
        word.length > config.maxWordLength
    ) {
        return false;
    }

    // Check against exclusion patterns
    for (const pattern of config.excludePatterns) {
        // Use case-insensitive matching for domain patterns, but case-sensitive for caps constants
        const flags =
            pattern.includes("(com|org|net|edu|gov)") ||
            pattern.includes("(http|https|ftp|ssh)")
                ? "i"
                : "";
        if (new RegExp(pattern, flags).test(word)) {
            return false;
        }
    }

    return true;
}

/**
 * Create a backup of the custom words file
 *
 * @param {string} filePath - Path to the file to backup
 * @param {Logger} logger - Logger instance
 *
 * @returns {Promise<string>} Path to the backup file
 */
async function createBackup(filePath, logger) {
    const timestamp = new Date().toISOString().replaceAll(/[.:]/g, "-");
    const backupPath = `${filePath}.backup.${timestamp}`;

    try {
        await fs.copyFile(filePath, backupPath);
        logger.debug(`Created backup: ${backupPath}`);
        return backupPath;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to create backup: ${errorMessage}`);
        throw error;
    }
}

/**
 * Read and parse current custom words from file
 *
 * @param {string} filePath - Path to custom words file
 * @param {Logger} logger - Logger instance
 *
 * @returns {Promise<{ content: string; words: Set<string> }>} Current content
 *   and words
 */
async function readCurrentWords(filePath, logger) {
    let currentWordsContent = "";

    try {
        if (fsSync.existsSync(filePath)) {
            currentWordsContent = await fs.readFile(filePath, "utf8");
            logger.debug(
                `Read ${currentWordsContent.split("\n").length} lines from ${filePath}`
            );
        } else {
            logger.info(
                `Custom words file not found, will create: ${filePath}`
            );
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error(`Failed to read custom words file: ${errorMessage}`);
        throw error;
    }

    const currentWords = new Set(
        currentWordsContent
            .split(/\r?\n/)
            .map((w) => w.trim())
            .filter((w) => w && !w.startsWith("//") && !w.startsWith("#"))
    );

    return { content: currentWordsContent, words: currentWords };
}

/**
 * Run cspell and get unknown words
 *
 * @param {Config} config - Configuration object
 * @param {Logger} logger - Logger instance
 *
 * @returns {Promise<string>} CSpell output
 */
async function runCSpell(config, logger) {
    const cspellCommand = [
        "npx",
        "cspell",
        `"${config.filePatterns.join(",")}"`,
        "--gitignore",
        cspellConfigPath,
        "--words-only",
        "--unique",
        "--no-progress",
    ].join(" ");

    logger.debug(`Running command: ${cspellCommand}`);

    try {
        return execSync(cspellCommand, {
            stdio: "pipe",
            encoding: "utf8",
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        });
    } catch (error) {
        // Cspell returns a non-zero exit code when spelling issues are found,
        // but the output (err.stdout) still contains the list of unknown words we want to process.
        if (
            error &&
            typeof error === "object" &&
            "stdout" in error &&
            error.stdout
        ) {
            if ("stderr" in error && error.stderr) {
                logger.debug(`CSpell stderr: ${String(error.stderr)}`);
            }
            return String(error.stdout);
        }
        if (
            error &&
            typeof error === "object" &&
            "stderr" in error &&
            error.stderr
        ) {
            logger.error(`CSpell stderr: ${String(error.stderr)}`);
        }
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        throw new Error(`CSpell execution failed: ${errorMessage}`, {
            cause: error,
        });
    }
}

/**
 * Process and filter found words
 *
 * @param {string} cspellOutput - Raw output from cspell
 * @param {Set<string>} currentWords - Currently known words
 * @param {Config} config - Configuration object
 * @param {Logger} logger - Logger instance
 *
 * @returns {Set<string>} Filtered new words
 */
function processFoundWords(cspellOutput, currentWords, config, logger) {
    const rawWords = cspellOutput
        .split(/\r?\n/)
        .map((w) => w.trim())
        .filter(Boolean);

    logger.debug(`Found ${rawWords.length} raw words from cspell`);

    const validWords = rawWords.filter((word) => {
        if (currentWords.has(word)) {
            return false;
        }
        return isValidWord(word, config);
    });

    logger.debug(`${validWords.length} words passed validation`);

    return new Set(config.sortWords ? validWords.toSorted() : validWords);
}

/**
 * Prompt user for confirmation in interactive mode
 *
 * @param {Set<string>} words - Words to be added
 * @param {Logger} logger - Logger instance
 *
 * @returns {Promise<boolean>} Whether to proceed
 */
async function promptForConfirmation(words, logger) {
    return new Promise((resolve) => {
        logger.info(`Found ${words.size} new words:`);
        logger.table(Array.from(words).slice(0, 20)); // Show first 20 words

        if (words.size > 20) {
            logger.info(`... and ${words.size - 20} more words`);
        }

        process.stdout.write("Add these words to custom dictionary? (y/N): ");
        process.stdin.once("data", (data) => {
            const answer = data.toString().trim().toLowerCase();
            resolve(answer === "y" || answer === "yes");
        });
    });
}

/**
 * Write updated words to file
 *
 * @param {string} filePath - Path to custom words file
 * @param {string} currentContent - Current file content
 * @param {Set<string>} newWords - New words to add
 * @param {Config} config - Configuration object
 * @param {Logger} logger - Logger instance
 *
 * @returns {Promise<void>}
 */
async function writeUpdatedWords(
    filePath,
    currentContent,
    newWords,
    config,
    logger
) {
    if (config.createBackup && fsSync.existsSync(filePath)) {
        await createBackup(filePath, logger);
    }

    // Prepare content
    const fileContent = currentContent.replace(/\s+$/, "");
    const newWordsArray = Array.from(newWords);
    const newWordsBlock = newWordsArray.join("\n");

    // Write back, ensuring only a single trailing newline in the file
    const updatedContent = `${[fileContent, newWordsBlock]
        .filter(Boolean)
        .join("\n")
        .trimEnd()}\n`;

    if (config.dryRun) {
        logger.info("DRY RUN: Would add the following words:");
        logger.table(newWordsArray);
        logger.info(`Would write to: ${filePath}`);
    } else {
        await fs.writeFile(filePath, updatedContent, "utf8");
        logger.success(`Added ${newWords.size} new words to ${filePath}`);

        if (config.verbose) {
            logger.table(newWordsArray);
        }
    }
}

/**
 * Main execution function
 *
 * @returns {Promise<void>}
 */
async function main() {
    const config = parseArguments();
    const logger = new Logger(config.verbose);

    try {
        logger.info("CSpell Custom Words Manager v2.0.0");
        logger.debug("Configuration:", config);

        // Read current words
        const { content: currentContent, words: currentWords } =
            await readCurrentWords(config.customWordsFile, logger);

        logger.info(`Current dictionary contains ${currentWords.size} words`);

        // Run cspell
        logger.info("Running CSpell to find unknown words...");
        const cspellOutput = await runCSpell(config, logger);

        // Process found words
        const newWords = processFoundWords(
            cspellOutput,
            currentWords,
            config,
            logger
        );

        if (newWords.size === 0) {
            logger.success("No new words to add to dictionary");
            return;
        }

        // Interactive confirmation
        if (config.interactive) {
            const shouldProceed = await promptForConfirmation(newWords, logger);
            if (!shouldProceed) {
                logger.info("Operation cancelled by user");
                return;
            }
        }

        // Write updated words
        await writeUpdatedWords(
            config.customWordsFile,
            currentContent,
            newWords,
            config,
            logger
        );

        // Summary
        logger.info(`Operation completed successfully`);
        logger.info(
            `Dictionary now contains ${currentWords.size + newWords.size} words`
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error(`Script failed: ${errorMessage}`);
        if (config.verbose && error instanceof Error) {
            logger.error(error.stack || "No stack trace available");
        }
        process.exit(1);
    }
}

// Run the script if executed directly
if (import.meta.filename === path.resolve(process.argv[1] || "")) {
    try {
        await main();
    } catch (error) {
        console.error(error);
    }
}
