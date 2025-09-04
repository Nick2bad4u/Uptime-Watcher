/* eslint-disable eslint-comments/disable-enable-pair -- needed for standalone config*/

/**
 * Vitest configuration for shared utility tests. Standalone config file that
 * specifically targets shared utilities used by both frontend and backend.
 * Parity adjustments added to align with backend/electron vitest config where
 * appropriate.
 */

import path from "node:path";
import pc from "picocolors";
import { normalizePath } from "vite";
import { type UserConfig } from "vite";
import {
    coverageConfigDefaults,
    defaultExclude,
    defineConfig,
} from "vitest/config";

const dirname = import.meta.dirname;

const vitestConfig = defineConfig({
    cacheDir: "./.cache/.vitest-shared",
    esbuild: {
        include: [
            "**/*.js",
            "**/*.mjs",
            "**/*.cjs",
            "**/*.ts",
            "**/*.mts",
            "**/*.cts",
            "**/*.tsx",
        ],
        keepNames: true,
        target: "esnext",
    },
    // Parity: json handling
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
        attachmentsDir: "./.cache/.vitest-attachments-shared",
        bail: 100,
        benchmark: {
            exclude: ["**/node_modules/**", "**/dist/**"],
            include: ["shared/benchmarks/**/*.bench.{js,mjs,cjs,ts,mts,cts}"],
            outputJson: "./coverage/shared/bench-results.json",
            reporters: ["default", "verbose"],
        },
        chaiConfig: {
            includeStack: false,
            showDiff: true,
            truncateThreshold: 40,
        },
        clearMocks: true,
        coverage: {
            all: false, // Include all source files in coverage
            allowExternal: false,
            clean: true, // Clean coverage directory before each run
            cleanOnRerun: true, // Clean on rerun in watch mode
            exclude: [
                "**/*.config.*",
                "**/*.d.ts",
                "**/dist/**",
                "**/dist-shared/**",
                "**/docs/**",
                "**/index.ts", // Exclude barrel export files
                "**/index.tsx",
                "**/node_modules/**",
                // Intentional selective exclusion vs backend parity:
                "src/**/types.ts",
                "electron/**/types.ts",
                "**/types.tsx",
                "coverage/**",
                "dist-electron/**",
                "dist/**",
                "src/**", // Exclude frontend files
                "electron/**", // Exclude electron files
                "release/**",
                "scripts/**",
                "shared/test",
                "report/**",
                "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                "shared/**/*.test.ts", // Exclude test files from coverage
                "shared/**/*.test.mts", // Exclude MTS test files from coverage
                "shared/**/*.test.cts", // Exclude CTS test files from coverage
                "shared/**/*.spec.ts", // Exclude spec files from coverage
                "shared/**/*.spec.mts", // Exclude MTS spec files from coverage
                "shared/**/*.spec.cts", // Exclude CTS spec files from coverage
                "shared/test/**", // Exclude test directory,
                ".stryker-tmp/**", // Exclude Stryker mutation testing temp files
                "reports/**", // Exclude test report files
                "stryker_prompts_by_mutator/**",
                "shared/types/**", // Exclude test directory,
                "**/types/**",
                "**/html/**",
                ...coverageConfigDefaults.exclude,
            ],
            experimentalAstAwareRemapping: true,
            ignoreEmptyLines: true,
            include: ["shared/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}"],
            provider: "v8" as const, // Use V8 provider for consistency
            reporter: [
                "text",
                "json",
                "lcov",
                "html",
            ],
            reportOnFailure: true,
            reportsDirectory: "./coverage/shared",
            skipFull: false,
            thresholds: {
                autoUpdate: false,
                branches: 90, // High coverage target for shared utilities
                functions: 95, // Very high function coverage for shared code
                lines: 95, // Very high line coverage for shared code
                statements: 95, // Very high statement coverage for shared code
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
            "**/dist*/**",
            "**/dist-electron/**",
            "**/src/**",
            "**/electron/**",
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
        globals: true, // Enable global test functions
        include: [
            "shared/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
        ],
        includeTaskLocation: true, // Parity: enable task location annotations
        isolate: true,
        logHeapUsage: true,
        name: {
            color: "yellow",
            label: "Shared",
        }, // Custom project name and color for Vitest
        outputFile: {
            json: "./coverage/shared/test-results.json",
        },
        pool: "threads", // Use worker threads
        poolOptions: {
            threads: {
                isolate: true,
                maxThreads: 24,
                minThreads: 1,
                singleThread: false,
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
        setupFiles: ["shared/test/setup.ts"], // Setup files for custom context injection
        slowTestThreshold: 300,
        testTimeout: 10_000, // 10 second timeout for shared tests
        typecheck: {
            allowJs: false,
            checker: "tsc",
            enabled: true,
            exclude: [
                "**/dist*/**",
                "**/html/**",
                "**/docs/**",
                "**/.{idea,git,cache,output,temp}/**",
                ...defaultExclude,
            ],
            ignoreSourceErrors: false,
            include: ["**/*.{test,spec}-d.?(c|m)[jt]s?(x)"],
            only: false,
            spawnTimeout: 10_000,
            tsconfig: "./config/testing/tsconfig.shared.test.json",
        },
    },
}) satisfies UserConfig as UserConfig;

export default vitestConfig as UserConfig;
