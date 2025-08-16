/**
 * Theme management hook providing theme state, controls, and utility functions.
 * Handles theme switching, system theme detection, and provides color/styling
 * utilities.
 */

import {
    isSiteStatus,
    type MonitorStatus,
    type SiteStatus,
} from "@shared/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Theme, ThemeName } from "./types";

import { useSettingsStore } from "../stores/settings/useSettingsStore";
import { themeManager, type ThemeManager } from "./ThemeManager";

/**
 * Interface for useAvailabilityColors hook return type.
 */
interface UseAvailabilityColorsReturn {
    getAvailabilityColor: (percentage: number) => string;
    getAvailabilityDescription: (percentage: number) => string;
    getAvailabilityVariant: (
        percentage: number
    ) => "danger" | "success" | "warning";
}

/**
 * Interface for useStatusColors hook return type.
 */
interface UseStatusColorsReturn {
    down: string;
    pending: string;
    unknown: string;
    up: string;
}

/**
 * Interface for useThemeClasses hook return type.
 */
interface UseThemeClassesReturn {
    getBackgroundClass: (variant?: "primary" | "secondary" | "tertiary") => {
        backgroundColor: string;
    };
    getBorderClass: (variant?: "focus" | "primary" | "secondary") => {
        borderColor: string;
    };
    getColor: (path: string) => string;
    getStatusClass: (status: MonitorStatus | SiteStatus) => {
        color: string;
    };
    getSurfaceClass: (variant?: "base" | "elevated" | "overlay") => {
        backgroundColor: string;
    };
    getTextClass: (
        variant?: "inverse" | "primary" | "secondary" | "tertiary"
    ) => {
        color: string;
    };
}

/**
 * Interface for useTheme hook return type.
 */
interface UseThemeReturn {
    /** Array of all available theme names */
    availableThemes: ThemeName[];
    /** Current active theme object */
    currentTheme: Theme;
    /** Get color value from dot-notation path */
    getColor: (path: string) => string;
    /** Get status-specific color */
    getStatusColor: (status: SiteStatus) => string;
    /** Whether current theme is dark mode */
    isDark: boolean;
    /** Change active theme */
    setTheme: (themeName: ThemeName) => void;
    /** Current system theme preference */
    systemTheme: "dark" | "light";
    /** ThemeManager instance for advanced operations */
    themeManager: ThemeManager;
    /** Current theme name */
    themeName: ThemeName;
    /** Toggle between light and dark themes */
    toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
    const { settings, updateSettings } = useSettingsStore();
    const [systemTheme, setSystemTheme] = useState<"dark" | "light">(
        // Initialize with actual system preference to avoid flashing
        () => themeManager.getSystemThemePreference()
    );

    // Memoized getCurrentTheme to satisfy useEffect deps and avoid unnecessary
    // re-renders
    const getCurrentTheme = useCallback((): Theme => {
        if (settings.theme === "system") {
            // Use component's systemTheme state for consistency with useEffect dependency
            return themeManager.getTheme(systemTheme);
        }
        return themeManager.getTheme(settings.theme);
    }, [settings.theme, systemTheme]);

    // Compute theme directly during render - no useEffect needed for theme application
    const currentTheme = useMemo(() => {
        const theme = getCurrentTheme();
        // Apply theme to DOM immediately during render
        // This ensures consistency without useEffect timing issues
        themeManager.applyTheme(theme);
        return theme;
    }, [getCurrentTheme]);

    const updateSystemTheme = useCallback(
        (newSystemTheme: "dark" | "light") => {
            // Only update if the theme actually changed to prevent unnecessary re-renders
            setSystemTheme((current) =>
                current === newSystemTheme ? current : newSystemTheme
            );
        },
        []
    );

    // Listen for system theme changes
    useEffect(
        function handleSystemThemeChanges() {
            const cleanup = themeManager.onSystemThemeChange((isDark) => {
                const newSystemTheme = isDark ? "dark" : "light";
                // Apply change immediately without timeout to reduce flashing
                updateSystemTheme(newSystemTheme);
            });

            // No need to set initial theme here since we initialize state with actual preference
            return (): void => {
                cleanup();
            };
        },
        // systemTheme is not needed as dependency since this effect only sets up listeners
        [updateSystemTheme]
    );

    /**
     * Change the active theme.
     *
     * @example
     *
     * ```typescript
     * setTheme("dark"); // Switch to dark theme
     * setTheme("system"); // Use system preference
     * ```
     *
     * @param themeName - Name of the theme to activate
     */
    const setTheme = useCallback(
        (themeName: ThemeName) => {
            updateSettings({ theme: themeName });
        },
        [updateSettings]
    );

    /**
     * Toggle between light and dark themes.
     *
     * @remarks
     * Switches from current theme to its opposite (light ↔ dark). If current
     * theme is neither light nor dark, defaults to light.
     *
     * @example
     *
     * ```typescript
     * toggleTheme(); // Dark theme → Light theme
     * ```
     */
    const toggleTheme = useCallback(() => {
        const newTheme = currentTheme.isDark ? "light" : "dark";
        setTheme(newTheme);
    }, [currentTheme.isDark, setTheme]);

    /**
     * Get theme-aware color from a dot-notation path.
     *
     * @example
     *
     * ```typescript
     * const upColor = getColor("status.up");
     * const primaryBg = getColor("background.primary");
     * ```
     *
     * @param path - Dot-notation path to the color (e.g., "colors.status.up")
     *
     * @returns Color value as string, or theme-aware fallback if path is
     *   invalid
     */
    const getColor = useCallback(
        (path: string) => {
            const keys = path.split(".");
            let value: unknown = currentTheme.colors;
            for (const key of keys) {
                if (
                    value &&
                    typeof value === "object" &&
                    Object.hasOwn(value, key)
                ) {
                    value = (value as Record<string, unknown>)[key];
                } else {
                    value = undefined;
                    break;
                }
            }

            // Use theme-aware fallback instead of hard-coded black
            return typeof value === "string"
                ? value
                : currentTheme.colors.text.primary;
        },
        [currentTheme.colors]
    );

    /**
     * Get status-specific color from the current theme.
     *
     * @example
     *
     * ```typescript
     * const upColor = getStatusColor("up");
     * const downColor = getStatusColor("down");
     * ```
     *
     * @param status - Site status value
     *
     * @returns Status color from theme, or theme-aware fallback with warning
     */
    const getStatusColor = useCallback(
        (status: SiteStatus) => {
            // Validate status using shared type guard
            if (isSiteStatus(status)) {
                return currentTheme.colors.status[status];
            }
            // Use theme-aware fallback instead of hard-coded black
            return currentTheme.colors.text.secondary;
        },
        [currentTheme.colors.status, currentTheme.colors.text.secondary]
    );

    /**
     * Get all available theme names.
     *
     * @remarks
     * Dynamically retrieved from ThemeManager to ensure consistency with actual
     * available themes.
     */
    const availableThemes = themeManager.getAvailableThemes();

    return {
        /** Array of all available theme names */
        availableThemes,
        /** Current active theme object */
        currentTheme,
        /** Get color value from dot-notation path */
        getColor,
        /** Get status-specific color */
        getStatusColor,
        /** Whether current theme is dark mode */
        isDark: currentTheme.isDark,
        /** Change active theme */
        setTheme,
        /** Current system theme preference */
        systemTheme,
        /** ThemeManager instance for advanced operations */
        themeManager,
        /** Current theme name */
        themeName: settings.theme,
        /** Toggle between light and dark themes */
        toggleTheme,
    };
}

// Hook for availability-based colors
export function useAvailabilityColors(): UseAvailabilityColorsReturn {
    const { currentTheme } = useTheme();

    const getAvailabilityColor = useCallback(
        (percentage: number) => {
            // Clamp percentage between 0 and 100
            const clampedPercentage = Math.max(0, Math.min(100, percentage));

            // Use theme colors for consistency - aligned with description
            // thresholds
            if (clampedPercentage >= 99.9) {
                return currentTheme.colors.status.up; // Excellent
            } else if (clampedPercentage >= 99) {
                return currentTheme.colors.success; // Very Good
            } else if (clampedPercentage >= 95) {
                return currentTheme.colors.success; // Good
            } else if (clampedPercentage >= 90) {
                return currentTheme.colors.status.pending; // Fair
            } else if (clampedPercentage >= 80) {
                return currentTheme.colors.warning; // Poor
            } else if (clampedPercentage >= 50) {
                return currentTheme.colors.error; // Critical
            }
            return currentTheme.colors.status.down; // Failed
        },
        [
            currentTheme.colors.error,
            currentTheme.colors.status.down,
            currentTheme.colors.status.pending,
            currentTheme.colors.status.up,
            currentTheme.colors.success,
            currentTheme.colors.warning,
        ]
    );

    const getAvailabilityVariant = useCallback((percentage: number) => {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        if (clampedPercentage >= 95) {
            return "success";
        } else if (clampedPercentage >= 80) {
            return "warning";
        }
        return "danger";
    }, []);

    const getAvailabilityDescription = useCallback((percentage: number) => {
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
        }
        return "Failed";
    }, []);

    return {
        getAvailabilityColor,
        getAvailabilityDescription,
        getAvailabilityVariant,
    };
}

/**
 * Hook for accessing theme-aware status colors.
 *
 * @returns Object containing status colors from the current theme
 */
export function useStatusColors(): UseStatusColorsReturn {
    const { currentTheme } = useTheme();

    return {
        down: currentTheme.colors.status.down,
        pending: currentTheme.colors.status.pending,
        unknown: currentTheme.colors.status.unknown,
        up: currentTheme.colors.status.up,
    };
}

/**
 * Main theme hook providing comprehensive theme management functionality.
 *
 * @remarks
 * This hook provides a complete theming solution with system integration, color
 * utilities, and automatic updates. It serves as the primary interface for all
 * theme-related operations throughout the application.
 *
 * @example
 *
 * ```typescript
 * const { isDark, toggleTheme, getStatusColor } = useTheme();
 *
 * // Toggle between light and dark themes
 * toggleTheme();
 *
 * // Get status-based colors
 * const upColor = getStatusColor("up");
 * ```
 *
 * @returns Object containing theme state, setters, and utility functions
 *
 * @public
 *
 * @see {@link ThemeManager} for theme management implementation
 * @see {@link useSettingsStore} for settings integration
 */

/**
 * Hook for theme-aware CSS classes using CSS custom properties. Provides
 * utility functions for generating dynamic CSS classes based on the current
 * theme.
 *
 * @returns Object with methods for generating background, text, and status
 *   classes
 */
export function useThemeClasses(): UseThemeClassesReturn {
    const { getColor } = useTheme();

    const getBackgroundClass = useCallback(
        (variant: "primary" | "secondary" | "tertiary" = "primary") => ({
            backgroundColor: `var(--color-background-${variant})`,
        }),
        []
    );

    const getTextClass = useCallback(
        (
            variant:
                | "inverse"
                | "primary"
                | "secondary"
                | "tertiary" = "primary"
        ) => ({
            color: `var(--color-text-${variant})`,
        }),
        []
    );

    const getBorderClass = useCallback(
        (variant: "focus" | "primary" | "secondary" = "primary") => ({
            borderColor: `var(--color-border-${variant})`,
        }),
        []
    );

    const getSurfaceClass = useCallback(
        (variant: "base" | "elevated" | "overlay" = "base") => ({
            backgroundColor: `var(--color-surface-${variant})`,
        }),
        []
    );

    const getStatusClass = useCallback(
        (status: MonitorStatus | SiteStatus) => ({
            color: `var(--color-status-${status})`,
        }),
        []
    );

    return {
        getBackgroundClass,
        getBorderClass,
        getColor,
        getStatusClass,
        getSurfaceClass,
        getTextClass,
    };
}

/**
 * Utility hook for accessing specific values from the current theme.
 *
 * @param selector - Function that extracts a value from the theme
 *
 * @returns The selected value from the current theme
 */
export function useThemeValue<T>(selector: (theme: Theme) => T): T {
    const { currentTheme } = useTheme();
    return selector(currentTheme);
}
