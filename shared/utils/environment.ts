/**
 * Environment detection utilities.
 * Provides safe, testable environment detection across the application.
 *
 * These utilities abstract direct process.env access and provide consistent
 * environment detection patterns with proper error handling.
 */

/**
 * Get the current environment name safely.
 *
 * @returns Environment name or 'unknown' if not set
 *
 * @remarks
 * Returns 'unknown' as fallback to indicate unspecified environment state.
 * This is intentionally different from getNodeEnv() which assumes 'development'
 * for safety in development workflows. Use this when you need to detect
 * unspecified environments, use getNodeEnv() when you need development defaults.
 */
export function getEnvironment(): string {
    // eslint-disable-next-line n/no-process-env -- Environment utility needs process.env access
    return typeof process === "undefined" ? "unknown" : (process.env.NODE_ENV ?? "unknown");
}

/**
 * Get the current NODE_ENV value safely.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns The NODE_ENV value or 'development' as fallback
 *
 * @remarks
 * Returns 'development' as fallback for safer development workflows and testing.
 * This assumes development mode when environment is unspecified, which is
 * appropriate for development tools and debugging features. Use getEnvironment()
 * if you need to detect truly unspecified environments.
 *
 * @example
 * ```typescript
 * const env = getNodeEnv();
 * logger.debug("Current environment:", env);
 * ```
 */
export function getNodeEnv(): string {
    // eslint-disable-next-line n/no-process-env -- Environment utility needs process.env access
    return typeof process === "undefined" ? "development" : (process.env.NODE_ENV ?? "development");
}

/**
 * Check if running in browser environment.
 *
 * @returns True if in browser environment
 *
 * @remarks
 * Detects browser environment by checking for `window` and `document` objects.
 * This covers most browser contexts but may not detect some browser-like
 * environments such as web workers, service workers, or server-side rendering
 * contexts. For more specific environment detection, use additional checks
 * tailored to your use case.
 */
export function isBrowserEnvironment(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if running in development mode.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns True if in development mode
 *
 * @remarks
 * Uses strict equality check against 'development' string. Only recognizes
 * the standard NODE_ENV value 'development' - variants like 'dev' are not
 * supported. This ensures consistent behavior across the application.
 *
 * @example
 * ```typescript
 * if (isDevelopment()) {
 *     console.log("Debug information");
 * }
 * ```
 */
export function isDevelopment(): boolean {
    // eslint-disable-next-line n/no-process-env -- Environment utility needs process.env access
    return typeof process !== "undefined" && process.env.NODE_ENV === "development";
}

/**
 * Check if process object is available (Node.js environment).
 * Useful for detecting Node.js vs browser environments.
 *
 * @returns True if in Node.js environment
 */
export function isNodeEnvironment(): boolean {
    return typeof process !== "undefined" && typeof process.versions === "object" && Boolean(process.versions.node);
}

/**
 * Check if running in production mode.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns True if in production mode
 */
export function isProduction(): boolean {
    // eslint-disable-next-line n/no-process-env -- Environment utility needs process.env access
    return typeof process !== "undefined" && process.env.NODE_ENV === "production";
}

/**
 * Check if running in test mode.
 * Safe alternative to direct process.env.NODE_ENV access.
 *
 * @returns True if in test mode
 */
export function isTest(): boolean {
    // eslint-disable-next-line n/no-process-env -- Environment utility needs process.env access
    return typeof process !== "undefined" && process.env.NODE_ENV === "test";
}
