/**
 * Parameter validators for state synchronization IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import { createNoParamsValidator } from "./utils/commonValidators";

/**
 * Interface for state sync handler validators.
 */
interface StateSyncHandlerValidatorsInterface {
    getSyncStatus: IpcParameterValidator;
    requestFullSync: IpcParameterValidator;
}

export const StateSyncHandlerValidators: StateSyncHandlerValidatorsInterface = {
    getSyncStatus: createNoParamsValidator(),
    requestFullSync: createNoParamsValidator(),
} as const;
