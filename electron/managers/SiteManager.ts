/**
 * Site management service responsible for site CRUD operations and monitoring
 * coordination. The SiteManager serves as the primary interface for all
 * site-related operations, providing a unified API for site creation, updates,
 * deletion, and monitoring coordination. It maintains an in-memory cache for
 * performance while ensuring data consistency with the underlying database
 * through transactional operations.
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
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { StateSyncAction, StateSyncSource } from "@shared/types/stateSync";

import { CACHE_CONFIG } from "@shared/constants/cacheConfig";
import { SITE_ADDED_SOURCE, type SiteAddedSource } from "@shared/types/events";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";
import type { MonitoringConfig } from "../services/database/interfaces";
import type { ConfigurationManager } from "./ConfigurationManager";
import type { SiteManagerRepositories } from "./databaseRepositorySets";
import type {
    IMonitoringOperations,
    SiteManagerDependencies,
} from "./SiteManager.types";

import { LoggerAdapter } from "../services/database/serviceFactory";
import { SiteRepositoryService } from "../services/database/SiteRepositoryService";
import { SiteWriterService } from "../services/database/SiteWriterService";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { fireAndForget } from "../utils/fireAndForget";
import { logger } from "../utils/logger";
import { createSiteMonitoringConfig } from "./siteManager/createSiteMonitoringConfig";
import {
    getSiteSnapshotForMutation as getSiteSnapshotForMutationHelper,
} from "./siteManager/getSiteSnapshotForMutation";
import { loadSiteInBackground } from "./siteManager/loadSiteInBackground";
import {
    emitSiteAddedAndStateSynchronized as emitSiteAddedAndStateSynchronizedHelper,
    emitSiteCacheMissSafe as emitSiteCacheMissSafeHelper,
    emitSiteCacheUpdated as emitSiteCacheUpdatedHelper,
    emitSiteUpdatedAndStateSynchronized as emitSiteUpdatedAndStateSynchronizedHelper,
} from "./siteManager/siteManagerEventEmitters";
import {
    updateSitesCache,
    type UpdateSitesCacheOptions,
} from "./siteManager/updateSitesCache";
import { validateSite as validateSiteHelper } from "./siteManager/validateSite";
import { SiteManagerStateSync } from "./SiteManagerStateSync";

/**
 * @remarks
 * The SiteManager is the central coordinator for all site-related operations in
 * the uptime monitoring system. It provides a high-level API that abstracts the
 * complexity of database operations, cache management, and cross-component
 * coordination while ensuring data consistency and performance. The manager
 * maintains a synchronized in-memory cache of all sites for fast access
 * patterns while ensuring all mutations go through proper database
 * transactions. Event emission keeps other system components informed of site
 * changes and enables reactive UI updates.
 *
 * @public Manages
 * site operations and maintains in-memory cache.
 */
export class SiteManager {
    /** Configuration manager for business rules and validation */
    private readonly configurationManager: ConfigurationManager;

    /** Event bus for emitting site-related events */
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /** Optional monitoring operations for coordinating with monitor management */
    private readonly monitoringOperations: IMonitoringOperations | undefined;

    /** Collection of repository and service dependencies for data access */
    private readonly repositories: SiteManagerRepositories;

    /** Service for reading site data from repositories */
    private readonly siteRepositoryService: SiteRepositoryService;

    /** In-memory cache for site data performance optimization */
    private readonly sitesCache: StandardizedCache<Site>;

    /** Service for writing and updating site data */
    private readonly siteWriterService: SiteWriterService;

    /** Handles state-sync revision + snapshot bookkeeping. */
    private readonly sitesStateSynchronizer: SiteManagerStateSync;

    /**
     * Emits a cache-miss event without allowing failures to crash the caller.
     *
     * @remarks
     * Cache-miss emissions are observability-only. Multiple call sites used to
     * duplicate the same payload and try/catch logic (foreground cache lookup
     * vs background hydration). Consolidating prevents drift.
     */
    private async emitSiteCacheMissSafe(args: {
        backgroundLoading: boolean;
        identifier: string;
        operation: UptimeEvents["internal:site:cache-miss"]["operation"];
        timestamp?: number;
    }): Promise<void> {
        return emitSiteCacheMissSafeHelper(
            {
                emitSitesStateSynchronized: async (payload): Promise<void> => {
                    await this.emitSitesStateSynchronized(payload);
                },
                eventEmitter: this.eventEmitter,
            },
            args
        );
    }

    /**
     * Emits a cache-updated event.
     */
    private async emitSiteCacheUpdated(args: {
        identifier: string;
        operation: UptimeEvents["internal:site:cache-updated"]["operation"];
        timestamp?: number;
    }): Promise<void> {
        return emitSiteCacheUpdatedHelper(
            {
                emitSitesStateSynchronized: async (payload): Promise<void> => {
                    await this.emitSitesStateSynchronized(payload);
                },
                eventEmitter: this.eventEmitter,
            },
            args
        );
    }

    /**
     * Emits the canonical site-updated event and state-sync update.
     *
     * @remarks
     * Multiple mutations previously duplicated this logic, which risks drift in
     * payload fields, cloning behavior, and timestamp correlation.
     */
    private async emitSiteUpdatedAndStateSynchronized(args: {
        identifier: string;
        previousSite: Site;
        site: Site;
        timestamp?: number;
        updatedFields: readonly string[];
    }): Promise<void> {
        return emitSiteUpdatedAndStateSynchronizedHelper(
            {
                emitSitesStateSynchronized: async (payload): Promise<void> => {
                    await this.emitSitesStateSynchronized(payload);
                },
                eventEmitter: this.eventEmitter,
            },
            args
        );
    }

    /**
     * Emits the canonical site-added event and a correlated state-sync update.
     */
    private async emitSiteAddedAndStateSynchronized(args: {
        site: Site;
        source: SiteAddedSource;
        timestamp?: number;
    }): Promise<void> {
        return emitSiteAddedAndStateSynchronizedHelper(
            {
                emitSitesStateSynchronized: async (payload): Promise<void> => {
                    await this.emitSitesStateSynchronized(payload);
                },
                eventEmitter: this.eventEmitter,
            },
            args
        );
    }

    /**
     * Emits a `sites:state-synchronized` event using the modern sync contract.
     *
     * @remarks
     * -
     *
     * `bulk-sync` emits a full snapshot (`sites`) and `siteCount`.
     *
     * - `update`/`delete` emit _delta-only_ payloads.
     * - A monotonic `revision` is incremented for every emitted sync event so
     *   renderers can detect gaps and trigger a full-sync recovery.
     *
     * The returned snapshot is suitable for IPC responses (e.g.
     * `request-full-sync`).
     */
    public async emitSitesStateSynchronized({
        action,
        siteIdentifier,
        sites,
        source,
        timestamp,
    }: {
        action: StateSyncAction;
        siteIdentifier: string;
        sites?: Site[];
        source: StateSyncSource;
        timestamp?: number;
    }): Promise<{ revision: number; sites: Site[] }> {
        const emitArgs = {
            action,
            siteIdentifier,
            source,
            ...(Array.isArray(sites) ? { sites } : {}),
            ...(typeof timestamp === "number" ? { timestamp } : {}),
        };

        return this.sitesStateSynchronizer.emitSitesStateSynchronized(emitArgs);
    }

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
    public async addSite(
        siteData: Site,
        options: { source?: SiteAddedSource } = {}
    ): Promise<Site> {
        const source = options.source ?? SITE_ADDED_SOURCE.USER;
        // Business validation
        await this.validateSite(siteData);

        // Use the new service-based approach to add site to database
        const createdSite = await this.siteWriterService.createSite(siteData);

        // Normalize cache updates through shared utility to guarantee event emission
        const updatedSites = [
            ...this.getSitesSnapshot(),
            structuredClone(createdSite),
        ];
        await this.updateSitesCache(updatedSites, "SiteManager.addSite");

        const cachedSite = this.sitesCache.get(createdSite.identifier);
        if (!cachedSite) {
            logger.warn(
                `[SiteManager] Cache miss immediately after creating site ${createdSite.identifier}; falling back to creation payload`
            );
        }

        const sanitizedSite = structuredClone(cachedSite ?? createdSite);
        await this.emitSiteAddedAndStateSynchronized({
            site: sanitizedSite,
            source,
        });

        logger.info(
            interpolateLogTemplate(LOG_TEMPLATES.services.SITE_ADDED_SUCCESS, {
                identifier: sanitizedSite.identifier,
                name: sanitizedSite.name || "unnamed",
                source,
            })
        );
        return sanitizedSite;
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
     * import { logger } from "../utils/logger";
     *
     * const allSites = await siteManager.getSites();
     * logger.info("Loaded sites", { count: allSites.length });
     * ```
     *
     * @returns Promise resolving to array of complete site objects.
     *
     * @throws If database operation fails.
     */
    public async getSites(): Promise<Site[]> {
        const sites = await this.siteRepositoryService.getSitesFromDatabase();
        // Keep cache synchronized with database
        await this.updateSitesCache(sites, "SiteManager.getSites");
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
        await this.updateSitesCache(sites, "SiteManager.loadSitesFromCache");
        logger.info(
            interpolateLogTemplate(
                LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED,
                { count: sites.length }
            )
        );
    }

    /**
     * Removes a site and all associated records.
     *
     * @remarks
     * Delegates the transactional deletion to {@link SiteWriterService}. When
     * deletion succeeds, emits:
     *
     * - `internal:site:removed`
     * - `sites:state-synchronized` with action `delete`
     *
     * No events are emitted when the site does not exist.
     *
     * @param identifier - Site identifier to remove.
     *
     * @returns `true` when the site existed and was deleted; otherwise `false`.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        const siteBeforeRemoval = this.sitesCache.get(identifier);

        const removed = await this.siteWriterService.deleteSite(
            this.sitesCache,
            identifier
        );

        if (!removed) {
            return false;
        }

        const timestamp = Date.now();

        await this.eventEmitter.emitTyped("internal:site:removed", {
            cascade: false,
            identifier,
            operation: "removed",
            ...(siteBeforeRemoval
                ? { site: structuredClone(siteBeforeRemoval) }
                : {}),
            timestamp,
        });

        await this.emitSitesStateSynchronized({
            action: STATE_SYNC_ACTION.DELETE,
            siteIdentifier: identifier,
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp,
        });

        return true;
    }

    /**
     * Deletes all sites from the database and in-memory cache.
     *
     * @remarks
     * This method emits the same events as deleting sites individually:
     *
     * - `internal:site:removed` (for each removed site)
     * - `sites:state-synchronized` delete deltas (for each removed site)
     *
     * The {@link SiteLifecycleCoordinator} relies on this for the
     * `UptimeOrchestrator.deleteAllSites()` workflow.
     *
     * @returns The number of deleted sites.
     */
    public async deleteAllSites(): Promise<number> {
        const { deletedCount, deletedSites } =
            await this.siteWriterService.deleteAllSites(this.sitesCache);

        if (deletedCount === 0) {
            return 0;
        }

        const timestamp = Date.now();

        // Preserve event ordering for downstream consumers.
        for (const site of deletedSites) {
            // eslint-disable-next-line no-await-in-loop -- Event ordering is important for downstream consumers.
            await this.eventEmitter.emitTyped("internal:site:removed", {
                cascade: false,
                identifier: site.identifier,
                operation: "removed",
                site: structuredClone(site),
                timestamp,
            });

            // eslint-disable-next-line no-await-in-loop -- Event ordering is important for downstream consumers.
            await this.emitSitesStateSynchronized({
                action: STATE_SYNC_ACTION.DELETE,
                siteIdentifier: site.identifier,
                source: STATE_SYNC_SOURCE.DATABASE,
                timestamp,
            });
        }

        return deletedCount;
    }

    /**
     * Removes a monitor from a site.
     *
     * @example
     *
     * ```typescript
     * const updatedSite = await siteManager.removeMonitor(
     *     "site_123",
     *     "monitor_456"
     * );
     *
     * logger.info({ monitorCount: updatedSite.monitors.length });
     * ```
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The monitor ID to remove.
     *
     * @returns The updated {@link Site} snapshot after monitor removal.
     *
     * @throws If database or cache update fails.
     */
    public async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<Site> {
        const siteSnapshot =
            await this.getSiteSnapshotForMutation(siteIdentifier);

        const monitorToRemove = siteSnapshot.monitors.find(
            (monitor) => monitor.id === monitorId
        );

        if (!monitorToRemove) {
            throw new Error(
                `Monitor ${monitorId} not found on site ${siteIdentifier}`
            );
        }

        if (siteSnapshot.monitors.length <= 1) {
            throw new Error(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);
        }

        const updatedMonitors = siteSnapshot.monitors
            .filter((monitor) => monitor.id !== monitorId)
            .map((monitor) => structuredClone(monitor));

        const validationCandidate: Site = {
            ...structuredClone(siteSnapshot),
            monitors: updatedMonitors,
        };

        await this.validateSite(validationCandidate);

        const updatedSite = await this.siteWriterService.updateSite(
            this.sitesCache,
            siteIdentifier,
            { monitors: updatedMonitors }
        );

        const timestamp = Date.now();

        await this.emitSiteUpdatedAndStateSynchronized({
            identifier: siteIdentifier,
            previousSite: siteSnapshot,
            site: updatedSite,
            timestamp,
            updatedFields: ["monitors"],
        });

        return updatedSite;
    }

    /**
     * Update a site's persisted fields and refresh the caches.
     *
     * @param identifier - The site identifier to update.
     * @param updates - Partial site data to update.
     *
     * @returns The updated site object.
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
        await this.updateSitesCache(
            freshSites,
            "SiteManager.reloadSitesFromDatabase"
        );

        // Get the refreshed site for the event
        const refreshedSite = this.sitesCache.get(identifier);
        if (!refreshedSite) {
            throw new Error(
                `Site with identifier ${identifier} not found in cache after refresh`
            );
        }

        const timestamp = Date.now();

        await this.emitSiteUpdatedAndStateSynchronized({
            identifier,
            previousSite: originalSite,
            site: refreshedSite,
            timestamp,
            updatedFields: Object.keys(updates),
        });

        return refreshedSite;
    }

    /**
     * Updates the sites cache with new data, replacing all existing entries
     * atomically.
     *
     * @remarks
     * Performs atomic replacement by clearing the primary cache and applying a
     * bulk update in a single operation. Emits a cache-updated event after
     * completion.
     *
     * @example
     *
     * ```typescript
     * await siteManager.updateSitesCache(sitesArray);
     * ```
     *
     * @param sites - Array of {@link Site} objects to update the cache with.
     * @param context - Optional operation context for diagnostics.
     *
     * @returns A promise that resolves when cache update is complete.
     *
     * @public
     */
    public async updateSitesCache(
        sites: Site[],
        context?: string,
        options?: UpdateSitesCacheOptions
    ): Promise<void> {
        const cacheUpdateInput: {
            readonly context?: string;
            readonly options?: UpdateSitesCacheOptions;
            readonly sites: Site[];
        } = {
            sites,
            ...(typeof context === "string" ? { context } : {}),
            ...(options ? { options } : {}),
        };

        await updateSitesCache(
            {
                emitSiteCacheUpdated: async (args): Promise<void> =>
                    this.emitSiteCacheUpdated(args),
                emitSitesStateSynchronized: async (payload): Promise<unknown> =>
                    this.emitSitesStateSynchronized(payload),
                sitesCache: this.sitesCache,
            },
            cacheUpdateInput
        );
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
        await loadSiteInBackground({
            emitSiteCacheMissSafe: async (args): Promise<void> =>
                this.emitSiteCacheMissSafe(args),
            emitSiteCacheUpdated: async (args): Promise<void> =>
                this.emitSiteCacheUpdated(args),
            emitSitesStateSynchronized: async (payload): Promise<unknown> =>
                this.emitSitesStateSynchronized(payload),
            identifier,
            siteRepositoryService: this.siteRepositoryService,
            sitesCache: this.sitesCache,
        });
    }

    /**
     * Retrieves a mutable site snapshot for mutation operations.
     *
     * @remarks
     * Loads the site from cache when available, otherwise hydrates it from the
     * database and seeds the cache. Returns a deep clone suitable for
     * mutation-safe operations.
     *
     * @param identifier - The site identifier to retrieve.
     *
     * @returns A cloned {@link Site} snapshot ready for mutation.
     */
    private async getSiteSnapshotForMutation(
        identifier: string
    ): Promise<Site> {
        return getSiteSnapshotForMutationHelper(
            this.sitesCache,
            this.siteRepositoryService,
            identifier
        );
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
        return validateSiteHelper(this.configurationManager, site);
    }

    /** Returns the current monotonic state sync revision. */
    public getStateSyncRevision(): number {
        return this.sitesStateSynchronizer.getStateSyncRevision();
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

        this.sitesStateSynchronizer = new SiteManagerStateSync({
            eventEmitter: this.eventEmitter,
            getSitesSnapshot: (): Site[] => this.getSitesSnapshot(),
        });
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
            fireAndForget(
                async () => {
                    await this.emitSiteCacheMissSafe({
                        backgroundLoading: true,
                        identifier,
                        operation: "cache-lookup",
                    });
                },
                {
                    onError: (error) => {
                        logger.debug(
                            LOG_TEMPLATES.debug.SITE_CACHE_MISS_ERROR,
                            error
                        );
                    },
                }
            );

            // Trigger background loading without blocking
            fireAndForget(
                async () => {
                    await this.loadSiteInBackground(identifier);
                },
                {
                    onError: (error) => {
                        logger.debug(
                            LOG_TEMPLATES.debug.SITE_LOADING_ERROR_IGNORED,
                            error
                        );
                    },
                }
            );
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
        return createSiteMonitoringConfig({
            monitoringOperations: this.monitoringOperations,
        });
    }
}
