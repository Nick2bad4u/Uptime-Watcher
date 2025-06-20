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
      getSites: () => Promise<Site[]>;
      checkSiteNow: (url: string) => Promise<StatusUpdate>;
      startMonitoring: () => Promise<boolean>;
      stopMonitoring: () => Promise<boolean>;
      updateCheckInterval: (interval: number) => Promise<void>;
      onStatusUpdate: (callback: (data: StatusUpdate) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
