/**
 * Site service layer for handling all site-related operations.
 * Provides a clean abstraction over electron API calls.
 */

import type { Site } from "@shared/types";

import { waitForElectronAPI } from "../../utils";

export const SiteService = {
    /**
     * Add a new site
     */
    async addSite(site: Site): Promise<Site> {
        await this.initialize();
        return window.electronAPI.sites.addSite(site);
    },
    /**
     * Check a site now
     */
    async checkSiteNow(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.sites.checkSiteNow(siteId, monitorId);
    },
    /**
     * Download SQLite backup
     */
    async downloadSQLiteBackup(): Promise<{ buffer: ArrayBuffer; fileName: string }> {
        await this.initialize();
        return window.electronAPI.data.downloadSQLiteBackup();
    },
    /**
     * Get all sites from the backend
     */
    async getSites(): Promise<Site[]> {
        await this.initialize();
        return window.electronAPI.sites.getSites();
    },
    /**
     * Initialize the service by ensuring electron API is available
     */
    async initialize(): Promise<void> {
        await waitForElectronAPI();
    },
    /**
     * Remove a monitor from a site
     */
    async removeMonitor(siteIdentifier: string, monitorId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.sites.removeMonitor(siteIdentifier, monitorId);
    },
    /**
     * Remove a site
     */
    async removeSite(identifier: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.sites.removeSite(identifier);
    },
    /**
     * Update an existing site
     */
    async updateSite(identifier: string, updates: Partial<Site>): Promise<void> {
        await this.initialize();
        return window.electronAPI.sites.updateSite(identifier, updates);
    },
};
