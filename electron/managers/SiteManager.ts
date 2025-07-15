/**
 * Site management coordinator for CRUD operations and cache synchronization.
 *
 * @remarks
 * The SiteManager serves as the primary interface for all site-related operations,
 * providing a unified API for site creation, updates, deletion, and monitoring
 * coordination. It maintains an in-memory cache for performance while ensuring
 * data consistency with the underlying database through transactional operations.
 *
 * Key responsibilities:
 * - **Site CRUD Operations**: Create, read, update, and delete site configurations
 * - **Cache Management**: Maintain synchronized in-memory cache for performance
 * - **Monitor Integration**: Coordinate with MonitorManager for monitoring operations
 * - **Event Communication**: Emit typed events for frontend and internal coordination
 * - **Data Persistence**: Ensure atomic database operations with transaction safety
 * - **Error Handling**: Provide comprehensive error handling and recovery mechanisms
 *
 * The manager uses dependency injection for testability and follows the repository
 * pattern for data access. All operations are designed to be atomic and maintain
 * data consistency across cache and database layers.
 *
 * @example
 * ```typescript
 * const siteManager = new SiteManager({
 *   siteRepository,
 *   monitorRepository,
 *   historyRepository,
 *   databaseService,
 *   eventEmitter,
 *   monitoringOperations
 * });
 *
 * // Add a new site
 * const site = await siteManager.addSite({
 *   identifier: "site_123",
 *   name: "My Website",
 *   monitors: [...],
 *   monitoring: true
 * });
 * ```
 *
 * @packageDocumentation
 */

import { UptimeEvents, TypedEventBus } from "../events/index";
import { SiteRepository, MonitorRepository, HistoryRepository, DatabaseService } from "../services/index";
import { Site } from "../types";
import { SiteCacheInterface, SiteCache, MonitoringConfig } from "../utils/database/interfaces";
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
 *
 * @remarks
 * Supports all uptime monitoring events for comprehensive event communication
 * between the SiteManager and other system components.
 */
type SiteManagerEvents = UptimeEvents;

/**
 * Interface for monitoring operations integration.
 *
 * @remarks
 * Defines the contract for monitoring operations that can be performed
 * in coordination with site management. This allows loose coupling between
 * the SiteManager and MonitorManager while enabling coordinated operations.
 */
export interface IMonitoringOperations {
    /** Start monitoring for a specific site and monitor */
    startMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Stop monitoring for a specific site and monitor */
    stopMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Update the global history limit setting */
    setHistoryLimit: (limit: number) => Promise<void>;
    /** Set up monitoring for newly created monitors */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
}

/**
 * Dependency injection configuration for SiteManager.
 *
 * @remarks
 * Provides all required dependencies for SiteManager operation, including
 * repository services, database access, event communication, and optional
 * monitoring integration for coordinated operations.
 */
export interface SiteManagerDependencies {
    /** Site repository for database operations */
    siteRepository: SiteRepository;
    /** Monitor repository for monitor-related operations */
    monitorRepository: MonitorRepository;
    /** History repository for status history management */
    historyRepository: HistoryRepository;
    /** Database service for transaction management */
    databaseService: DatabaseService;
    /** Event emitter for system-wide communication */
    eventEmitter: TypedEventBus<SiteManagerEvents>;
    /** Optional MonitorManager dependency for coordinated operations */
    monitoringOperations?: IMonitoringOperations;
}

/**
 * Manages site operations and maintains in-memory cache.
 *
 * @remarks
 * The SiteManager is the central coordinator for all site-related operations
 * in the uptime monitoring system. It provides a high-level API that abstracts
 * the complexity of database operations, cache management, and cross-component
 * coordination while ensuring data consistency and performance.
 *
 * The manager maintains a synchronized in-memory cache of all sites for fast
 * access patterns while ensuring all mutations go through proper database
 * transactions. Event emission keeps other system components informed of
 * site changes and enables reactive UI updates.
 */
export class SiteManager {
    private readonly siteCache = new SiteCache();
    private readonly repositories: Omit<SiteManagerDependencies, "eventEmitter" | "monitoringOperations">;
    private readonly eventEmitter: TypedEventBus<SiteManagerEvents>;
    private readonly siteWritingOrchestrator: SiteWritingOrchestrator;
    private readonly siteRepositoryService: SiteRepositoryService;
    private readonly monitoringOperations: IMonitoringOperations | undefined;

    /**
     * Create a new SiteManager instance.
     *
     * @param dependencies - Required dependencies for site management operations
     *
     * @remarks
     * Initializes the SiteManager with all required dependencies including repositories,
     * database service, event emitter, and optional monitoring operations. Creates
     * internal service orchestrators for coordinated operations and sets up the
     * in-memory cache for performance optimization.
     */
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
     * Initialize the SiteManager by loading all sites into cache.
     * This method should be called during application startup.
     */
    public async initialize(): Promise<void> {
        try {
            logger.info("[SiteManager] Initializing - loading sites into cache");
            const sites = await this.siteRepositoryService.getSitesFromDatabase();
            await this.updateSitesCache(sites);
            logger.info(`[SiteManager] Initialized with ${sites.length} sites in cache`);
        } catch (error) {
            logger.error("[SiteManager] Failed to initialize cache", error);
            throw error;
        }
    }

    /**
     * Get all sites from database with full monitor and history data.
     *
     * @returns Promise resolving to array of complete site objects
     *
     * @remarks
     * Retrieves all sites from the database including their associated monitors
     * and status history. This operation also updates the cache to ensure it
     * stays synchronized with the database. Use this method when you need
     * guaranteed fresh data or during cache refresh operations.
     *
     * @example
     * ```typescript
     * const allSites = await siteManager.getSites();
     * console.log(`Found ${allSites.length} sites`);
     * ```
     */
    public async getSites(): Promise<Site[]> {
        const sites = await this.siteRepositoryService.getSitesFromDatabase();
        // Keep cache synchronized with database
        await this.updateSitesCache(sites);
        return sites;
    }

    /**
     * Get sites from in-memory cache for fast access.
     *
     * @returns The current site cache instance
     *
     * @remarks
     * Returns the in-memory cache containing all sites for high-performance
     * access patterns. The cache is automatically synchronized with database
     * changes through event handling. Use this for internal operations and
     * when performance is critical.
     *
     * Internal use only - external components should use getSites() for
     * guaranteed fresh data or subscribe to cache update events.
     */
    public getSitesFromCache(): Site[] {
        return this.siteCache.getAll();
    }

    /**
     * Get the in-memory sites cache (for internal use by other managers).
     */
    public getSitesCache(): SiteCacheInterface {
        return this.siteCache;
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
        this.siteCache.set(site.identifier, site);

        // Emit typed site added event
        await this.eventEmitter.emitTyped("site:added", {
            site,
            source: "user" as const,
            timestamp: Date.now(),
        });

        // Emit sync event for state consistency
        await this.eventEmitter.emitTyped("sites:state-synchronized", {
            action: "update" as const,
            siteIdentifier: site.identifier,
            timestamp: Date.now(),
            source: "database" as const,
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
     * Remove a site from the database and cache.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        const result = await this.siteWritingOrchestrator.deleteSite(this.siteCache, identifier);

        if (result) {
            // Get site name before removal for event (already removed from cache by service)
            const removedSite = this.siteCache.get(identifier);

            // Emit typed site removed event
            await this.eventEmitter.emitTyped("site:removed", {
                cascade: true,
                siteId: identifier,
                siteName: removedSite?.name ?? "Unknown",
                timestamp: Date.now(),
            });

            // Emit sync event for state consistency
            await this.eventEmitter.emitTyped("sites:state-synchronized", {
                action: "delete" as const,
                siteIdentifier: identifier,
                timestamp: Date.now(),
                source: "database" as const,
            });
        }

        return result;
    }

    /**
     * Create monitoring configuration for site operations.
     *
     * @returns Configuration for managing monitoring operations
     */
    private createMonitoringConfig(): MonitoringConfig {
        return {
            setHistoryLimit: (limit: number) => {
                if (this.monitoringOperations) {
                    // Execute but don't await the promise
                    this.monitoringOperations.setHistoryLimit(limit).catch((error) => {
                        logger.error("[SiteManager] Failed to set history limit", error);
                    });
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
        const previousSite = this.siteCache.get(identifier);
        if (!previousSite) {
            throw new Error(`Site with identifier ${identifier} not found`);
        }

        // Create full monitoring configuration
        const monitoringConfig = this.createMonitoringConfig();

        // Use the service with proper monitoring integration
        const updatedSite = await this.siteWritingOrchestrator.updateSiteWithMonitoring(
            this.siteCache,
            identifier,
            updates,
            monitoringConfig
        );

        // Refresh the entire cache from database to ensure we have the latest monitor IDs
        // This is especially important when monitors are added/updated
        const freshSites = await this.siteRepositoryService.getSitesFromDatabase();
        await this.updateSitesCache(freshSites);

        // Get the refreshed site for the event
        const refreshedSite = this.siteCache.get(identifier) ?? updatedSite;

        // Emit typed site updated event
        await this.eventEmitter.emitTyped("site:updated", {
            previousSite,
            site: refreshedSite,
            timestamp: Date.now(),
            updatedFields: Object.keys(updates),
        });

        // Emit sync event for state consistency
        await this.eventEmitter.emitTyped("sites:state-synchronized", {
            action: "update" as const,
            siteIdentifier: identifier,
            timestamp: Date.now(),
            source: "database" as const,
        });

        return refreshedSite;
    }

    /**
     * Update the sites cache with new data.
     */
    public async updateSitesCache(sites: Site[]): Promise<void> {
        this.siteCache.clear();
        for (const site of sites) {
            this.siteCache.set(site.identifier, site);
        }

        // Emit cache updated event
        await this.eventEmitter.emitTyped("internal:site:cache-updated", {
            identifier: "all",
            operation: "cache-updated",
            timestamp: Date.now(),
        });
    }

    /**
     * Get a specific site from cache with smart background loading.
     */
    public getSiteFromCache(identifier: string): Site | undefined {
        const site = this.siteCache.get(identifier);

        if (!site) {
            // Emit cache miss event
            this.eventEmitter
                .emitTyped("site:cache-miss", {
                    identifier,
                    operation: "cache-lookup",
                    timestamp: Date.now(),
                    backgroundLoading: true,
                })
                .catch((error) => {
                    logger.debug(`[SiteManager] Failed to emit cache miss event`, error);
                });

            // Trigger background loading without blocking
            this.loadSiteInBackground(identifier).catch((error) => {
                logger.debug(`[SiteManager] Background loading error ignored`, error);
            });
        }

        return site;
    }

    /**
     * Load a site in the background and update cache.
     */
    private async loadSiteInBackground(identifier: string): Promise<void> {
        try {
            logger.debug(`[SiteManager] Loading site in background: ${identifier}`);

            const sites = await this.siteRepositoryService.getSitesFromDatabase();
            const site = sites.find((s) => s.identifier === identifier);

            if (site) {
                this.siteCache.set(identifier, site);

                await this.eventEmitter.emitTyped("site:cache-updated", {
                    identifier,
                    operation: "background-load",
                    timestamp: Date.now(),
                });

                logger.debug(`[SiteManager] Background site load completed: ${identifier}`);
            } else {
                logger.debug(`[SiteManager] Site not found during background load: ${identifier}`);
            }
        } catch (error) {
            // Silent failure for background operations - don't throw
            logger.debug(`[SiteManager] Background site load failed for ${identifier}`, error);
        }
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
                const updatedSite = this.siteCache.get(siteIdentifier);
                if (updatedSite) {
                    // Emit internal site updated event
                    await this.eventEmitter.emitTyped("internal:site:updated", {
                        identifier: siteIdentifier,
                        operation: "updated",
                        site: updatedSite,
                        timestamp: Date.now(),
                        updatedFields: ["monitors"],
                    });

                    // Emit sync event for state consistency
                    await this.eventEmitter.emitTyped("sites:state-synchronized", {
                        action: "update" as const,
                        siteIdentifier: siteIdentifier,
                        timestamp: Date.now(),
                        source: "database" as const,
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
