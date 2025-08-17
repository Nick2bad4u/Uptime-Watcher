/**
 * Tailwind CSS v4 configuration for the Uptime Watcher application.
 *
 * Modern CSS-first configuration following Tailwind CSS v4 best practices:
 *
 * - Zero-config approach with minimal JavaScript configuration
 * - All theme customization moved to CSS using @theme directive
 * - Dark mode handled via CSS @media queries
 * - Plugins configured in CSS using @layer and @utility directives
 * - Optimized content paths for Electron + React architecture
 *
 * This replaces the complex JavaScript configuration approach of v3 with a
 * clean, maintainable CSS-first approach for better performance.
 */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./electron/**/*.{js,ts}",
        // Test files are not excluded here; handle exclusion via your build tool (e.g., Vite config or Vitest config) if needed
    ],
    // Tailwind v4: While most customization is done in CSS, this minimal JS config is still required
    // For specifying content paths so Tailwind can scan files for class usage and integrate with build tools.
    // Dark mode, themes, and all customization handled in index.css
    plugins: [
        // Tailwind v4 uses CSS-first configuration - no plugins needed here
        // All customization is done via CSS directives in index.css:
        // @theme, @utility, @layer, @variant, etc.
    ],
};
