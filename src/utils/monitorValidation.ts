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
import { validateMonitorField as sharedValidateMonitorField } from "@shared/validation/monitorSchemas";

import type {
    MonitorFieldName,
    OptionalMonitorFieldValue,
    PartialMonitorFormDataByType as PartialMonitorFormDataByTypeInternal,
} from "./monitorValidation/monitorValidationTypes";

import { getMonitorFormValidationErrors } from "./monitorValidation/monitorFormValidators";
import {
    runMonitorValidationOperation,
} from "./monitorValidation/monitorValidationInternals";

const isKnownMonitorType = (value: string): value is MonitorType =>
    validateMonitorType(value);

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
 * Partial view of monitor form data for a specific monitor type.
 *
 * @typeParam TType - Monitor type discriminator.
 *
 * @public
 */
export type PartialMonitorFormDataByType<TType extends MonitorType> =
    PartialMonitorFormDataByTypeInternal<TType>;

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
            // full monitor schema used by the backend.
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
