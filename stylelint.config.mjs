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
// eslint-disable-next-line n/no-unpublished-import, import-x/no-named-as-default -- dev tools
import defineConfig from "stylelint-define-config";

export default defineConfig({
    allowEmptyInput: false,
    defaultSeverity: "warning",
    extends: [
        "stylelint-config-standard",
        "stylelint-config-recess-order",
        "stylelint-config-idiomatic-order",
        "stylelint-config-standard-scss",
        "stylelint-config-tailwindcss",
    ],
    fix: false,
    ignoreDisables: false,
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
        "@double-great/stylelint-a11y", // Accessibility rules

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

        // Browser compatibility plugins
        "stylelint-no-browser-hacks", // Disallow browser hacks
        "stylelint-no-unsupported-browser-features", // Check browser support

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

    quiet: false,
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    reportUnscopedDisables: true,

    rules: {
        // Stylistic Rules (@stylistic/stylelint-plugin)
        "@stylistic/at-rule-name-case": null,
        "@stylistic/at-rule-name-newline-after": null,
        "@stylistic/at-rule-name-space-after": null,
        "@stylistic/at-rule-semicolon-newline-after": null,
        "@stylistic/at-rule-semicolon-space-before": null,
        "@stylistic/block-closing-brace-empty-line-before": null,
        "@stylistic/block-closing-brace-newline-after": null,
        "@stylistic/block-closing-brace-newline-before": null,
        "@stylistic/block-closing-brace-space-after": null,
        "@stylistic/block-closing-brace-space-before": null,
        "@stylistic/block-opening-brace-newline-after": null,
        "@stylistic/block-opening-brace-newline-before": null,
        "@stylistic/block-opening-brace-space-after": null,
        "@stylistic/block-opening-brace-space-before": null,
        "@stylistic/color-hex-case": "lower",
        "@stylistic/declaration-bang-space-after": null,
        "@stylistic/declaration-bang-space-before": null,
        "@stylistic/declaration-block-semicolon-newline-after": null,
        "@stylistic/declaration-block-semicolon-newline-before": null,
        "@stylistic/declaration-block-semicolon-space-after": null,
        "@stylistic/declaration-block-semicolon-space-before": null,
        "@stylistic/declaration-block-trailing-semicolon": null,
        "@stylistic/declaration-colon-newline-after": null,
        "@stylistic/declaration-colon-space-after": null,
        "@stylistic/declaration-colon-space-before": "never",
        "@stylistic/function-comma-newline-after": null,
        "@stylistic/function-comma-newline-before": null,
        "@stylistic/function-comma-space-after": null,
        "@stylistic/function-comma-space-before": null,
        "@stylistic/function-max-empty-lines": null,
        "@stylistic/function-parentheses-newline-inside": null,
        "@stylistic/function-parentheses-space-inside": null,
        "@stylistic/function-whitespace-after": null,
        "@stylistic/indentation": null,
        "@stylistic/linebreaks": null,
        "@stylistic/max-empty-lines": null,
        "@stylistic/max-line-length": null,
        "@stylistic/media-feature-colon-space-after": null,
        "@stylistic/media-feature-colon-space-before": null,
        "@stylistic/media-feature-name-case": null,
        "@stylistic/media-feature-parentheses-space-inside": null,
        "@stylistic/media-feature-range-operator-space-after": null,
        "@stylistic/media-feature-range-operator-space-before": null,
        "@stylistic/media-query-list-comma-newline-after": null,
        "@stylistic/media-query-list-comma-newline-before": null,
        "@stylistic/media-query-list-comma-space-after": null,
        "@stylistic/media-query-list-comma-space-before": null,
        "@stylistic/named-grid-areas-alignment": null,
        "@stylistic/no-empty-first-line": null,
        "@stylistic/no-eol-whitespace": null,
        "@stylistic/no-extra-semicolons": null,
        "@stylistic/no-missing-end-of-source-newline": null,
        "@stylistic/number-leading-zero": null,
        "@stylistic/number-no-trailing-zeros": null,
        "@stylistic/property-case": null,
        "@stylistic/selector-attribute-brackets-space-inside": null,
        "@stylistic/selector-attribute-operator-space-after": null,
        "@stylistic/selector-attribute-operator-space-before": null,
        "@stylistic/selector-combinator-space-after": null,
        "@stylistic/selector-combinator-space-before": null,
        "@stylistic/selector-descendant-combinator-no-non-space": null,
        "@stylistic/selector-list-comma-newline-after": null,
        "@stylistic/selector-list-comma-newline-before": null,
        "@stylistic/selector-list-comma-space-after": null,
        "@stylistic/selector-list-comma-space-before": null,
        "@stylistic/selector-max-empty-lines": null,
        "@stylistic/selector-pseudo-class-case": null,
        "@stylistic/selector-pseudo-class-parentheses-space-inside": null,
        "@stylistic/selector-pseudo-element-case": null,
        "@stylistic/string-quotes": "double",
        "@stylistic/unicode-bom": null,
        "@stylistic/unit-case": null,
        "@stylistic/value-list-comma-newline-after": null,
        "@stylistic/value-list-comma-newline-before": null,
        "@stylistic/value-list-comma-space-after": null,
        "@stylistic/value-list-comma-space-before": null,
        "@stylistic/value-list-max-empty-lines": null,

        // A11y Plugin Rules (@double-great/stylelint-a11y)
        "a11y/content-property-no-static-value": true,
        "a11y/font-size-is-readable": true,
        "a11y/line-height-is-vertical-rhythmed": null,
        "a11y/media-prefers-color-scheme": null,
        "a11y/media-prefers-reduced-motion": true,
        "a11y/no-display-none": null,
        "a11y/no-obsolete-attribute": true,
        "a11y/no-obsolete-element": true,
        "a11y/no-outline-none": true,
        "a11y/no-spread-text": true,
        "a11y/no-text-align-justify": true,
        "a11y/selector-pseudo-class-focus": true,

        // Stylelint built in rules
        "at-rule-allowed-list": null,
        "at-rule-disallowed-list": null,
        // Disable unknown at-rules to prevent conflicts with modern CSS features and build tools
        "at-rule-no-unknown": null,
        "at-rule-property-required-list": null,
        // Color rules
        "color-function-notation": "modern",
        "color-hex-alpha": null,
        "color-named": "never",
        "color-no-hex": null,
        "color-no-invalid-hex": true, // Disallow invalid hex colors like #xyz or #1234567 (verified working)
        "comment-pattern": null,
        "comment-word-disallowed-list": null,

        // CSS Tools Rules (@csstools/postcss-plugins)
        "csstools/media-use-custom-media": null,
        // CSS nesting and tools
        "csstools/use-nesting": "always",
        "csstools/value-no-unknown-custom-properties": null,

        // Stylelint built in rules
        // Declaration rules
        "declaration-no-important": true,
        "declaration-property-max-values": null,
        "declaration-property-unit-allowed-list": null,
        "declaration-property-unit-disallowed-list": null,
        "declaration-property-value-allowed-list": null,
        "declaration-property-value-disallowed-list": null,
        "declaration-property-value-no-unknown": true,
        // Font rules
        "font-weight-notation": "numeric",
        "function-allowed-list": null,
        "function-disallowed-list": null,
        // Function rules (security and best practices)
        "function-linear-gradient-no-nonstandard-direction": true,
        "function-url-no-scheme-relative": true,
        "function-url-scheme-allowed-list": null,
        "function-url-scheme-disallowed-list": null,
        // Color gamut validation
        "gamut/color-no-out-gamut-range": true,
        // Length rules
        "length-zero-no-unit": true, // Disallow units for zero lengths (0px -> 0) (verified working)
        // Layout and structure
        "max-nesting-depth": 4,
        // Media query rules
        "media-feature-name-allowed-list": null,
        "media-feature-name-disallowed-list": null,
        "media-feature-name-unit-allowed-list": null,
        "media-feature-name-value-allowed-list": null,
        // No unknown rules
        "no-unknown-animations": true,
        "no-unknown-custom-media": null,
        "no-unknown-custom-properties": null,
        // Taken care of Prettier
        "order/order": null,
        "order/properties-alphabetical-order": null,
        // Plugin rules
        "plugin/declaration-block-no-ignored-properties": true,
        // Plugin rules
        "plugin/no-browser-hacks": [
            true,
            {
                browsers: [
                    "last 2 chrome versions",
                    "last 2 node major versions",
                    "not dead",
                ],
            },
        ],
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
        "plugin/no-restricted-syntax": null,
        "plugin/no-unresolved-module": null,
        "plugin/no-unsupported-browser-features": [
            true,
            {
                browsers: [
                    "last 2 chrome versions",
                    "last 2 node major versions",
                    "not dead",
                ],
                ignore: [], // Allow modern CSS features
                severity: "warning",
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
        "plugin/stylelint-group-selectors": true,
        "plugin/use-baseline": null,
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
        "property-allowed-list": null,
        "property-disallowed-list": null,
        "rule-nesting-at-rule-required-list": null,
        "rule-selector-property-disallowed-list": null,

        // Scale rules (stylelint-scales)
        "scale-unlimited/declaration-strict-value": null,
        "scales/alpha-values": null,
        "scales/border-widths": null,
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
        "scales/font-weights": null,
        "scales/letter-spacings": null,
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
        "scales/radii": null,
        "scales/sizes": null,
        "scales/space": null,
        "scales/word-spacings": null,
        "scales/z-indices": null,

        // SCSS specific rules (stylelint-scss)
        "scss/at-each-key-value-single-line": true,
        "scss/at-function-named-arguments": "always",
        "scss/at-import-partial-extension-allowed-list": null,
        "scss/at-import-partial-extension-disallowed-list": null,
        "scss/at-mixin-named-arguments": "always",
        "scss/at-mixin-no-risky-nesting-selector": true,
        "scss/at-root-no-redundant": true,
        "scss/at-rule-no-unknown": null,
        "scss/at-use-no-redundant-alias": true,
        "scss/at-use-no-unnamespaced": true,
        "scss/block-no-redundant-nesting": true,
        "scss/comment-no-loud": null,
        "scss/declaration-nested-properties": null,
        "scss/declaration-property-value-no-unknown": true,
        "scss/dimension-no-non-numeric-values": true,
        "scss/dollar-variable-colon-newline-after": "always",
        "scss/dollar-variable-default": true,
        "scss/dollar-variable-empty-line-after": null,
        "scss/dollar-variable-first-in-block": true,
        "scss/dollar-variable-no-namespaced-assignment": true,
        "scss/double-slash-comment-inline": null,
        "scss/function-calculation-no-interpolation": true,
        "scss/function-color-channel": true,
        "scss/function-color-relative": true,
        "scss/function-disallowed-list": null,
        "scss/function-no-unknown": true,
        "scss/map-keys-quotes": "always",
        "scss/media-feature-value-dollar-variable": null,
        "scss/no-dollar-variables": true,
        "scss/no-duplicate-dollar-variables": true,
        "scss/no-duplicate-load-rules": true,
        "scss/no-unused-private-members": true,
        "scss/partial-no-import": true,
        "scss/property-no-unknown": true,
        "scss/selector-nest-combinators": null,
        "scss/selector-no-redundant-nesting-selector": null,
        "scss/selector-no-union-class-name": true,
        "selector-attribute-name-disallowed-list": null,
        "selector-attribute-operator-allowed-list": null,
        "selector-attribute-operator-disallowed-list": null,
        "selector-combinator-allowed-list": null,
        "selector-combinator-disallowed-list": null,
        "selector-disallowed-list": null,
        "selector-max-attribute": null,
        "selector-max-class": null,
        "selector-max-combinators": null,
        "selector-max-compound-selectors": null,
        // Selector rules (specificity management)
        "selector-max-id": 1,
        "selector-max-pseudo-class": null,
        "selector-max-specificity": "0,4,1",
        "selector-max-type": null,
        "selector-max-universal": null,
        "selector-nested-pattern": null,
        "selector-no-qualifying-type": null,
        "selector-pseudo-class-allowed-list": null,
        "selector-pseudo-class-disallowed-list": null,
        "selector-pseudo-element-allowed-list": null,
        "selector-pseudo-element-disallowed-list": null,
        // Time rules
        "time-min-milliseconds": 100, // Minimum 100ms for animations/transitions (performance) (verified working)
        "unit-allowed-list": null,
        "unit-disallowed-list": null,
    },
    // validate: true, -- Disabled: not real config option only CLI flag
});
