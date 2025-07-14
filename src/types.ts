/**
 * Type definitions for the Uptime Watcher application frontend.
 *
 * @remarks
 * Data structures for sites, monitors, status updates, and Electron API communication.
 *
 * @packageDocumentation
 */

/**
 * Application update status types for the auto-updater.
 */
export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

// Re-export MonitorType from electron types to avoid duplication
export type { MonitorType } from "../electron/types";
import type { MonitorType } from "../electron/types";

/**
 * Monitor interface representing a single monitoring endpoint.
 *
 * @remarks
 * Represents a single monitoring endpoint that can check either HTTP/HTTPS URLs
 * or TCP port connectivity. Each monitor maintains its current status, performance
 * metrics, and historical data.
 *
 * For HTTP monitors, the `url` property is required and `host`/`port` are undefined.
 * For port monitors, the `host` and `port` properties are required and `url` is undefined.
 *
 * @example
 * ```typescript
 * // HTTP monitor example
 * const httpMonitor: Monitor = {
 *   id: "mon_123",
 *   type: "http",
 *   status: "up",
 *   url: "https://example.com",
 *   responseTime: 250,
 *   monitoring: true,
 *   checkInterval: 300000,
 *   timeout: 10000,
 *   retryAttempts: 3,
 *   history: []
 * };
 *
 * // Port monitor example
 * const portMonitor: Monitor = {
 *   id: "mon_456",
 *   type: "port",
 *   status: "down",
 *   host: "example.com",
 *   port: 80,
 *   responseTime: -1,
 *   monitoring: true,
 *   checkInterval: 300000,
 *   timeout: 10000,
 *   retryAttempts: 3,
 *   history: []
 * };
 * ```
 */
export interface Monitor {
    /** Unique identifier for this monitor (UUID or database-generated ID) */
    id: string;
    /** Type of monitoring to perform */
    type: MonitorType;
    /** Current operational status of the monitor */
    status: "up" | "down" | "pending" | "paused";
    /** URL endpoint for HTTP monitors (required for type "http", undefined for others) */
    url?: string;
    /** Hostname or IP address for port monitors (required for type "port", undefined for others) */
    host?: string;
    /** Port number for port monitors (required for type "port", undefined for others) */
    port?: number;
    /** Last recorded response time in milliseconds (-1 if check failed or not yet checked) */
    responseTime: number;
    /** Timestamp of the most recent check attempt (undefined if never checked) */
    lastChecked?: Date;
    /** Array of historical check results ordered chronologically */
    history: StatusHistory[];
    /** Whether this monitor is actively being checked */
    monitoring: boolean;
    /** Check interval in milliseconds for this specific monitor */
    checkInterval: number;
    /** Request timeout in milliseconds for this monitor */
    timeout: number;
    /** Number of retry attempts before marking as down for this monitor */
    retryAttempts: number;
}

/**
 * Site interface representing a monitored service with one or more monitors.
 *
 * @remarks
 * A site represents a logical grouping of monitors for a single service or website.
 * Each site can have multiple monitors checking different aspects (HTTP endpoints,
 * port connectivity, etc.) and maintains its own monitoring state.
 *
 * @example
 * ```typescript
 * const exampleSite: Site = {
 *   identifier: "site_abc123",
 *   name: "My Website",
 *   monitoring: true,
 *   monitors: [
 *     {
 *       id: "mon_1",
 *       type: "http",
 *       url: "https://example.com",
 *       status: "up",
 *       // ... other monitor properties
 *     },
 *     {
 *       id: "mon_2",
 *       type: "port",
 *       host: "example.com",
 *       port: 443,
 *       status: "up",
 *       // ... other monitor properties
 *     }
 *   ]
 * };
 * ```
 */
export interface Site {
    /** Unique identifier for the site (UUID, used as the primary key) */
    identifier: string;
    /** Human-readable display name for the site */
    name: string;
    /** Array of monitors associated with this site */
    monitors: Monitor[];
    /** Whether monitoring is active for this site (affects all monitors) */
    monitoring: boolean;
}

/**
 * Historical status record for tracking uptime/downtime over time.
 *
 * @remarks
 * Records the result of a single monitor check for historical analysis.
 * Used to build uptime charts, calculate availability percentages, and
 * track performance trends over time.
 *
 * Note: Does not include "pending" status as historical records only
 * capture actual check outcomes, not transitional states.
 */
export interface StatusHistory {
    /** Unix timestamp (in milliseconds) when this status was recorded */
    timestamp: number;
    /** Status result at this point in time */
    status: "up" | "down" | "paused";
    /** Response time in milliseconds (-1 if check failed) */
    responseTime: number;
    /** Optional diagnostic details about the check (error messages, HTTP status codes, etc.) */
    details?: string;
}

/**
 * Status update payload sent from backend to frontend via IPC.
 *
 * @remarks
 * Contains the updated site data and optional previous status for comparison.
 * Used to notify the frontend when monitor status changes occur, enabling
 * real-time UI updates and status change notifications.
 */
export interface StatusUpdate {
    /** Updated site data with current monitor statuses */
    site: Site;
    /** Previous status for change detection and transition logic */
    previousStatus?: "up" | "down" | "pending" | "paused";
}

/**
 * Electron API interface exposed to the renderer process.
 *
 * @remarks
 * Provides secure communication between the React frontend and Electron main process
 * through the contextBridge. All backend operations are accessed through this API
 * which is available as `window.electronAPI` in the renderer process.
 *
 * The API is organized by functional domains for better maintainability and type safety:
 * - `data`: Import/export and backup operations
 * - `events`: Event listening and management
 * - `monitoring`: Monitor control operations
 * - `settings`: Application configuration
 * - `sites`: Site and monitor CRUD operations
 * - `system`: System-level operations
 */
declare global {
    interface Window {
        electronAPI: {
            /**
             * Data management operations for import, export, and backup.
             */
            data: {
                /** Export all application data as JSON string */
                exportData: () => Promise<string>;
                /** Import application data from JSON string */
                importData: (data: string) => Promise<boolean>;
                /** Download SQLite database backup as binary data */
                downloadSQLiteBackup: () => Promise<{ buffer: ArrayBuffer; fileName: string }>;
            };

            /**
             * Event management for real-time updates and communication.
             */
            events: {
                /** Register callback for monitor status updates */
                onStatusUpdate: (callback: (update: StatusUpdate) => void) => void;
                /** Register callback for monitoring started events */
                onMonitoringStarted: (callback: (data: { siteId: string; monitorId: string }) => void) => void;
                /** Register callback for monitoring stopped events */
                onMonitoringStopped: (callback: (data: { siteId: string; monitorId: string }) => void) => void;
                /** Register callback for test events (development/debugging) */
                onTestEvent: (callback: (data: unknown) => void) => void;
                /** Remove all listeners for a specific event */
                removeAllListeners: (event: string) => void;
            };

            /**
             * Monitoring control operations for starting and stopping checks.
             */
            monitoring: {
                /** Start monitoring for all configured sites */
                startMonitoring: () => Promise<void>;
                /** Stop monitoring for all sites */
                stopMonitoring: () => Promise<void>;
                /** Start monitoring for a specific site or monitor */
                startMonitoringForSite: (siteId: string, monitorId?: string) => Promise<void>;
                /** Stop monitoring for a specific site or monitor */
                stopMonitoringForSite: (siteId: string, monitorId?: string) => Promise<void>;
            };

            /**
             * Application settings and configuration management.
             */
            settings: {
                /** Get current history retention limit */
                getHistoryLimit: () => Promise<number>;
                /** Update history retention limit */
                updateHistoryLimit: (limit: number) => Promise<void>;
            };

            /**
             * Site and monitor CRUD operations.
             */
            sites: {
                /** Retrieve all configured sites with their monitors */
                getSites: () => Promise<Site[]>;
                /** Add a new site with its monitors */
                addSite: (site: Site) => Promise<Site>;
                /** Remove a site and all its monitors */
                removeSite: (id: string) => Promise<void>;
                /** Update site configuration */
                updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
                /** Perform immediate manual check for a specific monitor */
                checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
                /** Remove a specific monitor from a site */
                removeMonitor: (siteIdentifier: string, monitorId: string) => Promise<void>;
            };

            /**
             * Monitor type registry and configuration operations.
             */
            monitorTypes: {
                /** Get all available monitor type configurations */
                getMonitorTypes: () => Promise<
                    {
                        type: string;
                        displayName: string;
                        description: string;
                        version: string;
                        fields: {
                            name: string;
                            label: string;
                            type: "text" | "number" | "url";
                            required: boolean;
                            placeholder?: string;
                            helpText?: string;
                            min?: number;
                            max?: number;
                        }[];
                    }[]
                >;
                /** Validate monitor data using backend registry */
                validateMonitorData: (
                    type: string,
                    data: unknown
                ) => Promise<{
                    success: boolean;
                    errors: string[];
                }>;
            };

            /**
             * System-level operations and utilities.
             */
            system: {
                /** Quit application and install pending update */
                quitAndInstall: () => void;
                /** Open URL in external browser */
                openExternal: (url: string) => void;
            };
        };
    }
}
