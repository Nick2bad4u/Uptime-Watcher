/**
 * Site repository service for data operations and dependency injection.
 *
 * @remarks
 * Provides a testable, dependency-injected service layer for site data
 * operations, separating business logic from infrastructure concerns. Designed
 * with the repository pattern and service layer architecture to enable
 * comprehensive testing and maintainable code organization.
 *
 * The service provides both data operations (SiteRepositoryService) and
 * orchestration logic (SiteLoadingOrchestrator) to handle complex workflows
 * while maintaining clean separation between pure functions and side effects.
 *
 * @example
 *
 * ```typescript
 * const service = new SiteRepositoryService({
 *     repositories: { site, monitor, history, settings },
 *     logger,
 *     eventEmitter,
 * });
 *
 * const sites = await service.getSitesFromDatabase();
 * await service.loadSitesIntoCache(siteCache);
 * ```
 *
 * @packageDocumentation
 *
 * @see {@link SiteRepository} for data access patterns
 * @see {@link MonitorRepository} for monitor data operations
 * @see {@link HistoryRepository} for history data operations
 * @see {@link SettingsRepository} for settings data operations
 * @see {@link SiteLoadingOrchestrator} for orchestration logic
 */

import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { getUnknownErrorMessage } from "@shared/utils/errorCatalog";
import { ensureError } from "@shared/utils/errorHandling";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { HistoryRepository } from "./HistoryRepository";
import type { MonitoringConfig, SiteLoadingConfig } from "./interfaces";
import type { MonitorRepository } from "./MonitorRepository";
import type { SettingsRepository } from "./SettingsRepository";
import type { SiteRepository } from "./SiteRepository";
import type { SiteRow } from "./utils/siteMapper";

import { DEFAULT_SITE_NAME } from "../../constants";
import { toSerializedError } from "../../utils/errorSerialization";
import { SiteLoadingError } from "./interfaces";

/**
 * Orchestrates the complete site loading process. Coordinates data loading with
 * side effects.
 */
export class SiteLoadingOrchestrator {
    private readonly siteRepositoryService: SiteRepositoryService;

    /**
     * Load sites from database and start monitoring. Coordinates all aspects of
     * site loading process.
     */
    public async loadSitesFromDatabase(
        siteCache: StandardizedCache<Site>,
        monitoringConfig: MonitoringConfig
    ): Promise<{ message: string; sitesLoaded: number; success: boolean }> {
        try {
            // Load sites data
            await this.siteRepositoryService.loadSitesIntoCache(siteCache);

            // Apply settings
            await this.siteRepositoryService.applyHistoryLimitSetting(
                monitoringConfig
            );

            // Note: Auto-start monitoring is now handled by
            // MonitorManager.setupSiteForMonitoring() No need to explicitly
            // start monitoring here as it's handled during site setup

            const sitesLoaded = siteCache.size;
            return {
                message: `Successfully loaded ${sitesLoaded} sites`,
                sitesLoaded,
                success: true,
            };
        } catch (error) {
            return {
                message: `Failed to load sites: ${getUnknownErrorMessage(error)}`,
                sitesLoaded: 0,
                success: false,
            };
        }
    }

    public constructor(siteRepositoryService: SiteRepositoryService) {
        this.siteRepositoryService = siteRepositoryService;
    }
}

/**
 * Service for handling site repository operations.
 *
 * @remarks
 * Provides pure data operations for site management without side effects,
 * enabling easy testing and clean separation of concerns. All methods are
 * designed to be deterministic and focused on data transformation and retrieval
 * operations.
 *
 * The service abstracts repository complexity and provides a clean interface
 * for higher-level components while maintaining transaction safety and
 * comprehensive error handling throughout all operations.
 */
export class SiteRepositoryService {
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    private readonly logger: Logger;

    private readonly repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };

    /**
     * Apply history limit setting. Side effect operation separated from data
     * loading.
     */
    public async applyHistoryLimitSetting(
        monitoringConfig: MonitoringConfig
    ): Promise<void> {
        const limit = await this.getHistoryLimitSetting();
        if (limit !== undefined) {
            await monitoringConfig.setHistoryLimit(limit);
            this.logger.info(`History limit applied: ${limit}`);
        }
    }

    /**
     * Load history limit setting from database. Pure data operation without
     * side effects.
     */
    public async getHistoryLimitSetting(): Promise<number | undefined> {
        try {
            const historyLimitSetting =
                await this.repositories.settings.get("historyLimit");
            if (!historyLimitSetting) {
                return undefined;
            }
            const parsedLimit = Number(historyLimitSetting);

            if (Number.isNaN(parsedLimit)) {
                this.logger.warn(
                    `Invalid history limit setting: ${historyLimitSetting}`
                );
                return undefined;
            }

            try {
                // Use the shared normalization rules so semantics match
                // DatabaseManager.initialize and historyLimitManager.
                //
                // This ensures that:
                // - 0 represents "unlimited" retention
                // - Values below the minimum are raised to the configured
                //   minimum
                // - Values above the maximum are rejected by throwing
                //   RangeError
                return normalizeHistoryLimit(
                    parsedLimit,
                    DEFAULT_HISTORY_LIMIT_RULES
                );
            } catch (error) {
                const normalizedError = ensureError(error);
                this.logger.warn(
                    `Invalid history limit setting: ${historyLimitSetting}`,
                    normalizedError
                );
                return undefined;
            }
        } catch (error) {
            this.logger.warn(
                "Could not load history limit from settings:",
                error
            );
            return undefined;
        }
    }

    /**
     * Get sites from database with their monitors and history.
     *
     * @remarks
     * Performs a complete site loading operation including all associated
     * monitors and their status history. This operation includes logging and
     * error handling side effects for comprehensive error tracking.
     *
     * The operation builds complete site objects by fetching site metadata,
     * associated monitors, and historical data in an efficient manner while
     * maintaining proper error handling throughout the process.
     *
     * @returns Promise resolving to array of complete site objects
     *
     * @throws SiteLoadingError When database operation fails
     */
    public async getSitesFromDatabase(): Promise<Site[]> {
        try {
            const siteRows = await this.repositories.site.findAll();

            // Build sites in parallel since each site operation is independent
            const sitePromises = siteRows.map(async (siteRow) =>
                this.buildSiteWithMonitorsAndHistory(siteRow)
            );

            return await Promise.all(sitePromises);
        } catch (error) {
            const normalizedError = ensureError(error);
            const message = `Failed to fetch sites from database: ${getUnknownErrorMessage(normalizedError)}`;
            this.logger.error(message, normalizedError);
            throw new SiteLoadingError(message, { cause: normalizedError });
        }
    }

    /**
     * Get a single site from the database with monitors and history.
     *
     * @remarks
     * Fetches a specific site by identifier and constructs the full site object
     * including associated monitors and their historical data. If the site does
     * not exist, `undefined` is returned without throwing.
     *
     * @param identifier - Unique site identifier to locate.
     *
     * @returns Promise resolving to the complete site object or `undefined`
     *   when not found.
     *
     * @throws {@link SiteLoadingError} When the database query fails.
     */
    public async getSiteFromDatabase(
        identifier: string
    ): Promise<Site | undefined> {
        try {
            const siteRow =
                await this.repositories.site.findByIdentifier(identifier);

            if (!siteRow) {
                this.logger.debug(
                    `[SiteRepositoryService] Site not found: ${identifier}`
                );
                return undefined;
            }

            return await this.buildSiteWithMonitorsAndHistory(siteRow);
        } catch (error) {
            const normalizedError = ensureError(error);
            const message = `Failed to fetch site ${identifier} from database: ${getUnknownErrorMessage(normalizedError)}`;
            this.logger.error(message, normalizedError);
            throw new SiteLoadingError(message, { cause: normalizedError });
        }
    }

    /**
     * Load sites into cache. Pure data operation that populates the cache.
     */
    public async loadSitesIntoCache(
        siteCache: StandardizedCache<Site>
    ): Promise<void> {
        try {
            const sites = await this.getSitesFromDatabase();
            siteCache.replaceAll(
                sites.map((site) => ({
                    data: site,
                    key: site.identifier,
                }))
            );

            this.logger.info(`Loaded ${sites.length} sites into cache`);
        } catch (error) {
            const normalizedError = ensureError(error);
            const message = `Failed to load sites into cache: ${getUnknownErrorMessage(error)}`;
            this.logger.error(message, error);

            // Emit typed error event
            await this.eventEmitter.emitTyped("database:error", {
                details: message,
                error: toSerializedError(normalizedError),
                operation: "load-sites-into-cache",
                timestamp: Date.now(),
            });

            throw normalizedError;
        }
    }

    /**
     * Build a site object with monitors and history. Private helper method for
     * data construction.
     */
    private async buildSiteWithMonitorsAndHistory(
        siteRow: SiteRow
    ): Promise<Site> {
        const monitors = await this.repositories.monitor.findBySiteIdentifier(
            siteRow.identifier
        );

        // Load history for all monitors in parallel for better performance
        const monitorsWithHistory = await Promise.all(
            monitors.map(async (monitor) => {
                if (monitor.id) {
                    const history =
                        await this.repositories.history.findByMonitorId(
                            monitor.id
                        );
                    return { ...monitor, history };
                }
                return monitor;
            })
        );

        return {
            identifier: siteRow.identifier,
            monitoring: siteRow.monitoring ?? true, // Use the actual monitoring status with default
            monitors: monitorsWithHistory,
            name: siteRow.name ?? DEFAULT_SITE_NAME, // Use consistent default name
        };
    }

    /**
     * Create a new SiteRepositoryService instance.
     *
     * @remarks
     * Initializes the service with injected dependencies for repositories,
     * logging, and event communication. All dependencies are required for
     * proper operation and comprehensive functionality.
     *
     * @param config - Configuration with required dependencies
     */
    public constructor(config: SiteLoadingConfig) {
        this.repositories = config.repositories;
        this.logger = config.logger;
        this.eventEmitter = config.eventEmitter;
    }
}
