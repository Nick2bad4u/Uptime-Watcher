/* eslint-disable @typescript-eslint/no-extraneous-class */

import { Site } from "../../types";
import { HttpMonitor } from "./HttpMonitor";
import { PortMonitor } from "./PortMonitor";
import { IMonitorService, MonitorConfig } from "./types";
import { isValidMonitorType, getRegisteredMonitorTypes } from "./MonitorTypeRegistry";

/**
 * Factory for creating and managing monitor services.
 * Provides a centralized way to get the appropriate monitor for a given type.
 */
export class MonitorFactory {
    private static httpMonitor: HttpMonitor;
    private static portMonitor: PortMonitor;

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
            throw new Error(`Unsupported monitor type: ${type}. Use MonitorTypeRegistry to register new types.`);
        }

        switch (type) {
            case "http": {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!this.httpMonitor) {
                    this.httpMonitor = new HttpMonitor(config);
                }
                return this.httpMonitor;
            }

            case "port": {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!this.portMonitor) {
                    this.portMonitor = new PortMonitor(config);
                }
                return this.portMonitor;
            }

            default: {
                throw new Error(
                    `Monitor type '${type}' is registered but no implementation found. Please implement the monitor service.`
                );
            }
        }
    }

    /**
     * Update configuration for all monitor types.
     */
    public static updateConfig(config: MonitorConfig): void {
        // Update config for all initialized monitor instances
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.httpMonitor !== undefined) {
            this.httpMonitor.updateConfig(config);
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.portMonitor !== undefined) {
            this.portMonitor.updateConfig(config);
        }
    }

    /**
     * Get all available monitor types from registry.
     */
    public static getAvailableTypes(): string[] {
        return getRegisteredMonitorTypes();
    }
}
