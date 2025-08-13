/**
 * Base operations types shared across site management functionality.
 * Eliminates code duplication between different store modules.
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

/**
 * Common site CRUD operations interface.
 * Used by both SiteOperationsActions and SitesActions to eliminate
 * duplication.
 */
export interface BaseSiteOperations {
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
    /** Remove a monitor from a site */
    removeMonitorFromSite: (siteId: string, monitorId: string) => Promise<void>;
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

/**
 * Common site monitoring operations interface.
 * Shared between different monitoring-related modules.
 */
export interface BaseSiteMonitoring {
    /** Check a site now */
    checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
    /** Start monitoring for a site */
    startSiteMonitoring: (siteId: string) => Promise<void>;
    /** Start monitoring for a specific site monitor */
    startSiteMonitorMonitoring: (
        siteId: string,
        monitorId: string
    ) => Promise<void>;
    /** Stop monitoring for a site */
    stopSiteMonitoring: (siteId: string) => Promise<void>;
    /** Stop monitoring for a specific site monitor */
    stopSiteMonitorMonitoring: (
        siteId: string,
        monitorId: string
    ) => Promise<void>;
}

/**
 * Common site synchronization operations interface.
 * Shared between different sync-related modules.
 */
export interface BaseSiteSync {
    /** Full sync from backend */
    fullSyncFromBackend: () => Promise<void>;
    /** Get sync status */
    getSyncStatus: () => Promise<{
        lastSync: null | number | undefined;
        siteCount: number;
        success: boolean;
        synchronized: boolean;
    }>;
    /** Subscribe to sync events */
    subscribeToSyncEvents: () => () => void;
    /** Sync sites from backend */
    syncSitesFromBackend: () => Promise<void>;
}

/**
 * Common site state management interface.
 * Shared between different state modules.
 */
export interface BaseSiteState {
    /** Add a site to the store */
    addSite: (site: Site) => void;
    /** Get selected monitor ID for a site */
    getSelectedMonitorId: (siteId: string) => string | undefined;
    /** Get the currently selected site */
    getSelectedSite: () => Site | undefined;
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (siteId: string, monitorId: string) => void;
    /** Set selected site */
    setSelectedSite: (site: Site | undefined) => void;
    /** Set all sites */
    setSites: (sites: Site[]) => void;
    /** Update a site */
    updateSite: (site: Site) => void;
}

/**
 * Common site subscription interface.
 * Shared between different subscription modules.
 */
export interface BaseSiteSubscriptions {
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (
        callback: (update: StatusUpdate) => void
    ) => void;
    /** Unsubscribe from status updates */
    unsubscribeFromStatusUpdates: () => void;
}
