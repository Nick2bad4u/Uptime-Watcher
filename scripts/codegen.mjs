#!/usr/bin/env node

/**
 * Playwright Codegen Helper Script for Uptime-Watcher.
 *
 * This script simplifies the process of generating Playwright tests for the
 * Uptime-Watcher Electron application using full codegen recording
 * capabilities.
 *
 * Usage: node scripts/codegen.mjs [options].
 *
 * Options: --dev Use development server with browser codegen (default)
 * --electron Use Electron app with full recording capabilities --viewport Set
 * viewport size (e.g., 1280x720) --output Output file path --inspector Open
 * Playwright Inspector with full codegen features for Electron.
 */

import { spawn } from "node:child_process";
import { _electron as electron } from "playwright";
import { existsSync } from "node:fs";
import * as path from "node:path";

// Will be loaded dynamically in main()
/** @type {function(string): string | undefined} */
let applyLintCompliantTransforms;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    dev: args.includes("--dev") || !args.includes("--electron"),
    electron: args.includes("--electron"),
    inspector: args.includes("--inspector"),
    viewport:
        args.find((arg) => arg.startsWith("--viewport="))?.split("=")[1] ||
        "1280,720",
    output: args.find((arg) => arg.startsWith("--output="))?.split("=")[1],
    help: args.includes("--help") || args.includes("-h"),
};

/**
 *
 */
function showHelp() {
    console.log(`
🎭 Playwright Codegen Helper for Uptime-Watcher

Usage: node scripts/codegen.mjs [options]

Options:
  --dev               Use development server with browser codegen (default)
  --electron          Use Electron app with full recording capabilities
  --inspector         Open Playwright Inspector with complete codegen features
  --viewport=WxH      Set viewport size (default: 1280,720)
  --output=file.ts    Output file path
  --help, -h          Show this help

Examples:
  node scripts/codegen.mjs                           # Use dev server (browser)
  node scripts/codegen.mjs --electron                # Use Electron recording
  node scripts/codegen.mjs --electron --inspector    # Electron with full Inspector
  node scripts/codegen.mjs --viewport=1920x1080      # Custom viewport
  node scripts/codegen.mjs --output=my-test.ts       # Save to file

For Electron mode with --inspector:
- Opens the full Playwright Inspector with recording capabilities
- Provides "Pick Locator", "Record", "Copy", and assertion features
- Generates actual test code just like web browser codegen
- Works with real Electron app for accurate testing
- Use the Inspector's Record button to start/stop recording
- Copy generated code directly from the Inspector window

See docs/PLAYWRIGHT_CODEGEN_GUIDE.md for details.
`);
    process.exit(0);
}

/**
 *
 */
async function startDevServer() {
    console.log("🚀 Starting development server...");

    return new Promise((resolve, reject) => {
        const devServer = spawn("npm", ["run", "dev"], {
            stdio: "pipe",
            shell: process.platform === "win32",
        });

        devServer.stdout?.on("data", (data) => {
            const output = data.toString();
            if (output.includes("Local:") && output.includes("5173")) {
                console.log("✅ Development server started");
                resolve("http://localhost:5173");
            }
        });

        devServer.stderr?.on("data", (data) => {
            console.error("Dev server error:", data.toString());
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            reject(new Error("Dev server startup timeout"));
        }, 30_000);
    });
}

/**
 * Launch Electron app with Playwright Inspector for full codegen recording
 * Following the official Electron + Playwright documentation pattern.
 */
async function startElectronWithInspector() {
    console.log("🎭 Starting Electron app with Playwright Inspector...");
    console.log(
        "⏳ This may take a moment - waiting for Electron window to appear..."
    );

    // Use the official Electron + Playwright pattern from the docs
    // Pass the project root directory '.' instead of absolute paths
    const electronApp = await electron.launch({
        args: ["."], // Launch from project root, not absolute path to main.js
        timeout: 30_000, // Standard timeout, not excessive
    });

    // Get the first window with proper error handling
    console.log("🔍 Waiting for Electron window to be ready...");
    const window = await electronApp.firstWindow();

    console.log("✅ Electron app launched successfully!");
    console.log(`📱 Window title: ${await window.title()}`);

    console.log(
        "\n🎯 Opening Playwright Inspector with full codegen capabilities..."
    );
    console.log("⏳ Please wait for the Inspector window to appear...");

    // This is the key! Using page.pause() opens the full Playwright Inspector
    // with recording, "Pick Locator", and test generation capabilities
    await window.pause();

    console.log(
        "\n🎉 Playwright Inspector is now active with full codegen features!"
    );
    console.log("📝 You can now:");
    console.log(
        "   - Click the 'Record' button to start recording interactions"
    );
    console.log("   - Use 'Pick Locator' button to select and test elements");
    console.log("   - Copy generated test code from the Inspector");
    console.log(
        "   - Add assertions by clicking the assertion toolbar buttons"
    );
    console.log("   - Clear and restart recording as needed");
    console.log("   - Save generated code to files for your test suite");

    console.log(
        "\n⏸️  Electron app is running with full Inspector capabilities..."
    );
    console.log(
        "💡 The Inspector window provides the same features as web codegen!"
    );
    console.log("🛑 Close the Inspector window or press Resume to continue");

    console.log("👋 Inspector session completed");
}

/**
 * Build codegen command for standard web browser testing.
 *
 * @param {string} target - Target URL.
 * @param {{viewport?: string, output?: string}} options - Configuration
 * options.
 *
 * @returns {string[]} Command array.
 */
function buildCodegenCommand(target, options) {
    const cmd = [
        "npx",
        "playwright",
        "codegen",
    ];

    // Add viewport
    if (options.viewport) {
        cmd.push("--viewport-size", options.viewport);
    }

    // Add output file if specified
    if (options.output) {
        cmd.push("--output", options.output);
    }

    // Add target (URL or Electron path)
    cmd.push(target);

    return cmd;
}

/**
 * Run the codegen command.
 *
 * @param {string[]} cmd - Command array to execute.
 *
 * @returns {import("child_process").ChildProcess} The spawned process.
 */
function runCodegen(cmd) {
    console.log(`🎬 Running: ${cmd.join(" ")}`);

    const codegen = spawn(cmd[0] ?? "npx", cmd.slice(1), {
        stdio: "inherit",
        shell: process.platform === "win32",
    });

    /**
     * @param {number | null} code
     */
    codegen.on("close", (code) => {
        if (code === 0) {
            console.log("✅ Codegen completed successfully!");
            console.log("\n📝 Next steps:");
            console.log("1. Copy the generated code");
            console.log("2. Adapt it to the Electron test pattern");
            console.log("3. Add proper test metadata (tags, annotations)");
            console.log("4. Save to appropriate test file");
            console.log("5. Run: npx playwright test your-test.ts");
            console.log(
                "\n📖 See docs/PLAYWRIGHT_CODEGEN_GUIDE.md for details"
            );
        } else {
            console.error(`❌ Codegen failed with exit code ${code}`);
        }
    });

    return codegen;
}

/**
 *
 */
async function main() {
    // Load custom transformations
    try {
        // Get current directory safely for ESM
        const currentDir = new URL(".", import.meta.url).pathname;
        const templatePath = path.join(
            currentDir,
            "..",
            "playwright",
            "codegen-template.mjs"
        );
        if (existsSync(templatePath)) {
            const transformModule = await import(templatePath);
            applyLintCompliantTransforms =
                transformModule.applyLintCompliantTransforms;
            console.log("✅ Loaded lint-compliant transform functions");
        }
    } catch (error) {
        console.warn(
            "⚠️ Could not load transform functions:",
            error instanceof Error ? error.message : String(error)
        );
        /** @param {string} code */
        applyLintCompliantTransforms = (code) => code; // Fallback function
    }

    if (options.help) {
        showHelp();
    }

    console.log("🎭 Uptime-Watcher Playwright Codegen Helper\n");

    try {
        if (options.electron) {
            console.log("📱 Using Electron app mode...");

            if (options.inspector) {
                // Use the new approach with page.pause() for full codegen capabilities
                // Following official Electron + Playwright documentation
                await startElectronWithInspector();
            } else {
                console.log(
                    "💡 Tip: Use --inspector flag for full codegen recording experience!"
                );
                console.log(
                    "🚀 Starting basic Electron app for manual testing..."
                );

                // Launch Electron app for manual interaction using official pattern
                const electronApp = await electron.launch({
                    args: ["."], // Use project root instead of absolute path
                    timeout: 30_000, // Standard timeout
                });

                console.log("🔍 Waiting for Electron window...");
                const window = await electronApp.firstWindow();
                console.log("✅ Electron app launched!");
                console.log(`📱 Window title: ${await window.title()}`);
                console.log("💡 You can now manually test your app");
                console.log(
                    "📝 Use browser DevTools to inspect elements and copy selectors"
                );
                console.log("🛑 Press Ctrl+C to stop");

                // Keep running until manually stopped
                await electronApp.evaluate(
                    ({ app }) =>
                        new Promise((resolve) => {
                            app.on("window-all-closed", () => resolve(true));
                        })
                );
            }
        } else {
            console.log("🌐 Using development server mode...");
            const target = await startDevServer();
            /** @type {{viewport?: string, output?: string}} */
            const cmdOptions = { viewport: options.viewport };
            if (options.output) {
                cmdOptions.output = options.output;
            }
            const cmd = buildCodegenCommand(target, cmdOptions);
            runCodegen(cmd);
            console.log(
                "\n💡 Post-processing tip: If you save generated tests with --output,"
            );
            console.log(
                "   you can manually apply transforms using applyLintCompliantTransforms()"
            );
            console.log(
                "   from the loaded template to make them lint-compliant."
            );
            console.log(
                `   Transform function loaded: ${typeof applyLintCompliantTransforms === "function" ? "✅" : "❌"}`
            );
        }
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
    }
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
    console.log("\n👋 Codegen interrupted");
    process.exit(0);
});

await main().catch(console.error);
