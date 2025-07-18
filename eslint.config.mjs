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

import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import pluginImport from "eslint-plugin-import";
import pluginPromise from "eslint-plugin-promise";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginPrettier from "eslint-plugin-prettier";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginSecurity from "eslint-plugin-security";
import pluginEslintComments from "eslint-plugin-eslint-comments";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginFunctional from "eslint-plugin-functional";
import pluginRegexp from "eslint-plugin-regexp";
import pluginTsdoc from "eslint-plugin-tsdoc";
import pluginBoundaries from "eslint-plugin-boundaries";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
import pluginRedos from "eslint-plugin-redos";
import pluginCompat from "eslint-plugin-compat";
import vitest from "@vitest/eslint-plugin";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import vitestGlobals from "eslint-plugin-vitest-globals";
import globals from "globals";
import eslintPluginToml from "eslint-plugin-toml";
import tomlEslintParser from "toml-eslint-parser";
import jsoncEslintParser from "jsonc-eslint-parser";
import reactRefresh from "eslint-plugin-react-refresh";
import putout from "eslint-plugin-putout";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";

const __dirname = import.meta.dirname;

export default [
    // Global ignores - must be first and more comprehensive
    {
        ignores: [
            "**/node_modules/**",
            "node_modules/**",
            "**/dist/**",
            "dist/",
            "**/dist-electron/**",
            "dist-electron/",
            "**/release/**",
            "release/",
            "package.json",
            "package-lock.json",
            "**/.vscode/**",
            ".vscode/",
            "**/.github/**",
            ".github/",
            "**/commitlint.config.js",
            "commitlint.config.js",
            "**/stylelint.config.js",
            "stylelint.config.js",
            "**/*.config.{js,mjs,ts}",
            "*.config.{js,mjs,ts}",
            "**/tsconfig*.json",
            "tsconfig*.json",
            "**/Coverage/**",
            "Coverage/",
            "**/coverage/**",
            "coverage/",
            "**/.agentic-tools*",
            ".agentic-tools*",
            "**/_ZENTASKS*",
            "_ZENTASKS*",
            "**/test/themeTypes.test.tsx",
            "test/themeTypes.test.tsx",
            "**/test/types.test.tsx",
            "test/types.test.tsx",
            "**/.devskim.json",
            ".devskim.json",
            "**/.jscpd.json",
            ".jscpd.json",
            "**/.lintstagedrc.json",
            ".lintstagedrc.json",
            "**/.markdown-link-check.json",
            ".markdown-link-check.json",
            "**/.markdownlint.json",
            ".markdownlint.json",
            "**/.prettierrc.json",
            ".prettierrc.json",
            "**/cspell.json",
            "cspell.json",
            "**/chatproject.md",
            "**/coverage-results.json",
        ],
    },

    // Markdown files
    {
        files: ["**/*.md"],
        ...markdown.configs.recommended[0],
        plugins: { markdown },
        language: "markdown/gfm",
    },

    // JSON files
    {
        files: ["**/*.json", "**/*.json5", "**/*.jsonc"],
        ...json.configs.recommended[0],
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

    // TypeScript frontend files (React + Zustand)
    {
        files: ["src/**/*.ts", "src/**/*.tsx"],
        ignores: ["src/test/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
                ecmaVersion: "latest",
                tsconfigRootDir: __dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxPragma: "React",
                jsxFragmentName: "React.Fragment",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                window: "readonly",
                document: "readonly",
                globalThis: "readonly",
            },
        },
        settings: {
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
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["tsconfig.json", "tsconfig.electron.json"],
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            importPlugin: pluginImport,
            promise: pluginPromise,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            "jsx-a11y": jsxA11y,
            prettier: pluginPrettier,
            sonarjs: pluginSonarjs,
            security: pluginSecurity,
            "eslint-comments": pluginEslintComments,
            perfectionist: pluginPerfectionist,
            unicorn: pluginUnicorn,
            functional: pluginFunctional,
            boundaries: pluginBoundaries,
            "prefer-arrow": pluginPreferArrow,
            "sort-class-members": pluginSortClassMembers,
            redos: pluginRedos,
            compat: pluginCompat,
            tsdoc: pluginTsdoc,
            "react-refresh": reactRefresh,
            putout: putout,
            regexp: pluginRegexp,
        },
        rules: {
            // TypeScript rules
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/recommended"].rules,
            ...reactRefresh.configs.vite.rules,
            ...pluginImport.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginReact.configs.recommended.rules,
            ...pluginReactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.recommended.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginEslintComments.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,

            "putout/array-element-newline": "off",
            "putout/single-property-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/long-properties-destructuring": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/align-spaces": "error",
            "putout/newline-function-call-arguments": "off",
            "putout/function-declaration-paren-newline": "error",
            "putout/objects-braces-inside-array": "error",
            "putout/object-property-newline": "error",

            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "no-debugger": "error",
            "prefer-const": "error",
            "prefer-template": "warn",
            "no-duplicate-imports": "error",
            "consistent-return": "warn",
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],

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
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/jsx-boolean-value": "warn",
            "react/self-closing-comp": "warn",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-fragments": ["warn", "syntax"],
            "react/no-array-index-key": "warn",
            "react/jsx-key": "error",
            "react/no-unstable-nested-components": "error",

            // React Hooks
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

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
                            allow: ["components", "stores", "hooks", "services", "theme", "utils", "types"],
                        },
                        {
                            from: "components",
                            allow: ["components", "hooks", "services", "theme", "utils", "types", "stores"],
                        },
                        { from: "stores", allow: ["services", "types", "utils", "stores", "components"] },
                        { from: "hooks", allow: ["stores", "services", "types", "utils"] },
                        { from: "services", allow: ["types", "utils"] },
                        { from: "theme", allow: ["types"] },
                        { from: "utils", allow: ["types"] },
                        { from: "types", allow: [] },
                    ],
                },
            ],

            // Optimized Unicorn rules (reduced false positives)
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
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    disallowedPrefixes: ["interface", "type", "enum"],
                    checkProperties: false,
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/prefer-module": "off", // CommonJS needed for Electron
            "unicorn/prefer-top-level-await": "off", // Not suitable for React
            "unicorn/no-array-for-each": "off", // forEach is fine
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/no-negated-condition": "off", // Sometimes clearer
            "unicorn/prefer-node-protocol": "warn",
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",

            // Function style preferences - disabled as too aggressive
            // "prefer-arrow/prefer-arrow-functions": [
            //     "warn",
            //     {
            //         disallowPrototype: true,
            //         singleReturnOnly: false,
            //         classPropertiesAllowed: false,
            //     },
            // ],

            // Security
            "security/detect-object-injection": "warn",
            "security/detect-non-literal-regexp": "warn",

            // Performance and compatibility
            "compat/compat": "off", // Electron supports modern APIs, Opera Mini not a target

            // Code style
            "prettier/prettier": ["warn", { usePrettierrc: true }],

            // Documentation
            "tsdoc/syntax": "warn",

            // RegExp rules for security and performance
            "regexp/no-unused-capturing-group": "warn",
            "regexp/no-super-linear-backtracking": "error",
            "regexp/optimal-quantifier-concatenation": "warn",
            "regexp/prefer-character-class": "warn",
            "regexp/prefer-plus-quantifier": "warn",
            "regexp/prefer-star-quantifier": "warn",
            "regexp/no-potentially-useless-backreference": "warn",
            "regexp/no-useless-escape": "warn",
            "regexp/no-useless-quantifier": "warn",

            // Disable overly strict rules for this project
            "functional/immutable-data": "off",
            "functional/no-let": "off", // Let is necessary in many React patterns
            "@typescript-eslint/no-explicit-any": "warn", // Sometimes needed
            "@typescript-eslint/no-non-null-assertion": "warn", // Zustand patterns

            // Function and type safety rules
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
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/no-empty-object-type": "error",
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
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any
            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters

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
        },
    },

    // Electron backend files
    {
        files: ["electron/**/*.ts"],
        ignores: ["electron/test/**/*.ts", "electron/**/*.test.{ts,tsx}", "electron/**/*.spec.{ts,tsx}"],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                project: "./tsconfig.electron.json",
                sourceType: "module",
                ecmaVersion: "latest",
                tsconfigRootDir: __dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxPragma: "React",
                jsxFragmentName: "React.Fragment",
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
            "boundaries/elements": [
                { type: "main", pattern: "electron/main.ts" },
                { type: "preload", pattern: "electron/preload.ts" },
                { type: "managers", pattern: "electron/managers/**/*" },
                { type: "services", pattern: "electron/services/**/*" },
                { type: "utils", pattern: "electron/utils/**/*" },
                { type: "events", pattern: "electron/events/**/*" },
                { type: "types", pattern: "electron/types.ts" },
            ],
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["tsconfig.json", "tsconfig.electron.json"],
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            importPlugin: pluginImport,
            promise: pluginPromise,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            "jsx-a11y": jsxA11y,
            prettier: pluginPrettier,
            sonarjs: pluginSonarjs,
            security: pluginSecurity,
            "eslint-comments": pluginEslintComments,
            perfectionist: pluginPerfectionist,
            unicorn: pluginUnicorn,
            functional: pluginFunctional,
            boundaries: pluginBoundaries,
            "prefer-arrow": pluginPreferArrow,
            "sort-class-members": pluginSortClassMembers,
            redos: pluginRedos,
            compat: pluginCompat,
            tsdoc: pluginTsdoc,
            regexp: pluginRegexp,
            putout: putout,
        },
        rules: {
            // TypeScript backend rules
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs.strict.rules,
            ...tseslint.configs.stylistic.rules,
            ...pluginRegexp.configs["flat/recommended"].rules,
            ...pluginImport.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...pluginUnicorn.configs.all.rules,
            ...pluginReact.configs.recommended.rules,
            ...pluginReactHooks.configs["recommended-latest"].rules,
            ...jsxA11y.flatConfigs.recommended.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginEslintComments.configs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginBoundaries.configs.recommended.rules,
            ...pluginRedos.configs.recommended.rules,

            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            "unicorn/no-null": "off", // Null is common in SQLite and IPC
            // Node.js specific
            // "no-console": "off", // Logging is important for backend - DISABLED FOR NOW
            "prefer-const": "error",
            "no-var": "error",

            "putout/array-element-newline": "off",
            "putout/single-property-destructuring": "off",
            "putout/multiple-properties-destructuring": "off",
            "putout/long-properties-destructuring": "off",
            "putout/destructuring-as-function-argument": "off",
            "putout/align-spaces": "error",
            "putout/newline-function-call-arguments": "off",
            "putout/function-declaration-paren-newline": "error",
            "putout/objects-braces-inside-array": "error",
            "putout/object-property-newline": "error",

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
                        { from: "main", allow: ["managers", "services", "utils", "events", "types"] },
                        { from: "preload", allow: ["utils", "types"] },
                        { from: "managers", allow: ["services", "utils", "events", "types"] },
                        { from: "services", allow: ["services", "utils", "types"] },
                        { from: "utils", allow: ["types"] },
                        { from: "events", allow: ["types"] },
                        { from: "types", allow: [] },
                        { from: "utils", allow: ["managers", "services", "utils", "events", "types"] },
                    ],
                },
            ],

            // Class organization for service classes
            "sort-class-members/sort-class-members": [
                "off",
                {
                    order: [
                        "[static-properties]",
                        "[static-methods]",
                        "[properties]",
                        "constructor",
                        "[methods]",
                        "[private-methods]",
                    ],
                },
            ],

            // Backend-specific unicorn rules
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        pascalCase: true, // Service classes
                        camelCase: true,
                    },
                },
            ],
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    disallowedPrefixes: ["interface", "type", "enum"],
                    checkProperties: false,
                },
            ],
            "unicorn/prefer-module": "off", // CommonJS required for Electron
            "unicorn/prefer-node-protocol": "error", // Enforce for backend
            "unicorn/prefer-top-level-await": "off", // Not suitable for Electron main

            // Security for backend
            "security/detect-object-injection": "error",
            "security/detect-non-literal-require": "error",
            "security/detect-non-literal-fs-filename": "error",
            "redos/no-vulnerable": "error",

            // Documentation
            "tsdoc/syntax": "warn",

            // Allow more flexibility for backend patterns
            "functional/immutable-data": "off",
            "functional/prefer-immutable-types": "off",
            "functional/no-expression-statements": "off",
            "functional/no-conditional-statement": "off",
            "functional/no-loop-statements": "off",
            "functional/no-return-void": "off",
            "functional/no-conditional-statements": "off",
            "functional/functional-parameters": "off",
            "functional/no-let": "off",
            "functional/no-classes": "off", // Classes are common in Electron services
            "functional/no-throw-statements": "off", // Throwing errors is common in Electron
            "functional/no-class-inheritance": "off", // Classes are common in Electron services
            "functional/no-mixed-types": "off", // Mixed types are common in Electron services
            "@typescript-eslint/no-explicit-any": "warn",

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
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/no-empty-object-type": "error",
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
                    checksVoidReturn: true, // Critical for Electron IPC handlers
                    checksSpreads: true, // Check Promise spreads
                },
            ],
            "@typescript-eslint/require-await": "error", // Functions marked async must use await
            "@typescript-eslint/return-await": ["error", "in-try-catch"], // Proper await handling in try-catch

            // Enhanced type safety for backend services
            "@typescript-eslint/no-unnecessary-type-assertion": "error", // Remove redundant type assertions
            "@typescript-eslint/no-unsafe-assignment": "warn", // Warn on unsafe assignments to any
            "@typescript-eslint/no-unsafe-call": "warn", // Warn on calling any-typed functions
            "@typescript-eslint/no-unsafe-member-access": "warn", // Warn on accessing any-typed properties
            "@typescript-eslint/no-unsafe-return": "warn", // Warn on returning any from typed functions
            "@typescript-eslint/no-unsafe-argument": "warn", // Warn on passing any to typed parameters

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
        },
    },

    // Test files (Frontend)
    {
        files: ["src/test/**/*.{ts,tsx}", "src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
                ecmaVersion: "latest",
                tsconfigRootDir: __dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxPragma: "React",
                jsxFragmentName: "React.Fragment",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.browser,
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
        settings: {
            react: { version: "19" },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            vitest,
            "vitest-globals": vitestGlobals,
            "testing-library": pluginTestingLibrary,
            importPlugin: pluginImport,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": pluginReactHooks,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.recommended.rules,
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "warn",
            "testing-library/prefer-screen-queries": "warn",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",

            // Relaxed function rules for tests (explicit for clarity)
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
        },
    },

    // Test files (Backend)
    {
        files: ["electron/test/**/*.{ts,tsx}", "electron/**/*.test.{ts,tsx}", "electron/**/*.spec.{ts,tsx}"],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                project: "./tsconfig.electron.test.json",
                sourceType: "module",
                ecmaVersion: "latest",
                tsconfigRootDir: __dirname,
                ecmaFeatures: {
                    jsx: true,
                },
                experimentalDecorators: true,
                JSDocParsingMode: "all",
                jsxPragma: "React",
                jsxFragmentName: "React.Fragment",
                warnOnUnsupportedTypeScriptVersion: true,
            },
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
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
            "@typescript-eslint": tseslint,
            vitest,
            importPlugin: pluginImport,
            "unused-imports": pluginUnusedImports,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",

            // Relaxed function rules for backend tests (explicit for clarity)
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
        },
    },

    // Global browser environment
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
];
