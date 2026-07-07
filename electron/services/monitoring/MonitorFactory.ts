/**
 * Factory for creating and managing monitor service instances with
 * configuration support.
 *
 * @remarks
 * Provides singleton-pattern monitor service instances with configuration
 * management. Validates monitor types against the registry and ensures only one
 * instance per monitor type exists. Supports configuration updates and cache
 * management for all registered monitor types.
 *
 * @packageDocumentation
 */

import type { MonitorType } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { arrayJoin, isDefined } from "ts-extras";

import type { IMonitorService, MonitorServiceConfig } from "./types";

import { logger } from "../../utils/logger";
import {
    getMonitorServiceFactory,
    getRegisteredMonitorTypes,
    isValidMonitorType,
} from "./MonitorTypeRegistry";

/**
 * Result of monitor service retrieval with configuration status.
 *
 * @remarks
 * This interface uses `exactOptionalPropertyTypes` TypeScript configuration,
 * which means optional properties must be explicitly handled to avoid type
 * errors. The `configurationError` property should only be included when
 * there's an actual error.
 */
interface MonitorServiceResult {
    /**
     * Whether configuration was successfully applied (if config was provided)
     */
    configurationApplied: boolean;
    /**
     * Configuration error message if app failed (only present when there's an
     * error)
     */
    configurationError?: string;
    /** The monitor service instance */
    instance: IMonitorService;
}

/**
 * Error thrown when a monitor service fails to apply configuration updates.
 */
class MonitorConfigurationError extends Error {
    /** The monitor type whose configuration failed to apply. */
    public readonly type: MonitorType;

    /**
     * @param type - Monitor type whose configuration update failed.
     * @param message - Normalized error message from the underlying failure.
     * @param cause - Optional underlying error for rich diagnostics.
     */
    public constructor(type: MonitorType, message: string, cause?: Error) {
        super(
            `Failed to apply configuration for monitor '${type}': ${message}`,
            {
                cause,
            }
        );
        this.name = "MonitorConfigurationError";
        this.type = type;
    }
}

/**
 * Factory for creating, caching, and managing monitor service instances for all
 * registered monitor types.
 *
 * @remarks
 * This class provides a singleton instance per monitor type, using the
 * registry's service factories for instantiation. It ensures that only one
 * instance per monitor type exists at a time, and provides configuration
 * management for all monitor services. All monitor type validation and service
 * instantiation is delegated to the monitor type registry.
 *
 * @example
 *
 * ```typescript
 * // Retrieve a monitor service instance for HTTP
 * const httpMonitor = getMonitor("http", { timeout: 5000 });
 * ```
 *
 * @public
 */
/**
 * Cache of monitor service instances, keyed by monitor type string.
 *
 * @remarks
 * Implements the singleton pattern: only one instance per monitor type is
 * created and reused.
 *
 * @internal
 *
 * @readonly
 */
const serviceInstances = new Map<string, IMonitorService>();

/**
 * Retrieves the monitor service instance with configuration app status.
 *
 * @remarks
 * Internal implementation for {@link getMonitor}. It keeps configuration
 * application status explicit so the public wrapper can stay small while the
 * factory still handles cached instances correctly.
 *
 * @param type - The monitor type string. Must be a valid registered type.
 * @param config - Optional monitor configuration to apply to the instance.
 * @param forceConfigUpdate - If true, updates the configuration on an existing
 *   instance even if already set.
 *
 * @returns Result object containing the service instance and configuration
 *   status.
 *
 * @throws `Error` if the monitor type is not supported or no service factory is
 *   registered for the type.
 *
 * @internal
 */
function getMonitorWithResult(
    type: string,
    config?: MonitorServiceConfig,
    forceConfigUpdate = false
): MonitorServiceResult {
    // Validate monitor type using registry
    if (!isValidMonitorType(type)) {
        const availableTypes = arrayJoin(getRegisteredMonitorTypes(), ", ");
        throw new Error(
            `Unsupported monitor type: ${type}. Available types: ${availableTypes}`
        );
    }

    // Get factory from registry
    const factory = getMonitorServiceFactory(type);
    if (!factory) {
        const availableTypes = arrayJoin(getRegisteredMonitorTypes(), ", ");
        throw new Error(
            `Monitor type '${type}' is registered in the type registry but no service factory is available. ` +
                `This indicates a configuration mismatch. Available types: ${availableTypes}`
        );
    }

    // Get or create service instance
    let instance = serviceInstances.get(type);
    let didCreateInstance = false;
    if (!instance) {
        instance = factory();
        serviceInstances.set(type, instance);
        didCreateInstance = true;
    }

    // Track configuration app status
    let isConfigurationApplied = true;
    let configurationError: string | undefined;

    // Apply configuration if provided and either forcing update or instance is
    // new
    if (config && (forceConfigUpdate || didCreateInstance)) {
        try {
            instance.updateConfig(config);
            // ConfigurationApplied remains true
        } catch (error: unknown) {
            const normalizedError = ensureError(error);

            logger.error(
                interpolateLogTemplate(
                    LOG_TEMPLATES.warnings.MONITOR_CONFIG_UPDATE_FAILED_TYPE,
                    { type }
                ),
                normalizedError
            );

            throw new MonitorConfigurationError(
                type,
                normalizedError.message,
                normalizedError
            );
        }
    } else if (config) {
        // Config was provided but not applied (existing instance, no force)
        isConfigurationApplied = false;
        configurationError =
            "Configuration not applied to cached instance (use forceConfigUpdate=true)";
    }

    return {
        configurationApplied: isConfigurationApplied,
        ...(isDefined(configurationError) && { configurationError }),
        instance,
    };
}

/**
 * Retrieves the monitor service instance for a given monitor type, creating it
 * if necessary.
 *
 * @remarks
 * -
 *
 * Validates the monitor type against the registry.
 *
 * - Uses the singleton pattern: returns the cached instance if available,
 *   otherwise creates a new one. - If a configuration is provided, updates the
 *   instance's configuration if forced or if the instance is new. - Throws if
 *   the monitor type is unsupported or if no factory is registered for the
 *   type.
 * - Configuration failures are logged but do not prevent service retrieval.
 *
 * @example
 *
 * ```typescript
 * const monitor = getMonitor("http", { timeout: 5000 });
 * ```
 *
 * @param type - The monitor type string. Must be a valid registered type.
 * @param config - Optional monitor configuration to apply to the instance.
 * @param forceConfigUpdate - If true, updates the configuration on an existing
 *   instance even if already set.
 *
 * @returns The monitor service instance for the specified type.
 *
 * @throws `Error` if the monitor type is not supported or no service factory is
 *   registered for the type.
 * @throws When configuration application fails.
 *
 * @public
 *
 * @see `IMonitorService`
 * @see {@link MonitorServiceConfig}
 * @see {@link getMonitorServiceFactory}
 * @see {@link isValidMonitorType}
 */
export function getMonitor(
    type: MonitorType,
    config?: MonitorServiceConfig,
    forceConfigUpdate = false
): IMonitorService {
    const result = getMonitorWithResult(type, config, forceConfigUpdate);
    return result.instance;
}
