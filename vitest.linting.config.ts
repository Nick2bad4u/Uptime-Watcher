/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- needed for standalone config */

/**
 * Vitest configuration for linting/tooling tests.
 *
 * @remarks
 * This project exists primarily to run RuleTester suites for internal ESLint
 * plugins under `config/linting/plugins/**`.
 */

import * as path from "node:path";
import pc from "picocolors";
import { normalizePath, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {
    coverageConfigDefaults,
    defaultExclude,
    defineConfig,
    type ViteUserConfigExport,
} from "vitest/config";

const dirname = import.meta.dirname;

/**
 * Environment variables available to the Vitest config at runtime.
 *
 * @remarks
 * We intentionally avoid accessing `process.env` directly to keep ESLint
 * `n/no-process-env` enforcement strict in the rest of the codebase.
 */
const runtimeEnv = globalThis.process.env;

/**
 * Vitest project configuration for linting/tooling tests.
 */
const lintingVitestConfig: ViteUserConfigExport = defineConfig({
    cacheDir: "./.cache/vitest/.vitest-linting",
    esbuild: {
        include: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx}"],
        keepNames: true,
        target: "esnext",
    },
    json: {
        namedExports: true,
        stringify: true,
    },
    plugins: [
        tsconfigPaths({
            projects: ["./tsconfig.json"],
        }),
    ],
    resolve: {
        alias: {
            "@app": normalizePath(path.resolve(dirname, "src")),
            "@assets": normalizePath(path.resolve(dirname, "assets")),
            "@electron": normalizePath(path.resolve(dirname, "electron")),
            "@shared": normalizePath(path.resolve(dirname, "shared")),
        },
    },
    test: {
        attachmentsDir: "./.cache/vitest/.vitest-attachments-linting",
        bail: 50,
        benchmark: {
            exclude: [
                "**/dist*/**",
                "**/html/**",
                ...defaultExclude,
            ],
            include: [
                "config/linting/plugins/**/benchmarks/**/*.bench.{js,mjs,cjs,ts,mts,cts}",
            ],
            outputJson: "./coverage/linting/bench-results.json",
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
            include: [
                "config/linting/plugins/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
            ],
            provider: "v8" as const,
            reporter: [
                "text",
                "json",
                "lcov",
                "html",
            ],
            reportOnFailure: true,
            reportsDirectory: "./coverage/linting",
            skipFull: false,
            thresholds: {
                autoUpdate: false,
                // Parity: elevate branches to 90 to match frontend thresholds
                branches: 90,
                functions: 90, // Minimum 90% function coverage for backend
                lines: 90, // Minimum 90% line coverage for backend
                statements: 90, // Minimum 90% statement coverage for backend
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @vitest/coverage-v8 types omit runtime-supported options.
        } as any,
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

            PACKAGE_VERSION: runtimeEnv["PACKAGE_VERSION"] ?? "unknown",
        },
        environment: "node",
        // Keep this project narrow and fast.
        exclude: [
            "**/coverage/**",
            "**/dist/**",
            "**/dist*/**",
            "**/docs/**",
            "**/electron/**",
            "**/node_modules/**",
            "**/src/**",
            ...defaultExclude,
        ],
        expect: {
            poll: { interval: 50, timeout: 1000 },
            // ESLint RuleTester suites do not call Vitest's `expect(...)`; they
            // assert via ESLint/Node assertion internals. Requiring Vitest
            // assertions here produces false negatives.
            requireAssertions: false,
        },
        fakeTimers: {
            advanceTimeDelta: 20,
            loopLimit: 10_000,
            now: Date.now(),
            shouldAdvanceTime: false,
            shouldClearNativeTimers: true,
        },
        fileParallelism: false,
        globals: true,
        include: [
            "config/linting/plugins/**/test/**/*.{test,spec}.{ts,tsx,js,mjs,cjs,mts,cts}",
        ],
        includeTaskLocation: true,
        isolate: true,
        logHeapUsage: true,
        // NOTE: Vitest v4 removed `test.poolOptions`. Use `maxWorkers` instead.
        maxWorkers: Math.max(
            1,
            Number(runtimeEnv["MAX_THREADS"] ?? (runtimeEnv["CI"] ? "1" : "8"))
        ),
        name: {
            color: "green",
            label: "Linting",
        },
        pool: "threads",
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
        slowTestThreshold: 300,
        testTimeout: 10_000,
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
            tsconfig:
                "config/linting/plugins/uptime-watcher/tsconfig.eslint.json",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vitest config typing lags behind runtime options we rely on.
    } as any,
}) satisfies UserConfig as UserConfig;

export default lintingVitestConfig as UserConfig;
