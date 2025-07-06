/**
 * Theme definitions for the application.
 * Contains predefined light and dark theme configurations with complete styling properties.
 */

import { FONT_FAMILY_MONO, FONT_FAMILY_SANS } from "../constants";
import { Theme } from "./types";

/**
 * Light theme configuration.
 * Provides a clean, bright appearance suitable for well-lit environments.
 */
export const lightTheme: Theme = {
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
            modal: "rgba(0, 0, 0, 0.5)",
            primary: "#ffffff",
            secondary: "#f9fafb",
            tertiary: "#f3f4f6",
        },
        border: {
            focus: "#3b82f6",
            primary: "#e5e7eb",
            secondary: "#d1d5db",
        },
        error: "#ef4444",
        errorAlert: "#991b1b", // Dark red for error alerts
        hover: {
            dark: "rgba(0, 0, 0, 0.08)",
            light: "rgba(0, 0, 0, 0.03)",
            medium: "rgba(0, 0, 0, 0.05)",
        },
        info: "#3b82f6",
        primary: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
        },
        status: {
            down: "#ef4444",
            mixed: "#8b5cf6",
            paused: "#6b7280",
            pending: "#f59e0b",
            unknown: "#6b7280",
            up: "#10b981",
        },
        success: "#10b981",
        surface: {
            base: "#ffffff",
            elevated: "#ffffff",
            overlay: "#f9fafb",
        },
        text: {
            inverse: "#ffffff",
            primary: "#111827",
            secondary: "#6b7280",
            tertiary: "#9ca3af",
        },
        warning: "#f59e0b",
    },
    isDark: false,
    name: "light",
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
 * Dark theme configuration.
 * Provides a modern dark appearance suitable for low-light environments and reduced eye strain.
 */
export const darkTheme: Theme = {
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
            modal: "rgba(0, 0, 0, 0.8)",
            primary: "#111827",
            secondary: "#1f2937",
            tertiary: "#1a1f29",
        },
        border: {
            focus: "#60a5fa",
            primary: "#1a1f29",
            secondary: "#4b5563",
        },
        error: "#f87171",
        errorAlert: "#dc2626", // Red for error alerts in dark mode
        hover: {
            dark: "rgba(255, 255, 255, 0.12)",
            light: "rgba(255, 255, 255, 0.05)",
            medium: "rgba(255, 255, 255, 0.08)",
        },
        info: "#60a5fa",
        primary: {
            50: "#1e3a8a",
            100: "#1e40af",
            200: "#1d4ed8",
            300: "#2563eb",
            400: "#3b82f6",
            500: "#60a5fa",
            600: "#93c5fd",
            700: "#bfdbfe",
            800: "#dbeafe",
            900: "#eff6ff",
        },
        status: {
            down: "#f87171",
            mixed: "#a78bfa",
            paused: "#9ca3af",
            pending: "#fbbf24",
            unknown: "#9ca3af",
            up: "#34d399",
        },
        success: "#34d399",
        surface: {
            base: "#1f2937",
            elevated: "#1a1f29",
            overlay: "#111827",
        },
        text: {
            inverse: "#111827",
            primary: "#f9fafb",
            secondary: "#d1d5db",
            tertiary: "#9ca3af",
        },
        warning: "#fbbf24",
    },
    isDark: true,
    name: "dark",
    shadows: {
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
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

// High contrast theme for accessibility
export const highContrastTheme: Theme = {
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
        errorAlert: "#cc0000", // Dark red for error alerts in high contrast
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
        status: {
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
            "2xl": "1.75rem",
            "3xl": "2rem",
            "4xl": "2.5rem",
            base: "1.125rem",
            lg: "1.25rem",
            sm: "1rem",
            xl: "1.5rem",
            xs: "0.875rem", // Slightly larger for accessibility
        },
        fontWeight: {
            bold: "800",
            medium: "600",
            normal: "500", // Slightly bolder for better contrast
            semibold: "700",
        },
        lineHeight: {
            normal: "1.6",
            relaxed: "1.8",
            tight: "1.4",
        },
    },
};

export const themes = {
    dark: darkTheme,
    "high-contrast": highContrastTheme,
    light: lightTheme,
} as const;
