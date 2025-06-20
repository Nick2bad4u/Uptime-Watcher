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
}

export interface ThemeSpacing {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
}

export interface ThemeTypography {
    fontFamily: {
        sans: string[];
        mono: string[];
    };
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
    fontWeight: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
    };
    lineHeight: {
        tight: string;
        normal: string;
        relaxed: string;
    };
}

export interface ThemeShadows {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
}

export interface ThemeBorderRadius {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
}

export interface Theme {
    name: string;
    colors: ThemeColors;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    shadows: ThemeShadows;
    borderRadius: ThemeBorderRadius;
    isDark: boolean;
}

export type ThemeName = "light" | "dark" | "high-contrast" | "system" | "custom";

export interface ThemeState {
    currentTheme: ThemeName;
    customThemes: Record<string, Theme>;
    activeTheme: Theme;
    systemThemePreference: "light" | "dark";
}
