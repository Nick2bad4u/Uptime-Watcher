/**
 * Core shared types used across stores to break circular dependencies.
 */

import type { ThemeName } from "../../theme/types";

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
 * Store action result interface.
 */
export interface StoreActionResult<T = unknown> {
    data?: T;
    error?: string;
    success: boolean;
}

/**
 * Generic store state interface.
 */
export interface StoreState {
    error?: string;
    loading: boolean;
}
