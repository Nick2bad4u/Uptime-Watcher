import { EventEmitter } from "events";
import axios from "axios";
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { app } from "electron";
import { Site, StatusHistory, StatusUpdate } from "./types";
import log from "electron-log/main";

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
            const site: Site = {
                ...siteData,
                lastChecked: siteData.lastChecked ? new Date(siteData.lastChecked) : undefined,
            };
            this.sites.set(site.url, site);
        }

        // Load settings
        this.checkInterval = this.db.data.settings?.checkInterval || 60000;
        this.historyLimit = this.db.data.settings?.historyLimit || 100;
    }

    private async saveSites() {
        const sitesArray = Array.from(this.sites.values());
        this.db.data.sites = sitesArray;
        this.db.data.settings = {
            checkInterval: this.checkInterval,
            historyLimit: this.historyLimit,
        };
        await this.db.write();
    }

    public async addSite(siteData: Omit<Site, "id" | "status" | "history">): Promise<Site> {
        logger.info(`Adding new site: ${siteData.url}`);
        
        const site: Site = {
            id: Date.now().toString(),
            ...siteData,
            status: "pending",
            history: [],
        };

        this.sites.set(site.url, site);
        await this.saveSites();

        // Initial check
        await this.checkSite(site);

        logger.info(`Site added successfully: ${site.url} (${site.name || 'unnamed'})`);
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
        this.historyLimit = Math.max(10, Math.min(1000, limit)); // Clamp between 10 and 1000
        this.saveSites();

        // Trim existing history for all sites to new limit
        for (const site of this.sites.values()) {
            if (site.history.length > this.historyLimit) {
                site.history = site.history.slice(0, this.historyLimit);
            }
        }
        this.saveSites();
    }

    public getHistoryLimit(): number {
        return this.historyLimit;
    }

    public startMonitoring() {
        if (this.isMonitoring) {
            logger.debug('Monitoring already running');
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
            logger.info('Stopping monitoring');
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        } else {
            logger.debug('No monitoring interval to stop');
        }
        this.isMonitoring = false;
    }

    private async checkAllSites() {
        logger.debug(`Checking ${this.sites.size} sites`);
        const promises = Array.from(this.sites.values()).map((site) => this.checkSite(site));
        await Promise.allSettled(promises);
    }

    private async checkSite(site: Site) {
        const startTime = Date.now();
        let newStatus: "up" | "down" = "down";
        let responseTime = 0;

        try {
            await axios.get(site.url, {
                timeout: 10000,
                validateStatus: (status: number) => status < 500, // Consider 4xx as "up"
            });

            responseTime = Date.now() - startTime;
            newStatus = "up";
        } catch (error) {
            responseTime = Date.now() - startTime;
            newStatus = "down";
        }

        const previousStatus = site.status;
        const now = new Date();

        // Update site
        site.status = newStatus;
        site.responseTime = responseTime;
        site.lastChecked = now;

        // Add to history
        const historyEntry: StatusHistory = {
            timestamp: now.getTime(),
            status: newStatus,
            responseTime,
        };

        site.history.unshift(historyEntry); // Add to beginning for newest first
        if (site.history.length > this.historyLimit) {
            site.history = site.history.slice(0, this.historyLimit);
        }

        // Save to database
        this.saveSites();

        // Emit events
        const statusUpdate: StatusUpdate = {
            site: { ...site },
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

    public async checkSiteManually(url: string): Promise<StatusUpdate | null> {
        const site = this.sites.get(url);
        if (!site) {
            throw new Error(`Site with URL ${url} not found`);
        }

        return await this.checkSite(site);
    }

    public async updateSite(url: string, updates: Partial<Site>): Promise<Site> {
        const site = this.sites.get(url);
        if (!site) {
            throw new Error(`Site not found: ${url}`);
        }

        const updatedSite = { ...site, ...updates };
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
        logger.info('Importing data');
        try {
            const parsedData = JSON.parse(data);
            this.db.data = parsedData;
            await this.db.write();
            await this.loadSites();
            logger.info('Data imported successfully');
            return true;
        } catch (error) {
            logger.error("Failed to import data", error);
            return false;
        }
    }
}
