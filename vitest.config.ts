/**
 * Vitest configuration for frontend tests.
 * Dedicated config file to help VS Code testing extension recognize frontend tests.
 * Settings match the test configuration from vite.config.ts.
 */

import react from "@vitejs/plugin-react";
import * as path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration object for frontend testing.
 * Mirrors the test settings from the main vite.config.ts file.
 */
export default defineConfig({
    esbuild: {
        target: "es2024", // Match TypeScript target for consistency
        // Transpile all files with ESBuild to remove comments from code coverage.
        // Required for `test.coverage.ignoreEmptyLines` to work:
        include: ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.ts", "**/*.tsx"],
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
            "@": path.resolve(__dirname, "src"),
            "@electron": path.resolve(__dirname, "electron"),
            "@shared": path.resolve(__dirname, "shared"),
        },
    },
    test: {
        coverage: {
            exclude: [
                "coverage/**",
                "dist/**",
                "dist-electron/**",
                "**/dist/**", // Exclude any dist folder anywhere
                "electron/dist/**", // Explicitly exclude electron/dist
                "electron/**", // Exclude all electron files from frontend coverage
                "**/*.d.ts",
                "**/*.config.*",
                "**/node_modules/**",
                "release/**",
                "scripts/**",
                "electron/test/dist/**", // Exclude compiled electron test files
                "**/types.ts", // Exclude type definition files
                "**/types.tsx", // Exclude type definition files with JSX
                "src/types.ts", // Explicitly exclude main types file
                "src/theme/types.ts", // Exclude theme types
                // Barrel export files - contain only re-exports, no testable logic
                "**/index.ts", // Exclude all barrel export files
                "**/index.tsx", // Exclude JSX barrel export files
                "src/components/index.ts", // Explicit barrel files
                "src/hooks/index.ts", // Explicit barrel files
                "src/stores/index.ts", // Explicit barrel files
                "src/utils/index.ts", // Explicit barrel files
                "src/stores/sites/utils/index.ts", // Specific barrel files
                "src/stores/sites/services/index.ts", // Specific barrel files
                "src/components/**/index.ts", // Component barrel files
                "src/hooks/**/index.ts", // Hook barrel files
                "index.ts", // Barrel export file at root
                "**/index.ts", // Any other index files
                "**/index.tsx", // Exclude JSX barrel export files
            ],
            ignoreEmptyLines: true, // Ignore empty lines in coverage reports
            experimentalAstAwareRemapping: true, // Enable AST-aware remapping for better accuracy
            provider: "v8",
            reporter: ["text", "json", "lcov", "html"],
            reportsDirectory: "./coverage",
            thresholds: {
                branches: 70, // Minimum 70% branch coverage
                functions: 80, // Minimum 80% function coverage
                lines: 80, // Minimum 80% line coverage
                statements: 80, // Minimum 80% statement coverage
            },
        },
        environment: "jsdom", // Default for React components
        // Test file patterns - exclude electron tests as they have their own config
        exclude: ["**/node_modules/**", "**/dist/**", "**/dist-electron/**", "electron/**", "**/coverage/**"],
        globals: true, // Enable global test functions (describe, it, expect)
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        outputFile: {
            json: "./coverage/test-results.json",
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
        setupFiles: ["./src/test/setup.ts"], // Setup file for testing
        testTimeout: 15000, // Set Vitest timeout to 15 seconds
    },
});
