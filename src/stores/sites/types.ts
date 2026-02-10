/**
 * Sites store types and interfaces.
 *
 * @remarks
 * Defines the contract for sites store including actions, state, and
 * dependencies for managing site data and operations.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";
import type { SiteSyncDelta } from "@shared/types/stateSync";
import type { Simplify } from "type-fest";

import type {
    BaseSiteMonitoring,
    BaseSiteOperations,
    BaseSiteState,
    BaseSiteSubscriptions,
    BaseSiteSync,
} from "./baseTypes";
import type { SitesState as SitesStateShape } from "./useSitesState";

/**
 * Site monitoring actions exposed by the sites store.
 *
 * @remarks
 * These method signatures are shared between the store contract and the
 * monitoring action factory ({@link src/stores/sites/useSiteMonitoring#createSiteMonitoringActions}). Keeping the
 * contract in one place prevents drift.
 */
export type SiteMonitoringActions = BaseSiteMonitoring;

/**
 * Sites store actions interface for managing site operations.
 *
 * @remarks
 * Comprehensive interface defining all site management operations including
 * CRUD operations, monitoring control, and synchronization functionality.
 *
 * @public
 */
export interface SitesActions
    extends
        BaseSiteOperations,
        BaseSiteState,
        BaseSiteSubscriptions,
        BaseSiteSync,
        SiteMonitoringActions {
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
    /** Record latest site synchronization delta information */
    recordSiteSyncDelta: (delta: SiteSyncDelta | undefined) => void;
    /** Persist latest backup metadata for UI diagnostics */
    setLastBackupMetadata: (
        metadata: SerializedDatabaseBackupResult["metadata"] | undefined
    ) => void;
}

/**
 * Sites store state interface for managing site data.
 *
 * @remarks
 * Re-exports the canonical state shape defined by {@link SitesStateShape | SitesState} so the
 * store, actions, and modules share the exact same structure.
 */
export type SitesState = SitesStateShape;

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
    /** Persist latest backup metadata */
    setLastBackupMetadata: (
        metadata: SerializedDatabaseBackupResult["metadata"] | undefined
    ) => void;
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
    data: Pick<
        DataBackupService,
        "downloadSqliteBackup" | "restoreSqliteBackup" | "saveSqliteBackup"
    >;
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
    restoreSqliteBackup: (
        payload: SerializedDatabaseRestorePayload
    ) => Promise<SerializedDatabaseRestoreResult>;
    saveSqliteBackup: () => Promise<SerializedDatabaseBackupSaveResult>;
}
