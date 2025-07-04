/**
 * Site service layer for handling all site-related operations.
 * Provides a clean abstraction over electron API calls.
 */

import type { Site } from "../../types";

import { waitForElectronAPI } from "../../utils";

export class SiteService {
    /**
     * Initialize the service by ensuring electron API is available
     */
    static async initialize(): Promise<void> {
        await waitForElectronAPI();
    }

    /**
     * Get all sites from the backend
     */
    static async getSites(): Promise<Site[]> {
        await this.initialize();
        return window.electronAPI.sites.getSites();
    }

    /**
     * Add a new site
     */
    static async addSite(site: Omit<Site, "id">): Promise<Site> {
        await this.initialize();
        return window.electronAPI.sites.addSite(site);
    }

    /**
     * Update an existing site
     */
    static async updateSite(identifier: string, updates: Partial<Site>): Promise<void> {
        await this.initialize();
        return window.electronAPI.sites.updateSite(identifier, updates);
    }

    /**
     * Remove a site
     */
    static async removeSite(identifier: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.sites.removeSite(identifier);
    }

    /**
     * Check a site now
     */
    static async checkSiteNow(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.sites.checkSiteNow(siteId, monitorId);
    }

    /**
     * Download SQLite backup
     */
    static async downloadSQLiteBackup(): Promise<{ buffer: ArrayBuffer; fileName: string }> {
        await this.initialize();
        return window.electronAPI.data.downloadSQLiteBackup();
    }
}
