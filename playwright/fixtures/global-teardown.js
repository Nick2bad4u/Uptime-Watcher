/**
 * Global teardown for Playwright tests. This file runs once after all tests
 * end.
 */

export default async function globalTeardown() {
    console.log("🧹 Cleaning up after Playwright tests...");

    // Clean up any remaining Electron processes
    const { execSync } = await import("node:child_process");

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
    } catch (error) {
        // Ignore errors - processes might not be running
    }

    console.log("✅ Cleanup complete");
}
