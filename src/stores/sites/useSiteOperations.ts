/**
 * Site operations module.
 * Handles CRUD operations for sites and monitor management.
 *
 * Note: Empty clearError and setLoading functions are intentional in withErrorHandling calls
 * as error handling is managed centrally by the store infrastructure.
 */

import type { Monitor, MonitorType, Site } from "../../types";

import { ERROR_MESSAGES } from "../types";
import { logStoreAction, withErrorHandling } from "../utils";
import { MonitoringService } from "./services/MonitoringService";
import { SiteService } from "./services/SiteService";
import { handleSQLiteBackupDownload } from "./utils/fileDownload";
import { normalizeMonitor, updateMonitorInSite } from "./utils/monitorOperations";

export interface SiteOperationsActions {
    /** Add a monitor to an existing site */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
    /** Create a new site */
    createSite: (siteData: {
        identifier: string;
        monitoring?: boolean;
        monitors?: Monitor[];
        name?: string;
    }) => Promise<void>;
    /** Delete a site */
    deleteSite: (identifier: string) => Promise<void>;
    /** Download SQLite backup */
    downloadSQLiteBackup: () => Promise<void>;
    /** Initialize sites data from backend */
    initializeSites: () => Promise<{ message: string; sitesLoaded: number; success: boolean }>;
    /** Modify an existing site */
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
    /** Remove a monitor from a site */
    removeMonitorFromSite: (siteId: string, monitorId: string) => Promise<void>;
    /** Update monitor retry attempts */
    updateMonitorRetryAttempts: (siteId: string, monitorId: string, retryAttempts: number) => Promise<void>;
    /** Update monitor timeout */
    updateMonitorTimeout: (siteId: string, monitorId: string, timeout: number) => Promise<void>;
    /** Update site check interval */
    updateSiteCheckInterval: (siteId: string, monitorId: string, interval: number) => Promise<void>;
}

export interface SiteOperationsDependencies {
    addSite: (site: Site) => void;
    getSites: () => Site[];
    removeSite: (identifier: string) => void;
    setSites: (sites: Site[]) => void;
    syncSitesFromBackend: () => Promise<void>;
}

export const createSiteOperationsActions = (deps: SiteOperationsDependencies): SiteOperationsActions => ({
    addMonitorToSite: async (siteId, monitor) => {
        logStoreAction("SitesStore", "addMonitorToSite", { monitor, siteId });

        await withErrorHandling(
            async () => {
                // Get the current site
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                // Allow multiple monitors of the same type
                const updatedMonitors = [...site.monitors, monitor];
                await SiteService.updateSite(siteId, { monitors: updatedMonitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    createSite: async (siteData) => {
        logStoreAction("SitesStore", "createSite", { siteData });

        await withErrorHandling(
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
                ).map((monitor) => normalizeMonitor(monitor));

                // Construct a complete Site object
                const completeSite: Site = {
                    identifier: siteData.identifier,
                    monitoring: siteData.monitoring ?? true, // Default to monitoring enabled
                    monitors,
                    name: siteData.name ?? "Unnamed Site", // Provide default name
                };

                const newSite = await SiteService.addSite(completeSite);
                deps.addSite(newSite);
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    deleteSite: async (identifier: string) => {
        logStoreAction("SitesStore", "deleteSite", { identifier });

        await withErrorHandling(
            async () => {
                // Stop monitoring for all monitors of this site before deleting
                // Filter out null/undefined values to handle corrupted data
                const site = deps.getSites().find((s) => s.identifier === identifier);
                if (site) {
                    for (const monitor of site.monitors) {
                        try {
                            await MonitoringService.stopMonitoring(identifier, monitor.id);
                        } catch (error) {
                            // Log but do not block deletion if stopping fails
                            if (process.env.NODE_ENV === "development") {
                                console.warn(
                                    `Failed to stop monitoring for monitor ${monitor.id} of site ${identifier}:`,
                                    error
                                );
                            }
                        }
                    }
                }
                await SiteService.removeSite(identifier);
                deps.removeSite(identifier);
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    downloadSQLiteBackup: async () => {
        await withErrorHandling(
            async () => {
                await handleSQLiteBackupDownload(async () => {
                    const result = await SiteService.downloadSQLiteBackup();
                    return new Uint8Array(result.buffer);
                });
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );

        logStoreAction("SitesStore", "downloadSQLiteBackup", {
            message: "SQLite backup download completed",
            success: true,
        });
    },
    initializeSites: async () => {
        const result = await withErrorHandling(
            async () => {
                const sites = await SiteService.getSites();
                deps.setSites(sites);
                return {
                    message: `Successfully loaded ${sites.length} sites`,
                    sitesLoaded: sites.length,
                    success: true,
                };
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );

        logStoreAction("SitesStore", "initializeSites", {
            message: result.message,
            sitesLoaded: result.sitesLoaded,
            success: result.success,
        });

        return result;
    },
    modifySite: async (identifier: string, updates: Partial<Site>) => {
        logStoreAction("SitesStore", "modifySite", { identifier, updates });

        await withErrorHandling(
            async () => {
                await SiteService.updateSite(identifier, updates);
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    removeMonitorFromSite: async (siteId, monitorId) => {
        logStoreAction("SitesStore", "removeMonitorFromSite", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                // Get the current site
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                // Check if this is the only monitor - prevent removal if so
                if (site.monitors.length <= 1) {
                    throw new Error("Cannot remove the last monitor from a site. Use site removal instead.");
                }

                // Stop monitoring for this specific monitor first
                try {
                    await MonitoringService.stopMonitoring(siteId, monitorId);
                } catch (error) {
                    // Log but do not block removal if stopping fails
                    if (process.env.NODE_ENV === "development") {
                        console.warn(`Failed to stop monitoring for monitor ${monitorId} of site ${siteId}:`, error);
                    }
                }

                // Remove the monitor via backend
                await SiteService.removeMonitor(siteId, monitorId);

                // Refresh site data from backend
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    updateMonitorRetryAttempts: async (siteId: string, monitorId: string, retryAttempts: number | undefined) => {
        logStoreAction("SitesStore", "updateMonitorRetryAttempts", { monitorId, retryAttempts, siteId });

        await withErrorHandling(
            async () => {
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                // Only update if retryAttempts is defined
                const updates: Partial<Monitor> = {};
                if (retryAttempts !== undefined) {
                    updates.retryAttempts = retryAttempts;
                }

                const updatedSite = updateMonitorInSite(site, monitorId, updates);
                await SiteService.updateSite(siteId, { monitors: updatedSite.monitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    updateMonitorTimeout: async (siteId: string, monitorId: string, timeout: number | undefined) => {
        logStoreAction("SitesStore", "updateMonitorTimeout", { monitorId, siteId, timeout });

        await withErrorHandling(
            async () => {
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                // Only update if timeout is defined
                const updates: Partial<Monitor> = {};
                if (timeout !== undefined) {
                    updates.timeout = timeout;
                }

                const updatedSite = updateMonitorInSite(site, monitorId, updates);
                await SiteService.updateSite(siteId, { monitors: updatedSite.monitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    updateSiteCheckInterval: async (siteId: string, monitorId: string, interval: number) => {
        logStoreAction("SitesStore", "updateSiteCheckInterval", { interval, monitorId, siteId });

        await withErrorHandling(
            async () => {
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                const updatedSite = updateMonitorInSite(site, monitorId, { checkInterval: interval });
                await SiteService.updateSite(siteId, { monitors: updatedSite.monitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
});
