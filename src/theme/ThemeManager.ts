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

import type { UnknownRecord } from "type-fest";

import { isRecord } from "@shared/utils/typeHelpers";
import deepEqual from "fast-deep-equal";

import type { SystemThemePreference } from "./components/types";
import type { Theme, ThemeName } from "./types";

import { themes } from "./themes";
import {
    getPrefersDarkMode,
    subscribePrefersDarkModeChange,
} from "./utils/systemTheme";
import { deepMergeTheme } from "./utils/themeMerging";

type CssVariableKey = number | string;

const isCssVariableKey = (value: PropertyKey): value is CssVariableKey =>
    typeof value === "string" || typeof value === "number";

const toCssToken = (value: CssVariableKey): string => value.toString();

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
     * Type guard for concrete theme registry keys.
     */
    private isThemeRegistryKey(value: string): value is keyof typeof themes {
        return Object.hasOwn(themes, value);
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
            deepEqual(theme1.colors, theme2.colors)
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
        const themeNames = Object.keys(themes).filter(
            (name): name is keyof typeof themes => this.isThemeRegistryKey(name)
        );
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
        return getPrefersDarkMode() ? "dark" : "light";
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

        // Defensive fallback: if the provided theme name does not correspond
        // to a concrete theme entry (for example a stale or experimental
        // value such as "custom"), fall back to the system preference instead
        // of returning an incomplete theme. This prevents corrupted
        // configuration from breaking rendering while keeping the set of
        // selectable themes driven by the concrete `themes` registry.
        if (!(name in themes)) {
            const systemPreference = this.getSystemThemePreference();
            return themes[systemPreference];
        }

        if (!this.isThemeRegistryKey(name)) {
            const systemPreference = this.getSystemThemePreference();
            return themes[systemPreference];
        }

        return themes[name];
    }

    /**
     * Validate if theme name is valid
     */
    public isValidThemeName(name: string): name is ThemeName {
        return name === "system" || this.isThemeRegistryKey(name);
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
        return subscribePrefersDarkModeChange(callback);
    }

    /**
     * Add border radius CSS variables from theme.
     */
    private addBorderRadiusVariables(theme: Theme, variables: string[]): void {
        for (const [size, value] of Object.entries(theme.borderRadius)) {
            variables.push(`  --radius-${size}: ${value};`);
        }
    }

    /**
     * Add color CSS variables from theme.
     */
    private addColorVariables(theme: Theme, variables: string[]): void {
        this.forEachColorVariable(theme.colors, (property, value) => {
            variables.push(`  ${property}: ${value};`);
        });
    }

    private forEachColorVariable(
        colors: Theme["colors"],
        visitor: (property: string, value: string) => void
    ): void {
        const colorGroups = colors;

        if (!isRecord(colorGroups)) {
            return;
        }

        for (const [categoryKey, colorValue] of Object.entries(colorGroups)) {
            if (isCssVariableKey(categoryKey)) {
                const categoryToken = toCssToken(categoryKey);
                this.emitColorValue(categoryToken, colorValue, visitor);
            }
        }
    }

    private emitColorValue(
        categoryToken: string,
        colorValue: unknown,
        visitor: (property: string, value: string) => void
    ): void {
        if (typeof colorValue === "string") {
            visitor(`--color-${categoryToken}`, colorValue);
        } else if (isRecord(colorValue)) {
            this.emitColorShades(categoryToken, colorValue, visitor);
        }
    }

    private emitColorShades(
        categoryToken: string,
        shades: UnknownRecord,
        visitor: (property: string, value: string) => void
    ): void {
        for (const [shadeKey, nestedValue] of Object.entries(shades)) {
            if (isCssVariableKey(shadeKey) && typeof nestedValue === "string") {
                visitor(
                    `--color-${categoryToken}-${toCssToken(shadeKey)}`,
                    nestedValue
                );
            }
        }
    }

    /**
     * Add shadow CSS variables from theme.
     */
    private addShadowVariables(theme: Theme, variables: string[]): void {
        for (const [size, value] of Object.entries(theme.shadows)) {
            variables.push(`  --shadow-${size}: ${value};`);
        }
    }

    /**
     * Add spacing CSS variables from theme.
     */
    private addSpacingVariables(theme: Theme, variables: string[]): void {
        for (const [size, value] of Object.entries(theme.spacing)) {
            variables.push(`  --spacing-${size}: ${value};`);
        }
    }

    /**
     * Add typography CSS variables from theme.
     */
    private addTypographyVariables(theme: Theme, variables: string[]): void {
        this.addFontSizeVariables(theme.typography, variables);
        this.addFontWeightVariables(theme.typography, variables);
        this.addLineHeightVariables(theme.typography, variables);
    }

    /**
     * Add font size CSS variables from typography.
     */
    private addFontSizeVariables(
        typography: Theme["typography"],
        variables: string[]
    ): void {
        for (const [size, value] of Object.entries(typography.fontSize)) {
            variables.push(`  --font-size-${size}: ${value};`);
        }
    }

    /**
     * Add font weight CSS variables from typography.
     */
    private addFontWeightVariables(
        typography: Theme["typography"],
        variables: string[]
    ): void {
        for (const [weight, value] of Object.entries(typography.fontWeight)) {
            variables.push(`  --font-weight-${weight}: ${value};`);
        }
    }

    /**
     * Add line height CSS variables from typography.
     */
    private addLineHeightVariables(
        typography: Theme["typography"],
        variables: string[]
    ): void {
        for (const [height, value] of Object.entries(typography.lineHeight)) {
            variables.push(`  --line-height-${height}: ${value};`);
        }
    }

    /**
     * Apply border radius CSS custom properties
     */
    private applyBorderRadius(
        root: HTMLElement,
        borderRadius: Theme["borderRadius"]
    ): void {
        for (const [size, value] of Object.entries(borderRadius)) {
            root.style.setProperty(`--radius-${size}`, String(value));
        }
    }

    /**
     * Apply color CSS custom properties
     */
    private applyColors(root: HTMLElement, colors: Theme["colors"]): void {
        const properties: Array<[string, string]> = [];

        this.forEachColorVariable(colors, (property, value) => {
            properties.push([property, value]);
        });

        // Apply all properties at once to prevent flickering
        for (const [property, value] of properties) {
            root.style.setProperty(property, value);
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
        this.applyFontSizeProperties(root, typography);
        this.applyFontWeightProperties(root, typography);
        this.applyLineHeightProperties(root, typography);
    }

    /**
     * Apply font size CSS custom properties
     */
    private applyFontSizeProperties(
        root: HTMLElement,
        typography: Theme["typography"]
    ): void {
        for (const [size, value] of Object.entries(typography.fontSize)) {
            root.style.setProperty(`--font-size-${size}`, value);
        }
    }

    /**
     * Apply font weight CSS custom properties
     */
    private applyFontWeightProperties(
        root: HTMLElement,
        typography: Theme["typography"]
    ): void {
        for (const [weight, value] of Object.entries(typography.fontWeight)) {
            root.style.setProperty(`--font-weight-${weight}`, value);
        }
    }

    /**
     * Apply line height CSS custom properties
     */
    private applyLineHeightProperties(
        root: HTMLElement,
        typography: Theme["typography"]
    ): void {
        for (const [height, value] of Object.entries(typography.lineHeight)) {
            root.style.setProperty(`--line-height-${height}`, value);
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
