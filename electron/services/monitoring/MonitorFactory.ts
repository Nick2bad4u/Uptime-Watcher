import { MonitorType } from "../../types";
import { logger } from "../../utils/logger";
import { getMonitorServiceFactory, getRegisteredMonitorTypes, isValidMonitorType } from "./MonitorTypeRegistry";
import { IMonitorService, MonitorConfig } from "./types";

/**
 * Factory for creating, caching, and managing monitor service instances for all registered monitor types.
 *
 * @remarks
 * This class provides a singleton instance per monitor type, using the registry's service factories for instantiation.
 * It ensures that only one instance per monitor type exists at a time, and provides configuration management for all monitor services.
 * All monitor type validation and service instantiation is delegated to the monitor type registry.
 *
 * @example
 * ```typescript
 * // Retrieve a monitor service instance for HTTP
 * const httpMonitor = MonitorFactory.getMonitor("http", { timeout: 5000 });
 * // Update configuration for all monitor services
 * MonitorFactory.updateConfig({ timeout: 10000 });
 * // Clear all cached monitor service instances
 * MonitorFactory.clearCache();
 * ```
 *
 * @public
 */
export class MonitorFactory {
    /**
     * Cache of monitor service instances, keyed by monitor type string.
     *
     * @remarks
     * Implements the singleton pattern: only one instance per monitor type is created and reused.
     *
     * @internal
     * @readonly
     */
    private static readonly serviceInstances = new Map<string, IMonitorService>();

    /**
     * Clears all cached monitor service instances.
     *
     * @remarks
     * Useful for testing, reloading configuration, or resetting the monitor service state.
     * After calling this method, new service instances will be created on demand.
     *
     * @example
     * ```typescript
     * MonitorFactory.clearCache();
     * ```
     *
     * @public
     */
    public static clearCache(): void {
        this.serviceInstances.clear();
    }

    /**
     * Retrieves all available monitor types from the registry.
     *
     * @remarks
     * This method returns all monitor types currently registered in the system, including both built-in and dynamically registered types.
     *
     * @returns An array of registered monitor type strings.
     *
     * @example
     * ```typescript
     * const types = MonitorFactory.getAvailableTypes();
     * ```
     *
     * @public
     */
    public static getAvailableTypes(): string[] {
        return getRegisteredMonitorTypes();
    }

    /**
     * Retrieves the monitor service instance for a given monitor type, creating it if necessary.
     *
     * @remarks
     * - Validates the monitor type against the registry.
     * - Uses the singleton pattern: returns the cached instance if available, otherwise creates a new one.
     * - If a configuration is provided, updates the instance's configuration if forced or if the instance is new.
     * - Throws if the monitor type is unsupported or if no factory is registered for the type.
     *
     * @param type - The monitor type string. Must be a valid registered type.
     * @param config - Optional monitor configuration to apply to the instance.
     * @param forceConfigUpdate - If true, updates the configuration on an existing instance even if already set.
     * @returns The monitor service instance for the specified type.
     *
     * @throws Error If the monitor type is not supported or no service factory is registered for the type.
     *
     * @example
     * ```typescript
     * const monitor = MonitorFactory.getMonitor("http", { timeout: 5000 });
     * ```
     *
     * @see {@link IMonitorService}
     * @see {@link MonitorConfig}
     * @see {@link getMonitorServiceFactory}
     * @see {@link isValidMonitorType}
     * @public
     */
    public static getMonitor(type: MonitorType, config?: MonitorConfig, forceConfigUpdate = false): IMonitorService {
        // Validate monitor type using registry
        if (!isValidMonitorType(type)) {
            const availableTypes = getRegisteredMonitorTypes().join(", ");
            throw new Error(`Unsupported monitor type: ${type}. Available types: ${availableTypes}`);
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
        let instance = this.serviceInstances.get(type);
        if (!instance) {
            instance = factory();
            this.serviceInstances.set(type, instance);
        }

        // Apply configuration if provided and either forcing update or instance is new
        if (config && (forceConfigUpdate || this.serviceInstances.get(type) === instance)) {
            try {
                instance.updateConfig(config);
            } catch (error) {
                // Log and continue; do not throw from config update
                logger.warn(`Failed to update config for monitor type ${type}`, { error });
            }
        }

        return instance;
    }

    /**
     * Updates configuration for all currently initialized monitor service instances.
     *
     * @remarks
     * - Applies the provided configuration to all cached monitor service instances.
     * - Only affects already-created instances; future instances require explicit config on creation.
     * - Type-specific settings in the config object may be ignored by some monitor types if not applicable.
     * - Errors during config update are logged and do not interrupt updates for other instances.
     *
     * @param config - Monitor configuration object containing settings to apply to all monitor services.
     *
     * @example
     * ```typescript
     * MonitorFactory.updateConfig({ timeout: 10000 });
     * ```
     *
     * @see {@link MonitorConfig}
     * @public
     */
    public static updateConfig(config: MonitorConfig): void {
        // Update config for all initialized monitor instances
        for (const instance of this.serviceInstances.values()) {
            try {
                instance.updateConfig(config);
            } catch (error) {
                // Log and continue; do not throw from config update
                logger.warn("Failed to update config for monitor instance", { error });
            }
        }
    }
}
