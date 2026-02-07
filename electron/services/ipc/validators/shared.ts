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
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { isRecord } from "@shared/utils/typeHelpers";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import {
    validateSiteSnapshot,
    validateSiteUpdate,
} from "@shared/validation/guards";
import { monitorIdSchema } from "@shared/validation/monitorFieldSchemas";
import {
    validateAppNotificationRequest,
    validateNotificationPreferenceUpdate,
} from "@shared/validation/notifications";
import { siteIdentifierSchema } from "@shared/validation/siteFieldSchemas";

import type { IpcParameterValidator } from "../types";
import type { ParameterValueValidationResult } from "./utils/parameterValidation";

import {
    MAX_DIAGNOSTICS_METADATA_BYTES,
    MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES,
} from "../diagnosticsLimits";
import { IpcValidators } from "./IpcValidators";
import { createStringWithBudgetedObjectValidator } from "./utils/commonValidators";
import {
    createParamValidator,
    toValidationResult,
} from "./utils/parameterValidation";
import {
    getForbiddenRecordKeyErrors,
    isRequiredRecordError,
    requireRecordParam,
} from "./utils/recordValidation";

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

const validateSiteIdentifierCandidate = (
    value: unknown,
    paramName: string
): ParameterValueValidationResult => {
    if (typeof value !== "string") {
        return toValidationResult(
            IpcValidators.requiredString(value, paramName)
        );
    }

    const parsed = siteIdentifierSchema.safeParse(value);
    if (parsed.success) {
        return null;
    }

    return formatZodIssues(parsed.error.issues);
};

function createSiteIdentifierValidator(
    paramName: string
): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult =>
            validateSiteIdentifierCandidate(value, paramName),
    ]);
}

function createSiteIdentifierAndMonitorIdValidator(
    siteParamName: string,
    monitorParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (value): ParameterValueValidationResult =>
            validateSiteIdentifierCandidate(value, siteParamName),
        (value): ParameterValueValidationResult => {
            if (typeof value !== "string") {
                return toValidationResult(
                    IpcValidators.requiredString(value, monitorParamName)
                );
            }

            const parsed = monitorIdSchema.safeParse(value);
            return parsed.success ? null : formatZodIssues(parsed.error.issues);
        },
    ]);
}

const validateSitePayload: IpcParameterValidator = createParamValidator(
    1,
    [
        (siteCandidate): ParameterValueValidationResult => {
            const result = validateSiteSnapshot(siteCandidate);
            return result.success ? null : formatZodIssues(result.error.issues);
        },
    ],
    { stopOnCountMismatch: true }
);

const validateSiteUpdatePayload: IpcParameterValidator = createParamValidator(
    2,
    [
        (identifierCandidate): ParameterValueValidationResult =>
            validateSiteIdentifierCandidate(identifierCandidate, "identifier"),
        (updatesCandidate): ParameterValueValidationResult => {
            const recordResult = requireRecordParam(
                updatesCandidate,
                "updates"
            );
            if (isRequiredRecordError(recordResult)) {
                return recordResult.error;
            }

            const errors: string[] = [];
            if (Object.keys(recordResult.record).length === 0) {
                errors.push("updates must not be empty");
            }

            const validationResult = validateSiteUpdate(recordResult.record);
            if (!validationResult.success) {
                errors.push(...formatZodIssues(validationResult.error.issues));
            }

            return errors.length > 0 ? errors : null;
        },
    ]
);

const validatePreloadGuardReport: IpcParameterValidator = createParamValidator(
    1,
    [
        (report): ParameterValueValidationResult => {
            const errors: string[] = [];

            const recordResult = requireRecordParam(report, "guardReport");
            if (isRequiredRecordError(recordResult)) {
                return recordResult.error;
            }

            const { record } = recordResult;

            const channelError = IpcValidators.requiredString(
                record["channel"],
                "channel"
            );
            if (channelError) {
                errors.push(channelError);
            }

            const guardError = IpcValidators.requiredString(
                record["guard"],
                "guard"
            );
            if (guardError) {
                errors.push(guardError);
            }

            const reasonError = IpcValidators.optionalString(
                record["reason"],
                "reason"
            );
            if (reasonError) {
                errors.push(reasonError);
            }

            const payloadPreviewValue = record["payloadPreview"];
            const payloadPreviewError = IpcValidators.optionalString(
                payloadPreviewValue,
                "payloadPreview"
            );
            if (payloadPreviewError) {
                errors.push(payloadPreviewError);
            } else if (
                typeof payloadPreviewValue === "string" &&
                getUtfByteLength(payloadPreviewValue) >
                    MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES
            ) {
                errors.push(
                    `payloadPreview exceeds ${MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES} bytes`
                );
            }

            const metadataValue = record["metadata"];
            if (metadataValue !== undefined) {
                const metadataRecordResult = requireRecordParam(
                    metadataValue,
                    "metadata"
                );
                if (isRequiredRecordError(metadataRecordResult)) {
                    if (metadataRecordResult.error) {
                        errors.push(...metadataRecordResult.error);
                    }
                } else {
                    try {
                        const serialized = JSON.stringify(metadataValue);
                        if (
                            !serialized ||
                            getUtfByteLength(serialized) >
                                MAX_DIAGNOSTICS_METADATA_BYTES
                        ) {
                            errors.push(
                                `metadata exceeds ${MAX_DIAGNOSTICS_METADATA_BYTES} bytes`
                            );
                        }
                    } catch {
                        errors.push("metadata must be serializable");
                    }
                }
            }

            const timestampError = IpcValidators.requiredNumber(
                record["timestamp"],
                "timestamp"
            );
            if (timestampError) {
                errors.push(timestampError);
            }

            return errors.length > 0 ? errors : null;
        },
    ]
);

function createPreloadGuardReportValidator(): IpcParameterValidator {
    return validatePreloadGuardReport;
}

const validateNotificationPreferences: IpcParameterValidator =
    createParamValidator(
        1,
        [
            (preferences): ParameterValueValidationResult => {
                const objectError = IpcValidators.requiredObject(
                    preferences,
                    "preferences"
                );

                if (objectError) {
                    return toValidationResult(objectError);
                }

                if (!isRecord(preferences)) {
                    return toValidationResult(
                        "Notification preferences payload must be an object"
                    );
                }

                const forbiddenKeyErrors = getForbiddenRecordKeyErrors(
                    preferences,
                    "preferences"
                );
                if (forbiddenKeyErrors.length > 0) {
                    return forbiddenKeyErrors;
                }

                const validationResult =
                    validateNotificationPreferenceUpdate(preferences);
                return validationResult.success
                    ? null
                    : formatZodIssues(validationResult.error.issues);
            },
        ],
        { stopOnCountMismatch: true }
    );

const validateNotifyAppEvent: IpcParameterValidator = createParamValidator(
    1,
    [
        (request): ParameterValueValidationResult => {
            const objectError = IpcValidators.requiredObject(
                request,
                "request"
            );
            if (objectError) {
                return toValidationResult(objectError);
            }

            if (isRecord(request)) {
                const forbiddenKeyErrors = getForbiddenRecordKeyErrors(
                    request,
                    "request"
                );
                if (forbiddenKeyErrors.length > 0) {
                    return forbiddenKeyErrors;
                }
            }

            const validationResult = validateAppNotificationRequest(request);
            return validationResult.success
                ? null
                : formatZodIssues(validationResult.error.issues);
        },
    ],
    { stopOnCountMismatch: true }
);

function validateRestoreBufferCandidate(candidate: unknown): string[] {
    if (!(candidate instanceof ArrayBuffer)) {
        return ["payload.buffer must be an ArrayBuffer"];
    }

    if (candidate.byteLength === 0) {
        return ["payload.buffer must not be empty"];
    }

    if (candidate.byteLength > MAX_IPC_SQLITE_RESTORE_BYTES) {
        return [
            `payload.buffer exceeds maximum allowed ${MAX_IPC_SQLITE_RESTORE_BYTES} bytes`,
        ];
    }

    return [];
}

function validateRestoreFileNameCandidate(candidate: unknown): string[] {
    const requiredError = IpcValidators.requiredString(candidate, "fileName");
    if (requiredError) {
        return [requiredError];
    }

    if (typeof candidate !== "string") {
        // Defensive: requiredString already enforces this.
        return ["fileName must be a string"];
    }

    const rawFileName = candidate;
    const fileName = rawFileName.trim();
    if (fileName.length === 0) {
        return ["fileName must not be blank"];
    }

    const errors: string[] = [];

    if (rawFileName !== fileName) {
        errors.push("fileName must not have leading or trailing whitespace");
    }

    if (getUtfByteLength(fileName) > MAX_RESTORE_FILE_NAME_BYTES) {
        errors.push(
            `fileName must not exceed ${MAX_RESTORE_FILE_NAME_BYTES} bytes`
        );
    }

    if (hasAsciiControlCharacters(fileName)) {
        errors.push("fileName must not contain control characters");
    }

    if (fileName === "." || fileName === "..") {
        errors.push("fileName must be a valid file name");
    }

    // `fileName` is intended for UI/logging only; it should be a base name, not
    // a path.
    if (normalizePathSeparatorsToPosix(fileName).includes("/")) {
        errors.push("fileName must not contain path separators");
    }

    return errors;
}

const validateRestorePayload: IpcParameterValidator = createParamValidator(1, [
    (payload): ParameterValueValidationResult => {
        const errors: string[] = [];

        const recordResult = requireRecordParam(payload, "payload");
        if (isRequiredRecordError(recordResult)) {
            return recordResult.error;
        }

        const { record } = recordResult;
        errors.push(...validateRestoreBufferCandidate(record["buffer"]));

        const fileNameValue = record["fileName"];
        if (fileNameValue !== undefined) {
            errors.push(...validateRestoreFileNameCandidate(fileNameValue));
        }

        return errors.length > 0 ? errors : null;
    },
]);

const validateImportDataPayload: IpcParameterValidator = createParamValidator(
    1,
    [
        (candidate): ParameterValueValidationResult => {
            const errors: string[] = [];

            const stringError = IpcValidators.requiredString(candidate, "data");
            if (stringError) {
                return toValidationResult(stringError);
            }

            if (typeof candidate !== "string") {
                // Defensive: requiredString already enforces this.
                return toValidationResult("data must be a string");
            }

            const data = candidate;
            if (getUtfByteLength(data) > MAX_IMPORT_DATA_PAYLOAD_BYTES) {
                errors.push(
                    `data exceeds ${MAX_IMPORT_DATA_PAYLOAD_BYTES} bytes; use SQLite backup/restore for large snapshots`
                );
            }

            return errors.length > 0 ? errors : null;
        },
    ]
);

function createMonitorValidationPayloadValidator(
    monitorTypeParamName: string,
    dataParamName: string
): IpcParameterValidator {
    return createStringWithBudgetedObjectValidator(
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
