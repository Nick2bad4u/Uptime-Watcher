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
        "stylelint-react-native",
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
        "react-native/css-property-no-unknown": null,
        "react-native/font-weight-no-ignored-values": null,
        "react-native/style-property-no-unknown:": null,
        "plugin/use-defensive-css": [true, { severity: "warning" }],
        "csstools/use-nesting": "always" || "ignore",
        "prettier/prettier": true,
    },
};
