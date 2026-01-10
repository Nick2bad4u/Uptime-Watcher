/**
 * Parameter validators for monitor type IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    createNoParamsValidator,
    createStringObjectValidator,
    createStringWithUnvalidatedSecondValidator,
    createTwoStringValidator,
} from "./shared";

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
        validateMonitorData:
            createStringWithUnvalidatedSecondValidator("monitorType"),
    } as const;
