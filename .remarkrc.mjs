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

// Plugin-specific options types
/** @typedef {{ schemas?: Record<string, string[]> }} FrontmatterSchemaOptions */
/** @typedef {'"' | "'"} QuoteStyle */
/** @typedef {"consistent" | "*" | "_"} EmphasisStyle */
/** @typedef {"one" | "ordered" | "single"} OrderedListMarkerValue */
/** @typedef {{ allowExtensionless?: boolean; extensions?: string[] }} FileExtensionOptions */
/** @typedef {{ entries?: { pattern: string; snippets: string[] }[] }} RequireSnippetsOptions */
/** @typedef {() => (tree: Root, file: VFile) => void} CustomValidationPlugin */

// Remark plugin option types
/**
 * @typedef {{
 *     tight?: boolean;
 *     ordered?: boolean;
 *     heading?: string;
 *     maxDepth?: number;
 *     parents?: string[];
 * }} RemarkTocOptions
 */
/** @typedef {{ collapseSpace?: boolean }} ReferenceLinksOptions */
/** @typedef {{ checked?: string; unchecked?: string }} CheckboxCharacterStyleOptions */
/** @typedef {{ allowEmpty?: boolean; flags?: string[] }} FencedCodeFlagOptions */
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
/** @typedef {{ skipUrlPatterns?: (string | RegExp)[] }} ValidateLinksOptions */
/** @typedef {{ style?: "atx" | "atx-closed" | "setext" }} HeadingStyleOptions */
/** @typedef {{ marker?: string }} RuleStyleOptions */
/** @typedef {{ style?: "fenced" | "indented" }} CodeBlockStyleOptions */
/** @typedef {{ marker?: "`" | "~" }} FencedCodeMarkerOptions */
/** @typedef {{ style?: "consistent" | "*" | "_" }} EmphasisMarkerOptions */
/** @typedef {{ style?: "consistent" | "*" | "**" | "__" }} StrongMarkerOptions */
/** @typedef {{ style?: "consistent" | "*" | "+" | "-" }} UnorderedListMarkerStyleOptions */
/** @typedef {{ style?: "one" | "ordered" | "single" }} OrderedListMarkerValueOptions */
/** @typedef {{ style?: '"' | "'" | "consistent" }} LinkTitleStyleOptions */

const remarkConfig = {
    // Core plugins for GitHub Flavored Markdown and formatting integration
    plugins: [
        // Frontmatter support - must come early in plugin chain
        "remark-frontmatter",

        // GitHub Flavored Markdown support (tables, strikethrough, checkboxes, etc.)
        "remark-gfm",

        // Use only one main preset to avoid conflicts
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
        // "remark-wiki-link", // Support [[wiki-style]] links

        /** @type {[string, ReferenceLinksOptions]} */
        ["remark-reference-links", { collapseSpace: false }],

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

        // Link and reference validation
        /** @type {[string, LinkTitleStyleOptions]} */
        ["remark-lint-link-title-style", '"'], // Consistent link titles
        "remark-lint-no-reference-like-url", // Prevent reference-style URLs without definitions

        // Basic formatting rules
        ["remark-lint-final-newline", true], // Ensure final newline
        ["remark-lint-no-tabs", true], // Prevent tab characters
        ["remark-lint-hard-break-spaces", true], // Enforce proper line breaks

        // List and heading formatting
        /** @type {[string, OrderedListMarkerValueOptions]} */
        ["remark-lint-ordered-list-marker-value", "ordered"], // Enforce incremental numbering (1, 2, 3, etc.)
        ["remark-lint-no-multiple-toplevel-headings", false], // Allow multiple top-level headings per file
        ["remark-lint-no-consecutive-blank-lines", true], // Prevent multiple blank lines
        ["remark-lint-no-duplicate-definitions", true], // Prevent duplicate link definitions
        ["remark-lint-definition-spacing", true], // Enforce spacing in link definitions

        // Table formatting
        ["remark-lint-table-pipe-alignment", true], // Enforce table pipe alignment
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

        // Code block formatting
        /** @type {[string, FencedCodeFlagOptions]} */
        ["remark-lint-fenced-code-flag", { allowEmpty: false }], // Require language flag on fenced code blocks
        /** @type {[string, CodeBlockStyleOptions]} */
        ["remark-lint-code-block-style", "fenced"], // Prefer fenced code blocks
        /** @type {[string, FencedCodeMarkerOptions]} */
        ["remark-lint-fenced-code-marker", "`"], // Use backticks for fenced code blocks

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

        // File naming conventions
        ["remark-lint-no-file-name-irregular-characters", /[^-._\dA-Za-z]/], // Allow underscores in filenames
        ["remark-lint-no-file-name-mixed-case", true], // Allow mixed case in filenames
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
        ["remark-lint-emphasis-marker", "consistent"], // Allow both * and _
        /** @type {[string, StrongMarkerOptions]} */
        ["remark-lint-strong-marker", "*"], // Prefer double asterisk for strong emphasis
        /** @type {[string, UnorderedListMarkerStyleOptions]} */
        ["remark-lint-unordered-list-marker-style", "-"], // Prefer hyphen list markers to match Prettier
        ["remark-lint-no-literal-urls", false], // Allow bare URLs for now
        ["remark-lint-no-heading-punctuation", /[!,.;]/u], // Allow punctuation in headings
        ["remark-lint-table-cell-padding", false], // Don't require padded table cells

        // URL and link validation
        "remark-lint-no-duplicate-defined-urls", // Prevent duplicate definitions that share URLs
        "remark-lint-no-empty-url", // Guard against empty link targets

        // Table of contents generation
        /** @type {[string, RemarkTocOptions]} */
        [
            "remark-toc",
            {
                heading: "table of contents|toc",
                maxDepth: 1,
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
                        "docs/**/*.md",
                        "**/*.mdx",
                    ],
                },
            },
        ],

        // Custom Uptime Watcher validation rules
        validateUptimeWatcherDocs,

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
        /** @type {[string, QuoteStyle]} */
        ["remark-lint-mdx-jsx-quote-style", '"'], // Use double quotes in JSX
        ["remark-lint-mdx-jsx-self-close", true], // Enforce self-closing tags
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
