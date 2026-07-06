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
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const PLAYWRIGHT_CLI_PATH = path.join(
    PROJECT_ROOT,
    "node_modules",
    "playwright",
    "cli.js"
);

// Will be loaded dynamically in main()
/** @type {function(string): string | undefined} */
let applyLintCompliantTransforms;

const DEFAULT_VIEWPORT = "1280,720";
const VALUE_OPTIONS = new Set(["--output", "--viewport"]);

/**
 * Read a value for an option that supports either `--flag=value` or `--flag
 * value`.
 *
 * @param {string[]} args - Raw command line arguments.
 * @param {number} index - Current argument index.
 *
 * @returns {{ consumed: number; value: string }} Parsed value and number of
 *   extra arguments consumed.
 */
function readOptionValue(args, index) {
    const option = args[index];
    if (!option) {
        throw new Error("Missing option name");
    }

    const equalIndex = option.indexOf("=");

    if (equalIndex >= 0) {
        const value = option.slice(equalIndex + 1);
        if (!value) {
            throw new Error(`Missing value for ${option.slice(0, equalIndex)}`);
        }

        return { consumed: 0, value };
    }

    const value = args[index + 1];
    if (!value || value.startsWith("-")) {
        throw new Error(`Missing value for ${option}`);
    }

    return { consumed: 1, value };
}

/**
 * Convert the helper's documented viewport syntax to Playwright's CLI syntax.
 *
 * @param {string} viewport - Viewport in `widthxheight` or `width,height`
 *   format.
 *
 * @returns {string} Playwright viewport value in `width,height` format.
 */
function normalizeViewport(viewport) {
    const match = /^([1-9]\d*)[x,]([1-9]\d*)$/u.exec(viewport);
    if (!match) {
        throw new Error(
            `Invalid viewport "${viewport}". Use a positive WxH value like 1280x720.`
        );
    }

    const width = match[1];
    const height = match[2];
    if (!width || !height) {
        throw new Error(
            `Invalid viewport "${viewport}". Use a positive WxH value like 1280x720.`
        );
    }

    return `${width},${height}`;
}

/**
 * Parse and validate command line arguments.
 *
 * @param {string[]} args - Raw command line arguments.
 *
 * @returns {{
 *     dev: boolean;
 *     electron: boolean;
 *     help: boolean;
 *     inspector: boolean;
 *     output?: string;
 *     viewport: string;
 * }}
 *   Parsed options.
 */
function parseArgs(args) {
    /**
     * @type {{
     *     electron: boolean;
     *     help: boolean;
     *     inspector: boolean;
     *     output?: string;
     *     viewport: string;
     * }}
     */
    const parsed = {
        electron: false,
        help: false,
        inspector: false,
        viewport: DEFAULT_VIEWPORT,
    };
    let explicitDev = false;

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (!arg) {
            continue;
        }

        const optionName = arg.includes("=")
            ? arg.slice(0, arg.indexOf("="))
            : arg;

        if (VALUE_OPTIONS.has(optionName)) {
            const { consumed, value } = readOptionValue(args, index);
            index += consumed;

            if (optionName === "--viewport") {
                parsed.viewport = normalizeViewport(value);
            } else {
                parsed.output = value;
            }

            continue;
        }

        switch (arg) {
            case "--dev": {
                explicitDev = true;
                break;
            }
            case "--electron": {
                parsed.electron = true;
                break;
            }
            case "--help":
            case "-h": {
                parsed.help = true;
                break;
            }
            case "--inspector": {
                parsed.inspector = true;
                break;
            }
            default: {
                throw new Error(`Unknown argument: ${arg}`);
            }
        }
    }

    return {
        ...parsed,
        dev: explicitDev || !parsed.electron,
    };
}

/**
 * Print usage information.
 *
 * @returns {void}
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
}

/**
 * Start the Vite dev server and resolve once it is reachable.
 *
 * @returns {Promise<string>} Base URL for the running dev server.
 */
async function startDevServer() {
    console.log("🚀 Starting development server...");

    return new Promise((resolve, reject) => {
        const npmInvocation = resolveNpmRunInvocation("dev");
        let settled = false;
        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                reject(new Error("Dev server startup timeout"));
            }
        }, 30_000);

        const devServer = spawn(npmInvocation.command, npmInvocation.args, {
            cwd: PROJECT_ROOT,
            stdio: "pipe",
        });

        const rejectOnce = (error) => {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                reject(error);
            }
        };

        devServer.stdout?.on("data", (data) => {
            const output = data.toString();
            if (output.includes("Local:") && output.includes("5173")) {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(timeout);
                console.log("✅ Development server started");
                resolve("http://localhost:5173");
            }
        });

        devServer.stderr?.on("data", (data) => {
            console.error("Dev server error:", data.toString());
        });

        devServer.on("error", rejectOnce);
        devServer.on("close", (code) => {
            rejectOnce(
                new Error(`Dev server exited before startup with code ${code}`)
            );
        });
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
 * @param {{ viewport?: string; output?: string }} options - Configuration
 *   options.
 *
 * @returns {{ args: string[]; command: string; displayCommand: string }}
 *   Command invocation.
 */
function buildCodegenCommand(target, options) {
    assertLocalPlaywrightCli();

    const args = ["codegen"];

    // Add viewport
    if (options.viewport) {
        args.push("--viewport-size", options.viewport);
    }

    // Add output file if specified
    if (options.output) {
        args.push("--output", options.output);
    }

    // Add target (URL or Electron path)
    args.push(target);

    return {
        args: [PLAYWRIGHT_CLI_PATH, ...args],
        command: process.execPath,
        displayCommand: `playwright ${args.join(" ")}`,
    };
}

/**
 * Run the codegen command.
 *
 * @param {{ args: string[]; command: string; displayCommand: string }} cmd -
 *   Command invocation to execute.
 *
 * @returns {import("child_process").ChildProcess} The spawned process.
 */
function runCodegen(cmd) {
    console.log(`🎬 Running: ${cmd.displayCommand}`);

    const codegen = spawn(cmd.command, cmd.args, {
        cwd: PROJECT_ROOT,
        stdio: "inherit",
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
 * Resolve a portable npm script invocation without shell string parsing.
 *
 * @param {string} scriptName - Npm script to run.
 *
 * @returns {{ args: string[]; command: string }} Child process invocation.
 */
function resolveNpmRunInvocation(scriptName) {
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

/**
 * Ensure the local Playwright CLI is installed before launching codegen.
 *
 * @returns {void}
 */
function assertLocalPlaywrightCli() {
    if (!existsSync(PLAYWRIGHT_CLI_PATH)) {
        throw new Error(
            `Playwright CLI not found: ${PLAYWRIGHT_CLI_PATH}. Run npm install before running codegen.`
        );
    }
}

/**
 * Entrypoint for the Playwright codegen helper.
 *
 * @param {string[]} [args] - Raw command-line arguments.
 *
 * @returns {Promise<boolean>} `true` when launch setup completes successfully.
 */
async function main(args = process.argv.slice(2)) {
    const options = parseArgs(args);

    if (options.help) {
        showHelp();
        return true;
    }

    // Load custom transformations
    try {
        const templatePath = path.join(
            PROJECT_ROOT,
            "playwright",
            "codegen-template.mjs"
        );
        if (existsSync(templatePath)) {
            const transformModule = await import(
                pathToFileURL(templatePath).href
            );
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
            /** @type {{ viewport?: string; output?: string }} */
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
        return false;
    }

    return true;
}

/**
 * Register CLI-only process signal handlers.
 *
 * @returns {void}
 */
function registerSignalHandlers() {
    // Handle Ctrl+C gracefully
    process.on("SIGINT", () => {
        console.log("\n👋 Codegen interrupted");
        process.exit(0);
    });
}

/**
 * @returns {boolean} `true` when this file is the CLI entrypoint.
 */
function isDirectRun() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectRun()) {
    registerSignalHandlers();
    try {
        process.exitCode = (await main()) ? 0 : 1;
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        process.exitCode = 1;
    }
}

export {
    buildCodegenCommand,
    isDirectRun,
    main,
    normalizeViewport,
    parseArgs,
    readOptionValue,
    registerSignalHandlers,
    resolveNpmRunInvocation,
};
