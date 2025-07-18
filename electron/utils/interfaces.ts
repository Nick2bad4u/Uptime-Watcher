/**
 * Shared interfaces for utilities.
 * Contains common interface definitions used across multiple utility files.
 */

/**
 * Standardized logging interface used throughout utilities.
 * Provides consistent logging patterns and error reporting.
 */
export interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}
