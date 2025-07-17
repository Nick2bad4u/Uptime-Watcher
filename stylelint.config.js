/**
 * Stylelint configuration for the Uptime Watcher project.
 * Enforces CSS/SCSS coding standards and best practices.
 *
 * Extends stylelint-config-standard which provides sensible defaults
 * for CSS property order, formatting, and modern CSS practices.
 */
/** @type {import('stylelint').Config} */
module.exports = {
    extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
    rules: {
        // You can add Tailwind-specific or custom rules here if needed
    },
};
