export interface Site {
    id: string;
    name?: string;
    url: string;
    status: "up" | "down" | "pending";
    responseTime?: number;
    lastChecked?: Date;
    history: StatusHistory[];
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
            addSite: (site: Omit<Site, "id" | "status" | "history">) => Promise<Site>;
            removeSite: (url: string) => Promise<boolean>;
            updateSite: (url: string, updates: Partial<Site>) => Promise<Site>;
            getSites: () => Promise<Site[]>;
            checkSiteNow: (url: string) => Promise<StatusUpdate>;
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
        };
    }
}
