/**
 * Validators for data management IPC handlers.
 */

import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import { isRecord } from "@shared/utils/typeHelpers";
import {
    formatZodIssues,
    type ZodIssueLike,
    type ZodIssuePathPart,
} from "@shared/utils/zodIssueFormatting";
import {
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseBackupSaveResult,
    validateSerializedDatabaseRestoreResult,
} from "@shared/validation/dataSchemas";
import { objectHasIn } from "ts-extras";

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

function isZodIssuePathPart(value: unknown): value is ZodIssuePathPart {
    return (
        typeof value === "number" ||
        typeof value === "string" ||
        typeof value === "symbol"
    );
}

function isZodIssueLike(value: unknown): value is ZodIssueLike {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const message: unknown = Reflect.get(value, "message");
    if (typeof message !== "string") {
        return false;
    }

    const path: unknown = Reflect.get(value, "path");
    return (
        path === undefined ||
        (Array.isArray(path) && path.every(isZodIssuePathPart))
    );
}

function isZodIssueLikeArray(value: unknown): value is readonly ZodIssueLike[] {
    return Array.isArray(value) && value.every(isZodIssueLike);
}

/**
 * Formats a Zod `safeParse` error value.
 *
 * @remarks
 * Some schema helpers surface `error` as `unknown`. We still want rich issue
 * formatting when `error.issues` exists, without using `any`.
 */
function formatSafeParseError(error: unknown): string[] {
    if (!isRecord(error)) {
        return ["Invalid response"];
    }

    if (!objectHasIn(error, "issues")) {
        return ["Invalid response"];
    }

    const issues: unknown = Reflect.get(error, "issues");
    if (!isZodIssueLikeArray(issues)) {
        return ["Invalid response"];
    }

    return formatZodIssues(issues);
}

function getSafeParseError(validation: unknown): unknown {
    if (!isRecord(validation)) {
        return undefined;
    }

    if (!objectHasIn(validation, "error")) {
        return undefined;
    }

    return Reflect.get(validation, "error");
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
