/**
 * Vite configuration for the Uptime Watcher Electron application.
 * Configures React frontend build and Electron main/preload process compilation.
 */

import { codecovVitePlugin } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react";
import * as path from "node:path";
import electron from "vite-plugin-electron";
import { ViteMcp } from "vite-plugin-mcp";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vitest/config";

/**
 * Vite configuration object.
 * Sets up build settings for both renderer (React) and main/preload processes.
 */
export default defineConfig({
    base: "./", // Ensures relative asset paths for Electron
    build: {
        emptyOutDir: true, // Clean output before build
        modulePreload: {
            polyfill: false, // Modern browsers don't need polyfill
        },
        outDir: "dist",
        rollupOptions: {
            // No manual chunks configuration for Electron builds
        },
        sourcemap: true, // Recommended for Electron debugging
        target: "es2024", // Match TypeScript target for consistency
    },
    plugins: [
        react(),
        ViteMcp(),
        electron([
            {
                entry: "electron/main.ts",
                onstart(options) {
                    options.startup();
                },
                vite: {
                    build: {
                        outDir: "dist-electron",
                    },
                },
            },
            {
                entry: "electron/preload.ts",
                onstart(options) {
                    options.reload();
                },
                vite: {
                    build: {
                        outDir: "dist-electron",
                    },
                },
            },
        ]),
        viteStaticCopy({
            targets: [
                // Remove copy to dist/ (frontend) - only needed in dist-electron/
                {
                    dest: "../dist-electron", // Copies to dist-electron/
                    src: "node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm",
                },
            ],
        }),
        // Put the Codecov vite plugin after all other plugins
        codecovVitePlugin({
            bundleName: "uptime-watcher",
            enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
            ...(process.env.CODECOV_TOKEN && { uploadToken: process.env.CODECOV_TOKEN }),
            telemetry: false, // Disable telemetry for faster builds
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        hmr: {
            port: 5174, // Use different port for HMR to avoid conflicts
        },
        open: false, // Don't auto-open browser (Electron only)
        port: 5173,
        strictPort: true, // Fail if port is taken (prevents silent port changes)
    },
    test: {
        coverage: {
            exclude: [
                "coverage/**", // Exclude coverage reports
                "dist/**", // Exclude frontend build output
                "dist-electron/**", // Exclude Electron build output
                "**/dist/**", // Exclude any dist folder anywhere
                "electron/dist/**", // Explicitly exclude electron/dist
                "electron/**", // Exclude all electron files from frontend coverage
                "**/*.d.ts", // Exclude TypeScript declaration files
                "**/*.config.*", // Exclude configuration files
                "**/node_modules/**", // Exclude node_modules
                "release/**", // Exclude release files
                "scripts/**", // Exclude scripts
                "electron/test/dist/**", // Exclude compiled electron test files
                "**/types.ts", // Exclude type definition files
                "**/types.tsx", // Exclude type definition files with JSX
                "src/types.ts", // Explicitly exclude main types file
                "src/theme/types.ts", // Exclude theme types
            ],
            ignoreEmptyLines: true, // Ignore empty lines in coverage reports
            provider: "v8",
            reporter: ["text", "json", "lcov", "html"],
            reportsDirectory: "./coverage",
        },
        environment: "jsdom", // Default for React components
        // Test file patterns - exclude electron tests as they have their own config
        exclude: ["**/node_modules/**", "**/dist/**", "**/dist-electron/**", "electron/**", "**/coverage/**"],
        globals: true, // Enable global test functions (describe, it, expect)
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        setupFiles: ["./src/test/setup.ts"], // Setup file for testing
        testTimeout: 10000, // Set Vitest timeout to 10 seconds
    },
});
