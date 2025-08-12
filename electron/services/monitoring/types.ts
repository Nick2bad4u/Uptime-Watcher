/**
 * Type definitions for monitoring services and operations.
 *
 * @remarks
 * Defines interfaces and types used by monitor services to perform health checks
 * and manage monitoring configurations across different monitor types.
 *
 * **Configuration Defaults:**
 * Default values referenced in this file are implemented in:
 * - `electron/constants.ts` - Global monitoring constants
 * - `HttpMonitor.ts` - HTTP-specific defaults
 * - `PortMonitor.ts` - Port monitoring defaults
 *
 * **Type Safety:**
 * All interfaces use TypeScript strict mode and require explicit handling
 * of optional properties. No `any` types are used to ensure compile-time safety.
 *
 * **Extension Guidelines:**
 * When adding new monitor types:
 * 1. Extend MonitorConfig with type-specific options if needed
 * 2. Ensure MonitorCheckResult covers new result formats
 * 3. Update documentation with new examples
 * 4. Add default value constants to appropriate files
 *
 * @packageDocumentation
 */

/**
 * Site type containing monitor configurations and metadata.
 *
 * @remarks
 * Imported from shared types. Represents a monitored site with its
 * associated monitors, configuration, and status information.
 *
 * Key properties used in monitoring:
 * - monitors: Array of monitor configurations
 * - identifier: Unique site identifier for tracking
 * - metadata: Additional site information
 *
 * @see {@link Site} in shared/types for complete interface definition
 */
import type { Site } from "../../../shared/types";

/**
 * Interface for monitor services that perform health checks.
 *
 * @remarks
 * All monitor implementations must implement this interface to provide
 * consistent behavior across different monitoring types (HTTP, port, etc.).
 *
 * @public
 */
export interface IMonitorService {
    /**
     * Perform a health check on a monitor.
     *
     * @param monitor - The monitor configuration to check
     * @returns Promise resolving to the check result
     *
     * @throws {@link Error} When monitor configuration is invalid or check fails catastrophically
     *
     * @remarks
     * Implementations should handle timeouts, retries, and error conditions gracefully.
     * Failed checks should return a result with `status: "down"` rather than throwing,
     * unless the monitor configuration itself is invalid.
     */
    check: (monitor: Site["monitors"][0]) => Promise<MonitorCheckResult>;

    /**
     * Get the type of monitor this service handles.
     *
     * @returns The monitor type this service is responsible for
     *
     * @remarks
     * Used by the monitor factory to route checks to the appropriate service.
     * Must match one of the values in the monitor's `type` field.
     */
    getType: () => Site["monitors"][0]["type"];

    /**
     * Update the configuration for this monitor service.
     *
     * @param config - Partial configuration to update
     *
     * @remarks
     * Allows runtime configuration updates without recreating the service instance.
     * Only the provided configuration properties will be updated.
     */
    updateConfig: (config: Partial<MonitorConfig>) => void;
}

/**
 * Result of a monitor check operation.
 *
 * @remarks
 * Contains the outcome of a single health check attempt, including status,
 * performance metrics, and optional diagnostic information.
 *
 * @public
 */
export interface MonitorCheckResult {
    /**
     * Optional human-readable details about the check result.
     *
     * @remarks
     * May include status codes, response headers, or other diagnostic information
     * useful for troubleshooting or display purposes.
     * Examples: "HTTP 200 OK", "Connection timeout", "DNS resolution failed"
     */
    details?: string;

    /**
     * Optional error message if the check failed.
     *
     * @remarks
     * Provides technical error information for debugging failed checks.
     * Should not be displayed directly to end users.
     * Examples: "ECONNREFUSED", "Socket timeout", "Certificate expired"
     */
    error?: string;

    /**
     * Response time in milliseconds.
     *
     * @remarks
     * For successful checks, this represents the actual response time.
     * For failed checks, this may represent timeout value or time until failure.
     */
    responseTime: number;

    /**
     * Status outcome of the check.
     *
     * @remarks
     * - `"up"`: Monitor endpoint is healthy and responding normally
     * - `"down"`: Monitor endpoint is failing, unreachable, or returned an error
     */
    status: "down" | "up";
}

/**
 * Configuration for monitor check behavior.
 *
 * @remarks
 * Global configuration that applies to all monitors of a given type,
 * unless overridden by individual monitor settings.
 *
 * @public
 */
export interface MonitorConfig {
    /**
     * Request timeout in milliseconds.
     *
     * @defaultValue 10000 (10 seconds)
     *
     * @remarks
     * Maximum time to wait for a response before considering the check failed.
     * Individual monitors can override this with their own timeout settings.
     */
    timeout?: number;

    /**
     * User agent string for HTTP requests.
     *
     * @defaultValue "Uptime-Watcher/1.0"
     *
     * @remarks
     * Identifies the monitoring application in HTTP request headers.
     * Some servers may use this for logging or access control.
     */
    userAgent?: string;
}
