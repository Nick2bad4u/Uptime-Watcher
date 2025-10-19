/**
 * Sites state management module. Handles core state operations for sites,
 * selected site, and monitor selections.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { Simplify } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import {
    DuplicateSiteIdentifierError,
    ensureUniqueSiteIdentifiers,
} from "@shared/validation/siteIntegrity";
import type { StatusUpdateSubscriptionSummary } from "./baseTypes";

import { logger } from "../../services/logger";
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
    selectedSiteIdentifier: string | undefined;
    /** Array of monitored sites */
    sites: Site[];
    /** Latest status update subscription diagnostics. */
    statusSubscriptionSummary: StatusUpdateSubscriptionSummary | undefined;
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
    getSelectedMonitorId: (siteIdentifier: string) => string | undefined;
    /** Get the currently selected site */
    getSelectedSite: () => Site | undefined;
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** Select a site for focused operations and UI display */
    selectSite: (site: Site | undefined) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (siteIdentifier: string, monitorId: string) => void;
    /** Set sites data */
    setSites: (sites: Site[]) => void;
    /** Persist status subscription diagnostics */
    setStatusSubscriptionSummary: (
        summary: StatusUpdateSubscriptionSummary | undefined
    ) => void;
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
 * @returns Object containing all state management action functions.
 *
 * @public
 */
export const createSitesStateActions = (
    set: (function_: (state: SitesState) => Partial<SitesState>) => void,
    get: () => SitesState
): SitesStateActions => ({
    addSite: (site: Site): void => {
        logStoreAction("SitesStore", "addSite", { site });
        set((state) => ({ sites: [...state.sites, site] }));
    },
    getSelectedMonitorId: (siteIdentifier: string): string | undefined => {
        const ids = get().selectedMonitorIds;

        return ids[siteIdentifier];
    },
    getSelectedSite: (): Site | undefined => {
        const { selectedSiteIdentifier, sites } = get();
        if (!selectedSiteIdentifier) {
            return undefined;
        }
        return (
            sites.find((site) => site.identifier === selectedSiteIdentifier) ??
            undefined
        );
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
                selectedSiteIdentifier:
                    state.selectedSiteIdentifier === identifier
                        ? undefined
                        : state.selectedSiteIdentifier,
                sites: state.sites.filter(
                    (site) => site.identifier !== identifier
                ),
            };
        });
    },
    selectSite: (site: Site | undefined): void => {
        logStoreAction("SitesStore", "selectSite", { site });
        set(() => ({
            selectedSiteIdentifier: site ? site.identifier : undefined,
        }));
    },
    setSelectedMonitorId: (siteIdentifier: string, monitorId: string): void => {
        logStoreAction("SitesStore", "setSelectedMonitorId", {
            monitorId,
            siteIdentifier,
        });
        set((state) => ({
            selectedMonitorIds: {
                ...state.selectedMonitorIds,
                [siteIdentifier]: monitorId,
            },
        }));
    },
    setSites: (sites: Site[]): void => {
        try {
            ensureUniqueSiteIdentifiers(sites, "SitesStore.setSites");
        } catch (error: unknown) {
            if (error instanceof DuplicateSiteIdentifierError) {
                logger.error(
                    "Duplicate site identifiers detected while replacing sites state",
                    {
                        duplicates: error.duplicates,
                        siteCount: sites.length,
                    }
                );
                throw error;
            }

            const normalizedError = ensureError(error);
            logger.error(
                "Unexpected error while validating sites before state replacement",
                normalizedError
            );
            throw normalizedError;
        }

        logStoreAction("SitesStore", "setSites", { count: sites.length });
        set(() => ({ sites }));
    },
    setStatusSubscriptionSummary: (
        summary: StatusUpdateSubscriptionSummary | undefined
    ): void => {
        logStoreAction("SitesStore", "setStatusSubscriptionSummary", {
            expectedListeners: summary?.expectedListeners,
            listenersAttached: summary?.listenersAttached,
            success: summary?.success,
        });
        set(() => ({ statusSubscriptionSummary: summary }));
    },
});

/**
 * Initial state for the sites store. Provides default values for all state
 * properties.
 *
 * @public
 */
export const initialSitesState: SitesState = {
    selectedMonitorIds: {},
    selectedSiteIdentifier: undefined,
    sites: [],
    statusSubscriptionSummary: undefined,
};
