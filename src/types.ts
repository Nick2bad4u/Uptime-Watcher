export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

export type MonitorType = "http" | "port";

export interface Monitor {
    id: string; // Unique identifier for this monitor (UUID or similar)
    type: MonitorType;
    status: "up" | "down" | "pending";
    /**
     * Optional URL for HTTP monitors. For other types (e.g., port, IP), this is undefined.
     */
    url?: string;
    /**
     * Hostname or IP for port monitors.
     */
    host?: string;
    /**
     * Port number for port monitors.
     */
    port?: number;
    responseTime?: number;
    lastChecked?: Date;
    history: StatusHistory[];
    monitoring?: boolean; // Per-monitor-type monitoring state
    checkInterval?: number; // Per-monitor check interval (ms)
}

export interface Site {
    /**
     * Unique identifier for the site (UUID, used as the key everywhere)
     */
    identifier: string;
    name?: string;
    monitors: Monitor[];
    monitoring?: boolean; // Per-site monitoring state
    // Removed checkInterval: number; // Per-site monitoring interval (ms)
    // Legacy fields for migration only:
    // url?: string;
    // monitorType?: MonitorType;
    // status?: "up" | "down" | "pending";
    // responseTime?: number;
    // lastChecked?: Date;
    // history?: StatusHistory[];
}

export interface StatusHistory {
    timestamp: number;
    status: "up" | "down";
    responseTime: number;
}

export interface StatusUpdate {
    site: Site;
    previousStatus?: "up" | "down" | "pending";
}

// Electron API types
declare global {
    interface Window {
        electronAPI: {
            getSites: () => Promise<Site[]>;
            getHistoryLimit: () => Promise<number>;
            updateHistoryLimit: (limit: number) => Promise<void>;
            addSite: (site: Omit<Site, "id">) => Promise<Site>;
            removeSite: (id: string) => Promise<void>;
            updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
            checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
            startMonitoringForSite: (siteId: string, monitorId: string) => Promise<void>;
            stopMonitoringForSite: (siteId: string, monitorId: string) => Promise<void>;
            exportData: () => Promise<string>;
            importData: (data: string) => Promise<boolean>;
            downloadSQLiteBackup: () => Promise<{ buffer: ArrayBuffer; fileName: string }>;
            onStatusUpdate: (callback: (update: StatusUpdate) => void) => void;
            removeAllListeners: (event: string) => void;
            quitAndInstall: () => void;
        };
    }
}
