/**
 * Stylelint configuration for the Uptime Watcher project. Enforces modern CSS
 * coding standards, logical properties, OKLCH colors, and best practices.
 *
 * Extends stylelint-config-standard which provides sensible defaults for CSS
 * property order, formatting, and modern CSS practices.
 *
 * Now includes comprehensive support for:
 *
 * - HTML files with inline CSS
 * - TypeScript/JavaScript React components with CSS-in-JS
 * - Styled JSX components
 * - CSS Modules
 * - SCSS/Sass files
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
    // Override configurations for different file types
    overrides: [
        {
            // HTML files with inline CSS
            customSyntax: "postcss-html",
            files: ["**/*.html"],
            rules: {
                // Relax some rules for inline CSS in HTML
                "declaration-no-important": null,
                "max-nesting-depth": null,
                "selector-max-id": null,
                "selector-max-specificity": null,
            },
        },
        {
            // TypeScript and JavaScript React files with CSS-in-JS
            customSyntax: "postcss-styled-syntax",
            files: ["**/*.{tsx,jsx,ts,js}"],
            rules: {
                // Rules specific to CSS-in-JS
                "at-rule-no-unknown": null,
                "declaration-no-important": null,
                // Allow CSS-in-JS specific patterns
                "function-name-case": null,
                "max-nesting-depth": null,
                "selector-max-id": null,
                "selector-max-specificity": null,
                "value-keyword-case": null,
            },
        },
        {
            // Styled JSX files
            customSyntax: "postcss-styled-jsx",
            files: ["**/*.{jsx,tsx}"],
            rules: {
                // Rules for styled-jsx syntax
                "at-rule-no-unknown": null,
                "declaration-no-important": null,
                "max-nesting-depth": null,
                "selector-max-id": null,
                "selector-max-specificity": null,
            },
        },
        {
            // CSS modules
            files: ["**/*.module.{css,scss,sass}"],
            rules: {
                // CSS modules have local scope, so relax some global rules
                "selector-class-pattern": null,
                "selector-id-pattern": null,
            },
        },
        {
            // SCSS files
            customSyntax: "postcss-scss",
            files: ["**/*.{scss,sass}"],
            rules: {
                // SCSS specific rules
                "at-rule-no-unknown": null,
                "scss/at-rule-no-unknown": true,
            },
        },
    ],
    plugins: [
        // Core functional plugins
        "stylelint-plugin-defensive-css",
        "stylelint-plugin-logical-css",
        "stylelint-gamut",
        "stylelint-use-nesting",
        "stylelint-prettier",
        "stylelint-high-performance-animation",

        // Modern CSS and Standards plugins
        "@stylistic/stylelint-plugin", // Styling rules removed in Stylelint 16
        "stylelint-scales", // Enforce numeric value scales
        "stylelint-media-use-custom-media", // Enforce custom media queries
        "stylelint-plugin-use-baseline", // Enforce CSS features in baseline
        "stylelint-no-restricted-syntax", // Disallow restricted syntax patterns
        "stylelint-value-no-unknown-custom-properties", // Validate custom properties
        "stylelint-no-unresolved-module", // Check for unresolved imports/urls
        "stylelint-selector-bem-pattern", // BEM pattern enforcement

        // Utility plugins
        "stylelint-order",
        "stylelint-declaration-block-no-ignored-properties",
        "stylelint-declaration-strict-value",
        "stylelint-group-selectors",

        // Disabled plugins with reasons:
        // "stylelint-a11y", // Disabled: Not supported in Stylelint 16. See https://github.com/YozhikM/stylelint-a11y/issues/186 for future updates or consider using postcss-a11y or other accessibility tools.
        // "stylelint-csstree-validator", // Disabled due to media query parsing issues: see https://github.com/csstree/stylelint-validator/issues/27 for details and future updates.
        // "stylelint-no-indistinguishable-colors", // Disabled: Tailwind intentionally uses subtle color variations for design flexibility, which may reduce strict color distinguishability. Accessibility concerns (e.g., sufficient contrast) should be addressed via design review and dedicated contrast checking tools rather than enforced by this rule.
    ],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    reportUnscopedDisables: true,
    rules: {
        // Modern CSS and Standards plugin rules (alphabetically ordered)
        "@stylistic/color-hex-case": "lower",
        // "@stylistic/declaration-colon-space-after": "always", // Disabled: Too many issues (16 violations)
        "@stylistic/declaration-colon-space-before": "never",
        // "@stylistic/function-comma-space-after": "always", // Disabled: Too many issues (68 violations)
        // "@stylistic/indentation": 2, // Disabled: Too many issues (1870 violations)
        "@stylistic/string-quotes": "double",

        // Disable unknown at-rules to prevent conflicts with modern CSS features and build tools
        "at-rule-no-unknown": null,

        // Color rules
        "color-function-notation": "modern",
        "color-named": "never",
        "color-no-invalid-hex": true, // Disallow invalid hex colors like #xyz or #1234567 (verified working)

        // CSS nesting and tools
        "csstools/use-nesting": "always",

        // Declaration rules
        "declaration-no-important": true,

        "declaration-property-value-no-unknown": true,

        // Font rules
        "font-weight-notation": "numeric",

        // Function rules (security and best practices)
        "function-linear-gradient-no-nonstandard-direction": true,
        "function-url-no-scheme-relative": true,

        // Color gamut validation
        "gamut/color-no-out-gamut-range": true,

        // Length rules
        "length-zero-no-unit": true, // Disallow units for zero lengths (0px -> 0) (verified working)

        // "a11y/media-prefers-reduced-motion": true, -- no Stylelint 16 Support
        // "a11y/no-outline-none": true,
        // "a11y/selector-pseudo-class-focus": true,

        // Layout and structure
        "max-nesting-depth": 4,
        // "media-use-custom-media": [ // Disabled: Rule causing issues
        //     "always",
        //     {
        //         "message": "Consider using custom media queries for better maintainability",
        //         "severity": "warning"
        //     }
        // ],

        // "no-restricted-syntax": [ // Disabled: Rule causing issues
        //     [
        //         // Less restrictive patterns that are more relevant
        //         String.raw`declaration[prop='/^-webkit-/']` // Disallow webkit properties (use autoprefixer)
        //     ],
        //     {
        //         "message": "Avoid CSS patterns that conflict with modern tooling",
        //         "severity": "warning"
        //     }
        // ],

        // "csstools/value-no-unknown-custom-properties": true, // Disabled: Tailwind's dynamic class generation and custom properties are not compatible with this rule. See https://github.com/tailwindlabs/tailwindcss/issues/9602 for details.

        "no-unknown-animations": true,
        // "no-unresolved-module": [ // Disabled: Causing issues with module resolution in this codebase
        //     true,
        //     {
        //         "alias": {
        //             "@": "./src",
        //             "~": "./src"
        //         }
        //     }
        // ],

        // "plugin-use-baseline": { // Disabled: Too restrictive for current browser support requirements
        //     "browsers": "defaults and supports es6-module"
        // },

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

        "plugin/selector-bem-pattern": {
            ignoreSelectors: [
                String.raw`/^\.tw-/`, // Tailwind utilities
                String.raw`/^\[data-/`, // Data attributes
                String.raw`/^::/`, // Pseudo-elements
                String.raw`/^:/`, // Pseudo-classes
                String.raw`/^\.` + String.raw`/[A-Z]/`, // CSS Modules (PascalCase)
            ],
            preset: "bem",
            presetOptions: {
                namespace: "uw", // UptimeWatcher namespace
            },
        },

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
        "scales/font-sizes": [
            [
                {
                    scale: [
                        10,
                        12,
                        14,
                        16,
                        18,
                        20,
                        24,
                        28,
                        32,
                        40,
                        48,
                        64,
                        80,
                        96,
                    ],
                    units: ["px"],
                },
                {
                    scale: [
                        0.625,
                        0.75,
                        0.875,
                        1,
                        1.125,
                        1.25,
                        1.5,
                        1.75,
                        2,
                        2.5,
                        3,
                        4,
                        5,
                        6,
                    ],
                    units: ["rem", "em"],
                },
            ],
        ],
        "scales/line-heights": [
            1,
            1.125,
            1.25,
            1.375,
            1.5,
            1.625,
            1.75,
            2,
        ],
        "scss/at-rule-no-unknown": null,

        // Selector rules (specificity management)
        "selector-max-id": 1,
        "selector-max-specificity": "0,4,1",

        // Time rules
        "time-min-milliseconds": 100, // Minimum 100ms for animations/transitions (performance) (verified working)
        // "value-no-unknown-custom-properties": [ // Disabled: Rule name incorrect, should be no-unknown-custom-properties
        //     true,
        //     {
        //         "ignoreProperties": [
        //             String.raw`/^--tw-/`, // Tailwind CSS variables
        //             String.raw`/^--css-/`, // CSS module variables
        //             String.raw`/^--theme-/`, // Theme variables
        //             String.raw`/^--/` // Allow all custom properties for now
        //         ],
        //         "severity": "warning"
        //     }
        // ],

        /* eslint-disable sonarjs/todo-tag */
        // @todo: Will re-enable for theming eventually
        // "scale-unlimited/declaration-strict-value": [
        //     ["/color$/", "z-index", "font-size"]
        // ],
    },
};
