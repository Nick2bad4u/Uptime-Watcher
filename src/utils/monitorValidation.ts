/**
 * Enhanced monitor validation utilities with shared schemas. Provides both
 * client-side and server-side validation support.
 *
 * @public
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { ValidationResult } from "@shared/types/validation";
import type { UnknownRecord } from "type-fest";

import { validateMonitorType } from "@shared/utils/validation";
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/monitorSchemas";

import type { MonitorFormData } from "../types/monitorFormData";
import type {
    EnhancedValidationResult as EnhancedValidationResultInternal,
    MonitorFieldName,
    OptionalMonitorFieldValue,
    PartialMonitorFormDataByType as PartialMonitorFormDataByTypeInternal,
} from "./monitorValidation/monitorValidationTypes";

import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { getMonitorFormValidationErrors } from "./monitorValidation/monitorFormValidators";
import {
    runMonitorValidationOperation,
    toPartialMonitorFormData,
} from "./monitorValidation/monitorValidationInternals";

const isKnownMonitorType = (value: string): value is MonitorType =>
    validateMonitorType(value);

/**
 * Partial view of monitor form data for a specific monitor type.
 *
 * @typeParam TType - Monitor type discriminator.
 *
 * @public
 */
export type PartialMonitorFormDataByType<TType extends MonitorType> =
    PartialMonitorFormDataByTypeInternal<TType>;

type EnhancedValidationResult = EnhancedValidationResultInternal;

/**
 * Required fields for monitor creation, ensuring type safety. Prevents runtime
 * errors by guaranteeing essential properties are present.
 *
 * @public
 */
export interface MonitorCreationData
    extends
        Pick<
            Monitor,
            | "history"
            | "monitoring"
            | "responseTime"
            | "retryAttempts"
            | "status"
            | "timeout"
            | "type"
        >,
        UnknownRecord {}
/**
 * Create monitor object with proper field mapping and type safety.
 *
 * @typeParam TType - Monitor type literal for the monitor being constructed.
 *
 * @param type - Monitor type.
 * @param fields - Field values to merge with defaults.
 *
 * @returns Monitor creation data with type-specific fields and guaranteed
 *   required fields.
 *
 * @public
 */
export function createMonitorObject<TType extends MonitorType>(
    type: TType,
    fields: PartialMonitorFormDataByType<TType>
): MonitorCreationData & PartialMonitorFormDataByType<TType> {
    return {
        history: [],
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: "pending",
        timeout: 10_000,
        ...fields,
        type,
    };
}

/**
 * Executes a monitor validation helper with standardized error handling.
 *
 * @typeParam TResult - Result produced by the validation operation.
 *
 * @param description - Context string describing the operation for logging.
 * @param fallback - Value returned when the validation operation fails.
 * @param operation - Callback encapsulating the validation logic.
 *
 * @returns Result of the validation operation or the fallback when errors
 *   occur.
 */

/**
 * Validate monitor data using backend registry.
 *
 * @typeParam TType - Monitor type discriminator to validate against.
 *
 * @param type - Monitor type.
 * @param data - Monitor data to validate.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorData<TType extends MonitorType>(
    type: TType,
    data?: PartialMonitorFormDataByType<TType>
): Promise<ValidationResult> {
    const basePayload: PartialMonitorFormDataByType<TType> = data ?? {};
    // Always include the monitor type in the payload so that downstream
    // validators (monitor types store and backend Zod schemas) receive a
    // consistent discriminator field alongside the typed argument.
    const payload: PartialMonitorFormDataByType<TType> & { type: TType } = {
        ...basePayload,
        type,
    };
    if (!isKnownMonitorType(type)) {
        return {
            errors: [`Unsupported monitor type: ${String(type)}`],
            success: false,
            warnings: [],
        };
    }
    return runMonitorValidationOperation(
        "Monitor data validation",
        {
            errors: ["Validation failed - unable to connect to backend"],
            metadata: {},
            success: false,
            warnings: [],
        },
        async () => {
            const store = useMonitorTypesStore.getState();
            return store.validateMonitorData(type, payload);
        }
    );
}

/**
 * Perform client-side validation using shared Zod schemas. Provides immediate
 * feedback without IPC round-trip.
 *
 * @typeParam TType - Monitor type discriminator to validate against.
 *
 * @param type - Monitor type.
 * @param data - Monitor data to validate.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorDataClientSide<TType extends MonitorType>(
    type: TType,
    data: PartialMonitorFormDataByType<TType>
): Promise<ValidationResult> {
    return runMonitorValidationOperation(
        "Client-side monitor data validation",
        {
            errors: ["Client-side validation failed"],
            success: false,
            warnings: [],
        },
        () => {
            const result = sharedValidateMonitorData(type, data);
            return {
                errors: result.errors,
                success: result.success,
                warnings: result.warnings ?? [],
            };
        }
    );
}

/**
 * Enhanced field validation with type information and better error handling.
 *
 * @typeParam TType - Monitor type being validated.
 * @typeParam TField - Field identifier belonging to the monitor form.
 *
 * @param type - Monitor type.
 * @param fieldName - Field name to validate.
 * @param value - Field value.
 *
 * @returns Promise resolving to enhanced validation result.
 *
 * @public
 */
export async function validateMonitorFieldEnhanced<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): Promise<EnhancedValidationResult> {
    return runMonitorValidationOperation(
        "Enhanced field validation",
        {
            errors: [`Failed to validate field: ${fieldName}`],
            fieldName,
            success: false,
            validationType: "field" as const,
            warnings: [],
        },
        async () => {
            const partialPayload = toPartialMonitorFormData(fieldName, value);
            const result = await validateMonitorData(type, partialPayload);

            const filteredErrors = result.errors.filter((error) =>
                error.toLowerCase().includes(fieldName.toLowerCase())
            );

            const finalErrors =
                result.errors.length > 0 &&
                filteredErrors.length === 0 &&
                !result.success
                    ? [`Failed to validate field: ${fieldName}`]
                    : filteredErrors;

            return {
                errors: finalErrors,
                fieldName,
                success: result.success,
                validationType: "field" as const,
                warnings:
                    result.warnings?.filter((warning) =>
                        warning.toLowerCase().includes(fieldName.toLowerCase())
                    ) ?? [],
            };
        }
    );
}

/**
 * Validate individual monitor field with improved error filtering.
 *
 * @typeParam TType - Monitor type under validation.
 * @typeParam TField - Field identifier belonging to the monitor form.
 *
 * @param type - Monitor type.
 * @param fieldName - Field name to validate.
 * @param value - Field value.
 *
 * @returns Promise resolving to validation errors (empty when valid).
 *
 * @public
 */
export async function validateMonitorField<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): Promise<readonly string[]> {
    return runMonitorValidationOperation(
        "Field validation",
        [`Failed to validate field: ${fieldName}`],
        async () => {
            const result = await validateMonitorFieldEnhanced(
                type,
                fieldName,
                value
            );
            return result.errors;
        }
    );
}

/**
 * Validate a specific monitor field for real-time feedback using shared
 * schemas. Provides immediate validation without IPC round-trip.
 *
 * @typeParam TType - Monitor type under validation.
 * @typeParam TField - Field identifier belonging to the monitor form.
 *
 * @param type - Monitor type.
 * @param fieldName - Field name to validate.
 * @param value - Field value to validate.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorFieldClientSide<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    type: TType,
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): Promise<ValidationResult> {
    return runMonitorValidationOperation(
        `Client-side field validation for ${fieldName}`,
        {
            errors: [`Failed to validate ${fieldName} on client-side`],
            metadata: {},
            success: false,
            warnings: [],
        },
        () => sharedValidateMonitorField(type, fieldName, value)
    );
}

/**
 * Validate monitor form data with only the fields that are provided. Used for
 * form validation where not all monitor fields are available yet.
 *
 * @typeParam TType - Monitor type discriminator used for schema lookup.
 *
 * @param type - Monitor type.
 * @param data - Partial monitor data from form.
 *
 * @returns Promise resolving to validation result.
 *
 * @public
 */
export async function validateMonitorFormData<TType extends MonitorType>(
    type: TType,
    data: PartialMonitorFormDataByType<TType>
): Promise<ValidationResult> {
    if (!isKnownMonitorType(type)) {
        return {
            errors: [`Unsupported monitor type: ${String(type)}`],
            success: false,
            warnings: [],
        };
    }

    // Defensive runtime guard: even though this function is typed, tests and
    // fuzzing may call it with invalid inputs via `any`/`unknown`.
    const dataUnknown: unknown = data;
    if (typeof dataUnknown !== "object" || dataUnknown === null) {
        return {
            errors: ["Invalid monitor form data"],
            success: false,
            warnings: [],
        };
    }
    return runMonitorValidationOperation(
        "Form data validation",
        {
            errors: ["Form validation failed"],
            success: false,
            warnings: [],
        },
        () => {
            const manualErrors = getMonitorFormValidationErrors(type, data);

            // Form-level validation is intentionally lightweight: it focuses
            // on fields the user can edit in the current form rather than the
            // full monitor schema used by the backend. Shared Zod schemas are
            // exercised via validateMonitorDataClientSide and backend
            // validation flows.
            if (manualErrors.length > 0) {
                return {
                    errors: manualErrors,
                    success: false,
                    warnings: [],
                } satisfies ValidationResult;
            }

            return {
                errors: [],
                success: true,
                warnings: [],
            } satisfies ValidationResult;
        }
    );
}

/**
 * Type guard to check if form data is valid and complete.
 *
 * @param data - Form data to validate.
 *
 * @returns `true` if form data is valid and complete; otherwise `false`.
 *
 * @public
 */
export function isMonitorFormData(data: unknown): data is MonitorFormData {
    if (typeof data !== "object" || data === null) {
        return false;
    }

    const candidate = data as { type?: unknown };

    if (typeof candidate.type !== "string") {
        return false;
    }

    if (!isKnownMonitorType(candidate.type)) {
        return false;
    }

    const result = sharedValidateMonitorData(candidate.type, data);

    return result.success;
}
