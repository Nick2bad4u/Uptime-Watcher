import { useEffect, useState, useCallback } from "react";
import { useStore } from "../store";
import { themeManager } from "./ThemeManager";
export function useTheme() {
    const { settings, updateSettings } = useStore();
    const [systemTheme, setSystemTheme] = useState("light");
    const [themeVersion, setThemeVersion] = useState(0); // Force re-renders
    // Memoized getCurrentTheme to satisfy useEffect deps and avoid unnecessary re-renders
    const getCurrentTheme = useCallback(() => {
        const themeName = settings.theme;
        return themeManager.getTheme(themeName);
    }, [settings.theme]);
    const [currentTheme, setCurrentTheme] = useState(getCurrentTheme);
    // Update theme when settings or systemTheme change
    useEffect(() => {
        const newTheme = getCurrentTheme();
        setCurrentTheme(newTheme);
        themeManager.applyTheme(newTheme);
        setThemeVersion((prev) => prev + 1); // Force re-render of all themed components
    }, [settings.theme, systemTheme, getCurrentTheme]);
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
    const setTheme = (themeName) => {
        updateSettings({ theme: themeName });
    };
    // Toggle between light and dark
    const toggleTheme = () => {
        const newTheme = currentTheme.isDark ? "light" : "dark";
        setTheme(newTheme);
    };
    // Get theme-aware color
    const getColor = (path) => {
        const keys = path.split(".");
        const value = keys.reduce((acc, key) => acc && typeof acc === "object" && key in acc ? acc[key] : undefined, currentTheme.colors);
        return typeof value === "string" ? value : "#000000";
    };
    // Get status color
    const getStatusColor = (status) => {
        return currentTheme.colors.status[status];
    };
    // Get available themes
    const availableThemes = themeManager.getAvailableThemes();
    return {
        availableThemes,
        currentTheme,
        getColor,
        getStatusColor,
        isDark: currentTheme.isDark,
        setTheme,
        systemTheme,
        themeManager,
        themeName: settings.theme,
        themeVersion, // Include for forcing re-renders
        toggleTheme,
    };
}
// Utility hook for getting theme values in components
export function useThemeValue(selector) {
    const { currentTheme } = useTheme();
    return selector(currentTheme);
}
// Hook for theme-aware status colors
export function useStatusColors() {
    const { currentTheme } = useTheme();
    return {
        down: currentTheme.colors.status.down,
        pending: currentTheme.colors.status.pending,
        unknown: currentTheme.colors.status.unknown,
        up: currentTheme.colors.status.up,
    };
}
// Hook for theme-aware CSS classes using CSS custom properties
export function useThemeClasses() {
    const { getColor } = useTheme();
    const getBackgroundClass = (variant = "primary") => {
        return {
            backgroundColor: `var(--color-background-${variant})`,
        };
    };
    const getTextClass = (variant = "primary") => {
        return {
            color: `var(--color-text-${variant})`,
        };
    };
    const getBorderClass = (variant = "primary") => {
        return {
            borderColor: `var(--color-border-${variant})`,
        };
    };
    const getSurfaceClass = (variant = "base") => {
        return {
            backgroundColor: `var(--color-surface-${variant})`,
        };
    };
    const getStatusClass = (status) => {
        return {
            color: `var(--color-status-${status})`,
        };
    };
    return {
        getBackgroundClass,
        getBorderClass,
        getColor,
        getStatusClass,
        getSurfaceClass,
        getTextClass,
    };
}
// Hook for availability-based colors
export function useAvailabilityColors() {
    const { currentTheme } = useTheme();
    const getAvailabilityColor = (percentage) => {
        // Clamp percentage between 0 and 100
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        // Use theme colors for consistency
        if (clampedPercentage >= 99) {
            return currentTheme.colors.status.up; // Excellent
        }
        else if (clampedPercentage >= 95) {
            return currentTheme.colors.success; // Very good
        }
        else if (clampedPercentage >= 90) {
            return currentTheme.colors.status.up; // Good
        }
        else if (clampedPercentage >= 80) {
            return currentTheme.colors.status.pending; // Fair (warning)
        }
        else if (clampedPercentage >= 70) {
            return currentTheme.colors.warning; // Warning
        }
        else if (clampedPercentage >= 50) {
            return currentTheme.colors.error; // Poor
        }
        else {
            return currentTheme.colors.status.down; // Critical
        }
    };
    const getAvailabilityVariant = (percentage) => {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        if (clampedPercentage >= 95) {
            return "success";
        }
        else if (clampedPercentage >= 80) {
            return "warning";
        }
        else {
            return "danger";
        }
    };
    const getAvailabilityDescription = (percentage) => {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        if (clampedPercentage >= 99.9) {
            return "Excellent";
        }
        else if (clampedPercentage >= 99) {
            return "Very Good";
        }
        else if (clampedPercentage >= 95) {
            return "Good";
        }
        else if (clampedPercentage >= 90) {
            return "Fair";
        }
        else if (clampedPercentage >= 80) {
            return "Poor";
        }
        else if (clampedPercentage >= 50) {
            return "Critical";
        }
        else {
            return "Failed";
        }
    };
    return {
        getAvailabilityColor,
        getAvailabilityDescription,
        getAvailabilityVariant,
    };
}
