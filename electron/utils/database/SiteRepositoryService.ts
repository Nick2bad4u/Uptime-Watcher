/**
 * Service for site repository operations.
 * Provides a testable, dependency-injected service for site data operations.
 */

import { UptimeEvents, TypedEventBus } from "../../events/index";
import { Site } from "../../types";
import {
    ILogger,
    ISiteRepository,
    IMonitorRepository,
    IHistoryRepository,
    ISettingsRepository,
    ISiteCache,
    SiteLoadingConfig,
    MonitoringConfig,
    SiteLoadingError,
} from "./interfaces";

/**
 * Service for handling site repository operations.
 * Separates data operations from side effects for better testability.
 */
export class SiteRepositoryService {
    private readonly repositories: {
        site: ISiteRepository;
        monitor: IMonitorRepository;
        history: IHistoryRepository;
        settings: ISettingsRepository;
    };
    private readonly logger: ILogger;
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    constructor(config: SiteLoadingConfig) {
        this.repositories = config.repositories;
        this.logger = config.logger;
        this.eventEmitter = config.eventEmitter;
    }

    /**
     * Get sites from database with their monitors and history.
     * Pure data operation without side effects.
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
    async loadSitesIntoCache(siteCache: ISiteCache): Promise<void> {
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

            const limit = parseInt(historyLimitSetting, 10);
            if (isNaN(limit) || limit <= 0) {
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
     * Start monitoring for sites based on their configuration.
     * Side effect operation separated from data loading.
     */
    async startMonitoringForSites(siteCache: ISiteCache, monitoringConfig: MonitoringConfig): Promise<void> {
        try {
            for (const [, site] of Array.from(siteCache.entries())) {
                if (site.monitoring) {
                    // Site-level monitoring enabled
                    await this.startSiteMonitoring(site, monitoringConfig);
                } else {
                    // Check individual monitor flags
                    await this.startIndividualMonitors(site, monitoringConfig);
                }
            }
        } catch (error) {
            const message = `Failed to start monitoring for sites: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);
            throw new SiteLoadingError(message, error instanceof Error ? error : undefined);
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

    /**
     * Start monitoring for all monitors in a site.
     * Private helper method for monitoring operations.
     */
    private async startSiteMonitoring(site: Site, monitoringConfig: MonitoringConfig): Promise<void> {
        this.logger.debug(`Auto-starting monitoring for site: ${site.identifier}`);
        for (const monitor of site.monitors) {
            if (monitor.id) {
                await monitoringConfig.startMonitoring(site.identifier, monitor.id);
            }
        }
    }

    /**
     * Start monitoring for individual monitors that have monitoring enabled.
     * Private helper method for monitoring operations.
     */
    private async startIndividualMonitors(site: Site, monitoringConfig: MonitoringConfig): Promise<void> {
        for (const monitor of site.monitors) {
            if (monitor.id && monitor.monitoring) {
                this.logger.debug(`Auto-starting monitoring for monitor: ${site.identifier}:${monitor.id}`);
                await monitoringConfig.startMonitoring(site.identifier, monitor.id);
            }
        }
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
        siteCache: ISiteCache,
        monitoringConfig: MonitoringConfig
    ): Promise<{ success: boolean; sitesLoaded: number; message: string }> {
        try {
            // Load sites data
            await this.siteRepositoryService.loadSitesIntoCache(siteCache);

            // Apply settings
            await this.siteRepositoryService.applyHistoryLimitSetting(monitoringConfig);

            // Start monitoring
            await this.siteRepositoryService.startMonitoringForSites(siteCache, monitoringConfig);

            const sitesLoaded = siteCache.size();
            return {
                message: `Successfully loaded ${sitesLoaded} sites and started monitoring`,
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
