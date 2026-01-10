import type { IpcInvokeChannel } from "@shared/types/ipc";

import { MONITORING_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { createStandardizedIpcRegistrar } from "../utils";
import { MonitoringHandlerValidators } from "../validators/monitoring";

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
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        MONITORING_CHANNELS.startMonitoring,
        () => uptimeOrchestrator.startMonitoring(),
        MonitoringHandlerValidators.startMonitoring
    );

    register(
        MONITORING_CHANNELS.stopMonitoring,
        () => uptimeOrchestrator.stopMonitoring(),
        MonitoringHandlerValidators.stopMonitoring
    );

    register(
        MONITORING_CHANNELS.startMonitoringForSite,
        (siteIdentifier) =>
            uptimeOrchestrator.startMonitoringForSite(siteIdentifier),
        MonitoringHandlerValidators.startMonitoringForSite
    );

    register(
        MONITORING_CHANNELS.startMonitoringForMonitor,
        (siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.startMonitoringForMonitor(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.startMonitoringForMonitor
    );

    register(
        MONITORING_CHANNELS.stopMonitoringForSite,
        (siteIdentifier) =>
            uptimeOrchestrator.stopMonitoringForSite(siteIdentifier),
        MonitoringHandlerValidators.stopMonitoringForSite
    );

    register(
        MONITORING_CHANNELS.stopMonitoringForMonitor,
        (siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.stopMonitoringForMonitor(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.stopMonitoringForMonitor
    );

    register(
        MONITORING_CHANNELS.checkSiteNow,
        (siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.checkSiteManually(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.checkSiteNow
    );
}
