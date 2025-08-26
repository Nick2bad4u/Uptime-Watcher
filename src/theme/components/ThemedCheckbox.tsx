import type {
    AccessibilityProperties,
    CoreComponentProperties,
    EventHandlers,
} from "@shared/types/componentProps";

import React from "react";

import { ARIA_LABEL } from "../../constants";

/**
 * Props for the ThemedCheckbox component
 *
 * @public
 */
export interface ThemedCheckboxProperties
    extends AccessibilityProperties,
        CoreComponentProperties {
    /** Whether the checkbox is checked */
    readonly checked?: boolean;
    /** Callback fired when checkbox state changes */
    readonly onChange?: EventHandlers.ChangeWithEvent;
    /** Whether the checkbox is required for form submission */
    readonly required?: boolean;
}

/**
 * A themed checkbox input component
 *
 * @param props - The checkbox properties
 *
 * @returns The themed checkbox JSX element
 *
 * @public
 */
const ThemedCheckbox = ({
    [ARIA_LABEL]: ariaLabel,
    checked,
    className = "",
    disabled = false,
    onChange,
    required = false,
}: ThemedCheckboxProperties): React.JSX.Element => (
    <input
        type="checkbox"
        {...(checked === undefined ? {} : { checked })}
        aria-label={ariaLabel}
        className={`themed-checkbox ${className}`}
        disabled={disabled}
        onChange={onChange}
        required={required}
    />
);

export default ThemedCheckbox;
