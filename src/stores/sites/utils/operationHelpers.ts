/**
 * Common helper functions for site operations to eliminate code duplication.
 */

import type { Site } from "@shared/types";

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { withErrorHandling } from "@shared/utils/errorHandling";

import type { SiteOperationsDependencies } from "../useSiteOperations";

import { logStoreAction } from "../../utils";
import { createStoreErrorHandler } from "../../utils/storeErrorHandling";
import { updateMonitorInSite } from "./monitorOperations";

/**
 * Gets a site by ID and validates it exists.
 * Common pattern used across multiple site operations.
 *
 * @param siteId - The site identifier
 * @param deps - Site operation dependencies
 * @returns The found site
 * @throws Error if site is not found
 */
export const getSiteById = (
    siteId: string,
    deps: SiteOperationsDependencies
): Site => {
    const site = deps.getSites().find((s) => s.identifier === siteId);
    if (!site) {
        throw new Error(ERROR_CATALOG.sites.NOT_FOUND as string);
    }
    return site;
};

/**
 * Updates a monitor within a site and saves it.
 * Common pattern for monitor update operations.
 *
 * @param siteId - The site identifier
 * @param monitorId - The monitor identifier
 * @param updates - Monitor updates to apply
 * @param deps - Site operation dependencies
 */
export const updateMonitorAndSave = async (
    siteId: string,
    monitorId: string,
    updates: Partial<Site["monitors"][0]>,
    deps: SiteOperationsDependencies
): Promise<void> => {
    const site = getSiteById(siteId, deps);

    const updatedSite = updateMonitorInSite(site, monitorId, updates);
    await window.electronAPI.sites.updateSite(siteId, {
        monitors: updatedSite.monitors,
    });
};

/**
 * Wraps a site operation with consistent logging, error handling, and optional
 * sync. Eliminates duplication of the common pattern used across all site
 * operations.
 *
 * @param operationName - Name of the operation for logging and error handling
 * @param operation - The async operation to execute
 * @param params - Parameters passed to the operation for logging
 * @param deps - Site operation dependencies
 * @param syncAfter - Whether to sync from backend after the operation
 * @returns Promise that resolves when operation and optional sync complete
 */
export const withSiteOperation = async (
    operationName: string,
    operation: () => Promise<void>,
    params: Record<string, unknown>,
    deps: SiteOperationsDependencies,
    syncAfter = true
): Promise<void> => {
    logStoreAction("SitesStore", operationName, params);

    await withErrorHandling(
        async () => {
            await operation();
            if (syncAfter) {
                await deps.syncSitesFromBackend();
            }
        },
        createStoreErrorHandler("sites-operations", operationName)
    );
};

/**
 * Wraps a site operation with consistent logging, error handling, and optional
 * sync. This version supports operations that return a value.
 *
 * @param operationName - Name of the operation for logging and error handling
 * @param operation - The async operation to execute that returns a value
 * @param params - Parameters passed to the operation for logging
 * @param deps - Site operation dependencies
 * @param syncAfter - Whether to sync from backend after the operation
 * @returns Promise that resolves to the operation result
 */
export const withSiteOperationReturning = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    params: Record<string, unknown>,
    deps: SiteOperationsDependencies,
    syncAfter = true
): Promise<T> => {
    logStoreAction("SitesStore", operationName, params);

    return withErrorHandling(
        async () => {
            const result = await operation();
            if (syncAfter) {
                await deps.syncSitesFromBackend();
            }
            return result;
        },
        createStoreErrorHandler("sites-operations", operationName)
    );
};
