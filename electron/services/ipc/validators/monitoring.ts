/**
 * Parameter validators for monitoring control IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    createNoParamsValidator,
    createSiteIdentifierAndMonitorIdValidator,
    createSiteIdentifierValidator,
} from "./shared";

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

export const MonitoringHandlerValidators: MonitoringHandlerValidatorsInterface =
    {
        checkSiteNow: createSiteIdentifierAndMonitorIdValidator(
            "identifier",
            "monitorId"
        ),
        startMonitoring: createNoParamsValidator(),
        startMonitoringForMonitor: createSiteIdentifierAndMonitorIdValidator(
            "identifier",
            "monitorId"
        ),
        startMonitoringForSite: createSiteIdentifierValidator("identifier"),
        stopMonitoring: createNoParamsValidator(),
        stopMonitoringForMonitor: createSiteIdentifierAndMonitorIdValidator(
            "identifier",
            "monitorId"
        ),
        stopMonitoringForSite: createSiteIdentifierValidator("identifier"),
    } as const;
