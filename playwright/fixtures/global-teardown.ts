/**
 * Global teardown for Playwright Electron tests.
 *
 * This file runs once after all tests and cleans up the environment.
 */

import { execSync } from "node:child_process";

async function globalTeardown(): Promise<void> {
    console.log("🧹 Cleaning up after Playwright tests...");

    // Clean up any temporary files or processes
    // Kill any remaining Electron processes
    try {
        if (process.platform === "win32") {
            // Windows
            execSync("taskkill /F /IM electron.exe /T", {
                stdio: "ignore",
            });
        } else {
            // macOS/Linux
            execSync("pkill -f electron", {
                stdio: "ignore",
            });
        }
    } catch {
        // Ignore errors - processes might not be running
    }

    console.log("✅ Cleanup complete");
}

export default globalTeardown;
