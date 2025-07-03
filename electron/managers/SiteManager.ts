/**
 * Manages site operations including cache management and CRUD operations.
 * Responsible for site data persistence and in-memory cache synchronization.
 */

import { EventEmitter } from "events";

import { SITE_EVENTS, SiteEventData } from "../events";
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
import { configurationManager } from "./ConfigurationManager";

export interface SiteManagerDependencies {
    siteRepository: SiteRepository;
    monitorRepository: MonitorRepository;
    historyRepository: HistoryRepository;
    eventEmitter: EventEmitter;
}

/**
 * Manages site operations and maintains in-memory cache.
 * Handles site CRUD operations and cache synchronization.
 */
export class SiteManager extends EventEmitter {
    private readonly sites: Map<string, Site> = new Map();
    private readonly repositories: Omit<SiteManagerDependencies, "eventEmitter">;
    private readonly eventEmitter: EventEmitter;

    constructor(dependencies: SiteManagerDependencies) {
        super();
        this.repositories = {
            historyRepository: dependencies.historyRepository,
            monitorRepository: dependencies.monitorRepository,
            siteRepository: dependencies.siteRepository,
        };
        this.eventEmitter = dependencies.eventEmitter;
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
        // Business validation
        this.validateSite(siteData);

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

        // Emit site added event
        const eventData: SiteEventData = {
            identifier: site.identifier,
            operation: "added",
            site,
        };
        this.eventEmitter.emit(SITE_EVENTS.SITE_ADDED, eventData);

        logger.info(`Site added successfully: ${site.identifier} (${site.name ?? "unnamed"})`);
        return site;
    }

    /**
     * Business logic: Validate site data according to business rules.
     */
    private validateSite(site: Site): void {
        const validationResult = configurationManager.validateSiteConfiguration(site);

        if (!validationResult.isValid) {
            throw new Error(`Site validation failed: ${validationResult.errors.join(", ")}`);
        }
    }

    /**
     * Remove a site from the database and cache.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        const result = await removeSiteFromDatabase({
            identifier,
            logger,
            repositories: {
                monitor: this.repositories.monitorRepository,
                site: this.repositories.siteRepository,
            },
            sites: this.sites,
        });

        if (result) {
            // Emit site removed event
            const eventData: SiteEventData = {
                identifier,
                operation: "removed",
            };
            this.eventEmitter.emit(SITE_EVENTS.SITE_REMOVED, eventData);
        }

        return result;
    }

    /**
     * Update a site in the database and cache.
     */
    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        const dependencies: SiteUpdateDependencies = {
            logger,
            monitorRepository: this.repositories.monitorRepository,
            siteRepository: this.repositories.siteRepository,
            sites: this.sites,
        };

        const callbacks: SiteUpdateCallbacks = {
            startMonitoringForSite: async (id: string, monitorId?: string) => {
                const eventData: SiteEventData = {
                    identifier: id,
                    monitorId,
                    operation: "start-monitoring",
                };
                this.eventEmitter.emit(SITE_EVENTS.START_MONITORING_REQUESTED, eventData);
                return true; // Assume success for now, actual result will be handled via events
            },
            stopMonitoringForSite: async (id: string, monitorId?: string) => {
                const eventData: SiteEventData = {
                    identifier: id,
                    monitorId,
                    operation: "stop-monitoring",
                };
                this.eventEmitter.emit(SITE_EVENTS.STOP_MONITORING_REQUESTED, eventData);
                return true; // Assume success for now, actual result will be handled via events
            },
        };

        const updatedSite = await updateSite(dependencies, callbacks, identifier, updates);

        // Emit site updated event
        const eventData: SiteEventData = {
            identifier,
            operation: "updated",
            site: updatedSite,
        };
        this.eventEmitter.emit(SITE_EVENTS.SITE_UPDATED, eventData);

        return updatedSite;
    }

    /**
     * Update the sites cache with new data.
     */
    public updateSitesCache(sites: Site[]): void {
        this.sites.clear();
        for (const site of sites) {
            this.sites.set(site.identifier, site);
        }

        // Emit cache updated event
        const eventData: SiteEventData = {
            identifier: "all",
            operation: "cache-updated",
        };
        this.eventEmitter.emit(SITE_EVENTS.CACHE_UPDATED, eventData);
    }

    /**
     * Get a specific site from cache.
     */
    public getSiteFromCache(identifier: string): Site | undefined {
        return this.sites.get(identifier);
    }
}
