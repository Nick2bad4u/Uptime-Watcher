/**
 * Common helper functions for site operations to eliminate code duplication.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { UnknownRecord } from "type-fest";

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";

import type { SiteOperationsDependencies } from "../types";

import { logger } from "../../../services/logger";
import { logStoreAction } from "../../utils";
import { createStoreErrorHandler } from "../../utils/storeErrorHandling";
import { updateMonitorInSite } from "./monitorOperations";

/**
 * Gets a site by identifier and validates it exists. Common pattern used across
 * multiple site operations.
 *
 * @param siteIdentifier - The site identifier.
 * @param deps - Site operation dependencies.
 *
 * @returns The found site.
 *
 * @throws Error if site is not found.
 *
 * @public
 */
export const getSiteByIdentifier = (
    siteIdentifier: string,
    deps: SiteOperationsDependencies
): Site => {
    const sites = deps.getSites() as Array<null | Site | undefined>;
    const site = sites.find((s) => s && s.identifier === siteIdentifier);
    if (!site) {
        throw new Error(ERROR_CATALOG.sites.NOT_FOUND as string);
    }
    return site;
};

/**
 * Applies a backend-sourced site snapshot to the local store state.
 *
 * @param savedSite - Site instance returned by the backend after a mutation.
 * @param deps - Site operation dependencies used to read and write store state.
 */
export const applySavedSiteToStore = (
    savedSite: Site,
    deps: SiteOperationsDependencies
): void => {
    const currentSites = deps.getSites();
    const hasExistingSite = currentSites.some(
        (existingSite) => existingSite.identifier === savedSite.identifier
    );

    const nextSites = hasExistingSite
        ? currentSites.map((existingSite) =>
              existingSite.identifier === savedSite.identifier
                  ? savedSite
                  : existingSite
          )
        : [...currentSites, savedSite];

    deps.setSites(nextSites);
};

/**
 * Updates a monitor within a site and saves it. Common pattern for monitor
 * update operations.
 *
 * @param siteIdentifier - The site identifier.
 * @param monitorId - The monitor identifier.
 * @param updates - Monitor updates to apply.
 * @param deps - Site operation dependencies.
 *
 * @returns Promise that resolves when the monitor update completes.
 *
 * @public
 */
export const updateMonitorAndSave = async (
    siteIdentifier: string,
    monitorId: string,
    updates: Partial<Site["monitors"][0]>,
    deps: SiteOperationsDependencies
): Promise<void> => {
    try {
        const site = getSiteByIdentifier(siteIdentifier, deps);
        const updatedSite = updateMonitorInSite(site, monitorId, updates);
        const savedSite = await deps.services.site.updateSite(siteIdentifier, {
            monitors: updatedSite.monitors,
        });

        applySavedSiteToStore(savedSite, deps);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes(ERROR_CATALOG.sites.NOT_FOUND as string)
        ) {
            logger.error(
                `Failed to find site with identifier ${siteIdentifier}:`,
                error
            );
            throw new Error(`Site not found: ${siteIdentifier}`, {
                cause: error,
            });
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
    logStoreAction("SitesStore", operationName, {
        ...params,
        status: "pending",
    });

    await withErrorHandling(
        async () => {
            try {
                await operation();
                if (syncAfter) {
                    await deps.syncSites();
                }
                logStoreAction("SitesStore", operationName, {
                    ...params,
                    status: "success",
                });
            } catch (error) {
                const normalizedError = ensureError(error);
                logStoreAction("SitesStore", operationName, {
                    ...params,
                    error: normalizedError.message,
                    status: "failure",
                });
                throw error;
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
    logStoreAction("SitesStore", operationName, {
        ...params,
        status: "pending",
    });

    return withErrorHandling(
        async () => {
            try {
                const result = await operation();
                if (syncAfter) {
                    await deps.syncSites();
                }
                logStoreAction("SitesStore", operationName, {
                    ...params,
                    status: "success",
                });
                return result;
            } catch (error) {
                const normalizedError = ensureError(error);
                logStoreAction("SitesStore", operationName, {
                    ...params,
                    error: normalizedError.message,
                    status: "failure",
                });
                throw error;
            }
        },
        createStoreErrorHandler("sites-operations", operationName)
    );
};
