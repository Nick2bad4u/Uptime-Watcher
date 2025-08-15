/**
 * Service layer for handling all site-related operations. Provides a clean
 * abstraction over electron API calls for site management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing.
 */

import type { Site } from "@shared/types";

import { safeExtractIpcData } from "../../../types/ipc";
import { waitForElectronAPI } from "../../utils";

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
        const response = await window.electronAPI.sites.addSite(site);
        return safeExtractIpcData(response, site);
    },

    /**
     * Triggers an immediate check for a site's monitor.
     *
     * @example
     *
     * ```typescript
     * await SiteService.checkSiteNow("site123", "monitor456");
     * ```
     *
     * @param siteId - The identifier of the site to check.
     * @param monitorId - The identifier of the monitor to check.
     *
     * @returns A promise that resolves when the check is triggered.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    async checkSiteNow(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        await window.electronAPI.sites.checkSiteNow(siteId, monitorId);
    },

    /**
     * Downloads a backup of the SQLite database.
     *
     * @example
     *
     * ```typescript
     * const backup = await SiteService.downloadSQLiteBackup();
     * ```
     *
     * @returns An object containing the backup buffer and the file name.
     *
     * @throws If the electron API is unavailable or the backup operation fails.
     */
    async downloadSQLiteBackup(): Promise<{
        buffer: ArrayBuffer;
        fileName: string;
    }> {
        await this.initialize();
        const response = await window.electronAPI.data.downloadSQLiteBackup();
        return safeExtractIpcData(response, {
            buffer: new ArrayBuffer(0),
            fileName: "backup.db",
        });
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
        const response = await window.electronAPI.sites.getSites();
        return safeExtractIpcData(response, []);
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
            console.error("Failed to initialize SiteService:", error);
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
     * @returns A promise that resolves when the monitor is removed.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<void> {
        await this.initialize();
        await window.electronAPI.sites.removeMonitor(siteIdentifier, monitorId);
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
     * @returns A promise that resolves when the site is removed.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    async removeSite(identifier: string): Promise<void> {
        await this.initialize();
        await window.electronAPI.sites.removeSite(identifier);
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
