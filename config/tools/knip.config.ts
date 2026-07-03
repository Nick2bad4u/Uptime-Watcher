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
        "scripts/**",
    ],
    ignoreBinaries: [
        "gitleaks",
        "git-cz",
        "grype",
        "hint",
        "markdownlint",
        "npm-check",
        "open-cli",
        "powershell",
        "repomix",
        "rimraf",
        "scorecard-check",
        "serve",
        "shellcheck",
        "sloc",
        "ts-node",
        "tsg",
        "typesync",
        "winget",
        "yamllint",
    ],
    ignoreDependencies: [
        ".*eslint-formatter-.*",
        ".*prettier.*",
        "@commitlint.*",
        "@cspell.*",
        "@dword-design/eslint-plugin-import-alias",
        "@electron/notarize",
        "@eslint.*",
        "@jscpd.*",
        "@microsoft/tsdoc-config",
        "@modelcontextprotocol/server-sequential-thinking",
        "@putout.*",
        "@snyk/protect",
        "@storybook.*",
        "@tailwindcss/forms",
        "@tailwindcss/typography",
        "@types.*",
        "@vitest.*",
        "async",
        "chartjs-adapter-date-fns",
        "chartjs-plugin-zoom",
        // Docusaurus' CSS minimizer worker requires this at build time from
        // the root css-minimizer-webpack-plugin package path.
        "clean-css",
        "cli-table3",
        "cssnano",
        "cssnano-preset-advanced",
        "docusaurus-plugin-typedoc",
        "electron.*",
        "eslint.*",
        "estree",
        "fast-deep-equal",
        "fs-extra",
        // Referenced by root dotfiles that Knip does not parse as package
        // dependency consumers.
        "gitleaks-config-nick2bad4u",
        "globals-vitest",
        "gray-matter",
        "istanbul.*",
        "lcov-result-merger",
        "markdown-to-jsx",
        "markdownlint",
        "node-abi",
        "nyc",
        "pkg-types",
        "postcss.*",
        "putout",
        "react-chartjs-2",
        // False-positive: the project imports icons from deep entrypoints
        // (e.g. `react-icons/fi`). Knip does not currently attribute those
        // imports back to the top-level `react-icons` dependency.
        "react-icons",
        "react-refresh",
        "remark.*",
        "secretlint-config-nick2bad4u",
        "stylelint.*",
        "tailwind.*",
        "ts.*",
        "tw-animate-css",
        "type.*",
        "vite.*",
        // Used through JSDoc type imports in remark validation helpers.
        "vfile",
        "ws",
        "yamllint-config-nick2bad4u",
        "zod-fast-check",
        // Knip does not attribute `zustand/*` subpath imports to the package.
        "zustand",
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
