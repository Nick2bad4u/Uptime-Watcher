/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- single-file overrides for config typings */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
/**
 * Comprehensive Vitest configuration for Stryker mutation testing. Tests all
 * three main source directories: src (frontend), electron (backend), and shared
 * (utilities).
 */

import type { UserConfig } from "vite";

import path from "node:path";
import { normalizePath } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const dirname = import.meta.dirname;

const config: UserConfig = defineConfig({
    cacheDir: "./.cache/vitest/.vitest-stryker",
    esbuild: {
        keepNames: true,
        target: "esnext",
    },
    json: {
        namedExports: true,
        stringify: true,
    },
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            "@app": normalizePath(path.resolve(dirname, "src")),
            "@assets": normalizePath(path.resolve(dirname, "assets")),
            "@electron": normalizePath(path.resolve(dirname, "electron")),
            "@shared": normalizePath(path.resolve(dirname, "shared")),
        },
    },
    // Cast: Vitest inline config typings omit several options needed for Stryker.
    test: {
        attachmentsDir: "./.cache/vitest/.vitest-attachments-stryker",
        bail: 100, // Stop after 100 failures to avoid excessive output
        chaiConfig: {
            includeStack: false,
            showDiff: true,
            truncateThreshold: 40,
        },
        // Minimal coverage config for Stryker
        coverage: {
            enabled: false, // Stryker handles its own coverage
        },
        css: {
            exclude: [],
            include: [/.*/v],
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
        environment: "jsdom",
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/coverage/**",
            "**/docs/**",
            "**/release/**",
            "**/html/**",
            "**/config/**",
            "**/benchmarks/**",

            // 🚫 Exclude problematic test files for Stryker compatibility
            // Node.js module mocking issues (dns/promises, node:url)
            "electron/test/DnsMonitor.comprehensive.test.ts",
            "electron/test/DnsMonitor.debug.test.ts",
            "electron/test/services/window/WindowService.test.ts",

            // ElectronAPI global redefinition conflicts
            "shared/test/strictTests/useSitesStore-complete-coverage.test.ts",

            // Logger spy/mock setup issues in Stryker environment
            "electron/test/utils/logger-coverage.test.ts",

            // Environment detection issues with jsdom vs node environments
            "shared/test/utils/environment-complete-function-coverage.test.ts",
            "shared/test/utils/environment.backend.test.ts",
            "shared/test/utils/environment.test.ts",

            // 🎯 Additional business logic tests with Stryker-specific issues
            // ConfigurationManager auto-start logic inconsistencies
            "electron/test/managers/ConfigurationManager.test.ts",

            // DatabaseManager event emission mock issues in Stryker environment
            "electron/test/managers/DatabaseManager.comprehensive.test.ts",

            // SiteManager site update name expectation mismatches
            "electron/test/managers/SiteManager.comprehensive.test.ts",

            // ApplicationService constructor dependency issues
            "electron/test/services/application/index.test.ts",
            "electron/test/services/application/ApplicationService.simple.test.ts",

            // Database utilities with dynamic imports causing Stryker issues
            "electron/test/services/database/utils/databaseBackup.test.ts",
            "electron/test/services/database/utils/databaseBackup.comprehensive.test.ts",

            // Retry utility tests with unhandled promise rejections
            "electron/test/utils/retry.comprehensive.test.ts",
            "electron/test/utils/retry.test.ts",

            // Main comprehensive test with unhandled promise rejections
            "electron/test/main.comprehensive.test.ts",
            "electron/test/main.missing-branches.test.ts",
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
            // 🎯 Frontend tests (React components, hooks, utilities)
            "src/**/*.{test,spec}.{ts,tsx}",

            // 🔧 Backend/Electron tests
            "electron/**/*.{test,spec}.ts",

            // 🔄 Shared utility tests
            "shared/**/*.{test,spec}.ts",
        ],
        includeTaskLocation: true,
        isolate: true,
        logHeapUsage: true,
        maxConcurrency: 20,
        name: {
            color: "magenta",
            label: "Stryker-All",
        }, // Custom project name and color for comprehensive testing
        outputFile: {
            json: "./coverage/stryker/test-results.json",
        },
        // Use threads like main config but with conservative settings for Stryker
        pool: "threads",
        poolOptions: {
            threads: {
                isolate: true, // Isolate tests for better reliability
                maxThreads: 2, // Reduced from 4 for better CI stability and memory usage
                minThreads: 1, // Ensure at least one thread
                singleThread: false, // Enable multi-threading but limited
                useAtomics: true,
            },
        },
        printConsoleTrace: false, // Disable stack trace printing for cleaner output
        retry: 0, // No retries to surface issues immediately
        sequence: {
            groupOrder: 0,
            setupFiles: "parallel",
        },
        setupFiles: ["./src/test/setup.ts"],
        slowTestThreshold: 300,
        testTimeout: 15_000, // 15 second timeout for comprehensive testing
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
            tsconfig: "./config/testing/tsconfig.shared.test.json",
        },
    } as any,
});

export default config;
