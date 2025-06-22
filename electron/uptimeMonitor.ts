import { EventEmitter } from "events";
import axios from "axios";
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { app } from "electron";
import { Site, StatusHistory, StatusUpdate, MonitorType } from "./types";
import log from "electron-log/main";
import isPortReachable from "is-port-reachable";

// Default timeout for HTTP requests (10 seconds)
const DEFAULT_REQUEST_TIMEOUT = 10000;

// Configure logger for uptime monitor
const logger = {
    info: (message: string, ...args: any[]) => log.info(`[MONITOR] ${message}`, ...args),
    error: (message: string, error?: Error | any, ...args: any[]) => {
        if (error instanceof Error) {
            log.error(`[MONITOR] ${message}`, { message: error.message, stack: error.stack }, ...args);
        } else {
            log.error(`[MONITOR] ${message}`, error, ...args);
        }
    },
    debug: (message: string, ...args: any[]) => log.debug(`[MONITOR] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => log.warn(`[MONITOR] ${message}`, ...args),
};

interface DatabaseSchema {
    sites: Site[];
    settings: {
        historyLimit: number;
    };
}

export class UptimeMonitor extends EventEmitter {
    private db: any;
    private sites: Map<string, Site> = new Map(); // key: site.identifier
    private siteIntervals: Map<string, NodeJS.Timeout> = new Map(); // Per-site intervals
    private historyLimit: number = 100; // Default history limit
    private isMonitoring: boolean = false;

    constructor() {
        super();
        this.initDatabase();
    }

    // Helper: Retry logic for file operations
    private async saveSitesWithRetry(maxRetries = 5, delayMs = 300): Promise<void> {
        let attempt = 0;
        let lastError: any = null;
        while (attempt < maxRetries) {
            try {
                await this.saveSites();
                return;
            } catch (error) {
                lastError = error;
                logger.error(`saveSites failed (attempt ${attempt + 1}/${maxRetries})`, error);
                await new Promise((res) => setTimeout(res, delayMs));
            }
            attempt++;
        }
        logger.error("Persistent DB write failure after retries", lastError);
        this.emit("db-error", { error: lastError, operation: "saveSites" });
    }

    // Helper: Retry logic for loading sites (DB read)
    private async loadSitesWithRetry(maxRetries = 5, delayMs = 300): Promise<void> {
        let attempt = 0;
        let lastError: any = null;
        while (attempt < maxRetries) {
            try {
                await this.loadSites();
                return;
            } catch (error) {
                lastError = error;
                logger.error(`loadSites failed (attempt ${attempt + 1}/${maxRetries})`, error);
                await new Promise((res) => setTimeout(res, delayMs));
            }
            attempt++;
        }
        logger.error("Persistent DB read failure after retries", lastError);
        this.emit("db-error", { error: lastError, operation: "loadSites" });
    }

    private async initDatabase() {
        try {
            const dbPath = path.join(app.getPath("userData"), "uptime.json");
            // Initialize lowdb with default data
            const defaultData: DatabaseSchema = {
                sites: [],
                settings: {
                    historyLimit: 100,
                },
            };
            this.db = await JSONFilePreset(dbPath, defaultData);
            await this.loadSitesWithRetry();
        } catch (error) {
            logger.error("Failed to initialize database", error);
            this.emit("db-error", { error, operation: "initDatabase" });
        }
    }

    private async loadSites() {
        try {
            await this.db.read();
            const sites = this.db.data.sites || [];
            for (const siteData of sites) {
                if (!Array.isArray(siteData.monitors)) {
                    throw new Error("Invalid site data: missing monitors array. Please use a clean database.");
                }
                const site: Site = {
                    ...siteData,
                    monitors: siteData.monitors.map((m: any) => ({
                        ...m,
                        lastChecked: m.lastChecked ? new Date(m.lastChecked) : undefined,
                        history: m.history || [],
                        monitoring: typeof m.monitoring === "undefined" ? true : m.monitoring,
                    })),
                };
                this.sites.set(site.identifier, site); // Use identifier as key
            }
            if (typeof this.db.data.settings?.historyLimit === "number") {
                this.historyLimit = this.db.data.settings.historyLimit;
            }
        } catch (error) {
            logger.error("Failed to load sites from DB", error);
            this.emit("db-error", { error, operation: "loadSites" });
        }
    }

    private async saveSites() {
        try {
            // Save only new format
            const sitesArray = Array.from(this.sites.values()).map((site) => ({
                ...site,
                monitors: site.monitors.map((m) => ({
                    ...m,
                    lastChecked: m.lastChecked ? new Date(m.lastChecked).toISOString() : undefined,
                    monitoring: typeof m.monitoring === "undefined" ? true : m.monitoring,
                })),
            }));
            this.db.data.sites = sitesArray;
            this.db.data.settings = {
                historyLimit: this.historyLimit,
            };
            await this.db.write();
        } catch (error) {
            logger.error("Failed to save sites to DB", error);
            throw error;
        }
    }

    public async addSite(siteData: Site): Promise<Site> {
        logger.info(`Adding new site: ${siteData.identifier}`);
        const site: Site = {
            ...siteData,
        };
        this.sites.set(site.identifier, site); // Use identifier as key
        await this.saveSitesWithRetry();
        // Initial check for all monitors
        for (const monitor of site.monitors) {
            await this.checkMonitor(site, monitor.type);
        }
        logger.info(`Site added successfully: ${site.identifier} (${site.name || "unnamed"})`);
        return site;
    }

    public async removeSite(identifier: string): Promise<boolean> {
        logger.info(`Removing site: ${identifier}`);
        const removed = this.sites.delete(identifier);
        if (removed) {
            logger.info(`Site removed successfully: ${identifier}`);
        } else {
            logger.warn(`Site not found for removal: ${identifier}`);
        }
        await this.saveSitesWithRetry();
        return removed;
    }

    public async getSites(): Promise<Site[]> {
        return Array.from(this.sites.values());
    }

    public setHistoryLimit(limit: number) {
        if (limit <= 0) {
            this.historyLimit = 0;
        } else {
            this.historyLimit = Math.max(10, limit);
        }
        this.saveSitesWithRetry();
        // Trim existing history for all monitors only if limit > 0
        if (this.historyLimit > 0) {
            for (const site of this.sites.values()) {
                for (const monitor of site.monitors) {
                    if (monitor.history.length > this.historyLimit) {
                        monitor.history = monitor.history.slice(0, this.historyLimit);
                    }
                }
            }
            this.saveSitesWithRetry();
        }
    }

    public getHistoryLimit(): number {
        return this.historyLimit;
    }

    public startMonitoring() {
        if (this.isMonitoring) {
            logger.debug("Monitoring already running");
            return;
        }
        logger.info(`Starting monitoring with ${this.sites.size} sites (per-site intervals)`);
        this.isMonitoring = true;
        // Start interval for each site
        for (const site of this.sites.values()) {
            this.startMonitoringForSite(site.identifier);
        }
    }

    public stopMonitoring() {
        for (const interval of this.siteIntervals.values()) {
            clearInterval(interval);
        }
        this.siteIntervals.clear();
        this.isMonitoring = false;
        logger.info("Stopped all site monitoring intervals");
    }

    public startMonitoringForSite(identifier: string, monitorType?: MonitorType): boolean {
        const site = this.sites.get(identifier);
        if (site) {
            if (monitorType) {
                // Per-monitor-type: start interval for only this monitor
                const intervalKey = `${identifier}|${monitorType}`;
                if (this.siteIntervals.has(intervalKey)) {
                    clearInterval(this.siteIntervals.get(intervalKey)!);
                }
                const monitor = site.monitors.find((m) => m.type === monitorType);
                if (!monitor) return false;
                // Use monitor-specific checkInterval, fallback to default
                const monitorInterval = monitor.checkInterval || 60000;
                const interval = setInterval(() => {
                    this.checkMonitor(site, monitorType);
                }, monitorInterval);
                this.siteIntervals.set(intervalKey, interval);
                // Set monitoring=true for this monitor and persist
                monitor.monitoring = true;
                this.saveSitesWithRetry();
                // Emit status-update for this monitorType
                const statusUpdate = {
                    site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
                    previousStatus: undefined,
                };
                this.emit("status-update", statusUpdate);
                return true;
            }
            // If no monitorType is provided, start all monitors for this site
            for (const monitor of site.monitors) {
                this.startMonitoringForSite(identifier, monitor.type);
            }
            return true;
        }
        return false;
    }

    public stopMonitoringForSite(identifier: string, monitorType?: MonitorType): boolean {
        const site = this.sites.get(identifier);
        if (site) {
            if (monitorType) {
                // Per-monitor-type: stop interval for only this monitor
                const intervalKey = `${identifier}|${monitorType}`;
                if (this.siteIntervals.has(intervalKey)) {
                    clearInterval(this.siteIntervals.get(intervalKey)!);
                    this.siteIntervals.delete(intervalKey);
                }
                // Set monitoring=false for this monitor and persist
                const monitor = site.monitors.find((m) => m.type === monitorType);
                if (monitor) {
                    monitor.monitoring = false;
                    this.saveSitesWithRetry();
                }
                // Emit status-update for this monitorType
                const statusUpdate = {
                    site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
                    previousStatus: undefined,
                };
                this.emit("status-update", statusUpdate);
                return true;
            }
            // If no monitorType is provided, stop all monitors for this site
            for (const monitor of site.monitors) {
                this.stopMonitoringForSite(identifier, monitor.type);
            }
            return true;
        }
        return false;
    }

    private async checkMonitor(site: Site, monitorType: MonitorType) {
        const monitor = site.monitors.find((m) => m.type === monitorType);
        if (!monitor) return;
        const startTime = Date.now();
        let newStatus: "up" | "down" = "down";
        let responseTime = 0;
        try {
            if (monitorType === "http") {
                if (!monitor.url) throw new Error("HTTP monitor missing URL");
                await axios.get(monitor.url, {
                    timeout: DEFAULT_REQUEST_TIMEOUT,
                    validateStatus: (status: number) => status < 500,
                });
                responseTime = Date.now() - startTime;
                newStatus = "up";
            } else if (monitorType === "port") {
                if (!monitor.host || !monitor.port) throw new Error("Port monitor missing host or port");
                const available = await isPortReachable(monitor.port, { host: monitor.host });
                responseTime = Date.now() - startTime;
                newStatus = available ? "up" : "down";
            }
        } catch (error) {
            responseTime = Date.now() - startTime;
            newStatus = "down";
        }
        const previousStatus = monitor.status;
        const now = new Date();
        // Update monitor
        monitor.status = newStatus;
        monitor.responseTime = responseTime;
        monitor.lastChecked = now;
        // Add to history
        const historyEntry: StatusHistory = {
            timestamp: now.getTime(),
            status: newStatus,
            responseTime,
        };
        monitor.history.unshift(historyEntry);
        if (this.historyLimit > 0 && monitor.history.length > this.historyLimit) {
            monitor.history = monitor.history.slice(0, this.historyLimit);
        }
        await this.saveSitesWithRetry();
        // Emit StatusUpdate with new Site shape
        const statusUpdate: StatusUpdate = {
            site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
            previousStatus,
        };
        this.emit("status-update", statusUpdate);
        if (previousStatus === "up" && newStatus === "down") {
            this.emit("site-monitor-down", { site, monitorType, monitor });
        } else if (previousStatus === "down" && newStatus === "up") {
            this.emit("site-monitor-up", { site, monitorType, monitor });
        }
        return statusUpdate;
    }

    public async checkSiteManually(
        identifier: string,
        monitorType: MonitorType = "http"
    ): Promise<StatusUpdate | null> {
        const site = this.sites.get(identifier);
        if (!site) {
            throw new Error(`Site with identifier ${identifier} not found`);
        }
        const result = await this.checkMonitor(site, monitorType);
        return result || null;
    }

    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        const site = this.sites.get(identifier);
        if (!site) {
            throw new Error(`Site not found: ${identifier}`);
        }
        // Only update allowed fields
        const updatedSite: Site = {
            ...site,
            ...updates,
            monitors: updates.monitors || site.monitors,
        };
        this.sites.set(identifier, updatedSite);
        await this.saveSitesWithRetry();
        // If monitors were updated, check for interval changes and restart timers as needed
        if (updates.monitors) {
            for (const updatedMonitor of updates.monitors) {
                const prevMonitor = site.monitors.find((m) => m.type === updatedMonitor.type);
                if (!prevMonitor) continue;
                // If checkInterval changed, restart timer for this monitor
                if (
                    typeof updatedMonitor.checkInterval === "number" &&
                    updatedMonitor.checkInterval !== prevMonitor.checkInterval
                ) {
                    this.stopMonitoringForSite(identifier, updatedMonitor.type);
                    this.startMonitoringForSite(identifier, updatedMonitor.type);
                }
            }
        }
        return updatedSite;
    }

    // Export/Import functionality
    public async exportData(): Promise<string> {
        try {
            await this.db.read();
            return JSON.stringify(this.db.data, null, 2);
        } catch (error) {
            logger.error("Failed to export data", error);
            this.emit("db-error", { error, operation: "exportData" });
            throw error;
        }
    }

    public async importData(data: string): Promise<boolean> {
        logger.info("Importing data");
        try {
            const parsedData = JSON.parse(data);
            this.db.data = parsedData;
            await this.db.write();
            await this.loadSites();
            logger.info("Data imported successfully");
            return true;
        } catch (error) {
            logger.error("Failed to import data", error);
            this.emit("db-error", { error, operation: "importData" });
            return false;
        }
    }
}
