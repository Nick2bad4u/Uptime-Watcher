import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import type { SitesStore } from "../../stores/sites/types";

import { useSitesStore } from "../../stores/sites/useSitesStore";

/**
 * Sites-store slice used by
 * {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @public
 */
export type SiteDetailsSitesStoreSlice = Pick<
    SitesStore,
    | "checkSiteNow"
    | "deleteSite"
    | "getSelectedMonitorId"
    | "modifySite"
    | "removeMonitorFromSite"
    | "setSelectedMonitorId"
    | "sites"
    | "startSiteMonitoring"
    | "startSiteMonitorMonitoring"
    | "stopSiteMonitoring"
    | "stopSiteMonitorMonitoring"
    | "updateMonitorRetryAttempts"
    | "updateMonitorTimeout"
    | "updateSiteCheckInterval"
>;

/**
 * Zustand selector wrapper for
 * {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @remarks
 * Consolidates the many per-field `useSitesStore(useCallback(...))` selections
 * into a single `useShallow` selection to reduce boilerplate and file size.
 *
 * @returns The Zustand store slice required by
 *   {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @public
 */
export function useSiteDetailsSitesStore(): SiteDetailsSitesStoreSlice {
    return useSitesStore(
        useShallow(
            useCallback(
                (state: SitesStore): SiteDetailsSitesStoreSlice => ({
                    checkSiteNow: state.checkSiteNow,
                    deleteSite: state.deleteSite,
                    getSelectedMonitorId: state.getSelectedMonitorId,
                    modifySite: state.modifySite,
                    removeMonitorFromSite: state.removeMonitorFromSite,
                    setSelectedMonitorId: state.setSelectedMonitorId,
                    sites: state.sites,
                    startSiteMonitoring: state.startSiteMonitoring,
                    startSiteMonitorMonitoring:
                        state.startSiteMonitorMonitoring,
                    stopSiteMonitoring: state.stopSiteMonitoring,
                    stopSiteMonitorMonitoring: state.stopSiteMonitorMonitoring,
                    updateMonitorRetryAttempts:
                        state.updateMonitorRetryAttempts,
                    updateMonitorTimeout: state.updateMonitorTimeout,
                    updateSiteCheckInterval: state.updateSiteCheckInterval,
                }),
                []
            )
        )
    );
}
