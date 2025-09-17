/**
 * Screenshot helpers for Playwright tests.
 *
 * Provides utilities to take screenshots with consistent naming and location.
 */

import type { Page } from "@playwright/test";
import type { ElectronApplication } from "@playwright/test";
import { test } from "@playwright/test";

/**
 * Configuration for screenshot paths and naming.
 */
export const SCREENSHOT_CONFIG = {
    /** Base directory for test screenshots (relative to project root) */
    baseDir: "playwright/test-results/screenshots",

    /** Default screenshot options */
    defaultOptions: {
        fullPage: true,
        animations: "disabled" as const,
    },
} as const;

/**
 * Take a screenshot with automatic path generation.
 *
 * @example
 *
 * ```typescript
 * await takeScreenshot(page, "login-form");
 * await takeScreenshot(electronApp.firstWindow(), "modal-opened");
 * ```
 *
 * @param pageOrApp - Playwright Page or Electron Application
 * @param name - Screenshot name (without extension)
 * @param options - Optional screenshot options
 */
export async function takeScreenshot(
    pageOrApp: Page | Awaited<ReturnType<ElectronApplication["firstWindow"]>>,
    name: string,
    options: Parameters<Page["screenshot"]>[0] = {}
): Promise<void> {
    const testInfo = test.info();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Create a unique filename with test context
    const filename = `${testInfo.project.name}-${testInfo.title.replace(/[^a-zA-Z0-9]/g, "-")}-${name}-${timestamp}.png`;
    const path = `${SCREENSHOT_CONFIG.baseDir}/${filename}`;

    await pageOrApp.screenshot({
        ...SCREENSHOT_CONFIG.defaultOptions,
        ...options,
        path,
    });

    // Attach screenshot to test report
    await testInfo.attach(name, {
        path,
        contentType: "image/png",
    });
}

/**
 * Take a debug screenshot with automatic naming based on current test.
 *
 * @example
 *
 * ```typescript
 * await debugScreenshot(page, "before-login");
 * await debugScreenshot(window, "after-form-submission");
 * ```
 *
 * @param pageOrApp - Playwright Page or Electron Application
 * @param step - Debug step description
 */
export async function debugScreenshot(
    pageOrApp: Page | Awaited<ReturnType<ElectronApplication["firstWindow"]>>,
    step: string
): Promise<void> {
    await takeScreenshot(pageOrApp, `debug-${step}`);
}
