import { EventEmitter } from "events";
import axios from "axios";
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { app } from "electron";
import { Site, StatusHistory, StatusUpdate, Monitor, MonitorType } from "./types";
import log from "electron-log/main";

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
        checkInterval: number;
        historyLimit: number;
    };
}

export class UptimeMonitor extends EventEmitter {
    private db: any;
    private sites: Map<string, Site> = new Map();
    private checkInterval: number = 60000; // 1 minute default
    private historyLimit: number = 100; // Default history limit
    private monitoringInterval: NodeJS.Timeout | null = null;
    private isMonitoring: boolean = false;

    constructor() {
        super();
        this.initDatabase();
    }

    private async initDatabase() {
        const dbPath = path.join(app.getPath("userData"), "uptime.json");

        // Initialize lowdb with default data
        const defaultData: DatabaseSchema = {
            sites: [],
            settings: {
                checkInterval: 60000,
                historyLimit: 100,
            },
        };

        this.db = await JSONFilePreset(dbPath, defaultData);
        await this.loadSites();
    }

    private async loadSites() {
        await this.db.read();
        const sites = this.db.data.sites || [];

        for (const siteData of sites) {
            // MIGRATION: Convert legacy flat fields to monitors array if needed
            let site: Site;
            if (Array.isArray(siteData.monitors)) {
                // Already new format
                site = {
                    ...siteData,
                    monitors: siteData.monitors.map((m: any) => ({
                        ...m,
                        lastChecked: m.lastChecked ? new Date(m.lastChecked) : undefined,
                        history: m.history || [],
                    })),
                };
            } else {
                // Legacy: migrate flat fields to monitors array
                site = {
                    ...siteData,
                    monitors: [{
                        type: siteData.monitorType || "http",
                        status: siteData.status || "pending",
                        responseTime: siteData.responseTime,
                        lastChecked: siteData.lastChecked ? new Date(siteData.lastChecked) : undefined,
                        history: siteData.history || [],
                    }],
                };
            }
            this.sites.set(site.url, site);
        }

        // Load settings
        this.checkInterval = this.db.data.settings?.checkInterval || 60000;
        if (typeof this.db.data.settings?.historyLimit === "number") {
            this.historyLimit = this.db.data.settings.historyLimit;
        }
    }

    private async saveSites() {
        // Save only new format
        const sitesArray = Array.from(this.sites.values()).map((site) => ({
            ...site,
            monitors: site.monitors.map((m) => ({
                ...m,
                // Ensure lastChecked is serializable
                lastChecked: m.lastChecked ? new Date(m.lastChecked).toISOString() : undefined,
            })),
        }));
        this.db.data.sites = sitesArray;
        this.db.data.settings = {
            checkInterval: this.checkInterval,
            historyLimit: this.historyLimit,
        };
        await this.db.write();
    }

    public async addSite(siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }): Promise<Site> {
        logger.info(`Adding new site: ${siteData.url}`);
        const id = Date.now().toString();
        const monitors = siteData.monitors && siteData.monitors.length > 0
            ? siteData.monitors.map((m) => ({ ...m, history: m.history || [] }))
            : [{ type: ("http" as MonitorType), status: "pending" as "pending", history: [] }];
        const site: Site = {
            id,
            ...siteData,
            monitors,
        };
        this.sites.set(site.url, site);
        await this.saveSites();
        // Initial check for all monitors
        for (const monitor of site.monitors) {
            await this.checkMonitor(site, monitor.type);
        }
        logger.info(`Site added successfully: ${site.url} (${site.name || "unnamed"})`);
        return site;
    }

    public async removeSite(url: string): Promise<boolean> {
        logger.info(`Removing site: ${url}`);

        const removed = this.sites.delete(url);
        if (removed) {
            await this.saveSites();
            logger.info(`Site removed successfully: ${url}`);
        } else {
            logger.warn(`Site not found for removal: ${url}`);
        }
        return removed;
    }

    public async getSites(): Promise<Site[]> {
        return Array.from(this.sites.values());
    }

    public setCheckInterval(interval: number) {
        this.checkInterval = interval;
        this.saveSites();

        // Restart monitoring with new interval if currently monitoring
        if (this.isMonitoring) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    public getCheckInterval(): number {
        return this.checkInterval;
    }

    public setHistoryLimit(limit: number) {
        if (limit <= 0) {
            this.historyLimit = 0;
        } else {
            this.historyLimit = Math.max(10, limit);
        }
        this.saveSites();
        // Trim existing history for all monitors only if limit > 0
        if (this.historyLimit > 0) {
            for (const site of this.sites.values()) {
                for (const monitor of site.monitors) {
                    if (monitor.history.length > this.historyLimit) {
                        monitor.history = monitor.history.slice(0, this.historyLimit);
                    }
                }
            }
            this.saveSites();
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

        logger.info(`Starting monitoring with ${this.sites.size} sites (interval: ${this.checkInterval}ms)`);
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.checkAllSites();
        }, this.checkInterval);

        // Initial check
        this.checkAllSites();
    }

    public stopMonitoring() {
        if (this.monitoringInterval) {
            logger.info("Stopping monitoring");
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        } else {
            logger.debug("No monitoring interval to stop");
        }
        this.isMonitoring = false;
    }

    private async checkAllSites() {
        logger.debug(`Checking ${this.sites.size} sites`);
        const promises = Array.from(this.sites.values()).flatMap((site) =>
            site.monitors.map((monitor) => this.checkMonitor(site, monitor.type))
        );
        await Promise.allSettled(promises);
    }

    private async checkMonitor(site: Site, monitorType: MonitorType) {
        const monitor = site.monitors.find((m) => m.type === monitorType);
        if (!monitor) return;
        const startTime = Date.now();
        let newStatus: "up" | "down" = "down";
        let responseTime = 0;
        try {
            if (monitorType === "http") {
                await axios.get(site.url, {
                    timeout: DEFAULT_REQUEST_TIMEOUT,
                    validateStatus: (status: number) => status < 500,
                });
                responseTime = Date.now() - startTime;
                newStatus = "up";
            } else if (monitorType === "port") {
                // Placeholder for port check
                responseTime = Date.now() - startTime;
                newStatus = "down";
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
        await this.saveSites();
        // Emit StatusUpdate with new Site shape
        const statusUpdate: StatusUpdate = {
            site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
            previousStatus,
        };
        this.emit("status-update", statusUpdate);
        if (previousStatus === "up" && newStatus === "down") {
            this.emit("site-down", site);
        } else if (previousStatus === "down" && newStatus === "up") {
            this.emit("site-up", site);
        }
        return statusUpdate;
    }

    public async checkSiteManually(url: string, monitorType: MonitorType = "http"): Promise<StatusUpdate | null> {
        const site = this.sites.get(url);
        if (!site) {
            throw new Error(`Site with URL ${url} not found`);
        }
        const result = await this.checkMonitor(site, monitorType);
        return result || null;
    }

    public async updateSite(url: string, updates: Partial<Site>): Promise<Site> {
        const site = this.sites.get(url);
        if (!site) {
            throw new Error(`Site not found: ${url}`);
        }
        // Only update allowed fields
        const updatedSite: Site = {
            ...site,
            ...updates,
            monitors: updates.monitors || site.monitors,
        };
        this.sites.set(url, updatedSite);
        await this.saveSites();
        return updatedSite;
    }

    // Export/Import functionality
    public async exportData(): Promise<string> {
        await this.db.read();
        return JSON.stringify(this.db.data, null, 2);
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
            return false;
        }
    }
}
