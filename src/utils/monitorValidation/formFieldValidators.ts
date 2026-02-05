import type { MonitorType } from "@shared/types";

import { validateMonitorField as sharedValidateMonitorField } from "@shared/validation/monitorSchemas";

import type {
    MonitorFieldName,
    NumberFieldName,
    OptionalMonitorFieldValue,
    StringFieldName,
} from "./monitorValidationTypes";

/**
 * Validates a required string field and returns the resulting error messages.
 */
export function validateRequiredStringField<
    TType extends MonitorType,
    TField extends StringFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>,
    missingMessage: string
): string[] {
    if (typeof value !== "string") {
        return [missingMessage];
    }

    const result = sharedValidateMonitorField(type, fieldName, value);
    const errors = Array.from(result.errors);

    if (value.trim().length === 0 && errors.length === 0) {
        errors.push(missingMessage);
    }

    return errors;
}

/**
 * Validates a required number field and returns the resulting error messages.
 */
export function validateRequiredNumberField<
    TType extends MonitorType,
    TField extends NumberFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>,
    missingMessage: string
): string[] {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return [missingMessage];
    }

    const result = sharedValidateMonitorField(type, fieldName, value);
    return Array.from(result.errors);
}

/**
 * Validates a required integer field.
 *
 * @remarks
 * For form UX we treat non-integer values the same as missing/invalid input
 * and return the provided `missingMessage` rather than schema-specific errors.
 */
export function validateRequiredIntegerField<
    TType extends MonitorType,
    TField extends NumberFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>,
    missingMessage: string
): string[] {
    if (typeof value !== "number" || !Number.isInteger(value)) {
        return [missingMessage];
    }

    const result = sharedValidateMonitorField(type, fieldName, value);
    return Array.from(result.errors);
}

/**
 * Validates an optional string field when it is provided as a non-empty value.
 */
export function validateOptionalTrimmedStringField<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): string[] {
    if (typeof value !== "string") {
        return [];
    }

    if (value.trim().length === 0) {
        return [];
    }

    const result = sharedValidateMonitorField(type, fieldName, value);
    return Array.from(result.errors);
}
