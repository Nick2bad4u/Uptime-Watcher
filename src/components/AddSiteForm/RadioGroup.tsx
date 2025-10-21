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

import {
    type ChangeEvent,
    memo,
    type NamedExoticComponent,
    type ReactElement,
    useCallback,
} from "react";

import { ThemedText } from "../../theme/components/ThemedText";
import {
    createFieldWrapper,
    type FieldWrapperPropsBase,
} from "./fields/fieldFactories";

/**
 * Properties for the RadioGroup component.
 *
 * @public
 */
export interface RadioGroupProperties extends FieldWrapperPropsBase {
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

interface RadioOptionItemProps {
    readonly disabled: boolean;
    readonly handleChange: (value: string) => void;
    readonly name: string;
    readonly option: RadioOption;
    readonly required: boolean;
    readonly selectedValue: string;
}

const RadioOptionItem = memo((props: RadioOptionItemProps): ReactElement => {
    const { disabled, handleChange, name, option, required, selectedValue } =
        props;

    const handleOptionChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            handleChange(event.target.value);
        },
        [handleChange]
    );

    return (
        <label className="flex items-center gap-1" key={option.value}>
            <input
                checked={selectedValue === option.value}
                disabled={disabled}
                name={name}
                onChange={handleOptionChange}
                required={required}
                type="radio"
                value={option.value}
            />
            <ThemedText size="sm">{option.label}</ThemedText>
        </label>
    );
});

RadioOptionItem.displayName = "RadioOptionItem";

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
const RadioGroupBase = createFieldWrapper<RadioGroupProperties>({
    displayName: "RadioGroup",
    renderControl: ({ props }) => {
        const {
            disabled = false,
            name,
            onChange,
            options,
            required = false,
            value,
        } = props;

        function renderOption(option: RadioOption): ReactElement {
            return (
                <RadioOptionItem
                    disabled={disabled}
                    handleChange={onChange}
                    key={option.value}
                    name={name}
                    option={option}
                    required={required}
                    selectedValue={value}
                />
            );
        }

        return (
            <div className="flex items-center gap-4" role="radiogroup">
                {options.map(renderOption)}
            </div>
        );
    },
});

export const RadioGroup: NamedExoticComponent<RadioGroupProperties> =
    RadioGroupBase;
