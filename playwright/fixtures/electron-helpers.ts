/**
 * Electron test helpers for Playwright tests.
 *
 * Provides utilities for launching Electron with appropriate configurations for
 * different environments (local development vs CI).
 */

import { _electron as electron } from "@playwright/test";
import path from "path";

/**
 * Launch Electron with CI-compatible configuration.
 *
 * Automatically handles sandbox disabling in CI environments where the Chrome
 * sandbox cannot be properly configured.
 *
 * @param customArgs - Additional arguments to pass to Electron
 * @param customEnv - Additional environment variables
 *
 * @returns Promise resolving to Electron app instance
 */
export async function launchElectronApp(
    customArgs: string[] = [],
    customEnv: Record<string, string> = {}
) {
    return await electron.launch({
        args: [
            path.join(__dirname, "../../dist-electron/main.js"),
            // Disable sandbox in CI environment to avoid SUID sandbox issues
            ...(process.env["CI"]
                ? ["--no-sandbox", "--disable-setuid-sandbox"]
                : []),
            ...customArgs,
        ],
        env: {
            ...process.env,
            NODE_ENV: "test",
            // Disable Electron sandbox in CI
            ...(process.env["CI"] && { ELECTRON_DISABLE_SANDBOX: "1" }),
            ...customEnv,
        },
    });
}
