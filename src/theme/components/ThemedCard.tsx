/**
 * Themed card component for content containers with optional headers, icons,
 * and interactive features.
 *
 * @remarks
 * This component provides a styled container with configurable theming,
 * optional header section, and interactive features like click and hover
 * states. The card integrates with the theme system for consistent styling
 * across the application. It supports various visual variants, padding,
 * shadow, and border radius configurations.
 *
 * @example
 * Basic card with title and content:
 * ```tsx
 * <ThemedCard
 *   title="Site Status"
 *   subtitle="Current monitoring status"
 *   variant="primary"
 *   shadow="md"
 * >
 *   <p>Your site is online and responding normally.</p>
 * </ThemedCard>
 * ```
 *
 * @example
 * Interactive card with icon and click handler:
 * ```tsx
 * <ThemedCard
 *   title="Add New Site"
 *   icon={<PlusIcon />}
 *   iconColor="primary"
 *   clickable={true}
 *   onClick={handleAddSite}
 *   hoverable={true}
 * >
 *   <p>Click to add a new monitoring site</p>
 * </ThemedCard>
 * ```
 *
 * @example
 * Card with custom styling:
 * ```tsx
 * <ThemedCard
 *   padding="lg"
 *   rounded="xl"
 *   shadow="lg"
 *   variant="secondary"
 *   className="border-2 border-blue-500"
 * >
 *   <CustomContent />
 * </ThemedCard>
 * ```
 *
 * @public
 */

import React from "react";

import type { BoxPadding, BoxRounded, BoxShadow, BoxVariant } from "./types";

import { TRANSITION_ALL } from "../../constants";
import { useTheme } from "../useTheme";
import { renderColoredIcon } from "./iconUtils";
import ThemedBox from "./ThemedBox";
import ThemedText from "./ThemedText";

/**
 * Properties for the ThemedCard component.
 *
 * @public
 */
export interface ThemedCardProperties {
    /** Content to be rendered inside the card */
    readonly children: React.ReactNode;
    /** Additional CSS classes to apply to the card */
    readonly className?: string;
    /** Whether the card should have clickable styling and cursor pointer */
    readonly clickable?: boolean;
    /** Whether the card should have hover effects */
    readonly hoverable?: boolean;
    /** Icon element to display in the card header */
    readonly icon?: React.ReactNode;
    /** Color theme for the icon (uses theme color names) */
    readonly iconColor?: string;
    /** Click handler for the card */
    readonly onClick?: () => void;
    /** Mouse enter handler for hover effects */
    readonly onMouseEnter?: () => void;
    /** Mouse leave handler for hover effects */
    readonly onMouseLeave?: () => void;
    /** Padding size for the card content */
    readonly padding?: BoxPadding;
    /** Border radius size for the card */
    readonly rounded?: BoxRounded;
    /** Shadow size for the card */
    readonly shadow?: BoxShadow;
    /** Subtitle text displayed in the card header */
    readonly subtitle?: string;
    /** Title text displayed in the card header */
    readonly title?: string;
    /** Visual variant for the card styling */
    readonly variant?: BoxVariant;
}

/**
 * Themed card component for content containers with optional headers, icons,
 * and interactive features.
 *
 * @remarks
 * This component provides a styled container with configurable theming,
 * optional header section, and interactive features. The card integrates with
 * the theme system for consistent styling. When title or subtitle is provided,
 * renders a header section with optional icon.
 *
 * @param props - The component properties
 * @returns The themed card JSX element
 *
 * @example
 * Status card with interactive features:
 * ```tsx
 * <ThemedCard
 *   title="Monitor Status"
 *   icon={<StatusIcon />}
 *   clickable={true}
 *   onClick={viewDetails}
 * >
 *   <StatusContent />
 * </ThemedCard>
 * ```
 *
 * @public
 */
const ThemedCard = ({
    children,
    className = "",
    clickable = false,
    hoverable = false,
    icon,
    iconColor,
    onClick,
    onMouseEnter,
    onMouseLeave,
    padding = "lg",
    rounded = "lg",
    shadow = "md",
    subtitle,
    title,
    variant = "primary",
}: ThemedCardProperties): React.JSX.Element => {
    const { currentTheme } = useTheme();

    const cardStyles: React.CSSProperties = {
        cursor: clickable ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
        transition: TRANSITION_ALL,
    };

    return (
        <ThemedBox
            className={`themed-card ${hoverable ? "themed-card--hoverable" : ""} ${clickable ? "themed-card--clickable" : ""} ${className}`}
            padding={padding}
            rounded={rounded}
            shadow={shadow}
            style={cardStyles}
            surface="elevated"
            variant={variant}
            {...(clickable && onClick && { onClick })}
            {...(onMouseEnter && { onMouseEnter })}
            {...(onMouseLeave && { onMouseLeave })}
        >
            {(title ?? subtitle ?? icon) ? (
                <div
                    className="themed-card__header"
                    style={{
                        alignItems: "center",
                        display: "flex",
                        gap: currentTheme.spacing.md,
                        marginBottom: currentTheme.spacing.md,
                    }}
                >
                    {icon ? (
                        <span
                            style={{
                                alignItems: "center",
                                display: "flex",
                                fontSize: "1.5em",
                                lineHeight: "1",
                            }}
                        >
                            {renderColoredIcon(icon, iconColor ?? "primary")}
                        </span>
                    ) : null}
                    <div style={{ flex: 1 }}>
                        {title ? (
                            <ThemedText
                                size="lg"
                                variant="primary"
                                weight="semibold"
                            >
                                {title}
                            </ThemedText>
                        ) : null}
                        {subtitle ? (
                            <ThemedText size="sm" variant="secondary">
                                {subtitle}
                            </ThemedText>
                        ) : null}
                    </div>
                </div>
            ) : null}
            <div className="themed-card__content">{children}</div>
        </ThemedBox>
    );
};

export default ThemedCard;
