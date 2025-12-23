/**
 * Electron test helpers for Playwright tests.
 *
 * @packageDocumentation
 *
 * Provides utilities for launching Electron with appropriate configurations for
 * different environments (local development vs CI).
 */

import { _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";

import {
    collectCoverageFromElectronApp,
    isCoverageEnabled,
} from "../utils/coverage";
import {
    registerApplicationUserDataDirectory,
    registerPageUserDataDirectory,
} from "../utils/userDataDirectoryRegistry";

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
    const userDataDir = await mkdtemp(
        path.join(tmpdir(), "uptime-watcher-playwright-")
    );

    const existingNodeOptions = process.env["NODE_OPTIONS"] ?? "";
    const disableWarningOption = "--disable-warning=DEP0190";
    const nodeOptions = existingNodeOptions.includes(disableWarningOption)
        ? existingNodeOptions
        : [existingNodeOptions, disableWarningOption].filter(Boolean).join(" ");

    const cleanupTasks: Array<() => Promise<void>> = [
        async () => {
            try {
                await rm(userDataDir, { recursive: true, force: true });
            } catch (error) {
                console.warn(
                    "[Playwright] Failed to remove temporary userData directory",
                    {
                        directory: userDataDir,
                        error,
                    }
                );
            }
        },
    ];

    let cleanupTriggered = false;
    const runCleanup = async (): Promise<void> => {
        if (cleanupTriggered) {
            return;
        }

        cleanupTriggered = true;

        await Promise.allSettled(
            cleanupTasks.map(async (task) => {
                await task();
            })
        );
    };

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
            ...Object.entries(process.env).reduce<Record<string, string>>(
                (accumulator, [key, value]) => {
                    if (typeof value === "string") {
                        accumulator[key] = value;
                    }
                    return accumulator;
                },
                {}
            ),
            // Don't override NODE_ENV - let it inherit from environment
            // This allows proper development vs production detection
            // Enable headless mode for Electron during testing
            HEADLESS: "true",
            PLAYWRIGHT_TEST: "true",
            PLAYWRIGHT_USER_DATA_DIR: userDataDir,
            NODE_OPTIONS: nodeOptions,
            // Disable Electron sandbox in CI
            ...(process.env["CI"] && { ELECTRON_DISABLE_SANDBOX: "1" }),
            ...customEnv,
        },
        timeout: 30000, // Add timeout like codegen script
    });

    const attachWindowMetadata = (page: Page): void => {
        registerPageUserDataDirectory(page, userDataDir);
    };

    registerApplicationUserDataDirectory(app, userDataDir);
    app.on("window", attachWindowMetadata);

    const originalFirstWindow = app.firstWindow.bind(app);
    (
        app as ElectronApplication & {
            firstWindow: ElectronApplication["firstWindow"];
        }
    ).firstWindow = (async () => {
        const page = await originalFirstWindow();
        attachWindowMetadata(page);
        return page;
    }) as ElectronApplication["firstWindow"];

    app.on("close", () => {
        void runCleanup();
    });

    if (isCoverageEnabled) {
        const originalClose = app.close.bind(app);
        let coverageCollected = false;

        (
            app as ElectronApplication & {
                close: ElectronApplication["close"];
            }
        ).close = (async () => {
            let coverageError: unknown;

            if (!coverageCollected) {
                try {
                    await collectCoverageFromElectronApp(app);
                    coverageCollected = true;
                } catch (error) {
                    coverageError = error;
                }
            }

            let closeError: unknown;
            try {
                await originalClose();
            } catch (error) {
                closeError = error;
            }

            await runCleanup();

            if (coverageError) {
                throw coverageError;
            }

            if (closeError) {
                throw closeError;
            }
        }) as ElectronApplication["close"];
    } else {
        const originalClose = app.close.bind(app);

        (
            app as ElectronApplication & {
                close: ElectronApplication["close"];
            }
        ).close = (async () => {
            let closeError: unknown;
            try {
                await originalClose();
            } catch (error) {
                closeError = error;
            }

            await runCleanup();

            if (closeError) {
                throw closeError;
            }
        }) as ElectronApplication["close"];
    }

    return app;
}
