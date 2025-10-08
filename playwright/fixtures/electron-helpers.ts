/**
 * Electron test helpers for Playwright tests.
 *
 * Provides utilities for launching Electron with appropriate configurations for
 * different environments (local development vs CI).
 */

import { _electron as electron } from "@playwright/test";
import type { ElectronApplication } from "@playwright/test";

import {
    collectCoverageFromElectronApp,
    isCoverageEnabled,
} from "../utils/coverage";

/**
 * Launch Electron with CI-compatible configuration.
 *
 * Automatically handles:
 *
 * - Sandbox disabling in CI environments where Chrome sandbox cannot be
 *   configured
 * - Headless mode for Electron testing (prevents windows from showing)
 * - Test mode arguments for faster startup during UI testing
 *
 * **Headless Mode Implementation:** Sets HEADLESS=true environment variable
 * which is checked by the Electron app's WindowService to skip showing windows
 * during testing. This simulates headless behavior since Electron doesn't
 * support true headless mode like browsers.
 *
 * @param customArgs - Additional arguments to pass to Electron
 * @param customEnv - Additional environment variables (can override HEADLESS)
 *
 * @returns Promise resolving to Electron app instance
 */
export async function launchElectronApp(
    customArgs: string[] = [],
    customEnv: Record<string, string> = {}
): Promise<ElectronApplication> {
    const existingNodeOptions = process.env["NODE_OPTIONS"] ?? "";
    const disableWarningOption = "--disable-warning=DEP0190";
    const nodeOptions = existingNodeOptions.includes(disableWarningOption)
        ? existingNodeOptions
        : [existingNodeOptions, disableWarningOption].filter(Boolean).join(" ");

    const app = await electron.launch({
        args: [
            ".", // Launch from project root like codegen script
            "--test-mode", // Enable lightweight mode for faster UI testing
            // Disable sandbox in CI environment to avoid SUID sandbox issues
            ...(process.env["CI"]
                ? ["--no-sandbox", "--disable-setuid-sandbox"]
                : []),
            ...customArgs,
        ],
        env: {
            ...process.env,
            // Don't override NODE_ENV - let it inherit from environment
            // This allows proper development vs production detection
            // Enable headless mode for Electron during testing
            HEADLESS: "true",
            PLAYWRIGHT_TEST: "true",
            NODE_OPTIONS: nodeOptions,
            // Disable Electron sandbox in CI
            ...(process.env["CI"] && { ELECTRON_DISABLE_SANDBOX: "1" }),
            ...customEnv,
        },
        timeout: 30000, // Add timeout like codegen script
    });

    if (isCoverageEnabled) {
        const originalClose = app.close.bind(app);
        let coverageCollected = false;

        (
            app as ElectronApplication & {
                close: ElectronApplication["close"];
            }
        ).close = (async () => {
            if (!coverageCollected) {
                await collectCoverageFromElectronApp(app);
                coverageCollected = true;
            }

            await originalClose();
        }) as ElectronApplication["close"];
    }

    return app;
}
