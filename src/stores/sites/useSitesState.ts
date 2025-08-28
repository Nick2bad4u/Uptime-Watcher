/**
 * Sites state management module. Handles core state operations for sites,
 * selected site, and monitor selections.
 */

import type { Site } from "@shared/types";
import type { Simplify } from "type-fest";

import { logStoreAction } from "../utils";

/**
 * Sites state interface for managing site data and selection.
 *
 * @remarks
 * Defines the core state structure for site management including the sites
 * array, selected site tracking, and UI state for monitor selection.
 *
 * @public
 */
export interface SitesState {
    /** Selected monitor IDs per site (UI state, not persisted) */
    selectedMonitorIds: Record<string, string>;
    /** Currently selected site identifier */
    selectedSiteId: string | undefined;
    /** Array of monitored sites */
    sites: Site[];
}

/**
 * Sites state actions interface for managing site state operations.
 *
 * @remarks
 * Defines the contract for state management operations including CRUD
 * operations for sites and UI state management for selections.
 *
 * @public
 */
export interface SitesStateActions {
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
    /** Set sites data */
    setSites: (sites: Site[]) => void;
}

/**
 * Combined sites state store type including state and actions.
 *
 * @remarks
 * Provides a complete interface for site state management combining both the
 * state structure and the action methods. Uses Simplify to flatten the
 * intersection type for better IntelliSense and cleaner type display.
 *
 * @public
 */
export type SitesStateStore = Simplify<SitesState & SitesStateActions>;

/**
 * Creates state management actions for the sites store.
 *
 * @param set - Zustand state setter function for updating store state
 * @param get - Zustand state getter function for reading current state
 *
 * @returns Object containing all state management action functions
 */
export const createSitesStateActions = (
    set: (function_: (state: SitesState) => Partial<SitesState>) => void,
    get: () => SitesState
): SitesStateActions => ({
    addSite: (site: Site): void => {
        logStoreAction("SitesStore", "addSite", { site });
        set((state) => ({ sites: [...state.sites, site] }));
    },
    getSelectedMonitorId: (siteId: string): string | undefined => {
        const ids = get().selectedMonitorIds;

        return ids[siteId];
    },
    getSelectedSite: (): Site | undefined => {
        const { selectedSiteId, sites } = get();
        if (!selectedSiteId) {
            return undefined;
        }
        return sites.find((s) => s.identifier === selectedSiteId) ?? undefined;
    },
    removeSite: (identifier: string): void => {
        logStoreAction("SitesStore", "removeSite", { identifier });
        set((state) => {
            // Remove the monitor selection for the removed site
            const currentMonitorIds = state.selectedMonitorIds;

            // Filter out the monitor selection for the removed site
            const remainingMonitorIds = Object.fromEntries(
                Object.entries(currentMonitorIds).filter(
                    ([key]) => key !== identifier
                )
            );
            return {
                selectedMonitorIds: remainingMonitorIds,
                selectedSiteId:
                    state.selectedSiteId === identifier
                        ? undefined
                        : state.selectedSiteId,
                sites: state.sites.filter(
                    (site) => site.identifier !== identifier
                ),
            };
        });
    },
    setSelectedMonitorId: (siteId: string, monitorId: string): void => {
        logStoreAction("SitesStore", "setSelectedMonitorId", {
            monitorId,
            siteId,
        });
        set((state) => ({
            selectedMonitorIds: {
                ...state.selectedMonitorIds,
                [siteId]: monitorId,
            },
        }));
    },
    setSelectedSite: (site: Site | undefined): void => {
        logStoreAction("SitesStore", "setSelectedSite", { site });
        set(() => ({ selectedSiteId: site ? site.identifier : undefined }));
    },
    setSites: (sites: Site[]): void => {
        logStoreAction("SitesStore", "setSites", { count: sites.length });
        set(() => ({ sites }));
    },
});

/**
 * Initial state for the sites store. Provides default values for all state
 * properties.
 */
export const initialSitesState: SitesState = {
    selectedMonitorIds: {},
    selectedSiteId: undefined,
    sites: [],
};
