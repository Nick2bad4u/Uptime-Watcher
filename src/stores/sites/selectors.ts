import type { SitesStore } from "./types";

/** Selects the current list of sites. */
export const selectSites = (state: SitesStore): SitesStore["sites"] =>
    state.sites;

/** Selects the action used to create a site. */
export const selectCreateSite = (state: SitesStore): SitesStore["createSite"] =>
    state.createSite;

/** Selects the action used to add a monitor to an existing site. */
export const selectAddMonitorToSite = (
    state: SitesStore
): SitesStore["addMonitorToSite"] => state.addMonitorToSite;
