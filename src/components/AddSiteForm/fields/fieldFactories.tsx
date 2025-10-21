/**
 * Field factories that encapsulate the shared form field wrapper logic for the
 * Add Site form components.
 */

import type { FormFieldBaseProperties } from "@shared/types/componentProps";

import {
    type ChangeEvent,
    memo,
    type NamedExoticComponent,
    type ReactElement,
    useCallback,
} from "react";

import { type AriaProperties, BaseFormField } from "../BaseFormField";

/**
 * Base properties shared across string-based form field components.
 */
export interface StringFieldPropsBase extends FormFieldBaseProperties {
    /** Whether the field is disabled. */
    readonly disabled?: boolean;
    /** Change handler invoked with the new string value. */
    readonly onChange: (value: string) => void;
    /** Current field value. */
    readonly value: string;
}

interface StringFieldRenderParameters<
    TProps extends StringFieldPropsBase,
    TElement extends HTMLElement,
> {
    readonly ariaProps: AriaProperties;
    readonly handleChange: (event: ChangeEvent<TElement>) => void;
    readonly props: TProps;
}

/**
 * Creates a memoized string-based form field component that automatically wires
 * the shared form field wrapper and value change plumbing.
 */
export function createStringField<
    TProps extends StringFieldPropsBase,
    TElement extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
>(options: {
    readonly displayName: string;
    readonly renderControl: (
        parameters: StringFieldRenderParameters<TProps, TElement>
    ) => ReactElement;
}): NamedExoticComponent<TProps> {
    const FieldComponent = memo((props: TProps): ReactElement => {
        const {
            error,
            helpText,
            id,
            label,
            onChange,
            required = false,
        } = props;

        const handleChange = useCallback(
            (event: ChangeEvent<TElement>) => {
                onChange(event.target.value);
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
                {(ariaProps) =>
                    options.renderControl({
                        ariaProps,
                        handleChange,
                        props,
                    })
                }
            </BaseFormField>
        );
    });

    FieldComponent.displayName = options.displayName;

    return FieldComponent;
}

/**
 * Base properties shared across custom-wrapped form field components.
 */
export type FieldWrapperPropsBase = FormFieldBaseProperties;

interface FieldWrapperRenderParameters<TProps extends FieldWrapperPropsBase> {
    readonly ariaProps: AriaProperties;
    readonly props: TProps;
}

/**
 * Creates a memoized form field component that only needs to supply custom
 * rendering while inheriting the shared wrapper logic.
 */
export function createFieldWrapper<
    TProps extends FieldWrapperPropsBase,
>(options: {
    readonly displayName: string;
    readonly renderControl: (
        parameters: FieldWrapperRenderParameters<TProps>
    ) => ReactElement;
}): NamedExoticComponent<TProps> {
    // eslint-disable-next-line react/no-multi-comp -- Factory creates a reusable component instance
    const FieldComponent = memo((props: TProps): ReactElement => {
        const { error, helpText, id, label, required = false } = props;

        return (
            <BaseFormField
                {...(error !== undefined && { error })}
                {...(helpText !== undefined && { helpText })}
                id={id}
                label={label}
                required={required}
            >
                {(ariaProps) =>
                    options.renderControl({
                        ariaProps,
                        props,
                    })
                }
            </BaseFormField>
        );
    });

    FieldComponent.displayName = options.displayName;

    return FieldComponent;
}
