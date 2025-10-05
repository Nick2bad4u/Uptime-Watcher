/**
 * Themed select dropdown component with consistent styling, accessibility
 * support, and theme integration.
 *
 * @remarks
 * This component provides a styled select dropdown that integrates with the
 * application's theme system. It supports accessibility attributes, various
 * event handlers, and automatic styling based on the current theme. The select
 * component handles focus states, disabled states, and provides consistent
 * visual appearance across the application.
 *
 * @example Basic select dropdown:
 *
 * ```tsx
 * <ThemedSelect
 *     id="method"
 *     value={selectedMethod}
 *     onChange={handleMethodChange}
 *     aria-label="HTTP Method"
 * >
 *     <option value="GET">GET</option>
 *     <option value="POST">POST</option>
 *     <option value="PUT">PUT</option>
 * </ThemedSelect>;
 * ```
 *
 * @example Select with validation and accessibility:
 *
 * ```tsx
 * <ThemedSelect
 *     id="protocol"
 *     value={protocol}
 *     onChange={handleProtocolChange}
 *     required
 *     aria-describedby="protocol-error"
 *     disabled={isLoading}
 * >
 *     <option value="">Select protocol...</option>
 *     <option value="http">HTTP</option>
 *     <option value="https">HTTPS</option>
 * </ThemedSelect>;
 * ```
 *
 * @public
 */

import type {
    AccessibilityProperties,
    CoreComponentProperties,
    EventHandlers,
} from "@shared/types/componentProps";

import {
    type CSSProperties,
    type JSX,
    memo,
    type NamedExoticComponent,
    useMemo,
} from "react";

import { ARIA_LABEL, TRANSITION_ALL } from "../../constants";
import { useTheme, useThemeClasses } from "../useTheme";

/**
 * Properties for the ThemedSelect component.
 *
 * @public
 */
export interface ThemedSelectProperties
    extends AccessibilityProperties,
        CoreComponentProperties {
    /** Whether the select should expand to fill its container width */
    readonly fluid?: boolean;
    /** Unique identifier for the select element */
    readonly id?: string;
    /** Change handler for selection updates */
    readonly onChange?: EventHandlers.ChangeWithEvent<HTMLSelectElement>;
    /** Click handler for the select element */
    readonly onClick?: EventHandlers.ClickWithEvent<HTMLSelectElement>;
    /** Mouse down handler for the select element */
    readonly onMouseDown?: EventHandlers.ClickWithEvent<HTMLSelectElement>;
    /** Whether the select is required for form validation */
    readonly required?: boolean;
    /** Tooltip text that appears on hover */
    readonly title?: string;
    /** Visual tone applied to the control surface */
    readonly tone?: "default" | "transparent";
    /** Current selected value */
    readonly value?: number | string;
}

/**
 * Themed select dropdown component with consistent styling and accessibility
 * support.
 *
 * @remarks
 * This component provides a styled select dropdown with automatic theme
 * integration, focus states, and accessibility features. The select supports
 * various event handlers and automatically applies appropriate styling based on
 * the current theme and state.
 *
 * @example Timeout selection dropdown:
 *
 * ```tsx
 * <ThemedSelect
 *     value={timeout}
 *     onChange={handleTimeoutChange}
 *     title="Request timeout in seconds"
 * >
 *     <option value={5}>5 seconds</option>
 *     <option value={10}>10 seconds</option>
 *     <option value={30}>30 seconds</option>
 * </ThemedSelect>;
 * ```
 *
 * @param props - The component properties
 *
 * @returns The themed select JSX element
 *
 * @public
 */
const ThemedSelectComponent = ({
    "aria-describedby": ariaDescribedBy,
    [ARIA_LABEL]: ariaLabel,
    children,
    className = "",
    disabled = false,
    fluid = true,
    id,
    onChange,
    onClick,
    onMouseDown,
    required = false,
    title,
    tone = "default",
    value,
}: ThemedSelectProperties): JSX.Element => {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getBorderClass, getTextClass } =
        useThemeClasses();

    // Ensure value is always defined to prevent controlled/uncontrolled
    // warnings
    const selectValue = value ?? "";

    const styles = useMemo(
        (): CSSProperties => ({
            ...getBackgroundClass("primary"),
            ...getTextClass("primary"),
            ...getBorderClass("primary"),
            borderRadius: currentTheme.borderRadius.md,
            borderStyle: "solid",
            borderWidth: tone === "transparent" ? "0" : "1px",
            fontSize: currentTheme.typography.fontSize.sm,
            padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
            transition: TRANSITION_ALL,
            ...(fluid ? { width: "100%" } : {}),
            cursor: disabled ? "not-allowed" : "pointer",
            ...(tone === "transparent"
                ? {
                      backgroundColor: "transparent",
                      borderColor: "transparent",
                      padding: "0",
                  }
                : {}),
        }),
        [
            currentTheme.borderRadius.md,
            currentTheme.spacing.md,
            currentTheme.spacing.sm,
            currentTheme.typography.fontSize.sm,
            fluid,
            getBackgroundClass,
            getBorderClass,
            getTextClass,
            disabled,
            tone,
        ]
    );
    return (
        <select
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            className={`themed-select ${className}`}
            disabled={disabled}
            id={id}
            onChange={onChange}
            onClick={onClick}
            onMouseDown={onMouseDown}
            required={required}
            style={styles}
            title={title}
            {...(value === undefined ? {} : { value: selectValue })}
        >
            {children}
        </select>
    );
};

export const ThemedSelect: NamedExoticComponent<ThemedSelectProperties> = memo(
    ThemedSelectComponent
);
