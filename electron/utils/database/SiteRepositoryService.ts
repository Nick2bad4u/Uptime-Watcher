/**
 * Site repository service for data operations and dependency injection.
 *
 * @remarks
 * Provides a testable, dependency-injected service layer for site data operations,
 * separating business logic from infrastructure concerns. Designed with the repository
 * pattern and service layer architecture to enable comprehensive testing and
 * maintainable code organization.
 *
 * @public
 *
 * @beta
 * This service is currently in beta and may undergo breaking changes.
 *
 * @see {@link SiteLoadingOrchestrator} for orchestration logic
 * @see {@link SiteRepository} for data access patterns
 *
 * ## Key Features
 * - **Dependency Injection**: Fully configurable with injected repositories and services
 * - **Separation of Concerns**: Pure data operations separated from side effects
 * - **Comprehensive Testing**: Designed for easy mocking and unit testing
 * - **Error Handling**: Standardized error handling with proper logging and types
 * - **Event Integration**: Coordinated event emission for reactive system behavior
 * - **Transaction Safety**: All operations use proper database transactions
 *
 * The service provides both data operations (SiteRepositoryService) and orchestration
 * logic (SiteLoadingOrchestrator) to handle complex workflows while maintaining
 * clean separation between pure functions and side effects.
 *
 * @example
 * ```typescript
 * const service = new SiteRepositoryService({
 *   repositories: { site, monitor, history, settings },
 *   logger,
 *   eventEmitter
 * });
 *
 * const sites = await service.getSitesFromDatabase();
 * ```
 *
 * @packageDocumentation
 */

import { UptimeEvents, TypedEventBus } from "../../events/index";
import { SiteRepository, MonitorRepository, HistoryRepository, SettingsRepository } from "../../services/index";
import { Site } from "../../types";
import { Logger, SiteCacheInterface, SiteLoadingConfig, MonitoringConfig, SiteLoadingError } from "./interfaces";

/**
 * Service for handling site repository operations.
 *
 * @remarks
 * Provides pure data operations for site management without side effects,
 * enabling easy testing and clean separation of concerns. All methods are
 * designed to be deterministic and focused on data transformation and
 * retrieval operations.
 *
 * The service abstracts repository complexity and provides a clean interface
 * for higher-level components while maintaining transaction safety and
 * comprehensive error handling throughout all operations.
 */
export class SiteRepositoryService {
    private readonly repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
        settings: SettingsRepository;
    };
    private readonly logger: Logger;
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /**
     * Create a new SiteRepositoryService instance.
     *
     * @param config - Configuration with required dependencies
     *
     * @remarks
     * Initializes the service with injected dependencies for repositories,
     * logging, and event communication. All dependencies are required
     * for proper operation and comprehensive functionality.
     */
    constructor(config: SiteLoadingConfig) {
        this.repositories = config.repositories;
        this.logger = config.logger;
        this.eventEmitter = config.eventEmitter;
    }

    /**
     * Get sites from database with their monitors and history.
     *
     * @returns Promise resolving to array of complete site objects
     *
     * @throws SiteLoadingError When database operation fails
     *
     * @remarks
     * Performs a complete site loading operation including all associated
     * monitors and their status history. This is a pure data operation
     * without side effects, making it ideal for testing and composition.
     *
     * The operation builds complete site objects by fetching site metadata,
     * associated monitors, and historical data in an efficient manner while
     * maintaining proper error handling throughout the process.
     */
    async getSitesFromDatabase(): Promise<Site[]> {
        try {
            const siteRows = await this.repositories.site.findAll();
            const sites: Site[] = [];

            for (const siteRow of siteRows) {
                const site = await this.buildSiteWithMonitorsAndHistory(siteRow);
                sites.push(site);
            }

            return sites;
        } catch (error) {
            const message = `Failed to fetch sites from database: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);
            throw new SiteLoadingError(message, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Load sites into cache.
     * Pure data operation that populates the cache.
     */
    async loadSitesIntoCache(siteCache: SiteCacheInterface): Promise<void> {
        try {
            const sites = await this.getSitesFromDatabase();
            siteCache.clear();

            for (const site of sites) {
                siteCache.set(site.identifier, site);
            }

            this.logger.info(`Loaded ${sites.length} sites into cache`);
        } catch (error) {
            const message = `Failed to load sites into cache: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);

            // Emit typed error event
            await this.eventEmitter.emitTyped("database:error", {
                details: message,
                error: error instanceof Error ? error : new Error(String(error)),
                operation: "load-sites-into-cache",
                timestamp: Date.now(),
            });

            throw error;
        }
    }

    /**
     * Load history limit setting from database.
     * Pure data operation without side effects.
     */
    async getHistoryLimitSetting(): Promise<number | undefined> {
        try {
            const historyLimitSetting = await this.repositories.settings.get("historyLimit");
            if (!historyLimitSetting) {
                return undefined;
            }

            const limit = Number.parseInt(historyLimitSetting, 10);
            if (Number.isNaN(limit) || limit <= 0) {
                this.logger.warn(`Invalid history limit setting: ${historyLimitSetting}`);
                return undefined;
            }

            return limit;
        } catch (error) {
            this.logger.warn("Could not load history limit from settings:", error);
            return undefined;
        }
    }

    /**
     * Apply history limit setting.
     * Side effect operation separated from data loading.
     */
    async applyHistoryLimitSetting(monitoringConfig: MonitoringConfig): Promise<void> {
        const limit = await this.getHistoryLimitSetting();
        if (limit !== undefined) {
            monitoringConfig.setHistoryLimit(limit);
            this.logger.info(`History limit applied: ${limit}`);
        }
    }

    /**
     * Build a site object with monitors and history.
     * Private helper method for data construction.
     */
    private async buildSiteWithMonitorsAndHistory(siteRow: {
        identifier: string;
        name?: string | undefined;
    }): Promise<Site> {
        const monitors = await this.repositories.monitor.findBySiteIdentifier(siteRow.identifier);

        // Load history for each monitor
        for (const monitor of monitors) {
            if (monitor.id) {
                monitor.history = await this.repositories.history.findByMonitorId(monitor.id);
            }
        }

        const site: Site = {
            identifier: siteRow.identifier,
            monitoring: true, // Default to monitoring enabled
            monitors: monitors,
            name: siteRow.name ?? "Unnamed Site", // Provide default name
        };

        return site;
    }
}

/**
 * Orchestrates the complete site loading process.
 * Coordinates data loading with side effects.
 */
export class SiteLoadingOrchestrator {
    private readonly siteRepositoryService: SiteRepositoryService;

    constructor(siteRepositoryService: SiteRepositoryService) {
        this.siteRepositoryService = siteRepositoryService;
    }

    /**
     * Load sites from database and start monitoring.
     * Coordinates all aspects of site loading process.
     */
    async loadSitesFromDatabase(
        siteCache: SiteCacheInterface,
        monitoringConfig: MonitoringConfig
    ): Promise<{ success: boolean; sitesLoaded: number; message: string }> {
        try {
            // Load sites data
            await this.siteRepositoryService.loadSitesIntoCache(siteCache);

            // Apply settings
            await this.siteRepositoryService.applyHistoryLimitSetting(monitoringConfig);

            // Note: Auto-start monitoring is now handled by MonitorManager.setupSiteForMonitoring()
            // No need to explicitly start monitoring here as it's handled during site setup

            const sitesLoaded = siteCache.size();
            return {
                message: `Successfully loaded ${sitesLoaded} sites`,
                sitesLoaded,
                success: true,
            };
        } catch (error) {
            return {
                message: `Failed to load sites: ${error instanceof Error ? error.message : "Unknown error"}`,
                sitesLoaded: 0,
                success: false,
            };
        }
    }
}
