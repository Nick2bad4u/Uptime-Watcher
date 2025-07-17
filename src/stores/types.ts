/**
 * Shared types and interfaces for all stores in the application.
 *
 * @remarks
 * Common types, interfaces, and constants used across multiple stores.
 * Provides centralized location for shared functionality and consistency.
 *
 * @packageDocumentation
 */

/**
 * Application update status enumeration.
 *
 * @remarks
 * Represents the various states of the application update process,
 * from initial idle state through checking, downloading, and completion.
 * Used by the updates store to track update progress and display
 * appropriate UI states to the user.
 */
export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

/**
 * Chart time range options for data visualization.
 */
export type ChartTimeRange = "1h" | "24h" | "7d" | "30d";

/**
 * Standardized error messages used across the application.
 * @readonly
 */
export const ERROR_MESSAGES = {
    FAILED_TO_ADD_MONITOR: "Failed to add monitor",
    FAILED_TO_ADD_SITE: "Failed to add site",
    FAILED_TO_CHECK_SITE: "Failed to check site",
    FAILED_TO_DELETE_SITE: "Failed to delete site",
    FAILED_TO_UPDATE_INTERVAL: "Failed to update check interval",
    FAILED_TO_UPDATE_SITE: "Failed to update site",
    SITE_NOT_FOUND: "Site not found",
} as const;

// Re-export from shared types to maintain compatibility
export type { AppSettings } from "./shared/types";

/**
 * Base store interface providing common error handling and loading state functionality.
 *
 * @remarks
 * Standard error handling and loading state pattern used across all stores.
 * All store interfaces should extend this for consistent error handling.
 */
export interface BaseStore {
    /** The last error message, if any */
    lastError: string | undefined;
    /** Whether an async operation is currently in progress */
    isLoading: boolean;
    /** Set an error message in the store */
    setError: (error: string | undefined) => void;
    /** Set the loading state */
    setLoading: (loading: boolean) => void;
    /** Clear the current error message */
    clearError: () => void;
}

/**
 * Store composition utility type for extracting action methods from store interfaces.
 *
 * @remarks
 * This utility type extracts only the function properties (actions) from a store
 * interface, filtering out state properties. It's useful for creating action-only
 * interfaces or for dependency injection patterns where only actions are needed.
 *
 * @example
 * ```typescript
 * interface MyStore {
 *   data: string[];
 *   isLoading: boolean;
 *   fetchData: () => Promise<void>;
 *   clearData: () => void;
 * }
 *
 * type MyStoreActions = StoreActions<MyStore>;
 * // Result: { fetchData: () => Promise<void>; clearData: () => void; }
 * ```
 */
export type StoreActions<T> = {
    [K in keyof T]: T[K] extends (...arguments_: unknown[]) => unknown ? T[K] : never;
};

/**
 * Store state utility type for extracting state properties from store interfaces.
 *
 * @remarks
 * This utility type extracts only the non-function properties (state) from a store
 * interface, filtering out action methods. It's useful for creating state-only
 * interfaces or for serialization purposes where only data needs to be preserved.
 *
 * @example
 * ```typescript
 * interface MyStore {
 *   data: string[];
 *   isLoading: boolean;
 *   fetchData: () => Promise<void>;
 *   clearData: () => void;
 * }
 *
 * type MyStoreState = StoreState<MyStore>;
 * // Result: { data: string[]; isLoading: boolean; }
 * ```
 */
export type StoreState<T> = {
    [K in keyof T]: T[K] extends (...arguments_: unknown[]) => unknown ? never : T[K];
};

/**
 * Re-exported types from the main types file for convenience.
 *
 * @remarks
 * These re-exports provide convenient access to core application types without
 * needing to import from multiple files. This helps maintain a clean import
 * structure and reduces the number of import statements needed in store files.
 */
export { type Site, type Monitor, type StatusUpdate, type MonitorType } from "../types";
