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
 */
// @ts-check

import requireSnippets from "./config/linting/remark/require-snippets.mjs";

// Type definitions for remark configuration
/** @typedef {import("unified").Preset} Preset */
/** @typedef {import("unified").Plugin} Plugin */
/**
 * @typedef {string
 *     | Plugin
 *     | Preset
 *     | [string | Plugin | Preset, ...unknown[]]} PluginEntry
 */

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
 */

/**
 * @typedef {Object} RemarkConfig
 *
 * @property {PluginEntry[]} plugins - Array of plugins and presets
 * @property {RemarkSettings} settings - Remark processing settings
 */

// Plugin-specific options types (using generic unknown where specific types aren't exported)
/** @typedef {{ schemas?: Record<string, unknown> }} FrontmatterSchemaOptions */
/** @typedef {'"' | "'"} QuoteStyle */
/** @typedef {"consistent" | "*" | "_"} EmphasisStyle */
/** @typedef {"one" | "ordered" | "single"} OrderedListMarkerValue */
/** @typedef {{ allowExtensionless?: boolean; extensions?: string[] }} FileExtensionOptions */

const remarkConfig = {
    // Core plugins for GitHub Flavored Markdown and formatting integration
    plugins: [
        // GitHub Flavored Markdown support (tables, strikethrough, checkboxes, etc.)
        "remark-gfm",

        // Use only one main preset to avoid conflicts
        "remark-preset-lint-recommended", // Recommended best practices
        "remark-preset-lint-consistent", // Consistency rules
        "remark-preset-lint-markdown-style-guide", // Enforce common style guide
        // Additional quality plugins that we have installed
        "remark-lint-correct-media-syntax", // Catch mismatched media/link syntax
        ["remark-lint-final-newline", true], // Ensure final newline
        ["remark-lint-no-tabs", true], // Prevent tab characters
        ["remark-lint-hard-break-spaces", true], // Enforce proper line breaks
        ["remark-lint-ordered-list-marker-value", "ordered"], // Enforce incremental numbering (1, 2, 3, etc.)
        ["remark-lint-no-multiple-toplevel-headings", false], // more than one top-level heading per file
        ["remark-lint-no-consecutive-blank-lines", true], // Prevent multiple blank lines
        ["remark-lint-no-duplicate-definitions", true], // Prevent duplicate link definitions
        ["remark-lint-definition-spacing", true], // Enforce spacing in link definitions
        ["remark-lint-table-pipe-alignment", true], // Enforce table pipe alignment
        ["remark-lint-list-item-bullet-indent", true], // Prevent list markers from being indented
        "remark-lint-list-item-content-indent", // Keep list item content aligned with the first child
        [
            "remark-lint-checkbox-character-style",
            {
                checked: "x",
                unchecked: " ",
            },
        ], // Normalize task list checkbox characters
        ["remark-lint-code-block-style", "fenced"], // Prefer fenced code blocks
        ["remark-lint-fenced-code-marker", "`"], // Use backticks for fenced code blocks
        ["remark-lint-heading-style", "atx"], // Enforce ATX-style headings without closing hashes
        ["remark-lint-rule-style", "***"], // Standardize thematic breaks to match Prettier output
        "remark-lint-no-shell-dollars", // Avoid $ prefixes on every shell command line
        "remark-lint-no-shortcut-reference-image", // Require full reference-style images
        "remark-lint-no-shortcut-reference-link", // Require full reference-style links
        "remark-lint-no-table-indentation", // Prevent tables from being indented
        "remark-lint-table-pipes", // Require opening/closing pipes on GFM tables
        // Allow project naming conventions
        ["remark-lint-no-file-name-irregular-characters", /[^-._\dA-Za-z]/], // Allow underscores in filenames
        ["remark-lint-no-file-name-mixed-case", true], // Allow mixed case in filenames
        [
            "remark-lint-file-extension",
            { allowExtensionless: false, extensions: ["mdx", "md"] },
        ], // Allow .mdx files

        // Disable problematic rules or override with more lenient settings
        ["remark-lint-maximum-line-length", 200], // Allow longer lines
        ["remark-lint-maximum-heading-length", 120], // Allow longer headings
        ["remark-lint-heading-capitalization", false], // Enforce consistent heading capitalization
        ["remark-lint-list-item-spacing", true], // More lenient about list spacing
        ["remark-lint-emphasis-marker", "consistent"], // Allow both * and _
        ["remark-lint-strong-marker", "*"], // Prefer double asterisk for strong emphasis
        ["remark-lint-unordered-list-marker-style", "-"], // Prefer hyphen list markers to match Prettier
        ["remark-lint-no-literal-urls", false], // Allow bare URLs for now
        ["remark-lint-no-heading-punctuation", /[!,.;]/u], // Allow punctuation in headings
        ["remark-lint-table-cell-padding", false], // Require padded table cells
        "remark-lint-no-duplicate-defined-urls", // Prevent duplicate definitions that share URLs
        "remark-lint-no-empty-url", // Guard against empty link targets
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
        [
            "remark-lint-frontmatter-schema",
            {
                schemas: {
                    /* Add schema validation for frontmatter if needed */
                },
            },
        ],

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
        ["remark-lint-mdx-jsx-quote-style", '"'], // Use double quotes in JSX
        ["remark-lint-mdx-jsx-self-close", true], // Enforce self-closing tags
        "remark-lint-mdx-jsx-unique-attribute-name", // Avoid duplicate attribute names in MDX elements
        ["remark-lint-no-undefined-references", false], // Allow undefined references in MDX

        // Prettier integration for consistent formatting
        "remark-preset-prettier",
    ],

    // Settings for processing
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
