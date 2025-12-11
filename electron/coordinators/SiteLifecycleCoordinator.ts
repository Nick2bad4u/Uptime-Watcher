import type { Monitor, Site } from "@shared/types";
import type { ApplicationError } from "@shared/utils/errorHandling";

import type { UptimeEvents } from "../events/eventTypes";
import type { MonitorManager } from "../managers/MonitorManager";
import type { SiteManager } from "../managers/SiteManager";

import { logger } from "../utils/logger";

interface ContextualErrorInput {
    readonly cause: unknown;
    readonly code: string;
    readonly details?: Record<string, unknown>;
    readonly message: string;
    readonly operation: string;
}

type ContextualErrorFactory = (input: ContextualErrorInput) => ApplicationError;

/**
 * Dependencies required to orchestrate site lifecycle operations.
 */
export interface SiteLifecycleCoordinatorDependencies {
    readonly createContextualError: ContextualErrorFactory;
    readonly emitSystemError: (
        payload: UptimeEvents["system:error"]
    ) => Promise<void>;
    readonly monitorManager: MonitorManager;
    readonly siteManager: SiteManager;
}

/**
 * Coordinates site lifecycle operations across the database and monitoring
 * layers.
 */
export class SiteLifecycleCoordinator {
    private readonly monitorManager: MonitorManager;

    private readonly siteManager: SiteManager;

    private readonly emitSystemError: (
        payload: UptimeEvents["system:error"]
    ) => Promise<void>;

    private readonly createContextualError: ContextualErrorFactory;

    public async addSite(siteData: Site): Promise<Site> {
        let site: Site | undefined = undefined;

        try {
            site = await this.siteManager.addSite(siteData);
            await this.monitorManager.setupSiteForMonitoring(site);
            return site;
        } catch (error) {
            if (site) {
                try {
                    await this.siteManager.removeSite(site.identifier);
                    logger.info(
                        `[SiteLifecycleCoordinator] Cleaned up site ${site.identifier} after monitoring setup failure`
                    );
                } catch (cleanupError) {
                    logger.error(
                        `[SiteLifecycleCoordinator] Failed to cleanup site ${site.identifier}:`,
                        cleanupError
                    );
                }
            }

            throw this.createContextualError({
                cause: error,
                code: "ORCHESTRATOR_ADD_SITE_FAILED",
                details: {
                    monitorCount: siteData.monitors.length,
                    siteIdentifier: siteData.identifier,
                },
                message: `Failed to add site ${siteData.identifier}`,
                operation: "orchestrator.addSite",
            });
        }
    }

    public async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<Site> {
        let monitoringStopped = false;

        try {
            // Phase 1: Stop monitoring immediately (reversible)
            monitoringStopped = await this.monitorManager.stopMonitoringForSite(
                siteIdentifier,
                monitorId
            );

            // If stopping monitoring failed, log warning but continue with
            // database removal. The monitor may not be running, but the database
            // record should still be removed.
            if (!monitoringStopped) {
                logger.warn(
                    `[SiteLifecycleCoordinator] Failed to stop monitoring for ${siteIdentifier}/${monitorId}, but continuing with database removal`
                );
            }

            // Phase 2: Remove monitor from database using transaction
            // (irreversible) and return the persisted snapshot.
            return await this.siteManager.removeMonitor(
                siteIdentifier,
                monitorId
            );
        } catch (error) {
            let failureCause: unknown = error;

            // If database removal failed after monitoring was stopped, attempt compensation
            if (monitoringStopped) {
                logger.warn(
                    `[SiteLifecycleCoordinator] Database removal failed for ${siteIdentifier}/${monitorId}, attempting to restart monitoring`
                );
                try {
                    await this.monitorManager.startMonitoringForSite(
                        siteIdentifier,
                        monitorId
                    );
                    logger.info(
                        `[SiteLifecycleCoordinator] Successfully restarted monitoring for ${siteIdentifier}/${monitorId} after failed removal`
                    );
                } catch (restartError) {
                    // This is a critical inconsistency - monitor stopped but
                    // database record exists
                    const criticalError = new Error(
                        `Critical state inconsistency: Monitor ${siteIdentifier}/${monitorId} stopped but database removal failed and restart failed`
                    );
                    logger.error(
                        `[SiteLifecycleCoordinator] ${criticalError.message}:`,
                        restartError
                    );

                    await this.emitSystemError({
                        context: "monitor-removal-compensation",
                        error: criticalError,
                        recovery:
                            "Manual intervention required - check monitor state and database consistency",
                        severity: "critical",
                        timestamp: Date.now(),
                    });

                    failureCause = criticalError;
                }
            }

            throw this.createContextualError({
                cause: failureCause,
                code: "ORCHESTRATOR_REMOVE_MONITOR_FAILED",
                details: {
                    monitorId,
                    monitoringStopped,
                    siteIdentifier,
                },
                message: `Failed to remove monitor ${siteIdentifier}/${monitorId}`,
                operation: "orchestrator.removeMonitor",
            });
        }
    }

    public async removeSite(identifier: string): Promise<boolean> {
        const siteSnapshot = this.siteManager.getSiteFromCache(identifier);
        const activeMonitorIds = siteSnapshot
            ? siteSnapshot.monitors
                  .filter((monitor): monitor is Monitor & { id: string } =>
                      Boolean(monitor.id && monitor.monitoring))
                  .map((monitor) => monitor.id)
            : [];

        if (!siteSnapshot) {
            logger.debug(
                `[SiteLifecycleCoordinator] removeSite(${identifier}) invoked for site missing from cache`
            );
        }

        let monitoringStopped = false;
        let siteRemoved = false;

        try {
            monitoringStopped =
                await this.monitorManager.stopMonitoringForSite(identifier);

            if (!monitoringStopped) {
                logger.warn(
                    `[SiteLifecycleCoordinator] Aborting removal of ${identifier} because monitoring could not be stopped`
                );
                return false;
            }

            siteRemoved = await this.siteManager.removeSite(identifier);

            if (siteRemoved) {
                return true;
            }

            logger.warn(
                `[SiteLifecycleCoordinator] Site ${identifier} deletion failed after monitoring shutdown; attempting compensation`
            );

            if (activeMonitorIds.length === 0) {
                logger.info(
                    `[SiteLifecycleCoordinator] No active monitors recorded for ${identifier}; skipping restart after failed removal`
                );
                return false;
            }

            /* eslint-disable no-await-in-loop -- Compensation sequence must restart monitors sequentially */
            for (const monitorId of activeMonitorIds) {
                const restartSucceeded =
                    await this.monitorManager.startMonitoringForSite(
                        identifier,
                        monitorId
                    );

                if (!restartSucceeded) {
                    const criticalError = new Error(
                        `Critical state inconsistency: Monitoring stopped for ${identifier} (monitor ${monitorId}) but restart failed after deletion failure`
                    );
                    logger.error(
                        `[SiteLifecycleCoordinator] ${criticalError.message}`
                    );
                    await this.emitSystemError({
                        context: "site-removal-compensation",
                        error: criticalError,
                        recovery:
                            "Inspect monitor scheduler state and database entries for the affected site",
                        severity: "critical",
                        timestamp: Date.now(),
                    });
                    throw criticalError;
                }
            }
            /* eslint-enable no-await-in-loop -- Re-enable after sequential compensation */

            return false;
        } catch (error) {
            throw this.createContextualError({
                cause: error,
                code: "ORCHESTRATOR_REMOVE_SITE_FAILED",
                details: {
                    activeMonitorIds,
                    monitoringStopped,
                    siteIdentifier: identifier,
                    siteRemoved,
                },
                message: `Failed to remove site ${identifier}`,
                operation: "orchestrator.removeSite",
            });
        }
    }

    /**
     * Deletes all sites after first stopping monitoring for every monitor.
     *
     * @remarks
     * Preserves the two-phase semantics previously implemented directly in
     * {@link UptimeOrchestrator.deleteAllSites}: monitoring is stopped for all
     * sites first, then the bulk deletion is executed via {@link SiteManager}.
     * Any failure in either phase is wrapped in a contextual
     * {@link ApplicationError} so callers receive consistent telemetry.
     *
     * The coordinator does not emit additional events; downstream consumers
     * continue to observe the same event stream as before the refactor.
     *
     * @returns Number of sites deleted.
     */
    public async deleteAllSites(): Promise<number> {
        try {
            await this.monitorManager.stopMonitoring();
        } catch (error) {
            throw this.createContextualError({
                cause: error,
                code: "ORCHESTRATOR_DELETE_ALL_SITES_STOP_MONITORING_FAILED",
                message:
                    "Failed to stop monitoring prior to bulk site deletion",
                operation: "orchestrator.deleteAllSites.stopMonitoring",
            });
        }

        try {
            return await this.siteManager.deleteAllSites();
        } catch (error) {
            throw this.createContextualError({
                cause: error,
                code: "ORCHESTRATOR_DELETE_ALL_SITES_FAILED",
                message: "Failed to delete all sites",
                operation: "orchestrator.deleteAllSites",
            });
        }
    }

    public constructor(dependencies: SiteLifecycleCoordinatorDependencies) {
        this.monitorManager = dependencies.monitorManager;
        this.siteManager = dependencies.siteManager;
        this.emitSystemError = dependencies.emitSystemError;
        this.createContextualError = dependencies.createContextualError;
    }
}
