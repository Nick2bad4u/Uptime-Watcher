/**
 * Theme system type definitions.
 * Defines the structure and interfaces for the application's theming system.
 */

/**
 * Color palette interface defining all theme colors.
 * Provides a comprehensive color system for consistent theming.
 */
export interface ThemeColors {
    // Core colors
    primary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };

    // Status colors
    status: {
        up: string;
        down: string;
        pending: string;
        unknown: string;
    };

    // Semantic colors
    success: string;
    warning: string;
    error: string;
    errorAlert: string;
    info: string;

    // Background colors
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
        modal: string;
    };

    // Text colors
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
    };

    // Border colors
    border: {
        primary: string;
        secondary: string;
        focus: string;
    };

    // Surface colors
    surface: {
        base: string;
        elevated: string;
        overlay: string;
    };

    // Hover states
    hover: {
        light: string;
        medium: string;
        dark: string;
    };
}

/**
 * Spacing scale interface for consistent layout spacing.
 * Defines standard spacing values used throughout the application.
 */
export interface ThemeSpacing {
    /** Extra small spacing */
    xs: string;
    /** Small spacing */
    sm: string;
    /** Medium spacing */
    md: string;
    /** Large spacing */
    lg: string;
    /** Extra large spacing */
    xl: string;
    /** Double extra large spacing */
    "2xl": string;
    /** Triple extra large spacing */
    "3xl": string;
}

/**
 * Typography system interface for text styling.
 * Defines font families, sizes, weights, and line heights.
 */
export interface ThemeTypography {
    /** Font family definitions */
    fontFamily: {
        /** Sans-serif font stack */
        sans: string[];
        /** Monospace font stack */
        mono: string[];
    };
    /** Font size scale */
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        "2xl": string;
        "3xl": string;
        "4xl": string;
    };
    /** Font weight scale */
    fontWeight: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
    };
    /** Line height scale */
    lineHeight: {
        tight: string;
        normal: string;
        relaxed: string;
    };
}

/**
 * Shadow system interface for elevation and depth.
 * Defines consistent shadow styles for UI components.
 */
export interface ThemeShadows {
    /** Small shadow for subtle elevation */
    sm: string;
    /** Medium shadow for moderate elevation */
    md: string;
    /** Large shadow for high elevation */
    lg: string;
    /** Extra large shadow for maximum elevation */
    xl: string;
    /** Inner shadow for inset effects */
    inner: string;
}

/**
 * Border radius system interface for consistent corner rounding.
 * Defines standard border radius values for components.
 */
export interface ThemeBorderRadius {
    /** No border radius */
    none: string;
    /** Small border radius */
    sm: string;
    /** Medium border radius */
    md: string;
    /** Large border radius */
    lg: string;
    /** Extra large border radius */
    xl: string;
    /** Fully rounded borders */
    full: string;
}

/**
 * Complete theme interface containing all theme properties.
 * Represents a complete theme configuration with all styling properties.
 */
export interface Theme {
    /** Human-readable theme name */
    name: string;
    /** Color palette for the theme */
    colors: ThemeColors;
    /** Spacing scale for layout */
    spacing: ThemeSpacing;
    /** Typography system */
    typography: ThemeTypography;
    /** Shadow definitions */
    shadows: ThemeShadows;
    /** Border radius definitions */
    borderRadius: ThemeBorderRadius;
    /** Whether this is a dark theme */
    isDark: boolean;
}

/** Available theme names in the application */
export type ThemeName = "light" | "dark" | "high-contrast" | "system" | "custom";

/**
 * Theme state interface for managing active themes.
 * Tracks current theme selection and custom theme definitions.
 */
export interface ThemeState {
    /** Currently selected theme name */
    currentTheme: ThemeName;
    /** Custom user-defined themes */
    customThemes: Record<string, Theme>;
    /** Currently active theme object */
    activeTheme: Theme;
    /** System theme preference (light/dark) */
    systemThemePreference: "light" | "dark";
}
