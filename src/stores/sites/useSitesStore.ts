/**
 * Main sites store for managing site data and operations using modular architecture.
 *
 * @remarks
 * This store uses a modular composition pattern to separate concerns and improve
 * testability. Instead of a monolithic store, it composes smaller, focused modules:
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

import { create } from "zustand";

import type { SitesStore } from "./types";

import { createSiteMonitoringActions } from "./useSiteMonitoring";
import { createSiteOperationsActions } from "./useSiteOperations";
import { createSitesStateActions, initialSitesState } from "./useSitesState";
import { createSiteSyncActions } from "./useSiteSync";

/**
 * Main sites store combining all site-related functionality.
 *
 * @remarks
 * Creates a Zustand store that composes multiple action modules to provide
 * a complete interface for site management. The store uses dependency injection
 * to share common functions between modules while maintaining clear boundaries.
 *
 * @public
 */
export const useSitesStore = create<SitesStore>()((set, get) => {
    // Create state actions
    const stateActions = createSitesStateActions(set, get);

    // Shared getSites function - eliminates duplication and improves testability
    const getSites = () => get().sites;

    // Create sync actions (needed by other modules)
    const syncActions = createSiteSyncActions({
        getSites,
        setSites: stateActions.setSites,
    });

    // Create monitoring actions
    const monitoringActions = createSiteMonitoringActions();

    // Create operations actions
    const operationsActions = createSiteOperationsActions({
        addSite: stateActions.addSite,
        getSites,
        removeSite: stateActions.removeSite,
        setSites: stateActions.setSites,
        syncSitesFromBackend: syncActions.syncSitesFromBackend,
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
