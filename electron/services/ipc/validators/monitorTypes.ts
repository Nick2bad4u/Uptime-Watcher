/**
 * Parameter validators for monitor type IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    createMonitorValidationPayloadValidator,
} from "./shared";
import {
    createNoParamsValidator,
    createStringObjectValidator,
    createTwoStringValidator,
} from "./utils/commonValidators";

/**
 * Interface for monitor type handler validators.
 */
interface MonitorTypeHandlerValidatorsInterface {
    formatMonitorDetail: IpcParameterValidator;
    formatMonitorTitleSuffix: IpcParameterValidator;
    getMonitorTypes: IpcParameterValidator;
    validateMonitorData: IpcParameterValidator;
}

export const MonitorTypeHandlerValidators: MonitorTypeHandlerValidatorsInterface =
    {
        formatMonitorDetail: createTwoStringValidator("monitorType", "details"),
        formatMonitorTitleSuffix: createStringObjectValidator(
            "monitorType",
            "monitor"
        ),
        getMonitorTypes: createNoParamsValidator(),
        validateMonitorData: createMonitorValidationPayloadValidator(
            "monitorType",
            "data"
        ),
    } as const;
