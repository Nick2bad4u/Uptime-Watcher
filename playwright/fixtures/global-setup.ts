/**
 * Global setup for Playwright Electron tests.
 *
 * @packageDocumentation
 *
 * This module runs once before the Playwright test suite begins. It prepares
 * the Electron build output and configures environment flags required for
 * stable headless execution during automated UI runs.
 */

import type { FullConfig } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Builds the Electron entrypoints and primes shared environment flags so
 * Playwright can launch the renderer in headless mode.
 *
 * @param _config - Playwright project configuration (unused, but required by
 *   the framework callback signature).
 */
async function globalSetup(_config: FullConfig): Promise<void> {
    console.log("🔧 Setting up Playwright Electron tests...");

    // Set HEADLESS environment variable for Electron tests
    // This tells the Electron app to skip showing windows during tests
    process.env["HEADLESS"] = "true";
    console.log("🔇 Set HEADLESS=true for Electron headless testing");

    // Ensure the Electron app is built
    const skipBuild = process.env["PLAYWRIGHT_SKIP_BUILD"] === "true";
    if (skipBuild) {
        console.log(
            "⏭️  PLAYWRIGHT_SKIP_BUILD=true — reusing existing Electron build output"
        );
    } else {
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
