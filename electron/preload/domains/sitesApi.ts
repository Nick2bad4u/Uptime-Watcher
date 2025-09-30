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
     * Deletes all sites (dangerous operation)
     *
     * @returns Promise resolving to the number of removed sites
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
     * @returns Promise resolving to a boolean indicating removal success
     */
    removeSite: (...args: unknown[]) => Promise<boolean>;

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
     * Deletes all sites (dangerous operation)
     *
     * @returns Promise resolving to the number of removed sites
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
     * @returns Promise resolving to a boolean indicating removal success
     */
    removeSite: createTypedInvoker<boolean>("remove-site") satisfies (
        ...args: unknown[]
    ) => Promise<boolean>,

    updateSite: createTypedInvoker<Site>("update-site") satisfies (
        ...args: unknown[]
    ) => Promise<Site>,
} as const;

export type SitesApi = SitesApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
