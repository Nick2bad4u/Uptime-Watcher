/**
 * Shared monitoring lifecycle helpers consumed by {@link MonitorManager}.
 *
 * @remarks
 * These helpers encapsulate the enhanced monitoring orchestration logic so the
 * manager can delegate complex control-flow while remaining testable. Each
 * helper is pure with respect to the provided dependencies, facilitating
 * deterministic testing and future reuse.
 */

import type {
    Monitor,
    MonitoringStartSummary,
    MonitoringStopSummary,
    MonitorStatus,
    Site,
} from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { MONITOR_STATUS } from "@shared/types";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";
import type { DatabaseService } from "../services/database/DatabaseService";
import type { MonitorRepository } from "../services/database/MonitorRepository";
import type { EnhancedMonitoringServices } from "../services/monitoring/EnhancedMonitoringServiceFactory";
import type { MonitorScheduler } from "../services/monitoring/MonitorScheduler";
import type { StandardizedCache } from "../utils/cache/StandardizedCache";

/**
 * Dependencies required by the enhanced lifecycle helpers.
 */
export interface EnhancedLifecycleConfig {
    /** Database service used for persistence and transactional work. */
    databaseService: DatabaseService;
    /** Event bus for orchestrating typed monitoring events. */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Structured logger instance for diagnostic output. */
    logger: Logger;
    /** Repository handling monitor persistence operations. */
    monitorRepository: MonitorRepository;
    /** Scheduler responsible for coordinating monitor execution. */
    monitorScheduler: MonitorScheduler;
    /** Canonical cache containing the current site collection. */
    sites: StandardizedCache<Site>;
}

/**
 * Hooks supplied by {@link MonitorManager} to integrate helper flow results.
 */
export interface EnhancedLifecycleHost {
    /** Applies a state transition to a monitor instance. */
    readonly applyMonitorState: (
        site: Site,
        monitor: Monitor,
        state: Partial<Monitor>,
        nextStatus: MonitorStatus
    ) => Promise<void>;
    /** Executes the provided async task sequentially over the supplied items. */
    readonly runSequentially: <TItem>(
        items: readonly TItem[],
        iterator: (item: TItem) => Promise<void>
    ) => Promise<void>;
    /** Enhanced monitoring service bundle powering orchestration. */
    readonly services: EnhancedMonitoringServices;
}

/**
 * Delegate invoked for recursive site-level monitoring operations.
 */
export type MonitorActionDelegate = (
    identifier: string,
    monitorId?: string
) => Promise<boolean>;

/**
 * Starts monitoring across all sites using the enhanced services.
 */
export async function startAllMonitoringEnhancedFlow(params: {
    /** Shared runtime configuration. */
    config: EnhancedLifecycleConfig;
    /** Manager supplied callbacks and services. */
    host: EnhancedLifecycleHost;
    /** Indicates whether monitoring is already active. */
    isMonitoring: boolean;
}): Promise<MonitoringStartSummary> {
    const { config, host, isMonitoring } = params;
    const { applyMonitorState, runSequentially, services } = host;
    const sites = config.sites.getAll();
    const siteCount = sites.length;

    if (isMonitoring) {
        const summary: MonitoringStartSummary = {
            alreadyActive: true,
            attempted: 0,
            failed: 0,
            isMonitoring: true,
            partialFailures: false,
            siteCount,
            skipped: 0,
            succeeded: 0,
        };
        config.logger.debug(
            "Monitoring already running; returning cached summary",
            summary
        );
        return summary;
    }

    let attempted = 0;
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    config.logger.info(
        `Starting monitoring across ${siteCount} sites (enhanced system)`
    );

    await runSequentially(sites, async (site) => {
        const monitors = (
            Array.isArray(site.monitors) ? site.monitors : []
        ) as Array<Site["monitors"][0] | undefined>;
        let siteStarted: boolean = false;

        await runSequentially(monitors, async (candidate) => {
            if (!candidate) {
                skipped += 1;
                config.logger.warn(
                    "[MonitorManager] Encountered undefined monitor during global start",
                    {
                        siteIdentifier: site.identifier,
                    }
                );
                return;
            }

            const { checkInterval: interval, id, type } = candidate;

            if (!id) {
                skipped += 1;
                config.logger.warn(
                    "[MonitorManager] Skipping monitor without identifier during global start",
                    {
                        monitorType: type,
                        siteIdentifier: site.identifier,
                    }
                );
                return;
            }

            if (
                typeof interval !== "number" ||
                Number.isNaN(interval) ||
                interval <= 0
            ) {
                skipped += 1;
                config.logger.warn(
                    "[MonitorManager] Skipping monitor without valid checkInterval during global start",
                    {
                        monitorId: id,
                        siteIdentifier: site.identifier,
                    }
                );
                return;
            }

            attempted += 1;

            try {
                const started = await services.checker.startMonitoring(
                    site.identifier,
                    id
                );

                if (!started) {
                    failed += 1;
                    config.logger.warn(
                        "[MonitorManager] Checker declined to start monitor",
                        {
                            monitorId: id,
                            siteIdentifier: site.identifier,
                        }
                    );
                    return;
                }

                succeeded += 1;
                siteStarted = true;
                await applyMonitorState(
                    site,
                    candidate,
                    {
                        activeOperations: [],
                        monitoring: true,
                        status: MONITOR_STATUS.PENDING,
                    },
                    MONITOR_STATUS.PENDING
                );
            } catch (error) {
                failed += 1;
                config.logger.error(
                    `Failed to start monitor ${id} for site ${site.identifier}`,
                    error
                );
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Guard ensures scheduler is only triggered when a monitor actually transitioned to active.
        if (siteStarted) {
            config.monitorScheduler.startSite(site);
        }
    });

    const partialFailures = failed > 0 && succeeded > 0;

    const summary: MonitoringStartSummary = {
        alreadyActive: false,
        attempted,
        failed,
        isMonitoring: succeeded > 0,
        partialFailures,
        siteCount,
        skipped,
        succeeded,
    };

    if (partialFailures) {
        config.logger.warn(
            "[MonitorManager] Global monitoring started with partial failures",
            summary
        );
    } else {
        config.logger.info(
            "[MonitorManager] Global monitoring start summary",
            summary
        );
    }

    if (attempted === 0) {
        config.logger.info(
            "[MonitorManager] No monitors eligible for start; monitoring remains inactive"
        );
    }

    return summary;
}

/**
 * Stops monitoring for all sites using the enhanced services.
 */
export async function stopAllMonitoringEnhancedFlow(params: {
    /** Shared runtime configuration. */
    config: EnhancedLifecycleConfig;
    /** Manager supplied callbacks and services. */
    host: EnhancedLifecycleHost;
}): Promise<MonitoringStopSummary> {
    const { config, host } = params;
    const { applyMonitorState, runSequentially, services } = host;
    const sites = config.sites.getAll();
    const siteCount = sites.length;

    let attempted = 0;
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    config.logger.info("Stopping all monitoring operations (enhanced system)");

    await runSequentially(sites, async (site) => {
        const monitors = (
            Array.isArray(site.monitors) ? site.monitors : []
        ) as Array<Site["monitors"][0] | undefined>;

        await runSequentially(monitors, async (candidate) => {
            if (!candidate) {
                skipped += 1;
                config.logger.warn(
                    "[MonitorManager] Encountered undefined monitor during global stop",
                    {
                        siteIdentifier: site.identifier,
                    }
                );
                return;
            }

            if (!candidate.id) {
                skipped += 1;
                config.logger.warn(
                    "[MonitorManager] Skipping monitor without identifier during global stop",
                    {
                        monitorType: candidate.type,
                        siteIdentifier: site.identifier,
                    }
                );
                return;
            }

            if (!candidate.monitoring) {
                skipped += 1;
                return;
            }

            const monitorId = candidate.id;
            attempted += 1;

            try {
                const stopped = await services.checker.stopMonitoring(
                    site.identifier,
                    monitorId
                );

                if (!stopped) {
                    failed += 1;
                    config.logger.warn(
                        "[MonitorManager] Checker declined to stop monitor",
                        {
                            monitorId,
                            siteIdentifier: site.identifier,
                        }
                    );
                    return;
                }

                succeeded += 1;
                await applyMonitorState(
                    site,
                    candidate,
                    {
                        activeOperations: [],
                        monitoring: false,
                        status: MONITOR_STATUS.PAUSED,
                    },
                    MONITOR_STATUS.PAUSED
                );
            } catch (error) {
                failed += 1;
                config.logger.error(
                    `Failed to stop monitor ${monitorId} for site ${site.identifier}`,
                    error
                );
            }
        });
    });

    config.monitorScheduler.stopAll();

    const partialFailures = failed > 0 && succeeded > 0;
    const summary: MonitoringStopSummary = {
        alreadyInactive: attempted === 0,
        attempted,
        failed,
        isMonitoring: failed > 0,
        partialFailures,
        siteCount,
        skipped,
        succeeded,
    };

    if (partialFailures) {
        config.logger.warn(
            "[MonitorManager] Global monitoring stopped with partial failures",
            summary
        );
    } else {
        config.logger.info(
            "[MonitorManager] Global monitoring stop summary",
            summary
        );
    }

    if (attempted === 0) {
        config.logger.info(
            "[MonitorManager] No active monitors required stopping"
        );
    }

    return summary;
}

/**
 * Starts monitoring for a specific site or monitor using the enhanced services.
 */
export async function startMonitoringForSiteEnhancedFlow(params: {
    /** Shared runtime configuration. */
    config: EnhancedLifecycleConfig;
    /** Manager supplied callbacks and services. */
    host: EnhancedLifecycleHost;
    /** Target site identifier. */
    identifier: string;
    /** Optional delegate for recursive invocation. */
    monitorAction?: MonitorActionDelegate;
    /** Optional monitor identifier to scope the request. */
    monitorId?: string;
}): Promise<boolean> {
    const { config, host, identifier, monitorAction, monitorId } = params;
    const { applyMonitorState, runSequentially, services } = host;

    const site = config.sites.get(identifier);
    if (!site) {
        config.logger.warn(`Site not found: ${identifier}`);
        return false;
    }

    if (monitorId) {
        const monitor = site.monitors.find(
            (candidate) => candidate.id === monitorId
        );
        if (!monitor) {
            config.logger.warn(
                `Monitor ${monitorId} not found in site ${identifier}`
            );
            return false;
        }

        if (
            typeof monitor.checkInterval !== "number" ||
            Number.isNaN(monitor.checkInterval) ||
            monitor.checkInterval <= 0
        ) {
            config.logger.warn(
                `Monitor ${identifier}:${monitorId} has no valid check interval set`
            );
            return false;
        }

        try {
            const result = await services.checker.startMonitoring(
                identifier,
                monitorId
            );

            if (!result) {
                return false;
            }

            await applyMonitorState(
                site,
                monitor,
                {
                    activeOperations: [],
                    monitoring: true,
                    status: MONITOR_STATUS.PENDING,
                },
                MONITOR_STATUS.PENDING
            );

            config.logger.debug(
                `Started monitoring for ${identifier}:${monitorId} (enhanced)`
            );
            return config.monitorScheduler.startMonitor(identifier, monitor);
        } catch (error) {
            config.logger.error(
                `Enhanced start failed for ${identifier}:${monitorId}`,
                error
            );
            return false;
        }
    }

    const rawMonitors = (
        Array.isArray(site.monitors) ? site.monitors : []
    ) as Array<Monitor | undefined>;
    const validMonitors = rawMonitors.filter((
        candidate
    ): candidate is Monitor & { id: string } => {
        if (!candidate) {
            return false;
        }

        return typeof candidate.id === "string" && candidate.id.length > 0;
    });
    let hasSuccessfulStart = false;

    await runSequentially(validMonitors, async (monitorWithId) => {
        try {
            const result = monitorAction
                ? await monitorAction(identifier, monitorWithId.id)
                : await startMonitoringForSiteEnhancedFlow({
                      config,
                      host,
                      identifier,
                      monitorId: monitorWithId.id,
                  });

            if (result) {
                hasSuccessfulStart = true;
            }
        } catch (error) {
            config.logger.error(
                `Enhanced start failed for ${identifier}:${monitorWithId.id}`,
                error
            );
        }
    });

    return hasSuccessfulStart;
}

/**
 * Stops monitoring for a specific site or monitor using the enhanced services.
 */
export async function stopMonitoringForSiteEnhancedFlow(params: {
    /** Shared runtime configuration. */
    config: EnhancedLifecycleConfig;
    /** Manager supplied callbacks and services. */
    host: EnhancedLifecycleHost;
    /** Target site identifier. */
    identifier: string;
    /** Optional delegate for recursive invocation. */
    monitorAction?: MonitorActionDelegate;
    /** Optional monitor identifier to scope the request. */
    monitorId?: string;
}): Promise<boolean> {
    const { config, host, identifier, monitorAction, monitorId } = params;
    const { applyMonitorState, runSequentially, services } = host;

    const site = config.sites.get(identifier);
    if (!site) {
        config.logger.warn(`Site not found: ${identifier}`);
        return false;
    }

    if (monitorId) {
        const monitor = site.monitors.find(
            (candidate) => candidate.id === monitorId
        );
        if (!monitor) {
            config.logger.warn(
                `Monitor ${monitorId} not found in site ${identifier}`
            );
            return false;
        }

        try {
            const result = await services.checker.stopMonitoring(
                identifier,
                monitorId
            );

            if (!result) {
                return false;
            }

            await applyMonitorState(
                site,
                monitor,
                {
                    activeOperations: [],
                    monitoring: false,
                    status: MONITOR_STATUS.PAUSED,
                },
                MONITOR_STATUS.PAUSED
            );

            config.logger.debug(
                `Stopped monitoring for ${identifier}:${monitorId} (enhanced)`
            );
            return config.monitorScheduler.stopMonitor(identifier, monitorId);
        } catch (error) {
            config.logger.error(
                `Enhanced stop failed for ${identifier}:${monitorId}`,
                error
            );
            return false;
        }
    }

    const rawMonitors = (
        Array.isArray(site.monitors) ? site.monitors : []
    ) as Array<Monitor | undefined>;
    const validMonitors = rawMonitors.filter((
        candidate
    ): candidate is Monitor & { id: string } => {
        if (!candidate) {
            return false;
        }

        return (
            typeof candidate.id === "string" &&
            candidate.id.length > 0 &&
            candidate.monitoring
        );
    });
    let allStoppedSuccessfully = true;

    await runSequentially(validMonitors, async (monitorWithId) => {
        try {
            const result = monitorAction
                ? await monitorAction(identifier, monitorWithId.id)
                : await stopMonitoringForSiteEnhancedFlow({
                      config,
                      host,
                      identifier,
                      monitorId: monitorWithId.id,
                  });

            if (!result) {
                allStoppedSuccessfully = false;
            }
        } catch (error) {
            config.logger.error(
                `Enhanced stop failed for ${identifier}:${monitorWithId.id}`,
                error
            );
            allStoppedSuccessfully = false;
        }
    });

    return allStoppedSuccessfully;
}
