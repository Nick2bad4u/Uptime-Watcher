/**
 * Environment detection utilities for safe, testable environment detection.
 *
 * @remarks
 * These utilities abstract direct process.env access and provide consistent
 * environment detection patterns with proper error handling.
 *
 * @packageDocumentation
 */

/**
 * Typed interface for environment variables we use in the application. This
 * provides type safety for environment variable access.
 */
interface KnownEnvironmentVariables {
    CODECOV_TOKEN?: string;
    NODE_ENV?: "development" | "production" | "test";
}

/**
 * Type-safe environment variable access utility. Avoids index signature issues
 * with process.env.
 *
 * @param key - The environment variable key to access
 *
 * @returns The environment variable value or undefined
 */
export function getEnvVar<K extends keyof KnownEnvironmentVariables>(
    key: K
): KnownEnvironmentVariables[K] | undefined {
    if (typeof process === "undefined") {
        return undefined;
    }

    try {
        // Use bracket notation to access the environment variable safely
        // eslint-disable-next-line n/no-process-env -- Environment utility needs safe process.env access
        const value = process.env[key];
        // Type assertion is safe here as we're returning the union with undefined
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe assertion for environment variable type union
        return value as KnownEnvironmentVariables[K] | undefined;
    } catch {
        // Handle edge cases where process.env might be null or undefined in
        // tests
        return undefined;
    }
}

/**
 * Get the current environment name safely.
 *
 * @remarks
 * Returns 'unknown' as fallback to indicate unspecified environment state. This
 * is intentionally different from getNodeEnv() which assumes 'development' for
 * safety in development workflows. Use this when you need to detect unspecified
 * environments, use getNodeEnv() when you need development defaults.
 *
 * @returns Environment name or 'unknown' if not set
 */
export function getEnvironment(): string {
    const nodeEnv = getEnvVar("NODE_ENV");
    return typeof process === "undefined" ? "unknown" : (nodeEnv ?? "unknown");
}

/**
 * Get the current NODE_ENV value safely. Safe alternative to direct
 * process.env.NODE_ENV access.
 *
 * @remarks
 * Returns 'development' as fallback for safer development workflows and
 * testing. This assumes development mode when environment is unspecified, which
 * is appropriate for development tools and debugging features. Use
 * getEnvironment() if you need to detect truly unspecified environments.
 *
 * @example
 *
 * ```typescript
 * const env = getNodeEnv();
 * logger.debug("Current environment:", env);
 * ```
 *
 * @returns The NODE_ENV value or 'development' as fallback
 */
export function getNodeEnv(): string {
    const nodeEnv = getEnvVar("NODE_ENV");
    return typeof process === "undefined"
        ? "development"
        : (nodeEnv ?? "development");
}

/**
 * Check if running in browser environment.
 *
 * @remarks
 * Detects browser environment by checking for `window` and `document` objects.
 * This covers most browser contexts but may not detect some browser-like
 * environments such as web workers, service workers, or server-side rendering
 * contexts. For more specific environment detection, use additional checks
 * tailored to your use case.
 *
 * @returns True if in browser environment
 */
export function isBrowserEnvironment(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if running in development mode. Safe alternative to direct
 * process.env.NODE_ENV access.
 *
 * @remarks
 * Uses strict equality check against 'development' string. Only recognizes the
 * standard NODE_ENV value 'development' - variants like 'dev' are not
 * supported. This ensures consistent behavior across the application.
 *
 * @example
 *
 * ```typescript
 * if (isDevelopment()) {
 *     console.log("Debug information");
 * }
 * ```
 *
 * @returns True if in development mode
 */
export function isDevelopment(): boolean {
    const nodeEnv = getEnvVar("NODE_ENV");
    return typeof process !== "undefined" && nodeEnv === "development";
}

/**
 * Check if process object is available (Node.js environment). Useful for
 * detecting Node.js vs browser environments.
 *
 * @returns True if in Node.js environment
 */
export function isNodeEnvironment(): boolean {
    return (
        typeof process !== "undefined" &&
        typeof process.versions === "object" &&
        Boolean(process.versions.node)
    );
}

/**
 * Check if running in production mode. Safe alternative to direct
 * process.env.NODE_ENV access.
 *
 * @returns True if in production mode
 */
export function isProduction(): boolean {
    const nodeEnv = getEnvVar("NODE_ENV");
    return typeof process !== "undefined" && nodeEnv === "production";
}

/**
 * Check if running in test mode. Safe alternative to direct
 * process.env.NODE_ENV access.
 *
 * @returns True if in test mode
 */
export function isTest(): boolean {
    const nodeEnv = getEnvVar("NODE_ENV");
    return typeof process !== "undefined" && nodeEnv === "test";
}
