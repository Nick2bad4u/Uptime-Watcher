import { EventEmitter } from "events";
import axios from "axios";
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { app } from "electron";
import { Site, StatusHistory, StatusUpdate } from "./types";

interface DatabaseSchema {
  sites: Site[];
  settings: {
    checkInterval: number;
  };
}

export class UptimeMonitor extends EventEmitter {
  private db: any;
  private sites: Map<string, Site> = new Map();
  private checkInterval: number = 60000; // 1 minute default
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
        lastChecked: siteData.lastChecked
          ? new Date(siteData.lastChecked)
          : undefined,
        history: siteData.history || [],
      };

      this.sites.set(site.url, site);
    }
  }
  addSite(siteData: Omit<Site, "id" | "status" | "history">): Site {
    const site: Site = {
      id: Date.now().toString(),
      ...siteData,
      status: "pending",
      history: [],
    };

    // Save to database
    this.sites.set(site.url, site);
    this.saveSites();

    return site;
  }

  removeSite(url: string): boolean {
    const site = this.sites.get(url);
    if (!site) return false;

    this.sites.delete(url);
    this.saveSites();

    return true;
  }

  private async saveSites() {
    await this.db.read();
    this.db.data.sites = Array.from(this.sites.values());
    await this.db.write();
  }

  getSites(): Site[] {
    return Array.from(this.sites.values());
  }

  setCheckInterval(interval: number) {
    this.checkInterval = interval;
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkAllSites();
    }, this.checkInterval);

    // Initial check
    this.checkAllSites();
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async checkAllSites() {
    const promises = Array.from(this.sites.values()).map((site) =>
      this.checkSite(site),
    );

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
    site.lastChecked = now; // Add to history
    const historyEntry: StatusHistory = {
      timestamp: now.getTime(),
      status: newStatus,
      responseTime,
    };

    site.history.unshift(historyEntry);
    if (site.history.length > 100) {
      site.history = site.history.slice(0, 100);
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
      this.emit("site-restored", site);
    }
  }
}
