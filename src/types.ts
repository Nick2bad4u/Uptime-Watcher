export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

export type MonitorType = "http" | "port";

export interface Monitor {
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
    /**
     * Optional legacy id (for migration only)
     */
    id?: string;
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
            // Now expects Site shape with monitors: Monitor[]
            addSite: (site: Omit<Site, "id">) => Promise<Site>;
            removeSite: (identifier: string) => Promise<boolean>;
            updateSite: (identifier: string, updates: Partial<Site>) => Promise<Site>;
            getSites: () => Promise<Site[]>;
            checkSiteNow: (identifier: string, monitorType: MonitorType) => Promise<StatusUpdate>;
            exportData: () => Promise<string>;
            importData: (data: string) => Promise<boolean>;
            startMonitoring: () => Promise<boolean>;
            stopMonitoring: () => Promise<boolean>;
            updateCheckInterval: (interval: number) => Promise<void>;
            getCheckInterval: () => Promise<number>;
            updateHistoryLimit: (limit: number) => Promise<void>;
            getHistoryLimit: () => Promise<number>;
            onStatusUpdate: (callback: (data: StatusUpdate) => void) => void;
            removeAllListeners: (channel: string) => void;
            quitAndInstall?: () => void;
            startMonitoringForSite: (identifier: string, monitorType?: MonitorType) => Promise<boolean>;
            stopMonitoringForSite: (identifier: string, monitorType?: MonitorType) => Promise<boolean>;
        };
    }
}
