/**
 * Vitest configuration for docs/tooling unit tests.
 *
 * @remarks
 * The main frontend/electron/shared Vitest projects exclude `docs/**`. This
 * dedicated project is intentionally narrow so we can test small Node-only
 * utilities (like TypeDoc/Docusaurus build helpers) without pulling the entire
 * docs site into other projects.
 */

import { type UserConfig } from "vite";
import { defaultExclude, defineConfig } from "vitest/config";

/**
 * Vitest project config for docs/tooling tests.
 */
const docsToolingVitestConfig = defineConfig({
    test: {
        // Coverage is handled by other projects; keep this project coverage-free.
        coverage: {
            enabled: false,
        },
        environment: "node",
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/coverage/**",
            ...defaultExclude,
        ],
        // Keep these tests fast and deterministic.
        fileParallelism: true,
        globals: true,
        include: ["tests/tooling/docs/**/*.test.{ts,tsx,js,mjs,cjs,mts,cts}"],
        isolate: true,
        name: {
            color: "green",
            label: "DocsTooling",
        },
        typecheck: {
            checker: "tsc",
            enabled: true,
            // Only typecheck test files in this project.
            include: ["tests/tooling/docs/**/*.test.{ts,tsx}"],
            tsconfig: "./tsconfig.json",
        },
    },
}) satisfies UserConfig as UserConfig;

export default docsToolingVitestConfig as UserConfig;
