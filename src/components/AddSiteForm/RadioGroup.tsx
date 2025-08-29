/**
 * RadioGroup component for selecting one option from multiple choices with
 * accessibility support.
 *
 * @remarks
 * Provides an accessible radio button group with ARIA attributes and keyboard
 * navigation. The component integrates with the FormField wrapper for
 * consistent styling and error handling. Each radio option is rendered with
 * proper labeling and accessibility features.
 *
 * @example Basic radio group with protocol selection:
 *
 * ```tsx
 * <RadioGroup
 *     id="protocol"
 *     name="protocol"
 *     label="Protocol"
 *     value={selectedProtocol}
 *     onChange={setProtocol}
 *     options={[
 *         { label: "HTTP", value: "http" },
 *         { label: "HTTPS", value: "https" },
 *     ]}
 *     required={true}
 * />;
 * ```
 *
 * @example Radio group with error state:
 *
 * ```tsx
 * <RadioGroup
 *     id="method"
 *     name="method"
 *     label="Request Method"
 *     value={method}
 *     onChange={setMethod}
 *     options={methodOptions}
 *     error="Please select a valid method"
 *     helpText="Choose the HTTP method for requests"
 * />;
 * ```
 *
 * @public
 */

import type { FormFieldBaseProperties } from "@shared/types/componentProps";

import { memo, type NamedExoticComponent, useCallback } from "react";

import { ThemedText } from "../../theme/components/ThemedText";
import { BaseFormField } from "./BaseFormField";

/**
 * Properties for the RadioGroup component.
 *
 * @public
 */
export interface RadioGroupProperties extends FormFieldBaseProperties {
    /** Whether the radio group is disabled */
    readonly disabled?: boolean;
    /** Name attribute for radio inputs (should be unique within the form) */
    readonly name: string;
    /** Callback function triggered when selection changes */
    readonly onChange: (value: string) => void;
    /** Array of radio options to display */
    readonly options: RadioOption[];
    /** Currently selected value */
    readonly value: string;
}

/**
 * Single option interface for RadioGroup items.
 *
 * @public
 */
export interface RadioOption {
    /** Display text for the radio option */
    label: string;
    /** Value to be selected when this option is chosen */
    value: string;
}

/**
 * RadioGroup component for selecting one option from multiple choices with
 * accessibility support.
 *
 * @remarks
 * Provides an accessible radio button group with ARIA attributes and keyboard
 * navigation. The component is memoized for performance and integrates with
 * FormField for consistent styling. Each radio option is rendered with proper
 * labeling and event handling.
 *
 * @example Protocol selection with required validation:
 *
 * ```tsx
 * <RadioGroup
 *     id="protocol"
 *     label="Protocol"
 *     name="protocol"
 *     value={formData.protocol}
 *     onChange={(value) =>
 *         setFormData((prev) => ({ ...prev, protocol: value }))
 *     }
 *     options={[
 *         { label: "HTTP", value: "http" },
 *         { label: "HTTPS", value: "https" },
 *     ]}
 *     required
 * />;
 * ```
 *
 * @param props - The component properties
 *
 * @returns JSX element containing a radio button group
 *
 * @public
 */
export const RadioGroup: NamedExoticComponent<RadioGroupProperties> = memo(
    function RadioGroup({
        disabled = false,
        error,
        helpText,
        id,
        label,
        name,
        onChange,
        options,
        required = false,
        value,
    }: RadioGroupProperties) {
        const createChangeHandler = useCallback(
            (optionValue: string): (() => void) =>
                (): void => {
                    onChange(optionValue);
                },
            [onChange]
        );

        return (
            <BaseFormField
                {...(error !== undefined && { error })}
                {...(helpText !== undefined && { helpText })}
                id={id}
                label={label}
                required={required}
            >
                {() => (
                    <div className="flex items-center gap-4" role="radiogroup">
                        {options.map((option) => (
                            <label
                                className="flex items-center gap-1"
                                key={option.value}
                            >
                                <input
                                    checked={value === option.value}
                                    disabled={disabled}
                                    name={name}
                                    onChange={createChangeHandler(option.value)}
                                    required={required}
                                    type="radio"
                                    value={option.value}
                                />
                                <ThemedText size="sm">
                                    {option.label}
                                </ThemedText>
                            </label>
                        ))}
                    </div>
                )}
            </BaseFormField>
        );
    }
);
