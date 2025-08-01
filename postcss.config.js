/* eslint-disable no-inline-comments */
/* eslint-disable unicorn/prefer-module */
/**
 * PostCSS configuration for the Uptime Watcher application.
 * Configures Tailwind CSS processing, autoprefixer, and additional plugins for enhanced CSS workflows.
 */

module.exports = {
    plugins: {
        "@tailwindcss/postcss": {},
        autoprefixer: {},
        "postcss-assets": {
            basePath: "./src", // Set to your source directory if needed
            cachebuster: true, // Enable cache busting for assets
            loadPaths: ["assets/", "icons/", "images/"], // Adjust as needed for your project structure
        },
        "postcss-inline-svg": {
            paths: ["./icons", "./assets"], // Directories to search for SVGs
            removeFill: true, // Remove fill attributes for easier theming
        },
        "postcss-reporter": {
            clearReportedMessages: true,
            throwError: false,
        },
    },
};
