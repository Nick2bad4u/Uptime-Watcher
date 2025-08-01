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
export const SiteHandlerValidators = {
    /**
     * Validates parameters for the "add-site" IPC handler.
     *
     * @remarks
     * Expects a single parameter: a site object.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    addSite: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 1) {
            errors.push("Expected exactly 1 parameter");
        }

        const siteError = IpcValidators.requiredObject(params[0], "site");
        if (siteError) {
            errors.push(siteError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

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
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    updateSite: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const identifierError = IpcValidators.requiredString(params[0], "identifier");
        if (identifierError) {
            errors.push(identifierError);
        }

        const updatesError = IpcValidators.requiredObject(params[1], "updates");
        if (updatesError) {
            errors.push(updatesError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,
} as const;

/**
 * Parameter validators for monitoring control IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific monitoring-related IPC channel.
 *
 * @public
 */
export const MonitoringHandlerValidators = {
    /**
     * Validates parameters for the "check-site-now" IPC handler.
     *
     * @remarks
     * Expects two parameters: site identifier and monitor ID (both strings).
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    checkSiteNow: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const identifierError = IpcValidators.requiredString(params[0], "identifier");
        if (identifierError) {
            errors.push(identifierError);
        }

        const monitorIdError = IpcValidators.requiredString(params[1], "monitorId");
        if (monitorIdError) {
            errors.push(monitorIdError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "start-monitoring" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    startMonitoring: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "start-monitoring-for-site" IPC handler.
     *
     * @remarks
     * Expects one or two parameters: site identifier (string), and optional monitor ID (string).
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    startMonitoringForSite: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length === 0 || params.length > 2) {
            errors.push("Expected 1 or 2 parameters");
        }

        const identifierError = IpcValidators.requiredString(params[0], "identifier");
        if (identifierError) {
            errors.push(identifierError);
        }

        if (params.length === 2) {
            const monitorIdError = IpcValidators.optionalString(params[1], "monitorId");
            if (monitorIdError) {
                errors.push(monitorIdError);
            }
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

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
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    stopMonitoringForSite: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length === 0 || params.length > 2) {
            errors.push("Expected 1 or 2 parameters");
        }

        const identifierError = IpcValidators.requiredString(params[0], "identifier");
        if (identifierError) {
            errors.push(identifierError);
        }

        if (params.length === 2) {
            const monitorIdError = IpcValidators.optionalString(params[1], "monitorId");
            if (monitorIdError) {
                errors.push(monitorIdError);
            }
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,
} as const;

/**
 * Parameter validators for data management IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific data-related IPC channel.
 *
 * @public
 */
export const DataHandlerValidators = {
    /**
     * Validates parameters for the "download-sqlite-backup" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    downloadSqliteBackup: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "export-data" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    exportData: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "get-history-limit" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    getHistoryLimit: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "import-data" IPC handler.
     *
     * @remarks
     * Expects a single parameter: the data string.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    importData: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 1) {
            errors.push("Expected exactly 1 parameter");
        }

        const dataError = IpcValidators.requiredString(params[0], "data");
        if (dataError) {
            errors.push(dataError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "reset-settings" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    resetSettings: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "update-history-limit" IPC handler.
     *
     * @remarks
     * Expects a single parameter: the new history limit (number).
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    updateHistoryLimit: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 1) {
            errors.push("Expected exactly 1 parameter");
        }

        const limitError = IpcValidators.requiredNumber(params[0], "limit");
        if (limitError) {
            errors.push(limitError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,
} as const;

/**
 * Parameter validators for monitor type IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific monitor type-related IPC channel.
 *
 * @public
 */
export const MonitorTypeHandlerValidators = {
    /**
     * Validates parameters for the "format-monitor-detail" IPC handler.
     *
     * @remarks
     * Expects two parameters: monitor type (string) and details (string).
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    formatMonitorDetail: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const monitorTypeError = IpcValidators.requiredString(params[0], "monitorType");
        if (monitorTypeError) {
            errors.push(monitorTypeError);
        }

        const detailsError = IpcValidators.requiredString(params[1], "details");
        if (detailsError) {
            errors.push(detailsError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "format-monitor-title-suffix" IPC handler.
     *
     * @remarks
     * Expects two parameters: monitor type (string) and monitor object.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    formatMonitorTitleSuffix: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const monitorTypeError = IpcValidators.requiredString(params[0], "monitorType");
        if (monitorTypeError) {
            errors.push(monitorTypeError);
        }

        const monitorError = IpcValidators.requiredObject(params[1], "monitor");
        if (monitorError) {
            errors.push(monitorError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "get-monitor-types" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    getMonitorTypes: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "validate-monitor-data" IPC handler.
     *
     * @remarks
     * Expects two parameters: monitor type (string) and data (any).
     * Only the monitor type is validated for type.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    validateMonitorData: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const monitorTypeError = IpcValidators.requiredString(params[0], "monitorType");
        if (monitorTypeError) {
            errors.push(monitorTypeError);
        }

        // Data can be any monitorType for validation, so no validation needed for params[1]

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,
} as const;

/**
 * Parameter validators for state synchronization IPC handlers.
 *
 * @remarks
 * Each property is a validator for a specific state sync-related IPC channel.
 *
 * @public
 */
export const StateSyncHandlerValidators = {
    /**
     * Validates parameters for the "get-sync-status" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    getSyncStatus: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for the "request-full-sync" IPC handler.
     *
     * @remarks
     * Expects no parameters.
     *
     * @param params - The parameters passed to the handler.
     * @returns `null` if valid, or an array of error messages.
     */
    requestFullSync: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,
} as const;
