/**
 * Stylelint configuration for the Uptime Watcher project.
 * Enforces CSS/SCSS coding standards and best practices.
 *
 * Extends stylelint-config-standard which provides sensible defaults
 * for CSS property order, formatting, and modern CSS practices.
 */
/** @type {import('stylelint').Config} */
module.exports = {
    plugins: [
        "stylelint-plugin-defensive-css",
        "stylelint-use-nesting",
        "stylelint-prettier",
    ],
    extends: [
        "stylelint-config-standard",
        "@stylistic/stylelint-config",
        "stylelint-config-tailwindcss",
        "stylelint-config-recess-order",
        "stylelint-prettier/recommended",
    ],
    rules: {
        "@stylistic/indentation": null,
        "@stylistic/declaration-colon-newline-after": null,
        "plugin/use-defensive-css": [true, { severity: "warning" }],
        "csstools/use-nesting": "always",
        "prettier/prettier": true,
    },
};
