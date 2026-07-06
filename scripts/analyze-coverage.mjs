#!/usr/bin/env node

/**
 * Analyzes code coverage statistics from an Istanbul coverage-final.json file.
 *
 * @example
 *
 * ```bash
 * node scripts/analyze-coverage.mjs --no-color --format table --limit 20
 * ```
 */

import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Minimal interface for the optional `cli-table3` dependency used by this
 * script when available.
 *
 * @typedef {{
 *     push: (row: unknown[]) => void;
 *     toString: () => string;
 * }} CliTable
 *
 * @typedef {new (options: {
 *     colWidths: number[];
 *     head: string[];
 *     style: { border: unknown[]; head: unknown[] };
 * }) => CliTable} CliTableConstructor
 *
 * @typedef {"csv" | "json" | "table"} OutputFormat
 *
 * @typedef {{
 *     branches: { covered: number; percentage: number; total: number };
 *     file: string;
 *     functions: { covered: number; percentage: number; total: number };
 *     lines: { covered: number; percentage: number; total: number };
 *     statements: { covered: number; percentage: number; total: number };
 * }} FileCoverageAnalysis
 */

const dirname = import.meta.dirname;
const DEFAULTS = {
    coverageRelativePath: path.join("coverage", "coverage-final.json"),
    defaultFormat: /** @type {OutputFormat} */ ("table"),
    fileDisplayLimit: parseOptionalPositiveInteger(
        process.env["COVERAGE_FILE_LIMIT"],
        "COVERAGE_FILE_LIMIT",
        15
    ),
    minFileColumnWidth: 30,
    numericColumnWidth: 20,
    projectRoot: path.resolve(dirname, ".."),
    truncateFilePath: 80,
};
const VALID_OUTPUT_FORMATS = new Set([
    "csv",
    "json",
    "table",
]);

const colors = {
    reset: (/** @type {unknown} */ value) => `\u001B[0m${value}\u001B[0m`,
    bold: (/** @type {unknown} */ value) => `\u001B[1m${value}\u001B[22m`,
    red: (/** @type {unknown} */ value) => `\u001B[31m${value}\u001B[39m`,
    green: (/** @type {unknown} */ value) => `\u001B[32m${value}\u001B[39m`,
    yellow: (/** @type {unknown} */ value) => `\u001B[33m${value}\u001B[39m`,
    cyan: (/** @type {unknown} */ value) => `\u001B[36m${value}\u001B[39m`,
};

/**
 * Show command usage.
 */
function showHelp() {
    console.log(`
Analyze Istanbul coverage output.

Usage: node scripts/analyze-coverage.mjs [options]

Options:
  --debug <file>           Print processed and raw coverage for one file.
  --format <format>        Output format: table, csv, or json.
  --format=<format>        Output format: table, csv, or json.
  --limit <number>         Maximum files per table section.
  --limit=<number>         Maximum files per table section.
  --no-color               Disable ANSI colors.
  -h, --help               Show this help.
`);
}

/**
 * Parse command-line arguments.
 *
 * @param {string[]} args - Raw command-line arguments.
 *
 * @returns {{
 *     debugFile: string | null;
 *     help: boolean;
 *     limitOverride: number | null;
 *     noColor: boolean;
 *     outputFormat: OutputFormat;
 * }}
 *   Parsed options.
 */
function parseArgs(args) {
    const parsed = {
        debugFile: /** @type {string | null} */ (null),
        help: false,
        limitOverride: /** @type {number | null} */ (null),
        noColor: false,
        outputFormat: DEFAULTS.defaultFormat,
    };

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === undefined) {
            break;
        }

        if (arg === "--") {
            throw new Error("Positional arguments are not supported.");
        }

        if (arg === "--help" || arg === "-h") {
            parsed.help = true;
            continue;
        }

        if (arg === "--no-color") {
            parsed.noColor = true;
            continue;
        }

        if (arg === "--format") {
            index += 1;
            parsed.outputFormat = parseOutputFormat(
                readOptionValue(args[index], "--format")
            );
            continue;
        }

        if (arg.startsWith("--format=")) {
            parsed.outputFormat = parseOutputFormat(
                arg.slice("--format=".length)
            );
            continue;
        }

        if (arg === "--limit") {
            index += 1;
            parsed.limitOverride = parseRequiredPositiveInteger(
                readOptionValue(args[index], "--limit"),
                "--limit"
            );
            continue;
        }

        if (arg.startsWith("--limit=")) {
            parsed.limitOverride = parseRequiredPositiveInteger(
                arg.slice("--limit=".length),
                "--limit"
            );
            continue;
        }

        if (arg === "--debug") {
            index += 1;
            parsed.debugFile = readOptionValue(args[index], "--debug");
            continue;
        }

        if (arg.startsWith("-")) {
            throw new Error(`Unknown option: ${arg}`);
        }

        throw new Error(`Unexpected positional argument: ${arg}`);
    }

    return parsed;
}

/**
 * Read a required option value.
 *
 * @param {string | undefined} value - Raw value.
 * @param {string} optionName - Option name.
 *
 * @returns {string} Parsed value.
 */
function readOptionValue(value, optionName) {
    if (value === undefined || value.length === 0 || value.startsWith("-")) {
        throw new Error(`${optionName} requires a value.`);
    }

    return value;
}

/**
 * Parse an output format option.
 *
 * @param {string | undefined} value - Raw format value.
 *
 * @returns {OutputFormat} Parsed output format.
 */
function parseOutputFormat(value) {
    if (VALID_OUTPUT_FORMATS.has(value ?? "")) {
        return /** @type {OutputFormat} */ (value);
    }

    throw new Error("--format must be one of: table, csv, json.");
}

/**
 * Parse an optional positive integer input.
 *
 * @param {string | undefined} value - Raw value.
 * @param {string} label - Input label for diagnostics.
 * @param {number} fallback - Fallback when the value is unset or blank.
 *
 * @returns {number} Parsed positive integer or fallback.
 */
function parseOptionalPositiveInteger(value, label, fallback) {
    if (value === undefined || value.trim().length === 0) {
        return fallback;
    }

    return parseRequiredPositiveInteger(value, label);
}

/**
 * Parse a required positive integer without partial string coercion.
 *
 * @param {string | undefined} value - Raw value.
 * @param {string} label - Input label for diagnostics.
 *
 * @returns {number} Parsed positive integer.
 */
function parseRequiredPositiveInteger(value, label) {
    if (value === undefined || !/^\d+$/u.test(value.trim())) {
        throw new Error(`${label} must be a positive integer.`);
    }

    const parsed = Number.parseInt(value.trim(), 10);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw new Error(`${label} must be a positive integer.`);
    }

    return parsed;
}

/**
 * Disable ANSI color output.
 */
function disableColors() {
    /** @type {(keyof typeof colors)[]} */
    const colorKeys = /** @type {(keyof typeof colors)[]} */ (
        Object.keys(colors)
    );
    for (const key of colorKeys) {
        colors[key] = (/** @type {unknown} */ value) => String(value);
    }
}

/**
 * Load coverage JSON from disk.
 *
 * @param {string} coveragePath - Coverage JSON path.
 *
 * @returns {Record<string, any>} Parsed coverage data.
 */
function loadCoverageData(coveragePath) {
    return /** @type {Record<string, any>} */ (
        JSON.parse(
            // eslint-disable-next-line unicorn/prefer-json-parse-buffer
            fs.readFileSync(coveragePath, "utf8")
        )
    );
}

/**
 * Analyze each file in an Istanbul coverage map.
 *
 * @param {Record<string, any>} coverageData - Istanbul coverage map.
 * @param {string} projectRoot - Repository root.
 *
 * @returns {FileCoverageAnalysis[]} Coverage summary per file.
 */
function analyzeCoverage(coverageData, projectRoot) {
    /** @type {FileCoverageAnalysis[]} */
    const fileAnalysis = [];

    for (const [filePath, data] of Object.entries(coverageData)) {
        const relativePath = path.relative(projectRoot, filePath);
        const statements = data.s ?? {};
        const functions = data.f ?? {};
        const branches = data.b ?? {};
        const lines = data.l ?? {};
        const statementMap = data.statementMap ?? {};

        let derivedLines = lines;
        if (
            Object.keys(derivedLines).length === 0 &&
            Object.keys(statementMap).length > 0
        ) {
            derivedLines = deriveLineCoverage(statementMap, statements);
        }

        const totalStatements = Object.keys(statements).length;
        const coveredStatements = Object.values(statements).filter(
            (count) => Number(count) > 0
        ).length;
        const totalFunctions = Object.keys(functions).length;
        const coveredFunctions = Object.values(functions).filter(
            (count) => Number(count) > 0
        ).length;
        const totalBranches = Object.keys(branches).length;
        const coveredBranches = Object.values(branches).filter((branch) =>
            isBranchCovered(branch)
        ).length;
        const totalLines = Object.keys(derivedLines).length;
        const coveredLines = Object.values(derivedLines).filter(
            (count) => Number(count) > 0
        ).length;

        fileAnalysis.push({
            branches: buildCoverageMetric(totalBranches, coveredBranches),
            file: relativePath,
            functions: buildCoverageMetric(totalFunctions, coveredFunctions),
            lines: buildCoverageMetric(totalLines, coveredLines),
            statements: buildCoverageMetric(totalStatements, coveredStatements),
        });
    }

    return fileAnalysis;
}

/**
 * Build a coverage metric object.
 *
 * @param {number} total - Total item count.
 * @param {number} covered - Covered item count.
 *
 * @returns {{ covered: number; percentage: number; total: number }} Metric.
 */
function buildCoverageMetric(total, covered) {
    return {
        covered,
        percentage: total > 0 ? (covered / total) * 100 : 100,
        total,
    };
}

/**
 * Derive line coverage from statement locations.
 *
 * @param {Record<string, any>} statementMap - Istanbul statement map.
 * @param {Record<string, number>} statements - Statement counts.
 *
 * @returns {Record<string, number>} Derived line counts.
 */
function deriveLineCoverage(statementMap, statements) {
    /** @type {Record<string, number>} */
    const derivedLines = {};

    for (const [statementId, location] of Object.entries(statementMap)) {
        const startLine = Number(location?.start?.line);
        if (!Number.isSafeInteger(startLine) || startLine <= 0) {
            continue;
        }

        const endLineCandidate = Number(location?.end?.line);
        const endLine =
            Number.isSafeInteger(endLineCandidate) && endLineCandidate > 0
                ? endLineCandidate
                : startLine;
        const covered = Number(statements[statementId]) > 0 ? 1 : 0;

        for (let line = startLine; line <= endLine; line += 1) {
            derivedLines[line] = (derivedLines[line] ?? 0) + covered;
        }
    }

    return derivedLines;
}

/**
 * Determine whether a branch entry has any covered path.
 *
 * @param {unknown} branchCoverage - Branch coverage data.
 *
 * @returns {boolean} True when the branch is covered.
 */
function isBranchCovered(branchCoverage) {
    return Array.isArray(branchCoverage)
        ? branchCoverage.some((count) => Number(count) > 0)
        : Number(branchCoverage) > 0;
}

/**
 * Compute table column widths.
 *
 * @param {FileCoverageAnalysis[]} displayed - Displayed files.
 *
 * @returns {number[]} Column widths.
 */
function computeColWidths(displayed) {
    const fileCol = Math.max(
        DEFAULTS.minFileColumnWidth,
        ...displayed.map((file) => file.file.length)
    );

    return [
        fileCol,
        DEFAULTS.numericColumnWidth,
        DEFAULTS.numericColumnWidth,
        DEFAULTS.numericColumnWidth,
        DEFAULTS.numericColumnWidth,
    ];
}

/**
 * Shorten long paths by keeping head and tail with ellipsis in the middle.
 *
 * @param {unknown} value - Value to ellipsize.
 * @param {number} max - Maximum output length.
 *
 * @returns {string} Ellipsized string.
 */
function ellipsize(value, max) {
    const str = String(value);
    if (!max || str.length <= max) return str;
    if (max <= 4) return str.slice(-max);

    const head = Math.ceil(max * 0.4);
    const tail = max - head - 3;
    return `${str.slice(0, head)}...${str.slice(-tail)}`;
}

/**
 * Format one coverage metric cell.
 *
 * @param {{ percentage: number; covered: number; total: number } | undefined} coverage
 *   - Coverage metric.
 * @param {number} [width] - Optional pad width.
 *
 * @returns {string} Formatted cell.
 */
function formatCoverageCell(coverage, width) {
    if (!coverage) {
        return width === undefined ? "-" : padLeft("-", width);
    }

    const pct = coverage.percentage ?? 0;
    const text = `${coverage.covered}/${coverage.total} (${pct.toFixed(2)}%)`;
    const padded = width === undefined ? text : padLeft(text, width);

    if (pct >= 90) {
        return colors.green(padded);
    }

    if (pct >= 75) {
        return colors.yellow(padded);
    }

    return colors.red(padded);
}

/**
 * Print a table section with aligned headers and numeric columns.
 *
 * @param {string} header - Section title.
 * @param {FileCoverageAnalysis[]} files - Files to display.
 * @param {number} fileDisplayLimit - Maximum files to display.
 */
function printCoverageSection(header, files, fileDisplayLimit) {
    console.log(colors.bold(`=== ${header} ===`));

    const displayed = files.slice(0, fileDisplayLimit);

    try {
        const requireC = createRequire(import.meta.url);
        /** @type {CliTableConstructor} */
        const Table = requireC("cli-table3");

        const table = new Table({
            colWidths: computeColWidths(displayed),
            head: [
                "File",
                "Functions",
                "Branches",
                "Statements",
                "Lines",
            ].map((headerText) => colors.bold(headerText)),
            style: { border: [], head: [] },
        });

        for (const file of displayed) {
            table.push([
                ellipsize(file.file, DEFAULTS.truncateFilePath),
                formatCoverageCell(file.functions),
                formatCoverageCell(file.branches),
                formatCoverageCell(file.statements),
                formatCoverageCell(file.lines),
            ]);
        }

        console.log(table.toString());
        console.log();
        return;
    } catch {
        // If cli-table3 isn't installed, fall back to the pad-based renderer.
    }

    const fileCol = Math.max(
        DEFAULTS.minFileColumnWidth,
        ...displayed.map(
            (file) => ellipsize(file.file, DEFAULTS.truncateFilePath).length
        )
    );
    const headerRow = `${padRight("File", fileCol)}  ${padLeft("Functions", 14)}  ${padLeft("Branches", 14)}  ${padLeft("Statements", 14)}  ${padLeft("Lines", 14)}`;
    console.log(colors.bold(headerRow));

    for (const file of displayed) {
        const renderedFile = padRight(
            ellipsize(file.file, DEFAULTS.truncateFilePath),
            fileCol
        );

        console.log(
            `${colors.cyan(renderedFile)}  ${formatCoverageCell(file.functions, 14)}  ${formatCoverageCell(file.branches, 14)}  ${formatCoverageCell(file.statements, 14)}  ${formatCoverageCell(file.lines, 14)}`
        );
    }
    console.log();
}

/**
 * Pad a string on the right.
 *
 * @param {string} value - Value to pad.
 * @param {number} width - Target width.
 *
 * @returns {string} Padded string.
 */
function padRight(value, width) {
    const str = String(value);
    if (str.length >= width) return str;
    return str + " ".repeat(width - str.length);
}

/**
 * Pad a string on the left.
 *
 * @param {string} value - Value to pad.
 * @param {number} width - Target width.
 *
 * @returns {string} Padded string.
 */
function padLeft(value, width) {
    const str = String(value);
    if (str.length >= width) return str;
    return " ".repeat(width - str.length) + str;
}

/**
 * Emit JSON output.
 *
 * @param {FileCoverageAnalysis[]} fileAnalysis - Coverage summaries.
 */
function printJson(fileAnalysis) {
    console.log(JSON.stringify(fileAnalysis, null, 2));
}

/**
 * Emit CSV output.
 *
 * @param {FileCoverageAnalysis[]} fileAnalysis - Coverage summaries.
 */
function printCsv(fileAnalysis) {
    const header = [
        "file",
        "functions_total",
        "functions_covered",
        "functions_pct",
        "branches_total",
        "branches_covered",
        "branches_pct",
        "statements_total",
        "statements_covered",
        "statements_pct",
        "lines_total",
        "lines_covered",
        "lines_pct",
    ].join(",");
    console.log(header);

    for (const file of fileAnalysis) {
        const row = [
            csvEscape(file.file),
            file.functions.total,
            file.functions.covered,
            file.functions.percentage.toFixed(2),
            file.branches.total,
            file.branches.covered,
            file.branches.percentage.toFixed(2),
            file.statements.total,
            file.statements.covered,
            file.statements.percentage.toFixed(2),
            file.lines.total,
            file.lines.covered,
            file.lines.percentage.toFixed(2),
        ].join(",");
        console.log(row);
    }
}

/**
 * Escape a CSV field.
 *
 * @param {unknown} value - Field value.
 *
 * @returns {string} Escaped field.
 */
function csvEscape(value) {
    if (value === null || value === undefined) return "";

    const text = String(value);
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replaceAll('"', '""')}"`;
    }

    return text;
}

/**
 * Print debug coverage for one file.
 *
 * @param {string} debugFile - File to inspect.
 * @param {FileCoverageAnalysis[]} fileAnalysis - Coverage summaries.
 * @param {Record<string, any>} coverageData - Raw Istanbul coverage map.
 * @param {string} projectRoot - Repository root.
 *
 * @returns {boolean} True when a matching file was found.
 */
function printDebugEntry(debugFile, fileAnalysis, coverageData, projectRoot) {
    const match = fileAnalysis.find(
        (file) => file.file === debugFile || file.file.endsWith(debugFile)
    );
    if (!match) {
        console.log(`\nNo coverage entry found for debug file: ${debugFile}`);
        return false;
    }

    console.log("\n=== DEBUG COVERAGE ENTRY (processed) ===");
    console.log(JSON.stringify(match, null, 2));

    const rawKey = Object.keys(coverageData).find((key) => {
        const relativePath = path.relative(projectRoot, key);
        return relativePath === debugFile || relativePath.endsWith(debugFile);
    });

    if (rawKey) {
        console.log("\n=== DEBUG RAW COVERAGE ===");
        console.log(JSON.stringify(coverageData[rawKey], null, 2));
    }

    return true;
}

/**
 * Print the table report.
 *
 * @param {FileCoverageAnalysis[]} fileAnalysis - Coverage summaries.
 * @param {number} fileDisplayLimit - Maximum files per section.
 */
function printTableReport(fileAnalysis, fileDisplayLimit) {
    const sortedByFunctionCoverage = fileAnalysis.toSorted(
        (left, right) => left.functions.percentage - right.functions.percentage
    );
    const lowFunctionCoverage = sortedByFunctionCoverage.filter(
        (file) => file.functions.percentage < 90
    );
    printCoverageSection(
        "FILES WITH LOWEST FUNCTION COVERAGE",
        lowFunctionCoverage,
        fileDisplayLimit
    );

    const sortedByBranchCoverage = fileAnalysis.toSorted(
        (left, right) => left.branches.percentage - right.branches.percentage
    );
    const lowBranchCoverage = sortedByBranchCoverage.filter(
        (file) => file.branches.percentage < 90
    );
    printCoverageSection(
        "FILES WITH LOWEST BRANCH COVERAGE",
        lowBranchCoverage,
        fileDisplayLimit
    );

    const sortedByStatementCoverage = fileAnalysis.toSorted(
        (left, right) =>
            left.statements.percentage - right.statements.percentage
    );
    const lowStatementCoverage = sortedByStatementCoverage.filter(
        (file) => file.statements.percentage < 90
    );
    printCoverageSection(
        "FILES WITH LOWEST STATEMENT COVERAGE",
        lowStatementCoverage,
        fileDisplayLimit
    );

    const sortedByLineCoverage = fileAnalysis.toSorted(
        (left, right) => left.lines.percentage - right.lines.percentage
    );
    const lowLineCoverage = sortedByLineCoverage.filter(
        (file) => file.lines.percentage < 90
    );
    printCoverageSection(
        "FILES WITH LOWEST LINE COVERAGE",
        lowLineCoverage,
        fileDisplayLimit
    );

    console.log("\n=== SUMMARY ===");
    console.log(`Total files analyzed: ${fileAnalysis.length}`);
    console.log(
        `Files with <90% function coverage: ${fileAnalysis.filter((file) => file.functions.percentage < 90).length}`
    );
    console.log(
        `Files with <90% branch coverage: ${fileAnalysis.filter((file) => file.branches.percentage < 90).length}`
    );
}

/**
 * Main CLI entrypoint.
 *
 * @param {string[]} [args] - Raw command-line arguments.
 *
 * @returns {number} Process exit code.
 */
function main(args = process.argv.slice(2)) {
    try {
        const options = parseArgs(args);

        if (options.help) {
            showHelp();
            return 0;
        }

        if (options.noColor) {
            disableColors();
        }

        const coverageData = loadCoverageData(
            path.join(DEFAULTS.projectRoot, DEFAULTS.coverageRelativePath)
        );
        const fileAnalysis = analyzeCoverage(
            coverageData,
            DEFAULTS.projectRoot
        );

        if (options.debugFile !== null) {
            return printDebugEntry(
                options.debugFile,
                fileAnalysis,
                coverageData,
                DEFAULTS.projectRoot
            )
                ? 0
                : 1;
        }

        if (options.outputFormat === "json") {
            printJson(fileAnalysis);
            return 0;
        }

        if (options.outputFormat === "csv") {
            printCsv(fileAnalysis);
            return 0;
        }

        printTableReport(
            fileAnalysis,
            options.limitOverride ?? DEFAULTS.fileDisplayLimit
        );
        return 0;
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        return 1;
    }
}

if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
    process.exitCode = main();
}
