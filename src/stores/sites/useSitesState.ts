/**
 * Sites state management module.
 * Handles core state operations for sites, selected site, and monitor selections.
 */

import type { Site } from "../../types";

import { logStoreAction } from "../utils";

export interface SitesState {
    /** Selected monitor IDs per site (UI state, not persisted) */
    selectedMonitorIds: Record<string, string>;
    /** Currently selected site identifier */
    selectedSiteId: string | undefined;
    /** Array of monitored sites */
    sites: Site[];
}

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

export type SitesStateStore = SitesState & SitesStateActions;

export const createSitesStateActions = (
    set: (function_: (state: SitesState) => Partial<SitesState>) => void,
    get: () => SitesState
): SitesStateActions => ({
    addSite: (site: Site) => {
        logStoreAction("SitesStore", "addSite", { site });
        set((state) => ({ sites: [...state.sites, site] }));
    },
    getSelectedMonitorId: (siteId: string) => {
        const ids = get().selectedMonitorIds;
        // eslint-disable-next-line security/detect-object-injection
        return ids[siteId];
    },
    getSelectedSite: (): Site | undefined => {
        const { selectedSiteId, sites } = get();
        if (!selectedSiteId) {
            return undefined;
        }
        return sites.find((s) => s.identifier === selectedSiteId) ?? undefined;
    },
    removeSite: (identifier: string) => {
        logStoreAction("SitesStore", "removeSite", { identifier });
        set((state) => {
            // Remove the monitor selection for the removed site
            const currentMonitorIds = state.selectedMonitorIds;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars
            const { [identifier]: _unused, ...remainingMonitorIds } = currentMonitorIds;
            return {
                selectedMonitorIds: remainingMonitorIds,
                selectedSiteId: state.selectedSiteId === identifier ? undefined : state.selectedSiteId,
                sites: state.sites.filter((site) => site.identifier !== identifier),
            };
        });
    },
    setSelectedMonitorId: (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "setSelectedMonitorId", { monitorId, siteId });
        set((state) => ({
            selectedMonitorIds: {
                ...state.selectedMonitorIds,
                [siteId]: monitorId,
            },
        }));
    },
    setSelectedSite: (site: Site | undefined) => {
        logStoreAction("SitesStore", "setSelectedSite", { site });
        set(() => ({ selectedSiteId: site ? site.identifier : undefined }));
    },
    setSites: (sites: Site[]) => {
        logStoreAction("SitesStore", "setSites", { count: sites.length || 0 });
        set(() => ({ sites }));
    },
});

export const initialSitesState: SitesState = {
    selectedMonitorIds: {},
    selectedSiteId: undefined,
    sites: [],
};
