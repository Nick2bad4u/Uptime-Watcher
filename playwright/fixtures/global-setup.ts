/**
 * Global setup for Playwright Electron tests.
 *
 * @packageDocumentation This
 *
 * module runs once before the Playwright test suite begins. It prepares
 * the Electron build output and configures environment flags required for
 * stable headless execution during automated UI runs.
 */

import type { FullConfig } from "@playwright/test";

import { execFileSync } from "node:child_process";
import * as path from "node:path";

interface CommandInvocation {
    readonly args: readonly string[];
    readonly command: string;
}

function resolveNpmRunInvocation(scriptName: string): CommandInvocation {
    const npmExecPath = process.env["npm_execpath"];

    if (npmExecPath) {
        return {
            args: [
                npmExecPath,
                "run",
                scriptName,
            ],
            command: process.execPath,
        };
    }

    if (process.platform === "win32") {
        return {
            args: [
                "/d",
                "/s",
                "/c",
                "npm",
                "run",
                scriptName,
            ],
            command: "cmd.exe",
        };
    }

    return {
        args: ["run", scriptName],
        command: "npm",
    };
}

function withMaxOldSpaceSize(
    nodeOptions: string | undefined,
    sizeMb: number
): string {
    const trimmed = (nodeOptions ?? "").trim();
    const stripped = trimmed
        ? trimmed.replaceAll(/--max_old_space_size=\d+/gv, "").trim()
        : "";
    const maxOldSpaceFlag = `--max_old_space_size=${sizeMb}`;

    return stripped ? `${stripped} ${maxOldSpaceFlag}` : maxOldSpaceFlag;
}

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
            const buildScript = process.env["PLAYWRIGHT_COVERAGE"]
                ? "build:playwright-coverage"
                : "build:electron-main";
            const buildInvocation = resolveNpmRunInvocation(buildScript);

            console.log(`📦 Building Electron app via: npm run ${buildScript}`);
            execFileSync(buildInvocation.command, [...buildInvocation.args], {
                stdio: "inherit",
                cwd: path.resolve(__dirname, "../.."),
                env: {
                    ...process.env,
                    HEADLESS: "true",
                    // Playwright builds can be memory-intensive (Vite + sourcemaps + stats).
                    // Ensure we have enough heap for CI/local runs.
                    NODE_OPTIONS: withMaxOldSpaceSize(
                        process.env["NODE_OPTIONS"],
                        16_384
                    ),
                },
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
