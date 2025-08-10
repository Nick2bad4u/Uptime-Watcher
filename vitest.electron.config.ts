/* eslint-disable eslint-comments/disable-enable-pair -- needed for standalone config*/

/**
 * Vitest configuration for Electron backend tests.
 * Standalone config file that doesn't inherit from main vite config to avoid conflicts.
 * Specifically targets electron and shared files for backend testing.
 */

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./electron"),
            "@app": path.resolve(import.meta.dirname, "./src"),
            "@shared": path.resolve(import.meta.dirname, "./shared"),
        },
    },
    test: {
        clearMocks: true,
        coverage: {
            all: false, // Disable all file coverage, only test loaded files
            exclude: [
                "**/*.config.*",
                "**/*.d.ts",
                "**/dist/**", // Exclude any dist folder anywhere
                "**/docs/**",
                "**/index.ts", // Exclude all barrel export files
                "**/index.tsx", // Exclude JSX barrel export files
                "**/node_modules/**",
                "**/types.ts", // Exclude type definition files
                "**/types.tsx", // Exclude type definition files with JSX
                "coverage/**",
                "dist-electron/**",
                "dist/**",
                "src/**", // Exclude all src files from electron coverage
                "index.ts", // Barrel export file at root
                "release/**",
                "scripts/**",
                "report/**", // Exclude report files
                "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
            ],

            include: [
                "electron/**/*.ts", // Include all electron source files
                "shared/**/*.ts", // Include shared files when testing electron
            ],
            provider: "istanbul" as const,
            reporter: ["text", "json", "lcov", "html"],
            reportsDirectory: "./coverage/electron",
            skipFull: false, // Don't skip full coverage collection
            thresholds: {
                branches: 80, // Minimum 80% branch coverage for backend
                functions: 90, // Minimum 90% function coverage for backend
                lines: 90, // Minimum 90% line coverage for backend
                statements: 90, // Minimum 90% statement coverage for backend
            },
        },
        deps: {
            optimizer: {
                ssr: { enabled: true },
            },
        },
        environment: "node",
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/dist-electron/**",
            "**/src/**", // Explicitly exclude all src files
            "**/coverage/**",
            "**/docs/**",
        ],
        globals: true, // Enable global test functions (describe, it, expect)
        include: [
            "electron/**/*.test.ts",
            "electron/**/*.spec.ts",
        ],
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
                maxThreads: 8, // Limit concurrent threads for electron tests
                minThreads: 1, // Ensure at least one thread
                singleThread: false, // Enable multi-threading
            },
        },
        reporters: ["default", "json", "verbose", "hanging-process"], // Add hanging-process for improved output
        restoreMocks: true,
        setupFiles: ["./electron/test/setup.ts"],
        testTimeout: 15_000, // Set Vitest timeout to 15 seconds
    },
});
