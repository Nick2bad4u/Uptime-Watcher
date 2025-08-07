/**
 * Theme system type definitions.
 * Defines the structure and interfaces for the application's theming system.
 */

/**
 * Complete theme interface containing all theme properties.
 * Represents a complete theme configuration with all styling properties.
 */
export interface Theme {
    /** Border radius definitions */
    borderRadius: ThemeBorderRadius;
    /** Color palette for the theme */
    colors: ThemeColors;
    /** Whether this is a dark theme */
    isDark: boolean;
    /** Human-readable theme name */
    name: string;
    /** Shadow definitions */
    shadows: ThemeShadows;
    /** Spacing scale for layout */
    spacing: ThemeSpacing;
    /** Typography system */
    typography: ThemeTypography;
}

/**
 * Border radius system interface for consistent corner rounding.
 * Defines standard border radius values for components.
 */
export interface ThemeBorderRadius {
    /** Fully rounded borders */
    full: string;
    /** Large border radius */
    lg: string;
    /** Medium border radius */
    md: string;
    /** No border radius */
    none: string;
    /** Small border radius */
    sm: string;
    /** Extra large border radius */
    xl: string;
}

/**
 * Color palette interface defining all theme colors.
 * Provides a comprehensive color system for consistent theming.
 */
export interface ThemeColors {
    // Background colors
    background: {
        modal: string;
        primary: string;
        secondary: string;
        tertiary: string;
    };

    // Border colors
    border: {
        focus: string;
        primary: string;
        secondary: string;
    };

    error: string;
    errorAlert: string;
    // Hover states
    hover: {
        dark: string;
        light: string;
        medium: string;
    };
    info: string;
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
        down: string;
        mixed: string;
        paused: string;
        pending: string;
        unknown: string;
        up: string;
    };

    // Semantic colors
    success: string;

    // Surface colors
    surface: {
        base: string;
        elevated: string;
        overlay: string;
    };

    // Text colors
    text: {
        inverse: string;
        primary: string;
        secondary: string;
        tertiary: string;
    };

    warning: string;
}

/** Available theme names in the application */
export type ThemeName =
    | "custom"
    | "dark"
    | "high-contrast"
    | "light"
    | "system";

/**
 * Shadow system interface for elevation and depth.
 * Defines consistent shadow styles for UI components.
 */
export interface ThemeShadows {
    /** Inner shadow for inset effects */
    inner: string;
    /** Large shadow for high elevation */
    lg: string;
    /** Medium shadow for moderate elevation */
    md: string;
    /** Small shadow for subtle elevation */
    sm: string;
    /** Extra large shadow for maximum elevation */
    xl: string;
}

/**
 * Spacing scale interface for consistent layout spacing.
 * Defines standard spacing values used throughout the application.
 */
export interface ThemeSpacing {
    /** Double extra large spacing */
    "2xl": string;
    /** Triple extra large spacing */
    "3xl": string;
    /** Large spacing */
    lg: string;
    /** Medium spacing */
    md: string;
    /** Small spacing */
    sm: string;
    /** Extra large spacing */
    xl: string;
    /** Extra small spacing */
    xs: string;
}

/**
 * Theme state interface for managing active themes.
 * Tracks current theme selection and custom theme definitions.
 */
export interface ThemeState {
    /** Currently active theme object */
    activeTheme: Theme;
    /** Currently selected theme name */
    currentTheme: ThemeName;
    /** Custom user-defined themes */
    customThemes: Record<string, Theme>;
    /** System theme preference (light/dark) */
    systemThemePreference: "dark" | "light";
}

/**
 * Typography system interface for text styling.
 * Defines font families, sizes, weights, and line heights.
 */
export interface ThemeTypography {
    /** Font family definitions */
    fontFamily: {
        /** Monospace font stack */
        mono: string[];
        /** Sans-serif font stack */
        sans: string[];
    };
    /** Font size scale */
    fontSize: {
        "2xl": string;
        "3xl": string;
        "4xl": string;
        base: string;
        lg: string;
        sm: string;
        xl: string;
        xs: string;
    };
    /** Font weight scale */
    fontWeight: {
        bold: string;
        medium: string;
        normal: string;
        semibold: string;
    };
    /** Line height scale */
    lineHeight: {
        normal: string;
        relaxed: string;
        tight: string;
    };
}
