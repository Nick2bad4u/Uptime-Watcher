/**
 * Type definitions for the Uptime Watcher application frontend.
 *
 * @remarks
 * Data structures for sites, monitors, status updates, and Electron API communication.
 *
 * @packageDocumentation
 */

// Re-export core types from electron to avoid duplication
export type { Monitor, MonitorType, Site, StatusHistory, StatusUpdate } from "../electron/types";

// Re-export status types from shared types for consistency
export type { MonitorStatus, SiteStatus } from "../shared/types";
export { isComputedSiteStatus, isMonitorStatus, isSiteStatus } from "../shared/types";

// Re-export ERROR_MESSAGES from stores for convenience
export { ERROR_MESSAGES } from "./stores/types";

// Import types for use in global declarations below
import type { Site, StatusUpdate } from "../electron/types";

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
                /** Download SQLite database backup as binary data */
                downloadSQLiteBackup: () => Promise<{ buffer: ArrayBuffer; fileName: string }>;
                /** Export all application data as JSON string */
                exportData: () => Promise<string>;
                /** Import application data from JSON string */
                importData: (data: string) => Promise<boolean>;
            };

            /**
             * Event management for real-time updates and communication.
             */
            events: {
                /** Register callback for monitor down events */
                onMonitorDown: (callback: (data: unknown) => void) => () => void;
                /** Register callback for monitoring started events */
                onMonitoringStarted: (callback: (data: { monitorId: string; siteId: string }) => void) => () => void;
                /** Register callback for monitoring stopped events */
                onMonitoringStopped: (callback: (data: { monitorId: string; siteId: string }) => void) => () => void;
                /** Register callback for monitor status changes */
                onMonitorStatusChanged: (callback: (update: StatusUpdate) => void) => () => void;
                /** Register callback for monitor up events */
                onMonitorUp: (callback: (data: unknown) => void) => () => void;
                /** Register callback for test events (development/debugging) */
                onTestEvent: (callback: (data: unknown) => void) => () => void;
                /** Register callback for application update status events */
                onUpdateStatus: (callback: (data: unknown) => void) => () => void;
                /** Remove all listeners for a specific event */
                removeAllListeners: (event: string) => void;
            };

            /**
             * Monitoring control operations for starting and stopping checks.
             */
            monitoring: {
                /** Start monitoring for all configured sites */
                startMonitoring: () => Promise<void>;
                /** Start monitoring for a specific site or monitor */
                startMonitoringForSite: (siteId: string, monitorId?: string) => Promise<void>;
                /** Stop monitoring for all sites */
                stopMonitoring: () => Promise<void>;
                /** Stop monitoring for a specific site or monitor */
                stopMonitoringForSite: (siteId: string, monitorId?: string) => Promise<void>;
            };

            /**
             * Monitor type registry and configuration operations.
             */
            monitorTypes: {
                /** Format monitor detail using backend registry */
                formatMonitorDetail: (type: string, details: string) => Promise<string>;
                /** Format monitor title suffix using backend registry */
                formatMonitorTitleSuffix: (type: string, monitor: Record<string, unknown>) => Promise<string>;
                /** Get all available monitor type configurations */
                getMonitorTypes: () => Promise<
                    {
                        description: string;
                        displayName: string;
                        fields: {
                            helpText?: string;
                            label: string;
                            max?: number;
                            min?: number;
                            name: string;
                            placeholder?: string;
                            required: boolean;
                            type: "number" | "text" | "url";
                        }[];
                        type: string;
                        version: string;
                    }[]
                >;
                /** Validate monitor data using backend registry */
                validateMonitorData: (
                    type: string,
                    data: unknown
                ) => Promise<{
                    errors: string[];
                    success: boolean;
                }>;
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
                /** Add a new site with its monitors */
                addSite: (site: Site) => Promise<Site>;
                /** Perform immediate manual check for a specific monitor */
                checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
                /** Retrieve all configured sites with their monitors */
                getSites: () => Promise<Site[]>;
                /** Remove a specific monitor from a site */
                removeMonitor: (siteIdentifier: string, monitorId: string) => Promise<void>;
                /** Remove a site and all its monitors */
                removeSite: (id: string) => Promise<void>;
                /** Update site configuration */
                updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
            };

            /**
             * State synchronization operations for real-time updates.
             */
            stateSync: {
                /** Get current synchronization status */
                getSyncStatus: () => Promise<{
                    lastSync: null | number;
                    siteCount: number;
                    success: boolean;
                    synchronized: boolean;
                }>;
                /** Register listener for state synchronization events */
                onStateSyncEvent: (
                    callback: (event: {
                        action: "bulk-sync" | "delete" | "update";
                        siteIdentifier?: string;
                        sites?: Site[];
                        source?: "cache" | "database" | "frontend";
                        timestamp?: number;
                    }) => void
                ) => () => void;
                /** Manually request full state synchronization */
                requestFullSync: () => Promise<{ siteCount: number; success: boolean }>;
            };

            /**
             * System-level operations and utilities.
             */
            system: {
                /** Open URL in external browser */
                openExternal: (url: string) => void;
                /** Quit application and install pending update */
                quitAndInstall: () => void;
            };
        };
    }
}
