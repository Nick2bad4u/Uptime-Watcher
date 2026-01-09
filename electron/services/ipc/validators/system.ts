/**
 * System handler validators.
 */

import type { IpcParameterValidator } from "../types";

import {
    createClipboardTextValidator,
    createNoParamsValidator,
    createPreloadGuardReportValidator,
    createSingleExternalOpenUrlValidator,
    createSingleStringValidator,
} from "./shared";

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
