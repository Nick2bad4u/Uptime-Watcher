/**
 * Themed badge component for status indicators, labels, and small
 * informational elements.
 *
 * @remarks
 * This component provides a compact way to display status information, counts,
 * or labels with consistent theming. It supports multiple visual variants for
 * different contexts (success, warning, error, etc.), various sizes, and
 * optional icons. The badge integrates with the theme system for consistent
 * styling across the application.
 *
 * @example
 * Status badge with icon:
 * ```tsx
 * <ThemedBadge
 *   variant="success"
 *   size="md"
 *   icon={<CheckIcon />}
 * >
 *   Online
 * </ThemedBadge>
 * ```
 *
 * @example
 * Count badge without icon:
 * ```tsx
 * <ThemedBadge variant="primary" size="sm">
 *   {notificationCount}
 * </ThemedBadge>
 * ```
 *
 * @example
 * Warning badge with custom styling:
 * ```tsx
 * <ThemedBadge
 *   variant="warning"
 *   icon={<AlertIcon />}
 *   className="ml-2"
 * >
 *   Needs Attention
 * </ThemedBadge>
 * ```
 *
 * @public
 */

import type React from "react";

import type { BadgeSize, BadgeVariant } from "./types";

import { useTheme } from "../useTheme";

/**
 * Properties for the ThemedBadge component.
 *
 * @public
 */
export interface ThemedBadgeProperties {
    /** Content to be displayed inside the badge (text, numbers, or elements) */
    readonly children: React.ReactNode;
    /** Additional CSS classes to apply to the badge */
    readonly className?: string;
    /** Icon element to display alongside the badge content */
    readonly icon?: React.ReactNode;
    /** Color theme for the icon (uses theme color names) */
    readonly iconColor?: string;
    /** Size variant for the badge */
    readonly size?: BadgeSize;
    /**
     * Visual variant for the badge styling (primary, success, warning, error,
     * etc.)
     */
    readonly variant?: BadgeVariant;
}

/**
 * Themed badge component for status indicators, labels, and informational
 * elements.
 *
 * @remarks
 * This component provides a compact way to display status information with
 * consistent theming. The badge automatically calculates appropriate colors,
 * spacing, and typography based on the selected variant and size. Icons are
 * automatically colored to match the theme.
 *
 * @param props - The component properties
 * @returns The themed badge JSX element
 *
 * @example
 * Monitor status badge:
 * ```tsx
 * <ThemedBadge
 *   variant={site.isOnline ? "success" : "error"}
 *   icon={<StatusIcon />}
 * >
 *   {site.isOnline ? "Online" : "Offline"}
 * </ThemedBadge>
 * ```
 *
 * @public
 */
const ThemedBadge = ({
    children,
    className = "",
    icon,
    iconColor,
    size = "md",
    variant = "primary",
}: ThemedBadgeProperties): React.JSX.Element => {
    const { currentTheme } = useTheme();

    const badgeStyle: React.CSSProperties = {
        alignItems: "center",
        border: "1px solid",
        borderRadius: currentTheme.borderRadius.full,
        cursor: "default",
        display: "inline-flex",
        fontFamily: currentTheme.typography.fontFamily.sans.join(", "),
        fontWeight: currentTheme.typography.fontWeight.medium,
        gap: currentTheme.spacing.xs,
        justifyContent: "center",
        lineHeight: currentTheme.typography.lineHeight.tight,
        transition: "all 150ms ease-in-out",
        userSelect: "none",
        whiteSpace: "nowrap",
    };

    // Size-specific styles
    const sizeStyles = {
        lg: {
            fontSize: currentTheme.typography.fontSize.base,
            padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.lg}`,
        },
        md: {
            fontSize: currentTheme.typography.fontSize.sm,
            padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
        },
        sm: {
            fontSize: currentTheme.typography.fontSize.sm,
            padding: `${currentTheme.spacing.xs} ${currentTheme.spacing.sm}`,
        },
        xs: {
            fontSize: currentTheme.typography.fontSize.xs,
            padding: `${currentTheme.spacing.xs} ${currentTheme.spacing.sm}`,
        },
    };

    // Variant-specific styles
    const variantStyles = {
        error: {
            backgroundColor: `${currentTheme.colors.error}20`,
            borderColor: `${currentTheme.colors.error}40`,
            color: currentTheme.colors.error,
        },
        info: {
            backgroundColor: `${currentTheme.colors.primary[500]}20`,
            borderColor: `${currentTheme.colors.primary[500]}40`,
            color: currentTheme.colors.primary[600],
        },
        primary: {
            backgroundColor: currentTheme.colors.primary[100],
            borderColor: currentTheme.colors.primary[200],
            color: currentTheme.colors.primary[700],
        },
        secondary: {
            backgroundColor: currentTheme.colors.background.secondary,
            borderColor: currentTheme.colors.border.secondary,
            color: currentTheme.colors.text.secondary,
        },
        success: {
            backgroundColor: `${currentTheme.colors.success}20`,
            borderColor: `${currentTheme.colors.success}40`,
            color: currentTheme.colors.success,
        },
        warning: {
            backgroundColor: `${currentTheme.colors.warning}20`,
            borderColor: `${currentTheme.colors.warning}40`,
            color: currentTheme.colors.warning,
        },
    };

    const combinedStyle = {
        ...badgeStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
    };

    return (
        <span
            className={`themed-badge themed-badge--${variant} themed-badge--${size} ${className}`}
            style={combinedStyle}
        >
            {icon ? (
                <span
                    style={{
                        color: iconColor ?? combinedStyle.color,
                        fontSize: "inherit",
                    }}
                >
                    {icon}
                </span>
            ) : null}
            {children}
        </span>
    );
};

export default ThemedBadge;
