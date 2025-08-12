// @ts-nocheck
/**
 * Optimized ESLint configuration for Uptime Watcher
 *
 * This configuration is specifically tailored for:
 * - Electron + React + TypeScript architecture
 * - Domain-driven design with Zustand stores
 * - Service-based backend architecture
 * - High code quality with reduced false positives
 * - Modern ES2024+ features
 * - Enhanced security and performance rules
 */

/* eslint-disable no-underscore-dangle */

/* eslint-disable no-magic-numbers */
/* eslint-disable no-inline-comments */
/* eslint-disable n/no-unpublished-import */
/* eslint-disable perfectionist/sort-imports */
/* eslint-disable max-lines */
/* eslint-disable id-length */
/* eslint-disable sort-keys */
/* eslint-disable perfectionist/sort-objects */
/* eslint-disable object-shorthand */
/* eslint-disable sort-imports */

// Import { plugin as ex } from "eslint-plugin-exception-handling";
// Import eslintPluginNoInferred from "eslint-plugin-no-inferred-method-name";
// Import stylistic from "@stylistic/eslint-plugin";
import { importX } from "eslint-plugin-import-x";
import { plugin as ex } from "eslint-plugin-exception-handling";
import arrayFunc from "eslint-plugin-array-func";
import depend from "eslint-plugin-depend";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginMath from "eslint-plugin-math";
import eslintPluginToml from "eslint-plugin-toml";
import eslintPluginYml from "eslint-plugin-yml";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintReactDom from "eslint-plugin-react-dom";
import eslintReactHooksExtra from "eslint-plugin-react-hooks-extra";
import eslintReactNamingConvention from "eslint-plugin-react-naming-convention";
import eslintReactWeb from "eslint-plugin-react-web-api";
import globals from "globals";
import html from "eslint-plugin-html";
import js from "@eslint/js";
import json from "@eslint/json";
import jsoncEslintParser from "jsonc-eslint-parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import markdown from "@eslint/markdown";
import nodePlugin from "eslint-plugin-n";
import nounsanitized from "eslint-plugin-no-unsanitized";
import pluginBoundaries from "eslint-plugin-boundaries";
import pluginCanonical from "eslint-plugin-canonical";
// eslint-disable-next-line depend/ban-dependencies -- Recommended one sucks
import pluginComments from "eslint-plugin-eslint-comments";
import pluginCompat from "eslint-plugin-compat";
import pluginFunctional from "eslint-plugin-functional";
import pluginNoOnly from "eslint-plugin-no-only-tests";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginPromise from "eslint-plugin-promise";
// eslint-disable-next-line depend/ban-dependencies -- Recommended one sucks
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
import pluginSecurity from "eslint-plugin-security";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import pluginTsdoc from "eslint-plugin-tsdoc";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginWriteGood from "eslint-plugin-write-good-comments";
import putout from "eslint-plugin-putout";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";
import tomlEslintParser from "toml-eslint-parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";
import xss from "eslint-plugin-xss";
import yamlEslintParser from "yaml-eslint-parser";
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import pluginSortDestructure from "eslint-plugin-sort-destructure-keys";

import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

import * as cssPlugin from "eslint-plugin-css";

// Unused and Uninstalled Plugins:
// eslint-config-prettier
// eslint-find-rules
// eslint-formatter-compact -- Built into eslint
// eslint-import-resolver-node -- Replaced by import-x
// eslint-plugin-css-modules - Replaced by css-plugin
// eslint-plugin-json
// eslint-plugin-no-inferred-method-name
// eslint-plugin-react-native
// eslint-plugin-react-x

// Don't use
// eslint-plugin-import -- Replaced by import-x

// Schema: https://www.schemastore.org/eslintrc.json

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
    importX.flatConfigs.typescript,
    // Global ignores - must be first and more comprehensive
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
            "**/_ZENTASKS*",
            "**/.agentic-tools*",
            "**/chatproject.md",
            "**/coverage-results.json",
            "**/Coverage/**",
            "**/coverage/**",
            "**/dist-electron/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/release/**",
            "**/test/themeTypes.test.tsx",
            "**/test/types.test.tsx",
            "Coverage/",
            "coverage/",
            "dist-electron/",
            "dist/",
            "docs/docusaurus/**",
            "docs/Archive/**",
            "docs/Packages/**",
            "docs/Reviews/**",
            "node_modules/**",
            "docs/Logger-Error-report.md",
            "release/",
            "test/themeTypes.test.tsx",
            "test/types.test.tsx",
            "coverage-report.json",
            // "**/*.config.{js,mjs,ts}",
        ],
    },
    // Global browser environment
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

    {
        settings: {
            "import-x/resolver": {
                node: true,
            },
            react: { version: "19" },
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    noWarnOnMultipleProjects: true, // Don't warn about multiple projects
                    bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)
                    // Use an array
                    project: [
                        "tsconfig.electron.json",
                        "tsconfig.electron.test.json",
                        "tsconfig.json",
                        "tsconfig.test.json",
                    ],
                }),
            ],
        },
    },

    // YAML files
    {
        plugins: { eslintPluginYml: eslintPluginYml },
        files: [
            "*.yaml",
            "*.yml",
        ],
        ignores: ["docs/docusaurus/**"],
        ...eslintPluginYml.configs["flat/prettier"].rules,
        languageOptions: {
            parser: yamlEslintParser,
            // Options used with yaml-eslint-parser.
            parserOptions: {
                defaultYAMLVersion: "1.2",
            },
        },
    },

    // HTML files
    {
        plugins: { html },
        files: ["**/*.html"],
        ignores: ["docs/docusaurus/**", "report/**"],
    },

    // Markdown files
    {
        files: ["**/*.md"],
        ignores: ["docs/docusaurus/**"],
        ...markdown.configs.recommended[0],
        plugins: { markdown },
        language: "markdown/gfm",
    },

    // JSON files
    {
        files: [
            "**/*.json",
            "**/*.json5",
            "**/*.jsonc",
            "*.json",
            "*.json5",
            "*.jsonc",
        ],
        ignores: ["docs/docusaurus/**"],
        plugins: { eslintPluginJsonc: eslintPluginJsonc },
        ...json.configs.recommended[0],
        ...eslintPluginJsonc.configs["flat/prettier"][0],
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
    },

    // TOML files
    {
        files: ["**/*.toml"],
        ignores: ["lychee.toml"],
        ...eslintPluginToml.configs["flat/standard"][0],
        languageOptions: {
            parser: tomlEslintParser,
            parserOptions: { tomlVersion: "1.0.0" },
        },
    },

    // TSX Tailwind Linting files
    {
        files: [
            "src/**/*.tsx",
        ],
        ignores: [],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.json",
                sourceType: "module",
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxFragmentName: "React.Fragment",
                jsxPragma: "React",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                window: "readonly",
            },
        },
        settings: {
            tailwindcss: {
                config: `${__dirname}/src/index.css`,
            },
            react: { version: "19" },
            "boundaries/elements": [
                { type: "app", pattern: "src/App.tsx" },
                { type: "components", pattern: "src/components/**/*" },
                { type: "stores", pattern: "src/stores/**/*" },
                { type: "hooks", pattern: "src/hooks/**/*" },
                { type: "services", pattern: "src/services/**/*" },
                { type: "theme", pattern: "src/theme/**/*" },
                { type: "utils", pattern: "src/utils/**/*" },
                { type: "types", pattern: "src/types.ts" },
            ],
        },
        plugins: {
            css: cssPlugin,
            tailwind: tailwind,
        },
        rules: {
            // TypeScript rules
            ...tailwind.configs["flat/recommended"].rules,
            ...cssPlugin.configs["flat/standard"].rules,

            // Tailwind CSS
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

            "css/color-hex-style": "warn",
            "css/named-color": "warn",
            "css/no-dupe-properties": "warn",
            "css/no-invalid-color-hex": "warn",
            "css/no-length-zero-unit": "warn",
            "css/no-number-trailing-zeros": "warn",
            "css/no-shorthand-property-overrides": "warn",
            "css/no-unknown-property": "warn",
            "css/no-unknown-unit": "warn",
            "css/no-useless-color-alpha": "warn",
        },
    },

    // TypeScript frontend files (React + Zustand)
    {
        files: [
            "src/**/*.ts",
            "src/**/*.tsx",
            "shared/**/*.ts",
            "shared/**/*.tsx",
        ],
        ignores: [
            "**/*.spec.{ts,tsx}",
            "**/*.test.{ts,tsx}",
            "shared/**/*.spec.{ts,tsx}",
            "shared/**/*.test.{ts,tsx}",
            "shared/test/**/*.ts",
            "src/test/**/*.{ts,tsx}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.json",
                sourceType: "module",
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxFragmentName: "React.Fragment",
                jsxPragma: "React",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                window: "readonly",
            },
        },
        settings: {
            tailwind: {
                config: "./tailwind.config.js",
            },
            react: { version: "19" },
            "boundaries/elements": [
                { type: "app", pattern: "src/App.tsx" },
                { type: "components", pattern: "src/components/**/*" },
                { type: "stores", pattern: "src/stores/**/*" },
                { type: "hooks", pattern: "src/hooks/**/*" },
                { type: "services", pattern: "src/services/**/*" },
                { type: "theme", pattern: "src/theme/**/*" },
                { type: "utils", pattern: "src/utils/**/*" },
                { type: "types", pattern: "src/types.ts" },
            ],
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            "import-x/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["tsconfig.json"],
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.electron.json"],
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "jsx-a11y": jsxA11y,
            "no-unsanitized": nounsanitized,
            "prefer-arrow": pluginPreferArrow,
            "react-hooks": pluginReactHooks,
            "react-refresh": reactRefresh,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: cssPlugin,
            depend: depend,
            functional: pluginFunctional,
            js: js,
            math: eslintPluginMath,
            n: nodePlugin,
            perfectionist: pluginPerfectionist,
            "import-x": importX,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            tailwind: tailwind,
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "eslint-comments": pluginComments,
            ex: ex,
            canonical: pluginCanonical,
            "@eslint-react": eslintReact,
            "@eslint-react/dom": eslintReactDom,
            "@eslint-react/web-api": eslintReactWeb,
            "@eslint-react/hooks-extra": eslintReactHooksExtra,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            xss: xss,
            "array-func": arrayFunc,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "sort-destructure-keys": pluginSortDestructure,
        },
        rules: {
            // TypeScript rules
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...reactRefresh.configs.vite.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...pluginReactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...cssPlugin.configs["flat/standard"].rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-typescript"].rules,
            ...arrayFunc.configs.all.rules,
            ...pluginSortClassMembers.configs["flat/recommended"].rules,
            ...eslintPluginNoUseExtendNative.configs.recommended.rules,
            ...pluginMicrosoftSdl.configs.required.rules,

            "sort-destructure-keys/sort-destructure-keys": "warn",

            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            "@eslint-react/naming-convention/use-state": "warn",

            "sort-class-members/sort-class-members": [
                "warn",
                {
                    accessorPairPositioning: "together",
                    stopAfterFirstProblem: false,
                    sortInterfaces: true,
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
                },
            ],
            "perfectionist/sort-classes": "off",
            "perfectionist/sort-modules": [
                "off",
                {
                    type: "alphabetical",
                    order: "asc",
                    ignoreCase: true,
                    specialCharacters: "keep",
                    partitionByComment: false,
                    partitionByNewLine: false,
                    newlinesBetween: "ignore",
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
                    customGroups: [],
                },
            ],

            "xss/no-location-href-assign": "error",

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
            "canonical/prefer-inline-type-import": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "canonical/prefer-import-alias": [
                "error",
                {
                    aliases: [
                        {
                            alias: "@shared/",
                            matchParent: path.resolve(__dirname, "shared"),
                            matchPath: String.raw`^shared\/`,
                        },
                        {
                            alias: "@electron/",
                            matchParent: path.resolve(__dirname, "electron"),
                            matchPath: String.raw`^electron\/`,
                        },
                    ],
                },
            ],

            "ex/no-unhandled": "warn",

            "n/file-extension-in-import": "off", // Allow missing file extensions for imports
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax

            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",

            // "write-good-comments/write-good-comments": "warn",

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

            "unicorn/prefer-spread": "off",
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            "unicorn/no-null": "off", // React commonly uses null for conditional rendering

            // Import rules
            "import-x/no-unassigned-import": [
                "error",
                {
                    allow: ["**/*.css", "**/*.scss"], // Allow CSS imports without assignment
                },
            ],

            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "prefer-const": "error",
            "prefer-template": "warn",
            curly: [
                "error",
                "all",
            ],
            eqeqeq: [
                "error",
                "always",
            ],

            // Code spacing and formatting rules
            "lines-around-comment": [
                "error",
                {
                    beforeBlockComment: true,
                    afterBlockComment: false,
                    beforeLineComment: true,
                    afterLineComment: false,
                    allowBlockStart: true,
                    allowBlockEnd: false,
                    allowObjectStart: true,
                    allowObjectEnd: false,
                    allowArrayStart: true,
                    allowArrayEnd: false,
                    allowClassStart: true,
                    allowClassEnd: false,
                    applyDefaultIgnorePatterns: true,
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
            "padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    prev: "function",
                    next: "*",
                },
                {
                    blankLine: "always",
                    prev: "*",
                    next: "function",
                },
                {
                    blankLine: "always",
                    prev: "class",
                    next: "*",
                },
                {
                    blankLine: "always",
                    prev: "*",
                    next: "class",
                },
            ],

            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],

            // React 19 optimized rules
            "react/jsx-boolean-value": "warn",
            "react/jsx-fragments": [
                "warn",
                "syntax",
            ],
            "react/jsx-key": "error",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-uses-react": "warn",
            "react/no-array-index-key": "warn",
            "react/no-unstable-nested-components": "error",
            "react/prop-types": "warn",
            "react/react-in-jsx-scope": "off",
            "react/self-closing-comp": "warn",

            // React Hooks
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/rules-of-hooks": "error",

            // Accessibility
            "jsx-a11y/alt-text": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            "jsx-a11y/no-autofocus": "warn",

            // Code organization and architecture
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            from: "app",
                            allow: [
                                "components",
                                "stores",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                            ],
                        },
                        {
                            from: "components",
                            allow: [
                                "components",
                                "hooks",
                                "services",
                                "theme",
                                "utils",
                                "types",
                                "stores",
                            ],
                        },
                        {
                            from: "hooks",
                            allow: [
                                "stores",
                                "services",
                                "types",
                                "utils",
                            ],
                        },
                        {
                            from: "services",
                            allow: [
                                "types",
                                "utils",
                            ],
                        },
                        {
                            from: "stores",
                            allow: [
                                "services",
                                "types",
                                "utils",
                                "stores",
                                "components",
                            ],
                        },
                        { from: "theme", allow: ["types"] },
                        { from: "types", allow: [] },
                        { from: "utils", allow: ["types"] },
                    ],
                },
            ],

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
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                    checkProperties: false,
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-negated-condition": "warn", // Sometimes clearer
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS needed for Electron
            "unicorn/prefer-node-protocol": "warn",
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/prefer-top-level-await": "off", // Not suitable for React

            // Function style preferences - disabled as too aggressive
            // "prefer-arrow/prefer-arrow-functions": [
            //     "warn",
            //     {
            //         DisallowPrototype: true,
            //         SingleReturnOnly: false,
            //         ClassPropertiesAllowed: false,
            //     },
            // ],

            // Security for Frontend
            "redos/no-vulnerable": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-require": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-object-injection": "off",

            // Performance and compatibility
            "compat/compat": "off", // Electron supports modern APIs, Opera Mini not a target

            // Code style
            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],

            // Documentation
            "tsdoc/syntax": "warn",

            // RegExp rules for security and performance
            "regexp/no-potentially-useless-backreference": "warn",
            "regexp/no-super-linear-backtracking": "error",
            "regexp/no-unused-capturing-group": "warn",
            "regexp/no-useless-escape": "warn",
            "regexp/no-useless-quantifier": "warn",
            "regexp/optimal-quantifier-concatenation": "warn",
            "regexp/prefer-character-class": "warn",
            "regexp/prefer-plus-quantifier": "warn",
            "regexp/prefer-star-quantifier": "warn",

            // Disable overly strict rules for this project
            "@typescript-eslint/no-explicit-any": "warn", // Sometimes needed
            "@typescript-eslint/no-non-null-assertion": "warn", // Zustand patterns
            "functional/immutable-data": "off",
            "functional/no-let": "off", // Let is necessary in many React patterns

            // Function and type safety rules
            "@typescript-eslint/consistent-type-assertions": "error",
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
            "@typescript-eslint/no-empty-object-type": "error",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],

            // Advanced type-checked rules for async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues
                },
            ],
            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                    checksSpreads: true, // Check Promise spreads
                },
            ],
            "@typescript-eslint/require-await": "error", // Functions marked async must use await
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch

            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "error", // Remove redundant type assertions
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any
            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions

            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive

            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types

            "@typescript-eslint/adjacent-overload-signatures": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/ban-tslint-comment": "warn",
            "@typescript-eslint/class-literal-property-style": "warn",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/consistent-generic-constructors": "warn",
            "@typescript-eslint/consistent-indexed-object-style": "warn",
            "@typescript-eslint/consistent-return": "warn",
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
            "@typescript-eslint/no-extra-non-null-assertion": "warn",
            "@typescript-eslint/no-extraneous-class": "warn",
            "@typescript-eslint/no-for-in-array": "warn",
            "@typescript-eslint/no-implied-eval": "warn",
            // Keep enabled: Helps with bundle optimization and makes type vs runtime imports clearer.
            // Can be resolved incrementally as warnings.
            "@typescript-eslint/no-import-type-side-effects": "warn",
            "@typescript-eslint/no-invalid-this": "warn",
            "@typescript-eslint/no-invalid-void-type": "warn",
            "@typescript-eslint/no-loop-func": "warn",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-meaningless-void-operator": "warn",
            "@typescript-eslint/no-misused-new": "warn",
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
            "@typescript-eslint/no-shadow": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            "@typescript-eslint/no-unnecessary-parameter-property-assignment":
                "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "warn",
            "@typescript-eslint/no-unnecessary-template-expression": "warn",
            "@typescript-eslint/no-unnecessary-type-arguments": "warn",
            "@typescript-eslint/no-unnecessary-type-constraint": "warn",
            "@typescript-eslint/no-unnecessary-type-conversion": "warn",
            "@typescript-eslint/no-unnecessary-type-parameters": "warn",

            "@typescript-eslint/no-unsafe-declaration-merging": "warn",
            "@typescript-eslint/no-unsafe-enum-comparison": "warn",

            "@typescript-eslint/no-unsafe-type-assertion": "warn",
            "@typescript-eslint/no-unsafe-unary-minus": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            // Disabled: Function declarations are hoisted in JS/TS, and this rule creates unnecessary constraints
            // For Electron projects that often organize helper functions after main functions for better readability
            "@typescript-eslint/no-use-before-define": "warn",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-useless-empty-export": "warn",
            "@typescript-eslint/non-nullable-type-assertion-style": "warn",
            "@typescript-eslint/only-throw-error": "warn",
            "@typescript-eslint/parameter-properties": "warn",
            "@typescript-eslint/prefer-as-const": "warn",
            "@typescript-eslint/prefer-destructuring": "warn",
            "@typescript-eslint/prefer-enum-initializers": "warn",
            "@typescript-eslint/prefer-find": "warn",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-includes": "warn",
            "@typescript-eslint/prefer-literal-enum-member": "warn",
            "@typescript-eslint/prefer-namespace-keyword": "warn",
            "@typescript-eslint/prefer-promise-reject-errors": "warn",
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
            "@typescript-eslint/restrict-plus-operands": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/triple-slash-reference": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/unified-signatures": "warn",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",

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
            "react/jsx-child-element-spacing": "warn",
            "react/jsx-closing-bracket-location": "warn",
            "react/jsx-closing-tag-location": "warn",
            "react/jsx-curly-brace-presence": "warn",
            "react/jsx-curly-newline": "off",
            "react/jsx-curly-spacing": "off",
            "react/jsx-equals-spacing": "off",
            "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }], // Enforce .tsx for JSX files
            "react/jsx-first-prop-new-line": "off",
            "react/jsx-handler-names": "warn", // Enforce consistent handler names
            "react/jsx-indent": "off",
            "react/jsx-indent-props": "off",
            "react/jsx-max-depth": ["warn", { max: 7 }], // Warn on deeply nested JSX to encourage component extraction
            "react/jsx-max-props-per-line": "off",
            "react/jsx-newline": "off",
            "react/jsx-no-bind": "warn", // Allow inline functions for development speed
            "react/jsx-no-constructed-context-values": "warn",
            "react/jsx-no-leaked-render": "warn",
            "react/jsx-no-literals": "off",
            "react/jsx-no-script-url": "warn",
            "react/jsx-one-expression-per-line": "warn",
            "react/jsx-pascal-case": "warn",
            "react/jsx-props-no-multi-spaces": "warn",
            "react/jsx-props-no-spread-multi": "warn",
            "react/jsx-props-no-spreading": "off",
            "react/jsx-sort-props": "warn",
            "react/jsx-tag-spacing": "warn",
            "react/jsx-wrap-multilines": "warn",
            "react/no-access-state-in-setstate": "warn",
            "react/no-adjacent-inline-elements": "warn",
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
            "react/no-unused-class-component-methods": "warn",
            "react/no-unused-prop-types": "warn",
            "react/no-unused-state": "warn",
            "react/no-will-update-set-state": "warn",
            "react/prefer-es6-class": "warn",
            "react/prefer-exact-props": "warn",
            "react/prefer-read-only-props": "warn",
            "react/prefer-stateless-function": "warn",
            "react/require-default-props": "off",
            "react/require-optimization": "warn",
            "react/sort-comp": "warn",
            "react/sort-default-props": "warn",
            "react/sort-prop-types": "warn",
            "react/state-in-constructor": "warn",
            "react/static-property-placement": "warn",
            "react/style-prop-object": "warn",
            "react/void-dom-elements-no-children": "warn",

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
            "regexp/sort-character-class-elements": "warn",
            "regexp/unicode-escape": "warn",
            "regexp/unicode-property": "warn",

            // // Tailwind CSS
            // "tailwind/classnames-order": "warn",
            // "tailwind/enforces-negative-arbitrary-values": "warn",
            // "tailwind/enforces-shorthand": "warn",
            // "tailwind/migration-from-tailwind-2": "warn",
            // "tailwind/no-arbitrary-value": "warn",
            // "tailwind/no-contradicting-classname": "warn",
            // "tailwind/no-custom-classname": "off",
            // "tailwind/no-unnecessary-arbitrary-value": "warn",

            // CSS
            "css/color-hex-style": "warn",
            "css/named-color": "warn",
            "css/no-dupe-properties": "warn",
            "css/no-invalid-color-hex": "warn",
            "css/no-length-zero-unit": "warn",
            "css/no-number-trailing-zeros": "warn",
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
            "import-x/no-unresolved": "warn",
            "import-x/no-unused-modules": "warn",
            "import-x/no-useless-path-segments": "warn",
            "import-x/no-webpack-loader-syntax": "warn",
            "import-x/order": "off", // Conflicts with other rules
            "import-x/prefer-default-export": "off",
            "import-x/prefer-namespace-import": "warn",
            "import-x/unambiguous": "warn",

            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",

            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",

            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-process-env": "warn",
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
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

            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
        },
    },

    // Electron backend files
    {
        files: [
            "electron/**/*.ts",
            "shared/**/*.ts",
            "shared/**/*.tsx",
        ],
        ignores: [
            "electron/**/*.spec.{ts,tsx}",
            "electron/**/*.test.{ts,tsx}",
            "electron/test/**/*.ts",
            "shared/**/*.spec.{ts,tsx}",
            "shared/**/*.test.{ts,tsx}",
            "shared/test/**/*.ts",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.electron.json",
                sourceType: "module",
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxFragmentName: "React.Fragment",
                jsxPragma: "React",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                process: "readonly",
                Buffer: "readonly",
                global: "readonly",
                require: "readonly",
                module: "readonly",
            },
        },
        settings: {
            react: { version: "19" },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            "boundaries/elements": [
                { type: "main", pattern: "electron/main.ts" },
                { type: "preload", pattern: "electron/preload.ts" },
                { type: "managers", pattern: "electron/managers/**/*" },
                { type: "services", pattern: "electron/services/**/*" },
                { type: "utils", pattern: "electron/utils/**/*" },
                { type: "events", pattern: "electron/events/**/*" },
                { type: "types", pattern: "electron/types.ts" },
            ],
            "import-x/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["tsconfig.electron.json"],
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.electron.json"],
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "jsx-a11y": jsxA11y,
            "no-unsanitized": nounsanitized,
            "prefer-arrow": pluginPreferArrow,
            "react-hooks": pluginReactHooks,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: cssPlugin,
            depend: depend,
            functional: pluginFunctional,
            js: js,
            math: eslintPluginMath,
            n: nodePlugin,
            perfectionist: pluginPerfectionist,
            "import-x": importX,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "eslint-comments": pluginComments,
            ex: ex,
            canonical: pluginCanonical,
            "@eslint-react": eslintReact,
            "@eslint-react/dom": eslintReactDom,
            "@eslint-react/web-api": eslintReactWeb,
            "@eslint-react/hooks-extra": eslintReactHooksExtra,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            xss: xss,
            "array-func": arrayFunc,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "sort-destructure-keys": pluginSortDestructure,
        },
        rules: {
            // TypeScript backend rules
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...pluginReactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...cssPlugin.configs["flat/standard"].rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-typescript"].rules,
            ...arrayFunc.configs.all.rules,
            ...pluginSortClassMembers.configs["flat/recommended"].rules,
            ...eslintPluginNoUseExtendNative.configs.recommended.rules,
            ...pluginMicrosoftSdl.configs.required.rules,

            "sort-destructure-keys/sort-destructure-keys": "warn",

            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            "@eslint-react/naming-convention/use-state": "warn",

            "sort-class-members/sort-class-members": [
                "warn",
                {
                    accessorPairPositioning: "together",
                    stopAfterFirstProblem: false,
                    sortInterfaces: true,
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
                },
            ],
            "perfectionist/sort-classes": "off",
            "perfectionist/sort-modules": [
                "off",
                {
                    type: "alphabetical",
                    order: "asc",
                    ignoreCase: true,
                    specialCharacters: "keep",
                    partitionByComment: false,
                    partitionByNewLine: false,
                    newlinesBetween: "ignore",
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
                    customGroups: [],
                },
            ],

            "xss/no-location-href-assign": "error",

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
            "canonical/prefer-inline-type-import": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "canonical/prefer-import-alias": [
                "error",
                {
                    aliases: [
                        {
                            alias: "@shared/",
                            matchParent: path.resolve(__dirname, "shared"),
                            matchPath: String.raw`^shared\/`,
                        },
                        {
                            alias: "@app/",
                            matchParent: path.resolve(__dirname, "src"),
                            matchPath: String.raw`^src\/`,
                        },
                    ],
                },
            ],

            "ex/no-unhandled": "warn",

            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",

            "n/file-extension-in-import": "off", // Allow missing file extensions for imports
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax

            // "write-good-comments/write-good-comments": "warn",

            "unicorn/no-null": "off", // Null is common in SQLite and IPC
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            "unicorn/prefer-spread": "off", // Prefer Array.From for readability

            // Node.js specific

            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "prefer-const": "error",
            "prefer-template": "warn",
            curly: [
                "error",
                "all",
            ],
            eqeqeq: [
                "error",
                "always",
            ],

            // Code spacing and formatting rules
            "lines-around-comment": [
                "error",
                {
                    beforeBlockComment: true,
                    afterBlockComment: false,
                    beforeLineComment: true,
                    afterLineComment: false,
                    allowBlockStart: true,
                    allowBlockEnd: false,
                    allowObjectStart: true,
                    allowObjectEnd: false,
                    allowArrayStart: true,
                    allowArrayEnd: false,
                    allowClassStart: true,
                    allowClassEnd: false,
                    applyDefaultIgnorePatterns: true,
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
            "padding-line-between-statements": [
                "error",
                {
                    blankLine: "always",
                    prev: "function",
                    next: "*",
                },
                {
                    blankLine: "always",
                    prev: "*",
                    next: "function",
                },
                {
                    blankLine: "always",
                    prev: "class",
                    next: "*",
                },
                {
                    blankLine: "always",
                    prev: "*",
                    next: "class",
                },
            ],

            "putout/align-spaces": "error",
            "putout/array-element-newline": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/function-declaration-paren-newline": "error",
            "putout/long-properties-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/newline-function-call-arguments": "off",
            "putout/object-property-newline": "error",
            "putout/objects-braces-inside-array": "error",
            "putout/single-property-destructuring": "off",
            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],

            // Architecture boundaries for Electron
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        { from: "events", allow: ["types"] },
                        {
                            from: "main",
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                        },
                        {
                            from: "managers",
                            allow: [
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                        },
                        {
                            from: "preload",
                            allow: [
                                "utils",
                                "types",
                            ],
                        },
                        {
                            from: "services",
                            allow: [
                                "services",
                                "utils",
                                "types",
                            ],
                        },
                        { from: "types", allow: [] },
                        {
                            from: "utils",
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                        },
                        { from: "utils", allow: ["types"] },
                    ],
                },
            ],

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
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                    checkProperties: false,
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-negated-condition": "warn", // Sometimes clearer
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/prefer-module": "warn", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-top-level-await": "off", // Not suitable for Electron main

            // Security for backend
            "redos/no-vulnerable": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-require": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-object-injection": "off",

            // Documentation
            "tsdoc/syntax": "warn",

            // Allow more flexibility for backend patterns
            "@typescript-eslint/no-explicit-any": "warn",
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

            // Function and type safety rules (same as frontend)
            "@typescript-eslint/consistent-type-assertions": "error",
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
            "@typescript-eslint/no-empty-object-type": "error",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],

            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],

            // Advanced type-checked rules for backend async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues in Node.js
                },
            ],
            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksSpreads: true, // Check Promise spreads
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                },
            ],
            "@typescript-eslint/require-await": "error", // Functions marked async must use await
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch

            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "error", // Remove redundant type assertions
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any
            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions

            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive

            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND,
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types

            "@typescript-eslint/adjacent-overload-signatures": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/ban-tslint-comment": "warn",
            "@typescript-eslint/class-literal-property-style": "warn",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/consistent-generic-constructors": "warn",
            "@typescript-eslint/consistent-indexed-object-style": "warn",
            "@typescript-eslint/consistent-return": "warn",
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
            "@typescript-eslint/no-extra-non-null-assertion": "warn",
            "@typescript-eslint/no-extraneous-class": "warn",
            "@typescript-eslint/no-for-in-array": "warn",
            "@typescript-eslint/no-implied-eval": "warn",
            // Keep enabled: Helps with bundle optimization and makes type vs runtime imports clearer.
            // Can be resolved incrementally as warnings.
            "@typescript-eslint/no-import-type-side-effects": "warn",
            "@typescript-eslint/no-invalid-this": "warn",
            "@typescript-eslint/no-invalid-void-type": "warn",
            "@typescript-eslint/no-loop-func": "warn",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-meaningless-void-operator": "warn",
            "@typescript-eslint/no-misused-new": "warn",
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
            "@typescript-eslint/no-shadow": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            "@typescript-eslint/no-unnecessary-parameter-property-assignment":
                "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "warn",
            "@typescript-eslint/no-unnecessary-template-expression": "warn",
            "@typescript-eslint/no-unnecessary-type-arguments": "warn",
            "@typescript-eslint/no-unnecessary-type-constraint": "warn",
            "@typescript-eslint/no-unnecessary-type-conversion": "warn",
            "@typescript-eslint/no-unnecessary-type-parameters": "warn",

            "@typescript-eslint/no-unsafe-declaration-merging": "warn",
            "@typescript-eslint/no-unsafe-enum-comparison": "warn",

            "@typescript-eslint/no-unsafe-type-assertion": "warn",
            "@typescript-eslint/no-unsafe-unary-minus": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            // Disabled: Function declarations are hoisted in JS/TS, and this rule creates unnecessary constraints
            // For Electron projects that often organize helper functions after main functions for better readability
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-useless-constructor": "warn",
            "@typescript-eslint/no-useless-empty-export": "warn",
            "@typescript-eslint/non-nullable-type-assertion-style": "warn",
            "@typescript-eslint/only-throw-error": "warn",
            "@typescript-eslint/parameter-properties": "warn",
            "@typescript-eslint/prefer-as-const": "warn",
            "@typescript-eslint/prefer-destructuring": "warn",
            "@typescript-eslint/prefer-enum-initializers": "warn",
            "@typescript-eslint/prefer-find": "warn",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-includes": "warn",
            "@typescript-eslint/prefer-literal-enum-member": "warn",
            "@typescript-eslint/prefer-namespace-keyword": "warn",
            "@typescript-eslint/prefer-promise-reject-errors": "warn",
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
            "@typescript-eslint/restrict-plus-operands": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/triple-slash-reference": "warn",
            "@typescript-eslint/unbound-method": "warn",
            "@typescript-eslint/unified-signatures": "warn",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",

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

            // CSS
            "css/color-hex-style": "warn",
            "css/named-color": "warn",
            "css/no-dupe-properties": "warn",
            "css/no-invalid-color-hex": "warn",
            "css/no-length-zero-unit": "warn",
            "css/no-number-trailing-zeros": "warn",
            "css/no-shorthand-property-overrides": "warn",
            "css/no-unknown-property": "warn",
            "css/no-unknown-unit": "warn",
            "css/no-useless-color-alpha": "warn",
            "css/number-leading-zero": "warn",
            "css/prefer-reduce-shorthand-property-box-values": "warn",
            "css/property-casing": "warn",

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

            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",

            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",

            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-process-env": "warn",
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
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

            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
        },
    },

    // Test files (Frontend)
    {
        files: [
            "shared/**/*.spec.{ts,tsx}",
            "shared/**/*.test.{ts,tsx}",
            "shared/test/**/*.ts",
            "src/**/*.spec.{ts,tsx}",
            "src/**/*.test.{ts,tsx}",
            "src/test/**/*.{ts,tsx}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.test.json",
                sourceType: "module",
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxFragmentName: "React.Fragment",
                jsxPragma: "React",
                warnOnUnsupportedTypeScriptVersion: true,
            },
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
        },
        settings: {
            react: { version: "19" },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            "import-x/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["tsconfig.test.json"],
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.test.json"],
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            vitest: vitest,
            "testing-library": pluginTestingLibrary,
            "import-x": importX,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            n: nodePlugin,
            "eslint-comments": pluginComments,
            unicorn: pluginUnicorn,
        },

        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.all.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            ...pluginUnicorn.configs["flat/all"].rules,

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",

            "testing-library/no-node-access": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/prefer-screen-queries": "warn",
            "unused-imports/no-unused-imports": "error",

            // Relaxed function rules for tests (explicit for clarity)
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
        },
    },

    // Test files (Backend) + Configuration files
    {
        files: [
            "electron/**/*.spec.{ts,tsx}",
            "electron/**/*.test.{ts,tsx}",
            "electron/test/**/*.{ts,tsx}",
            "shared/**/*.spec.{ts,tsx}",
            "shared/**/*.test.{ts,tsx}",
            "shared/test/**/*.ts",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.electron.test.json",
                sourceType: "module",
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxFragmentName: "React.Fragment",
                jsxPragma: "React",
                warnOnUnsupportedTypeScriptVersion: true,
            },
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
                test: "readonly",
                vi: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "no-only-tests": pluginNoOnly,
            "unused-imports": pluginUnusedImports,
            "import-x": importX,
            unicorn: pluginUnicorn,
            vitest: vitest,
            n: nodePlugin,
            "testing-library": pluginTestingLibrary,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.all.rules,
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,

            "testing-library/no-node-access": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/prefer-screen-queries": "warn",

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",

            "unicorn/no-keyword-prefix": [
                "error",
                {
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                    checkProperties: false,
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-useless-undefined": "off", // Allow undefined in test setups
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/no-unused-properties": "off", // Allow unused properties in test setups
            "unicorn/no-null": "off", // Null is common in test setups
            "unicorn/no-await-expression-member": "off", // Allow await in test expressions
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/prevent-abbreviations": "off", // Too many false positives in tests
            "unused-imports/no-unused-imports": "error",

            // Relaxed function rules for backend tests (explicit for clarity)

            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            // No Only Tests
            "no-only-tests/no-only-tests": "error",
        },
        settings: {
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            "import-x/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["tsconfig.electron.test.json"],
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.electron.test.json"],
                },
            },
        },
    },

    // TypeScript Config files using Electron Test TSConfig
    {
        files: [
            "**/*.config.{ts}", // Configuration files
            "**/*.config.ts", // Configuration files
            "**/*.config.{ts}", // Configuration files
        ],
        ignores: [
            "./.*/**",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.electron.test.json",
                sourceType: "module",
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxFragmentName: "React.Fragment",
                jsxPragma: "React",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
                __dirname: "readonly",
                __filename: "readonly",
                process: "readonly",
                Buffer: "readonly",
                global: "readonly",
                require: "readonly",
                module: "readonly",
            },
        },
        settings: {
            react: { version: "19" },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            "boundaries/elements": [
                { type: "main", pattern: "electron/main.ts" },
                { type: "preload", pattern: "electron/preload.ts" },
                { type: "managers", pattern: "electron/managers/**/*" },
                { type: "services", pattern: "electron/services/**/*" },
                { type: "utils", pattern: "electron/utils/**/*" },
                { type: "events", pattern: "electron/events/**/*" },
                { type: "types", pattern: "electron/types.ts" },
            ],
            "import-x/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["tsconfig.electron.test.json"],
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.electron.test.json"],
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "jsx-a11y": jsxA11y,
            "no-unsanitized": nounsanitized,
            "prefer-arrow": pluginPreferArrow,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: cssPlugin,
            depend: depend,
            functional: pluginFunctional,
            js: js,
            math: eslintPluginMath,
            n: nodePlugin,
            perfectionist: pluginPerfectionist,
            "import-x": importX,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
            "eslint-comments": pluginComments,
            ex: ex,
            canonical: pluginCanonical,
            xss: xss,
            "array-func": arrayFunc,
        },
        rules: {
            // TypeScript backend rules
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylisticTypeChecked,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs["flat/all"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...cssPlugin.configs["flat/standard"].rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...arrayFunc.configs.all.rules,

            "n/no-unpublished-import": "off",
            "n/no-process-env": "off", // Allow process.env usage in Electron

            "xss/no-location-href-assign": "error",

            "canonical/no-barrel-import": "error",
            "canonical/export-specifier-newline": "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/import-specifier-newline": "off",
            "canonical/filename-no-index": "error",

            "ex/no-unhandled": "warn",

            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",

            "n/file-extension-in-import": "off", // Allow missing file extensions for imports
            "n/no-missing-file-extension": "off", // Allow missing file extensions for imports
            "n/no-missing-import": "off", // Allow missing imports for dynamic imports
            "n/no-unsupported-features/es-syntax": "off", // Allow modern ES2024+ syntax

            // "write-good-comments/write-good-comments": "warn",

            "unicorn/no-null": "off", // Null is common in SQLite and IPC
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            "unicorn/prefer-spread": "off", // Prefer Array.From for readability
            // Node.js specific
            // "no-console": "off", // Logging is important for backend - DISABLED FOR NOW
            "no-var": "error",
            "prefer-const": "error",

            "putout/align-spaces": "error",
            "putout/array-element-newline": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/function-declaration-paren-newline": "error",
            "putout/long-properties-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/newline-function-call-arguments": "off",
            "putout/object-property-newline": "error",
            "putout/objects-braces-inside-array": "error",
            "putout/single-property-destructuring": "off",
            // Import management
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],

            // Architecture boundaries for Electron
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        { from: "events", allow: ["types"] },
                        {
                            from: "main",
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                        },
                        {
                            from: "managers",
                            allow: [
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                        },
                        {
                            from: "preload",
                            allow: [
                                "utils",
                                "types",
                            ],
                        },
                        {
                            from: "services",
                            allow: [
                                "services",
                                "utils",
                                "types",
                            ],
                        },
                        { from: "types", allow: [] },
                        {
                            from: "utils",
                            allow: [
                                "managers",
                                "services",
                                "utils",
                                "events",
                                "types",
                            ],
                        },
                        { from: "utils", allow: ["types"] },
                    ],
                },
            ],

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
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                    checkProperties: false,
                },
            ],
            "unicorn/prefer-module": "off", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-top-level-await": "off", // Not suitable for Electron main

            // Security for backend
            "redos/no-vulnerable": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-require": "error",
            "security/detect-non-literal-regexp": "warn",
            "security/detect-object-injection": "off",

            // Documentation
            "tsdoc/syntax": "warn",

            // Allow more flexibility for backend patterns
            "@typescript-eslint/no-explicit-any": "warn",
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
            "@typescript-eslint/no-empty-object-type": "error",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    allow: ["arrowFunctions"], // Allow empty arrow functions for React useEffect cleanup
                },
            ],

            "prettier/prettier": [
                "warn",
                { usePrettierrc: true },
            ],

            // Advanced type-checked rules for backend async safety and runtime error prevention
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreVoid: true, // Allow void for intentionally ignored promises
                    ignoreIIFE: false, // Catch floating IIFEs which can cause issues in Node.js
                },
            ],
            "@typescript-eslint/await-thenable": "error", // Prevent awaiting non-promises
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: true, // Check if Promises used in conditionals
                    checksSpreads: true, // Check Promise spreads
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                },
            ],
            "@typescript-eslint/require-await": "error", // Functions marked async must use await
            "@typescript-eslint/return-await": [
                "error",
                "in-try-catch",
            ], // Proper await handling in try-catch

            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "off", // Remove redundant type assertions
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any
            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions

            // Backend-specific type safety
            "@typescript-eslint/prefer-readonly": "warn", // Prefer readonly for service class properties
            "@typescript-eslint/switch-exhaustiveness-check": "error", // Ensure switch statements are exhaustive

            // Null safety for backend operations
            "@typescript-eslint/no-unnecessary-condition": [
                "warn",
                {
                    allowConstantLoopConditions: true, // Allow while(true) patterns in services
                },
            ],
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: false, // Check conditionals for nullish coalescing opportunities
                    ignoreMixedLogicalExpressions: false, // Check complex logical expressions
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error", // Use optional chaining instead of logical AND
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/array-type": [
                "error",
                { default: "array-simple" },
            ], // Prefer T[] for simple types, Array<T> for complex types
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

            // CSS
            "css/color-hex-style": "warn",
            "css/named-color": "warn",
            "css/no-dupe-properties": "warn",
            "css/no-invalid-color-hex": "warn",
            "css/no-length-zero-unit": "warn",
            "css/no-number-trailing-zeros": "warn",
            "css/no-shorthand-property-overrides": "warn",
            "css/no-unknown-property": "warn",
            "css/no-unknown-unit": "warn",
            "css/no-useless-color-alpha": "warn",
            "css/number-leading-zero": "warn",
            "css/prefer-reduce-shorthand-property-box-values": "warn",
            "css/property-casing": "warn",

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

            // Accessibility (jsx-a11y)
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",

            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",

            // Node
            "n/callback-return": "warn",
            "n/exports-style": "warn",
            "n/global-require": "warn",
            "n/handle-callback-err": "warn",
            "n/no-callback-literal": "warn",
            "n/no-mixed-requires": "warn",
            "n/no-new-require": "warn",
            "n/no-path-concat": "warn",
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
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

            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
        },
    },

    // JS/MJS Configuration files
    {
        files: ["**/*.config.{js,mjs}"],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                process: "readonly",
                require: "readonly",
                module: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "jsx-a11y": jsxA11y,
            "no-unsanitized": nounsanitized,
            "prefer-arrow": pluginPreferArrow,
            "react-hooks": pluginReactHooks,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: cssPlugin,
            depend: depend,
            functional: pluginFunctional,
            js: js,
            math: eslintPluginMath,
            n: nodePlugin,
            perfectionist: pluginPerfectionist,
            "import-x": importX,
            prettier: pluginPrettier,
            promise: pluginPromise,
            putout: putout,
            react: pluginReact,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            tsdoc: pluginTsdoc,
            unicorn: pluginUnicorn,
        },
        rules: {
            ...js.configs.all.rules,
            ...pluginRegexp.configs["flat/all"].rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...pluginReactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/recommended"].rules,
            ...depend.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,

            "unicorn/no-keyword-prefix": [
                "error",
                {
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                    checkProperties: false,
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-useless-undefined": "off", // Allow undefined in config setups
            "unicorn/consistent-function-scoping": "off", // Configs often use different scoping
            "unicorn/no-unused-properties": "off", // Allow unused properties in config setups
            "unicorn/no-null": "off", // Null is common in config setups
            "unicorn/no-await-expression-member": "off", // Allow await in config expressions
            "unicorn/filename-case": "off", // Allow config files to have any case
            "unicorn/prevent-abbreviations": "off", // Too many false positives in configs
            "unused-imports/no-unused-imports": "error",
        },
        settings: {
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            "import-x/resolver": {
                node: true,
            },
            react: { version: "19" },
        },
    },

    // Strategic overrides for @typescript-eslint/no-unsafe-type-assertion
    // These files/patterns require type assertions due to their nature
    {
        files: [
            // Database utilities: handle SQLite's untyped results
            "electron/services/database/utils/typedQueries.ts",

            // Type utilities: centralized type manipulation helpers
            "shared/utils/typeHelpers.ts",

            // Database repositories: controlled SQL with known structure
            "electron/services/database/*Repository.ts",

            // Database utilities: type mapping and conversion
            "electron/services/database/utils/*.ts",

            // Validation utilities: runtime type checking
            "shared/validation/*.ts",

            // IPC layer: Electron boundary type assertions
            "electron/preload.ts",
            "electron/services/ipc/*.ts",

            // Event system core: generic type manipulation
            "electron/events/TypedEventBus.ts",
            "electron/events/middleware.ts",

            // Service containers and dependency injection
            "electron/services/ServiceContainer.ts",

            // Shared type utilities and safety helpers
            "shared/utils/*.ts",
            "shared/types/*.ts",

            // Theme and configuration types
            "src/theme/*.ts",
            "src/types/*.ts",

            // Chart and UI utilities with third-party integrations
            "src/services/chartConfig.ts",
            "src/utils/*.ts",

            // Store utilities for state management
            "src/stores/utils.ts",
            "src/stores/**/utils/*.ts",

            // Component utilities and form handling
            "src/components/**/use*.ts",
            "src/hooks/**/*.ts",

            // Monitor and system utilities with complex type assertions
            "electron/services/monitoring/*.ts",
            "electron/utils/*.ts",

            // React components with complex third-party integrations
            "src/components/**/*.tsx",
            "src/components/**/*.ts",

            // Additional utility files with necessary type assertions
            "electron/services/monitoring/utils/httpClient.ts",
            "electron/utils/database/DataImportExportService.ts",
            "src/services/logger.ts",
        ],
        rules: {
            // Allow type assertions in these contexts where they're necessary and well-documented
            "@typescript-eslint/no-unsafe-type-assertion": "off",
        },
    },

    // eslint-config-prettier MUST be last to override conflicting rules
    eslintConfigPrettier,
];
