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

// import { plugin as ex } from "eslint-plugin-exception-handling";
// import eslintPluginNoInferred from "eslint-plugin-no-inferred-method-name";
// import stylistic from "@stylistic/eslint-plugin";
import depend from "eslint-plugin-depend";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginMath from "eslint-plugin-math";
import eslintPluginToml from "eslint-plugin-toml";
import globals from "globals";
import js from "@eslint/js";
import json from "@eslint/json";
import jsoncEslintParser from "jsonc-eslint-parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import markdown from "@eslint/markdown";
import nodePlugin from "eslint-plugin-n";
import nounsanitized from "eslint-plugin-no-unsanitized";
import pluginBoundaries from "eslint-plugin-boundaries";
import pluginCompat from "eslint-plugin-compat";
import pluginEslintComments from "eslint-plugin-eslint-comments";
import pluginFunctional from "eslint-plugin-functional";
import pluginImport from "eslint-plugin-import";
import pluginNoOnly from "eslint-plugin-no-only-tests";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
import pluginPromise from "eslint-plugin-promise";
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
import vitestGlobals from "eslint-plugin-vitest-globals";

import * as cssPlugin from "eslint-plugin-css";

const __dirname = import.meta.dirname;

export default [
    // Global ignores - must be first and more comprehensive
    {
        ignores: [
            "_ZENTASKS*",
            ".agentic-tools*",
            ".devskim.json",
            ".github/",
            ".jscpd.json",
            ".lintstagedrc.json",
            ".markdown-link-check.json",
            ".markdownlint.json",
            ".prettierrc.json",
            ".vscode/",
            "**/_ZENTASKS*",
            "**/.agentic-tools*",
            "**/.devskim.json",
            "**/.github/**",
            "**/.jscpd.json",
            "**/.lintstagedrc.json",
            "**/.markdown-link-check.json",
            "**/.markdownlint.json",
            "**/.prettierrc.json",
            "**/.vscode/**",
            "**/*.md",
            "**/chatproject.md",
            "**/commitlint.config.js",
            "**/coverage-results.json",
            "**/Coverage/**",
            "**/coverage/**",
            "**/cspell.json",
            "**/dist-electron/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/release/**",
            "**/stylelint.config.js",
            "**/test/themeTypes.test.tsx",
            "**/test/types.test.tsx",
            "**/tsconfig*.json",
            "commitlint.config.js",
            "Coverage/",
            "coverage/",
            "cspell.json",
            "dist-electron/",
            "dist/",
            "node_modules/**",
            "package-lock.json",
            "package.json",
            "release/",
            "stylelint.config.js",
            "test/themeTypes.test.tsx",
            "test/types.test.tsx",
            "tsconfig*.json",
            // "**/*.config.{js,mjs,ts}",
        ],
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
        files: ["**/*.json", "**/*.json5", "**/*.jsonc", "*.json", "*.json5", "*.jsonc"],
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

    // TypeScript frontend files (React + Zustand)
    {
        files: ["src/**/*.ts", "src/**/*.tsx", "shared/**/*.ts", "shared/**/*.tsx"],
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
                project: "./tsconfig.json",
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
            n: { allowModules: ["electron", "node", "electron-devtools-installer"] },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
                node: true,
                project: ["./tsconfig.json"],
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "eslint-comments": pluginEslintComments,
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
            pluginImport: pluginImport,
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
        },
        rules: {
            // TypeScript rules
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
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
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...tailwind.configs["flat/recommended"].rules,
            ...cssPlugin.configs["flat/standard"].rules,

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

            "unicorn/prefer-global-this": "off", // Not suitable for Electron
            "unicorn/prevent-abbreviations": "off", // Too many false positives
            // Core quality rules
            // "no-console": "warn", // Allow in development, but warn - DISABLED FOR NOW
            "consistent-return": "warn",
            "no-debugger": "error",
            "no-duplicate-imports": "error",
            "prefer-const": "error",
            "prefer-template": "warn",
            curly: ["error", "all"],
            eqeqeq: ["error", "always"],

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
            "react/jsx-uses-react": "off",
            "react/no-array-index-key": "warn",
            "react/no-unstable-nested-components": "error",
            "react/prop-types": "off",
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
                            allow: ["components", "stores", "hooks", "services", "theme", "utils", "types"],
                        },
                        {
                            from: "components",
                            allow: ["components", "hooks", "services", "theme", "utils", "types", "stores"],
                        },
                        { from: "hooks", allow: ["stores", "services", "types", "utils"] },
                        { from: "services", allow: ["types", "utils"] },
                        { from: "stores", allow: ["services", "types", "utils", "stores", "components"] },
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
                    disallowedPrefixes: ["interface", "type", "enum"],
                    checkProperties: false,
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-array-callback-reference": "off", // Conflicts with React
            "unicorn/no-array-for-each": "off", // forEach is fine
            "unicorn/no-negated-condition": "off", // Sometimes clearer
            "unicorn/prefer-includes": "warn",
            "unicorn/prefer-module": "off", // CommonJS needed for Electron
            "unicorn/prefer-node-protocol": "warn",
            "unicorn/prefer-string-slice": "warn",
            "unicorn/prefer-string-starts-ends-with": "warn",
            "unicorn/prefer-ternary": "off", // Can hurt readability
            "unicorn/prefer-top-level-await": "off", // Not suitable for React

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
            "security/detect-non-literal-regexp": "warn",
            "security/detect-object-injection": "warn",

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
        },
    },

    // Electron backend files
    {
        files: ["electron/**/*.ts", "shared/**/*.ts", "shared/**/*.tsx"],
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
                project: "./tsconfig.electron.json",
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
            n: { allowModules: ["electron", "node", "electron-devtools-installer"] },
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
                project: ["./tsconfig.electron.json"],
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "eslint-comments": pluginEslintComments,
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
            pluginImport: pluginImport,
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
        },
        rules: {
            // TypeScript backend rules
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
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
            ...nodePlugin.configs["flat/all"].rules,
            ...depend.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...tailwind.configs["flat/recommended"].rules,
            ...cssPlugin.configs["flat/standard"].rules,

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
                        { from: "main", allow: ["managers", "services", "utils", "events", "types"] },
                        { from: "managers", allow: ["services", "utils", "events", "types"] },
                        { from: "preload", allow: ["utils", "types"] },
                        { from: "services", allow: ["services", "utils", "types"] },
                        { from: "types", allow: [] },
                        { from: "utils", allow: ["managers", "services", "utils", "events", "types"] },
                        { from: "utils", allow: ["types"] },
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
                        camelCase: true,
                        pascalCase: true, // Service classes
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
            "redos/no-vulnerable": "error",
            "security/detect-non-literal-fs-filename": "error",
            "security/detect-non-literal-require": "error",
            "security/detect-object-injection": "error",

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
                project: "./tsconfig.test.json",
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
        },
        plugins: {
            "@typescript-eslint": tseslint,
            vitest,
            "vitest-globals": vitestGlobals,
            "testing-library": pluginTestingLibrary,
            pluginImport: pluginImport,
            "unused-imports": pluginUnusedImports,
            react: pluginReact,
            "react-hooks": pluginReactHooks,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "warn",
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
            "**/*.config.{js,mjs,ts}", // Configuration files
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
                project: "./tsconfig.electron.test.json",
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
            pluginImport: pluginImport,
            unicorn: pluginUnicorn,
            vitest: vitest,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...vitest.configs.recommended.rules,
            ...pluginUnicorn.configs.all.rules,

            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",

            "unicorn/no-keyword-prefix": "off", // Allow "class" prefix for className and other legitimate uses
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
    },

    // Global browser environment
    {
        languageOptions: {
            globals: globals.browser,
        },
        ignores: ["docs/docusaurus/**"],
    },
];
