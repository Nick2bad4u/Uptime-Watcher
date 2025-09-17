/**
 * Electron test helpers for Playwright tests.
 *
 * Provides utilities for launching Electron with appropriate configurations for
 * different environments (local development vs CI).
 */

import { _electron as electron } from "@playwright/test";

/**
 * Launch Electron with CI-compatible configuration.
 *
 * Automatically handles sandbox disabling in CI environments where the Chrome
 * sandbox cannot be properly configured. Also adds test mode arguments for
 * faster startup during UI testing.
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
            // Disable Electron sandbox in CI
            ...(process.env["CI"] && { ELECTRON_DISABLE_SANDBOX: "1" }),
            ...customEnv,
        },
        timeout: 30000, // Add timeout like codegen script
        // NOTE: The DEP0190 deprecation warning about shell injection comes from
        // Playwright's internal Electron launcher implementation, not our code.
        // This is a known issue with Playwright's Electron integration and
        // cannot be directly fixed in user code. The warning does not affect
        // functionality and can be safely ignored.
    });
}
