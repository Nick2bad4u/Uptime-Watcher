/**
 * @fileoverview Shared ESLint configuration for Uptime Watcher projects
 * Optimized for Electron + React + TypeScript architecture with modern ES2024+ features
 */

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
import eslintReactNamingConvention from "eslint-plugin-react-naming-convention";
import eslintReactWeb from "eslint-plugin-react-web-api";
import globals from "globals";
import html from "eslint-plugin-html";
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
import pluginComments from "eslint-plugin-eslint-comments";
import pluginCompat from "eslint-plugin-compat";
import pluginFunctional from "eslint-plugin-functional";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import pluginNoOnly from "eslint-plugin-no-only-tests";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
import pluginPromise from "eslint-plugin-promise";
import pluginReact from "eslint-plugin-react";
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
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import * as cssPlugin from "eslint-plugin-css";
import { fixupPluginRules } from "@eslint/compat";

/**
 * Creates the base ESLint configuration for Uptime Watcher projects
 */
export function createUptimeWatcherConfig(options = {}) {
    const {
        useReact = true,
        useElectron = false,
        useTailwind = false,
        useVitest = true,
        projectRoot = process.cwd(),
        tsConfigPath = "tsconfig.json",
    } = options;

    return [
        importX.flatConfigs.typescript,
        progress.configs.recommended,
        ...nodeDependenciesPlugin.configs["flat/recommended"],
        noBarrelFiles.flat,
        ...(nitpick.configs?.recommended ? [nitpick.configs.recommended] : []),

        // Global ignores
        {
            ignores: [
                "**/node_modules/**",
                "**/dist/**",
                "**/coverage/**",
                "**/release/**",
                "**/*.config.{js,mjs,ts}",
                "benchmarks/**/*.ts",
            ],
        },

        // Global environment
        {
            languageOptions: {
                globals: {
                    ...globals.node,
                    ...(useVitest ? vitest.environments.env.globals : {}),
                    __dirname: "readonly",
                    __filename: "readonly",
                    Buffer: "readonly",
                    global: "readonly",
                    globalThis: "readonly",
                    module: "readonly",
                    process: "readonly",
                    require: "readonly",
                },
            },
        },

        // Import resolver settings
        {
            settings: {
                "import-x/resolver": {
                    node: true,
                },
                ...(useReact && { react: { version: "19" } }),
                "import-x/resolver-next": [
                    createTypeScriptImportResolver({
                        alwaysTryTypes: true,
                        noWarnOnMultipleProjects: true,
                        project: [tsConfigPath],
                    }),
                ],
            },
        },

        // TypeScript files
        {
            files: ["**/*.{ts,tsx}"],
            ignores: ["**/*.{spec,test}.{ts,tsx}", "**/test/**/*"],
            languageOptions: {
                parser: tseslintParser,
                parserOptions: {
                    ecmaVersion: "latest",
                    project: tsConfigPath,
                    sourceType: "module",
                    tsconfigRootDir: projectRoot,
                    ecmaFeatures: {
                        jsx: useReact,
                        impliedStrict: true,
                    },
                    experimentalDecorators: true,
                    JSDocParsingMode: "all",
                    ...(useReact && {
                        jsxFragmentName: "React.Fragment",
                        jsxPragma: "React",
                    }),
                    warnOnUnsupportedTypeScriptVersion: true,
                },
                globals: {
                    ...globals.browser,
                    ...globals.node,
                    document: "readonly",
                    window: "readonly",
                    ...(useElectron && {
                        __dirname: "readonly",
                        __filename: "readonly",
                    }),
                },
            },
            plugins: {
                "@typescript-eslint": tseslint,
                "import-x": importX,
                "unused-imports": pluginUnusedImports,
                unicorn: pluginUnicorn,
                sonarjs: pluginSonarjs,
                security: pluginSecurity,
                promise: pluginPromise,
                "prefer-arrow": pluginPreferArrow,
                perfectionist: pluginPerfectionist,
                "no-only-tests": pluginNoOnly,
                canonical: pluginCanonical,
                boundaries: pluginBoundaries,
                "array-func": arrayFunc,
                depend: depend,
                tsdoc: pluginTsdoc,
                "write-good-comments": pluginWriteGood,
                "sort-class-members": pluginSortClassMembers,
                "sort-destructure-keys": pluginSortDestructure,
                regexp: pluginRegexp,
                redos: pluginRedos,
                "microsoft-sdl": pluginMicrosoftSdl,
                functional: pluginFunctional,
                "eslint-comments": pluginComments,
                compat: pluginCompat,
                "no-use-extend-native": eslintPluginNoUseExtendNative,
                math: eslintPluginMath,
                ex: ex,
                listeners: listeners,
                observers: observers,
                "no-unsanitized": nounsanitized,
                "jsx-a11y": jsxA11y,
                "implicit-dependencies": implicitDependencies,
                istanbul: istanbul,
                "comment-length": eslintPluginCommentLength,
                "sort-react-dependency-arrays": pluginSortReactDependency,
                "no-lookahead-lookbehind-regexp": pluginRegexLook,
                "design-tokens": pluginDesignTokens,
                "function-name": pluginFunctionNames,
                "clean-code": pluginCleanCode,
                "filename-export": pluginFilenameExport,
                "import-zod": importZod,
                "usememo-recommendations": pluginUseMemo,
                goodeffects: pluginGoodEffects,
                "jsx-plus": pluginJsxPlus,
                "no-unary-plus": pluginNoUnary,
                "granular-selectors": pluginGranular,
                "module-interop": moduleInterop,
                "no-unawaited-dot-catch-throw": pluginNoUnwaited,
                toplevel: pluginTopLevel,
                "format-sql": pluginFormatSQL,
                neverthrow: pluginNeverThrow,
                "no-explicit-type-exports": pluginNoExplicitTypeExports,
                deprecation: pluginDeprecation,
                "no-function-declare-after-return": pluginNFDAR,
                "require-jsdoc": pluginJSDoc,
                xss: xss,
                "sql-template": sqlTemplate,
                putout: putout,
                ...(useReact && {
                    react: pluginReact,
                    "react-hooks": reactHooks,
                    "react-refresh": reactRefresh,
                    "react-compiler": reactCompiler,
                    "react-dom": eslintReactDom,
                    "react-hooks-extra": eslintReactHooksExtra,
                    "react-naming-convention": eslintReactNamingConvention,
                    "react-web-api": eslintReactWeb,
                    "react-require-testid": pluginReactTest,
                    "react-useeffect": reactUseEffect,
                    "@eslint-react": eslintReact,
                }),
                ...(useTailwind && {
                    tailwindcss: tailwind,
                    css: cssPlugin,
                }),
                n: nodePlugin,
            },
            rules: {
                // TypeScript rules
                "@typescript-eslint/no-unused-vars": "off",
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

                // Import rules
                "import-x/order": [
                    "error",
                    {
                        groups: [
                            "builtin",
                            "external",
                            "internal",
                            "parent",
                            "sibling",
                            "index",
                        ],
                        "newlines-between": "never",
                        alphabetize: { order: "asc", caseInsensitive: true },
                    },
                ],
                "import-x/no-unresolved": "error",
                "import-x/named": "error",
                "import-x/default": "error",
                "import-x/namespace": "error",

                // Security
                "security/detect-object-injection": "off",
                "security/detect-non-literal-fs-filename": "off",

                // Code quality
                "no-console": "warn",
                "no-debugger": "error",
                "prefer-const": "error",
                "no-var": "error",

                // Unicorn rules
                "unicorn/prefer-module": "off",
                "unicorn/prevent-abbreviations": "off",
                "unicorn/no-null": "off",
                "unicorn/filename-case": "off",

                // Promise rules
                "promise/always-return": "off",
                "promise/catch-or-return": "error",

                // Perfectionist
                "perfectionist/sort-imports": "off", // Use import-x/order instead

                // TSDoc
                "tsdoc/syntax": "warn",

                ...(useReact && {
                    // React rules
                    "react/react-in-jsx-scope": "off",
                    "react/prop-types": "off",
                    "react-hooks/rules-of-hooks": "error",
                    "react-hooks/exhaustive-deps": "warn",
                    "react-refresh/only-export-components": [
                        "warn",
                        { allowConstantExport: true },
                    ],
                }),

                ...(useTailwind && {
                    // Tailwind rules
                    "tailwindcss/classnames-order": "warn",
                    "tailwindcss/enforces-negative-arbitrary-values": "warn",
                    "tailwindcss/enforces-shorthand": "warn",
                    "tailwindcss/migration-from-tailwind-2": "warn",
                    "tailwindcss/no-arbitrary-value": "warn",
                    "tailwindcss/no-contradicting-classname": "warn",
                    "tailwindcss/no-custom-classname": [
                        "warn",
                        { skipClassAttribute: true },
                    ],
                    "tailwindcss/no-unnecessary-arbitrary-value": "warn",
                }),
            },
        },

        // JSON files
        {
            files: ["**/*.{json,json5,jsonc}"],
            plugins: { jsonc: eslintPluginJsonc },
            ...json.configs.recommended[0],
            ...eslintPluginJsonc.configs["flat/prettier"][0],
            languageOptions: {
                parser: jsoncEslintParser,
                parserOptions: { jsonSyntax: "JSON" },
            },
        },

        // YAML files
        {
            files: ["**/*.{yaml,yml}"],
            plugins: { yml: eslintPluginYml },
            ...eslintPluginYml.configs["flat/prettier"],
            languageOptions: {
                parser: yamlEslintParser,
                parserOptions: { defaultYAMLVersion: "1.2" },
            },
        },

        // TOML files
        {
            files: ["**/*.toml"],
            plugins: { toml: eslintPluginToml },
            ...eslintPluginToml.configs["flat/standard"][0],
            languageOptions: {
                parser: tomlEslintParser,
                parserOptions: { tomlVersion: "1.0.0" },
            },
        },

        // HTML files
        {
            files: ["**/*.html"],
            plugins: { html },
        },

        // Markdown files
        {
            files: ["**/*.md"],
            ...markdown.configs.recommended[0],
            plugins: { markdown },
            language: "markdown/gfm",
        },

        // Test files
        ...(useVitest
            ? [
                  {
                      files: [
                          "**/*.{test,spec}.{ts,tsx}",
                          "**/test/**/*.{ts,tsx}",
                      ],
                      plugins: {
                          vitest: vitest,
                          ...(useReact && {
                              "testing-library": pluginTestingLibrary,
                          }),
                      },
                      rules: {
                          ...vitest.configs.recommended.rules,
                          ...(useReact && {
                              ...pluginTestingLibrary.configs["flat/react"]
                                  .rules,
                          }),
                          "no-console": "off",
                      },
                      languageOptions: {
                          globals: {
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
                  },
              ]
            : []),

        // Prettier config must be last
        eslintConfigPrettier,
    ];
}

// Default export for convenience
export default createUptimeWatcherConfig;
