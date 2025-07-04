/**
 * Vitest configuration for frontend tests.
 * Dedicated config file to help VS Code testing extension recognize frontend tests.
 * Settings match the test configuration from vite.config.ts.
 */

import * as path from "path";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration object for frontend testing.
 * Mirrors the test settings from the main vite.config.ts file.
 */
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
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
            ],
            ignoreEmptyLines: true, // Ignore empty lines in coverage reports
            provider: "v8",
            reporter: ["text", "json", "lcov", "html"],
            reportsDirectory: "./coverage",
        },
        environment: "jsdom", // Default for React components
        // Test file patterns - exclude electron tests as they have their own config
        exclude: ["**/node_modules/**", "**/dist/**", "**/dist-electron/**", "electron/**", "**/coverage/**"],
        globals: true, // Enable global test functions (describe, it, expect)
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        setupFiles: ["./src/test/setup.ts"], // Setup file for testing
        testTimeout: 10000, // Set Vitest timeout to 10 seconds
    },
});
