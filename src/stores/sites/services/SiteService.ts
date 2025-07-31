/**
 * Service layer for handling all site-related operations.
 * Provides a clean abstraction over electron API calls for site management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls.
 * All backend communication is performed via IPC and follows strict typing.
 */

import type { Site } from "@shared/types";

import { safeExtractIpcData } from "../../../types/ipc";
import { waitForElectronAPI } from "../../utils";

export const SiteService = {
    /**
     * Adds a new site to the backend.
     *
     * @param site - The site object to add.
     * @returns The newly created site object as returned by the backend.
     * @throws If the electron API is unavailable or the backend operation fails.
     * @example
     * ```typescript
     * const newSite = await SiteService.addSite({ name: "Example", url: "https://example.com" });
     * ```
     */
    async addSite(site: Site): Promise<Site> {
        await this.initialize();
        const response = await window.electronAPI.sites.addSite(site);
        return safeExtractIpcData(response, site);
    },

    /**
     * Triggers an immediate check for a site's monitor.
     *
     * @param siteId - The identifier of the site to check.
     * @param monitorId - The identifier of the monitor to check.
     * @returns A promise that resolves when the check is triggered.
     * @throws If the electron API is unavailable or the backend operation fails.
     * @example
     * ```typescript
     * await SiteService.checkSiteNow("site123", "monitor456");
     * ```
     */
    async checkSiteNow(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        const response = await window.electronAPI.sites.checkSiteNow(siteId, monitorId);
        safeExtractIpcData<void>(response, undefined as void);
    },

    /**
     * Downloads a backup of the SQLite database.
     *
     * @returns An object containing the backup buffer and the file name.
     * @throws If the electron API is unavailable or the backup operation fails.
     * @example
     * ```typescript
     * const backup = await SiteService.downloadSQLiteBackup();
     * ```
     */
    async downloadSQLiteBackup(): Promise<{ buffer: ArrayBuffer; fileName: string }> {
        await this.initialize();
        const response = await window.electronAPI.data.downloadSQLiteBackup();
        return safeExtractIpcData(response, { buffer: new ArrayBuffer(0), fileName: "backup.db" });
    },

    /**
     * Retrieves all sites from the backend.
     *
     * @returns An array of site objects.
     * @throws If the electron API is unavailable or the backend operation fails.
     * @example
     * ```typescript
     * const sites = await SiteService.getSites();
     * ```
     */
    async getSites(): Promise<Site[]> {
        await this.initialize();
        const response = await window.electronAPI.sites.getSites();
        return safeExtractIpcData(response, []);
    },

    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @returns A promise that resolves when the electron API is ready.
     * @throws If the electron API is not available.
     * @remarks
     * This method should be called before any backend operation.
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
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The identifier of the monitor to remove.
     * @returns A promise that resolves when the monitor is removed.
     * @throws If the electron API is unavailable or the backend operation fails.
     * @example
     * ```typescript
     * await SiteService.removeMonitor("site123", "monitor456");
     * ```
     */
    async removeMonitor(siteIdentifier: string, monitorId: string): Promise<void> {
        await this.initialize();
        const response = await window.electronAPI.sites.removeMonitor(siteIdentifier, monitorId);
        safeExtractIpcData<void>(response, undefined as void);
    },

    /**
     * Removes a site from the backend.
     *
     * @param identifier - The identifier of the site to remove.
     * @returns A promise that resolves when the site is removed.
     * @throws If the electron API is unavailable or the backend operation fails.
     * @example
     * ```typescript
     * await SiteService.removeSite("site123");
     * ```
     */
    async removeSite(identifier: string): Promise<void> {
        await this.initialize();
        const response = await window.electronAPI.sites.removeSite(identifier);
        safeExtractIpcData<void>(response, undefined as void);
    },

    /**
     * Updates an existing site with the provided changes.
     *
     * @param identifier - The identifier of the site to update.
     * @param updates - Partial site object containing fields to update.
     * @returns A promise that resolves when the site is updated.
     * @throws If the electron API is unavailable or the backend operation fails.
     * @example
     * ```typescript
     * await SiteService.updateSite("site123", { name: "New Name" });
     * ```
     */
    async updateSite(identifier: string, updates: Partial<Site>): Promise<void> {
        await this.initialize();
        const response = await window.electronAPI.sites.updateSite(identifier, updates);
        safeExtractIpcData<void>(response, undefined as void);
    },
};
