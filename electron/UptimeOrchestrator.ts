/**
 * Core uptime monitoring orchestrator.
 * Coordinates between specialized managers to provide a unified API for uptime monitoring.
 */

/* eslint-disable unicorn/no-null -- null literal needed for backend */
import { EventEmitter } from "events";

import { DEFAULT_HISTORY_LIMIT } from "./constants";
import { DatabaseManager } from "./managers/DatabaseManager";
import { MonitorManager } from "./managers/MonitorManager";
import { SiteManager } from "./managers/SiteManager";
import {
    DatabaseService,
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
} from "./services/database";
import { Site, StatusUpdate } from "./types";

/**
 * Core uptime monitoring orchestrator that coordinates specialized managers.
 *
 * This class serves as a lightweight coordinator that delegates operations to:
 * - SiteManager: Site CRUD operations and cache management
 * - MonitorManager: Monitoring operations and scheduling
 * - DatabaseManager: Database operations and data management
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
 * const orchestrator = new UptimeOrchestrator();
 * orchestrator.on('status-update', (data) => console.log(data));
 * await orchestrator.addSite({ identifier: 'example', monitors: [...] });
 * orchestrator.startMonitoring();
 * ```
 */
export class UptimeOrchestrator extends EventEmitter {
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;

    // Manager instances
    private readonly siteManager: SiteManager;
    private readonly monitorManager: MonitorManager;
    private readonly databaseManager: DatabaseManager;

    constructor() {
        super();

        // Initialize repositories
        const databaseService = DatabaseService.getInstance();
        const siteRepository = new SiteRepository();
        const monitorRepository = new MonitorRepository();
        const historyRepository = new HistoryRepository();
        const settingsRepository = new SettingsRepository();

        // Initialize managers
        this.siteManager = new SiteManager({
            historyRepository,
            monitorRepository,
            siteRepository,
        });

        this.monitorManager = new MonitorManager({
            eventEmitter: this,
            getHistoryLimit: () => this.historyLimit,
            getSitesCache: () => this.siteManager.getSitesCache(),
            repositories: {
                history: historyRepository,
                monitor: monitorRepository,
                site: siteRepository,
            },
        });

        this.databaseManager = new DatabaseManager({
            eventEmitter: this,
            repositories: {
                database: databaseService,
                history: historyRepository,
                monitor: monitorRepository,
                settings: settingsRepository,
                site: siteRepository,
            },
        });

        // Set up callbacks between managers
        this.setupManagerCallbacks();
    }

    /**
     * Set up callbacks between managers for cross-manager operations.
     */
    private setupManagerCallbacks(): void {
        // Site manager callbacks for monitoring operations
        this.siteManager.setCallbacks({
            startMonitoringForSite: (identifier, monitorId) =>
                this.monitorManager.startMonitoringForSite(identifier, monitorId),
            stopMonitoringForSite: (identifier, monitorId) =>
                this.monitorManager.stopMonitoringForSite(identifier, monitorId),
        });

        // Database manager callbacks for cache and state management
        this.databaseManager.setCallbacks({
            getSitesFromCache: () => this.siteManager.getSitesFromCache(),
            setHistoryLimit: (limit) => {
                this.historyLimit = limit;
            },
            startMonitoringForSite: (identifier, monitorId) =>
                this.monitorManager.startMonitoringForSite(identifier, monitorId),
            updateSitesCache: (sites) => this.siteManager.updateSitesCache(sites),
        });
    }

    /**
     * Initialize the orchestrator and all its managers.
     */
    public async initialize(): Promise<void> {
        await this.databaseManager.initialize();
    }

    // Site Management Operations
    public async getSites(): Promise<Site[]> {
        return this.siteManager.getSites();
    }

    public getSitesFromCache(): Site[] {
        return this.siteManager.getSitesFromCache();
    }

    public async addSite(siteData: Site): Promise<Site> {
        const site = await this.siteManager.addSite(siteData);

        // Set up monitoring for the new site
        await this.monitorManager.setupSiteForMonitoring(site);

        return site;
    }

    public async removeSite(identifier: string): Promise<boolean> {
        return this.siteManager.removeSite(identifier);
    }

    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        return this.siteManager.updateSite(identifier, updates);
    }

    // Monitoring Operations
    public async startMonitoring(): Promise<void> {
        await this.monitorManager.startMonitoring();
    }

    public stopMonitoring(): void {
        this.monitorManager.stopMonitoring();
    }

    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return this.monitorManager.startMonitoringForSite(identifier, monitorId);
    }

    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return this.monitorManager.stopMonitoringForSite(identifier, monitorId);
    }

    public async checkSiteManually(identifier: string, monitorId?: string): Promise<StatusUpdate | null> {
        const result = await this.monitorManager.checkSiteManually(identifier, monitorId);
        return result ?? null;
    }

    // Database Operations
    public async exportData(): Promise<string> {
        return this.databaseManager.exportData();
    }

    public async importData(data: string): Promise<boolean> {
        return this.databaseManager.importData(data);
    }

    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        return this.databaseManager.downloadBackup();
    }

    public async refreshSites(): Promise<Site[]> {
        return this.databaseManager.refreshSites();
    }

    // History Management
    public async setHistoryLimit(limit: number): Promise<void> {
        await this.databaseManager.setHistoryLimit(limit);
    }

    public getHistoryLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    // Status Information
    public isMonitoringActive(): boolean {
        return this.monitorManager.isMonitoringActive();
    }
}
