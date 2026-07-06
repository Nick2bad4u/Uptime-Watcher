#!/usr/bin/env node

/**
 * Script to find and report @shared imports that need to be converted to
 * relative imports This helps identify files causing Rollup parser issues in
 * coverage analysis.
 */

import {
    readdirSync,
    statSync,
    readFileSync,
    existsSync,
    writeFileSync,
} from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_FORMATS = new Set([
    "detailed",
    "json",
    "simple",
]);

const SKIPPED_DIRECTORIES = new Set([
    ".cache",
    ".git",
    ".vs",
    ".vscode",
    "build",
    "coverage",
    "dist",
    "dist-bench",
    "dist-configs",
    "dist-playwright",
    "html",
    "node_modules",
    "playwright-report",
    "release",
    "reports",
    "storybook-static",
    "temp",
    "test-results",
]);

// Configuration
const CONFIG = {
    // Directories to scan for @shared imports
    scanDirs: ["src", "shared"],
    // File extensions to check
    fileExtensions: [
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
    ],
    // Pattern to match @shared imports
    importPattern: /from\s+["']@shared(?<sharedPath>[^"']*)["']/g,
    // Output format options
    outputFormat: "detailed", // 'simple', 'detailed', 'json'
};

/**
 * Parse command-line arguments.
 *
 * @param {string[]} args - Raw command-line arguments.
 *
 * @returns {{ fail: boolean; format: string; help: boolean; save: boolean }}
 *   Parsed options.
 */
function parseArgs(args) {
    const options = {
        fail: false,
        format: CONFIG.outputFormat,
        help: false,
        save: false,
    };

    for (let index = 0; index < args.length; index++) {
        const arg = args[index] ?? "";
        const { inlineValue, option } = splitOptionValue(arg);

        switch (option) {
            case "--help":
            case "-h": {
                options.help = true;
                break;
            }

            case "--save": {
                options.save = true;
                break;
            }

            case "--fail": {
                options.fail = true;
                break;
            }

            case "--format": {
                const value = inlineValue ?? args[index + 1];
                options.format = parseOutputFormat(value);
                index += inlineValue === undefined ? 1 : 0;
                break;
            }

            default: {
                throw new Error(`Unknown option: ${option}`);
            }
        }
    }

    return options;
}

/**
 * Split `--option=value` arguments while preserving space-separated support.
 *
 * @param {string} arg - Raw command-line argument.
 *
 * @returns {{ inlineValue: string | undefined; option: string }} Parsed option.
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
 * Parse and validate a requested output format.
 *
 * @param {string | undefined} value - Raw output format.
 *
 * @returns {string} Valid output format.
 */
function parseOutputFormat(value) {
    if (!value || value.startsWith("-")) {
        throw new Error("--format expects a value");
    }

    if (!OUTPUT_FORMATS.has(value)) {
        throw new Error(`Unsupported output format: ${value}`);
    }

    return value;
}

/**
 * Show CLI usage.
 */
function showHelp() {
    console.log(`
Usage: node scripts/find-shared-imports.mjs [options]

Options:
  --help, -h             Show this help message
  --save                 Save report to shared-imports-report.txt
  --fail                 Exit with code 1 if @shared imports are found
  --format <format>      Output format: simple, detailed, json
  --format=<format>      Output format: simple, detailed, json

Examples:
  node scripts/find-shared-imports.mjs
  node scripts/find-shared-imports.mjs --save --format=json
  node scripts/find-shared-imports.mjs --fail
`);
}

/**
 * Get all files recursively from a directory.
 *
 * @param {string} dir
 * @param {string | string[]} extensions
 */
function getFilesRecursively(dir, extensions) {
    /**
     * @type {string[]}
     */
    const files = [];

    /**
     * @param {string} currentDir
     */
    function traverse(currentDir) {
        const items = readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                // Skip node_modules and other common ignore directories
                if (!SKIPPED_DIRECTORIES.has(item)) {
                    traverse(fullPath);
                }
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }

    traverse(dir);
    return files;
}

/**
 * Calculate relative path from one file to another.
 *
 * @param {string} fromFile
 * @param {string} toPath
 */
function calculateRelativePath(fromFile, toPath) {
    const fromDir = path.dirname(fromFile);
    const relativePath = path.relative(fromDir, toPath);

    // Convert Windows paths to Unix-style for imports
    return relativePath.replaceAll("\\", "/");
}

/**
 * Suggest relative import path for.
 *
 * @param {any} filePath
 * @param {string} sharedPath
 *
 * @shared import
 */
function suggestRelativePath(filePath, sharedPath) {
    const workspaceRoot = process.cwd();
    const sharedDir = path.join(workspaceRoot, "shared");

    // Remove @shared/ prefix and construct full path
    const targetPath = path.join(sharedDir, sharedPath.replace(/^\//, ""));

    // Calculate relative path
    const relativePath = calculateRelativePath(filePath, targetPath);

    // Ensure it starts with ./ or ../
    if (!relativePath.startsWith(".")) {
        return `./${relativePath}`;
    }

    return relativePath;
}

/**
 * Find.
 *
 * @param {import("fs").PathOrFileDescriptor} filePath
 *
 * @shared imports in a file
 */
function findSharedImports(filePath) {
    try {
        const content = readFileSync(filePath, "utf8");
        const imports = [];
        let match;

        // Reset regex
        CONFIG.importPattern.lastIndex = 0;

        while ((match = CONFIG.importPattern.exec(content)) !== null) {
            const fullMatch = match[0];
            const sharedPath = match.groups?.["sharedPath"] ?? "";
            const lineNumber = content
                .slice(0, Math.max(0, match.index))
                .split("\n").length;

            // Get the line content for context
            const lines = content.split("\n");
            const lineContent = lines[lineNumber - 1];

            imports.push({
                line: lineNumber,
                content: lineContent?.trim() || "",
                originalImport: fullMatch,
                sharedPath: sharedPath || "",
                suggestedPath: suggestRelativePath(filePath, sharedPath || ""),
            });
        }

        return imports;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error(`Error reading file ${filePath}:`, errorMessage);
        return [];
    }
}

/**
 * Format output based on configuration.
 *
 * @param {{
 *     filePath: string;
 *     fullPath: any;
 *     imports: {
 *         line: number;
 *         content: string;
 *         originalImport: string;
 *         sharedPath: string;
 *         suggestedPath: string;
 *     }[];
 * }[]} results
 */
function formatOutput(results, format = CONFIG.outputFormat) {
    if (!OUTPUT_FORMATS.has(format)) {
        throw new Error(`Unsupported output format: ${format}`);
    }

    switch (format) {
        case "simple": {
            return formatSimple(results);
        }
        case "json": {
            return JSON.stringify(results, null, 2);
        }

        default: {
            return formatDetailed(results);
        }
    }
}

/**
 * Format simple output (just file paths).
 *
 * @param {any[]} results
 */
function formatSimple(results) {
    const files = results
        .filter(
            (/** @type {{ imports: string | any[] }} */ r) =>
                r.imports.length > 0
        )
        .map((/** @type {{ filePath: any }} */ r) => r.filePath);
    return files.join("\n");
}

/**
 * Format detailed output with import suggestions.
 *
 * @param {any[]} results
 */
function formatDetailed(results) {
    let output = "";
    let totalFiles = 0;
    let totalImports = 0;

    output += `${"=".repeat(80)}\n`;
    output += "SHARED IMPORT ANALYSIS REPORT\n";
    output += `${"=".repeat(80)}\n\n`;

    const filesWithImports = results.filter(
        (/** @type {{ imports: string | any[] }} */ r) => r.imports.length > 0
    );

    if (filesWithImports.length === 0) {
        output +=
            "✅ No @shared imports found! All imports are using relative paths.\n";
        return output;
    }

    for (const result of filesWithImports) {
        totalFiles++;
        totalImports += result.imports.length;

        output += `📁 ${result.filePath}\n`;
        output += `   ${result.imports.length} @shared import(s) found:\n\n`;

        for (const imp of result.imports) {
            output += `   Line ${imp.line}:\n`;
            output += `   Current: ${imp.content}\n`;
            output += `   Replace: ${imp.originalImport}\n`;
            output += `   With:    from "${imp.suggestedPath}"\n\n`;
        }

        output += `${"-".repeat(80)}\n\n`;
    }

    output += `📊 SUMMARY:\n`;
    output += `   Files with @shared imports: ${totalFiles}\n`;
    output += `   Total @shared imports: ${totalImports}\n\n`;

    output += "💡 NEXT STEPS:\n";
    output += "   1. Replace @shared imports with suggested relative paths\n";
    output += "   2. Run this script again to verify all imports are fixed\n";
    output +=
        "   3. Run coverage analysis to check if Rollup parser issues are resolved\n\n";

    return output;
}

/**
 * Main execution function.
 */
function main(options = parseArgs(process.argv.slice(2))) {
    if (options.help) {
        showHelp();
        return;
    }

    console.log("🔍 Scanning for @shared imports...\n");

    const results = [];

    for (const scanDir of CONFIG.scanDirs) {
        const fullScanPath = path.join(process.cwd(), scanDir);

        if (!existsSync(fullScanPath)) {
            console.warn(`⚠️  Directory not found: ${scanDir}`);
            continue;
        }

        console.log(`📂 Scanning ${scanDir}/...`);
        const files = getFilesRecursively(fullScanPath, CONFIG.fileExtensions);

        for (const filePath of files) {
            const relativePath = path.relative(process.cwd(), filePath);
            const imports = findSharedImports(filePath);

            results.push({
                filePath: relativePath,
                fullPath: filePath,
                imports: imports,
            });
        }
    }

    console.log(`\n✅ Scan complete. Checked ${results.length} files.\n`);

    // Output results
    const output = formatOutput(results, options.format);
    console.log(output);

    // Optionally save to file
    if (options.save) {
        const outputFile = "shared-imports-report.txt";
        writeFileSync(outputFile, output);
        console.log(`📄 Report saved to ${outputFile}`);
    }

    // Exit with error code if imports found (useful for CI)
    const hasImports = results.some((r) => r.imports.length > 0);
    if (hasImports && options.fail) {
        process.exit(1);
    }
}

/**
 * Check whether this module was executed directly.
 *
 * @returns {boolean} Whether this is the CLI entrypoint.
 */
function isDirectInvocation() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectInvocation()) {
    try {
        main();
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

export {
    calculateRelativePath,
    findSharedImports,
    formatOutput,
    getFilesRecursively,
    parseArgs,
    parseOutputFormat,
    suggestRelativePath,
};
