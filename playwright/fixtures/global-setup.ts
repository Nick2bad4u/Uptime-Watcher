/**
 * Global setup for Playwright Electron tests.
 *
 * This file runs once before all tests and sets up the environment. It can be
 * used for tasks like building the app, setting up databases, etc.
 */

import type { FullConfig } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

async function globalSetup(config: FullConfig): Promise<void> {
    console.log("🔧 Setting up Playwright Electron tests...");

    // Ensure the Electron app is built
    try {
        console.log("📦 Building Electron app...");
        execSync("npm run build:electron-main", {
            stdio: "inherit",
            cwd: path.resolve(import.meta.dirname, "../.."),
        });
        console.log("✅ Electron app built successfully");
    } catch (error) {
        console.error("❌ Failed to build Electron app:", error);
        throw error;
    }

    // Verify that the main process file exists
    const mainPath = path.resolve(
        import.meta.dirname,
        "../../dist-electron/main.js"
    );
    try {
        await import("node:fs/promises").then((fs) => fs.access(mainPath));
        console.log("✅ Main process file found at:", mainPath);
    } catch (error) {
        console.error("❌ Main process file not found at:", mainPath);
        throw new Error(
            `Main process file not found. Expected at: ${mainPath}`
        );
    }

    console.log("🚀 Playwright setup complete");
}

export default globalSetup;
