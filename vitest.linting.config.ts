/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- needed for standalone config*/

/**
 * Vitest configuration for linting/tooling tests.
 *
 * @remarks
 * This project exists primarily to run RuleTester suites for internal ESLint
 * plugins under `config/linting/plugins/**`.
 */

import {
    defaultExclude,
    defineConfig,
    type ViteUserConfigExport,
} from "vitest/config";

/**
 * Vitest project configuration for linting/tooling tests.
 */
const lintingVitestConfig: ViteUserConfigExport = defineConfig({
    test: {
        bail: 50,
        environment: "node",
        // Keep this project narrow and fast.
        exclude: [
            "**/coverage/**",
            "**/dist/**",
            "**/docs/**",
            "**/node_modules/**",
            ...defaultExclude,
        ],
        globals: true,
        include: [
            "config/linting/plugins/**/test/**/*.{test,spec}.{ts,tsx,js,mjs,cjs,mts,cts}",
        ],
        name: {
            color: "green",
            label: "Linting",
        },
        reporters: [
            "default",
            "hanging-process",
        ],
        testTimeout: 10_000,
    },
});

export default lintingVitestConfig;
