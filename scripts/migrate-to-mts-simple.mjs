#!/usr/bin/env node

/**
 * Simplified TypeScript to .mts Migration Script.
 *
 * This script:
 *
 * 1. Renames a .ts file to .mts
 * 2. Updates all local imports to use .mjs extensions.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Configuration.
 */
const CONFIG = {
    sourceExtensions: [".ts", ".tsx"],
    targetExtension: ".mts",
    jsExtension: ".mjs",
    createBackups: true,
};

const REPOSITORY_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);

/**
 * Show command usage.
 */
function showHelp() {
    console.log(`
TypeScript to .mts Migration Script

Usage: node migrate-to-mts-simple.mjs <file-path> [options]

Options:
  --dry-run     Preview changes without making them
  --no-backup   Don't create backup files
  --help, -h    Show this help

Examples:
  node migrate-to-mts-simple.mjs ./electron/main.ts
  node migrate-to-mts-simple.mjs ./test/sample.ts --dry-run
        `);
}

/**
 * Check whether a resolved path stays within the repository.
 *
 * @param {string} resolvedPath
 */
function isRepositoryPath(resolvedPath) {
    const relativePath = path.relative(REPOSITORY_ROOT, resolvedPath);
    return (
        relativePath === "" ||
        (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
    );
}

/**
 * Parse command-line arguments.
 *
 * @param {string[]} args
 */
function parseArgs(args) {
    const options = {
        createBackups: CONFIG.createBackups,
        filePath: "",
        help: false,
        isDryRun: false,
    };

    for (const arg of args) {
        switch (arg) {
            case "--dry-run": {
                options.isDryRun = true;
                break;
            }

            case "--no-backup": {
                options.createBackups = false;
                break;
            }

            case "--help":
            case "-h": {
                options.help = true;
                break;
            }

            default: {
                if (arg.startsWith("-")) {
                    throw new Error(`Unknown option: ${arg}`);
                }

                if (options.filePath !== "") {
                    throw new Error(`Unexpected extra file path: ${arg}`);
                }

                options.filePath = arg;
            }
        }
    }

    return options;
}

/**
 * Resolve and validate a CLI-provided file path.
 *
 * @param {string} filePath
 */
function resolveCliFilePath(filePath) {
    if (filePath === "") {
        throw new Error("No file path provided");
    }

    const resolvedPath = path.resolve(filePath);

    if (!isRepositoryPath(resolvedPath)) {
        throw new Error(`File must be inside the repository: ${filePath}`);
    }

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`);
    }

    return resolvedPath;
}

/**
 * Logger with colors.
 */
const log = {
    info: (/** @type {any} */ msg) =>
        console.log(`\u001B[36m[INFO]\u001B[0m ${msg}`),
    success: (/** @type {any} */ msg) =>
        console.log(`\u001B[32m[SUCCESS]\u001B[0m ${msg}`),
    warning: (/** @type {any} */ msg) =>
        console.log(`\u001B[33m[WARNING]\u001B[0m ${msg}`),
    error: (/** @type {any} */ msg) =>
        console.log(`\u001B[31m[ERROR]\u001B[0m ${msg}`),
};

/**
 * Check if import path is local (should be updated).
 *
 * @param {string} importPath
 */
function isLocalImport(importPath) {
    // Local imports start with ./ or ../ or @shared/@electron/@app
    return /^(?<temp2>\.{1,2}\/|@(?<temp1>shared|electron|app)\/)/.test(
        importPath
    );
}

/**
 * Update import path to use .mjs extension.
 *
 * @param {string} importPath
 */
function updateImportPath(importPath) {
    if (!isLocalImport(importPath)) {
        return importPath; // Skip npm packages
    }

    if (importPath.endsWith(".mjs")) {
        return importPath; // Already correct
    }

    // Remove existing extension and add .mjs
    const withoutExt = importPath.replace(/\.(?<temp1>ts|tsx|js|jsx)$/, "");
    return withoutExt + CONFIG.jsExtension;
}

/**
 * Process file content and update imports.
 *
 * @param {string} content
 */
function processImports(content) {
    let updated = content;
    let changeCount = 0;

    // Pattern to match import statements
    const importPatterns = [
        // import ... from '...'
        /(?<temp3>\bimport\s+(?:(?:{[^}]*}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:{[^}]*}|\*\s+as\s+\w+))?)?\s+from\s+["'`])(?<temp2>[^"'`]+)(?<temp1>["'`])/g,
        // import type ... from '...'
        /(?<temp3>\bimport\s+type\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+["'`])(?<temp2>[^"'`]+)(?<temp1>["'`])/g,
        // import('...')
        /(?<temp3>import\s*\(\s*["'`])(?<temp2>[^"'`]+)(?<temp1>["'`]\s*\))/g,
        // export ... from '...'
        /(?<temp3>\bexport\s+(?:{[^}]*}|\*)\s+from\s+["'`])(?<temp2>[^"'`]+)(?<temp1>["'`])/g,
    ];

    importPatterns.forEach((pattern) => {
        updated = updated.replace(
            pattern,
            (
                /** @type {any} */ match,
                /** @type {any} */ prefix,
                /** @type {any} */ importPath,
                /** @type {any} */ suffix
            ) => {
                const newPath = updateImportPath(importPath);
                if (newPath !== importPath) {
                    changeCount++;
                    log.info(`  Updated: "${importPath}" → "${newPath}"`);
                    return prefix + newPath + suffix;
                }
                return match;
            }
        );
    });

    log.info(`Updated ${changeCount} import statements`);
    return updated;
}

/**
 * Migrate a TypeScript file to .mts.
 *
 * @param {string} filePath
 * @param isDryRun
 */
function migrateFile(
    filePath,
    isDryRun = false,
    createBackups = CONFIG.createBackups
) {
    try {
        // Validate file
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const ext = path.extname(filePath);
        if (!CONFIG.sourceExtensions.includes(ext)) {
            throw new Error(`Unsupported extension: ${ext}`);
        }

        log.info(`Processing: ${filePath}`);

        // Read and process content
        const originalContent = fs.readFileSync(filePath, "utf8");
        const updatedContent = processImports(originalContent);

        if (isDryRun) {
            log.info("=== DRY RUN - Preview of changes ===");
            if (originalContent === updatedContent) {
                log.info("No changes needed");
            } else {
                console.log("\nUpdated content:");
                console.log(updatedContent);
            }
            return;
        }

        // Create backup
        if (createBackups) {
            const backupPath = `${filePath}.backup`;
            fs.copyFileSync(filePath, backupPath);
            log.info(`Backup created: ${backupPath}`);
        }

        // Create new file path
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath, ext);
        const newFilePath = path.join(dir, basename + CONFIG.targetExtension);

        // Write new file
        fs.writeFileSync(newFilePath, updatedContent, "utf8");

        // Remove original if different
        if (filePath === newFilePath) {
            log.success(`Updated: ${path.basename(filePath)}`);
        } else {
            fs.unlinkSync(filePath);
            log.success(
                `Migrated: ${path.basename(filePath)} → ${path.basename(newFilePath)}`
            );
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        log.error(`Failed to migrate ${filePath}: ${errorMessage}`);
        throw error;
    }
}

/**
 * Main function.
 */
function main() {
    try {
        const options = parseArgs(process.argv.slice(2));

        if (options.help) {
            showHelp();
            return;
        }

        if (options.filePath === "") {
            showHelp();
            process.exit(1);
        }

        const resolvedPath = resolveCliFilePath(options.filePath);
        migrateFile(resolvedPath, options.isDryRun, options.createBackups);
        log.success("Migration completed!");
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        log.error(errorMessage);
        process.exit(1);
    }
}

// Run if called directly
if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    main();
}

export {
    migrateFile,
    parseArgs,
    processImports,
    updateImportPath,
    isLocalImport,
};
