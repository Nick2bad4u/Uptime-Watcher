/* eslint-disable no-inline-comments */
/**
 * PostCSS configuration for the Uptime Watcher application.
 * Configures Tailwind CSS v4 processing, autoprefixer, and additional plugins for enhanced CSS workflows.
 */

export default {
    $schema: "https://www.schemastore.org/postcssrc.json",
    plugins: {
        "@tailwindcss/postcss": {}, // Tailwind CSS v4 PostCSS plugin
        autoprefixer: {
            grid: "autoplace", // Enable CSS Grid Autoplace feature
            overrideBrowserslist: [
                "> 1%",
                "last 2 versions",
                "Firefox ESR",
                "not dead",
                "not IE 11",
            ],
        },
        "postcss-assets": {
            basePath: "./src", // Set to your source directory
            cachebuster: true, // Enable cache busting for assets
            loadPaths: [
                "assets/", // WASM and binary assets
                "icons/", // Favicon and app icons
                "src/assets/", // Source assets if any
                "html/", // HTML assets
            ],
        },
        "postcss-inline-svg": {
            paths: ["./icons", "./assets", "./src/assets"], // Directories to search for SVGs
            removeFill: true, // Remove fill attributes for easier theming
            removeStroke: false, // Keep stroke attributes for icon consistency
        },
        "postcss-reporter": {
            clearReportedMessages: true,
            formatter: "default", // Use default formatter for clear output
            throwError: false, // Don't break builds on warnings
        },
    },
};
