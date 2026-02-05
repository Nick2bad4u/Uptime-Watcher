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
    MAX_FILESYSTEM_BASE_DIRECTORY_BYTES,
    validateFilesystemBaseDirectoryCandidate,
} from "@shared/validation/filesystemBaseDirectoryValidation";
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

/** Maximum byte budget accepted for cloud backup object keys. */
const MAX_BACKUP_KEY_BYTES: number = 2048;

/** Maximum byte budget accepted for encryption passphrases. */
const MAX_ENCRYPTION_PASSPHRASE_BYTES: number = 1024;

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

const validateCloudFilesystemProviderConfig: IpcParameterValidator =
    createParamValidator(1, [
        (config): ParameterValueValidationResult => {
            const recordResult = requireRecordParam(config, "config");
            if (isRequiredRecordError(recordResult)) {
                return recordResult.error;
            }

            const { record } = recordResult;
            const baseDirectoryError = IpcValidators.requiredString(
                record["baseDirectory"],
                "baseDirectory"
            );
            if (baseDirectoryError) {
                return toValidationResult(baseDirectoryError);
            }

            const baseDirectoryCandidate = record["baseDirectory"];
            if (typeof baseDirectoryCandidate !== "string") {
                // Defensive: requiredString already enforces this.
                return toValidationResult("baseDirectory must be a string");
            }

            const baseDirectoryRaw = baseDirectoryCandidate;
            const issues = validateFilesystemBaseDirectoryCandidate(
                baseDirectoryRaw,
                { maxBytes: MAX_FILESYSTEM_BASE_DIRECTORY_BYTES }
            );

            // Preserve the historical IPC error message wording + ordering.
            const errors: string[] = [];
            for (const issue of issues) {
                switch (issue.code) {
                    case "control-chars": {
                        errors.push(
                            "baseDirectory must not contain control characters"
                        );
                        break;
                    }
                    case "empty": {
                        errors.push("baseDirectory must not be empty");
                        break;
                    }
                    case "not-absolute": {
                        errors.push(
                            "baseDirectory must be an absolute path (e.g. C:/Backups or /home/user/backups)"
                        );
                        break;
                    }
                    case "not-string": {
                        errors.push("baseDirectory must be a string");
                        break;
                    }
                    case "null-byte": {
                        errors.push(
                            "baseDirectory must not contain a null byte"
                        );
                        break;
                    }
                    case "too-large": {
                        errors.push(
                            `baseDirectory must not exceed ${issue.maxBytes} bytes`
                        );
                        break;
                    }
                    case "whitespace": {
                        errors.push(
                            "baseDirectory must not have leading or trailing whitespace"
                        );
                        break;
                    }
                    case "windows-device-namespace": {
                        errors.push(
                            String.raw`baseDirectory must not use Windows device namespace paths (\\?\ or \\.\)`
                        );
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }

            return errors.length > 0 ? errors : null;
        },
    ]);

const validateCloudEnableSyncConfig: IpcParameterValidator =
    createParamValidator(1, [
        (config): ParameterValueValidationResult => {
            const recordResult = requireRecordParam(config, "config");
            if (isRequiredRecordError(recordResult)) {
                return recordResult.error;
            }

            const { record } = recordResult;
            const { enabled } = record;
            return typeof enabled === "boolean"
                ? null
                : toValidationResult("enabled must be a boolean");
        },
    ]);

const validateCloudBackupMigrationRequest: IpcParameterValidator =
    createParamValidator(1, [
        (config): ParameterValueValidationResult => {
            const errors: string[] = [];

            const recordResult = requireRecordParam(config, "config");
            if (isRequiredRecordError(recordResult)) {
                return recordResult.error;
            }

            const { record } = recordResult;

            const { deleteSource, limit, target } = record;
            if (typeof deleteSource !== "boolean") {
                errors.push("deleteSource must be a boolean");
            }

            if (target !== "plaintext" && target !== "encrypted") {
                errors.push("target must be 'plaintext' or 'encrypted'");
            }

            if (limit !== undefined) {
                const limitError = IpcValidators.requiredNumber(limit, "limit");
                if (limitError) {
                    errors.push(limitError);
                } else if (
                    typeof limit === "number" &&
                    (!Number.isInteger(limit) || limit <= 0)
                ) {
                    errors.push("limit must be a positive integer");
                }
            }

            return errors.length > 0 ? errors : null;
        },
    ]);

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

const validateEncryptionPassphrasePayload: IpcParameterValidator =
    createParamValidator(1, [
        (candidate): ParameterValueValidationResult => {
            const errors: string[] = [];

            const stringError = IpcValidators.requiredString(
                candidate,
                "passphrase"
            );
            if (stringError) {
                return toValidationResult(stringError);
            }

            if (typeof candidate !== "string") {
                // Defensive: requiredString already enforces this.
                return toValidationResult("passphrase must be a string");
            }

            const passphrase = candidate;
            if (
                getUtfByteLength(passphrase) > MAX_ENCRYPTION_PASSPHRASE_BYTES
            ) {
                errors.push(
                    `passphrase must not exceed ${MAX_ENCRYPTION_PASSPHRASE_BYTES} bytes`
                );
            }

            if (hasAsciiControlCharacters(passphrase)) {
                errors.push("passphrase must not contain control characters");
            }

            if (passphrase.trim().length < 8) {
                errors.push(
                    "passphrase must be at least 8 characters (after trimming)"
                );
            }

            return errors.length > 0 ? errors : null;
        },
    ]);

function createBackupKeyValidator(paramName: string): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult => {
            const error = IpcValidators.requiredString(value, paramName);
            if (error) {
                return toValidationResult(error);
            }

            if (typeof value !== "string") {
                // Defensive: requiredString already enforces this.
                return toValidationResult(`${paramName} must be a string`);
            }

            const key = normalizePathSeparatorsToPosix(value).trim();

            if (getUtfByteLength(key) > MAX_BACKUP_KEY_BYTES) {
                return toValidationResult(
                    `${paramName} must not exceed ${MAX_BACKUP_KEY_BYTES} bytes`
                );
            }

            // Reject ASCII control characters including NUL.
            if (hasAsciiControlCharacters(key)) {
                return toValidationResult(
                    `${paramName} must not contain control characters`
                );
            }

            if (!key.startsWith("backups/")) {
                return toValidationResult(
                    `${paramName} must start with 'backups/'`
                );
            }

            if (key === "backups/" || key.endsWith("/")) {
                return toValidationResult(
                    `${paramName} must reference a backup object key`
                );
            }

            // Defense-in-depth: provider keys are logical identifiers, not OS
            // paths or URLs. CloudService asserts the same invariants.
            if (
                key.startsWith("/") ||
                key.includes(":") ||
                key.includes("://")
            ) {
                return toValidationResult(
                    `${paramName} must be a relative provider key`
                );
            }

            const segments = key.split("/");
            if (segments.some((segment) => segment.length === 0)) {
                return toValidationResult(
                    `${paramName} must not contain empty path segments`
                );
            }

            if (
                segments.some((segment) => segment === "." || segment === "..")
            ) {
                return toValidationResult(
                    `${paramName} must not contain path traversal segments`
                );
            }

            if (key.endsWith(".metadata.json")) {
                return toValidationResult(
                    `${paramName} must reference the backup object, not metadata`
                );
            }

            return null;
        },
    ]);
}

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
    createBackupKeyValidator,
    createMonitorValidationPayloadValidator,
    createPreloadGuardReportValidator,
    createSiteIdentifierAndMonitorIdValidator,
    createSiteIdentifierValidator,
    validateCloudBackupMigrationRequest,
    validateCloudEnableSyncConfig,
    validateCloudFilesystemProviderConfig,
    validateEncryptionPassphrasePayload,
    validateImportDataPayload,
    validateNotificationPreferences,
    validateNotifyAppEvent,
    validateRestorePayload,
    validateSitePayload,
    validateSiteUpdatePayload,
};
