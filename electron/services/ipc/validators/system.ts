/**
 * System handler validators.
 */

import type { IpcParameterValidator } from "../types";

import { MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES } from "../diagnosticsLimits";
import { createPreloadGuardReportValidator } from "./shared";
import {
    createClipboardTextValidator,
    createNoParamsValidator,
    createSingleBudgetedStringValidator,
    createSingleExternalOpenUrlValidator,
} from "./utils/commonValidators";

/**
 * Interface for system handler validators.
 */
interface SystemHandlerValidatorsInterface {
    getUpdateStatus: IpcParameterValidator;
    openExternal: IpcParameterValidator;
    quitAndInstall: IpcParameterValidator;
    reportPreloadGuard: IpcParameterValidator;
    verifyIpcHandler: IpcParameterValidator;
    writeClipboardText: IpcParameterValidator;
}

export const SystemHandlerValidators: SystemHandlerValidatorsInterface = {
    getUpdateStatus: createNoParamsValidator(),
    openExternal: createSingleExternalOpenUrlValidator("url"),
    quitAndInstall: createNoParamsValidator(),
    reportPreloadGuard: createPreloadGuardReportValidator(),
    verifyIpcHandler: createSingleBudgetedStringValidator(
        "channelName",
        MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES,
        `channelName must not exceed ${MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES} bytes`
    ),
    writeClipboardText: createClipboardTextValidator(),
} as const;
