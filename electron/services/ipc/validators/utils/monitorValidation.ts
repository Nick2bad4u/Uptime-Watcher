import type { IpcParameterValidator } from "../../types";

import { createStringWithBudgetedObjectValidator } from "./commonValidators";

/**
 * Creates a monitor validation payload validator with a strict JSON byte budget
 * for the payload object.
 *
 * @param monitorTypeParamName - Parameter name for the monitor type.
 * @param dataParamName - Parameter name for the payload object.
 * @param maxBytes - Maximum JSON byte budget for the payload.
 *
 * @returns IPC validator enforcing the payload budget.
 *
 * @internal
 */
export function createMonitorValidationPayloadValidator(
    monitorTypeParamName: string,
    dataParamName: string,
    maxBytes: number
): IpcParameterValidator {
    return createStringWithBudgetedObjectValidator(
        monitorTypeParamName,
        dataParamName,
        maxBytes
    );
}
