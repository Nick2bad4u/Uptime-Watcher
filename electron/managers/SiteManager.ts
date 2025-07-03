/**
 * Manages site operations including cache management and CRUD operations.
 * Responsible for site data persistence and in-memory cache synchronization.
 */

import { SiteRepository, MonitorRepository, HistoryRepository } from "../services/database";
import { Site } from "../types";
import {
    addSiteToDatabase,
    removeSiteFromDatabase,
    getSitesFromDatabase,
    updateSite,
    SiteUpdateDependencies,
    SiteUpdateCallbacks,
} from "../utils/database";
import { monitorLogger as logger } from "../utils/logger";

export interface SiteManagerDependencies {
    siteRepository: SiteRepository;
    monitorRepository: MonitorRepository;
    historyRepository: HistoryRepository;
}

export interface SiteManagerCallbacks {
    startMonitoringForSite: (identifier: string, monitorId?: string) => Promise<boolean>;
    stopMonitoringForSite: (identifier: string, monitorId?: string) => Promise<boolean>;
}

/**
 * Manages site operations and maintains in-memory cache.
 * Handles site CRUD operations and cache synchronization.
 */
export class SiteManager {
    private readonly sites: Map<string, Site> = new Map();
    private readonly repositories: SiteManagerDependencies;
    private callbacks?: SiteManagerCallbacks;

    constructor(repositories: SiteManagerDependencies) {
        this.repositories = repositories;
    }

    /**
     * Set callback functions for monitoring operations.
     */
    public setCallbacks(callbacks: SiteManagerCallbacks): void {
        this.callbacks = callbacks;
    }

    /**
     * Get all sites from database.
     */
    public async getSites(): Promise<Site[]> {
        return getSitesFromDatabase({
            repositories: {
                history: this.repositories.historyRepository,
                monitor: this.repositories.monitorRepository,
                site: this.repositories.siteRepository,
            },
        });
    }

    /**
     * Get sites from in-memory cache (faster, for internal use).
     */
    public getSitesFromCache(): Site[] {
        return Array.from(this.sites.values());
    }

    /**
     * Get the in-memory sites cache (for internal use by other managers).
     */
    public getSitesCache(): Map<string, Site> {
        return this.sites;
    }

    /**
     * Add a new site to the database and cache.
     */
    public async addSite(siteData: Site): Promise<Site> {
        // Use the utility function to add site to database
        const site = await addSiteToDatabase({
            repositories: {
                monitor: this.repositories.monitorRepository,
                site: this.repositories.siteRepository,
            },
            siteData,
        });

        // Add to in-memory cache
        this.sites.set(site.identifier, site);

        logger.info(`Site added successfully: ${site.identifier} (${site.name ?? "unnamed"})`);
        return site;
    }

    /**
     * Remove a site from the database and cache.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        return removeSiteFromDatabase({
            identifier,
            logger,
            repositories: {
                monitor: this.repositories.monitorRepository,
                site: this.repositories.siteRepository,
            },
            sites: this.sites,
        });
    }

    /**
     * Update a site in the database and cache.
     */
    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        if (!this.callbacks) {
            throw new Error("SiteManager callbacks not set. Call setCallbacks() first.");
        }

        const dependencies: SiteUpdateDependencies = {
            logger,
            monitorRepository: this.repositories.monitorRepository,
            siteRepository: this.repositories.siteRepository,
            sites: this.sites,
        };

        const callbacks: SiteUpdateCallbacks = {
            startMonitoringForSite: this.callbacks.startMonitoringForSite,
            stopMonitoringForSite: this.callbacks.stopMonitoringForSite,
        };

        return updateSite(dependencies, callbacks, identifier, updates);
    }

    /**
     * Update the sites cache with new data.
     */
    public updateSitesCache(sites: Site[]): void {
        this.sites.clear();
        for (const site of sites) {
            this.sites.set(site.identifier, site);
        }
    }

    /**
     * Get a specific site from cache.
     */
    public getSiteFromCache(identifier: string): Site | undefined {
        return this.sites.get(identifier);
    }
}
