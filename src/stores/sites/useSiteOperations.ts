/**
 * Site operations module.
 * Handles CRUD operations for sites and monitor management.
 *
 * Uses centralized error store for consistent error handling across the application.
 */

import { ERROR_MESSAGES, type Monitor, type MonitorType, type Site } from "@shared/types";

import { isDevelopment } from "../../../shared/utils/environment";
import logger from "../../services/logger";
import { safeExtractIpcData } from "../../types/ipc";
import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction, withErrorHandling } from "../utils";
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

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                // Get the current site
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                // Allow multiple monitors of the same type
                const updatedMonitors = [...site.monitors, monitor];
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("addMonitorToSite", loading),
            }
        );
    },
    createSite: async (siteData) => {
        logStoreAction("SitesStore", "createSite", { siteData });

        const errorStore = useErrorStore.getState();
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

                const response = await window.electronAPI.sites.addSite(completeSite);
                const newSite = safeExtractIpcData(response, completeSite);
                deps.addSite(newSite);
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("createSite", loading),
            }
        );
    },
    deleteSite: async (identifier: string) => {
        logStoreAction("SitesStore", "deleteSite", { identifier });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                // Stop monitoring for all monitors of this site before deleting
                // Filter out null/undefined values to handle corrupted data
                const site = deps.getSites().find((s) => s.identifier === identifier);
                if (site?.monitors) {
                    for (const monitor of site.monitors) {
                        try {
                            await window.electronAPI.monitoring.stopMonitoringForSite(identifier, monitor.id);
                        } catch (error) {
                            // Log but do not block deletion if stopping fails
                            if (isDevelopment()) {
                                logger.warn(
                                    `Failed to stop monitoring for monitor ${monitor.id} of site ${identifier}`,
                                    error instanceof Error ? error : new Error(String(error))
                                );
                            }
                        }
                    }
                }
                await window.electronAPI.sites.removeSite(identifier);
                deps.removeSite(identifier);
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("deleteSite", loading),
            }
        );
    },
    downloadSQLiteBackup: async () => {
        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                // eslint-disable-next-line ex/no-unhandled
                await handleSQLiteBackupDownload(async () => {
                    try {
                        const response = await window.electronAPI.data.downloadSQLiteBackup();
                        const result = safeExtractIpcData(response, { buffer: new ArrayBuffer(0) });
                        return new Uint8Array(result.buffer);
                    } catch (error) {
                        console.error("Failed to download SQLite backup:", error);
                        throw error;
                    }
                });
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("downloadSQLiteBackup", loading),
            }
        );

        logStoreAction("SitesStore", "downloadSQLiteBackup", {
            message: "SQLite backup download completed",
            success: true,
        });
    },
    initializeSites: async () => {
        const errorStore = useErrorStore.getState();
        const result = await withErrorHandling(
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
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("initializeSites", loading),
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

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                await window.electronAPI.sites.updateSite(identifier, updates);
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("modifySite", loading),
            }
        );
    },
    removeMonitorFromSite: async (siteId, monitorId) => {
        logStoreAction("SitesStore", "removeMonitorFromSite", { monitorId, siteId });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                // Get the current site
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                // Check if this is the only monitor - prevent removal if so
                if (site.monitors.length <= 1) {
                    throw new Error(ERROR_MESSAGES.CANNOT_REMOVE_LAST_MONITOR);
                }

                // Stop monitoring for this specific monitor first
                try {
                    await window.electronAPI.monitoring.stopMonitoringForSite(siteId, monitorId);
                } catch (error) {
                    // Log but do not block removal if stopping fails
                    if (isDevelopment()) {
                        logger.warn(
                            `Failed to stop monitoring for monitor ${monitorId} of site ${siteId}`,
                            error instanceof Error ? error : new Error(String(error))
                        );
                    }
                }

                // Remove the monitor via backend
                await window.electronAPI.sites.removeMonitor(siteId, monitorId);

                // Refresh site data from backend
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("removeMonitorFromSite", loading),
            }
        );
    },
    updateMonitorRetryAttempts: async (siteId: string, monitorId: string, retryAttempts: number | undefined) => {
        logStoreAction("SitesStore", "updateMonitorRetryAttempts", { monitorId, retryAttempts, siteId });

        const errorStore = useErrorStore.getState();
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
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedSite.monitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("updateMonitorRetryAttempts", loading),
            }
        );
    },
    updateMonitorTimeout: async (siteId: string, monitorId: string, timeout: number | undefined) => {
        logStoreAction("SitesStore", "updateMonitorTimeout", { monitorId, siteId, timeout });

        const errorStore = useErrorStore.getState();
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
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedSite.monitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("updateMonitorTimeout", loading),
            }
        );
    },
    updateSiteCheckInterval: async (siteId: string, monitorId: string, interval: number) => {
        logStoreAction("SitesStore", "updateSiteCheckInterval", { interval, monitorId, siteId });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                const site = deps.getSites().find((s) => s.identifier === siteId);
                if (!site) {
                    throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                }

                const updatedSite = updateMonitorInSite(site, monitorId, { checkInterval: interval });
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedSite.monitors });
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => errorStore.clearStoreError("sites-operations"),
                setError: (error) => errorStore.setStoreError("sites-operations", error),
                setLoading: (loading) => errorStore.setOperationLoading("updateSiteCheckInterval", loading),
            }
        );
    },
});
