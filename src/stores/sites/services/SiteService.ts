/**
 * Service layer for handling all site-related operations. Provides a clean
 * abstraction over electron API calls for site management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing.
 */

import type { Site } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";

import { DataService } from "../../../services/DataService";
import { logger } from "../../../services/logger";
import { waitForElectronAPI } from "../../utils";

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
    async addSite(site: Site): Promise<Site> {
        await this.initialize();
        // Preload now returns extracted data directly
        return window.electronAPI.sites.addSite(site);
    },

    /**
     * Triggers an immediate check for a site's monitor.
     *
     * @example
     *
     * ```typescript
     * const updatedSite = await SiteService.checkSiteNow(
     *     "site123",
     *     "monitor456"
     * );
     * ```
     *
     * @param siteId - The identifier of the site to check.
     * @param monitorId - The identifier of the monitor to check.
     *
     * @returns A promise that resolves to the updated site.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    async checkSiteNow(siteId: string, monitorId: string): Promise<Site> {
        await this.initialize();
        return window.electronAPI.sites.checkSiteNow(siteId, monitorId);
    },

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
    async downloadSqliteBackup(): Promise<{
        /** SQLite database backup as binary data */
        buffer: ArrayBuffer;
        /** Generated filename for the backup file */
        fileName: string;
    }> {
        await this.initialize();
        // Preload now returns extracted data directly
        return DataService.downloadSqliteBackup();
    },

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
    async getSites(): Promise<Site[]> {
        await this.initialize();
        // Preload now returns extracted data directly
        return window.electronAPI.sites.getSites();
    },

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
    async initialize(): Promise<void> {
        try {
            await waitForElectronAPI();
        } catch (error) {
            logger.error(
                "Failed to initialize SiteService:",

                ensureError(error)
            );
            throw error;
        }
    },

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
    async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<boolean> {
        await this.initialize();
        const removed = await window.electronAPI.monitoring.removeMonitor(
            siteIdentifier,
            monitorId
        );

        if (!removed) {
            throw new Error(
                `Monitor removal failed for monitor ${monitorId} on site ${siteIdentifier}`
            );
        }

        return true;
    },

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
    async removeSite(identifier: string): Promise<boolean> {
        await this.initialize();
        return window.electronAPI.sites.removeSite(identifier);
    },

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
    async updateSite(
        identifier: string,
        updates: Partial<Site>
    ): Promise<void> {
        await this.initialize();
        await window.electronAPI.sites.updateSite(identifier, updates);
    },
};
