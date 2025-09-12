/**
 * Global teardown for Playwright Electron tests.
 *
 * This file runs once after all tests and cleans up the environment.
 */

async function globalTeardown(): Promise<void> {
    console.log("🧹 Cleaning up after Playwright tests...");

    // Clean up any temporary files or processes
    // Kill any remaining Electron processes
    try {
        if (process.platform === "win32") {
            // Windows
            require("node:child_process").execSync(
                "taskkill /F /IM electron.exe /T",
                {
                    stdio: "ignore",
                }
            );
        } else {
            // macOS/Linux
            require("node:child_process").execSync("pkill -f electron", {
                stdio: "ignore",
            });
        }
    } catch (error) {
        // Ignore errors - processes might not be running
    }

    console.log("✅ Cleanup complete");
}

export default globalTeardown;
