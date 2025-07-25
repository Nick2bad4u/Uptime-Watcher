/**
 * Parameter validators for specific IPC handler groups.
 * Provides type-safe validation for different categories of IPC operations.
 */

import type { IpcParameterValidator } from "./types";

import { IpcValidators } from "./utils";

/**
 * Parameter validators for site management operations.
 *
 * @public
 */
export const SiteHandlerValidators = {
    /**
     * Validates parameters for add-site handler.
     * Expects: [Site]
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
     * Validates parameters for get-sites handler.
     * Expects: []
     */
    getSites: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for remove-monitor handler.
     * Expects: [string, string] (siteIdentifier, monitorId)
     */
    removeMonitor: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 2) {
            errors.push("Expected exactly 2 parameters");
        }

        const siteError = IpcValidators.requiredString(params[0], "siteIdentifier");
        if (siteError) {
            errors.push(siteError);
        }

        const monitorError = IpcValidators.requiredString(params[1], "monitorId");
        if (monitorError) {
            errors.push(monitorError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for remove-site handler.
     * Expects: [string] (identifier)
     */
    removeSite: ((params: unknown[]): null | string[] => {
        const errors: string[] = [];

        if (params.length !== 1) {
            errors.push("Expected exactly 1 parameter");
        }

        const identifierError = IpcValidators.requiredString(params[0], "identifier");
        if (identifierError) {
            errors.push(identifierError);
        }

        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for update-site handler.
     * Expects: [string, Partial<Site>] (identifier, updates)
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
 * Parameter validators for monitoring control operations.
 *
 * @public
 */
export const MonitoringHandlerValidators = {
    /**
     * Validates parameters for check-site-now handler.
     * Expects: [string, string] (identifier, monitorId)
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
     * Validates parameters for start-monitoring handler.
     * Expects: []
     */
    startMonitoring: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for start-monitoring-for-site handler.
     * Expects: [string, string?] (identifier, optional monitorId)
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
     * Validates parameters for stop-monitoring handler.
     * Expects: []
     */
    stopMonitoring: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for stop-monitoring-for-site handler.
     * Expects: [string, string?] (identifier, optional monitorId)
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
 * Parameter validators for data management operations.
 *
 * @public
 */
export const DataHandlerValidators = {
    /**
     * Validates parameters for download-sqlite-backup handler.
     * Expects: []
     */
    downloadSqliteBackup: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for export-data handler.
     * Expects: []
     */
    exportData: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for get-history-limit handler.
     * Expects: []
     */
    getHistoryLimit: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for import-data handler.
     * Expects: [string] (data)
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
     * Validates parameters for update-history-limit handler.
     * Expects: [number] (limit)
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
 * Parameter validators for monitor type operations.
 *
 * @public
 */
export const MonitorTypeHandlerValidators = {
    /**
     * Validates parameters for format-monitor-detail handler.
     * Expects: [string, string] (monitorType, details)
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
     * Validates parameters for format-monitor-title-suffix handler.
     * Expects: [string, Record\<string, unknown\>] (monitorType, monitor)
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
     * Validates parameters for get-monitor-types handler.
     * Expects: []
     */
    getMonitorTypes: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for validate-monitor-data handler.
     * Expects: [string, unknown] (monitorType, data)
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
 * Parameter validators for state synchronization operations.
 *
 * @public
 */
export const StateSyncHandlerValidators = {
    /**
     * Validates parameters for get-sync-status handler.
     * Expects: []
     */
    getSyncStatus: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,

    /**
     * Validates parameters for request-full-sync handler.
     * Expects: []
     */
    requestFullSync: ((params: unknown[]): null | string[] => {
        return params.length === 0 ? null : ["No parameters expected"];
    }) satisfies IpcParameterValidator,
} as const;
