// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- project-wide disable pattern for build configs
/* eslint-disable regexp/require-unicode-sets-regexp, array-func/from-map  */
/**
 * Vite configuration for the Uptime Watcher Electron application. Configures
 * React frontend build and Electron main/preload process compilation.
 */

import { codecovVitePlugin } from "@codecov/vite-plugin";
import reactScan from "@react-scan/vite-plugin-react-scan";
import react from "@vitejs/plugin-react";
import path from "node:path";
import pc from "picocolors";
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
import { coverageConfigDefaults, defaultExclude } from "vitest/config";

import { getEnvVar as getEnvironmentVariable } from "./shared/utils/environment";

const dirname = import.meta.dirname;
const VITE_BUILD_TARGET = "esnext";

/**
 * @remarks
 * This configuration sets up build and development settings for both the React
 * renderer process and Electron main/preload scripts. It includes plugin
 * integration, code splitting, coverage, static asset handling, and
 * architectural optimizations for a robust Electron + React workflow.
 *
 * - Renderer (SPA): React frontend with advanced chunking, CSS Modules, and HMR.
 * - Electron Main/Preload: Separate build targets, sourcemaps, and hot
 *   reload/restart.
 * - Plugins: Coverage, bundle analysis, static copy, CSP dev fix, and more.
 * - Testing: Vitest configuration for frontend, with coverage and performance
 *   optimizations.
 *
 * Vite configuration for Uptime Watcher Electron app.
 */

export default defineConfig(({ mode }) => {
    // Prefer Vite's provided mode over raw NODE_ENV for consistency.
    const codecovToken = getEnvironmentVariable("CODECOV_TOKEN");
    const isTestMode = mode === "test";
    const isDev = mode === "development";
    return {
        appType: "spa", // Required for Electron renderer process (SPA mode ensures correct routing and asset loading)
        base: "./", // Ensures relative asset paths for Electron
        build: {
            assetsDir: "assets",
            // Increase chunk size warning limit to account for intentional larger vendor chunks
            chunkSizeWarningLimit: 1000, // Increase from default 500KB to 1MB for vendor chunks
            copyPublicDir: true, // Copy public assets to dist
            cssCodeSplit: true, // Enable CSS code splitting
            emptyOutDir: true, // Clean output before build
            modulePreload: {
                polyfill: false, // Modern browsers don't need polyfill
            },
            outDir: "dist",
            reportCompressedSize: true, // Report gzip/brotli sizes
            rollupOptions: {
                output: {
                    // Manual chunk splitting to optimize bundle sizes and improve caching
                    manualChunks: {
                        // React core ecosystem kept together to avoid empty single-module chunks
                        "react-vendor": ["react", "react-dom"],
                        // UI and icon libraries - separate chunk for visual components
                        "ui-vendor": ["react-icons"],
                        // Utility libraries - separate chunk for utilities and validation
                        "utils-vendor": [
                            "axios",
                            "validator",
                            "zod",
                            "zustand",
                        ],
                    },
                },
            },
            sourcemap: true, // Recommended for Electron debugging
            target: VITE_BUILD_TARGET, // Updated to esnext for CSS Modules compatibility
        },
        cacheDir: "./.cache/.vite", // Separate cache to avoid conflicts
        css: {
            devSourcemap: true, // Enable source maps for CSS in development
            modules: {
                // Custom scoped name pattern: [name]__[local]___[hash:base64:5]
                // This pattern ensures class names are unique per file and component, improves readability in debugging,
                // and avoids collisions in production by including a short hash. It balances clarity and uniqueness.
                generateScopedName: "[name]__[local]___[hash:base64:5]",
                // CSS Modules configuration
                localsConvention: "camelCase" as const, // Convert kebab-case to camelCase for named exports
            },
            transformer: "postcss", // Use PostCSS for transformations
        },
        esbuild: {
            // Transpile all files with ESBuild to remove comments from code coverage.
            // Required for `test.coverage.ignoreEmptyLines` to work:
            include: [
                "**/*.cjs",
                "**/*.cts",
                "**/*.js",
                "**/*.jsx",
                "**/*.mjs",
                "**/*.mts",
                "**/*.ts",
                "**/*.tsx",
            ],

            // More aggressive transformation to help coverage parsing
            keepNames: true, // Preserve function names for better coverage reports
            target: "esnext", // Updated to match build target for CSS Modules compatibility
        },
        json: {
            namedExports: true,
            stringify: true,
        },
        optimizeDeps: {
            // Force dependency optimization to handle large chunks better
            esbuildOptions: {
                target: VITE_BUILD_TARGET, // Use latest JS features for smaller output
                // Note: splitting, format, and treeShaking are handled by Vite itself
                // and should not be configured here to avoid conflicts
            },
            holdUntilCrawlEnd: true, // Wait for full dependency crawl to avoid partial optimizations
            // Explicitly include large dependencies for better chunking
            include: isTestMode
                ? [
                      // Exclude react-dom/client in test mode to avoid mocking issues
                      "react-dom",
                      "react",
                      "chart.js",
                      "react-chartjs-2",
                  ]
                : [
                      "react-dom/client",
                      "react-dom",
                      "react",
                      "chart.js",
                      "react-chartjs-2",
                  ],
        },
        plugins: [
            // CSS Modules patch to fix Vite's CSS Modules handling
            patchCssModules({
                generateSourceTypes: true, // Generate .d.ts files for TypeScript support
            }),
            // Inject package version into import.meta.env.PACKAGE_VERSION
            packageVersion(),
            /**
             * @remarks
             * Csp-dev-fix
             *
             * Temporarily adds 'unsafe-eval' to the Content Security Policy
             * (CSP) in development mode to allow libraries (like zod) that use
             * eval or new Function for code generation.
             *
             * Security Implications:
             *
             * - 'unsafe-eval' is a known CSP relaxation that allows dynamic code
             *   execution, which can be exploited in production.
             * - This plugin only enables 'unsafe-eval' when running the Vite dev
             *   server (context.server is truthy).
             * - In production builds, the CSP remains strict and does NOT include
             *   'unsafe-eval'.
             *
             * Why it's safe in development:
             *
             * - The development server is only accessible locally and is not
             *   exposed to the public internet.
             * - This change is necessary for developer experience and debugging,
             *   but is never present in production output.
             */
            {
                name: "csp-dev-fix",
                transformIndexHtml(html, context) {
                    if (context.server) {
                        // Development mode: Add 'unsafe-eval' for zod compatibility
                        return html.replace(
                            /script-src 'self' blob:/,
                            "script-src 'self' blob: 'unsafe-eval'"
                        );
                    }
                    // Production mode: Keep strict CSP
                    return html;
                },
            },
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
                            target: VITE_BUILD_TARGET, // Ensure CSS Modules compatibility
                        },
                        resolve: {
                            alias: {
                                "@app": normalizePath(
                                    path.resolve(dirname, "src")
                                ),
                                "@electron": normalizePath(
                                    path.resolve(dirname, "electron")
                                ),
                                "@shared": normalizePath(
                                    path.resolve(dirname, "shared")
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
                            target: "esnext", // Ensure CSS Modules compatibility
                        },
                        resolve: {
                            alias: {
                                "@shared": normalizePath(
                                    path.resolve(dirname, "shared")
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
            /**
             * @remarks
             * ViteMcp Integrates the vite-plugin-mcp for enhanced module cache
             * performance and improved build speed. This plugin optimizes
             * caching and module resolution, reducing rebuild times during
             * development. It is included to accelerate the Vite build process
             * and improve developer experience.
             */
            ViteMcp(),
            // Only include react-scan in development mode to avoid sourcemap warnings in production
            ...(isDev
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
                    { file: "**/*.mjs" },
                    { file: "**/*.cjs" },
                ],
                open: false,
                projectRoot: normalizePath(path.resolve(dirname)),
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
                // Use writeBundle hook for better integration with build process
                hook: "writeBundle",
                silent: false, // Show copy operations for transparency
                // Enhanced static copy options for WASM optimization
                structured: false, // Flatten structure for Electron
                targets: [
                    {
                        // Enable symlink dereferencing for reliability
                        dereference: true,
                        dest: "../dist-electron", // Copies to dist-electron/
                        // Overwrite existing files
                        overwrite: true,
                        // Preserve file timestamps for better caching
                        preserveTimestamps: true,
                        src: "assets/node-sqlite3-wasm.wasm",
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
                                    // Estimate compression potential (assume typical WASM compression ratio ~65%)
                                    const estimatedCompressedSize =
                                        contents.length * 0.35;
                                    const compressionPotential = (
                                        (1 -
                                            estimatedCompressedSize /
                                                contents.length) *
                                        100
                                    ).toFixed(1);
                                    console.log(
                                        `    🎯 Compression potential: ${compressionPotential}% savings possible (estimated)`
                                    );

                                    // Production approach: Preserve SQLite WASM integrity
                                    // Any modification could break database functionality - validation only
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
                // Add file watching for development hot-reload
                watch: {
                    options: {
                        awaitWriteFinish: {
                            pollInterval: 100,
                            stabilityThreshold: 500,
                        },
                        depth: 2,
                        followSymlinks: true,
                        // Watch options for chokidar
                        ignoreInitial: true,
                        persistent: true,
                    },
                    // Watch WASM files for changes during development
                    reloadPageOnChange: false, // Don't reload entire page for WASM changes
                },
            }),
            // Put the Codecov vite plugin after all other plugins
            codecovVitePlugin({
                bundleName: "uptime-watcher",
                enableBundleAnalysis: Boolean(codecovToken),
                ...(codecovToken ? { uploadToken: codecovToken } : {}),
                telemetry: false, // Disable telemetry for faster builds
            }),
        ],
        preview: {
            open: false, // Don't auto-open browser (Electron only)
            port: 6174, // Preview server uses port 6174 to avoid conflicts with dev server (5173).
            // Rationale: Keeping preview and dev server ports different ensures that running both simultaneously does not cause port binding issues.
            strictPort: true, // Fail if port is taken (prevents silent port changes)
        },
        publicDir: "public",
        resolve: {
            alias: {
                "@app": normalizePath(path.resolve(dirname, "src")),
                "@electron": normalizePath(path.resolve(dirname, "electron")),
                "@shared": normalizePath(path.resolve(dirname, "shared")),
            },
            extensions: [
                ".mjs",
                ".js",
                ".mts",
                ".ts",
                ".jsx",
                ".tsx",
                ".json",
                ".cjs",
                ".cts",
            ],
        },
        server: {
            hmr: {
                overlay: true, // Show full-screen overlay on errors
                port: 5174, // Use different port for HMR to avoid conflicts
                protocol: "ws", // Use WebSocket for HMR
            },
            open: false, // Don't auto-open browser (Electron only)
            port: 5173, // Dev server uses port 5173. This is intentionally different from preview port (6174) to prevent accidental overlap.
            // Rationale: Separating dev and preview ports allows both environments to run concurrently without port conflicts, aiding development and testing.
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
            watch: {
                awaitWriteFinish: {
                    pollInterval: 100,
                    stabilityThreshold: 500,
                },
                followSymlinks: true,
                // Watch options for chokidar
                ignoreInitial: true,
                persistent: true,
                // Watch WASM files for changes during development
                useFsEvents: true, // Use native file system events for better performance
            },
        },
        test: {
            // Directory for storing Vitest test attachments (screenshots, logs, etc.) in a hidden cache folder.
            // This helps keep test artifacts organized and out of the main source tree.
            attachmentsDir: "./.cache/.vitest-attachments",
            bail: 200, // Stop after 200 failures to avoid excessive output
            benchmark: {
                exclude: [
                    "**/dist*/**",
                    "**/html/**",
                    ...defaultExclude,
                ],
                include: [
                    "benchmarks/**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
                ],
                includeSamples: true,
                outputJson: "./coverage/bench-results.json",
                reporters: ["default", "verbose"],
            },
            chaiConfig: {
                includeStack: false,
                showDiff: true,
                truncateThreshold: 40,
            },
            // Enable detailed code coverage analysis
            coverage: {
                all: true, // Include all source files in coverage
                allowExternal: false,
                clean: true, // Clean coverage directory before each run
                cleanOnRerun: true, // Clean on rerun in watch mode
                exclude: [
                    "**/*.config.*",
                    "**/*.d.ts",
                    "**/dist/**", // Exclude any dist folder anywhere
                    "**/docs/**", // Exclude documentation files
                    "**/index.ts", // Exclude all barrel export files
                    "**/index.tsx", // Exclude JSX barrel export files
                    "**/node_modules/**",
                    "src/**/types.ts", // Exclude type definition files only in src directory
                    "**/types.tsx", // Exclude type definition files with JSX
                    "src/**/baseTypes.ts", // Exclude interface-only files that contain only TypeScript interfaces
                    "src/test/**",
                    "shared/test",
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
                    "**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}", // Exclude benchmark files,
                    ".stryker-tmp/**", // Exclude Stryker mutation testing temp files
                    "reports/**", // Exclude test report files
                    "stryker_prompts_by_mutator/**",
                    "**/types/**",
                    "**/html/**",
                    "**/config/**",
                    ...coverageConfigDefaults.exclude,
                ],
                excludeAfterRemap: true, // Exclude files after remapping for accuracy
                experimentalAstAwareRemapping: false, // Temporarily disabled due to ast-v8-to-istanbul column parsing error
                ignoreEmptyLines: true, // Ignore empty lines, comments, and TypeScript interfaces
                // V8 Provider Configuration (Recommended since Vitest v3.2.0)
                provider: "v8" as const, // Switch to V8 for better TypeScript support
                reporter: [
                    "text",
                    "json",
                    "lcov",
                    "html",
                ],
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
            css: {
                exclude: [],
                include: [/.+/],
                modules: {
                    classNameStrategy: "stable",
                },
            },
            dangerouslyIgnoreUnhandledErrors: false,
            deps: {
                optimizer: {
                    web: { enabled: true },
                },
            },
            diff: {
                aIndicator: pc.magenta(pc.bold("--")), // Magenta is much more readable than red
                bIndicator: pc.green(pc.bold("++")), // Clean single-character indicators
                expand: true,
                // The value 20 for maxDepth was chosen to provide sufficient context for deeply nested object diffs.
                // This helps debugging complex test failures, but may impact performance for very large or deeply nested objects.
                // Monitor test performance and adjust this value if you encounter slowdowns with large diffs.
                maxDepth: 20,
                omitAnnotationLines: true,
                printBasicPrototype: false,
                truncateAnnotation: pc.yellow(
                    pc.bold("... Diff output truncated for readability")
                ), // Yellow is more eye-catching than cyan
                // The value 250 for truncateThreshold was selected to balance readability and performance.
                // It limits the maximum number of diff lines shown, preventing excessively long outputs
                // while still providing enough context for most test failures. Increasing this value may
                // slow down output and clutter logs; decreasing it could hide important diff details.
                truncateThreshold: 250,
            },
            env: {
                NODE_ENV: "test",
                PACKAGE_VERSION: process.env["PACKAGE_VERSION"] ?? "unknown",
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
                ...defaultExclude,
            ],
            expect: {
                poll: { interval: 50, timeout: 15_000 },
                requireAssertions: true,
            },
            fakeTimers: {
                advanceTimeDelta: 20,
                loopLimit: 10_000,
                now: Date.now(),
                shouldAdvanceTime: false,
                shouldClearNativeTimers: true,
            },
            fileParallelism: true,
            globals: true, // Enable global test functions (describe, it, expect)
            include: [
                "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
            ],
            includeTaskLocations: true,
            isolate: true,
            logHeapUsage: true,
            name: {
                color: "cyan",
                label: "Frontend", // Simplified label to match vitest.config.ts
            }, // Custom project name and color for Vitest
            outputFile: {
                json: "./coverage/test-results.json",
            },
            // Modern performance optimizations - optimized for multi-project stability
            pool: "threads", // Use worker threads for better performance
            poolOptions: {
                threads: {
                    isolate: true, // Isolate tests for better reliability
                    maxThreads: 24, // Reduced from 24 to prevent resource contention in multi-project setup
                    minThreads: 1, // Ensure at least one thread
                    singleThread: false, // Enable multi-threading
                    useAtomics: true,
                },
            },
            printConsoleTrace: false, // Disable stack trace printing for cleaner output
            projects: [
                "vitest.config.ts",
                "vitest.electron.config.ts",
                "vitest.shared.config.ts",
            ],
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
            retry: 0, // No retries to surface issues immediately
            sequence: {
                // Run projects sequentially to avoid resource contention
                concurrent: false,
                groupOrder: 0,
                setupFiles: "parallel",
            },
            setupFiles: ["./src/test/setup.ts"], // Setup file for testing
            slowTestThreshold: 300,
            testTimeout: 15_000, // Set Vitest timeout to 15 seconds
            typecheck: {
                allowJs: false,
                checker: "tsc",
                enabled: true,
                exclude: [
                    "**/dist*/**",
                    "**/html/**",
                    "**/.{idea,git,cache,output,temp}/**",
                    ...defaultExclude,
                ],
                ignoreSourceErrors: false,
                include: ["**/*.{test,spec}-d.?(c|m)[jt]s?(x)"],
                only: false,
                spawnTimeout: 10_000,
                tsconfig: "./tsconfig.json",
            },
        },
    };
}) satisfies UserConfigFnObject as UserConfigFnObject;
