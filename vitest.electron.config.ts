/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- needed for standalone config*/
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */

/**
 * Vitest configuration for Electron backend tests. Standalone config file that
 * doesn't inherit from main vite config to avoid conflicts. Specifically
 * targets electron and shared files for backend testing.
 */

import * as path from "node:path";
import pc from "picocolors";
import { normalizePath, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {
    coverageConfigDefaults,
    defaultExclude,
    defineConfig,
} from "vitest/config";

const dirname = import.meta.dirname;

/**
 * Vitest configuration for Electron backend test suites.
 */
const vitestConfig = defineConfig({
    cacheDir: "./.cache/vitest/.vitest-backend",
    esbuild: {
        include: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx}"],
        keepNames: true,
        target: "esnext",
    },
    // Parity: json handling consistent (important if backend loads JSON fixtures)
    json: {
        namedExports: true,
        stringify: true,
    },
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            "@app": normalizePath(path.resolve(dirname, "src")),
            "@electron": normalizePath(path.resolve(dirname, "electron")),
            "@shared": normalizePath(path.resolve(dirname, "shared")),
        },
    },
    // Cast: Vitest inline config typing currently lags behind several runtime-supported options.
    test: {
        attachmentsDir: "./.cache/vitest/.vitest-attachments-electron",
        bail: 100,
        benchmark: {
            exclude: [
                "**/dist*/**",
                "**/html/**",
                ...defaultExclude,
            ],
            include: ["electron/benchmarks/**/*.bench.{js,mjs,cjs,ts,mts,cts}"],
            outputJson: "./coverage/electron/bench-results.json",
            reporters: ["default", "verbose"],
        },
        chaiConfig: {
            includeStack: false,
            showDiff: true,
            truncateThreshold: 40,
        },
        clearMocks: true,
        coverage: {
            all: true, // Include all source files in coverage
            allowExternal: false,
            clean: true, // Clean coverage directory before each run
            cleanOnRerun: true, // Clean on rerun in watch mode
            exclude: [
                "**/*.config.*",
                "**/*.d.ts",
                "**/*.types.ts",
                "**/dist*/**", // Covers dist/ plus any dist-* cache directories
                "**/node_modules/**",
                "**/docs/**",
                "**/coverage/**",
                "**/index.{ts,tsx}", // Root + nested index.ts / index.tsx
                "**/types.{ts,tsx}", // Single-file types
                "**/types/**", // Types directories
                // Electron tests are not production code and should not affect coverage.
                "electron/test/**",
                "electron/**/test/**",
                "shared/test/**", // Covers file + dir form
                "src/**",
                "release/**",
                "scripts/**",
                "report/**",
                "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                "**/html/**",
                "**/enhanced-testUtilities.ts/**",
                "electron/test/utils/enhanced-testUtilities.ts", // Specific file exclude due to usage in tests
                ...coverageConfigDefaults.exclude,
            ],
            excludeAfterRemap: true, // Exclude files after remapping for accuracy
            experimentalAstAwareRemapping: true,
            ignoreEmptyLines: true,
            include: ["electron/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}"],
            provider: "v8" as const,
            reporter: [
                "text",
                "json",
                "lcov",
                "html",
            ],
            reportOnFailure: true,
            reportsDirectory: "./coverage/electron",
            skipFull: false,
            thresholds: {
                autoUpdate: false,
                // Parity: elevate branches to 90 to match frontend thresholds
                branches: 90,
                functions: 90, // Minimum 90% function coverage for backend
                lines: 90, // Minimum 90% line coverage for backend
                statements: 90, // Minimum 90% statement coverage for backend
            },
        } as any, // Cast: @vitest/coverage-v8 types currently omit older options we rely on.
        dangerouslyIgnoreUnhandledErrors: false,
        deps: {
            optimizer: {
                ssr: { enabled: true },
            },
        },
        diff: {
            aIndicator: pc.red(pc.bold("--")),
            bIndicator: pc.green(pc.bold("++")),
            expand: true,
            maxDepth: 20,
            omitAnnotationLines: true,
            printBasicPrototype: false,
            truncateAnnotation: pc.cyan(
                pc.bold("... Diff result is truncated")
            ),
            truncateThreshold: 250,
        },
        env: {
            NODE_ENV: "test",
            PACKAGE_VERSION: process.env["PACKAGE_VERSION"] ?? "unknown",
        },
        environment: "node",
        exclude: [
            "**/dist*/**",
            "**/html/**",
            "**/src/**",
            "**/coverage/**",
            "**/docs/**",
            ...defaultExclude,
        ],
        expect: {
            poll: { interval: 50, timeout: 1000 },
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
            "electron/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
            "tests/strictTests/electron/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
        ],
        includeTaskLocation: true,
        isolate: true,
        logHeapUsage: true,
        // NOTE: Vitest v4 removed `test.poolOptions`. Use `maxWorkers` instead.
        maxWorkers: Math.max(
            1,
            Number(
                // eslint-disable-next-line n/no-process-env -- safe for test time use
                process.env["MAX_THREADS"] ?? (process.env["CI"] ? "1" : "8")
            )
        ),
        name: {
            color: "magenta",
            label: "Backend",
        }, // Custom project name and color for Vitest
        outputFile: {
            json: "./coverage/electron/test-results.json",
        },
        pool: "threads", // Use worker threads for better performance
        printConsoleTrace: false,
        reporters: [
            "default",
            // "json",
            // "verbose",
            "hanging-process",
            // "dot",
            // "tap",
            // "tap-flat",
            // "junit",
            // "html",
        ],
        restoreMocks: true,
        retry: 0,
        sequence: {
            groupOrder: 0,
            setupFiles: "parallel",
        },
        setupFiles: ["electron/test/setup.ts"],
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
            tsconfig: "./config/testing/tsconfig.electron.test.json",
        },
    } as any,
}) satisfies UserConfig as UserConfig;

export default vitestConfig as UserConfig;
