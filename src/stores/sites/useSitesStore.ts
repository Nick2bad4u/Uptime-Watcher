/**
 * Main sites store for managing site data and operations using modular
 * architecture.
 *
 * @remarks
 * This store uses a modular composition pattern to separate concerns and
 * improve testability. Instead of a monolithic store, it composes smaller,
 * focused modules:
 *
 * - `useSitesState`: Core state management and data manipulation
 * - `useSiteOperations`: CRUD operations for sites and monitors
 * - `useSiteMonitoring`: Monitoring lifecycle and status management
 * - `useSiteSync`: Backend synchronization and data consistency
 *
 * Each module is independently testable and has clear responsibilities, making
 * the codebase more maintainable and easier to understand.
 *
 * @example
 *
 * ```typescript
 * import { useSitesStore } from './stores';
 *
 * function MyComponent() {
 *   const { sites, addSite, startMonitoring } = useSitesStore();
 *
 *   const handleAddSite = async () => {
 *     const newSite = await addSite({ name: 'Example Site', monitors: [] });
 *     await startMonitoring();
 *   };
 *
 *   return <div>{sites.length} sites</div>;
 * }
 * ```
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { SitesStore } from "./types";

import { DataService } from "../../services/DataService";
import { MonitoringService } from "./services/MonitoringService";
import { SiteService } from "./services/SiteService";
import { createSiteMonitoringActions } from "./useSiteMonitoring";
import { createSiteOperationsActions } from "./useSiteOperations";
import {
    createSitesStateActions,
    initialSitesState,
    type SitesState,
} from "./useSitesState";
import { createSiteSyncActions } from "./useSiteSync";

/**
 * Main sites store combining all site-related functionality.
 *
 * @remarks
 * Creates a Zustand store that composes multiple action modules to provide a
 * complete interface for site management. The store uses dependency injection
 * to share common functions between modules while maintaining clear
 * boundaries.
 *
 * @returns Complete sites store with all actions and state
 *
 * @public
 */
export const useSitesStore: UseBoundStore<StoreApi<SitesStore>> =
    create<SitesStore>()((
        set: (function_: (state: SitesStore) => Partial<SitesStore>) => void,
        get: () => SitesStore
    ) => {
        // Create state actions
        const stateActions = createSitesStateActions(
            (updater) => {
                set((storeState) => updater(storeState as SitesState));
            },
            () => get() as SitesState
        );

        // Shared getSites function - eliminates duplication and improves
        // testability
        const getSites = (): Site[] => get().sites;

        // Create sync actions (needed by other modules)
        const syncActions = createSiteSyncActions({
            getSites,
            onSiteDelta: stateActions.recordSiteSyncDelta,
            setSites: stateActions.setSites,
            setStatusSubscriptionSummary:
                stateActions.setStatusSubscriptionSummary,
        });

        // Create monitoring actions
        const monitoringActions = createSiteMonitoringActions({
            monitoringService: MonitoringService,
            getSites,
            setSites: stateActions.setSites,
        });

        // Create operations actions
        const operationsActions = createSiteOperationsActions({
            getSites,
            removeSite: stateActions.removeSite,
            services: {
                data: {
                    downloadSqliteBackup: () =>
                        DataService.downloadSqliteBackup(),
                },
                site: {
                    addSite: (site: Site) => SiteService.addSite(site),
                    getSites: () => SiteService.getSites(),
                    removeMonitor: (
                        siteIdentifier: string,
                        monitorId: string
                    ) => SiteService.removeMonitor(siteIdentifier, monitorId),
                    removeSite: (identifier: string) =>
                        SiteService.removeSite(identifier),
                    updateSite: (identifier: string, updates: Partial<Site>) =>
                        SiteService.updateSite(identifier, updates),
                },
            },
            setSites: stateActions.setSites,
            syncSites: syncActions.syncSites,
        });

        return {
            // Initial state
            ...initialSitesState,

            // State actions
            ...stateActions,

            // Operations actions
            ...operationsActions,

            // Monitoring actions
            ...monitoringActions,

            // Sync actions
            ...syncActions,
        };
    });
