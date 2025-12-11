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
import { validateNotificationPreferenceUpdate } from "@shared/validation/notifications";

import type { IpcParameterValidator } from "./types";

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
}

type ParameterValueValidator = (value: unknown) => null | string;

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

/**
 * Helper function to create validators for single object parameters.
 *
 * @param paramName - Name of the parameter for error messages
 *
 * @returns A validator function that validates a single object parameter
 */
function createSingleObjectValidator(paramName: string): IpcParameterValidator {
    return createParamValidator(1, [
        (
            value
        ):
            | null
            | string => IpcValidators.requiredObject(value, paramName),
    ]);
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
    const bufferCandidate = record["buffer"];
    if (!(bufferCandidate instanceof ArrayBuffer)) {
        errors.push("payload.buffer must be an ArrayBuffer");
    }

    const fileNameValue = record["fileName"];
    if (fileNameValue !== undefined) {
        const fileNameError = IpcValidators.requiredString(
            fileNameValue,
            "fileName"
        );
        if (fileNameError) {
            errors.push(fileNameError);
        }
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

/**
 * Helper function to create validators for handlers expecting a single URL
 * parameter.
 *
 * @param paramName - Name of the parameter for error messages
 *
 * @returns A validator function that validates a single URL parameter
 */
function createSingleUrlValidator(paramName: string): IpcParameterValidator {
    return createParamValidator(1, [
        (
            value
        ):
            | null
            | string => IpcValidators.requiredUrl(value, paramName),
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
    addSite: createSingleObjectValidator("site"),

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
    updateSite: createStringObjectValidator("identifier", "updates"),
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
    importData: createSingleStringValidator("data"),

    /**
     * Validates parameters for the "restore-sqlite-backup" IPC handler.
     */
    restoreSqliteBackup: validateRestorePayload,
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
    openExternal: createSingleUrlValidator("url"),
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
} as const;
