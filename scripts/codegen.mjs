#!/usr/bin/env node

/**
 * Playwright Codegen Helper Script for Uptime-Watcher
 *
 * This script simplifies the process of generating Playwright tests for the
 * Uptime-Watcher Electron application.
 *
 * Usage: node scripts/codegen.mjs [options]
 *
 * Options: --dev Use development server (default) --electron Use built Electron
 * app --viewport Set viewport size (e.g., 1280x720) --output Output file path
 */

import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    dev: args.includes("--dev") || !args.includes("--electron"),
    electron: args.includes("--electron"),
    viewport:
        args.find((arg) => arg.startsWith("--viewport="))?.split("=")[1] ||
        "1280,720",
    output: args.find((arg) => arg.startsWith("--output="))?.split("=")[1],
    help: args.includes("--help") || args.includes("-h"),
};

function showHelp() {
    console.log(`
🎭 Playwright Codegen Helper for Uptime-Watcher

Usage: node scripts/codegen.mjs [options]

Options:
  --dev               Use development server (default)
  --electron          Use built Electron app
  --viewport=WxH      Set viewport size (default: 1280,720)
  --output=file.ts    Output file path
  --help, -h          Show this help

Examples:
  node scripts/codegen.mjs                           # Use dev server
  node scripts/codegen.mjs --electron                # Use Electron app
  node scripts/codegen.mjs --viewport=1920x1080      # Custom viewport
  node scripts/codegen.mjs --output=my-test.ts       # Save to file

Generated tests will need to be adapted to the Electron test pattern.
See docs/PLAYWRIGHT_CODEGEN_GUIDE.md for details.
`);
    process.exit(0);
}

function checkElectronBuild() {
    const electronMainPath = path.resolve("dist-electron/main.js");
    if (!fs.existsSync(electronMainPath)) {
        console.error(
            '❌ Electron build not found. Run "npm run build" first.'
        );
        process.exit(1);
    }
    return electronMainPath;
}

async function startDevServer() {
    console.log("🚀 Starting development server...");

    return new Promise((resolve, reject) => {
        const devServer = spawn("npm", ["run", "dev"], {
            stdio: "pipe",
            shell: true,
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

function buildCodegenCommand(target, options) {
    const cmd = ["npx", "playwright", "codegen"];

    // Add viewport
    cmd.push("--viewport-size", options.viewport);

    // Add output file if specified
    if (options.output) {
        cmd.push("--output", options.output);
    }

    // Add target (URL or Electron path)
    cmd.push(target);

    return cmd;
}

function runCodegen(cmd) {
    console.log(`🎬 Running: ${cmd.join(" ")}`);

    const codegen = spawn(cmd[0], cmd.slice(1), {
        stdio: "inherit",
        shell: true,
    });

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

async function main() {
    if (options.help) {
        showHelp();
    }

    console.log("🎭 Uptime-Watcher Playwright Codegen Helper\n");

    try {
        let target;

        if (options.electron) {
            console.log("📱 Using Electron app mode...");
            target = checkElectronBuild();
            console.log(
                "⚠️  Note: Direct Electron codegen may not work perfectly."
            );
            console.log(
                "   Consider using --dev mode instead for better results."
            );
        } else {
            console.log("🌐 Using development server mode...");
            target = await startDevServer();
        }

        const cmd = buildCodegenCommand(target, options);
        runCodegen(cmd);
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
