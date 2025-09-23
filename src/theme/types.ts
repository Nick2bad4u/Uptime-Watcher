/**
 * Theme system type definitions.
 *
 * @remarks
 * Defines the structure and interfaces for the application's theming system
 * including colors, typography, spacing, and visual effects.
 */

import type { SystemThemePreference } from "./components/types";

/**
 * Complete theme interface containing all theme properties. Represents a
 * complete theme configuration with all styling properties.
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
 * Border radius system interface for consistent corner rounding. Defines
 * standard border radius values for components.
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
 * Color palette interface defining all theme colors. Provides a comprehensive
 * color system for consistent theming.
 */
export interface ThemeColors {
    /**
     * Background colors for different surface levels.
     */
    background: {
        /** Modal overlay background color */
        modal: string;
        /** Primary background color for main content areas */
        primary: string;
        /** Secondary background color for content sections */
        secondary: string;
        /** Tertiary background color for nested content */
        tertiary: string;
    };

    /**
     * Border colors for different UI states.
     */
    border: {
        /** Focus indicator border color for accessibility */
        focus: string;
        /** Primary border color for main UI elements */
        primary: string;
        /** Secondary border color for subtle divisions */
        secondary: string;
    };

    /** Primary error color for error states and messages */
    error: string;
    /** Alert-level error color for critical error states */
    errorAlert: string;

    /**
     * Hover state colors for interactive elements.
     */
    hover: {
        /** Dark hover state color */
        dark: string;
        /** Light hover state color */
        light: string;
        /** Medium hover state color */
        medium: string;
    };

    /** Information color for informational messages and states */
    info: string;
    /**
     * Primary color palette with multiple shades.
     */
    primary: {
        /** Darkest primary shade (50) */
        50: string;
        /** Very dark primary shade (100) */
        100: string;
        /** Dark primary shade (200) */
        200: string;
        /** Medium-dark primary shade (300) */
        300: string;
        /** Medium primary shade (400) */
        400: string;
        /** Base primary color (500) */
        500: string;
        /** Medium-light primary shade (600) */
        600: string;
        /** Light primary shade (700) */
        700: string;
        /** Very light primary shade (800) */
        800: string;
        /** Lightest primary shade (900) */
        900: string;
    };

    /**
     * Shadow colors for box-shadow CSS variables.
     */
    shadows: {
        /** Shadow color for degraded status elements */
        degraded: string;
        /** Shadow color for error status elements */
        error: string;
        /** Shadow color for paused status elements */
        paused: string;
        /** Shadow color for success status elements */
        success: string;
        /** Shadow color for warning status elements */
        warning: string;
    };

    /**
     * Status colors for monitor states.
     */
    status: {
        /** Color for degraded monitor status */
        degraded: string;
        /** Color for down/offline monitor status */
        down: string;
        /** Color for mixed monitor status */
        mixed: string;
        /** Color for paused monitor status */
        paused: string;
        /** Color for pending monitor status */
        pending: string;
        /** Color for unknown monitor status */
        unknown: string;
        /** Color for up/online monitor status */
        up: string;
    };

    /** Success color for positive actions and states */
    success: string;

    /**
     * Surface colors for different elevation levels.
     */
    surface: {
        /** Base surface color for main content */
        base: string;
        /** Elevated surface color for raised elements */
        elevated: string;
        /** Overlay surface color for modal overlays */
        overlay: string;
    };

    /**
     * Text colors for different content types.
     */
    text: {
        /** Inverse text color for contrasting backgrounds */
        inverse: string;
        /** Primary text color for main content */
        primary: string;
        /** Secondary text color for supporting content */
        secondary: string;
        /** Tertiary text color for less important content */
        tertiary: string;
    };

    /** Warning color for warning states and messages */
    warning: string;

    /** White color definition */
    white: string;
}

/**
 * Shadow system interface for elevation and depth. Defines consistent shadow
 * styles for UI components.
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
 * Spacing scale interface for consistent layout spacing. Defines standard
 * spacing values used throughout the application.
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
 * Theme state interface for managing active themes. Tracks current theme
 * selection and custom theme definitions.
 */
export interface ThemeState {
    /** Currently active theme object */
    activeTheme: Theme;
    /** Currently selected theme name */
    currentTheme: ThemeName;
    /** Custom user-defined themes */
    customThemes: Record<string, Theme>;
    /** System theme preference (light/dark) */
    systemThemePreference: SystemThemePreference;
}

/**
 * Typography system interface for text styling. Defines font families, sizes,
 * weights, and line heights.
 */
export interface ThemeTypography {
    /** Font family definitions */
    fontFamily: {
        /** Monospace font stack */
        mono: readonly string[];
        /** Sans-serif font stack */
        sans: readonly string[];
    };
    /** Font size scale */
    fontSize: {
        /** Extra extra large font size (2xl) */
        "2xl": string;
        /** Extra extra extra large font size (3xl) */
        "3xl": string;
        /** Extra extra extra extra large font size (4xl) */
        "4xl": string;
        /** Base font size for body text */
        base: string;
        /** Large font size */
        lg: string;
        /** Small font size */
        sm: string;
        /** Extra large font size */
        xl: string;
        /** Extra small font size */
        xs: string;
    };
    /** Font weight scale */
    fontWeight: {
        /** Bold font weight for emphasis */
        bold: string;
        /** Medium font weight for moderate emphasis */
        medium: string;
        /** Normal font weight for body text */
        normal: string;
        /** Semi-bold font weight for subtle emphasis */
        semibold: string;
    };
    /** Line height scale */
    lineHeight: {
        /** Normal line height for readable text */
        normal: string;
        /** Relaxed line height for improved readability */
        relaxed: string;
        /** Tight line height for compact text */
        tight: string;
    };
}

/** Available theme names in the application */
export type ThemeName =
    | "custom"
    | "dark"
    | "high-contrast"
    | "light"
    | "system";
