/**
 * Custom hook for theme-aware CSS-in-JS styles
 * Provides consistent styling that respects user's theme preference
 *
 * @param isCollapsed - boolean - Whether the component is in collapsed state (default: false)
 * @returns ThemeStyles object containing all CSS-in-JS style properties
 *
 * @remarks
 * This hook provides theme-aware styling with proper SSR support and runtime
 * theme change reactivity. It uses media query listeners to detect theme changes
 * and updates styles accordingly.
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

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Theme styles interface for CSS-in-JS styling
 *
 * @public
 */
export interface ThemeStyles {
    /** Button styles for collapse/expand controls */
    collapseButtonStyle: React.CSSProperties;
    /** Main content area styling */
    contentStyle: React.CSSProperties;
    /** Header section styling */
    headerStyle: React.CSSProperties;
    /** Metadata text styling */
    metaStyle: React.CSSProperties;
    /** Overlay/modal backdrop styling */
    overlayStyle: React.CSSProperties;
    /** Primary title text styling */
    titleStyle: React.CSSProperties;
    /** URL/link text styling */
    urlStyle: React.CSSProperties;
}

export function useThemeStyles(isCollapsed = false): ThemeStyles {
    // Use state to track theme changes for reactivity
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // SSR-safe initialization
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return false; // Default to light mode for SSR
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    // Use ref to store cleanup function to avoid linting issues
    const cleanupRef = useRef<(() => void) | null>(null);

    // Set up media query listener for theme changes
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return; // Skip in SSR environments
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleThemeChange = (e: MediaQueryListEvent) => {
            setIsDarkMode(e.matches);
        };

        // Use modern addEventListener API
        mediaQuery.addEventListener("change", handleThemeChange);

        // Store cleanup function in ref
        cleanupRef.current = () => {
            mediaQuery.removeEventListener("change", handleThemeChange);
        };
    }, []);

    // Cleanup effect for component unmount
    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    const styles = useMemo<ThemeStyles>(() => {
        const transitionEasing = "0.3s cubic-bezier(0.4, 0, 0.2, 1)";

        return {
            collapseButtonStyle: {
                alignItems: "center",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "0.375rem",
                color: isDarkMode ? "#9ca3af" : "#6b7280",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                padding: "0.5rem",
                transition: `all ${transitionEasing}`,
            },
            contentStyle: {
                padding: isCollapsed ? "1rem 1.5rem" : "1.5rem",
                position: "relative",
                transition: `padding ${transitionEasing}`,
                zIndex: 2,
            },
            headerStyle: {
                background: isDarkMode
                    ? "linear-gradient(120deg, rgba(37, 99, 235, 0.15) 0%, rgba(147, 51, 234, 0.15) 60%, rgba(31, 41, 55, 0.8) 100%)"
                    : "linear-gradient(120deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 60%, rgba(249, 250, 251, 0.9) 100%)",
                borderRadius: "0.75rem",
                boxShadow: isDarkMode
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                color: isDarkMode ? "#f3f4f6" : "#111827",
                height: isCollapsed ? "80px" : "auto",
                marginBottom: "1.25rem",
                minHeight: isCollapsed ? "80px" : "140px",
                overflow: "hidden",
                padding: "1.5rem",
                position: "relative",
                transition: `all ${transitionEasing}`,
            },
            metaStyle: {
                alignItems: "center",
                color: isDarkMode ? "#9ca3af" : "#6b7280",
                display: "flex",
                fontSize: "1rem",
                fontWeight: 600,
                gap: "0.75rem",
                marginTop: "0.25rem",
                opacity: 0.9,
            },
            overlayStyle: {
                background: isDarkMode
                    ? "linear-gradient(120deg, rgba(37, 99, 235, 0.05) 0%, rgba(147, 51, 234, 0.05) 60%, rgba(31, 41, 55, 0.1) 100%)"
                    : "linear-gradient(120deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 60%, rgba(249, 250, 251, 0.1) 100%)",
                borderRadius: "0.75rem",
                bottom: 0,
                left: 0,
                opacity: 0.85,
                pointerEvents: "none",
                position: "absolute",
                right: 0,
                top: 0,
                transition: `background ${transitionEasing}, opacity ${transitionEasing}`,
                zIndex: 1,
            },
            titleStyle: {
                color: isDarkMode ? "#f3f4f6" : "#111827",
                cursor: "default",
                fontSize: "1.875rem",
                fontWeight: 700,
                letterSpacing: "0.01em",
                lineHeight: 1.25,
                margin: 0,
                textShadow: isDarkMode
                    ? "0 2px 12px rgba(59, 130, 246, 0.3), 0 1px 0 rgba(37, 99, 235, 0.3)"
                    : "0 2px 12px rgba(59, 130, 246, 0.1), 0 1px 0 rgba(37, 99, 235, 0.1)",
                transition: `all ${transitionEasing}`,
            },
            urlStyle: {
                background: "none",
                color: isDarkMode ? "#9ca3af" : "#6b7280",
                fontSize: "1.125rem",
                fontWeight: 600,
                margin: 0,
                maxWidth: "100%",
                opacity: 1,
                padding: 0,
                textDecoration: "none",
                transition: `color ${transitionEasing}, opacity ${transitionEasing}`,
                wordBreak: "break-all",
            },
        };
    }, [isCollapsed, isDarkMode]);

    return styles;
}
