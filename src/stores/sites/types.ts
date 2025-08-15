/**
 * Sites store types and interfaces.
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

export interface SitesActions {
    /** Add a monitor to an existing site */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;
    /** Add a site to the store */
    addSite: (site: Site) => void;
    /** Check a site now */
    checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
    /** Create a new site */
    createSite: (siteData: {
        identifier: string;
        monitors?: Monitor[];
        name?: string;
    }) => Promise<void>;
    /** Delete a site */
    deleteSite: (identifier: string) => Promise<void>;
    /** Download SQLite backup */
    downloadSQLiteBackup: () => Promise<void>;
    /** Full sync from backend */
    fullSyncFromBackend: () => Promise<void>;
    /** Get selected monitor ID for a site */
    getSelectedMonitorId: (siteId: string) => string | undefined;
    /** Get the currently selected site */
    getSelectedSite: () => Site | undefined;
    /** Get sync status */
    getSyncStatus: () => Promise<{
        lastSync: null | number | undefined;
        siteCount: number;
        success: boolean;
        synchronized: boolean;
    }>;
    /** Initialize sites data from backend */
    initializeSites: () => Promise<{
        message: string;
        sitesLoaded: number;
        success: boolean;
    }>;
    /** Modify an existing site */
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
    /** Remove a monitor from a site */
    removeMonitorFromSite: (siteId: string, monitorId: string) => Promise<void>;
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (siteId: string, monitorId: string) => void;
    /** Set selected site */
    setSelectedSite: (site: Site | undefined) => void;
    /** Set sites data */
    setSites: (sites: Site[]) => void;
    /** Start monitoring for all monitors of a site */
    startSiteMonitoring: (siteId: string) => Promise<void>;
    /** Start monitoring for a site monitor */
    startSiteMonitorMonitoring: (
        siteId: string,
        monitorId: string
    ) => Promise<void>;
    /** Stop monitoring for all monitors of a site */
    stopSiteMonitoring: (siteId: string) => Promise<void>;
    /** Stop monitoring for a site monitor */
    stopSiteMonitorMonitoring: (
        siteId: string,
        monitorId: string
    ) => Promise<void>;
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (
        callback: (update: StatusUpdate) => void
    ) => void;
    /** Subscribe to sync events */
    subscribeToSyncEvents: () => () => void;
    /** Sync sites from backend */
    syncSitesFromBackend: () => Promise<void>;
    /** Unsubscribe from status updates */
    unsubscribeFromStatusUpdates: () => void;
    /** Update monitor retry attempts */
    updateMonitorRetryAttempts: (
        siteId: string,
        monitorId: string,
        retryAttempts: number
    ) => Promise<void>;
    /** Update monitor timeout */
    updateMonitorTimeout: (
        siteId: string,
        monitorId: string,
        timeout: number
    ) => Promise<void>;
    /** Update site check interval */
    updateSiteCheckInterval: (
        siteId: string,
        monitorId: string,
        interval: number
    ) => Promise<void>;
}

export interface SitesState {
    /** Selected monitor IDs per site (UI state, not persisted) */
    selectedMonitorIds: Record<string, string>;
    /** Currently selected site identifier */
    selectedSiteId: string | undefined;
    /** Array of monitored sites */
    sites: Site[];
}

/**
 * Combined interface for Sites store actions and state. Provides a complete
 * interface for site management functionality.
 */
export type SitesStore = SitesActions & SitesState;

/**
 * Dependencies interface for site operations. Defines the minimal interface
 * needed by operation helpers.
 */
export interface SiteOperationsDependencies {
    addSite: (site: Site) => void;
    getSites: () => Site[];
    removeSite: (identifier: string) => void;
    setSites: (sites: Site[]) => void;
    syncSitesFromBackend: () => Promise<void>;
}
