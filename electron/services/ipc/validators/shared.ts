/**
 * Parameter validators for specific IPC handler groups.
 *
 * @remarks
 * Provides type-safe validation for different categories of IPC operations.
 * Each validator returns `null` if parameters are valid, or an array of error
 * messages if invalid. All validators conform to the
 * {@link IpcParameterValidator} interface.
 *
 * @public
 *
 * @see {@link IpcParameterValidator}
 */

import {
    MAX_IPC_JSON_IMPORT_BYTES,
    MAX_IPC_SQLITE_RESTORE_BYTES,
} from "@shared/constants/backup";

import type { IpcParameterValidator } from "../types";
import type { ParameterValueValidationResult } from "./utils/parameterValidation";

import {
    MAX_DIAGNOSTICS_METADATA_BYTES,
    MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES,
} from "../diagnosticsLimits";
import { validateGuardReportPayload } from "./utils/guardReportValidation";
import { createMonitorValidationPayloadValidator as createMonitorValidationPayloadValidatorImpl } from "./utils/monitorValidation";
import {
    validateNotificationPreferencesPayload,
    validateNotifyAppEventPayload,
} from "./utils/notificationValidation";
import { createParamValidator } from "./utils/parameterValidation";
import { requireRecordParamValue } from "./utils/recordValidation";
import {
    validateRestoreBufferCandidate,
    validateRestoreFileNameCandidate,
} from "./utils/restoreValidation";
import {
    createSiteIdentifierAndMonitorIdValidator as createSiteIdentifierAndMonitorIdValidatorImpl,
    createSiteIdentifierValidator as createSiteIdentifierValidatorImpl,
    createSitePayloadValidator,
    createSiteUpdatePayloadValidator,
} from "./utils/siteValidation";
import { validateRequiredStringPayload } from "./utils/stringPayloadValidation";

/**
 * Maximum byte budget accepted for JSON import payloads transported over IPC.
 *
 * @remarks
 * JSON import/export is intended for portability and small-to-medium snapshots.
 * For very large datasets users should prefer SQLite backup/restore. We align
 * this limit with the SQLite backup size policy to avoid "works on one path but
 * not the other" surprises.
 */
const MAX_IMPORT_DATA_PAYLOAD_BYTES: number = MAX_IPC_JSON_IMPORT_BYTES;

/** Maximum byte budget accepted for user-supplied restore filenames. */
const MAX_RESTORE_FILE_NAME_BYTES: number = 512;

/** Maximum byte budget accepted for monitor validation payloads over IPC. */
const MAX_MONITOR_VALIDATION_DATA_BYTES: number = 256 * 1024;

// NOTE: filesystem path validation helpers are centralized in
// @shared/validation/filesystemBaseDirectoryValidation.

const validateSitePayload: IpcParameterValidator = createSitePayloadValidator();

const validateSiteUpdatePayload: IpcParameterValidator =
    createSiteUpdatePayloadValidator();

/**
 * Creates an IPC validator for a single site identifier parameter.
 */
function createSiteIdentifierValidator(
    paramName: string
): IpcParameterValidator {
    return createSiteIdentifierValidatorImpl(paramName);
}

/**
 * Creates an IPC validator for site identifier + monitor ID parameters.
 */
function createSiteIdentifierAndMonitorIdValidator(
    siteParamName: string,
    monitorParamName: string
): IpcParameterValidator {
    return createSiteIdentifierAndMonitorIdValidatorImpl(
        siteParamName,
        monitorParamName
    );
}

const validatePreloadGuardReport: IpcParameterValidator = createParamValidator(
    1,
    [
        (report): ParameterValueValidationResult =>
            validateGuardReportPayload(report, {
                maxMetadataBytes: MAX_DIAGNOSTICS_METADATA_BYTES,
                maxPayloadPreviewBytes: MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES,
            }),
    ]
);

function createPreloadGuardReportValidator(): IpcParameterValidator {
    return validatePreloadGuardReport;
}

const validateNotificationPreferences: IpcParameterValidator =
    createParamValidator(1, [validateNotificationPreferencesPayload], {
        stopOnCountMismatch: true,
    });

const validateNotifyAppEvent: IpcParameterValidator = createParamValidator(
    1,
    [validateNotifyAppEventPayload],
    { stopOnCountMismatch: true }
);

const validateRestorePayload: IpcParameterValidator = createParamValidator(1, [
    (payload): ParameterValueValidationResult => {
        const errors: string[] = [];

        const recordResult = requireRecordParamValue(payload, "payload");
        if (recordResult.ok === false) {
            return recordResult.error;
        }

        const { record } = recordResult;
        errors.push(
            ...validateRestoreBufferCandidate(record["buffer"], {
                maxBytes: MAX_IPC_SQLITE_RESTORE_BYTES,
            })
        );

        const fileNameValue = record["fileName"];
        if (fileNameValue !== undefined) {
            errors.push(
                ...validateRestoreFileNameCandidate(fileNameValue, {
                    maxBytes: MAX_RESTORE_FILE_NAME_BYTES,
                })
            );
        }

        return errors.length > 0 ? errors : null;
    },
]);

const validateImportDataPayload: IpcParameterValidator = createParamValidator(
    1,
    [
        (candidate): ParameterValueValidationResult => {
            const errors = validateRequiredStringPayload(candidate, {
                maxBytes: MAX_IMPORT_DATA_PAYLOAD_BYTES,
                maxBytesMessage: `data exceeds ${MAX_IMPORT_DATA_PAYLOAD_BYTES} bytes; use SQLite backup/restore for large snapshots`,
                paramName: "data",
            });

            return errors.length > 0 ? errors : null;
        },
    ]
);

function createMonitorValidationPayloadValidator(
    monitorTypeParamName: string,
    dataParamName: string
): IpcParameterValidator {
    return createMonitorValidationPayloadValidatorImpl(
        monitorTypeParamName,
        dataParamName,
        MAX_MONITOR_VALIDATION_DATA_BYTES
    );
}

export {
    createMonitorValidationPayloadValidator,
    createPreloadGuardReportValidator,
    createSiteIdentifierAndMonitorIdValidator,
    createSiteIdentifierValidator,
    validateImportDataPayload,
    validateNotificationPreferences,
    validateNotifyAppEvent,
    validateRestorePayload,
    validateSitePayload,
    validateSiteUpdatePayload,
};
