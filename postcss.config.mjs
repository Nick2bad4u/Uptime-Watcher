/* eslint-disable perfectionist/sort-objects */
/* eslint-disable sort-keys */
/* eslint-disable no-inline-comments */
/**
 * PostCSS configuration for the Uptime Watcher application.
 *
 * Features:
 *
 * - Tailwind CSS v4 processing with PostCSS plugin
 * - Import resolution and CSS bundling
 * - Browser compatibility with autoprefixer
 * - Flexbox bug fixes for cross-browser compatibility
 * - Asset management with cache busting
 * - SVG inlining with theming support
 * - CSS normalization for consistent base styles
 * - Media query optimization and sorting
 * - Duplicate selector combining for smaller bundles
 * - Production minification with cssnano (advanced preset)
 * - Development reporting and debugging
 */

const isProduction = process.env.NODE_ENV === "production";

export default {
    $schema: "https://www.schemastore.org/postcssrc.json",
    plugins: {
        // Import handling - resolve @import statements first
        "postcss-import": {
            path: ["src", "node_modules"],
            plugins: [], // Additional plugins to run on imported files
        },

        // Tailwind CSS v4 PostCSS plugin - the only plugin needed for Tailwind v4
        "@tailwindcss/postcss": {},

        // Modern CSS features for better browser support
        "postcss-logical": {
            // Enables logical properties and values for better i18n support
            preserve: true, // Keep both logical and physical for backward compatibility
        },

        // CSS normalization for consistent base styles
        "postcss-normalize": {
            browsers: [
                "> 1%",
                "last 2 versions",
                "Firefox ESR",
                "not dead",
                "not IE 11",
            ],
            forceImport: false, // Don't automatically inject normalize.css
        },

        // Better clamp() support for modern responsive design
        "postcss-clamp": {
            // Processes clamp() for better browser compatibility
            // Especially useful for fluid typography and spacing
        },

        // Viewport height correction for mobile and desktop apps
        "postcss-viewport-height-correction": {
            // Fixes 100vh issues in mobile browsers and Electron
            // Adds fallback for browsers that don't support dynamic viewport units
        },

        // Round sub-pixel values for crisp rendering
        "postcss-round-subpixels": {
            // Rounds sub-pixel values to nearest full pixel
            // Improves rendering consistency across devices
        },

        // Flexbox bug fixes for cross-browser compatibility
        "postcss-flexbugs-fixes": {},

        // Browser compatibility with vendor prefixes
        autoprefixer: {
            flexbox: "no-2009", // Disable old flexbox spec support
            grid: "autoplace", // Enable CSS Grid Autoplace feature
            overrideBrowserslist: [
                "> 1%",
                "last 2 versions",
                "Firefox ESR",
                "not dead",
                "not IE 11",
            ],
        },

        // Asset management with cache busting
        "postcss-assets": {
            basePath: "./src",
            cachebuster: true,
            loadPaths: [
                "assets/", // WASM and binary assets
                "icons/", // Favicon and app icons
                "src/assets/", // Source assets
                "html/", // HTML assets
            ],
            relative: true, // Use relative paths
        },

        // SVG inlining with theming support
        "postcss-inline-svg": {
            encode: true, // URL encode the SVG
            paths: ["./icons", "./assets", "./src/assets"],
            removeFill: true, // Remove fill for easier theming
            removeStroke: false, // Keep stroke for consistency
        },

        // Optimization plugins for production builds
        ...(isProduction && {
            // Combine duplicate selectors for smaller bundles
            "postcss-combine-duplicated-selectors": {
                removeDuplicatedProperties: true,
                removeDuplicatedValues: true,
            },

            // Sort and optimize media queries
            "postcss-sort-media-queries": {
                sort: "mobile-first", // Mobile-first sorting
            },

            // Advanced CSS minification and optimization (should be last)
            cssnano: {
                preset: [
                    "cssnano-preset-advanced",
                    {
                        // Reduce calc() expressions
                        calc: {
                            precision: 3,
                        },
                        // Color optimization
                        colormin: {
                            legacy: false, // Use modern color formats
                        },
                        // Preserve important comments
                        discardComments: {
                            removeAll: false,
                            removeAllButFirst: false,
                        },
                        // Preserve custom properties for theming
                        discardUnused: false,
                        // Safe merging of longhand properties
                        mergeRules: true,
                        // Normalize display values
                        normalizeDisplayValues: true,
                        // Convert long selectors to shorter ones
                        reduceIdents: false, // Keep custom property names
                        // Z-index optimization
                        zindex: false, // Don't modify z-index values
                    },
                ],
            },
        }),

        // Development and debugging plugins (non-production)
        ...(!isProduction && {
            // Reporter for development builds
            "postcss-reporter": {
                clearReportedMessages: true,
                throwError: false,
            },
        }),
    },
};
