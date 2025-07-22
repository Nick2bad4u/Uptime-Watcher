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
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption } from "vite";

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
        react({
            // Enable Fast Refresh for better development experience
            // Includes .js, .jsx, .ts, .tsx by default

            // Use automatic JSX runtime (default, but explicit for clarity)
            jsxRuntime: "automatic",

            // Configure babel for any custom transformations if needed
            babel: {
                // Use babel configuration files if they exist
                babelrc: false,
                configFile: false,
                // Add any custom babel plugins here if needed
                plugins: [],
            },
        }),
        // // TypeScript checking in development (ESLint disabled due to flat config compatibility)
        // checker({
        //     typescript: {
        //         tsconfigPath: "./tsconfig.json",
        //     },
        //     // stylelint: {
        //     //     // for example, lint .css and .vue
        //     //     lintCommand: "stylelint ./src/**/*.{css,vue}",
        //     //     watchPath: './src',
        //     // },
        //     overlay: {
        //         initialIsOpen: false, // Don't auto-open overlay
        //         position: "br", // Bottom-right position
        //     },
        //     enableBuild: false, // Disable in build mode (use CI for production checking)
        // }),
        ViteMcp(),
        visualizer({
            filename: "build-stats.html",
            title: "Electron React Bundle Stats",
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
            emitFile: true,
            sourcemap: true,
            projectRoot: path.resolve(__dirname),
            include: [{ file: "**/*.ts" }, { file: "**/*.tsx" }, { file: "**/*.js" }, { file: "**/*.jsx" }],
            exclude: [{ file: "node_modules/**" }, { file: "**/*.test.*" }, { file: "**/*.spec.*" }],
        }) as PluginOption,
        viteStaticCopy({
            targets: [
                // Remove copy to dist/ (frontend) - only needed in dist-electron/
                {
                    dest: "../dist-electron", // Copies to dist-electron/
                    src: "assets/node-sqlite3-wasm.wasm",
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
            "@electron": path.resolve(__dirname, "electron"),
            "@shared": path.resolve(__dirname, "shared"),
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
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}"],
        setupFiles: ["./src/test/setup.ts"], // Setup file for testing
        testTimeout: 10_000, // Set Vitest timeout to 10 seconds
    },
});
