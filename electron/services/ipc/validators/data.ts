/**
 * Validators for data management IPC handlers.
 */

import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import {
    formatZodIssues,
    type ZodIssueLike,
} from "@shared/utils/zodIssueFormatting";
import {
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseBackupSaveResult,
    validateSerializedDatabaseRestoreResult,
} from "@shared/validation/dataSchemas";
import { safeCastTo } from "ts-extras";

import type { IpcParameterValidator, IpcResultValidator } from "../types";

import { validateImportDataPayload, validateRestorePayload } from "./shared";
import { createNoParamsValidator } from "./utils/commonValidators";

/**
 * Formats a Zod `safeParse` error value.
 *
 * @remarks
 * Some schema helpers surface `error` as `unknown`. We still want rich issue
 * formatting when `error.issues` exists, without using `any`.
 */
function formatSafeParseError(error: unknown): string[] {
    if (typeof error !== "object" || error === null) {
        return ["Invalid response"];
    }

    if (!("issues" in error)) {
        return ["Invalid response"];
    }

    const { issues } = safeCastTo<{ readonly issues?: unknown }>(error);
    if (!Array.isArray(issues)) {
        return ["Invalid response"];
    }

    return formatZodIssues(safeCastTo<readonly ZodIssueLike[]>(issues));
}

function getSafeParseError(validation: unknown): unknown {
    if (typeof validation !== "object" || validation === null) {
        return undefined;
    }

    if (!("error" in validation)) {
        return undefined;
    }

    return (safeCastTo<{ readonly error?: unknown }>(validation)).error;
}

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

        return formatSafeParseError(getSafeParseError(validation));
    },

    restoreSqliteBackup: (result) => {
        const validation = validateSerializedDatabaseRestoreResult(result);

        if (validation.success) {
            return null;
        }

        return formatSafeParseError(getSafeParseError(validation));
    },

    saveSqliteBackup: (result) => {
        const validation = validateSerializedDatabaseBackupSaveResult(result);

        if (validation.success) {
            return null;
        }

        return formatSafeParseError(getSafeParseError(validation));
    },
};
