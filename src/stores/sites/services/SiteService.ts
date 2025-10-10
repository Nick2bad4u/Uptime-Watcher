/**
 * Service layer for handling all site-related operations. Provides a clean
 * abstraction over electron API calls for site management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing.
 */

import type { Site } from "@shared/types";
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { DataService } from "../../../services/DataService";
import { createIpcServiceHelpers } from "../../../services/utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = createIpcServiceHelpers("SiteService");

/**
 * Service for managing site operations through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for site management operations including
 * CRUD operations, data synchronization, and backup functionality with
 * automatic service initialization and type-safe IPC communication.
 *
 * @public
 */
export const SiteService = {
    /**
     * Adds a new site to the backend.
     *
     * @example
     *
     * ```typescript
     * const newSite = await SiteService.addSite({
     *     name: "Example",
     *     url: "https://example.com",
     * });
     * ```
     *
     * @param site - The site object to add.
     *
     * @returns The newly created site object as returned by the backend.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    addSite: wrap("addSite", async (api, site: Site) =>
        api.sites.addSite(site)
    ),

    /**
     * Downloads a backup of the SQLite database.
     *
     * @example
     *
     * ```typescript
     * const backup = await SiteService.downloadSqliteBackup();
     * ```
     *
     * @returns An object containing the backup buffer and the file name.
     *
     * @throws If the electron API is unavailable or the backup operation fails.
     */
    downloadSqliteBackup: wrap("downloadSqliteBackup", async () =>
        DataService.downloadSqliteBackup()
    ),

    /**
     * Retrieves all sites from the backend.
     *
     * @example
     *
     * ```typescript
     * const sites = await SiteService.getSites();
     * ```
     *
     * @returns An array of site objects.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    getSites: wrap("getSites", async (api) => api.sites.getSites()),

    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @remarks
     * This method should be called before any backend operation.
     *
     * @returns A promise that resolves when the electron API is ready.
     *
     * @throws If the electron API is not available.
     */
    initialize: ensureInitialized,

    /**
     * Removes a monitor from a site.
     *
     * @example
     *
     * ```typescript
     * await SiteService.removeMonitor("site123", "monitor456");
     * ```
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The identifier of the monitor to remove.
     *
     * @returns A promise resolving to true when the monitor is removed.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    removeMonitor: wrap(
        "removeMonitor",
        async (api, siteIdentifier: string, monitorId: string) => {
            const removed = await api.monitoring.removeMonitor(
                siteIdentifier,
                monitorId
            );

            if (!removed) {
                throw new Error(
                    `Monitor removal failed for monitor ${monitorId} on site ${siteIdentifier}`
                );
            }

            return true;
        }
    ),

    /**
     * Removes a site from the backend.
     *
     * @example
     *
     * ```typescript
     * await SiteService.removeSite("site123");
     * ```
     *
     * @param identifier - The identifier of the site to remove.
     *
     * @returns A promise resolving to true when the site is removed.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    removeSite: wrap("removeSite", async (api, identifier: string) => {
        const removed = await api.sites.removeSite(identifier);

        if (!removed) {
            throw new Error(
                `Site removal failed for site ${identifier}: Backend operation returned false`
            );
        }

        return true;
    }),

    /**
     * Updates an existing site with the provided changes.
     *
     * @example
     *
     * ```typescript
     * await SiteService.updateSite("site123", { name: "New Name" });
     * ```
     *
     * @param identifier - The identifier of the site to update.
     * @param updates - Partial site object containing fields to update.
     *
     * @returns A promise that resolves when the site is updated.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    updateSite: wrap(
        "updateSite",
        async (api, identifier: string, updates: Partial<Site>) => {
            await api.sites.updateSite(identifier, updates);
        }
    ),
};
