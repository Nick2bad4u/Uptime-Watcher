/**
 * Theme management hook providing theme state, controls, and utility functions.
 * Handles theme switching, system theme detection, and provides color/styling utilities.
 */

/* eslint-disable unicorn/consistent-function-scoping -- Hook functions must remain inside hooks for context access */

import { isSiteStatus, type MonitorStatus, type SiteStatus } from "@shared/types";
import { useCallback, useEffect, useState } from "react";

import { UI_DELAYS } from "../constants";
import { useSettingsStore } from "../stores/settings/useSettingsStore";
import { themeManager } from "./ThemeManager";
import { Theme, ThemeName } from "./types";

// Hook for availability-based colors
export function useAvailabilityColors(): {
    getAvailabilityColor: (percentage: number) => string;
    getAvailabilityDescription: (percentage: number) => string;
    getAvailabilityVariant: (percentage: number) => "danger" | "success" | "warning";
} {
    const { currentTheme } = useTheme();

    const getAvailabilityColor = (percentage: number): string => {
        // Clamp percentage between 0 and 100
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        // Use theme colors for consistency - aligned with description thresholds
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
        } else {
            return currentTheme.colors.status.down; // Failed
        }
    };

    const getAvailabilityVariant = (percentage: number): "danger" | "success" | "warning" => {
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

/**
 * Hook for accessing theme-aware status colors.
 * @returns Object containing status colors from the current theme
 */
export function useStatusColors(): {
    down: string;
    pending: string;
    unknown: string;
    up: string;
} {
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
 * This hook provides a complete theming solution with system integration,
 * color utilities, and automatic updates. It serves as the primary interface
 * for all theme-related operations throughout the application.
 *
 * @public
 *
 * @see {@link ThemeManager} for theme management implementation
 * @see {@link useSettingsStore} for settings integration
 *
 * @example
 * ```typescript
 * const { isDark, toggleTheme, getStatusColor } = useTheme();
 *
 * // Toggle between light and dark themes
 * toggleTheme();
 *
 * // Get status-based colors
 * const upColor = getStatusColor('up');
 * ```
 *
 * @returns Object containing theme state, setters, and utility functions
 */
export function useTheme() {
    const { settings, updateSettings } = useSettingsStore();
    const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");
    const [themeVersion, setThemeVersion] = useState(0); // Force re-renders

    // Memoized getCurrentTheme to satisfy useEffect deps and avoid unnecessary re-renders
    const getCurrentTheme = useCallback((): Theme => {
        return themeManager.getTheme(settings.theme);
    }, [settings.theme]);

    const [currentTheme, setCurrentTheme] = useState<Theme>(getCurrentTheme);

    // Create stable callbacks to avoid direct setState in useEffect
    const updateCurrentTheme = useCallback(() => {
        const newTheme = getCurrentTheme();
        setCurrentTheme(newTheme);
        themeManager.applyTheme(newTheme);
        setThemeVersion((previous) => previous + 1); // Force re-render of all themed components
    }, [getCurrentTheme]);

    const updateSystemTheme = useCallback((newSystemTheme: "dark" | "light") => {
        setSystemTheme(newSystemTheme);
    }, []);

    // Update theme when settings or systemTheme change
    useEffect(() => {
        // Use timeout to defer state update to avoid direct call in useEffect
        const updateTimeoutId = setTimeout(updateCurrentTheme, UI_DELAYS.STATE_UPDATE_DEFER);
        return () => clearTimeout(updateTimeoutId);
    }, [settings.theme, systemTheme, updateCurrentTheme]);

    // Listen for system theme changes
    useEffect(() => {
        const timeoutIds: NodeJS.Timeout[] = [];

        const cleanup = themeManager.onSystemThemeChange((isDark) => {
            const newSystemTheme = isDark ? "dark" : "light";
            // Use timeout to defer state update to avoid direct call in useEffect
            const timeoutId = setTimeout(() => updateSystemTheme(newSystemTheme), UI_DELAYS.STATE_UPDATE_DEFER);
            timeoutIds.push(timeoutId);
        });

        // Set initial system theme using timeout
        const initialTheme = themeManager.getSystemThemePreference();
        // eslint-disable-next-line @eslint-react/web-api/no-leaked-timeout -- Timeout is properly cleaned up in the forEach loop below
        const initialTimeoutId = setTimeout(() => updateSystemTheme(initialTheme), UI_DELAYS.STATE_UPDATE_DEFER);
        timeoutIds.push(initialTimeoutId);

        return () => {
            cleanup();
            // Clean up all pending timeouts
            timeoutIds.forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
        };
    }, [updateSystemTheme]);

    /**
     * Change the active theme.
     *
     * @param themeName - Name of the theme to activate
     *
     * @example
     * ```typescript
     * setTheme("dark"); // Switch to dark theme
     * setTheme("system"); // Use system preference
     * ```
     */
    const setTheme = (themeName: ThemeName) => {
        updateSettings({ theme: themeName });
    };

    /**
     * Toggle between light and dark themes.
     *
     * @remarks
     * Switches from current theme to its opposite (light ↔ dark).
     * If current theme is neither light nor dark, defaults to light.
     *
     * @example
     * ```typescript
     * toggleTheme(); // Dark theme → Light theme
     * ```
     */
    const toggleTheme = () => {
        const newTheme = currentTheme.isDark ? "light" : "dark";
        setTheme(newTheme);
    };

    /**
     * Get theme-aware color from a dot-notation path.
     *
     * @param path - Dot-notation path to the color (e.g., "colors.status.up")
     * @returns Color value as string, or theme-aware fallback if path is invalid
     *
     * @example
     * ```typescript
     * const upColor = getColor("status.up");
     * const primaryBg = getColor("background.primary");
     * ```
     */
    const getColor = (path: string): string => {
        const keys = path.split(".");
        let value: unknown = currentTheme.colors;
        for (const key of keys) {
            if (value && typeof value === "object" && Object.hasOwn(value, key)) {
                // eslint-disable-next-line security/detect-object-injection -- Object.hasOwn ensures safety
                value = (value as Record<string, unknown>)[key];
            } else {
                value = undefined;
                break;
            }
        }

        // Use theme-aware fallback instead of hard-coded black
        return typeof value === "string" ? value : currentTheme.colors.text.primary;
    };

    /**
     * Get status-specific color from the current theme.
     *
     * @param status - Site status value
     * @returns Status color from theme, or theme-aware fallback with warning
     *
     * @example
     * ```typescript
     * const upColor = getStatusColor("up");
     * const downColor = getStatusColor("down");
     * ```
     */
    const getStatusColor = (status: SiteStatus): string => {
        // Validate status using shared type guard
        if (isSiteStatus(status)) {
            // eslint-disable-next-line security/detect-object-injection -- currentTheme.colors.status is validated against SiteStatus type
            return currentTheme.colors.status[status];
        }
        // Use theme-aware fallback instead of hard-coded black
        return currentTheme.colors.text.secondary;
    };

    /**
     * Get all available theme names.
     *
     * @remarks
     * Dynamically retrieved from ThemeManager to ensure consistency
     * with actual available themes.
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
        /** Theme version for forcing re-renders */
        themeVersion,
        /** Toggle between light and dark themes */
        toggleTheme,
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

    const getTextClass = (variant: "inverse" | "primary" | "secondary" | "tertiary" = "primary") => {
        return {
            color: `var(--color-text-${variant})`,
        };
    };

    const getBorderClass = (variant: "focus" | "primary" | "secondary" = "primary") => {
        return {
            borderColor: `var(--color-border-${variant})`,
        };
    };

    const getSurfaceClass = (variant: "base" | "elevated" | "overlay" = "base") => {
        return {
            backgroundColor: `var(--color-surface-${variant})`,
        };
    };

    const getStatusClass = (status: MonitorStatus | SiteStatus) => {
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

/**
 * Utility hook for accessing specific values from the current theme.
 * @param selector - Function that extracts a value from the theme
 * @returns The selected value from the current theme
 */
export function useThemeValue<T>(selector: (theme: Theme) => T): T {
    const { currentTheme } = useTheme();
    return selector(currentTheme);
}

/* eslint-enable unicorn/consistent-function-scoping */
