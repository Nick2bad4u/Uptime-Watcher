/**
 * Core uptime monitoring service.
 * Orchestrates site monitoring, data persistence, and event emission for the application.
 */

/* eslint-disable unicorn/no-null -- null literal needed for backend */
import { EventEmitter } from "events";

import { DEFAULT_CHECK_INTERVAL, STATUS_UPDATE_EVENT, DEFAULT_HISTORY_LIMIT } from "./constants";
import {
    DatabaseService,
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
} from "./services/database";
import { MonitorScheduler } from "./services/monitoring";
import { Site, StatusUpdate } from "./types";
import { isDev } from "./utils";
import { downloadBackup, refreshSites, DataBackupDependencies, DataBackupCallbacks } from "./utils/database/dataBackup";
import { initDatabase } from "./utils/database/databaseInitializer";
import {
    exportData,
    importData,
    DataImportExportDependencies,
    DataImportExportCallbacks,
} from "./utils/database/dataImportExport";
import {
    getHistoryLimit as getHistoryLimitUtil,
    setHistoryLimit as setHistoryLimitUtil,
} from "./utils/database/historyLimitManager";
import { addSiteToDatabase } from "./utils/database/siteAdder";
import { removeSiteFromDatabase } from "./utils/database/siteRemover";
import { getSitesFromDatabase } from "./utils/database/sitesGetter";
import { loadSitesFromDatabase } from "./utils/database/sitesLoader";
import { updateSite, SiteUpdateDependencies, SiteUpdateCallbacks } from "./utils/database/siteUpdater";
import { monitorLogger as logger } from "./utils/logger";
import { autoStartMonitoring } from "./utils/monitoring/autoStarter";
import { setDefaultMonitorIntervals } from "./utils/monitoring/intervalSetter";
import { performInitialMonitorChecks } from "./utils/monitoring/monitorChecker";
import { startAllMonitoring, startMonitoringForSite } from "./utils/monitoring/monitoringStarter";
import { stopAllMonitoring, stopMonitoringForSite } from "./utils/monitoring/monitoringStopper";
import { checkMonitor, checkSiteManually } from "./utils/monitoring/monitorStatusChecker";

/**
 * Core uptime monitoring service that manages site monitoring operations.
 *
 * This class serves as the central orchestrator for:
 * - Site and monitor management (CRUD operations)
 * - Scheduled monitoring with customizable intervals
 * - Data persistence through repository pattern
 * - Event emission for UI updates and notifications
 * - History tracking with configurable retention limits
 *
 * Extends EventEmitter to provide real-time updates to the renderer process.
 *
 * Events emitted:
 * - status-update: When monitor status changes
 * - site-monitor-down: When a monitor goes down
 * - site-monitor-up: When a monitor comes back up
 * - db-error: When database operations fail
 *
 * @example
 * ```typescript
 * const monitor = new UptimeMonitor();
 * monitor.on('status-update', (data) => console.log(data));
 * await monitor.addSite({ identifier: 'example', monitors: [...] });
 * monitor.startMonitoring();
 * ```
 */

export class UptimeMonitor extends EventEmitter {
    private readonly sites: Map<string, Site> = new Map(); // key: site.identifier
    private historyLimit: number = DEFAULT_HISTORY_LIMIT; // Default history limit - generous for good UX
    private isMonitoring: boolean = false;

    // Repository instances
    private readonly databaseService: DatabaseService;
    private readonly siteRepository: SiteRepository;
    private readonly monitorRepository: MonitorRepository;
    private readonly historyRepository: HistoryRepository;
    private readonly settingsRepository: SettingsRepository;

    // Service instances
    private readonly monitorScheduler: MonitorScheduler;

    constructor() {
        super();

        // Initialize repositories
        this.databaseService = DatabaseService.getInstance();
        this.siteRepository = new SiteRepository();
        this.monitorRepository = new MonitorRepository();
        this.historyRepository = new HistoryRepository();
        this.settingsRepository = new SettingsRepository();

        // Initialize services
        this.monitorScheduler = new MonitorScheduler();
        this.monitorScheduler.setCheckCallback(this.handleScheduledCheck.bind(this));
    }

    /**
     * Initialize the database and load sites. Must be called after construction.
     */
    public async initialize(): Promise<void> {
        await initDatabase(this.databaseService, () => this.loadSites(), this);
    }

    private async loadSites() {
        await loadSitesFromDatabase({
            eventEmitter: this,
            repositories: {
                history: this.historyRepository,
                monitor: this.monitorRepository,
                settings: this.settingsRepository,
                site: this.siteRepository,
            },
            setHistoryLimit: (limit) => {
                this.historyLimit = limit;
            },
            sites: this.sites,
            startMonitoring: this.startMonitoringForSite.bind(this),
        });
    }

    public async getSites(): Promise<Site[]> {
        return getSitesFromDatabase({
            repositories: {
                history: this.historyRepository,
                monitor: this.monitorRepository,
                site: this.siteRepository,
            },
        });
    }

    /**
     * Get sites from in-memory cache (faster, for internal use).
     * Use this for performance when you know the cache is current.
     */
    public getSitesFromCache(): Site[] {
        return Array.from(this.sites.values());
    }

    public async addSite(siteData: Site): Promise<Site> {
        // Use the utility function to add site to database
        const site = await addSiteToDatabase({
            repositories: {
                monitor: this.monitorRepository,
                site: this.siteRepository,
            },
            siteData,
        });

        // Add to in-memory cache
        this.sites.set(site.identifier, site); // Use identifier as key

        // Initial check for all monitors
        await performInitialMonitorChecks(site, this.checkMonitor.bind(this), logger);

        // Set default checkInterval for monitors that don't have one
        await setDefaultMonitorIntervals(
            site,
            DEFAULT_CHECK_INTERVAL,
            this.monitorRepository.update.bind(this.monitorRepository),
            logger
        );

        // Auto-start monitoring for all new monitors
        await autoStartMonitoring(site, this.startMonitoringForSite.bind(this), logger, isDev);

        logger.info(`Site added successfully: ${site.identifier} (${site.name ?? "unnamed"})`);
        return site;
    }

    public async removeSite(identifier: string): Promise<boolean> {
        return removeSiteFromDatabase({
            identifier,
            logger,
            repositories: {
                monitor: this.monitorRepository,
                site: this.siteRepository,
            },
            sites: this.sites,
        });
    }

    public async setHistoryLimit(limit: number): Promise<void> {
        await setHistoryLimitUtil({
            limit,
            logger,
            repositories: {
                history: this.historyRepository,
                settings: this.settingsRepository,
            },
            setHistoryLimit: (newLimit) => {
                this.historyLimit = newLimit;
            },
        });
    }

    public getHistoryLimit(): number {
        return getHistoryLimitUtil(() => this.historyLimit);
    }

    public async startMonitoring() {
        this.isMonitoring = await startAllMonitoring(
            {
                eventEmitter: this,
                logger,
                monitorRepository: this.monitorRepository,
                monitorScheduler: this.monitorScheduler,
                sites: this.sites,
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            this.isMonitoring
        );
    }

    public stopMonitoring() {
        this.isMonitoring = stopAllMonitoring({
            eventEmitter: this,
            logger,
            monitorRepository: this.monitorRepository,
            monitorScheduler: this.monitorScheduler,
            sites: this.sites,
            statusUpdateEvent: STATUS_UPDATE_EVENT,
        });
    }

    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return startMonitoringForSite(
            {
                eventEmitter: this,
                logger,
                monitorRepository: this.monitorRepository,
                monitorScheduler: this.monitorScheduler,
                sites: this.sites,
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            identifier,
            monitorId,
            (id, mid) => this.startMonitoringForSite(id, mid) // Pass callback for recursive calls
        );
    }

    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return stopMonitoringForSite(
            {
                eventEmitter: this,
                logger,
                monitorRepository: this.monitorRepository,
                monitorScheduler: this.monitorScheduler,
                sites: this.sites,
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            identifier,
            monitorId,
            (id, mid) => this.stopMonitoringForSite(id, mid) // Pass callback for recursive calls
        );
    }

    private async checkMonitor(site: Site, monitorId: string) {
        return checkMonitor(
            {
                eventEmitter: this,
                historyLimit: this.historyLimit,
                logger,
                repositories: {
                    history: this.historyRepository,
                    monitor: this.monitorRepository,
                    site: this.siteRepository,
                },
                sites: this.sites,
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            site,
            monitorId
        );
    }

    public async checkSiteManually(identifier: string, monitorId?: string): Promise<StatusUpdate | null> {
        const result = await checkSiteManually(
            {
                eventEmitter: this,
                historyLimit: this.historyLimit,
                logger,
                repositories: {
                    history: this.historyRepository,
                    monitor: this.monitorRepository,
                    site: this.siteRepository,
                },
                sites: this.sites,
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            identifier,
            monitorId
        );
        return result ?? null;
    }

    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        const dependencies: SiteUpdateDependencies = {
            logger,
            monitorRepository: this.monitorRepository,
            siteRepository: this.siteRepository,
            sites: this.sites,
        };

        const callbacks: SiteUpdateCallbacks = {
            startMonitoringForSite: (id, monitorId) => this.startMonitoringForSite(id, monitorId),
            stopMonitoringForSite: (id, monitorId) => this.stopMonitoringForSite(id, monitorId),
        };

        return updateSite(dependencies, callbacks, identifier, updates);
    }

    /**
     * Handle scheduled monitor checks from the MonitorScheduler.
     */
    private async handleScheduledCheck(siteIdentifier: string, monitorId: string): Promise<void> {
        const site = this.sites.get(siteIdentifier);
        if (site) {
            await this.checkMonitor(site, monitorId);
        }
    }

    // Export/Import functionality
    public async exportData(): Promise<string> {
        const dependencies: DataImportExportDependencies = {
            eventEmitter: this,
            repositories: {
                history: this.historyRepository,
                monitor: this.monitorRepository,
                settings: this.settingsRepository,
                site: this.siteRepository,
            },
        };

        return exportData(dependencies);
    }

    public async importData(data: string): Promise<boolean> {
        const dependencies: DataImportExportDependencies = {
            eventEmitter: this,
            repositories: {
                history: this.historyRepository,
                monitor: this.monitorRepository,
                settings: this.settingsRepository,
                site: this.siteRepository,
            },
        };

        const callbacks: DataImportExportCallbacks = {
            getSitesFromCache: () => this.getSitesFromCache(),
            loadSites: () => this.loadSites(),
        };

        return importData(dependencies, callbacks, data);
    }

    /**
     * Download SQLite database backup.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const dependencies: DataBackupDependencies = {
            databaseService: this.databaseService,
            eventEmitter: this,
        };

        return downloadBackup(dependencies);
    }

    /**
     * Refresh sites from database and update in-memory cache.
     * Use this when you need to reload the in-memory cache from database.
     */
    public async refreshSites(): Promise<Site[]> {
        const callbacks: DataBackupCallbacks = {
            getSitesFromCache: () => this.getSitesFromCache(),
            loadSites: () => this.loadSites(),
        };

        return refreshSites(callbacks);
    }
}
