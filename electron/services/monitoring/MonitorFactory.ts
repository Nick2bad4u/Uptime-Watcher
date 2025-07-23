import { MonitorType } from "../../types";
import { logger } from "../../utils/logger";
import { getMonitorServiceFactory, getRegisteredMonitorTypes, isValidMonitorType } from "./MonitorTypeRegistry";
import { IMonitorService, MonitorConfig } from "./types";

/**
 * Factory for creating and managing monitor services.
 * Uses the registry's service factories for complete automation.
 */

export class MonitorFactory {
    private static readonly serviceInstances = new Map<string, IMonitorService>();

    /**
     * Clear all cached service instances.
     * Useful for testing or configuration reloading.
     */
    public static clearCache(): void {
        this.serviceInstances.clear();
    }

    /**
     * Get all available monitor types from registry.
     */
    public static getAvailableTypes(): string[] {
        return getRegisteredMonitorTypes();
    }

    /**
     * Get the appropriate monitor service for the given monitor type.
     *
     * @param type - Monitor type string
     * @param config - Optional monitor configuration to apply
     * @param forceConfigUpdate - Whether to update config on existing instances
     * @returns Monitor service instance with applied configuration
     * @throws Error if monitor type is not supported
     *
     * @remarks
     * Uses singleton pattern to cache monitor instances per type. If an instance
     * already exists and config is provided, the behavior depends on forceConfigUpdate:
     * - true: Updates existing instance with new config
     * - false: Returns existing instance without config changes (default)
     *
     * For consistent configuration across all instances, use {@link updateConfig} instead.
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
     * Update configuration for all monitor types.
     *
     * @param config - Monitor configuration object containing settings to apply
     *
     * @remarks
     * Applies the provided configuration to ALL currently initialized monitor instances.
     * This ensures consistent configuration across all monitor types.
     *
     * The config object should contain settings applicable to all monitor types.
     * Type-specific settings may be ignored by monitors that don't support them.
     *
     * Note: Only affects already-created instances. Future instances created via
     * {@link getMonitor} will need their configuration set explicitly.
     *
     * @example
     * ```typescript
     * // Update timeout for all monitor instances
     * MonitorFactory.updateConfig({ timeout: 10000 });
     * ```
     */
    public static updateConfig(config: MonitorConfig): void {
        // Validate config parameter - config parameter is typed as required

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
