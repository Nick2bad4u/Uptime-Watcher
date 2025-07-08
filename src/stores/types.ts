/**
 * Shared types for all stores in the application.
 * Contains common interfaces and types used across multiple stores.
 */

import { ThemeName } from "../theme";

/** Application update status types */
export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

/** Chart time range options */
export type ChartTimeRange = "1h" | "24h" | "7d" | "30d";

/** Error messages */
export const ERROR_MESSAGES = {
    FAILED_TO_ADD_MONITOR: "Failed to add monitor",
    FAILED_TO_ADD_SITE: "Failed to add site",
    FAILED_TO_CHECK_SITE: "Failed to check site",
    FAILED_TO_DELETE_SITE: "Failed to delete site",
    FAILED_TO_UPDATE_INTERVAL: "Failed to update check interval",
    FAILED_TO_UPDATE_SITE: "Failed to update site",
    SITE_NOT_FOUND: "Site not found",
} as const;

/**
 * Application settings interface.
 * Contains user preferences and configuration options.
 */
export interface AppSettings {
    /** Enable desktop notifications */
    notifications: boolean;
    /** Auto-start monitoring on app launch */
    autoStart: boolean;
    /** Minimize to system tray instead of closing */
    minimizeToTray: boolean;
    /** Current theme name */
    theme: ThemeName;
    /** Enable sound alerts for status changes */
    soundAlerts: boolean;
    /** Maximum number of history records to keep */
    historyLimit: number;
}

/**
 * Base store interface for error handling
 */
export interface BaseStore {
    lastError: string | undefined;
    isLoading: boolean;
    setError: (error: string | undefined) => void;
    setLoading: (loading: boolean) => void;
    clearError: () => void;
}

/**
 * Store composition utility type
 */
export type StoreActions<T> = {
    [K in keyof T]: T[K] extends (...arguments_: unknown[]) => unknown ? T[K] : never;
};

/**
 * Store state utility type
 */
export type StoreState<T> = {
    [K in keyof T]: T[K] extends (...arguments_: unknown[]) => unknown ? never : T[K];
};

// Re-export types from the main types file for convenience

export { type Site, type Monitor, type StatusUpdate, type MonitorType } from "../types";
