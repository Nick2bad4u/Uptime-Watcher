/**
 * Global setup for Playwright tests. This file runs once before all tests
 * start.
 */

export default async function globalSetup() {
    console.log("🚀 Setting up Playwright tests...");

    // Ensure the Electron app is built
    const { execSync } = await import("node:child_process");
    const path = await import("node:path");

    try {
        console.log("📦 Building Electron app...");
        execSync("npm run build:electron-main", {
            stdio: "inherit",
            cwd: path.resolve(process.cwd()),
        });
        console.log("✅ Electron app built successfully");
    } catch (error) {
        console.error("❌ Failed to build Electron app:", error);
        throw error;
    }

    console.log("✅ Setup complete");
}
