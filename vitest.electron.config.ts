/**
 * Vitest configuration for Electron backend tests.
 * Configures Node.js environment with Electron-specific mocking and setup.
 */

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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

        // Mock handling
        clearMocks: true,
        restoreMocks: true,
    },

    resolve: {
        alias: {
            "@electron": path.resolve(__dirname, "electron"),
        },
    },
});
