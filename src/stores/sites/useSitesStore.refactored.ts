/**
 * Sites store for managing site data and operations.
 * Refactored to use modular architecture with separate concerns.
 *
 * This main store composes smaller, focused modules for better testability:
 * - useSitesState: Core state management
 * - useSiteOperations: CRUD operations
 * - useSiteMonitoring: Monitoring operations
 * - useSiteSync: Synchronization operations
 */

import { create } from "zustand";

import type { SitesStore } from "./types";

import { createSiteMonitoringActions } from "./useSiteMonitoring";
import { createSiteOperationsActions } from "./useSiteOperations";
import { createSitesStateActions, initialSitesState } from "./useSitesState";
import { createSiteSyncActions } from "./useSiteSync";

export const useSitesStore = create<SitesStore>((set, get) => {
    // Create state actions
    const stateActions = createSitesStateActions(set, get);

    // Create sync actions (needed by other modules)
    const syncActions = createSiteSyncActions({
        getSites: () => get().sites,
        setSites: stateActions.setSites,
    });

    // Create monitoring actions
    const monitoringActions = createSiteMonitoringActions({
        syncSitesFromBackend: syncActions.syncSitesFromBackend,
    });

    // Create operations actions
    const operationsActions = createSiteOperationsActions({
        addSite: stateActions.addSite,
        getSites: () => get().sites,
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

// Export the store for backward compatibility
export default useSitesStore;
