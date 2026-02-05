import type { MonitorType } from "@shared/types";
import type { ValidationResult } from "@shared/types/validation";
import type { Simplify } from "type-fest";

import type { MonitorFormData } from "../../types/monitorFormData";

/**
 * Maps each monitor type to the specific renderer form data variant.
 */
export type MonitorFormDataByType = {
    [Type in MonitorType]: Extract<MonitorFormData, { type: Type }>;
};

/**
 * Convenience alias that exposes the concrete form data shape for the provided
 * monitor type.
 */
export type TypedMonitorFormData<TType extends MonitorType> =
    MonitorFormDataByType[TType];

/**
 * Partial view of monitor form data for a specific monitor type.
 */
export type PartialMonitorFormDataByType<TType extends MonitorType> = Partial<
    TypedMonitorFormData<TType>
>;

/**
 * Extracts the allowed field names for a specific monitor type.
 */
export type MonitorFieldName<TType extends MonitorType> = Extract<
    keyof TypedMonitorFormData<TType>,
    string
>;

/**
 * Resolves the runtime value type for a monitor field.
 */
export type MonitorFieldValue<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
> = TypedMonitorFormData<TType>[TField];

type MaybeUndefined<TValue> = undefined extends TValue
    ? TValue
    : TValue | undefined;

/**
 * Field value type that always allows undefined.
 */
export type OptionalMonitorFieldValue<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
> = MaybeUndefined<MonitorFieldValue<TType, TField>>;

/**
 * Utility type that returns the subset of field names whose value type matches
 * `TValue`.
 */
type FieldNamesOfType<TType extends MonitorType, TValue> = {
    [Key in MonitorFieldName<TType>]: Extract<
        MonitorFieldValue<TType, Key>,
        TValue
    > extends never
        ? never
        : Key;
}[MonitorFieldName<TType>];

/**
 * All field names whose runtime value resolves to a string (optionally
 * undefined).
 */
export type StringFieldName<TType extends MonitorType> = FieldNamesOfType<
    TType,
    string
>;

/**
 * All field names whose runtime value resolves to a number (optionally
 * undefined).
 */
export type NumberFieldName<TType extends MonitorType> = FieldNamesOfType<
    TType,
    number
>;

/**
 * Signature for monitor form validation helpers keyed by monitor type.
 */
export type MonitorFormValidatorMap = {
    [Type in MonitorType]: (
        data: PartialMonitorFormDataByType<Type>
    ) => string[];
};

/**
 * Enhanced validation result with additional type information.
 */
export type EnhancedValidationResult = Simplify<
    ValidationResult & {
        /** Field that was validated (if applicable). */
        fieldName?: string;
        /** Type information about the validation. */
        validationType: "field" | "full" | "partial";
    }
>;
