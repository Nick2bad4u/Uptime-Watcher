/**
 * Aggregates Istanbul coverage collected during Playwright runs and enforces
 * thresholds.
 *
 * @packageDocumentation
 */

import { createCoverageMap } from "istanbul-lib-coverage";
import { createContext } from "istanbul-lib-report";
import reports from "istanbul-reports";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import * as path from "node:path";

const COVERAGE_ROOT = path.resolve(process.cwd(), "coverage", "playwright");
const NYC_OUTPUT_DIR = path.join(COVERAGE_ROOT, ".nyc_output");
const REPORT_DIR = path.join(COVERAGE_ROOT, "reports");

/**
 * Parses the configured coverage threshold as a finite percentage.
 *
 * @param value - Optional raw environment variable value.
 *
 * @returns Percentage threshold in the inclusive range 0-100.
 *
 * @throws Error when the environment value is malformed or out of range.
 */
function parseCoverageThreshold(value: string | undefined): number {
    if (value === undefined || value.trim().length === 0) {
        return 100;
    }

    const trimmed = value.trim();
    if (!/^(?:\d+|\d+\.\d+|\.\d+)$/u.test(trimmed)) {
        throw new Error(
            "PLAYWRIGHT_COVERAGE_THRESHOLD must be a number from 0 to 100."
        );
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        throw new Error(
            "PLAYWRIGHT_COVERAGE_THRESHOLD must be a number from 0 to 100."
        );
    }

    return parsed;
}

/**
 * Reads the coverage fragment directory and returns JSON filenames to merge.
 *
 * @returns A list of JSON file names representing collected coverage fragments.
 */
async function loadCoverageFragments(): Promise<string[]> {
    try {
        return (await readdir(NYC_OUTPUT_DIR)).filter((file) =>
            file.endsWith(".json")
        );
    } catch {
        return [];
    }
}

/**
 * Merges coverage fragments, generates reports, and enforces coverage
 * thresholds.
 *
 * @param files - Coverage fragment file names returned by
 *   {@link loadCoverageFragments}.
 *
 * @throws Error when the configured coverage threshold is not met.
 */
async function mergeCoverage(
    files: string[],
    threshold = parseCoverageThreshold(
        process.env["PLAYWRIGHT_COVERAGE_THRESHOLD"]
    )
): Promise<void> {
    if (files.length === 0) {
        console.warn("⚠️  No Playwright coverage fragments were generated.");
        return;
    }

    const coverageMap = createCoverageMap({});

    for (const file of files) {
        const fullPath = path.join(NYC_OUTPUT_DIR, file);
        const raw = await readFile(fullPath, "utf8");
        coverageMap.merge(JSON.parse(raw));
    }

    await rm(REPORT_DIR, { recursive: true, force: true });
    await mkdir(REPORT_DIR, { recursive: true });

    const context = createContext({
        coverageMap,
        dir: REPORT_DIR,
        defaultSummarizer: "pkg",
    });

    for (const reporterName of [
        "text",
        "json-summary",
        "html",
    ] as const) {
        reports.create(reporterName).execute(context);
    }

    const summary = coverageMap.getCoverageSummary();
    const metrics = {
        branches: summary.branches.pct ?? 0,
        functions: summary.functions.pct ?? 0,
        lines: summary.lines.pct ?? 0,
        statements: summary.statements.pct ?? 0,
    };

    console.log("📈 Playwright coverage summary (pct):", metrics);

    for (const [metric, value] of Object.entries(metrics)) {
        if (value < threshold) {
            throw new Error(
                `Coverage threshold not met for ${metric}: ${value.toFixed(
                    2
                )}% < ${threshold}%`
            );
        }
    }

    console.log(
        `✅ Playwright coverage meets threshold of ${threshold}% for all metrics.`
    );
}

/**
 * Entry point that orchestrates coverage aggregation and threshold validation.
 *
 * @returns Process exit status.
 */
async function main(): Promise<number> {
    try {
        const files = await loadCoverageFragments();
        await mergeCoverage(files);
        return 0;
    } catch (error) {
        console.error(
            "❌ Failed to produce Playwright coverage report:",
            error
        );
        return 1;
    }
}

/**
 * @returns `true` when this file is the CLI entrypoint.
 */
function isDirectInvocation(): boolean {
    return (
        typeof process.argv[1] === "string" &&
        path.basename(process.argv[1]) === "report-playwright-coverage.ts"
    );
}

if (isDirectInvocation()) {
    void main()
        .then((exitCode) => {
            process.exitCode = exitCode;
        })
        .catch((error: unknown) => {
            console.error(
                "❌ Failed to produce Playwright coverage report:",
                error
            );
            process.exitCode = 1;
        });
}

export {
    isDirectInvocation,
    loadCoverageFragments,
    main,
    mergeCoverage,
    parseCoverageThreshold,
};
