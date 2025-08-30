/**
 * Site operations module. Handles CRUD operations for sites and monitor
 * management.
 *
 * Uses centralized error store for consistent error handling across the
 * application.
 */

import type { Monitor, MonitorType, Site } from "@shared/types";

import { isDevelopment } from "@shared/utils/environment";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";

import type { BaseSiteOperations } from "./baseTypes";
import type { SiteOperationsDependencies } from "./types";

import { logger } from "../../services/logger";
import { safeExtractIpcData } from "../../types/ipc";
import { ensureError } from "../../utils/errorHandling";
import { handleSQLiteBackupDownload } from "./utils/fileDownload";
import { normalizeMonitor } from "./utils/monitorOperations";
import {
    getSiteById,
    updateMonitorAndSave,
    withSiteOperation,
    withSiteOperationReturning,
} from "./utils/operationHelpers";

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
 * @param deps - Dependencies required for site operations
 *
 * @returns Object containing all site operation action functions
 */
export const createSiteOperationsActions = (
    deps: SiteOperationsDependencies
): SiteOperationsActions => ({
    addMonitorToSite: async (siteId, monitor): Promise<void> => {
        await withSiteOperation(
            "addMonitorToSite",
            async () => {
                // Get the current site
                const site = getSiteById(siteId, deps);

                // Allow multiple monitors of the same type
                const updatedMonitors = [...site.monitors, monitor];
                await window.electronAPI.sites.updateSite(siteId, {
                    monitors: updatedMonitors,
                });
            },
            { monitor, siteId },
            deps
        );
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
                ).map((monitor) => {
                    try {
                        return normalizeMonitor(monitor);
                    } catch (error) {
                        logger.error(
                            "Failed to normalize monitor",
                            error instanceof Error
                                ? error
                                : new Error(String(error))
                        );
                        throw new Error(
                            `Monitor normalization failed: ${error instanceof Error ? error.message : "Unknown error"}`
                        );
                    }
                });

                // Construct a complete Site object
                const completeSite: Site = {
                    identifier: siteData.identifier,
                    monitoring: siteData.monitoring ?? true, // Default to monitoring enabled
                    monitors,
                    name: siteData.name ?? "Unnamed Site", // Provide default name
                };

                const response =
                    await window.electronAPI.sites.addSite(completeSite);
                const newSite = safeExtractIpcData(response, completeSite);
                deps.addSite(newSite);
            },
            { siteData },
            deps,
            false // Don't sync after as we're adding directly to deps
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
                            await window.electronAPI.monitoring.stopMonitoringForSite(
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
                await window.electronAPI.sites.removeSite(identifier);
                deps.removeSite(identifier);
            },
            { identifier },
            deps,
            false // Don't sync after as we're removing directly from deps
        );
    },
    downloadSQLiteBackup: async (): Promise<void> => {
        await withSiteOperation(
            "downloadSQLiteBackup",
            async () => {
                /* eslint-disable-next-line ex/no-unhandled -- Exception is handled by the try-catch block */
                await handleSQLiteBackupDownload(async () => {
                    try {
                        const response =
                            await window.electronAPI.data.downloadSQLiteBackup();
                        const result = safeExtractIpcData(response, {
                            buffer: new ArrayBuffer(0),
                        });
                        return new Uint8Array(result.buffer);
                    } catch (error) {
                        logger.error(
                            "Failed to download SQLite backup:",
                            ensureError(error)
                        );
                        throw error;
                    }
                });
            },
            { message: "SQLite backup download completed", success: true },
            deps,
            false // Don't sync for backup download
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
                const response = await window.electronAPI.sites.getSites();
                const sites = safeExtractIpcData<Site[]>(response, []);
                deps.setSites(sites);
                return {
                    message: `Successfully loaded ${sites.length} sites`,
                    sitesLoaded: sites.length,
                    success: true,
                };
            },
            {},
            deps,
            false // Don't sync for initialization - we're loading the data
        ),
    modifySite: async (
        identifier: string,
        updates: Partial<Site>
    ): Promise<void> => {
        await withSiteOperation(
            "modifySite",
            async () => {
                await window.electronAPI.sites.updateSite(identifier, updates);
            },
            { identifier, updates },
            deps
        );
    },
    removeMonitorFromSite: async (siteId, monitorId): Promise<void> => {
        await withSiteOperation(
            "removeMonitorFromSite",
            async () => {
                // Get the current site
                const site = getSiteById(siteId, deps);

                // Check if this is the only monitor - prevent removal if so
                if (site.monitors.length <= 1) {
                    throw new Error(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);
                }

                // Stop monitoring for this specific monitor first
                try {
                    await window.electronAPI.monitoring.stopMonitoringForSite(
                        siteId,
                        monitorId
                    );
                } catch (error) {
                    // Log but do not block removal if stopping fails
                    if (isDevelopment()) {
                        logger.warn(
                            `Failed to stop monitoring for monitor ${monitorId} of site ${siteId}`,
                            error instanceof Error
                                ? error
                                : new Error(String(error))
                        );
                    }
                }

                // Remove the monitor via backend
                await window.electronAPI.sites.removeMonitor(siteId, monitorId);
            },
            { monitorId, siteId },
            deps
        );
    },
    updateMonitorRetryAttempts: async (
        siteId: string,
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

                await updateMonitorAndSave(siteId, monitorId, updates, deps);
            },
            { monitorId, retryAttempts, siteId },
            deps
        );
    },
    updateMonitorTimeout: async (
        siteId: string,
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

                await updateMonitorAndSave(siteId, monitorId, updates, deps);
            },
            { monitorId, siteId, timeout },
            deps
        );
    },
    updateSiteCheckInterval: async (
        siteId: string,
        monitorId: string,
        interval: number
    ): Promise<void> => {
        await withSiteOperation(
            "updateSiteCheckInterval",
            async () => {
                await updateMonitorAndSave(
                    siteId,
                    monitorId,
                    {
                        checkInterval: interval,
                    },
                    deps
                );
            },
            { interval, monitorId, siteId },
            deps
        );
    },
});
