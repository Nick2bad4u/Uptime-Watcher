import type { MonitorType } from "@shared/types";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { IMonitorService, MonitorConfig } from "./types";

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
export interface MonitorServiceResult {
    /**
     * Whether configuration was successfully applied (if config was provided)
     */
    configurationApplied: boolean;
    /**
     * Configuration error message if application failed (only present when
     * there's an error)
     */
    configurationError?: string;
    /** The monitor service instance */
    instance: IMonitorService;
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
 * // Update configuration for all monitor services
 * updateMonitorConfig({ timeout: 10000 });
 * // Clear all cached monitor service instances
 * clearMonitorFactoryCache();
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
 * Clears all cached monitor service instances.
 *
 * @remarks
 * Useful for testing, reloading configuration, or resetting the monitor service
 * state. After calling this method, new service instances will be created on
 * demand.
 *
 * @example
 *
 * ```typescript
 * clearMonitorFactoryCache();
 * ```
 *
 * @public
 */
export function clearMonitorFactoryCache(): void {
    serviceInstances.clear();
}

/**
 * Retrieves all available monitor types from the registry.
 *
 * @remarks
 * This method returns all monitor types currently registered in the system,
 * including both built-in and dynamically registered types.
 *
 * @example
 *
 * ```typescript
 * const types = getAvailableMonitorTypes();
 * ```
 *
 * @returns An array of registered monitor type strings.
 *
 * @public
 */
export function getAvailableMonitorTypes(): string[] {
    return getRegisteredMonitorTypes();
}

/**
 * Retrieves the monitor service instance with configuration application status.
 *
 * @remarks
 * Same as {@link getMonitor} but returns detailed result including configuration
 * application status. Use this method when you need to know if configuration
 * was successfully applied.
 *
 * @example
 *
 * ```typescript
 * const result = getMonitorWithResult("http", { timeout: 5000 });
 * if (!result.configurationApplied && result.configurationError) {
 *     console.warn("Config failed:", result.configurationError);
 * }
 * ```
 *
 * @param type - The monitor type string. Must be a valid registered type.
 * @param config - Optional monitor configuration to apply to the instance.
 * @param forceConfigUpdate - If true, updates the configuration on an existing
 *   instance even if already set.
 *
 * @returns Result object containing the service instance and configuration
 *   status.
 *
 * @throws {@link Error} If the monitor type is not supported or no service
 *   factory is registered for the type.
 *
 * @public
 */
export function getMonitorWithResult(
    type: MonitorType,
    config?: MonitorConfig,
    forceConfigUpdate = false
): MonitorServiceResult {
    // Validate monitor type using registry
    if (!isValidMonitorType(type)) {
        const availableTypes = getRegisteredMonitorTypes().join(", ");
        throw new Error(
            `Unsupported monitor type: ${type}. Available types: ${availableTypes}`
        );
    }

    // Get factory from registry
    const factory = getMonitorServiceFactory(type);
    if (!factory) {
        const availableTypes = getRegisteredMonitorTypes().join(", ");
        throw new Error(
            `Monitor type '${type}' is registered in the type registry but no service factory is available. ` +
                `This indicates a configuration mismatch. Available types: ${availableTypes}`
        );
    }

    // Get or create service instance
    let instance = serviceInstances.get(type);
    if (!instance) {
        instance = factory();
        serviceInstances.set(type, instance);
    }

    // Track configuration application status
    let configurationApplied = true;
    let configurationError: string | undefined = undefined;

    // Apply configuration if provided and either forcing update or instance is
    // new
    if (
        config &&
        (forceConfigUpdate || serviceInstances.get(type) === instance)
    ) {
        try {
            instance.updateConfig(config);
            // configurationApplied remains true
        } catch (error) {
            configurationApplied = false;
            configurationError =
                error instanceof Error ? error.message : String(error);

            // Log but don't throw for backward compatibility
            logger.warn(
                interpolateLogTemplate(
                    LOG_TEMPLATES.warnings.MONITOR_CONFIG_UPDATE_FAILED_TYPE,
                    { type }
                ),
                { error }
            );
        }
    } else if (config) {
        // Config was provided but not applied (existing instance, no force)
        configurationApplied = false;
        configurationError =
            "Configuration not applied to existing instance (use forceConfigUpdate=true)";
    }

    return {
        configurationApplied,
        ...(configurationError !== undefined && { configurationError }),
        instance,
    };
}

/**
 * Retrieves the monitor service instance for a given monitor type, creating it
 * if necessary.
 *
 * @remarks
 * - Validates the monitor type against the registry.
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
 * @throws {@link Error} If the monitor type is not supported or no service
 *   factory is registered for the type.
 *
 * @public
 *
 * @see {@link IMonitorService}
 * @see {@link MonitorConfig}
 * @see {@link getMonitorServiceFactory}
 * @see {@link isValidMonitorType}
 * @see {@link getMonitorWithResult} for version that returns configuration status
 */
export function getMonitor(
    type: MonitorType,
    config?: MonitorConfig,
    forceConfigUpdate = false
): IMonitorService {
    const result = getMonitorWithResult(type, config, forceConfigUpdate);
    return result.instance;
}

/**
 * Updates configuration for all currently initialized monitor service
 * instances.
 *
 * @remarks
 * - Applies the provided configuration to all cached monitor service instances. -
 *   Only affects already-created instances; future instances require explicit
 *   config on creation. - Type-specific settings in the config object may be
 *   ignored by some monitor types if not applicable. - Errors during config
 *   update are logged and do not interrupt updates for other instances.
 *
 * @example
 *
 * ```typescript
 * updateMonitorConfig({ timeout: 10000 });
 * ```
 *
 * @param config - Monitor configuration object containing settings to apply to
 *   all monitor services.
 *
 * @public
 *
 * @see {@link MonitorConfig}
 */
export function updateMonitorConfig(config: MonitorConfig): void {
    // Update config for all initialized monitor instances
    for (const instance of serviceInstances.values()) {
        try {
            instance.updateConfig(config);
        } catch (error) {
            // Log and continue; do not throw from config update
            logger.warn(
                LOG_TEMPLATES.warnings.MONITOR_CONFIG_UPDATE_FAILED_INSTANCE,
                { error }
            );
        }
    }
}
