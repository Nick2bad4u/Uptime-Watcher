/**
 * Core uptime monitoring service.
 * Orchestrates site monitoring, data persistence, and event emission for the application.
 */

/* eslint-disable functional/no-let */
/* eslint-disable unicorn/no-null -- null literal needed for backend */
import { EventEmitter } from "events";

import {
    DEFAULT_REQUEST_TIMEOUT,
    DEFAULT_CHECK_INTERVAL,
    STATUS_UPDATE_EVENT,
    DEFAULT_HISTORY_LIMIT,
} from "./constants";
import {
    DatabaseService,
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
} from "./services/database";
import { MonitorFactory, MonitorScheduler } from "./services/monitoring";
import { Site, StatusHistory, StatusUpdate } from "./types";
import { isDev } from "./utils";
import { initDatabase } from "./utils/database/databaseInitializer";
import {
    getHistoryLimit as getHistoryLimitUtil,
    setHistoryLimit as setHistoryLimitUtil,
} from "./utils/database/historyLimitManager";
import { addSiteToDatabase } from "./utils/database/siteAdder";
import { removeSiteFromDatabase } from "./utils/database/siteRemover";
import { getSitesFromDatabase } from "./utils/database/sitesGetter";
import { loadSitesFromDatabase } from "./utils/database/sitesLoader";
import { monitorLogger as logger } from "./utils/logger";
import { autoStartMonitoring } from "./utils/monitoring/autoStarter";
import { setDefaultMonitorIntervals } from "./utils/monitoring/intervalSetter";
import { performInitialMonitorChecks } from "./utils/monitoring/monitorChecker";

/**
 * Type for imported site data structure.
 */
type ImportSite = {
    identifier: string;
    name?: string;
    monitors?: Site["monitors"];
};

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
        if (this.isMonitoring) {
            logger.debug("Monitoring already running");
            return;
        }
        logger.info(`Starting monitoring with ${this.sites.size} sites (per-site intervals)`);
        this.isMonitoring = true;
        // Start monitoring for each site using scheduler
        for (const site of this.sites.values()) {
            await this.startMonitoringForSite(site.identifier);
        }
    }

    public stopMonitoring() {
        this.monitorScheduler.stopAll();
        this.isMonitoring = false;
        logger.info("Stopped all site monitoring intervals");
    }

    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        const site = this.sites.get(identifier);
        if (site) {
            if (monitorId) {
                // Start monitoring for specific monitor
                const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
                if (!monitor) return false;

                // Start using scheduler
                const started = this.monitorScheduler.startMonitor(identifier, monitor);
                if (started) {
                    // Set monitoring=true for this monitor and persist
                    monitor.monitoring = true;
                    if (monitor.id) {
                        await this.monitorRepository.update(monitor.id, { monitoring: true });
                    }
                    // Emit status-update for this monitorId
                    const statusUpdate = {
                        previousStatus: undefined,
                        site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
                    };
                    this.emit(STATUS_UPDATE_EVENT, statusUpdate);
                }
                return started;
            }
            // If no monitorId is provided, start all monitors for this site
            const monitors = site.monitors.filter((monitor) => monitor.id);
            const results = await Promise.allSettled(
                monitors.map(async (monitor) => {
                    try {
                        return await this.startMonitoringForSite(identifier, String(monitor.id));
                    } catch (error) {
                        logger.error(`Failed to start monitoring for monitor ${monitor.id}`, error);
                        return false;
                    }
                })
            );

            // Return true if at least one monitor started successfully
            return results.some((result) => result.status === "fulfilled" && result.value === true);
        }
        return false;
    }

    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        const site = this.sites.get(identifier);
        if (site) {
            if (monitorId) {
                // Stop monitoring for specific monitor using scheduler
                const stopped = this.monitorScheduler.stopMonitor(identifier, monitorId);
                if (stopped) {
                    // Set monitoring=false for this monitor and persist
                    const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
                    if (monitor) {
                        monitor.monitoring = false;
                        if (monitor.id) {
                            await this.monitorRepository.update(monitor.id, { monitoring: false });
                        }
                    }
                    // Emit status-update for this monitorId
                    const statusUpdate = {
                        previousStatus: undefined,
                        site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
                    };
                    this.emit(STATUS_UPDATE_EVENT, statusUpdate);
                }
                return stopped;
            }
            // If no monitorId is provided, stop all monitors for this site
            const monitorsWithIds = site.monitors.filter((monitor) => monitor.id);
            const stopPromises = monitorsWithIds.map(async (monitor) => {
                try {
                    return await this.stopMonitoringForSite(identifier, monitor.id);
                } catch (error) {
                    logger.error(`Failed to stop monitoring for monitor ${monitor.id ?? "unknown"}`, error);
                    return false;
                }
            });

            const results = await Promise.all(stopPromises);
            return results.every((result) => result === true);
        }
        return false;
    }

    private async checkMonitor(site: Site, monitorId: string) {
        const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
        if (!monitor) {
            logger.error(`[checkMonitor] Monitor not found for id: ${monitorId} on site: ${site.identifier}`);
            return;
        }
        // Ensure monitor.id is present and valid before proceeding
        if (!monitor.id) {
            logger.error(`[checkMonitor] Monitor missing id for ${site.identifier}, skipping history insert.`);
            return;
        }
        logger.info(`[checkMonitor] Checking monitor: site=${site.identifier}, id=${monitor.id}`);

        // Use the monitoring service to perform the check
        let checkResult;
        try {
            const monitorService = MonitorFactory.getMonitor(monitor.type, {
                timeout: DEFAULT_REQUEST_TIMEOUT,
            });
            checkResult = await monitorService.check(monitor);
        } catch (error) {
            logger.error(`[checkMonitor] Error using monitor service for type ${monitor.type}`, error);
            checkResult = {
                details: "0",
                error: "Monitor service error",
                responseTime: 0,
                status: "down" as const,
            };
        }

        const previousStatus = monitor.status;
        const now = new Date();

        // Update monitor with results
        monitor.status = checkResult.status;
        monitor.responseTime = checkResult.responseTime;
        monitor.lastChecked = now;
        // Add to history
        const historyEntry: StatusHistory = {
            responseTime: checkResult.responseTime,
            status: checkResult.status,
            timestamp: now.getTime(),
        };

        try {
            // Add history entry using repository
            await this.historyRepository.addEntry(monitor.id, historyEntry, checkResult.details);

            logger.info(
                `[checkMonitor] Inserted history row: monitor_id=${monitor.id}, status=${historyEntry.status}, responseTime=${historyEntry.responseTime}, timestamp=${historyEntry.timestamp}, details=${checkResult.details ?? "undefined"}`
            );
        } catch (err) {
            logger.error(`[checkMonitor] Failed to insert history row: monitor_id=${monitor.id}`, err);
        }

        // Trim history if needed using repository
        // Use smart history management for optimal UI experience
        if (this.historyLimit > 0) {
            // Calculate effective limit: ensure we always keep enough for large screen displays
            // This prevents premature pruning that would leave charts looking sparse
            const minRequiredForUI = 60; // Enough for large screens with high DPI
            const effectiveLimit = Math.max(this.historyLimit, minRequiredForUI);
            await this.historyRepository.pruneHistory(monitor.id, effectiveLimit);
        }

        // Update monitor with new status using repository
        await this.monitorRepository.update(monitor.id, {
            lastChecked: monitor.lastChecked,
            responseTime: monitor.responseTime,
            status: monitor.status,
        });

        // Fetch fresh site data from database to ensure we have the latest history and monitor state
        const freshSiteData = await this.siteRepository.getByIdentifier(site.identifier);
        if (!freshSiteData) {
            logger.error(`[checkMonitor] Failed to fetch updated site data for ${site.identifier}`);
            return;
        }

        // Update the in-memory cache with fresh data
        this.sites.set(site.identifier, freshSiteData);

        // Emit StatusUpdate with fresh site data including updated history
        const statusUpdate: StatusUpdate = {
            previousStatus,
            site: freshSiteData,
        };
        this.emit(STATUS_UPDATE_EVENT, statusUpdate);

        // Emit monitor state change events with consistent payload
        if (previousStatus === "up" && checkResult.status === "down") {
            this.emit("site-monitor-down", {
                monitor: { ...monitor },
                monitorId: monitor.id,
                site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
            });
        } else if (previousStatus === "down" && checkResult.status === "up") {
            this.emit("site-monitor-up", {
                monitor: { ...monitor },
                monitorId: monitor.id,
                site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
            });
        }
        return statusUpdate;
    }

    public async checkSiteManually(identifier: string, monitorId?: string): Promise<StatusUpdate | null> {
        const site = this.sites.get(identifier);
        if (!site) {
            throw new Error(`Site not found: ${identifier}`);
        }

        // If no monitorId provided, use the first monitor's ID
        const targetMonitorId =
            monitorId ??
            (() => {
                const firstMonitor = site.monitors[0];
                if (!firstMonitor?.id) {
                    throw new Error(`No monitors found for site ${identifier}`);
                }
                return String(firstMonitor.id);
            })();

        // Validate the monitor exists
        const monitor = site.monitors.find((m) => String(m.id) === String(targetMonitorId));
        if (!monitor) {
            throw new Error(`Monitor with ID ${targetMonitorId} not found for site ${identifier}`);
        }

        const result = await this.checkMonitor(site, targetMonitorId);
        return result || null;
    }

    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        const site = this.validateUpdateSiteInput(identifier);
        const updatedSite = this.createUpdatedSite(site, updates);

        await this.siteRepository.upsert(updatedSite);

        if (updates.monitors) {
            await this.updateSiteMonitors(identifier, updates.monitors);
            await this.handleMonitorIntervalChanges(identifier, site, updates.monitors);
        }

        return updatedSite;
    }

    /**
     * Validate input parameters for updateSite operation.
     */
    private validateUpdateSiteInput(identifier: string): Site {
        if (!identifier) {
            throw new Error("Site identifier is required");
        }

        const site = this.sites.get(identifier);
        if (!site) {
            throw new Error(`Site not found: ${identifier}`);
        }

        return site;
    }

    /**
     * Create updated site object with new values.
     */
    private createUpdatedSite(site: Site, updates: Partial<Site>): Site {
        const updatedSite: Site = {
            ...site,
            ...updates,
            monitors: updates.monitors || site.monitors,
        };
        this.sites.set(site.identifier, updatedSite);
        return updatedSite;
    }

    /**
     * Update monitors in the database for a site.
     */
    private async updateSiteMonitors(identifier: string, newMonitors: Site["monitors"]): Promise<void> {
        const dbMonitors = await this.monitorRepository.findBySiteIdentifier(identifier);

        await this.deleteObsoleteMonitors(dbMonitors, newMonitors);
        await this.upsertSiteMonitors(identifier, newMonitors);
    }

    /**
     * Delete monitors that are no longer in the updated monitors array.
     */
    private async deleteObsoleteMonitors(dbMonitors: Site["monitors"], newMonitors: Site["monitors"]): Promise<void> {
        const toDelete = dbMonitors.filter((dbm) => !newMonitors.some((m) => String(m.id) === String(dbm.id)));

        for (const monitor of toDelete) {
            if (monitor.id) {
                await this.monitorRepository.delete(monitor.id);
            }
        }
    }

    /**
     * Create or update monitors in the database.
     */
    private async upsertSiteMonitors(identifier: string, monitors: Site["monitors"]): Promise<void> {
        for (const monitor of monitors) {
            if (monitor.id && !isNaN(Number(monitor.id))) {
                await this.monitorRepository.update(monitor.id, monitor);
            } else {
                const newId = await this.monitorRepository.create(identifier, monitor);
                monitor.id = newId;
            }
        }
    }

    /**
     * Handle monitor interval changes and restart monitoring if needed.
     */
    private async handleMonitorIntervalChanges(
        identifier: string,
        originalSite: Site,
        updatedMonitors: Site["monitors"]
    ): Promise<void> {
        for (const updatedMonitor of updatedMonitors) {
            const prevMonitor = originalSite.monitors.find((m) => String(m.id) === String(updatedMonitor.id));
            if (!prevMonitor) continue;

            const intervalChanged = this.hasIntervalChanged(updatedMonitor, prevMonitor);
            if (intervalChanged) {
                await this.restartMonitorForIntervalChange(identifier, updatedMonitor, prevMonitor);
            }
        }
    }

    /**
     * Check if the monitor's check interval has changed.
     */
    private hasIntervalChanged(updatedMonitor: Site["monitors"][0], prevMonitor: Site["monitors"][0]): boolean {
        return (
            typeof updatedMonitor.checkInterval === "number" &&
            updatedMonitor.checkInterval !== prevMonitor.checkInterval
        );
    }

    /**
     * Restart monitoring for a monitor with changed interval.
     */
    private async restartMonitorForIntervalChange(
        identifier: string,
        updatedMonitor: Site["monitors"][0],
        prevMonitor: Site["monitors"][0]
    ): Promise<void> {
        if (isDev()) {
            logger.debug(
                `[updateSite] Restarting monitor ${updatedMonitor.id}: interval changed from ${prevMonitor.checkInterval}ms to ${updatedMonitor.checkInterval}ms`
            );
        }

        const wasMonitoring = prevMonitor.monitoring ?? false;
        await this.stopMonitoringForSite(identifier, String(updatedMonitor.id));

        if (wasMonitoring) {
            await this.startMonitoringForSite(identifier, String(updatedMonitor.id));
        }
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
        try {
            // Export all sites and settings using repositories
            const sites = await this.siteRepository.exportAll();
            const settings = await this.settingsRepository.getAll();

            const exportObj = {
                settings,
                sites: sites.map((site) => ({
                    identifier: site.identifier,
                    monitors: [] as Site["monitors"],
                    name: site.name,
                })),
            };

            // Export monitors and history for each site
            for (const site of exportObj.sites) {
                const monitors = await this.monitorRepository.findBySiteIdentifier(site.identifier);
                for (const monitor of monitors) {
                    if (monitor.id) {
                        monitor.history = await this.historyRepository.findByMonitorId(monitor.id);
                    }
                }
                site.monitors = monitors;
            }

            return JSON.stringify(exportObj, undefined, 2);
        } catch (error) {
            logger.error("Failed to export data", error);
            this.emit("db-error", { error, operation: "exportData" });
            throw error;
        }
    }

    public async importData(data: string): Promise<boolean> {
        logger.info("Importing data");
        try {
            const parsedData = this.validateImportData(data);
            await this.clearExistingData();
            await this.importSitesAndSettings(parsedData);

            if (parsedData.sites) {
                await this.importMonitorsWithHistory(parsedData.sites);
            }

            await this.loadSites();

            logger.info("Data imported successfully");
            return true;
        } catch (error) {
            logger.error("Failed to import data", error);
            this.emit("db-error", { error, operation: "importData" });
            return false;
        }
    }

    /**
     * Validate and parse import data.
     */
    private validateImportData(data: string): { sites?: ImportSite[]; settings?: Record<string, string> } {
        if (!data || typeof data !== "string") {
            throw new Error("Invalid import data: must be a non-empty string");
        }

        const parsedData = JSON.parse(data);
        if (!parsedData || typeof parsedData !== "object") {
            throw new Error("Invalid import data: must be a valid JSON object");
        }

        return parsedData;
    }

    /**
     * Clear all existing data from repositories.
     */
    private async clearExistingData(): Promise<void> {
        await this.siteRepository.deleteAll();
        await this.settingsRepository.deleteAll();
        await this.monitorRepository.deleteAll();
        await this.historyRepository.deleteAll();
    }

    /**
     * Import sites and settings data.
     */
    private async importSitesAndSettings(parsedData: {
        sites?: ImportSite[];
        settings?: Record<string, string>;
    }): Promise<void> {
        if (Array.isArray(parsedData.sites)) {
            const sitesToInsert = parsedData.sites.map((site: { identifier: string; name?: string }) => ({
                identifier: site.identifier,
                name: site.name,
            }));
            await this.siteRepository.bulkInsert(sitesToInsert);
        }

        if (parsedData.settings && typeof parsedData.settings === "object") {
            await this.settingsRepository.bulkInsert(parsedData.settings);
        }
    }

    /**
     * Import monitors and their associated history.
     */
    private async importMonitorsWithHistory(sites: ImportSite[]): Promise<void> {
        for (const site of sites) {
            if (Array.isArray(site.monitors)) {
                const createdMonitors = await this.monitorRepository.bulkCreate(site.identifier, site.monitors);
                await this.importHistoryForMonitors(createdMonitors, site.monitors);
            }
        }
    }

    /**
     * Import history for created monitors by matching with original monitors.
     */
    private async importHistoryForMonitors(
        createdMonitors: Site["monitors"],
        originalMonitors: Site["monitors"]
    ): Promise<void> {
        for (const createdMonitor of createdMonitors) {
            const originalMonitor = this.findMatchingOriginalMonitor(createdMonitor, originalMonitors);

            if (this.shouldImportHistory(createdMonitor, originalMonitor)) {
                await this.historyRepository.bulkInsert(createdMonitor.id, originalMonitor?.history ?? []);
            }
        }
    }

    /**
     * Find the original monitor that matches the created monitor.
     */
    private findMatchingOriginalMonitor(
        createdMonitor: Site["monitors"][0],
        originalMonitors: Site["monitors"]
    ): Site["monitors"][0] | undefined {
        return originalMonitors.find(
            (original: Site["monitors"][0]) =>
                original.url === createdMonitor.url && original.type === createdMonitor.type
        );
    }

    /**
     * Check if history should be imported for a monitor.
     */
    private shouldImportHistory(createdMonitor: Site["monitors"][0], originalMonitor?: Site["monitors"][0]): boolean {
        return !!(createdMonitor && originalMonitor && createdMonitor.id);
    }

    /**
     * Download SQLite database backup.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        try {
            return await this.databaseService.downloadBackup();
        } catch (error) {
            logger.error("Failed to download backup", error);
            this.emit("db-error", { error, operation: "downloadBackup" });
            throw error;
        }
    }

    /**
     * Refresh sites from database and update in-memory cache.
     * Use this when you need to reload the in-memory cache from database.
     */
    public async refreshSites(): Promise<Site[]> {
        try {
            await this.loadSites();
            return this.getSitesFromCache();
        } catch (error) {
            logger.error("Failed to refresh sites from database", error);
            throw error;
        }
    }
}
