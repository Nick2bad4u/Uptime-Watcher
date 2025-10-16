/**
 * Site operations module. Handles CRUD operations for sites and monitor
 * management.
 *
 * Uses centralized error store for consistent error handling across the
 * application.
 *
 * @packageDocumentation
 */

import { DEFAULT_SITE_NAME } from "@shared/constants/sites";
import type { Monitor, MonitorType, Site } from "@shared/types";

import { isDevelopment } from "@shared/utils/environment";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { ensureError } from "@shared/utils/errorHandling";
import { getErrorMessage } from "@shared/utils/errorUtils";

import type { BaseSiteOperations } from "./baseTypes";
import type { SiteOperationsDependencies } from "./types";

import { logger } from "../../services/logger";
import { handleSQLiteBackupDownload } from "./utils/fileDownload";
import { normalizeMonitor } from "./utils/monitorOperations";
import {
    applySavedSiteToStore,
    getSiteByIdentifier,
    updateMonitorAndSave,
    withSiteOperation,
    withSiteOperationReturning,
} from "./utils/operationHelpers";

const normalizeMonitorOrThrow = (
    monitor: Partial<Monitor>,
    contextMessage: string
): Monitor => {
    try {
        return normalizeMonitor(monitor);
    } catch (error) {
        const safeError = ensureError(error);
        logger.error(contextMessage, safeError);
        throw new Error(
            `Monitor normalization failed: ${getErrorMessage(safeError)}`,
            { cause: error }
        );
    }
};

/**
 * Site operations actions exposed by the sites store.
 *
 * @public
 */
export interface SiteOperationsActions extends BaseSiteOperations {
    /** Initialize sites data from backend */
    initializeSites: () => Promise<{
        /** Descriptive message about the initialization result */
        message: string;
        /** Number of sites successfully loaded from backend */
        sitesLoaded: number;
        /** Whether the initialization operation completed successfully */
        success: boolean;
    }>;
    /** Modify an existing site */
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
}

/**
 * Creates site operations actions for managing CRUD operations.
 *
 * @remarks
 * Factory function that creates actions for site management operations
 * including creation, modification, deletion, and monitor management. All
 * operations include proper error handling and logging.
 *
 * @param deps - Dependencies required for site operations.
 *
 * @returns Object containing all site operation action functions.
 *
 * @public
 */
export const createSiteOperationsActions = (
    deps: SiteOperationsDependencies
): SiteOperationsActions => ({
    addMonitorToSite: async (siteIdentifier, monitor): Promise<void> => {
        const savedSite = await withSiteOperationReturning(
            "addMonitorToSite",
            async () => {
                const site = getSiteByIdentifier(siteIdentifier, deps);

                const normalizedMonitor = normalizeMonitorOrThrow(
                    monitor,
                    "Failed to normalize monitor before adding to site"
                );

                const updatedMonitors = [...site.monitors, normalizedMonitor];

                return deps.services.site.updateSite(siteIdentifier, {
                    monitors: updatedMonitors,
                });
            },
            deps,
            {
                syncAfter: false,
                telemetry: { monitor, siteIdentifier },
            }
        );

        applySavedSiteToStore(savedSite, deps);
    },
    createSite: async (siteData): Promise<void> => {
        await withSiteOperation(
            "createSite",
            async () => {
                // Default to HTTP monitor if none provided
                const monitors: Monitor[] = (
                    siteData.monitors && siteData.monitors.length > 0
                        ? siteData.monitors
                        : [
                              {
                                  history: [],
                                  id: crypto.randomUUID(),
                                  monitoring: true,
                                  status: "pending" as const,
                                  type: "http" as MonitorType,
                              },
                          ]
                ).map((monitor) =>
                    normalizeMonitorOrThrow(
                        monitor,
                        "Failed to normalize monitor during site creation"
                    )
                );

                // Construct a complete Site object
                const completeSite: Site = {
                    identifier: siteData.identifier,
                    monitoring: siteData.monitoring ?? true, // Default to monitoring enabled
                    monitors,
                    name: siteData.name ?? DEFAULT_SITE_NAME,
                };

                // Preload now returns extracted data directly
                const newSite = await deps.services.site.addSite(completeSite);
                deps.addSite(newSite);
            },
            deps,
            {
                syncAfter: false,
                telemetry: { siteData },
            } // Don't sync after as we're adding directly to deps
        );
    },
    deleteSite: async (identifier: string): Promise<void> => {
        await withSiteOperation(
            "deleteSite",
            async () => {
                // Stop monitoring for all monitors of this site before deleting
                // Filter out null/undefined values to handle corrupted data
                const site = deps
                    .getSites()
                    .find((s) => s.identifier === identifier);
                if (site?.monitors) {
                    for (const monitor of site.monitors) {
                        try {
                            // eslint-disable-next-line no-await-in-loop -- Sequential monitor stop operations required
                            await deps.services.monitoring.stopMonitoring(
                                identifier,
                                monitor.id
                            );
                        } catch (error) {
                            // Log but do not block deletion if stopping fails
                            if (isDevelopment()) {
                                logger.warn(
                                    `Failed to stop monitoring for monitor ${monitor.id} of site ${identifier}`,
                                    error instanceof Error
                                        ? error
                                        : new Error(String(error))
                                );
                            }
                        }
                    }
                }
                const removed = await deps.services.site.removeSite(identifier);
                if (!removed) {
                    throw new Error(
                        `Site removal failed for ${identifier}: Backend returned false`
                    );
                }
                deps.removeSite(identifier);
            },
            deps,
            {
                syncAfter: false,
                telemetry: { identifier },
            } // Don't sync after as we're removing directly from deps
        );
    },
    downloadSqliteBackup: async (): Promise<void> => {
        await withSiteOperation(
            "downloadSqliteBackup",
            async () => {
                try {
                    await handleSQLiteBackupDownload(() =>
                        deps.services.data.downloadSqliteBackup()
                    );
                } catch (error) {
                    const resolvedError = ensureError(error);
                    logger.error(
                        "Failed to download SQLite backup:",
                        resolvedError
                    );
                    throw resolvedError;
                }
            },
            deps,
            {
                syncAfter: false,
                telemetry: {
                    success: {
                        message: "SQLite backup download completed",
                    },
                },
            } // Don't sync for backup download
        );
    },
    initializeSites: async (): Promise<{
        message: string;
        sitesLoaded: number;
        success: boolean;
    }> =>
        withSiteOperationReturning(
            "initializeSites",
            async () => {
                // Preload now returns extracted data directly
                const sites = await deps.services.site.getSites();
                deps.setSites(sites);
                return {
                    message: `Successfully loaded ${sites.length} sites`,
                    sitesLoaded: sites.length,
                    success: true,
                };
            },
            deps,
            {
                syncAfter: false,
                telemetry: {},
            } // Don't sync for initialization - we're loading the data
        ),
    modifySite: async (
        identifier: string,
        updates: Partial<Site>
    ): Promise<void> => {
        const updatedSite = await withSiteOperationReturning(
            "modifySite",
            async () => deps.services.site.updateSite(identifier, updates),
            deps,
            {
                syncAfter: false,
                telemetry: { identifier, updates },
            }
        );

        const currentSites = deps.getSites();
        const hasExistingSite = currentSites.some(
            (site) => site.identifier === updatedSite.identifier
        );

        const nextSites = hasExistingSite
            ? currentSites.map((site) =>
                  site.identifier === updatedSite.identifier
                      ? updatedSite
                      : site
              )
            : [...currentSites, updatedSite];

        deps.setSites(nextSites);
    },
    removeMonitorFromSite: async (siteIdentifier, monitorId): Promise<void> => {
        const savedSite = await withSiteOperationReturning(
            "removeMonitorFromSite",
            async () => {
                const site = getSiteByIdentifier(siteIdentifier, deps);

                if (site.monitors.length <= 1) {
                    throw new Error(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);
                }

                try {
                    await deps.services.monitoring.stopMonitoring(
                        siteIdentifier,
                        monitorId
                    );
                } catch (error) {
                    if (isDevelopment()) {
                        logger.warn(
                            `Failed to stop monitoring for monitor ${monitorId} of site ${siteIdentifier}`,
                            error instanceof Error
                                ? error
                                : new Error(String(error))
                        );
                    }
                }

                const updatedMonitors = site.monitors.filter(
                    (entry) => entry.id !== monitorId
                );

                return deps.services.site.updateSite(siteIdentifier, {
                    monitors: updatedMonitors,
                });
            },
            deps,
            {
                syncAfter: false,
                telemetry: { monitorId, siteIdentifier },
            }
        );

        applySavedSiteToStore(savedSite, deps);
    },
    updateMonitorRetryAttempts: async (
        siteIdentifier: string,
        monitorId: string,
        retryAttempts: number | undefined
    ): Promise<void> => {
        await withSiteOperation(
            "updateMonitorRetryAttempts",
            async () => {
                // Only update if retryAttempts is defined
                const updates: Partial<Monitor> = {};
                if (retryAttempts !== undefined) {
                    updates.retryAttempts = retryAttempts;
                }

                await updateMonitorAndSave(
                    siteIdentifier,
                    monitorId,
                    updates,
                    deps
                );
            },
            deps,
            {
                syncAfter: false,
                telemetry: { monitorId, retryAttempts, siteIdentifier },
            }
        );
    },
    updateMonitorTimeout: async (
        siteIdentifier: string,
        monitorId: string,
        timeout: number | undefined
    ): Promise<void> => {
        await withSiteOperation(
            "updateMonitorTimeout",
            async () => {
                // Only update if timeout is defined
                const updates: Partial<Monitor> = {};
                if (timeout !== undefined) {
                    updates.timeout = timeout;
                }

                await updateMonitorAndSave(
                    siteIdentifier,
                    monitorId,
                    updates,
                    deps
                );
            },
            deps,
            {
                syncAfter: false,
                telemetry: { monitorId, siteIdentifier, timeout },
            }
        );
    },
    updateSiteCheckInterval: async (
        siteIdentifier: string,
        monitorId: string,
        interval: number
    ): Promise<void> => {
        await withSiteOperation(
            "updateSiteCheckInterval",
            async () => {
                await updateMonitorAndSave(
                    siteIdentifier,
                    monitorId,
                    {
                        checkInterval: interval,
                    },
                    deps
                );
            },
            deps,
            {
                syncAfter: false,
                telemetry: { interval, monitorId, siteIdentifier },
            }
        );
    },
});
