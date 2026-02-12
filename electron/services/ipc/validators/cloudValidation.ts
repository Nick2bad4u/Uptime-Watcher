/**
 * Cloud-specific IPC parameter validators.
 *
 * @remarks
 * This module intentionally contains validators that are only used by the cloud
 * IPC handlers. These validators previously lived in
 * `electron/services/ipc/validators/shared.ts`, which was becoming a catch-all
 * and growing too large.
 */

import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import {
    MAX_FILESYSTEM_BASE_DIRECTORY_BYTES,
    validateFilesystemBaseDirectoryCandidate,
} from "@shared/validation/filesystemBaseDirectoryValidation";

import type { IpcParameterValidator } from "../types";
import type { ParameterValueValidationResult } from "./utils/parameterValidation";

import { IpcValidators } from "./IpcValidators";
import {
    createParamValidator,
    toValidationResult,
} from "./utils/parameterValidation";
import { requireRecordParamValue } from "./utils/recordValidation";
import {
    collectStringSafetyErrors,
    requireStringParamValue,
} from "./utils/stringValidation";

/** Maximum byte budget accepted for cloud backup object keys. */
const MAX_BACKUP_KEY_BYTES: number = 2048;

/** Maximum byte budget accepted for encryption passphrases. */
const MAX_ENCRYPTION_PASSPHRASE_BYTES: number = 1024;

export const validateCloudFilesystemProviderConfig: IpcParameterValidator =
    createParamValidator(1, [
        (config): ParameterValueValidationResult => {
            const recordResult = requireRecordParamValue(config, "config");
            if (recordResult.ok === false) {
                return recordResult.error;
            }

            const { record } = recordResult;
            const requiredString = requireStringParamValue(
                record["baseDirectory"],
                "baseDirectory"
            );
            if (requiredString.ok === false) {
                return requiredString.error;
            }

            const baseDirectoryRaw = requiredString.value;
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

export const validateCloudEnableSyncConfig: IpcParameterValidator =
    createParamValidator(1, [
        (config): ParameterValueValidationResult => {
            const recordResult = requireRecordParamValue(config, "config");
            if (recordResult.ok === false) {
                return recordResult.error;
            }

            const { record } = recordResult;
            const { enabled } = record;
            return typeof enabled === "boolean"
                ? null
                : toValidationResult("enabled must be a boolean");
        },
    ]);

export const validateCloudBackupMigrationRequest: IpcParameterValidator =
    createParamValidator(1, [
        (config): ParameterValueValidationResult => {
            const errors: string[] = [];

            const recordResult = requireRecordParamValue(config, "config");
            if (recordResult.ok === false) {
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

export const validateEncryptionPassphrasePayload: IpcParameterValidator =
    createParamValidator(1, [
        (candidate): ParameterValueValidationResult => {
            const errors: string[] = [];

            const requiredString = requireStringParamValue(
                candidate,
                "passphrase"
            );
            if (requiredString.ok === false) {
                return requiredString.error;
            }

            const passphrase = requiredString.value;
            errors.push(
                ...collectStringSafetyErrors(passphrase, {
                    forbidControlChars: {
                        message:
                            "passphrase must not contain control characters",
                    },
                    maxBytes: {
                        limit: MAX_ENCRYPTION_PASSPHRASE_BYTES,
                        message: `passphrase must not exceed ${MAX_ENCRYPTION_PASSPHRASE_BYTES} bytes`,
                    },
                })
            );

            if (passphrase.trim().length < 8) {
                errors.push(
                    "passphrase must be at least 8 characters (after trimming)"
                );
            }

            return errors.length > 0 ? errors : null;
        },
    ]);

/**
 * Creates an IPC validator for cloud backup object keys.
 *
 * @remarks
 * Backup keys are logical provider identifiers (e.g. `backups/<id>.json`) and
 * must never be treated as filesystem paths or URLs. This validator enforces
 * basic size limits and blocks common injection vectors (control characters,
 * traversal segments, URL-ish values).
 *
 * @param paramName - The IPC parameter name to validate.
 *
 * @returns An IPC parameter validator for a single string parameter.
 */
export function createBackupKeyValidator(
    paramName: string
): IpcParameterValidator {
    return createParamValidator(1, [
        (value): ParameterValueValidationResult => {
            const requiredString = requireStringParamValue(value, paramName);
            if (requiredString.ok === false) {
                return requiredString.error;
            }

            const key = normalizePathSeparatorsToPosix(
                requiredString.value
            ).trim();

            const safetyErrors = collectStringSafetyErrors(key, {
                forbidControlChars: {
                    message: `${paramName} must not contain control characters`,
                },
                maxBytes: {
                    limit: MAX_BACKUP_KEY_BYTES,
                    message: `${paramName} must not exceed ${MAX_BACKUP_KEY_BYTES} bytes`,
                },
            });
            const [firstSafetyError] = safetyErrors;
            if (firstSafetyError) {
                return toValidationResult(firstSafetyError);
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
