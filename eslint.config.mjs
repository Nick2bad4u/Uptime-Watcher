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

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: pluginJs.configs.recommended,
});

export default [
    {
        ignores: ["node_modules/", "dist/", "dist-electron/", "release/", "package.json", "package-lock.json"],
    },
    // Markdown files
    {
        files: ["**/*.md"],
        plugins: { markdown },
        processor: markdown.processors.markdown,
    },
    // JSON files
    {
        files: ["**/*.json"],
        plugins: { json },
        rules: { ...json.configs.recommended.rules },
    },
    // JS files
    {
        files: ["**/*.js"],
        languageOptions: { sourceType: "script" },
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
            // perfectionist: pluginPerfectionist // temporarily disabled
        },
        rules: {
            ...js.configs.recommended.rules,
            // import plugin: enable a few best-practice rules manually
            // "import/order": [
            //     "warn",
            //     {
            //         alphabetize: { order: "asc" },
            //         groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            //     },
            // ],
            // "import/newline-after-import": "warn",
            // promise plugin: enable a few best-practice rules manually
            "promise/always-return": "warn",
            "promise/no-return-wrap": "warn",
            "promise/param-names": "warn",
            // unused-imports plugin
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
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
            "prettier/prettier": "warn",
            // sonarjs
            "sonarjs/no-duplicate-string": "warn",
            "sonarjs/no-identical-functions": "warn",
            // security
            "security/detect-object-injection": "warn",
            // eslint-comments
            "eslint-comments/no-unused-disable": "warn",
            "eslint-comments/no-unlimited-disable": "warn",
            // perfectionist
            // 'perfectionist/sort-objects': ['warn', { type: 'natural', order: 'asc' }],
            // 'perfectionist/sort-imports': ['warn', { type: 'natural', order: 'asc' }]
        },
    },
    // TypeScript files
    {
        files: ["**/*.ts", "**/*.tsx"],
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
            // perfectionist: pluginPerfectionist // temporarily disabled
        },
        rules: {
            // import plugin: enable a few best-practice rules manually
            // "import/order": [
            //     "warn",
            //     {
            //         alphabetize: { order: "asc" },
            //         groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            //     },
            // ],
            // "import/newline-after-import": "warn",
            // promise plugin: enable a few best-practice rules manually
            "promise/always-return": "warn",
            "promise/no-return-wrap": "warn",
            "promise/param-names": "warn",
            // unused-imports plugin
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
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
            "prettier/prettier": "warn",
            // sonarjs
            "sonarjs/no-duplicate-string": "warn",
            "sonarjs/no-identical-functions": "warn",
            // security
            "security/detect-object-injection": "warn",
            // eslint-comments
            "eslint-comments/no-unused-disable": "warn",
            "eslint-comments/no-unlimited-disable": "warn",
            // perfectionist
            // 'perfectionist/sort-objects': ['warn', { type: 'natural', order: 'asc' }],
            // 'perfectionist/sort-imports': ['warn', { type: 'natural', order: 'asc' }]
        },
    },
    // Global browser variables
    { languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,
];
