 
 

/**
 * Comprehensive Stylelint configuration for the Uptime Watcher project.
 *
 * @remarks
 * This configuration enforces modern CSS coding standards, logical properties,
 * OKLCH colors, and accessibility best practices. It extends
 * stylelint-config-standard which provides sensible defaults for CSS property
 * order, formatting, and modern CSS practices.
 *
 * The configuration includes comprehensive support for multiple file types and
 * syntax variations:
 *
 * - HTML files with inline CSS
 * - TypeScript/JavaScript React components with CSS-in-JS
 * - Styled JSX components
 * - CSS Modules with scoped class names
 * - SCSS/Sass files with full preprocessing support
 *
 * @public
 *
 * @see {@link https://stylelint.io/user-guide/configure | Stylelint Configuration Guide}
 * @see {@link https://github.com/stylelint/stylelint-config-standard | stylelint-config-standard}
 * @see {@link https://www.schemastore.org/stylelintrc.json | Stylelint Config Schema}
 */

/**
 * Type definition for the complete Stylelint configuration object.
 *
 * @see {@link https://stylelint.io/user-guide/configure | Stylelint Config Schema}
 */
/** @typedef {import("stylelint").Config} */
/** @typedef {import("stylelint").LinterOptions} */
/** @typedef {import("stylelint").PostcssPluginOptions} */
/** @typedef {import("stylelint").WarningOptions} */
/** @typedef {import("stylelint").RuleOptions} */
/** @typedef {import("stylelint").RuleOptionsPossible} */
/** @typedef {import("stylelint").PostcssPluginOptions} */
/** @typedef {import("stylelint").LinterOptions} */
/** @typedef {import("stylelint").GetPostcssOptions} */

/**
 * Enhanced configuration helper that provides TypeScript intellisense and
 * validation.
 *
 * @remarks
 * The stylelint-define-config package wraps the configuration object with
 * proper TypeScript type checking while preserving runtime behavior.
 *
 * @see {@link https://github.com/stylelint-types/stylelint-define-config | stylelint-define-config}
 */
// eslint-disable-next-line import-x/no-named-as-default -- Rule wants packages not in dev, doesn't apply here
import defineConfig from "stylelint-define-config";

/**
 * Complete Stylelint configuration object defining all linting rules and
 * settings.
 *
 * @remarks
 * This configuration provides a comprehensive setup for CSS/SCSS linting across
 * the entire Uptime Watcher project. It combines multiple plugin ecosystems to
 * enforce modern CSS standards, accessibility guidelines, and performance best
 * practices.
 *
 * The configuration is structured in several key sections:
 *
 * - Basic options (allowEmptyInput, defaultSeverity, fix, etc.)
 * - Extended configurations from popular rule sets
 * - File-type specific overrides for different syntax requirements
 * - Plugin definitions for enhanced functionality
 * - Comprehensive rule definitions with custom settings
 *
 * @example
 *
 * ```typescript
 * // Basic usage in a project
 * import config from "./stylelint.config.mjs";
 *
 * // The configuration handles multiple file types automatically:
 * // - .css, .scss files with full preprocessing
 * // - .html files with inline styles
 * // - .tsx, .jsx files with CSS-in-JS
 * // - .module.css files with CSS Modules scoping
 * ```
 *
 * @returns The complete Stylelint configuration object with all rules and
 *   plugins.
 *
 * @public
 *
 * @see {@link https://stylelint.io/user-guide/configure | Stylelint Configuration Documentation}
 * @see {@link https://github.com/stylelint/stylelint-config-standard | stylelint-config-standard Rules}
 */
const config = defineConfig({
    /**
     * Controls whether Stylelint should allow empty input files.
     *
     * @defaultValue false
     *
     * @see {@link https://stylelint.io/user-guide/configure/#allowemptyinput | allowEmptyInput Documentation}
     */
    allowEmptyInput: false,

    /**
     * Enables caching of lint results to improve performance on subsequent
     * runs.
     *
     * @defaultValue true
     *
     * @see {@link https://stylelint.io/user-guide/configure/#cache | cache Documentation}
     */
    cache: true,

    /**
     * Default severity level for all rules that don't specify their own
     * severity.
     *
     * @defaultValue "warning"
     *
     * @see {@link https://stylelint.io/user-guide/configure/#defaultseverity | defaultSeverity Documentation}
     */
    defaultSeverity: "warning",

    /**
     * Baseline configuration sets that provide foundational rules and
     * standards.
     *
     * @remarks
     * These configurations are applied in order, with later configurations
     * potentially overriding rules from earlier ones. The combination
     * provides:
     *
     * - Standard CSS linting rules
     * - Property ordering based on logical groupings
     * - SCSS-specific enhancements
     * - Tailwind CSS compatibility
     *
     * @see {@link https://stylelint.io/user-guide/configure/#extends | extends Documentation}
     */
    extends: [
        "stylelint-config-standard",
        "stylelint-config-recess-order",
        "stylelint-config-idiomatic-order",
        "stylelint-config-standard-scss",
        "stylelint-config-tailwindcss",
    ],

    /**
     * Controls whether Stylelint should automatically fix problems where
     * possible.
     *
     * @remarks
     * Set to false to prevent automatic modifications. Use CLI --fix flag
     * instead for controlled fixing when desired.
     *
     * @defaultValue false
     *
     * @see {@link https://stylelint.io/user-guide/configure/#fix | fix Documentation}
     */
    fix: false,

    /**
     * Controls whether disable comments are ignored.
     *
     * @defaultValue false
     *
     * @see {@link https://stylelint.io/user-guide/configure/#ignoredisables | ignoreDisables Documentation}
     */
    ignoreDisables: false,

    /**
     * File-type specific configuration overrides for different CSS syntaxes and
     * contexts.
     *
     * @remarks
     * Each override object targets specific file patterns and applies custom
     * rules appropriate for that context. This allows the same configuration to
     * handle multiple CSS paradigms and frameworks effectively.
     *
     * The overrides are processed in order and can cascade, with later
     * overrides potentially modifying rules from earlier ones for overlapping
     * file patterns.
     *
     * @see {@link https://stylelint.io/user-guide/configure/#overrides | overrides Documentation}
     */
    // Override configurations for different file types
    overrides: [
        {
            /**
             * Configuration for HTML files containing inline CSS styles.
             *
             * @remarks
             * Uses postcss-html parser to extract and lint CSS from style
             * attributes and style elements. Relaxes some rules that are
             * impractical for inline styles.
             */
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
            /**
             * Configuration for TypeScript/JavaScript React files using
             * CSS-in-JS.
             *
             * @remarks
             * Uses postcss-styled-syntax to parse CSS within template literals,
             * styled-components, emotion, and similar CSS-in-JS solutions.
             * Allows patterns that are common in CSS-in-JS but invalid in
             * regular CSS.
             */
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
            /**
             * Configuration for styled-jsx syntax in React components.
             *
             * @remarks
             * Styled-jsx uses a different syntax pattern than other CSS-in-JS
             * solutions, requiring a specialized parser and rule adjustments.
             */
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
            /**
             * Configuration for CSS Modules with local scoping.
             *
             * @remarks
             * CSS Modules automatically scope class and ID names, making global
             * naming conventions less relevant. Relaxes pattern-based rules
             * that would otherwise conflict with generated class names.
             */
            // CSS modules
            files: ["**/*.module.{css,scss,sass}"],
            rules: {
                // CSS modules have local scope, so relax some global rules
                "selector-class-pattern": null,
                "selector-id-pattern": null,
            },
        },
        {
            /**
             * Configuration for Docusaurus documentation CSS files.
             *
             * @remarks
             * Docusaurus themes often require specific CSS patterns for UI
             * components and animations. This override accommodates
             * theme-specific requirements while maintaining code quality
             * standards.
             */
            // Docusaurus documentation files
            files: ["docs/docusaurus/**/*.{css,scss}"],
            rules: {
                // Relax accessibility rules for documentation UI elements
                "a11y/content-property-no-static-value": null,
                "a11y/font-size-is-readable": null,
                // The docs theme defines fast transitions/animations but provides
                // explicit reduced-motion fallbacks already. The a11y rule can
                // flag false positives due to the complex selector duplication.
                // Disable it for docs to avoid noisy warnings.
                "a11y/media-prefers-reduced-motion": null,
                "plugin/stylelint-group-selectors": null,
                "scss/declaration-property-value-no-unknown": null,
            },
        },
        {
            /**
             * Configuration for SCSS/Sass preprocessor files.
             *
             * @remarks
             * Uses postcss-scss parser to handle SCSS syntax including
             * variables, mixins, functions, and nesting. Enables SCSS-specific
             * rules while disabling conflicting standard CSS rules.
             */
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

    /**
     * Collection of Stylelint plugins providing specialized linting
     * capabilities.
     *
     * @remarks
     * Plugins extend Stylelint's core functionality with additional rules for:
     *
     * - Accessibility compliance (a11y rules)
     * - Performance optimization (defensive CSS, high-performance animations)
     * - Modern CSS standards (logical properties, color gamut validation)
     * - Code organization (BEM patterns, grouped selectors)
     * - Browser compatibility (feature detection, hack prevention)
     *
     * Disabled plugins are documented with specific reasons for future
     * reference.
     *
     * @see {@link https://stylelint.io/user-guide/configure/#plugins | plugins Documentation}
     */
    plugins: [
        /**
         * Accessibility-focused linting rules for inclusive CSS.
         *
         * @see {@link https://github.com/double-great/stylelint-a11y | @double-great/stylelint-a11y}
         */
        "@double-great/stylelint-a11y", // Accessibility rules

        /**
         * Core functional plugins for CSS best practices and performance.
         */
        // Core functional plugins
        "stylelint-plugin-defensive-css",
        "stylelint-plugin-logical-css",
        "stylelint-gamut",
        "stylelint-use-nesting",
        "stylelint-prettier",
        "stylelint-high-performance-animation",

        /**
         * Modern CSS standards and feature plugins.
         */
        // Modern CSS and Standards plugins
        "@stylistic/stylelint-plugin", // Styling rules removed in Stylelint 16
        "stylelint-scales", // Enforce numeric value scales
        "stylelint-media-use-custom-media", // Enforce custom media queries
        "stylelint-plugin-use-baseline", // Enforce CSS features in baseline
        "stylelint-no-restricted-syntax", // Disallow restricted syntax patterns
        "stylelint-value-no-unknown-custom-properties", // Validate custom properties
        "stylelint-no-unresolved-module", // Check for unresolved imports/urls
        "stylelint-selector-bem-pattern", // BEM pattern enforcement

        /**
         * Browser compatibility and cross-platform plugins.
         */
        // Browser compatibility plugins
        "stylelint-no-browser-hacks", // Disallow browser hacks
        "stylelint-no-unsupported-browser-features", // Check browser support

        /**
         * Code organization and maintenance utility plugins.
         */
        // Utility plugins
        "stylelint-order",
        "stylelint-declaration-block-no-ignored-properties",
        "stylelint-declaration-strict-value",
        "stylelint-group-selectors",

        /**
         * Disabled plugins with documented reasons for exclusion.
         *
         * @remarks
         * These plugins are intentionally disabled due to compatibility issues,
         * framework conflicts, or project-specific requirements. See individual
         * comments for specific reasons and potential future updates.
         */
        // Disabled plugins with reasons:
        // "stylelint-a11y", // Disabled: Not supported in Stylelint 16. See https://github.com/YozhikM/stylelint-a11y for future updates or consider using postcss-a11y or other accessibility tools.
        // "stylelint-csstree-validator", // Disabled due to media query parsing issues: see https://github.com/csstree/stylelint-validator/issues/27 for details and future updates.
        // "stylelint-no-indistinguishable-colors", // Disabled: Tailwind intentionally uses subtle color variations for design flexibility, which may reduce strict color distinguishability. Accessibility concerns (e.g., sufficient contrast) should be addressed via design review and dedicated contrast checking tools rather than enforced by this rule.
    ],

    /**
     * Controls console output verbosity during linting.
     *
     * @remarks
     * When false, shows all rule violations and informational messages. Set to
     * true to suppress non-essential output.
     *
     * @defaultValue false
     *
     * @see {@link https://stylelint.io/user-guide/configure/#quiet | quiet Documentation}
     */
    quiet: false,

    /**
     * Reports disable comments that lack a description explaining why the rule
     * was disabled.
     *
     * @remarks
     * Encourages documented disable comments for better code maintainability.
     * Prefer descriptive disable comments over plain rule disabling.
     *
     * @defaultValue true
     *
     * @see {@link https://stylelint.io/user-guide/configure/#reportdescriptionlessdisables | reportDescriptionlessDisables Documentation}
     */
    reportDescriptionlessDisables: true,

    /**
     * Reports disable comments that target rules not applicable to the current
     * context.
     *
     * @defaultValue true
     *
     * @see {@link https://stylelint.io/user-guide/configure/#reportinvalidscopedisables | reportInvalidScopeDisables Documentation}
     */
    reportInvalidScopeDisables: true,

    /**
     * Reports disable comments for rules that didn't produce any violations.
     *
     * @remarks
     * Helps maintain clean codebase by identifying unnecessary disable comments
     * that can be safely removed.
     *
     * @defaultValue true
     *
     * @see {@link https://stylelint.io/user-guide/configure/#reportneedlessdisables | reportNeedlessDisables Documentation}
     */
    reportNeedlessDisables: true,

    /**
     * Reports disable comments that don't specify which rule(s) they disable.
     *
     * @remarks
     * Encourages specific disable comments over broad disable directives.
     * Specific rule targeting improves code maintainability and clarity.
     *
     * @defaultValue true
     *
     * @see {@link https://stylelint.io/user-guide/configure/#reportunscopeddisables | reportUnscopedDisables Documentation}
     */
    reportUnscopedDisables: true,

    /**
     * Comprehensive rule configuration defining specific linting behavior.
     *
     * @remarks
     * Rules are organized into logical groups for maintainability:
     *
     * - Stylistic rules (@stylistic/stylelint-plugin) - Code formatting and style
     * - Accessibility rules (a11y) - WCAG compliance and inclusive design
     * - Core Stylelint rules - Standard CSS validation and best practices
     * - Plugin-specific rules - Extended functionality from third-party plugins
     * - SCSS rules (scss/) - Sass/SCSS preprocessing support
     *
     * Each rule can be:
     *
     * - `true` or `false` - Enable/disable with default settings
     * - `null` - Explicitly disable rule
     * - Array with options - Enable with custom configuration
     * - String value - Enable with specific mode/setting
     *
     * @see {@link https://stylelint.io/user-guide/configure/#rules | rules Documentation}
     * @see {@link https://stylelint.io/user-guide/rules | Complete Rule List}
     */
    rules: {
        /**
         * Stylistic rules from @stylistic/stylelint-plugin.
         *
         * @remarks
         * Most stylistic rules are disabled (set to null) because code
         * formatting is handled by Prettier. Only rules that provide value
         * beyond formatting are enabled, such as color-hex-case and
         * string-quotes for consistency.
         *
         * @see {@link https://github.com/stylelint-stylistic/stylelint-stylistic | @stylistic/stylelint-plugin Documentation}
         */
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

        /**
         * Accessibility rules from @double-great/stylelint-a11y plugin.
         *
         * @remarks
         * These rules help ensure CSS follows WCAG guidelines and inclusive
         * design principles. Some rules are disabled where they conflict with
         * legitimate design patterns (e.g., content property for icons) or
         * framework requirements (e.g., Tailwind's color system).
         *
         * @see {@link https://github.com/double-great/stylelint-a11y | stylelint-a11y Documentation}
         * @see {@link https://www.w3.org/WAI/WCAG21/quickref/ | WCAG 2.1 Quick Reference}
         */
        // A11y Plugin Rules (@double-great/stylelint-a11y)
        // Disable static content rule as we use it legitimately for checkmarks, tooltips, and visual indicators
        "a11y/content-property-no-static-value": null,

        "a11y/font-size-is-readable": [
            true,
            {
                /**
                 * Configuration for readable font size enforcement.
                 *
                 * @remarks
                 * Allows smaller font sizes for tooltips and visual indicators
                 * where reduced size is acceptable for user experience. The
                 * `content` property is ignored as it's used for decorative
                 * elements.
                 */
                // Allow smaller font sizes for tooltips and visual indicators
                ignoreProperties: ["content"],
                severity: "warning",
            },
        ],
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
        // Color rules
        "alpha-value-notation": null,
        "annotation-no-unknown": true,

        /**
         * Core Stylelint built-in rules for standard CSS validation.
         *
         * @remarks
         * These rules provide fundamental CSS linting including syntax
         * validation, security checks, and modern CSS feature support. Comments
         * indicate specific reasoning for enabled/disabled rules.
         *
         * @see {@link https://stylelint.io/user-guide/rules | Stylelint Core Rules}
         */
        // Stylelint built in rules
        "at-rule-allowed-list": null,
        "at-rule-descriptor-no-unknown": true,
        "at-rule-descriptor-value-no-unknown": true,
        "at-rule-disallowed-list": null,
        "at-rule-empty-line-before": [
            "always",
            {
                ignore: [
                    "after-comment",
                    "first-nested",
                    "blockless-after-same-name-blockless",
                    "inside-block",
                    "blockless-after-blockless",
                    "after-comment",
                ],
            },
        ],

        "at-rule-no-deprecated": true,
        // Disable unknown at-rules to prevent conflicts with modern CSS features and build tools
        "at-rule-no-unknown": null,
        "at-rule-no-vendor-prefix": true,
        "at-rule-prelude-no-invalid": true,
        "at-rule-property-required-list": null,
        "block-no-empty": true,
        "block-no-redundant-nested-style-rules": true,
        "color-function-alias-notation": null,
        "color-function-notation": "modern",
        "color-hex-alpha": null,
        "color-hex-length": "long",
        "color-named": "never",
        "color-no-hex": null,
        "color-no-invalid-hex": true, // Disallow invalid hex colors like #xyz or #1234567 (verified working)
        "comment-empty-line-before": null,
        "comment-no-empty": true,
        "comment-pattern": null,
        "comment-whitespace-inside": "always",
        "comment-word-disallowed-list": null,
        // CSS Tools Rules (@csstools/postcss-plugins)
        "csstools/media-use-custom-media": null,
        // CSS nesting and tools
        "csstools/use-nesting": "always",
        "csstools/value-no-unknown-custom-properties": null,
        "custom-property-no-missing-var-function": true,
        "declaration-block-no-duplicate-custom-properties": true,
        "declaration-block-no-duplicate-properties": [
            true,
            {
                ignore: ["consecutive-duplicates-with-different-syntaxes"],
            },
        ],
        "declaration-block-no-redundant-longhand-properties": true,
        "declaration-block-no-shorthand-property-overrides": true,
        "declaration-block-single-line-max-declarations": 1,
        "declaration-empty-line-before": null,
        // Stylelint built in rules
        // Declaration rules
        "declaration-no-important": true,
        "declaration-property-max-values": null,
        "declaration-property-unit-allowed-list": null,
        "declaration-property-unit-disallowed-list": null,
        "declaration-property-value-allowed-list": null,
        "declaration-property-value-disallowed-list": null,
        "declaration-property-value-keyword-no-deprecated": true,
        "declaration-property-value-no-unknown": null,
        "defensive-css/no-mixed-vendor-prefixes": true,
        /**
         * Defensive CSS practices enforcement.
         *
         * @remarks
         * `stylelint-plugin-defensive-css` v2+ exposes rules under the
         * `defensive-css/*` namespace (the old `plugin/use-defensive-css` rule
         * no longer exists).
         *
         * @see {@link https://defensivecss.dev/ | Defensive CSS Guide}
         */
        "defensive-css/require-background-repeat": null,
        "defensive-css/require-flex-wrap": null,
        "defensive-css/require-overscroll-behavior": true,
        "defensive-css/require-scrollbar-gutter": true,
        "font-family-name-quotes": "always-where-recommended",
        "font-family-no-duplicate-names": true,
        "font-family-no-missing-generic-family-keyword": true,
        // Font rules
        "font-weight-notation": "numeric",
        "function-allowed-list": null,
        "function-calc-no-unspaced-operator": true,
        "function-disallowed-list": null,
        // Function rules (security and best practices)
        "function-linear-gradient-no-nonstandard-direction": true,
        "function-name-case": "lower",
        "function-no-unknown": true,
        "function-url-no-scheme-relative": true,
        "function-url-quotes": "always",
        "function-url-scheme-allowed-list": null,
        "function-url-scheme-disallowed-list": null,
        // Color gamut validation
        "gamut/color-no-out-gamut-range": true,

        "hue-degree-notation": "angle",
        "import-notation": "string",
        "keyframe-block-no-duplicate-selectors": true,

        "keyframe-declaration-no-important": true,
        "keyframe-selector-notation":
            "percentage-unless-within-keyword-only-block",
        // Length rules
        "length-zero-no-unit": true, // Disallow units for zero lengths (0px -> 0) (verified working)
        "lightness-notation": "percentage",
        // Layout and structure
        "max-nesting-depth": 4,
        // Media query rules
        "media-feature-name-allowed-list": null,
        "media-feature-name-disallowed-list": null,
        "media-feature-name-no-unknown": true,
        "media-feature-name-no-vendor-prefix": null,
        "media-feature-name-unit-allowed-list": null,
        "media-feature-name-value-allowed-list": null,
        "media-feature-name-value-no-unknown": null,
        "media-feature-range-notation": "context",
        "media-query-no-invalid": null,
        "media-type-no-deprecated": true,
        "named-grid-areas-no-invalid": true,
        "nesting-selector-no-missing-scoping-root": true,
        "no-descending-specificity": true,
        "no-duplicate-at-import-rules": true,
        "no-duplicate-selectors": true,
        "no-empty-source": true,
        "no-invalid-double-slash-comments": true,
        "no-invalid-position-at-import-rule": true,
        "no-invalid-position-declaration": true,
        "no-irregular-whitespace": true,
        // No unknown rules
        "no-unknown-animations": true,
        "no-unknown-custom-media": null,

        "no-unknown-custom-properties": null,

        "number-max-precision": 15,
        // Taken care of Prettier
        "order/order": null,
        "order/properties-alphabetical-order": null,

        // Plugin rules
        "plugin/declaration-block-no-ignored-properties": true,

        /**
         * Browser compatibility rules with specific browser support targets.
         *
         * @remarks
         * Configurations target the project's supported browser matrix,
         * focusing on modern browsers while maintaining compatibility with the
         * most recent versions.
         */
        // Plugin rules
        "plugin/no-browser-hacks": [
            true,
            {
                /**
                 * Browser list defining minimum supported versions.
                 *
                 * @remarks
                 * Matches the project's browserslist configuration to ensure
                 * consistent targeting across build tools and linting.
                 */
                browsers: [
                    "last 2 chrome versions",
                    "last 2 node major versions",
                    "not dead",
                ],
            },
        ],
        /**
         * Performance optimization rules for animations and high-impact
         * properties.
         *
         * @remarks
         * Prevents use of animation properties that can cause performance
         * degradation by triggering expensive layout or paint operations. Some
         * properties are ignored if they're commonly used despite performance
         * implications.
         *
         * @see {@link https://web.dev/animations-guide/ | Web.dev Animation Performance Guide}
         */
        "plugin/no-low-performance-animation-properties": [
            true,
            {
                /**
                 * Properties to ignore despite performance implications.
                 *
                 * @remarks
                 * These properties are commonly animated and their performance
                 * impact is acceptable for this project's use cases.
                 */
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
        /**
         * Browser feature compatibility validation.
         *
         * @remarks
         * Warns about CSS features that may not be supported in the project's
         * target browsers. Uses the same browser list as other compatibility
         * tools for consistency.
         *
         * @see {@link https://caniuse.com/ | Can I Use Compatibility Data}
         */
        "plugin/no-unsupported-browser-features": [
            true,
            {
                /**
                 * Target browser versions for compatibility checks.
                 *
                 * @remarks
                 * Aligned with project's browserslist configuration.
                 */
                browsers: [
                    "last 2 chrome versions",
                    "last 2 node major versions",
                    "not dead",
                ],

                /**
                 * Features to ignore despite browser support concerns.
                 *
                 * @remarks
                 * Empty array allows modern CSS features that may have limited
                 * support but are acceptable for this project.
                 */
                ignore: ["multicolumn"], // Allow modern CSS features

                /**
                 * Severity level for unsupported feature detection.
                 *
                 * @remarks
                 * Set to "warning" to inform about compatibility issues without
                 * blocking the build process.
                 */
                severity: "warning",
            },
        ],
        /**
         * BEM (Block Element Modifier) pattern enforcement.
         *
         * @remarks
         * Enforces BEM naming convention while allowing exceptions for utility
         * classes, data attributes, and CSS modules. Uses a project-specific
         * namespace for consistency.
         *
         * @see {@link http://getbem.com/ | BEM Methodology}
         */
        "plugin/selector-bem-pattern": {
            /**
             * Selectors to ignore from BEM pattern validation.
             *
             * @remarks
             * Includes utility classes (Tailwind), data attributes,
             * pseudo-elements/classes, and CSS modules with PascalCase.
             */
            ignoreSelectors: [
                String.raw`/^\.tw-/`, // Tailwind utilities
                String.raw`/^\[data-/`, // Data attributes
                String.raw`/^::/`, // Pseudo-elements
                String.raw`/^:/`, // Pseudo-classes
                String.raw`/^\.` + String.raw`/[A-Z]/`, // CSS Modules (PascalCase)
            ],

            /**
             * BEM preset configuration.
             *
             * @remarks
             * Uses standard BEM preset with project-specific namespace.
             */
            preset: "bem",
            presetOptions: {
                /**
                 * Project namespace for BEM classes.
                 *
                 * @remarks
                 * Uw stands for UptimeWatcher, providing consistent class
                 * prefixing across the application.
                 */
                namespace: "uw", // UptimeWatcher namespace
            },
        },
        "plugin/stylelint-group-selectors": true,
        "plugin/use-baseline": null,

        /**
         * Logical properties and values promotion.
         *
         * @remarks
         * Encourages use of logical properties (e.g., margin-inline-start
         * instead of margin-left) for better internationalization support. Set
         * to warning level to gradually adopt these practices.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties | MDN Logical Properties}
         */
        "plugin/use-logical-properties-and-values": [
            true,
            { severity: "warning" },
        ],

        /**
         * Logical units enforcement.
         *
         * @remarks
         * Promotes logical units (e.g., inline-size instead of width) for
         * improved internationalization and writing mode support.
         */
        "plugin/use-logical-units": [true, { severity: "warning" }],
        "prettier/prettier": true,
        "property-allowed-list": null,
        "property-disallowed-list": null,
        "property-no-deprecated": true,
        "property-no-unknown": true,

        "rule-empty-line-before": null,
        "rule-nesting-at-rule-required-list": null,
        "rule-selector-property-disallowed-list": null,

        /**
         * Scale-based design system rules.
         *
         * @remarks
         * Rules from stylelint-scales plugin for enforcing consistent design
         * tokens and scale-based values. Currently disabled to allow
         * flexibility during development.
         *
         * @see {@link https://github.com/jeddy3/stylelint-scales | stylelint-scales Documentation}
         */
        // Scale rules (stylelint-scales)
        "scale-unlimited/declaration-strict-value": null,
        "scales/alpha-values": null,
        "scales/border-widths": null,

        /**
         * Font size scale configuration.
         *
         * @remarks
         * Defines allowed font sizes in both pixel and relative units. Supports
         * a modular scale approach for consistent typography throughout the
         * application.
         */
        "scales/font-sizes": [
            [
                {
                    /**
                     * Pixel-based font size scale.
                     *
                     * @remarks
                     * Provides precise sizing for components that require exact
                     * pixel values.
                     */
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
                    /**
                     * Relative unit font size scale.
                     *
                     * @remarks
                     * Uses rem and em units for responsive and accessible
                     * typography that scales with user preferences.
                     */
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

        /**
         * Line height scale configuration.
         *
         * @remarks
         * Defines a scale of line-height values for consistent vertical rhythm
         * and typography spacing.
         */
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

        /**
         * Prettier integration for code formatting.
         *
         * @remarks
         * Enables Prettier formatting rules within Stylelint to ensure
         * consistent code style. Prettier handles most formatting concerns.
         */
        // Prettier integration

        "scales/sizes": null,
        "scales/space": null,
        "scales/word-spacings": null,
        "scales/z-indices": null,

        /**
         * SCSS (Sass) specific linting rules.
         *
         * @remarks
         * Rules specific to SCSS syntax and features including mixins,
         * functions, variables, and preprocessing directives. These rules
         * enhance SCSS code quality and consistency.
         *
         * @see {@link https://github.com/stylelint-scss/stylelint-scss | stylelint-scss Documentation}
         */
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
        "selector-anb-no-unmatchable": true,
        "selector-attribute-name-disallowed-list": null,
        "selector-attribute-operator-allowed-list": null,
        "selector-attribute-operator-disallowed-list": null,
        "selector-attribute-quotes": "always",

        /**
         * Rule to enforce consistent class selector patterns.
         *
         * @remarks
         * Disabled to allow flexibility with utility-first CSS frameworks like
         * Tailwind CSS, which use diverse class naming conventions.
         *
         * @see {@link https://stylelint.io/user-guide/rules/selector-class-pattern | selector-class-pattern Documentation}
         */
        "selector-class-pattern": null,
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
        "selector-not-notation": "complex",
        "selector-pseudo-class-allowed-list": null,
        "selector-pseudo-class-disallowed-list": null,
        "selector-pseudo-class-no-unknown": true,
        "selector-pseudo-element-allowed-list": null,
        "selector-pseudo-element-colon-notation": "double",
        "selector-pseudo-element-disallowed-list": null,
        "selector-pseudo-element-no-unknown": true,
        "selector-type-no-unknown": true,
        "shorthand-property-no-redundant-values": true,
        "string-no-newline": true,
        "syntax-string-no-invalid": true,
        // Time rules

        /**
         * Minimum animation/transition duration.
         *
         * @remarks
         * Enforces a minimum of 100ms for animations and transitions to ensure
         * they are perceptible and provide good user experience. Values below
         * this threshold may cause accessibility issues.
         *
         * @see {@link https://web.dev/animations-guide/ | Animation Performance Guidelines}
         */
        "time-min-milliseconds": 100, // Minimum 100ms for animations/transitions (performance) (verified working)
        "unit-allowed-list": null,
        "unit-disallowed-list": null,
        "unit-no-unknown": true,
        "value-keyword-case": "lower",
    },
    // Validate: true, -- Disabled: not real config option only CLI flag
});

// Export the configuration
export default config;
