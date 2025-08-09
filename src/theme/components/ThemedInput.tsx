/**
 * Themed input component with consistent styling, accessibility support, and validation features.
 *
 * @remarks
 * This component provides a styled input field that integrates with the application's theme system.
 * It supports various input types (text, email, number, password, url), accessibility attributes,
 * and validation constraints. The input automatically applies appropriate colors, focus states,
 * and disabled states based on the current theme.
 *
 * @example
 * Basic text input:
 * ```tsx
 * <ThemedInput
 *   id="username"
 *   type="text"
 *   placeholder="Enter username"
 *   value={username}
 *   onChange={handleUsernameChange}
 *   required={true}
 * />
 * ```
 *
 * @example
 * Number input with constraints:
 * ```tsx
 * <ThemedInput
 *   id="port"
 *   type="number"
 *   min={1}
 *   max={65535}
 *   step={1}
 *   value={port}
 *   onChange={handlePortChange}
 *   aria-label="Port number"
 * />
 * ```
 *
 * @example
 * Email input with validation:
 * ```tsx
 * <ThemedInput
 *   id="email"
 *   type="email"
 *   placeholder="user@example.com"
 *   value={email}
 *   onChange={handleEmailChange}
 *   aria-describedby="email-error"
 *   required={true}
 * />
 * ```
 *
 * @public
 */

import React from "react";

import { ARIA_LABEL, TRANSITION_ALL } from "../../constants";
import { useTheme, useThemeClasses } from "../useTheme";

/**
 * Properties for the ThemedInput component.
 *
 * @public
 */
export interface ThemedInputProperties {
    /** ID of element that describes this input (for error messages, help text) */
    readonly "aria-describedby"?: string;
    /** Accessible label for screen readers */
    readonly "aria-label"?: string;
    /** Additional CSS classes to apply to the input */
    readonly className?: string;
    /** Whether the input is disabled and non-interactive */
    readonly disabled?: boolean;
    /** Unique identifier for the input element */
    readonly id?: string;
    /** Maximum value (for number inputs) or maximum length (for text inputs) */
    readonly max?: number | string;
    /** Minimum value (for number inputs) or minimum length (for text inputs) */
    readonly min?: number | string;
    /** Change handler for input value updates */
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Placeholder text displayed when input is empty */
    readonly placeholder?: string;
    /** Whether the input is required for form validation */
    readonly required?: boolean;
    /** Step value for number inputs (incremental value) */
    readonly step?: number | string;
    /** HTML input type attribute */
    readonly type?: "email" | "number" | "password" | "text" | "url";
    /** Current value of the input */
    readonly value?: number | string;
}

/**
 * Themed input component with consistent styling and accessibility support.
 *
 * @remarks
 * This component provides a styled input field with automatic theme integration,
 * focus states, and accessibility features. The input supports various types and
 * automatically applies appropriate styling based on the current theme and state.
 *
 * @param props - The component properties
 * @returns The themed input JSX element
 *
 * @example
 * URL input with validation:
 * ```tsx
 * <ThemedInput
 *   type="url"
 *   placeholder="https://example.com"
 *   value={websiteUrl}
 *   onChange={handleUrlChange}
 *   required={true}
 * />
 * ```
 *
 * @public
 */
const ThemedInput = ({
    "aria-describedby": ariaDescribedBy,
    [ARIA_LABEL]: ariaLabel,
    className = "",
    disabled = false,
    id,
    max,
    min,
    onChange,
    placeholder,
    required = false,
    step,
    type = "text",
    value,
}: ThemedInputProperties): React.JSX.Element => {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getBorderClass, getTextClass } =
        useThemeClasses();

    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    const inputValue = value ?? "";

    const styles: React.CSSProperties = {
        ...getBackgroundClass("primary"),
        ...getTextClass("primary"),
        ...getBorderClass("primary"),
        borderRadius: currentTheme.borderRadius.md,
        borderStyle: "solid",
        borderWidth: "1px",
        fontSize: currentTheme.typography.fontSize.sm,
        padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
        transition: TRANSITION_ALL,
        width: "100%",
    };
    return (
        <input
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            className={`themed-input ${className}`}
            disabled={disabled}
            id={id}
            max={max}
            min={min}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            step={step}
            style={styles}
            type={type}
            {...(value === undefined ? {} : { value: inputValue })}
        />
    );
};

export default ThemedInput;
