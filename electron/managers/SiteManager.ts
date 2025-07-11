/**
 * Manages site operations including cache management and CRUD operations.
 * Responsible for site data persistence and in-memory cache synchronization.
 */

import { UptimeEvents, TypedEventBus } from "../events/index";
import { SiteRepository, MonitorRepository, HistoryRepository, DatabaseService } from "../services/index";
import { Site } from "../types";
import {
    SiteWritingOrchestrator,
    createSiteWritingOrchestrator,
    createSiteRepositoryService,
    SiteRepositoryService,
    monitorLogger as logger,
} from "../utils";
import { configurationManager } from "../managers/index";

/**
 * Combined events interface for SiteManager.
 */
type SiteManagerEvents = UptimeEvents;

/**
 * Interface for monitoring operations.
 */
export interface IMonitoringOperations {
    startMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
    stopMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
    setHistoryLimit: (limit: number) => Promise<void>;
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
}

export interface SiteManagerDependencies {
    siteRepository: SiteRepository;
    monitorRepository: MonitorRepository;
    historyRepository: HistoryRepository;
    databaseService: DatabaseService;
    eventEmitter: TypedEventBus<SiteManagerEvents>;
    // Optional MonitorManager dependency for proper monitoring integration
    monitoringOperations?: IMonitoringOperations;
}

/**
 * Manages site operations and maintains in-memory cache.
 * Handles site CRUD operations and cache synchronization.
 */
export class SiteManager {
    private readonly sites = new Map<string, Site>();
    private readonly repositories: Omit<SiteManagerDependencies, "eventEmitter" | "monitoringOperations">;
    private readonly eventEmitter: TypedEventBus<SiteManagerEvents>;
    private readonly siteWritingOrchestrator: SiteWritingOrchestrator;
    private readonly siteRepositoryService: SiteRepositoryService;
    private readonly monitoringOperations: IMonitoringOperations | undefined;

    constructor(dependencies: SiteManagerDependencies) {
        this.repositories = {
            databaseService: dependencies.databaseService,
            historyRepository: dependencies.historyRepository,
            monitorRepository: dependencies.monitorRepository,
            siteRepository: dependencies.siteRepository,
        };
        this.eventEmitter = dependencies.eventEmitter;
        this.monitoringOperations = dependencies.monitoringOperations;

        // Create the new service-based orchestrators
        this.siteWritingOrchestrator = createSiteWritingOrchestrator();
        this.siteRepositoryService = createSiteRepositoryService(this.eventEmitter);
    }

    /**
     * Get all sites from database.
     */
    public async getSites(): Promise<Site[]> {
        return this.siteRepositoryService.getSitesFromDatabase();
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

        // Use the new service-based approach to add site to database
        const site = await this.siteWritingOrchestrator.createSite(siteData);

        // Add to in-memory cache
        this.sites.set(site.identifier, site);

        // Emit typed site added event
        await this.eventEmitter.emitTyped("site:added", {
            site,
            source: "user" as const,
            timestamp: Date.now(),
        });

        logger.info(`Site added successfully: ${site.identifier} (${site.name || "unnamed"})`);
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
     * Create adapter for ISiteCache interface from internal Map.
     */
    private createSiteCacheAdapter() {
        return {
            clear: () => this.sites.clear(),
            delete: (id: string) => this.sites.delete(id),
            entries: () => this.sites.entries(),
            get: (id: string) => this.sites.get(id),
            set: (id: string, site: Site) => {
                this.sites.set(id, site);
            },
            size: () => this.sites.size,
        };
    }

    /**
     * Remove a site from the database and cache.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        const siteCache = this.createSiteCacheAdapter();
        const result = await this.siteWritingOrchestrator.deleteSite(siteCache, identifier);

        if (result) {
            // Get site name before removal for event (already removed from cache by service)
            const removedSite = this.sites.get(identifier);

            // Emit typed site removed event
            await this.eventEmitter.emitTyped("site:removed", {
                cascade: true,
                siteId: identifier,
                siteName: removedSite?.name ?? "Unknown",
                timestamp: Date.now(),
            });
        }

        return result;
    }

    /**
     * Create monitoring configuration for site operations.
     */
    private createMonitoringConfig() {
        return {
            setHistoryLimit: async (limit: number) => {
                if (this.monitoringOperations) {
                    await this.monitoringOperations.setHistoryLimit(limit);
                } else {
                    logger.warn("MonitoringOperations not available for setHistoryLimit");
                }
            },
            startMonitoring: async (identifier: string, monitorId: string) => {
                if (this.monitoringOperations) {
                    return this.monitoringOperations.startMonitoringForSite(identifier, monitorId);
                } else {
                    logger.warn("MonitoringOperations not available for startMonitoring");
                    return false;
                }
            },
            stopMonitoring: async (identifier: string, monitorId: string) => {
                if (this.monitoringOperations) {
                    return this.monitoringOperations.stopMonitoringForSite(identifier, monitorId);
                } else {
                    logger.warn("MonitoringOperations not available for stopMonitoring");
                    return false;
                }
            },
            setupNewMonitors: async (site: Site, newMonitorIds: string[]) => {
                if (this.monitoringOperations) {
                    await this.monitoringOperations.setupNewMonitors(site, newMonitorIds);
                } else {
                    logger.warn("MonitoringOperations not available for setupNewMonitors");
                }
            },
        };
    }

    /**
     * Update a site in the database and cache.
     */
    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        // Get the current site before updating for event data
        const previousSite = this.sites.get(identifier);
        if (!previousSite) {
            throw new Error(`Site with identifier ${identifier} not found`);
        }

        // Create site cache adapter
        const siteCache = this.createSiteCacheAdapter();

        // Create full monitoring configuration
        const monitoringConfig = this.createMonitoringConfig();

        // Use the service with proper monitoring integration
        const updatedSite = await this.siteWritingOrchestrator.updateSiteWithMonitoring(
            siteCache,
            identifier,
            updates,
            monitoringConfig
        );

        // Refresh the entire cache from database to ensure we have the latest monitor IDs
        // This is especially important when monitors are added/updated
        const freshSites = await this.siteRepositoryService.getSitesFromDatabase();
        await this.updateSitesCache(freshSites);

        // Get the refreshed site for the event
        const refreshedSite = this.sites.get(identifier) ?? updatedSite;

        // Emit typed site updated event
        await this.eventEmitter.emitTyped("site:updated", {
            previousSite,
            site: refreshedSite,
            timestamp: Date.now(),
            updatedFields: Object.keys(updates),
        });

        return refreshedSite;
    }

    /**
     * Update the sites cache with new data.
     */
    public async updateSitesCache(sites: Site[]): Promise<void> {
        this.sites.clear();
        for (const site of sites) {
            this.sites.set(site.identifier, site);
        }

        // Emit cache updated event
        await this.eventEmitter.emitTyped("internal:site:cache-updated", {
            identifier: "all",
            operation: "cache-updated",
            timestamp: Date.now(),
        });
    }

    /**
     * Get a specific site from cache.
     */
    public getSiteFromCache(identifier: string): Site | undefined {
        return this.sites.get(identifier);
    }

    /**
     * Remove a monitor from a site.
     */
    public async removeMonitor(siteIdentifier: string, monitorId: string): Promise<boolean> {
        try {
            // Remove the monitor from the database using transaction
            const success = await this.executeMonitorDeletion(monitorId);

            if (success) {
                // Refresh the cache by getting all sites (to ensure proper site structure)
                const allSites = await this.siteRepositoryService.getSitesFromDatabase();

                // Update cache
                await this.updateSitesCache(allSites);

                // Find the updated site for the event
                const updatedSite = this.sites.get(siteIdentifier);
                if (updatedSite) {
                    // Emit internal site updated event
                    await this.eventEmitter.emitTyped("internal:site:updated", {
                        identifier: siteIdentifier,
                        operation: "updated",
                        site: updatedSite,
                        timestamp: Date.now(),
                        updatedFields: ["monitors"],
                    });

                    logger.info(`[SiteManager] Monitor ${monitorId} removed from site ${siteIdentifier}`);
                }
            }

            return success;
        } catch (error) {
            logger.error(`[SiteManager] Failed to remove monitor ${monitorId} from site ${siteIdentifier}`, error);
            throw error;
        }
    }

    /**
     * Execute monitor deletion.
     */
    private async executeMonitorDeletion(monitorId: string): Promise<boolean> {
        // MonitorRepository.delete() already handles its own transaction,
        // so we don't need to wrap it in another transaction
        return this.repositories.monitorRepository.delete(monitorId);
    }
}
