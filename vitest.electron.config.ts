/**
 * Vitest configuration for Electron backend tests.
 * Configures Node.js environment with Electron-specific mocking, modern performance
 * optimizations, and ES2024 target for consistency with TypeScript config.
 */

import * as path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    esbuild: {
        target: "es2024", // Match TypeScript target for consistency
    },
    test: {
        // Node.js environment for Electron main process testing
        environment: "node",

        // Global test functions
        globals: true,

        // Test file patterns
        include: ["electron/**/*.test.ts", "electron/**/*.spec.ts"],
        exclude: ["**/node_modules/**", "**/dist/**", "**/dist-electron/**", "**/coverage/**"],

        // Setup files for Electron testing
        setupFiles: ["./electron/test/setup.ts"],

        // Coverage configuration for backend
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "lcov", "html"],
            reportsDirectory: "./coverage/electron",
            include: ["electron/**/*.ts"],
            exclude: [
                "electron/test/**",
                "electron/**/*.test.ts",
                "electron/**/*.spec.ts",
                "electron/dist/**",
                "electron/**/*.d.ts",
                "electron/**/types.ts",
                "electron/services/*/index.ts",
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
        },

        // Test timeout
        testTimeout: 10000,

        // Modern performance optimizations
        pool: "threads", // Use worker threads for better performance
        poolOptions: {
            threads: {
                singleThread: false, // Enable multi-threading
                isolate: true, // Isolate tests for better reliability
            },
        },

        // Improve test output
        reporters: ["default", "json"],
        outputFile: {
            json: "./coverage/electron/test-results.json",
        },

        // Mock handling
        clearMocks: true,
        restoreMocks: true,
    },

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "electron"), // Standardize alias pattern
            "@electron": path.resolve(__dirname, "electron"), // Keep for backward compatibility
        },
    },
});
