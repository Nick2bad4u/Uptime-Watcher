/**
 * Parameter validators for data management IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    createNoParamsValidator,
    validateImportDataPayload,
    validateRestorePayload,
} from "./shared";

/**
 * Interface for data handler validators.
 */
interface DataHandlerValidatorsInterface {
    downloadSqliteBackup: IpcParameterValidator;
    exportData: IpcParameterValidator;
    importData: IpcParameterValidator;
    restoreSqliteBackup: IpcParameterValidator;
    saveSqliteBackup: IpcParameterValidator;
}

export const DataHandlerValidators: DataHandlerValidatorsInterface = {
    downloadSqliteBackup: createNoParamsValidator(),
    exportData: createNoParamsValidator(),
    importData: validateImportDataPayload,
    restoreSqliteBackup: validateRestorePayload,
    saveSqliteBackup: createNoParamsValidator(),
} as const;
