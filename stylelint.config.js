/**
 * Stylelint configuration for the Uptime Watcher project.
 * Enforces CSS/SCSS coding standards and best practices.
 *
 * Extends stylelint-config-standard which provides sensible defaults
 * for CSS property order, formatting, and modern CSS practices.
 */
/** @type {import('stylelint').Config} */

/* eslint-disable unicorn/prefer-module -- Needed for Stylelint */

module.exports = {
    "$schema": "https://www.schemastore.org/stylelintrc.json",
    extends: [
        "stylelint-config-standard",
        "@stylistic/stylelint-config",
        "stylelint-config-tailwindcss",
        "stylelint-config-recess-order",
        "stylelint-prettier/recommended",
    ],
    plugins: ["stylelint-plugin-defensive-css", "stylelint-use-nesting", "stylelint-prettier"],
    rules: {
        "@stylistic/declaration-colon-newline-after": null,
        "@stylistic/indentation": null,
        "csstools/use-nesting": "always",
        "plugin/use-defensive-css": [true, { severity: "warning" }],
        "prettier/prettier": true,
    },
};
