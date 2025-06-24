/* eslint-disable perfectionist/sort-imports */
import { EventEmitter } from "events";
import path from "path";
import axios from "axios";
import { app } from "electron";
import log from "electron-log/main";
import isPortReachable from "is-port-reachable";
import { Database } from "node-sqlite3-wasm";

import { Site, StatusHistory, StatusUpdate, MonitorType } from "./types";

// Default timeout for HTTP requests (10 seconds)
const DEFAULT_REQUEST_TIMEOUT = 10000;

// Configure logger for uptime monitor
const logger = {
    debug: (message: string, ...args: any[]) => log.debug(`[MONITOR] ${message}`, ...args),
    error: (message: string, error?: Error | any, ...args: any[]) => {
        if (error instanceof Error) {
            log.error(`[MONITOR] ${message}`, { message: error.message, stack: error.stack }, ...args);
        } else {
            log.error(`[MONITOR] ${message}`, error, ...args);
        }
    },
    info: (message: string, ...args: any[]) => log.info(`[MONITOR] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => log.warn(`[MONITOR] ${message}`, ...args),
};

const STATUS_UPDATE_EVENT = "status-update";

export class UptimeMonitor extends EventEmitter {
    private db: Database;
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
        let lastError: unknown = null;
        while (attempt < maxRetries) {
            try {
                await this.saveSites();
                return;
            } catch (error) {
                lastError = error;
                logger.error(`saveSites failed (attempt ${attempt + 1}/${maxRetries})`, error);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
            attempt++;
        }
        logger.error("Persistent DB write failure after retries", lastError);
        this.emit("db-error", { error: lastError, operation: "saveSites" });
    }

    // Helper: Retry logic for loading sites (DB read)
    private async loadSitesWithRetry(maxRetries = 5, delayMs = 300): Promise<void> {
        let attempt = 0;
        let lastError: unknown = null;
        while (attempt < maxRetries) {
            try {
                await this.loadSites();
                return;
            } catch (error) {
                lastError = error;
                logger.error(`loadSites failed (attempt ${attempt + 1}/${maxRetries})`, error);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
            attempt++;
        }
        logger.error("Persistent DB read failure after retries", lastError);
        this.emit("db-error", { error: lastError, operation: "loadSites" });
    }

    private async initDatabase() {
        try {
            const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
            logger.info(`[initDatabase] Using SQLite DB at: ${dbPath}`);
            this.db = new Database(dbPath);
            // Create tables if they don't exist
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS sites (
                    identifier TEXT PRIMARY KEY,
                    name TEXT
                );
            `);
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS monitors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_identifier TEXT,
                    type TEXT,
                    url TEXT,
                    host TEXT,
                    port INTEGER,
                    checkInterval INTEGER,
                    monitoring BOOLEAN,
                    status TEXT,
                    responseTime INTEGER,
                    lastChecked DATETIME,
                    FOREIGN KEY(site_identifier) REFERENCES sites(identifier)
                );
            `);
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    monitor_id INTEGER,
                    timestamp INTEGER,
                    status TEXT,
                    responseTime INTEGER,
                    details TEXT, -- New: flexible details column
                    FOREIGN KEY(monitor_id) REFERENCES monitors(id)
                );
            `);
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `);
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS stats (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `);
            await this.db.run(`
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    level TEXT,
                    message TEXT,
                    data TEXT
                );
            `);
            await this.loadSitesWithRetry();
        } catch (error) {
            logger.error("Failed to initialize database", error);
            this.emit("db-error", { error, operation: "initDatabase" });
        }
    }

    private async loadSites() {
        try {
            const siteRows = (await this.db.all("SELECT * FROM sites")) as any[];
            this.sites.clear();
            for (const siteRow of siteRows) {
                // Fetch monitors for this site
                const monitorRows = (await this.db.all("SELECT * FROM monitors WHERE site_identifier = ?", [
                    siteRow.identifier,
                ])) as any[];
                const monitors = [];
                for (const row of monitorRows) {
                    // Fetch history for this monitor
                    const historyRows = (await this.db.all(
                        "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                        [row.id]
                    )) as any[];
                    const history = historyRows.map((h) => ({
                        responseTime: typeof h.responseTime === "number" ? h.responseTime : Number(h.responseTime),
                        status: h.status === "up" || h.status === "down" ? h.status : "down",
                        timestamp: typeof h.timestamp === "number" ? h.timestamp : Number(h.timestamp),
                        details: h.details != null ? String(h.details) : undefined,
                    }));
                    monitors.push({
                        checkInterval:
                            typeof row.checkInterval === "number"
                                ? row.checkInterval
                                : row.checkInterval
                                  ? Number(row.checkInterval)
                                  : undefined,
                        history,
                        host: row.host != undefined ? String(row.host) : undefined,
                        id: row.id != undefined ? String(row.id) : "-1",
                        lastChecked:
                            row.lastChecked &&
                            (typeof row.lastChecked === "string" || typeof row.lastChecked === "number")
                                ? new Date(row.lastChecked)
                                : undefined,
                        monitoring: !!row.monitoring,
                        port: typeof row.port === "number" ? row.port : row.port ? Number(row.port) : undefined,
                        responseTime:
                            typeof row.responseTime === "number"
                                ? row.responseTime
                                : row.responseTime
                                  ? Number(row.responseTime)
                                  : undefined,
                        status: typeof row.status === "string" ? (row.status as "up" | "down" | "pending") : "down",
                        type: typeof row.type === "string" ? (row.type as MonitorType) : "http",
                        url: row.url != undefined ? String(row.url) : undefined,
                    });
                }
                const site: Site = {
                    identifier: String(siteRow.identifier),
                    monitors,
                    name: siteRow.name ? String(siteRow.name) : undefined,
                };
                this.sites.set(site.identifier, site);
            }
            // Load historyLimit from settings table
            const setting = await this.db.get("SELECT value FROM settings WHERE key = 'historyLimit'");
            if (setting && typeof setting.value === "string") {
                this.historyLimit = parseInt(setting.value, 10);
            }
            // Resume monitoring for all monitors that were running before restart
            for (const site of this.sites.values()) {
                for (const monitor of site.monitors) {
                    if (monitor.monitoring) {
                        this.startMonitoringForSite(site.identifier, String(monitor.id));
                    }
                }
            }
        } catch (error) {
            logger.error("Failed to load sites from DB", error);
            this.emit("db-error", { error, operation: "loadSites" });
        }
    }

    public async getSites(): Promise<Site[]> {
        // Always fetch from DB for latest
        const siteRows = (await this.db.all("SELECT * FROM sites")) as any[];
        const sites: Site[] = [];
        for (const siteRow of siteRows) {
            const monitorRows = (await this.db.all("SELECT * FROM monitors WHERE site_identifier = ?", [
                siteRow.identifier,
            ])) as any[];
            const monitors = [];
            for (const row of monitorRows) {
                const historyRows = (await this.db.all(
                    "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                    [row.id]
                )) as any[];
                const history = historyRows.map((h) => ({
                    responseTime: typeof h.responseTime === "number" ? h.responseTime : Number(h.responseTime),
                    status: h.status === "up" || h.status === "down" ? h.status : "down",
                    timestamp: typeof h.timestamp === "number" ? h.timestamp : Number(h.timestamp),
                    details: h.details != null ? String(h.details) : undefined,
                }));
                monitors.push({
                    checkInterval:
                        typeof row.checkInterval === "number"
                            ? row.checkInterval
                            : row.checkInterval
                              ? Number(row.checkInterval)
                              : undefined,
                    history,
                    host: row.host != undefined ? String(row.host) : undefined,
                    id: row.id != undefined ? String(row.id) : "-1",
                    lastChecked:
                        row.lastChecked && (typeof row.lastChecked === "string" || typeof row.lastChecked === "number")
                            ? new Date(row.lastChecked)
                            : undefined,
                    monitoring: !!row.monitoring,
                    port: typeof row.port === "number" ? row.port : row.port ? Number(row.port) : undefined,
                    responseTime:
                        typeof row.responseTime === "number"
                            ? row.responseTime
                            : row.responseTime
                              ? Number(row.responseTime)
                              : undefined,
                    status: typeof row.status === "string" ? (row.status as "up" | "down" | "pending") : "down",
                    type: typeof row.type === "string" ? (row.type as MonitorType) : "http",
                    url: row.url != undefined ? String(row.url) : undefined,
                });
            }
            sites.push({
                identifier: String(siteRow.identifier),
                monitors,
                name: siteRow.name ? String(siteRow.name) : undefined,
            });
        }
        return sites;
    }

    private async saveSites() {
        try {
            for (const site of this.sites.values()) {
                // Upsert site row
                await this.db.run(`INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)`, [
                    site.identifier,
                    site.name ?? null,
                ]);
                // Get current monitors in DB for this site
                const dbMonitors = (await this.db.all(`SELECT id FROM monitors WHERE site_identifier = ?`, [
                    site.identifier,
                ])) as { id: number }[];
                // Find monitors to delete (in DB but not in current site.monitors)
                const toDelete = dbMonitors.filter(
                    (dbm) => !site.monitors.some((m) => String(m.id) === String(dbm.id))
                );
                for (const del of toDelete) {
                    await this.db.run(`DELETE FROM history WHERE monitor_id = ?`, [del.id]);
                    await this.db.run(`DELETE FROM monitors WHERE id = ?`, [del.id]);
                }
                // Upsert all current monitors
                for (const monitor of site.monitors) {
                    if (monitor.id && !isNaN(Number(monitor.id))) {
                        await this.db.run(
                            `UPDATE monitors SET url = ?, host = ?, port = ?, checkInterval = ?, monitoring = ?, status = ?, responseTime = ?, lastChecked = ? WHERE id = ?`,
                            [
                                monitor.url ? String(monitor.url) : null,
                                monitor.host ? String(monitor.host) : null,
                                monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                                monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                    ? Number(monitor.checkInterval)
                                    : null,
                                monitor.monitoring ? 1 : 0,
                                monitor.status,
                                monitor.responseTime !== undefined && monitor.responseTime !== null
                                    ? Number(monitor.responseTime)
                                    : null,
                                monitor.lastChecked ? monitor.lastChecked.toISOString() : null,
                                monitor.id,
                            ]
                        );
                    } else {
                        await this.db.run(
                            `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                site.identifier,
                                monitor.type,
                                monitor.url ? String(monitor.url) : null,
                                monitor.host ? String(monitor.host) : null,
                                monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                                monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                    ? Number(monitor.checkInterval)
                                    : null,
                                monitor.monitoring ? 1 : 0,
                                monitor.status,
                                monitor.responseTime !== undefined && monitor.responseTime !== null
                                    ? Number(monitor.responseTime)
                                    : null,
                                monitor.lastChecked ? monitor.lastChecked.toISOString() : null,
                            ]
                        );
                        // Fetch and assign id
                        const row = await this.db.get(
                            `SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1`,
                            [site.identifier]
                        );
                        if (row && typeof row.id === "number") {
                            monitor.id = String(row.id);
                        }
                    }
                }
            }
            // Save historyLimit to settings
            await this.db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('historyLimit', ?)`, [
                this.historyLimit.toString(),
            ]);
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
        // Persist to DB immediately
        await this.db.run(`INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)`, [
            site.identifier,
            site.name ?? null,
        ]);
        // Remove all monitors for this site, then insert new ones
        await this.db.run(`DELETE FROM monitors WHERE site_identifier = ?`, [site.identifier]);
        for (const monitor of site.monitors) {
            await this.db.run(
                `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    site.identifier,
                    monitor.type,
                    monitor.url ? String(monitor.url) : null,
                    monitor.host ? String(monitor.host) : null,
                    monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                    monitor.checkInterval !== undefined && monitor.checkInterval !== null
                        ? Number(monitor.checkInterval)
                        : null,
                    monitor.monitoring ? 1 : 0,
                    monitor.status,
                    monitor.responseTime !== undefined && monitor.responseTime !== null
                        ? Number(monitor.responseTime)
                        : null,
                    monitor.lastChecked ? monitor.lastChecked.toISOString() : null,
                ]
            );
            // Fetch the id of the last inserted monitor for this site
            const row = await this.db.get(
                `SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1`,
                [site.identifier]
            );
            if (!row || typeof row.id !== "number") {
                logger.error("Failed to fetch monitor id after insert", {
                    monitorType: monitor.type,
                    site: site.identifier,
                });
                throw new Error(`Failed to fetch monitor id after insert for site ${site.identifier}`);
            }
            monitor.id = String(row.id);
        }
        // Initial check for all monitors
        for (const monitor of site.monitors) {
            await this.checkMonitor(site, String(monitor.id));
        }
        logger.info(`Site added successfully: ${site.identifier} (${site.name || "unnamed"})`);
        return site;
    }

    public async removeSite(identifier: string): Promise<boolean> {
        logger.info(`Removing site: ${identifier}`);
        const removed = this.sites.delete(identifier);
        // Remove all monitor history for this site's monitors
        const monitorRows = await this.db.all(`SELECT id FROM monitors WHERE site_identifier = ?`, [identifier]);
        for (const row of monitorRows as { id: number }[]) {
            await this.db.run(`DELETE FROM history WHERE monitor_id = ?`, [row.id]);
        }
        // Remove monitors for this site
        await this.db.run(`DELETE FROM monitors WHERE site_identifier = ?`, [identifier]);
        // Remove the site row
        await this.db.run(`DELETE FROM sites WHERE identifier = ?`, [identifier]);
        if (removed) {
            logger.info(`Site removed successfully: ${identifier}`);
        } else {
            logger.warn(`Site not found for removal: ${identifier}`);
        }
        return removed;
    }

    public async setHistoryLimit(limit: number) {
        if (limit <= 0) {
            this.historyLimit = 0;
        } else {
            this.historyLimit = Math.max(10, limit);
        }
        // Save to settings table
        await this.db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('historyLimit', ?)`, [
            this.historyLimit.toString(),
        ]);
        // Prune history in DB for all monitors if limit > 0
        if (this.historyLimit > 0) {
            const monitorRows = await this.db.all(`SELECT id FROM monitors`);
            for (const row of monitorRows as { id: number }[]) {
                await this.db.run(
                    `DELETE FROM history WHERE monitor_id = ? AND id NOT IN (
                        SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT ?
                    )`,
                    [row.id, row.id, this.historyLimit]
                );
            }
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

    public startMonitoringForSite(identifier: string, monitorId?: string): boolean {
        const site = this.sites.get(identifier);
        if (site) {
            if (monitorId) {
                // Per-monitor-id: start interval for only this monitor
                const intervalKey = `${identifier}|${monitorId}`;
                if (this.siteIntervals.has(intervalKey)) {
                    clearInterval(this.siteIntervals.get(intervalKey)!);
                }
                const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
                if (!monitor) return false;
                // Use monitor-specific checkInterval, fallback to default
                const monitorInterval = monitor.checkInterval || 60000;
                const interval = setInterval(() => {
                    this.checkMonitor(site, monitorId);
                }, monitorInterval);
                this.siteIntervals.set(intervalKey, interval);
                // Set monitoring=true for this monitor and persist
                monitor.monitoring = true;
                this.saveSitesWithRetry();
                // Emit status-update for this monitorId
                const statusUpdate = {
                    previousStatus: undefined,
                    site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
                };
                this.emit("status-update", statusUpdate);
                return true;
            }
            // If no monitorId is provided, start all monitors for this site
            for (const monitor of site.monitors) {
                this.startMonitoringForSite(identifier, String(monitor.id));
            }
            return true;
        }
        return false;
    }

    public stopMonitoringForSite(identifier: string, monitorId?: string): boolean {
        const site = this.sites.get(identifier);
        if (site) {
            if (monitorId) {
                // Per-monitor-id: stop interval for only this monitor
                const intervalKey = `${identifier}|${monitorId}`;
                if (this.siteIntervals.has(intervalKey)) {
                    clearInterval(this.siteIntervals.get(intervalKey)!);
                    this.siteIntervals.delete(intervalKey);
                }
                // Set monitoring=false for this monitor and persist
                const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
                if (monitor) {
                    monitor.monitoring = false;
                    this.saveSitesWithRetry();
                }
                // Emit status-update for this monitorId
                const statusUpdate = {
                    previousStatus: undefined,
                    site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
                };
                this.emit("status-update", statusUpdate);
                return true;
            }
            // If no monitorId is provided, stop all monitors for this site
            for (const monitor of site.monitors) {
                this.stopMonitoringForSite(identifier, String(monitor.id));
            }
            return true;
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
        const startTime = Date.now();
        let newStatus: "up" | "down" = "down";
        let responseTime = 0;
        let details: string | null = null;
        try {
            if (monitor.type === "http") {
                if (!monitor.url) throw new Error("HTTP monitor missing URL");
                const response = await axios.get(monitor.url, {
                    timeout: DEFAULT_REQUEST_TIMEOUT,
                    validateStatus: (status: number) => status < 500,
                });
                responseTime = Date.now() - startTime;
                newStatus = "up";
                details = response.status ? String(response.status) : null;
            } else if (monitor.type === "port") {
                if (!monitor.host || !monitor.port) throw new Error("Port monitor missing host or port");
                const available = await isPortReachable(monitor.port, { host: monitor.host });
                responseTime = Date.now() - startTime;
                newStatus = available ? "up" : "down";
                details = monitor.port ? String(monitor.port) : null;
            }
        } catch (err) {
            responseTime = Date.now() - startTime;
            newStatus = "down";
            logger.error(`[checkMonitor] Error during check: site=${site.identifier}, id=${monitor.id}`, err);
        }
        const previousStatus = monitor.status;
        const now = new Date();
        // Update monitor
        monitor.status = newStatus;
        monitor.responseTime = responseTime;
        monitor.lastChecked = now;
        // Add to history
        const historyEntry: StatusHistory = {
            responseTime,
            status: newStatus,
            timestamp: now.getTime(),
        };
        // Use only the details variable above, do not redeclare
        if (monitor.type === "http") {
            // Try to get HTTP status code from last axios response if possible
            // (axios throws on non-2xx, but we only care about code)
            // For now, store '200' if up, '0' if down
            details = newStatus === "up" ? "200" : "0";
        } else if (monitor.type === "port") {
            details = monitor.port !== undefined ? String(monitor.port) : null;
        }
        try {
            await this.db.run(`INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)`, [
                monitor.id,
                historyEntry.timestamp,
                historyEntry.status,
                historyEntry.responseTime,
                details,
            ]);
            logger.info(
                `[checkMonitor] Inserted history row: monitor_id=${monitor.id}, status=${historyEntry.status}, responseTime=${historyEntry.responseTime}, timestamp=${historyEntry.timestamp}, details=${details}`
            );
        } catch (err) {
            logger.error(`[checkMonitor] Failed to insert history row: monitor_id=${monitor.id}`, err);
        }
        // Trim history if needed
        if (this.historyLimit > 0) {
            const excess = (await this.db.all(
                `SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?`,
                [monitor.id, this.historyLimit]
            )) as { id: number }[];
            const excessIds = excess.map((row) => row.id);
            if (excessIds.length > 0) {
                await this.db.run(`DELETE FROM history WHERE id IN (${excessIds.join(",")})`);
            }
        }
        await this.saveSitesWithRetry();
        // Emit StatusUpdate with new Site shape
        const statusUpdate: StatusUpdate = {
            previousStatus,
            site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
        };
        this.emit("status-update", statusUpdate);
        if (previousStatus === "up" && newStatus === "down") {
            this.emit("site-monitor-down", { monitor, monitorId, site });
        } else if (previousStatus === "down" && newStatus === "up") {
            this.emit("site-monitor-up", { monitor, monitorId, site });
        }
        return statusUpdate;
    }

    public async checkSiteManually(identifier: string, monitorId: string = "http"): Promise<StatusUpdate | null> {
        const site = this.sites.get(identifier);
        if (!site) {
            throw new Error(`Site with identifier ${identifier} not found`);
        }
        const result = await this.checkMonitor(site, monitorId);
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
        // Persist to DB
        await this.db.run(`INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)`, [
            updatedSite.identifier,
            updatedSite.name ?? null,
        ]);
        // --- Monitor upsert logic (robust, normalized) ---
        if (updates.monitors) {
            // 1. Get current monitors in DB for this site
            const dbMonitors = (await this.db.all(`SELECT id FROM monitors WHERE site_identifier = ?`, [
                identifier,
            ])) as { id: number }[];
            // 2. Remove monitors from DB that are not in the new array
            const toDelete = dbMonitors.filter(
                (dbm) => !updates.monitors!.some((m) => String(m.id) === String(dbm.id))
            );
            for (const del of toDelete) {
                await this.db.run(`DELETE FROM history WHERE monitor_id = ?`, [del.id]);
                await this.db.run(`DELETE FROM monitors WHERE id = ?`, [del.id]);
            }
            // 3. Upsert all current monitors
            for (const monitor of updates.monitors) {
                // If monitor.id is a string that parses to a number, treat as existing
                const numericId = monitor.id && !isNaN(Number(monitor.id)) ? Number(monitor.id) : undefined;
                if (numericId) {
                    // Update existing monitor
                    await this.db.run(
                        `UPDATE monitors SET type = ?, url = ?, host = ?, port = ?, checkInterval = ?, monitoring = ?, status = ?, responseTime = ?, lastChecked = ? WHERE id = ?`,
                        [
                            monitor.type,
                            monitor.url ? String(monitor.url) : null,
                            monitor.host ? String(monitor.host) : null,
                            monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                            monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                ? Number(monitor.checkInterval)
                                : null,
                            monitor.monitoring ? 1 : 0,
                            monitor.status,
                            monitor.responseTime !== undefined && monitor.responseTime !== null
                                ? Number(monitor.responseTime)
                                : null,
                            monitor.lastChecked
                                ? monitor.lastChecked instanceof Date
                                    ? monitor.lastChecked.toISOString()
                                    : monitor.lastChecked
                                : null,
                            numericId,
                        ]
                    );
                } else {
                    // Insert new monitor
                    await this.db.run(
                        `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            identifier,
                            monitor.type,
                            monitor.url ? String(monitor.url) : null,
                            monitor.host ? String(monitor.host) : null,
                            monitor.port !== undefined && monitor.port !== null ? Number(monitor.port) : null,
                            monitor.checkInterval !== undefined && monitor.checkInterval !== null
                                ? Number(monitor.checkInterval)
                                : null,
                            monitor.monitoring ? 1 : 0,
                            monitor.status,
                            monitor.responseTime !== undefined && monitor.responseTime !== null
                                ? Number(monitor.responseTime)
                                : null,
                            monitor.lastChecked
                                ? monitor.lastChecked instanceof Date
                                    ? monitor.lastChecked.toISOString()
                                    : monitor.lastChecked
                                : null,
                        ]
                    );
                    // Fetch and assign id
                    const row = await this.db.get(
                        `SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1`,
                        [identifier]
                    );
                    if (row && typeof row.id === "number") {
                        monitor.id = String(row.id);
                    }
                }
            }
        }
        // If monitors were updated, check for interval changes and restart timers as needed
        if (updates.monitors) {
            for (const updatedMonitor of updates.monitors) {
                const prevMonitor = site.monitors.find((m) => String(m.id) === String(updatedMonitor.id));
                if (!prevMonitor) continue;
                // If checkInterval changed, restart timer for this monitor
                if (
                    typeof updatedMonitor.checkInterval === "number" &&
                    updatedMonitor.checkInterval !== prevMonitor.checkInterval
                ) {
                    this.stopMonitoringForSite(identifier, String(updatedMonitor.id));
                    this.startMonitoringForSite(identifier, String(updatedMonitor.id));
                }
            }
        }
        return updatedSite;
    }

    // Export/Import functionality
    public async exportData(): Promise<string> {
        try {
            // Export all sites and settings as JSON
            const sites = await this.db.all("SELECT * FROM sites");
            const settings = await this.db.all("SELECT * FROM settings");
            const exportObj = {
                settings: settings.reduce(
                    (acc, row) => {
                        if (typeof row.key === "string") {
                            acc[row.key] = String(row.value);
                        }
                        return acc;
                    },
                    {} as Record<string, string>
                ),
                sites: sites.map((row) => ({
                    identifier: row.identifier ? String(row.identifier) : "",
                    monitors: row.monitors_json ? JSON.parse(row.monitors_json as string) : [],
                    name: row.name ? String(row.name) : undefined,
                })),
            };
            return JSON.stringify(exportObj, null, 2);
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
            // Clear existing tables
            await this.db.run("DELETE FROM sites");
            await this.db.run("DELETE FROM settings");
            await this.db.run("DELETE FROM monitors");
            await this.db.run("DELETE FROM history");
            // Insert sites
            if (Array.isArray(parsedData.sites)) {
                for (const site of parsedData.sites) {
                    await this.db.run(`INSERT INTO sites (identifier, name) VALUES (?, ?)`, [
                        site.identifier,
                        site.name ?? null,
                    ]);
                }
            }
            // Insert settings
            if (parsedData.settings && typeof parsedData.settings === "object") {
                for (const [key, value] of Object.entries(parsedData.settings)) {
                    await this.db.run(`INSERT INTO settings (key, value) VALUES (?, ?)`, [key, String(value)]);
                }
            }
            // Insert monitors and their history
            for (const site of parsedData.sites) {
                if (Array.isArray(site.monitors)) {
                    for (const monitor of site.monitors) {
                        // Insert monitor, get id
                        await this.db.run(
                            `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                site.identifier,
                                monitor.type,
                                monitor.url ?? null,
                                monitor.host ?? null,
                                monitor.port ?? null,
                                monitor.checkInterval ?? null,
                                monitor.monitoring ? 1 : 0,
                                monitor.status,
                                monitor.responseTime,
                                monitor.lastChecked
                                    ? typeof monitor.lastChecked === "string"
                                        ? monitor.lastChecked
                                        : monitor.lastChecked.toISOString()
                                    : null,
                            ]
                        );
                        // Always fetch and assign string id
                        const monitorRow = await this.db.get(
                            `SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1`,
                            [site.identifier]
                        );
                        const monitorId = monitorRow?.id ? String(monitorRow.id) : undefined;
                        monitor.id = monitorId;
                        // Insert history
                        if (Array.isArray(monitor.history) && monitorId) {
                            for (const h of monitor.history) {
                                await this.db.run(
                                    `INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)`,
                                    [
                                        monitorId,
                                        h.timestamp,
                                        h.status === "up" || h.status === "down" ? h.status : "down",
                                        h.responseTime,
                                        h.details ?? null,
                                    ]
                                );
                            }
                        }
                    }
                }
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
}
