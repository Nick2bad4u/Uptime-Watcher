/**
 * Global setup for Playwright Electron tests.
 *
 * This file runs once before all tests and sets up the environment. It can be
 * used for tasks like building the app, setting up databases, etc.
 */

import type { FullConfig } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

async function globalSetup(_config: FullConfig): Promise<void> {
    console.log("🔧 Setting up Playwright Electron tests...");

    // Set HEADLESS environment variable for Electron tests
    // This tells the Electron app to skip showing windows during tests
    process.env["HEADLESS"] = "true";
    console.log("🔇 Set HEADLESS=true for Electron headless testing");

    // Ensure the Electron app is built
    try {
        const buildCommand = process.env["PLAYWRIGHT_COVERAGE"]
            ? "npm run build:playwright-coverage"
            : "npm run build:electron-main";

        console.log(`📦 Building Electron app via: ${buildCommand}`);
        execSync(buildCommand, {
            stdio: "inherit",
            cwd: path.resolve(__dirname, "../.."),
            env: { ...process.env, HEADLESS: "true" },
        });
        console.log("✅ Electron app built successfully");
    } catch (error) {
        console.error(
            "❌ Failed to build Electron app:",
            (error as Error).message
        );
        throw error;
    }

    // Verify that the main process file exists
    const mainPath = path.resolve(__dirname, "../../dist/main.js");
    try {
        await import("node:fs/promises").then((fs) => fs.access(mainPath));
        console.log("✅ Main process file found at:", mainPath);
    } catch {
        console.error("❌ Main process file not found at:", mainPath);
        throw new Error(
            `Main process file not found. Expected at: ${mainPath}`
        );
    }

    console.log("🚀 Playwright setup complete");
}

export default globalSetup;
