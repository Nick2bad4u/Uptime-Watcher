/**
 * Base operations types shared across site management functionality. Eliminates
 * code duplication between different store modules.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";
import type { StateSyncStatusSummary } from "@shared/types/stateSync";

/**
 * Attachment state metadata for a realtime listener channel.
 */
export interface ListenerAttachmentState {
    /** Whether the listener attached successfully. */
    readonly attached: boolean;
    /** Unique listener identifier or scope. */
    readonly name: string;
}

/**
 * Summary returned after attempting to subscribe to status updates.
 */
export interface StatusUpdateSubscriptionSummary {
    /** Collected errors encountered while attaching listeners. */
    errors: string[];
    /** Total number of listeners the subscription attempted to attach. */
    expectedListeners: number;
    /** Number of listeners successfully attached. */
    listenersAttached: number;
    /** Attachment diagnostics for each listener scope. */
    listenerStates: ListenerAttachmentState[];
    /** Human-friendly message describing the outcome. */
    message: string;
    /** Whether the subscription succeeded and listeners are active. */
    subscribed: boolean;
    /** Convenience success flag mirroring overall subscription status. */
    success: boolean;
}

/**
 * Summary returned after unsubscribing from status updates.
 */
export interface StatusUpdateUnsubscribeResult {
    /** Human-readable description of the unsubscription outcome. */
    message: string;
    /** Whether the unsubscription request completed successfully. */
    success: boolean;
    /** Indicates if listeners were detached as part of the operation. */
    unsubscribed: boolean;
}

/**
 * Common site CRUD operations interface used by both SiteOperationsActions and
 * SitesActions to eliminate duplication.
 *
 * @public
 */
export interface BaseSiteOperations {
    /** Add a monitor to an existing site */
    addMonitorToSite: (
        siteIdentifier: string,
        monitor: Monitor
    ) => Promise<void>;
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
    downloadSqliteBackup: () => Promise<SerializedDatabaseBackupResult>;
    /** Remove a monitor from a site */
    removeMonitorFromSite: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /** Restore SQLite backup */
    restoreSqliteBackup: (
        payload: SerializedDatabaseRestorePayload
    ) => Promise<SerializedDatabaseRestoreResult>;
    /** Save SQLite backup via main process */
    saveSqliteBackup: () => Promise<SerializedDatabaseBackupSaveResult>;
    /** Update monitor retry attempts */
    updateMonitorRetryAttempts: (
        siteIdentifier: string,
        monitorId: string,
        /**
         * New retry-attempts value. When `undefined`, the helper performs a
         * no-op update for this field while still executing the underlying
         * monitor update pipeline.
         */
        retryAttempts: number | undefined
    ) => Promise<void>;
    /** Update monitor timeout */
    updateMonitorTimeout: (
        siteIdentifier: string,
        monitorId: string,
        /**
         * New timeout value in milliseconds. When `undefined`, the helper
         * leaves the existing timeout unchanged while still participating in
         * the shared update pipeline.
         */
        timeout: number | undefined
    ) => Promise<void>;
    /** Update site check interval */
    updateSiteCheckInterval: (
        siteIdentifier: string,
        monitorId: string,
        interval: number
    ) => Promise<void>;
}

/**
 * Common site monitoring operations interface. Shared between different
 * monitoring-related modules.
 *
 * @public
 */
export interface BaseSiteMonitoring {
    /** Check a site now */
    checkSiteNow: (siteIdentifier: string, monitorId: string) => Promise<void>;
    /** Start monitoring for a site */
    startSiteMonitoring: (siteIdentifier: string) => Promise<void>;
    /** Start monitoring for a specific site monitor */
    startSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /** Stop monitoring for a site */
    stopSiteMonitoring: (siteIdentifier: string) => Promise<void>;
    /** Stop monitoring for a specific site monitor */
    stopSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
}

/**
 * Common site synchronization operations interface. Shared between different
 * sync-related modules.
 *
 * @public
 */
export interface BaseSiteSync {
    /** Full resync from backend */
    fullResyncSites: () => Promise<void>;
    /** Get sync status */
    getSyncStatus: () => Promise<StateSyncStatusSummary>;
    /** Subscribe to sync events */
    subscribeToSyncEvents: () => () => void;
    /** Sync sites from backend */
    syncSites: () => Promise<void>;
}

/**
 * Common site state management interface. Shared between different state
 * modules.
 *
 * @public
 */
export interface BaseSiteState {
    /** Add a site to the store */
    addSite: (site: Site) => void;
    /** Get selected monitor ID for a site */
    getSelectedMonitorId: (siteIdentifier: string) => string | undefined;
    /** Get the currently selected site */
    getSelectedSite: () => Site | undefined;
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** Select site */
    selectSite: (site: Site | undefined) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (siteIdentifier: string, monitorId: string) => void;
    /** Set all sites */
    setSites: (sites: Site[]) => void;
    /** Persist subscription diagnostics */
    setStatusSubscriptionSummary: (
        summary: StatusUpdateSubscriptionSummary | undefined
    ) => void;
    /** Update a site */
    updateSite: (site: Site) => void;
}

/**
 * Common site subscription interface. Shared between different subscription
 * modules.
 *
 * @public
 */
export interface BaseSiteSubscriptions {
    /** Retry status update subscription using the last known callback */
    retryStatusSubscription: (
        callback?: (update: StatusUpdate) => void
    ) => Promise<StatusUpdateSubscriptionSummary>;
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (
        callback?: (update: StatusUpdate) => void
    ) => Promise<StatusUpdateSubscriptionSummary>;
    /** Unsubscribe from status updates */
    unsubscribeFromStatusUpdates: () => StatusUpdateUnsubscribeResult;
}
