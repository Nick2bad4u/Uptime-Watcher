/**
 * ThemeManager class for handling theme selection, system preference detection,
 * and theme switching throughout the application.
 *
 * Note: Empty constructor and no-op functions are intentional design patterns.
 */

/* eslint-disable @typescript-eslint/no-empty-function */

import { themes } from "./themes";
import { Theme, ThemeName } from "./types";

/**
 * Singleton service for managing application themes.
 * Handles theme selection, system preference detection, and automatic switching.
 */
export class ThemeManager {
    /** Singleton instance */
    private static instance: ThemeManager | null = null;

    /** Private constructor to enforce singleton pattern */
    private constructor() {}

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
     * Get system theme preference from OS/browser settings.
     * Uses CSS media query to detect dark mode preference.
     *
     * @returns "dark" if user prefers dark mode, "light" otherwise
     */
    getSystemThemePreference(): "light" | "dark" {
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
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
     * Apply color CSS custom properties
     */
    private applyColors(root: HTMLElement, colors: Theme["colors"]): void {
        for (const [category, colorValue] of Object.entries(colors)) {
            if (typeof colorValue === "object" && colorValue !== null) {
                for (const [key, value] of Object.entries(colorValue as Record<string, unknown>)) {
                    root.style.setProperty(`--color-${category}-${key}`, String(value));
                }
            } else {
                root.style.setProperty(`--color-${category}`, String(colorValue));
            }
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

    /**
     * Apply spacing CSS custom properties
     */
    private applySpacing(root: HTMLElement, spacing: Theme["spacing"]): void {
        for (const [size, value] of Object.entries(spacing)) {
            root.style.setProperty(`--spacing-${size}`, String(value));
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
     * Apply border radius CSS custom properties
     */
    private applyBorderRadius(root: HTMLElement, borderRadius: Theme["borderRadius"]): void {
        for (const [size, value] of Object.entries(borderRadius)) {
            root.style.setProperty(`--radius-${size}`, String(value));
        }
    }

    /**
     * Apply theme classes to document elements
     */
    private applyThemeClasses(theme: Theme): void {
        const root = document.documentElement;

        // Set theme class on body
        document.body.className = document.body.className.replaceAll(/theme-\w+/g, "").trim();
        document.body.classList.add(`theme-${theme.name}`);

        // Set dark mode class for Tailwind CSS
        if (theme.isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }

    /**
     * Create a custom theme based on an existing theme
     */
    createCustomTheme(baseTheme: Theme, overrides: Partial<Theme>): Theme {
        return {
            ...baseTheme,
            ...overrides,
            borderRadius: {
                ...baseTheme.borderRadius,
                ...overrides.borderRadius,
            },
            colors: {
                ...baseTheme.colors,
                ...overrides.colors,
            },
            shadows: {
                ...baseTheme.shadows,
                ...overrides.shadows,
            },
            spacing: {
                ...baseTheme.spacing,
                ...overrides.spacing,
            },
            typography: {
                ...baseTheme.typography,
                ...overrides.typography,
            },
        };
    }

    /**
     * Get all available theme names
     */
    getAvailableThemes(): ThemeName[] {
        return ["light", "dark", "high-contrast", "system"];
    }

    /**
     * Validate if theme name is valid
     */
    isValidThemeName(name: string): name is ThemeName {
        return this.getAvailableThemes().includes(name as ThemeName);
    }

    /**
     * Generate CSS variables string for a theme
     */
    generateCSSVariables(theme: Theme): string {
        const variables: string[] = [];

        // Colors
        for (const [category, colors] of Object.entries(theme.colors)) {
            if (typeof colors === "object" && colors !== null) {
                for (const [key, value] of Object.entries(colors as Record<string, unknown>)) {
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
}

export const themeManager = ThemeManager.getInstance();
