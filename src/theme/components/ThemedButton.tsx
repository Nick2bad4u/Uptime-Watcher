/**
 * Themed button component with support for icons, loading states, sizes, and
 * visual variants.
 *
 * @remarks
 * This component provides a comprehensive button implementation with theming
 * support, various visual variants (primary, secondary, danger, etc.), multiple
 * sizes, loading states, and icon positioning. The button follows accessibility
 * best practices with proper ARIA support. It integrates seamlessly with the
 * application's theme system.
 *
 * @example Primary button with icon:
 *
 * ```tsx
 * <ThemedButton
 *     variant="primary"
 *     size="md"
 *     icon={<SaveIcon />}
 *     onClick={handleSave}
 * >
 *     Save Changes
 * </ThemedButton>;
 * ```
 *
 * @example Loading button with custom styling:
 *
 * ```tsx
 * <ThemedButton
 *     variant="secondary"
 *     loading={isSubmitting}
 *     disabled={!isValid}
 *     fullWidth={true}
 *     onClick={handleSubmit}
 * >
 *     {isSubmitting ? "Submitting..." : "Submit Form"}
 * </ThemedButton>;
 * ```
 *
 * @example Icon-only button with accessibility:
 *
 * ```tsx
 * <ThemedButton
 *     variant="ghost"
 *     size="sm"
 *     icon={<DeleteIcon />}
 *     aria-label="Delete item"
 *     onClick={handleDelete}
 * />;
 * ```
 *
 * @public
 */

import type { EventHandlers } from "@shared/types/componentProps";

import React, { useCallback } from "react";

import type { ButtonSize, ButtonVariant } from "./types";

import { renderColoredIcon } from "./iconUtils";
import { CSS_CLASSES } from "./types";

/**
 * Properties for the ThemedButton component.
 *
 * @public
 */
export interface ThemedButtonProperties {
    /**
     * Accessible label for screen readers (especially useful for icon-only
     * buttons)
     */
    readonly "aria-label"?: string;
    /** Button content (text, elements, or other components) */
    readonly children?: React.ReactNode;
    /** Additional CSS classes to apply to the button */
    readonly className?: string;
    /** Whether the button is disabled and non-interactive */
    readonly disabled?: boolean;
    /** Whether the button should expand to full width of its container */
    readonly fullWidth?: boolean;
    /** Icon element to display alongside or instead of text */
    readonly icon?: React.ReactNode;
    /** Color theme for the icon (uses theme color names) */
    readonly iconColor?: string;
    /** Position of the icon relative to the text content */
    readonly iconPosition?: "left" | "right";
    /** Whether the button is in a loading state (shows spinner) */
    readonly loading?: boolean;
    /** Click handler for the button */
    readonly onClick?: EventHandlers.ClickWithEvent<HTMLButtonElement>;
    /** Size variant for the button */
    readonly size?: ButtonSize;
    /** Inline styles to apply to the button */
    readonly style?: React.CSSProperties;
    /** Tooltip text that appears on hover */
    readonly title?: string;
    /** HTML button type attribute */
    readonly type?: "button" | "reset" | "submit";
    /** Visual variant for the button styling */
    readonly variant?: ButtonVariant;
}

// Default styles object to prevent infinite render loops
const DEFAULT_THEMED_BOX_STYLE = {};

/**
 * Themed button component with comprehensive styling and state management.
 *
 * @remarks
 * This component provides a full-featured button implementation with theming
 * support, loading states, disabled states, icon positioning, and various
 * visual variants. The button automatically handles accessibility features and
 * prevents clicks when disabled or loading.
 *
 * @example Action button with loading state:
 *
 * ```tsx
 * <ThemedButton
 *     variant="primary"
 *     loading={isProcessing}
 *     onClick={handleAction}
 *     disabled={!canSubmit}
 * >
 *     Process Data
 * </ThemedButton>;
 * ```
 *
 * @param props - The component properties
 *
 * @returns The themed button JSX element
 *
 * @public
 */
const ThemedButton = ({
    "aria-label": ariaLabel,
    children,
    className = "",
    disabled = false,
    fullWidth = false,
    icon,
    iconColor,
    iconPosition = "left",
    loading = false,
    onClick,
    size = "md",
    style = DEFAULT_THEMED_BOX_STYLE,
    title,
    type = "button",
    variant = "primary",
}: ThemedButtonProperties): React.JSX.Element => {
    const classNames = [
        CSS_CLASSES.THEMED_BUTTON,
        `themed-button--${variant}`,
        `themed-button--size-${size}`,
        fullWidth && "themed-button--full-width",
        (disabled || loading) && "themed-button--loading",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    // useCallback handler for jsx-no-bind compliance
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
        },
        [onClick]
    );

    // eslint-disable-next-line sonarjs/function-return-type -- React rendering function legitimately returns different node types (JSX elements, loading spinner, text content)
    const renderContent = (): React.ReactNode => {
        if (loading) {
            return (
                <div className="themed-button__loading">
                    <div className="themed-button__spinner" />
                    <span>{children}</span>
                </div>
            );
        }
        if (icon) {
            // eslint-disable-next-line no-useless-assignment -- Variable initialized to satisfy init-declarations rule, even though immediately reassigned
            let iconElement: React.ReactNode = null;
            if (React.isValidElement(icon) && iconColor) {
                iconElement = renderColoredIcon(icon, iconColor);
            } else if (iconColor) {
                iconElement = renderColoredIcon(icon, iconColor);
            } else {
                iconElement = icon;
            }
            if (!children) {
                return iconElement;
            }
            return iconPosition === "left" ? (
                <>
                    {iconElement}
                    <span>{children}</span>
                </>
            ) : (
                <>
                    <span>{children}</span>
                    {iconElement}
                </>
            );
        }
        return children;
    };

    return (
        <button
            aria-label={ariaLabel}
            className={classNames}
            disabled={disabled || loading}
            onClick={handleClick}
            style={style}
            title={title}
            // eslint-disable-next-line react/button-has-type -- Type prop is properly typed with ButtonType union and has 'button' as default; ESLint cannot detect TypeScript type safety
            type={type}
        >
            {renderContent()}
        </button>
    );
};

export default ThemedButton;
