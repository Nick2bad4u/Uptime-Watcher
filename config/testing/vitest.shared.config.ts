/**
 * Vitest configuration for shared utility tests. Standalone config file that
 * specifically targets shared utilities that are used by both frontend and
 * backend. This ensures shared code gets its own coverage flag in Codecov.
 */

import path from "node:path";
import { normalizePath } from "vite";
import { defineConfig } from "vitest/config";

const vitestConfig = defineConfig({
    resolve: {
        alias: {
            "@app": normalizePath(path.resolve(__dirname, "../../src")),
            "@electron": normalizePath(
                path.resolve(__dirname, "../../electron")
            ),
            "@shared": normalizePath(path.resolve(__dirname, "../../shared")),
        },
    },
    test: {
        clearMocks: true,
        coverage: {
            all: false, // Only test loaded files, not all files
            exclude: [
                "../../**/*.config.*",
                "../../**/*.d.ts",
                "../../**/dist/**",
                "../../**/dist-shared/**",
                "../../**/docs/**",
                "../../**/index.ts", // Exclude barrel export files
                "../../**/index.tsx",
                "../../**/node_modules/**",
                // NOTE: Don't exclude all types.ts files since shared/types.ts contains actual functions
                "../../src/**/types.ts", // Only exclude frontend type definition files
                "../../electron/**/types.ts", // Only exclude electron type definition files
                "../../**/types.tsx",
                "../../coverage/**",
                "../../dist-electron/**",
                "../../dist/**",
                "../../src/**", // Exclude frontend files
                "../../electron/**", // Exclude electron files
                "../../release/**",
                "../../scripts/**",
                "../../shared/test",
                "../../report/**",
                "../../**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                "../../shared/**/*.test.ts", // Exclude test files from coverage
                "../../shared/**/*.test.mts", // Exclude MTS test files from coverage
                "../../shared/**/*.test.cts", // Exclude CTS test files from coverage
                "../../shared/**/*.spec.ts", // Exclude spec files from coverage
                "../../shared/**/*.spec.mts", // Exclude MTS spec files from coverage
                "../../shared/**/*.spec.cts", // Exclude CTS spec files from coverage
                "../../shared/test/**", // Exclude test directory
            ],
            include: [
                "../../shared/**/*.ts", // Only include shared source files
                "../../shared/**/*.mts", // Include MTS source files
                "../../shared/**/*.cts", // Include CTS source files
            ],
            provider: "v8" as const, // Use V8 provider for consistency
            reporter: [
                "../../text",
                "../../json",
                "../../lcov",
                "../../html",
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
        deps: {
            optimizer: {
                ssr: { enabled: true },
            },
        },
        environment: "node", // Node environment for shared utilities
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/dist-electron/**",
            "**/src/**", // Explicitly exclude frontend files
            "**/electron/**", // Explicitly exclude electron files
            "**/coverage/**",
            "**/docs/**",
        ],
        expect: {
            requireAssertions: true,
        },
        globals: true, // Enable global test functions
        include: [
            "../../shared/**/*.test.ts", // Include shared tests only
            "../../shared/**/*.test.mts", // Include MTS tests
            "../../shared/**/*.test.cts", // Include CTS tests
            "../../shared/**/*.spec.ts", // Include shared specs only
            "../../shared/**/*.spec.mts", // Include MTS specs
            "../../shared/**/*.spec.cts", // Include CTS specs
            "../../shared/**/*.test.mjs", // Include MJS tests
        ],
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
                maxThreads: 24, // Lower thread count for shared tests
                minThreads: 1,
                singleThread: false,
                useAtomics: true,
            },
        },
        reporters: [
            "default",
            "json",
            "verbose",
            "hanging-process",
        ],
        testTimeout: 10_000, // 10 second timeout for shared tests
        typecheck: {
            enabled: true,
            tsconfig: "./tsconfig.shared.json",
        },
    },
});

export default vitestConfig as ReturnType<typeof defineConfig>;
