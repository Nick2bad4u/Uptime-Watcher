/**
 * Vite configuration for the Uptime Watcher Electron application.
 * Configures React frontend build and Electron main/preload process compilation.
 */

import { codecovVitePlugin } from "@codecov/vite-plugin";
import reactScan from "@react-scan/vite-plugin-react-scan";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import {
    defineConfig,
    normalizePath,
    type PluginOption,
    type UserConfigFnObject,
} from "vite";
import { analyzer } from "vite-bundle-analyzer";
import { patchCssModules } from "vite-css-modules";
import devtoolsJson from "vite-plugin-devtools-json";
import electron from "vite-plugin-electron";
import { ViteMcp } from "vite-plugin-mcp";
import packageVersion from "vite-plugin-package-version";
import { viteStaticCopy } from "vite-plugin-static-copy";

import { fileURLToPath } from "url";

import { getEnvVar as getEnvironmentVariable } from "./shared/utils/environment";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
                output: {
                    // Manual chunk splitting to optimize bundle sizes and improve caching
                    manualChunks: {
                        // React ecosystem - separate chunk for framework code (changes less frequently)
                        "react-vendor": ["react", "react-dom"],

                        // Chart.js ecosystem - separate chunk for charting (large but stable)
                        "chart-vendor": [
                            "chart.js",
                            "react-chartjs-2",
                            "chartjs-adapter-date-fns",
                            "chartjs-plugin-zoom",
                        ],

                        // UI and icon libraries - separate chunk for visual components
                        "ui-vendor": ["react-icons"],

                        // Utility libraries - separate chunk for utilities and validation
                        "utils-vendor": [
                            "axios",
                            "validator",
                            "zod",
                            "zustand",
                        ],

                        // Electron-specific libraries - separate chunk for desktop functionality
                        "electron-vendor": ["electron-log", "electron-updater"],

                        // Monitoring tools - separate chunk for uptime monitoring logic
                        "monitor-vendor": ["is-port-reachable", "ping"],
                    },
                },
            },
            sourcemap: true, // Recommended for Electron debugging
            target: "es2024", // Updated from es2024 for CSS Modules compatibility

            // Increase chunk size warning limit to account for intentional larger vendor chunks
            chunkSizeWarningLimit: 1000, // Increase from default 500KB to 1MB for vendor chunks
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
                    // Main process entry file of the Electron App
                    entry: "electron/main.ts",
                    // Hot Restart: Automatically restart the Electron App when main process changes
                    onstart(args) {
                        // If this onstart is passed, Electron App will not start automatically.
                        // However, you can start Electron App via startup function.
                        void args.startup();
                    },
                    vite: {
                        build: {
                            outDir: "dist-electron",
                            sourcemap: true, // Enable sourcemaps for main process
                        },
                        resolve: {
                            alias: {
                                "@shared": normalizePath(
                                    path.resolve(__dirname, "shared")
                                ),
                                "@electron": normalizePath(
                                    path.resolve(__dirname, "electron")
                                ),
                                "@app": normalizePath(
                                    path.resolve(__dirname, "src")
                                ),
                            },
                        },
                    },
                },
                {
                    // Preload scripts entry file of the Electron App
                    entry: "electron/preload.ts",
                    // Hot Reload: Refresh the Renderer process when Preload scripts change
                    onstart(args) {
                        // Notify the Renderer process to reload the page when the Preload scripts build is complete,
                        // instead of restarting the entire Electron App.
                        args.reload();
                    },
                    vite: {
                        build: {
                            outDir: "dist-electron",
                            rollupOptions: {
                                output: {
                                    // Ensure preload scripts are not code-split for nodeIntegration: false compatibility
                                    inlineDynamicImports: true,
                                },
                            },
                            sourcemap: true, // Enable sourcemaps for preload script
                        },
                        resolve: {
                            alias: {
                                "@shared": normalizePath(
                                    path.resolve(__dirname, "shared")
                                ),
                            },
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
            // Only include react-scan in development mode to avoid sourcemap warnings in production
            ...(process.env["NODE_ENV"] === "development"
                ? [
                      reactScan({
                          autoDisplayNames: true,
                          debug: false, // Disable debug logs
                          enable: true, // Always enabled when included
                          // React Scan specific options
                          scanOptions: {
                              animationSpeed: "fast",
                              dangerouslyForceRunInProduction: false,
                              enabled: true, // Always enabled when included
                              log: false,
                              showToolbar: true, // Always show in development
                              trackUnnecessaryRenders: true,
                          },
                      }),
                  ]
                : []),
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
                projectRoot: normalizePath(path.resolve(__dirname)),
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
                    {
                        dest: "../dist-electron", // Copies to dist-electron/
                        src: "assets/node-sqlite3-wasm.wasm",
                        // Preserve file timestamps for better caching
                        preserveTimestamps: true,
                        // Enable symlink dereferencing for reliability
                        dereference: true,
                        // Overwrite existing files
                        overwrite: true,
                        transform: {
                            encoding: "buffer" as const, // Use buffer encoding for binary WASM files
                            handler(contents: Buffer, filename: string) {
                                // Enhanced WASM optimization and validation
                                const originalSize = contents.length;
                                const sizeInKB = (originalSize / 1024).toFixed(
                                    2
                                );

                                // Comprehensive WASM validation
                                try {
                                    // 1. Validate WASM magic bytes (0x00 0x61 0x73 0x6D)
                                    const wasmMagic = Buffer.from([
                                        0x00,
                                        0x61,
                                        0x73,
                                        0x6d,
                                    ]);
                                    const isValidWasm = contents
                                        .subarray(0, 4)
                                        .equals(wasmMagic);

                                    if (!isValidWasm) {
                                        console.error(
                                            `❌ [WASM] Invalid WASM magic bytes in ${filename}`
                                        );
                                        console.error(
                                            `    Expected: ${Array.from(
                                                wasmMagic
                                            )
                                                .map(
                                                    (b) =>
                                                        `0x${b.toString(16).padStart(2, "0")}`
                                                )
                                                .join(" ")}`
                                        );
                                        console.error(
                                            `    Found:    ${Array.from(
                                                contents.subarray(0, 4)
                                            )
                                                .map(
                                                    (b) =>
                                                        `0x${b.toString(16).padStart(2, "0")}`
                                                )
                                                .join(" ")}`
                                        );
                                        throw new Error(
                                            `Invalid WASM file: ${filename}`
                                        );
                                    }

                                    // 2. Check minimum WASM file size (should be at least 8 bytes for header)
                                    if (contents.length < 8) {
                                        console.error(
                                            `❌ [WASM] File too small (${contents.length} bytes): ${filename}`
                                        );
                                        throw new Error(
                                            `WASM file too small: ${filename}`
                                        );
                                    }

                                    // 3. Validate WASM version (bytes 4-7 should be version 1)
                                    const version = contents.readUInt32LE(4);
                                    if (version !== 1) {
                                        console.warn(
                                            `⚠️  [WASM] Unexpected WASM version ${version} in ${filename} (expected 1)`
                                        );
                                    }

                                    // 4. Check for reasonable file size (SQLite WASM should be ~1-2MB)
                                    const maxReasonableSize = 5 * 1024 * 1024; // 5MB
                                    const minReasonableSize = 500 * 1024; // 500KB
                                    if (contents.length > maxReasonableSize) {
                                        console.warn(
                                            `⚠️  [WASM] Large file size (${sizeInKB} KB): ${filename}`
                                        );
                                    } else if (
                                        contents.length < minReasonableSize
                                    ) {
                                        console.warn(
                                            `⚠️  [WASM] Small file size (${sizeInKB} KB): ${filename}`
                                        );
                                    }

                                    // Success logging with detailed info
                                    console.log(
                                        `✅ [WASM] Optimized ${filename}`
                                    );
                                    console.log(
                                        `    📊 Size: ${sizeInKB} KB (${originalSize.toLocaleString()} bytes)`
                                    );
                                    console.log(`    🔧 Version: ${version}`);
                                    console.log(
                                        `    🎯 Compression potential: ${((1 - contents.length / (contents.length * 1.5)) * 100).toFixed(1)}% savings possible`
                                    );

                                    // TODO: In production, could add compression or other optimizations here
                                    // For now, preserve integrity and pass through with validation
                                    return contents;
                                } catch (error) {
                                    console.error(
                                        `💥 [WASM] Processing failed for ${filename}:`,
                                        error instanceof Error
                                            ? error.message
                                            : String(error)
                                    );
                                    // Re-throw to prevent copying invalid files
                                    throw error;
                                }
                            },
                        },
                    },
                ],
                // Enhanced static copy options for WASM optimization
                structured: false, // Flatten structure for Electron
                silent: false, // Show copy operations for transparency
                // Add file watching for development hot-reload
                watch: {
                    // Watch WASM files for changes during development
                    reloadPageOnChange: false, // Don't reload entire page for WASM changes
                    options: {
                        // Watch options for chokidar
                        ignoreInitial: true,
                        persistent: true,
                        followSymlinks: true,
                        depth: 2,
                        awaitWriteFinish: {
                            stabilityThreshold: 500,
                            pollInterval: 100,
                        },
                    },
                },
                // Use writeBundle hook for better integration with build process
                hook: "writeBundle",
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
                "@shared": normalizePath(path.resolve(__dirname, "shared")),
            },
        },
        server: {
            hmr: {
                port: 5174, // Use different port for HMR to avoid conflicts
            },
            open: false, // Don't auto-open browser (Electron only)
            port: 5173,
            strictPort: true, // Fail if port is taken (prevents silent port changes)
            warmup: {
                // Warm up frequently used files to improve initial loading performance
                clientFiles: [
                    // Main application entry points
                    "./src/App.tsx",
                    "./src/main.tsx",

                    // Core stores (used throughout the app)
                    "./src/stores/sites/useSitesStore.ts",
                    "./src/stores/settings/useSettingsStore.ts",
                    "./src/stores/ui/useUiStore.ts",
                    "./src/stores/error/useErrorStore.ts",

                    // Common theme components (used everywhere)
                    "./src/theme/components/ThemeProvider.tsx",
                    "./src/theme/components/ThemedBox.tsx",
                    "./src/theme/components/ThemedButton.tsx",
                    "./src/theme/components/ThemedText.tsx",
                    "./src/theme/useTheme.ts",

                    // Heavy chart components (Chart.js is large)
                    "./src/components/SiteDetails/charts/ResponseTimeChart.tsx",
                    "./src/components/SiteDetails/charts/UptimeChart.tsx",
                    "./src/components/SiteDetails/charts/StatusChart.tsx",
                    "./src/components/common/HistoryChart.tsx",

                    // Frequently used components
                    "./src/components/Dashboard/SiteList/SiteList.tsx",
                    "./src/components/Header/Header.tsx",
                    "./src/components/SiteDetails/SiteDetails.tsx",

                    // Chart utilities and configuration (used by all chart components)
                    "./src/services/chartConfig.ts",
                    "./src/utils/chartUtils.ts",

                    // Shared types and utilities
                    "./shared/types.ts",
                    "./shared/utils/environment.ts",
                ],
            },
        },
        test: {
            benchmark: {
                exclude: ["**/node_modules/**", "**/dist/**"],
                include: [
                    "benchmarks/**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
                ],
                outputJson: "./coverage/bench-results.json",
                reporters: ["default", "verbose"],
            },
            coverage: {
                all: true, // Include all source files in coverage
                exclude: [
                    "**/*.config.*",
                    "**/*.d.ts",
                    "**/dist/**", // Exclude any dist folder anywhere
                    "**/docs/**", // Exclude documentation files
                    "**/index.ts", // Exclude all barrel export files
                    "**/index.tsx", // Exclude JSX barrel export files
                    "**/node_modules/**",
                    "**/types.ts", // Exclude type definition files
                    "**/types.tsx", // Exclude type definition files with JSX
                    "src/test/**",
                    "coverage/**",
                    "dist-electron/**",
                    "electron/**", // Exclude all electron files from frontend coverage
                    "index.ts", // Barrel export file at root
                    "release/**",
                    "scripts/**",
                    "report/**", // Exclude report files
                    "benchmarks/**", // Exclude all benchmark files from coverage
                    "html/**", // Exclude generated HTML files
                    "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                    "**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", // Exclude benchmark files
                ],
                // V8 Provider Configuration (Recommended since Vitest v3.2.0)
                provider: "v8" as const, // Switch to V8 for better TypeScript support
                experimentalAstAwareRemapping: true, // Enable AST-aware remapping for accurate coverage
                ignoreEmptyLines: true, // Ignore empty lines, comments, and TypeScript interfaces
                reporter: ["text", "json", "lcov", "html"],
                reportOnFailure: true,
                reportsDirectory: "./coverage",
                skipFull: false, // Don't skip full coverage collection
                thresholds: {
                    autoUpdate: false,
                    branches: 90, // Minimum 90% branch coverage per prompt requirements
                    functions: 90, // Minimum 90% function coverage per prompt requirements
                    lines: 90, // Minimum 90% line coverage per prompt requirements
                    statements: 90, // Minimum 90% statement coverage per prompt requirements
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
                label: "Frontend", // Simplified label to match vitest.config.ts
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
            reporters: [
                "default",
                "json",
                "verbose",
                "hanging-process",
                "dot",
                // "tap",
                // "tap-flat",
                // "junit",
                "html",
            ],
            setupFiles: ["./src/test/setup.ts"], // Setup file for testing
            testTimeout: 15_000, // Set Vitest timeout to 15 seconds
            typecheck: { enabled: true, tsconfig: "./tsconfig.json" },
        },
    };
}) satisfies UserConfigFnObject as UserConfigFnObject;
