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
 */

// Type definitions for remark configuration
/** @typedef {import("unified").Preset} Preset */
/** @typedef {import("unified").Plugin} Plugin */
/** @typedef {string | [string, ...unknown[]]} PluginTuple */
/** @typedef {string | Plugin | Preset | PluginTuple} PluginEntry */

/**
 * Remark settings for markdown processing
 *
 * @typedef {Object} RemarkSettings
 *
 * @property {boolean} [yaml] - Handle frontmatter in markdown files
 * @property {boolean} [commonmark] - Enable commonmark compliance
 * @property {boolean} [gfm] - Enable GitHub Flavored Markdown features
 * @property {"tab" | "one" | "mixed"} [listItemIndent] - List item indentation
 *   style
 * @property {"*" | "_"} [emphasis] - Character to use for emphasis
 * @property {"*" | "_"} [strong] - Character to use for strong emphasis
 * @property {boolean} [fences] - Use fenced code blocks
 * @property {"`" | "~"} [fence] - Character to use for fences
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

/** @type {RemarkConfig} */
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
        ["remark-lint-final-newline", true], // Ensure final newline
        ["remark-lint-no-tabs", true], // Prevent tab characters
        ["remark-lint-hard-break-spaces", true], // Enforce proper line breaks
        ["remark-lint-ordered-list-marker-value", "ordered"], // Enforce incremental numbering (1, 2, 3, etc.)

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
        ["remark-lint-no-literal-urls", false], // Allow bare URLs for now
        ["remark-lint-no-heading-punctuation", /[!,.;]/u], // Allow punctuation in headings
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

        // MDX-specific rules (only apply to MDX files)
        ["remark-lint-mdx-jsx-quote-style", '"'], // Use double quotes in JSX
        ["remark-lint-mdx-jsx-self-close", true], // Enforce self-closing tags
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
        listItemIndent: "one", // Use consistent single-space indent for lists
        emphasis: "*",
        strong: "_",
        fences: true,
        fence: "`",
        style: "ordered", // This works with remark-lint-ordered-list-marker-value

        // Link reference style
        referenceLinks: false,

        // Code block style
        incrementListMarker: true,
    },
};

export default remarkConfig;
