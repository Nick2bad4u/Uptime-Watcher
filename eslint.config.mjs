/**
 * ESLint configuration for the Uptime Watcher application.
 *
 * Comprehensive linting setup with TypeScript, React, accessibility,
 * code quality, and security rules for maintaining code standards.
 */

import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import markdown from "@eslint/markdown";
import json from "@eslint/json";
import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginPromise from "eslint-plugin-promise";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginPrettier from "eslint-plugin-prettier";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginSecurity from "eslint-plugin-security";
import pluginEslintComments from "eslint-plugin-eslint-comments";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginFunctional from "eslint-plugin-functional";
import pluginFilenames from "eslint-plugin-filenames";
import pluginRegexp from "eslint-plugin-regexp";
import pluginTsdoc from "eslint-plugin-tsdoc";
import html from "eslint-plugin-html";
import eslintPluginYml from "eslint-plugin-yml";
import eslintPluginToml from "eslint-plugin-toml";
import tomlEslintParser from "toml-eslint-parser";
import yamlEslintParser from "yaml-eslint-parser";
import * as cssPlugin from "eslint-plugin-css";
import vitest from "@vitest/eslint-plugin";
import vitestGlobals from "eslint-plugin-vitest-globals";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: pluginJs.configs.recommended,
});

export default [
    {
        ignores: [
            "node_modules/",
            "dist/",
            "dist-electron/",
            "release/",
            "package.json",
            "package-lock.json",
            ".vscode/",
            ".vscode/settings.json",
            "commitlint.config.js",
            "stylelint.config.js",
            ".github/",
            ".github/**/*",
            "commitlint.config.js",
            "stylelint.config.js",
            "vite.config.js",
            "vite.config.mjs",
            "vitest.config.js",
            "vitest.config.mts",
            "vitest.electron.config.js",
            "vitest.electron.config.mts",
            "tsconfig.json",
            "tsconfig.*.json",
            "tsconfig.eslint.json",
            "eslint.config.mjs",
            "eslint.config.js",
            "eslint.config.cjs",
            "node_modules/**",
            "**/dist/**",
            "**/dist-electron/**",
            ".**.json",
            ".gitleaks.toml",
            "cliff.toml",
            "cspell.json",
            "**/Design-Plan.md",
            "**/Logging-Migration-Summary.md",
            "**/Docs/**",
            "**/docs/**",
            "Docs/",
            "docs/",
            "Coverage/",
            "coverage/",
            "coverage",
            "coverage/**",
            ".agentic-tools*",
            "_ZENTASKS*",
            "_ZENTANKS*",
            "vitest.electron.config.ts",
            "vitest.electron.config.mts",
            "vitest.config.ts",
            "vitest.config.mts",
            "tsconfig.electron.json",
            "tsconfig.electron.*.json",
            "tsconfig.json",
            "tailwind.config.js",
            "tailwind.config.mjs",
            "tailwind.config.cjs",
            "test/themeTypes.test.tsx",
            "test/themeTypes.test.mts",
            "test/themeTypes.test.tsx",
            "test/themeTypes.test.mts",
            "test/types.test.tsx",
        ],
    },

    // Using Stylelint for CSS files, so we don't need to lint CSS here
    // // CSS files
    // {
    //     files: ["**/*.css"],
    //     ...cssPlugin.configs["flat/recommended"],
    //     plugins: {
    //         css: cssPlugin,
    //     },
    // },

    // Markdown files
    {
        files: ["**/*.md"],
        ...markdown.configs.recommended[0],
        plugins: {
            markdown,
        },
        language: "markdown/gfm",
    },
    // JSON files
    {
        files: ["**/*.json", "**/*.json5", "**/*.jsonc"],
        ...json.configs.recommended[0],
    },
    {
        files: ["**/*.html"],
        plugins: {
            html,
        },
    },

    // // YAML/YML files
    // {
    //     files: ["**/*.yaml", "**/*.yml"],
    //     ignores: ["kics.yaml", "flatpak-build.yml"],
    //     ...eslintPluginYml.configs["flat/prettier"][0],
    //     languageOptions: {
    //         parser: yamlEslintParser,
    //         parserOptions: {
    //             defaultYAMLVersion: "1.0",
    //         },
    //     },
    // },

    // TOML files
    {
        files: ["**/*.toml"],
        ignores: ["lychee.toml"],
        ...eslintPluginToml.configs["flat/standard"][0],
        languageOptions: {
            parser: tomlEslintParser,
            parserOptions: {
                tomlVersion: "1.0.0",
            },
        },
    },

    // JS files
    {
        files: ["**/*.js"],
        ignores: [
            "tests/**",
            "**/__tests__/**",
            "**/*.test.js",
            "**/*.spec.js",
            "vitest*.js",
            "electron/test/**/*.js",
            "src/test/**/*.js",
        ],
        languageOptions: {
            sourceType: "script",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        plugins: {
            js,
            import: pluginImport,
            promise: pluginPromise,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            "jsx-a11y": pluginJsxA11y,
            prettier: pluginPrettier,
            sonarjs: pluginSonarjs,
            security: pluginSecurity,
            "eslint-comments": pluginEslintComments,
            perfectionist: pluginPerfectionist,
            // new plugins
            unicorn: pluginUnicorn,
            functional: pluginFunctional,
            filenames: pluginFilenames,
            regexp: pluginRegexp,
            tsdoc: pluginTsdoc,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...pluginImport.configs.recommended.rules,
            ...pluginImport.configs.react.rules,
            ...pluginImport.configs.electron.rules,
            ...pluginImport.configs.typescript.rules,
            ...pluginPromise.configs.recommended.rules,
            ...pluginReact.configs.all.rules,
            ...pluginReactHooks.configs.recommended.rules,
            ...pluginJsxA11y.configs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...pluginEslintComments.configs.recommended.rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginRegexp.configs.all.rules,
            ...pluginFunctional.configs.all.rules,
            // Core JavaScript best practices
            "no-console": "warn",
            "no-debugger": "error",
            "no-alert": "warn",
            "no-var": "error",
            "prefer-const": "error",
            "prefer-template": "warn",
            "prefer-arrow-callback": "warn",
            "no-unused-expressions": "warn",
            "no-duplicate-imports": "error",
            "no-useless-return": "warn",
            "no-useless-constructor": "warn",
            "no-useless-computed-key": "warn",
            "no-useless-concat": "warn",
            "no-useless-escape": "warn",
            "no-useless-rename": "warn",
            "no-nested-ternary": "warn",
            "no-unneeded-ternary": "warn",
            "consistent-return": "warn",
            "default-case": "warn",
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-func": "error",
            "no-script-url": "error",
            "no-self-compare": "error",
            "no-sequences": "error",
            "no-throw-literal": "error",
            "no-void": "error",
            "no-with": "error",
            radix: "error",
            "wrap-iife": ["error", "inside"],
            yoda: ["error", "never"],

            // Array and object best practices
            "array-callback-return": "error",
            "no-array-constructor": "error",
            "prefer-destructuring": [
                "warn",
                {
                    array: true,
                    object: true,
                },
            ],
            "object-shorthand": ["warn", "always"],
            "prefer-object-spread": "warn",

            // Function best practices
            "func-style": ["warn", "expression", { allowArrowFunctions: true }],
            "prefer-rest-params": "error",
            "prefer-spread": "error",

            // Modern JavaScript features
            "prefer-numeric-literals": "error",
            "symbol-description": "error",

            // import plugin: enable a few best-practice rules manually
            "import/order": [
                "off",
                {
                    alphabetize: {
                        order: "asc",
                    },
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    "newlines-between": "always",
                    distinctGroup: true,
                    sortTypesGroup: false,
                },
            ],
            "import/newline-after-import": "warn",
            // promise plugin: enable a few best-practice rules manually
            "promise/always-return": "warn",
            "promise/no-return-wrap": "warn",
            "promise/param-names": "warn",
            // unused-imports plugin
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
            // react
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/jsx-boolean-value": "warn",
            "react/self-closing-comp": "warn",
            // react-hooks
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            // jsx-a11y
            "jsx-a11y/alt-text": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            "jsx-a11y/no-autofocus": "warn",
            // prettier
            "prettier/prettier": [
                "error",
                {
                    usePrettierrc: true,
                },
            ],
            // sonarjs
            "sonarjs/no-duplicate-string": "warn",
            "sonarjs/no-identical-functions": "warn",
            // security
            "security/detect-object-injection": "warn",
            // eslint-comments
            "eslint-comments/no-unused-disable": "warn",
            "eslint-comments/no-unlimited-disable": "warn",
            // perfectionist
            "perfectionist/sort-objects": [
                "warn",
                {
                    type: "natural",
                    order: "asc",
                    fallbackSort: { type: "alphabetical", order: "asc" },
                    newlinesBetween: 1,
                },
            ],
            "perfectionist/sort-imports": [
                "warn",
                {
                    type: "natural",
                    order: "asc",
                    fallbackSort: { type: "alphabetical", order: "asc" },
                    newlinesBetween: 1,
                },
            ],
            // unicorn
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        kebabCase: true,
                        camelCase: true,
                        pascalCase: true,
                    },
                },
            ],
            "unicorn/no-abusive-eslint-disable": "warn",
            "unicorn/no-array-callback-reference": "warn",
            "unicorn/no-array-for-each": "warn",
            "unicorn/no-null": "warn",
            // functional
            "functional/immutable-data": "off",
            "functional/no-let": "warn",
            // regexp
            "regexp/no-dupe-characters-character-class": "warn",
            "regexp/no-empty-alternative": "warn",
            // tsdoc
            "tsdoc/syntax": "warn",
        },
    },
    // TypeScript files - Source (renderer) files
    {
        files: ["src/**/*.ts", "src/**/*.tsx", "vitest*.ts", "vite.config.ts"],
        ignores: ["tests/**", "**/__tests__/**", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
                ecmaVersion: "latest",
                tsconfigRootDir: __dirname,
            },
            globals: {
                ...globals.node,
                ...globals.browser,
                __dirname: "readonly",
                __filename: "readonly",
                process: "readonly",
                Buffer: "readonly",
                global: "readonly",
                window: "readonly",
                require: "readonly",
                module: "readonly",
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            import: pluginImport,
            promise: pluginPromise,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            "jsx-a11y": pluginJsxA11y,
            prettier: pluginPrettier,
            sonarjs: pluginSonarjs,
            security: pluginSecurity,
            "eslint-comments": pluginEslintComments,
            perfectionist: pluginPerfectionist,
            // new plugins
            unicorn: pluginUnicorn,
            functional: pluginFunctional,
            filenames: pluginFilenames,
            regexp: pluginRegexp,
            tsdoc: pluginTsdoc,
        },
        rules: {
            ...pluginImport.configs.recommended.rules,
            ...pluginImport.configs.react.rules,
            ...pluginImport.configs.electron.rules,
            ...pluginImport.configs.typescript.rules,
            ...pluginPromise.configs.recommended.rules,
            ...pluginReact.configs.all.rules,
            ...pluginReactHooks.configs.recommended.rules,
            ...pluginJsxA11y.configs.strict.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...pluginEslintComments.configs.recommended.rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginRegexp.configs.all.rules,
            ...pluginFunctional.configs.all.rules,
            ...tseslint.configs.recommendedTypeChecked.rules,
            ...tseslint.configs.strictTypeChecked.rules,
            ...tseslint.configs.stylisticTypeChecked.rules,
            // import plugin: enable a few best-practice rules manually
            "import/order": [
                "off",
                {
                    alphabetize: {
                        order: "asc",
                    },
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],

                    distinctGroup: true,
                    sortTypesGroup: false,
                },
            ],
            "import/newline-after-import": "warn",
            // promise plugin: enable a few best-practice rules manually
            "promise/always-return": "warn",
            "promise/no-return-wrap": "warn",
            "promise/param-names": "warn",
            // unused-imports plugin
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
            // react
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/jsx-boolean-value": "warn",
            "react/self-closing-comp": "warn",
            // react-hooks
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            // jsx-a11y
            "jsx-a11y/alt-text": "warn",
            "jsx-a11y/anchor-is-valid": "warn",
            "jsx-a11y/no-autofocus": "warn",
            // prettier
            "prettier/prettier": [
                "error",
                {
                    usePrettierrc: true,
                },
            ],
            // sonarjs
            "sonarjs/no-duplicate-string": "warn",
            "sonarjs/no-identical-functions": "warn",
            // security
            "security/detect-object-injection": "warn",
            // eslint-comments
            "eslint-comments/no-unused-disable": "warn",
            "eslint-comments/no-unlimited-disable": "warn",
            // perfectionist
            "perfectionist/sort-objects": [
                "warn",
                {
                    type: "natural",
                    order: "asc",
                    fallbackSort: { type: "alphabetical", order: "asc" },
                    newlinesBetween: 1,
                },
            ],
            "perfectionist/sort-imports": [
                "warn",
                {
                    type: "natural",
                    order: "asc",
                    fallbackSort: { type: "alphabetical", order: "asc" },
                    newlinesBetween: 1,
                },
            ],
            // unicorn
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        kebabCase: true,
                        camelCase: true,
                        pascalCase: true,
                    },
                },
            ],
            "unicorn/no-abusive-eslint-disable": "warn",
            "unicorn/no-array-callback-reference": "warn",
            "unicorn/no-array-for-each": "warn",
            "unicorn/no-null": "warn",
            // functional
            "functional/immutable-data": "off",
            "functional/no-let": "warn",
            // regexp
            "regexp/no-dupe-characters-character-class": "warn",
            "regexp/no-empty-alternative": "warn",
            // tsdoc
            "tsdoc/syntax": "warn",
        },
    },

    // TypeScript files - Electron (main process) files
    {
        files: ["electron/**/*.ts", "electron/**/*.tsx", "vitest.electron.config.ts"],
        ignores: ["electron/test/**/*.ts", "electron/**/*.test.{ts,tsx}", "electron/**/*.spec.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.electron.json",
                sourceType: "module",
                ecmaVersion: "latest",
                tsconfigRootDir: __dirname,
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
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            import: pluginImport,
            promise: pluginPromise,
            "unused-imports": pluginUnusedImports,
            prettier: pluginPrettier,
            sonarjs: pluginSonarjs,
            security: pluginSecurity,
            "eslint-comments": pluginEslintComments,
            perfectionist: pluginPerfectionist,
            // new plugins
            unicorn: pluginUnicorn,
            functional: pluginFunctional,
            filenames: pluginFilenames,
            regexp: pluginRegexp,
            tsdoc: pluginTsdoc,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylistic.rules,
            ...tseslint.configs.stylisticTypeChecked.rules,
            // import plugin: enable a few best-practice rules manually
            "import/order": [
                "off",
                {
                    alphabetize: {
                        order: "asc",
                    },
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],

                    distinctGroup: true,
                    sortTypesGroup: false,
                },
            ],
            "import/newline-after-import": "warn",
            // promise plugin: enable a few best-practice rules manually
            "promise/always-return": "warn",
            "promise/no-return-wrap": "warn",
            "promise/param-names": "warn",
            // unused-imports plugin
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
            // prettier
            "prettier/prettier": [
                "error",
                {
                    usePrettierrc: true,
                },
            ],
            // sonarjs
            "sonarjs/no-duplicate-string": "warn",
            "sonarjs/no-identical-functions": "warn",
            // security
            "security/detect-object-injection": "warn",
            // eslint-comments
            "eslint-comments/no-unused-disable": "warn",
            "eslint-comments/no-unlimited-disable": "warn",
            // perfectionist
            "perfectionist/sort-objects": [
                "warn",
                {
                    type: "natural",
                    order: "asc",
                    fallbackSort: { type: "alphabetical", order: "asc" },
                    newlinesBetween: 1,
                },
            ],
            "perfectionist/sort-imports": [
                "warn",
                {
                    type: "natural",
                    order: "asc",
                    fallbackSort: { type: "alphabetical", order: "asc" },
                    newlinesBetween: 1,
                },
            ],
            // unicorn
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        kebabCase: true,
                        camelCase: true,
                        pascalCase: true,
                    },
                },
            ],
            "unicorn/no-abusive-eslint-disable": "warn",
            "unicorn/no-array-callback-reference": "warn",
            "unicorn/no-array-for-each": "warn",
            "unicorn/no-null": "warn",
            // functional
            "functional/immutable-data": "off",
            "functional/no-let": "warn",
            // regexp
            "regexp/no-dupe-characters-character-class": "warn",
            "regexp/no-empty-alternative": "warn",
            // tsdoc
            "tsdoc/syntax": "warn",

            // Disable React-specific rules for electron (Node.js) files
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/jsx-boolean-value": "off",
            "react/self-closing-comp": "off",
            "react-hooks/rules-of-hooks": "off",
            "react-hooks/exhaustive-deps": "off",
            "jsx-a11y/alt-text": "off",
            "jsx-a11y/anchor-is-valid": "off",
            "jsx-a11y/no-autofocus": "off",
        },
    },

    // Electron Testing files - separate config to use different tsconfig
    {
        files: ["electron/test/**/*.{ts,tsx}", "electron/**/*.test.{ts,tsx}", "electron/**/*.spec.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.electron.test.json",
                sourceType: "module",
                ecmaVersion: "latest",
                tsconfigRootDir: __dirname,
            },
            globals: {
                ...globals.node,
                vi: "readonly",
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            vitest,
            "testing-library": pluginTestingLibrary,
            import: pluginImport,
            "unused-imports": pluginUnusedImports,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.recommended.rules,
            "testing-library/await-async-queries": "error",
            "testing-library/await-async-utils": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "warn",
            "testing-library/no-dom-import": "warn",
            "testing-library/prefer-screen-queries": "warn",
            "testing-library/prefer-user-event": "warn",
            "testing-library/render-result-naming-convention": "warn",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
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
        },
    },

    // Testing files (excluding electron tests which are handled separately)
    {
        files: [
            "tests/**",
            "**/__tests__/**",
            "**/*.test.{js,ts,jsx,tsx}",
            "**/*.spec.{js,ts,jsx,tsx}",
            "vitest*.{js,ts}",
            "src/test/**/*.{ts,tsx}",
        ],
        ignores: ["electron/test/**/*.{ts,tsx}", "electron/**/*.test.{ts,tsx}", "electron/**/*.spec.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                sourceType: "module",
                ecmaVersion: "latest",
            },
            globals: {
                ...globals.node,
                ...globals.browser,
                vi: "readonly",
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            vitest,
            "testing-library": pluginTestingLibrary,
            import: pluginImport,
            "unused-imports": pluginUnusedImports,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.recommended.rules,
            // testing-library rules
            "testing-library/await-async-queries": "error",
            "testing-library/await-async-utils": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "warn",
            "testing-library/no-dom-import": "warn",
            "testing-library/prefer-screen-queries": "warn",
            "testing-library/prefer-user-event": "warn",
            "testing-library/render-result-naming-convention": "warn",

            // Relax some rules for tests
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
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

            ...(vitestGlobals.configs.recommended.rules || {}),
        },
    },

    {
        files: [
            "**/__tests__/*.{j,t}s?(x)",
            "**/*.spec.{j,t}s?(x)",
            "tests/**/*",
            "vitest*.{j,t}s",
            "electron/test/**/*.{j,t}s",
            "src/test/**/*.{j,t}s",
        ],
        plugins: {
            "vitest-globals": vitestGlobals,
        },
        languageOptions: {
            // Removed 'env' key as it's not allowed here
            // If you need globals, set them directly:
            // globals: { ... }
        },
        // Remove 'extends' and spread the recommended config directly
    },

    // Global browser variables
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
];
