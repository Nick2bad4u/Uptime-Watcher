import { useEffect, useState } from "react";
import { Theme, ThemeName } from "./types";
import { themeManager } from "./ThemeManager";
import { useStore } from "../store";

export function useTheme() {
    const { settings, updateSettings } = useStore();
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
    const [themeVersion, setThemeVersion] = useState(0); // Force re-renders

    // Get current theme based on settings
    const getCurrentTheme = (): Theme => {
        const themeName = settings.theme as ThemeName;
        return themeManager.getTheme(themeName);
    };

    const [currentTheme, setCurrentTheme] = useState<Theme>(getCurrentTheme);

    // Update theme when settings change
    useEffect(() => {
        const newTheme = getCurrentTheme();
        setCurrentTheme(newTheme);
        themeManager.applyTheme(newTheme);
        setThemeVersion(prev => prev + 1); // Force re-render of all themed components
    }, [settings.theme, systemTheme]);

    // Listen for system theme changes
    useEffect(() => {
        const cleanup = themeManager.onSystemThemeChange((isDark) => {
            const newSystemTheme = isDark ? "dark" : "light";
            setSystemTheme(newSystemTheme);
        });

        // Set initial system theme
        setSystemTheme(themeManager.getSystemThemePreference());

        return cleanup;
    }, []);

    // Change theme
    const setTheme = (themeName: ThemeName) => {
        updateSettings({ theme: themeName });
    };

    // Toggle between light and dark
    const toggleTheme = () => {
        const newTheme = currentTheme.isDark ? "light" : "dark";
        setTheme(newTheme);
    };

    // Get theme-aware color
    const getColor = (path: string): string => {
        const keys = path.split(".");
        let value: any = currentTheme.colors;

        for (const key of keys) {
            if (value && typeof value === "object") {
                value = value[key];
            } else {
                return "#000000"; // Fallback
            }
        }

        return typeof value === "string" ? value : "#000000";
    };

    // Get status color
    const getStatusColor = (status: "up" | "down" | "pending" | "unknown"): string => {
        return currentTheme.colors.status[status];
    };

    // Get available themes
    const availableThemes = themeManager.getAvailableThemes();

    return {
        currentTheme,
        themeName: settings.theme as ThemeName,
        systemTheme,
        setTheme,
        toggleTheme,
        getColor,
        getStatusColor,
        availableThemes,
        isDark: currentTheme.isDark,
        themeManager,
        themeVersion, // Include for forcing re-renders
    };
}

// Utility hook for getting theme values in components
export function useThemeValue<T>(selector: (theme: Theme) => T): T {
    const { currentTheme } = useTheme();
    return selector(currentTheme);
}

// Hook for theme-aware status colors
export function useStatusColors() {
    const { currentTheme } = useTheme();

    return {
        up: currentTheme.colors.status.up,
        down: currentTheme.colors.status.down,
        pending: currentTheme.colors.status.pending,
        unknown: currentTheme.colors.status.unknown,
    };
}

// Hook for theme-aware CSS classes using CSS custom properties
export function useThemeClasses() {
    const { getColor } = useTheme();

    const getBackgroundClass = (variant: "primary" | "secondary" | "tertiary" = "primary") => {
        return {
            backgroundColor: `var(--color-background-${variant})`,
        };
    };

    const getTextClass = (variant: "primary" | "secondary" | "tertiary" | "inverse" = "primary") => {
        return {
            color: `var(--color-text-${variant})`,
        };
    };

    const getBorderClass = (variant: "primary" | "secondary" | "focus" = "primary") => {
        return {
            borderColor: `var(--color-border-${variant})`,
        };
    };

    const getSurfaceClass = (variant: "base" | "elevated" | "overlay" = "base") => {
        return {
            backgroundColor: `var(--color-surface-${variant})`,
        };
    };

    const getStatusClass = (status: "up" | "down" | "pending" | "unknown") => {
        return {
            color: `var(--color-status-${status})`,
        };
    };

    return {
        getBackgroundClass,
        getTextClass,
        getBorderClass,
        getSurfaceClass,
        getStatusClass,
        getColor,
    };
}
