/**
 * ThemeManager class for handling theme selection, system preference detection,
 * and theme switching throughout the application.
 *
 * Note: Empty constructor and no-op functions are intentional design patterns.
 */

import { themes } from "./themes";
import { Theme, ThemeName } from "./types";
import { deepMergeTheme } from "./utils/themeMerging";

/**
 * Singleton service for managing application themes.
 * Handles theme selection, system preference detection, and automatic switching.
 */
export class ThemeManager {
    /** Singleton instance */
    private static instance: ThemeManager | undefined;

    /**
     * Get the singleton instance of ThemeManager.
     * Creates the instance if it doesn't exist.
     *
     * @returns ThemeManager singleton instance
     */
    public static getInstance(): ThemeManager {
        ThemeManager.instance ??= new ThemeManager();
        return ThemeManager.instance;
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme: Theme): void {
        if (typeof document === "undefined") {
            return;
        }

        const root = document.documentElement;

        this.applyColors(root, theme.colors);
        this.applyTypography(root, theme.typography);
        this.applySpacing(root, theme.spacing);
        this.applyShadows(root, theme.shadows);
        this.applyBorderRadius(root, theme.borderRadius);
        this.applyThemeClasses(theme);
    }

    /**
     * Create a custom theme based on an existing theme.
     *
     * @param baseTheme - The base theme to extend from
     * @param overrides - Partial theme object with properties to override
     * @returns New theme with deep-merged properties
     *
     * @remarks
     * This method performs a deep merge of the override properties into the base theme,
     * ensuring that nested objects are properly merged rather than replaced entirely.
     * This allows for granular customization while preserving unmodified properties.
     */
    createCustomTheme(baseTheme: Theme, overrides: Partial<Theme>): Theme {
        return deepMergeTheme(baseTheme, overrides);
    }

    /**
     * Generate CSS variables string for a theme
     */
    generateCSSVariables(theme: Theme): string {
        const variables: string[] = [];

        // Colors
        for (const [category, colors] of Object.entries(theme.colors)) {
            if (typeof colors === "object" && colors !== null) {
                // Type-safe access to color values - colors are either string or nested color objects
                for (const [key, value] of Object.entries(colors as Record<string, string>)) {
                    variables.push(`  --color-${category}-${key}: ${value};`);
                }
            } else {
                variables.push(`  --color-${category}: ${colors};`);
            }
        }

        // Typography
        for (const [size, value] of Object.entries(theme.typography.fontSize)) {
            variables.push(`  --font-size-${size}: ${value};`);
        }

        for (const [weight, value] of Object.entries(theme.typography.fontWeight)) {
            variables.push(`  --font-weight-${weight}: ${value};`);
        }

        for (const [height, value] of Object.entries(theme.typography.lineHeight)) {
            variables.push(`  --line-height-${height}: ${value};`);
        }

        // Spacing
        for (const [size, value] of Object.entries(theme.spacing)) {
            variables.push(`  --spacing-${size}: ${value};`);
        }

        // Shadows
        for (const [size, value] of Object.entries(theme.shadows)) {
            variables.push(`  --shadow-${size}: ${value};`);
        }

        // Border radius
        for (const [size, value] of Object.entries(theme.borderRadius)) {
            variables.push(`  --radius-${size}: ${value};`);
        }

        return `:root {\n${variables.join("\n")}\n}`;
    }

    /**
     * Get all available theme names.
     *
     * @returns Array of available theme names including system
     *
     * @remarks
     * Dynamically generates the list from the themes object to ensure consistency.
     * Always includes "system" for automatic theme detection.
     */
    getAvailableThemes(): ThemeName[] {
        const themeNames = Object.keys(themes) as ThemeName[];
        return [...themeNames, "system"];
    }

    /**
     * Get system theme preference from OS/browser settings.
     * Uses CSS media query to detect dark mode preference.
     *
     * @returns "dark" if user prefers dark mode, "light" otherwise
     *
     * @remarks
     * In SSR or non-browser environments where window is undefined,
     * this method will fallback to "light" theme as the default.
     * This ensures safe operation across all deployment environments.
     */
    getSystemThemePreference(): "dark" | "light" {
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    }

    /**
     * Get theme by name, with automatic system theme detection.
     * Handles "system" theme by detecting user's OS preference.
     *
     * @param name - Theme name to retrieve
     * @returns Theme object containing colors, typography, and spacing
     */
    getTheme(name: ThemeName): Theme {
        if (name === "system") {
            const systemPreference = this.getSystemThemePreference();
            // eslint-disable-next-line security/detect-object-injection -- always light or dark
            return themes[systemPreference];
        }

        return themes[name as keyof typeof themes];
    }

    /**
     * Validate if theme name is valid
     */
    isValidThemeName(name: string): name is ThemeName {
        return this.getAvailableThemes().includes(name as ThemeName);
    }

    /**
     * Listen for system theme changes and call callback when detected.
     * Useful for automatic theme switching when user changes OS settings.
     *
     * @param callback - Function to call when system theme changes
     * @returns Cleanup function to remove the event listener
     */
    onSystemThemeChange(callback: (isDark: boolean) => void): () => void {
        if (typeof window === "undefined") {
            return () => {};
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => callback(e.matches);

        mediaQuery.addEventListener("change", handler);

        // Return cleanup function
        return () => mediaQuery.removeEventListener("change", handler);
    }

    /**
     * Apply border radius CSS custom properties
     */
    private applyBorderRadius(root: HTMLElement, borderRadius: Theme["borderRadius"]): void {
        for (const [size, value] of Object.entries(borderRadius)) {
            root.style.setProperty(`--radius-${size}`, String(value));
        }
    }

    /**
     * Apply color CSS custom properties
     */
    private applyColors(root: HTMLElement, colors: Theme["colors"]): void {
        for (const [category, colorValue] of Object.entries(colors)) {
            if (typeof colorValue === "object" && colorValue !== null) {
                // Type-safe access to color values - colorValue is a nested color object with string values
                for (const [key, value] of Object.entries(colorValue as Record<string, string>)) {
                    root.style.setProperty(`--color-${category}-${key}`, String(value));
                }
            } else {
                root.style.setProperty(`--color-${category}`, String(colorValue));
            }
        }
    }

    /**
     * Apply shadow CSS custom properties
     */
    private applyShadows(root: HTMLElement, shadows: Theme["shadows"]): void {
        for (const [size, value] of Object.entries(shadows)) {
            root.style.setProperty(`--shadow-${size}`, String(value));
        }
    }

    /**
     * Apply spacing CSS custom properties
     */
    private applySpacing(root: HTMLElement, spacing: Theme["spacing"]): void {
        for (const [size, value] of Object.entries(spacing)) {
            root.style.setProperty(`--spacing-${size}`, String(value));
        }
    }

    /**
     * Apply theme classes to document elements.
     *
     * @param theme - Theme to apply classes for
     *
     * @remarks
     * Safely removes old theme classes and applies new ones.
     * Includes safety checks for SSR and non-browser environments.
     */
    private applyThemeClasses(theme: Theme): void {
        if (typeof document === "undefined") {
            return;
        }

        const root = document.documentElement;
        const availableThemes = Object.keys(themes);

        // Remove existing theme classes precisely
        for (const themeName of availableThemes) {
            document.body.classList.remove(`theme-${themeName}`);
        }

        // Add current theme class
        document.body.classList.add(`theme-${theme.name}`);

        // Set dark mode class for Tailwind CSS
        if (theme.isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }

    /**
     * Apply typography CSS custom properties
     */
    private applyTypography(root: HTMLElement, typography: Theme["typography"]): void {
        for (const [size, value] of Object.entries(typography.fontSize)) {
            root.style.setProperty(`--font-size-${size}`, String(value));
        }

        for (const [weight, value] of Object.entries(typography.fontWeight)) {
            root.style.setProperty(`--font-weight-${weight}`, String(value));
        }

        for (const [height, value] of Object.entries(typography.lineHeight)) {
            root.style.setProperty(`--line-height-${height}`, String(value));
        }
    }
}

/**
 * Global theme manager singleton instance.
 *
 * @remarks
 * Provides convenient access to theme management functionality throughout
 * the application. This singleton ensures consistent theme state and
 * provides a centralized API for theme operations.
 *
 * @example
 * ```typescript
 * import { themeManager } from './ThemeManager';
 *
 * // Apply a theme
 * const theme = themeManager.getTheme('dark');
 * themeManager.applyTheme(theme);
 *
 * // Listen for system theme changes
 * const cleanup = themeManager.onSystemThemeChange((isDark) => {
 *   console.log('System theme changed:', isDark ? 'dark' : 'light');
 * });
 * ```
 *
 * @public
 */
export const themeManager = ThemeManager.getInstance();
