import React from "react";

import { ARIA_LABEL } from "../../constants";

/**
 * Props for the ThemedCheckbox component
 *
 * @public
 */
export interface ThemedCheckboxProperties {
    readonly "aria-label"?: string;
    readonly checked?: boolean;
    readonly className?: string;
    readonly disabled?: boolean;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly required?: boolean;
}

/**
 * A themed checkbox input component
 *
 * @param props - The checkbox properties
 * @returns The themed checkbox JSX element
 * @public
 */
const ThemedCheckbox = ({
    [ARIA_LABEL]: ariaLabel,
    checked,
    className = "",
    disabled = false,
    onChange,
    required = false,
}: ThemedCheckboxProperties): React.JSX.Element => {
    return (
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
};

export default ThemedCheckbox;
