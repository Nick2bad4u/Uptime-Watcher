/**
 * Validators for data management IPC handlers.
 */

import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import {
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseBackupSaveResult,
    validateSerializedDatabaseRestoreResult,
} from "@shared/validation/dataSchemas";

import type { IpcParameterValidator, IpcResultValidator } from "../types";

import { validateImportDataPayload, validateRestorePayload } from "./shared";
import { createNoParamsValidator } from "./utils/commonValidators";

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

/**
 * IPC success-payload validators.
 *
 * @remarks
 * These are optional today, but can be passed as the 4th arg to
 * `createStandardizedIpcRegistrar()` registrations.
 */
export const DataHandlerResultValidators: Readonly<{
    downloadSqliteBackup: IpcResultValidator<SerializedDatabaseBackupResult>;
    restoreSqliteBackup: IpcResultValidator<SerializedDatabaseRestoreResult>;
    saveSqliteBackup: IpcResultValidator<SerializedDatabaseBackupSaveResult>;
}> = {
    downloadSqliteBackup: (result) => {
        const validation = validateSerializedDatabaseBackupResult(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    restoreSqliteBackup: (result) => {
        const validation = validateSerializedDatabaseRestoreResult(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    saveSqliteBackup: (result) => {
        const validation = validateSerializedDatabaseBackupSaveResult(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },
};
