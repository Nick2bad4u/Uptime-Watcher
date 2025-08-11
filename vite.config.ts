/**
 * Vite configuration for the Uptime Watcher Electron application.
 * Configures React frontend build and Electron main/preload proce            cache: true,ss compilation.
 */

import { codecovVitePlugin } from "@codecov/vite-plugin";
import reactScan from "@react-scan/vite-plugin-react-scan";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption, type UserConfigFnObject } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import { patchCssModules } from "vite-css-modules";
import devtoolsJson from "vite-plugin-devtools-json";
import electron from "vite-plugin-electron";
import { ViteMcp } from "vite-plugin-mcp";
import packageVersion from "vite-plugin-package-version";
import { viteStaticCopy } from "vite-plugin-static-copy";

import { getEnvVar as getEnvironmentVariable } from "./shared/utils/environment";

/**
 * Vite configuration object.
 * Sets up build settings for both renderer (React) and main/preload processes.
 */

export default defineConfig(({}) => {
    const codecovToken = getEnvironmentVariable("CODECOV_TOKEN");
    return {
        base: "./", // Ensures relative asset paths for Electron
        build: {
            copyPublicDir: true, // Copy public assets to dist
            emptyOutDir: true, // Clean output before build
            modulePreload: {
                polyfill: false, // Modern browsers don't need polyfill
            },
            outDir: "dist",
            rollupOptions: {
                // No manual chunks configuration for Electron builds
            },
            sourcemap: true, // Recommended for Electron debugging
            target: "es2024", // Updated from es2024 for CSS Modules compatibility
        },
        css: {
            modules: {
                generateScopedName: "[name]__[local]___[hash:base64:5]", // Custom scoped name pattern
                // CSS Modules configuration
                localsConvention: "camelCase" as const, // Convert kebab-case to camelCase for named exports
            },
        },
        esbuild: {
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
            target: "es2024", // Updated to match build target for CSS Modules compatibility
        },
        plugins: [
            // CSS Modules patch to fix Vite's CSS Modules handling
            patchCssModules({
                generateSourceTypes: true, // Generate .d.ts files for TypeScript support
            }),
            // Inject package version into import.meta.env.PACKAGE_VERSION
            packageVersion(),
            electron([
                {
                    entry: "electron/main.ts",
                    onstart(options) {
                        void options.startup();
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
                // Configure babel for any custom transformations if needed
                babel: {
                    // Use babel configuration files if they exist
                    babelrc: false,
                    configFile: false,
                    // Add any custom babel plugins here if needed
                    plugins: [],
                },

                // Enable Fast Refresh for better development experience
                // Includes .js, .jsx, .ts, .tsx by default
                // Use automatic JSX runtime (default, but explicit for clarity)
                jsxRuntime: "automatic",
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
            reactScan({
                autoDisplayNames: true,
                debug: false, // Disable debug logs
                enable: process.env["NODE_ENV"] === "development",
                // React Scan specific options
                scanOptions: {
                    animationSpeed: "fast",
                    dangerouslyForceRunInProduction: false,
                    enabled: process.env["NODE_ENV"] === "development",
                    log: false,
                    showToolbar: process.env["NODE_ENV"] === "development",
                    trackUnnecessaryRenders: true,
                },
            }),
            devtoolsJson({ normalizeForWindowsContainer: true }),
            // Bundle analysis tools - both provide different perspectives
            visualizer({
                brotliSize: true,
                emitFile: true,
                exclude: [
                    { file: "node_modules/**" },
                    { file: "**/*.test.*" },
                    { file: "**/*.spec.*" },
                ],
                filename: "build-stats.html",
                gzipSize: true,
                include: [
                    { file: "**/*.ts" },
                    { file: "**/*.tsx" },
                    { file: "**/*.js" },
                    { file: "**/*.jsx" },
                ],
                open: false,
                projectRoot: path.resolve(import.meta.dirname),
                sourcemap: true,
                template: "treemap",
                title: "Electron React Bundle Stats",
            }) as PluginOption,
            analyzer({
                analyzerMode: "static", // Generate static HTML report
                brotliOptions: {}, // Use default brotli options
                defaultSizes: "gzip", // Show gzipped sizes by default
                fileName: "bundle-analysis", // Different from visualizer
                gzipOptions: {}, // Use default gzip options
                openAnalyzer: false, // Don't auto-open (you have visualizer for that)
                reportTitle: "Uptime Watcher Bundle Analysis",
                summary: true, // Show summary in console
            }),
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
                "@": path.resolve(import.meta.dirname, "./src"),
                "@electron": path.resolve(import.meta.dirname, "./electron"),
                "@shared": path.resolve(import.meta.dirname, "./shared"),
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
                all: true, // Include all source files in coverage
                exclude: [
                    "**/*.config.*",
                    "**/*.d.ts",
                    "**/dist/**", // Exclude any dist folder anywhere
                    "**/docs/**",
                    "**/docs/**", // Exclude documentation files
                    "**/index.ts", // Exclude all barrel export files
                    "**/index.tsx", // Exclude JSX barrel export files
                    "**/node_modules/**",
                    "**/types.ts", // Exclude type definition files
                    "**/types.tsx", // Exclude type definition files with JSX
                    "src/test/**",
                    "coverage/**",
                    "dist-electron/**",
                    "dist/**",
                    "electron/**", // Exclude all electron files from frontend coverage
                    "index.ts", // Barrel export file at root
                    "release/**",
                    "scripts/**",
                    "report/**", // Exclude report files,
                    "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                ],
                experimentalAstAwareRemapping: true, // Enable AST-aware remapping for better accuracy
                ignoreEmptyLines: true, // Ignore empty lines in coverage reports
                provider: "istanbul" as const,
                reporter: ["text", "json", "lcov", "html"],
                reportOnFailure: true,
                reportsDirectory: "./coverage",
                skipFull: false, // Don't skip full coverage collection
                thresholds: {
                    autoUpdate: true,
                    branches: 70, // Minimum 70% branch coverage
                    functions: 80, // Minimum 80% function coverage
                    lines: 80, // Minimum 80% line coverage
                    statements: 80, // Minimum 80% statement coverage
                },
            },
            deps: {
                optimizer: {
                    web: { enabled: true },
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
                "**/docs/**",
            ],
            expect: {
                requireAssertions: true,
            },
            globals: true, // Enable global test functions (describe, it, expect)
            include: [
                "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                "shared/**/*.test.ts",
                "shared/**/*.spec.ts",
            ],
            name: {
                color: "cyan",
                label: "UW Testing Frontend",
            }, // Custom project name and color for Vitest
            outputFile: {
                json: "./coverage/test-results.json",
            },
            // Modern performance optimizations
            pool: "threads", // Use worker threads for better performance
            poolOptions: {
                threads: {
                    isolate: true, // Isolate tests for better reliability
                    maxThreads: 24, // Limit concurrent threads to reduce listener conflicts
                    minThreads: 1, // Ensure at least one thread
                    singleThread: false, // Enable multi-threading
                    useAtomics: true,
                },
            },
            projects: ["vitest.config.ts", "vitest.electron.config.ts"],
            // Improve test output
            reporters: ["default", "json", "verbose", "hanging-process"],
            setupFiles: ["./src/test/setup.ts"], // Setup file for testing
            testTimeout: 15_000, // Set Vitest timeout to 15 seconds
        },
    };
}) satisfies UserConfigFnObject as UserConfigFnObject;
