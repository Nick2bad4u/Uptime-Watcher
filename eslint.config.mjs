// @ts-nocheck
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

/* eslint-disable import-x/namespace */
/* eslint-disable import-x/no-named-as-default-member */
/* eslint-disable no-underscore-dangle */

/* eslint-disable n/no-unpublished-import */
/* eslint-disable perfectionist/sort-imports */

/* eslint-disable perfectionist/sort-objects */

import { importX } from "eslint-plugin-import-x";
import { plugin as ex } from "eslint-plugin-exception-handling";
import * as nodeDependenciesPlugin from "eslint-plugin-node-dependencies";
import arrayFunc from "eslint-plugin-array-func";
import depend from "eslint-plugin-depend";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginJsonSchemaValidator from "eslint-plugin-json-schema-validator";
import eslintPluginMath from "eslint-plugin-math";
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import eslintPluginToml from "eslint-plugin-toml";
import eslintPluginYml from "eslint-plugin-yml";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintReactDom from "eslint-plugin-react-dom";
import eslintReactHooksExtra from "eslint-plugin-react-hooks-extra";
import reactHooksAddons from "eslint-plugin-react-hooks-addons";
import eslintReactNamingConvention from "eslint-plugin-react-naming-convention";
import eslintReactWeb from "eslint-plugin-react-web-api";
import globals from "globals";
// import html from "eslint-plugin-html";
import html from "@html-eslint/eslint-plugin";
import * as htmlParser from "@html-eslint/parser";
import implicitDependencies from "@jcoreio/eslint-plugin-implicit-dependencies";
import istanbul from "eslint-plugin-istanbul";
import js from "@eslint/js";
import json from "@eslint/json";
import jsoncEslintParser from "jsonc-eslint-parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import listeners from "eslint-plugin-listeners";
import markdown from "@eslint/markdown";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
import nodePlugin from "eslint-plugin-n";
import nounsanitized from "eslint-plugin-no-unsanitized";
import observers from "eslint-plugin-observers";
import pluginBoundaries from "eslint-plugin-boundaries";
import pluginCanonical from "eslint-plugin-canonical";
// eslint-disable-next-line depend/ban-dependencies -- Recommended one sucks
import pluginComments from "eslint-plugin-eslint-comments";
// eslint-disable-next-line import-x/no-unresolved -- Works fine
import pluginCompat from "eslint-plugin-compat";
import pluginFunctional from "eslint-plugin-functional";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import pluginNoOnly from "eslint-plugin-no-only-tests";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
import pluginPromise from "eslint-plugin-promise";
// eslint-disable-next-line depend/ban-dependencies -- Recommended one sucks
import pluginReact from "eslint-plugin-react";
// eslint-disable-next-line import-x/default -- Works fine
import reactHooks from "eslint-plugin-react-hooks";
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
import pluginSecurity from "eslint-plugin-security";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
import pluginSortDestructure from "eslint-plugin-sort-destructure-keys";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import pluginTsdoc from "eslint-plugin-tsdoc";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginWriteGood from "eslint-plugin-write-good-comments";
import progress from "eslint-plugin-file-progress";
import putout from "eslint-plugin-putout";
import reactCompiler from "eslint-plugin-react-compiler";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";
import tomlEslintParser from "toml-eslint-parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";
import xss from "eslint-plugin-xss";
import yamlEslintParser from "yaml-eslint-parser";
import sqlTemplate from "eslint-plugin-sql-template";
import * as pluginNFDAR from "eslint-plugin-no-function-declare-after-return";
import * as pluginJSDoc from "eslint-plugin-require-jsdoc";
import eslintPluginCommentLength from "eslint-plugin-comment-length";
import pluginSortReactDependency from "eslint-plugin-sort-react-dependency-arrays";
import pluginRegexLook from "eslint-plugin-no-lookahead-lookbehind-regexp";
import * as pluginDesignTokens from "@metamask/eslint-plugin-design-tokens";
import * as pluginFunctionNames from "eslint-plugin-function-name";
import * as pluginCleanCode from "eslint-plugin-clean-code";
import pluginFilenameExport from "eslint-plugin-filename-export";
import nitpick from "eslint-plugin-nitpick";
// Zod Tree Shaking Plugin https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831
import importZod from "eslint-plugin-import-zod";
import pluginUseMemo from "eslint-plugin-usememo-recommendations";
import pluginGoodEffects from "eslint-plugin-goodeffects";
import pluginJsxPlus from "eslint-plugin-jsx-plus";
import pluginNoUnary from "eslint-plugin-no-unary-plus";
import pluginGranular from "eslint-plugin-granular-selectors";
import moduleInterop from "eslint-plugin-module-interop";
import pluginNoUnwaited from "eslint-plugin-no-unawaited-dot-catch-throw";
import pluginTopLevel from "eslint-plugin-toplevel";
import pluginFormatSQL from "eslint-plugin-format-sql";
import pluginNeverThrow from "eslint-plugin-neverthrow";
import pluginNoExplicitTypeExports from "eslint-plugin-no-explicit-type-exports";
import pluginDeprecation from "eslint-plugin-deprecation";
import pluginReactTest from "eslint-plugin-react-require-testid";
import reactUseEffect from "eslint-plugin-react-useeffect";
import pluginNoConstructBind from "eslint-plugin-no-constructor-bind";
import pluginTotalFunctions from "eslint-plugin-total-functions";
import pluginValidateJSX from "eslint-plugin-validate-jsx-nesting";
import styledA11y from "eslint-plugin-styled-components-a11y";
import pluginReactFormFields from "eslint-plugin-react-form-fields";
import pluginReactHookForm from "eslint-plugin-react-hook-form";
// eslint-disable-next-line import-x/default -- Working fine just old
import preferFunctionComponent from "eslint-plugin-react-prefer-function-component";
import pluginSSR from "eslint-plugin-ssr-friendly";
import reactPerfPlugin from "eslint-plugin-react-perf";
import pluginUseMemo2 from "@arthurgeron/eslint-plugin-react-usememo";
import etc from "eslint-plugin-etc";
import packageJson from "eslint-plugin-package-json";
import pluginSafeJSX from "eslint-plugin-safe-jsx";
import pluginLoadableImports from "eslint-plugin-loadable-imports";
import zod from "eslint-plugin-zod";
import pluginUndefinedCss from "eslint-plugin-undefined-css-classes";
import css from "@eslint/css";
// * as cssPlugin from "eslint-plugin-css"

import * as mdx from "eslint-plugin-mdx";
// import * as tailwind4 from "tailwind-csstree";
import pluginNoHardcoded from "eslint-plugin-no-hardcoded-strings";
import * as publint from "eslint-plugin-publint";
import pluginCssModules from "eslint-plugin-css-modules";

import pluginDocusaurus from "@docusaurus/eslint-plugin";

import publintParser from "eslint-plugin-publint/jsonc-eslint-parser";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

import { fixupPluginRules } from "@eslint/compat";

// Unused and Uninstalled Plugins:
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

import path from "node:path";

// const __filename = fileURLToPath(import.meta.url);
// const gitignorePath = path.resolve(__dirname, ".gitignore");
const __dirname = import.meta.dirname;

export default [
    importX.flatConfigs.typescript,
    progress.configs.recommended,
    ...nodeDependenciesPlugin.configs["flat/recommended"],
    noBarrelFiles.flat,
    nitpick.configs.recommended,
    // Global ignores - must be first and more comprehensive
    {
        ignores: [
            "CHANGELOG.md",
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
            "**/shared/**",
            "**/node_modules/**",
            "**/release/**",
            "vite.config.ts", // Ignore vite config due to parsing issues
            "vitest.config.ts", // Ignore vitest config due to parsing issues
            "vitest.electron.config.ts", // Ignore vitest electron config
            "Coverage/",
            "coverage/",
            "dist-electron/",
            "dist/",
            "shared/",
            "docs/docusaurus/docs/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/Archive/**",
            "docs/Packages/**",
            "docs/Reviews/**",
            "node_modules/**",
            "docs/Logger-Error-report.md",
            "release/",
            "coverage-report.json",
            "html/**",
            "report/**",
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
                        "tsconfig.shared.json",
                        "tsconfig.shared.test.json",
                        "docs/docusaurus/tsconfig.json",
                        "docs/docusaurus/tsconfig.eslint.json",
                        "docs/docusaurus/tsconfig.typedoc.json",
                        "docs/docusaurus/tsconfig.local.typedoc.json",
                    ],
                }),
            ],
        },
    },

    // YAML files
    {
        plugins: { eslintPluginYml: eslintPluginYml },
        files: ["*.yaml", "*.yml"],
        ignores: [],
        rules: {
            ...eslintPluginYml.configs["flat/prettier"].rules,
            ...eslintPluginJsonSchemaValidator.configs["flat/recommended"]
                .rules,
        },
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
        plugins: {
            "@html-eslint": html,
        },
        languageOptions: {
            parser: htmlParser,
        },
        files: [
            "**/*.html",
            "**/*.htm",
            "*.html",
            "*.htm",
            "*.xhtml",
        ],
        ignores: ["report/**"],
        rules: {
            ...html.configs["flat/recommended"].rules,
            "@html-eslint/indent": "error",
            "@html-eslint/require-closing-tags": [
                "error",
                { selfClosing: "always" },
            ],
            "@html-eslint/no-extra-spacing-attrs": [
                "error",
                { enforceBeforeSelfClose: true },
            ],
        },
    },

    // Package.json Linting

    {
        files: ["**/package.json"],
        languageOptions: {
            parser: publintParser,
        },
        plugins: { publint },
        rules: {
            // /**
            //  * The 'suggestion' type messages created by publint will cause
            //  * eslint warns
            //  */
            // "publint/suggestion": "warn",
            // /**
            //  * The 'warning' type messages created by publint will cause eslint
            //  * warns
            //  */
            // "publint/warning": "warn",
            // /**
            //  * The 'error' type messages created by publint will cause eslint
            //  * errors
            //  */
            // "publint/error": "error",
        },
    },
    {
        files: ["**/package.json"],
        plugins: { "package-json": packageJson },
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        ...packageJson.configs.recommended,
        rules: {
            // "pkg-json/no-conflict-types": "error", // Plugin disabled - appears broken
            "package-json/no-redundant-files": "warn",
            "package-json/require-author": "warn",
            "package-json/require-bugs": "warn",
            "package-json/require-bundleDependencies": "off",
            "package-json/require-optionalDependencies": "off", // Not needed for Electron applications
            "package-json/require-peerDependencies": "off",
            "package-json/require-dependencies": "warn",
            "package-json/require-devDependencies": "warn",
            "package-json/restrict-dependency-ranges": "warn",
            "package-json/require-engines": "warn",
            "package-json/require-files": "off", // Not needed for Electron applications
            "package-json/require-keywords": "warn",
            "package-json/require-types": "off", // Not needed for Electron applications
            "package-json/valid-local-dependency": "off",
        },
    },

    // MDX files
    {
        files: ["**/*.mdx"],
        plugins: { mdx: mdx },

        rules: {
            ...mdx.flat.rules,
            ...mdx.flatCodeBlocks.rules,

            "no-var": "error",
            "prefer-const": "error",
        },
        settings: {
            processor: mdx.createRemarkProcessor({
                lintCodeBlocks: true,
                // optional, if you want to disable language mapper, set it to `false`
                // if you want to override the default language mapper inside, you can provide your own
                languageMapper: {},
                // optional, same as the `parserOptions.ignoreRemarkConfig`, you have to specify it twice unfortunately
                ignoreRemarkConfig: true,
                // optional, same as the `parserOptions.remarkConfigPath`, you have to specify it twice unfortunately
                // remarkConfigPath: "path/to/your/remarkrc",
            }),
        },
    },

    // Markdown files
    {
        files: ["**/*.md"],
        rules: {
            ...markdown.configs.recommended.rules,
            ...eslintPluginJsonSchemaValidator.configs["flat/recommended"]
                .rules,
        },
        plugins: { markdown },
        language: "markdown/gfm",
    },

    // CSS files
    {
        files: ["**/*.css"],
        ignores: ["docs/**", "**/test/**"],
        plugins: {
            css: css,
        },
        language: "css/css",
        languageOptions: {
            tolerant: true,
        },
        rules: {
            ...css.configs.recommended.rules,
            "css/no-empty-blocks": "error",
            "css/no-invalid-properties": "off",
            "css/use-baseline": "off",
            "css/no-invalid-at-rules": "off",
        },
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
        ignores: [],
        plugins: { eslintPluginJsonc: eslintPluginJsonc },
        ...json.configs.recommended[0],
        ...eslintPluginJsonc.configs["flat/prettier"][0],
        ...eslintPluginJsonSchemaValidator.configs["flat/recommended"].rules,
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
    },

    // TOML files
    {
        files: ["**/*.toml"],
        ignores: ["lychee.toml"],
        plugins: { eslintPluginToml: eslintPluginToml },
        ...eslintPluginToml.configs["flat/standard"][0],
        ...eslintPluginJsonSchemaValidator.configs["flat/recommended"].rules,
        languageOptions: {
            parser: tomlEslintParser,
            parserOptions: { tomlVersion: "1.0.0" },
        },
    },

    // TSX Tailwind +Linting files
    {
        files: ["src/**/*.tsx"],
        ignores: [],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                    impliedStrict: true,
                },
                jsDocParsingMode: "all",
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
            css: css,
            tailwind: tailwind,
            "undefined-css-classes": pluginUndefinedCss,
            "no-hardcoded-strings": pluginNoHardcoded,
        },
        rules: {
            // TypeScript rules
            ...tailwind.configs["flat/recommended"].rules,
            ...css.configs.recommended.rules,
            ...pluginUndefinedCss.configs["with-tailwind"].rules,

            // Disable undefined-css-classes as it's producing false positives for valid Tailwind classes
            "undefined-css-classes/no-undefined-css-classes": "off",

            // "no-hardcoded-strings/no-hardcoded-strings": [
            //     "warn",
            //     {
            //         allowedFunctionNames: ["t", "translate", "i18n"],
            //         ignoreStrings: ["OK", "Cancel"],
            //         ignorePatterns: [/^[\s\d\-:]+$/v], // Ignore dates, times, numbers
            //     },
            // ],

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
        },
    },

    // Docusaurus files
    {
        files: [
            "docs/docusaurus/**/*.ts",
            "docs/docusaurus/**/*.tsx",
            "docs/docusaurus/**/*.mjs",
            "docs/docusaurus/**/*.cjs",
            "docs/docusaurus/**/*.js",
            "docs/docusaurus/**/*.jsx",
            "docs/docusaurus/**/*.mts",
            "docs/docusaurus/**/*.cts",
        ],
        ignores: [
            "docs/docusaurus/docs/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/**/*.css",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "./docs/docusaurus/tsconfig.eslint.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                    impliedStrict: true,
                },
                jsDocParsingMode: "all",
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
            "import-x/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["./docs/docusaurus/tsconfig.eslint.json"],
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
        plugins: {
            "@typescript-eslint": tseslint,
            "jsx-a11y": jsxA11y,
            "no-unsanitized": nounsanitized,
            "prefer-arrow": pluginPreferArrow,
            "react-hooks": reactHooks,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: css,
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
            "react-hooks-addons": reactHooksAddons,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            xss: xss,
            "array-func": arrayFunc,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "sort-destructure-keys": pluginSortDestructure,
            istanbul: istanbul,
            observers: observers,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            listeners: listeners,
            "sql-template": sqlTemplate,
            "no-function-declare-after-return": pluginNFDAR,
            "require-jsdoc": pluginJSDoc,
            "comment-length": eslintPluginCommentLength,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "@metamask/design-tokens": pluginDesignTokens,
            "function-name": pluginFunctionNames,
            "clean-code": pluginCleanCode,
            "import-zod": importZod,
            "usememo-recommendations": pluginUseMemo,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "jsx-plus": pluginJsxPlus,
            "no-unary-plus": pluginNoUnary,
            "module-interop": moduleInterop,
            "granular-selectors": pluginGranular,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "eslint-plugin-toplevel": pluginTopLevel,
            "format-sql": pluginFormatSQL,
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            deprecation: fixupPluginRules(pluginDeprecation),
            "no-constructor-bind": pluginNoConstructBind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            "validate-jsx-nesting": pluginValidateJSX,
            "styled-components-a11y": styledA11y,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            etc: fixupPluginRules(etc),
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            "loadable-imports": pluginLoadableImports,
            zod: zod,
            "@docusaurus": pluginDocusaurus,
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
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
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

            "react/jsx-props-no-multi-spaces": "warn",
            "react/jsx-props-no-spread-multi": "warn",
            "react/jsx-props-no-spreading": "off",
            "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }], // Enforce .tsx for JSX files

            "total-functions/require-strict-mode": "off",
            "react/react-in-jsx-scope": "off",
            "react/no-multi-comp": "off",
            "react/jsx-no-literals": "off",
            "react/jsx-max-depth": "off",
            "react/forbid-component-props": "off",

            "no-lookahead-lookbehind-regexp/no-lookahead-lookbehind-regexp":
                "off",

            "css/no-invalid-properties": "off",

            // Docusaurus Rules
            "@docusaurus/string-literal-i18n-messages": "off",
            "@docusaurus/no-untranslated-text": "off",
            "@docusaurus/no-html-links": "warn",
            "@docusaurus/prefer-docusaurus-heading": "warn",

            // Disable problematic rules for Docusaurus
            "react/function-component-definition": "off", // Allow Docusaurus component patterns
            "react/prefer-read-only-props": "off", // Allow mutable props in Docusaurus components
            "react/prop-types": "off", // TypeScript provides type checking
            "sonarjs/function-return-type": "off", // Allow flexible return types in Docusaurus
            "perfectionist/sort-imports": "off", // Will handle this manually to avoid conflicts
            "react/jsx-sort-props": "off", // Allow flexible prop ordering in Docusaurus
            "perfectionist/sort-jsx-props": "off", // Allow flexible JSX prop ordering

            "react-hooks-addons/no-unused-deps": "warn",

            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "zod/prefer-enum": "error",
            "zod/require-strict": "error",

            "loadable-imports/sort": "error",

            "safe-jsx/jsx-explicit-boolean": "error",

            "etc/no-internal": "off",
            "etc/no-t": "off",
            "etc/no-const-enum": "warn",
            "etc/no-misused-generics": "warn",
            "etc/prefer-interface": "warn",
            "etc/throw-error": "warn",

            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",

            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",

            "total-functions/no-unsafe-type-assertion": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",

            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",

            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",

            "deprecation/deprecation": "error",

            "no-explicit-type-exports/no-explicit-type-exports": "error",

            "neverthrow/must-use-result": "error",

            "format-sql/format": "warn",

            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",

            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",

            "no-unary-plus/no-unary-plus": "error",

            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)

            "granular-selectors/granular-selectors": "error",

            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",

            "usememo-recommendations/detect-heavy-operations": "warn",

            "import-zod/prefer-zod-namespace": "error",

            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",

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

            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",

                    "shadow-sm": "Use 'shadow-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    blur: "Use 'blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    rounded: "Use 'rounded-sm' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    ring: "Use 'ring-3' instead.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@metamask/design-tokens/color-no-hex": "off",

            "sql-template/no-unsafe-query": "error",

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

            "observers/no-missing-unobserve-or-disconnect": "error",
            "observers/matching-unobserve-target": "error",

            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",

            "sort-destructure-keys/sort-destructure-keys": "off",

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
            "canonical/filename-match-exported": "off",
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules
            "canonical/filename-no-index": "off",
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
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
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
            complexity: "off",

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
            curly: ["error", "all"],
            eqeqeq: ["error", "always"],

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
                            allow: ["utils", "types"],
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

            "prettier/prettier": ["warn", { usePrettierrc: true }],

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
            "@typescript-eslint/return-await": ["error", "in-try-catch"], // Proper await handling in try-catch

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
            "init-declarations": "off",
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
        settings: {},
        plugins: {
            css: css,
            "undefined-css-classes": pluginUndefinedCss,
            "no-hardcoded-strings": pluginNoHardcoded,
            "@docusaurus": pluginDocusaurus,
            "css-modules": pluginCssModules,
        },
        rules: {
            ...css.configs.recommended.rules,
            ...pluginUndefinedCss.configs.recommended.rules,
            ...pluginCssModules.configs.recommended.rules,

            // Docusaurus CSS Rules
            "css/no-empty-blocks": "error",
            "css/no-invalid-properties": "off",
            "css/use-baseline": "off",
            "css/no-invalid-at-rules": "off",
            "css/no-important": "off", // Allow !important in Docusaurus CSS

            // Docusaurus Rules
            "@docusaurus/string-literal-i18n-messages": "off",
            "@docusaurus/no-untranslated-text": "off",
            "@docusaurus/no-html-links": "warn",
            "@docusaurus/prefer-docusaurus-heading": "warn",

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
    },

    // TypeScript frontend files (React + Zustand)
    {
        files: [
            "src/**/*.ts",
            "src/**/*.tsx",
            "src/**/*.mts",
            "src/**/*.cts",
        ],
        ignores: [
            "**/*.spec.{ts,tsx,mts,cts}",
            "**/*.test.{ts,tsx,mts,cts}",
            "shared/**/*.spec.{ts,tsx,mts,cts}",
            "shared/**/*.test.{ts,tsx,mts,cts}",
            "shared/test/**/*.{ts,tsx,mts,cts}",
            "src/test/**/*.{ts,tsx,mts,cts}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                    impliedStrict: true,
                },
                jsDocParsingMode: "all",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                window: "readonly",
                NodeJS: "readonly",
            },
        },
        settings: {
            tailwind: {
                config: "./tailwind.config.mjs",
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
                    project: ["tsconfig.json"],
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "jsx-a11y": jsxA11y,
            "no-unsanitized": nounsanitized,
            "prefer-arrow": pluginPreferArrow,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: css,
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
            "react-hooks-addons": reactHooksAddons,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            xss: xss,
            "array-func": arrayFunc,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "sort-destructure-keys": pluginSortDestructure,
            "react-compiler": reactCompiler,
            istanbul: istanbul,
            observers: observers,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            listeners: listeners,
            "sql-template": sqlTemplate,
            "no-function-declare-after-return": pluginNFDAR,
            "require-jsdoc": pluginJSDoc,
            "comment-length": eslintPluginCommentLength,
            "sort-react-dependency-arrays": pluginSortReactDependency,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "@metamask/design-tokens": pluginDesignTokens,
            "function-name": pluginFunctionNames,
            "clean-code": pluginCleanCode,
            "filename-export": pluginFilenameExport,
            "import-zod": importZod,
            "usememo-recommendations": pluginUseMemo,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "jsx-plus": pluginJsxPlus,
            "no-unary-plus": pluginNoUnary,
            "granular-selectors": pluginGranular,
            "module-interop": moduleInterop,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "eslint-plugin-toplevel": pluginTopLevel,
            "format-sql": pluginFormatSQL,
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            deprecation: fixupPluginRules(pluginDeprecation),
            "react-require-testid": pluginReactTest,
            "react-useeffect": reactUseEffect,
            "no-constructor-bind": pluginNoConstructBind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            "validate-jsx-nesting": pluginValidateJSX,
            "styled-components-a11y": styledA11y,
            "react-form-fields": pluginReactFormFields,
            "react-hook-form": pluginReactHookForm,
            "react-prefer-function-component": preferFunctionComponent,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "react-perf": reactPerfPlugin,
            "@arthurgeron/react-usememo": pluginUseMemo2,
            etc: fixupPluginRules(etc),
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            "loadable-imports": pluginLoadableImports,
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
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
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

            "react-hooks-addons/no-unused-deps": "warn",

            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "zod/prefer-enum": "error",
            "zod/require-strict": "error",

            "loadable-imports/sort": "error",

            "safe-jsx/jsx-explicit-boolean": "error",

            "etc/no-internal": "off",
            "etc/no-t": "off",
            "etc/no-const-enum": "warn",
            "etc/no-misused-generics": "warn",
            "etc/prefer-interface": "warn",
            "etc/throw-error": "warn",

            "@arthurgeron/react-usememo/require-usememo": "error",
            "@arthurgeron/react-usememo/require-memo": "off",
            "@arthurgeron/react-usememo/require-usememo-children": "off",

            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",

            "react-prefer-function-component/react-prefer-function-component": [
                "error",
                { allowComponentDidCatch: false },
            ],

            "react-hook-form/no-use-watch": "error",

            "react-form-fields/no-mix-controlled-with-uncontrolled": "error",
            "react-form-fields/no-only-value-prop": "error",
            "react-form-fields/styled-no-mix-controlled-with-uncontrolled":
                "error",
            "react-form-fields/styled-no-only-value-prop": "error",

            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",

            "total-functions/no-unsafe-type-assertion": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",

            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",

            "react-useeffect/no-non-function-return": "error",

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

            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",

            "deprecation/deprecation": "error",

            "no-explicit-type-exports/no-explicit-type-exports": "error",

            "neverthrow/must-use-result": "error",

            "format-sql/format": "warn",

            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",

            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",

            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)

            "granular-selectors/granular-selectors": "error",

            "no-unary-plus/no-unary-plus": "error",

            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",

            "usememo-recommendations/detect-heavy-operations": "warn",

            "import-zod/prefer-zod-namespace": "error",

            // "filename-export/match-named-export": "error",
            // "filename-export/match-default-export": "error",

            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",

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
            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",

                    "shadow-sm": "Use 'shadow-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    blur: "Use 'blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    rounded: "Use 'rounded-sm' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    ring: "Use 'ring-3' instead.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@metamask/design-tokens/color-no-hex": "error",

            "sort-react-dependency-arrays/sort": "error",

            "sql-template/no-unsafe-query": "error",

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

            "observers/no-missing-unobserve-or-disconnect": "error",
            "observers/matching-unobserve-target": "error",

            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",

            "sort-destructure-keys/sort-destructure-keys": "off",

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
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
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
            curly: ["error", "all"],
            eqeqeq: ["error", "always"],

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
            "react/jsx-fragments": ["warn", "syntax"],
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
                            allow: ["types", "utils"],
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
            "prettier/prettier": ["warn", { usePrettierrc: true }],

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
            "@typescript-eslint/return-await": ["error", "in-try-catch"], // Proper await handling in try-catch

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
            "init-declarations": "off",
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
            "electron/**/*.cts",
            "electron/**/*.mts",
        ],
        ignores: [
            "electron/**/*.spec.{ts,tsx,mts,cts}",
            "electron/**/*.test.{ts,tsx,mts,cts}",
            "electron/test/**/*.{ts,tsx,mts,cts}",
            "shared/**/*.spec.{ts,tsx,mts,cts}",
            "shared/**/*.test.{ts,tsx,mts,cts}",
            "shared/test/**/*.{ts,tsx,mts,cts}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.electron.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                    impliedStrict: true,
                },
                jsDocParsingMode: "all",
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
                NodeJS: "readonly",
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
            "react-hooks": reactHooks,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: css,
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
            "react-hooks-addons": reactHooksAddons,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            xss: xss,
            "array-func": arrayFunc,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "sort-destructure-keys": pluginSortDestructure,
            istanbul: istanbul,
            observers: observers,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            listeners: listeners,
            "sql-template": sqlTemplate,
            "no-function-declare-after-return": pluginNFDAR,
            "require-jsdoc": pluginJSDoc,
            "comment-length": eslintPluginCommentLength,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "@metamask/design-tokens": pluginDesignTokens,
            "function-name": pluginFunctionNames,
            "clean-code": pluginCleanCode,
            "import-zod": importZod,
            "usememo-recommendations": pluginUseMemo,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "jsx-plus": pluginJsxPlus,
            "no-unary-plus": pluginNoUnary,
            "module-interop": moduleInterop,
            "granular-selectors": pluginGranular,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "eslint-plugin-toplevel": pluginTopLevel,
            "format-sql": pluginFormatSQL,
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            deprecation: fixupPluginRules(pluginDeprecation),
            "no-constructor-bind": pluginNoConstructBind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            "validate-jsx-nesting": pluginValidateJSX,
            "styled-components-a11y": styledA11y,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            etc: fixupPluginRules(etc),
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            "loadable-imports": pluginLoadableImports,
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
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
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

            "react-hooks-addons/no-unused-deps": "warn",

            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "zod/prefer-enum": "error",
            "zod/require-strict": "error",

            "loadable-imports/sort": "error",

            "safe-jsx/jsx-explicit-boolean": "error",

            "etc/no-internal": "off",
            "etc/no-t": "off",
            "etc/no-const-enum": "warn",
            "etc/no-misused-generics": "warn",
            "etc/prefer-interface": "warn",
            "etc/throw-error": "warn",

            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",

            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",

            "total-functions/no-unsafe-type-assertion": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",

            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",

            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",

            "deprecation/deprecation": "error",

            "no-explicit-type-exports/no-explicit-type-exports": "error",

            "neverthrow/must-use-result": "error",

            "format-sql/format": "warn",

            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",

            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",

            "no-unary-plus/no-unary-plus": "error",

            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)

            "granular-selectors/granular-selectors": "error",

            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",

            "usememo-recommendations/detect-heavy-operations": "warn",

            "import-zod/prefer-zod-namespace": "error",

            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",

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

            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",

                    "shadow-sm": "Use 'shadow-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    blur: "Use 'blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    rounded: "Use 'rounded-sm' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    ring: "Use 'ring-3' instead.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@metamask/design-tokens/color-no-hex": "error",

            "sql-template/no-unsafe-query": "error",

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

            "observers/no-missing-unobserve-or-disconnect": "error",
            "observers/matching-unobserve-target": "error",

            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",

            "sort-destructure-keys/sort-destructure-keys": "off",

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
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
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
            complexity: "off",

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
            curly: ["error", "all"],
            eqeqeq: ["error", "always"],

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
                            allow: ["utils", "types"],
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

            "prettier/prettier": ["warn", { usePrettierrc: true }],

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
            "@typescript-eslint/return-await": ["error", "in-try-catch"], // Proper await handling in try-catch

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
            "init-declarations": "off",
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

    // TypeScript frontend files (React + Zustand)
    {
        files: [
            "shared/**/*.ts",
            "shared/**/*.tsx",
            "src/**/*.cts",
            "src/**/*.mts",
        ],
        ignores: [
            "**/*.spec.{ts,tsx,mts,cts}",
            "**/*.test.{ts,tsx,mts,cts}",
            "shared/**/*.spec.{ts,tsx,mts,cts}",
            "shared/**/*.test.{ts,tsx,mts,cts}",
            "shared/test/**/*.{ts,tsx,mts,cts}",
            "src/test/**/*.{ts,tsx,mts,cts}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.shared.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                    impliedStrict: true,
                },
                jsDocParsingMode: "all",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                window: "readonly",
                NodeJS: "readonly",
            },
        },
        settings: {
            tailwind: {
                config: "./tailwind.config.mjs",
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
                project: ["tsconfig.shared.json"],
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.shared.json"],
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "jsx-a11y": jsxA11y,
            "no-unsanitized": nounsanitized,
            "prefer-arrow": pluginPreferArrow,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: css,
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
            "react-hooks-addons": reactHooksAddons,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            xss: xss,
            "array-func": arrayFunc,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "sort-destructure-keys": pluginSortDestructure,
            "react-compiler": reactCompiler,
            istanbul: istanbul,
            observers: observers,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            listeners: listeners,
            "sql-template": sqlTemplate,
            "no-function-declare-after-return": pluginNFDAR,
            "require-jsdoc": pluginJSDoc,
            "comment-length": eslintPluginCommentLength,
            "sort-react-dependency-arrays": pluginSortReactDependency,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "@metamask/design-tokens": pluginDesignTokens,
            "function-name": pluginFunctionNames,
            "clean-code": pluginCleanCode,
            "filename-export": pluginFilenameExport,
            "import-zod": importZod,
            "usememo-recommendations": pluginUseMemo,
            "eslint-plugin-goodeffects": pluginGoodEffects,
            "jsx-plus": pluginJsxPlus,
            "no-unary-plus": pluginNoUnary,
            "granular-selectors": pluginGranular,
            "module-interop": moduleInterop,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "eslint-plugin-toplevel": pluginTopLevel,
            "format-sql": pluginFormatSQL,
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            deprecation: fixupPluginRules(pluginDeprecation),
            "react-require-testid": pluginReactTest,
            "react-useeffect": reactUseEffect,
            "no-constructor-bind": pluginNoConstructBind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            "validate-jsx-nesting": pluginValidateJSX,
            "styled-components-a11y": styledA11y,
            "react-form-fields": pluginReactFormFields,
            "react-hook-form": pluginReactHookForm,
            "react-prefer-function-component": preferFunctionComponent,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "react-perf": reactPerfPlugin,
            "@arthurgeron/react-usememo": pluginUseMemo2,
            etc: fixupPluginRules(etc),
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            "loadable-imports": pluginLoadableImports,
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
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
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

            "react-hooks-addons/no-unused-deps": "warn",

            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    mode: "compact-on-overflow",
                    maxLength: 120,
                    logicalWrap: true,
                    ignoreUrls: true,
                    ignoreCommentsWithCode: true,
                    tabSize: 2,
                },
            ],

            "zod/prefer-enum": "error",
            "zod/require-strict": "error",

            "loadable-imports/sort": "error",

            "safe-jsx/jsx-explicit-boolean": "error",

            "etc/no-internal": "off",
            "etc/no-t": "off",
            "etc/no-const-enum": "warn",
            "etc/no-misused-generics": "warn",
            "etc/prefer-interface": "warn",
            "etc/throw-error": "warn",

            "@arthurgeron/react-usememo/require-usememo": "error",
            "@arthurgeron/react-usememo/require-memo": "off",
            "@arthurgeron/react-usememo/require-usememo-children": "off",

            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",

            "react-prefer-function-component/react-prefer-function-component": [
                "error",
                { allowComponentDidCatch: false },
            ],

            "react-hook-form/no-use-watch": "error",

            "react-form-fields/no-mix-controlled-with-uncontrolled": "error",
            "react-form-fields/no-only-value-prop": "error",
            "react-form-fields/styled-no-mix-controlled-with-uncontrolled":
                "error",
            "react-form-fields/styled-no-only-value-prop": "error",

            "validate-jsx-nesting/no-invalid-jsx-nesting": "error",

            "total-functions/no-unsafe-type-assertion": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",

            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",

            "react-useeffect/no-non-function-return": "error",

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

            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",

            "deprecation/deprecation": "error",

            "no-explicit-type-exports/no-explicit-type-exports": "error",

            "neverthrow/must-use-result": "error",

            "format-sql/format": "warn",

            "eslint-plugin-toplevel/no-toplevel-var": "error",
            "eslint-plugin-toplevel/no-toplevel-let": "error",
            "eslint-plugin-toplevel/no-toplevel-side-effect": "off",

            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",

            // Note: granular-selectors plugin rules need to be added manually since
            // Note: The plugin config are not available after fixupPluginRules wrapping (Below)

            "granular-selectors/granular-selectors": "error",

            "no-unary-plus/no-unary-plus": "error",

            "eslint-plugin-goodeffects/enforceNamedEffectCallbacks": "error",

            "usememo-recommendations/detect-heavy-operations": "warn",

            "import-zod/prefer-zod-namespace": "error",

            // "filename-export/match-named-export": "error",
            // "filename-export/match-default-export": "error",

            // "clean-code/feature-envy": "error",
            // "clean-code/exception-handling": "error",

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
            "@metamask/design-tokens/no-deprecated-classnames": [
                "warn",
                {
                    "bg-opacity-*": "Use opacity modifiers like 'bg-black/50'.",
                    "text-opacity-*":
                        "Use opacity modifiers like 'text-black/50'.",
                    "border-opacity-*":
                        "Use opacity modifiers like 'border-black/50'.",
                    "divide-opacity-*":
                        "Use opacity modifiers like 'divide-black/50'.",
                    "ring-opacity-*":
                        "Use opacity modifiers like 'ring-black/50'.",
                    "placeholder-opacity-*":
                        "Use opacity modifiers like 'placeholder-black/50'.",
                    "flex-shrink-*": "Use 'shrink-*' instead.",
                    "flex-grow-*": "Use 'grow-*' instead.",
                    "overflow-ellipsis": "Use 'text-ellipsis' instead.",
                    "decoration-slice": "Use 'box-decoration-slice' instead.",
                    "decoration-clone": "Use 'box-decoration-clone' instead.",

                    "shadow-sm": "Use 'shadow-xs' instead.",
                    shadow: "Use 'shadow-sm' instead.",
                    "drop-shadow-sm": "Use 'drop-shadow-xs' instead.",
                    "drop-shadow": "Use 'drop-shadow-sm' instead.",
                    "blur-sm": "Use 'blur-xs' instead.",
                    blur: "Use 'blur-sm' instead.",
                    "backdrop-blur-sm": "Use 'backdrop-blur-xs' instead.",
                    "backdrop-blur": "Use 'backdrop-blur-sm' instead.",
                    "rounded-sm": "Use 'rounded-xs' instead.",
                    rounded: "Use 'rounded-sm' instead.",
                    "outline-none": "Use 'outline-hidden' instead.",
                    ring: "Use 'ring-3' instead.",
                },
            ],
            "@metamask/design-tokens/prefer-theme-color-classnames": "error",
            "@metamask/design-tokens/color-no-hex": "error",

            "sort-react-dependency-arrays/sort": "error",

            "sql-template/no-unsafe-query": "error",

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

            "observers/no-missing-unobserve-or-disconnect": "error",
            "observers/matching-unobserve-target": "error",

            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",

            "sort-destructure-keys/sort-destructure-keys": "off",

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
                            matchParent: path.resolve(import.meta.dirname),
                            matchPath: "^shared/",
                            maxRelativeDepth: 0,
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
            curly: ["error", "all"],
            eqeqeq: ["error", "always"],

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
            "react/jsx-fragments": ["warn", "syntax"],
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
                            allow: ["types", "utils"],
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
            "prettier/prettier": ["warn", { usePrettierrc: true }],

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
            "@typescript-eslint/return-await": ["error", "in-try-catch"], // Proper await handling in try-catch

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
            "init-declarations": "off",
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

    // Test files (Frontend)
    {
        files: [
            "src/**/*.spec.{ts,tsx,cts,mts}",
            "src/**/*.test.{ts,tsx,cts,mts}",
            "src/test/**/*.{ts,tsx,cts,mts}",
            "tests/**/*.{ts,tsx,cts,mts}",
            "tests/**/*.spec.{ts,tsx,cts,mts}",
            "tests/**/*.test.{ts,tsx,cts,mts}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.test.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                },
                jsDocParsingMode: "all",
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
            vitest: {
                typecheck: true,
            },
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
            "react-hooks": reactHooks,
            n: nodePlugin,
            "eslint-comments": pluginComments,
            unicorn: pluginUnicorn,
            "loadable-imports": pluginLoadableImports,
            "undefined-css-classes": pluginUndefinedCss,
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
            ...pluginUnicorn.configs["flat/all"].rules,

            "undefined-css-classes/no-undefined-css-classes": "off",

            "loadable-imports/sort": "error",

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

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",

            "testing-library/no-node-access": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/prefer-screen-queries": "warn",

            // Relaxed function rules for tests (explicit for clarity)
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers

            "new-cap": "off", // Allow new-cap for class constructors
            "no-throw-literal": "off",
            "no-new": "off", // Allow new for class constructors
            "prefer-destructuring": "off",
            "init-declarations": "off",
            "nitpick/no-redundant-vars": "off", // Allow redundant vars in tests
            "no-use-before-define": "off", // Allow use before define in tests
            "@typescript-eslint/no-use-before-define": "off", // Allow use before define in tests
            "unicorn/prefer-optional-catch-binding": "off", // Allow optional catch binding for test flexibility
            "unicorn/prefer-global-this": "off", // Allow globalThis for test setups
            eqeqeq: "off", // Allow == and != in tests for flexibility
            "func-name-matching": "off", // Allow function names to not match variable names
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "max-depth": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-shadow": "off",
            complexity: "off",
            "no-useless-assignment": "off",
            "no-underscore-dangle": "off",
            "default-case": "off",
            "func-names": "off",
            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",
        },
    },

    // Test files (Backend)
    {
        files: [
            "electron/**/*.spec.{ts,tsx,cts,mts}",
            "electron/**/*.test.{ts,tsx,cts,mts}",
            "electron/test/**/*.{ts,tsx,cts,mts}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.electron.test.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                },
                jsDocParsingMode: "all",
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
                NodeJS: "readonly",
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
            "loadable-imports": pluginLoadableImports,
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
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,

            "loadable-imports/sort": "error",

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

            // Relaxed function rules for backend tests (explicit for clarity)

            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            // No Only Tests
            "no-only-tests/no-only-tests": "error",

            "new-cap": "off", // Allow new-cap for class constructors
            "no-throw-literal": "off",
            "no-new": "off", // Allow new for class constructors
            "prefer-destructuring": "off",
            "init-declarations": "off",
            "no-use-before-define": "off", // Allow use before define in tests
            "@typescript-eslint/no-use-before-define": "off", // Allow use before define in tests
            "unicorn/prefer-optional-catch-binding": "off", // Allow optional catch binding for test flexibility
            "unicorn/prefer-global-this": "off", // Allow globalThis for test setups
            eqeqeq: "off", // Allow == and != in tests for flexibility
            "func-name-matching": "off", // Allow function names to not match variable names
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "max-depth": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-shadow": "off",
            complexity: "off",
            "no-useless-assignment": "off",
            "no-underscore-dangle": "off",
            "default-case": "off",
            "func-names": "off",
            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",
        },
        settings: {
            vitest: {
                typecheck: true,
            },
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

    // Shared Test Files
    {
        files: [
            "shared/**/*.spec.{ts,tsx,cts,mts}",
            "shared/**/*.test.{ts,tsx,cts,mts}",
            "shared/test/**/*.{ts,tsx,cts,mts}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.shared.test.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                },
                jsDocParsingMode: "all",
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
            vitest: {
                typecheck: true,
            },
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
                project: ["tsconfig.shared.test.json"],
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["tsconfig.shared.test.json"],
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
            "react-hooks": reactHooks,
            n: nodePlugin,
            "eslint-comments": pluginComments,
            unicorn: pluginUnicorn,
            "loadable-imports": pluginLoadableImports,
            "undefined-css-classes": pluginUndefinedCss,
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
            ...pluginUnicorn.configs["flat/all"].rules,

            "undefined-css-classes/no-undefined-css-classes": "off",

            "loadable-imports/sort": "error",

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

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",

            "testing-library/no-node-access": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/prefer-screen-queries": "warn",

            // Relaxed function rules for tests (explicit for clarity)
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers

            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",
        },
    },

    // Benchmark files
    {
        files: [
            "benchmarks/**/*.bench.{ts,tsx,cts,mts}",
            "benchmarks/**/*.{ts,tsx,cts,mts}",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: ["tsconfig.bench.json"],
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                },
                jsDocParsingMode: "all",
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
                bench: "readonly",
                NodeJS: "readonly",
            },
        },
        settings: {
            vitest: {
                typecheck: true,
            },
            react: { version: "19" },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            "import-x/resolver": {
                typescript: true,
                node: true,
                project: [
                    "tsconfig.json",
                    "tsconfig.test.json",
                    "tsconfig.bench.json",
                ],
            },
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: [
                        "tsconfig.json",
                        "tsconfig.test.json",
                        "tsconfig.bench.json",
                    ],
                },
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            vitest: vitest,
            "import-x": importX,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": reactHooks,
            n: nodePlugin,
            "eslint-comments": pluginComments,
            unicorn: pluginUnicorn,
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
            ...pluginUnicorn.configs["flat/all"].rules,

            "nitpick/no-redundant-vars": "off", // Allow redundant vars in benchmarks
            "no-continue": "off",
            "no-use-before-define": "off", // Allow use before define in benchmarks
            "no-div-regex": "off", // Allow division regex in benchmarks
            // Allow performance-focused code patterns in benchmarks
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
            "unicorn/no-useless-undefined": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/no-unused-properties": "off",
            "unicorn/no-null": "off",
            "unicorn/no-await-expression-member": "off",
            "unicorn/filename-case": "off", // Allow benchmark files to have any case
            "unicorn/prevent-abbreviations": "off",
            "unicorn/no-array-for-each": "off", // Benchmarks may use forEach for testing
            "unicorn/prefer-spread": "off", // Benchmarks may test different patterns
            "unicorn/prefer-set-has": "off", // Benchmarks may compare different approaches
            "unicorn/no-array-reduce": "off", // Benchmarks may test reduce performance

            // Allow flexible patterns for benchmark mock implementations
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-restricted-types": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/require-await": "off", // Benchmarks may have async patterns
            "@typescript-eslint/no-floating-promises": "off", // Benchmarks may not await all promises
            "@typescript-eslint/no-misused-promises": "off",

            // Import rules relaxed for mock implementations
            "import-x/no-unused-modules": "off",
            "import-x/no-extraneous-dependencies": "off",

            // Allow large files and classes for comprehensive benchmarks
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-classes-per-file": "off",

            "new-cap": "off", // Allow new-cap for class constructors
            "no-throw-literal": "off",
            "no-new": "off", // Allow new for class constructors
            "prefer-destructuring": "off",
            "init-declarations": "off",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "max-depth": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-shadow": "off",
            complexity: "off",
            "no-useless-assignment": "off",
            "no-underscore-dangle": "off",
            "default-case": "off",
            "func-names": "off",
            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "id-length": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
        },
    },

    // TypeScript Config files using Electron Test TSConfig
    {
        files: [
            "**/*.config.{ts,mts,tsx}", // Configuration files
        ],
        ignores: ["./.*/**"],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "tsconfig.electron.test.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                ecmaFeatures: {
                    jsx: true,
                },
                jsDocParsingMode: "all",
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
            css: css,
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
            ...css.configs.recommended.rules,
            ...pluginComments.configs.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...arrayFunc.configs.all.rules,

            "new-cap": "off", // Allow new-cap for class constructors
            "no-throw-literal": "off",
            "no-new": "off", // Allow new for class constructors
            "prefer-destructuring": "off",
            "init-declarations": "off",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "max-depth": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-shadow": "off",
            complexity: "off",
            "no-useless-assignment": "off",
            "no-underscore-dangle": "off",
            "default-case": "off",
            "func-names": "off",
            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",

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
                            allow: ["utils", "types"],
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

            "prettier/prettier": ["warn", { usePrettierrc: true }],

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
            "@typescript-eslint/return-await": ["error", "in-try-catch"], // Proper await handling in try-catch

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
        files: ["**/*.config.{js,mjs,cts,cjs}"],
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
            "react-hooks": reactHooks,
            "sort-class-members": pluginSortClassMembers,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            boundaries: pluginBoundaries,
            compat: pluginCompat,
            css: css,
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
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.react.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs["flat/all"].rules,
            ...pluginReact.configs.all.rules,
            ...reactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/recommended"].rules,
            ...depend.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,

            "one-var": "off",
            "no-magic-numbers": "off",
            "func-style": "off",
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "sort-imports": "off",
            "no-inline-comments": "off",
            "require-await": "off",
            "no-ternary": "off",
            "max-lines": "off",
            "id-length": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "max-params": "off",
            "sort-keys": "off",
            "dot-notation": "off",
            "no-console": "off",
            "no-plusplus": "off",
            "no-undefined": "off",
            "no-void": "off",
            "require-unicode-regexp": "off",
            "prefer-arrow-callback": "off",
            "no-undef-init": "off",
            "object-shorthand": "off",
            camelcase: "off",
            "max-classes-per-file": "off",

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

    // Store-specific overrides to handle false positives
    {
        files: [
            "src/stores/**/*.ts",
            "src/stores/**/*.tsx",
            "src/stores/**/*.cts",
            "src/stores/**/*.mts",
        ],
        rules: {
            // Disable ex/no-unhandled for stores due to false positives with variable access
            // The rule incorrectly flags simple parameter/variable access as potential exceptions
            "ex/no-unhandled": "off",
        },
    },

    // Strict Test files (Frontend)
    {
        files: [
            "shared/test/StrictTests/*.{ts,tsx,cts,mts}",
            "src/test/StrictTests/*.{ts,tsx,cts,mts}",
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

    // Strict Test files (Backend)
    {
        files: ["electron/test/StrictTests/*.{ts,tsx,cts,mts}"],
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
            "react-perf/jsx-no-new-object-as-prop": "off",
        },
    },

    // eslint-config-prettier MUST be last to override conflicting rules
    eslintConfigPrettier,
];
