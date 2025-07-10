/**
 * Theme management hook providing theme state, controls, and utility functions.
 * Handles theme switching, system theme detection, and provides color/styling utilities.
 */

import { useEffect, useState, useCallback } from "react";

import type { StatusType } from "../constants";

import { useSettingsStore } from "../stores";
import { themeManager } from "./ThemeManager";
import { Theme, ThemeName } from "./types";

/**
 * Main theme hook providing comprehensive theme management functionality.
 *
 * Features:
 * - Current theme state and switching
 * - System theme detection and synchronization
 * - Status-based color utilities
 * - Availability color mapping
 * - CSS variable management
 *
 * @returns Object containing theme state, setters, and utility functions
 */
export function useTheme() {
    const { settings, updateSettings } = useSettingsStore();
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
    const [themeVersion, setThemeVersion] = useState(0); // Force re-renders

    // Memoized getCurrentTheme to satisfy useEffect deps and avoid unnecessary re-renders
    const getCurrentTheme = useCallback((): Theme => {
        return themeManager.getTheme(settings.theme);
    }, [settings.theme]);

    const [currentTheme, setCurrentTheme] = useState<Theme>(getCurrentTheme);

    // Update theme when settings or systemTheme change
    useEffect(() => {
        const newTheme = getCurrentTheme();
        setCurrentTheme(newTheme);
        themeManager.applyTheme(newTheme);
        setThemeVersion((previous) => previous + 1); // Force re-render of all themed components
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
        const value = keys.reduce<unknown>(
            (accumulator, key) =>
                accumulator && typeof accumulator === "object" && Object.hasOwn(accumulator, key)
                    ? // eslint-disable-next-line security/detect-object-injection -- Object.hasOwn ensures safety
                      (accumulator as Record<string, unknown>)[key]
                    : undefined,
            currentTheme.colors
        );
        return typeof value === "string" ? value : "#000000";
    };

    // Get status color
    const getStatusColor = (status: StatusType): string => {
        // Only allow known status keys
        const allowedStatuses: StatusType[] = ["up", "down", "pending", "unknown", "paused", "mixed"];
        if (allowedStatuses.includes(status)) {
            // eslint-disable-next-line security/detect-object-injection -- currentTheme.colors.status is validated against allowedStatuses
            return currentTheme.colors.status[status];
        }
        // Fallback to a safe color if status is invalid
        return "#000000";
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

/**
 * Utility hook for accessing specific values from the current theme.
 * @param selector - Function that extracts a value from the theme
 * @returns The selected value from the current theme
 */
export function useThemeValue<T>(selector: (theme: Theme) => T): T {
    const { currentTheme } = useTheme();
    return selector(currentTheme);
}

/**
 * Hook for accessing theme-aware status colors.
 * @returns Object containing status colors from the current theme
 */
export function useStatusColors() {
    const { currentTheme } = useTheme();

    return {
        down: currentTheme.colors.status.down,
        pending: currentTheme.colors.status.pending,
        unknown: currentTheme.colors.status.unknown,
        up: currentTheme.colors.status.up,
    };
}

/**
 * Hook for theme-aware CSS classes using CSS custom properties.
 * Provides utility functions for generating dynamic CSS classes based on the current theme.
 * @returns Object with methods for generating background, text, and status classes
 */
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

    const getStatusClass = (status: "up" | "down" | "pending" | "unknown" | "paused") => {
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

    const getAvailabilityColor = (percentage: number): string => {
        // Clamp percentage between 0 and 100
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        // Use theme colors for consistency
        if (clampedPercentage >= 99) {
            return currentTheme.colors.status.up; // Excellent
        } else if (clampedPercentage >= 95) {
            return currentTheme.colors.success; // Very good
        } else if (clampedPercentage >= 90) {
            return currentTheme.colors.status.up; // Good
        } else if (clampedPercentage >= 80) {
            return currentTheme.colors.status.pending; // Fair (warning)
        } else if (clampedPercentage >= 70) {
            return currentTheme.colors.warning; // Warning
        } else if (clampedPercentage >= 50) {
            return currentTheme.colors.error; // Poor
        } else {
            return currentTheme.colors.status.down; // Critical
        }
    };

    const getAvailabilityVariant = (percentage: number): "success" | "warning" | "danger" => {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        if (clampedPercentage >= 95) {
            return "success";
        } else if (clampedPercentage >= 80) {
            return "warning";
        } else {
            return "danger";
        }
    };

    const getAvailabilityDescription = (percentage: number): string => {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        if (clampedPercentage >= 99.9) {
            return "Excellent";
        } else if (clampedPercentage >= 99) {
            return "Very Good";
        } else if (clampedPercentage >= 95) {
            return "Good";
        } else if (clampedPercentage >= 90) {
            return "Fair";
        } else if (clampedPercentage >= 80) {
            return "Poor";
        } else if (clampedPercentage >= 50) {
            return "Critical";
        } else {
            return "Failed";
        }
    };

    return {
        getAvailabilityColor,
        getAvailabilityDescription,
        getAvailabilityVariant,
    };
}
