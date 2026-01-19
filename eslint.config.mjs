/**
 * Optimized ESLint configuration for Uptime Watcher
 *
 * This configuration is specifically tailored for:
 *
 * ```
 *         rules: {
 * ```
 *
 * - Domain-driven design with Zustand stores
 * - Service-based backend architecture
 * - High code quality with reduced false positives
 * - Modern ES2024+ features
 * - Enhanced security and performance rules
 *
 * @see {@link https://www.schemastore.org/eslintrc.json} for JSON schema validation
 */
/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- Eslint doesn't use default */
/* eslint-disable import-x/no-named-as-default-member -- Rule wants packages not in dev, doesn't apply, eslint doesnt use default import */
/* eslint-disable n/no-unpublished-import -- ESLint config file, dev dependencies are fine */
// @ts-expect-error -- No Types for this Package
import pluginUseMemo2 from "@arthurgeron/eslint-plugin-react-usememo";
import pluginDocusaurus from "@docusaurus/eslint-plugin";
import pluginComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslintReact from "@eslint-react/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
// Import html from "eslint-plugin-html";
import html from "@html-eslint/eslint-plugin";
import * as htmlParser from "@html-eslint/parser";
// @ts-expect-error -- No Types for this Package
import implicitDependencies from "@jcoreio/eslint-plugin-implicit-dependencies";
// @ts-expect-error -- No Types for this Package
import * as pluginDesignTokens from "@metamask/eslint-plugin-design-tokens";
// @ts-expect-error -- No Types for this Package
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import rushStackSecurity from "@rushstack/eslint-plugin-security";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";
import gitignore from "eslint-config-flat-gitignore";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import * as eslintMdx from "eslint-mdx";
import antfu from "eslint-plugin-antfu";
// @ts-expect-error -- No Types for this Package
import arrayFunc from "eslint-plugin-array-func";
import pluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import pluginBoundaries from "eslint-plugin-boundaries";
import pluginCanonical from "eslint-plugin-canonical";
// @ts-expect-error -- No Types for this Package
import * as pluginCleanCode from "eslint-plugin-clean-code";
// New plugins from user request
// @ts-expect-error -- No Types for this Package
import pluginCleanTimer from "eslint-plugin-clean-timer";
import eslintPluginCommentLength from "eslint-plugin-comment-length";
// eslint-disable-next-line import-x/no-unresolved -- Works fine
import pluginCompat from "eslint-plugin-compat";
// @ts-expect-error -- No Types for this Package
import * as pluginCssModules from "eslint-plugin-css-modules";
import depend from "eslint-plugin-depend";
import pluginDeprecation from "eslint-plugin-deprecation";
// @ts-expect-error -- No Types for this Package
import etc from "eslint-plugin-etc";
import { plugin as ex } from "eslint-plugin-exception-handling";
import progress from "eslint-plugin-file-progress";
import pluginFilenameExport from "eslint-plugin-filename-export";
import pluginFormatSQL from "eslint-plugin-format-sql";
// @ts-expect-error -- No Types for this Package
import * as pluginFunctionNames from "eslint-plugin-function-name";
import pluginFunctional from "eslint-plugin-functional";
// @ts-expect-error -- No Types for this Package
import pluginGoodEffects from "eslint-plugin-goodeffects";
// @ts-expect-error -- No Types for this Package
import pluginGranular from "eslint-plugin-granular-selectors";
import { importX } from "eslint-plugin-import-x";
// Zod Tree Shaking Plugin https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831
import importZod from "eslint-plugin-import-zod";
// @ts-expect-error -- No Types for this Package
import istanbul from "eslint-plugin-istanbul";
import jsdoc from "eslint-plugin-jsdoc";
// NOTE: eslint-plugin-json-schema-validator may attempt to fetch remote schemas
// at lint time. That makes linting flaky/offline-hostile.
// Keep it opt-in via UW_ENABLE_JSON_SCHEMA_VALIDATION=1.
const enableJsonSchemaValidation =
    process.env["UW_ENABLE_JSON_SCHEMA_VALIDATION"] === "1";

let eslintPluginJsonSchemaValidator = undefined;

if (enableJsonSchemaValidation) {
    eslintPluginJsonSchemaValidator = (await import("eslint-plugin-json-schema-validator")).default;
}

const jsonSchemaValidatorPlugins = enableJsonSchemaValidation
    ? { "json-schema-validator": eslintPluginJsonSchemaValidator }
    : {};

const jsonSchemaValidatorRules = enableJsonSchemaValidation
    ? { "json-schema-validator/no-invalid": "error" }
    : {};
import pluginCasePolice from "eslint-plugin-case-police";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import jsxA11y from "eslint-plugin-jsx-a11y";
// @ts-expect-error -- No Types for this Package
import pluginJsxPlus from "eslint-plugin-jsx-plus";
// @ts-expect-error -- No Types for this Package
import listeners from "eslint-plugin-listeners";
// @ts-expect-error -- No Types for this Package
import pluginLoadableImports from "eslint-plugin-loadable-imports";
import eslintPluginMath from "eslint-plugin-math";
import * as mdx from "eslint-plugin-mdx";
import moduleInterop from "eslint-plugin-module-interop";
import nodePlugin from "eslint-plugin-n";
// @ts-expect-error -- No Types for this Package
import pluginNeverThrow from "eslint-plugin-neverthrow";
import nitpick from "eslint-plugin-nitpick";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
// @ts-expect-error -- No Types for this Package
import pluginNoConstructBind from "eslint-plugin-no-constructor-bind";
// @ts-expect-error -- No Types for this Package
import pluginNoExplicitTypeExports from "eslint-plugin-no-explicit-type-exports";
// @ts-expect-error -- No Types for this Package
import * as pluginNFDAR from "eslint-plugin-no-function-declare-after-return";
// Import * as tailwind4 from "tailwind-csstree";
import pluginNoHardcoded from "eslint-plugin-no-hardcoded-strings";
import pluginRegexLook from "eslint-plugin-no-lookahead-lookbehind-regexp";
// @ts-expect-error -- No Types for this Package
import pluginNoOnly from "eslint-plugin-no-only-tests";
import noSecrets from "eslint-plugin-no-secrets";
// @ts-expect-error -- No Types for this Package
import pluginNoUnary from "eslint-plugin-no-unary-plus";
// @ts-expect-error -- No Types for this Package
import pluginNoUnwaited from "eslint-plugin-no-unawaited-dot-catch-throw";
// @ts-expect-error -- No Types for this Package
import nounsanitized from "eslint-plugin-no-unsanitized";
// @ts-expect-error -- No Types for this Package
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
// @ts-expect-error -- No Types for this Package
import observers from "eslint-plugin-observers";
import packageJson from "eslint-plugin-package-json";
import paths from "eslint-plugin-paths";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import playwright from "eslint-plugin-playwright";
// @ts-expect-error -- No Types for this Package
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
// @ts-expect-error -- No Types for this Package
import pluginPromise from "eslint-plugin-promise";
import pluginReact from "eslint-plugin-react";
// @ts-expect-error -- No Types for this Package
import react19upgrade from "eslint-plugin-react-19-upgrade";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintReactDom from "eslint-plugin-react-dom";
// @ts-expect-error -- No Types for this Package
import * as pluginReactFormFields from "eslint-plugin-react-form-fields";
// @ts-expect-error -- No Types for this Package
import pluginReactHookForm from "eslint-plugin-react-hook-form";
import reactHooks from "eslint-plugin-react-hooks";
import reactHooksAddons from "eslint-plugin-react-hooks-addons";
import eslintReactHooksExtra from "eslint-plugin-react-hooks-extra";
import eslintReactNamingConvention from "eslint-plugin-react-naming-convention";
// @ts-expect-error -- No Types for this Package
import reactPerfPlugin from "eslint-plugin-react-perf";
// eslint-disable-next-line import-x/default -- Working fine just old
import preferFunctionComponent from "eslint-plugin-react-prefer-function-component";
import reactRefresh from "eslint-plugin-react-refresh";
// @ts-expect-error -- No Types for this Package
import pluginReactTest from "eslint-plugin-react-require-testid";
// @ts-expect-error -- No Types for this Package
import reactUseEffect from "eslint-plugin-react-useeffect";
import eslintReactWeb from "eslint-plugin-react-web-api";
// @ts-expect-error -- No Types for this Package
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
// @ts-expect-error -- No Types for this Package
import * as pluginJSDoc from "eslint-plugin-require-jsdoc";
// @ts-expect-error -- No Types for this Package
import pluginSafeJSX from "eslint-plugin-safe-jsx";
import pluginSecurity from "eslint-plugin-security";
import pluginSonarjs from "eslint-plugin-sonarjs";
// @ts-expect-error -- No Types for this Package
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
// @ts-expect-error -- No Types for this Package
import pluginSortDestructure from "eslint-plugin-sort-destructure-keys";
// @ts-expect-error -- No Types for this Package
import pluginSortKeysFix from "eslint-plugin-sort-keys-fix";
// @ts-expect-error -- No Types for this Package
import pluginSortReactDependency from "eslint-plugin-sort-react-dependency-arrays";
// @ts-expect-error -- No Types for this Package
import sqlTemplate from "eslint-plugin-sql-template";
// @ts-expect-error -- No Types for this Package
import pluginSSR from "eslint-plugin-ssr-friendly";
import storybook from "eslint-plugin-storybook";
// @ts-expect-error -- No Types for this Package
import styledA11y from "eslint-plugin-styled-components-a11y";
// @ts-expect-error -- No Types for this Package
import pluginSwitchCase from "eslint-plugin-switch-case";
import tailwind from "eslint-plugin-tailwindcss";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import eslintPluginToml from "eslint-plugin-toml";
// @ts-expect-error -- No Types for this Package
import pluginTopLevel from "eslint-plugin-toplevel";
// @ts-expect-error -- No Types for this Package
import pluginTotalFunctions from "eslint-plugin-total-functions";
import pluginTsdoc from "eslint-plugin-tsdoc";
// @ts-expect-error -- No Types for this Package
import pluginTSDocRequire from "eslint-plugin-tsdoc-require";
// @ts-expect-error -- No Types for this Package
import pluginUndefinedCss from "eslint-plugin-undefined-css-classes";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
// @ts-expect-error -- No Types for this Package
import pluginUseMemo from "eslint-plugin-usememo-recommendations";
// @ts-expect-error -- No Types for this Package
import pluginValidateJSX from "eslint-plugin-validate-jsx-nesting";
// import * as cssPlugin from "eslint-plugin-css"
// @ts-expect-error -- No Types for this Package
import pluginWriteGood from "eslint-plugin-write-good-comments";
// @ts-expect-error -- No Types for this Package
import xss from "eslint-plugin-xss";
import eslintPluginYml from "eslint-plugin-yml";
import zod from "eslint-plugin-zod";
import globals from "globals";
import jsoncEslintParser from "jsonc-eslint-parser";
import { createRequire } from "node:module";
import * as path from "node:path";
import * as tomlEslintParser from "toml-eslint-parser";
import * as yamlEslintParser from "yaml-eslint-parser";

import uptimeWatcherPlugin from "./config/linting/plugins/uptime-watcher.mjs";
import sharedContractInterfaceGuard from "./config/linting/rules/shared-contract-interfaces.mjs";
// Unused and Uninstalled Plugins:
// import putout from "eslint-plugin-putout";
// import pluginPii from "eslint-plugin-pii"; - broken
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

/**
 * @see {@link https://www.schemastore.org/eslintrc.json} for JSON schema validation
 */

/** @typedef {import("eslint").Linter.Config} EslintConfig */
/** @typedef {import("eslint").Linter.BaseConfig} BaseEslintConfig */
/** @typedef {import("eslint").Linter.LinterOptions} LinterOptions */

const require = createRequire(import.meta.url);
const ROOT_DIR = import.meta.dirname;

if (!process.env["RECHECK_JAR"]) {
    const resolvedRecheckJarPath = (() => {
        try {
            return require.resolve("recheck-jar/recheck.jar");
        } catch {
            console.warn(
                '[eslint.config] Unable to resolve "recheck-jar/recheck.jar". eslint-plugin-redos will rely on its internal resolution logic.'
            );
            return undefined;
        }
    })();
    if (resolvedRecheckJarPath) {
        process.env["RECHECK_JAR"] = path.normalize(resolvedRecheckJarPath);
    }
}
export default /** @type {EslintConfig} */ [
    gitignore({
        name: "Global .gitignore Rules",
        root: true,
        strict: true,
    }), // MARK: Global Configs and Rules
    sharedContractInterfaceGuard,
    {
        files: ["src/constants.ts"],
        name: "Monitor Fallback Consistency",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/monitor-fallback-consistency": "error",
        },
    },
    {
        files: ["electron/services/ipc/handlers/**/*.{ts,tsx}"],
        ignores: ["electron/test/**/*"],
        name: "Electron IPC Handler Validation Guardrails",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/electron-ipc-handler-require-validator": "error",
        },
    },
    {
        files: ["electron/**/*.{ts,tsx}"],
        ignores: ["electron/test/**/*"],
        name: "Electron Logger Enforcement",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/electron-no-console": "error",
            "uptime-watcher/electron-no-direct-ipc-handle": "error",
            "uptime-watcher/electron-no-direct-ipc-handler-wrappers": "error",
            "uptime-watcher/electron-no-direct-ipcMain-import": "error",
            "uptime-watcher/electron-no-inline-ipc-channel-literal": "error",
            "uptime-watcher/electron-no-inline-ipc-channel-type-argument":
                "error",
            "uptime-watcher/electron-no-renderer-import": "error",
            "uptime-watcher/electron-prefer-readProcessEnv": "error",
            "uptime-watcher/electron-preload-no-direct-ipcRenderer-usage":
                "error",
            "uptime-watcher/electron-preload-no-inline-ipc-channel-constant":
                "error",
            "uptime-watcher/no-inline-ipc-channel-type-literals": "error",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        name: "TSDoc Logger Examples",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/tsdoc-no-console-example": "error",
        },
    },
    {
        files: [
            "docs/**/*.{ts,tsx}",
            "electron/**/*.{ts,tsx}",
            "src/**/*.{ts,tsx}",
            "storybook/**/*.{ts,tsx}",
        ],
        ignores: ["shared/**/*"],
        name: "Shared Alias Imports",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/prefer-shared-alias": "error",
        },
    },
    {
        files: ["storybook/**/*.{ts,tsx,js,jsx,mts,mjs}"],
        name: "Storybook Dev Helpers - storybook/**/*.{ts,tsx,js,jsx,mts,mjs}",
        rules: {
            "import-x/no-extraneous-dependencies": "off",
            "n/no-extraneous-import": "off",
            "sonarjs/no-implicit-dependencies": "off",
        },
    },
    {
        files: ["shared/**/*.{ts,tsx,cts,mts}"],
        name: "Shared Layer Isolation",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/shared-no-outside-imports": "error",
        },
    },
    {
        files: ["src/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}"],
        ignores: ["src/test/**/*"],
        name: "Renderer Electron Isolation",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/no-inline-ipc-channel-type-literals": "error",
            "uptime-watcher/renderer-no-browser-dialogs": "error",
            "uptime-watcher/renderer-no-direct-bridge-readiness": "error",
            "uptime-watcher/renderer-no-direct-electron-log": "error",
            "uptime-watcher/renderer-no-direct-networking": "error",
            "uptime-watcher/renderer-no-direct-preload-bridge": "error",
            "uptime-watcher/renderer-no-electron-import": "error",
            "uptime-watcher/renderer-no-import-internal-service-utils": "error",
            "uptime-watcher/renderer-no-ipcRenderer-usage": "error",
            "uptime-watcher/renderer-no-preload-bridge-writes": "error",
            "uptime-watcher/renderer-no-window-open": "error",
        },
    },
    {
        files: [
            "electron/**/*.{ts,tsx}",
            "shared/**/*.{ts,tsx}",
            "src/**/*.{ts,tsx}",
            "storybook/**/*.{ts,tsx}",
            "scripts/**/*.{ts,tsx,js,jsx,mts,mjs,cjs,cts}",
        ],
        ignores: [
            "electron/test/**/*",
            "src/test/**/*",
            "shared/test/**/*",
        ],
        name: "No Deprecated Exports",
        plugins: {
            "uptime-watcher": uptimeWatcherPlugin,
        },
        rules: {
            "uptime-watcher/logger-no-error-in-context": "error",
            "uptime-watcher/no-deprecated-exports": "error",
            "uptime-watcher/no-local-error-normalizers": "error",
            "uptime-watcher/no-local-record-guards": "error",
            "uptime-watcher/no-onedrive": "error",
            "uptime-watcher/prefer-app-alias": "error",
        },
    },
    importX.flatConfigs.typescript,
    progress.configs.recommended,
    noBarrelFiles.flat,
    // @ts-expect-error: nitpick.configs.recommended may not have correct types, but runtime usage is verified and safe
    nitpick.configs.recommended,
    pluginComments.recommended,
    arrayFunc.configs.all,
    ...storybook.configs["flat/recommended"],
    ...pluginCasePolice.configs.recommended,
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Global Ignore Patterns
    // Add patterns here to ignore files and directories globally
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        ignores: [
            "**/**-instructions.md",
            "**/**.instructions.md",
            "**/**dist**/**",
            "**/.agentic-tools*",
            "**/.cache/**",
            "**/Coverage/**",
            "**/_ZENTASKS*",
            "**/chatproject.md",
            "**/coverage-results.json",
            "**/coverage/**",
            "**/dist-scripts/**",
            "**/dist/**",
            "**/html/**",
            "**/node_modules/**",
            "**/package-lock.json",
            "**/release/**",
            ".agentic-tools*",
            ".devskim.json",
            ".github/ISSUE_TEMPLATE/**",
            ".github/PULL_REQUEST_TEMPLATE/**",
            ".github/chatmodes/**",
            ".github/instructions/**",
            ".github/prompts/**",
            ".stryker-tmp/**",
            "CHANGELOG.md",
            "Coverage/",
            "_ZENTASKS*",
            "coverage-report.json",
            "coverage/",
            "dist/",
            "docs/Archive/**",
            "docs/Logger-Error-report.md",
            "docs/Packages/**",
            "docs/Reviews/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/docs/**",
            "docs/docusaurus/static/eslint-inspector/**",
            "html/**",
            "node_modules/**",
            "release/",
            "report/**",
            "reports/**",
            "scripts/devtools-snippets/**",
            "storybook-static/**",
            "playwright/reports/**",
            "playwright/test-results/**",
            "public/mockServiceWorker.js",
            "storybook/test-runner-jest.config.js",
            "temp/**",
            ".temp/**",
        ],
        name: "Global Ignore Patterns **/**",
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Global Language Options
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
        name: "Global Language Options **/**",
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Global Settings
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        name: "Global Settings Options **/**",
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
            "react-x": {
                importSource: "react", // Customize the import source for the React module (defaults to "react")
                polymorphicPropName: "as", // Define the prop name used for polymorphic components (e.g., <Component as="div">)
                version: "detect", // Specify the React version for semantic analysis (can be "detect" for auto-detection)
            },
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: YAML/YML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{yaml,yml}"],
        ignores: [],
        language: "yml/yaml",
        languageOptions: {
            parser: yamlEslintParser,
            // Options used with yaml-eslint-parser.
            parserOptions: {
                defaultYAMLVersion: "1.2",
            },
        },
        name: "YAML/YML - **/*.{YAML,YML}",
        plugins: {
            ...jsonSchemaValidatorPlugins,
            yml: eslintPluginYml,
        },
        rules: {
            ...jsonSchemaValidatorRules,
            "yml/block-mapping": "warn",
            "yml/block-mapping-colon-indicator-newline": "error",
            "yml/block-mapping-question-indicator-newline": "error",
            "yml/block-sequence": "warn",
            "yml/block-sequence-hyphen-indicator-newline": "error",
            "yml/file-extension": "off",
            "yml/flow-mapping-curly-newline": "error",
            "yml/flow-mapping-curly-spacing": "error",
            "yml/flow-sequence-bracket-newline": "error",
            "yml/flow-sequence-bracket-spacing": "error",
            "yml/indent": "off",
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
            // Re-enabled: eslint-plugin-yml v2.0.1 fixes the diff-sequences
            // import crash (TypeError: diff is not a function).
            "yml/sort-keys": "error",
            "yml/sort-sequence-values": "off",
            "yml/spaced-comment": "warn",
            "yml/vue-custom-block/no-parsing-error": "warn",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: HTML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{html,htm,xhtml}"],
        ignores: ["report/**"],
        languageOptions: {
            parser: htmlParser,
        },
        name: "HTML - **/*.{HTML,HTM,XHTML}",
        plugins: {
            html: html,
            "styled-components-a11y": styledA11y,
            xss: xss,
        },
        rules: {
            ...html.configs.recommended.rules,
            "html/class-spacing": "warn",
            "html/css-no-empty-blocks": "warn",
            "html/id-naming-convention": "warn",
            "html/indent": "error",
            "html/lowercase": "warn",
            "html/max-element-depth": "warn",
            "html/no-abstract-roles": "warn",
            "html/no-accesskey-attrs": "warn",
            "html/no-aria-hidden-body": "warn",
            "html/no-aria-hidden-on-focusable": "warn",
            "html/no-duplicate-class": "warn",
            "html/no-empty-headings": "warn",
            "html/no-extra-spacing-attrs": [
                "error",
                { enforceBeforeSelfClose: true },
            ],
            "html/no-extra-spacing-text": "warn",
            "html/no-heading-inside-button": "warn",
            "html/no-ineffective-attrs": "warn",
            // HTML Eslint Plugin Rules (html/*)
            "html/no-inline-styles": "warn",
            "html/no-invalid-entity": "warn",
            "html/no-invalid-role": "warn",
            "html/no-multiple-empty-lines": "warn",
            "html/no-nested-interactive": "warn",
            "html/no-non-scalable-viewport": "warn",
            "html/no-positive-tabindex": "warn",
            "html/no-restricted-attr-values": "warn",
            "html/no-restricted-attrs": "warn",
            "html/no-restricted-tags": "warn",
            "html/no-script-style-type": "warn",
            "html/no-skip-heading-levels": "warn",
            "html/no-target-blank": "warn",
            "html/no-trailing-spaces": "warn",
            "html/no-whitespace-only-children": "warn",
            "html/prefer-https": "warn",
            "html/require-attrs": "warn",
            "html/require-button-type": "warn",
            "html/require-closing-tags": "off",
            "html/require-explicit-size": "warn",
            "html/require-form-method": "warn",
            "html/require-frame-title": "warn",
            "html/require-input-label": "warn",
            "html/require-meta-charset": "warn",
            "html/require-meta-description": "warn",
            "html/require-meta-viewport": "warn",
            "html/require-open-graph-protocol": "warn",
            "html/sort-attrs": "warn",
            "styled-components-a11y/lang": "off",
            "xss/no-mixed-html": [
                "off",
                {
                    encoders: [
                        "utils.htmlEncode()",
                        "CSS.escape()",
                        "Number()",
                    ],
                    unsafe: [".html()"],
                },
            ],
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: HTML in JS/TS files (HTML Literals)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}"],
        ignores: ["report/**"],
        name: "HTML in JS/TS - **/*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        plugins: {
            html: html,
            "styled-components-a11y": styledA11y,
            xss: xss,
        },
        rules: {
            // HTML Eslint Plugin Rules (html/*)
            ...html.configs.recommended.rules,
            "html/indent": "error",
            "html/no-extra-spacing-attrs": [
                "error",
                { enforceBeforeSelfClose: true },
            ],
            "html/require-closing-tags": "off",
            "styled-components-a11y/lang": "off",
            "xss/no-mixed-html": [
                "off",
                {
                    encoders: [
                        "utils.htmlEncode()",
                        "CSS.escape()",
                        "Number()",
                    ],
                    unsafe: [".html()"],
                },
            ],
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Package.json Linting (PubLint)
    // ═══════════════════════════════════════════════════════════════════════════════
    // {
    //     name: "Package - **/Package.json - Publint",
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
    // MARK: Package.json Linting
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/package.json"],
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        name: "Package - **/Package.json",
        plugins: { json: json, "package-json": packageJson },
        rules: {
            ...json.configs.recommended.rules,
            // Package.json Plugin Rules (package-json/*)
            "package-json/bin-name-casing": "warn",
            "package-json/exports-subpaths-style": "warn",
            "package-json/no-empty-fields": "warn",
            "package-json/no-redundant-files": "warn",
            "package-json/no-redundant-publishConfig": "warn",
            "package-json/order-properties": "warn",
            "package-json/repository-shorthand": "warn",
            "package-json/require-attribution": "warn",
            "package-json/require-author": "warn",
            "package-json/require-bugs": "warn",
            "package-json/require-bundleDependencies": "off",
            "package-json/require-dependencies": "warn",
            "package-json/require-description": "warn",
            "package-json/require-devDependencies": "warn",
            "package-json/require-engines": "warn",
            "package-json/require-exports": "warn",
            "package-json/require-files": "off", // Not needed for Electron applications
            "package-json/require-homepage": "warn",
            "package-json/require-keywords": "warn",
            "package-json/require-license": "warn",
            "package-json/require-name": "warn",
            "package-json/require-optionalDependencies": "off", // Not needed for Electron applications
            "package-json/require-peerDependencies": "off",
            "package-json/require-repository": "error",
            "package-json/require-scripts": "warn",
            "package-json/require-sideEffects": "warn",
            "package-json/require-type": "warn",
            "package-json/require-types": "off", // Not needed for Electron applications
            "package-json/require-version": "warn",
            "package-json/restrict-dependency-ranges": "warn",
            "package-json/restrict-private-properties": "warn",
            "package-json/scripts-name-casing": "warn",
            "package-json/sort-collections": "warn",
            "package-json/specify-peers-locally": "warn",
            "package-json/unique-dependencies": "warn",
            "package-json/valid-author": "warn",
            "package-json/valid-bin": "warn",
            "package-json/valid-bundleDependencies": "warn",
            "package-json/valid-config": "warn",
            "package-json/valid-contributors": "warn",
            "package-json/valid-cpu": "warn",
            "package-json/valid-dependencies": "warn",
            "package-json/valid-description": "warn",
            "package-json/valid-devDependencies": "warn",
            "package-json/valid-directories": "warn",
            "package-json/valid-engines": "warn",
            "package-json/valid-exports": "warn",
            "package-json/valid-files": "warn",
            "package-json/valid-homepage": "warn",
            "package-json/valid-keywords": "warn",
            "package-json/valid-license": "warn",
            "package-json/valid-local-dependency": "off",
            "package-json/valid-main": "warn",
            "package-json/valid-man": "warn",
            "package-json/valid-module": "warn",
            "package-json/valid-name": "warn",
            "package-json/valid-optionalDependencies": "warn",
            "package-json/valid-os": "warn",
            "package-json/valid-package-definition": "warn",
            "package-json/valid-peerDependencies": "warn",
            "package-json/valid-private": "warn",
            "package-json/valid-publishConfig": "warn",
            "package-json/valid-repository": "warn",
            "package-json/valid-repository-directory": "warn",
            "package-json/valid-scripts": "warn",
            "package-json/valid-sideEffects": "warn",
            "package-json/valid-type": "warn",
            "package-json/valid-version": "warn",
            "package-json/valid-workspaces": "warn",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: MDX Eslint Rules (mdx/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    // Main MDX Configuration - for MDX files with comprehensive remark linting
    {
        files: ["**/*.mdx"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                React: false,
            },
            parser: eslintMdx,
            sourceType: "module",
        },
        name: "MDX - **/*.MDX (Main with Remark)",
        plugins: { mdx: mdx },
        rules: {
            ...mdx.flat.rules,
            // MDX-specific rules
            "mdx/remark": "warn",
            "no-unused-expressions": "error",
            // React rules for MDX components
            "react/react-in-jsx-scope": "off",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: MDX CodeBlocks
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.mdx"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                React: false,
            },
            parser: eslintMdx,
            sourceType: "module",
        },
        name: "MDX - **/*.MDX (Code Blocks)",
        plugins: { mdx: mdx },
        rules: {
            ...mdx.flatCodeBlocks.rules,
            // Additional rules for code blocks
            "no-console": "warn",
            "no-unused-vars": "error",
            // Core Plugin ESLint Rules for code blocks
            "no-var": "error",
            "prefer-const": "error",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Markdown (md/*, markdown/*, markup/*, atom/*, rss/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{md,markup,atom,rss,markdown}"],
        ignores: [
            "**/docs/packages/**",
            "**/docs/TSDoc/**",
            "**/.github/agents/**",
        ],
        language: "markdown/gfm",
        name: "MD - **/*.{MD,MARKUP,ATOM,RSS,MARKDOWN} (with Remark)",
        plugins: {
            markdown: markdown,
            mdx: mdx,
        },
        rules: {
            // Markdown Plugin Eslint Rules (markdown/*)
            "markdown/fenced-code-language": "warn",
            "markdown/heading-increment": "warn",
            "markdown/no-bare-urls": "warn",
            "markdown/no-duplicate-definitions": "warn",
            "markdown/no-duplicate-headings": "warn",
            "markdown/no-empty-definitions": "warn",
            "markdown/no-empty-images": "warn",
            "markdown/no-empty-links": "warn",
            "markdown/no-html": "off",
            "markdown/no-invalid-label-refs": "warn",
            "markdown/no-missing-atx-heading-space": "warn",
            "markdown/no-missing-label-refs": "warn",
            "markdown/no-missing-link-fragments": "warn",
            "markdown/no-multiple-h1": "warn",
            "markdown/no-reference-like-urls": "warn",
            "markdown/no-reversed-media-syntax": "warn",
            "markdown/no-space-in-emphasis": "warn",
            "markdown/no-unused-definitions": "warn",
            "markdown/require-alt-text": "warn",
            "markdown/table-column-count": "warn",
            // Remark linting integration
            "mdx/remark": "warn",
        },
        settings: {
            processor: mdx.createRemarkProcessor({
                // Enable remark configuration file (.remarkrc.mjs) for comprehensive linting
                ignoreRemarkConfig: false,
                // Disable code block linting for regular markdown (use markdown plugin instead)
                lintCodeBlocks: false,
                // Path to remark config (optional, will auto-discover .remarkrc.mjs)
                remarkConfigPath: ".remarkrc.mjs",
            }),
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: CSS (css/*)
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
        name: "CSS - **/*.CSS",
        plugins: {
            css: css,
        },
        rules: {
            ...css.configs.recommended.rules,
            // CSS Eslint Rules (css/*)
            "css/no-empty-blocks": "error",
            "css/no-invalid-at-rules": "off",
            "css/no-invalid-properties": "off",
            "css/prefer-logical-properties": "warn",
            "css/relative-font-units": "warn",
            "css/selector-complexity": "off",
            "css/use-baseline": "off",
            "css/use-layers": "off",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JSONC (jsonc/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/*.jsonc",
            ".vscode/*.json",
        ],
        ignores: [],
        name: "JSONC - **/*.JSONC",
        // ═══════════════════════════════════════════════════════════════════════════════
        // Plugin Config for eslint-plugin-jsonc to enable Prettier formatting
        // ═══════════════════════════════════════════════════════════════════════════════
        ...eslintPluginJsonc.configs["flat/prettier"][0],
        language: "json/jsonc",
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        plugins: {
            json: json,
            jsonc: eslintPluginJsonc,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: {
            ...json.configs.recommended.rules,
            "jsonc/array-bracket-newline": "warn",
            "jsonc/array-bracket-spacing": "warn",
            "jsonc/array-element-newline": "warn",
            "jsonc/auto": "warn",
            "jsonc/comma-dangle": "warn",
            "jsonc/comma-style": "warn",
            "jsonc/indent": "off", // Handled by Prettier
            "jsonc/key-name-casing": "off",
            "jsonc/key-spacing": "warn",
            "jsonc/no-bigint-literals": "warn",
            "jsonc/no-binary-expression": "warn",
            "jsonc/no-binary-numeric-literals": "warn",
            "jsonc/no-comments": "warn",
            "jsonc/no-dupe-keys": "warn",
            "jsonc/no-escape-sequence-in-identifier": "warn",
            "jsonc/no-floating-decimal": "warn",
            "jsonc/no-hexadecimal-numeric-literals": "warn",
            "jsonc/no-infinity": "warn",
            "jsonc/no-irregular-whitespace": "warn",
            "jsonc/no-multi-str": "warn",
            "jsonc/no-nan": "warn",
            "jsonc/no-number-props": "warn",
            "jsonc/no-numeric-separators": "warn",
            "jsonc/no-octal": "warn",
            "jsonc/no-octal-escape": "warn",
            "jsonc/no-octal-numeric-literals": "warn",
            "jsonc/no-parenthesized": "warn",
            "jsonc/no-plus-sign": "warn",
            "jsonc/no-regexp-literals": "warn",
            "jsonc/no-sparse-arrays": "warn",
            "jsonc/no-template-literals": "warn",
            "jsonc/no-undefined-value": "warn",
            "jsonc/no-unicode-codepoint-escapes": "warn",
            "jsonc/no-useless-escape": "warn",
            "jsonc/object-curly-newline": "warn",
            "jsonc/object-curly-spacing": "warn",
            "jsonc/object-property-newline": "warn",
            "jsonc/quote-props": "warn",
            "jsonc/quotes": "warn",
            "jsonc/sort-array-values": [
                "error",
                {
                    order: { type: "asc" },
                    pathPattern: "^files$", // Hits the files property
                },
                {
                    order: [
                        "eslint",
                        "eslintplugin",
                        "eslint-plugin",
                        {
                            // Fallback order
                            order: { type: "asc" },
                        },
                    ],
                    pathPattern: "^keywords$", // Hits the keywords property
                },
            ],
            "jsonc/sort-keys": [
                "error",
                // For example, a definition for package.json
                {
                    order: [
                        "name",
                        "version",
                        "private",
                        "publishConfig",
                        // ...
                    ],
                    pathPattern: "^$", // Hits the root properties
                },
            // Disabled: eslint-plugin-yml currently crashes during auto-fix on
            // Windows/Node 25 (TypeError: diff is not a function), which breaks
            // `lint:fix` entirely. Re-enable once upstream is fixed.
                {
                    order: { type: "asc" },
                    pathPattern:
                        "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
                },
                // ...
            ],
            "jsonc/space-unary-ops": "warn",
            "jsonc/valid-json-number": "warn",
            "jsonc/vue-custom-block/no-parsing-error": "warn",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JSON (json/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json"],
        language: "json/json",
        name: "JSON - **/*.JSON",
        plugins: {
            json: json,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: {
            ...json.configs.recommended.rules,
            ...jsonSchemaValidatorRules,
            "json/sort-keys": ["warn"],
            "json/top-level-interop": "warn",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JSON5 (json5/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json5"],
        language: "json/json5",
        name: "JSON5 - **/*.JSON5",
        plugins: {
            json: json,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: {
            ...json.configs.recommended.rules,
            ...jsonSchemaValidatorRules,
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: TOML (toml/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.toml"],
        ignores: ["lychee.toml"],
        languageOptions: {
            parser: tomlEslintParser,
            parserOptions: { tomlVersion: "1.0.0" },
        },
        name: "TOML - **/*.TOML",
        plugins: { toml: eslintPluginToml },
        rules: {
            // TOML Eslint Plugin Rules (toml/*)
            "toml/array-bracket-newline": "warn",
            "toml/array-bracket-spacing": "warn",
            "toml/array-element-newline": "warn",
            "toml/comma-style": "warn",
            "toml/indent": "off",
            "toml/inline-table-curly-spacing": "warn",
            "toml/key-spacing": "off",
            "toml/keys-order": "warn",
            "toml/no-mixed-type-in-array": "warn",
            "toml/no-non-decimal-integer": "warn",
            "toml/no-space-dots": "warn",
            "toml/no-unreadable-number-separator": "warn",
            "toml/padding-line-between-pairs": "warn",
            "toml/padding-line-between-tables": "warn",
            "toml/precision-of-fractional-seconds": "warn",
            "toml/precision-of-integer": "warn",
            "toml/quoted-keys": "warn",
            "toml/space-eq-sign": "warn",
            "toml/spaced-comment": "warn",
            "toml/table-bracket-spacing": "warn",
            "toml/tables-order": "warn",
            "toml/vue-custom-block/no-parsing-error": "warn",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: TSX/JSX (tsx/*, jsx/*)
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
        name: "TSX/JSX - **/*.{TSX,JSX}",
        plugins: {
            "better-tailwindcss": pluginBetterTailwindcss,
            css: css,
            "no-hardcoded-strings": pluginNoHardcoded,
            "react-19-upgrade": react19upgrade,
            tailwind: tailwind,
            "undefined-css-classes": pluginUndefinedCss,
        },
        rules: {
            // TypeScript rules
            ...css.configs.recommended.rules,
            ...pluginUndefinedCss.configs["with-tailwind"].rules,
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...pluginBetterTailwindcss.configs["correctness"].rules,
            "better-tailwindcss/enforce-canonical-classes": "warn",
            "better-tailwindcss/enforce-consistent-class-order": "warn",
            "better-tailwindcss/enforce-consistent-important-position": "warn",
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
            "better-tailwindcss/enforce-consistent-variable-syntax": "warn",
            "better-tailwindcss/enforce-shorthand-classes": "off",
            "better-tailwindcss/no-deprecated-classes": "warn",
            "better-tailwindcss/no-duplicate-classes": "warn",
            "better-tailwindcss/no-restricted-classes": "warn",
            "better-tailwindcss/no-unknown-classes": "off",
            "better-tailwindcss/no-unnecessary-whitespace": "warn",
            "better-tailwindcss/no-unregistered-classes": [
                "off",
                {
                    detectComponentClasses: true,
                },
            ],
            "react-19-upgrade/no-default-props": "error",
            "react-19-upgrade/no-factories": "error",
            "react-19-upgrade/no-legacy-context": "error",
            "react-19-upgrade/no-prop-types": "warn",
            "react-19-upgrade/no-string-refs": "error",
            // No Hardcoded Strings Plugin Rules (no-hardcoded-strings/*)
            // "no-hardcoded-strings/no-hardcoded-strings": [
            //     "warn",
            //     {
            //         allowedFunctionNames: ["t", "translate", "i18n"],
            //         ignoreStrings: ["OK", "Cancel"],
            //         ignorePatterns: [/^[\s\d\-:]+$/u], // Ignore dates, times, numbers
            //     },
            // ],
            // Tailwind CSS Plugin Rules (tailwind/*)
            "tailwind/classnames-order": "warn",
            "tailwind/enforces-negative-arbitrary-values": "warn",
            "tailwind/enforces-shorthand": "warn",
            "tailwind/migration-from-tailwind-2": "warn",
            "tailwind/no-arbitrary-value": "warn",
            "tailwind/no-contradicting-classname": "warn",
            /**
             * Performance issue with the plugin, somewhat mitigated setting
             * cssFiles to an empty array.
             *
             * @link https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/174
             *
             * @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/276#issuecomment-2481272848
             */
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
            "better-tailwindcss": {
                // Tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
                entryPoint: "./src/index.css",
            },
            react: { version: "19" },
            tailwindcss: {
                config: `${ROOT_DIR}/src/index.css`,
                // @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/276#issuecomment-2481272848
                cssFiles: ["./src/index.css"],
            },
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Docusaurus (docusaurus/*)
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
        name: "Docusaurus - docs/docusaurus/**/*.{TS,TSX,MJS,CJS,JS,JSX,MTS,CTS}",
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
            "@rushstack/security": rushStackSecurity,
            "@typescript-eslint": tseslint,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            // New plugins from user request
            "clean-timer": pluginCleanTimer,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, using fixupPluginRules causes this
            deprecation: fixupPluginRules(pluginDeprecation),
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
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-secrets": noSecrets,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            react: pluginReact,
            "react-hooks": reactHooks,
            "react-hooks-addons": reactHooksAddons,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sort-keys-fix": pluginSortKeysFix,
            "sql-template": sqlTemplate,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "styled-components-a11y": styledA11y,
            "switch-case": pluginSwitchCase,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            "tsdoc-require": pluginTSDocRequire,
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
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
            ...pluginComments.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-type-checked"].rules,
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
            ...zod.configs.recommended.rules,
            "@docusaurus/no-html-links": "warn",
            "@docusaurus/no-untranslated-text": "off",
            "@docusaurus/prefer-docusaurus-heading": "warn",
            "@docusaurus/string-literal-i18n-messages": "off",
            "@eslint-community/eslint-comments/no-restricted-disable": "warn",
            "@eslint-community/eslint-comments/no-unused-disable": "warn",
            "@eslint-community/eslint-comments/no-use": "off",
            "@eslint-community/eslint-comments/require-description": "warn",
            "@eslint-react/avoid-shorthand-boolean": "off",
            "@eslint-react/dom/no-missing-button-type": "warn",
            "@eslint-react/dom/no-missing-iframe-sandbox": "warn",
            "@eslint-react/dom/no-string-style-prop": "error",
            "@eslint-react/dom/no-unknown-property": "warn",
            "@eslint-react/dom/no-unsafe-target-blank": "warn",
            /* DOM subplugin */
            "@eslint-react/dom/no-void-elements-with-children": "warn",
            "@eslint-react/dom/prefer-namespace-import": "warn",
            "@eslint-react/hooks-extra/ensure-use-callback-has-non-empty-deps":
                "off",
            "@eslint-react/hooks-extra/ensure-use-memo-has-non-empty-deps":
                "off",
            /* Hooks extra subplugin */
            "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect":
                "warn",
            "@eslint-react/jsx-dollar": "warn",
            "@eslint-react/jsx-key-before-spread": "warn",
            "@eslint-react/jsx-no-iife": "warn",
            "@eslint-react/jsx-no-undef": "warn",
            "@eslint-react/jsx-shorthand-boolean": "warn",
            "@eslint-react/jsx-shorthand-fragment": "warn",
            "@eslint-react/jsx-uses-react": "warn",
            "@eslint-react/jsx-uses-vars": "warn",
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            /* Naming convention subplugin */
            "@eslint-react/naming-convention/filename": "off",
            "@eslint-react/naming-convention/filename-extension": "off",
            "@eslint-react/naming-convention/use-state": "warn",
            "@eslint-react/no-children-prop": "warn",
            "@eslint-react/no-class-component": "warn",
            "@eslint-react/no-duplicate-key": "warn",
            "@eslint-react/no-forbidden-props": "off",
            "@eslint-react/no-leaked-conditional-rendering": "warn",
            "@eslint-react/no-missing-component-display-name": "warn",
            "@eslint-react/no-missing-context-display-name": "warn",
            "@eslint-react/no-misused-capture-owner-stack": "warn",
            "@eslint-react/no-nested-component-definitions": "warn",
            "@eslint-react/no-unnecessary-key": "warn",
            "@eslint-react/no-unnecessary-use-callback": "off",
            "@eslint-react/no-unnecessary-use-memo": "off",
            "@eslint-react/no-unnecessary-use-prefix": "warn",
            "@eslint-react/no-unnecessary-use-ref": "warn",
            "@eslint-react/no-unstable-context-value": "warn",
            "@eslint-react/no-unstable-default-props": "warn",
            "@eslint-react/no-unused-props": "warn",
            "@eslint-react/no-unused-state": "warn",
            "@eslint-react/no-useless-forward-ref": "warn",
            "@eslint-react/no-useless-fragment": "warn",
            "@eslint-react/prefer-destructuring-assignment": "warn",
            "@eslint-react/prefer-namespace-import": "off",
            "@eslint-react/prefer-react-namespace-import": "off",
            "@eslint-react/prefer-read-only-props": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "off",
                {
                    ignore: [
                        "@app",
                        "@app/*",
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
            "@microsoft/sdl/no-angular-bypass-sanitizer": "warn",
            "@microsoft/sdl/no-angular-sanitization-trusted-urls": "warn",
            "@microsoft/sdl/no-angularjs-bypass-sce": "warn",
            "@microsoft/sdl/no-angularjs-enable-svg": "warn",
            "@microsoft/sdl/no-angularjs-sanitization-whitelist": "warn",
            "@microsoft/sdl/no-cookies": "warn",
            "@microsoft/sdl/no-document-domain": "warn",
            "@microsoft/sdl/no-document-write": "warn",
            "@microsoft/sdl/no-electron-node-integration": "warn",
            "@microsoft/sdl/no-html-method": "warn",
            "@microsoft/sdl/no-inner-html": "warn",
            "@microsoft/sdl/no-insecure-random": "off",
            "@microsoft/sdl/no-insecure-url": "warn",
            "@microsoft/sdl/no-msapp-exec-unsafe": "warn",
            "@microsoft/sdl/no-postmessage-star-origin": "warn",
            "@microsoft/sdl/no-unsafe-alloc": "warn",
            "@microsoft/sdl/no-winjs-html-unsafe": "warn",
            "@rushstack/security/no-unsafe-regexp": "warn",
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
            "@typescript-eslint/max-params": [
                "warn",
                {
                    countVoidThis: false,
                    max: 20,
                },
            ],
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
            "@typescript-eslint/no-type-alias": "off",
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
            "@typescript-eslint/no-unused-private-class-members": "warn",
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
            "@typescript-eslint/unified-signatures": "off",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            "boundaries/element-types": [
                "off",
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
                        { allow: ["types"], from: "types" },
                        {
                            allow: [
                                "types",
                                "constants",
                            ],
                            from: "utils",
                        },
                        {
                            allow: [
                                "app",
                                "styles",
                            ],
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
            // Architecture boundaries for Frontend
            "boundaries/no-ignored": "off",
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-match-exported": "off",
            // Core quality rules
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules
            "canonical/filename-no-index": "off",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-import-namespace-destructure": "warn",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/no-restricted-imports": "off",
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
            "canonical/prefer-react-lazy": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            "clean-code/exception-handling": "off",
            // "write-good-comments/write-good-comments": "warn",
            "clean-code/feature-envy": "off",
            "clean-timer/assign-timer-id": "warn",
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
            "comment-length/limit-tagged-template-literal-comments": "warn",
            complexity: "off",
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            "css/no-invalid-properties": "off",
            "css/selector-complexity": "off",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": [
                "warn",
                {
                    allowed: [
                        "eslint-plugin-react",
                        "axios",
                    ],
                },
            ],
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
            "etc/no-commented-out-code": "off",
            "etc/no-const-enum": "warn",
            "etc/no-enum": "off",
            "etc/no-foreach": "off",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "off",
            "etc/prefer-less-than": "off",
            "etc/throw-error": "warn",
            "etc/underscore-internal": "off",
            "ex/might-throw": "off",
            "ex/no-unhandled": "warn",
            "ex/use-error-cause": "warn",
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
            "import-x/consistent-type-specifier-style": "off",
            "import-x/default": "warn",
            "import-x/dynamic-import-chunkname": "warn",
            "import-x/export": "warn",
            "import-x/exports-last": "off",
            "import-x/extensions": "warn",
            "import-x/first": "warn",
            "import-x/group-exports": "off",
            "import-x/max-dependencies": "off",
            // Import/Export Rules (import-x/*)
            "import-x/named": "warn",
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
            "import-x/prefer-namespace-import": "off",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility (jsx-a11y)
            "jsx-a11y/anchor-ambiguous-text": "warn",
            "jsx-a11y/lang": "off",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "off",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: true,
                    allowArrayStart: true,
                    allowBlockEnd: true,
                    allowBlockStart: true,
                    allowClassEnd: true,
                    allowClassStart: true,
                    allowObjectEnd: true,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: false,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "warn",
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
            // Sonar quality helpers
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "module-interop/no-import-cjs": "off",
            "module-interop/no-require-esm": "off",
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
            "n/no-process-env": [
                "error",
                {
                    allowedVariables: [
                        "NODE_ENV",
                        "HEADLESS",
                        "CI",
                        "TEST_MODE",
                    ],
                },
            ],
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unpublished-import": [
                "warn",
                {
                    allowModules: [
                        "electron",
                        "node",
                        "electron-devtools-installer",
                        "eslint-plugin-storybook",
                        "index.css",
                        "styles.css",
                        "main.css",
                        "header.css",
                        "footer.css",
                    ],
                },
            ],
            "n/no-unsupported-features/es-builtins": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/es-syntax": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/node-builtins": [
                "warn",
                {
                    allowExperimental: true,
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
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
            "no-empty-character-class": "error",
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-invalid-regexp": "error",
            "no-lookahead-lookbehind-regexp/no-lookahead-lookbehind-regexp":
                "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unexpected-multiline": "error",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-useless-backreference": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "warn",
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-const": "error",
            "prefer-template": "warn",
            //            "prettier/prettier": [
            //                "warn",
            //                { usePrettierrc: true },
            //            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "react-hooks-addons/no-unused-deps": "warn",
            "react-hooks/automatic-effect-dependencies": "warn",
            "react-hooks/capitalized-calls": "warn",
            "react-hooks/fbt": "warn",
            "react-hooks/fire": "warn",
            "react-hooks/hooks": "warn",
            "react-hooks/invariant": "warn",
            "react-hooks/memoized-effect-dependencies": "warn",
            "react-hooks/no-deriving-state-in-effects": "warn",
            "react-hooks/rule-suppression": "warn",
            "react-hooks/syntax": "warn",
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
            "regexp/require-unicode-regexp": "warn",
            // Conflicts with our runtime safety policy (we forbid /v) and
            // produces contradictory guidance alongside `uptime-watcher/no-regexp-v-flag`.
            "regexp/require-unicode-sets-regexp": "off",
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
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": [
                "warn",
                30,
            ],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off", // Conflicts with no-else-return rule
            "sonarjs/for-in": "warn",
            "sonarjs/function-return-type": "off", // Allow flexible return types in Docusaurus
            "sonarjs/nested-control-flow": "off", // Too strict for complex business logic
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "off", // Conflicts with modern arrow functions and closures
            "sonarjs/no-implicit-dependencies": "off", // False positives with Docusaurus and framework dependencies
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off", // Complex interface-dependent ordering not worth the effort
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
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
            "sort-keys-fix/sort-keys-fix": "off",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "switch-case/newline-between-switch-case": "off",
            "switch-case/no-case-curly": "off",
            "total-functions/no-hidden-type-assertions": "off",
            "total-functions/no-nested-fp-ts-effects": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-mutable-readonly-assignment": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            "total-functions/require-strict-mode": "off",
            "tsdoc-require/require": "warn", // Backend-specific unicorn rules
            // Documentation
            "tsdoc/syntax": "warn",
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true, // Service classes
                    },
                },
            ],
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-immediate-mutation": "warn",
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
            "unicorn/no-useless-collection-argument": "warn",
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-response-static-json": "warn",
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
            "zod/consistent-import-source": "error",
            "zod/consistent-object-schema-type": "error",
            "zod/no-unknown-schema": "error",
            "zod/schema-error-property-style": "error",
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Docusaurus CSS (docs/docusaurus/**/*.css)
    // ═══════════════════════════════════════════════════════════════════════════════
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
        name: "Docusaurus CSS - docs/docusaurus/**/*.CSS",
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
            "css/selector-complexity": "off",
            "css/use-baseline": "off",
            // CSS Classes Rules (undefined-css-classes/*)
            "undefined-css-classes/no-undefined-css-classes": "warn",
            // "no-hardcoded-strings/no-hardcoded-strings": [
            //     "warn",
            //     {
            //         allowedFunctionNames: ["t", "translate", "i18n"],
            //         ignoreStrings: ["OK", "Cancel"],
            //         ignorePatterns: [/^[\s\d\-:]+$/u], // Ignore dates, times, numbers
            //     },
            // ],
        },
        settings: {},
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: TypeScript Frontend (src/**/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "src/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "storybook/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            ".storybook/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
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
                project: [
                    "tsconfig.json",
                    ".storybook/tsconfig.json",
                    "storybook/tsconfig.json",
                    "storybook/tsconfig.eslint.json",
                ],
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        name: "TypeScript Frontend - src/**/*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
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
            "@rushstack/security": rushStackSecurity,
            "@typescript-eslint": tseslint,
            antfu: antfu,
            "array-func": arrayFunc,
            "better-tailwindcss": pluginBetterTailwindcss,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            // New plugins from user request
            "clean-timer": pluginCleanTimer,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, using fixupPluginRules causes this
            deprecation: fixupPluginRules(pluginDeprecation),
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
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-secrets": noSecrets,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            paths: paths,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            react: pluginReact,
            "react-19-upgrade": react19upgrade,
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
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sort-keys-fix": pluginSortKeysFix,
            "sort-react-dependency-arrays": pluginSortReactDependency,
            "sql-template": sqlTemplate,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            storybook: storybook,
            "styled-components-a11y": styledA11y,
            "switch-case": pluginSwitchCase,
            tailwind: tailwind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            "tsdoc-require": pluginTSDocRequire,
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
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
            ...pluginComments.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-type-checked"].rules,
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
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...pluginBetterTailwindcss.configs["correctness"].rules,
            ...zod.configs.recommended.rules,
            "@arthurgeron/react-usememo/require-memo": "off",
            "@arthurgeron/react-usememo/require-usememo": "error",
            "@arthurgeron/react-usememo/require-usememo-children": "off",
            // Sonar quality helpers
            "@eslint-community/eslint-comments/no-restricted-disable": "warn",
            "@eslint-community/eslint-comments/no-unused-disable": "warn",
            "@eslint-community/eslint-comments/no-use": "off",
            "@eslint-community/eslint-comments/require-description": "warn",
            "@eslint-react/avoid-shorthand-boolean": "off",
            "@eslint-react/dom/no-missing-button-type": "warn",
            "@eslint-react/dom/no-missing-iframe-sandbox": "warn",
            "@eslint-react/dom/no-unknown-property": "warn",
            "@eslint-react/dom/no-unsafe-target-blank": "warn",
            /* DOM subplugin */
            "@eslint-react/dom/no-void-elements-with-children": "warn",
            "@eslint-react/dom/prefer-namespace-import": "warn",
            "@eslint-react/hooks-extra/ensure-use-callback-has-non-empty-deps":
                "off",
            "@eslint-react/hooks-extra/ensure-use-memo-has-non-empty-deps":
                "off",
            /* Hooks extra subplugin */
            "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect":
                "warn",
            "@eslint-react/jsx-dollar": "warn",
            "@eslint-react/jsx-key-before-spread": "warn",
            "@eslint-react/jsx-no-iife": "warn",
            "@eslint-react/jsx-no-undef": "warn",
            "@eslint-react/jsx-shorthand-boolean": "warn",
            "@eslint-react/jsx-shorthand-fragment": "warn",
            "@eslint-react/jsx-uses-react": "warn",
            "@eslint-react/jsx-uses-vars": "warn",
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            /* Naming convention subplugin */
            "@eslint-react/naming-convention/filename": "off",
            "@eslint-react/naming-convention/filename-extension": "off",
            "@eslint-react/naming-convention/use-state": "warn",
            "@eslint-react/no-children-prop": "warn",
            "@eslint-react/no-class-component": "warn",
            "@eslint-react/no-duplicate-key": "warn",
            "@eslint-react/no-forbidden-props": "off",
            "@eslint-react/no-leaked-conditional-rendering": "warn",
            "@eslint-react/no-missing-component-display-name": "warn",
            "@eslint-react/no-missing-context-display-name": "warn",
            "@eslint-react/no-misused-capture-owner-stack": "warn",
            "@eslint-react/no-nested-component-definitions": "warn",
            "@eslint-react/no-unnecessary-key": "warn",
            "@eslint-react/no-unnecessary-use-callback": "off",
            "@eslint-react/no-unnecessary-use-memo": "off",
            "@eslint-react/no-unnecessary-use-prefix": "warn",
            "@eslint-react/no-unnecessary-use-ref": "warn",
            "@eslint-react/no-unstable-context-value": "warn",
            "@eslint-react/no-unstable-default-props": "warn",
            "@eslint-react/no-unused-props": "warn",
            "@eslint-react/no-unused-state": "warn",
            "@eslint-react/no-useless-forward-ref": "warn",
            "@eslint-react/no-useless-fragment": "warn",
            "@eslint-react/prefer-destructuring-assignment": "warn",
            "@eslint-react/prefer-namespace-import": "off",
            "@eslint-react/prefer-react-namespace-import": "off",
            "@eslint-react/prefer-read-only-props": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "off",
                {
                    ignore: [
                        "@app",
                        "@app/*",
                        "@shared",
                        "electron-devtools-installer",
                        "electron",
                        "@site",
                        "@theme",
                        "@docusaurus",
                        "@storybook/react-vite",
                        "@storybook/addon-a11y",
                        "@storybook/addon-docs",
                        "@storybook/test",
                        "storybook",
                        "@babel/core",
                        "@vitejs/plugin-react",
                        "vite",
                        "@app/theme",
                        "@storybook/react",
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
            "@microsoft/sdl/no-angular-bypass-sanitizer": "warn",
            "@microsoft/sdl/no-angular-sanitization-trusted-urls": "warn",
            "@microsoft/sdl/no-angularjs-bypass-sce": "warn",
            "@microsoft/sdl/no-angularjs-enable-svg": "warn",
            "@microsoft/sdl/no-angularjs-sanitization-whitelist": "warn",
            "@microsoft/sdl/no-cookies": "warn",
            "@microsoft/sdl/no-document-domain": "warn",
            "@microsoft/sdl/no-document-write": "warn",
            "@microsoft/sdl/no-electron-node-integration": "warn",
            "@microsoft/sdl/no-html-method": "warn",
            "@microsoft/sdl/no-inner-html": "warn",
            "@microsoft/sdl/no-insecure-random": "off",
            "@microsoft/sdl/no-insecure-url": "warn",
            "@microsoft/sdl/no-msapp-exec-unsafe": "warn",
            "@microsoft/sdl/no-postmessage-star-origin": "warn",
            "@microsoft/sdl/no-unsafe-alloc": "warn",
            "@microsoft/sdl/no-winjs-html-unsafe": "warn",
            "@rushstack/security/no-unsafe-regexp": "warn",
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
            "@typescript-eslint/max-params": [
                "warn",
                {
                    countVoidThis: false,
                    max: 20,
                },
            ],
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
            "@typescript-eslint/no-type-alias": "off",
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
            "@typescript-eslint/no-unused-private-class-members": "warn",
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
            "@typescript-eslint/unified-signatures": "off",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            "antfu/consistent-chaining": "warn",
            "antfu/consistent-list-newline": "off",
            "antfu/curly": "error",
            "antfu/if-newline": "off",
            "antfu/import-dedupe": "error",
            "antfu/indent-unindent": "error",
            "antfu/no-import-dist": "error",
            "antfu/no-import-node-modules-by-path": "error",
            "antfu/no-top-level-await": "error",
            "antfu/no-ts-export-equal": "error",
            "antfu/top-level-function": "off",
            "better-tailwindcss/enforce-canonical-classes": "warn",
            "better-tailwindcss/enforce-consistent-class-order": "warn",
            "better-tailwindcss/enforce-consistent-important-position": "warn",
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
            "better-tailwindcss/enforce-consistent-variable-syntax": "warn",
            "better-tailwindcss/enforce-shorthand-classes": "off",
            "better-tailwindcss/no-deprecated-classes": "warn",
            "better-tailwindcss/no-duplicate-classes": "warn",
            "better-tailwindcss/no-restricted-classes": "warn",
            "better-tailwindcss/no-unknown-classes": "off",
            "better-tailwindcss/no-unnecessary-whitespace": "warn",
            "better-tailwindcss/no-unregistered-classes": [
                "off",
                {
                    detectComponentClasses: true,
                },
            ],
            "boundaries/element-types": ["off"],
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules
            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-import-namespace-destructure": "warn",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/no-restricted-imports": "off",
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
            "canonical/prefer-react-lazy": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            "clean-code/exception-handling": "off",
            "clean-code/feature-envy": "off",
            "clean-timer/assign-timer-id": "warn",
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
            "comment-length/limit-tagged-template-literal-comments": "warn",
            // Performance and compatibility
            "compat/compat": "off", // Electron supports modern APIs, Opera Mini not a target
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": [
                "warn",
                {
                    allowed: [
                        "eslint-plugin-react",
                        "axios",
                    ],
                },
            ],
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
            "etc/no-commented-out-code": "off",
            "etc/no-const-enum": "warn",
            "etc/no-enum": "off",
            "etc/no-foreach": "off",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "off",
            "etc/prefer-less-than": "off",
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
            "etc/underscore-internal": "off",
            "ex/might-throw": "off",
            "ex/no-unhandled": "warn",
            "ex/use-error-cause": "warn",
            "filename-export/match-default-export": "off",
            "filename-export/match-named-export": "off",
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
            "import-x/consistent-type-specifier-style": "off",
            "import-x/default": "warn",
            "import-x/dynamic-import-chunkname": "warn",
            "import-x/export": "warn",
            "import-x/exports-last": "off",
            "import-x/extensions": "warn",
            "import-x/first": "warn",
            "import-x/group-exports": "off",
            "import-x/max-dependencies": "off",
            // Import/Export Rules (import-x/*)
            "import-x/named": "warn",
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
            "import-x/prefer-namespace-import": "off",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility
            "jsx-a11y/alt-text": "warn",
            // Accessibility (jsx-a11y)
            "jsx-a11y/anchor-ambiguous-text": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            "jsx-a11y/lang": "off",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/no-autofocus": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "off",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: true,
                    allowArrayStart: true,
                    allowBlockEnd: true,
                    allowBlockStart: true,
                    allowClassEnd: true,
                    allowClassStart: true,
                    allowObjectEnd: true,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: false,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "warn",
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
            "max-lines": [
                "warn",
                {
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "module-interop/no-import-cjs": "off",
            "module-interop/no-require-esm": "off",
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
            "n/no-process-env": [
                "error",
                {
                    allowedVariables: [
                        "NODE_ENV",
                        "HEADLESS",
                        "CI",
                        "TEST_MODE",
                    ],
                },
            ],
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unpublished-import": [
                "off",
                {
                    allowModules: [
                        "electron",
                        "node",
                        "electron-devtools-installer",
                        "index.css",
                        "styles.css",
                        "main.css",
                        "header.css",
                        "footer.css",
                    ],
                },
            ],
            "n/no-unsupported-features/es-builtins": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/es-syntax": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/node-builtins": [
                "warn",
                {
                    allowExperimental: true,
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
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
            "no-empty-character-class": "error",
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-invalid-regexp": "error",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unexpected-multiline": "error",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-useless-backreference": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "warn",
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
            "paths/alias": [
                "warn",
                {
                    configFilePath: "./tsconfig.shared.json",
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-const": "error",
            "prefer-template": "warn",
            // Code style
            //            "prettier/prettier": [
            //                "warn",
            //                { usePrettierrc: true },
            //            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "react-19-upgrade/no-default-props": "error",
            "react-19-upgrade/no-factories": "error",
            "react-19-upgrade/no-legacy-context": "error",
            "react-19-upgrade/no-prop-types": "warn",
            "react-19-upgrade/no-string-refs": "error",
            "react-form-fields/no-mix-controlled-with-uncontrolled": "error",
            "react-form-fields/no-only-value-prop": "error",
            "react-form-fields/styled-no-mix-controlled-with-uncontrolled":
                "error",
            "react-form-fields/styled-no-only-value-prop": "error",
            "react-hook-form/no-use-watch": "error",
            "react-hooks-addons/no-unused-deps": "warn",
            "react-hooks/automatic-effect-dependencies": "warn",
            "react-hooks/capitalized-calls": "warn",
            // React Hooks
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/fbt": "warn",
            "react-hooks/fire": "warn",
            "react-hooks/hooks": "warn",
            "react-hooks/invariant": "warn",
            "react-hooks/memoized-effect-dependencies": "warn",
            "react-hooks/no-deriving-state-in-effects": "warn",
            "react-hooks/rule-suppression": "warn",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/syntax": "warn",
            "react-prefer-function-component/react-prefer-function-component": [
                "error",
                {
                    allowErrorBoundary: true,
                    allowJsxUtilityClass: true,
                },
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
            "react/jsx-boolean-value": [
                "warn",
                "never",
            ],
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
            "react/jsx-one-expression-per-line": "off",
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
            // "tailwind/no-unnecessary-arbitrary-value": "warn",
            "regexp/prefer-plus-quantifier": "warn",
            "regexp/prefer-quantifier": "warn",
            "regexp/prefer-regexp-exec": "warn",
            "regexp/prefer-regexp-test": "warn",
            "regexp/prefer-result-array-groups": "warn",
            "regexp/prefer-star-quantifier": "warn",
            "regexp/require-unicode-regexp": "warn",
            "regexp/require-unicode-sets-regexp": "off",
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
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": [
                "warn",
                30,
            ],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off",
            "sonarjs/for-in": "warn",
            "sonarjs/nested-control-flow": "off",
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "warn",
            "sonarjs/no-implicit-dependencies": "warn",
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off",
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
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
            "sort-keys-fix/sort-keys-fix": "off",
            "sort-react-dependency-arrays/sort": "error",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "switch-case/newline-between-switch-case": "off",
            "switch-case/no-case-curly": "off",
            // // Tailwind CSS
            // "tailwind/classnames-order": "warn",
            // "tailwind/enforces-negative-arbitrary-values": "warn",
            // "tailwind/enforces-shorthand": "warn",
            // "tailwind/migration-from-tailwind-2": "warn",
            // "tailwind/no-arbitrary-value": "warn",
            // "tailwind/no-contradicting-classname": "warn",
            /**
             * Performance issue with the plugin, somewhat mitigated setting
             * cssFiles to an empty array.
             *
             * @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/276
             * @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/174
             */
            "tailwind/no-custom-classname": [
                "warn",
                {
                    skipClassAttribute: true,
                },
            ],
            "total-functions/no-hidden-type-assertions": "off",
            "total-functions/no-nested-fp-ts-effects": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-mutable-readonly-assignment": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            "tsdoc-require/require": "warn", // Optimized Unicorn rules (reduced false positives)
            // Documentation
            "tsdoc/syntax": "warn",
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
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-immediate-mutation": "warn",
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
            "unicorn/no-useless-collection-argument": "warn",
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS needed for Electron
            "unicorn/prefer-node-protocol": "warn",
            "unicorn/prefer-response-static-json": "warn",
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
            "zod/consistent-import-source": "error",
            "zod/consistent-object-schema-type": "error",
            "zod/no-unknown-schema": "error",
            "zod/schema-error-property-style": "error",
        },
        settings: {
            "better-tailwindcss": {
                // Tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
                entryPoint: "./src/index.css",
            },
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
            tailwindcss: {
                config: `${ROOT_DIR}/src/index.css`,
                // @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/276#issuecomment-2481272848
                cssFiles: ["./src/index.css"],
            },
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Electron Backend - (electron/**/*)
    // ═══════════════════════════════════════════════════════════════════════════════
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
        name: "Electron Backend -  - electron/**/*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        plugins: {
            "@eslint-react": eslintReact,
            "@eslint-react/dom": eslintReactDom,
            "@eslint-react/hooks-extra": eslintReactHooksExtra,
            "@eslint-react/naming-convention": eslintReactNamingConvention,
            "@eslint-react/web-api": eslintReactWeb,
            "@jcoreio/implicit-dependencies": implicitDependencies,
            "@metamask/design-tokens": pluginDesignTokens,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "@rushstack/security": rushStackSecurity,
            "@typescript-eslint": tseslint,
            antfu: antfu,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            // New plugins from user request
            "clean-timer": pluginCleanTimer,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, using fixupPluginRules causes this
            deprecation: fixupPluginRules(pluginDeprecation),
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
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-secrets": noSecrets,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            paths: paths,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            react: pluginReact,
            "react-hooks": reactHooks,
            "react-hooks-addons": reactHooksAddons,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sort-keys-fix": pluginSortKeysFix,
            "sql-template": sqlTemplate,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "styled-components-a11y": styledA11y,
            "switch-case": pluginSwitchCase,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            "tsdoc-require": pluginTSDocRequire,
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
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
            ...pluginComments.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-type-checked"].rules,
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
            ...zod.configs.recommended.rules,
            "@eslint-community/eslint-comments/no-restricted-disable": "warn",
            "@eslint-community/eslint-comments/no-unused-disable": "warn",
            "@eslint-community/eslint-comments/no-use": "off",
            "@eslint-community/eslint-comments/require-description": "warn",
            "@eslint-react/avoid-shorthand-boolean": "off",
            "@eslint-react/dom/no-missing-button-type": "warn",
            "@eslint-react/dom/no-missing-iframe-sandbox": "warn",
            "@eslint-react/dom/no-unknown-property": "warn",
            "@eslint-react/dom/no-unsafe-target-blank": "warn",
            /* DOM subplugin */
            "@eslint-react/dom/no-void-elements-with-children": "warn",
            "@eslint-react/dom/prefer-namespace-import": "warn",
            "@eslint-react/hooks-extra/ensure-use-callback-has-non-empty-deps":
                "off",
            "@eslint-react/hooks-extra/ensure-use-memo-has-non-empty-deps":
                "off",
            /* Hooks extra subplugin */
            "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect":
                "warn",
            "@eslint-react/jsx-dollar": "warn",
            "@eslint-react/jsx-no-iife": "warn",
            "@eslint-react/jsx-no-undef": "warn",
            "@eslint-react/jsx-shorthand-boolean": "warn",
            "@eslint-react/jsx-shorthand-fragment": "warn",
            "@eslint-react/jsx-uses-react": "warn",
            "@eslint-react/jsx-uses-vars": "warn",
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            /* Naming convention subplugin */
            "@eslint-react/naming-convention/filename": "off",
            "@eslint-react/naming-convention/filename-extension": "off",
            "@eslint-react/naming-convention/use-state": "warn",
            "@eslint-react/no-children-prop": "warn",
            "@eslint-react/no-class-component": "warn",
            "@eslint-react/no-duplicate-key": "warn",
            "@eslint-react/no-forbidden-props": "off",
            "@eslint-react/no-leaked-conditional-rendering": "warn",
            "@eslint-react/no-missing-component-display-name": "warn",
            "@eslint-react/no-missing-context-display-name": "warn",
            "@eslint-react/no-misused-capture-owner-stack": "warn",
            "@eslint-react/no-nested-component-definitions": "warn",
            "@eslint-react/no-unnecessary-key": "warn",
            "@eslint-react/no-unnecessary-use-callback": "off",
            "@eslint-react/no-unnecessary-use-memo": "off",
            "@eslint-react/no-unnecessary-use-prefix": "warn",
            "@eslint-react/no-unnecessary-use-ref": "warn",
            "@eslint-react/no-unstable-context-value": "warn",
            "@eslint-react/no-unstable-default-props": "warn",
            "@eslint-react/no-unused-props": "warn",
            "@eslint-react/no-unused-state": "warn",
            "@eslint-react/no-useless-forward-ref": "warn",
            "@eslint-react/no-useless-fragment": "warn",
            "@eslint-react/prefer-destructuring-assignment": "warn",
            "@eslint-react/prefer-namespace-import": "off",
            "@eslint-react/prefer-react-namespace-import": "off",
            "@eslint-react/prefer-read-only-props": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "off",
                {
                    ignore: [
                        "@app",
                        "@app/*",
                        "@shared",
                        "electron-devtools-installer",
                        "electron",
                        "@site",
                        "@theme",
                        "@docusaurus",
                        "@storybook/react-vite",
                        "@storybook/addon-a11y",
                        "@storybook/addon-docs",
                        "@storybook/test",
                        "storybook",
                        "@babel/core",
                        "@vitejs/plugin-react",
                        "vite",
                        "@app/theme",
                        "@storybook/react",
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
            "@microsoft/sdl/no-angular-bypass-sanitizer": "warn",
            "@microsoft/sdl/no-angular-sanitization-trusted-urls": "warn",
            "@microsoft/sdl/no-angularjs-bypass-sce": "warn",
            "@microsoft/sdl/no-angularjs-enable-svg": "warn",
            "@microsoft/sdl/no-angularjs-sanitization-whitelist": "warn",
            "@microsoft/sdl/no-cookies": "warn",
            "@microsoft/sdl/no-document-domain": "warn",
            "@microsoft/sdl/no-document-write": "warn",
            "@microsoft/sdl/no-electron-node-integration": "warn",
            "@microsoft/sdl/no-html-method": "warn",
            "@microsoft/sdl/no-inner-html": "warn",
            "@microsoft/sdl/no-insecure-random": "off",
            "@microsoft/sdl/no-insecure-url": "warn",
            "@microsoft/sdl/no-msapp-exec-unsafe": "warn",
            "@microsoft/sdl/no-postmessage-star-origin": "warn",
            "@microsoft/sdl/no-unsafe-alloc": "warn",
            "@microsoft/sdl/no-winjs-html-unsafe": "warn",
            "@rushstack/security/no-unsafe-regexp": "warn",
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
            "@typescript-eslint/max-params": [
                "warn",
                {
                    countVoidThis: false,
                    max: 20,
                },
            ],
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
            "@typescript-eslint/no-type-alias": "off",
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
            "@typescript-eslint/no-unused-private-class-members": "warn",
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
            "@typescript-eslint/unified-signatures": "off",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            "antfu/consistent-chaining": "warn",
            "antfu/consistent-list-newline": "off",
            "antfu/curly": "error",
            "antfu/if-newline": "off",
            "antfu/import-dedupe": "error",
            "antfu/indent-unindent": "error",
            "antfu/no-import-dist": "error",
            "antfu/no-import-node-modules-by-path": "error",
            "antfu/no-top-level-await": "error",
            "antfu/no-ts-export-equal": "error",
            "antfu/top-level-function": "off",
            "boundaries/element-types": [
                "off",
                {
                    default: "disallow",
                    rules: [
                        {
                            allow: ["types"],
                            from: "constants",
                        },
                        {
                            allow: [],
                            from: "types",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                            ],
                            from: "utils",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                            ],
                            from: "events",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                                "events",
                                "managers",
                                "orchestrator",
                            ],
                            from: "services",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                                "events",
                                "services",
                            ],
                            from: "managers",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                                "events",
                                "services",
                                "managers",
                            ],
                            from: "orchestrator",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                                "events",
                                "services",
                                "managers",
                                "orchestrator",
                            ],
                            from: "main",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                                "events",
                                "services",
                            ],
                            from: "preload",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                                "events",
                                "services",
                                "managers",
                                "orchestrator",
                                "main",
                                "preload",
                            ],
                            from: "test",
                        },
                    ],
                },
            ],
            // Architecture boundaries for Electron
            "boundaries/no-ignored": "warn",
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-match-exported": "warn",
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules
            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-import-namespace-destructure": "warn",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/no-restricted-imports": "off",
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
            "canonical/prefer-react-lazy": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            "clean-code/exception-handling": "off",
            "clean-code/feature-envy": "off",
            "clean-timer/assign-timer-id": "warn",
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
            "comment-length/limit-tagged-template-literal-comments": "warn",
            // Node.js specific
            complexity: "off",
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": [
                "warn",
                {
                    allowed: [
                        "eslint-plugin-react",
                        "axios",
                    ],
                },
            ],
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
            "etc/no-commented-out-code": "off",
            "etc/no-const-enum": "warn",
            "etc/no-enum": "off",
            "etc/no-foreach": "off",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "off",
            "etc/prefer-less-than": "off",
            "etc/throw-error": "warn",
            "etc/underscore-internal": "off",
            "ex/might-throw": "off",
            "ex/no-unhandled": "warn",
            "ex/use-error-cause": "warn",
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
            "import-x/consistent-type-specifier-style": "off",
            "import-x/default": "warn",
            "import-x/dynamic-import-chunkname": "warn",
            "import-x/export": "warn",
            "import-x/exports-last": "off",
            "import-x/extensions": "warn",
            "import-x/first": "warn",
            "import-x/group-exports": "off",
            "import-x/max-dependencies": "off",
            // Import Rules
            "import-x/named": "warn",
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
            "import-x/prefer-namespace-import": "off",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility (jsx-a11y)
            "jsx-a11y/anchor-ambiguous-text": "warn",
            "jsx-a11y/lang": "off",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "off",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: true,
                    allowArrayStart: true,
                    allowBlockEnd: true,
                    allowBlockStart: true,
                    allowClassEnd: true,
                    allowClassStart: true,
                    allowObjectEnd: true,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: false,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "warn",
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
            "max-lines": [
                "warn",
                {
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            // Sonar quality helpers
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "module-interop/no-import-cjs": "off",
            "module-interop/no-require-esm": "off",
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
            "n/no-process-env": [
                "error",
                {
                    allowedVariables: [
                        "NODE_ENV",
                        "HEADLESS",
                        "CI",
                        "TEST_MODE",
                    ],
                },
            ],
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unpublished-import": [
                "warn",
                {
                    allowModules: [
                        "electron",
                        "node",
                        "electron-devtools-installer",
                        "index.css",
                        "styles.css",
                        "main.css",
                        "header.css",
                        "footer.css",
                    ],
                },
            ],
            "n/no-unsupported-features/es-builtins": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/es-syntax": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/node-builtins": [
                "warn",
                {
                    allowExperimental: true,
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
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
            "no-empty-character-class": "error",
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-invalid-regexp": "error",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unexpected-multiline": "error",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-useless-backreference": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "warn",
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
            "paths/alias": [
                "warn",
                {
                    configFilePath: "./tsconfig.electron.json",
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-const": "error",
            "prefer-template": "warn",
            //            "prettier/prettier": [
            //                "warn",
            //                { usePrettierrc: true },
            //            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "react-hooks-addons/no-unused-deps": "warn",
            "react-hooks/automatic-effect-dependencies": "warn",
            "react-hooks/capitalized-calls": "warn",
            "react-hooks/fbt": "warn",
            "react-hooks/fire": "warn",
            "react-hooks/hooks": "warn",
            "react-hooks/invariant": "warn",
            "react-hooks/memoized-effect-dependencies": "warn",
            "react-hooks/no-deriving-state-in-effects": "warn",
            "react-hooks/rule-suppression": "warn",
            "react-hooks/syntax": "warn",
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
            "regexp/require-unicode-regexp": "warn",
            "regexp/require-unicode-sets-regexp": "off",
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
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": [
                "warn",
                30,
            ],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off",
            "sonarjs/for-in": "warn",
            "sonarjs/nested-control-flow": "off",
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "warn",
            "sonarjs/no-implicit-dependencies": "warn",
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off",
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
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
            "sort-keys-fix/sort-keys-fix": "off",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "switch-case/newline-between-switch-case": "off",
            "switch-case/no-case-curly": "off",
            "total-functions/no-hidden-type-assertions": "off",
            "total-functions/no-nested-fp-ts-effects": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-mutable-readonly-assignment": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            "tsdoc-require/require": "warn", // Backend-specific unicorn rules
            // Documentation
            "tsdoc/syntax": "warn",
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true, // Service classes
                    },
                },
            ],
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-immediate-mutation": "warn",
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
            "unicorn/no-useless-collection-argument": "warn",
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-response-static-json": "warn",
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
            "zod/consistent-import-source": "error",
            "zod/consistent-object-schema-type": "error",
            "zod/no-unknown-schema": "error",
            "zod/schema-error-property-style": "error",
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: TypeScript Shared - shared/**/*
    // ═══════════════════════════════════════════════════════════════════════════════
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
        name: "TypeScript Shared - shared/**/*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
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
            "@rushstack/security": rushStackSecurity,
            "@typescript-eslint": tseslint,
            antfu: antfu,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            "clean-code": pluginCleanCode,
            // New plugins from user request
            "clean-timer": pluginCleanTimer,
            "comment-length": eslintPluginCommentLength,
            compat: pluginCompat,
            css: css,
            depend: depend,
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, using fixupPluginRules causes this
            deprecation: fixupPluginRules(pluginDeprecation),
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
            neverthrow: fixupPluginRules(pluginNeverThrow),
            "no-constructor-bind": pluginNoConstructBind,
            "no-explicit-type-exports": pluginNoExplicitTypeExports,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-secrets": noSecrets,
            "no-unary-plus": pluginNoUnary,
            "no-unawaited-dot-catch-throw": pluginNoUnwaited,
            "no-unsanitized": nounsanitized,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            observers: observers,
            paths: paths,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": pluginPreferArrow,
            prettier: pluginPrettier,
            promise: pluginPromise,
            react: pluginReact,
            "react-19-upgrade": react19upgrade,
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
            "safe-jsx": fixupPluginRules(pluginSafeJSX),
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            "sort-destructure-keys": pluginSortDestructure,
            "sort-keys-fix": pluginSortKeysFix,
            "sort-react-dependency-arrays": pluginSortReactDependency,
            "sql-template": sqlTemplate,
            "ssr-friendly": fixupPluginRules(pluginSSR),
            "styled-components-a11y": styledA11y,
            "switch-case": pluginSwitchCase,
            tailwind: tailwind,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            tsdoc: pluginTsdoc,
            "tsdoc-require": pluginTSDocRequire,
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
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
            ...pluginComments.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...eslintReact.configs["recommended-type-checked"].rules,
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
            ...zod.configs.recommended.rules,
            "@arthurgeron/react-usememo/require-memo": "warn",
            "@arthurgeron/react-usememo/require-usememo": "error",
            "@arthurgeron/react-usememo/require-usememo-children": "warn",
            "@eslint-community/eslint-comments/no-restricted-disable": "warn",
            "@eslint-community/eslint-comments/no-unused-disable": "warn",
            "@eslint-community/eslint-comments/no-use": "off",
            "@eslint-community/eslint-comments/require-description": "warn",
            "@eslint-react/avoid-shorthand-boolean": "off",
            "@eslint-react/dom/no-missing-button-type": "warn",
            "@eslint-react/dom/no-missing-iframe-sandbox": "warn",
            "@eslint-react/dom/no-unknown-property": "warn",
            "@eslint-react/dom/no-unsafe-target-blank": "warn",
            /* DOM subplugin */
            "@eslint-react/dom/no-void-elements-with-children": "warn",
            "@eslint-react/dom/prefer-namespace-import": "warn",
            "@eslint-react/hooks-extra/ensure-use-callback-has-non-empty-deps":
                "off",
            "@eslint-react/hooks-extra/ensure-use-memo-has-non-empty-deps":
                "off",
            /* Hooks extra subplugin */
            "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect":
                "warn",
            "@eslint-react/jsx-dollar": "warn",
            "@eslint-react/jsx-key-before-spread": "warn",
            "@eslint-react/jsx-no-iife": "warn",
            "@eslint-react/jsx-no-undef": "warn",
            "@eslint-react/jsx-shorthand-boolean": "warn",
            "@eslint-react/jsx-shorthand-fragment": "warn",
            "@eslint-react/jsx-uses-react": "warn",
            "@eslint-react/jsx-uses-vars": "warn",
            "@eslint-react/naming-convention/component-name": "warn",
            "@eslint-react/naming-convention/context-name": "warn",
            /* Naming convention subplugin */
            "@eslint-react/naming-convention/filename": "off",
            "@eslint-react/naming-convention/filename-extension": "off",
            "@eslint-react/naming-convention/use-state": "warn",
            "@eslint-react/no-children-prop": "warn",
            "@eslint-react/no-class-component": "warn",
            "@eslint-react/no-duplicate-key": "warn",
            "@eslint-react/no-forbidden-props": "off",
            "@eslint-react/no-leaked-conditional-rendering": "warn",
            "@eslint-react/no-missing-component-display-name": "warn",
            "@eslint-react/no-missing-context-display-name": "warn",
            "@eslint-react/no-misused-capture-owner-stack": "warn",
            "@eslint-react/no-nested-component-definitions": "warn",
            "@eslint-react/no-unnecessary-key": "warn",
            "@eslint-react/no-unnecessary-use-callback": "off",
            "@eslint-react/no-unnecessary-use-memo": "off",
            "@eslint-react/no-unnecessary-use-prefix": "warn",
            "@eslint-react/no-unnecessary-use-ref": "warn",
            "@eslint-react/no-unstable-context-value": "warn",
            "@eslint-react/no-unstable-default-props": "warn",
            "@eslint-react/no-unused-props": "warn",
            "@eslint-react/no-unused-state": "warn",
            "@eslint-react/no-useless-forward-ref": "warn",
            "@eslint-react/no-useless-fragment": "warn",
            "@eslint-react/prefer-destructuring-assignment": "warn",
            "@eslint-react/prefer-namespace-import": "off",
            "@eslint-react/prefer-react-namespace-import": "off",
            "@eslint-react/prefer-read-only-props": "warn",
            "@jcoreio/implicit-dependencies/no-implicit": [
                "off",
                {
                    ignore: [
                        "@app",
                        "@app/*",
                        "@shared",
                        "electron-devtools-installer",
                        "electron",
                        "@site",
                        "@theme",
                        "@docusaurus",
                        "@storybook/react-vite",
                        "@storybook/addon-a11y",
                        "@storybook/addon-docs",
                        "@storybook/test",
                        "storybook",
                        "@babel/core",
                        "@vitejs/plugin-react",
                        "vite",
                        "@app/theme",
                        "@storybook/react",
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
            "@microsoft/sdl/no-angular-bypass-sanitizer": "warn",
            "@microsoft/sdl/no-angular-sanitization-trusted-urls": "warn",
            "@microsoft/sdl/no-angularjs-bypass-sce": "warn",
            "@microsoft/sdl/no-angularjs-enable-svg": "warn",
            "@microsoft/sdl/no-angularjs-sanitization-whitelist": "warn",
            "@microsoft/sdl/no-cookies": "warn",
            "@microsoft/sdl/no-document-domain": "warn",
            "@microsoft/sdl/no-document-write": "warn",
            "@microsoft/sdl/no-electron-node-integration": "warn",
            "@microsoft/sdl/no-html-method": "warn",
            "@microsoft/sdl/no-inner-html": "warn",
            "@microsoft/sdl/no-insecure-random": "off",
            "@microsoft/sdl/no-insecure-url": "warn",
            "@microsoft/sdl/no-msapp-exec-unsafe": "warn",
            "@microsoft/sdl/no-postmessage-star-origin": "warn",
            "@microsoft/sdl/no-unsafe-alloc": "warn",
            "@microsoft/sdl/no-winjs-html-unsafe": "warn",
            "@rushstack/security/no-unsafe-regexp": "warn",
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
            "@typescript-eslint/max-params": [
                "warn",
                {
                    countVoidThis: false,
                    max: 20,
                },
            ],
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
            "@typescript-eslint/no-type-alias": "off",
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
            "@typescript-eslint/no-unused-private-class-members": "warn",
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
            "@typescript-eslint/unified-signatures": "off",
            "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
            "antfu/consistent-chaining": "warn",
            "antfu/consistent-list-newline": "off",
            "antfu/curly": "error",
            "antfu/if-newline": "off",
            "antfu/import-dedupe": "error",
            "antfu/indent-unindent": "error",
            "antfu/no-import-dist": "error",
            "antfu/no-import-node-modules-by-path": "error",
            "antfu/no-top-level-await": "error",
            "antfu/no-ts-export-equal": "error",
            "antfu/top-level-function": "off",
            "boundaries/element-types": [
                "off",
                {
                    default: "disallow",
                    rules: [
                        {
                            allow: ["types"],
                            from: "constants",
                        },
                        {
                            allow: ["types"],
                            from: "types",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                            ],
                            from: "utils",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                            ],
                            from: "validation",
                        },
                        {
                            allow: [
                                "constants",
                                "types",
                                "utils",
                                "validation",
                            ],
                            from: "test",
                        },
                    ],
                },
            ],
            // Code organization and architecture
            "boundaries/no-ignored": "warn",
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-match-exported": "warn",
            "canonical/filename-match-regex": "off", // Taken care of by unicorn rules
            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-export-all": "error",
            "canonical/no-import-namespace-destructure": "warn",
            "canonical/no-re-export": "warn",
            "canonical/no-reassign-imports": "error",
            "canonical/no-restricted-imports": "off",
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
            "canonical/prefer-react-lazy": "off",
            "canonical/prefer-use-mount": "warn",
            "canonical/sort-react-dependencies": "warn",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            "clean-code/exception-handling": "off",
            "clean-code/feature-envy": "off",
            "clean-timer/assign-timer-id": "warn",
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
            "comment-length/limit-tagged-template-literal-comments": "warn",
            // Performance and compatibility
            "compat/compat": "off", // Electron supports modern APIs, Opera Mini not a target
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            curly: [
                "error",
                "all",
            ],
            "depend/ban-dependencies": [
                "warn",
                {
                    allowed: [
                        "eslint-plugin-react",
                        "axios",
                    ],
                },
            ],
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
            "etc/no-commented-out-code": "off",
            "etc/no-const-enum": "warn",
            "etc/no-enum": "off",
            "etc/no-foreach": "off",
            "etc/no-internal": "off",
            "etc/no-misused-generics": "warn",
            "etc/no-t": "off",
            "etc/prefer-interface": "off",
            "etc/prefer-less-than": "off",
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
            "etc/underscore-internal": "off",
            "ex/might-throw": "off",
            "ex/no-unhandled": "warn",
            "ex/use-error-cause": "warn",
            "filename-export/match-default-export": "off",
            "filename-export/match-named-export": "off",
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
            "import-x/consistent-type-specifier-style": "off",
            "import-x/default": "warn",
            "import-x/dynamic-import-chunkname": "warn",
            "import-x/export": "warn",
            "import-x/exports-last": "off",
            "import-x/extensions": "warn",
            "import-x/first": "warn",
            "import-x/group-exports": "off",
            "import-x/max-dependencies": "off",
            // Import/Export Rules (import-x/*)
            "import-x/named": "warn",
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
            "import-x/prefer-namespace-import": "off",
            "import-x/unambiguous": "warn",
            "import-zod/prefer-zod-namespace": "error",
            "init-declarations": "off",
            "istanbul/no-ignore-file": "error",
            "istanbul/prefer-ignore-reason": "error",
            // Accessibility
            "jsx-a11y/alt-text": "warn",
            // Accessibility (jsx-a11y)
            "jsx-a11y/anchor-ambiguous-text": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            "jsx-a11y/lang": "off",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/no-autofocus": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Code spacing and formatting rules
            "lines-around-comment": [
                "off",
                {
                    afterBlockComment: false,
                    afterLineComment: false,
                    allowArrayEnd: true,
                    allowArrayStart: true,
                    allowBlockEnd: true,
                    allowBlockStart: true,
                    allowClassEnd: true,
                    allowClassStart: true,
                    allowObjectEnd: true,
                    allowObjectStart: true,
                    applyDefaultIgnorePatterns: true,
                    beforeBlockComment: true,
                    beforeLineComment: false,
                    ignorePattern: String.raw`^\s*@`, // Ignore TSDoc tags like @param, @returns
                },
            ],
            "lines-between-class-members": [
                "warn",
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
            "max-lines": [
                "warn",
                {
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            // Sonar quality helpers
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "module-interop/no-import-cjs": "off",
            "module-interop/no-require-esm": "off",
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
            "n/no-process-env": [
                "error",
                {
                    allowedVariables: [
                        "NODE_ENV",
                        "HEADLESS",
                        "CI",
                        "TEST_MODE",
                    ],
                },
            ],
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-top-level-await": "warn",
            "n/no-unpublished-import": [
                "warn",
                {
                    allowModules: [
                        "electron",
                        "node",
                        "electron-devtools-installer",
                        "index.css",
                        "styles.css",
                        "main.css",
                        "header.css",
                        "footer.css",
                    ],
                },
            ],
            "n/no-unsupported-features/es-builtins": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/es-syntax": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/node-builtins": [
                "warn",
                {
                    allowExperimental: true,
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
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
            "no-empty-character-class": "error",
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-invalid-regexp": "error",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
            "no-ternary": "off",
            "no-unary-plus/no-unary-plus": "error",
            "no-unawaited-dot-catch-throw/enforce-no-unawaited-dot-catch-throw":
                "error",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unexpected-multiline": "error",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-useless-backreference": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "observers/matching-unobserve-target": "error",
            "observers/no-missing-unobserve-or-disconnect": "error",
            "one-var": "off",
            "padding-line-between-statements": [
                "warn",
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
            "paths/alias": [
                "warn",
                {
                    configFilePath: "./tsconfig.json",
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-const": "error",
            "prefer-template": "warn",
            // Code style
            //            "prettier/prettier": [
            //                "warn",
            //                { usePrettierrc: true },
            //            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
            "react-19-upgrade/no-default-props": "error",
            "react-19-upgrade/no-factories": "error",
            "react-19-upgrade/no-legacy-context": "error",
            "react-19-upgrade/no-prop-types": "warn",
            "react-19-upgrade/no-string-refs": "error",
            "react-form-fields/no-mix-controlled-with-uncontrolled": "error",
            "react-form-fields/no-only-value-prop": "error",
            "react-form-fields/styled-no-mix-controlled-with-uncontrolled":
                "error",
            "react-form-fields/styled-no-only-value-prop": "error",
            "react-hook-form/no-use-watch": "error",
            "react-hooks-addons/no-unused-deps": "warn",
            "react-hooks/automatic-effect-dependencies": "warn",
            "react-hooks/capitalized-calls": "warn",
            // React Hooks
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/fbt": "warn",
            "react-hooks/fire": "warn",
            "react-hooks/hooks": "warn",
            "react-hooks/invariant": "warn",
            "react-hooks/memoized-effect-dependencies": "warn",
            "react-hooks/no-deriving-state-in-effects": "warn",
            "react-hooks/rule-suppression": "warn",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/syntax": "warn",
            "react-prefer-function-component/react-prefer-function-component": [
                "error",
                {
                    allowErrorBoundary: true,
                    allowJsxUtilityClass: true,
                },
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
            "react/jsx-boolean-value": [
                "warn",
                "never",
            ],
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
            "react/jsx-one-expression-per-line": "off",
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
            // "tailwind/no-unnecessary-arbitrary-value": "warn",
            "regexp/prefer-plus-quantifier": "warn",
            "regexp/prefer-quantifier": "warn",
            "regexp/prefer-regexp-exec": "warn",
            "regexp/prefer-regexp-test": "warn",
            "regexp/prefer-result-array-groups": "warn",
            "regexp/prefer-star-quantifier": "warn",
            "regexp/require-unicode-regexp": "warn",
            "regexp/require-unicode-sets-regexp": "off",
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
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": [
                "warn",
                30,
            ],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off",
            "sonarjs/for-in": "warn",
            "sonarjs/nested-control-flow": "off",
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "warn",
            "sonarjs/no-implicit-dependencies": "warn",
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off",
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
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
            "sort-keys-fix/sort-keys-fix": "off",
            "sort-react-dependency-arrays/sort": "error",
            "sql-template/no-unsafe-query": "error",
            "ssr-friendly/no-dom-globals-in-constructor": "error",
            "ssr-friendly/no-dom-globals-in-module-scope": "error",
            "ssr-friendly/no-dom-globals-in-react-cc-render": "error",
            "ssr-friendly/no-dom-globals-in-react-fc": "error",
            "switch-case/newline-between-switch-case": "off",
            "switch-case/no-case-curly": "off",
            // // Tailwind CSS
            // "tailwind/classnames-order": "warn",
            // "tailwind/enforces-negative-arbitrary-values": "warn",
            // "tailwind/enforces-shorthand": "warn",
            // "tailwind/migration-from-tailwind-2": "warn",
            // "tailwind/no-arbitrary-value": "warn",
            // "tailwind/no-contradicting-classname": "warn",
            /**
             * Performance issue with the plugin, somewhat mitigated setting
             * cssFiles to an empty array.
             *
             * @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/276
             * @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/174
             */
            "tailwind/no-custom-classname": [
                "warn",
                {
                    skipClassAttribute: true,
                },
            ],
            "total-functions/no-hidden-type-assertions": "off",
            "total-functions/no-nested-fp-ts-effects": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-mutable-readonly-assignment": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            "tsdoc-require/require": "warn", // Optimized Unicorn rules (reduced false positives)
            // Documentation
            "tsdoc/syntax": "warn",
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
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // ForEach is fine
            "unicorn/no-immediate-mutation": "warn",
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
            "unicorn/no-useless-collection-argument": "warn",
            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "warn", // CommonJS needed for Electron
            "unicorn/prefer-node-protocol": "warn",
            "unicorn/prefer-response-static-json": "warn",
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
            "zod/consistent-import-source": "error",
            "zod/consistent-object-schema-type": "error",
            "zod/no-unknown-schema": "error",
            "zod/schema-error-property-style": "error",
        },
        settings: {
            "better-tailwindcss": {
                // Tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
                entryPoint: "./src/index.css",
            },
            "boundaries/elements": [
                {
                    capture: ["constant"],
                    pattern: "shared/constants/**/*",
                    type: "constants",
                },
                {
                    allowChildren: false,
                    capture: ["constant"],
                    mode: "file",
                    pattern: "shared/constants.ts",
                    type: "constants",
                },
                {
                    capture: ["type"],
                    pattern: "shared/types/**/*",
                    type: "types",
                },
                {
                    allowChildren: false,
                    capture: ["type"],
                    mode: "file",
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
            tailwindcss: {
                config: `${ROOT_DIR}/src/index.css`,
                // @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/276
                cssFiles: ["./src/index.css"],
            },
        },
    },
    {
        files: [
            "shared/utils/index.{ts,tsx,cts,mts,js,jsx,cjs,mjs}",
            "shared/utils/**/index.{ts,tsx,cts,mts,js,jsx,cjs,mjs}",
        ],
        name: "Shared Utils Barrel Guard",
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    message:
                        "Barrel exports are disallowed in shared utils; import from concrete modules instead.",
                    selector: "ExportAllDeclaration",
                },
                {
                    message:
                        "Barrel exports are disallowed in shared utils; import from concrete modules instead.",
                    selector: "ExportNamedDeclaration[source]",
                },
            ],
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Tests (Frontend)
    // ═══════════════════════════════════════════════════════════════════════════════
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
                    impliedStrict: true,
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
        name: "Tests (Frontend) - src/**/*.{spec,test}.*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        plugins: {
            "@typescript-eslint": tseslint,
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
            ...vitest.configs.recommended.rules,
            ...pluginComments.recommended.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            ...pluginUnicorn.configs.all.rules,
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            // Relaxed function rules for tests (explicit for clarity)
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-use-before-define": "off", // Allow use before define in tests
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/strict-void-return": "warn",
            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
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
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 2000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "new-cap": "off", // Allow new-cap for class constructors
            "nitpick/no-redundant-vars": "off", // Allow redundant vars in tests
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-barrel-files/no-barrel-files": "off", // Allow barrel files in tests for convenience
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
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
            "testing-library/prefer-user-event-setup": "warn",
            "undefined-css-classes/no-undefined-css-classes": "off",
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
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
            "vitest/no-alias-methods": "warn",
            "vitest/no-commented-out-tests": "warn",
            "vitest/no-conditional-expect": "off",
            "vitest/no-disabled-tests": "warn",
            "vitest/no-focused-tests": "warn",
            "vitest/no-identical-title": "warn",
            "vitest/no-import-node-test": "warn",
            "vitest/no-interpolation-in-snapshots": "warn",
            "vitest/no-standalone-expect": "off",
            "vitest/no-test-prefixes": "warn",
            "vitest/prefer-called-exactly-once-with": "off",
            "vitest/prefer-called-once": "off",
            "vitest/prefer-called-times": "warn",
            "vitest/prefer-called-with": "off",
            "vitest/prefer-comparison-matcher": "warn",
            "vitest/prefer-describe-function-title": "warn",
            "vitest/prefer-expect-resolves": "warn",
            "vitest/prefer-spy-on": "off",
            "vitest/prefer-strict-boolean-matchers": "off",
            "vitest/prefer-to-be": "off",
            "vitest/prefer-to-be-falsy": "warn",
            "vitest/prefer-to-be-object": "warn",
            "vitest/prefer-to-be-truthy": "warn",
            "vitest/prefer-to-contain": "warn",
            "vitest/prefer-to-have-length": "warn",
            "vitest/prefer-todo": "warn",
            "vitest/prefer-vi-mocked": "off",
            "vitest/require-mock-type-parameters": "off",
            "vitest/valid-expect": "warn",
            "vitest/valid-title": "warn",
            "vitest/warn-todo": "warn",
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Tests (Backend)
    // ═══════════════════════════════════════════════════════════════════════════════
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
                    impliedStrict: true,
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
        name: "Tests (Backend) - electron/**/*.{spec,test}.*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
            ...vitest.configs.recommended.rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-use-before-define": "off", // Allow use before define in tests
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/strict-void-return": "warn",
            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
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
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 2000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "new-cap": "off", // Allow new-cap for class constructors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-barrel-files/no-barrel-files": "off", // Allow barrel files in tests for convenience
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
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
            "testing-library/prefer-user-event-setup": "warn",
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
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
            "vitest/no-alias-methods": "warn",
            "vitest/no-commented-out-tests": "warn",
            "vitest/no-conditional-expect": "off",
            "vitest/no-disabled-tests": "warn",
            "vitest/no-focused-tests": "warn",
            "vitest/no-identical-title": "warn",
            "vitest/no-import-node-test": "warn",
            "vitest/no-interpolation-in-snapshots": "warn",
            "vitest/no-standalone-expect": "off",
            "vitest/no-test-prefixes": "warn",
            "vitest/prefer-called-exactly-once-with": "off",
            "vitest/prefer-called-once": "off",
            "vitest/prefer-called-times": "warn",
            "vitest/prefer-called-with": "off",
            "vitest/prefer-comparison-matcher": "warn",
            "vitest/prefer-describe-function-title": "warn",
            "vitest/prefer-expect-resolves": "warn",
            "vitest/prefer-spy-on": "off",
            "vitest/prefer-strict-boolean-matchers": "off",
            "vitest/prefer-to-be": "off",
            "vitest/prefer-to-be-falsy": "warn",
            "vitest/prefer-to-be-object": "warn",
            "vitest/prefer-to-be-truthy": "warn",
            "vitest/prefer-to-contain": "warn",
            "vitest/prefer-to-have-length": "warn",
            "vitest/prefer-todo": "warn",
            "vitest/prefer-vi-mocked": "off",
            "vitest/require-mock-type-parameters": "off",
            "vitest/valid-expect": "warn",
            "vitest/valid-title": "warn",
            "vitest/warn-todo": "warn",
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Tests (Shared)
    // ═══════════════════════════════════════════════════════════════════════════════
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
                    impliedStrict: true,
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
        name: "Tests (Shared) - shared/**/*.{spec,test}.*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        plugins: {
            "@typescript-eslint": tseslint,
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
            ...vitest.configs.recommended.rules,
            ...pluginComments.recommended.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            ...pluginUnicorn.configs.all.rules,
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/strict-void-return": "warn",
            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            "dot-notation": "off",
            "func-style": "off",
            "id-length": "off",
            "loadable-imports/sort": "error",
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-lines": "off",
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 2000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "no-barrel-files/no-barrel-files": "off", // Allow barrel files in tests for convenience
            "no-console": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-void": "off",
            // Relaxed function rules for tests (explicit for clarity)
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-node-access": "off",
            "testing-library/prefer-screen-queries": "warn",
            "testing-library/prefer-user-event-setup": "warn",
            "undefined-css-classes/no-undefined-css-classes": "off",
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
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
            "vitest/no-alias-methods": "warn",
            "vitest/no-commented-out-tests": "warn",
            "vitest/no-conditional-expect": "off",
            "vitest/no-disabled-tests": "warn",
            "vitest/no-focused-tests": "warn",
            "vitest/no-identical-title": "warn",
            "vitest/no-import-node-test": "warn",
            "vitest/no-interpolation-in-snapshots": "warn",
            "vitest/no-standalone-expect": "off",
            "vitest/no-test-prefixes": "warn",
            "vitest/prefer-called-exactly-once-with": "off",
            "vitest/prefer-called-once": "off",
            "vitest/prefer-called-times": "warn",
            "vitest/prefer-called-with": "off",
            "vitest/prefer-comparison-matcher": "warn",
            "vitest/prefer-describe-function-title": "warn",
            "vitest/prefer-expect-resolves": "warn",
            "vitest/prefer-spy-on": "off",
            "vitest/prefer-strict-boolean-matchers": "off",
            "vitest/prefer-to-be": "off",
            "vitest/prefer-to-be-falsy": "warn",
            "vitest/prefer-to-be-object": "warn",
            "vitest/prefer-to-be-truthy": "warn",
            "vitest/prefer-to-contain": "warn",
            "vitest/prefer-to-have-length": "warn",
            "vitest/prefer-todo": "warn",
            "vitest/prefer-vi-mocked": "off",
            "vitest/require-mock-type-parameters": "off",
            "vitest/valid-expect": "warn",
            "vitest/valid-title": "warn",
            "vitest/warn-todo": "warn",
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Benchmarks
    // ═══════════════════════════════════════════════════════════════════════════════
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
                    impliedStrict: true,
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
        name: "Benchmarks - benchmarks/**/*.{bench}.*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        plugins: {
            "@typescript-eslint": tseslint,
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
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
            ...vitest.configs.recommended.rules,
            ...pluginComments.recommended.rules,
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
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/require-await": "off", // Benchmarks may have async patterns
            "@typescript-eslint/strict-void-return": "warn",
            "@typescript-eslint/unified-signatures": "off",
            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
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
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 2000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-destructuring": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/filename-case": "off", // Allow benchmark files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: TypeScript Config files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/*.config.{ts,tsx,mts,cts}", // Configuration files
            "**/*.config.**.*.{ts,tsx,mts,cts}",
            "config/testing/utils/**/*.ts",
        ],
        ignores: ["docs/docusaurus/docusaurus.config.ts"],
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
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                // Disabled because using project service: project: "config/testing/tsconfig.configs.json",
                projectService: {
                    allowDefaultProject: [
                        "*.js",
                        "playwright.config.ts",
                        "vite.config.ts",
                        "vite.playwright-coverage.config.ts",
                        "vitest.config.ts",
                        "vitest.shared.config.ts",
                        "vitest.storybook.config.ts",
                        "vitest.stryker.config.ts",
                        "config/testing/vitest.zero-coverage.config.ts",
                        "config/tools/knip.config.ts",
                        "config/tools/createPlaywrightCoveragePlugin.ts",
                        "electron-builder.config.ts",
                    ],
                    defaultProject: "config/testing/tsconfig.configs.json",
                    maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 24,
                },
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        name: "TypeScript Configs - **/*.config.{TS,TSX,MTS,CTS}",
        plugins: {
            "@typescript-eslint": tseslint,
            "array-func": arrayFunc,
            boundaries: pluginBoundaries,
            canonical: pluginCanonical,
            compat: pluginCompat,
            css: css,
            depend: depend,
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
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            tsdoc: pluginTsdoc,
            "tsdoc-require": pluginTSDocRequire,
            unicorn: pluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": pluginWriteGood,
            xss: xss,
        },
        rules: {
            // TypeScript Config Files Rules
            // TypeScript backend rules
            ...js.configs.all.rules,
            ...tseslint.configs["recommendedTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            // @ts-expect-error -- Wrong or Missing Types due to old plugin, or types dont sastify strict mode
            ...tseslint.configs["stylistic"].rules,
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
            ...pluginComments.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
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
            "boundaries/element-types": ["off"],
            // Architecture boundaries for Electron
            "boundaries/no-ignored": "off",
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/filename-no-index": "error",
            "canonical/import-specifier-newline": "off",
            "canonical/no-barrel-import": "error",
            "canonical/no-import-namespace-destructure": "warn",
            "canonical/no-restricted-imports": "off",
            "canonical/prefer-react-lazy": "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            complexity: "off",
            "default-case": "off",
            "depend/ban-dependencies": [
                "warn",
                {
                    allowed: [
                        "eslint-plugin-react",
                        "axios",
                    ],
                },
            ],
            "dot-notation": "off",
            "ex/might-throw": "off",
            "ex/no-unhandled": "warn",
            "ex/use-error-cause": "warn",
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
            // Import Rules
            "import-x/named": "warn",
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
            "import-x/prefer-namespace-import": "off",
            "import-x/unambiguous": "warn",
            "init-declarations": "off",
            // Accessibility (jsx-a11y)
            "jsx-a11y/anchor-ambiguous-text": "warn",
            "jsx-a11y/lang": "off",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
            // Math
            "math/abs": "warn",
            "math/prefer-exponentiation-operator": "warn",
            "math/prefer-math-sum-precise": "warn",
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-lines": "off",
            // Sonar quality helpers
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
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
            "n/no-process-env": [
                "error",
                {
                    allowedVariables: [
                        "NODE_ENV",
                        "HEADLESS",
                        "CI",
                        "TEST_MODE",
                        "PACKAGE_VERSION",
                    ],
                },
            ],
            "n/no-restricted-import": "warn",
            "n/no-restricted-require": "warn",
            "n/no-sync": "warn",
            "n/no-unpublished-import": [
                "off",
                {
                    allowModules: [
                        "electron",
                        "node",
                        "electron-devtools-installer",
                        "index.css",
                        "styles.css",
                        "main.css",
                        "header.css",
                        "footer.css",
                    ],
                },
            ],
            "n/no-unsupported-features/es-builtins": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/es-syntax": [
                "warn",
                {
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
            "n/no-unsupported-features/node-builtins": [
                "warn",
                {
                    allowExperimental: true,
                    ignores: [],
                    version: ">=24.0.0",
                },
            ],
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-const": "error",
            "prefer-destructuring": "off",
            //            "prettier/prettier": [
            //                "warn",
            //                { usePrettierrc: true },
            //            ],
            // Promise
            "promise/no-multiple-resolved": "warn",
            "promise/prefer-await-to-callbacks": "off",
            "promise/prefer-await-to-then": "warn",
            "promise/prefer-catch": "warn",
            "promise/spec-only": "warn",
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
            "regexp/require-unicode-regexp": "warn",
            "regexp/require-unicode-sets-regexp": "off",
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
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": [
                "warn",
                30,
            ],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off",
            "sonarjs/for-in": "warn",
            "sonarjs/nested-control-flow": "off",
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "warn",
            "sonarjs/no-implicit-dependencies": "warn",
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off",
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
            "sort-imports": "off",
            "sort-keys": "off",
            "tsdoc-require/require": "warn", // Backend-specific unicorn rules
            // Documentation
            "tsdoc/syntax": "warn",
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true, // Service classes
                    },
                },
            ],
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Scripts
    // ═══════════════════════════════════════════════════════════════════════════════
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
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        name: "Scripts - scripts/**/*.{TS,TSX,CTS,MTS,MJS,JS,JSX,CJS}",
        plugins: {
            "@typescript-eslint": tseslint,
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
            ...pluginComments.recommended.rules,
            ...pluginUnicorn.configs.all.rules,
            "@typescript-eslint/no-empty-function": "off",
            // Allow flexible patterns for benchmark mock implementations
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "off", // Scripts may not await all promises
            "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types for React components
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/require-await": "off", // Scripts may have async patterns
            "@typescript-eslint/strict-void-return": "warn",
            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
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
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-destructuring": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/filename-case": "off", // Allow benchmark files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JS JsDoc
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{js,cjs}"],
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
        name: "JS JSDoc - **/*.{JS,CJS}",
        plugins: {
            jsdoc: jsdoc,
        },
        rules: {
            "jsdoc/check-access": "warn", // Recommended
            "jsdoc/check-alignment": "warn", // Recommended
            "jsdoc/check-indentation": "warn",
            "jsdoc/check-line-alignment": "warn",
            "jsdoc/check-param-names": "warn", // Recommended
            "jsdoc/check-property-names": "warn", // Recommended
            "jsdoc/check-syntax": "warn",
            "jsdoc/check-tag-names": "off", // Recommended
            "jsdoc/check-template-names": "warn",
            "jsdoc/check-types": "warn", // Recommended
            "jsdoc/check-values": "warn", // Recommended
            "jsdoc/convert-to-jsdoc-comments": "warn",
            "jsdoc/empty-tags": "warn", // Recommended
            "jsdoc/escape-inline-tags": "warn", // Recommended for TS configs
            "jsdoc/implements-on-classes": "warn", // Recommended
            "jsdoc/imports-as-dependencies": "warn",
            "jsdoc/informative-docs": "warn",
            "jsdoc/lines-before-block": "warn",
            "jsdoc/match-description": "warn",
            "jsdoc/match-name": "off",
            "jsdoc/multiline-blocks": "warn", // Recommended
            "jsdoc/no-bad-blocks": "warn",
            "jsdoc/no-blank-block-descriptions": "warn",
            "jsdoc/no-blank-blocks": "warn", // Recommended
            "jsdoc/no-defaults": "warn", // Recommended
            "jsdoc/no-missing-syntax": "off",
            "jsdoc/no-multi-asterisks": "warn", // Recommended
            "jsdoc/no-restricted-syntax": "off",
            "jsdoc/no-types": "off", // Recommended for TS configs
            "jsdoc/no-undefined-types": "warn", // Recommended for non-TS configs
            "jsdoc/prefer-import-tag": "off",
            "jsdoc/reject-any-type": "off",
            "jsdoc/reject-function-type": "warn", // Recommended
            "jsdoc/require-asterisk-prefix": "warn",
            "jsdoc/require-description": "warn",
            "jsdoc/require-description-complete-sentence": "warn",
            "jsdoc/require-example": "off",
            "jsdoc/require-file-overview": "warn",
            "jsdoc/require-hyphen-before-param-description": "warn",
            "jsdoc/require-jsdoc": "warn", // Recommended
            "jsdoc/require-next-description": "warn",
            "jsdoc/require-next-type": "warn", // Recommended
            "jsdoc/require-param": "warn", // Recommended
            "jsdoc/require-param-description": "warn", // Recommended
            "jsdoc/require-param-name": "warn", // Recommended
            "jsdoc/require-param-type": "warn", // Recommended in non-TS configs
            "jsdoc/require-property": "warn", // Recommended
            "jsdoc/require-property-description": "warn", // Recommended
            "jsdoc/require-property-name": "warn", // Recommended
            "jsdoc/require-property-type": "warn", // Recommended in non-TS configs
            "jsdoc/require-rejects": "warn", // Recommended
            "jsdoc/require-returns": "warn", // Recommended
            "jsdoc/require-returns-check": "warn", // Recommended
            "jsdoc/require-returns-description": "warn", // Recommended
            "jsdoc/require-returns-type": "warn", // Recommended in non-TS configs
            "jsdoc/require-tags": "off",
            "jsdoc/require-template": "warn",
            "jsdoc/require-template-description": "warn",
            "jsdoc/require-throws": "warn",
            "jsdoc/require-throws-description": "warn",
            "jsdoc/require-throws-type": "warn", // Recommended
            "jsdoc/require-yields": "warn", // Recommended
            "jsdoc/require-yields-check": "warn", // Recommended
            "jsdoc/require-yields-description": "warn",
            "jsdoc/require-yields-type": "warn", // Recommended
            "jsdoc/sort-tags": "off",
            "jsdoc/tag-lines": "off", // Recommended
            "jsdoc/text-escaping": "warn",
            "jsdoc/ts-method-signature-style": "warn",
            "jsdoc/ts-no-empty-object-type": "warn",
            "jsdoc/ts-no-unnecessary-template-expression": "warn",
            "jsdoc/ts-prefer-function-type": "warn",
            "jsdoc/type-formatting": "warn",
            "jsdoc/valid-types": "warn", // Recommended
            // "jsdoc/check-examples": "warn", // Deprecated and not for ESLint >= 8
            // "jsdoc/rejct-any-type": "warn", // broken
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JS/MJS Configuration files
    // ═══════════════════════════════════════════════════════════════════════════════
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
        name: "JS/MJS Config - **/*.config.{JS,MJS,CTS,CJS}",
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
            react: pluginReact,
            "react-hooks": reactHooks,
            "react-perf": reactPerfPlugin,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: pluginSecurity,
            sonarjs: pluginSonarjs,
            "sort-class-members": pluginSortClassMembers,
            tsdoc: pluginTsdoc,
            "tsdoc-require": pluginTSDocRequire,
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
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            "depend/ban-dependencies": [
                "warn",
                {
                    allowed: [
                        "eslint-plugin-react",
                        "axios",
                    ],
                },
            ],
            "dot-notation": "off",
            "func-style": "off",
            "id-length": "off",
            "max-classes-per-file": "off",
            "max-lines": "off",
            // Sonar quality helpers
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
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
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": [
                "warn",
                30,
            ],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off",
            "sonarjs/for-in": "warn",
            "sonarjs/nested-control-flow": "off",
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "warn",
            "sonarjs/no-implicit-dependencies": "warn",
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off",
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off", // Configs often use different scoping
            "unicorn/filename-case": "off", // Allow config files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
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
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Tests (Playwright)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "playwright/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "**/*.playwright.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "**/playwright/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        name: "Playwright E2E Tests - playwright/**/*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        ...playwright.configs["flat/recommended"],
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
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "playwright/tsconfig.json",
                sourceType: "module",
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        plugins: {
            ...playwright.configs["flat/recommended"].plugins,
            "@typescript-eslint": tseslint,
            playwright: playwright,
            "testing-library": pluginTestingLibrary,
            vitest: vitest,
        },
        rules: {
            ...playwright.configs["flat/recommended"].rules,
            ...pluginTestingLibrary.configs["flat/dom"].rules,
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            // TypeScript and testing-specific overrides for Playwright
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                    varsIgnorePattern: "^_",
                },
            ],
            "import-x/no-unresolved": "off", // Playwright has special imports
            "no-console": "off", // Allow console in tests
            "no-magic-numbers": "off", // Test data may have magic numbers
            // Enhanced Playwright-specific rules
            "playwright/expect-expect": "error",
            "playwright/max-expects": [
                "error",
                { max: 10 },
            ],
            "playwright/max-nested-describe": [
                "error",
                { max: 4 },
            ],
            "playwright/missing-playwright-await": "error",
            "playwright/no-commented-out-tests": "warn",
            // Conditional logic in tests is usually an indication that a test is attempting to cover too much, and not testing the logic it intends to. Each branch of code executing within a conditional statement will usually be better served by a test devoted to it.
            "playwright/no-conditional-in-test": "error",
            "playwright/no-duplicate-hooks": "error",
            "playwright/no-element-handle": "warn",
            "playwright/no-eval": "error",
            "playwright/no-focused-test": "error",
            "playwright/no-force-option": "warn",
            "playwright/no-get-by-title": "error",
            "playwright/no-hooks": "off", // Disabling - hooks are needed in most projects
            "playwright/no-nested-step": "error",
            "playwright/no-networkidle": "warn",
            "playwright/no-nth-methods": "off",
            "playwright/no-page-pause": "warn",
            "playwright/no-raw-locators": [
                "error",
                {
                    allowed: [
                        "iframe",
                        "[aria-busy='false']",
                    ],
                },
            ],
            "playwright/no-restricted-matchers": "off", // Disabling - restricting matchers is often unnecessary
            "playwright/no-skipped-test": "warn",
            "playwright/no-slowed-test": "off",
            "playwright/no-useless-await": "error",
            "playwright/no-useless-not": "error",
            "playwright/no-wait-for-selector": "warn",
            "playwright/no-wait-for-timeout": "warn",
            "playwright/prefer-comparison-matcher": "warn",
            "playwright/prefer-equality-matcher": "warn",
            "playwright/prefer-hooks-in-order": "warn",
            "playwright/prefer-hooks-on-top": "warn",
            "playwright/prefer-locator": "warn",
            "playwright/prefer-lowercase-title": "warn",
            "playwright/prefer-native-locators": "warn",
            "playwright/prefer-strict-equal": "warn",
            "playwright/prefer-to-be": "warn",
            "playwright/prefer-to-contain": "warn",
            "playwright/prefer-to-have-count": "warn",
            "playwright/prefer-to-have-length": "warn",
            "playwright/prefer-web-first-assertions": "error",
            "playwright/require-hook": "off", // Disabling - not always required
            "playwright/require-soft-assertions": "off", // Disabling - soft assertions are not always desirable
            "playwright/require-to-throw-message": "warn",
            "playwright/require-top-level-describe": "warn",
            "playwright/valid-expect": "error",
            "playwright/valid-title": "error",
            "prefer-arrow-callback": "off", // Test functions don't need arrow syntax
            "testing-library/prefer-screen-queries": "off", // Allow destructuring from render result
            "unicorn/consistent-function-scoping": "off", // Test helpers
            "unicorn/no-await-expression-member": "off", // Common in Playwright
        },
        settings: {
            "import-x/resolver": {
                node: true,
                typescript: {
                    alwaysTryTypes: true,
                    project: [
                        "./tsconfig.json",
                        "./playwright.config.ts",
                    ],
                },
            },
            playwright: {
                additionalAssertFunctionNames: [
                    "expectToBeVisible",
                    "expectToHaveText",
                    "expectToHaveCount",
                ],
            },
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Tests (Strict)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "shared/test/StrictTests/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "src/test/StrictTests/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "electron/test/StrictTests/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        name: "Strict Test Files - **/test/StrictTests/*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        plugins: {
            vitest: vitest,
        },
        rules: {
            ...vitest.configs.all.rules,
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            "no-barrel-files/no-barrel-files": "off", // Allow barrel files in tests for convenience
            "testing-library/consistent-data-testid": [
                "warn",
                {
                    testIdAttribute: ["data-testid"],
                    testIdPattern:
                        "^[a-z]+([A-Z][a-z]+)*(-[a-z]+([A-Z][a-z]+)*)*$", // Kebab-case or camelCase
                },
            ],
            "testing-library/no-test-id-queries": "warn",
            "testing-library/prefer-explicit-assert": "warn",
            "testing-library/prefer-implicit-assert": "warn",
            "testing-library/prefer-query-matchers": "warn",
            "testing-library/prefer-user-event": "warn",
        },
        settings: {
            vitest: {
                typecheck: true,
            },
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Storybook
    // ═══════════════════════════════════════════════════════════════════════════════
    ...storybook.configs["flat/recommended"],
    ...storybook.configs["flat/csf-strict"],
    ...storybook.configs["flat/addon-interactions"],
    {
        files: [
            ".storybook/**/*.{ts,tsx,mts,cts}",
            "storybook/main.ts",
            "storybook/preview.ts",
        ],
        name: "Storybook Config - .storybook/**/*.{TS,TSX,MTS,CTS}",
        rules: {
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            "canonical/filename-match-exported": "off",
            // Node-style config code is expected here
            "import-x/no-nodejs-modules": "off",
            "n/no-missing-import": "off",
            "n/no-unpublished-import": "off",
            "unicorn/prefer-import-meta-properties": "off",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Storybook Stories
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["storybook/**/*.stories.tsx"],
        name: "Storybook Stories - storybook/**/*.stories.tsx",
        rules: {
            "@arthurgeron/react-usememo/require-usememo": "off",
            "@eslint-react/jsx-no-iife": "off",
            "@eslint-react/jsx-shorthand-fragment": "off",
            "@eslint-react/no-useless-fragment": "off",
            "@eslint-react/prefer-destructuring-assignment": "off",
            // Storybook stories are demo code, loosen the grip for now
            "@eslint-react/prefer-read-only-props": "off",
            "@eslint-react/prefer-shorthand-fragment": "off",
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            "@metamask/design-tokens/color-no-hex": "off",
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-shadow": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unnecessary-type-parameters": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { args: "none", varsIgnorePattern: "^_ignored$" },
            ],
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/strict-void-return": "warn",
            "canonical/filename-match-exported": "off",
            "capitalized-comments": "off",
            "clean-timer/assign-timer-id": "off",
            "function-name/starts-with-verb": "off",
            "jsx-a11y/label-has-associated-control": "off",
            "nitpick/no-redundant-vars": "off",
            "perfectionist/sort-jsx-props": "off",
            "perfectionist/sort-objects": "off",
            "perfectionist/sort-union-types": "off",
            "prettier/prettier": "off", // Using in Prettier directly for less noise for AI
            "react-perf/jsx-no-jsx-as-prop": "off",
            "react-perf/jsx-no-new-function-as-prop": "off",
            "react-perf/jsx-no-new-object-as-prop": "off",
            "react/jsx-fragments": "off",
            "react/jsx-no-bind": "off",
            "react/jsx-no-useless-fragment": "off",
            "react/no-array-index-key": "off",
            "regexp/letter-case": "off",
            "regexp/prefer-named-capture-group": "off",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "off",
            "sonarjs/no-hardcoded-ip": "off",
            "sonarjs/pseudo-random": "off",
            "sonarjs/void-use": "off",
            "storybook/csf-component": "warn",
            "storybook/meta-inline-properties": "warn",
            "storybook/meta-satisfies-type": "warn",
            "storybook/no-renderer-packages": "warn",
            "storybook/no-stories-of": "warn",
            "storybook/no-title-property-in-meta": "warn",
            // Story metadata is already documented by component-level TSDoc.
            // Disable tsdoc-require here to avoid noisy warnings on Storybook
            // `meta` objects that are not part of the public API surface.
            "tsdoc-require/require": "off",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Theme Components Override
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["src/theme/**/*.{ts,tsx,cts,mts}"],
        name: "Theme Components Override - src/theme/**/*.{TS,TSX,CTS,MTS}",
        plugins: {
            "react-perf": reactPerfPlugin,
        },
        rules: {
            // Theme components legitimately need inline styles for dynamic theming
            "react-perf/jsx-no-new-object-as-prop": "warn",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Github Workflows YAML/YML
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/.github/workflows/**/*.{yaml,yml}",
            "config/tools/flatpak-build.yml",
            "**/dependabot.yml",
            "**/.spellcheck.yml",
            "**/.pre-commit-config.yaml",
        ],
        name: "YAML/YML GitHub Workflows - Disables",
        rules: {
            "yml/block-mapping-colon-indicator-newline": "off",
            "yml/no-empty-key": "off",
            "yml/no-empty-mapping-value": "off",
            "yml/sort-keys": "off",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Disable JSON Sort-keys
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/package.json",
            "**/package-lock.json",
        ],
        name: "JSON Files - Disables",
        rules: {
            "json/sort-keys": "off",
        },
    },
    {
        files: ["**/.vscode/**"],
        name: "VS Code Files - Disables",
        rules: {
            "jsonc/array-bracket-newline": "off",
        },
    },
    {
        files: ["electron/services/sync/**/*.{ts,tsx}"],
        ignores: ["electron/services/sync/syncEngineUtils.ts"],
        name: "Cloud Sync Drift Guards",
        rules: {
            "uptime-watcher/no-local-identifiers": [
                "error",
                {
                    banned: [
                        {
                            kinds: ["function"],
                            message:
                                "Use isAsciiDigits from electron/services/sync/syncEngineUtils.ts (avoid duplicated validation policies).",
                            name: "isAsciiDigits",
                        },
                        {
                            kinds: ["function"],
                            message:
                                "Use hasAsciiControlCharacters from shared/utils/stringSafety.ts (avoid duplicated validation policies).",
                            name: "hasAsciiControlCharacters",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["electron/services/cloud/providers/**/*.{ts,tsx}"],
        name: "Cloud Providers Drift Guards",
        rules: {
            "uptime-watcher/no-call-identifiers": [
                "error",
                {
                    banned: [
                        {
                            message:
                                "Use validateOAuthAuthorizeUrl (OAuth flows) or validateExternalOpenUrlCandidate (general external navigation) instead of calling isAllowedExternalOpenUrl directly.",
                            name: "isAllowedExternalOpenUrl",
                        },
                    ],
                },
            ],
            "uptime-watcher/no-local-identifiers": [
                "error",
                {
                    banned: [
                        {
                            kinds: ["function"],
                            message:
                                "Use tryParseJsonRecord from shared/utils/jsonSafety.ts instead of defining local JSON parsing helpers.",
                            name: "tryParseJsonRecord",
                        },
                        {
                            kinds: ["function"],
                            message:
                                "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
                            name: "isPlainObject",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["shared/types/**/*.{ts,tsx}"],
        name: "Shared Types Drift Guards",
        rules: {
            "uptime-watcher/no-local-identifiers": [
                "error",
                {
                    banned: [
                        {
                            kinds: ["variable"],
                            message:
                                "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
                            name: "isPlainObject",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["electron/preload/**/*.{ts,tsx}"],
        name: "Preload Drift Guards",
        rules: {
            "uptime-watcher/no-local-identifiers": [
                "error",
                {
                    banned: [
                        {
                            kinds: ["variable"],
                            message:
                                "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
                            name: "isPlainObject",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["electron/services/**/*.{ts,tsx}"],
        ignores: ["electron/services/sync/syncEngineUtils.ts"],
        name: "String Safety Drift Guards",
        rules: {
            "uptime-watcher/no-local-identifiers": [
                "error",
                {
                    banned: [
                        {
                            kinds: ["function"],
                            message:
                                "Use hasAsciiControlCharacters from shared/utils/stringSafety.ts instead of defining local implementations.",
                            name: "hasAsciiControlCharacters",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["electron/services/**/*.{ts,tsx}"],
        ignores: ["electron/services/shell/openExternalUtils.ts"],
        name: "Electron Error Formatting Drift Guards",
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    message:
                        "Use getElectronErrorCodeSuffix from electron/services/shell/openExternalUtils.ts instead of ad-hoc error code suffix formatting.",
                    selector:
                        "ConditionalExpression:has(TemplateLiteral:has(Identifier[name='code']):has(TemplateElement[value.raw=' ('])):has(Literal[value=''])",
                },
            ],
            "uptime-watcher/prefer-try-get-error-code": "error",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        name: "Regex Drift Guards",
        rules: {
            "uptime-watcher/no-regexp-v-flag": "error",
        },
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Global Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/**"],
        name: "Globals",
        rules: {
            "@eslint-react/debug/class-component": "off", // Debugging not needed
            "@eslint-react/debug/function-component": "off", // Debugging not needed
            "@eslint-react/debug/hook": "off", // Debugging not needed
            "@eslint-react/debug/is-from-react": "off", // Debugging not needed
            "@eslint-react/debug/jsx": "off", // Debugging not needed
            "@eslint-react/debug/react-hooks": "off", // Debugging not needed
            "@typescript-eslint/dot-notation": "off", // Deprecated
            "@typescript-eslint/no-empty-interface": "off", // Deprecated
            "@typescript-eslint/no-loss-of-precision": "off", // Deprecated
            "@typescript-eslint/no-type-aliases": "off", // Deprecated
            "@typescript-eslint/no-var-requires": "off", // Allow require for dynamic imports
            "@typescript-eslint/prefer-ts-expect-error": "off", // Deprecated
            "@typescript-eslint/sort-type-constituents": "off", // Deprecated
            "@typescript-eslint/typedef": "off", // Deprecated
            "@typescript-eslint/unified-signatures": "off", // Broken due to: TypeError: typeParameters.params is not iterable
            // Better-tailwindcss
            "better-tailwindcss/multiline": "off",
            "better-tailwindcss/sort-classes": "off",
            "callback-return": "off",
            "canonical/destructuring-property-newline": "off",
            // Deprecated rules - to be removed in future
            "functional/no-promise-reject": "off",
            "functional/no-this-expressions": "off",
            "functional/no-try-statements": "off",
            "functional/prefer-property-signatures": "off",
            // Functional
            "functional/prefer-readonly-type": "off",
            "functional/prefer-tacit": "off",
            "functional/readonly-type": "off",
            "functional/type-declaration-immutability": "off",
            "global-require": "off",
            "handle-callback-err": "off",
            "id-blacklist": "off",
            // Import-x
            "import-x/imports-first": "off",
            "jsx-a11y/accessible-emoji": "off",
            "jsx-a11y/no-onchange": "off",
            "line-comment-position": "off",
            "lines-around-directive": "off",
            "multiline-comment-style": "off",
            // N (Node plugin)
            "n/no-hide-core-modules": "off",
            "n/shebang": "off",
            "newline-after-var": "off",
            "newline-before-return": "off",
            "no-buffer-constructor": "off",
            "no-catch-shadow": "off",
            "no-hardcoded-strings/no-hardcoded-strings": "off", // Will use i18n in future
            "no-mixed-requires": "off",
            "no-native-reassign": "off",
            "no-negated-in-lhs": "off",
            "no-new-object": "off",
            "no-new-require": "off",
            "no-new-symbol": "off",
            "no-path-concat": "off",
            "no-process-env": "off",
            "no-process-exit": "off",
            "no-restricted-modules": "off",
            "no-return-await": "off",
            "no-sync": "off",
            "prefer-arrow/prefer-arrow-functions": "off", // Too strict
            "prefer-reflect": "off",
            // React
            "react/jsx-sort-default-props": "off",
            "spaced-comment": [
                "error",
                "always",
                {
                    exceptions: [
                        "-",
                        "+",
                    ],
                },
            ],
            "styled-components-a11y/accessible-emoji": "off",
            // Styled-components-a11y (and jsx-a11y equivalents)
            "styled-components-a11y/lang": "off",
            "styled-components-a11y/no-onchange": "off",
            "unicorn/no-array-push-push": "off",
            // Unicorn (deprecated / replaced rules)
            "unicorn/no-instanceof-array": "off",
            "unicorn/no-length-as-slice-end": "off",
            "unicorn/prefer-spread": "off", // Prefer Array.from
            "write-good-comments/write-good-comments": "off", // Too strict
        },
    }, // eslint-config-prettier MUST be last to override conflicting rules
    {
        files: [
            "electron/**/*.{ts,tsx}",
            "shared/**/*.{ts,tsx}",
            "src/**/*.{ts,tsx}",
        ],
        ignores: [
            "electron/test/**",
            "shared/test/**",
            "src/test/**",
            "tests/**",
            "**/*.test.{ts,tsx}",
            "**/*.spec.{ts,tsx}",
            "benchmarks/**",
            "scripts/**",
            "storybook/**",
            "docs/**",
        ],
        name: "AI Agent Guardrails (production)",
        plugins: {
            "@typescript-eslint": tseslint,
            canonical: pluginCanonical,
        },
        rules: {
            // Encourage consistent typing; allow tests to be pragmatic.
            "@typescript-eslint/no-explicit-any": "error",
            // Prevent accidental barrel layers and cross-module drift.
            "canonical/no-re-export": "error",
        },
    },
    {
        files: [
            "electron/test/**/*.{ts,tsx}",
            "shared/test/**/*.{ts,tsx}",
            "src/test/**/*.{ts,tsx}",
            "tests/**/*.{ts,tsx}",
            "**/*.test.{ts,tsx}",
            "**/*.spec.{ts,tsx}",
        ],
        name: "AI Agent Guardrails (tests)",
        plugins: {
            "@typescript-eslint": tseslint,
            canonical: pluginCanonical,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/strict-void-return": "warn",
            "canonical/no-re-export": "off",
        },
    },
    eslintConfigPrettier,
];
