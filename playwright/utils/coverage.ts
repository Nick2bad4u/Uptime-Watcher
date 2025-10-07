/**
 * Utilities for collecting Playwright renderer coverage during Electron runs.
 */

import type { ElectronApplication, Page } from "@playwright/test";
import { createCoverageMap } from "istanbul-lib-coverage";
import type { CoverageMapData } from "istanbul-lib-coverage";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const COVERAGE_ENV = "PLAYWRIGHT_COVERAGE";
const COVERAGE_ROOT = path.resolve(process.cwd(), "coverage", "playwright");
const NYC_OUTPUT_DIR = path.join(COVERAGE_ROOT, ".nyc_output");

let coverageFileCounter = 0;
const coverageLabels = new WeakMap<ElectronApplication, string>();

/**
 * Whether coverage collection is enabled for the current Playwright run.
 */
export const isCoverageEnabled = Boolean(process.env[COVERAGE_ENV]);

/**
 * Associates a descriptive label with an Electron application for coverage
 * output.
 *
 * @param electronApp - The Electron application instance spawned by Playwright.
 * @param label - Human-readable identifier to embed in the coverage artifact
 *   name.
 */
export function tagElectronAppCoverage(
    electronApp: ElectronApplication,
    label: string
): void {
    if (!isCoverageEnabled) {
        return;
    }
    coverageLabels.set(electronApp, label);
}

/**
 * Extracts Istanbul coverage information from a renderer window.
 *
 * @param page - Playwright page corresponding to a renderer window.
 *
 * @returns The raw Istanbul coverage object or `null` when not available.
 */
async function extractCoverageFromWindow(page: Page): Promise<unknown | null> {
    return await page.evaluate(() => {
        const globalTarget = globalThis as typeof globalThis & {
            __coverage__?: unknown;
        };
        return globalTarget.__coverage__ ?? null;
    });
}

/**
 * Collects coverage from all Electron windows and writes merged results.
 *
 * @param electronApp - The Electron application under test.
 * @param label - Optional coverage artifact label to improve traceability.
 */
export async function collectCoverageFromElectronApp(
    electronApp: ElectronApplication,
    label?: string
): Promise<void> {
    if (!isCoverageEnabled) {
        return;
    }

    const windows = electronApp.windows();
    if (windows.length === 0) {
        return;
    }

    const coverageMap = createCoverageMap({});

    for (const window of windows) {
        try {
            const windowCoverage = await extractCoverageFromWindow(window);
            if (windowCoverage) {
                coverageMap.merge(windowCoverage as CoverageMapData);
            }
        } catch (error) {
            console.warn(
                "⚠️ Failed to collect coverage from renderer window:",
                error
            );
        }
    }

    if (coverageMap.files().length === 0) {
        return;
    }

    await mkdir(NYC_OUTPUT_DIR, { recursive: true });
    const labelSource = label ?? coverageLabels.get(electronApp);
    const sanitizedLabel = labelSource
        ?.replace(/[^a-zA-Z0-9-_]+/g, "-")
        .toLowerCase();
    if (labelSource) {
        coverageLabels.delete(electronApp);
    }
    const fileName = `renderer-${
        sanitizedLabel ?? `${Date.now()}-${coverageFileCounter++}`
    }.json`;
    const filePath = path.join(NYC_OUTPUT_DIR, fileName);

    await writeFile(filePath, JSON.stringify(coverageMap.toJSON()));
}
