/**
 * @public
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

import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";
import { DatabaseService } from "../services/database/DatabaseService";
import { HistoryRepository } from "../services/database/HistoryRepository";
import { MonitorRepository } from "../services/database/MonitorRepository";
import { SettingsRepository } from "../services/database/SettingsRepository";
import { SiteRepository } from "../services/database/SiteRepository";
import { Site } from "../types";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { MonitoringConfig } from "../utils/database/interfaces";
import { LoggerAdapter } from "../utils/database/serviceFactory";
import { SiteRepositoryService } from "../utils/database/SiteRepositoryService";
import { SiteWriterService } from "../utils/database/SiteWriterService";
import { monitorLogger as logger } from "../utils/logger";
import { ConfigurationManager } from "./ConfigurationManager";

/**
 * @public
 * Interface for monitoring operations integration.
 *
 * @remarks
 * Defines the contract for monitoring operations that can be performed
 * in coordination with site management. This allows loose coupling between
 * the SiteManager and MonitorManager while enabling coordinated operations.
 */
export interface IMonitoringOperations {
    /**
     * Update the global history limit setting.
     * @param limit - The new history limit value.
     * @returns A promise that resolves when the limit is updated.
     */
    setHistoryLimit: (limit: number) => Promise<void>;
    /**
     * Set up monitoring for newly created monitors.
     * @param site - The site containing new monitors.
     * @param newMonitorIds - Array of new monitor IDs to set up.
     * @returns A promise that resolves when setup is complete.
     */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
    /**
     * Start monitoring for a specific site and monitor.
     * @param identifier - The site identifier.
     * @param monitorId - The monitor ID to start monitoring for.
     * @returns A promise that resolves to true if monitoring started, false otherwise.
     */
    startMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
    /**
     * Stop monitoring for a specific site and monitor.
     * @param identifier - The site identifier.
     * @param monitorId - The monitor ID to stop monitoring for.
     * @returns A promise that resolves to true if monitoring stopped, false otherwise.
     */
    stopMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
}

/**
 * @public
 * Dependency injection configuration for {@link SiteManager}.
 *
 * @remarks
 * Provides all required dependencies for SiteManager operation, including
 * repository services, database access, event communication, and optional
 * monitoring integration for coordinated operations.
 */
export interface SiteManagerDependencies {
    /** Configuration manager for business rules and validation. */
    configurationManager: ConfigurationManager;
    /** Database service for transaction management. */
    databaseService: DatabaseService;
    /** Event emitter for system-wide communication. */
    eventEmitter: TypedEventBus<SiteManagerEvents>;
    /** History repository for status history management. */
    historyRepository: HistoryRepository;
    /** Optional MonitorManager dependency for coordinated operations. */
    monitoringOperations?: IMonitoringOperations;
    /** Monitor repository for monitor-related operations. */
    monitorRepository: MonitorRepository;
    /** Settings repository for configuration management. */
    settingsRepository: SettingsRepository;
    /** Site repository for database operations. */
    siteRepository: SiteRepository;
}

/**
 * @public
 * Combined events interface for {@link SiteManager}.
 *
 * @remarks
 * Supports all uptime monitoring events for comprehensive event communication
 * between the SiteManager and other system components.
 */
type SiteManagerEvents = UptimeEvents;

/**
 * @public
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
    private readonly configurationManager: ConfigurationManager;
    private readonly eventEmitter: TypedEventBus<SiteManagerEvents>;
    private readonly monitoringOperations: IMonitoringOperations | undefined;
    private readonly repositories: Omit<
        SiteManagerDependencies,
        "configurationManager" | "eventEmitter" | "monitoringOperations"
    >;
    private readonly siteRepositoryService: SiteRepositoryService;
    private readonly sitesCache: StandardizedCache<Site>;
    private readonly siteWriterService: SiteWriterService;

    /**
     * Constructs a new SiteManager instance.
     *
     * @param dependencies - Required dependencies for site management operations.
     * @remarks
     * Initializes the SiteManager with all required dependencies including repositories,
     * database service, event emitter, and optional monitoring operations. Creates
     * internal service orchestrators for coordinated operations and sets up the
     * in-memory cache for performance optimization.
     * @example
     * ```typescript
     * const siteManager = new SiteManager({ ... });
     * ```
     */
    constructor(dependencies: SiteManagerDependencies) {
        this.configurationManager = dependencies.configurationManager;
        this.repositories = {
            databaseService: dependencies.databaseService,
            historyRepository: dependencies.historyRepository,
            monitorRepository: dependencies.monitorRepository,
            settingsRepository: dependencies.settingsRepository,
            siteRepository: dependencies.siteRepository,
        };
        this.eventEmitter = dependencies.eventEmitter;
        this.monitoringOperations = dependencies.monitoringOperations;

        // Initialize StandardizedCache for sites
        this.sitesCache = new StandardizedCache<Site>({
            defaultTTL: 600_000, // 10 minutes
            enableStats: true,
            eventEmitter: this.eventEmitter,
            maxSize: 500,
            name: "sites",
        });

        // Create the new service-based orchestrators
        this.siteWriterService = new SiteWriterService({
            databaseService: this.repositories.databaseService,
            logger,
            repositories: {
                monitor: this.repositories.monitorRepository,
                site: this.repositories.siteRepository,
            },
        });

        // Create SiteRepositoryService with injected dependencies
        const loggerAdapter = new LoggerAdapter(logger);
        this.siteRepositoryService = new SiteRepositoryService({
            eventEmitter: this.eventEmitter,
            logger: loggerAdapter,
            repositories: {
                history: this.repositories.historyRepository,
                monitor: this.repositories.monitorRepository,
                settings: this.repositories.settingsRepository,
                site: this.repositories.siteRepository,
            },
        });

        logger.info("[SiteManager] Initialized with StandardizedCache");
    }

    /**
     * Adds a new site to the database and cache.
     *
     * @param siteData - The site data to add.
     * @returns The newly added site object.
     * @throws If site validation fails or database operation fails.
     * @example
     * ```typescript
     * const site = await siteManager.addSite(siteData);
     * ```
     */
    public async addSite(siteData: Site): Promise<Site> {
        // Business validation
        await this.validateSite(siteData);

        // Use the new service-based approach to add site to database
        const site = await this.siteWriterService.createSite(siteData);

        // Add to in-memory cache
        this.sitesCache.set(site.identifier, site);

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
            source: "database" as const,
            timestamp: Date.now(),
        });

        logger.info(`Site added successfully: ${site.identifier} (${site.name || "unnamed"})`);
        return site;
    }

    /**
     * Gets a specific site from cache with smart background loading.
     *
     * @param identifier - The site identifier to retrieve.
     * @returns The site object if found in cache, otherwise undefined.
     * @remarks
     * If the site is not found in cache, triggers background loading and emits a cache miss event.
     * @example
     * ```typescript
     * const site = siteManager.getSiteFromCache("site_123");
     * ```
     */
    public getSiteFromCache(identifier: string): Site | undefined {
        const site = this.sitesCache.get(identifier);

        if (!site) {
            // Emit cache miss event
            this.eventEmitter
                .emitTyped("site:cache-miss", {
                    backgroundLoading: true,
                    identifier,
                    operation: "cache-lookup",
                    timestamp: Date.now(),
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
     * Gets all sites from the database with full monitor and history data.
     *
     * @returns Promise resolving to array of complete site objects.
     * @throws If database operation fails.
     * @remarks
     * Retrieves all sites from the database including their associated monitors
     * and status history. This operation also updates the cache to ensure it
     * stays synchronized with the database. Use this method when you need
     * guaranteed fresh data or during cache refresh operations.
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
     * Gets the standardized sites cache (for internal use by other managers).
     *
     * @returns The standardized cache instance for sites.
     * @remarks
     * Used for internal coordination between managers. External consumers should use getSites().
     */
    public getSitesCache(): StandardizedCache<Site> {
        return this.sitesCache;
    }

    /**
     * Gets sites from in-memory cache for fast access.
     *
     * @returns Array of site objects currently in cache.
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
        return this.sitesCache.getAll();
    }

    /**
     * Initializes the SiteManager by loading all sites into cache.
     *
     * @returns A promise that resolves when initialization is complete.
     * @throws If loading sites from database fails.
     * @remarks
     * This method should be called during application startup.
     * @example
     * ```typescript
     * await siteManager.initialize();
     * ```
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
     * Removes a monitor from a site.
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The monitor ID to remove.
     * @returns True if the monitor was removed, false otherwise.
     * @throws If database or cache update fails.
     * @example
     * ```typescript
     * const success = await siteManager.removeMonitor("site_123", "monitor_456");
     * ```
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
                const updatedSite = this.sitesCache.get(siteIdentifier);
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
                        source: "database" as const,
                        timestamp: Date.now(),
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
     * Removes a site from the database and cache.
     *
     * @param identifier - The site identifier to remove.
     * @returns True if the site was removed, false otherwise.
     * @throws If database or cache update fails.
     * @example
     * ```typescript
     * const success = await siteManager.removeSite("site_123");
     * ```
     */
    public async removeSite(identifier: string): Promise<boolean> {
        // Get site information BEFORE deletion for accurate event data
        const siteToRemove = this.sitesCache.get(identifier);
        const siteName = siteToRemove?.name ?? "Unknown";

        const result = await this.siteWriterService.deleteSite(this.sitesCache, identifier);

        if (result) {
            // Emit typed site removed event with accurate site name
            await this.eventEmitter.emitTyped("site:removed", {
                cascade: true,
                siteId: identifier,
                siteName: siteName,
                timestamp: Date.now(),
            });

            // Emit sync event for state consistency
            await this.eventEmitter.emitTyped("sites:state-synchronized", {
                action: "delete" as const,
                siteIdentifier: identifier,
                source: "database" as const,
                timestamp: Date.now(),
            });
        }

        return result;
    }

    /**
     * Updates a site in the database and cache.
     *
     * @param identifier - The site identifier to update.
     * @param updates - Partial site data to update.
     * @returns The updated site object.
     * @throws If validation, database, or cache update fails.
     * @example
     * ```typescript
     * const updatedSite = await siteManager.updateSite("site_123", { name: "New Name" });
     * ```
     */
    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        // Get original site before update for monitoring comparison
        const originalSite = this.sitesCache.get(identifier);
        if (!originalSite) {
            throw new Error(`Site with identifier ${identifier} not found`);
        }

        // Validate the merged site data before persisting changes
        const mergedSite = {
            ...originalSite,
            ...updates,
        };
        await this.validateSite(mergedSite);

        // Create full monitoring configuration
        const monitoringConfig = this.createMonitoringConfig();

        // Perform the update using SiteWriterService directly
        const updatedSite = await this.siteWriterService.updateSite(this.sitesCache, identifier, updates);

        // Handle monitoring changes if monitors were updated (replaces orchestrator logic)
        if (updates.monitors) {
            await this.siteWriterService.handleMonitorIntervalChanges(
                identifier,
                originalSite,
                updates.monitors,
                monitoringConfig
            );

            // Detect and setup new monitors to ensure consistency with new site behavior
            const newMonitorIds = this.siteWriterService.detectNewMonitors(originalSite.monitors, updates.monitors);
            if (newMonitorIds.length > 0) {
                await monitoringConfig.setupNewMonitors(updatedSite, newMonitorIds);
            }
        }

        // Refresh the entire cache from database to ensure we have the latest monitor IDs
        // This is especially important when monitors are added/updated
        const freshSites = await this.siteRepositoryService.getSitesFromDatabase();
        await this.updateSitesCache(freshSites);

        // Get the refreshed site for the event
        const refreshedSite = this.sitesCache.get(identifier);
        if (!refreshedSite) {
            throw new Error(`Site with identifier ${identifier} not found in cache after refresh`);
        }

        // Emit typed site updated event
        await this.eventEmitter.emitTyped("site:updated", {
            previousSite: originalSite,
            site: refreshedSite,
            timestamp: Date.now(),
            updatedFields: Object.keys(updates),
        });

        // Emit sync event for state consistency
        await this.eventEmitter.emitTyped("sites:state-synchronized", {
            action: "update" as const,
            siteIdentifier: identifier,
            source: "database" as const,
            timestamp: Date.now(),
        });

        return refreshedSite;
    }

    /**
     * Updates the sites cache with new data.
     *
     * @param sites - Array of site objects to update the cache with.
     * @returns A promise that resolves when cache update is complete.
     * @example
     * ```typescript
     * await siteManager.updateSitesCache(sitesArray);
     * ```
     */
    public async updateSitesCache(sites: Site[]): Promise<void> {
        this.sitesCache.clear();
        for (const site of sites) {
            this.sitesCache.set(site.identifier, site);
        }

        // Emit cache updated event
        await this.eventEmitter.emitTyped("internal:site:cache-updated", {
            identifier: "all",
            operation: "cache-updated",
            timestamp: Date.now(),
        });
    }

    /**
     * Creates monitoring configuration for site operations.
     *
     * @returns Configuration for managing monitoring operations.
     * @remarks
     * Used internally for coordinated monitoring actions during site updates.
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
            setupNewMonitors: async (site: Site, newMonitorIds: string[]) => {
                if (this.monitoringOperations) {
                    await this.monitoringOperations.setupNewMonitors(site, newMonitorIds);
                } else {
                    logger.warn("MonitoringOperations not available for setupNewMonitors");
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
        };
    }

    /**
     * Executes monitor deletion.
     *
     * @param monitorId - The monitor ID to delete.
     * @returns True if the monitor was deleted, false otherwise.
     * @throws If database operation fails.
     */
    private async executeMonitorDeletion(monitorId: string): Promise<boolean> {
        // MonitorRepository.delete() already handles its own transaction,
        // so we don't need to wrap it in another transaction
        return this.repositories.monitorRepository.delete(monitorId);
    }

    /**
     * Formats validation errors for better readability.
     *
     * @param errors - Array of error messages.
     * @returns Formatted error string.
     */
    private formatValidationErrors(errors: string[]): string {
        if (errors.length === 1) {
            // Ensure fallback to empty string if errors[0] is undefined
            return errors[0] ?? "";
        }
        return `\n  - ${errors.join("\n  - ")}`;
    }

    /**
     * Loads a site in the background and updates cache.
     *
     * @param identifier - The site identifier to load.
     * @returns A promise that resolves when background loading is complete.
     * @remarks
     * Performs silent background loading with error logging but no exception throwing.
     * This ensures background operations don't disrupt the main application flow while
     * still providing observability through logging.
     */
    private async loadSiteInBackground(identifier: string): Promise<void> {
        try {
            logger.debug(`[SiteManager] Loading site in background: ${identifier}`);

            const sites = await this.siteRepositoryService.getSitesFromDatabase();
            const site = sites.find((s) => s.identifier === identifier);

            if (site) {
                this.sitesCache.set(identifier, site);

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
     * Validates site data according to business rules.
     *
     * @param site - The site object to validate.
     * @returns A promise that resolves if validation passes.
     * @throws If validation fails.
     */
    private async validateSite(site: Site): Promise<void> {
        const validationResult = await this.configurationManager.validateSiteConfiguration(site);

        if (!validationResult.isValid) {
            throw new Error(
                `Site validation failed for '${site.identifier}': ${this.formatValidationErrors(validationResult.errors)}`
            );
        }
    }
}
