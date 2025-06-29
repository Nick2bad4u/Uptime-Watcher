/**
 * Type definitions for the Uptime Watcher application.
 * Contains interfaces and types for sites, monitors, status updates, and Electron API.
 */

/** Application update status types */
export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

/** Supported monitor types for different kinds of checks */
export type MonitorType = "http" | "port";

/**
 * Monitor interface representing a single monitoring endpoint.
 * Can be HTTP URL monitoring or port connectivity monitoring.
 */
export interface Monitor {
    /** Unique identifier for this monitor (UUID or similar) */
    id: string;
    /** Type of monitoring to perform */
    type: MonitorType;
    /** Current status of the monitor */
    status: "up" | "down" | "pending";
    /** Optional URL for HTTP monitors. For other types (e.g., port, IP), this is undefined. */
    url?: string;
    /** Hostname or IP for port monitors. */
    host?: string;
    /** Port number for port monitors. */
    port?: number;
    /** Last recorded response time in milliseconds */
    responseTime?: number;
    /** Timestamp of last check */
    lastChecked?: Date;
    /** Historical status data */
    history: StatusHistory[];
    /** Per-monitor-type monitoring state */
    monitoring?: boolean;
    /** Per-monitor check interval (ms) */
    checkInterval?: number;
}

/**
 * Site interface representing a monitored site with one or more monitors.
 * Modern structure supporting multiple monitoring endpoints per site.
 */
export interface Site {
    /** Unique identifier for the site (UUID, used as the key everywhere) */
    identifier: string;
    /** Human-readable name for the site */
    name?: string;
    /** Array of monitors for this site */
    monitors: Monitor[];
    /** Per-site monitoring state */
    monitoring?: boolean;
}

/**
 * Historical status record for tracking uptime/downtime over time.
 */
export interface StatusHistory {
    /** Unix timestamp of when this status was recorded */
    timestamp: number;
    /** Status at this point in time */
    status: "up" | "down";
    /** Response time in milliseconds */
    responseTime: number;
}

/**
 * Status update payload sent from backend to frontend.
 * Contains the updated site data and optional previous status for comparison.
 */
export interface StatusUpdate {
    /** Updated site data */
    site: Site;
    /** Previous status for change detection */
    previousStatus?: "up" | "down" | "pending";
}

/**
 * Electron API interface exposed to the renderer process.
 * Provides secure communication between frontend and backend.
 */
declare global {
    interface Window {
        electronAPI: {
            // Domain-specific APIs
            data: {
                exportData: () => Promise<string>;
                importData: (data: string) => Promise<boolean>;
                downloadSQLiteBackup: () => Promise<{ buffer: ArrayBuffer; fileName: string }>;
            };

            events: {
                onStatusUpdate: (callback: (update: StatusUpdate) => void) => void;
                removeAllListeners: (event: string) => void;
            };
            
            monitoring: {
                startMonitoring: () => Promise<void>;
                stopMonitoring: () => Promise<void>;
                startMonitoringForSite: (siteId: string, monitorId: string) => Promise<void>;
                stopMonitoringForSite: (siteId: string, monitorId: string) => Promise<void>;
            };

            settings: {
                getHistoryLimit: () => Promise<number>;
                updateHistoryLimit: (limit: number) => Promise<void>;
            };

            sites: {
                getSites: () => Promise<Site[]>;
                addSite: (site: Omit<Site, "id">) => Promise<Site>;
                removeSite: (id: string) => Promise<void>;
                updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
                checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
            };

            system: {
                quitAndInstall: () => void;
            };
        };
    }
}
