import type { IpcInvokeChannel } from "@shared/types/ipc";

import { MONITORING_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { registerStandardizedIpcHandler } from "../utils";
import { MonitoringHandlerValidators } from "../validators";

/**
 * Dependencies required to register monitoring lifecycle IPC handlers.
 */
export interface MonitoringHandlersDependencies {
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly uptimeOrchestrator: UptimeOrchestrator;
}

/**
 * Registers IPC handlers for monitoring lifecycle operations.
 */
export function registerMonitoringHandlers({
    registeredHandlers,
    uptimeOrchestrator,
}: MonitoringHandlersDependencies): void {
    registerStandardizedIpcHandler(
        MONITORING_CHANNELS.startMonitoring,
        () => uptimeOrchestrator.startMonitoring(),
        MonitoringHandlerValidators.startMonitoring,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITORING_CHANNELS.stopMonitoring,
        () => uptimeOrchestrator.stopMonitoring(),
        MonitoringHandlerValidators.stopMonitoring,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITORING_CHANNELS.startMonitoringForSite,
        (siteIdentifier) =>
            uptimeOrchestrator.startMonitoringForSite(siteIdentifier),
        MonitoringHandlerValidators.startMonitoringForSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITORING_CHANNELS.startMonitoringForMonitor,
        (siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.startMonitoringForSite(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.startMonitoringForMonitor,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITORING_CHANNELS.stopMonitoringForSite,
        (siteIdentifier) =>
            uptimeOrchestrator.stopMonitoringForSite(siteIdentifier),
        MonitoringHandlerValidators.stopMonitoringForSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITORING_CHANNELS.stopMonitoringForMonitor,
        (siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.stopMonitoringForSite(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.stopMonitoringForMonitor,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITORING_CHANNELS.checkSiteNow,
        (siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.checkSiteManually(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.checkSiteNow,
        registeredHandlers
    );
}
