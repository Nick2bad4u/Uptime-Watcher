/**
 * Stylelint configuration for the Uptime Watcher project. Enforces modern CSS
 * coding standards, logical properties, OKLCH colors, and best practices.
 *
 * Extends stylelint-config-standard which provides sensible defaults for CSS
 * property order, formatting, and modern CSS practices.
 */
/** @type {import("stylelint").Config} */

export default {
    extends: [
        "stylelint-config-standard",
        "@stylistic/stylelint-config",
        "stylelint-config-tailwindcss",
        "stylelint-config-recess-order",
        "stylelint-prettier/recommended",
    ],
    plugins: [
        "stylelint-plugin-defensive-css",
        "stylelint-plugin-logical-css",
        "stylelint-gamut",
        "stylelint-use-nesting",
        "stylelint-prettier",
    ],
    rules: {
        "@stylistic/declaration-colon-newline-after": null,
        "@stylistic/indentation": null,
        
        // Disable problematic rules that cause false positives with modern CSS
        "at-rule-descriptor-no-unknown": null,
        "at-rule-descriptor-value-no-unknown": null,
        "at-rule-prelude-no-invalid": null,
        
        "color-function-notation": "modern",
        "csstools/use-nesting": "always",
        "gamut/color-no-out-gamut-range": true,
        
        // Modern logical CSS properties for better i18n support
        "plugin/use-defensive-css": [true, { severity: "warning" }],
        "plugin/use-logical-properties-and-values": [
            true, 
            { 
                // Ignore some properties that don't have good logical equivalents yet
                ignore: ["overflow-y", "overflow-x", "resize"],
                severity: "warning",
            }
        ],
        "plugin/use-logical-units": [
            true, 
            { 
                // Keep some viewport units for compatibility
                ignore: ["dvh", "dvw", "svh", "svw"],
                severity: "warning",
            }
        ],

        // Prettier integration
        "prettier/prettier": true,
    },
};
