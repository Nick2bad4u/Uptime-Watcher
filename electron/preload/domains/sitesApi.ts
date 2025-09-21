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

import type { Site } from "@shared/types";

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the sites domain API operations
 */
export interface SitesApiInterface {
    /**
     * Adds a new site to be monitored
     *
     * @param siteData - Site configuration data
     *
     * @returns Promise resolving to the created site
     */
    addSite: (...args: unknown[]) => Promise<Site>;

    /**
     * Performs an immediate connectivity check for a site
     *
     * @param siteId - ID of the site to check
     *
     * @returns Promise resolving to the updated site with latest status
     */
    checkSiteNow: (...args: unknown[]) => Promise<Site>;

    /**
     * Deletes all sites (dangerous operation)
     *
     * @returns Promise resolving to the count of deleted sites
     */
    deleteAllSites: (...args: unknown[]) => Promise<number>;

    /**
     * Retrieves all sites from the database
     *
     * @returns Promise resolving to array of all sites
     */
    getSites: (...args: unknown[]) => Promise<Site[]>;

    /**
     * Removes a site from monitoring
     *
     * @param siteId - ID of the site to remove
     *
     * @returns Promise resolving to the removed site
     */
    removeSite: (...args: unknown[]) => Promise<Site>;

    /**
     * Starts monitoring for a specific site
     *
     * @param siteId - ID of the site to start monitoring
     *
     * @returns Promise resolving to the updated site
     */
    startMonitoringForSite: (...args: unknown[]) => Promise<Site>;

    /**
     * Stops monitoring for a specific site
     *
     * @param siteId - ID of the site to stop monitoring
     *
     * @returns Promise resolving to the updated site
     */
    stopMonitoringForSite: (...args: unknown[]) => Promise<Site>;

    /**
     * Updates an existing site's configuration
     *
     * @param siteId - ID of the site to update
     * @param siteData - Partial site data to update
     *
     * @returns Promise resolving to the updated site
     */
    updateSite: (...args: unknown[]) => Promise<Site>;
}

/**
 * Sites domain API providing all site management operations
 */
export const sitesApi: SitesApiInterface = {
    /**
     * Adds a new site to be monitored
     *
     * @param siteData - Site configuration data
     *
     * @returns Promise resolving to the created site
     */
    addSite: createTypedInvoker<Site>("add-site") satisfies (
        ...args: unknown[]
    ) => Promise<Site>,

    /**
     * Performs an immediate connectivity check for a site
     *
     * @param siteId - ID of the site to check
     *
     * @returns Promise resolving to the updated site with latest status
     */
    checkSiteNow: createTypedInvoker<Site>("check-site-now") satisfies (
        ...args: unknown[]
    ) => Promise<Site>,

    /**
     * Deletes all sites (dangerous operation)
     *
     * @returns Promise resolving to the count of deleted sites
     */
    deleteAllSites: createTypedInvoker<number>("delete-all-sites") satisfies (
        ...args: unknown[]
    ) => Promise<number>,

    /**
     * Retrieves all sites from the database
     *
     * @returns Promise resolving to array of all sites
     */
    getSites: createTypedInvoker<Site[]>("get-sites") satisfies (
        ...args: unknown[]
    ) => Promise<Site[]>,

    /**
     * Removes a site from monitoring
     *
     * @param siteId - ID of the site to remove
     *
     * @returns Promise resolving to the removed site
     */
    removeSite: createTypedInvoker<Site>("remove-site") satisfies (
        ...args: unknown[]
    ) => Promise<Site>,

    /**
     * Starts monitoring for a specific site
     *
     * @param siteId - ID of the site to start monitoring
     *
     * @returns Promise resolving to the updated site
     */
    startMonitoringForSite: createTypedInvoker<Site>(
        "start-monitoring-for-site"
    ) satisfies (...args: unknown[]) => Promise<Site>,

    /**
     * Stops monitoring for a specific site
     *
     * @param siteId - ID of the site to stop monitoring
     *
     * @returns Promise resolving to the updated site
     */
    stopMonitoringForSite: createTypedInvoker<Site>(
        "stop-monitoring-for-site"
    ) satisfies (...args: unknown[]) => Promise<Site>,

    /**
     * Updates an existing site's configuration
     *
     * @param siteId - ID of the site to update
     * @param siteData - Partial site data to update
     *
     * @returns Promise resolving to the updated site
     */
    updateSite: createTypedInvoker<Site>("update-site") satisfies (
        ...args: unknown[]
    ) => Promise<Site>,
} as const;

export type SitesApi = SitesApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
