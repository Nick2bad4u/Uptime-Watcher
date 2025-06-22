export type MonitorType = "http" | "port";

export interface Monitor {
    type: MonitorType;
    status: "up" | "down" | "pending";
    responseTime?: number;
    lastChecked?: Date;
    history: StatusHistory[];
    monitoring?: boolean; // Per-monitor monitoring state
}

export interface Site {
    id: string;
    name?: string;
    url: string;
    monitors: Monitor[];
    monitoring?: boolean; // Per-site monitoring state
    checkInterval: number; // Per-site monitoring interval (ms)
    // Legacy fields for migration only:
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
