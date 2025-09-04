/* eslint-disable eslint-comments/disable-enable-pair -- needed for standalone config*/

/**
 * Vitest configuration for Electron backend tests. Standalone config file that
 * doesn't inherit from main vite config to avoid conflicts. Specifically
 * targets electron and shared files for backend testing.
 */

import path from "node:path";
import pc from "picocolors";
import { normalizePath } from "vite";
import { type UserConfig } from "vite";
import { defineConfig } from "vitest/config";

const dirname = import.meta.dirname;

const vitestConfig = defineConfig({
    cacheDir: "./.cache/.vitest-backend",
    esbuild: {
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
        keepNames: true,
        target: "esnext",
    },
    // Parity: json handling consistent (important if backend loads JSON fixtures)
    json: {
        namedExports: true,
        stringify: true,
    },
    resolve: {
        alias: {
            "@app": normalizePath(path.resolve(dirname, "../../src")),
            "@electron": normalizePath(path.resolve(dirname, "../../electron")),
            "@shared": normalizePath(path.resolve(dirname, "../../shared")),
        },
    },
    test: {
        attachmentsDir: "./.cache/.vitest-attachments-electron",
        bail: 100,
        benchmark: {
            exclude: ["**/node_modules/**", "**/dist/**"],
            include: [
                "../../electron/benchmarks/**/*.bench.{js,mjs,cjs,ts,mts,cts}",
            ],
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
            all: false, // Disable all file coverage, only test loaded files
            exclude: [
                "../../**/*.config.*",
                "../../**/*.d.ts",
                "../../**/dist/**", // Exclude any dist folder anywhere
                "../../**/docs/**",
                "../../**/index.ts", // Exclude all barrel export files
                "../../**/index.tsx", // Exclude JSX barrel export files
                "../../**/node_modules/**",
                "../../**/types.ts", // Exclude type definition files
                "../../**/types.tsx", // Exclude type definition files with JSX
                "../../coverage/**",
                "../../dist-electron/**",
                "../../shared/test",
                "../../dist-shared/**",
                "../../dist/**",
                "../../src/**", // Exclude all src files from electron coverage
                "../../index.ts", // Barrel export file at root
                "../../release/**",
                "../../scripts/**",
                "../../report/**", // Exclude report files
                "../../**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                "../../shared/test/**", // Exclude test directory,
                "../../**/types/**",
                "../../**/html/**",
            ],
            experimentalAstAwareRemapping: true,
            ignoreEmptyLines: true,
            include: [
                "../../electron/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
            ],
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
        },
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
            "**/node_modules/**",
            "**/dist/**",
            "**/dist-electron/**",
            "**/src/**",
            "**/coverage/**",
            "**/docs/**",
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
            "../../electron/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
        ],
        includeTaskLocation: true,
        isolate: true,
        logHeapUsage: true,
        name: {
            color: "magenta",
            label: "Backend",
        }, // Custom project name and color for Vitest
        outputFile: {
            json: "./coverage/electron/test-results.json",
        },
        pool: "threads", // Use worker threads for better performance
        poolOptions: {
            threads: {
                isolate: true, // Isolate tests for better reliability
                maxThreads: 24, // Limit concurrent threads for electron tests
                minThreads: 1, // Ensure at least one thread
                singleThread: false, // Enable multi-threading
                useAtomics: true,
            },
        },
        printConsoleTrace: false,
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
        restoreMocks: true,
        retry: 0,
        sequence: {
            groupOrder: 0,
            setupFiles: "parallel",
        },
        setupFiles: ["../../electron/test/setup.ts"],
        slowTestThreshold: 300,
        testTimeout: 15_000, // Set Vitest timeout to 15 seconds
        typecheck: {
            allowJs: false,
            checker: "tsc",
            enabled: true,
            exclude: [
                "**/node_modules/**",
                "**/dist/**",
                "**/cypress/**",
                "**/.{idea,git,cache,output,temp}/**",
            ],
            ignoreSourceErrors: false,
            include: ["**/*.{test,spec}-d.?(c|m)[jt]s?(x)"],
            only: false,
            spawnTimeout: 10_000,
            tsconfig: "./config/testing/tsconfig.electron.test.json",
        },
    },
}) satisfies UserConfig as UserConfig;

export default vitestConfig as UserConfig;
