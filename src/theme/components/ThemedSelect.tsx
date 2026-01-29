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
    DataAttributeProperties,
    EventHandlers,
} from "@shared/types/componentProps";
import type {
    ForwardedRef,
    JSX,
    NamedExoticComponent,
    RefAttributes,
} from "react";

import { forwardRef, memo, useMemo } from "react";

import { ARIA_LABEL } from "../../constants";
import { useTheme, useThemeClasses } from "../useTheme";
import {
    type ThemedControlTone,
    useThemedControlStyles,
} from "./useThemedControlStyles";

/**
 * Properties for the ThemedSelect component.
 *
 * @public
 */
export interface ThemedSelectProperties
    extends
        AccessibilityProperties,
        CoreComponentProperties,
        DataAttributeProperties {
    /** Whether the select should expand to fill its container width */
    readonly fluid?: boolean;
    /** Unique identifier for the select element */
    readonly id?: string;
    /** Name attribute for form submissions */
    readonly name?: string;
    /** Blur handler for the select element */
    readonly onBlur?: EventHandlers.Focus<HTMLSelectElement>;
    /** Change handler for selection updates */
    readonly onChange?: EventHandlers.ChangeWithEvent<HTMLSelectElement>;
    /** Click handler for the select element */
    readonly onClick?: EventHandlers.ClickWithEvent<HTMLSelectElement>;
    /** Focus handler for the select element */
    readonly onFocus?: EventHandlers.Focus<HTMLSelectElement>;
    /** Mouse down handler for the select element */
    readonly onMouseDown?: EventHandlers.ClickWithEvent<HTMLSelectElement>;
    /** Whether the select is required for form validation */
    readonly required?: boolean;
    /** Tooltip text that appears on hover */
    readonly title?: string;
    /** Visual tone applied to the control surface */
    readonly tone?: ThemedControlTone;
    /** Current selected value */
    readonly value?: number | string;
}

const ForwardedSelect = forwardRef<HTMLSelectElement, ThemedSelectProperties>(
    function ForwardedSelect(
        {
            "aria-describedby": ariaDescribedBy,
            [ARIA_LABEL]: ariaLabel,
            children,
            className = "",
            disabled = false,
            fluid = true,
            id,
            name,
            onBlur,
            onChange,
            onClick,
            onFocus,
            onMouseDown,
            required = false,
            title,
            tone = "default",
            value,
            ...restProps
        }: ThemedSelectProperties,
        ref: ForwardedRef<HTMLSelectElement>
    ): JSX.Element {
        const { currentTheme } = useTheme();
        const { getBackgroundClass, getBorderClass, getTextClass } =
            useThemeClasses();

        const selectValue = value ?? "";

        const controlStyleArgs = useMemo(
            () => ({
                currentTheme,
                cursor: "pointer" as const,
                disabled,
                fluid,
                getBackgroundClass,
                getBorderClass,
                getTextClass,
                tone,
            }),
            [
                currentTheme,
                disabled,
                fluid,
                getBackgroundClass,
                getBorderClass,
                getTextClass,
                tone,
            ]
        );

        const styles = useThemedControlStyles(controlStyleArgs);

        return (
            <select
                aria-describedby={ariaDescribedBy}
                aria-label={ariaLabel}
                className={`themed-select ${className}`}
                disabled={disabled}
                id={id}
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                onClick={onClick}
                onFocus={onFocus}
                onMouseDown={onMouseDown}
                ref={ref}
                required={required}
                style={styles}
                title={title}
                {...restProps}
                {...(value === undefined ? {} : { value: selectValue })}
            >
                {children}
            </select>
        );
    }
);

/**
 * Memoized themed select component.
 *
 * @remarks
 * React's `memo()` preserves the `forwardRef` signature in modern React types.
 * Exporting this value directly avoids unnecessary type assertions.
 */
export const ThemedSelect: NamedExoticComponent<
    RefAttributes<HTMLSelectElement> & ThemedSelectProperties
> = memo(ForwardedSelect);
