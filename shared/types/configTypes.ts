/**
 * Configuration value type definitions for the Uptime Watcher application.
 *
 * @remarks
 * These types provide better type safety for configuration values stored in the
 * database and used throughout the application. All values are stored as
 * strings in the database but represent different underlying types.
 *
 * @packageDocumentation
 */

import type { Simplify, UnknownRecord } from "type-fest";
import type { MonitorConfig } from "./monitorConfig";
import type { MonitorTypeConfig } from "./monitorTypes";
import type { BaseValidationResult } from "./validation";

/**
 * Error information for caching.
 *
 * @public
 */
export interface ErrorInfo {
    /** Error code */
    code?: string;
    /** Additional error context */
    context?: UnknownRecord;
    /** Error message */
    message: string;
    /** Error timestamp */
    timestamp: number;
}

/**
 * Specific configuration value types for known settings.
 *
 * @remarks
 * Provides more specific typing for commonly used configuration keys.
 *
 * @public
 */
export interface KnownConfigValues {
    /** Array of enabled features */
    enabledFeatures: string[];
    /** Maximum number of history entries to keep */
    historyLimit: number;
    /** UI language code */
    language: string;
    /** Enable/disable notifications */
    notificationsEnabled: boolean;
    /** Auto-refresh interval in milliseconds */
    refreshInterval: number;
    /** Application theme (dark/light/high-contrast) */
    theme: "dark" | "light" | "high-contrast";
}

/**
 * Monitor check result information.
 *
 * @public
 */
export interface MonitorCheckResult {
    /** Error message if check failed */
    error?: string;
    /** Response time in milliseconds */
    responseTime: number;
    /** Check status */
    status: MonitorStatus;
    /** Check timestamp */
    timestamp: number;
}

/**
 * Monitor data that can be cached.
 *
 * @public
 */
export interface MonitorData {
    /** Monitor configuration */
    config?: MonitorConfig;
    /** Last check result */
    lastResult?: MonitorCheckResult;
    /** Status information */
    status?: MonitorStatus;
}

/**
 * UI state that can be cached.
 *
 * @public
 */
export interface UIState {
    /** UI component state */
    componentState?: UnknownRecord;
    /** User preferences */
    preferences?: Record<string, ConfigValue>;
    /** View state */
    viewState?: UnknownRecord;
}

/**
 * Cache value types for different cache domains.
 *
 * @remarks
 * Provides better typing for cached values based on their usage domain.
 * Includes support for MonitorTypeConfig and arrays of monitor configurations.
 * All unknown types have been replaced with specific type unions for type
 * safety. Simplified for better IntelliSense and readability.
 *
 * @public
 */
export type CacheValue = Simplify<
    | BaseValidationResult
    | ConfigValue
    | ErrorInfo
    | MonitorData
    | MonitorTypeConfig
    | MonitorTypeConfigArray
    | UIState
    | ValidationResultArray
>;

/**
 * Union type representing all possible configuration values.
 *
 * @remarks
 * Configuration values are stored as strings in the database but can represent:
 *
 * - Strings: theme names, language codes, etc.
 * - Numbers: history limits, timeouts, etc. (stored as string representations)
 * - Booleans: feature flags, etc. (stored as "true"/"false")
 * - Arrays: stored as JSON strings
 *
 * @public
 */
export type ConfigValue = boolean | null | number | string | string[];

/**
 * Monitor status information with support for specific status values.
 *
 * @public
 */
export type MonitorStatus = "down" | "paused" | "pending" | "up";

/**
 * Array of MonitorTypeConfig objects for caching.
 *
 * @public
 */
export type MonitorTypeConfigArray = MonitorTypeConfig[];

/**
 * Array of validation results for caching.
 *
 * @public
 */
export type ValidationResultArray = BaseValidationResult[];
