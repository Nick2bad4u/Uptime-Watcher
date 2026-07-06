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
        "docs/**",
        "docs/docusaurus/src/css/custom.css",
        "config/linting/plugins/uptime-watcher/_internal/repo-paths.mjs",
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
        "@eslint.*",
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
            entry: [],
            project: [],
        },
        electron: {
            entry: ["electron/main.ts", "electron/preload.ts"],
            project: [
                "!electron/**/*.spec.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "!electron/**/*.test.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "electron/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
            ],
        },
        shared: {
            entry: ["shared/index.ts"],
            project: [
                "!shared/**/*.spec.ts",
                "!shared/**/*.test.ts",
                "shared/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
            ],
        },
        src: {
            entry: ["src/main.tsx"],
            project: [
                "!src/**/*.spec.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "!src/**/*.test.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "src/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
            ],
        },
    },
};

export default knipConfig;
