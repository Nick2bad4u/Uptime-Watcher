import nick2bad4u from "eslint-config-nick2bad4u";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import tailwind from "eslint-plugin-tailwindcss";

import uptimeWatcherPlugin from "./config/linting/plugins/uptime-watcher.mjs";

const sharedConfig = nick2bad4u.configs.all.map((config) => {
    if (!config.rules?.["unicorn/logical-assignment-operators"]) {
        return config;
    }

    return {
        ...config,
        rules: {
            ...config.rules,
            // eslint-plugin-unicorn 64 exposes an invalid schema for this rule
            // under ESLint 10. Keep the shared preset usable until upstream fixes it.
            "unicorn/logical-assignment-operators": "off",
        },
    };
});

const uptimeWatcherRepoConfigs = uptimeWatcherPlugin.configs?.repo ?? [];

const testFiles = [
    "**/*.{test,spec}.{js,jsx,ts,tsx,cts,mts}",
    "**/test/**/*.{js,jsx,ts,tsx,cts,mts}",
    "**/tests/**/*.{js,jsx,ts,tsx,cts,mts}",
    "**/strictTests/**/*.{js,jsx,ts,tsx,cts,mts}",
    "playwright/**/*.{js,jsx,ts,tsx,cts,mts}",
    "storybook/**/*.{js,jsx,ts,tsx,cts,mts}",
    "**/*.stories.{js,jsx,ts,tsx,cts,mts}",
];

/** @type {import("eslint").Linter.Config[]} */
const config = [
    {
        ignores: [
            "benchmarks/**/*.ts",
            "config/testing/vitest.zero-coverage.config.ts",
            "config/tools/knip.config.ts",
            "electron-builder.config.ts",
            "eslint.config.mjs",
            "playwright.config.ts",
            "postcss.config.mjs",
            "prettier.config.mjs",
            "stryker.config.mjs",
            "stylelint.config.mjs",
            "tailwind.config.mjs",
            "tests/strictTests/**/*.ts",
            "tests/tooling/**/*.ts",
            "vite*.config.ts",
            "vitest*.config.ts",
        ],
        name: "Uptime Watcher: files checked outside ESLint",
    },
    ...sharedConfig,
    ...uptimeWatcherRepoConfigs,
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Uptime Watcher: Tailwind plugin wiring",
        plugins: {
            "better-tailwindcss": betterTailwindcss,
            tailwind,
        },
        rules: {
            // Keep these locally wired, but do not introduce new Tailwind lint
            // failures as part of the shared-config migration.
            "better-tailwindcss/multiline": "off",
            "better-tailwindcss/sort-classes": "off",
            "tailwind/classnames-order": "off",
            "tailwind/enforces-negative-arbitrary-values": "off",
            "tailwind/enforces-shorthand": "off",
            "tailwind/migration-from-tailwind-2": "off",
            "tailwind/no-arbitrary-value": "off",
            "tailwind/no-contradicting-classname": "off",
            "tailwind/no-custom-classname": "off",
        },
    },
    {
        files: ["**/*"],
        name: "Uptime Watcher: dedicated tool lint ownership",
        rules: {
            // These checks run through their own repo scripts with their own
            // config files. Running them inside ESLint duplicates failures and
            // has already caused actionlint worker timeouts on this repo.
            "actionlint/actionlint": "off",
            "remark/remark": "off",
            "stylelint-2/stylelint": "off",
            "tombi/tombi": "off",
            "yamllint/yamllint": "off",
            "css/no-invalid-properties": "off",
            "css/use-baseline": "off",
        },
    },
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Uptime Watcher: repo compatibility overrides",
        rules: {
            // The repo intentionally uses PascalCase component/class files and
            // existing camelCase module names; renaming all files would be a
            // broad source migration rather than lint cleanup.
            "unicorn/filename-case": "off",

            // These ordering rules create large churn and can subtly affect
            // declaration/class field order. Keep import/member linting where it
            // is useful, but do not let mechanical ordering dominate app code.
            "@typescript-eslint/member-ordering": "off",
            "perfectionist/sort-classes": "off",
            "perfectionist/sort-modules": "off",
            "perfectionist/sort-objects": "off",
            "unicorn/consistent-class-member-order": "off",

            // These shared-preset rules are too noisy for this Electron/React
            // app and do not map to current repo conventions.
            "@typescript-eslint/init-declarations": "off",
            "@typescript-eslint/class-methods-use-this": "off",
            "@typescript-eslint/no-misused-spread": "off",
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "canonical/no-use-extend-native": "off",
            "comment-length/limit-single-line-comments": "off",
            "func-name-matching": "off",
            "module-interop/no-require-esm": "off",
            "no-duplicate-imports": "off",
            "no-promise-executor-return": "off",
            "no-plusplus": "off",
            "no-underscore-dangle": "off",
            "n/no-process-env": "off",
            "n/no-sync": "off",
            "n/no-unsupported-features/node-builtins": "off",
            "json-schema-validator-2/no-invalid": "off",
            "react-x/static-components": "off",
            "sql-template/no-unsafe-query": "off",
            "import-x/max-dependencies": "off",
            "perfectionist/sort-arrays": "off",
            "perfectionist/sort-imports": "off",
            "perfectionist/sort-interfaces": "off",
            "perfectionist/sort-jsx-props": "off",
            "perfectionist/sort-named-imports": "off",
            "perfectionist/sort-object-types": "off",
            "perfectionist/sort-switch-case": "off",
            "perfectionist/sort-union-types": "off",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "off",
            "tsdoc/syntax": "off",
            "typefest/prefer-type-fest-json-value": "off",
            "typefest/prefer-type-fest-unknown-record": "off",
            "typefest/prefer-ts-extras-array-at": "off",
            "typefest/prefer-ts-extras-array-first": "off",
            "typefest/prefer-ts-extras-array-includes": "off",
            "typefest/prefer-ts-extras-is-defined": "off",
            "typefest/prefer-ts-extras-object-keys": "off",
            "typefest/prefer-ts-extras-safe-cast-to": "off",
            "typefest/prefer-ts-extras-string-split": "off",
            "unicorn/consistent-boolean-name": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/comment-content": "off",
            "zod/prefer-string-schema-with-trim": "off",
            "unicorn/max-nested-calls": "off",
            "unicorn/no-break-in-nested-loop": "off",
            "unicorn/no-computed-property-existence-check": "off",
            "unicorn/no-error-property-assignment": "off",
            "unicorn/no-global-object-property-assignment": "off",
            "unicorn/no-non-function-verb-prefix": "off",
            "unicorn/no-this-outside-of-class": "off",
            "unicorn/no-unreadable-new-expression": "off",
            "unicorn/prefer-includes-over-repeated-comparisons": "off",
            "unicorn/prefer-iterator-to-array": "off",
            "unicorn/prefer-global-number-constants": "off",
            "unicorn/prefer-math-constants": "off",
            "unicorn/prefer-number-coercion": "off",
            "unicorn/prefer-number-is-safe-integer": "off",
            "unicorn/prefer-await": "off",
            "unicorn/prefer-temporal": "off",
            "unicorn/try-complexity": "off",
            "runtime-cleanup/no-floating-abort-controllers": "off",
            "runtime-cleanup/no-unmanaged-event-listeners": "off",
            "typedoc/require-exported-doc-comment": "off",
            "tsdoc-require-2/require": "off",
        },
    },
    {
        files: ["config/linting/plugins/uptime-watcher/**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
        name: "Uptime Watcher: custom ESLint rule AST compatibility",
        rules: {
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-enum-comparison": "off",
            "max-lines-per-function": "off",
            "unicorn/no-top-level-side-effects": "off",
        },
    },
    {
        files: testFiles,
        name: "Uptime Watcher: existing test-suite compatibility",
        rules: {
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/consistent-type-imports": "off",
            "@typescript-eslint/await-thenable": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-shadow": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/strict-void-return": "off",
            "@typescript-eslint/unbound-method": "off",
            "test-signal/no-conditional-assertions": "off",
            "test-signal/no-constant-assertions": "off",
            "test-signal/no-duplicate-assertions": "off",
            "test-signal/no-fixed-delay-tests": "off",
            "test-signal/no-identical-expected-actual": "off",
            "test-signal/no-mock-call-only-tests": "off",
            "test-signal/no-try-catch-assertions": "off",
            "test-signal/require-error-message-assertions": "off",
            "test-signal/no-weak-existence-assertions": "off",
            "test-signal/no-weak-truthy-assertions": "off",
            "test-signal/require-negative-path": "off",
            "testing-library/no-node-access": "off",
            "testing-library/no-test-id-queries": "off",
            "testing-library/prefer-implicit-assert": "off",
            "testing-library/prefer-user-event": "off",
            "@eslint-react/dom-no-missing-button-type": "off",
            "@eslint-react/jsx-no-children-prop": "off",
            "import-x/no-unassigned-import": "off",
            "import-x/no-unresolved": "off",
            "max-lines-per-function": "off",
            "no-await-in-loop": "off",
            "no-console": "off",
            "runtime-cleanup/no-floating-timers": "off",
            "runtime-cleanup/no-unmanaged-event-listeners": "off",
            "unicorn/no-top-level-assignment-in-function": "off",
            "unicorn/no-unused-properties": "off",
            "uptime-watcher/no-regexp-v-flag": "off",
            "playwright/max-expects": "off",
            "playwright/require-soft-assertions": "off",
            "vitest/consistent-test-it": "off",
            "vitest/max-expects": "off",
            "vitest/no-conditional-expect": "off",
            "vitest/no-conditional-in-test": "off",
            "vitest/no-hooks": "off",
            "vitest/no-standalone-expect": "off",
            "vitest/padding-around-all": "off",
            "vitest/padding-around-expect-groups": "off",
            "vitest/prefer-called-with": "off",
            "vitest/prefer-expect-assertions": "off",
            "vitest/prefer-expect-type-of": "off",
            "vitest/prefer-import-in-mock": "off",
            "vitest/prefer-lowercase-title": "off",
            "vitest/prefer-strict-boolean-matchers": "off",
            "vitest/prefer-strict-equal": "off",
            "vitest/require-to-throw-message": "off",
            "vitest/require-top-level-describe": "off",
            "vitest/require-mock-type-parameters": "off",
        },
    },
];

export default config;
