/**
 * Sites Domain API - Auto-generated preload bridge for site management
 *
 * @remarks
 * This module provides type-safe IPC communication for all site-related
 * operations. All methods are automatically generated from backend IPC channel
 * definitions. As a thin wrapper over the bridge factory, exceptions are
 * intentionally propagated to the frontend for handling at the UI level.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import { SITES_CHANNELS, type SitesDomainBridge } from "@shared/types/preload";

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the sites domain API operations.
 *
 * @public
 */
export interface SitesApiInterface extends SitesDomainBridge {
    /**
     * Adds a new site to be monitored
     *
     * @returns Promise resolving to the created site
     */
    addSite: SitesDomainBridge["addSite"];

    /**
     * Deletes all sites (dangerous operation)
     *
     * @returns Promise resolving to the number of removed sites
     */
    deleteAllSites: SitesDomainBridge["deleteAllSites"];

    /**
     * Retrieves all sites from the database
     *
     * @returns Promise resolving to array of all sites
     */
    getSites: SitesDomainBridge["getSites"];

    /**
     * Removes a monitor from a site
     *
     * @returns Promise resolving to the updated site snapshot emitted by the
     *   backend after removal
     */
    removeMonitor: SitesDomainBridge["removeMonitor"];

    /**
     * Removes a site from monitoring
     *
     * @returns Promise resolving to a boolean indicating removal success
     */
    removeSite: SitesDomainBridge["removeSite"];

    /**
     * Updates an existing site's configuration
     *
     * @returns Promise resolving to the updated site
     */
    updateSite: SitesDomainBridge["updateSite"];
}

/**
 * Sites domain API providing all site management operations.
 *
 * @public
 */
export const sitesApi: SitesApiInterface = {
    /**
     * Adds a new site to be monitored
     *
     * @param siteData - Site configuration data
     *
     * @returns Promise resolving to the created site
     */
    addSite: createTypedInvoker(SITES_CHANNELS.addSite),

    /**
     * Deletes all sites (dangerous operation)
     *
     * @returns Promise resolving to the number of removed sites
     */
    deleteAllSites: createTypedInvoker(SITES_CHANNELS.deleteAllSites),

    /**
     * Retrieves all sites from the database
     *
     * @returns Promise resolving to array of all sites
     */
    getSites: createTypedInvoker(SITES_CHANNELS.getSites),

    /**
     * Removes a monitor from a site
     *
     * @param siteIdentifier - Identifier of the site containing the monitor
     * @param monitorId - Identifier of the monitor to remove
     *
     * @returns Promise resolving to the updated site snapshot emitted by the
     *   backend after removal
     */
    removeMonitor: createTypedInvoker(SITES_CHANNELS.removeMonitor),

    /**
     * Removes a site from monitoring
     *
     * @param siteIdentifier - Identifier of the site to remove
     *
     * @returns Promise resolving to a boolean indicating removal success
     */
    removeSite: createTypedInvoker(SITES_CHANNELS.removeSite),

    /**
     * Updates an existing site's configuration.
     *
     * @param siteIdentifier - Identifier of the site to update.
     * @param siteData - Partial site data to update.
     *
     * @returns Promise resolving to the updated site.
     */
    updateSite: createTypedInvoker(SITES_CHANNELS.updateSite),
} as const;

/**
 * Type alias for the sites domain preload bridge.
 *
 * @public
 */
export type SitesApi = SitesDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
