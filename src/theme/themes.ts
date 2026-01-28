/* eslint-disable @metamask/design-tokens/color-no-hex -- Theme definitions require direct hex color values */
/**
 * Theme definitions for the application.
 *
 * @remarks
 * Contains predefined light and dark theme configurations with complete styling
 * properties including colors, typography, spacing, and visual effects.
 */

import type { Theme } from "./types";

import { FONT_FAMILY_MONO, FONT_FAMILY_SANS } from "../constants";
import { deepMergeTheme } from "./utils/themeMerging";

/**
 * Base theme configuration with common properties. All themes extend from this
 * base to reduce duplication.
 */
const baseTheme: Theme = {
    borderRadius: {
        full: "9999px",
        lg: "0.5rem",
        md: "0.375rem",
        none: "0",
        sm: "0.125rem",
        xl: "0.75rem",
    },
    colors: {
        background: {
            modal: "rgba(15, 23, 42, 0.45)",
            primary: "#f6f8fb",
            secondary: "#eef2f7",
            tertiary: "#e4e9f2",
        },
        border: {
            focus: "#5f8cff",
            primary: "#d5dbe8",
            secondary: "#c1c9d6",
        },
        error: "#f04f6b",
        errorAlert: "#b02d45",
        hover: {
            dark: "rgba(15, 23, 42, 0.08)",
            light: "rgba(15, 23, 42, 0.04)",
            medium: "rgba(95, 140, 255, 0.12)",
        },
        info: "#4f74ff",
        primary: {
            50: "#f5f8ff",
            100: "#e6eeff",
            200: "#cfddff",
            300: "#b5c9ff",
            400: "#8faaff",
            500: "#5f8cff",
            600: "#3e6be6",
            700: "#3154c2",
            800: "#29429a",
            900: "#22367b",
        },
        shadows: {
            degraded: "rgb(245 159 61 / 22%)",
            error: "rgb(242 87 107 / 22%)",
            paused: "rgb(138 147 170 / 22%)",
            success: "rgb(30 198 162 / 22%)",
            warning: "rgb(244 195 97 / 22%)",
        },
        status: {
            degraded: "#f59f3d",
            down: "#f2576b",
            mixed: "#8574ff",
            paused: "#8a93aa",
            pending: "#f4c361",
            unknown: "#64748b",
            up: "#1ec6a2",
        },
        success: "#1ec6a2",
        surface: {
            base: "#ffffff",
            elevated: "#f9fbff",
            overlay: "#f2f5ff",
        },
        text: {
            inverse: "#ffffff",
            primary: "#0f172a",
            secondary: "#475569",
            tertiary: "#64748b",
        },
        warning: "#f4c361",
        white: "#ffffff",
    },
    isDark: false,
    name: "light" as const,
    shadows: {
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    spacing: {
        "2xl": "3rem",
        "3xl": "4rem",
        lg: "1.5rem",
        md: "1rem",
        sm: "0.5rem",
        xl: "2rem",
        xs: "0.25rem",
    },
    typography: {
        fontFamily: {
            mono: FONT_FAMILY_MONO,
            sans: FONT_FAMILY_SANS,
        },
        fontSize: {
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
            base: "1rem",
            lg: "1.125rem",
            sm: "0.875rem",
            xl: "1.25rem",
            xs: "0.75rem",
        },
        fontWeight: {
            bold: "700",
            medium: "500",
            normal: "400",
            semibold: "600",
        },
        lineHeight: {
            normal: "1.5",
            relaxed: "1.75",
            tight: "1.25",
        },
    },
};

/**
 * Creates a theme by merging base theme with specific overrides. This approach
 * eliminates duplication while maintaining type safety.
 *
 * @remarks
 * Performs deep merging of nested objects like colors, typography, and spacing
 * to ensure that only specified properties are overridden while preserving all
 * other base theme properties.
 *
 * @param overrides - Partial theme object with properties to override
 *
 * @returns Complete theme object with merged properties
 */
function createTheme(overrides: Partial<Theme>): Theme {
    return deepMergeTheme(baseTheme, overrides);
}

/**
 * Light theme configuration. Provides a clean, bright appearance suitable for
 * well-lit environments.
 *
 * @remarks
 * This is the default theme that uses the base theme values without
 * modifications. It provides optimal readability and accessibility in bright
 * environments.
 *
 * @example
 *
 * ```typescript
 * import { lightTheme } from "./themes";
 * themeManager.applyTheme(lightTheme);
 * ```
 */
export const lightTheme: Theme = createTheme({
    // Light theme uses base theme values (no overrides needed)
});

/**
 * Dark theme configuration. Provides a modern dark appearance suitable for
 * low-light environments.
 *
 * @remarks
 * Features reduced blue light emission and carefully adjusted contrasts to
 * minimize eye strain during extended use in dark environments. All colors
 * maintain WCAG accessibility standards.
 *
 * @example
 *
 * ```typescript
 * import { darkTheme } from "./themes";
 * themeManager.applyTheme(darkTheme);
 * ```
 */
export const darkTheme: Theme = createTheme({
    colors: {
        background: {
            modal: "rgba(5, 9, 18, 0.82)",
            primary: "#070b12",
            secondary: "#0d141f",
            tertiary: "#141d2c",
        },
        border: {
            focus: "#5f8cff",
            primary: "#1b2535",
            secondary: "#263146",
        },
        error: "#ff6b81",
        errorAlert: "#de3b5d",
        hover: {
            dark: "rgba(255, 255, 255, 0.12)",
            light: "rgba(255, 255, 255, 0.05)",
            medium: "rgba(95, 140, 255, 0.25)",
        },
        info: "#5f8cff",
        primary: {
            50: "#101827",
            100: "#162032",
            200: "#1e2d46",
            300: "#25385a",
            400: "#2d4a77",
            500: "#3a63a6",
            600: "#4e7bd2",
            700: "#6590eb",
            800: "#86a6ff",
            900: "#c1d5ff",
        },
        shadows: {
            degraded: "rgb(247 168 81 / 26%)",
            error: "rgb(255 107 129 / 26%)",
            paused: "rgb(133 147 181 / 24%)",
            success: "rgb(61 214 140 / 26%)",
            warning: "rgb(244 195 97 / 26%)",
        },
        status: {
            degraded: "#f7a851",
            down: "#ff6b81",
            mixed: "#9c8cff",
            paused: "#8593b5",
            pending: "#f4c361",
            unknown: "#7b86a2",
            up: "#3dd68c",
        },
        success: "#3dd68c",
        surface: {
            base: "#0d1421",
            elevated: "#141d2c",
            overlay: "#1a2538",
        },
        text: {
            inverse: "#070b12",
            primary: "#f2f4f8",
            secondary: "#9da8c2",
            tertiary: "#6f7a94",
        },
        warning: "#f4c361",
        white: "#ffffff",
    },
    isDark: true,
    name: "dark",
    shadows: {
        inner: "inset 0 2px 6px 0 rgba(3, 8, 17, 0.55)",
        lg: "0 18px 40px -12px rgba(3, 10, 22, 0.55), 0 8px 20px -10px rgba(3, 10, 22, 0.45)",
        md: "0 12px 26px -12px rgba(3, 10, 22, 0.5), 0 6px 16px -8px rgba(3, 10, 22, 0.4)",
        sm: "0 6px 16px -10px rgba(3, 10, 22, 0.45)",
        xl: "0 32px 56px -18px rgba(3, 10, 22, 0.6), 0 18px 32px -14px rgba(3, 10, 22, 0.5)",
    },
});

/**
 * High contrast theme for accessibility. Provides maximum contrast for users
 * with visual impairments.
 *
 * @remarks
 * Designed specifically for users with visual impairments, featuring maximum
 * contrast ratios, larger typography, and saturated colors for optimal
 * readability and accessibility compliance.
 *
 * @example
 *
 * ```typescript
 * import { highContrastTheme } from "./themes";
 * themeManager.applyTheme(highContrastTheme);
 * ```
 */
export const highContrastTheme: Theme = createTheme({
    borderRadius: {
        full: "9999px",
        lg: "0.75rem",
        md: "0.5rem",
        none: "0",
        sm: "0.25rem",
        xl: "1rem",
    },
    colors: {
        background: {
            modal: "rgba(0, 0, 0, 0.95)",
            primary: "#000000",
            secondary: "#1a1a1a",
            tertiary: "#333333",
        },
        border: {
            focus: "#00ffff",
            primary: "#ffffff",
            secondary: "#cccccc",
        },
        error: "#ff0000",
        errorAlert: "#cc0000",
        hover: {
            dark: "rgba(255, 255, 255, 0.2)",
            light: "rgba(255, 255, 255, 0.1)",
            medium: "rgba(255, 255, 255, 0.15)",
        },
        info: "#00ffff",
        primary: {
            50: "#000000",
            100: "#1a1a1a",
            200: "#333333",
            300: "#4d4d4d",
            400: "#666666",
            500: "#ffffff",
            600: "#ffffff",
            700: "#ffffff",
            800: "#ffffff",
            900: "#ffffff",
        },
        shadows: {
            degraded: "rgb(255 136 0 / 50%)",
            error: "rgb(255 0 0 / 50%)",
            paused: "rgb(255 255 255 / 50%)",
            success: "rgb(0 255 0 / 50%)",
            warning: "rgb(255 255 0 / 50%)",
        },
        status: {
            degraded: "#ff8800",
            down: "#ff0000",
            mixed: "#ff00ff",
            paused: "#ffffff",
            pending: "#ffff00",
            unknown: "#ffffff",
            up: "#00ff00",
        },
        success: "#00ff00",
        surface: {
            base: "#000000",
            elevated: "#1a1a1a",
            overlay: "#000000",
        },
        text: {
            inverse: "#000000",
            primary: "#ffffff",
            secondary: "#cccccc",
            tertiary: "#999999",
        },
        warning: "#ffff00",
        white: "#ffffff",
    },
    isDark: true,
    name: "high-contrast",
    shadows: {
        inner: "inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
        lg: "0 8px 16px 0 rgba(255, 255, 255, 0.2)",
        md: "0 4px 8px 0 rgba(255, 255, 255, 0.15)",
        sm: "0 2px 4px 0 rgba(255, 255, 255, 0.1)",
        xl: "0 16px 32px 0 rgba(255, 255, 255, 0.25)",
    },
    typography: {
        fontFamily: {
            mono: FONT_FAMILY_MONO,
            sans: FONT_FAMILY_SANS,
        },
        fontSize: {
            "2xl": "1.75rem",
            "3xl": "2rem",
            "4xl": "2.5rem",
            base: "1.125rem",
            lg: "1.25rem",
            sm: "1rem",
            xl: "1.5rem",
            xs: "0.875rem",
        },
        fontWeight: {
            bold: "800",
            medium: "600",
            normal: "500",
            semibold: "700",
        },
        lineHeight: {
            normal: "1.6",
            relaxed: "1.8",
            tight: "1.4",
        },
    },
});

/**
 * Interface for the themes collection.
 */
export interface Themes {
    /**
     * Dark theme configuration with dark backgrounds and light text.
     */
    readonly dark: Theme;

    /**
     * High contrast theme for accessibility with maximum contrast ratios.
     */
    readonly "high-contrast": Theme;

    /**
     * Light theme configuration with light backgrounds and dark text.
     */
    readonly light: Theme;
}

/**
 * Collection of all available themes in the application.
 *
 * @remarks
 * Provides a centralized registry of all theme configurations available for use
 * throughout the application. Used by the ThemeManager to resolve theme names
 * to actual theme objects.
 *
 * @example
 *
 * ```typescript
 * import { themes } from "./themes";
 *
 * // Get a specific theme
 * const theme = themes.dark;
 *
 * // List all available themes
 * const themeNames = Object.keys(themes);
 * ```
 */
export const themes: Themes = {
    dark: darkTheme,
    "high-contrast": highContrastTheme,
    light: lightTheme,
} as const;

/* eslint-enable @metamask/design-tokens/color-no-hex -- Restore default token lint after theme definitions. */
