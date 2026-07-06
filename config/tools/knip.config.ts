/**
 * Repository-specific configuration for Knip dependency analysis.
 *
 * @packageDocumentation
 */
import type { KnipConfig } from "knip";

/**
 * Knip configuration that scopes entry points and dependency heuristics to the
 * Uptime Watcher monorepo layout.
 */
const knipConfig: KnipConfig = {
    $schema: "https://unpkg.com/knip@5/schema.json",
    entry: [],
    ignore: [
        "**/test/**",
        "docs/docusaurus/.docusaurus/**",
        "docs/docusaurus/build/**",
        "docs/docusaurus/docs/**",
        "docs/docusaurus/static/**",
        "docs/docusaurus/src/css/custom.css",
        "config/linting/plugins/uptime-watcher/_internal/repo-paths.mjs",
        // Benchmarks type-check this shim through config/benchmarks/tsconfig.bench.json;
        // Knip resolves the same alias through the root tsconfig instead.
        "benchmarks/shared/testHelpers.ts",
        "docs/docusaurus/src/components/HomepageFeatures/styles.module.css.d.ts",
        "docs/docusaurus/typedoc-plugins/hashToBangLinks.mjs",
        "docs/docusaurus/typedoc-plugins/hashToBangLinksCore.mjs",
        "docs/docusaurus/typedoc-plugins/prefixDocLinks.mjs",
        "docs/docusaurus/typedoc-plugins/hashToBangLinksCore.d.mts",
        "docs/docusaurus/typedoc-plugins/prefixDocLinksCore.d.mts",
    ],
    ignoreDependencies: [
        ".*eslint-formatter-.*",
        ".*prettier.*",
        "@easyops-cn/docusaurus-theme-docusaurus-search-local",
        "@eslint.*",
        "@theme/.*",
        "eslint.*",
        "estree",
        "postcss.*",
        "stylelint.*",
    ],
    ignoreExportsUsedInFile: {
        interface: true,
        type: true,
    },
    ignoreIssues: {
        "config/linting/plugins/uptime-watcher/plugin.cjs": ["exports"],
        "config/linting/plugins/uptime-watcher/plugin.d.cts": ["exports"],
        "config/linting/plugins/uptime-watcher/plugin.d.mts": ["exports"],
        "shared/constants/backup.ts": ["duplicates"],
        "shared/validation/statusUpdateSchemas.ts": ["duplicates"],
    },
    includeEntryExports: true,
    project: [],
    rules: {
        binaries: "error",
        dependencies: "error",
        devDependencies: "error",
        duplicates: "error",
        enumMembers: "warn",
        exports: "warn",
        files: "error",
        nsExports: "warn",
        nsTypes: "warn",
        optionalPeerDependencies: "error",
        types: "warn",
        unlisted: "error",
        unresolved: "error",
    },
    workspaces: {
        ".": {
            entry: [
                "benchmarks/**/*.bench.{ts,tsx}",
                "electron/main.ts",
                "electron/preload.ts",
                "scripts/**/*.{cjs,cts,js,json,jsonc,mjs,mts,ts}",
                "storybook/main.ts",
                "storybook/preview.ts",
                "vite*.config.ts",
                "vitest*.config.ts",
            ],
            project: [
                ".storybook/**/*.{cjs,cts,js,mjs,mts,ts,tsx}",
                "benchmarks/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
                "config/**/*.{cjs,cts,js,mjs,mts,ts}",
                "electron/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
                "playwright/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
                "scripts/**/*.{cjs,cts,js,mjs,mts,ts}",
                "shared/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
                "src/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
                "storybook/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
                "tests/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
            ],
        },
        "config/linting/plugins/uptime-watcher": {
            entry: ["rules/**/*.mjs"],
            project: [
                "**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
                "!**/*.test.{cjs,cts,js,jsx,mjs,mts,ts,tsx}",
            ],
        },
        "docs/docusaurus": {
            entry: ["src/**/*.{js,jsx,ts,tsx}", "typedoc-plugins/**/*.mjs"],
            project: [
                "src/**/*.{js,jsx,ts,tsx}",
                "typedoc-plugins/**/*.{js,mjs,ts,mts}",
            ],
        },
    },
};

export default knipConfig;
