/**
 * Vite configuration for the Uptime Watcher Electron application.
 * Configures React frontend build and Electron main/preload process compilation.
 */

import path from "path";
// eslint-disable-next-line perfectionist/sort-imports
import react from "@vitejs/plugin-react";
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
        outDir: "dist",
        rollupOptions: {
            output: {
                manualChunks: undefined, // Avoids code splitting for Electron main/preload
            },
        },
        sourcemap: true, // Recommended for Electron debugging
        target: "esnext", // Modern output for Electron
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
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        open: false, // Don't auto-open browser (Electron only)
        port: 5173,
        strictPort: true, // Fail if port is taken (prevents silent port changes)
    },
    test: {
        coverage: {
            exclude: [
                "coverage/**",
                "dist/**",
                "dist-electron/**",
                "**/dist/**", // Exclude any dist folder anywhere
                "electron/dist/**", // Explicitly exclude electron/dist
                "electron/**", // Exclude all electron files from frontend coverage
                "**/*.d.ts",
                "**/*.config.*",
                "**/node_modules/**",
                "release/**",
                "scripts/**",
                "electron/test/dist/**", // Exclude compiled electron test files
            ],
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
    },
});
