/**
 * Core shared types used across stores to break circular dependencies.
 */

import type { ThemeName } from "../../theme/types";

/**
 * Generic store state interface.
 */
export interface StoreState {
    loading: boolean;
    error?: string;
}

/**
 * Store action result interface.
 */
export interface StoreActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Application settings interface.
 * Manages user preferences and application configuration.
 */
export interface AppSettings {
    /** Enable desktop notifications for status changes */
    notifications: boolean;
    /** Auto-start monitoring when the application launches */
    autoStart: boolean;
    /** Minimize to system tray instead of closing the application */
    minimizeToTray: boolean;
    /** Current theme name (light, dark, etc.) */
    theme: ThemeName;
    /** Enable sound alerts for status changes */
    soundAlerts: boolean;
    /** Maximum number of history records to keep per monitor */
    historyLimit: number;
}
