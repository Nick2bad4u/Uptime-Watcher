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
import { validateSiteSnapshot, validateSiteSnapshots } from "@shared/validation/guards";

import {
    createTypedInvoker,
    createValidatedInvoker,
    type SafeParseLike,
} from "../core/bridgeFactory";

function safeParseBoolean(candidate: unknown): SafeParseLike<boolean> {
    if (typeof candidate !== "boolean") {
        return {
            error: new Error(
                `Expected boolean response payload, received ${
                    Array.isArray(candidate) ? "array" : typeof candidate
                }`
            ),
            success: false,
        };
    }

    return { data: candidate, success: true };
}

function safeParseSiteArray(candidate: unknown): SafeParseLike<
    SitesDomainBridge["getSites"] extends () => Promise<infer TResult>
        ? TResult
        : never
> {
    if (!Array.isArray(candidate)) {
        return {
            error: new Error(
                `Expected array response payload, received ${typeof candidate}`
            ),
            success: false,
        };
    }

    const parsed = validateSiteSnapshots(candidate);
    if (parsed.status === "success") {
        return { data: parsed.data, success: true };
    }

    const exampleIssue = parsed.errors.at(0);
    const message =
        exampleIssue === undefined
            ? "Invalid site snapshots returned from main process"
            : `Invalid site snapshots returned from main process (first failure at index ${exampleIssue.index})`;

    return {
        error: new Error(message, {
            cause: exampleIssue?.error,
        }),
        success: false,
    };
}

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
    addSite: createValidatedInvoker(
        SITES_CHANNELS.addSite,
        validateSiteSnapshot,
        {
            domain: "sitesApi",
            guardName: "validateSiteSnapshot",
        }
    ),

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
    getSites: createValidatedInvoker(SITES_CHANNELS.getSites, safeParseSiteArray, {
        domain: "sitesApi",
        guardName: "validateSiteSnapshots",
    }),

    /**
     * Removes a monitor from a site
     *
     * @param siteIdentifier - Identifier of the site containing the monitor
     * @param monitorId - Identifier of the monitor to remove
     *
     * @returns Promise resolving to the updated site snapshot emitted by the
     *   backend after removal
     */
    removeMonitor: createValidatedInvoker(
        SITES_CHANNELS.removeMonitor,
        validateSiteSnapshot,
        {
            domain: "sitesApi",
            guardName: "validateSiteSnapshot",
        }
    ),

    /**
     * Removes a site from monitoring
     *
     * @param siteIdentifier - Identifier of the site to remove
     *
     * @returns Promise resolving to a boolean indicating removal success
     */
    removeSite: createValidatedInvoker(SITES_CHANNELS.removeSite, safeParseBoolean, {
        domain: "sitesApi",
        guardName: "safeParseBoolean",
    }),

    /**
     * Updates an existing site's configuration.
     *
     * @param siteIdentifier - Identifier of the site to update.
     * @param siteData - Partial site data to update.
     *
     * @returns Promise resolving to the updated site.
     */
    updateSite: createValidatedInvoker(
        SITES_CHANNELS.updateSite,
        validateSiteSnapshot,
        {
            domain: "sitesApi",
            guardName: "validateSiteSnapshot",
        }
    ),
} as const;

/**
 * Type alias for the sites domain preload bridge.
 *
 * @public
 */
export type SitesApi = SitesDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
