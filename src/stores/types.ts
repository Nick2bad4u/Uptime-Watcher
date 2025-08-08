/**
 * Shared types and interfaces for all stores in the application.
 *
 * @remarks
 * Core domain types are imported from shared/types.ts for consistency.
 * Store-specific types and UI-specific types are defined here.
 *
 * @packageDocumentation
 */

import type { ThemeName } from "../theme/types";

/**
 * Application settings interface.
 * Manages user preferences and application configuration.
 */
export interface AppSettings {
    /** Auto-start monitoring when the application launches */
    autoStart: boolean;
    /** Maximum number of history records to keep per monitor */
    historyLimit: number;
    /** Minimize to system tray instead of closing the application */
    minimizeToTray: boolean;
    /** Enable desktop notifications for status changes */
    notifications: boolean;
    /** Enable sound alerts for status changes */
    soundAlerts: boolean;
    /** Current theme name (light, dark, etc.) */
    theme: ThemeName;
}

/**
 * Base store interface providing common error handling and loading state functionality.
 *
 * @remarks
 * Standard error handling and loading state pattern used across all stores.
 * All store interfaces should extend this for consistent error handling.
 */
export interface BaseStore {
    /** Clear the current error message */
    clearError: () => void;
    /** Whether an async operation is currently in progress */
    isLoading: boolean;
    /** The last error message, if any */
    lastError: string | undefined;
    /** Set an error message in the store */
    setError: (error: string | undefined) => void;
    /** Set the loading state */
    setLoading: (loading: boolean) => void;
}

/**
 * Chart time range options for data visualization.
 */
export type ChartTimeRange = "1h" | "7d" | "24h" | "30d";

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
    [K in keyof T]: T[K] extends (...arguments_: unknown[]) => unknown
        ? T[K]
        : never;
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
    [K in keyof T]: T[K] extends (...arguments_: unknown[]) => unknown
        ? never
        : T[K];
};

/**
 * Application update status enumeration.
 *
 * @remarks
 * Represents the various states of the application update process,
 * from initial idle state through checking, downloading, and completion.
 * Used by the updates store to track update progress and display
 * appropriate UI states to the user.
 */
export type UpdateStatus =
    | "available"
    | "checking"
    | "downloaded"
    | "downloading"
    | "error"
    | "idle";

/**
 * Re-exported core types from shared module for convenience.
 *
 * @remarks
 * These types are re-exported from the shared/types module to provide a single
 * import location for commonly used domain types across the frontend application.
 * This improves developer experience by reducing the need for multiple import
 * statements and provides consistency in type usage across components.
 *
 * The re-exported types include:
 * - Monitor: Individual monitoring configuration interface
 * - MonitorType: Enumeration of supported monitor types
 * - Site: Complete site configuration with monitors
 * - StatusUpdate: Real-time status update interface
 *
 * @example
 * ```typescript
 * import { Site, Monitor, StatusUpdate } from '@/stores/types';
 * // Instead of multiple imports from @shared/types
 * ```
 */
export type { Monitor, MonitorType, Site, StatusUpdate } from "@shared/types";
