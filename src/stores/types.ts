/**
 * Shared types and interfaces for all stores in the app.
 *
 * @remarks
 * Core domain types are imported from shared/types.ts for consistency.
 * Store-specific types and UI-specific types are defined here.
 *
 * @packageDocumentation
 */

import type { UpdateStatus as SharedUpdateStatus } from "@shared/types/events";

import type { ThemeName } from "../theme/types";

/**
 * Application settings interface. Manages user preferences and app
 * configuration.
 */
export interface AppSettings {
    /** Auto-start monitoring when the app launches */
    autoStart: boolean;
    /** Maximum number of history records to keep per monitor */
    historyLimit: number;
    /** Enable in-app status alerts rendered inside the UI shell */
    inAppAlertsEnabled: boolean;
    /** Play an audible chime when in-app alerts are shown */
    inAppAlertsSoundEnabled: boolean;
    /** Volume multiplier for in-app alert tones, clamped between 0 and 1 */
    inAppAlertVolume: number;
    /** Minimize to system tray instead of closing the app */
    minimizeToTray: boolean;
    /** Identifiers of sites for which system notifications are muted */
    mutedSiteNotificationIdentifiers: string[];
    /** Enable operating-system notifications for status changes */
    systemNotificationsEnabled: boolean;
    /** Allow operating-system notifications to play sounds when supported */
    systemNotificationsSoundEnabled: boolean;
    /** Current theme name (light, dark, etc.) */
    theme: ThemeName;
}

// NOTE: This project intentionally does not expose a store-owned error/loading
// base interface (like `lastError` / `isLoading`) for domain stores.
//
// Domain stores should report errors/loading through `useErrorStore` via
// `createStoreErrorHandler`.

/**
 * Chart time range options for data visualization.
 */
export type ChartTimeRange =
    | "1h"
    | "7d"
    | "24h"
    | "30d";

/**
 * Application update status enumeration.
 *
 * @remarks
 * Represents the various states of the app update process, from initial idle
 * state through checking, downloading, and completion. Used by the updates
 * store to track update progress and display appropriate UI states to the
 * user.
 */
export type UpdateStatus = SharedUpdateStatus;

/**
 * Re-exported core types from shared module for convenience.
 *
 * @remarks
 * These types are re-exported from the shared/types module to provide a single
 * import location for commonly used domain types across the frontend app. This
 * improves developer experience by reducing the need for multiple import
 * statements and provides consistency in type usage across components.
 *
 * The re-exported types include:
 *
 * - Monitor: Individual monitoring configuration interface
 * - MonitorType: Enumeration of supported monitor types
 * - Site: Complete site configuration with monitors
 * - StatusUpdate: Real-time status update interface
 *
 * @example
 *
 * ```typescript
 * ```typescript
 * import \{ Site, Monitor, StatusUpdate \} from '\@shared/types';
 * // Instead of importing from stores/types
 * ```
 */
