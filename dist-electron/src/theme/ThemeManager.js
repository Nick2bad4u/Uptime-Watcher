"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeManager = exports.ThemeManager = void 0;
const themes_1 = require("./themes");
class ThemeManager {
    constructor() { }
    static getInstance() {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }
    /**
     * Get theme by name
     */
    getTheme(name) {
        if (name === "system") {
            const systemPreference = this.getSystemThemePreference();
            return themes_1.themes[systemPreference];
        }
        return themes_1.themes[name] || themes_1.themes.light;
    }
    /**
     * Get system theme preference
     */
    getSystemThemePreference() {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    }
    /**
     * Listen for system theme changes
     */
    onSystemThemeChange(callback) {
        if (typeof window === "undefined" || !window.matchMedia) {
            return () => { };
        }
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => callback(e.matches);
        mediaQuery.addEventListener("change", handler);
        // Return cleanup function
        return () => mediaQuery.removeEventListener("change", handler);
    }
    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        if (typeof document === "undefined")
            return;
        const root = document.documentElement;
        // Apply CSS custom properties
        Object.entries(theme.colors).forEach(([category, colors]) => {
            if (typeof colors === "object" && colors !== null) {
                Object.entries(colors).forEach(([key, value]) => {
                    root.style.setProperty(`--color-${category}-${key}`, String(value));
                });
            }
            else {
                root.style.setProperty(`--color-${category}`, String(colors));
            }
        });
        // Apply typography
        Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
            root.style.setProperty(`--font-size-${size}`, value);
        });
        Object.entries(theme.typography.fontWeight).forEach(([weight, value]) => {
            root.style.setProperty(`--font-weight-${weight}`, value);
        });
        Object.entries(theme.typography.lineHeight).forEach(([height, value]) => {
            root.style.setProperty(`--line-height-${height}`, value);
        });
        // Apply spacing
        Object.entries(theme.spacing).forEach(([size, value]) => {
            root.style.setProperty(`--spacing-${size}`, value);
        });
        // Apply shadows
        Object.entries(theme.shadows).forEach(([size, value]) => {
            root.style.setProperty(`--shadow-${size}`, value);
        });
        // Apply border radius
        Object.entries(theme.borderRadius).forEach(([size, value]) => {
            root.style.setProperty(`--radius-${size}`, value);
        });
        // Set theme class on body
        document.body.className = document.body.className.replace(/theme-\w+/g, "").trim();
        document.body.classList.add(`theme-${theme.name}`);
        // Set dark mode class for Tailwind compatibility
        if (theme.isDark) {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }
    }
    /**
     * Create a custom theme based on an existing theme
     */
    createCustomTheme(baseTheme, overrides) {
        return {
            ...baseTheme,
            ...overrides,
            colors: {
                ...baseTheme.colors,
                ...overrides.colors,
            },
            typography: {
                ...baseTheme.typography,
                ...overrides.typography,
            },
            spacing: {
                ...baseTheme.spacing,
                ...overrides.spacing,
            },
            shadows: {
                ...baseTheme.shadows,
                ...overrides.shadows,
            },
            borderRadius: {
                ...baseTheme.borderRadius,
                ...overrides.borderRadius,
            },
        };
    }
    /**
     * Get all available theme names
     */
    getAvailableThemes() {
        return ["light", "dark", "high-contrast", "system"];
    }
    /**
     * Validate if theme name is valid
     */
    isValidThemeName(name) {
        return this.getAvailableThemes().includes(name);
    }
    /**
     * Generate CSS variables string for a theme
     */
    generateCSSVariables(theme) {
        const variables = [];
        // Colors
        Object.entries(theme.colors).forEach(([category, colors]) => {
            if (typeof colors === "object" && colors !== null) {
                Object.entries(colors).forEach(([key, value]) => {
                    variables.push(`  --color-${category}-${key}: ${value};`);
                });
            }
            else {
                variables.push(`  --color-${category}: ${colors};`);
            }
        });
        // Typography
        Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
            variables.push(`  --font-size-${size}: ${value};`);
        });
        Object.entries(theme.typography.fontWeight).forEach(([weight, value]) => {
            variables.push(`  --font-weight-${weight}: ${value};`);
        });
        Object.entries(theme.typography.lineHeight).forEach(([height, value]) => {
            variables.push(`  --line-height-${height}: ${value};`);
        });
        // Spacing
        Object.entries(theme.spacing).forEach(([size, value]) => {
            variables.push(`  --spacing-${size}: ${value};`);
        });
        // Shadows
        Object.entries(theme.shadows).forEach(([size, value]) => {
            variables.push(`  --shadow-${size}: ${value};`);
        });
        // Border radius
        Object.entries(theme.borderRadius).forEach(([size, value]) => {
            variables.push(`  --radius-${size}: ${value};`);
        });
        return `:root {\n${variables.join("\n")}\n}`;
    }
}
exports.ThemeManager = ThemeManager;
exports.themeManager = ThemeManager.getInstance();
