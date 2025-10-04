// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- theme styles require CSS variable and color manipulation overrides
/* eslint-disable @metamask/design-tokens/color-no-hex -- theme system requires direct hex color manipulation */
/**
 * Custom hook for theme-aware CSS-in-JS styles.
 *
 * @remarks
 * Provides consistent styling that respects user's theme preference with proper
 * SSR support and runtime theme change reactivity. Uses media query listeners
 * to detect theme changes and updates styles accordingly.
 *
 * The hook handles:
 *
 * - Server-side rendering compatibility
 * - Runtime theme preference changes
 * - Graceful fallback when window APIs are unavailable
 * - Smooth transitions between themes
 *
 * @example
 *
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
 *
 * @param isCollapsed - Boolean - Whether the component is in collapsed state
 *   (default: false)
 *
 * @returns ThemeStyles object containing all CSS-in-JS style properties
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
 *
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
 *
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
 *
 * @returns CSS properties for header section
 */
function getHeaderStyle(
    isCollapsed: boolean,
    isDarkMode: boolean
): CSSProperties {
    // Layered gradients create a neutral base with restrained accent glow to avoid overpowering blues.
    const darkGradient = [
        "radial-gradient(circle at 18% 18%, rgba(79, 70, 229, 0.24), transparent 55%)",
        "linear-gradient(110deg, rgba(37, 99, 235, 0.22) 0%, rgba(59, 130, 246, 0.12) 42%, rgba(99, 102, 241, 0.08) 70%, rgba(14, 22, 35, 0) 100%)",
        "linear-gradient(136deg, rgba(6, 9, 16, 0.98) 0%, rgba(9, 14, 22, 0.95) 52%, rgba(14, 22, 35, 0.92) 100%)",
    ].join(", ");
    const lightGradient = [
        "radial-gradient(circle at 16% 18%, rgba(79, 70, 229, 0.12), transparent 60%)",
        "linear-gradient(110deg, rgba(59, 130, 246, 0.12) 0%, rgba(96, 165, 250, 0.06) 55%, rgba(79, 70, 229, 0) 100%)",
        "linear-gradient(135deg, rgba(245, 247, 252, 0.98) 0%, rgba(233, 239, 255, 0.94) 52%, rgba(221, 231, 255, 0.9) 100%)",
    ].join(", ");

    const darkShadow =
        "0 24px 60px -22px rgba(4, 8, 18, 0.7), 0 2px 18px -12px rgba(30, 64, 175, 0.32), inset 0 0 0 1px rgba(148, 163, 184, 0.07)";
    const lightShadow =
        "0 22px 48px -24px rgba(15, 23, 42, 0.2), 0 4px 14px -10px rgba(59, 130, 246, 0.18), inset 0 0 0 1px rgba(30, 64, 175, 0.08)";

    return {
        background: isDarkMode ? darkGradient : lightGradient,
        backgroundColor: isDarkMode ? "#060910" : "#f8fafc",
        border: "1px solid color-mix(in srgb, var(--color-border-secondary, #1b2535) 48%, transparent)",
        borderRadius: "0.75rem",
        boxShadow: isDarkMode ? darkShadow : lightShadow,
        color: isDarkMode ? "#f5f7fa" : "#0f172a",
        height: isCollapsed ? "80px" : "auto",
        marginBottom: isCollapsed ? "0.65rem" : "1.25rem",
        minHeight: isCollapsed ? "80px" : "fit-content",
        overflow: "hidden",
        padding: isCollapsed ? "1rem 1.5rem" : "1.75rem",
        position: "relative",
        transition: `all ${TRANSITION_EASING}`,
    };
}

/**
 * Generates metadata text styles based on theme
 *
 * @param isDarkMode - Whether dark mode is active
 *
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
 *
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
 *
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
 *
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

/**
 * React hook for theme-aware CSS-in-JS styles with collapse state support.
 *
 * @remarks
 * Provides comprehensive styling that automatically adapts to user's theme
 * preference with proper SSR support and runtime theme change reactivity. The
 * hook listens to media query changes and updates styles accordingly.
 *
 * @param isCollapsed - Whether the component is in collapsed state (default:
 *   false)
 *
 * @returns Complete ThemeStyles object with all CSS-in-JS style properties
 *
 * @public
 */
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
        useCallback(() => {
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

                // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Media query listener is cleaned up in unmount callback
                mediaQuery.addEventListener("change", handleThemeChange);
            } catch {
                // Fallback if matchMedia throws an error
                // No setup needed
            }
        }, [handleThemeChange]),
        useCallback(() => {
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
        }, [handleThemeChange])
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
