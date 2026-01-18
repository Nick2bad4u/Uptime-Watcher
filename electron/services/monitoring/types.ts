/**
 * Type definitions for monitoring services and operations.
 *
 * @remarks
 * Defines interfaces and types used by monitor services to perform health
 * checks and manage monitoring configurations across different monitor types.
 *
 * **Configuration Defaults:** Default values referenced in this file are
 * implemented in:
 *
 * - `electron/constants.ts` - Global monitoring constants
 * - `HttpMonitor.ts` - HTTP-specific defaults
 * - `PortMonitor.ts` - Port monitoring defaults
 *
 * **Type Safety:** All interfaces use TypeScript strict mode and require
 * explicit handling of optional properties. No `any` types are used to ensure
 * compile-time safety.
 *
 * **Extension Guidelines:** When adding new monitor types:
 *
 * 1. Extend MonitorServiceConfig with type-specific options if needed
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
 * Imported from shared types. Represents a monitored site with its associated
 * monitors, configuration, and status information.
 *
 * Key properties used in monitoring:
 *
 * - Monitors: Array of monitor configurations
 * - Identifier: Unique site identifier for tracking
 * - Metadata: Additional site information
 *
 * @see {@link Site} in shared/types for complete interface definition
 */
import type { Monitor, MonitorType, Site } from "@shared/types";
import type { Simplify, UnknownRecord } from "type-fest";

/**
 * Interface for monitor services that perform health checks.
 *
 * @remarks
 * All monitor implementations must implement this interface to provide
 * consistent behavior across different monitoring types (HTTP, port, etc.).
 * Supports AbortSignal for operation cancellation.
 *
 * @public
 */
export interface IMonitorService {
    /**
     * Perform a health check on a monitor.
     *
     * @remarks
     * Implementations should handle timeouts, retries, and error conditions
     * gracefully. Failed checks should return a result with `status: "down"`
     * rather than throwing, unless the monitor configuration itself is invalid.
     * Supports optional AbortSignal for operation cancellation.
     *
     * @param monitor - The monitor configuration to check
     * @param signal - Optional AbortSignal for operation cancellation
     *
     * @returns Promise resolving to the check result
     *
     * @throws {@link Error} When monitor configuration is invalid or check
     *   fails catastrophically
     */
    check: (
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ) => Promise<MonitorCheckResult>;

    /**
     * Get the type of monitor this service handles.
     *
     * @remarks
     * Used by the monitor factory to route checks to the appropriate service.
     * Must match one of the values in the monitor's `type` field.
     *
     * @returns The monitor type this service is responsible for
     */
    getType: () => Site["monitors"][0]["type"];

    /**
     * Update the configuration for this monitor service.
     *
     * @remarks
     * Allows runtime configuration updates without recreating the service
     * instance. Only the provided configuration properties will be updated.
     *
     * @param config - Partial configuration to update
     */
    updateConfig: (config: Partial<MonitorServiceConfig>) => void;
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
     * May include status codes, response headers, or other diagnostic
     * information useful for troubleshooting or display purposes. Examples:
     * "HTTP 200 OK", "Connection timeout", "DNS resolution failed"
     */
    details?: string;

    /**
     * Optional error message if the check failed.
     *
     * @remarks
     * Provides technical error information for debugging failed checks. Should
     * not be displayed directly to end users. Examples: "ECONNREFUSED", "Socket
     * timeout", "Certificate expired"
     */
    error?: string;

    /**
     * Response time in milliseconds.
     *
     * @remarks
     * For successful checks, this represents the actual response time. For
     * failed checks, this may represent timeout value or time until failure.
     */
    responseTime: number;

    /**
     * Status outcome of the check.
     *
     * @remarks
     * - `"up"`: Monitor endpoint is healthy and responding normally
     * - `"degraded"`: Monitor endpoint shows partial functionality (e.g., DNS
     *   resolves but ports unreachable, HTTP responds with non-2xx status)
     * - `"down"`: Monitor endpoint is failing, unreachable, or returned an error
     */
    status: "degraded" | "down" | "up";
}

/**
 * Partial monitor configuration accepted by registry helpers and migrations.
 *
 * @remarks
 * Represents monitor data prior to persistence where required monitor lifecycle
 * fields (e.g., `history`, `type`) may not yet be populated. Used by the
 * monitor type registry and migration system to normalize payloads derived from
 * renderer forms.
 */
export type MonitorConfigurationInput = Simplify<
    Partial<Omit<Monitor, "history" | "type">> &
        UnknownRecord & {
            /** Optional history collection supplied by advanced flows. */
            history?: Monitor["history"];
        }
>;

/**
 * Configuration for monitor check behavior.
 *
 * @remarks
 * Global configuration that applies to all monitors of a given type, unless
 * overridden by individual monitor settings.
 *
 * @public
 */
export interface MonitorServiceConfig extends MonitorConfigurationInput {
    /**
     * Request timeout in milliseconds.
     *
     * @remarks
     * Maximum time to wait for a response before considering the check failed.
     * Individual monitors can override this with their own timeout settings.
     *
     * @defaultValue 10000 (10 seconds)
     */
    timeout?: number;
    userAgent?: string;
}

/**
 * Fully-typed monitor configuration emitted by registry helpers.
 *
 * @remarks
 * Extends {@link MonitorConfigurationInput} with a resolved monitor type to
 * guarantee consumers operate on a strongly typed payload while still allowing
 * optional overrides for the remaining monitor fields.
 */
export type MonitorConfiguration = Simplify<
    MonitorConfigurationInput & {
        /** Discriminant monitor type derived from the registry. */
        type: MonitorType;
    }
>;
