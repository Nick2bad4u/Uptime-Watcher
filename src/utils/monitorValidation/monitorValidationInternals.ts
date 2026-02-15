import type { MonitorType } from "@shared/types";
import type { Promisable } from "type-fest";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { castUnchecked } from "@shared/utils/typeHelpers";

import type {
    MonitorFieldName,
    OptionalMonitorFieldValue,
    PartialMonitorFormDataByType,
} from "./monitorValidationTypes";

/**
 * Executes a monitor validation helper with standardized error handling.
 *
 * @typeParam TResult - Result produced by the validation operation.
 */
export async function runMonitorValidationOperation<TResult>(
    description: string,
    fallback: TResult,
    operation: () => Promisable<TResult>
): Promise<TResult> {
    return withUtilityErrorHandling(
        async () => operation(),
        description,
        fallback
    );
}

/**
 * Builds a typed partial monitor form data object for single-field validation.
 *
 * @typeParam TType - Monitor type discriminator.
 * @typeParam TField - Field name belonging to the specified monitor type.
 */
export function toPartialMonitorFormData<
    TType extends MonitorType,
    TField extends MonitorFieldName<TType>,
>(
    fieldName: TField,
    value: OptionalMonitorFieldValue<TType, TField>
): PartialMonitorFormDataByType<TType> {
    return castUnchecked<PartialMonitorFormDataByType<TType>>({
        [fieldName]: value,
    });
}
