/**
 * Sites store types and interfaces.
 *
 * @remarks
 * Defines the contract for sites store including actions, state, and
 * dependencies for managing site data and operations.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";
import type { StateSyncStatusSummary } from "@shared/types/stateSync";
import type { Simplify } from "type-fest";

import type {
    StatusUpdateSubscriptionSummary,
    StatusUpdateUnsubscribeResult,
} from "./baseTypes";

/**
 * Sites store actions interface for managing site operations.
 *
 * @remarks
 * Comprehensive interface defining all site management operations including
 * CRUD operations, monitoring control, and synchronization functionality.
 *
 * @public
 */
export interface SitesActions {
    /** Add a monitor to an existing site */
    addMonitorToSite: (
        siteIdentifier: string,
        monitor: Monitor
    ) => Promise<void>;
    /** Add a site to the store */
    addSite: (site: Site) => void;
    /** Check a site now */
    checkSiteNow: (siteIdentifier: string, monitorId: string) => Promise<void>;
    /** Create a new site */
    createSite: (siteData: {
        identifier: string;
        monitors?: Monitor[];
        name?: string;
    }) => Promise<void>;
    /** Delete a site */
    deleteSite: (identifier: string) => Promise<void>;
    /** Download SQLite backup */
    downloadSqliteBackup: () => Promise<void>;
    /**
     * Performs complete resynchronization of all sites data from backend.
     *
     * @remarks
     * Executes a full data refresh from the backend, clearing local state and
     * rebuilding it with the latest server data. This method ensures complete
     * data consistency between client and server.
     *
     * @returns Promise that resolves when full resync is complete
     */
    fullResyncSites: () => Promise<void>;
    /** Get selected monitor ID for a site */
    getSelectedMonitorId: (siteIdentifier: string) => string | undefined;
    /** Get the currently selected site */
    getSelectedSite: () => Site | undefined;
    /** Get sync status */
    getSyncStatus: () => Promise<StateSyncStatusSummary>;
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
    /** Remove a monitor from a site */
    removeMonitorFromSite: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** Retry status update subscription */
    retryStatusSubscription: (
        callback?: (update: StatusUpdate) => void
    ) => Promise<StatusUpdateSubscriptionSummary>;
    /**
     * Selects a site for focused operations and UI display.
     *
     * @remarks
     * Updates the currently selected site with proper state management. This
     * method provides clear site selection semantics for better code
     * readability.
     *
     * @param site - Site to select, or undefined to clear selection
     */
    selectSite: (site: Site | undefined) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (siteIdentifier: string, monitorId: string) => void;
    /** Set sites data */
    setSites: (sites: Site[]) => void;
    /** Persist subscription diagnostics for status updates */
    setStatusSubscriptionSummary: (
        summary: StatusUpdateSubscriptionSummary | undefined
    ) => void;
    /** Start monitoring for all monitors of a site */
    startSiteMonitoring: (siteIdentifier: string) => Promise<void>;
    /** Start monitoring for a site monitor */
    startSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /** Stop monitoring for all monitors of a site */
    stopSiteMonitoring: (siteIdentifier: string) => Promise<void>;
    /** Stop monitoring for a site monitor */
    stopSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (
        callback?: (update: StatusUpdate) => void
    ) => Promise<StatusUpdateSubscriptionSummary>;
    /** Subscribe to sync events */
    subscribeToSyncEvents: () => () => void;
    /**
     * Synchronizes sites data with backend while preserving local state.
     *
     * @remarks
     * Updates local sites data by fetching changes from the backend without
     * clearing existing state. This method preserves local modifications and
     * merges backend updates efficiently.
     *
     * @returns Promise that resolves when sync is complete
     */
    syncSites: () => Promise<void>;
    /** Unsubscribe from status updates */
    unsubscribeFromStatusUpdates: () => StatusUpdateUnsubscribeResult;
    /** Update monitor retry attempts */
    updateMonitorRetryAttempts: (
        siteIdentifier: string,
        monitorId: string,
        retryAttempts: number
    ) => Promise<void>;
    /** Update monitor timeout */
    updateMonitorTimeout: (
        siteIdentifier: string,
        monitorId: string,
        timeout: number
    ) => Promise<void>;
    /** Update site check interval */
    updateSiteCheckInterval: (
        siteIdentifier: string,
        monitorId: string,
        interval: number
    ) => Promise<void>;
}

/**
 * Sites store state interface for managing site data.
 *
 * @remarks
 * Defines the state structure for site management including current sites,
 * selected site tracking, and UI state for monitor selection.
 *
 * @public
 */
export interface SitesState {
    /** Selected monitor IDs per site (UI state, not persisted) */
    selectedMonitorIds: Record<string, string>;
    /** Currently selected site identifier */
    selectedSiteIdentifier: string | undefined;
    /** Array of monitored sites */
    sites: Site[];
    /** Latest subscription diagnostics for monitoring status updates */
    statusSubscriptionSummary: StatusUpdateSubscriptionSummary | undefined;
}

/**
 * Combined interface for Sites store actions and state. Provides a complete
 * interface for site management functionality with flattened type display.
 *
 * @public
 */
export type SitesStore = Simplify<SitesActions & SitesState>;

/**
 * Dependencies interface for site operations. Defines the minimal interface
 * needed by operation helpers.
 *
 * @remarks
 * Provides the essential dependencies required by site operation utilities to
 * perform CRUD operations and synchronization tasks.
 *
 * @public
 */
export interface SiteOperationsDependencies {
    /** Get all current sites from the store */
    getSites: () => Site[];
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** External service dependencies required for operations */
    services: SiteOperationsServiceDependencies;
    /** Replace all sites in the store */
    setSites: (sites: Site[]) => void;
    /** Synchronize sites from backend storage */
    syncSites: () => Promise<void>;
}

/**
 * External services consumed by site operations.
 *
 * @public
 */
export interface SiteOperationsServiceDependencies {
    /** Data export operations */
    data: Pick<DataBackupService, "downloadSqliteBackup">;
    /** Site service operations */
    site: Pick<
        SiteDataService,
        "addSite" | "getSites" | "removeMonitor" | "removeSite" | "updateSite"
    >;
}

interface SiteDataService {
    addSite: (site: Site) => Promise<Site>;
    getSites: () => Promise<Site[]>;
    removeMonitor: (siteIdentifier: string, monitorId: string) => Promise<Site>;
    removeSite: (identifier: string) => Promise<boolean>;
    updateSite: (identifier: string, updates: Partial<Site>) => Promise<Site>;
}

interface DataBackupService {
    downloadSqliteBackup: () => Promise<SerializedDatabaseBackupResult>;
}
