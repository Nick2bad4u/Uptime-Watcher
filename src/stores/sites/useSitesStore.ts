/**
 * Sites store for managing site data and operations.
 * Handles CRUD operations, monitoring, and status updates for all sites.
 */

import { create } from "zustand";

import type { Monitor, MonitorType, Site, StatusUpdate } from "../../types";
import type { SitesStore } from "./types";

import { ERROR_MESSAGES } from "../types";
import { logStoreAction, withErrorHandling } from "../utils";

export const useSitesStore = create<SitesStore>((set, get) => ({
    // Actions
    addMonitorToSite: async (siteId, monitor) => {
        logStoreAction("SitesStore", "addMonitorToSite", { monitor, siteId });

        await withErrorHandling(
            async () => {
                // Get the current site
                const site = get().sites.find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                // Allow multiple monitors of the same type
                const updatedMonitors = [...site.monitors, monitor];
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
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
                await window.electronAPI.sites.checkSiteNow(siteId, monitorId);
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
                                  status: "pending",
                                  type: "http" as MonitorType,
                              },
                          ]
                ).map((monitor) => ({
                    ...monitor,
                    id: monitor.id || crypto.randomUUID(),
                    monitoring: typeof monitor.monitoring === "undefined" ? true : monitor.monitoring,
                    status: ["pending", "up", "down"].includes(monitor.status)
                        ? (monitor.status as Monitor["status"])
                        : "pending",
                    type: monitor.type,
                }));

                const newSite = await window.electronAPI.sites.addSite({ ...siteData, monitors });
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
                            await window.electronAPI.monitoring.stopMonitoringForSite(identifier, monitor.id);
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
                await window.electronAPI.sites.removeSite(identifier);
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
                // Request SQLite file as ArrayBuffer from preload
                const { buffer, fileName } = await window.electronAPI.data.downloadSQLiteBackup();
                if (!buffer) throw new Error("No backup data received");

                // Create a Blob and trigger download
                const blob = new Blob([buffer], { type: "application/x-sqlite3" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName || `uptime-watcher-backup-${new Date().toISOString().split("T")[0]}.sqlite`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
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
                const sites = await window.electronAPI.sites.getSites();
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
                await window.electronAPI.sites.updateSite(identifier, updates);
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
    // State
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
                await window.electronAPI.monitoring.startMonitoringForSite(siteId, monitorId);
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
                await window.electronAPI.monitoring.stopMonitoringForSite(siteId, monitorId);
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

        window.electronAPI.events.onStatusUpdate((update: StatusUpdate) => {
            try {
                // Validate update payload
                if (!update?.site) {
                    throw new Error("Invalid status update: update or update.site is null/undefined");
                }

                // Smart incremental update - use the payload data directly
                const state = get();
                const updatedSites = state.sites.map((site) => {
                    if (site.identifier === update.site.identifier) {
                        // Use the complete updated site data from the backend
                        return { ...update.site };
                    }
                    return site; // Keep other sites unchanged
                });

                // Check if the site was actually found and updated
                const siteFound = state.sites.some((site) => site.identifier === update.site.identifier);

                if (siteFound) {
                    // Update store state efficiently
                    get().setSites(updatedSites);
                } else {
                    // Site not found in current state - trigger full sync as fallback
                    if (process.env.NODE_ENV === "development") {
                        console.warn(`Site ${update.site.identifier} not found in store, triggering full sync`);
                    }
                    get()
                        .fullSyncFromBackend()
                        .catch((error) => {
                            if (process.env.NODE_ENV === "development") {
                                console.error("Fallback full sync failed:", error);
                            }
                        });
                }

                // Call the provided callback
                if (callback) callback(update);
            } catch (error) {
                console.error("Error processing status update:", error);
                // Fallback to full sync on any processing error
                get()
                    .fullSyncFromBackend()
                    .catch((syncError) => {
                        console.error("Fallback sync after error failed:", syncError);
                    });
            }
        });
    },
    syncSitesFromBackend: async () => {
        logStoreAction("SitesStore", "syncSitesFromBackend");

        await withErrorHandling(
            async () => {
                const backendSites = await window.electronAPI.sites.getSites();
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
        window.electronAPI.events.removeAllListeners("status-update");
    },
    updateMonitorRetryAttempts: async (siteId: string, monitorId: string, retryAttempts: number | undefined) => {
        logStoreAction("SitesStore", "updateMonitorRetryAttempts", { monitorId, retryAttempts, siteId });

        await withErrorHandling(
            async () => {
                const site = get().sites.find((s) => s.identifier === siteId);
                if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);

                const updatedMonitors = site.monitors.map((monitor) =>
                    monitor.id === monitorId ? { ...monitor, retryAttempts: retryAttempts } : monitor
                );
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
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

                const updatedMonitors = site.monitors.map((monitor) =>
                    monitor.id === monitorId ? { ...monitor, timeout: timeout } : monitor
                );
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
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

                const updatedMonitors = site.monitors.map((monitor) =>
                    monitor.id === monitorId ? { ...monitor, checkInterval: interval } : monitor
                );
                await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
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
