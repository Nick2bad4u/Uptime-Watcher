/**
 * Sites store types and interfaces.
 */

import type { Site, StatusUpdate, Monitor } from "../../types";

export interface SitesState {
    /** Array of monitored sites */
    sites: Site[];
    /** Selected monitor IDs per site (UI state, not persisted) */
    selectedMonitorIds: Record<string, string>;
    /** Currently selected site identifier */
    selectedSiteId: string | undefined;
}

export interface SitesActions {
    /** Initialize sites data from backend */
    initializeSites: () => Promise<void>;
    /** Create a new site */
    createSite: (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => Promise<void>;
    /** Delete a site */
    deleteSite: (identifier: string) => Promise<void>;
    /** Check a site now */
    checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
    /** Modify an existing site */
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
    /** Update site check interval */
    updateSiteCheckInterval: (siteId: string, monitorId: string, interval: number) => Promise<void>;
    /** Update monitor retry attempts */
    updateMonitorRetryAttempts: (siteId: string, monitorId: string, retryAttempts: number | undefined) => Promise<void>;
    /** Update monitor timeout */
    updateMonitorTimeout: (siteId: string, monitorId: string, timeout: number | undefined) => Promise<void>;
    /** Start monitoring for a site monitor */
    startSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
    /** Stop monitoring for a site monitor */
    stopSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
    /** Add a monitor to an existing site */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
    /** Sync sites from backend */
    syncSitesFromBackend: () => Promise<void>;
    /** Full sync from backend */
    fullSyncFromBackend: () => Promise<void>;
    /** Set sites data */
    setSites: (sites: Site[]) => void;
    /** Add a site to the store */
    addSite: (site: Site) => void;
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** Set selected site */
    setSelectedSite: (site: Site | undefined) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (siteId: string, monitorId: string) => void;
    /** Get selected monitor ID for a site */
    getSelectedMonitorId: (siteId: string) => string | undefined;
    /** Get the currently selected site */
    getSelectedSite: () => Site | undefined;
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => void;
    /** Unsubscribe from status updates */
    unsubscribeFromStatusUpdates: () => void;
    /** Download SQLite backup */
    downloadSQLiteBackup: () => Promise<void>;
}

export type SitesStore = SitesState & SitesActions;
