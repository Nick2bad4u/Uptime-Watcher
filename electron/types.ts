export type MonitorType = "http" | "port";

export interface Monitor {
    type: MonitorType;
    status: "up" | "down" | "pending";
    responseTime?: number;
    lastChecked?: Date;
    history: StatusHistory[];
    monitoring?: boolean; // Per-monitor monitoring state
    url?: string; // Optional, for HTTP monitors only
    /**
     * Hostname or IP for port monitors.
     */
    host?: string;
    /**
     * Port number for port monitors.
     */
    port?: number;
    checkInterval?: number; // Optional, per-monitor interval (ms)
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
