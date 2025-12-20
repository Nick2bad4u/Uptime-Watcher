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

import { isRecord } from "@shared/utils/typeHelpers";
import { isAllowedExternalOpenUrl } from "@shared/utils/urlSafety";
import {
    validateSiteSnapshot,
    validateSiteUpdate,
} from "@shared/validation/guards";
import {
    validateAppNotificationRequest,
    validateNotificationPreferenceUpdate,
} from "@shared/validation/notifications";

import type { IpcParameterValidator } from "./types";

import { DEFAULT_MAX_BACKUP_SIZE_BYTES } from "../database/utils/databaseBackup";
import {
    getUtfByteLength,
    MAX_DIAGNOSTICS_METADATA_BYTES,
    MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES,
} from "./diagnosticsLimits";
import { IpcValidators } from "./utils";

/**
 * Interface for data handler validators.
 */
interface DataHandlerValidatorsInterface {
    downloadSqliteBackup: IpcParameterValidator;
    exportData: IpcParameterValidator;
    importData: IpcParameterValidator;
    restoreSqliteBackup: IpcParameterValidator;
}

/**
 * Interface for cloud handler validators.
 */
interface CloudHandlerValidatorsInterface {
    clearEncryptionKey: IpcParameterValidator;
    configureFilesystemProvider: IpcParameterValidator;
    connectDropbox: IpcParameterValidator;
    connectGoogleDrive: IpcParameterValidator;
    deleteBackup: IpcParameterValidator;
    disconnect: IpcParameterValidator;
    enableSync: IpcParameterValidator;
    getStatus: IpcParameterValidator;
    listBackups: IpcParameterValidator;
    migrateBackups: IpcParameterValidator;
    previewResetRemoteSyncState: IpcParameterValidator;
    requestSyncNow: IpcParameterValidator;
    resetRemoteSyncState: IpcParameterValidator;
    restoreBackup: IpcParameterValidator;
    setEncryptionPassphrase: IpcParameterValidator;
    uploadLatestBackup: IpcParameterValidator;
}

/**
 * Interface for settings handler validators.
 */
interface SettingsHandlerValidatorsInterface {
    getHistoryLimit: IpcParameterValidator;
    resetSettings: IpcParameterValidator;
    updateHistoryLimit: IpcParameterValidator;
}

/**
 * Interface for monitoring handler validators.
 */
interface MonitoringHandlerValidatorsInterface {
    checkSiteNow: IpcParameterValidator;
    startMonitoring: IpcParameterValidator;
    startMonitoringForMonitor: IpcParameterValidator;
    startMonitoringForSite: IpcParameterValidator;
    stopMonitoring: IpcParameterValidator;
    stopMonitoringForMonitor: IpcParameterValidator;
    stopMonitoringForSite: IpcParameterValidator;
}

/**
 * Interface for monitor type handler validators.
 */
interface MonitorTypeHandlerValidatorsInterface {
    formatMonitorDetail: IpcParameterValidator;
    formatMonitorTitleSuffix: IpcParameterValidator;
    getMonitorTypes: IpcParameterValidator;
    validateMonitorData: IpcParameterValidator;
}

/**
 * Interface for notification handler validators.
 */
interface NotificationHandlerValidatorsInterface {
    notifyAppEvent: IpcParameterValidator;
    updatePreferences: IpcParameterValidator;
}

/**
 * Interface for site handler validators.
 */
interface SiteHandlerValidatorsInterface {
    addSite: IpcParameterValidator;
    deleteAllSites: IpcParameterValidator;
    getSites: IpcParameterValidator;
    removeMonitor: IpcParameterValidator;
    removeSite: IpcParameterValidator;
    updateSite: IpcParameterValidator;
}

/**
 * Interface for state sync handler validators.
 */
interface StateSyncHandlerValidatorsInterface {
    getSyncStatus: IpcParameterValidator;
    requestFullSync: IpcParameterValidator;
}

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

type ParameterValueValidator = (value: unknown) => null | string;

interface ZodIssueLike {
    readonly message: string;
    readonly path: ReadonlyArray<number | string | symbol>;
}

const formatZodIssues = (issues: readonly ZodIssueLike[]): string[] =>
    issues.map((issue) => {
        if (issue.path.length === 0) {
            return issue.message;
        }

        const path = issue.path.map(String).join(".");
        return `${path}: ${issue.message}`;
    });

/**
 * Maximum byte budget accepted for JSON import payloads transported over IPC.
 *
 * @remarks
 * JSON import/export is intended for portability and small-to-medium snapshots.
 * For very large datasets users should prefer SQLite backup/restore. We align
 * this limit with the SQLite backup size policy to avoid "works on one path but
 * not the other" surprises.
 */
const MAX_IMPORT_DATA_PAYLOAD_BYTES: number = DEFAULT_MAX_BACKUP_SIZE_BYTES;

/** Maximum byte budget accepted for cloud backup object keys. */
const MAX_BACKUP_KEY_BYTES: number = 2048;

/** Maximum byte budget accepted for encryption passphrases. */
const MAX_ENCRYPTION_PASSPHRASE_BYTES: number = 1024;

/** Maximum byte budget accepted for clipboard payloads transported over IPC. */
const MAX_CLIPBOARD_TEXT_BYTES: number = 5 * 1024 * 1024;

/** Maximum byte budget accepted for user-supplied restore filenames. */
const MAX_RESTORE_FILE_NAME_BYTES: number = 512;

/** Maximum byte budget accepted for filesystem provider base directories. */
const MAX_FILESYSTEM_BASE_DIRECTORY_BYTES: number = 4096;

function isAbsoluteFilesystemPath(value: string): boolean {
    // POSIX absolute paths
    if (value.startsWith("/")) {
        return true;
    }

    // UNC paths (\\server\share or //server/share)
    if (value.startsWith("\\\\") || value.startsWith("//")) {
        return true;
    }

    // Windows drive paths (C:\ or C:/)
    if (value.length >= 3) {
        const [firstChar, secondChar, thirdChar] = value;
        if (secondChar !== ":" || firstChar === undefined) {
            return false;
        }

        const codePoint = firstChar.codePointAt(0);
        const isAsciiLetter =
            codePoint !== undefined &&
            ((codePoint >= 65 && codePoint <= 90) ||
                (codePoint >= 97 && codePoint <= 122));

        if (!isAsciiLetter) {
            return false;
        }

        return thirdChar === "\\" || thirdChar === "/";
    }

    return false;
}

function isWindowsDeviceNamespacePath(value: string): boolean {
    // Treat forward slashes as backslashes for this check.
    const normalized = value.replaceAll("/", "\\");
    return normalized.startsWith("\\\\?\\") || normalized.startsWith("\\\\.\\");
}

function hasAsciiControlCharacters(value: string): boolean {
    for (const char of value) {
        const codePoint = char.codePointAt(0);
        if (
            codePoint !== undefined &&
            (codePoint < 0x20 || codePoint === 0x7f)
        ) {
            return true;
        }
    }

    return false;
}

function createParamValidator(
    expectedCount: number,
    validators: readonly ParameterValueValidator[] = []
): IpcParameterValidator {
    let countMessage = "No parameters expected";

    if (expectedCount !== 0) {
        const suffix = expectedCount === 1 ? "" : "s";
        countMessage = `Expected exactly ${expectedCount} parameter${suffix}`;
    }

    return (params: readonly unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== expectedCount) {
            errors.push(countMessage);
        }

        validators.forEach((validate, index) => {
            const error = validate(params[index]);
            if (error) {
                errors.push(error);
            }
        });

        return errors.length > 0 ? errors : null;
    };
}

function createNoParamsValidator(): IpcParameterValidator {
    return createParamValidator(0);
}

function validateSitePayload(params: readonly unknown[]): null | string[] {
    if (params.length !== 1) {
        return ["Expected exactly 1 parameter"];
    }

    const [siteCandidate] = params;
    const result = validateSiteSnapshot(siteCandidate);
    if (result.success) {
        return null;
    }

    return formatZodIssues(result.error.issues);
}

function validateSiteUpdatePayload(params: readonly unknown[]): null | string[] {
    const errors: string[] = [];

    const [identifierCandidate, updatesCandidate] = params;

    if (params.length !== 2) {
        errors.push("Expected exactly 2 parameters");
    }

    const identifierError = IpcValidators.requiredString(
        identifierCandidate,
        "identifier"
    );
    if (identifierError) {
        errors.push(identifierError);
    }

    const objectError = IpcValidators.requiredObject(
        updatesCandidate,
        "updates"
    );
    if (objectError) {
        errors.push(objectError);
        return errors;
    }

    if (isRecord(updatesCandidate) && Object.keys(updatesCandidate).length === 0) {
        errors.push("updates must not be empty");
    }

    const validationResult = validateSiteUpdate(updatesCandidate);
    if (!validationResult.success) {
        errors.push(...formatZodIssues(validationResult.error.issues));
    }

    return errors.length > 0 ? errors : null;
}

/**
 * Helper function to create validators for single number parameters.
 *
 * @param paramName - Name of the parameter for error messages
 *
 * @returns A validator function that validates a single number parameter
 */
function createSingleNumberValidator(paramName: string): IpcParameterValidator {
    return createParamValidator(1, [
        (
            value
        ):
            | null
            | string => IpcValidators.requiredNumber(value, paramName),
    ]);
}

function validateCloudFilesystemProviderConfig(
    params: readonly unknown[]
): null | string[] {
    const errors: string[] = [];

    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }

    const [config] = params;
    const objectError = IpcValidators.requiredObject(config, "config");
    if (objectError) {
        errors.push(objectError);
        return errors;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- config validated as object
    const record = config as Record<string, unknown>;
    const baseDirectoryError = IpcValidators.requiredString(
        record["baseDirectory"],
        "baseDirectory"
    );
    if (baseDirectoryError) {
        errors.push(baseDirectoryError);
        return errors;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated as string above
    const baseDirectoryRaw = record["baseDirectory"] as string;
    const baseDirectory = baseDirectoryRaw.trim();
    if (baseDirectory.length === 0) {
        errors.push("baseDirectory must not be empty");
        return errors;
    }

    if (
        getUtfByteLength(baseDirectoryRaw) >
        MAX_FILESYSTEM_BASE_DIRECTORY_BYTES
    ) {
        errors.push(
            `baseDirectory must not exceed ${MAX_FILESYSTEM_BASE_DIRECTORY_BYTES} bytes`
        );
    }

    if (hasAsciiControlCharacters(baseDirectoryRaw)) {
        errors.push("baseDirectory must not contain control characters");
    }

    if (isWindowsDeviceNamespacePath(baseDirectoryRaw)) {
        errors.push(
            String.raw`baseDirectory must not use Windows device namespace paths (\\?\ or \\.\)`
        );
    }

    if (!isAbsoluteFilesystemPath(baseDirectory)) {
        errors.push(
            "baseDirectory must be an absolute path (e.g. C:/Backups or /home/user/backups)"
        );
    }

    return errors.length > 0 ? errors : null;
}

function validateCloudEnableSyncConfig(
    params: readonly unknown[]
): null | string[] {
    const errors: string[] = [];

    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }

    const [config] = params;
    const objectError = IpcValidators.requiredObject(config, "config");
    if (objectError) {
        errors.push(objectError);
        return errors;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- config validated as object
    const record = config as Record<string, unknown>;
    const { enabled } = record;
    if (typeof enabled !== "boolean") {
        errors.push("enabled must be a boolean");
    }

    return errors.length > 0 ? errors : null;
}

function validateCloudBackupMigrationRequest(
    params: readonly unknown[]
): null | string[] {
    const errors: string[] = [];

    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }

    const [config] = params;
    const objectError = IpcValidators.requiredObject(config, "config");
    if (objectError) {
        errors.push(objectError);
        return errors;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- config validated as object
    const record = config as Record<string, unknown>;

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
}

function validatePreloadGuardReport(
    params: readonly unknown[]
): null | string[] {
    const errors: string[] = [];

    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }

    const [report] = params;
    const objectError = IpcValidators.requiredObject(report, "guardReport");

    if (objectError) {
        errors.push(objectError);
        return errors.length > 0 ? errors : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guardReport validated as object
    const record = report as Record<string, unknown>;

    const channelError = IpcValidators.requiredString(
        record["channel"],
        "channel"
    );
    if (channelError) {
        errors.push(channelError);
    }

    const guardError = IpcValidators.requiredString(record["guard"], "guard");
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
        const metadataError = IpcValidators.requiredObject(
            metadataValue,
            "metadata"
        );
        if (metadataError) {
            errors.push(metadataError);
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
}

function createPreloadGuardReportValidator(): IpcParameterValidator {
    return validatePreloadGuardReport;
}

function validateNotificationPreferences(
    params: readonly unknown[]
): null | string[] {
    if (params.length !== 1) {
        return ["Expected exactly 1 parameter"];
    }

    const [preferences] = params;
    const objectError = IpcValidators.requiredObject(
        preferences,
        "preferences"
    );

    if (objectError) {
        return [objectError];
    }

    if (!isRecord(preferences)) {
        return ["Notification preferences payload must be an object"];
    }

    const validationResult = validateNotificationPreferenceUpdate(preferences);
    if (validationResult.success) {
        return null;
    }

    return validationResult.error.issues.map((issue) => issue.message);
}

function validateNotifyAppEvent(params: readonly unknown[]): null | string[] {
    if (params.length !== 1) {
        return ["Expected exactly 1 parameter"];
    }

    const [request] = params;
    const objectError = IpcValidators.requiredObject(request, "request");
    if (objectError) {
        return [objectError];
    }

    const validationResult = validateAppNotificationRequest(request);
    if (validationResult.success) {
        return null;
    }

    return validationResult.error.issues.map((issue) => issue.message);
}

function validateRestoreBufferCandidate(candidate: unknown): string[] {
    if (!(candidate instanceof ArrayBuffer)) {
        return ["payload.buffer must be an ArrayBuffer"];
    }

    if (candidate.byteLength === 0) {
        return ["payload.buffer must not be empty"];
    }

    if (candidate.byteLength > DEFAULT_MAX_BACKUP_SIZE_BYTES) {
        return [
            `payload.buffer exceeds maximum allowed ${DEFAULT_MAX_BACKUP_SIZE_BYTES} bytes`,
        ];
    }

    return [];
}

function validateRestoreFileNameCandidate(candidate: unknown): string[] {
    const requiredError = IpcValidators.requiredString(candidate, "fileName");
    if (requiredError) {
        return [requiredError];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated as non-empty string above
    const fileName = (candidate as string).trim();
    if (fileName.length === 0) {
        return ["fileName must not be blank"];
    }

    const errors: string[] = [];

    if (getUtfByteLength(fileName) > MAX_RESTORE_FILE_NAME_BYTES) {
        errors.push(`fileName must not exceed ${MAX_RESTORE_FILE_NAME_BYTES} bytes`);
    }

    if (hasAsciiControlCharacters(fileName)) {
        errors.push("fileName must not contain control characters");
    }

    if (fileName === "." || fileName === "..") {
        errors.push("fileName must be a valid file name");
    }

    // `fileName` is intended for UI/logging only; it should be a base name, not
    // a path.
    if (fileName.includes("/") || fileName.includes("\\")) {
        errors.push("fileName must not contain path separators");
    }

    return errors;
}

function validateRestorePayload(params: readonly unknown[]): null | string[] {
    const errors: string[] = [];

    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }

    const [payload] = params;
    const objectError = IpcValidators.requiredObject(payload, "payload");
    if (objectError) {
        errors.push(objectError);
        return errors.length > 0 ? errors : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- payload validated as object above
    const record = payload as Record<string, unknown>;
    errors.push(...validateRestoreBufferCandidate(record["buffer"]));

    const fileNameValue = record["fileName"];
    if (fileNameValue !== undefined) {
        errors.push(...validateRestoreFileNameCandidate(fileNameValue));
    }

    return errors.length > 0 ? errors : null;
}

function validateImportDataPayload(params: readonly unknown[]): null | string[] {
    const errors: string[] = [];

    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }

    const [candidate] = params;
    const stringError = IpcValidators.requiredString(candidate, "data");
    if (stringError) {
        errors.push(stringError);
        return errors;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated as string above
    const data = candidate as string;
    if (getUtfByteLength(data) > MAX_IMPORT_DATA_PAYLOAD_BYTES) {
        errors.push(
            `data exceeds ${MAX_IMPORT_DATA_PAYLOAD_BYTES} bytes; use SQLite backup/restore for large snapshots`
        );
    }

    return errors.length > 0 ? errors : null;
}

function validateEncryptionPassphrasePayload(
    params: readonly unknown[]
): null | string[] {
    const errors: string[] = [];

    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }

    const [candidate] = params;
    const stringError = IpcValidators.requiredString(candidate, "passphrase");
    if (stringError) {
        errors.push(stringError);
        return errors;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated as string above
    const passphrase = candidate as string;
    if (getUtfByteLength(passphrase) > MAX_ENCRYPTION_PASSPHRASE_BYTES) {
        errors.push(
            `passphrase must not exceed ${MAX_ENCRYPTION_PASSPHRASE_BYTES} bytes`
        );
    }

    return errors.length > 0 ? errors : null;
}

/**
 * Helper function to create validators for handlers expecting a single string
 * parameter.
 *
 * @param paramName - Name of the parameter for error messages
 *
 * @returns A validator function that validates a single string parameter
 */
function createSingleStringValidator(paramName: string): IpcParameterValidator {
    return createParamValidator(1, [
        (
            value
        ):
            | null
            | string => IpcValidators.requiredString(value, paramName),
    ]);
}

function createClipboardTextValidator(): IpcParameterValidator {
    return createParamValidator(1, [
        (value): null | string => {
            const error = IpcValidators.requiredString(value, "text");
            if (error) {
                return error;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated above
            const text = value as string;
            if (getUtfByteLength(text) > MAX_CLIPBOARD_TEXT_BYTES) {
                return `text must not exceed ${MAX_CLIPBOARD_TEXT_BYTES} bytes`;
            }

            return null;
        },
    ]);
}

function createBackupKeyValidator(paramName: string): IpcParameterValidator {
    return createParamValidator(1, [
        (value): null | string => {
            const error = IpcValidators.requiredString(value, paramName);
            if (error) {
                return error;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated above
            const key = (value as string).replaceAll("\\", "/").trim();

            if (getUtfByteLength(key) > MAX_BACKUP_KEY_BYTES) {
                return `${paramName} must not exceed ${MAX_BACKUP_KEY_BYTES} bytes`;
            }

            // Reject ASCII control characters including NUL.
            if (hasAsciiControlCharacters(key)) {
                return `${paramName} must not contain control characters`;
            }

            if (!key.startsWith("backups/")) {
                return `${paramName} must start with 'backups/'`;
            }

            if (key === "backups/" || key.endsWith("/")) {
                return `${paramName} must reference a backup object key`;
            }

            // Defense-in-depth: provider keys are logical identifiers, not OS
            // paths or URLs. CloudService asserts the same invariants.
            if (key.startsWith("/") || key.includes(":") || key.includes("://")) {
                return `${paramName} must be a relative provider key`;
            }

            const segments = key.split("/");
            if (segments.some((segment) => segment.length === 0)) {
                return `${paramName} must not contain empty path segments`;
            }

            if (
                segments.some(
                    (segment) => segment === "." || segment === ".."
                )
            ) {
                return `${paramName} must not contain path traversal segments`;
            }

            if (key.endsWith(".metadata.json")) {
                return `${paramName} must reference the backup object, not metadata`;
            }

            return null;
        },
    ]);
}

function createSingleExternalOpenUrlValidator(paramName: string): IpcParameterValidator {
    return createParamValidator(1, [
        (value): null | string => {
            const error = IpcValidators.requiredUrl(value, paramName);
            if (error !== null) {
                return error;
            }

            if (typeof value !== "string") {
                return `${paramName} must be a string`;
            }

            return isAllowedExternalOpenUrl(value)
                ? null
                : `${paramName} must be an http(s) or mailto URL`;
        },
    ]);
}

/**
 * Helper function to create validators for string and object parameter pairs.
 *
 * @param stringParamName - Name of the string parameter for error messages
 * @param objectParamName - Name of the object parameter for error messages
 *
 * @returns A validator function that validates string and object parameters
 */
function createStringObjectValidator(
    stringParamName: string,
    objectParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (
            value
        ):
            | null
            | string => IpcValidators.requiredString(value, stringParamName),
        (
            value
        ):
            | null
            | string => IpcValidators.requiredObject(value, objectParamName),
    ]);
}

/**
 * Helper function to create validators for handlers with validated first
 * parameter and unvalidated second.
 *
 * @param firstParamName - Name of the required first parameter
 *
 * @returns A validator function that validates first parameter only
 */
function createStringWithUnvalidatedSecondValidator(
    firstParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (
            value
        ):
            | null
            | string => IpcValidators.requiredString(value, firstParamName),
        (): null => null,
    ]);
}

/**
 * Helper function to create validators for handlers expecting two string
 * parameters.
 *
 * @param firstParamName - Name of the first parameter for error messages
 * @param secondParamName - Name of the second parameter for error messages
 *
 * @returns A validator function that validates two string parameters
 */
function createTwoStringValidator(
    firstParamName: string,
    secondParamName: string
): IpcParameterValidator {
    return createParamValidator(2, [
        (
            value
        ):
            | null
            | string => IpcValidators.requiredString(value, firstParamName),
        (
            value
        ):
            | null
            | string => IpcValidators.requiredString(value, secondParamName),
    ]);
}

/**
 * Parameter validators for site management IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific site-related IPC channel.
 * Validators ensure correct parameter count and types for each handler.
 *
 * @public
 */
export const SiteHandlerValidators: SiteHandlerValidatorsInterface = {
    /**
     * Validates parameters for the "add-site" IPC handler.
     *
     * @remarks
     * Expects a single parameter: a site object.
     */
    addSite: validateSitePayload,

    /**
     * Validates parameters for the "delete-all-sites" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    deleteAllSites: createNoParamsValidator(),

    /**
     * Validates parameters for the "get-sites" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    getSites: createNoParamsValidator(),

    /**
     * Validates parameters for the "remove-monitor" IPC handler.
     *
     * @remarks
     * Expects two parameters: site identifier and monitor ID (both strings).
     */
    removeMonitor: createTwoStringValidator("siteIdentifier", "monitorId"),

    /**
     * Validates parameters for the "remove-site" IPC handler.
     *
     * @remarks
     * Expects a single parameter: the site identifier (string).
     */
    removeSite: createSingleStringValidator("identifier"),

    /**
     * Validates parameters for the "update-site" IPC handler.
     *
     * @remarks
     * Expects two parameters: site identifier (string) and updates (object).
     */
    updateSite: validateSiteUpdatePayload,
} as const;

/**
 * Parameter validators for monitoring control IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific monitoring-related IPC channel.
 *
 * @public
 */
export const MonitoringHandlerValidators: MonitoringHandlerValidatorsInterface =
    {
        /**
         * Validates parameters for the "check-site-now" IPC handler.
         *
         * @remarks
         * Expects two parameters: site identifier and monitor ID (both
         * strings).
         */
        checkSiteNow: createTwoStringValidator("identifier", "monitorId"),

        /**
         * Validates parameters for the "start-monitoring" IPC handler.
         *
         * @remarks
         * Expects no parameters.
         */
        startMonitoring: createNoParamsValidator(),

        /**
         * Validates parameters for the "start-monitoring-for-monitor" IPC
         * handler.
         *
         * @remarks
         * Expects two parameters: site identifier (string) and monitor ID
         * (string).
         */
        startMonitoringForMonitor: createTwoStringValidator(
            "identifier",
            "monitorId"
        ),

        /**
         * Validates parameters for the "start-monitoring-for-site" IPC handler.
         *
         * @remarks
         * Expects one parameter: site identifier (string).
         */
        startMonitoringForSite: createSingleStringValidator("identifier"),

        /**
         * Validates parameters for the "stop-monitoring" IPC handler.
         *
         * @remarks
         * Expects no parameters.
         */
        stopMonitoring: createNoParamsValidator(),

        /**
         * Validates parameters for the "stop-monitoring-for-monitor" IPC
         * handler.
         *
         * @remarks
         * Expects two parameters: site identifier (string) and monitor ID
         * (string).
         */
        stopMonitoringForMonitor: createTwoStringValidator(
            "identifier",
            "monitorId"
        ),

        /**
         * Validates parameters for the "stop-monitoring-for-site" IPC handler.
         *
         * @remarks
         * Expects one parameter: site identifier (string).
         */
        stopMonitoringForSite: createSingleStringValidator("identifier"),
    } as const;

/**
 * Parameter validators for data management IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific data-related IPC channel.
 *
 * @public
 */
export const DataHandlerValidators: DataHandlerValidatorsInterface = {
    /**
     * Validates parameters for the "download-sqlite-backup" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    downloadSqliteBackup: createNoParamsValidator(),

    /**
     * Validates parameters for the "export-data" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    exportData: createNoParamsValidator(),

    /**
     * Validates parameters for the "import-data" IPC handler.
     *
     * @remarks
     * Expects a single parameter: the data string.
     */
    importData: validateImportDataPayload,

    /**
     * Validates parameters for the "restore-sqlite-backup" IPC handler.
     */
    restoreSqliteBackup: validateRestorePayload,
} as const;

/**
 * Parameter validators for cloud IPC handlers.
 */
export const CloudHandlerValidators: CloudHandlerValidatorsInterface = {
    clearEncryptionKey: createNoParamsValidator(),
    configureFilesystemProvider: validateCloudFilesystemProviderConfig,
    connectDropbox: createNoParamsValidator(),
    connectGoogleDrive: createNoParamsValidator(),
    deleteBackup: createBackupKeyValidator("key"),
    disconnect: createNoParamsValidator(),
    enableSync: validateCloudEnableSyncConfig,
    getStatus: createNoParamsValidator(),
    listBackups: createNoParamsValidator(),
    migrateBackups: validateCloudBackupMigrationRequest,
    previewResetRemoteSyncState: createNoParamsValidator(),
    requestSyncNow: createNoParamsValidator(),
    resetRemoteSyncState: createNoParamsValidator(),
    restoreBackup: createBackupKeyValidator("key"),
    setEncryptionPassphrase: validateEncryptionPassphrasePayload,
    uploadLatestBackup: createNoParamsValidator(),
} as const;

/**
 * Parameter validators for settings IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific settings-related IPC channel.
 *
 * @public
 */
export const SettingsHandlerValidators: SettingsHandlerValidatorsInterface = {
    /**
     * Validates parameters for the "get-history-limit" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    getHistoryLimit: createNoParamsValidator(),

    /**
     * Validates parameters for the "reset-settings" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    resetSettings: createNoParamsValidator(),

    /**
     * Validates parameters for the "update-history-limit" IPC handler.
     *
     * @remarks
     * Expects a single parameter: the new history limit (number).
     */
    updateHistoryLimit: createSingleNumberValidator("limit"),
} as const;

/**
 * Parameter validators for monitor type IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific monitor type-related IPC channel.
 *
 * @public
 */
export const MonitorTypeHandlerValidators: MonitorTypeHandlerValidatorsInterface =
    {
        /**
         * Validates parameters for the "format-monitor-detail" IPC handler.
         *
         * @remarks
         * Expects two parameters: monitor type (string) and details (string).
         */
        formatMonitorDetail: createTwoStringValidator("monitorType", "details"),

        /**
         * Validates parameters for the "format-monitor-title-suffix" IPC
         * handler.
         *
         * @remarks
         * Expects two parameters: monitor type (string) and monitor object.
         */
        formatMonitorTitleSuffix: createStringObjectValidator(
            "monitorType",
            "monitor"
        ),

        /**
         * Validates parameters for the "get-monitor-types" IPC handler.
         *
         * @remarks
         * Expects no parameters.
         */
        getMonitorTypes: createNoParamsValidator(),

        /**
         * Validates parameters for the "validate-monitor-data" IPC handler.
         *
         * @remarks
         * Expects two parameters: monitor type (string) and data (any). Only
         * the monitor type is validated for type.
         */
        validateMonitorData:
            createStringWithUnvalidatedSecondValidator("monitorType"),
    } as const;

/**
 * Parameter validators for notification preference IPC handlers.
 *
 * @remarks
 * Ensures the renderer supplies a well-formed preference payload.
 *
 * @public
 */
export const NotificationHandlerValidators: NotificationHandlerValidatorsInterface =
    {
        notifyAppEvent: validateNotifyAppEvent,
        updatePreferences: validateNotificationPreferences,
    } as const;

/**
 * Parameter validators for state synchronization IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific state sync-related IPC channel.
 *
 * @public
 */
export const StateSyncHandlerValidators: StateSyncHandlerValidatorsInterface = {
    /**
     * Validates parameters for the "get-sync-status" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    getSyncStatus: createNoParamsValidator(),

    /**
     * Validates parameters for the "request-full-sync" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    requestFullSync: createNoParamsValidator(),
} as const;

/**
 * System handler validators.
 *
 * @remarks
 * Provides parameter validation for system operations. Each property is a
 * validator for a specific system-related IPC channel.
 *
 * @public
 */
export const SystemHandlerValidators: SystemHandlerValidatorsInterface = {
    /**
     * Validates parameters for the "open-external" IPC handler.
     *
     * @remarks
     * Expects exactly one http(s) URL parameter (the destination to open).
     */
    openExternal: createSingleExternalOpenUrlValidator("url"),
    /**
     * Validates parameters for the "quit-and-install" IPC handler.
     *
     * @remarks
     * Expects no parameters; handler simply triggers the updater.
     */
    quitAndInstall: createNoParamsValidator(),
    reportPreloadGuard: createPreloadGuardReportValidator(),
    /**
     * Validates parameters for the diagnostics handler verification channel.
     *
     * @remarks
     * Expects the target channel name as a single non-empty string.
     */
    verifyIpcHandler: createSingleStringValidator("channelName"),
    writeClipboardText: createClipboardTextValidator(),
} as const;
