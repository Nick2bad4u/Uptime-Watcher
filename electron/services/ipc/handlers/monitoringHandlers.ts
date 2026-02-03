import type { IpcInvokeChannel, IpcInvokeChannelParams  } from "@shared/types/ipc";

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
        (
            siteIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.startMonitoringForSite
            >[0]
        ) =>
            uptimeOrchestrator.startMonitoringForSite(siteIdentifier),
        MonitoringHandlerValidators.startMonitoringForSite
    );

    register(
        MONITORING_CHANNELS.startMonitoringForMonitor,
        (
            siteIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.startMonitoringForMonitor
            >[0],
            monitorIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.startMonitoringForMonitor
            >[1]
        ) =>
            uptimeOrchestrator.startMonitoringForMonitor(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.startMonitoringForMonitor
    );

    register(
        MONITORING_CHANNELS.stopMonitoringForSite,
        (
            siteIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.stopMonitoringForSite
            >[0]
        ) =>
            uptimeOrchestrator.stopMonitoringForSite(siteIdentifier),
        MonitoringHandlerValidators.stopMonitoringForSite
    );

    register(
        MONITORING_CHANNELS.stopMonitoringForMonitor,
        (
            siteIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.stopMonitoringForMonitor
            >[0],
            monitorIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.stopMonitoringForMonitor
            >[1]
        ) =>
            uptimeOrchestrator.stopMonitoringForMonitor(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.stopMonitoringForMonitor
    );

    register(
        MONITORING_CHANNELS.checkSiteNow,
        (
            siteIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.checkSiteNow
            >[0],
            monitorIdentifier: IpcInvokeChannelParams<
                typeof MONITORING_CHANNELS.checkSiteNow
            >[1]
        ) =>
            uptimeOrchestrator.checkSiteManually(
                siteIdentifier,
                monitorIdentifier
            ),
        MonitoringHandlerValidators.checkSiteNow
    );
}
