/**
 * Shared monitoring lifecycle helpers consumed by
 * {@link electron/managers/MonitorManager#MonitorManager}.
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
 * Hooks supplied by {@link electron/managers/MonitorManager#MonitorManager} to
 * integrate helper flow results.
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

type MonitorToggleKind = "start" | "stop";

const toggleSingleMonitorEnhanced = async (args: {
    readonly applyMonitorState: EnhancedLifecycleHost["applyMonitorState"];
    readonly config: EnhancedLifecycleConfig;
    readonly identifier: string;
    readonly kind: MonitorToggleKind;
    readonly monitor: Monitor;
    readonly monitorId: string;
    readonly services: EnhancedLifecycleHost["services"];
    readonly site: Site;
}): Promise<boolean> => {
    const {
        applyMonitorState,
        config,
        identifier,
        kind,
        monitor,
        monitorId,
        services,
        site,
    } = args;

    const checkerResult =
        kind === "start"
            ? await services.checker.startMonitoring(identifier, monitorId)
            : await services.checker.stopMonitoring(identifier, monitorId);

    if (!checkerResult) {
        return false;
    }

    const status =
        kind === "start" ? MONITOR_STATUS.PENDING : MONITOR_STATUS.PAUSED;
    await applyMonitorState(
        site,
        monitor,
        {
            activeOperations: [],
            monitoring: kind === "start",
            status,
        },
        status
    );

    config.logger.debug(
        `${kind === "start" ? "Started" : "Stopped"} monitoring for ${identifier}:${monitorId} (enhanced)`
    );

    return kind === "start"
        ? config.monitorScheduler.startMonitor(identifier, monitor)
        : config.monitorScheduler.stopMonitor(identifier, monitorId);
};

const getSiteOrWarn = (
    config: EnhancedLifecycleConfig,
    identifier: string
): null | Site => {
    const site = config.sites.get(identifier);
    if (!site) {
        config.logger.warn(`Site not found: ${identifier}`);
        return null;
    }

    return site;
};

const getMonitorOrWarn = (
    config: EnhancedLifecycleConfig,
    site: Site,
    identifier: string,
    monitorId: string
): Monitor | null => {
    const monitor = site.monitors.find(
        (candidate) => candidate.id === monitorId
    );
    if (!monitor) {
        config.logger.warn(
            `Monitor ${monitorId} not found in site ${identifier}`
        );
        return null;
    }

    return monitor;
};

const getMonitorsWithIds = (
    site: Site,
    options?: { requireMonitoring?: boolean }
): ReadonlyArray<Monitor & { id: string }> => {
    const { requireMonitoring = false } = options ?? {};

    const rawMonitors = (
        Array.isArray(site.monitors) ? site.monitors : []
    ) as Array<Monitor | undefined>;

    return rawMonitors.filter(
        (candidate): candidate is Monitor & { id: string } => {
            if (!candidate) {
                return false;
            }

            if (typeof candidate.id !== "string" || candidate.id.length === 0) {
                return false;
            }

            return requireMonitoring ? candidate.monitoring : true;
        }
    );
};

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
        const siteStarted: { current: boolean } = { current: false };

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
                siteStarted.current = true;
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

        if (siteStarted.current) {
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

const runEnhancedLifecycleBatch = async <TAcc>(args: {
    readonly actionLabel: "start" | "stop";
    readonly combine: (acc: TAcc, success: boolean) => TAcc;
    readonly config: EnhancedLifecycleConfig;
    readonly fallback: (monitorId: string) => Promise<boolean>;
    readonly host: EnhancedLifecycleHost;
    readonly identifier: string;
    readonly initial: TAcc;
    readonly monitorAction: MonitorActionDelegate | undefined;
    readonly monitors: ReadonlyArray<Monitor & { id: string }>;
}): Promise<TAcc> => {
    const {
        actionLabel,
        combine,
        config,
        fallback,
        host,
        identifier,
        initial,
        monitorAction,
        monitors,
    } = args;

    let acc = initial;

    await host.runSequentially(monitors, async (monitorWithId) => {
        try {
            const result = monitorAction
                ? await monitorAction(identifier, monitorWithId.id)
                : await fallback(monitorWithId.id);

            acc = combine(acc, result);
        } catch (error) {
            config.logger.error(
                `Enhanced ${actionLabel} failed for ${identifier}:${monitorWithId.id}`,
                error
            );
            acc = combine(acc, false);
        }
    });

    return acc;
};

function mergeStartMonitoringResult(acc: boolean, success: boolean): boolean {
    return acc || success;
}

function mergeStopMonitoringResult(acc: boolean, success: boolean): boolean {
    return acc && success;
}

const toggleMonitoringForSiteEnhancedFlow = async (params: {
    /** Shared runtime configuration. */
    config: EnhancedLifecycleConfig;
    /** Manager supplied callbacks and services. */
    host: EnhancedLifecycleHost;
    /** Target site identifier. */
    identifier: string;
    /** Start/stop toggle kind. */
    kind: MonitorToggleKind;
    /** Optional delegate for recursive invocation. */
    monitorAction?: MonitorActionDelegate;
    /** Optional monitor identifier to scope the request. */
    monitorId?: string;
}): Promise<boolean> => {
    const { config, host, identifier, kind, monitorAction, monitorId } = params;
    const { applyMonitorState, services } = host;

    const site = getSiteOrWarn(config, identifier);
    if (!site) {
        return false;
    }

    if (monitorId) {
        const monitor = getMonitorOrWarn(config, site, identifier, monitorId);
        if (!monitor) {
            return false;
        }

        if (
            kind === "start" &&
            (typeof monitor.checkInterval !== "number" ||
                Number.isNaN(monitor.checkInterval) ||
                monitor.checkInterval <= 0)
        ) {
            config.logger.warn(
                `Monitor ${identifier}:${monitorId} has no valid check interval set`
            );
            return false;
        }

        try {
            return await toggleSingleMonitorEnhanced({
                applyMonitorState,
                config,
                identifier,
                kind,
                monitor,
                monitorId,
                services,
                site,
            });
        } catch (error) {
            config.logger.error(
                `Enhanced ${kind} failed for ${identifier}:${monitorId}`,
                error
            );
            return false;
        }
    }

    const validMonitors =
        kind === "stop"
            ? getMonitorsWithIds(site, { requireMonitoring: true })
            : getMonitorsWithIds(site);

    return runEnhancedLifecycleBatch<boolean>({
        actionLabel: kind,
        combine:
            kind === "start"
                ? mergeStartMonitoringResult
                : mergeStopMonitoringResult,
        config,
        fallback: async (targetMonitorId) =>
            toggleMonitoringForSiteEnhancedFlow({
                config,
                host,
                identifier,
                kind,
                monitorId: targetMonitorId,
            }),
        host,
        identifier,
        initial: kind !== "start",
        monitorAction,
        monitors: validMonitors,
    });
};

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
    return toggleMonitoringForSiteEnhancedFlow({
        ...params,
        kind: "start",
    });
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
    return toggleMonitoringForSiteEnhancedFlow({
        ...params,
        kind: "stop",
    });
}
