/**
 * Common helper functions for site operations to eliminate code duplication.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { UnknownRecord } from "type-fest";

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { withErrorHandling } from "@shared/utils/errorHandling";

import type { SiteOperationsDependencies } from "../types";

import { logger } from "../../../services/logger";
import { logStoreAction } from "../../utils";
import { createStoreErrorHandler } from "../../utils/storeErrorHandling";
import { updateMonitorInSite } from "./monitorOperations";

/**
 * Gets a site by ID and validates it exists. Common pattern used across
 * multiple site operations.
 *
 * @param siteId - The site identifier.
 * @param deps - Site operation dependencies.
 *
 * @returns The found site.
 *
 * @throws Error if site is not found.
 *
 * @public
 */
export const getSiteById = (
    siteId: string,
    deps: SiteOperationsDependencies
): Site => {
    const sites = deps.getSites() as Array<null | Site | undefined>;
    const site = sites.find((s) => s && s.identifier === siteId);
    if (!site) {
        throw new Error(ERROR_CATALOG.sites.NOT_FOUND as string);
    }
    return site;
};

/**
 * Updates a monitor within a site and saves it. Common pattern for monitor
 * update operations.
 *
 * @param siteId - The site identifier.
 * @param monitorId - The monitor identifier.
 * @param updates - Monitor updates to apply.
 * @param deps - Site operation dependencies.
 *
 * @returns Promise that resolves when the monitor update completes.
 *
 * @public
 */
export const updateMonitorAndSave = async (
    siteId: string,
    monitorId: string,
    updates: Partial<Site["monitors"][0]>,
    deps: SiteOperationsDependencies
): Promise<void> => {
    try {
        const site = getSiteById(siteId, deps);
        const updatedSite = updateMonitorInSite(site, monitorId, updates);
        await deps.services.site.updateSite(siteId, {
            monitors: updatedSite.monitors,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes(ERROR_CATALOG.sites.NOT_FOUND as string)
        ) {
            logger.error(`Failed to find site with ID ${siteId}:`, error);
            throw new Error(`Site not found: ${siteId}`, { cause: error });
        }
        // Re-throw other errors
        throw error;
    }
};

/**
 * Wraps a site operation with consistent logging, error handling, and optional
 * sync. Eliminates duplication of the common pattern used across all site
 * operations.
 *
 * @param operationName - Name of the operation for logging and error handling.
 * @param operation - The async operation to execute.
 * @param params - Parameters passed to the operation for logging.
 * @param deps - Site operation dependencies.
 * @param syncAfter - Whether to sync from backend after the operation.
 *
 * @returns Promise that resolves when operation and optional sync complete.
 *
 * @public
 */
export const withSiteOperation = async (
    operationName: string,
    operation: () => Promise<void>,
    params: UnknownRecord,
    deps: SiteOperationsDependencies,
    syncAfter = true
): Promise<void> => {
    logStoreAction("SitesStore", operationName, params);

    await withErrorHandling(
        async () => {
            await operation();
            if (syncAfter) {
                await deps.syncSites();
            }
        },
        createStoreErrorHandler("sites-operations", operationName)
    );
};

/**
 * Wraps a site operation with consistent logging, error handling, and optional
 * sync. This version supports operations that return a value.
 *
 * @param operationName - Name of the operation for logging and error handling.
 * @param operation - The async operation to execute that returns a value.
 * @param params - Parameters passed to the operation for logging.
 * @param deps - Site operation dependencies.
 * @param syncAfter - Whether to sync from backend after the operation.
 *
 * @returns Promise that resolves to the operation result.
 *
 * @public
 */
export const withSiteOperationReturning = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    params: UnknownRecord,
    deps: SiteOperationsDependencies,
    syncAfter = true
): Promise<T> => {
    logStoreAction("SitesStore", operationName, params);

    return withErrorHandling(
        async () => {
            if (!syncAfter) {
                return operation();
            }

            /* eslint-disable nitpick/no-redundant-vars -- Variable needed for sync operation sequencing */
            const result = await operation();
            await deps.syncSites();
            return result;
            /* eslint-enable nitpick/no-redundant-vars -- Re-enable after sync operation sequencing */
        },
        createStoreErrorHandler("sites-operations", operationName)
    );
};
