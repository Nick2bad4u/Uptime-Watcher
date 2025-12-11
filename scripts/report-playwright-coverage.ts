/* eslint-disable unicorn/prefer-top-level-await -- Script must run in CommonJS context where top-level await is unsupported */
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
import path from "node:path";
import process from "node:process";

const COVERAGE_ROOT = path.resolve(process.cwd(), "coverage", "playwright");
const NYC_OUTPUT_DIR = path.join(COVERAGE_ROOT, ".nyc_output");
const REPORT_DIR = path.join(COVERAGE_ROOT, "reports");
const THRESHOLD = Number(process.env["PLAYWRIGHT_COVERAGE_THRESHOLD"] ?? "100");

/**
 * Reads the coverage fragment directory and returns JSON filenames to merge.
 *
 * @returns A list of JSON file names representing collected coverage fragments.
 */
async function loadCoverageFragments(): Promise<string[]> {
    try {
        return (await readdir(NYC_OUTPUT_DIR)).filter((file) =>
            file.endsWith(".json"));
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
async function mergeCoverage(files: string[]): Promise<void> {
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
        if (value < THRESHOLD) {
            throw new Error(
                `Coverage threshold not met for ${metric}: ${value.toFixed(
                    2
                )}% < ${THRESHOLD}%`
            );
        }
    }

    console.log(
        `✅ Playwright coverage meets threshold of ${THRESHOLD}% for all metrics.`
    );
}

/**
 * Entry point that orchestrates coverage aggregation and threshold validation.
 */
async function main(): Promise<void> {
    const files = await loadCoverageFragments();
    await mergeCoverage(files);
}

main().catch((error) => {
    console.error("❌ Failed to produce Playwright coverage report:", error);
    process.exitCode = 1;
});
/* eslint-enable unicorn/prefer-top-level-await */
