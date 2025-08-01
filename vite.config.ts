/**
 * Vite configuration for the Uptime Watcher Electron application.
 * Configures React frontend build and Electron main/preload process compilation.
 */

import { codecovVitePlugin } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import electron from "vite-plugin-electron";
import { ViteMcp } from "vite-plugin-mcp";
import { getEnvVar as getEnvironmentVariable } from "./shared/utils/environment";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption } from "vite";

/**
 * Vite configuration object.
 * Sets up build settings for both renderer (React) and main/preload processes.
 */
export default defineConfig(() => {
    const codecovToken = getEnvironmentVariable("CODECOV_TOKEN");
    return {
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
        esbuild: {
            target: "es2024", // Match TypeScript target for consistency
            // Transpile all files with ESBuild to remove comments from code coverage.
            // Required for `test.coverage.ignoreEmptyLines` to work:
            include: [
                "**/*.js",
                "**/*.jsx",
                "**/*.mjs",
                "**/*.ts",
                "**/*.tsx",
            ],
            // More aggressive transformation to help coverage parsing
            keepNames: true, // Preserve function names for better coverage reports
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
                projectRoot: path.resolve(import.meta.dirname),
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
                enableBundleAnalysis: codecovToken !== undefined,
                ...(codecovToken ? { uploadToken: codecovToken } : {}),
                telemetry: false, // Disable telemetry for faster builds
            }),
        ],
        resolve: {
            alias: {
                "@": path.resolve(import.meta.dirname, "src"),
                "@electron": path.resolve(import.meta.dirname, "electron"),
                "@shared": path.resolve(import.meta.dirname, "shared"),
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
                    "**/docs/**",
                    "**/*.config.*",
                    "**/*.d.ts",
                    "**/dist/**", // Exclude any dist folder anywhere
                    "**/docs/**", // Exclude documentation files
                    "**/index.ts", // Any other index files
                    "**/index.ts", // Any other index files
                    "**/index.ts", // Exclude all barrel export files
                    "**/index.tsx", // Exclude JSX barrel export files
                    "**/node_modules/**",
                    "**/types.ts", // Exclude type definition files
                    "**/types.tsx", // Exclude type definition files with JSX
                    "coverage/**",
                    "dist-electron/**",
                    "dist/**",
                    "electron/**", // Exclude all electron files from frontend coverage
                    "electron/**/*.d.ts",
                    "electron/**/*.spec.ts",
                    "electron/**/*.test.ts",
                    "electron/**/index.ts", // Explicit electron barrel files
                    "electron/**/types.ts",
                    "electron/components/**/index.ts", // Component barrel files
                    "electron/dist/**",
                    "electron/dist/**", // Explicitly exclude electron/dist
                    "electron/hooks/**/index.ts", // Hook barrel files
                    "electron/managers/**/index.ts", // Manager barrel files
                    "electron/services/**/index.ts", // Service barrel files
                    "electron/services/*/index.ts",
                    "electron/test/**",
                    "electron/test/dist/**", // Exclude compiled electron test files
                    "electron/utils/**/index.ts", // Utility barrel files
                    "index.ts", // Barrel export file at root
                    "index.ts", // Barrel export file at root
                    "release/**",
                    "scripts/**",
                    "src/components/**/index.ts", // Component barrel files
                    "src/components/index.ts", // Explicit barrel files
                    "src/hooks/**/index.ts", // Hook barrel files
                    "src/hooks/index.ts", // Explicit barrel files
                    "src/stores/index.ts", // Explicit barrel files
                    "src/stores/sites/services/index.ts", // Specific barrel files
                    "src/stores/sites/utils/index.ts", // Specific barrel files
                    "src/theme/types.ts", // Exclude theme types
                    "src/types.ts", // Explicitly exclude main types file
                    "src/utils/index.ts", // Explicit barrel files
                ],
                ignoreEmptyLines: true, // Ignore empty lines in coverage reports
                experimentalAstAwareRemapping: false, // Enable AST-aware remapping for better accuracy
                processingConcurrency: 2, // Reduce concurrency to avoid parsing conflicts
                skipFull: false, // Don't skip full coverage collection
                all: true, // Include all source files in coverage
                provider: "v8" as const,
                reporter: ["text", "json", "lcov", "html"],
                reportsDirectory: "./coverage",
                thresholds: {
                    branches: 70, // Minimum 70% branch coverage
                    functions: 80, // Minimum 80% function coverage
                    lines: 80, // Minimum 80% line coverage
                    statements: 80, // Minimum 80% statement coverage
                },
            },
            environment: "jsdom", // Default for React components
            // Test file patterns - exclude electron tests as they have their own config
            exclude: [
                "**/node_modules/**",
                "**/docs/**",
                "**/dist/**",
                "**/dist-electron/**",
                "electron/**",
                "**/coverage/**",
            ],
            globals: true, // Enable global test functions (describe, it, expect)
            include: [
                "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                "shared/**/*.test.ts",
                "shared/**/*.spec.ts",
            ],
            outputFile: {
                json: "./coverage/test-results.json",
            },
            // Modern performance optimizations
            pool: "threads", // Use worker threads for better performance
            poolOptions: {
                threads: {
                    isolate: true, // Isolate tests for better reliability
                    singleThread: false, // Enable multi-threading
                },
            },
            // Improve test output
            reporters: ["default", "json", "verbose", "hanging-process"],
            setupFiles: ["./src/test/setup.ts"], // Setup file for testing
            testTimeout: 15_000, // Set Vitest timeout to 15 seconds
        },
    };
});
