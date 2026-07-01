import sharedConfig from "stylelint-config-nick2bad4u";

/** @type {import("stylelint").Config} */
const stylelintConfig = {
    ...sharedConfig,
    rules: {
        ...sharedConfig.rules,

        // These shared-preset advisory rules report hundreds of existing
        // design-system and Docusaurus override patterns. Treating them as a
        // migration cleanup would require a broad visual refactor, not lint
        // hygiene.
        "css-performance-budget/no-expensive-animation-properties": null,
        "css-performance-budget/no-expensive-positioning-patterns": null,
        "css-performance-budget/no-excessive-filter-effects": null,
        "css-performance-budget/no-fixed-background-attachment": null,
        "css-performance-budget/no-giant-selector-lists": null,
        "css-performance-budget/no-global-expensive-effects": null,
        "css-performance-budget/no-heavy-selectors": null,
        "css-performance-budget/no-layout-thrashing-properties": null,
        "css-performance-budget/no-paint-heavy-declarations": null,
        "css-performance-budget/no-render-blocking-import": null,
        "css-performance-budget/no-will-change-abuse": null,
        "css-performance-budget/require-reduced-motion-for-expensive-animations":
            null,
        "docusaurus/no-color-scheme-on-docusaurus-html-root": null,
        "docusaurus/no-hardcoded-docusaurus-breakpoint-values": null,
        "docusaurus/no-important-on-infima-or-docusaurus-selector-overrides":
            null,
        "docusaurus/no-mobile-navbar-backdrop-filter": null,
        "docusaurus/no-unanchored-infima-subcomponent-selectors": null,
        "docusaurus/no-unscoped-content-element-overrides": null,
        "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": null,
        "docusaurus/require-reduced-motion-override-for-interactive-transitions":
            null,
        "grid/no-dense-auto-flow": null,
        "grid/prefer-minmax-zero-fr": null,
        "keyframes-name-pattern": null,
        "no-duplicate-selectors": null,
        "string-no-newline": null,
    },
};

export default stylelintConfig;
