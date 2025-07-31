/**
 * Vitest configuration for Electron backend tests.
 * Configures Node.js environment with Electron-specific mocking, modern performance
 * optimizations, and ES2024 target for consistency with TypeScript config.
 */

import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    esbuild: {
        target: "es2024", // Match TypeScript target for consistency
        // Transpile all files with ESBuild to remove comments from code coverage.
        // Required for `test.coverage.ignoreEmptyLines` to work:
        include: [
            "**/*.js",
            "**/*.jsx",
            "**/*.mjs",
            "**/*.ts",
            "**/*.tsx",
        ],
    },
    plugins: [
        react({
            // Enable Fast Refresh for better development experience
            // Includes .js, .jsx, .ts, .tsx by default
            include: /\.(js|jsx|ts|tsx)$/,

            // Use automatic JSX runtime (default, but explicit for clarity)
            jsxRuntime: "automatic",

            // Configure babel for any custom transformations if needed
            babel: {
                // Use babel configuration files if they exist
                babelrc: false,
                configFile: false,
                // Add any custom babel plugins here if needed
                plugins: [],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "electron"), // Standardize alias pattern
            "@electron": path.resolve(import.meta.dirname, "electron"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
        },
    },
    test: {
        // Mock handling
        clearMocks: true,
        // Coverage configuration for backend
        coverage: {
            exclude: [
                "electron/test/**",
                "electron/**/*.test.ts",
                "electron/**/*.spec.ts",
                "electron/dist/**",
                "electron/**/*.d.ts",
                "electron/**/types.ts",
                "electron/services/*/index.ts",
                // Barrel export files - contain only re-exports, no testable logic
                "**/index.ts", // Exclude all barrel export files
                "electron/**/index.ts", // Explicit electron barrel files
                "electron/services/**/index.ts", // Service barrel files
                "electron/utils/**/index.ts", // Utility barrel files
                "electron/managers/**/index.ts", // Manager barrel files
                "index.ts", // Barrel export file at root
                "**/index.ts", // Any other index files
                "**/index.tsx", // Exclude JSX barrel export files
                "electron/components/**/index.ts", // Component barrel files
                "electron/hooks/**/index.ts", // Hook barrel files
                "**/docs/**", // Exclude documentation files
            ],
            include: ["electron/**/*.ts"],
            ignoreEmptyLines: true, // Ignore empty lines in coverage reports
            provider: "v8",
            reporter: ["text", "json", "lcov", "html"],
            reportsDirectory: "./coverage/electron",
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
        },
        // Node.js environment for Electron main process testing
        environment: "node",
        exclude: ["**/node_modules/**", "**/dist/**", "**/dist-electron/**", "**/coverage/**"],
        // Global test functions
        globals: true,
        // Test file patterns
        include: ["electron/**/*.test.ts", "electron/**/*.spec.ts", "shared/**/*.test.ts", "shared/**/*.spec.ts"],
        outputFile: {
            json: "./coverage/electron/test-results.json",
        },
        // Modern performance optimizations
        pool: "threads", // Use worker threads for better performance
        poolOptions: {
            threads: {
                isolate: true, // Isolate tests for better reliability
                singleThread: false, // Enable multi-threading
            },
        },
        // Improve test output
        reporters: ["default", "json", "verbose", "hanging-process"],
        restoreMocks: true,
        // Setup files for Electron testing
        setupFiles: ["./electron/test/setup.ts"],
        // Test timeout
        testTimeout: 15_000,
    },
});
