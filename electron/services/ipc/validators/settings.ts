/**
 * Parameter validators for settings IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    createNoParamsValidator,
    createSingleNumberValidator,
} from "./utils/commonValidators";

/**
 * Interface for settings handler validators.
 */
interface SettingsHandlerValidatorsInterface {
    getHistoryLimit: IpcParameterValidator;
    resetSettings: IpcParameterValidator;
    updateHistoryLimit: IpcParameterValidator;
}

export const SettingsHandlerValidators: SettingsHandlerValidatorsInterface = {
    getHistoryLimit: createNoParamsValidator(),
    resetSettings: createNoParamsValidator(),
    updateHistoryLimit: createSingleNumberValidator("limit"),
} as const;
