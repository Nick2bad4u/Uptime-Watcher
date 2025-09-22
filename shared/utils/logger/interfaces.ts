/**
 * Unified logger interfaces for consistent logging across frontend and backend.
 *
 * @remarks
 * Provides standardized logging interfaces that can be implemented by both
 * frontend and backend logging systems. The interfaces are designed to be
 * extensible while maintaining compatibility with existing code.
 *
 * @packageDocumentation
 */

import type { UnknownRecord } from "type-fest";

/**
 * Base logger interface with core logging methods.
 *
 * @remarks
 * Defines the minimum contract for all logger implementations across the
 * application. All logging methods accept a message string followed by optional
 * additional arguments for structured logging and context information.
 *
 * @public
 */
export interface BaseLogger {
    /**
     * Log debug information for development and troubleshooting.
     *
     * @param message - The debug message to log
     * @param args - Additional arguments for context
     */
    debug: (message: string, ...args: unknown[]) => void;

    /**
     * Log error messages with optional error objects.
     *
     * @remarks
     * When an Error object is provided, the logger should extract and format
     * the error message and stack trace appropriately for debugging.
     *
     * @param message - The error message to log
     * @param error - Optional error object or additional context
     * @param args - Additional arguments for context
     */
    error: (message: string, error?: unknown, ...args: unknown[]) => void;

    /**
     * Log general informational messages.
     *
     * @param message - The information message to log
     * @param args - Additional arguments for context
     */
    info: (message: string, ...args: unknown[]) => void;

    /**
     * Log warning messages for potential issues.
     *
     * @param message - The warning message to log
     * @param args - Additional arguments for context
     */
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Extended logger interface with additional logging levels.
 *
 * @remarks
 * Extends BaseLogger with additional logging levels commonly used in
 * development environments. Maintains backward compatibility with BaseLogger.
 *
 * @public
 */
export interface ExtendedLogger extends BaseLogger {
    /**
     * Log verbose debugging information with extreme detail.
     *
     * @param message - The silly level message to log
     * @param args - Additional arguments for context
     */
    silly: (message: string, ...args: unknown[]) => void;

    /**
     * Log detailed debugging information.
     *
     * @param message - The verbose level message to log
     * @param args - Additional arguments for context
     */
    verbose: (message: string, ...args: unknown[]) => void;
}

/**
 * Specialized logger interface for application lifecycle events.
 *
 * @public
 */
export interface AppLogger {
    /**
     * Log application errors with context.
     *
     * @param context - The context where the error occurred
     * @param error - The error object
     */
    error: (context: string, error: Error) => void;

    /**
     * Log performance metrics.
     *
     * @param operation - The operation name
     * @param duration - Duration in milliseconds
     */
    performance: (operation: string, duration: number) => void;

    /**
     * Log application startup.
     */
    started: () => void;

    /**
     * Log application shutdown.
     */
    stopped: () => void;
}

/**
 * Specialized logger interface for site monitoring events.
 *
 * @public
 */
export interface SiteLogger {
    /**
     * Log when a site is added to monitoring.
     *
     * @param identifier - The site identifier
     */
    added: (identifier: string) => void;

    /**
     * Log a site monitoring check result.
     *
     * @param identifier - The site identifier
     * @param status - The check status
     * @param responseTime - Optional response time in milliseconds
     */
    check: (identifier: string, status: string, responseTime?: number) => void;

    /**
     * Log site monitoring errors.
     *
     * @param identifier - The site identifier
     * @param error - The error (Error object or string)
     */
    error: (identifier: string, error: Error | string) => void;

    /**
     * Log when a site is removed from monitoring.
     *
     * @param identifier - The site identifier
     */
    removed: (identifier: string) => void;

    /**
     * Log site status changes.
     *
     * @param identifier - The site identifier
     * @param oldStatus - The previous status
     * @param newStatus - The new status
     */
    statusChange: (
        identifier: string,
        oldStatus: string,
        newStatus: string
    ) => void;
}

/**
 * Specialized logger interface for system events.
 *
 * @public
 */
export interface SystemLogger {
    /**
     * Log system notifications.
     *
     * @param title - The notification title
     * @param body - The notification body
     */
    notification: (title: string, body: string) => void;

    /**
     * Log system tray actions.
     *
     * @param action - The tray action
     */
    tray: (action: string) => void;

    /**
     * Log window management actions.
     *
     * @param action - The window action
     * @param windowName - Optional window name
     */
    window: (action: string, windowName?: string) => void;
}

/**
 * Specialized logger interface for user interactions.
 *
 * @public
 */
export interface UserLogger {
    /**
     * Log user actions.
     *
     * @param action - The user action
     * @param details - Optional additional details
     */
    action: (action: string, details?: unknown) => void;

    /**
     * Log user settings changes.
     *
     * @param setting - The setting name
     * @param oldValue - The previous value
     * @param newValue - The new value
     */
    settingsChange: (
        setting: string,
        oldValue: unknown,
        newValue: unknown
    ) => void;
}

/**
 * Complete logger interface with all specialized logging capabilities.
 *
 * @remarks
 * Combines all logger interfaces into a comprehensive logging solution. This
 * interface supports both basic logging and specialized domain-specific logging
 * methods.
 *
 * @public
 */
export interface UnifiedLogger extends ExtendedLogger {
    /** Application lifecycle logging */
    app: AppLogger;

    /** Site monitoring logging */
    site: SiteLogger;

    /** System event logging */
    system: SystemLogger;

    /** User interaction logging */
    user: UserLogger;
}

/**
 * Logger interface for template-based logging with interpolation support.
 *
 * @public
 */
export interface TemplateLogger {
    /**
     * Log debug message with template interpolation.
     *
     * @param message - The message template
     * @param context - Optional context for interpolation
     */
    debug: (message: string, context?: UnknownRecord) => void;

    /**
     * Log error message with template interpolation.
     *
     * @param message - The message template
     * @param context - Optional context for interpolation
     */
    error: (message: string, context?: UnknownRecord) => void;

    /**
     * Log info message with template interpolation.
     *
     * @param message - The message template
     * @param context - Optional context for interpolation
     */
    info: (message: string, context?: UnknownRecord) => void;

    /**
     * Log warning message with template interpolation.
     *
     * @param message - The message template
     * @param context - Optional context for interpolation
     */
    warn: (message: string, context?: UnknownRecord) => void;
}

/**
 * Type alias for backward compatibility with existing backend code.
 *
 * @public
 */
export type Logger = BaseLogger;

/**
 * Type alias for the complete logger interface.
 *
 * @public
 */
export type FullLogger = UnifiedLogger;
