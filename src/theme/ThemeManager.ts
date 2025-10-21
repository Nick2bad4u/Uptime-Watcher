/**
 * ThemeManager class for handling theme selection and system preference
 * detection.
 *
 * @remarks
 * Manages theme switching throughout the application including automatic
 * detection of system preferences and manual theme overrides. Provides a
 * singleton service for consistent theme management across components.
 *
 * Note: Empty constructor and no-op functions are intentional design patterns.
 */

/* eslint-disable @typescript-eslint/no-unnecessary-condition, sonarjs/different-types-comparison -- Defensive programming for test edge cases and cross-environment compatibility */
// Defensive programming for test edge cases and cross-environment compatibility

import type { SystemThemePreference } from "./components/types";
import type { Theme, ThemeName } from "./types";

import { themes } from "./themes";
import { deepMergeTheme } from "./utils/themeMerging";

/**
 * Singleton service for managing application themes. Handles theme selection,
 * system preference detection, and automatic switching.
 */
export class ThemeManager {
    /** Singleton instance */
    private static instance: ThemeManager | undefined;

    /** Track current applied theme to prevent unnecessary re-applications */
    private currentAppliedTheme: Theme | undefined;

    /**
     * Get the singleton instance of ThemeManager. Creates the instance if it
     * doesn't exist.
     *
     * @returns ThemeManager singleton instance
     */
    public static getInstance(): ThemeManager {
        ThemeManager.instance ??= new ThemeManager();
        return ThemeManager.instance;
    }

    /**
     * Apply theme to document - only if different from currently applied theme
     */
    public applyTheme(theme: Theme): void {
        if (typeof document === "undefined") {
            return;
        }

        // Skip if same theme is already applied
        if (
            this.currentAppliedTheme &&
            this.isSameTheme(this.currentAppliedTheme, theme)
        ) {
            return;
        }

        const root = document.documentElement;

        this.applyColors(root, theme.colors);
        this.applyTypography(root, theme.typography);
        this.applySpacing(root, theme.spacing);
        this.applyShadows(root, theme.shadows);
        this.applyBorderRadius(root, theme.borderRadius);
        this.applyThemeClasses(theme);

        // Remember the applied theme
        this.currentAppliedTheme = theme;
    }

    /**
     * Check if two themes are the same (deep comparison of essential
     * properties)
     */
    private isSameTheme(theme1: Theme, theme2: Theme): boolean {
        return (
            theme1.name === theme2.name &&
            theme1.isDark === theme2.isDark &&
            JSON.stringify(theme1.colors) === JSON.stringify(theme2.colors)
        );
    }

    /**
     * Create a custom theme based on an existing theme.
     *
     * @remarks
     * This method performs a deep merge of the override properties into the
     * base theme, ensuring that nested objects are properly merged rather than
     * replaced entirely. This allows for granular customization while
     * preserving unmodified properties.
     *
     * @param baseTheme - The base theme to extend from
     * @param overrides - Partial theme object with properties to override
     *
     * @returns New theme with deep-merged properties
     */
    public createCustomTheme(
        baseTheme: Theme,
        overrides: Partial<Theme>
    ): Theme {
        return deepMergeTheme(baseTheme, overrides);
    }

    /**
     * Generate CSS variables string for a theme
     */
    public generateCSSVariables(theme: Theme): string {
        const variables: string[] = [];

        this.addColorVariables(theme, variables);
        this.addTypographyVariables(theme, variables);
        this.addSpacingVariables(theme, variables);
        this.addShadowVariables(theme, variables);
        this.addBorderRadiusVariables(theme, variables);

        return `:root {\n${variables.join("\n")}\n}`;
    }

    /**
     * Get all available theme names.
     *
     * @remarks
     * Dynamically generates the list from the themes object to ensure
     * consistency. Always includes "system" for automatic theme detection.
     *
     * @returns Array of available theme names including system
     */
    public getAvailableThemes(): ThemeName[] {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Object.keys of themes returns the exact keys that match ThemeName type */
        const themeNames = Object.keys(themes) as ThemeName[];
        return [...themeNames, "system"];
    }

    /**
     * Get system theme preference from OS/browser settings. Uses CSS media
     * query to detect dark mode preference.
     *
     * @remarks
     * In SSR or non-browser environments where window is undefined, this method
     * will fallback to "light" theme as the default. This ensures safe
     * operation across all deployment environments.
     *
     * @returns Dark if user prefers dark mode, "light" otherwise
     */
    public getSystemThemePreference(): SystemThemePreference {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return "light";
    }

    /**
     * Get theme by name, with automatic system theme detection. Handles
     * "system" theme by detecting user's OS preference.
     *
     * @param name - Theme name to retrieve
     *
     * @returns Theme object containing colors, typography, and spacing
     */
    public getTheme(name: ThemeName): Theme {
        if (name === "system") {
            const systemPreference = this.getSystemThemePreference();

            return themes[systemPreference];
        }

        /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- name is validated as ThemeName, safe to use as themes key */
        return themes[name as keyof typeof themes];
    }

    /**
     * Validate if theme name is valid
     */
    public isValidThemeName(name: string): name is ThemeName {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type assertion needed for includes check, result determines type guard */
        return this.getAvailableThemes().includes(name as ThemeName);
    }

    /**
     * Listen for system theme changes and call callback when detected. Useful
     * for automatic theme switching when user changes OS settings.
     *
     * @param callback - Function to call when system theme changes
     *
     * @returns Cleanup function to remove the event listener
     */
    public onSystemThemeChange(
        callback: (isDark: boolean) => void
    ): () => void {
        if (typeof window === "undefined") {
            return () => {};
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent): void => {
            callback(e.matches);
        };

        mediaQuery.addEventListener("change", handler);

        // Return cleanup function
        return () => {
            mediaQuery.removeEventListener("change", handler);
        };
    }

    /**
     * Add border radius CSS variables from theme.
     */
    private addBorderRadiusVariables(theme: Theme, variables: string[]): void {
        // Border radius - all themes have borderRadius property

        if (
            typeof theme.borderRadius === "object" &&
            theme.borderRadius !== null
        ) {
            for (const [size, value] of Object.entries(theme.borderRadius)) {
                variables.push(`  --radius-${size}: ${value};`);
            }
        }
    }

    /**
     * Add color CSS variables from theme.
     */
    private addColorVariables(theme: Theme, variables: string[]): void {
        if (typeof theme.colors === "object" && theme.colors !== null) {
            /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe navigation through theme color object structure with runtime type checks */
            for (const [category, colors] of Object.entries(theme.colors)) {
                if (typeof colors === "object" && colors !== null) {
                    // Type-safe access to color values - colors are either
                    // string or nested color objects
                    for (const [key, value] of Object.entries(
                        colors as Record<string, string>
                    )) {
                        variables.push(
                            `  --color-${category}-${key}: ${value};`
                        );
                    }
                } else {
                    variables.push(`  --color-${category}: ${colors};`);
                }
            }
            /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after safe theme color processing */
        }
    }

    /**
     * Add shadow CSS variables from theme.
     */
    private addShadowVariables(theme: Theme, variables: string[]): void {
        // Shadows - all themes have shadows property
        if (typeof theme.shadows === "object" && theme.shadows !== null) {
            for (const [size, value] of Object.entries(theme.shadows)) {
                variables.push(`  --shadow-${size}: ${value};`);
            }
        }
    }

    /**
     * Add spacing CSS variables from theme.
     */
    private addSpacingVariables(theme: Theme, variables: string[]): void {
        // Spacing - all themes have spacing property
        if (typeof theme.spacing === "object" && theme.spacing !== null) {
            for (const [size, value] of Object.entries(theme.spacing)) {
                variables.push(`  --spacing-${size}: ${value};`);
            }
        }
    }

    /**
     * Add typography CSS variables from theme.
     */
    private addTypographyVariables(theme: Theme, variables: string[]): void {
        // Typography - all themes have typography property with required
        // sub-properties
        if (typeof theme.typography === "object" && theme.typography !== null) {
            this.addFontSizeVariables(theme.typography, variables);
            this.addFontWeightVariables(theme.typography, variables);
            this.addLineHeightVariables(theme.typography, variables);
        }
    }

    /**
     * Add font size CSS variables from typography.
     */
    private addFontSizeVariables(
        typography: Theme["typography"],
        variables: string[]
    ): void {
        if (
            typeof typography.fontSize === "object" &&
            typography.fontSize !== null
        ) {
            for (const [size, value] of Object.entries(typography.fontSize)) {
                variables.push(`  --font-size-${size}: ${value};`);
            }
        }
    }

    /**
     * Add font weight CSS variables from typography.
     */
    private addFontWeightVariables(
        typography: Theme["typography"],
        variables: string[]
    ): void {
        if (
            typeof typography.fontWeight === "object" &&
            typography.fontWeight !== null
        ) {
            for (const [weight, value] of Object.entries(
                typography.fontWeight
            )) {
                variables.push(`  --font-weight-${weight}: ${value};`);
            }
        }
    }

    /**
     * Add line height CSS variables from typography.
     */
    private addLineHeightVariables(
        typography: Theme["typography"],
        variables: string[]
    ): void {
        if (
            typeof typography.lineHeight === "object" &&
            typography.lineHeight !== null
        ) {
            for (const [height, value] of Object.entries(
                typography.lineHeight
            )) {
                variables.push(`  --line-height-${height}: ${value};`);
            }
        }
    }

    /**
     * Apply border radius CSS custom properties
     */
    private applyBorderRadius(
        root: HTMLElement,
        borderRadius: Theme["borderRadius"]
    ): void {
        if (typeof borderRadius === "object" && borderRadius !== null) {
            for (const [size, value] of Object.entries(borderRadius)) {
                root.style.setProperty(`--radius-${size}`, String(value));
            }
        }
    }

    /**
     * Apply color CSS custom properties
     */
    private applyColors(root: HTMLElement, colors: Theme["colors"]): void {
        if (typeof colors === "object" && colors !== null) {
            // Batch all style changes to prevent multiple repaints
            const properties: Array<[string, string]> = [];

            /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe navigation through theme color object structure with runtime type checks */
            for (const [category, colorValue] of Object.entries(colors)) {
                if (typeof colorValue === "object" && colorValue !== null) {
                    // Type-safe access to color values - colorValue is a
                    // nested color object with string values
                    for (const [key, value] of Object.entries(
                        colorValue as Record<string, string>
                    )) {
                        properties.push([`--color-${category}-${key}`, value]);
                    }
                } else {
                    properties.push([
                        `--color-${category}`,
                        colorValue as string,
                    ]);
                }
            }
            /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after safe CSS property value processing */

            // Apply all properties at once to prevent flickering
            for (const [property, value] of properties) {
                root.style.setProperty(property, value);
            }
        }
    }

    /**
     * Apply shadow CSS custom properties
     */
    private applyShadows(root: HTMLElement, shadows: Theme["shadows"]): void {
        if (typeof shadows === "object" && shadows !== null) {
            for (const [size, value] of Object.entries(shadows)) {
                root.style.setProperty(`--shadow-${size}`, String(value));
            }
        }
    }

    /**
     * Apply spacing CSS custom properties
     */
    private applySpacing(root: HTMLElement, spacing: Theme["spacing"]): void {
        if (typeof spacing === "object" && spacing !== null) {
            for (const [size, value] of Object.entries(spacing)) {
                root.style.setProperty(`--spacing-${size}`, String(value));
            }
        }
    }

    /**
     * Apply theme classes to document elements.
     *
     * @remarks
     * Safely removes old theme classes and applies new ones. Includes safety
     * checks for SSR and non-browser environments. Optimized to prevent
     * flickering by only removing classes that need to be removed.
     *
     * @param theme - Theme to apply classes for
     */
    private applyThemeClasses(theme: Theme): void {
        if (typeof document === "undefined") {
            return;
        }

        const root = document.documentElement;
        const availableThemes = Object.keys(themes);
        const targetThemeClass = `theme-${theme.name}`;

        // Only remove theme classes that are different from the target
        for (const themeName of availableThemes) {
            const themeClass = `theme-${themeName}`;
            if (
                themeClass !== targetThemeClass &&
                document.body.classList.contains(themeClass)
            ) {
                document.body.classList.remove(themeClass);
            }
        }

        // Add current theme class (no-op if already present)
        document.body.classList.add(targetThemeClass);

        // Set dark mode class for Tailwind CSS (optimized to prevent unnecessary changes)
        if (theme.isDark) {
            if (!root.classList.contains("dark")) {
                root.classList.add("dark");
            }
        } else if (root.classList.contains("dark")) {
            root.classList.remove("dark");
        }
    }

    /**
     * Apply typography CSS custom properties
     */
    private applyTypography(
        root: HTMLElement,
        typography: Theme["typography"]
    ): void {
        if (typeof typography === "object" && typography !== null) {
            this.applyFontSizeProperties(root, typography);
            this.applyFontWeightProperties(root, typography);
            this.applyLineHeightProperties(root, typography);
        }
    }

    /**
     * Apply font size CSS custom properties
     */
    private applyFontSizeProperties(
        root: HTMLElement,
        typography: Theme["typography"]
    ): void {
        if (
            typeof typography.fontSize === "object" &&
            typography.fontSize !== null
        ) {
            for (const [size, value] of Object.entries(typography.fontSize)) {
                root.style.setProperty(`--font-size-${size}`, value);
            }
        }
    }

    /**
     * Apply font weight CSS custom properties
     */
    private applyFontWeightProperties(
        root: HTMLElement,
        typography: Theme["typography"]
    ): void {
        if (
            typeof typography.fontWeight === "object" &&
            typography.fontWeight !== null
        ) {
            for (const [weight, value] of Object.entries(
                typography.fontWeight
            )) {
                root.style.setProperty(`--font-weight-${weight}`, value);
            }
        }
    }

    /**
     * Apply line height CSS custom properties
     */
    private applyLineHeightProperties(
        root: HTMLElement,
        typography: Theme["typography"]
    ): void {
        if (
            typeof typography.lineHeight === "object" &&
            typography.lineHeight !== null
        ) {
            for (const [height, value] of Object.entries(
                typography.lineHeight
            )) {
                root.style.setProperty(`--line-height-${height}`, value);
            }
        }
    }
}

/**
 * Global theme manager singleton instance.
 *
 * @remarks
 * Provides convenient access to theme management functionality throughout the
 * application. This singleton ensures consistent theme state and provides a
 * centralized API for theme operations.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "@app/services/logger";
 * import { themeManager } from "./ThemeManager";
 *
 * // Apply a theme
 * const theme = themeManager.getTheme("dark");
 * themeManager.applyTheme(theme);
 *
 * // Listen for system theme changes
 * const cleanup = themeManager.onSystemThemeChange((isDark) => {
 *     logger.info("System theme changed", {
 *         theme: isDark ? "dark" : "light",
 *     });
 * });
 * ```
 *
 * @public
 */
export const themeManager: ThemeManager = ThemeManager.getInstance();

/* eslint-enable @typescript-eslint/no-unnecessary-condition, sonarjs/different-types-comparison -- Re-enable after defensive programming section */
