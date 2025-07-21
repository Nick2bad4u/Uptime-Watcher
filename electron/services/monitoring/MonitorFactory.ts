import { Site } from "../../types";
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
     * @param config - Optional monitor configuration
     * @returns Monitor service instance
     * @throws Error if monitor type is not supported
     */
    public static getMonitor(type: Site["monitors"][0]["type"], config?: MonitorConfig): IMonitorService {
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
                `Monitor type '${type}' is registered but no service factory found. Available types: ${availableTypes}`
            );
        }

        // Get or create service instance
        let instance = this.serviceInstances.get(type);
        if (!instance) {
            instance = factory();
            if (config) {
                instance.updateConfig(config);
            }
            this.serviceInstances.set(type, instance);
        }

        return instance;
    }

    /**
     * Update configuration for all monitor types.
     */
    public static updateConfig(config: MonitorConfig): void {
        // Update config for all initialized monitor instances
        for (const instance of this.serviceInstances.values()) {
            instance.updateConfig(config);
        }
    }
}
