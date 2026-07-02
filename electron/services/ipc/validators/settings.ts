/**
 * Parameter validators for settings IPC handlers.
 */

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";

import type { IpcParameterValidator } from "../types";

import { IpcValidators } from "./IpcValidators";
import { createNoParamsValidator } from "./utils/commonValidators";
import {
    createParamValidator,
    type ParameterValueValidationResult,
    toValidationResult,
} from "./utils/parameterValidation";

/**
 * Interface for settings handler validators.
 */
interface SettingsHandlerValidatorsInterface {
    getHistoryLimit: IpcParameterValidator;
    resetSettings: IpcParameterValidator;
    updateHistoryLimit: IpcParameterValidator;
}

function validateHistoryLimit(value: unknown): ParameterValueValidationResult {
    const numberError = IpcValidators.requiredNumber(value, "limit");
    if (numberError) {
        return toValidationResult(numberError);
    }

    if (typeof value !== "number") {
        return ["limit must be a valid number"];
    }

    try {
        normalizeHistoryLimit(value);
        return null;
    } catch {
        return [
            `limit must be finite and no greater than ${DEFAULT_HISTORY_LIMIT_RULES.maxLimit}`,
        ];
    }
}

function createHistoryLimitValidator(): IpcParameterValidator {
    return createParamValidator(1, [validateHistoryLimit]);
}

export const SettingsHandlerValidators: SettingsHandlerValidatorsInterface = {
    getHistoryLimit: createNoParamsValidator(),
    resetSettings: createNoParamsValidator(),
    updateHistoryLimit: createHistoryLimitValidator(),
} as const;
