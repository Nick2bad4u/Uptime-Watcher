/**
 * System handler validators.
 */

import type { IpcParameterValidator } from "../types";

import { createPreloadGuardReportValidator } from "./shared";
import {
    createClipboardTextValidator,
    createNoParamsValidator,
    createSingleExternalOpenUrlValidator,
    createSingleStringValidator,
} from "./utils/commonValidators";

/**
 * Interface for system handler validators.
 */
interface SystemHandlerValidatorsInterface {
    openExternal: IpcParameterValidator;
    quitAndInstall: IpcParameterValidator;
    reportPreloadGuard: IpcParameterValidator;
    verifyIpcHandler: IpcParameterValidator;
    writeClipboardText: IpcParameterValidator;
}

export const SystemHandlerValidators: SystemHandlerValidatorsInterface = {
    openExternal: createSingleExternalOpenUrlValidator("url"),
    quitAndInstall: createNoParamsValidator(),
    reportPreloadGuard: createPreloadGuardReportValidator(),
    verifyIpcHandler: createSingleStringValidator("channelName"),
    writeClipboardText: createClipboardTextValidator(),
} as const;
