/**
 * PostCSS configuration for the Uptime Watcher application.
 * Configures Tailwind CSS processing and autoprefixer for cross-browser compatibility.
 */

/* eslint-disable no-undef, unicorn/prefer-module */
module.exports = {
    plugins: {
        "@tailwindcss/postcss": {},
        autoprefixer: {},
    },
};
/* eslint-enable no-undef, unicorn/prefer-module */
