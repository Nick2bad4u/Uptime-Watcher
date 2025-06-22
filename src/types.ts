export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

export type MonitorType = "http" | "port";

export interface Monitor {
    type: MonitorType;
    status: "up" | "down" | "pending";
    responseTime?: number;
    lastChecked?: Date;
    history: StatusHistory[];
}

export interface Site {
    id: string;
    name?: string;
    url: string;
    monitors: Monitor[];
    // Legacy fields for migration:
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
            removeSite: (url: string) => Promise<boolean>;
            updateSite: (url: string, updates: Partial<Site>) => Promise<Site>;
            getSites: () => Promise<Site[]>;
            checkSiteNow: (url: string, monitorType: MonitorType) => Promise<StatusUpdate>;
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
        };
    }
}
