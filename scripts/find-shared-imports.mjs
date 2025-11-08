#!/usr/bin/env node
/**
 * Script to find and report @shared imports that need to be converted to
 * relative imports This helps identify files causing Rollup parser issues in
 * coverage analysis
 */

import {
    readdirSync,
    statSync,
    readFileSync,
    existsSync,
    writeFileSync,
} from "node:fs";
import path from "node:path";

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
    importPattern: /from\s+["']@shared[^"']*["']/g,
    // Output format options
    outputFormat: "detailed", // 'simple', 'detailed', 'json'
};

/**
 * Get all files recursively from a directory
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
                if (
                    ![
                        "node_modules",
                        ".git",
                        "dist",
                        "coverage",
                        "build",
                    ].includes(item)
                ) {
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
 * Calculate relative path from one file to another
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
 * Suggest relative import path for
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
 * Find
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
            const sharedPath = match[1];
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
 * Format output based on configuration
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
function formatOutput(results) {
    switch (CONFIG.outputFormat) {
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
 * Format simple output (just file paths)
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
 * Format detailed output with import suggestions
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
 * Main execution function
 */
function main() {
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
    const output = formatOutput(results);
    console.log(output);

    // Optionally save to file
    if (process.argv.includes("--save")) {
        const outputFile = "shared-imports-report.txt";
        writeFileSync(outputFile, output);
        console.log(`📄 Report saved to ${outputFile}`);
    }

    // Exit with error code if imports found (useful for CI)
    const hasImports = results.some((r) => r.imports.length > 0);
    if (hasImports && process.argv.includes("--fail")) {
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Usage: node scripts/find-shared-imports.js [options]

Options:
  --help, -h     Show this help message
  --save         Save report to shared-imports-report.txt
  --fail         Exit with code 1 if @shared imports found (for CI)
  --format=X     Output format: simple, detailed, json (default: detailed)

Examples:
  node scripts/find-shared-imports.js
  node scripts/find-shared-imports.js --save --format=json
  node scripts/find-shared-imports.js --fail
`);
    process.exit(0);
}

// Handle format option
const formatArg = process.argv.find((arg) => arg.startsWith("--format="));
if (formatArg) {
    const format = formatArg.split("=")[1];
    if (format) {
        CONFIG.outputFormat = format;
    }
}

// Run the script
main();
