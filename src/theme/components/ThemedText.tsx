/**
 * Themed text component with comprehensive typography styling options and theme
 * integration.
 *
 * @remarks
 * This component provides a flexible text element with full control over
 * typography including size, weight, alignment, and color variants. It
 * integrates with the application's theme system to ensure consistent text
 * styling across the application. The component supports various semantic
 * styling variants for different contexts (primary, secondary, error, etc.).
 *
 * @example Heading text with custom styling:
 *
 * ```tsx
 * <ThemedText size="xl" weight="bold" variant="primary" align="center">
 *     Site Status Dashboard
 * </ThemedText>;
 * ```
 *
 * @example Error message text:
 *
 * ```tsx
 * <ThemedText variant="error" size="sm" weight="medium">
 *     Unable to connect to server
 * </ThemedText>;
 * ```
 *
 * @example Subtitle with secondary styling:
 *
 * ```tsx
 * <ThemedText variant="secondary" size="base" className="mt-2">
 *     Last updated: {lastUpdatedTime}
 * </ThemedText>;
 * ```
 *
 * @public
 */

import type { CoreComponentProperties } from "@shared/types/componentProps";

import React from "react";

import type { TextAlign, TextSize, TextVariant, TextWeight } from "./types";

/**
 * Properties for the ThemedText component.
 *
 * @public
 */
export interface ThemedTextProperties extends CoreComponentProperties {
    /** Text alignment within the container */
    readonly align?: TextAlign;
    /** Font size variant for the text */
    readonly size?: TextSize;
    /** Inline styles to apply to the text element */
    readonly style?: React.CSSProperties;
    /** Color and semantic variant for the text */
    readonly variant?: TextVariant;
    /** Font weight for the text */
    readonly weight?: TextWeight;
}

// Default styles object to prevent infinite render loops
const DEFAULT_THEMED_BOX_STYLE: React.CSSProperties = {};

/**
 * Themed text component with comprehensive typography styling options.
 *
 * @remarks
 * This component provides a flexible text element with CSS class-based styling
 * that integrates with the theme system. It automatically generates appropriate
 * class names based on the provided variant, size, weight, and alignment
 * options.
 *
 * @example Status text with dynamic variant:
 *
 * ```tsx
 * <ThemedText variant={isOnline ? "success" : "error"} weight="medium">
 *     {isOnline ? "Online" : "Offline"}
 * </ThemedText>;
 * ```
 *
 * @param props - The component properties
 *
 * @returns The themed text JSX element
 *
 * @public
 */
const ThemedText = ({
    align = "left",
    children,
    className = "",
    size = "base",
    style = DEFAULT_THEMED_BOX_STYLE,
    variant = "primary",
    weight = "normal",
}: ThemedTextProperties): React.JSX.Element => {
    const classNames = [
        "themed-text",
        `themed-text--${variant}`,
        `themed-text--size-${size}`,
        `themed-text--weight-${weight}`,
        `themed-text--align-${align}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={classNames} style={style}>
            {children}
        </span>
    );
};

export default ThemedText;
