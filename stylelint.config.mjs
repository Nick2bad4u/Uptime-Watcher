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
        "stylelint-config-recess-order",
        "stylelint-config-idiomatic-order",
        "stylelint-config-standard-scss",
        "stylelint-config-tailwindcss",
    ],
    plugins: [
        "stylelint-plugin-defensive-css",
        "stylelint-plugin-logical-css",
        "stylelint-gamut",
        "stylelint-use-nesting",
        "stylelint-prettier",
        "stylelint-high-performance-animation",
        // "stylelint-a11y", // Disabled: Not supported in Stylelint 16. See https://github.com/YozhikM/stylelint-a11y/issues/186 for future updates or consider using postcss-a11y or other accessibility tools.
        // "stylelint-csstree-validator", // Disabled due to media query parsing issues: see https://github.com/csstree/stylelint-validator/issues/27 for details and future updates.
        "stylelint-order",
        "stylelint-declaration-block-no-ignored-properties",
        "stylelint-declaration-strict-value",
        // "stylelint-no-indistinguishable-colors", // Disabled: Tailwind intentionally uses subtle color variations for design flexibility, which may reduce strict color distinguishability. Accessibility concerns (e.g., sufficient contrast) should be addressed via design review and dedicated contrast checking tools rather than enforced by this rule.
        // "stylelint-value-no-unknown-custom-properties", - No Tailwind Support
        "stylelint-group-selectors",
    ],
    rules: {
        // Disable unknown at-rules to prevent conflicts with modern CSS features and build tools
        "at-rule-no-unknown": null,
        // Color rules
        "color-function-notation": "modern",

        // "a11y/media-prefers-reduced-motion": true, -- no Stylelint 16 Support
        // "a11y/no-outline-none": true,
        // "a11y/selector-pseudo-class-focus": true,

        "color-named": "never",
        // CSS nesting and tools
        "csstools/use-nesting": "always",

        // Declaration rules
        "declaration-no-important": true,

        // "csstools/value-no-unknown-custom-properties": true, // Disabled: Tailwind's dynamic class generation and custom properties are not compatible with this rule. See https://github.com/tailwindlabs/tailwindcss/issues/9602 for details.

        "declaration-property-value-no-unknown": true,
        // Font rules
        "font-weight-notation": "numeric",

        // Function rules (security and best practices)
        "function-linear-gradient-no-nonstandard-direction": true,

        "function-url-no-scheme-relative": true,
        // Color gamut validation
        "gamut/color-no-out-gamut-range": true,

        // Layout and structure
        "max-nesting-depth": 4,

        "no-unknown-animations": true,
        "plugin/declaration-block-no-ignored-properties": true,

        "plugin/no-low-performance-animation-properties": [
            true,
            {
                ignoreProperties: [
                    "all",
                    "background",
                    "box-shadow",
                    "border-color",
                    "outline",
                    "inline-size",
                    "inset-inline-start",
                    "block-size",
                    "color",
                ],
            },
        ],
        // Plugin rules
        "plugin/stylelint-group-selectors": true,
        "plugin/use-defensive-css": [
            true,
            {
                "background-repeat": true,
                "flex-wrapping": false,
                "scroll-chaining": true,
                "scrollbar-gutter": true,
                "vendor-prefix-grouping": true,
            },
        ],
        "plugin/use-logical-properties-and-values": [
            true,
            { severity: "warning" },
        ],
        "plugin/use-logical-units": [true, { severity: "warning" }],
        // Prettier integration
        "prettier/prettier": true,

        "scss/at-rule-no-unknown": null,

        // Selector rules (specificity management)
        "selector-max-id": 1,
        "selector-max-specificity": "0,4,1",

        /* eslint-disable sonarjs/todo-tag */
        // @todo: Will re-enable for theming eventually
        // "scale-unlimited/declaration-strict-value": [
        //     ["/color$/", "z-index", "font-size"]
        // ],
    },
};
