/**
 * Optimized ESLint configuration for Uptime Watcher
 *
 * This configuration is specifically tailored for:
 *
 * - Electron + React + TypeScript architecture
 * - Domain-driven design with Zustand stores
 * - Service-based backend architecture
 * - High code quality with reduced false positives
 * - Modern ES2024+ features
 * - Enhanced security and performance rules
 */

/* eslint-disable import-x/no-named-as-default-member -- Eslint doesn't use default*/
/* eslint-disable n/no-unpublished-import -- Rule wants packages not in dev, doesn't apply */

import pluginUseMemo2 from "@arthurgeron/eslint-plugin-react-usememo";
import pluginDocusaurus from "@docusaurus/eslint-plugin";
import eslintReact from "@eslint-react/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
// import html from "eslint-plugin-html";
import html from "@html-eslint/eslint-plugin";
import * as htmlParser from "@html-eslint/parser";
import implicitDependencies from "@jcoreio/eslint-plugin-implicit-dependencies";
import * as pluginDesignTokens from "@metamask/eslint-plugin-design-tokens";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import arrayFunc from "eslint-plugin-array-func";
import pluginBoundaries from "eslint-plugin-boundaries";
import pluginCanonical from "eslint-plugin-canonical";
import * as pluginCleanCode from "eslint-plugin-clean-code";
import eslintPluginCommentLength from "eslint-plugin-comment-length";
// eslint-disable-next-line import-x/no-unresolved -- Works fine
import pluginCompat from "eslint-plugin-compat";
import * as pluginCssModules from "eslint-plugin-css-modules";
import depend from "eslint-plugin-depend";
import pluginDeprecation from "eslint-plugin-deprecation";
// eslint-disable-next-line depend/ban-dependencies -- Recommended one sucks
import pluginComments from "eslint-plugin-eslint-comments";
import etc from "eslint-plugin-etc";
import { plugin as ex } from "eslint-plugin-exception-handling";
import progress from "eslint-plugin-file-progress";
import pluginFilenameExport from "eslint-plugin-filename-export";
import pluginFormatSQL from "eslint-plugin-format-sql";
import * as pluginFunctionNames from "eslint-plugin-function-name";
import pluginFunctional from "eslint-plugin-functional";
import pluginGoodEffects from "eslint-plugin-goodeffects";
import pluginGranular from "eslint-plugin-granular-selectors";
import { importX } from "eslint-plugin-import-x";
// Zod Tree Shaking Plugin https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831
import importZod from "eslint-plugin-import-zod";
import istanbul from "eslint-plugin-istanbul";
import eslintPluginJsonSchemaValidator from "eslint-plugin-json-schema-validator";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginJsxPlus from "eslint-plugin-jsx-plus";
import listeners from "eslint-plugin-listeners";
import pluginLoadableImports from "eslint-plugin-loadable-imports";
import eslintPluginMath from "eslint-plugin-math";
import * as mdx from "eslint-plugin-mdx";
import moduleInterop from "eslint-plugin-module-interop";
import nodePlugin from "eslint-plugin-n";
import pluginNeverThrow from "eslint-plugin-neverthrow";
import nitpick from "eslint-plugin-nitpick";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
import pluginNoConstructBind from "eslint-plugin-no-constructor-bind";
import pluginNoExplicitTypeExports from "eslint-plugin-no-explicit-type-exports";
import * as pluginNFDAR from "eslint-plugin-no-function-declare-after-return";
// import * as tailwind4 from "tailwind-csstree";
import pluginNoHardcoded from "eslint-plugin-no-hardcoded-strings";
import pluginRegexLook from "eslint-plugin-no-lookahead-lookbehind-regexp";
import pluginNoOnly from "eslint-plugin-no-only-tests";
import pluginNoUnary from "eslint-plugin-no-unary-plus";
import pluginNoUnwaited from "eslint-plugin-no-unawaited-dot-catch-throw";
import nounsanitized from "eslint-plugin-no-unsanitized";
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import observers from "eslint-plugin-observers";
import packageJson from "eslint-plugin-package-json";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
import pluginPromise from "eslint-plugin-promise";
import putout from "eslint-plugin-putout";
// eslint-disable-next-line depend/ban-dependencies -- Recommended one sucks
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintReactDom from "eslint-plugin-react-dom";
import * as pluginReactFormFields from "eslint-plugin-react-form-fields";
import pluginReactHookForm from "eslint-plugin-react-hook-form";
// eslint-disable-next-line import-x/default -- Works fine
import reactHooks from "eslint-plugin-react-hooks";
import reactHooksAddons from "eslint-plugin-react-hooks-addons";
import eslintReactHooksExtra from "eslint-plugin-react-hooks-extra";
import eslintReactNamingConvention from "eslint-plugin-react-naming-convention";
import reactPerfPlugin from "eslint-plugin-react-perf";
// eslint-disable-next-line import-x/default -- Working fine just old
import preferFunctionComponent from "eslint-plugin-react-prefer-function-component";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginReactTest from "eslint-plugin-react-require-testid";
import reactUseEffect from "eslint-plugin-react-useeffect";
import eslintReactWeb from "eslint-plugin-react-web-api";
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
import * as pluginJSDoc from "eslint-plugin-require-jsdoc";
import pluginSafeJSX from "eslint-plugin-safe-jsx";
import pluginSecurity from "eslint-plugin-security";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
import pluginSortDestructure from "eslint-plugin-sort-destructure-keys";
import pluginSortReactDependency from "eslint-plugin-sort-react-dependency-arrays";
import sqlTemplate from "eslint-plugin-sql-template";
import pluginSSR from "eslint-plugin-ssr-friendly";
import styledA11y from "eslint-plugin-styled-components-a11y";
import tailwind from "eslint-plugin-tailwindcss";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import eslintPluginToml from "eslint-plugin-toml";
import pluginTopLevel from "eslint-plugin-toplevel";
import pluginTotalFunctions from "eslint-plugin-total-functions";
import pluginTsdoc from "eslint-plugin-tsdoc";
import pluginUndefinedCss from "eslint-plugin-undefined-css-classes";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginUseMemo from "eslint-plugin-usememo-recommendations";
import pluginValidateJSX from "eslint-plugin-validate-jsx-nesting";
// * as cssPlugin from "eslint-plugin-css"
import pluginWriteGood from "eslint-plugin-write-good-comments";
import xss from "eslint-plugin-xss";
import eslintPluginYml from "eslint-plugin-yml";
import zod from "eslint-plugin-zod";
import globals from "globals";
import jsoncEslintParser from "jsonc-eslint-parser";
import path from "node:path";
import tomlEslintParser from "toml-eslint-parser";
import yamlEslintParser from "yaml-eslint-parser";

// Unused and Uninstalled Plugins:
// import * as nodeDependenciesPlugin from "eslint-plugin-node-dependencies"; Broken with isJson undefined error
// eslint-config-prettier
// eslint-find-rules
// eslint-formatter-compact -- Built into eslint
// eslint-import-resolver-node -- Replaced by import-x
// eslint-plugin-json
// eslint-plugin-no-inferred-method-name
// eslint-plugin-react-native
// eslint-plugin-react-x
// eslint-plugin-no-inferred-method-name
// @stylistic/eslint-plugin
// eslint-plugin-fsecond
// eslint-plugin-es-x
// @dword-design/import-alias
// eslint-plugin-typesafe -- Broken
// eslint-plugin-use-selector-with -- Broken
// eslint-plugin-zod-import -- Didn't test but does similar function to import-zod
// @fluentui/eslint-plugin-react-components
// eslint-plugin-solid
// @ospm/eslint-plugin-react-signals-hooks
// eslint-plugin-pkg-json -- Package appears to be broken or incompatible
// ESLint Tools
// Import { FlatCompat } from "@eslint/eslintrc";
// Const flatCompat = new FlatCompat();
// Don't use
// eslint-plugin-import -- Replaced by import-x
// Schema: https://www.schemastore.org/eslintrc.json

// const __filename = fileURLToPath(import.meta.url);
// const gitignorePath = path.resolve(__dirname, ".gitignore");

const ROOT_DIR = import.meta.dirname;

export default [
    // GLobal Configs and Rules
    importX.flatConfigs.typescript,
    progress.configs.recommended,
    noBarrelFiles.flat,
    // @ts-expect-error -- working fine - tested
    nitpick.configs.recommended,

    // ═══════════════════════════════════════════════════════════════════════════════
    // Global Ignore Patterns
    // Add patterns here to ignore files and directories globally
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        ignores: [
            "_ZENTASKS*",
            ".agentic-tools*",
            ".devskim.json",
            ".github/chatmodes/**",
            ".github/instructions/**",
            ".github/ISSUE_TEMPLATE/**",
            ".github/prompts/**",
            ".github/PULL_REQUEST_TEMPLATE/**",
            ".stryker-tmp/**",
            "**/_ZENTASKS*",
            "**/.agentic-tools*",
            "**/.cache",
            "**/chatproject.md",
            "**/coverage-results.json",
            "**/Coverage/**",
            "**/coverage/**",
            "**/dist-electron/**",
            "**/dist-shared/**",
            "**/dist-scripts/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/package-lock.json",
            "**/release/**",
            "CHANGELOG.md",
            "coverage-report.json",
            "Coverage/",
            "coverage/",
            "dist-electron/",
            "**/**dist**/**",
            "dist/",
            "docs/Archive/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/docs/**",
            "docs/Logger-Error-report.md",
            "docs/Packages/**",
            "docs/Reviews/**",
            "html/**",
            "node_modules/**",
            "release/",
            "report/**",
            // "config/testing/vitest.electron.config.ts", // Ignore vitest electron config
            // "config/testing/vitest.shared.config.ts", // Ignore vitest shared config
            // "vite.config.ts", // Ignore vite config due to parsing issues
            // "vitest.config.ts", // Ignore vitest config due to parsing issues
        ],
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // Global Language Options
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
                __dirname: "readonly",
                __filename: "readonly",
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                Buffer: "readonly",
                describe: "readonly",
                document: "readonly",
                expect: "readonly",
                global: "readonly",
                globalThis: "readonly",
                it: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
                test: "readonly",
                vi: "readonly",
                window: "readonly",
            },
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // Global Settings
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        settings: {
            "import-x/resolver": {
                node: true,
            },
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)
                    noWarnOnMultipleProjects: true, // Don't warn about multiple projects
                    // Use an array
                    project: [
                        "config/testing/tsconfig.configs.json",
                        "config/testing/tsconfig.electron.test.json",
                        "config/testing/tsconfig.scripts.json",
                        "config/testing/tsconfig.shared.test.json",
                        "config/testing/tsconfig.test.json",
                        "docs/docusaurus/tsconfig.eslint.json",
                        "docs/docusaurus/tsconfig.json",
                        "docs/docusaurus/tsconfig.local.typedoc.json",
                        "docs/docusaurus/tsconfig.typedoc.json",
                        "tsconfig.electron.json",
                        "tsconfig.json",
                        "tsconfig.shared.json",
                    ],
                }),
            ],
            react: { version: "19" },
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // YAML/YML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{yaml,yml}"],
        ignores: [],
        languageOptions: {
            parser: yamlEslintParser,
            // Options used with yaml-eslint-parser.
            parserOptions: {
                defaultYAMLVersion: "1.2",
            },
        },
        plugins: {
            "json-schema-validator": eslintPluginJsonSchemaValidator,
            yml: eslintPluginYml,
        },
        rules: {
            "json-schema-validator/no-invalid": "error",
            "yml/block-mapping-colon-indicator-newline": "error",
            "yml/block-mapping-question-indicator-newline": "error",
            "yml/block-sequence-hyphen-indicator-newline": "error",
            "yml/file-extension": "off",
            "yml/flow-mapping-curly-newline": "error",
            "yml/flow-mapping-curly-spacing": "error",
            "yml/flow-sequence-bracket-newline": "error",
            "yml/flow-sequence-bracket-spacing": "error",
            "yml/key-name-casing": "off",
            "yml/key-spacing": "error",
            "yml/no-empty-document": "error",
            "yml/no-empty-key": "error",
            "yml/no-empty-mapping-value": "error",
            "yml/no-empty-sequence-entry": "error",
            "yml/no-irregular-whitespace": "error",
            "yml/no-multiple-empty-lines": "error",
            "yml/no-tab-indent": "error",
            "yml/no-trailing-zeros": "error",
            "yml/plain-scalar": "off",
            "yml/quotes": "error",
            "yml/require-string-key": "error",
            "yml/sort-keys": "error",
            "yml/sort-sequence-values": "off",
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // HTML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{html,htm,xhtml}"],
        ignores: ["report/**"],
        languageOptions: {
            parser: htmlParser,
        },
        plugins: {
            html: html,
        },
        rules: {
            ...html.configs.recommended.rules,
            // HTML Eslint Plugin Rules (html/*)
            "html/indent": "error",
            "html/no-extra-spacing-attrs": [
                "error",
                { enforceBeforeSelfClose: true },
            ],
            "html/require-closing-tags": [
                "error",
                { selfClosing: "always" },
            ],
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // HTML in JS/TS files (HTML Literals)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}"],
        ignores: ["report/**"],
        plugins: {
            html: html,
        },
        rules: {
            // HTML Eslint Plugin Rules (html/*)
            ...html.configs.recommended.rules,
            "html/indent": "error",
            "html/no-extra-spacing-attrs": [
                "error",
                { enforceBeforeSelfClose: true },
            ],
            "html/require-closing-tags": [
                "error",
                { selfClosing: "always" },
            ],
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // Package.json Linting (PubLint)
    // ═══════════════════════════════════════════════════════════════════════════════

    // {
    //     files: ["**/package.json"],
    //     languageOptions: {
    //         parser: publintParser,
    //     },
    //     plugins: { publint },
    //     rules: {
    //         /**
    //          * The 'error' type messages created by publint will cause eslint
    //          * errors
    //          */
    //         "publint/error": "error",
    //         /**
    //          * The 'suggestion' type messages created by publint will cause
    //          * eslint warns
    //          */
    //         "publint/suggestion": "warn",
    //         /**
    //          * The 'warning' type messages created by publint will cause eslint
    //          * warns
    //          */
    //         "publint/warning": "warn",
    //     },
    // },
    // ═══════════════════════════════════════════════════════════════════════════════
    // Package.json Linting
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/package.json"],
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        plugins: { json: json, "package-json": packageJson },
        rules: {
            ...json.configs.recommended.rules,
            // Package.json Plugin Rules (package-json/*)
            "package-json/no-redundant-files": "warn",
            "package-json/require-author": "warn",
            "package-json/require-bugs": "warn",
            "package-json/require-bundleDependencies": "off",
            "package-json/require-dependencies": "warn",
            "package-json/require-devDependencies": "warn",
            "package-json/require-engines": "warn",
            "package-json/require-files": "off", // Not needed for Electron applications
            "package-json/require-keywords": "warn",
            "package-json/require-optionalDependencies": "off", // Not needed for Electron applications
            "package-json/require-peerDependencies": "off",
            "package-json/require-types": "off", // Not needed for Electron applications
            "package-json/restrict-dependency-ranges": "warn",
            "package-json/valid-local-dependency": "off",
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // MDX Eslint Rules (mdx/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.mdx"],
        plugins: { mdx: mdx },

        rules: {
            ...mdx.flat.rules,
            ...mdx.flatCodeBlocks.rules,
            // Core Plugin ESLint Rules (Basic JavaScript)
            "no-var": "error",
            "prefer-const": "error",
        },
        settings: {
            processor: mdx.createRemarkProcessor({
                // optional, same as the `parserOptions.ignoreRemarkConfig`, you have to specify it twice unfortunately
                ignoreRemarkConfig: true,
                // optional, if you want to disable language mapper, set it to `false`
                // if you want to override the default language mapper inside, you can provide your own
                languageMapper: {},
                lintCodeBlocks: true,
                // optional, same as the `parserOptions.remarkConfigPath`, you have to specify it twice unfortunately
                // remarkConfigPath: "path/to/your/remarkrc",
            }),
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // MD Eslint Rules (md/*, markdown/*, markup/*, atom/*, rss/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{md,markup,atom,rss,markdown}"],
        language: "markdown/gfm",
        plugins: {
            markdown: markdown,
        },
        rules: {
            // Markdown Plugin Eslint Rules (markdown/*)
            "markdown/fenced-code-language": "error",
            "markdown/heading-increment": "error",
            "markdown/no-duplicate-definitions": "error",
            "markdown/no-empty-definitions": "error",
            "markdown/no-empty-images": "error",
            "markdown/no-empty-links": "error",
            "markdown/no-invalid-label-refs": "error",
            "markdown/no-missing-atx-heading-space": "error",
            "markdown/no-missing-label-refs": "error",
            "markdown/no-missing-link-fragments": "error",
            "markdown/no-multiple-h1": "error",
            "markdown/no-reversed-media-syntax": "error",
            "markdown/no-space-in-emphasis": "error",
            "markdown/no-unused-definitions": "error",
            "markdown/require-alt-text": "error",
            "markdown/table-column-count": "error",
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // CSS Eslint Rules (css/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.css"],
        ignores: [
            "docs/**",
            "**/test/**",
        ],
        language: "css/css",
        languageOptions: {
            tolerant: true,
        },
        plugins: {
            css: css,
        },
        rules: {
            ...css.configs.recommended.rules,
            // CSS Eslint Rules (css/*)
            "css/no-empty-blocks": "error",
            "css/no-invalid-at-rules": "off",
            "css/no-invalid-properties": "off",
            "css/use-baseline": "off",
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // JSONC Eslint Rules (jsonc/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/*.jsonc",
            ".vscode/*.json",
        ],
        ignores: [],
        plugins: {
            eslintPluginJsonc: eslintPluginJsonc,
            json: json,
            "json-schema-validator": eslintPluginJsonSchemaValidator,
        },
        // ═══════════════════════════════════════════════════════════════════════════════
        // Plugin Config for eslint-plugin-jsonc to enable Prettier formatting
        // ═══════════════════════════════════════════════════════════════════════════════
        ...eslintPluginJsonc.configs["flat/prettier"][0],

        language: "json/jsonc",
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        rules: {
            ...json.configs.recommended.rules,
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // JSON Eslint Rules (json/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json"],
        language: "json/json",
        plugins: {
            json: json,
            "json-schema-validator": eslintPluginJsonSchemaValidator,
        },
        rules: {
            ...json.configs.recommended.rules,
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // JSON5 Eslint Rules (json5/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json5"],
        language: "json/json5",
        plugins: {
            json: json,
            "json-schema-validator": eslintPluginJsonSchemaValidator,
        },
        rules: {
            ...json.configs.recommended.rules,
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOML Eslint Rules (toml/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.toml"],
        ignores: ["lychee.toml"],
        languageOptions: {
            parser: tomlEslintParser,
            parserOptions: { tomlVersion: "1.0.0" },
        },
        plugins: { toml: eslintPluginToml },
        rules: {
            // TOML Eslint Plugin Rules (toml/*)
            "toml/array-bracket-newline": "warn",
            "toml/array-bracket-spacing": "warn",
            "toml/array-element-newline": "warn",
            "toml/comma-style": "warn",
            "toml/indent": "off",
            "toml/inline-table-curly-spacing": "warn",
            "toml/key-spacing": "warn",
            "toml/keys-order": "warn",
            "toml/no-space-dots": "warn",
            "toml/no-unreadable-number-separator": "warn",
            "toml/padding-line-between-pairs": "warn",
            "toml/padding-line-between-tables": "warn",
            "toml/precision-of-fractional-seconds": "warn",
            "toml/precision-of-integer": "warn",
            "toml/quoted-keys": "warn",
            "toml/spaced-comment": "warn",
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // TSX/JSX Eslint Rules (tsx/*, jsx/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{tsx,jsx}"],
        ignores: [],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                window: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "tsconfig.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            css: css,
            "no-hardcoded-strings": pluginNoHardcoded,
            tailwind: tailwind,
            "undefined-css-classes": pluginUndefinedCss,
        },
        rules: {
            // TypeScript rules
            ...css.configs.recommended.rules,
            ...pluginUndefinedCss.configs["with-tailwind"].rules,
            // No Hardcoded Strings Plugin Rules (no-hardcoded-strings/*)
            // "no-hardcoded-strings/no-hardcoded-strings": [
            //     "warn",
            //     {
            //         allowedFunctionNames: ["t", "translate", "i18n"],
            //         ignoreStrings: ["OK", "Cancel"],
            //         ignorePatterns: [/^[\s\d\-:]+$/v], // Ignore dates, times, numbers
            //     },
            // ],
            // Tailwind CSS Plugin Rules (tailwind/*)
            "tailwind/classnames-order": "warn",
            "tailwind/enforces-negative-arbitrary-values": "warn",
            "tailwind/enforces-shorthand": "warn",
            "tailwind/migration-from-tailwind-2": "warn",
            "tailwind/no-arbitrary-value": "warn",
            "tailwind/no-contradicting-classname": "warn",
            "tailwind/no-custom-classname": [
                "warn",
                {
                    skipClassAttribute: true,
                },
            ],
            "tailwind/no-unnecessary-arbitrary-value": "warn",
            // Disable undefined-css-classes as it's producing false positives for valid Tailwind classes
            "undefined-css-classes/no-undefined-css-classes": "off",
        },
        settings: {
            "boundaries/elements": [
                { pattern: "src/App.tsx", type: "app" },
                { pattern: "src/main.tsx", type: "main" },
                { pattern: "src/index.css", type: "styles" },
                { pattern: "src/constants.ts", type: "constants" },
                { pattern: "src/types.ts", type: "types" },
                {
                    capture: ["elementName"],
                    pattern: "src/components/**/*",
                    type: "components",
                },
                {
                    capture: ["elementName"],
                    pattern: "src/hooks/**/*",
                    type: "hooks",
                },
                {
                    capture: ["elementName"],
                    pattern: "src/services/**/*",
                    type: "services",
                },
                {
                    capture: ["elementName"],
                    pattern: "src/stores/**/*",
                    type: "stores",
                },
                {
                    capture: ["elementName"],
                    pattern: "src/theme/**/*",
                    type: "theme",
                },
                {
                    capture: ["elementName"],
                    pattern: "src/utils/**/*",
                    type: "utils",
                },
                {
                    capture: ["elementName"],
                    pattern: "src/types/**/*",
                    type: "types",
                },
                {
                    capture: ["elementName"],
                    pattern: "src/test/**/*",
                    type: "test",
                },
            ],
            react: { version: "19" },
            tailwindcss: {
                config: `${ROOT_DIR}/src/index.css`,
            },
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // Docusaurus Eslint Rules (docusaurus/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["docs/docusaurus/**/*.{ts,tsx,mjs,cjs,js,jsx,mts,cts}"],
        ignores: [
            "docs/docusaurus/docs/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/**/*.css",
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                window: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "./docs/docusaurus/tsconfig.eslint.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@docusaurus": pluginDocusaurus,
            "@eslint-react": eslintReact,
            "@eslint-react/dom": eslintReactDom,
            "@eslint-react/hooks-extra": eslintReactHooksExtra,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            "@eslint-react/web-api": eslintReactWeb,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            "@metamask/design-tokens": pluginDesignTokens,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "@typescript-eslint": tseslint,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- TS Error from fixupPluginRules
            deprecation: fixupPluginRules(pluginDeprecation),
            "eslint-comments": pluginComments,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "eslint-plugin-toplevel": pluginTopLevel,
            etc: fixupPluginRules(etc),
            ex: ex,
            "format-sql": pluginFormatSQL,
            "function-name": pluginFunctionNames,
            functional: pluginFunctional,
            "granular-selectors": pluginGranular,
            "import-x": importX,
            "import-zod": importZod,
            istanbul: istanbul,
            js: js,
            "jsx-a11y": jsxA11y,
            "jsx-plus": pluginJsxPlus,
            listeners: listeners,
            "loadable-imports": pluginLoadableImports,
            math: eslintPluginMath,
            "module-interop": moduleInterop,
            n: nodePlugin,
            // @ts-expect-error -- TS Error from fixupPluginRules
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            "react-hooks": reactHooks,
            "react-hooks-addons": reactHooksAddons,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sql-template": sqlTemplate,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "styled-components-a11y": styledA11y,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "usememo-recommendations": pluginUseMemo,
            "validate-jsx-nesting": pluginValidateJSX,
            "write-good-comments": pluginWriteGood,
            xss: xss,
            zod: zod,
        },
        rules: {
            // TypeScript backend rules
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.react.rules,
            ...importX.flatConfigs.typescript.rules,
            ...importX.flatConfigs.electron.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...css.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-typescript"].rules,
            ...arrayFunc.configs.all.rules,
            ...pluginSortClassMembers.configs["flat/recommended"].rules,
            ...eslintPluginNoUseExtendNative.configs.recommended.rules,
            ...pluginMicrosoftSdl.configs.required.rules,
            ...listeners.configs.strict.rules,
            ...pluginNFDAR.rules,
            ...pluginJSDoc.rules,
            ...eslintPluginCommentLength.configs["flat/recommended"].rules,
            ...pluginRegexLook.configs.recommended.rules,
            ...pluginJsxPlus.configs.all.rules,
            ...moduleInterop.configs.recommended.rules,
            ...pluginTotalFunctions.configs.recommended.rules,
            ...styledA11y.flatConfigs.strict.rules,
            ...etc.configs.recommended.rules,
            "@docusaurus/no-html-links": "warn",
            "@docusaurus/no-untranslated-text": "off",
            "@docusaurus/prefer-docusaurus-heading": "warn",
            "@docusaurus/string-literal-i18n-messages": "off",
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            "@eslint-react/naming-convention/use-state": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "error",
                {
                    ignore: [
                        "@shared",
                        "electron-devtools-installer",
                        "electron",
                        "@site",
                        "@site/src",
                        "@theme",
                        "@docusaurus",
                    ],
                },
            ],
            "@metamask/design-tokens/color-no-hex": "off",
            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    blur: "Use 'blur-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    ring: "Use 'ring-3' instead.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    rounded: "Use 'rounded-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "shadow-sm": "Use 'shadow-xs' instead.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@typescript-eslint/adjacent-overload-signatures": "warn",
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types
            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/ban-tslint-comment": "warn",
            "@typescript-eslint/class-literal-property-style": "warn",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/consistent-generic-constructors": "warn",
            "@typescript-eslint/consistent-indexed-object-style": "warn",
            "@typescript-eslint/consistent-return": "warn",
            // Function and type safety rules (same as frontend)
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": "warn",
            "@typescript-eslint/consistent-type-exports": "warn",
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/default-param-last": "warn",
            "@typescript-eslint/dot-notation": "warn",
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowConciseArrowFunctionExpressionsStartingWithVoid: false,
                    allowDirectConstAssertionInArrowFunctions: true,
                    allowedNames: [],
                    allowExpressions: false,
                    allowFunctionsWithoutTypeParameters: false,
                    allowHigherOrderFunctions: true,
                    allowIIFEs: false,
                    allowTypedFunctionExpressions: true,
                },
            ],
            "@typescript-eslint/explicit-member-accessibility": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "warn",
            "@typescript-eslint/init-declarations": "warn",
            "@typescript-eslint/max-params": "off",
            "@typescript-eslint/member-ordering": "off",
            "@typescript-eslint/method-signature-style": "warn",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-array-constructor": "warn",
            "@typescript-eslint/no-array-delete": "warn",
            "@typescript-eslint/no-base-to-string": "warn",
            "@typescript-eslint/no-confusing-non-null-assertion": "warn",
            "@typescript-eslint/no-confusing-void-expression": "warn",
            "@typescript-eslint/no-deprecated": "warn",
            "@typescript-eslint/no-dupe-class-members": "warn",
            "@typescript-eslint/no-duplicate-enum-values": "warn",
            "@typescript-eslint/no-duplicate-type-constituents": "warn",
            "@typescript-eslint/no-dynamic-delete": "warn",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],
            "@typescript-eslint/no-empty-object-type": "error",
            // Allow more flexibility for backend patterns
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-extra-non-null-assertion": "warn",
            "@typescript-eslint/no-extraneous-class": "warn",
            // Advanced type-checked rules for backend async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues in Node.js
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                },
            ],
            "@typescript-eslint/no-for-in-array": "warn",
            "@typescript-eslint/no-implied-eval": "warn",
            // Keep enabled: Helps with bundle optimization and makes type vs runtime imports clearer.
            // Can be resolved incrementally as warnings.
            "@typescript-eslint/no-import-type-side-effects": "warn",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-invalid-this": "warn",
            "@typescript-eslint/no-invalid-void-type": "warn",
            "@typescript-eslint/no-loop-func": "warn",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-meaningless-void-operator": "warn",
            "@typescript-eslint/no-misused-new": "warn",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksSpreads: true, // Check Promise spreads
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                },
            ],
            "@typescript-eslint/no-misused-spread": "warn",
            "@typescript-eslint/no-mixed-enums": "warn",
            "@typescript-eslint/no-namespace": "warn",
            "@typescript-eslint/no-non-null-asserted-nullish-coalescing":
                "warn",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
            "@typescript-eslint/no-redeclare": "warn",
            "@typescript-eslint/no-redundant-type-constituents": "warn",
            "@typescript-eslint/no-require-imports": "warn",
            "@typescript-eslint/no-restricted-imports": "warn",
            "@typescript-eslint/no-restricted-types": [
                "error",
                {
                    types: {
                        Function: {
                            message: [
                                "The `Function` type accepts any function-like value.",
                                "It provides no type safety when calling the function, which can be a common source of bugs.",
                                "If you are expecting the function to accept certain arguments, you should explicitly define the function shape.",
                                "Use '(...args: unknown[]) => unknown' for generic handlers or define specific function signatures.",
                            ].join("\n"),
                        },
                    },
                },
            ],
            "@typescript-eslint/no-shadow": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            "@typescript-eslint/no-unnecessary-parameter-property-assignment":
                "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "warn",
            "@typescript-eslint/no-unnecessary-template-expression": "warn",
            "@typescript-eslint/no-unnecessary-type-arguments": "warn",
            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "error", // Remove redundant type assertions
            "@typescript-eslint/no-unnecessary-type-constraint": "warn",
            "@typescript-eslint/no-unnecessary-type-conversion": "warn",
            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)
            "@typescript-eslint/no-unnecessary-type-parameters": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any
            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-declaration-merging": "warn",
            "@typescript-eslint/no-unsafe-enum-comparison": "warn",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions
            "@typescript-eslint/no-unsafe-type-assertion": "warn",
            "@typescript-eslint/no-unsafe-unary-minus": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            // Disabled: Function declarations are hoisted in JS/TS, and this rule creates unnecessary constraints
            // For Electron projects that often organize helper functions after main functions for better readability
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-useless-empty-export": "warn",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/non-nullable-type-assertion-style": "warn",
            "@typescript-eslint/only-throw-error": "warn",
            "@typescript-eslint/parameter-properties": "warn",
            "@typescript-eslint/prefer-as-const": "warn",
            "@typescript-eslint/prefer-destructuring": "warn",
            "@typescript-eslint/prefer-enum-initializers": "warn",
            "@typescript-eslint/prefer-find": "warn",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-includes": "warn",
            "@typescript-eslint/prefer-literal-enum-member": "warn",
            "@typescript-eslint/prefer-namespace-keyword": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND,
            "@typescript-eslint/prefer-promise-reject-errors": "warn",
            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            // Disabled: Too noisy for Electron projects with React/Zustand stores.
            // Readonly parameters are often impractical and TypeScript already provides strong typing.
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "@typescript-eslint/prefer-reduce-type-parameter": "warn",
            "@typescript-eslint/prefer-regexp-exec": "warn",
            "@typescript-eslint/prefer-return-this-type": "warn",
            "@typescript-eslint/prefer-string-starts-ends-with": "warn",
            // Configured: Allows non-async functions that return promises (like utility wrappers around Promise.all)
            // But encourages async for most cases. This is more flexible for Electron projects.
            "@typescript-eslint/promise-function-async": [
                "warn",
                {
                    allowAny: true,
                    allowedPromiseNames: ["Promise"],
                    checkArrowFunctions: false,
                },
            ],
            "@typescript-eslint/related-getter-setter-pairs": "warn",
            "@typescript-eslint/require-array-sort-compare": "warn",
            "@typescript-eslint/require-await": "error", // Functions marked async must use await
            "@typescript-eslint/restrict-plus-operands": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive
            "@typescript-eslint/triple-slash-reference": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/unified-signatures": "warn",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            // "write-good-comments/write-good-comments": "warn",
            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",
            // Architecture boundaries for Frontend
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            allow: [
                                "components",
                                "stores",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                                "main",
                                "styles",
                                "constants",
                            ],
                            from: "app",
                        },
                        {
                            allow: [
                                "components",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                                "stores",
                                "constants",
                            ],
                            from: "components",
                        },
                        {
                            allow: [
                                "stores",
                                "services",
                                "types",
                                "utils",
                                "constants",
                            ],
                            from: "hooks",
                        },
                        {
                            allow: [
                                "types",
                                "utils",
                                "constants",
                            ],
                            from: "services",
                        },
                        {
                            allow: [
                                "services",
                                "types",
                                "utils",
                                "stores",
                                "components",
                                "constants",
                            ],
                            from: "stores",
                        },
                        {
                            allow: [
                                "types",
                                "constants",
                            ],
                            from: "theme",
                        },
                        { allow: ["constants"], from: "types" },
                        {
                            allow: [
                                "types",
                                "constants",
                            ],
                            from: "utils",
                        },
                        {
                            allow: ["app"],
                            from: "main",
                        },
                        { allow: [], from: "styles" },
                        { allow: [], from: "constants" },
                        {
                            allow: [
                                "components",
                                "stores",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                                "main",
                                "styles",
                                "constants",
                                "app",
                            ],
                            from: "test",
                        },
                    ],
                },
            ],
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-match-exported": "off",
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules
            "canonical/filename-no-index": "off",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/prefer-import-alias": [
                "error",
                {
                    aliases: [
                        {
                            alias: "@shared/",
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
                        },
                    ],
                },
            ],
            "canonical/prefer-inline-type-import": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            // Core quality rules
            // eslint-disable-next-line perfectionist/sort-objects -- Keep Together
            camelcase: "off",
            complexity: "off",
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            "css/no-invalid-properties": "off",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": "error",
            "deprecation/deprecation": "error",
            "dot-notation": "off",
            eqeqeq: [
                "error",
                "always",
            ],
            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",
            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "etc/no-const-enum": "warn",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "warn",
            "etc/throw-error": "warn",
            "ex/no-unhandled": "warn",
            "format-sql/format": "warn",
            "func-style": "off",
            "function-name/starts-with-verb": [
                "error",
                {
                    whitelist: [
                        "success",
                        "all",
                        "supports",
                        "safe",
                        "timeout",
                        "with",
                        "cleanup",
                        "deep",
                        "handler",
                        "component",
                        "typed",
                        "persist",
                        "invalidate",
                        "bulk",
                        "evict",
                        "migrate",
                        "rows",
                        "row",
                        "settings",
                        "shutdown",
                        "configure",
                        "rollback",
                        "prune",
                        "upsert",
                        "exists",
                        "history",
                        "increment",
                    ],
                },
            ],
            "functional/functional-parameters": "off",
            "functional/immutable-data": "off",
            "functional/no-class-inheritance": "off", // Classes are common in Electron services
            "functional/no-classes": "off", // Classes are common in Electron services
            "functional/no-conditional-statement": "off",
            "functional/no-conditional-statements": "off",
            "functional/no-expression-statements": "off",
            "functional/no-let": "off",
            "functional/no-loop-statements": "off",
            "functional/no-mixed-types": "off", // Mixed types are common in Electron services
            "functional/no-return-void": "off",
            "functional/no-throw-statements": "off", // Throwing errors is common in Electron
            "functional/prefer-immutable-types": "off",
            "granular-selectors/granular-selectors": "error",
            "id-length": "off",
            // Import/Export Rules (import-x/*)
            "import-x/consistent-type-specifier-style": "off",
            "import-x/default": "warn",
            "import-x/dynamic-import-chunkname": "warn",
            "import-x/export": "warn",
            "import-x/exports-last": "off",
            "import-x/extensions": "warn",
            "import-x/first": "warn",
            "import-x/group-exports": "off",
            "import-x/max-dependencies": "off",
            "import-x/namespace": "warn",
            "import-x/newline-after-import": "warn",
            "import-x/no-absolute-path": "warn",
            "import-x/no-amd": "warn",
            "import-x/no-anonymous-default-export": "warn",
            "import-x/no-commonjs": "warn",
            "import-x/no-cycle": "warn",
            "import-x/no-default-export": "off",
            "import-x/no-deprecated": "warn",
            "import-x/no-duplicates": "warn",
            "import-x/no-dynamic-require": "warn",
            "import-x/no-empty-named-blocks": "warn",
            "import-x/no-extraneous-dependencies": "warn",
            "import-x/no-import-module-exports": "warn",
            "import-x/no-internal-modules": "off",
            "import-x/no-mutable-exports": "warn",
            "import-x/no-named-as-default": "off",
            "import-x/no-named-as-default-member": "off",
            "import-x/no-named-default": "warn",
            "import-x/no-named-export": "off",
            "import-x/no-namespace": "off",
            "import-x/no-nodejs-modules": "off", // Allow Node.js modules for Electron backend
            "import-x/no-relative-packages": "warn",
            "import-x/no-relative-parent-imports": "off",
            "import-x/no-rename-default": "warn",
            "import-x/no-restricted-paths": "warn",
            "import-x/no-self-import": "warn",
            "import-x/no-unresolved": "off",
            "import-x/no-unused-modules": "warn",
            "import-x/no-useless-path-segments": "warn",
            "import-x/no-webpack-loader-syntax": "warn",
            "import-x/order": "off", // Conflicts with other rules
            "import-x/prefer-default-export": "off",
            "import-x/prefer-namespace-import": "warn",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "error",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: false,
                    allowArrayStart: true,
                    allowBlockEnd: false,
                    allowBlockStart: true,
                    allowClassEnd: false,
                    allowClassStart: true,
                    allowObjectEnd: false,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: true,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "error",
                "always",
                {
                    exceptAfterSingleLine: false,
                },
            ],
            "loadable-imports/sort": "error",
            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",
            "max-classes-per-file": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/file-extension-in-import": "off", // Allow missing file extensions for imports
            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-process-env": "warn",
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax
            "n/prefer-global/buffer": "warn",
            "n/prefer-global/console": "warn",
            "n/prefer-global/process": "warn",
            "n/prefer-global/text-decoder": "warn",
            "n/prefer-global/text-encoder": "warn",
            "n/prefer-global/url": "warn",
            "n/prefer-global/url-search-params": "warn",
            "n/prefer-node-protocol": "warn",
            "n/prefer-promises/dns": "warn",
            "n/prefer-promises/fs": "warn",
            "neverthrow/must-use-result": "error",
            "no-console": "off",
            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-lookahead-lookbehind-regexp/no-lookahead-lookbehind-regexp":
                "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    next: "*",
                    prev: "function",
                },
                {
                    blankLine: "always",
                    next: "function",
                    prev: "*",
                },
                {
                    blankLine: "always",
                    next: "*",
                    prev: "class",
                },
                {
                    blankLine: "always",
                    next: "class",
                    prev: "*",
                },
            ],
            "perfectionist/sort-classes": "off",
            "perfectionist/sort-imports": "off", // Will handle this manually to avoid conflicts
            "perfectionist/sort-jsx-props": "off", // Allow flexible JSX prop ordering
            "perfectionist/sort-modules": [
                "off",
                {
                    customGroups: [],
                    groups: [
                        "declare-enum",
                        "declare-export-enum",
                        "enum",
                        "export-enum",
                        "declare-interface",
                        "declare-export-interface",
                        "declare-default-interface",
                        "export-declare-interface",
                        "default-interface",
                        "export-default-interface",
                        "interface",
                        "export-interface",
                        "declare-type",
                        "declare-export-type",
                        "type",
                        "export-type",
                        "declare-class",
                        "declare-export-class",
                        "declare-default-class",
                        "declare-default-decorated-class",
                        "declare-default-export-class",
                        "declare-default-export-decorated-class",
                        "export-declare-class",
                        "export-declare-decorated-class",
                        "export-default-class",
                        "export-default-decorated-class",
                        "default-class",
                        "default-decorated-class",
                        "class",
                        "export-class",
                        "decorated-class",
                        "export-decorated-class",
                        "declare-function",
                        "declare-async-function",
                        "declare-export-function",
                        "declare-export-async-function",
                        "declare-default-function",
                        "declare-default-async-function",
                        "declare-default-export-function",
                        "declare-default-export-async-function",
                        "export-declare-function",
                        "export-declare-async-function",
                        "export-default-function",
                        "export-default-async-function",
                        "default-function",
                        "default-async-function",
                        "function",
                        "async-function",
                        "export-function",
                        "export-async-function",
                    ],
                    ignoreCase: true,
                    newlinesBetween: "ignore",
                    order: "asc",
                    partitionByComment: false,
                    partitionByNewLine: false,
                    specialCharacters: "keep",
                    type: "alphabetical",
                },
            ],
            "prefer-arrow-callback": "off",
            "prefer-const": "error",
            "prefer-template": "warn",
            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "putout/align-spaces": "off",
            "putout/array-element-newline": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/function-declaration-paren-newline": "off",
            "putout/long-properties-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/newline-function-call-arguments": "off",
            "putout/object-property-newline": "error",
            "putout/objects-braces-inside-array": "error",
            "putout/single-property-destructuring": "off",
            "react-hooks-addons/no-unused-deps": "warn",
            "react/forbid-component-props": "off",
            // Disable problematic rules for Docusaurus
            "react/function-component-definition": "off", // Allow Docusaurus component patterns
            "react/jsx-filename-extension": [
                "error",
                {
                    extensions: [".tsx"],
                },
            ], // Enforce .tsx for JSX files
            "react/jsx-max-depth": "off",
            "react/jsx-no-literals": "off",
            "react/jsx-props-no-multi-spaces": "warn",
            "react/jsx-props-no-spread-multi": "warn",
            "react/jsx-props-no-spreading": "off",
            "react/jsx-sort-props": "off", // Allow flexible prop ordering in Docusaurus
            "react/no-multi-comp": "off",
            "react/prefer-read-only-props": "off", // Allow mutable props in Docusaurus components
            "react/prop-types": "off", // TypeScript provides type checking
            "react/react-in-jsx-scope": "off",
            // Security for backend
            "redos/no-vulnerable": "error",
            // RegExp
            "regexp/grapheme-string-literal": "warn",
            "regexp/hexadecimal-escape": "warn",
            "regexp/letter-case": "warn",
            "regexp/no-control-character": "warn",
            "regexp/no-octal": "warn",
            "regexp/no-standalone-backslash": "warn",
            "regexp/no-super-linear-move": "warn",
            "regexp/prefer-escape-replacement-dollar-char": "warn",
            "regexp/prefer-lookaround": "warn",
            "regexp/prefer-named-backreference": "warn",
            "regexp/prefer-named-capture-group": "warn",
            "regexp/prefer-named-replacement": "warn",
            "regexp/prefer-quantifier": "warn",
            "regexp/prefer-regexp-exec": "warn",
            "regexp/prefer-regexp-test": "warn",
            "regexp/prefer-result-array-groups": "warn",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "warn",
            "regexp/sort-alternatives": "warn",
            "regexp/sort-character-class-elements": "off",
            "regexp/unicode-escape": "warn",
            "regexp/unicode-property": "warn",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "safe-jsx/jsx-explicit-boolean": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-non-literal-require": "error",
            "security/detect-object-injection": "off",
            "sonarjs/function-return-type": "off", // Allow flexible return types in Docusaurus
            "sort-class-members/sort-class-members": [
                "warn",
                {
                    accessorPairPositioning: "together",
                    order: [
                        "[static-properties]",
                        "[properties]",
                        "[conventional-private-properties]",
                        "[arrow-function-properties]",
                        "[everything-else]",
                        "[accessor-pairs]",
                        "[getters]",
                        "[setters]",
                        "[static-methods]",
                        "[async-methods]",
                        "[methods]",
                        "[conventional-private-methods]",
                    ],
                    sortInterfaces: true,
                    stopAfterFirstProblem: false,
                },
            ],
            "sort-destructure-keys/sort-destructure-keys": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            "total-functions/require-strict-mode": "off",
            // Documentation
            "tsdoc/syntax": "warn",
            // Backend-specific unicorn rules
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true, // Service classes
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ],
            "unicorn/no-negated-condition": "warn", // Sometimes clearer
            "unicorn/no-null": "off", // Null is common in SQLite and IPC
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-spread": "off", // Prefer Array.From for readability
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/prefer-top-level-await": "off", // Not suitable for Electron main
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    vars: "all",
                    varsIgnorePattern: "^_",
                },
            ],
            "usememo-recommendations/detect-heavy-operations": "warn",
            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",
            "xss/no-location-href-assign": "error",
            "zod/prefer-enum": "error",
            "zod/require-strict": "error",
        },
        settings: {
            "import-x/resolver": {
                node: true,
                project: ["./docs/docusaurus/tsconfig.eslint.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["./docs/docusaurus/tsconfig.eslint.json"],
                },
            },
        },
    },

    // Docusaurus CSS
    {
        files: ["docs/docusaurus/**/*.css"],
        ignores: [
            "docs/docusaurus/docs/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/.docusaurus/**",
        ],
        language: "css/css",
        languageOptions: {
            tolerant: true,
        },
        plugins: {
            "@docusaurus": pluginDocusaurus,
            css: css,
            "css-modules": pluginCssModules,
            "no-hardcoded-strings": pluginNoHardcoded,
            "undefined-css-classes": pluginUndefinedCss,
        },
        rules: {
            ...css.configs.recommended.rules,
            ...pluginUndefinedCss.configs.recommended.rules,
            ...pluginCssModules.configs.recommended.rules,
            // Docusaurus Rules (@docusaurus/*)
            "@docusaurus/no-html-links": "warn",
            "@docusaurus/no-untranslated-text": "off",
            "@docusaurus/prefer-docusaurus-heading": "warn",
            // Docusaurus Rules
            "@docusaurus/string-literal-i18n-messages": "off",
            // CSS Rules (css/*)
            "css/no-empty-blocks": "error",
            "css/no-important": "off", // Allow !important in Docusaurus CSS
            "css/no-invalid-at-rules": "off",
            "css/no-invalid-properties": "off",
            "css/use-baseline": "off",
            // CSS Classes Rules (undefined-css-classes/*)
            "undefined-css-classes/no-undefined-css-classes": "warn",
            // "no-hardcoded-strings/no-hardcoded-strings": [
            //     "warn",
            //     {
            //         allowedFunctionNames: ["t", "translate", "i18n"],
            //         ignoreStrings: ["OK", "Cancel"],
            //         ignorePatterns: [/^[\s\d\-:]+$/v], // Ignore dates, times, numbers
            //     },
            // ],
        },
        settings: {},
    },

    // TypeScript frontend files (React + Zustand)
    {
        files: ["src/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}"],
        ignores: [
            "**/*.{spec,test}.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "src/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                NodeJS: "readonly",
                window: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "tsconfig.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@arthurgeron/react-usememo": pluginUseMemo2,
            "@eslint-react": eslintReact,
            "@eslint-react/dom": eslintReactDom,
            "@eslint-react/hooks-extra": eslintReactHooksExtra,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            "@eslint-react/web-api": eslintReactWeb,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            "@metamask/design-tokens": pluginDesignTokens,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "@typescript-eslint": tseslint,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- TS Error from fixupPluginRules
            deprecation: fixupPluginRules(pluginDeprecation),
            "eslint-comments": pluginComments,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "eslint-plugin-toplevel": pluginTopLevel,
            etc: fixupPluginRules(etc),
            ex: ex,
            "filename-export": pluginFilenameExport,
            "format-sql": pluginFormatSQL,
            "function-name": pluginFunctionNames,
            functional: pluginFunctional,
            "granular-selectors": pluginGranular,
            "import-x": importX,
            "import-zod": importZod,
            istanbul: istanbul,
            js: js,
            "jsx-a11y": jsxA11y,
            "jsx-plus": pluginJsxPlus,
            listeners: listeners,
            "loadable-imports": pluginLoadableImports,
            math: eslintPluginMath,
            "module-interop": moduleInterop,
            n: nodePlugin,
            // @ts-expect-error -- TS Error from fixupPluginRules
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            "react-compiler": reactCompiler,
            "react-form-fields": pluginReactFormFields,
            "react-hook-form": pluginReactHookForm,
            "react-hooks": reactHooks,
            "react-hooks-addons": reactHooksAddons,
            "react-perf": reactPerfPlugin,
            "react-prefer-function-component": preferFunctionComponent,
            "react-refresh": reactRefresh,
            "react-require-testid": pluginReactTest,
            "react-useeffect": reactUseEffect,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sort-react-dependency-arrays": pluginSortReactDependency,
            "sql-template": sqlTemplate,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "styled-components-a11y": styledA11y,
            tailwind: tailwind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "usememo-recommendations": pluginUseMemo,
            "validate-jsx-nesting": pluginValidateJSX,
            "write-good-comments": pluginWriteGood,
            xss: xss,
            zod: zod,
        },
        rules: {
            // TypeScript rules
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...reactRefresh.configs.vite.rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.react.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...css.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-typescript"].rules,
            ...arrayFunc.configs.all.rules,
            ...pluginSortClassMembers.configs["flat/recommended"].rules,
            ...eslintPluginNoUseExtendNative.configs.recommended.rules,
            ...pluginMicrosoftSdl.configs.required.rules,
            ...reactCompiler.configs.recommended.rules,
            ...listeners.configs.strict.rules,
            ...pluginNFDAR.rules,
            ...pluginJSDoc.rules,
            ...eslintPluginCommentLength.configs["flat/recommended"].rules,
            ...pluginRegexLook.configs.recommended.rules,
            ...pluginJsxPlus.configs.all.rules,
            ...moduleInterop.configs.recommended.rules,
            ...pluginTotalFunctions.configs.recommended.rules,
            ...styledA11y.flatConfigs.strict.rules,
            ...pluginReactHookForm.configs.recommended.rules,
            ...reactPerfPlugin.configs.all.rules,
            ...etc.configs.recommended.rules,
            "@arthurgeron/react-usememo/require-memo": "off",
            "@arthurgeron/react-usememo/require-usememo": "error",
            "@arthurgeron/react-usememo/require-usememo-children": "off",
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            "@eslint-react/naming-convention/use-state": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "error",
                {
                    ignore: [
                        "@shared",
                        "electron-devtools-installer",
                        "electron",
                        "@site",
                        "@theme",
                        "@docusaurus",
                    ],
                },
            ],
            "@metamask/design-tokens/color-no-hex": "error",
            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    blur: "Use 'blur-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    ring: "Use 'ring-3' instead.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    rounded: "Use 'rounded-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "shadow-sm": "Use 'shadow-xs' instead.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@typescript-eslint/adjacent-overload-signatures": "warn",
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types
            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/ban-tslint-comment": "warn",
            "@typescript-eslint/class-literal-property-style": "warn",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/consistent-generic-constructors": "warn",
            "@typescript-eslint/consistent-indexed-object-style": "warn",
            "@typescript-eslint/consistent-return": "warn",
            // Function and type safety rules
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": "warn",
            "@typescript-eslint/consistent-type-exports": "warn",
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/default-param-last": "warn",
            "@typescript-eslint/dot-notation": "warn",
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowConciseArrowFunctionExpressionsStartingWithVoid: false,
                    allowDirectConstAssertionInArrowFunctions: true,
                    allowedNames: [],
                    allowExpressions: false,
                    allowFunctionsWithoutTypeParameters: false,
                    allowHigherOrderFunctions: true,
                    allowIIFEs: false,
                    allowTypedFunctionExpressions: true,
                },
            ],
            "@typescript-eslint/explicit-member-accessibility": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "warn",
            "@typescript-eslint/init-declarations": "warn",
            "@typescript-eslint/max-params": "off",
            "@typescript-eslint/member-ordering": "off",
            "@typescript-eslint/method-signature-style": "warn",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-array-constructor": "warn",
            "@typescript-eslint/no-array-delete": "warn",
            "@typescript-eslint/no-base-to-string": "warn",
            "@typescript-eslint/no-confusing-non-null-assertion": "warn",
            "@typescript-eslint/no-confusing-void-expression": "warn",
            "@typescript-eslint/no-deprecated": "warn",
            "@typescript-eslint/no-dupe-class-members": "warn",
            "@typescript-eslint/no-duplicate-enum-values": "warn",
            "@typescript-eslint/no-duplicate-type-constituents": "warn",
            "@typescript-eslint/no-dynamic-delete": "warn",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],
            "@typescript-eslint/no-empty-object-type": "error",
            // Disable overly strict rules for this project
            "@typescript-eslint/no-explicit-any": "warn", // Sometimes needed
            "@typescript-eslint/no-extra-non-null-assertion": "warn",
            "@typescript-eslint/no-extraneous-class": "warn",
            // Advanced type-checked rules for async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                },
            ],
            "@typescript-eslint/no-for-in-array": "warn",
            "@typescript-eslint/no-implied-eval": "warn",
            // Keep enabled: Helps with bundle optimization and makes type vs runtime imports clearer.
            // Can be resolved incrementally as warnings.
            "@typescript-eslint/no-import-type-side-effects": "warn",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-invalid-this": "warn",
            "@typescript-eslint/no-invalid-void-type": "warn",
            "@typescript-eslint/no-loop-func": "warn",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-meaningless-void-operator": "warn",
            "@typescript-eslint/no-misused-new": "warn",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksSpreads: true, // Check Promise spreads
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                },
            ],
            "@typescript-eslint/no-misused-spread": "warn",
            "@typescript-eslint/no-mixed-enums": "warn",
            "@typescript-eslint/no-namespace": "warn",
            "@typescript-eslint/no-non-null-asserted-nullish-coalescing":
                "warn",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn", // Zustand patterns
            "@typescript-eslint/no-redeclare": "warn",
            "@typescript-eslint/no-redundant-type-constituents": "warn",
            "@typescript-eslint/no-require-imports": "warn",
            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)
            "@typescript-eslint/no-restricted-imports": "warn",
            "@typescript-eslint/no-restricted-types": [
                "error",
                {
                    types: {
                        Function: {
                            message: [
                                "The `Function` type accepts any function-like value.",
                                "It provides no type safety when calling the function, which can be a common source of bugs.",
                                "If you are expecting the function to accept certain arguments, you should explicitly define the function shape.",
                                "Use '(...args: unknown[]) => unknown' for generic handlers or define specific function signatures.",
                            ].join("\n"),
                        },
                    },
                },
            ],
            "@typescript-eslint/no-shadow": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            // "filename-export/match-named-export": "error",
            // "filename-export/match-default-export": "error",
            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",
            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            "@typescript-eslint/no-unnecessary-parameter-property-assignment":
                "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "warn",
            "@typescript-eslint/no-unnecessary-template-expression": "warn",
            "@typescript-eslint/no-unnecessary-type-arguments": "warn",
            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "error", // Remove redundant type assertions

            "@typescript-eslint/no-unnecessary-type-constraint": "warn",
            "@typescript-eslint/no-unnecessary-type-conversion": "warn",
            "@typescript-eslint/no-unnecessary-type-parameters": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any

            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions

            "@typescript-eslint/no-unsafe-declaration-merging": "warn",
            "@typescript-eslint/no-unsafe-enum-comparison": "warn",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions
            "@typescript-eslint/no-unsafe-type-assertion": "warn",
            "@typescript-eslint/no-unsafe-unary-minus": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            // Disabled: Function declarations are hoisted in JS/TS, and this rule creates unnecessary constraints
            // For Electron projects that often organize helper functions after main functions for better readability
            "@typescript-eslint/no-use-before-define": "warn",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-useless-empty-export": "warn",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/non-nullable-type-assertion-style": "warn",
            "@typescript-eslint/only-throw-error": "warn",
            "@typescript-eslint/parameter-properties": "warn",
            "@typescript-eslint/prefer-as-const": "warn",
            "@typescript-eslint/prefer-destructuring": "warn",
            "@typescript-eslint/prefer-enum-initializers": "warn",
            "@typescript-eslint/prefer-find": "warn",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-includes": "warn",
            "@typescript-eslint/prefer-literal-enum-member": "warn",
            "@typescript-eslint/prefer-namespace-keyword": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND
            "@typescript-eslint/prefer-promise-reject-errors": "warn",
            // "write-good-comments/write-good-comments": "warn",
            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            // Disabled: Too noisy for Electron projects with React/Zustand stores.
            // Readonly parameters are often impractical and TypeScript already provides strong typing.
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "@typescript-eslint/prefer-reduce-type-parameter": "warn",
            "@typescript-eslint/prefer-regexp-exec": "warn",
            "@typescript-eslint/prefer-return-this-type": "warn",
            "@typescript-eslint/prefer-string-starts-ends-with": "warn",
            // Configured: Allows non-async functions that return promises (like utility wrappers around Promise.all)
            // But encourages async for most cases. This is more flexible for Electron projects.
            "@typescript-eslint/promise-function-async": [
                "warn",
                {
                    allowAny: true,
                    allowedPromiseNames: ["Promise"],
                    checkArrowFunctions: false,
                },
            ],
            "@typescript-eslint/related-getter-setter-pairs": "warn",
            "@typescript-eslint/require-array-sort-compare": "warn",
            "@typescript-eslint/require-await": "error", // Functions marked async must use await

            "@typescript-eslint/restrict-plus-operands": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive

            "@typescript-eslint/triple-slash-reference": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/unified-signatures": "warn",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            // Code organization and architecture
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            allow: [
                                "components",
                                "stores",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                            ],
                            from: "app",
                        },
                        {
                            allow: [
                                "components",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                                "stores",
                            ],
                            from: "components",
                        },
                        {
                            allow: [
                                "stores",
                                "services",
                                "types",
                                "utils",
                            ],
                            from: "hooks",
                        },
                        {
                            allow: [
                                "types",
                                "utils",
                            ],
                            from: "services",
                        },
                        {
                            allow: [
                                "services",
                                "types",
                                "utils",
                                "stores",
                                "components",
                            ],
                            from: "stores",
                        },
                        {
                            allow: ["types"],
                            from: "theme",
                        },
                        { allow: [], from: "types" },
                        {
                            allow: ["types"],
                            from: "utils",
                        },
                    ],
                },
            ],
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-match-exported": "warn",
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules

            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/prefer-import-alias": [
                "error",
                {
                    aliases: [
                        {
                            alias: "@shared/",
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
                        },
                    ],
                },
            ],
            "canonical/prefer-inline-type-import": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            // Performance and compatibility
            "compat/compat": "off", // Electron supports modern APIs, Opera Mini not a target
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": "error",
            "deprecation/deprecation": "error",
            "dot-notation": "off",
            eqeqeq: [
                "error",
                "always",
            ],
            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",
            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "etc/no-const-enum": "warn",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "warn",
            // Function style preferences - disabled as too aggressive
            // "prefer-arrow/prefer-arrow-functions": [
            //     "warn",
            //     {
            //         DisallowPrototype: true,
            //         SingleReturnOnly: false,
            //         ClassPropertiesAllowed: false,
            //     },
            // ],
            "etc/throw-error": "warn",
            "ex/no-unhandled": "warn",
            "format-sql/format": "warn",
            "func-style": "off",
            "function-name/starts-with-verb": [
                "error",
                {
                    whitelist: [
                        "success",
                        "all",
                        "supports",
                        "safe",
                        "timeout",
                        "with",
                        "cleanup",
                        "deep",
                        "handler",
                        "component",
                        "typed",
                        "persist",
                        "invalidate",
                        "bulk",
                        "evict",
                        "migrate",
                        "rows",
                        "row",
                        "settings",
                        "shutdown",
                        "configure",
                        "rollback",
                        "prune",
                        "upsert",
                        "exists",
                        "history",
                        "increment",
                    ],
                },
            ],
            "functional/immutable-data": "off",
            "functional/no-let": "off", // Let is necessary in many React patterns

            "granular-selectors/granular-selectors": "error",
            "id-length": "off",
            // CSS
            "import-x/no-extraneous-dependencies": "warn",
            "import-x/no-import-module-exports": "warn",
            "import-x/no-internal-modules": "off",
            "import-x/no-mutable-exports": "warn",
            "import-x/no-named-as-default": "warn",
            "import-x/no-named-as-default-member": "off",
            "import-x/no-named-default": "warn",
            "import-x/no-named-export": "off",
            "import-x/no-namespace": "off",
            "import-x/no-nodejs-modules": "error", // Dont allow on frontend or shared
            "import-x/no-relative-packages": "warn",
            "import-x/no-relative-parent-imports": "off",
            "import-x/no-rename-default": "warn",
            "import-x/no-restricted-paths": "warn",
            "import-x/no-self-import": "warn",
            // Import rules
            "import-x/no-unassigned-import": [
                "error",
                {
                    allow: [
                        "**/*.css",
                        "**/*.scss",
                    ], // Allow CSS imports without assignment
                },
            ],
            "import-x/no-unresolved": "warn",
            "import-x/no-unused-modules": "warn",
            "import-x/no-useless-path-segments": "warn",
            "import-x/no-webpack-loader-syntax": "warn",
            "import-x/order": "off", // Conflicts with other rules
            "import-x/prefer-default-export": "off",
            "import-x/prefer-namespace-import": "warn",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility
            "jsx-a11y/alt-text": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/no-autofocus": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "error",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: false,
                    allowArrayStart: true,
                    allowBlockEnd: false,
                    allowBlockStart: true,
                    allowClassEnd: false,
                    allowClassStart: true,
                    allowObjectEnd: false,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: true,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "error",
                "always",
                {
                    exceptAfterSingleLine: false,
                },
            ],
            "loadable-imports/sort": "error",
            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",
            "max-classes-per-file": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/file-extension-in-import": "off", // Allow missing file extensions for imports
            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-process-env": "warn",
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax
            "n/prefer-global/buffer": "warn",
            "n/prefer-global/console": "warn",
            "n/prefer-global/process": "warn",
            "n/prefer-global/text-decoder": "warn",
            "n/prefer-global/text-encoder": "warn",
            "n/prefer-global/url": "warn",
            "n/prefer-global/url-search-params": "warn",
            "n/prefer-node-protocol": "warn",
            "n/prefer-promises/dns": "warn",
            "n/prefer-promises/fs": "warn",
            "neverthrow/must-use-result": "error",
            "no-console": "off",
            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    next: "*",
                    prev: "function",
                },
                {
                    blankLine: "always",
                    next: "function",
                    prev: "*",
                },
                {
                    blankLine: "always",
                    next: "*",
                    prev: "class",
                },
                {
                    blankLine: "always",
                    next: "class",
                    prev: "*",
                },
            ],
            "perfectionist/sort-classes": "off",
            "perfectionist/sort-modules": [
                "off",
                {
                    customGroups: [],
                    groups: [
                        "declare-enum",
                        "declare-export-enum",
                        "enum",
                        "export-enum",
                        "declare-interface",
                        "declare-export-interface",
                        "declare-default-interface",
                        "export-declare-interface",
                        "default-interface",
                        "export-default-interface",
                        "interface",
                        "export-interface",
                        "declare-type",
                        "declare-export-type",
                        "type",
                        "export-type",
                        "declare-class",
                        "declare-export-class",
                        "declare-default-class",
                        "declare-default-decorated-class",
                        "declare-default-export-class",
                        "declare-default-export-decorated-class",
                        "export-declare-class",
                        "export-declare-decorated-class",
                        "export-default-class",
                        "export-default-decorated-class",
                        "default-class",
                        "default-decorated-class",
                        "class",
                        "export-class",
                        "decorated-class",
                        "export-decorated-class",
                        "declare-function",
                        "declare-async-function",
                        "declare-export-function",
                        "declare-export-async-function",
                        "declare-default-function",
                        "declare-default-async-function",
                        "declare-default-export-function",
                        "declare-default-export-async-function",
                        "export-declare-function",
                        "export-declare-async-function",
                        "export-default-function",
                        "export-default-async-function",
                        "default-function",
                        "default-async-function",
                        "function",
                        "async-function",
                        "export-function",
                        "export-async-function",
                    ],
                    ignoreCase: true,
                    newlinesBetween: "ignore",
                    order: "asc",
                    partitionByComment: false,
                    partitionByNewLine: false,
                    specialCharacters: "keep",
                    type: "alphabetical",
                },
            ],
            "prefer-arrow-callback": "off",
            "prefer-const": "error",
            "prefer-template": "warn",
            // Code style
            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "putout/align-spaces": "off",
            "putout/array-element-newline": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/function-declaration-paren-newline": "off",
            "putout/long-properties-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/newline-function-call-arguments": "off",
            "putout/object-property-newline": "error",
            "putout/objects-braces-inside-array": "off",
            "putout/single-property-destructuring": "off",
            "react-form-fields/no-mix-controlled-with-uncontrolled": "error",
            "react-form-fields/no-only-value-prop": "error",
            "react-form-fields/styled-no-mix-controlled-with-uncontrolled":
                "error",
            "react-form-fields/styled-no-only-value-prop": "error",
            "react-hook-form/no-use-watch": "error",
            "react-hooks-addons/no-unused-deps": "warn",
            // React Hooks
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/rules-of-hooks": "error",
            "react-prefer-function-component/react-prefer-function-component": [
                "error",
                { allowComponentDidCatch: false },
            ],
            "react-require-testid/testid-missing": [
                "warn",
                {
                    disableDefaultComponents: [
                        "a",
                        "abbr",
                        "address",
                        "area",
                        "article",
                        "aside",
                        "audio",
                        "b",
                        "base",
                        "bdi",
                        "bdo",
                        "blockquote",
                        "body",
                        "br",
                        "button",
                        "canvas",
                        "caption",
                        "cite",
                        "code",
                        "col",
                        "colgroup",
                        "data",
                        "datalist",
                        "dd",
                        "del",
                        "details",
                        "dfn",
                        "dialog",
                        "div",
                        "dl",
                        "dt",
                        "em",
                        "embed",
                        "fieldset",
                        "figcaption",
                        "figure",
                        "footer",
                        "form",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "head",
                        "header",
                        "hr",
                        "html",
                        "i",
                        "iframe",
                        "img",
                        "input",
                        "ins",
                        "kbd",
                        "label",
                        "legend",
                        "li",
                        "link",
                        "main",
                        "map",
                        "mark",
                        "meta",
                        "meter",
                        "nav",
                        "noscript",
                        "object",
                        "ol",
                        "optgroup",
                        "option",
                        "output",
                        "p",
                        "param",
                        "picture",
                        "pre",
                        "progress",
                        "q",
                        "rp",
                        "rt",
                        "ruby",
                        "s",
                        "samp",
                        "script",
                        "section",
                        "select",
                        "small",
                        "source",
                        "span",
                        "strong",
                        "style",
                        "sub",
                        "summary",
                        "sup",
                        "table",
                        "tbody",
                        "td",
                        "template",
                        "textarea",
                        "tfoot",
                        "th",
                        "thead",
                        "time",
                        "title",
                        "tr",
                        "track",
                        "u",
                        "ul",
                        "var",
                        "video",
                        "wbr",
                    ],
                    enableComponents: [],
                },
            ],
            "react-useeffect/no-non-function-return": "error",
            // React
            "react/boolean-prop-naming": "warn",
            "react/button-has-type": "warn",
            "react/checked-requires-onchange-or-readonly": "warn",
            "react/default-props-match-prop-types": "warn",
            "react/destructuring-assignment": "warn",
            "react/forbid-component-props": "off",
            "react/forbid-dom-props": "warn",
            "react/forbid-elements": "warn",
            "react/forbid-foreign-prop-types": "warn",
            "react/forbid-prop-types": "warn",
            "react/forward-ref-uses-ref": "warn",
            "react/function-component-definition": [
                "error",
                {
                    namedComponents: "arrow-function",
                    unnamedComponents: "arrow-function",
                },
            ], // Enforce consistent arrow function components
            "react/hook-use-state": "warn",
            "react/iframe-missing-sandbox": "warn",
            // React 19 optimized rules
            "react/jsx-boolean-value": "warn",
            "react/jsx-child-element-spacing": "warn",
            "react/jsx-closing-bracket-location": "warn",
            "react/jsx-closing-tag-location": "warn",
            "react/jsx-curly-brace-presence": "warn",
            "react/jsx-curly-newline": "off",
            "react/jsx-curly-spacing": "off",
            "react/jsx-equals-spacing": "off",
            "react/jsx-filename-extension": [
                "error",
                {
                    extensions: [".tsx"],
                },
            ], // Enforce .tsx for JSX files
            "react/jsx-first-prop-new-line": "off",
            "react/jsx-fragments": [
                "warn",
                "syntax",
            ],
            "react/jsx-handler-names": "warn", // Enforce consistent handler names
            "react/jsx-indent": "off",
            "react/jsx-indent-props": "off",
            "react/jsx-key": "error",
            "react/jsx-max-depth": [
                "warn",
                { max: 7 },
            ], // Warn on deeply nested JSX to encourage component extraction
            "react/jsx-max-props-per-line": "off",
            "react/jsx-newline": "off",
            "react/jsx-no-bind": "warn", // Allow inline functions for development speed
            "react/jsx-no-constructed-context-values": "warn",
            "react/jsx-no-leaked-render": "warn",
            "react/jsx-no-literals": "off",
            "react/jsx-no-script-url": "warn",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-one-expression-per-line": "warn",
            "react/jsx-pascal-case": "warn",
            "react/jsx-props-no-multi-spaces": "warn",
            "react/jsx-props-no-spread-multi": "warn",
            "react/jsx-props-no-spreading": "off",
            "react/jsx-sort-props": "warn",
            "react/jsx-tag-spacing": "warn",
            "react/jsx-uses-react": "warn",
            "react/jsx-wrap-multilines": "warn",
            "react/no-access-state-in-setstate": "warn",
            "react/no-adjacent-inline-elements": "warn",
            "react/no-array-index-key": "warn",
            "react/no-arrow-function-lifecycle": "warn",
            "react/no-danger": "warn",
            "react/no-did-mount-set-state": "warn",
            "react/no-did-update-set-state": "warn",
            "react/no-invalid-html-attribute": "warn",
            "react/no-multi-comp": "warn",
            "react/no-namespace": "warn",
            "react/no-object-type-as-default-prop": "warn",
            "react/no-redundant-should-component-update": "warn",
            "react/no-set-state": "warn",
            "react/no-this-in-sfc": "warn",
            "react/no-typos": "warn",
            "react/no-unstable-nested-components": "error",
            "react/no-unused-class-component-methods": "warn",
            "react/no-unused-prop-types": "warn",
            "react/no-unused-state": "warn",
            "react/no-will-update-set-state": "warn",
            "react/prefer-es6-class": "warn",
            "react/prefer-exact-props": "warn",
            "react/prefer-read-only-props": "warn",
            "react/prefer-stateless-function": "warn",
            "react/prop-types": "warn",
            "react/react-in-jsx-scope": "off",
            "react/require-default-props": "off",
            "react/require-optimization": "warn",
            "react/self-closing-comp": "warn",
            "react/sort-comp": "warn",
            "react/sort-default-props": "warn",
            "react/sort-prop-types": "warn",
            "react/state-in-constructor": "warn",
            "react/static-property-placement": "warn",
            "react/style-prop-object": "warn",
            "react/void-dom-elements-no-children": "warn",
            // Security for Frontend
            "redos/no-vulnerable": "error",
            // RegExp
            "regexp/grapheme-string-literal": "warn",
            "regexp/hexadecimal-escape": "warn",
            "regexp/letter-case": "warn",
            "regexp/no-control-character": "warn",
            "regexp/no-octal": "warn",
            // RegExp rules for security and performance
            "regexp/no-potentially-useless-backreference": "warn",
            "regexp/no-standalone-backslash": "warn",
            "regexp/no-super-linear-backtracking": "error",
            "regexp/no-super-linear-move": "warn",
            "regexp/no-unused-capturing-group": "warn",
            "regexp/no-useless-escape": "warn",
            "regexp/no-useless-quantifier": "warn",
            "regexp/optimal-quantifier-concatenation": "warn",
            "regexp/prefer-character-class": "warn",
            "regexp/prefer-escape-replacement-dollar-char": "warn",
            "regexp/prefer-lookaround": "warn",
            "regexp/prefer-named-backreference": "warn",
            "regexp/prefer-named-capture-group": "warn",
            "regexp/prefer-named-replacement": "warn",
            // // Tailwind CSS
            // "tailwind/classnames-order": "warn",
            // "tailwind/enforces-negative-arbitrary-values": "warn",
            // "tailwind/enforces-shorthand": "warn",
            // "tailwind/migration-from-tailwind-2": "warn",
            // "tailwind/no-arbitrary-value": "warn",
            // "tailwind/no-contradicting-classname": "warn",
            // "tailwind/no-custom-classname": "off",
            // "tailwind/no-unnecessary-arbitrary-value": "warn",
            "regexp/prefer-plus-quantifier": "warn",
            "regexp/prefer-quantifier": "warn",
            "regexp/prefer-regexp-exec": "warn",
            "regexp/prefer-regexp-test": "warn",
            "regexp/prefer-result-array-groups": "warn",
            "regexp/prefer-star-quantifier": "warn",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "warn",
            "regexp/sort-alternatives": "warn",
            "regexp/sort-character-class-elements": "warn",
            "regexp/unicode-escape": "warn",
            "regexp/unicode-property": "warn",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "safe-jsx/jsx-explicit-boolean": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-non-literal-require": "error",
            "security/detect-object-injection": "off",
            "sort-class-members/sort-class-members": [
                "warn",
                {
                    accessorPairPositioning: "together",
                    order: [
                        "[static-properties]",
                        "[properties]",
                        "[conventional-private-properties]",
                        "[arrow-function-properties]",
                        "[everything-else]",
                        "[accessor-pairs]",
                        "[getters]",
                        "[setters]",
                        "[static-methods]",
                        "[async-methods]",
                        "[methods]",
                        "[conventional-private-methods]",
                    ],
                    sortInterfaces: true,
                    stopAfterFirstProblem: false,
                },
            ],
            "sort-destructure-keys/sort-destructure-keys": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "sort-react-dependency-arrays/sort": "error",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            // Documentation
            "tsdoc/syntax": "warn",
            // Optimized Unicorn rules (reduced false positives)
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        kebabCase: true,
                        pascalCase: true,
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-negated-condition": "warn", // Sometimes clearer
            "unicorn/no-null": "off", // React commonly uses null for conditional rendering
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS needed for Electron
            "unicorn/prefer-node-protocol": "warn",
            "unicorn/prefer-spread": "off",
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/prefer-top-level-await": "off", // Not suitable for React
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    vars: "all",
                    varsIgnorePattern: "^_",
                },
            ],
            "usememo-recommendations/detect-heavy-operations": "warn",
            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",
            "xss/no-location-href-assign": "error",
            "zod/prefer-enum": "error",
            "zod/require-strict": "error",
        },
        settings: {
            "boundaries/elements": [
                { capture: ["app"], pattern: "src/App.tsx", type: "app" },
                { capture: ["main"], pattern: "src/main.tsx", type: "main" },
                {
                    capture: ["styles"],
                    pattern: "src/index.css",
                    type: "styles",
                },
                {
                    capture: ["constants"],
                    pattern: "src/constants.ts",
                    type: "constants",
                },
                {
                    capture: ["component"],
                    pattern: "src/components/**/*",
                    type: "components",
                },
                {
                    capture: ["store"],
                    pattern: "src/stores/**/*",
                    type: "stores",
                },
                { capture: ["hook"], pattern: "src/hooks/**/*", type: "hooks" },
                {
                    capture: ["service"],
                    pattern: "src/services/**/*",
                    type: "services",
                },
                {
                    capture: ["theme"],
                    pattern: "src/theme/**/*",
                    type: "theme",
                },
                { capture: ["util"], pattern: "src/utils/**/*", type: "utils" },
                { capture: ["type"], pattern: "src/types/**/*", type: "types" },
                { capture: ["type"], pattern: "src/types.ts", type: "types" },
                { capture: ["test"], pattern: "src/test/**/*", type: "test" },
            ],
            "import-x/resolver": {
                node: true,
                project: ["tsconfig.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
            tailwind: {
                config: "./tailwind.config.mjs",
            },
        },
    },

    // Electron backend files
    {
        files: ["electron/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}"],
        ignores: [
            "electron/**/*.{spec,test}.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "electron/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "shared/**/*.{spec,test}.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "shared/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                Buffer: "readonly",
                global: "readonly",
                module: "readonly",
                NodeJS: "readonly",
                process: "readonly",
                require: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "tsconfig.electron.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@eslint-react": eslintReact,
            "@eslint-react/dom": eslintReactDom,
            "@eslint-react/hooks-extra": eslintReactHooksExtra,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            "@eslint-react/web-api": eslintReactWeb,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            "@metamask/design-tokens": pluginDesignTokens,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "@typescript-eslint": tseslint,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- TS Error from fixupPluginRules
            deprecation: fixupPluginRules(pluginDeprecation),
            "eslint-comments": pluginComments,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "eslint-plugin-toplevel": pluginTopLevel,
            etc: fixupPluginRules(etc),
            ex: ex,
            "format-sql": pluginFormatSQL,
            "function-name": pluginFunctionNames,
            functional: pluginFunctional,
            "granular-selectors": pluginGranular,
            "import-x": importX,
            "import-zod": importZod,
            istanbul: istanbul,
            js: js,
            "jsx-a11y": jsxA11y,
            "jsx-plus": pluginJsxPlus,
            listeners: listeners,
            "loadable-imports": pluginLoadableImports,
            math: eslintPluginMath,
            "module-interop": moduleInterop,
            n: nodePlugin,
            // @ts-expect-error -- TS Error from fixupPluginRules
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            "react-hooks": reactHooks,
            "react-hooks-addons": reactHooksAddons,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sql-template": sqlTemplate,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "styled-components-a11y": styledA11y,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "usememo-recommendations": pluginUseMemo,
            "validate-jsx-nesting": pluginValidateJSX,
            "write-good-comments": pluginWriteGood,
            xss: xss,
            zod: zod,
        },
        rules: {
            // TypeScript Backend (Electron) Rules
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.react.rules,
            ...importX.flatConfigs.typescript.rules,
            ...importX.flatConfigs.electron.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...css.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-typescript"].rules,
            ...arrayFunc.configs.all.rules,
            ...pluginSortClassMembers.configs["flat/recommended"].rules,
            ...eslintPluginNoUseExtendNative.configs.recommended.rules,
            ...pluginMicrosoftSdl.configs.required.rules,
            ...listeners.configs.strict.rules,
            ...pluginNFDAR.rules,
            ...pluginJSDoc.rules,
            ...eslintPluginCommentLength.configs["flat/recommended"].rules,
            ...pluginRegexLook.configs.recommended.rules,
            ...pluginJsxPlus.configs.all.rules,
            ...moduleInterop.configs.recommended.rules,
            ...pluginTotalFunctions.configs.recommended.rules,
            ...styledA11y.flatConfigs.strict.rules,
            ...etc.configs.recommended.rules,
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            "@eslint-react/naming-convention/use-state": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "error",
                {
                    ignore: [
                        "@shared",
                        "electron-devtools-installer",
                        "electron",
                        "@site",
                        "@theme",
                        "@docusaurus",
                    ],
                },
            ],
            "@metamask/design-tokens/color-no-hex": "error",
            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    blur: "Use 'blur-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    ring: "Use 'ring-3' instead.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    rounded: "Use 'rounded-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "shadow-sm": "Use 'shadow-xs' instead.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@typescript-eslint/adjacent-overload-signatures": "warn",
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types
            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/ban-tslint-comment": "warn",
            "@typescript-eslint/class-literal-property-style": "warn",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/consistent-generic-constructors": "warn",
            "@typescript-eslint/consistent-indexed-object-style": "warn",
            "@typescript-eslint/consistent-return": "warn",
            // Function and type safety rules (same as frontend)
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": "warn",
            "@typescript-eslint/consistent-type-exports": "warn",
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/default-param-last": "warn",
            "@typescript-eslint/dot-notation": "warn",
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowConciseArrowFunctionExpressionsStartingWithVoid: false,
                    allowDirectConstAssertionInArrowFunctions: true,
                    allowedNames: [],
                    allowExpressions: false,
                    allowFunctionsWithoutTypeParameters: false,
                    allowHigherOrderFunctions: true,
                    allowIIFEs: false,
                    allowTypedFunctionExpressions: true,
                },
            ],
            "@typescript-eslint/explicit-member-accessibility": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "warn",
            "@typescript-eslint/init-declarations": "warn",
            "@typescript-eslint/max-params": "off",
            "@typescript-eslint/member-ordering": "off",
            "@typescript-eslint/method-signature-style": "warn",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-array-constructor": "warn",
            "@typescript-eslint/no-array-delete": "warn",
            "@typescript-eslint/no-base-to-string": "warn",
            "@typescript-eslint/no-confusing-non-null-assertion": "warn",
            "@typescript-eslint/no-confusing-void-expression": "warn",
            "@typescript-eslint/no-deprecated": "warn",
            "@typescript-eslint/no-dupe-class-members": "warn",
            "@typescript-eslint/no-duplicate-enum-values": "warn",
            "@typescript-eslint/no-duplicate-type-constituents": "warn",
            "@typescript-eslint/no-dynamic-delete": "warn",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],
            "@typescript-eslint/no-empty-object-type": "error",
            // Allow more flexibility for backend patterns
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-extra-non-null-assertion": "warn",
            "@typescript-eslint/no-extraneous-class": "warn",
            // Advanced type-checked rules for backend async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues in Node.js
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                },
            ],
            "@typescript-eslint/no-for-in-array": "warn",
            "@typescript-eslint/no-implied-eval": "warn",
            // Keep enabled: Helps with bundle optimization and makes type vs runtime imports clearer.
            // Can be resolved incrementally as warnings.
            "@typescript-eslint/no-import-type-side-effects": "warn",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components

            "@typescript-eslint/no-invalid-this": "warn",
            "@typescript-eslint/no-invalid-void-type": "warn",
            "@typescript-eslint/no-loop-func": "warn",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-meaningless-void-operator": "warn",
            "@typescript-eslint/no-misused-new": "warn",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksSpreads: true, // Check Promise spreads
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                },
            ],
            "@typescript-eslint/no-misused-spread": "warn",
            "@typescript-eslint/no-mixed-enums": "warn",
            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)
            "@typescript-eslint/no-namespace": "warn",
            "@typescript-eslint/no-non-null-asserted-nullish-coalescing":
                "warn",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
            "@typescript-eslint/no-redeclare": "warn",
            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",
            "@typescript-eslint/no-redundant-type-constituents": "warn",
            "@typescript-eslint/no-require-imports": "warn",
            "@typescript-eslint/no-restricted-imports": "warn",
            "@typescript-eslint/no-restricted-types": [
                "error",
                {
                    types: {
                        Function: {
                            message: [
                                "The `Function` type accepts any function-like value.",
                                "It provides no type safety when calling the function, which can be a common source of bugs.",
                                "If you are expecting the function to accept certain arguments, you should explicitly define the function shape.",
                                "Use '(...args: unknown[]) => unknown' for generic handlers or define specific function signatures.",
                            ].join("\n"),
                        },
                    },
                },
            ],
            "@typescript-eslint/no-shadow": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            "@typescript-eslint/no-unnecessary-parameter-property-assignment":
                "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "warn",
            "@typescript-eslint/no-unnecessary-template-expression": "warn",
            "@typescript-eslint/no-unnecessary-type-arguments": "warn",
            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "error", // Remove redundant type assertions
            "@typescript-eslint/no-unnecessary-type-constraint": "warn",
            "@typescript-eslint/no-unnecessary-type-conversion": "warn",
            "@typescript-eslint/no-unnecessary-type-parameters": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters

            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any

            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-declaration-merging": "warn",
            "@typescript-eslint/no-unsafe-enum-comparison": "warn",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions
            "@typescript-eslint/no-unsafe-type-assertion": "warn",
            "@typescript-eslint/no-unsafe-unary-minus": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            // Disabled: Function declarations are hoisted in JS/TS, and this rule creates unnecessary constraints
            // For Electron projects that often organize helper functions after main functions for better readability
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-useless-empty-export": "warn",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/non-nullable-type-assertion-style": "warn",
            "@typescript-eslint/only-throw-error": "warn",
            "@typescript-eslint/parameter-properties": "warn",
            "@typescript-eslint/prefer-as-const": "warn",
            "@typescript-eslint/prefer-destructuring": "warn",
            "@typescript-eslint/prefer-enum-initializers": "warn",
            "@typescript-eslint/prefer-find": "warn",
            // "write-good-comments/write-good-comments": "warn",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-includes": "warn",
            "@typescript-eslint/prefer-literal-enum-member": "warn",
            "@typescript-eslint/prefer-namespace-keyword": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND,
            "@typescript-eslint/prefer-promise-reject-errors": "warn",
            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            // Disabled: Too noisy for Electron projects with React/Zustand stores.
            // Readonly parameters are often impractical and TypeScript already provides strong typing.
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "@typescript-eslint/prefer-reduce-type-parameter": "warn",
            "@typescript-eslint/prefer-regexp-exec": "warn",
            "@typescript-eslint/prefer-return-this-type": "warn",
            "@typescript-eslint/prefer-string-starts-ends-with": "warn",
            // Configured: Allows non-async functions that return promises (like utility wrappers around Promise.all)
            // But encourages async for most cases. This is more flexible for Electron projects.
            "@typescript-eslint/promise-function-async": [
                "warn",
                {
                    allowAny: true,
                    allowedPromiseNames: ["Promise"],
                    checkArrowFunctions: false,
                },
            ],
            "@typescript-eslint/related-getter-setter-pairs": "warn",
            "@typescript-eslint/require-array-sort-compare": "warn",
            "@typescript-eslint/require-await": "error", // Functions marked async must use await
            "@typescript-eslint/restrict-plus-operands": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive
            "@typescript-eslint/triple-slash-reference": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/unified-signatures": "warn",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            // Architecture boundaries for Electron
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            allow: ["types"],
                            from: "events",
                        },
                        {
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                            from: "main",
                        },
                        {
                            allow: [
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                            from: "managers",
                        },
                        {
                            allow: [
                                "utils",
                                "types",
                            ],
                            from: "preload",
                        },
                        {
                            allow: [
                                "services",
                                "utils",
                                "types",
                            ],
                            from: "services",
                        },
                        { allow: [], from: "types" },
                        {
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                            from: "utils",
                        },
                        {
                            allow: ["types"],
                            from: "utils",
                        },
                    ],
                },
            ],
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-match-exported": "warn",
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules
            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/prefer-import-alias": [
                "error",
                {
                    aliases: [
                        {
                            alias: "@shared/",
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
                        },
                    ],
                },
            ],
            "canonical/prefer-inline-type-import": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            // Node.js specific
            complexity: "off",
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": "error",
            "deprecation/deprecation": "error",
            "dot-notation": "off",
            eqeqeq: [
                "error",
                "always",
            ],
            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",
            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "etc/no-const-enum": "warn",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "warn",
            "etc/throw-error": "warn",
            "ex/no-unhandled": "warn",
            "format-sql/format": "warn",
            "func-style": "off",
            "function-name/starts-with-verb": [
                "error",
                {
                    whitelist: [
                        "success",
                        "all",
                        "supports",
                        "safe",
                        "timeout",
                        "with",
                        "cleanup",
                        "deep",
                        "handler",
                        "component",
                        "typed",
                        "persist",
                        "invalidate",
                        "bulk",
                        "evict",
                        "migrate",
                        "rows",
                        "row",
                        "settings",
                        "shutdown",
                        "configure",
                        "rollback",
                        "prune",
                        "upsert",
                        "exists",
                        "history",
                        "increment",
                    ],
                },
            ],
            "functional/functional-parameters": "off",
            "functional/immutable-data": "off",
            "functional/no-class-inheritance": "off", // Classes are common in Electron services
            "functional/no-classes": "off", // Classes are common in Electron services
            "functional/no-conditional-statement": "off",
            "functional/no-conditional-statements": "off",
            "functional/no-expression-statements": "off",
            "functional/no-let": "off",
            "functional/no-loop-statements": "off",
            "functional/no-mixed-types": "off", // Mixed types are common in Electron services
            "functional/no-return-void": "off",
            "functional/no-throw-statements": "off", // Throwing errors is common in Electron
            "functional/prefer-immutable-types": "off",
            "granular-selectors/granular-selectors": "error",
            "id-length": "off",
            // Import Rules
            "import-x/consistent-type-specifier-style": "off",
            "import-x/default": "warn",
            "import-x/dynamic-import-chunkname": "warn",
            "import-x/export": "warn",
            "import-x/exports-last": "off",
            "import-x/extensions": "warn",
            "import-x/first": "warn",
            "import-x/group-exports": "off",
            "import-x/max-dependencies": "off",
            "import-x/namespace": "warn",
            "import-x/newline-after-import": "warn",
            "import-x/no-absolute-path": "warn",
            "import-x/no-amd": "warn",
            "import-x/no-anonymous-default-export": "warn",
            "import-x/no-commonjs": "warn",
            "import-x/no-cycle": "warn",
            "import-x/no-default-export": "off",
            "import-x/no-deprecated": "warn",
            "import-x/no-duplicates": "warn",
            "import-x/no-dynamic-require": "warn",
            "import-x/no-empty-named-blocks": "warn",
            "import-x/no-extraneous-dependencies": "warn",
            "import-x/no-import-module-exports": "warn",
            "import-x/no-internal-modules": "off",
            "import-x/no-mutable-exports": "warn",
            "import-x/no-named-as-default": "warn",
            "import-x/no-named-as-default-member": "off",
            "import-x/no-named-default": "warn",
            "import-x/no-named-export": "off",
            "import-x/no-namespace": "off",
            "import-x/no-nodejs-modules": "off", // Allow Node.js modules for Electron backend
            "import-x/no-relative-packages": "warn",
            "import-x/no-relative-parent-imports": "off",
            "import-x/no-rename-default": "warn",
            "import-x/no-restricted-paths": "warn",
            "import-x/no-self-import": "warn",
            "import-x/no-unresolved": "warn",
            "import-x/no-unused-modules": "warn",
            "import-x/no-useless-path-segments": "warn",
            "import-x/no-webpack-loader-syntax": "warn",
            "import-x/order": "off", // Conflicts with other rules
            "import-x/prefer-default-export": "off",
            "import-x/prefer-namespace-import": "warn",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "error",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: false,
                    allowArrayStart: true,
                    allowBlockEnd: false,
                    allowBlockStart: true,
                    allowClassEnd: false,
                    allowClassStart: true,
                    allowObjectEnd: false,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: true,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "error",
                "always",
                {
                    exceptAfterSingleLine: false,
                },
            ],
            "loadable-imports/sort": "error",
            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",
            "max-classes-per-file": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/file-extension-in-import": "off", // Allow missing file extensions for imports

            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-process-env": "warn",
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax
            "n/prefer-global/buffer": "warn",
            "n/prefer-global/console": "warn",
            "n/prefer-global/process": "warn",
            "n/prefer-global/text-decoder": "warn",
            "n/prefer-global/text-encoder": "warn",
            "n/prefer-global/url": "warn",
            "n/prefer-global/url-search-params": "warn",
            "n/prefer-node-protocol": "warn",
            "n/prefer-promises/dns": "warn",
            "n/prefer-promises/fs": "warn",
            "neverthrow/must-use-result": "error",
            "no-console": "off",
            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    next: "*",
                    prev: "function",
                },
                {
                    blankLine: "always",
                    next: "function",
                    prev: "*",
                },
                {
                    blankLine: "always",
                    next: "*",
                    prev: "class",
                },
                {
                    blankLine: "always",
                    next: "class",
                    prev: "*",
                },
            ],
            "perfectionist/sort-classes": "off",
            "perfectionist/sort-modules": [
                "off",
                {
                    customGroups: [],
                    groups: [
                        "declare-enum",
                        "declare-export-enum",
                        "enum",
                        "export-enum",
                        "declare-interface",
                        "declare-export-interface",
                        "declare-default-interface",
                        "export-declare-interface",
                        "default-interface",
                        "export-default-interface",
                        "interface",
                        "export-interface",
                        "declare-type",
                        "declare-export-type",
                        "type",
                        "export-type",
                        "declare-class",
                        "declare-export-class",
                        "declare-default-class",
                        "declare-default-decorated-class",
                        "declare-default-export-class",
                        "declare-default-export-decorated-class",
                        "export-declare-class",
                        "export-declare-decorated-class",
                        "export-default-class",
                        "export-default-decorated-class",
                        "default-class",
                        "default-decorated-class",
                        "class",
                        "export-class",
                        "decorated-class",
                        "export-decorated-class",
                        "declare-function",
                        "declare-async-function",
                        "declare-export-function",
                        "declare-export-async-function",
                        "declare-default-function",
                        "declare-default-async-function",
                        "declare-default-export-function",
                        "declare-default-export-async-function",
                        "export-declare-function",
                        "export-declare-async-function",
                        "export-default-function",
                        "export-default-async-function",
                        "default-function",
                        "default-async-function",
                        "function",
                        "async-function",
                        "export-function",
                        "export-async-function",
                    ],
                    ignoreCase: true,
                    newlinesBetween: "ignore",
                    order: "asc",
                    partitionByComment: false,
                    partitionByNewLine: false,
                    specialCharacters: "keep",
                    type: "alphabetical",
                },
            ],
            "prefer-arrow-callback": "off",
            "prefer-const": "error",
            "prefer-template": "warn",
            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "putout/align-spaces": "off",
            "putout/array-element-newline": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/function-declaration-paren-newline": "off",
            "putout/long-properties-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/newline-function-call-arguments": "off",
            "putout/object-property-newline": "error",
            "putout/objects-braces-inside-array": "error",
            "putout/single-property-destructuring": "off",
            "react-hooks-addons/no-unused-deps": "warn",
            // Security for backend
            "redos/no-vulnerable": "error",
            // RegExp
            "regexp/grapheme-string-literal": "warn",
            "regexp/hexadecimal-escape": "warn",
            "regexp/letter-case": "warn",
            "regexp/no-control-character": "warn",
            "regexp/no-octal": "warn",
            "regexp/no-standalone-backslash": "warn",
            "regexp/no-super-linear-move": "warn",
            "regexp/prefer-escape-replacement-dollar-char": "warn",
            "regexp/prefer-lookaround": "warn",
            "regexp/prefer-named-backreference": "warn",
            "regexp/prefer-named-capture-group": "warn",
            "regexp/prefer-named-replacement": "warn",
            "regexp/prefer-quantifier": "warn",
            "regexp/prefer-regexp-exec": "warn",
            "regexp/prefer-regexp-test": "warn",
            "regexp/prefer-result-array-groups": "warn",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "warn",
            "regexp/sort-alternatives": "warn",
            "regexp/sort-character-class-elements": "off",
            "regexp/unicode-escape": "warn",
            "regexp/unicode-property": "warn",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "safe-jsx/jsx-explicit-boolean": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-non-literal-require": "error",
            "security/detect-object-injection": "off",
            "sort-class-members/sort-class-members": [
                "warn",
                {
                    accessorPairPositioning: "together",
                    order: [
                        "[static-properties]",
                        "[properties]",
                        "[conventional-private-properties]",
                        "[arrow-function-properties]",
                        "[everything-else]",
                        "[accessor-pairs]",
                        "[getters]",
                        "[setters]",
                        "[static-methods]",
                        "[async-methods]",
                        "[methods]",
                        "[conventional-private-methods]",
                    ],
                    sortInterfaces: true,
                    stopAfterFirstProblem: false,
                },
            ],
            "sort-destructure-keys/sort-destructure-keys": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            // Documentation
            "tsdoc/syntax": "warn",
            // Backend-specific unicorn rules
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true, // Service classes
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ],
            "unicorn/no-negated-condition": "warn", // Sometimes clearer
            "unicorn/no-null": "off", // Null is common in SQLite and IPC
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-spread": "off", // Prefer Array.From for readability
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/prefer-top-level-await": "off", // Not suitable for Electron main
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    vars: "all",
                    varsIgnorePattern: "^_",
                },
            ],
            "usememo-recommendations/detect-heavy-operations": "warn",
            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",
            "xss/no-location-href-assign": "error",
            "zod/prefer-enum": "error",
            "zod/require-strict": "error",
        },
        settings: {
            "boundaries/elements": [
                {
                    capture: ["main"],
                    pattern: "electron/main.ts",
                    type: "main",
                },
                {
                    capture: ["preload"],
                    pattern: "electron/preload.ts",
                    type: "preload",
                },
                {
                    capture: ["constants"],
                    pattern: "electron/constants.ts",
                    type: "constants",
                },
                {
                    capture: ["electronUtils"],
                    pattern: "electron/electronUtils.ts",
                    type: "utils",
                },
                {
                    capture: ["orchestrator"],
                    pattern: "electron/UptimeOrchestrator.ts",
                    type: "orchestrator",
                },
                {
                    capture: ["manager"],
                    pattern: "electron/managers/**/*",
                    type: "managers",
                },
                {
                    capture: ["service"],
                    pattern: "electron/services/**/*",
                    type: "services",
                },
                {
                    capture: ["util"],
                    pattern: "electron/utils/**/*",
                    type: "utils",
                },
                {
                    capture: ["event"],
                    pattern: "electron/events/**/*",
                    type: "events",
                },
                {
                    capture: ["type"],
                    pattern: "electron/types.ts",
                    type: "types",
                },
                {
                    capture: ["test"],
                    pattern: "electron/test/**/*",
                    type: "test",
                },
            ],
            "import-x/resolver": {
                node: true,
                project: ["tsconfig.electron.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.electron.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
        },
    },

    // TypeScript Shared (React and non-React)
    {
        files: ["shared/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}"],
        ignores: [
            "**/*.{spec,test}.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "shared/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "src/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "electron/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                NodeJS: "readonly",
                window: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "tsconfig.shared.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@arthurgeron/react-usememo": pluginUseMemo2,
            "@eslint-react": eslintReact,
            "@eslint-react/dom": eslintReactDom,
            "@eslint-react/hooks-extra": eslintReactHooksExtra,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            "@eslint-react/web-api": eslintReactWeb,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            "@metamask/design-tokens": pluginDesignTokens,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "@typescript-eslint": tseslint,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- TS Error from fixupPluginRules
            deprecation: fixupPluginRules(pluginDeprecation),
            "eslint-comments": pluginComments,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "eslint-plugin-toplevel": pluginTopLevel,
            etc: fixupPluginRules(etc),
            ex: ex,
            "filename-export": pluginFilenameExport,
            "format-sql": pluginFormatSQL,
            "function-name": pluginFunctionNames,
            functional: pluginFunctional,
            "granular-selectors": pluginGranular,
            "import-x": importX,
            "import-zod": importZod,
            istanbul: istanbul,
            js: js,
            "jsx-a11y": jsxA11y,
            "jsx-plus": pluginJsxPlus,
            listeners: listeners,
            "loadable-imports": pluginLoadableImports,
            math: eslintPluginMath,
            "module-interop": moduleInterop,
            n: nodePlugin,
            // @ts-expect-error -- TS Error from fixupPluginRules
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            "react-compiler": reactCompiler,
            "react-form-fields": pluginReactFormFields,
            "react-hook-form": pluginReactHookForm,
            "react-hooks": reactHooks,
            "react-hooks-addons": reactHooksAddons,
            "react-perf": reactPerfPlugin,
            "react-prefer-function-component": preferFunctionComponent,
            "react-refresh": reactRefresh,
            "react-require-testid": pluginReactTest,
            "react-useeffect": reactUseEffect,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sort-react-dependency-arrays": pluginSortReactDependency,
            "sql-template": sqlTemplate,
            // @ts-expect-error -- TS Error from fixupPluginRules
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "styled-components-a11y": styledA11y,
            tailwind: tailwind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "usememo-recommendations": pluginUseMemo,
            "validate-jsx-nesting": pluginValidateJSX,
            "write-good-comments": pluginWriteGood,
            xss: xss,
            zod: zod,
        },
        rules: {
            // TypeScript rules
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...reactRefresh.configs.vite.rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.react.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...css.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-typescript"].rules,
            ...arrayFunc.configs.all.rules,
            ...pluginSortClassMembers.configs["flat/recommended"].rules,
            ...eslintPluginNoUseExtendNative.configs.recommended.rules,
            ...pluginMicrosoftSdl.configs.required.rules,
            ...reactCompiler.configs.recommended.rules,
            ...listeners.configs.strict.rules,
            ...pluginNFDAR.rules,
            ...pluginJSDoc.rules,
            ...eslintPluginCommentLength.configs["flat/recommended"].rules,
            ...pluginRegexLook.configs.recommended.rules,
            ...pluginJsxPlus.configs.all.rules,
            ...moduleInterop.configs.recommended.rules,
            ...pluginTotalFunctions.configs.recommended.rules,
            ...styledA11y.flatConfigs.strict.rules,
            ...pluginReactHookForm.configs.recommended.rules,
            ...reactPerfPlugin.configs.all.rules,
            ...etc.configs.recommended.rules,
            "@arthurgeron/react-usememo/require-memo": "warn",
            "@arthurgeron/react-usememo/require-usememo": "error",
            "@arthurgeron/react-usememo/require-usememo-children": "warn",
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            "@eslint-react/naming-convention/use-state": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "error",
                {
                    ignore: [
                        "@shared",
                        "electron-devtools-installer",
                        "electron",
                        "@site",
                        "@theme",
                        "@docusaurus",
                    ],
                },
            ],
            "@metamask/design-tokens/color-no-hex": "error",
            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    blur: "Use 'blur-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    ring: "Use 'ring-3' instead.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    rounded: "Use 'rounded-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "shadow-sm": "Use 'shadow-xs' instead.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@typescript-eslint/adjacent-overload-signatures": "warn",
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types
            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/ban-tslint-comment": "warn",
            "@typescript-eslint/class-literal-property-style": "warn",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/consistent-generic-constructors": "warn",
            "@typescript-eslint/consistent-indexed-object-style": "warn",
            "@typescript-eslint/consistent-return": "warn",
            // Function and type safety rules
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": "warn",
            "@typescript-eslint/consistent-type-exports": "warn",
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/default-param-last": "warn",
            "@typescript-eslint/dot-notation": "warn",
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowConciseArrowFunctionExpressionsStartingWithVoid: false,
                    allowDirectConstAssertionInArrowFunctions: true,
                    allowedNames: [],
                    allowExpressions: false,
                    allowFunctionsWithoutTypeParameters: false,
                    allowHigherOrderFunctions: true,
                    allowIIFEs: false,
                    allowTypedFunctionExpressions: true,
                },
            ],
            "@typescript-eslint/explicit-member-accessibility": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "warn",
            "@typescript-eslint/init-declarations": "warn",
            "@typescript-eslint/max-params": "off",
            "@typescript-eslint/member-ordering": "off",
            "@typescript-eslint/method-signature-style": "warn",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-array-constructor": "warn",
            "@typescript-eslint/no-array-delete": "warn",
            "@typescript-eslint/no-base-to-string": "warn",
            "@typescript-eslint/no-confusing-non-null-assertion": "warn",
            "@typescript-eslint/no-confusing-void-expression": "warn",
            "@typescript-eslint/no-deprecated": "warn",
            "@typescript-eslint/no-dupe-class-members": "warn",
            "@typescript-eslint/no-duplicate-enum-values": "warn",
            "@typescript-eslint/no-duplicate-type-constituents": "warn",
            "@typescript-eslint/no-dynamic-delete": "warn",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],
            "@typescript-eslint/no-empty-object-type": "error",
            // Disable overly strict rules for this project
            "@typescript-eslint/no-explicit-any": "warn", // Sometimes needed
            "@typescript-eslint/no-extra-non-null-assertion": "warn",
            "@typescript-eslint/no-extraneous-class": "warn",
            // Advanced type-checked rules for async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                },
            ],
            "@typescript-eslint/no-for-in-array": "warn",
            "@typescript-eslint/no-implied-eval": "warn",
            // Keep enabled: Helps with bundle optimization and makes type vs runtime imports clearer.
            // Can be resolved incrementally as warnings.
            "@typescript-eslint/no-import-type-side-effects": "warn",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-invalid-this": "warn",
            "@typescript-eslint/no-invalid-void-type": "warn",
            "@typescript-eslint/no-loop-func": "warn",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-meaningless-void-operator": "warn",
            "@typescript-eslint/no-misused-new": "warn",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksSpreads: true, // Check Promise spreads
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                },
            ],
            "@typescript-eslint/no-misused-spread": "warn",
            "@typescript-eslint/no-mixed-enums": "warn",
            "@typescript-eslint/no-namespace": "warn",
            "@typescript-eslint/no-non-null-asserted-nullish-coalescing":
                "warn",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn", // Zustand patterns
            "@typescript-eslint/no-redeclare": "warn",
            "@typescript-eslint/no-redundant-type-constituents": "warn",
            "@typescript-eslint/no-require-imports": "warn",
            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)
            "@typescript-eslint/no-restricted-imports": "warn",
            "@typescript-eslint/no-restricted-types": [
                "error",
                {
                    types: {
                        Function: {
                            message: [
                                "The `Function` type accepts any function-like value.",
                                "It provides no type safety when calling the function, which can be a common source of bugs.",
                                "If you are expecting the function to accept certain arguments, you should explicitly define the function shape.",
                                "Use '(...args: unknown[]) => unknown' for generic handlers or define specific function signatures.",
                            ].join("\n"),
                        },
                    },
                },
            ],
            "@typescript-eslint/no-shadow": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            // "filename-export/match-named-export": "error",
            // "filename-export/match-default-export": "error",
            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",
            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            "@typescript-eslint/no-unnecessary-parameter-property-assignment":
                "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "warn",
            "@typescript-eslint/no-unnecessary-template-expression": "warn",
            "@typescript-eslint/no-unnecessary-type-arguments": "warn",
            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "error", // Remove redundant type assertions

            "@typescript-eslint/no-unnecessary-type-constraint": "warn",
            "@typescript-eslint/no-unnecessary-type-conversion": "warn",
            "@typescript-eslint/no-unnecessary-type-parameters": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any

            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions

            "@typescript-eslint/no-unsafe-declaration-merging": "warn",
            "@typescript-eslint/no-unsafe-enum-comparison": "warn",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions
            "@typescript-eslint/no-unsafe-type-assertion": "warn",
            "@typescript-eslint/no-unsafe-unary-minus": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            // Disabled: Function declarations are hoisted in JS/TS, and this rule creates unnecessary constraints
            // For Electron projects that often organize helper functions after main functions for better readability
            "@typescript-eslint/no-use-before-define": "warn",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-useless-empty-export": "warn",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/non-nullable-type-assertion-style": "warn",
            "@typescript-eslint/only-throw-error": "warn",
            "@typescript-eslint/parameter-properties": "warn",
            "@typescript-eslint/prefer-as-const": "warn",
            "@typescript-eslint/prefer-destructuring": "warn",
            "@typescript-eslint/prefer-enum-initializers": "warn",
            "@typescript-eslint/prefer-find": "warn",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-includes": "warn",
            "@typescript-eslint/prefer-literal-enum-member": "warn",
            "@typescript-eslint/prefer-namespace-keyword": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND
            "@typescript-eslint/prefer-promise-reject-errors": "warn",
            // "write-good-comments/write-good-comments": "warn",
            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            // Disabled: Too noisy for Electron projects with React/Zustand stores.
            // Readonly parameters are often impractical and TypeScript already provides strong typing.
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "@typescript-eslint/prefer-reduce-type-parameter": "warn",
            "@typescript-eslint/prefer-regexp-exec": "warn",
            "@typescript-eslint/prefer-return-this-type": "warn",
            "@typescript-eslint/prefer-string-starts-ends-with": "warn",
            // Configured: Allows non-async functions that return promises (like utility wrappers around Promise.all)
            // But encourages async for most cases. This is more flexible for Electron projects.
            "@typescript-eslint/promise-function-async": [
                "warn",
                {
                    allowAny: true,
                    allowedPromiseNames: ["Promise"],
                    checkArrowFunctions: false,
                },
            ],
            "@typescript-eslint/related-getter-setter-pairs": "warn",
            "@typescript-eslint/require-array-sort-compare": "warn",
            "@typescript-eslint/require-await": "error", // Functions marked async must use await

            "@typescript-eslint/restrict-plus-operands": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive

            "@typescript-eslint/triple-slash-reference": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/unified-signatures": "warn",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            // Code organization and architecture
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            allow: [
                                "components",
                                "stores",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                            ],
                            from: "app",
                        },
                        {
                            allow: [
                                "components",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                                "stores",
                            ],
                            from: "components",
                        },
                        {
                            allow: [
                                "stores",
                                "services",
                                "types",
                                "utils",
                            ],
                            from: "hooks",
                        },
                        {
                            allow: [
                                "types",
                                "utils",
                            ],
                            from: "services",
                        },
                        {
                            allow: [
                                "services",
                                "types",
                                "utils",
                                "stores",
                                "components",
                            ],
                            from: "stores",
                        },
                        {
                            allow: ["types"],
                            from: "theme",
                        },
                        { allow: [], from: "types" },
                        {
                            allow: ["types"],
                            from: "utils",
                        },
                    ],
                },
            ],
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-match-exported": "warn",
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules

            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/prefer-import-alias": [
                "error",
                {
                    aliases: [
                        {
                            alias: "@shared/",
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
                        },
                    ],
                },
            ],
            "canonical/prefer-inline-type-import": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            // Performance and compatibility
            "compat/compat": "off", // Electron supports modern APIs, Opera Mini not a target
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": "error",
            "deprecation/deprecation": "error",
            "dot-notation": "off",
            eqeqeq: [
                "error",
                "always",
            ],
            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",
            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "etc/no-const-enum": "warn",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "warn",
            // Function style preferences - disabled as too aggressive
            // "prefer-arrow/prefer-arrow-functions": [
            //     "warn",
            //     {
            //         DisallowPrototype: true,
            //         SingleReturnOnly: false,
            //         ClassPropertiesAllowed: false,
            //     },
            // ],
            "etc/throw-error": "warn",
            "ex/no-unhandled": "warn",
            "format-sql/format": "warn",
            "func-style": "off",
            "function-name/starts-with-verb": [
                "error",
                {
                    whitelist: [
                        "success",
                        "all",
                        "supports",
                        "safe",
                        "timeout",
                        "with",
                        "cleanup",
                        "deep",
                        "handler",
                        "component",
                        "typed",
                        "persist",
                        "invalidate",
                        "bulk",
                        "evict",
                        "migrate",
                        "rows",
                        "row",
                        "settings",
                        "shutdown",
                        "configure",
                        "rollback",
                        "prune",
                        "upsert",
                        "exists",
                        "history",
                        "increment",
                    ],
                },
            ],
            "functional/immutable-data": "off",
            "functional/no-let": "off", // Let is necessary in many React patterns

            "granular-selectors/granular-selectors": "error",
            "id-length": "off",
            // CSS
            "import-x/no-extraneous-dependencies": "warn",
            "import-x/no-import-module-exports": "warn",
            "import-x/no-internal-modules": "off",
            "import-x/no-mutable-exports": "warn",
            "import-x/no-named-as-default": "warn",
            "import-x/no-named-as-default-member": "off",
            "import-x/no-named-default": "warn",
            "import-x/no-named-export": "off",
            "import-x/no-namespace": "off",
            "import-x/no-nodejs-modules": "error", // Dont allow on frontend or shared
            "import-x/no-relative-packages": "warn",
            "import-x/no-relative-parent-imports": "off",
            "import-x/no-rename-default": "warn",
            "import-x/no-restricted-paths": "warn",
            "import-x/no-self-import": "warn",
            // Import rules
            "import-x/no-unassigned-import": [
                "error",
                {
                    allow: [
                        "**/*.css",
                        "**/*.scss",
                    ], // Allow CSS imports without assignment
                },
            ],
            "import-x/no-unresolved": "warn",
            "import-x/no-unused-modules": "warn",
            "import-x/no-useless-path-segments": "warn",
            "import-x/no-webpack-loader-syntax": "warn",
            "import-x/order": "off", // Conflicts with other rules
            "import-x/prefer-default-export": "off",
            "import-x/prefer-namespace-import": "warn",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility
            "jsx-a11y/alt-text": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/no-autofocus": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "error",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: false,
                    allowArrayStart: true,
                    allowBlockEnd: false,
                    allowBlockStart: true,
                    allowClassEnd: false,
                    allowClassStart: true,
                    allowObjectEnd: false,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: true,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "error",
                "always",
                {
                    exceptAfterSingleLine: false,
                },
            ],
            "loadable-imports/sort": "error",
            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",
            "max-classes-per-file": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/file-extension-in-import": "off", // Allow missing file extensions for imports
            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-process-env": "warn",
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax
            "n/prefer-global/buffer": "warn",
            "n/prefer-global/console": "warn",
            "n/prefer-global/process": "warn",
            "n/prefer-global/text-decoder": "warn",
            "n/prefer-global/text-encoder": "warn",
            "n/prefer-global/url": "warn",
            "n/prefer-global/url-search-params": "warn",
            "n/prefer-node-protocol": "warn",
            "n/prefer-promises/dns": "warn",
            "n/prefer-promises/fs": "warn",
            "neverthrow/must-use-result": "error",
            "no-console": "off",
            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    next: "*",
                    prev: "function",
                },
                {
                    blankLine: "always",
                    next: "function",
                    prev: "*",
                },
                {
                    blankLine: "always",
                    next: "*",
                    prev: "class",
                },
                {
                    blankLine: "always",
                    next: "class",
                    prev: "*",
                },
            ],
            "perfectionist/sort-classes": "off",
            "perfectionist/sort-modules": [
                "off",
                {
                    customGroups: [],
                    groups: [
                        "declare-enum",
                        "declare-export-enum",
                        "enum",
                        "export-enum",
                        "declare-interface",
                        "declare-export-interface",
                        "declare-default-interface",
                        "export-declare-interface",
                        "default-interface",
                        "export-default-interface",
                        "interface",
                        "export-interface",
                        "declare-type",
                        "declare-export-type",
                        "type",
                        "export-type",
                        "declare-class",
                        "declare-export-class",
                        "declare-default-class",
                        "declare-default-decorated-class",
                        "declare-default-export-class",
                        "declare-default-export-decorated-class",
                        "export-declare-class",
                        "export-declare-decorated-class",
                        "export-default-class",
                        "export-default-decorated-class",
                        "default-class",
                        "default-decorated-class",
                        "class",
                        "export-class",
                        "decorated-class",
                        "export-decorated-class",
                        "declare-function",
                        "declare-async-function",
                        "declare-export-function",
                        "declare-export-async-function",
                        "declare-default-function",
                        "declare-default-async-function",
                        "declare-default-export-function",
                        "declare-default-export-async-function",
                        "export-declare-function",
                        "export-declare-async-function",
                        "export-default-function",
                        "export-default-async-function",
                        "default-function",
                        "default-async-function",
                        "function",
                        "async-function",
                        "export-function",
                        "export-async-function",
                    ],
                    ignoreCase: true,
                    newlinesBetween: "ignore",
                    order: "asc",
                    partitionByComment: false,
                    partitionByNewLine: false,
                    specialCharacters: "keep",
                    type: "alphabetical",
                },
            ],
            "prefer-arrow-callback": "off",
            "prefer-const": "error",
            "prefer-template": "warn",
            // Code style
            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "putout/align-spaces": "off",
            "putout/array-element-newline": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/function-declaration-paren-newline": "off",
            "putout/long-properties-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/newline-function-call-arguments": "off",
            "putout/object-property-newline": "error",
            "putout/objects-braces-inside-array": "off",
            "putout/single-property-destructuring": "off",
            "react-form-fields/no-mix-controlled-with-uncontrolled": "error",
            "react-form-fields/no-only-value-prop": "error",
            "react-form-fields/styled-no-mix-controlled-with-uncontrolled":
                "error",
            "react-form-fields/styled-no-only-value-prop": "error",
            "react-hook-form/no-use-watch": "error",
            "react-hooks-addons/no-unused-deps": "warn",
            // React Hooks
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/rules-of-hooks": "error",
            "react-prefer-function-component/react-prefer-function-component": [
                "error",
                { allowComponentDidCatch: false },
            ],
            "react-require-testid/testid-missing": [
                "warn",
                {
                    disableDefaultComponents: [
                        "a",
                        "abbr",
                        "address",
                        "area",
                        "article",
                        "aside",
                        "audio",
                        "b",
                        "base",
                        "bdi",
                        "bdo",
                        "blockquote",
                        "body",
                        "br",
                        "button",
                        "canvas",
                        "caption",
                        "cite",
                        "code",
                        "col",
                        "colgroup",
                        "data",
                        "datalist",
                        "dd",
                        "del",
                        "details",
                        "dfn",
                        "dialog",
                        "div",
                        "dl",
                        "dt",
                        "em",
                        "embed",
                        "fieldset",
                        "figcaption",
                        "figure",
                        "footer",
                        "form",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "head",
                        "header",
                        "hr",
                        "html",
                        "i",
                        "iframe",
                        "img",
                        "input",
                        "ins",
                        "kbd",
                        "label",
                        "legend",
                        "li",
                        "link",
                        "main",
                        "map",
                        "mark",
                        "meta",
                        "meter",
                        "nav",
                        "noscript",
                        "object",
                        "ol",
                        "optgroup",
                        "option",
                        "output",
                        "p",
                        "param",
                        "picture",
                        "pre",
                        "progress",
                        "q",
                        "rp",
                        "rt",
                        "ruby",
                        "s",
                        "samp",
                        "script",
                        "section",
                        "select",
                        "small",
                        "source",
                        "span",
                        "strong",
                        "style",
                        "sub",
                        "summary",
                        "sup",
                        "table",
                        "tbody",
                        "td",
                        "template",
                        "textarea",
                        "tfoot",
                        "th",
                        "thead",
                        "time",
                        "title",
                        "tr",
                        "track",
                        "u",
                        "ul",
                        "var",
                        "video",
                        "wbr",
                    ],
                    enableComponents: [],
                },
            ],
            "react-useeffect/no-non-function-return": "error",
            // React
            "react/boolean-prop-naming": "warn",
            "react/button-has-type": "warn",
            "react/checked-requires-onchange-or-readonly": "warn",
            "react/default-props-match-prop-types": "warn",
            "react/destructuring-assignment": "warn",
            "react/forbid-component-props": "off",
            "react/forbid-dom-props": "warn",
            "react/forbid-elements": "warn",
            "react/forbid-foreign-prop-types": "warn",
            "react/forbid-prop-types": "warn",
            "react/forward-ref-uses-ref": "warn",
            "react/function-component-definition": [
                "error",
                {
                    namedComponents: "arrow-function",
                    unnamedComponents: "arrow-function",
                },
            ], // Enforce consistent arrow function components
            "react/hook-use-state": "warn",
            "react/iframe-missing-sandbox": "warn",
            // React 19 optimized rules
            "react/jsx-boolean-value": "warn",
            "react/jsx-child-element-spacing": "warn",
            "react/jsx-closing-bracket-location": "warn",
            "react/jsx-closing-tag-location": "warn",
            "react/jsx-curly-brace-presence": "warn",
            "react/jsx-curly-newline": "off",
            "react/jsx-curly-spacing": "off",
            "react/jsx-equals-spacing": "off",
            "react/jsx-filename-extension": [
                "error",
                {
                    extensions: [".tsx"],
                },
            ], // Enforce .tsx for JSX files
            "react/jsx-first-prop-new-line": "off",
            "react/jsx-fragments": [
                "warn",
                "syntax",
            ],
            "react/jsx-handler-names": "warn", // Enforce consistent handler names
            "react/jsx-indent": "off",
            "react/jsx-indent-props": "off",
            "react/jsx-key": "error",
            "react/jsx-max-depth": [
                "warn",
                { max: 7 },
            ], // Warn on deeply nested JSX to encourage component extraction
            "react/jsx-max-props-per-line": "off",
            "react/jsx-newline": "off",
            "react/jsx-no-bind": "warn", // Allow inline functions for development speed
            "react/jsx-no-constructed-context-values": "warn",
            "react/jsx-no-leaked-render": "warn",
            "react/jsx-no-literals": "off",
            "react/jsx-no-script-url": "warn",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-one-expression-per-line": "warn",
            "react/jsx-pascal-case": "warn",
            "react/jsx-props-no-multi-spaces": "warn",
            "react/jsx-props-no-spread-multi": "warn",
            "react/jsx-props-no-spreading": "off",
            "react/jsx-sort-props": "warn",
            "react/jsx-tag-spacing": "warn",
            "react/jsx-uses-react": "warn",
            "react/jsx-wrap-multilines": "warn",
            "react/no-access-state-in-setstate": "warn",
            "react/no-adjacent-inline-elements": "warn",
            "react/no-array-index-key": "warn",
            "react/no-arrow-function-lifecycle": "warn",
            "react/no-danger": "warn",
            "react/no-did-mount-set-state": "warn",
            "react/no-did-update-set-state": "warn",
            "react/no-invalid-html-attribute": "warn",
            "react/no-multi-comp": "warn",
            "react/no-namespace": "warn",
            "react/no-object-type-as-default-prop": "warn",
            "react/no-redundant-should-component-update": "warn",
            "react/no-set-state": "warn",
            "react/no-this-in-sfc": "warn",
            "react/no-typos": "warn",
            "react/no-unstable-nested-components": "error",
            "react/no-unused-class-component-methods": "warn",
            "react/no-unused-prop-types": "warn",
            "react/no-unused-state": "warn",
            "react/no-will-update-set-state": "warn",
            "react/prefer-es6-class": "warn",
            "react/prefer-exact-props": "warn",
            "react/prefer-read-only-props": "warn",
            "react/prefer-stateless-function": "warn",
            "react/prop-types": "warn",
            "react/react-in-jsx-scope": "off",
            "react/require-default-props": "off",
            "react/require-optimization": "warn",
            "react/self-closing-comp": "warn",
            "react/sort-comp": "warn",
            "react/sort-default-props": "warn",
            "react/sort-prop-types": "warn",
            "react/state-in-constructor": "warn",
            "react/static-property-placement": "warn",
            "react/style-prop-object": "warn",
            "react/void-dom-elements-no-children": "warn",
            // Security for Frontend
            "redos/no-vulnerable": "error",
            // RegExp
            "regexp/grapheme-string-literal": "warn",
            "regexp/hexadecimal-escape": "warn",
            "regexp/letter-case": "warn",
            "regexp/no-control-character": "warn",
            "regexp/no-octal": "warn",
            // RegExp rules for security and performance
            "regexp/no-potentially-useless-backreference": "warn",
            "regexp/no-standalone-backslash": "warn",
            "regexp/no-super-linear-backtracking": "error",
            "regexp/no-super-linear-move": "warn",
            "regexp/no-unused-capturing-group": "warn",
            "regexp/no-useless-escape": "warn",
            "regexp/no-useless-quantifier": "warn",
            "regexp/optimal-quantifier-concatenation": "warn",
            "regexp/prefer-character-class": "warn",
            "regexp/prefer-escape-replacement-dollar-char": "warn",
            "regexp/prefer-lookaround": "warn",
            "regexp/prefer-named-backreference": "warn",
            "regexp/prefer-named-capture-group": "warn",
            "regexp/prefer-named-replacement": "warn",
            // // Tailwind CSS
            // "tailwind/classnames-order": "warn",
            // "tailwind/enforces-negative-arbitrary-values": "warn",
            // "tailwind/enforces-shorthand": "warn",
            // "tailwind/migration-from-tailwind-2": "warn",
            // "tailwind/no-arbitrary-value": "warn",
            // "tailwind/no-contradicting-classname": "warn",
            // "tailwind/no-custom-classname": "off",
            // "tailwind/no-unnecessary-arbitrary-value": "warn",
            "regexp/prefer-plus-quantifier": "warn",
            "regexp/prefer-quantifier": "warn",
            "regexp/prefer-regexp-exec": "warn",
            "regexp/prefer-regexp-test": "warn",
            "regexp/prefer-result-array-groups": "warn",
            "regexp/prefer-star-quantifier": "warn",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "warn",
            "regexp/sort-alternatives": "warn",
            "regexp/sort-character-class-elements": "warn",
            "regexp/unicode-escape": "warn",
            "regexp/unicode-property": "warn",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "safe-jsx/jsx-explicit-boolean": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-non-literal-require": "error",
            "security/detect-object-injection": "off",
            "sort-class-members/sort-class-members": [
                "warn",
                {
                    accessorPairPositioning: "together",
                    order: [
                        "[static-properties]",
                        "[properties]",
                        "[conventional-private-properties]",
                        "[arrow-function-properties]",
                        "[everything-else]",
                        "[accessor-pairs]",
                        "[getters]",
                        "[setters]",
                        "[static-methods]",
                        "[async-methods]",
                        "[methods]",
                        "[conventional-private-methods]",
                    ],
                    sortInterfaces: true,
                    stopAfterFirstProblem: false,
                },
            ],
            "sort-destructure-keys/sort-destructure-keys": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "sort-react-dependency-arrays/sort": "error",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            // Documentation
            "tsdoc/syntax": "warn",
            // Optimized Unicorn rules (reduced false positives)
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        kebabCase: true,
                        pascalCase: true,
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-negated-condition": "warn", // Sometimes clearer
            "unicorn/no-null": "off", // React commonly uses null for conditional rendering
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS needed for Electron
            "unicorn/prefer-node-protocol": "warn",
            "unicorn/prefer-spread": "off",
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/prefer-top-level-await": "off", // Not suitable for React
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    vars: "all",
                    varsIgnorePattern: "^_",
                },
            ],
            "usememo-recommendations/detect-heavy-operations": "warn",
            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",
            "xss/no-location-href-assign": "error",
            "zod/prefer-enum": "error",
            "zod/require-strict": "error",
        },
        settings: {
            "boundaries/elements": [
                {
                    capture: ["constant"],
                    pattern: "shared/constants/**/*",
                    type: "constants",
                },
                {
                    capture: ["type"],
                    pattern: "shared/types/**/*",
                    type: "types",
                },
                {
                    capture: ["type"],
                    pattern: "shared/types.ts",
                    type: "types",
                },
                {
                    capture: ["util"],
                    pattern: "shared/utils/**/*",
                    type: "utils",
                },
                {
                    capture: ["validation"],
                    pattern: "shared/validation/**/*",
                    type: "validation",
                },
                {
                    capture: ["test"],
                    pattern: "shared/test/**/*",
                    type: "test",
                },
            ],
            "import-x/resolver": {
                node: true,
                project: ["tsconfig.shared.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.shared.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
            tailwind: {
                config: "./tailwind.config.mjs",
            },
        },
    },

    // Test files (Frontend)
    {
        files: [
            "src/**/*.{spec,test}.*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "src/**/*.{spec,test}.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "src/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "tests/**/*.{ts,tsx,cts,mts,mjs,js,jsx,cjs}",
            "tests/**/*.{spec,test}.*.{ts,tsx,cts,mts,mjs,js,jsx,cjs}",
            "tests/**/*.{spec,test}.{ts,tsx,cts,mts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...vitest.environments.env.globals,
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
                test: "readonly",
                vi: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "config/testing/tsconfig.test.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "eslint-comments": pluginComments,
            "import-x": importX,
            "loadable-imports": pluginLoadableImports,
            n: nodePlugin,
            react: pluginReact,
            "react-hooks": reactHooks,
            "testing-library": pluginTestingLibrary,
            "undefined-css-classes": pluginUndefinedCss,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            vitest: vitest,
        },
        rules: {
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...vitest.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            ...pluginUnicorn.configs.all.rules,
            // Relaxed function rules for tests (explicit for clarity)
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-use-before-define": "off", // Allow use before define in tests
            camelcase: "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            complexity: "off",
            "default-case": "off",
            "dot-notation": "off",
            eqeqeq: "off", // Allow == and != in tests for flexibility
            "func-name-matching": "off", // Allow function names to not match variable names
            "func-names": "off",
            "func-style": "off",
            "id-length": "off",
            "init-declarations": "off",
            "loadable-imports/sort": "error",
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "new-cap": "off", // Allow new-cap for class constructors
            "nitpick/no-redundant-vars": "off", // Allow redundant vars in tests
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-console": "off",
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-inline-comments": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-magic-numbers": "off",
            "no-new": "off", // Allow new for class constructors
            "no-plusplus": "off",
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-shadow": "off",
            "no-ternary": "off",
            "no-throw-literal": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off", // Allow use before define in tests
            "no-useless-assignment": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": "off",
            "prefer-destructuring": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-node-access": "off",
            "testing-library/prefer-screen-queries": "warn",
            "undefined-css-classes/no-undefined-css-classes": "off",
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/no-await-expression-member": "off", // Allow await in test expressions
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-null": "off", // Null is common in test setups
            "unicorn/no-unused-properties": "off", // Allow unused properties in test setups
            "unicorn/no-useless-undefined": "off", // Allow undefined in test setups
            "unicorn/prefer-global-this": "off", // Allow globalThis for test setups
            "unicorn/prefer-optional-catch-binding": "off", // Allow optional catch binding for test flexibility
            "unicorn/prevent-abbreviations": "off", // Too many false positives in tests
        },

        settings: {
            "import-x/resolver": {
                node: true,
                project: ["config/testing/tsconfig.test.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["config/testing/tsconfig.test.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
            vitest: {
                typecheck: true,
            },
        },
    },

    // Test files (Backend)
    {
        files: [
            "electron/**/*.{spec,test}.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "electron/test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
                NodeJS: "readonly",
                test: "readonly",
                vi: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "config/testing/tsconfig.electron.test.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "import-x": importX,
            "loadable-imports": pluginLoadableImports,
            n: nodePlugin,
            "no-only-tests": pluginNoOnly,
            "testing-library": pluginTestingLibrary,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            vitest: vitest,
        },
        rules: {
            // Test Files Backend Rules (Electron Tests)
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...vitest.configs.recommended.rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers

            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-use-before-define": "off", // Allow use before define in tests
            camelcase: "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            complexity: "off",
            "default-case": "off",
            "dot-notation": "off",
            eqeqeq: "off", // Allow == and != in tests for flexibility
            "func-name-matching": "off", // Allow function names to not match variable names
            "func-names": "off",
            // Relaxed function rules for backend tests (explicit for clarity)
            "func-style": "off",
            "id-length": "off",
            "init-declarations": "off",
            "loadable-imports/sort": "error",
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "new-cap": "off", // Allow new-cap for class constructors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-console": "off",
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-inline-comments": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-magic-numbers": "off",
            "no-new": "off", // Allow new for class constructors
            // No Only Tests
            "no-only-tests/no-only-tests": "error",
            "no-plusplus": "off",
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-shadow": "off",
            "no-ternary": "off",
            "no-throw-literal": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off", // Allow use before define in tests
            "no-useless-assignment": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": "off",
            "prefer-destructuring": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-node-access": "off",
            "testing-library/prefer-screen-queries": "warn",
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/no-await-expression-member": "off", // Allow await in test expressions
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-null": "off", // Null is common in test setups
            "unicorn/no-unused-properties": "off", // Allow unused properties in test setups
            "unicorn/no-useless-undefined": "off", // Allow undefined in test setups
            "unicorn/prefer-global-this": "off", // Allow globalThis for test setups
            "unicorn/prefer-optional-catch-binding": "off", // Allow optional catch binding for test flexibility
            "unicorn/prevent-abbreviations": "off", // Too many false positives in tests
        },
        settings: {
            "import-x/resolver": {
                node: true,
                project: ["config/testing/tsconfig.electron.test.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["config/testing/tsconfig.electron.test.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            vitest: {
                typecheck: true,
            },
        },
    },

    // Shared Test Files
    {
        files: [
            "shared/**/*.{spec,test}.{ts,tsx,cts,mts,mjs,js,jsx,cjs}",
            "shared/test/**/*.{ts,tsx,cts,mts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...vitest.environments.env.globals,
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
                test: "readonly",
                vi: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "config/testing/tsconfig.shared.test.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "eslint-comments": pluginComments,
            "import-x": importX,
            "loadable-imports": pluginLoadableImports,
            n: nodePlugin,
            react: pluginReact,
            "react-hooks": reactHooks,
            "testing-library": pluginTestingLibrary,
            "undefined-css-classes": pluginUndefinedCss,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            vitest: vitest,
        },
        rules: {
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...vitest.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            ...pluginUnicorn.configs.all.rules,
            // Relaxed function rules for tests (explicit for clarity)
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-unused-vars": "off",
            camelcase: "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "dot-notation": "off",
            "func-style": "off",
            "id-length": "off",
            "loadable-imports/sort": "error",
            "max-classes-per-file": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "no-console": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-node-access": "off",
            "testing-library/prefer-screen-queries": "warn",
            "undefined-css-classes/no-undefined-css-classes": "off",
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/no-await-expression-member": "off", // Allow await in test expressions
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-null": "off", // Null is common in test setups
            "unicorn/no-unused-properties": "off", // Allow unused properties in test setups
            "unicorn/no-useless-undefined": "off", // Allow undefined in test setups
            "unicorn/prevent-abbreviations": "off", // Too many false positives in tests
        },

        settings: {
            "import-x/resolver": {
                node: true,
                project: ["config/testing/tsconfig.shared.test.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["config/testing/tsconfig.shared.test.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
            vitest: {
                typecheck: true,
            },
        },
    },

    // Benchmark files
    {
        files: [
            "benchmarks/**/*.bench.*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "benchmarks/**/*.{ts,tsx,cts,mts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...vitest.environments.env.globals,
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                bench: "readonly",
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
                NodeJS: "readonly",
                test: "readonly",
                vi: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: ["config/benchmarks/tsconfig.bench.json"],
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "eslint-comments": pluginComments,
            "import-x": importX,
            n: nodePlugin,
            react: pluginReact,
            "react-hooks": reactHooks,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            vitest: vitest,
        },
        rules: {
            // Benchmark Files Rules

            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...vitest.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginUnicorn.configs.all.rules,
            "@typescript-eslint/no-empty-function": "off",
            // Allow flexible patterns for benchmark mock implementations
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "off", // Benchmarks may not await all promises
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/require-await": "off", // Benchmarks may have async patterns
            camelcase: "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            complexity: "off",
            "default-case": "off",
            "dot-notation": "off",
            "func-names": "off",
            "func-style": "off",
            "id-length": "off",
            "import-x/no-extraneous-dependencies": "off",
            // Import rules relaxed for mock implementations
            "import-x/no-unused-modules": "off",
            "init-declarations": "off",
            "max-classes-per-file": "off",
            "max-depth": "off",
            // Allow large files and classes for comprehensive benchmarks
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "new-cap": "off", // Allow new-cap for class constructors
            "nitpick/no-redundant-vars": "off", // Allow redundant vars in benchmarks

            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-console": "off",
            "no-continue": "off",
            "no-div-regex": "off", // Allow division regex in benchmarks
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-inline-comments": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-magic-numbers": "off",
            "no-new": "off", // Allow new for class constructors
            "no-plusplus": "off",
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-shadow": "off",
            "no-ternary": "off",
            "no-throw-literal": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off", // Allow use before define in benchmarks
            "no-useless-assignment": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": "off",
            "prefer-destructuring": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/filename-case": "off", // Allow benchmark files to have any case
            "unicorn/no-array-for-each": "off", // Benchmarks may use forEach for testing
            "unicorn/no-array-reduce": "off", // Benchmarks may test reduce performance
            "unicorn/no-await-expression-member": "off",
            // Allow performance-focused code patterns in benchmarks
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ],
            "unicorn/no-null": "off",
            "unicorn/no-unused-properties": "off",
            "unicorn/no-useless-undefined": "off",
            "unicorn/prefer-set-has": "off", // Benchmarks may compare different approaches
            "unicorn/prefer-spread": "off", // Benchmarks may test different patterns
            "unicorn/prevent-abbreviations": "off",
        },
        settings: {
            "import-x/resolver": {
                node: true,
                project: [
                    "tsconfig.json",
                    "config/testing/tsconfig.test.json",
                    "config/benchmarks/tsconfig.bench.json",
                ],
                typescript: true,
            },
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: [
                        "tsconfig.json",
                        "config/testing/tsconfig.test.json",
                        "config/benchmarks/tsconfig.bench.json",
                    ],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
            vitest: {
                typecheck: true,
            },
        },
    },

    // TypeScript Config files using Electron Test TSConfig
    {
        files: [
            "**/*.config.{ts,tsx,mts,cts}", // Configuration files
            "**/*.config.**.*.{ts,tsx,mts,cts}",
        ],
        ignores: [],
        languageOptions: {
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
                __dirname: "readonly",
                __filename: "readonly",
                Buffer: "readonly",
                global: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "config/testing/tsconfig.configs.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            compat: pluginCompat,
            css: css,
            depend: depend,
            "eslint-comments": pluginComments,
            ex: ex,
            functional: pluginFunctional,
            "import-x": importX,
            js: js,
            "jsx-a11y": jsxA11y,
            math: eslintPluginMath,
            n: nodePlugin,
            "no-unsanitized": nounsanitized,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            xss: xss,
        },
        rules: {
            // TypeScript Config Files Rules

            // TypeScript backend rules
            ...js.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.react.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...css.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...arrayFunc.configs.all.rules,
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types

            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],
            "@typescript-eslint/no-empty-object-type": "error",
            // Allow more flexibility for backend patterns
            "@typescript-eslint/no-explicit-any": "warn",
            // Advanced type-checked rules for backend async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues in Node.js
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                },
            ],
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksSpreads: true, // Check Promise spreads
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                },
            ],
            // Function and type safety rules (same as frontend)
            "@typescript-eslint/no-restricted-types": [
                "error",
                {
                    types: {
                        Function: {
                            message: [
                                "The `Function` type accepts any function-like value.",
                                "It provides no type safety when calling the function, which can be a common source of bugs.",
                                "If you are expecting the function to accept certain arguments, you should explicitly define the function shape.",
                                "Use '(...args: unknown[]) => unknown' for generic handlers or define specific function signatures.",
                            ].join("\n"),
                        },
                    },
                },
            ],
            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "off", // Remove redundant type assertions
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any
            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND
            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            "@typescript-eslint/require-await": "error", // Functions marked async must use await
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive
            // Architecture boundaries for Electron
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            allow: ["types"],
                            from: "events",
                        },
                        {
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                            from: "main",
                        },
                        {
                            allow: [
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                            from: "managers",
                        },
                        {
                            allow: [
                                "utils",
                                "types",
                            ],
                            from: "preload",
                        },
                        {
                            allow: [
                                "services",
                                "utils",
                                "types",
                            ],
                            from: "services",
                        },
                        { allow: [], from: "types" },
                        {
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                            from: "utils",
                        },
                        {
                            allow: ["types"],
                            from: "utils",
                        },
                    ],
                },
            ],
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            complexity: "off",
            "default-case": "off",
            "depend/ban-dependencies": "error",
            "dot-notation": "off",
            "ex/no-unhandled": "warn",
            "func-names": "off",
            "func-style": "off",
            "functional/functional-parameters": "off",
            "functional/immutable-data": "off",
            "functional/no-class-inheritance": "off", // Classes are common in Electron services
            "functional/no-classes": "off", // Classes are common in Electron services

            "functional/no-conditional-statement": "off",
            "functional/no-conditional-statements": "off",
            "functional/no-expression-statements": "off",
            "functional/no-let": "off",
            "functional/no-loop-statements": "off",
            "functional/no-mixed-types": "off", // Mixed types are common in Electron services
            "functional/no-return-void": "off",
            "functional/no-throw-statements": "off", // Throwing errors is common in Electron

            "functional/prefer-immutable-types": "off",
            "id-length": "off",
            // Import Rules
            "import-x/consistent-type-specifier-style": "off",
            "import-x/default": "warn",
            "import-x/dynamic-import-chunkname": "warn",
            "import-x/export": "warn",
            "import-x/exports-last": "off",
            // "write-good-comments/write-good-comments": "warn",
            "import-x/extensions": "warn",
            "import-x/first": "warn",
            "import-x/group-exports": "off",
            "import-x/max-dependencies": "off",
            "import-x/namespace": "warn",
            "import-x/newline-after-import": "warn",
            "import-x/no-absolute-path": "warn",
            "import-x/no-amd": "warn",
            "import-x/no-anonymous-default-export": "warn",
            "import-x/no-commonjs": "warn",
            "import-x/no-cycle": "warn",
            "import-x/no-default-export": "off",
            "import-x/no-deprecated": "warn",
            "import-x/no-duplicates": "warn",
            "import-x/no-dynamic-require": "warn",
            "import-x/no-empty-named-blocks": "warn",
            "import-x/no-extraneous-dependencies": "warn",
            "import-x/no-import-module-exports": "warn",
            "import-x/no-internal-modules": "off",
            "import-x/no-mutable-exports": "warn",
            "import-x/no-named-as-default": "warn",
            "import-x/no-named-as-default-member": "off",
            "import-x/no-named-default": "warn",
            "import-x/no-named-export": "off",
            "import-x/no-namespace": "off",
            "import-x/no-nodejs-modules": "off",
            "import-x/no-relative-packages": "warn",
            "import-x/no-relative-parent-imports": "off",
            "import-x/no-rename-default": "off",
            "import-x/no-restricted-paths": "warn",
            "import-x/no-self-import": "warn",
            "import-x/no-unassigned-import": "warn",
            "import-x/no-unresolved": "warn",
            "import-x/no-unused-modules": "warn",
            "import-x/no-useless-path-segments": "warn",
            "import-x/no-webpack-loader-syntax": "warn",
            "import-x/order": "off",
            "import-x/prefer-default-export": "off",
            "import-x/prefer-namespace-import": "warn",
            "import-x/unambiguous": "warn",
            "init-declarations": "off",
            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/file-extension-in-import": "off", // Allow missing file extensions for imports

            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-process-env": "off", // Allow process.env usage in Electron
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unpublished-import": "off",
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax
            "n/prefer-global/buffer": "warn",
            "n/prefer-global/console": "warn",
            "n/prefer-global/process": "warn",
            "n/prefer-global/text-decoder": "warn",
            "n/prefer-global/text-encoder": "warn",
            "n/prefer-global/url": "warn",
            "n/prefer-global/url-search-params": "warn",
            "n/prefer-node-protocol": "warn",
            "n/prefer-promises/dns": "warn",
            "n/prefer-promises/fs": "warn",
            "new-cap": "off", // Allow new-cap for class constructors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-console": "off",
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-inline-comments": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-magic-numbers": "off",
            "no-new": "off", // Allow new for class constructors
            "no-plusplus": "off",
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-shadow": "off",
            "no-ternary": "off",
            "no-throw-literal": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-useless-assignment": "off",
            // Node.js specific
            // "no-console": "off", // Logging is important for backend - DISABLED FOR NOW
            "no-var": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": "off",
            "prefer-const": "error",
            "prefer-destructuring": "off",
            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "putout/align-spaces": "off",
            "putout/array-element-newline": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/function-declaration-paren-newline": "off",
            "putout/long-properties-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/newline-function-call-arguments": "off",
            "putout/object-property-newline": "error",
            "putout/objects-braces-inside-array": "error",
            "putout/single-property-destructuring": "off",
            // Security for backend
            "redos/no-vulnerable": "error",
            // RegExp
            "regexp/grapheme-string-literal": "warn",
            "regexp/hexadecimal-escape": "warn",
            "regexp/letter-case": "warn",
            "regexp/no-control-character": "warn",
            "regexp/no-octal": "warn",
            "regexp/no-standalone-backslash": "warn",
            "regexp/no-super-linear-move": "warn",
            "regexp/prefer-escape-replacement-dollar-char": "warn",
            "regexp/prefer-lookaround": "warn",
            "regexp/prefer-named-backreference": "warn",
            "regexp/prefer-named-capture-group": "warn",
            "regexp/prefer-named-replacement": "warn",
            "regexp/prefer-quantifier": "warn",
            "regexp/prefer-regexp-exec": "warn",
            "regexp/prefer-regexp-test": "warn",
            "regexp/prefer-result-array-groups": "warn",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "warn",
            "regexp/sort-alternatives": "warn",
            "regexp/sort-character-class-elements": "off",
            "regexp/unicode-escape": "warn",
            "regexp/unicode-property": "warn",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-non-literal-require": "error",
            "security/detect-object-injection": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            // Documentation
            "tsdoc/syntax": "warn",
            // Backend-specific unicorn rules
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true, // Service classes
                    },
                },
            ],
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ],
            "unicorn/no-null": "off", // Null is common in SQLite and IPC
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-module": "off", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-spread": "off", // Prefer Array.From for readability

            "unicorn/prefer-top-level-await": "off", // Not suitable for Electron main
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    vars: "all",
                    varsIgnorePattern: "^_",
                },
            ],
            "xss/no-location-href-assign": "error",
        },
        settings: {
            "boundaries/elements": [
                {
                    capture: ["main"],
                    pattern: "electron/main.ts",
                    type: "main",
                },
                {
                    capture: ["preload"],
                    pattern: "electron/preload.ts",
                    type: "preload",
                },
                {
                    capture: ["constants"],
                    pattern: "electron/constants.ts",
                    type: "constants",
                },
                {
                    capture: ["electronUtils"],
                    pattern: "electron/electronUtils.ts",
                    type: "utils",
                },
                {
                    capture: ["orchestrator"],
                    pattern: "electron/UptimeOrchestrator.ts",
                    type: "orchestrator",
                },
                {
                    capture: ["manager"],
                    pattern: "electron/managers/**/*",
                    type: "managers",
                },
                {
                    capture: ["service"],
                    pattern: "electron/services/**/*",
                    type: "services",
                },
                {
                    capture: ["util"],
                    pattern: "electron/utils/**/*",
                    type: "utils",
                },
                {
                    capture: ["event"],
                    pattern: "electron/events/**/*",
                    type: "events",
                },
                {
                    capture: ["type"],
                    pattern: "electron/types.ts",
                    type: "types",
                },
                {
                    capture: ["test"],
                    pattern: "electron/test/**/*",
                    type: "test",
                },
            ],
            "import-x/resolver": {
                node: true,
                project: ["config/testing/tsconfig.electron.test.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["config/testing/tsconfig.electron.test.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
        },
    },

    // Script files
    {
        files: [
            "scripts/**/*.{ts,tsx,cts,mts,mjs,js,jsx,cjs}",
            "scripts/download-docs-template.mjs",
        ],
        ignores: [
            "scripts/coverage/**/*",
            "scripts/dist/**/*",
            "scripts/node_modules/**/*",
            "scripts/download**",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "eslint-comments": pluginComments,
            "import-x": importX,
            n: nodePlugin,
            react: pluginReact,
            "react-hooks": reactHooks,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            vitest: vitest,
        },
        rules: {
            // Scripts Files Rules

            ...js.configs.all.rules,
            ...vitest.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginUnicorn.configs.all.rules,

            "@typescript-eslint/no-empty-function": "off",
            // Allow flexible patterns for benchmark mock implementations
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "off", // Benchmarks may not await all promises
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/require-await": "off", // Benchmarks may have async patterns
            camelcase: "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            complexity: "off",
            "default-case": "off",
            "dot-notation": "off",
            "func-names": "off",
            "func-style": "off",
            "id-length": "off",
            "import-x/no-extraneous-dependencies": "off",
            // Import rules relaxed for mock implementations
            "import-x/no-unused-modules": "off",
            "init-declarations": "off",
            "max-classes-per-file": "off",
            "max-depth": "off",
            // Allow large files and classes for comprehensive benchmarks
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "new-cap": "off", // Allow new-cap for class constructors
            "nitpick/no-redundant-vars": "off", // Allow redundant vars in benchmarks
            "no-await-in-loop": "off", // Allow await in loops for sequential operations

            "no-console": "off",
            "no-continue": "off",
            "no-div-regex": "off", // Allow division regex in benchmarks
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-inline-comments": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-magic-numbers": "off",
            "no-new": "off", // Allow new for class constructors
            "no-plusplus": "off",
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-shadow": "off",
            "no-ternary": "off",
            "no-throw-literal": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off", // Allow use before define in benchmarks
            "no-useless-assignment": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": "off",
            "prefer-destructuring": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/filename-case": "off", // Allow benchmark files to have any case
            "unicorn/no-array-for-each": "off", // Benchmarks may use forEach for testing
            "unicorn/no-array-reduce": "off", // Benchmarks may test reduce performance
            "unicorn/no-await-expression-member": "off",
            // Allow performance-focused code patterns in benchmarks
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ],
            "unicorn/no-null": "off",
            "unicorn/no-process-exit": "off", // Allow process.exit in scripts
            "unicorn/no-unused-properties": "off",
            "unicorn/no-useless-undefined": "off",
            "unicorn/prefer-set-has": "off", // Benchmarks may compare different approaches
            "unicorn/prefer-spread": "off", // Benchmarks may test different patterns
            "unicorn/prevent-abbreviations": "off",
        },
        settings: {
            "import-x/resolver": {
                node: true,
                project: ["./config/scripts/tsconfig.scripts.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["./config/scripts/tsconfig.scripts.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
        },
    },

    // JS/MJS Configuration files
    {
        files: [
            "**/*.config.{js,mjs,cts,cjs}",
            "**/*.config.**.*.{js,mjs,cts,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            compat: pluginCompat,
            css: css,
            depend: depend,
            functional: pluginFunctional,
            "import-x": importX,
            js: js,
            "jsx-a11y": jsxA11y,
            math: eslintPluginMath,
            n: nodePlugin,
            "no-unsanitized": nounsanitized,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            "react-hooks": reactHooks,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
        },
        rules: {
            ...js.configs.all.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.react.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            camelcase: "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "depend/ban-dependencies": "error",
            "dot-notation": "off",
            "func-style": "off",
            "id-length": "off",
            "max-classes-per-file": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "no-console": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off", // Configs often use different scoping
            "unicorn/filename-case": "off", // Allow config files to have any case
            "unicorn/no-await-expression-member": "off", // Allow await in config expressions
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-null": "off", // Null is common in config setups
            "unicorn/no-unused-properties": "off", // Allow unused properties in config setups
            "unicorn/no-useless-undefined": "off", // Allow undefined in config setups
            "unicorn/prevent-abbreviations": "off", // Too many false positives in configs
            "unused-imports/no-unused-imports": "error",
        },
        settings: {
            "import-x/resolver": {
                node: true,
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            react: { version: "19" },
        },
    },

    // Strict Test files (Frontend)
    {
        files: [
            "shared/test/StrictTests/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "src/test/StrictTests/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "electron/test/StrictTests/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        plugins: {
            vitest: vitest,
        },
        rules: {
            ...vitest.configs.all.rules,
        },
        settings: {
            vitest: {
                typecheck: true,
            },
        },
    },

    // Theme components override - disable react-perf rule for inline styling
    {
        files: ["src/theme/**/*.{ts,tsx,cts,mts}"],
        rules: {
            // Theme components legitimately need inline styles for dynamic theming
            "react-perf/jsx-no-new-object-as-prop": "warn",
        },
    },

    // YAML/YML disable empty key for github workflows (false positive)
    {
        files: [
            "**/.github/workflows/**/*.{yaml,yml}",
            "config/tools/flatpak-build.yml",
            "**/dependabot.yml",
            "**/.spellcheck.yml",
            "**/.pre-commit-config.yaml",
        ],
        rules: {
            "yml/block-mapping-colon-indicator-newline": "off",
            "yml/no-empty-key": "off",
            "yml/no-empty-mapping-value": "off",
            "yml/sort-keys": "off",
        },
    },

    // eslint-config-prettier MUST be last to override conflicting rules
    eslintConfigPrettier,
];
