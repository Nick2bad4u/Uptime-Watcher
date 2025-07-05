/**
 * Site operations module.
 * Handles CRUD operations for sites and monitor management.
 */

import type { Monitor, MonitorType, Site } from "../../types";

import { ERROR_MESSAGES } from "../types";
import { logStoreAction, withErrorHandling } from "../utils";
import { MonitoringService, SiteService } from "./services";
import { normalizeMonitor, updateMonitorInSite, handleSQLiteBackupDownload } from "./utils";

export interface SiteOperationsActions {
    /** Initialize sites data from backend */
    initializeSites: () => Promise<void>;
    /** Create a new site */
    createSite: (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => Promise<void>;
    /** Delete a site */
    deleteSite: (identifier: string) => Promise<void>;
    /** Modify an existing site */
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
    /** Add a monitor to an existing site */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
    /** Update site check interval */
    updateSiteCheckInterval: (siteId: string, monitorId: string, interval: number) => Promise<void>;
    /** Update monitor retry attempts */
    updateMonitorRetryAttempts: (siteId: string, monitorId: string, retryAttempts: number | undefined) => Promise<void>;
    /** Update monitor timeout */
    updateMonitorTimeout: (siteId: string, monitorId: string, timeout: number | undefined) => Promise<void>;
    /** Download SQLite backup */
    downloadSQLiteBackup: () => Promise<void>;
}

export interface SiteOperationsDependencies {
    getSites: () => Site[];
    addSite: (site: Site) => void;
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
                const site = deps
                    .getSites()
                    .filter((s) => s !== null && s !== undefined)
                    .find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

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

                const newSite = await SiteService.addSite({ ...siteData, monitors });
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
                const site = deps
                    .getSites()
                    .filter((s) => s !== null && s !== undefined)
                    .find((s) => s.identifier === identifier);
                if (site) {
                    for (const monitor of site.monitors) {
                        try {
                            await MonitoringService.stopMonitoring(identifier, monitor.id);
                        } catch (err) {
                            // Log but do not block deletion if stopping fails
                            if (process.env.NODE_ENV === "development") {
                                console.warn(
                                    `Failed to stop monitoring for monitor ${monitor.id} of site ${identifier}:`,
                                    err
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
        logStoreAction("SitesStore", "downloadSQLiteBackup");

        await withErrorHandling(
            async () => {
                await handleSQLiteBackupDownload(async () => {
                    const result = await SiteService.downloadSQLiteBackup();
                    if (!result.buffer) {
                        throw new Error("No backup data received");
                    }
                    return new Uint8Array(result.buffer);
                });
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    initializeSites: async () => {
        logStoreAction("SitesStore", "initializeSites");

        await withErrorHandling(
            async () => {
                const sites = await SiteService.getSites();
                deps.setSites(sites);
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
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
    updateMonitorRetryAttempts: async (siteId: string, monitorId: string, retryAttempts: number | undefined) => {
        logStoreAction("SitesStore", "updateMonitorRetryAttempts", { monitorId, retryAttempts, siteId });

        await withErrorHandling(
            async () => {
                const site = deps
                    .getSites()
                    .filter((s) => s !== null && s !== undefined)
                    .find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                const updatedSite = updateMonitorInSite(site, monitorId, { retryAttempts });
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
                const site = deps
                    .getSites()
                    .filter((s) => s !== null && s !== undefined)
                    .find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                const updatedSite = updateMonitorInSite(site, monitorId, { timeout });
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
                const site = deps
                    .getSites()
                    .filter((s) => s !== null && s !== undefined)
                    .find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

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
