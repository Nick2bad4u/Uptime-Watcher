/**
 * Site management service responsible for site CRUD operations and monitoring
 * coordination.
 *
 * @remarks
 * The SiteManager serves as the primary interface for all site-related
 * operations, providing a unified API for site creation, updates, deletion, and
 * monitoring coordination. It maintains an in-memory cache for performance
 * while ensuring data consistency with the underlying database through
 * transactional operations.
 *
 * Key responsibilities:
 *
 * - Site CRUD Operations: Create, read, update, and delete site configurations
 * - Cache Management: Maintain synchronized in-memory cache for performance
 * - Monitor Integration: Coordinate with MonitorManager for monitoring operations
 * - Event Communication: Emit typed events for frontend and internal coordination
 * - Data Persistence: Ensure atomic database operations with transaction safety
 * - Error Handling: Provide comprehensive error handling and recovery mechanisms
 *
 * The manager uses dependency injection for testability and follows the
 * repository pattern for data access. All operations are designed to be atomic
 * and maintain data consistency across cache and database layers.
 *
 * @example
 *
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
 * @public
 * Site management coordinator for CRUD operations and cache synchronization.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import { CACHE_CONFIG, CACHE_NAMES } from "@shared/constants/cacheConfig";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";
import type { DatabaseService } from "../services/database/DatabaseService";
import type { HistoryRepository } from "../services/database/HistoryRepository";
import type { MonitorRepository } from "../services/database/MonitorRepository";
import type { SettingsRepository } from "../services/database/SettingsRepository";
import type { SiteRepository } from "../services/database/SiteRepository";
import type { MonitoringConfig } from "../utils/database/interfaces";
import type { ConfigurationManager } from "./ConfigurationManager";

import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { LoggerAdapter } from "../utils/database/serviceFactory";
import { SiteRepositoryService } from "../utils/database/SiteRepositoryService";
import { SiteWriterService } from "../utils/database/SiteWriterService";
import { logger } from "../utils/logger";

/**
 * @remarks
 * Defines the contract for monitoring operations that can be performed in
 * coordination with site management. This allows loose coupling between the
 * SiteManager and MonitorManager while enabling coordinated operations.
 *
 * @public
 * Interface for monitoring operations integration.
 */
export interface IMonitoringOperations {
    /**
     * Update the global history limit setting.
     *
     * @param limit - The new history limit value.
     *
     * @returns A promise that resolves when the limit is updated.
     */
    setHistoryLimit: (limit: number) => Promise<void>;
    /**
     * Set up monitoring for newly created monitors.
     *
     * @param site - The site containing new monitors.
     * @param newMonitorIds - Array of new monitor IDs to set up.
     *
     * @returns A promise that resolves when setup is complete.
     */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
    /**
     * Start monitoring for a specific site and monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - The monitor ID to start monitoring for.
     *
     * @returns A promise that resolves to true if monitoring started, false
     *   otherwise.
     */
    startMonitoringForSite: (
        identifier: string,
        monitorId: string
    ) => Promise<boolean>;
    /**
     * Stop monitoring for a specific site and monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - The monitor ID to stop monitoring for.
     *
     * @returns A promise that resolves to true if monitoring stopped, false
     *   otherwise.
     */
    stopMonitoringForSite: (
        identifier: string,
        monitorId: string
    ) => Promise<boolean>;
}

/**
 * @remarks
 * Provides all required dependencies for SiteManager operation, including
 * repository services, database access, event communication, and optional
 * monitoring integration for coordinated operations.
 *
 * @public
 * Dependency injection configuration for {@link SiteManager}.
 */
export interface SiteManagerDependencies {
    /** Configuration manager for business rules and validation. */
    configurationManager: ConfigurationManager;
    /** Database service for transaction management. */
    databaseService: DatabaseService;
    /** Event emitter for system-wide communication. */
    eventEmitter: TypedEventBus<UptimeEvents>;
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
 * @remarks
 * The SiteManager is the central coordinator for all site-related operations in
 * the uptime monitoring system. It provides a high-level API that abstracts the
 * complexity of database operations, cache management, and cross-component
 * coordination while ensuring data consistency and performance.
 *
 * The manager maintains a synchronized in-memory cache of all sites for fast
 * access patterns while ensuring all mutations go through proper database
 * transactions. Event emission keeps other system components informed of site
 * changes and enables reactive UI updates.
 *
 * @public
 * Manages site operations and maintains in-memory cache.
 */
export class SiteManager {
    /** Configuration manager for business rules and validation */
    private readonly configurationManager: ConfigurationManager;

    /** Event bus for emitting site-related events */
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /** Optional monitoring operations for coordinating with monitor management */
    private readonly monitoringOperations: IMonitoringOperations | undefined;

    /** Collection of repository and service dependencies for data access */
    private readonly repositories: {
        /** Database service for transactional operations */
        databaseService: DatabaseService;
        /** Repository for managing status history records */
        historyRepository: HistoryRepository;
        /** Repository for managing monitor configuration and data */
        monitorRepository: MonitorRepository;
        /** Repository for managing application settings */
        settingsRepository: SettingsRepository;
        /** Repository for managing site configuration and data */
        siteRepository: SiteRepository;
    };

    /** Service for reading site data from repositories */
    private readonly siteRepositoryService: SiteRepositoryService;

    /** In-memory cache for site data performance optimization */
    private readonly sitesCache: StandardizedCache<Site>;

    /** Service for writing and updating site data */
    private readonly siteWriterService: SiteWriterService;

    /**
     * Adds a new site to the database and cache.
     *
     * @example
     *
     * ```typescript
     * const site = await siteManager.addSite(siteData);
     * ```
     *
     * @param siteData - The site data to add.
     *
     * @returns The newly added site object.
     *
     * @throws If site validation fails or database operation fails.
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
            sites: this.getSitesSnapshot(),
            source: "database" as const,
            timestamp: Date.now(),
        });

        logger.info(
            interpolateLogTemplate(LOG_TEMPLATES.services.SITE_ADDED_SUCCESS, {
                identifier: site.identifier,
                name: site.name || "unnamed",
            })
        );
        return site;
    }

    /**
     * Gets all sites from the database with full monitor and history data.
     *
     * @remarks
     * Retrieves all sites from the database including their associated monitors
     * and status history. This operation also updates the cache to ensure it
     * stays synchronized with the database. Use this method when you need
     * guaranteed fresh data or during cache refresh operations.
     *
     * @example
     *
     * ```typescript
     * const allSites = await siteManager.getSites();
     * console.log(`Found ${allSites.length} sites`);
     * ```
     *
     * @returns Promise resolving to array of complete site objects.
     *
     * @throws If database operation fails.
     */
    public async getSites(): Promise<Site[]> {
        const sites = await this.siteRepositoryService.getSitesFromDatabase();
        // Keep cache synchronized with database
        await this.updateSitesCache(sites);
        return sites;
    }

    /**
     * Retrieves a single site with full details from cache or database.
     *
     * @remarks
     * Attempts to resolve the site from the in-memory cache first. When the
     * site is not cached, the database is queried and the cache is updated with
     * the fresh result. Returns `undefined` when the site does not exist.
     *
     * @param identifier - Unique identifier of the site to retrieve.
     *
     * @returns Promise resolving to the site or `undefined` when not found.
     *
     * @throws Error if the provided identifier is invalid.
     */
    public async getSiteWithDetails(
        identifier: string
    ): Promise<Site | undefined> {
        if (!identifier || typeof identifier !== "string") {
            throw new Error(`Invalid site identifier: ${identifier}`);
        }

        const cachedSite = this.sitesCache.get(identifier);
        if (cachedSite) {
            return cachedSite;
        }

        const site =
            await this.siteRepositoryService.getSiteFromDatabase(identifier);

        if (site) {
            this.sitesCache.set(identifier, site);
        }

        return site;
    }

    /**
     * Initializes the SiteManager by loading all sites into cache.
     *
     * @remarks
     * This method should be called during application startup.
     *
     * @example
     *
     * ```typescript
     * await siteManager.initialize();
     * ```
     *
     * @returns A promise that resolves when initialization is complete.
     *
     * @throws If loading sites from database fails.
     */
    public async initialize(): Promise<void> {
        logger.info(LOG_TEMPLATES.services.SITE_MANAGER_LOADING_CACHE);
        const sites = await this.siteRepositoryService.getSitesFromDatabase();
        await this.updateSitesCache(sites);
        logger.info(
            interpolateLogTemplate(
                LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED,
                { count: sites.length }
            )
        );
    }

    /**
     * Removes a monitor from a site.
     *
     * @example
     *
     * ```typescript
     * const success = await siteManager.removeMonitor(
     *     "site_123",
     *     "monitor_456"
     * );
     * ```
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The monitor ID to remove.
     *
     * @returns True if the monitor was removed, false otherwise.
     *
     * @throws If database or cache update fails.
     */
    public async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<boolean> {
        // Remove the monitor from the database using transaction
        const success = await this.executeMonitorDeletion(monitorId);

        if (success) {
            // Refresh the cache by getting all sites (to ensure proper
            // site structure)
            const allSites =
                await this.siteRepositoryService.getSitesFromDatabase();

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
                    sites: this.getSitesSnapshot(),
                    source: "database" as const,
                    timestamp: Date.now(),
                });

                logger.info(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.services.MONITOR_REMOVED_FROM_SITE,
                        {
                            monitorId,
                            siteIdentifier,
                        }
                    )
                );
            }
        }

        return success;
    }

    /**
     * Removes a site from the database and cache.
     *
     * @example
     *
     * ```typescript
     * const success = await siteManager.removeSite("site_123");
     * ```
     *
     * @param identifier - The site identifier to remove.
     *
     * @returns True if the site was removed, false otherwise.
     *
     * @throws If database or cache update fails.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        // Get site information BEFORE deletion for accurate event data
        const siteToRemove = this.sitesCache.get(identifier);
        const siteName = siteToRemove?.name ?? "Unknown";

        const result = await this.siteWriterService.deleteSite(
            this.sitesCache,
            identifier
        );

        if (result) {
            // Emit typed site removed event with accurate site name
            await this.eventEmitter.emitTyped("site:removed", {
                cascade: true,
                siteIdentifier: identifier,
                siteName: siteName,
                timestamp: Date.now(),
            });

            // Emit sync event for state consistency
            await this.eventEmitter.emitTyped("sites:state-synchronized", {
                action: "delete" as const,
                siteIdentifier: identifier,
                sites: this.getSitesSnapshot(),
                source: "database" as const,
                timestamp: Date.now(),
            });
        }

        return result;
    }

    /**
     * Removes all sites from the database and cache.
     *
     * @remarks
     * This method is primarily intended for testing purposes to ensure clean
     * test state. It performs atomic deletion of all sites and their associated
     * monitors using a database transaction. The operation clears both the
     * database and the in-memory cache.
     *
     * All monitoring for all sites will be stopped before deletion occurs.
     * Event notifications are emitted for each site removal to maintain
     * consistency with the event system.
     *
     * @example
     *
     * ```typescript
     * const deletedCount = await siteManager.deleteAllSites();
     * console.log(`Deleted ${deletedCount} sites`);
     * ```
     *
     * @returns Promise resolving to the number of sites deleted.
     *
     * @throws If database operation fails.
     */
    public async deleteAllSites(): Promise<number> {
        // Capture snapshot prior to deletion for consistent logging and
        // downstream event emission.
        const sitesSnapshot = this.sitesCache.getAll();
        const snapshotCount = sitesSnapshot.length;

        if (snapshotCount === 0) {
            logger.debug("[SiteManager] No sites to delete");
            return 0;
        }

        logger.info(`[SiteManager] Deleting all ${snapshotCount} sites`);

        const { deletedCount, deletedSites } =
            await this.siteWriterService.deleteAllSites(this.sitesCache);

        if (deletedCount === 0) {
            logger.warn(
                `[SiteManager] Bulk delete reported zero deletions despite ${snapshotCount} cached sites`
            );
            return 0;
        }

        const eventSites =
            deletedSites.length > 0 ? deletedSites : sitesSnapshot;

        // Emit events for each deleted site for consistency
        for (const site of eventSites) {
            /* eslint-disable no-await-in-loop -- Sequential event emission required for consistency */
            await this.eventEmitter.emitTyped("site:removed", {
                cascade: true,
                siteIdentifier: site.identifier,
                siteName: site.name,
                timestamp: Date.now(),
            });
            /* eslint-enable no-await-in-loop -- Re-enable after controlled sequential event processing */
        }

        // Emit bulk sync event for state consistency
        await this.eventEmitter.emitTyped("sites:state-synchronized", {
            action: "bulk-sync" as const,
            siteIdentifier: "all",
            sites: this.getSitesSnapshot(),
            source: "database" as const,
            timestamp: Date.now(),
        });

        logger.info(
            `[SiteManager] Successfully deleted all ${deletedCount} sites`
        );
        return deletedCount;
    }

    /**
     * Updates a site in the database and cache.
     *
     * @example
     *
     * ```typescript
     * const updatedSite = await siteManager.updateSite("site_123", {
     *     name: "New Name",
     * });
     * ```
     *
     * @param identifier - The site identifier to update.
     * @param updates - Partial site data to update.
     *
     * @returns The updated site object.
     *
     * @throws If validation, database, or cache update fails.
     */
    public async updateSite(
        identifier: string,
        updates: Partial<Site>
    ): Promise<Site> {
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
        const updatedSite = await this.siteWriterService.updateSite(
            this.sitesCache,
            identifier,
            updates
        );

        // Handle monitoring changes if monitors were updated (replaces
        // orchestrator logic)
        if (updates.monitors) {
            await this.siteWriterService.handleMonitorIntervalChanges(
                identifier,
                originalSite,
                updates.monitors,
                monitoringConfig
            );

            // Detect and setup new monitors to ensure consistency with new
            // site behavior
            const newMonitorIds = this.siteWriterService.detectNewMonitors(
                originalSite.monitors,
                updates.monitors
            );
            if (newMonitorIds.length > 0) {
                await monitoringConfig.setupNewMonitors(
                    updatedSite,
                    newMonitorIds
                );
            }
        }

        // Refresh the entire cache from database to ensure we have the latest
        // monitor IDs This is especially important when monitors are
        // added/updated
        const freshSites =
            await this.siteRepositoryService.getSitesFromDatabase();
        await this.updateSitesCache(freshSites);

        // Get the refreshed site for the event
        const refreshedSite = this.sitesCache.get(identifier);
        if (!refreshedSite) {
            throw new Error(
                `Site with identifier ${identifier} not found in cache after refresh`
            );
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
            sites: this.getSitesSnapshot(),
            source: "database" as const,
            timestamp: Date.now(),
        });

        return refreshedSite;
    }

    /**
     * Updates the sites cache with new data, replacing all existing entries
     * atomically.
     *
     * @remarks
     * Uses a temporary cache for atomic replacement to ensure consistency and
     * avoid partial updates. Emits a cache-updated event after completion.
     *
     * @example
     *
     * ```typescript
     * await siteManager.updateSitesCache(sitesArray);
     * ```
     *
     * @param sites - Array of {@link Site} objects to update the cache with.
     *
     * @returns A promise that resolves when cache update is complete.
     *
     * @public
     */
    public async updateSitesCache(sites: Site[]): Promise<void> {
        // Create temporary cache for atomic replacement
        const tempCache = new StandardizedCache<Site>({
            ...CACHE_CONFIG.SITES,
            eventEmitter: this.eventEmitter,
            name: CACHE_NAMES.sites("temp"),
        });

        // Populate temporary cache
        for (const site of sites) {
            tempCache.set(site.identifier, site);
        }

        // Atomic replacement: clear and copy from temp cache
        this.sitesCache.clear();
        for (const [key, site] of tempCache.entries()) {
            this.sitesCache.set(key, site);
        }

        // Emit cache updated event
        await this.eventEmitter.emitTyped("internal:site:cache-updated", {
            identifier: "all",
            operation: "cache-updated",
            timestamp: Date.now(),
        });
    }

    /**
     * Executes monitor deletion from the database.
     *
     * @remarks
     * Used internally to remove a monitor from the database. The repository
     * handles its own transaction.
     *
     * @param monitorId - The monitor ID to delete.
     *
     * @returns `true` if the monitor was deleted, `false` otherwise.
     *
     * @throws If database operation fails.
     *
     * @internal
     */
    private async executeMonitorDeletion(monitorId: string): Promise<boolean> {
        // MonitorRepository.delete() already handles its own transaction,
        // so we don't need to wrap it in another transaction
        return this.repositories.monitorRepository.delete(monitorId);
    }

    /**
     * Loads a site in the background and updates cache.
     *
     * @remarks
     * Performs silent background loading with error logging and event emission.
     * This ensures background operations don't disrupt the main application
     * flow while still providing observability through logging and events.
     *
     * @param identifier - The site identifier to load.
     *
     * @returns A promise that resolves when background loading is complete.
     *
     * @internal
     */
    private async loadSiteInBackground(identifier: string): Promise<void> {
        try {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.BACKGROUND_LOAD_START,
                    { identifier }
                )
            );

            const sites =
                await this.siteRepositoryService.getSitesFromDatabase();
            const site = sites.find((s) => s.identifier === identifier);

            if (site) {
                this.sitesCache.set(identifier, site);

                await this.eventEmitter.emitTyped("site:cache-updated", {
                    identifier,
                    operation: "background-load",
                    timestamp: Date.now(),
                });

                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.BACKGROUND_LOAD_COMPLETE,
                        { identifier }
                    )
                );
            } else {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.SITE_BACKGROUND_LOAD_FAILED,
                        { identifier }
                    )
                );

                // Emit not found event for observability
                await this.eventEmitter.emitTyped("site:cache-miss", {
                    backgroundLoading: false,
                    identifier,
                    operation: "cache-lookup",
                    timestamp: Date.now(),
                });
            }
        } catch (error) {
            // Emit error event for observability while maintaining
            // non-blocking behavior
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.errors.SITE_BACKGROUND_LOAD_FAILED,
                    { identifier }
                ),
                error
            );

            try {
                await this.eventEmitter.emitTyped("site:cache-miss", {
                    backgroundLoading: false,
                    identifier,
                    operation: "cache-lookup",
                    timestamp: Date.now(),
                });
            } catch (emitError) {
                // Even emit failures shouldn't crash background operations
                logger.debug(
                    LOG_TEMPLATES.errors.SITE_BACKGROUND_LOAD_EMIT_ERROR,
                    emitError
                );
            }
        }
    }

    /**
     * Validates site data according to business rules.
     *
     * @remarks
     * Used internally to validate site configuration before database
     * operations. Throws if validation fails.
     *
     * @param site - The {@link Site} object to validate.
     *
     * @returns A promise that resolves if validation passes.
     *
     * @throws If validation fails.
     *
     * @internal
     */
    private async validateSite(site: Site): Promise<void> {
        const validationResult =
            await this.configurationManager.validateSiteConfiguration(site);

        if (!validationResult.success) {
            throw new Error(
                `Site validation failed for '${site.identifier}': ${this.formatValidationErrors(validationResult.errors)}`
            );
        }
    }

    /**
     * Constructs a new SiteManager instance.
     *
     * @remarks
     * Initializes the SiteManager with all required dependencies including
     * repositories, database service, event emitter, and optional monitoring
     * operations. Creates internal service orchestrators for coordinated
     * operations and sets up the in-memory cache for performance optimization.
     *
     * @example
     *
     * ```typescript
     * const siteManager = new SiteManager({ ... });
     * ```
     *
     * @param dependencies - Required dependencies for site management
     *   operations.
     */
    public constructor(dependencies: SiteManagerDependencies) {
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
            ...CACHE_CONFIG.SITES,
            eventEmitter: this.eventEmitter,
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

        logger.info(LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED_WITH_CACHE);
    }

    /**
     * Gets a specific site from cache with smart background loading.
     *
     * @remarks
     * If the site is not found in cache, triggers background loading and emits
     * a cache miss event.
     *
     * @example
     *
     * ```typescript
     * const site = siteManager.getSiteFromCache("site_123");
     * ```
     *
     * @param identifier - The site identifier to retrieve.
     *
     * @returns The site object if found in cache, otherwise undefined.
     */
    public getSiteFromCache(identifier: string): Site | undefined {
        const site = this.sitesCache.get(identifier);

        if (!site) {
            // Emit cache miss event
            void (async (): Promise<void> => {
                try {
                    await this.eventEmitter.emitTyped("site:cache-miss", {
                        backgroundLoading: true,
                        identifier,
                        operation: "cache-lookup",
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    logger.debug(
                        LOG_TEMPLATES.debug.SITE_CACHE_MISS_ERROR,
                        error
                    );
                }
            })();

            // Trigger background loading without blocking
            void (async (): Promise<void> => {
                try {
                    await this.loadSiteInBackground(identifier);
                } catch (error) {
                    logger.debug(
                        LOG_TEMPLATES.debug.SITE_LOADING_ERROR_IGNORED,
                        error
                    );
                }
            })();
        }

        return site;
    }

    /**
     * Gets the standardized sites cache (for internal use by other managers).
     *
     * @remarks
     * Used for internal coordination between managers. External consumers
     * should use getSites().
     *
     * @returns The standardized cache instance for sites.
     */
    public getSitesCache(): StandardizedCache<Site> {
        return this.sitesCache;
    }

    /**
     * Gets sites from in-memory cache for fast access.
     *
     * @remarks
     * Returns the in-memory cache containing all sites for high-performance
     * access patterns. The cache is automatically synchronized with database
     * changes through event handling. Use this for internal operations and when
     * performance is critical.
     *
     * Internal use only - external components should use getSites() for
     * guaranteed fresh data or subscribe to cache update events.
     *
     * @returns Array of site objects currently in cache.
     */
    public getSitesFromCache(): Site[] {
        return this.sitesCache.getAll();
    }

    private getSitesSnapshot(): Site[] {
        return this.getSitesFromCache().map((site) => structuredClone(site));
    }

    /**
     * Creates monitoring configuration for site operations.
     *
     * @remarks
     * Used internally for coordinated monitoring actions during site updates.
     * Throws if monitoring operations are not available but required.
     *
     * @returns Configuration for managing monitoring operations.
     *
     * @throws When monitoring operations are not available but required.
     *
     * @internal
     */
    private createMonitoringConfig(): MonitoringConfig {
        return {
            setHistoryLimit: (limit: number): void => {
                if (!this.monitoringOperations) {
                    throw new Error(
                        "MonitoringOperations not available but required for setHistoryLimit"
                    );
                }
                const operations = this.monitoringOperations;
                // Execute but don't await the promise
                void (async (): Promise<void> => {
                    try {
                        await operations.setHistoryLimit(limit);
                    } catch (error) {
                        logger.error(
                            LOG_TEMPLATES.errors.SITE_HISTORY_LIMIT_FAILED,
                            error
                        );
                    }
                })();
            },
            setupNewMonitors: async (
                site: Site,
                newMonitorIds: string[]
            ): Promise<void> => {
                if (!this.monitoringOperations) {
                    throw new Error(
                        "MonitoringOperations not available but required for setupNewMonitors"
                    );
                }
                await this.monitoringOperations.setupNewMonitors(
                    site,
                    newMonitorIds
                );
            },
            startMonitoring: async (
                identifier: string,
                monitorId: string
            ): Promise<boolean> => {
                if (!this.monitoringOperations) {
                    throw new Error(
                        "MonitoringOperations not available but required for startMonitoring"
                    );
                }
                return this.monitoringOperations.startMonitoringForSite(
                    identifier,
                    monitorId
                );
            },
            stopMonitoring: async (
                identifier: string,
                monitorId: string
            ): Promise<boolean> => {
                if (!this.monitoringOperations) {
                    throw new Error(
                        "MonitoringOperations not available but required for stopMonitoring"
                    );
                }
                return this.monitoringOperations.stopMonitoringForSite(
                    identifier,
                    monitorId
                );
            },
        };
    }

    /**
     * Formats validation errors for better readability.
     *
     * @remarks
     * Used internally to format error messages for display or logging.
     *
     * @param errors - Array of error messages.
     *
     * @returns Formatted error string.
     *
     * @internal
     */
    private formatValidationErrors(
        errors: readonly string[] | undefined
    ): string {
        if (!errors || errors.length === 0) {
            return "";
        }
        if (errors.length === 1) {
            // Ensure fallback to empty string if errors[0] is undefined
            return errors[0] ?? "";
        }
        return `\n  - ${errors.join("\n  - ")}`;
    }
}
