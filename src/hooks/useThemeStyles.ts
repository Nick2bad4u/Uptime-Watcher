// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @metamask/design-tokens/color-no-hex */
/**
 * Custom hook for theme-aware CSS-in-JS styles
 * Provides consistent styling that respects user's theme preference
 *
 * @param isCollapsed - boolean - Whether the component is in collapsed state (default: false)
 * @returns ThemeStyles object containing all CSS-in-JS style properties
 *
 * @remarks
 * This hook provides theme-aware styling with proper SSR support and runtime
 * theme change reactivity. It uses media query listeners to detect theme
 * changes and updates styles accordingly.
 *
 * The hook handles:
 * - Server-side rendering compatibility
 * - Runtime theme preference changes
 * - Graceful fallback when window APIs are unavailable
 * - Smooth transitions between themes
 *
 * @example
 * ```tsx
 * function ThemeAwareComponent({ collapsed }) {
 *   const styles = useThemeStyles(collapsed);
 *
 *   return (
 *     <div style={styles.headerStyle}>
 *       <button style={styles.collapseButtonStyle}>Toggle</button>
 *       <div style={styles.contentStyle}>Content</div>
 *     </div>
 *   );
 * }
 * ```
 */

import type { CSSProperties } from "react";

import { useCallback, useMemo, useRef, useState } from "react";

import { useMount } from "./useMount";

/**
 * Theme styles interface for CSS-in-JS styling
 *
 * @public
 */
export interface ThemeStyles {
    /** Button styles for collapse/expand controls */
    collapseButtonStyle: CSSProperties;
    /** Main content area styling */
    contentStyle: CSSProperties;
    /** Header section styling */
    headerStyle: CSSProperties;
    /** Metadata text styling */
    metaStyle: CSSProperties;
    /** Overlay/modal backdrop styling */
    overlayStyle: CSSProperties;
    /** Primary title text styling */
    titleStyle: CSSProperties;
    /** URL/link text styling */
    urlStyle: CSSProperties;
}

/**
 * Common transition easing for consistent animations
 */
const TRANSITION_EASING = "0.3s cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Generates collapse button styles based on theme
 *
 * @param isDarkMode - Whether dark mode is active
 * @returns CSS properties for collapse button
 */
function getCollapseButtonStyle(isDarkMode: boolean): CSSProperties {
    return {
        alignItems: "center",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "0.375rem",
        color: isDarkMode ? "#9ca3af" : "#6b7280",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        padding: "0.5rem",
        transition: `all ${TRANSITION_EASING}`,
    };
}

/**
 * Generates content area styles based on collapse state
 *
 * @param isCollapsed - Whether the component is collapsed
 * @returns CSS properties for content area
 */
function getContentStyle(isCollapsed: boolean): CSSProperties {
    return {
        padding: isCollapsed ? "1rem 1.5rem" : "1.5rem",
        position: "relative",
        transition: `padding ${TRANSITION_EASING}`,
        zIndex: 2,
    };
}

/**
 * Generates header styles based on theme and collapse state
 *
 * @param isCollapsed - Whether the component is collapsed
 * @param isDarkMode - Whether dark mode is active
 * @returns CSS properties for header section
 */
function getHeaderStyle(
    isCollapsed: boolean,
    isDarkMode: boolean
): CSSProperties {
    const darkGradient =
        "linear-gradient(120deg, rgba(37, 99, 235, 0.15) 0%, rgba(147, 51, 234, 0.15) 60%, rgba(31, 41, 55, 0.8) 100%)";
    const lightGradient =
        "linear-gradient(120deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 60%, rgba(249, 250, 251, 0.9) 100%)";

    const darkShadow =
        "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)";
    const lightShadow =
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";

    return {
        background: isDarkMode ? darkGradient : lightGradient,
        borderRadius: "0.75rem",
        boxShadow: isDarkMode ? darkShadow : lightShadow,
        color: isDarkMode ? "#f3f4f6" : "#111827",
        height: isCollapsed ? "80px" : "auto",
        marginBottom: "1.25rem",
        minHeight: isCollapsed ? "80px" : "140px",
        overflow: "hidden",
        padding: "1.5rem",
        position: "relative",
        transition: `all ${TRANSITION_EASING}`,
    };
}

/**
 * Generates metadata text styles based on theme
 *
 * @param isDarkMode - Whether dark mode is active
 * @returns CSS properties for metadata text
 */
function getMetaStyle(isDarkMode: boolean): CSSProperties {
    return {
        alignItems: "center",
        color: isDarkMode ? "#9ca3af" : "#6b7280",
        display: "flex",
        fontSize: "1rem",
        fontWeight: 600,
        gap: "0.75rem",
        marginTop: "0.25rem",
        opacity: 0.9,
    };
}

/**
 * Generates overlay/backdrop styles based on theme
 *
 * @param isDarkMode - Whether dark mode is active
 * @returns CSS properties for overlay backdrop
 */
function getOverlayStyle(isDarkMode: boolean): CSSProperties {
    const darkGradient =
        "linear-gradient(120deg, rgba(37, 99, 235, 0.05) 0%, rgba(147, 51, 234, 0.05) 60%, rgba(31, 41, 55, 0.1) 100%)";
    const lightGradient =
        "linear-gradient(120deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 60%, rgba(249, 250, 251, 0.1) 100%)";

    return {
        background: isDarkMode ? darkGradient : lightGradient,
        borderRadius: "0.75rem",
        bottom: 0,
        left: 0,
        opacity: 0.85,
        pointerEvents: "none",
        position: "absolute",
        right: 0,
        top: 0,
        transition: `background ${TRANSITION_EASING}, opacity ${TRANSITION_EASING}`,
        zIndex: 1,
    };
}

/**
 * Generates title text styles based on theme
 *
 * @param isDarkMode - Whether dark mode is active
 * @returns CSS properties for title text
 */
function getTitleStyle(isDarkMode: boolean): CSSProperties {
    const darkShadow =
        "0 2px 12px rgba(59, 130, 246, 0.3), 0 1px 0 rgba(37, 99, 235, 0.3)";
    const lightShadow =
        "0 2px 12px rgba(59, 130, 246, 0.1), 0 1px 0 rgba(37, 99, 235, 0.1)";

    return {
        color: isDarkMode ? "#f3f4f6" : "#111827",
        cursor: "default",
        fontSize: "1.875rem",
        fontWeight: 700,
        letterSpacing: "0.01em",
        lineHeight: 1.25,
        margin: 0,
        textShadow: isDarkMode ? darkShadow : lightShadow,
        transition: `all ${TRANSITION_EASING}`,
    };
}

/**
 * Generates URL/link text styles based on theme
 *
 * @param isDarkMode - Whether dark mode is active
 * @returns CSS properties for URL text
 */
function getUrlStyle(isDarkMode: boolean): CSSProperties {
    return {
        background: "none",
        color: isDarkMode ? "#9ca3af" : "#6b7280",
        fontSize: "1.125rem",
        fontWeight: 600,
        margin: 0,
        maxWidth: "100%",
        opacity: 1,
        padding: 0,
        textDecoration: "none",
        transition: `color ${TRANSITION_EASING}, opacity ${TRANSITION_EASING}`,
        wordBreak: "break-all",
    };
}

export function useThemeStyles(isCollapsed = false): ThemeStyles {
    // Use state to track theme changes for reactivity
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // SSR-safe initialization
        if (
            typeof window === "undefined" ||
            typeof window.matchMedia !== "function"
        ) {
            return false; // Default to light mode for SSR
        }
        try {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        } catch {
            // Fallback if matchMedia throws an error
            return false;
        }
    });

    // Refs to store media query and handler for cleanup
    const mediaQueryRef = useRef<MediaQueryList | null>(null);

    /**
     * Named event handler for media query changes
     */
    const handleThemeChange = useCallback((e: MediaQueryListEvent): void => {
        setIsDarkMode(e.matches);
    }, []);

    // Set up media query listener for theme changes
    useMount(
        () => {
            // Skip in SSR environments
            if (
                typeof window === "undefined" ||
                typeof window.matchMedia !== "function"
            ) {
                return;
            }

            try {
                const mediaQuery = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                );

                // Store reference for cleanup
                mediaQueryRef.current = mediaQuery;

                // eslint-disable-next-line listeners/no-missing-remove-event-listener
                mediaQuery.addEventListener("change", handleThemeChange);
            } catch {
                // Fallback if matchMedia throws an error
                // No setup needed
            }
        },
        () => {
            // Cleanup media query listener on unmount
            if (mediaQueryRef.current) {
                try {
                    mediaQueryRef.current.removeEventListener(
                        "change",
                        handleThemeChange
                    );
                } catch {
                    // Ignore cleanup errors
                }
                mediaQueryRef.current = null;
            }
        }
    );

    return useMemo<ThemeStyles>(
        () => ({
            collapseButtonStyle: getCollapseButtonStyle(isDarkMode),
            contentStyle: getContentStyle(isCollapsed),
            headerStyle: getHeaderStyle(isCollapsed, isDarkMode),
            metaStyle: getMetaStyle(isDarkMode),
            overlayStyle: getOverlayStyle(isDarkMode),
            titleStyle: getTitleStyle(isDarkMode),
            urlStyle: getUrlStyle(isDarkMode),
        }),
        [isCollapsed, isDarkMode]
    );
}
