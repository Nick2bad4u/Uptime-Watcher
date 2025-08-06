/**
 * Parameter validators for specific IPC handler groups.
 *
 * @remarks
 * Provides type-safe validation for different categories of IPC operations.
 * Each validator returns `null` if parameters are valid, or an array of error messages if invalid.
 * All validators conform to the {@link IpcParameterValidator} interface.
 *
 * @see {@link IpcParameterValidator}
 * @public
 */

import type { IpcParameterValidator } from "./types";

import { IpcValidators } from "./utils";

/**
 * Interface for data handler validators.
 */
interface DataHandlerValidatorsInterface {
    downloadSqliteBackup: IpcParameterValidator;
    exportData: IpcParameterValidator;
    getHistoryLimit: IpcParameterValidator;
    importData: IpcParameterValidator;
    resetSettings: IpcParameterValidator;
    updateHistoryLimit: IpcParameterValidator;
}

/**
 * Interface for monitoring handler validators.
 */
interface MonitoringHandlerValidatorsInterface {
    checkSiteNow: IpcParameterValidator;
    startMonitoring: IpcParameterValidator;
    startMonitoringForSite: IpcParameterValidator;
    stopMonitoring: IpcParameterValidator;
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
 * Interface for site handler validators.
 */
interface SiteHandlerValidatorsInterface {
    addSite: IpcParameterValidator;
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
 * Helper function to create validators for handlers expecting no parameters.
 *
 * @returns A validator function that ensures no parameters are passed
 */
function createNoParamsValidator(): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    };
}

/**
 * Helper function to create validators for handlers with optional second string parameter.
 *
 * @param firstParamName - Name of the required first parameter
 * @param secondParamName - Name of the optional second parameter
 * @returns A validator function that validates 1-2 string parameters
 */
function createOptionalSecondStringValidator(firstParamName: string, secondParamName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length === 0 || params.length > 2) {
            errors.push("Expected 1 or 2 parameters");
        }

        if (params.length > 0) {
            const firstError = IpcValidators.requiredString(params[0], firstParamName);
            if (firstError) {
                errors.push(firstError);
            }
        }

        if (params.length === 2) {
            const secondError = IpcValidators.optionalString(params[1], secondParamName);
            if (secondError) {
                errors.push(secondError);
            }
        }

        return errors.length > 0 ? errors : null;
    };
}

/**
 * Helper function to create validators for single number parameters.
 *
 * @param paramName - Name of the parameter for error messages
 * @returns A validator function that validates a single number parameter
 */
function createSingleNumberValidator(paramName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 1) {
            errors.push("Expected exactly 1 parameter");
        }

        const error = IpcValidators.requiredNumber(params[0], paramName);
        if (error) {
            errors.push(error);
        }

        return errors.length > 0 ? errors : null;
    };
}

/**
 * Helper function to create validators for single object parameters.
 *
 * @param paramName - Name of the parameter for error messages
 * @returns A validator function that validates a single object parameter
 */
function createSingleObjectValidator(paramName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 1) {
            errors.push("Expected exactly 1 parameter");
        }

        const error = IpcValidators.requiredObject(params[0], paramName);
        if (error) {
            errors.push(error);
        }

        return errors.length > 0 ? errors : null;
    };
}

/**
 * Helper function to create validators for handlers expecting a single string parameter.
 *
 * @param paramName - Name of the parameter for error messages
 * @returns A validator function that validates a single string parameter
 */
function createSingleStringValidator(paramName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 1) {
            errors.push("Expected exactly 1 parameter");
        }

        const error = IpcValidators.requiredString(params[0], paramName);
        if (error) {
            errors.push(error);
        }

        return errors.length > 0 ? errors : null;
    };
}

/**
 * Helper function to create validators for string and object parameter pairs.
 *
 * @param stringParamName - Name of the string parameter for error messages
 * @param objectParamName - Name of the object parameter for error messages
 * @returns A validator function that validates string and object parameters
 */
function createStringObjectValidator(stringParamName: string, objectParamName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const stringError = IpcValidators.requiredString(params[0], stringParamName);
        if (stringError) {
            errors.push(stringError);
        }

        const objectError = IpcValidators.requiredObject(params[1], objectParamName);
        if (objectError) {
            errors.push(objectError);
        }

        return errors.length > 0 ? errors : null;
    };
}

/**
 * Helper function to create validators for handlers with validated first parameter and unvalidated second.
 *
 * @param firstParamName - Name of the required first parameter
 * @returns A validator function that validates first parameter only
 */
function createStringWithUnvalidatedSecondValidator(firstParamName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const firstError = IpcValidators.requiredString(params[0], firstParamName);
        if (firstError) {
            errors.push(firstError);
        }

        // Second parameter intentionally not validated (can be any type)

        return errors.length > 0 ? errors : null;
    };
}

/**
 * Helper function to create validators for handlers expecting two string parameters.
 *
 * @param firstParamName - Name of the first parameter for error messages
 * @param secondParamName - Name of the second parameter for error messages
 * @returns A validator function that validates two string parameters
 */
function createTwoStringValidator(firstParamName: string, secondParamName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const firstError = IpcValidators.requiredString(params[0], firstParamName);
        if (firstError) {
            errors.push(firstError);
        }

        const secondError = IpcValidators.requiredString(params[1], secondParamName);
        if (secondError) {
            errors.push(secondError);
        }

        return errors.length > 0 ? errors : null;
    };
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
export const MonitoringHandlerValidators: MonitoringHandlerValidatorsInterface = {
    /**
     * Validates parameters for the "check-site-now" IPC handler.
     *
     * @remarks
     * Expects two parameters: site identifier and monitor ID (both strings).
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
     * Validates parameters for the "start-monitoring-for-site" IPC handler.
     *
     * @remarks
     * Expects one or two parameters: site identifier (string), and optional monitor ID (string).
     */
    startMonitoringForSite: createOptionalSecondStringValidator("identifier", "monitorId"),

    /**
     * Validates parameters for the "stop-monitoring" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    stopMonitoring: createNoParamsValidator(),

    /**
     * Validates parameters for the "stop-monitoring-for-site" IPC handler.
     *
     * @remarks
     * Expects one or two parameters: site identifier (string), and optional monitor ID (string).
     */
    stopMonitoringForSite: createOptionalSecondStringValidator("identifier", "monitorId"),
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
     * Validates parameters for the "get-history-limit" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     */
    getHistoryLimit: createNoParamsValidator(),

    /**
     * Validates parameters for the "import-data" IPC handler.
     *
     * @remarks
     * Expects a single parameter: the data string.
     */
    importData: createSingleStringValidator("data"),

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
export const MonitorTypeHandlerValidators: MonitorTypeHandlerValidatorsInterface = {
    /**
     * Validates parameters for the "format-monitor-detail" IPC handler.
     *
     * @remarks
     * Expects two parameters: monitor type (string) and details (string).
     */
    formatMonitorDetail: createTwoStringValidator("monitorType", "details"),

    /**
     * Validates parameters for the "format-monitor-title-suffix" IPC handler.
     *
     * @remarks
     * Expects two parameters: monitor type (string) and monitor object.
     */
    formatMonitorTitleSuffix: createStringObjectValidator("monitorType", "monitor"),

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
     * Expects two parameters: monitor type (string) and data (any).
     * Only the monitor type is validated for type.
     */
    validateMonitorData: createStringWithUnvalidatedSecondValidator("monitorType"),
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
