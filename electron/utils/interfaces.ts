/**
 * Shared interfaces for utilities.
 * Contains common interface definitions used across multiple utility files.
 */

/**
 * Standardized logging interface used throughout utilities.
 *
 * @remarks
 * Provides consistent logging patterns and error reporting across all utility modules.
 * All logging methods accept a message string followed by optional additional arguments
 * for structured logging and context information.
 */
export interface Logger {
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
     * @param message - The error message to log
     * @param error - Optional error object or additional context
     * @param args - Additional arguments for context
     *
     * @remarks
     * When an Error object is provided, the logger should extract and format
     * the error message and stack trace appropriately for debugging.
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
