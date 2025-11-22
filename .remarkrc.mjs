/**
 * @file Remark configuration for markdown and MDX linting and formatting
 *
 *   This configuration provides comprehensive markdown quality checks including:
 *
 *   - Consistent formatting and style
 *   - Content structure validation
 *   - GitHub Flavored Markdown support
 *   - Integration with Prettier for formatting
 *
 * @see {@link https://github.com/remarkjs/remark-lint} for available rules
 * @see {@link https://github.com/remarkjs/remark-gfm} for GitHub Flavored Markdown
 * @see {@link https://www.schemastore.org/remarkrc.json} for JSON schema validation
 * # yaml-language-server: https://www.schemastore.org/schemas/json/remarkrc.json
 */
// @ts-check

import requireSnippets from "./config/linting/remark/require-snippets.mjs";
import validateUptimeWatcherDocs from "./config/linting/remark/validate-uptime-watcher-docs.mjs";

// Type definitions for remark configuration
/** @typedef {import("unified").Preset} Preset */
/** @typedef {import("unified").Plugin} Plugin */
/** @typedef {import("mdast").Root} Root */
/** @typedef {import("vfile").VFile} VFile */
/**
 * @typedef {string
 *     | Plugin
 *     | Preset
 *     | [string | Plugin | Preset, ...unknown[]]} PluginEntry
 */

// Imported plugin types - these plugins don't typically export specific option types
/** @typedef {import("remark-inline-links")} RemarkInlineLinks */
/** @typedef {import("remark-lint-heading-increment")} RemarkLintHeadingIncrement */
/** @typedef {import("@double-great/remark-lint-alt-text")} RemarkLintAltText */
/** @typedef {import("rehype-katex")} RehypeKatex */
/** @typedef {import("remark-lint-no-blockquote-without-marker")} RemarkLintNoBlockquoteWithoutMarker */
/** @typedef {import("remark-lint-definition-case")} RemarkLintDefinitionCase */
/** @typedef {import("remark-lint-final-definition")} RemarkLintFinalDefinition */
/** @typedef {import("remark-lint-no-unused-definitions")} RemarkLintNoUnusedDefinitions */
/** @typedef {import("remark-lint-ordered-list-marker-style")} RemarkLintOrderedListMarkerStyle */
/** @typedef {import("remark-lint-list-item-indent")} RemarkLintListItemIndent */
/** @typedef {import("remark-lint-no-duplicate-headings")} RemarkLintNoDuplicateHeadings */
/** @typedef {import("remark-lint-no-emphasis-as-heading")} RemarkLintNoEmphasisAsHeading */
/** @typedef {import("remark-lint-no-heading-content-indent")} RemarkLintNoHeadingContentIndent */
/** @typedef {import("remark-lint-no-file-name-articles")} RemarkLintNoFileNameArticles */
/** @typedef {import("remark-lint-no-file-name-consecutive-dashes")} RemarkLintNoFileNameConsecutiveDashes */
/** @typedef {import("remark-lint-no-file-name-outer-dashes")} RemarkLintNoFileNameOuterDashes */

// Additional missing plugin types for completeness
/** @typedef {import("remark-frontmatter")} RemarkFrontmatter */
/** @typedef {import("remark-gfm")} RemarkGfm */
/** @typedef {import("remark-preset-lint-recommended")} RemarkPresetLintRecommended */
/** @typedef {import("remark-preset-lint-consistent")} RemarkPresetLintConsistent */
/** @typedef {import("remark-preset-lint-markdown-style-guide")} RemarkPresetLintMarkdownStyleGuide */
/** @typedef {import("remark-lint-correct-media-syntax")} RemarkLintCorrectMediaSyntax */
/** @typedef {import("remark-lint-heading-whitespace")} RemarkLintHeadingWhitespace */
/** @typedef {import("remark-validate-links")} RemarkValidateLinks */
/** @typedef {import("remark-math")} RemarkMath */
/** @typedef {import("remark-wiki-link")} RemarkWikiLink */
/** @typedef {import("remark-directive")} RemarkDirective */
/** @typedef {import("remark-preset-prettier")} RemarkPresetPrettier */

/**
 * Remark settings for markdown processing
 *
 * @typedef {Object} RemarkSettings
 *
 * @property {boolean} [yaml] - Handle frontmatter in markdown files
 * @property {boolean} [commonmark] - Enable commonmark compliance
 * @property {boolean} [gfm] - Enable GitHub Flavored Markdown features
 * @property {"*" | "+" | "-"} [bullet] - Preferred unordered list marker
 * @property {"tab" | "one" | "mixed"} [listItemIndent] - List item indentation
 *   style
 * @property {"*" | "_"} [emphasis] - Character to use for emphasis
 * @property {"*" | "_"} [strong] - Character to use for strong emphasis
 * @property {boolean} [fences] - Use fenced code blocks
 * @property {"`" | "~"} [fence] - Character to use for fences
 * @property {"***" | "---"} [thematicBreak] - Marker to use for thematic breaks
 * @property {"ordered"} [style] - List style preference
 * @property {boolean} [referenceLinks] - Use reference-style links
 * @property {boolean} [incrementListMarker] - Increment ordered list markers
 * @property {'"' | "'"} [quote] - Preferred quote style for titles
 * @property {string} [rule] - Marker to use for rules
 * @property {number} [ruleRepetition] - Number of rule markers
 * @property {boolean} [ruleSpaces] - Whether to include spaces in rules
 * @property {boolean} [setext] - Use Setext-style headings
 * @property {boolean} [closeAtx] - Require closing hashes for ATX headings
 * @property {boolean} [resourceLink] - Enable resource-style links
 * @property {boolean} [tightDefinitions] - Use tight definitions
 */

/**
 * @typedef {Object} RemarkConfig
 *
 * @property {PluginEntry[]} plugins - Array of plugins and presets
 * @property {RemarkSettings} settings - Remark processing settings
 */

// Plugin-specific options types
/** @typedef {{ schemas?: Record<string, string[]> }} FrontmatterSchemaOptions */
/** @typedef {import("remark-lint-mdx-jsx-quote-style").Options} QuoteStyle */
/** @typedef {import("remark-lint-ordered-list-marker-value").Options} OrderedListMarkerValueOptions */
/** @typedef {import("remark-lint-file-extension").Options} FileExtensionOptions */
/** @typedef {{ entries?: { pattern: string; snippets: string[] }[] }} RequireSnippetsOptions */
/** @typedef {import("unified").Plugin<[RequireSnippetsOptions?], Root>} CustomValidationPlugin */

// Remark plugin option types (prefer real plugin-exported types where available)
/** @typedef {import("remark-toc").Options} RemarkTocOptions */
/** @typedef {{ collapseSpace?: boolean }} ReferenceLinksOptions */
/** @typedef {import("remark-lint-checkbox-character-style").Options} CheckboxCharacterStyleOptions */
/** @typedef {import("remark-lint-fenced-code-flag").Options} FencedCodeFlagOptions */
/**
 * @typedef {{
 *     passive?: boolean;
 *     illusion?: boolean;
 *     so?: boolean;
 *     thereIs?: boolean;
 *     weasel?: boolean;
 *     adverb?: boolean;
 *     tooWordy?: boolean;
 *     cliches?: boolean;
 *     eprime?: boolean;
 *     whitelist?: string[];
 * }} WriteGoodOptions
 */
/** @typedef {import("remark-validate-links").Options} ValidateLinksOptions */
/** @typedef {import("remark-lint-heading-style").Options} HeadingStyleOptions */
/** @typedef {import("remark-lint-rule-style").Options} RuleStyleOptions */
/** @typedef {import("remark-lint-code-block-style").Options} CodeBlockStyleOptions */
/** @typedef {import("remark-lint-fenced-code-marker").Options} FencedCodeMarkerOptions */
/** @typedef {import("remark-lint-emphasis-marker").Options} EmphasisMarkerOptions */
/** @typedef {import("remark-lint-strong-marker").Options} StrongMarkerOptions */
/** @typedef {import("remark-lint-unordered-list-marker-style").Options} UnorderedListMarkerStyleOptions */
/** @typedef {import("remark-lint-link-title-style").Options} LinkTitleStyleOptions */

// Missing option types that are actually used in the config
/** @typedef {{ case?: "lower" | "upper" }} FencedCodeFlagCaseOptions */
/** @typedef {{ skipUrlPatterns?: (string | RegExp)[] }} NoDeadUrlsOptions */

/** @type {RemarkConfig} */
const remarkConfig = {
    // Core plugins for GitHub Flavored Markdown and formatting integration
    plugins: [
        // Frontmatter support - must come early in plugin chain
        "remark-frontmatter",

        // GitHub Flavored Markdown support (tables, strikethrough, checkboxes, etc.)
        "remark-gfm",

        // Core remark-lint presets: recommended rules, consistency, and style guide
        "remark-preset-lint-recommended", // Recommended best practices
        "remark-preset-lint-consistent", // Consistency rules
        "remark-preset-lint-markdown-style-guide", // Enforce common style guide
        // Additional quality plugins that we have installed
        "remark-lint-correct-media-syntax", // Catch mismatched media/link syntax
        "remark-lint-heading-increment", // Ensure proper heading levels
        "@double-great/remark-lint-alt-text", // Require alt text for images
        "remark-lint-heading-whitespace", // Remove trailing whitespace in headings
        "remark-validate-links", // Validate internal links exist
        // Mathematical expressions
        "remark-math",
        "rehype-katex", // If you have math content
        // Bibliography and references
        "remark-wiki-link", // Support [[wiki-style]] links
        "remark-directive", // Enable :::directive syntax for lint rule coverage

        /** @type {[string, ReferenceLinksOptions]} */
        // ["remark-reference-links", { collapseSpace: false }],
        /** @type {string} */
        "remark-inline-links",
        // Content analysis
        /** @type {[string, ["warn", WriteGoodOptions]]} */
        [
            "remark-lint-write-good",
            [
                "warn",
                {
                    passive: false,
                    illusion: true,
                    so: true,
                    thereIs: true,
                    weasel: true,
                    adverb: false,
                    tooWordy: false,
                    cliches: true,
                    eprime: false,
                    whitelist: [
                        "read-only",
                        "monitor",
                        "MONITOR",
                        "expiration",
                        "up-time",
                        "uptime",
                        "IP",
                        "IPs",
                        "expiration",
                    ],
                },
            ],
        ],

        // Blockquote structure and directive hygiene
        ["remark-lint-blockquote-indentation", true], // Keep whitespace after `>` markers consistent
        ["remark-lint-no-blockquote-without-marker", true], // Avoid stray blank lines inside blockquotes
        "remark-lint-directive-attribute-sort",
        "remark-lint-directive-collapsed-attribute",
        "remark-lint-directive-quote-style",
        "remark-lint-directive-shortcut-attribute",
        "remark-lint-directive-unique-attribute-name",

        // Link and reference validation
        /** @type {[string, LinkTitleStyleOptions]} */
        ["remark-lint-link-title-style", '"'], // Consistent link titles
        "remark-lint-no-reference-like-url", // Prevent reference-style URLs without definitions
        ["remark-lint-definition-case", true], // Keep reference labels lowercase
        ["remark-lint-definition-sort", true], // Maintain alphabetical definition order
        ["remark-lint-final-definition", true], // Require definitions at the end of files
        ["remark-lint-media-style", "consistent"], // Detect initial link style and enforce it across the file
        ["remark-lint-no-unneeded-full-reference-image", true], // Collapse redundant full reference images
        ["remark-lint-no-unneeded-full-reference-link", true], // Collapse redundant full reference links
        ["remark-lint-no-unused-definitions", true], // Remove unused reference definitions

        // Basic formatting rules
        ["remark-lint-final-newline", true], // Ensure final newline
        ["remark-lint-no-tabs", true], // Prevent tab characters
        ["remark-lint-hard-break-spaces", true], // Enforce proper line breaks
        ["remark-lint-linebreak-style", "unix"], // Normalize files to LF endings
        ["remark-lint-no-missing-blank-lines", false], // Disabled: blank-line handling is delegated to Prettier and other rules
        ["remark-lint-no-paragraph-content-indent", true], // Disallow unintended paragraph indentation

        // List and heading formatting
        /** @type {[string, OrderedListMarkerValueOptions]} */
        ["remark-lint-ordered-list-marker-value", "ordered"], // Enforce incremental numbering (1, 2, 3, etc.)
        ["remark-lint-ordered-list-marker-style", "."], // Prefer `1.` list markers for readability
        ["remark-lint-list-item-indent", "one"], // Match our single-space indent preference
        ["remark-lint-no-multiple-toplevel-headings", false], // Allow multiple top-level headings per file
        ["remark-lint-no-consecutive-blank-lines", true], // Prevent multiple blank lines
        ["remark-lint-no-duplicate-definitions", true], // Prevent duplicate link definitions
        ["remark-lint-definition-spacing", true], // Enforce spacing in link definitions
        ["remark-lint-first-heading-level", 1], // Ensure documents start with an H1 for consistency
        ["remark-lint-no-duplicate-headings", true], // Catch repeated headings in entire doc
        ["remark-lint-no-duplicate-headings-in-section", true], // Catch repeated headings per section
        ["remark-lint-no-emphasis-as-heading", true], // Prevent emphasis masquerading as headings
        ["remark-lint-no-heading-content-indent", true], // Keep heading text flush with hashes
        ["remark-lint-no-heading-indent", true], // Disallow leading indentation before headings
        ["remark-lint-no-heading-like-paragraph", true], // Detect invalid deep heading markers
        ["remark-lint-no-empty-sections", true], // Require every heading to introduce content

        // Table formatting
        ["remark-lint-table-pipe-alignment", true], // Enforce table pipe alignment
        ["remark-lint-no-hidden-table-cell", true], // Prevent invisible overflow cells in tables
        ["remark-lint-list-item-bullet-indent", true], // Prevent list markers from being indented
        "remark-lint-list-item-content-indent", // Keep list item content aligned with the first child

        // Task list formatting
        /** @type {[string, CheckboxCharacterStyleOptions]} */
        [
            "remark-lint-checkbox-character-style",
            {
                checked: "x",
                unchecked: " ",
            },
        ], // Normalize task list checkbox characters
        ["remark-lint-checkbox-content-indent", true], // Prevent excessive spacing after checkboxes

        // Code block formatting
        /** @type {[string, FencedCodeFlagOptions]} */
        ["remark-lint-fenced-code-flag", { allowEmpty: false }], // Require language flag on fenced code blocks
        /** @type {[string, CodeBlockStyleOptions]} */
        ["remark-lint-code-block-style", "fenced"], // Prefer fenced code blocks
        /** @type {[string, FencedCodeMarkerOptions]} */
        ["remark-lint-fenced-code-marker", "`"], // Use backticks for fenced code blocks
        /** @type {[string, FencedCodeFlagCaseOptions]} */
        ["remark-lint-fenced-code-flag-case", { case: "lower" }], // Normalize language identifiers for Prettier compatibility
        "remark-lint-code-block-split-list", // Prevent poorly indented code fences from breaking list structure

        // Heading and rule formatting
        /** @type {[string, HeadingStyleOptions]} */
        ["remark-lint-heading-style", "atx"], // Enforce ATX-style headings without closing hashes
        /** @type {[string, RuleStyleOptions]} */
        ["remark-lint-rule-style", "***"], // Standardize thematic breaks to match Prettier output

        // Shell and reference formatting
        "remark-lint-no-shell-dollars", // Avoid $ prefixes on every shell command line
        "remark-lint-no-shortcut-reference-image", // Require full reference-style images
        "remark-lint-no-shortcut-reference-link", // Require full reference-style links
        "remark-lint-no-table-indentation", // Prevent tables from being indented
        "remark-lint-table-pipes", // Require opening/closing pipes on GFM tables
        ["remark-lint-no-html", false], // We rely on inline HTML for badges and layout snippets

        // File naming conventions
        ["remark-lint-no-file-name-irregular-characters", /[^-._\dA-Za-z]/], // Allow underscores in filenames
        ["remark-lint-no-file-name-mixed-case", true], // Enforce lowercase/kebab-case style filenames
        ["remark-lint-no-file-name-articles", true], // Avoid leading articles in filenames
        ["remark-lint-no-file-name-consecutive-dashes", true], // Prevent accidental double dashes
        ["remark-lint-no-file-name-outer-dashes", true], // Guard against leading/trailing dashes
        /** @type {[string, FileExtensionOptions]} */
        [
            "remark-lint-file-extension",
            { allowExtensionless: false, extensions: ["mdx", "md"] },
        ], // Allow .mdx files

        // Lenient settings for project-specific needs
        ["remark-lint-maximum-line-length", 5000], // Allow longer lines
        ["remark-lint-maximum-heading-length", 120], // Allow longer headings
        ["remark-lint-heading-capitalization", false], // Disable heading capitalization enforcement
        ["remark-lint-list-item-spacing", true], // More lenient about list spacing

        // Emphasis and style preferences
        /** @type {[string, EmphasisMarkerOptions]} */
        ["remark-lint-emphasis-marker", "consistent"], // Allow * or _ but require per-file consistency
        ["remark-lint-strikethrough-marker", "consistent"], // Keep ~~ delimiters uniform
        /** @type {[string, StrongMarkerOptions]} */
        ["remark-lint-strong-marker", "*"], // Prefer double asterisk for strong emphasis
        /** @type {[string, UnorderedListMarkerStyleOptions]} */
        ["remark-lint-unordered-list-marker-style", "-"], // Prefer hyphen list markers to match Prettier
        ["remark-lint-no-literal-urls", false], // Allow bare URLs for now
        ["remark-lint-no-heading-punctuation", /[!,.;]/u], // Disallow headings ending with ! , . or ;
        ["remark-lint-table-cell-padding", false], // Don't require padded table cells

        // URL and link validation
        "remark-lint-no-duplicate-defined-urls", // Prevent duplicate definitions that share URLs
        "remark-lint-no-empty-url", // Guard against empty link targets

        // Table of contents validation
        "remark-lint-check-toc", // Catch outdated manual TOCs before auto-generation rewrites them

        // Table of contents generation
        /** @type {[string, RemarkTocOptions]} */
        [
            "remark-toc",
            {
                heading: "table of contents|toc",
                maxDepth: 2,
                ordered: true,
                tight: true,
            },
        ],

        // TEMPORARILY DISABLED: This plugin can hang on network requests with many files
        // ['remark-lint-no-dead-urls', {
        //     skipUrlPatterns: [
        //         'localhost',
        //         '127.0.0.1',
        //         'http://localhost',
        //         'https://localhost',
        //         'file://',
        //         // Skip internal documentation links during development
        //         /^#/,
        //         // Skip relative paths
        //         /^\.\.?\//
        //     ]
        // }],

        // Frontmatter validation
        /** @type {[string, FrontmatterSchemaOptions]} */
        [
            "remark-lint-frontmatter-schema",
            {
                schemas: {
                    "config/schemas/doc-frontmatter.schema.json": [
                        // Architecture documentation
                        "docs/Architecture/**/*.md",
                        "docs/Architecture/**/*.mdx",
                        // Testing documentation
                        "docs/Testing/**/*.md",
                        "docs/Testing/**/*.mdx",
                        // Guides documentation
                        "docs/Guides/**/*.md",
                        "docs/Guides/**/*.mdx",
                        // Root docs files
                        "docs/*.md",
                        "docs/*.mdx",
                        // General pattern for any remaining docs
                        "docs/**/*.md",
                        "docs/**/*.mdx",
                        // MDX files anywhere (for Storybook stories, etc.)
                        "**/*.mdx",
                    ],
                },
            },
        ],

        // Custom Uptime Watcher validation rules
        /** @type {PluginEntry} */ (validateUptimeWatcherDocs),

        // Require specific code snippets in documentation
        /** @type {[CustomValidationPlugin, RequireSnippetsOptions]} */
        [
            requireSnippets,
            {
                entries: [
                    {
                        pattern:
                            "docs/Architecture/ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md",
                        snippets: [
                            "sitesApi.removeMonitor",
                            "SiteService.removeMonitor",
                        ],
                    },
                    {
                        pattern:
                            "docs/Architecture/Patterns/DEVELOPMENT_PATTERNS_GUIDE.md",
                        snippets: [
                            "SiteService.removeMonitor",
                            "validateSiteSnapshot",
                        ],
                    },
                ],
            },
        ],

        // MDX-specific rules (only apply to MDX files)
        "remark-lint-mdx-jsx-attribute-sort", // Keep props sorted using default alphabetical order
        /** @type {[string, QuoteStyle]} */
        ["remark-lint-mdx-jsx-quote-style", '"'], // Use double quotes in JSX
        ["remark-lint-mdx-jsx-self-close", true], // Enforce self-closing tags
        ["remark-lint-mdx-jsx-no-void-children", true], // Prevent children on void elements
        ["remark-lint-mdx-jsx-shorthand-attribute", true], // Prefer JSX shorthand for booleans
        "remark-lint-mdx-jsx-unique-attribute-name", // Avoid duplicate attribute names in MDX elements
        ["remark-lint-no-undefined-references", false], // Allow undefined references in MDX

        // Prettier integration for consistent formatting
        "remark-preset-prettier",
    ],

    // Settings for processing
    settings: {
        // Handle frontmatter in markdown files
        yaml: true,
        // Enable commonmark compliance
        commonmark: false,

        // Enable GitHub Flavored Markdown features
        gfm: true,

        // Formatting preferences (will be overridden by Prettier)
        bullet: "-", // Ensure unordered lists use hyphen markers like Prettier
        listItemIndent: "one", // Use consistent single-space indent for lists
        emphasis: "_",
        strong: "*",
        thematicBreak: "***",
        fences: true,
        fence: "`",
        style: "ordered", // This works with remark-lint-ordered-list-marker-value
        quote: '"',
        rule: "-",
        ruleRepetition: 3,
        ruleSpaces: false,
        setext: false,
        closeAtx: false, // Do not require closing # for atx headings
        resourceLink: false, // Disable resource link style
        // Link reference style
        referenceLinks: false,
        tightDefinitions: true,

        // Code block style
        incrementListMarker: true,
    },
};

export default remarkConfig;
