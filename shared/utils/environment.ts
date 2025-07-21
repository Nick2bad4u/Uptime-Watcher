/**
 * Environment detection utilities.
 * Provides safe, testable environment detection across the application.
 *
 * These utilities abstract direct process.env access and provide consistent
 * environment detection patterns with proper error handling.
 */

/**
 * Check if running in development mode.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns True if in development mode
 *
 * @example
 * ```typescript
 * if (isDevelopment()) {
 *     console.log("Debug information");
 * }
 * ```
 */
export function isDevelopment(): boolean {
    return typeof process !== "undefined" && process.env?.NODE_ENV === "development";
}

/**
 * Check if running in production mode.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns True if in production mode
 */
export function isProduction(): boolean {
    return typeof process !== "undefined" && process.env?.NODE_ENV === "production";
}

/**
 * Check if running in test mode.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns True if in test mode
 */
export function isTest(): boolean {
    return typeof process !== "undefined" && process.env?.NODE_ENV === "test";
}

/**
 * Get the current environment name safely.
 *
 * @returns Environment name or 'unknown' if not set
 */
export function getEnvironment(): string {
    return typeof process !== "undefined" ? (process.env?.NODE_ENV ?? "unknown") : "unknown";
}

/**
 * Check if process object is available (Node.js environment).
 * Useful for detecting Node.js vs browser environments.
 *
 * @returns True if in Node.js environment
 */
export function isNodeEnvironment(): boolean {
    return typeof process !== "undefined" && process.versions?.node !== undefined;
}

/**
 * Check if running in browser environment.
 *
 * @returns True if in browser environment
 */
export function isBrowserEnvironment(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Get the current NODE_ENV value safely.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns The NODE_ENV value or 'development' as fallback
 *
 * @example
 * ```typescript
 * const env = getNodeEnv();
 * logger.debug("Current environment:", env);
 * ```
 */
export function getNodeEnv(): string {
    return (typeof process !== "undefined" && process.env?.NODE_ENV) || "development";
}
