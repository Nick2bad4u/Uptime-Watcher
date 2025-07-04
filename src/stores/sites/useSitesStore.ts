/**
 * Sites store for managing site data and operations.
 * Handles CRUD operations, monitoring, and status updates for all sites.
 *
 * Refactored to use modular architecture with separate services and utilities.
 */

import { create } from "zustand";

import type { Monitor, MonitorType, Site, StatusUpdate } from "../../types";
import type { SitesStore } from "./types";

import { ERROR_MESSAGES } from "../types";
import { logStoreAction, withErrorHandling } from "../utils";
import { MonitoringService, SiteService } from "./services";
import {
    StatusUpdateManager,
    createStatusUpdateHandler,
    handleSQLiteBackupDownload,
    normalizeMonitor,
    updateMonitorInSite,
} from "./utils";

// Create a shared status update manager instance
const statusUpdateManager = new StatusUpdateManager();

export const useSitesStore = create<SitesStore>((set, get) => ({
    addMonitorToSite: async (siteId, monitor) => {
        logStoreAction("SitesStore", "addMonitorToSite", { monitor, siteId });

        await withErrorHandling(
            async () => {
                // Get the current site
                const site = get().sites.find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                // Allow multiple monitors of the same type
                const updatedMonitors = [...site.monitors, monitor];
                await SiteService.updateSite(siteId, { monitors: updatedMonitors });
                await get().syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    addSite: (site: Site) => {
        logStoreAction("SitesStore", "addSite", { site });
        set((state) => ({ sites: [...state.sites, site] }));
    },
    checkSiteNow: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "checkSiteNow", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                await SiteService.checkSiteNow(siteId, monitorId);
                // Backend will emit 'status-update', which will trigger incremental update
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
                get().addSite(newSite);
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
                const site = get().sites.find((s) => s.identifier === identifier);
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
                get().removeSite(identifier);
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
    fullSyncFromBackend: async () => {
        logStoreAction("SitesStore", "fullSyncFromBackend");
        await get().syncSitesFromBackend();
    },
    getSelectedMonitorId: (siteId) => {
        const ids = get().selectedMonitorIds || {};
        // eslint-disable-next-line security/detect-object-injection
        return ids[siteId];
    },
    getSelectedSite: () => {
        const { selectedSiteId, sites } = get();
        if (!selectedSiteId) return undefined;
        return sites.find((s) => s.identifier === selectedSiteId) || undefined;
    },
    initializeSites: async () => {
        logStoreAction("SitesStore", "initializeSites");

        await withErrorHandling(
            async () => {
                const sites = await SiteService.getSites();
                get().setSites(sites);
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
                await get().syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    removeSite: (identifier: string) => {
        logStoreAction("SitesStore", "removeSite", { identifier });
        set((state) => ({
            selectedSiteId:
                state.selectedSiteId &&
                state.sites.find((s) => s.identifier === identifier && s.identifier === state.selectedSiteId)
                    ? undefined
                    : state.selectedSiteId,
            sites: state.sites.filter((site) => site.identifier !== identifier),
        }));
    },
    selectedMonitorIds: {},
    selectedSiteId: undefined,
    setSelectedMonitorId: (siteId, monitorId) => {
        logStoreAction("SitesStore", "setSelectedMonitorId", { monitorId, siteId });
        set((state) => ({
            selectedMonitorIds: {
                ...state.selectedMonitorIds,
                [siteId]: monitorId,
            },
        }));
    },
    setSelectedSite: (site: Site | undefined) => {
        logStoreAction("SitesStore", "setSelectedSite", { site });
        set({ selectedSiteId: site ? site.identifier : undefined });
    },
    setSites: (sites: Site[]) => {
        logStoreAction("SitesStore", "setSites", { count: sites.length });
        set({ sites });
    },
    sites: [],
    startSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "startSiteMonitorMonitoring", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.startMonitoring(siteId, monitorId);
                await get().syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    stopSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "stopSiteMonitorMonitoring", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.stopMonitoring(siteId, monitorId);
                await get().syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
        logStoreAction("SitesStore", "subscribeToStatusUpdates");

        const handler = createStatusUpdateHandler({
            fullSyncFromBackend: get().fullSyncFromBackend,
            getSites: () => get().sites,
            onUpdate: callback,
            setSites: get().setSites,
        });

        statusUpdateManager.subscribe(handler).catch((error) => {
            console.error("Failed to subscribe to status updates:", error);
        });
    },
    syncSitesFromBackend: async () => {
        logStoreAction("SitesStore", "syncSitesFromBackend");

        await withErrorHandling(
            async () => {
                const backendSites = await SiteService.getSites();
                get().setSites(backendSites);
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    unsubscribeFromStatusUpdates: () => {
        logStoreAction("SitesStore", "unsubscribeFromStatusUpdates");
        statusUpdateManager.unsubscribe();
    },
    updateMonitorRetryAttempts: async (siteId: string, monitorId: string, retryAttempts: number | undefined) => {
        logStoreAction("SitesStore", "updateMonitorRetryAttempts", { monitorId, retryAttempts, siteId });

        await withErrorHandling(
            async () => {
                const site = get().sites.find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                const updatedSite = updateMonitorInSite(site, monitorId, { retryAttempts });
                await SiteService.updateSite(siteId, { monitors: updatedSite.monitors });
                await get().syncSitesFromBackend();
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
                const site = get().sites.find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                const updatedSite = updateMonitorInSite(site, monitorId, { timeout });
                await SiteService.updateSite(siteId, { monitors: updatedSite.monitors });
                await get().syncSitesFromBackend();
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
                const site = get().sites.find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                const updatedSite = updateMonitorInSite(site, monitorId, { checkInterval: interval });
                await SiteService.updateSite(siteId, { monitors: updatedSite.monitors });
                await get().syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
}));
