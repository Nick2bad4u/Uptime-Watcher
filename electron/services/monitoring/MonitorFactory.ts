import { MonitorType } from "../../types";
import { logger } from "../../utils/logger";
import { getMonitorServiceFactory, getRegisteredMonitorTypes, isValidMonitorType } from "./MonitorTypeRegistry";
import { IMonitorService, MonitorConfig } from "./types";

/**
 * Factory for creating and managing monitor service instances.
 *
 * @remarks
 * - Uses the registry's service factories for automation.
 * - Maintains singleton instances per monitor type.
 * - Provides configuration management for all monitor services.
 *
 * @public
 */
export class MonitorFactory {
    /**
     * Cache of monitor service instances, keyed by monitor type.
     *
     * @remarks
     * Singleton pattern: only one instance per monitor type.
     *
     * @internal
     * @readonly
     */
    private static readonly serviceInstances = new Map<string, IMonitorService>();

    /**
     * Clears all cached monitor service instances.
     *
     * @remarks
     * Useful for testing or reloading configuration.
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
     * @returns Array of registered monitor type strings.
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
     * Gets the monitor service instance for a given monitor type.
     *
     * @remarks
     * - Validates the monitor type against the registry.
     * - Uses singleton pattern: returns cached instance if available.
     * - If a config is provided, updates the instance's configuration if forced or if the instance is new.
     * - Throws if monitor type is unsupported or if no factory is registered.
     *
     * @param type - The monitor type string.
     * @param config - Optional monitor configuration to apply.
     * @param forceConfigUpdate - If true, updates config on existing instance.
     * @returns The monitor service instance for the specified type.
     * @throws Error if monitor type is not supported or no factory is registered.
     *
     * @example
     * ```typescript
     * const monitor = MonitorFactory.getMonitor("http", { timeout: 5000 });
     * ```
     *
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
                logger.warn(`Failed to update config for monitor type ${type}`, { error });
            }
        }

        return instance;
    }

    /**
     * Updates configuration for all initialized monitor service instances.
     *
     * @remarks
     * - Applies the provided configuration to all currently cached monitor instances.
     * - Only affects already-created instances; future instances require explicit config.
     * - Type-specific settings in config may be ignored by some monitor types.
     *
     * @param config - Monitor configuration object containing settings to apply.
     *
     * @example
     * ```typescript
     * MonitorFactory.updateConfig({ timeout: 10000 });
     * ```
     *
     * @public
     */
    public static updateConfig(config: MonitorConfig): void {
        // Update config for all initialized monitor instances
        for (const instance of this.serviceInstances.values()) {
            try {
                instance.updateConfig(config);
            } catch (error) {
                logger.warn("Failed to update config for monitor instance", { error });
            }
        }
    }
}
