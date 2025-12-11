import type {
    Monitor,
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
    StatusUpdate,
} from "@shared/types";

import type { UptimeEvents } from "../events/eventTypes";
import type { EventKey } from "../events/TypedEventBus";
import type { MonitorManager } from "../managers/MonitorManager";
import type { SiteManager } from "../managers/SiteManager";
import type {
    IsMonitoringActiveRequestData,
    RestartMonitoringRequestData,
    StartMonitoringRequestData,
    StopMonitoringRequestData,
} from "../UptimeOrchestrator.types";

import { logger } from "../utils/logger";

type EmitTyped = <TEventName extends EventKey<UptimeEvents>>(
    eventName: TEventName,
    payload: UptimeEvents[TEventName]
) => Promise<void>;

/**
 * Dependencies required for the monitoring lifecycle coordinator.
 */
export interface MonitoringLifecycleCoordinatorDependencies {
    readonly emitTyped: EmitTyped;
    readonly monitorManager: MonitorManager;
    readonly siteManager: SiteManager;
}

/**
 * Coordinates monitoring lifecycle operations and related IPC handlers.
 *
 * @remarks
 * Encapsulates monitoring-specific logic formerly implemented inside
 * {@link UptimeOrchestrator}, keeping the orchestrator focused on wiring and
 * delegation while this coordinator owns the concrete behaviours.
 */
export class MonitoringLifecycleCoordinator {
    private readonly monitorManager: MonitorManager;

    private readonly siteManager: SiteManager;

    private readonly emitTyped: EmitTyped;

    /** Starts monitoring for all sites. */
    public async startMonitoring(): Promise<MonitoringStartSummary> {
        return this.monitorManager.startMonitoring();
    }

    /** Stops monitoring for all sites. */
    public async stopMonitoring(): Promise<MonitoringStopSummary> {
        return this.monitorManager.stopMonitoring();
    }

    /** Starts monitoring for a specific site and (optionally) monitor. */
    public async startMonitoringForSite(
        identifier: string,
        monitorId?: string
    ): Promise<boolean> {
        return this.monitorManager.startMonitoringForSite(
            identifier,
            monitorId
        );
    }

    /** Stops monitoring for a specific site and (optionally) monitor. */
    public async stopMonitoringForSite(
        identifier: string,
        monitorId?: string
    ): Promise<boolean> {
        return this.monitorManager.stopMonitoringForSite(identifier, monitorId);
    }

    /** Manually triggers a check for a site or monitor. */
    public async checkSiteManually(
        identifier: string,
        monitorId?: string
    ): Promise<StatusUpdate | undefined> {
        return this.monitorManager.checkSiteManually(identifier, monitorId);
    }

    /**
     * Resumes monitoring for sites that were actively monitoring before app
     * restart.
     *
     * @remarks
     * This logic is moved verbatim from {@link UptimeOrchestrator} to avoid
     * behavioural changes.
     */
    public async resumePersistentMonitoring(): Promise<void> {
        try {
            // Get all sites from cache (loaded during site manager initialization)
            const sites = this.siteManager.getSitesFromCache();

            // Find all monitors that were actively monitoring before restart
            const monitorsToResume: Array<{ monitor: Monitor; site: Site }> =
                [];

            for (const site of sites) {
                // Only consider sites where monitoring is enabled
                if (site.monitoring) {
                    // Find monitors within this site that were actively monitoring
                    const activeMonitors = site.monitors.filter(
                        (monitor) => monitor.monitoring
                    );
                    for (const monitor of activeMonitors) {
                        monitorsToResume.push({ monitor, site });
                    }
                }
            }

            if (monitorsToResume.length === 0) {
                logger.info(
                    "[UptimeOrchestrator] No monitors require monitoring resumption"
                );
                return;
            }

            logger.info(
                `[UptimeOrchestrator] Resuming monitoring for ${monitorsToResume.length} monitors across ${sites.filter((s) => s.monitoring).length} sites`
            );

            // Resume monitoring for each monitor individually
            const resumePromises = monitorsToResume.map(async ({
                monitor,
                site,
            }) => {
                try {
                    const success =
                        await this.monitorManager.startMonitoringForSite(
                            site.identifier,
                            monitor.id
                        );

                    if (success) {
                        logger.debug(
                            `[UptimeOrchestrator] Successfully resumed monitoring for monitor: ${site.identifier}/${monitor.id}`
                        );
                    } else {
                        logger.warn(
                            `[UptimeOrchestrator] Failed to resume monitoring for monitor: ${site.identifier}/${monitor.id}`
                        );
                    }

                    return success;
                } catch (error) {
                    logger.error(
                        `[UptimeOrchestrator] Error resuming monitoring for monitor ${site.identifier}/${monitor.id}:`,
                        error
                    );
                    return false;
                }
            });

            // Wait for all to complete (use allSettled to handle failures gracefully)
            const results = await Promise.allSettled(resumePromises);
            const successCount = results.filter(
                (result) => result.status === "fulfilled" && result.value
            ).length;

            logger.info(
                `[UptimeOrchestrator] Monitoring resumption completed: ${successCount}/${monitorsToResume.length} monitors`
            );
        } catch (error) {
            logger.error(
                "[UptimeOrchestrator] Critical error during monitoring resumption:",
                error
            );
            // Don't throw - allow app initialization to continue
        }
    }

    public constructor(
        dependencies: MonitoringLifecycleCoordinatorDependencies
    ) {
        this.monitorManager = dependencies.monitorManager;
        this.siteManager = dependencies.siteManager;
        this.emitTyped = dependencies.emitTyped;
    }

    /** Event handler for monitoring start requests. */
    public handleStartMonitoringRequestedEvent(
        data: StartMonitoringRequestData
    ): void {
        void (async (): Promise<void> => {
            try {
                const success =
                    await this.monitorManager.startMonitoringForSite(
                        data.identifier,
                        data.monitorId
                    );
                const payload: UptimeEvents["internal:site:start-monitoring-response"] =
                    {
                        identifier: data.identifier,
                        operation: "start-monitoring-response",
                        success,
                        timestamp: Date.now(),
                        ...(data.monitorId
                            ? { monitorId: data.monitorId }
                            : {}),
                    };
                await this.emitTyped(
                    "internal:site:start-monitoring-response",
                    payload
                );
            } catch (error) {
                logger.error(
                    `[UptimeOrchestrator] Error starting monitoring for site ${data.identifier}:`,
                    error
                );
                const failurePayload: UptimeEvents["internal:site:start-monitoring-response"] =
                    {
                        identifier: data.identifier,
                        operation: "start-monitoring-response",
                        success: false,
                        timestamp: Date.now(),
                        ...(data.monitorId
                            ? { monitorId: data.monitorId }
                            : {}),
                    };
                await this.emitTyped(
                    "internal:site:start-monitoring-response",
                    failurePayload
                );
            }
        })();
    }

    /** Event handler for monitoring stop requests. */
    public handleStopMonitoringRequestedEvent(
        data: StopMonitoringRequestData
    ): void {
        void (async (): Promise<void> => {
            try {
                const success = await this.monitorManager.stopMonitoringForSite(
                    data.identifier,
                    data.monitorId
                );
                await this.emitTyped("internal:site:stop-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitorId,
                    operation: "stop-monitoring-response",
                    success,
                    timestamp: Date.now(),
                });
            } catch (error) {
                logger.error(
                    `[UptimeOrchestrator] Error stopping monitoring for site ${data.identifier}:`,
                    error
                );
                await this.emitTyped("internal:site:stop-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitorId,
                    operation: "stop-monitoring-response",
                    success: false,
                    timestamp: Date.now(),
                });
            }
        })();
    }

    /** Event handler for monitoring status check requests. */
    public handleIsMonitoringActiveRequestedEvent(
        data: IsMonitoringActiveRequestData
    ): void {
        void (async (): Promise<void> => {
            const isActive = this.monitorManager.isMonitorActiveInScheduler(
                data.identifier,
                data.monitorId
            );
            await this.emitTyped(
                "internal:site:is-monitoring-active-response",
                {
                    identifier: data.identifier,
                    isActive,
                    monitorId: data.monitorId,
                    operation: "is-monitoring-active-response",
                    timestamp: Date.now(),
                }
            );
        })();
    }

    /** Event handler for monitoring restart requests. */
    public handleRestartMonitoringRequestedEvent(
        data: RestartMonitoringRequestData
    ): void {
        void (async (): Promise<void> => {
            try {
                // Note: restartMonitorWithNewConfig is intentionally
                // synchronous as it only updates scheduler configuration
                // without async I/O
                const success = this.monitorManager.restartMonitorWithNewConfig(
                    data.identifier,
                    data.monitor
                );
                await this.emitTyped(
                    "internal:site:restart-monitoring-response",
                    {
                        identifier: data.identifier,
                        monitorId: data.monitor.id,
                        operation: "restart-monitoring-response",
                        success,
                        timestamp: Date.now(),
                    }
                );
            } catch (error) {
                logger.error(
                    `[UptimeOrchestrator] Error restarting monitoring for site ${data.identifier}:`,
                    error
                );
                await this.emitTyped(
                    "internal:site:restart-monitoring-response",
                    {
                        identifier: data.identifier,
                        monitorId: data.monitor.id,
                        operation: "restart-monitoring-response",
                        success: false,
                        timestamp: Date.now(),
                    }
                );
            }
        })();
    }
}
