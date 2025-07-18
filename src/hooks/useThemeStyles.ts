/**
 * Custom hook for theme-aware CSS-in-JS styles
 * Provides consistent styling that respects user's theme preference
 */

import { useMemo } from "react";

interface ThemeStyles {
    collapseButtonStyle: React.CSSProperties;
    contentStyle: React.CSSProperties;
    headerStyle: React.CSSProperties;
    metaStyle: React.CSSProperties;
    overlayStyle: React.CSSProperties;
    titleStyle: React.CSSProperties;
    urlStyle: React.CSSProperties;
}

export function useThemeStyles(isCollapsed = false): ThemeStyles {
    const styles = useMemo<ThemeStyles>(() => {
        const isDarkMode =
            typeof window !== "undefined" && typeof window.matchMedia === "function"
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                : false;
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
    }, [isCollapsed]);

    return styles;
}
