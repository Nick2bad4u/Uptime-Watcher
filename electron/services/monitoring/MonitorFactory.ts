/* eslint-disable @typescript-eslint/no-extraneous-class */
import { Site } from "../../types";
import { HttpMonitor } from "./HttpMonitor";
import { PortMonitor } from "./PortMonitor";
import { IMonitorService, MonitorConfig } from "./types";

/**
 * Factory for creating and managing monitor services.
 * Provides a centralized way to get the appropriate monitor for a given type.
 */
export class MonitorFactory {
    private static httpMonitor: HttpMonitor;
    private static portMonitor: PortMonitor;

    /**
     * Get the appropriate monitor service for the given monitor type.
     */
    public static getMonitor(type: Site["monitors"][0]["type"], config?: MonitorConfig): IMonitorService {
        switch (type) {
            case "http":
                if (!this.httpMonitor) {
                    this.httpMonitor = new HttpMonitor(config);
                }
                return this.httpMonitor;

            case "port":
                if (!this.portMonitor) {
                    this.portMonitor = new PortMonitor(config);
                }
                return this.portMonitor;

            default:
                throw new Error(`Unsupported monitor type: ${type}`);
        }
    }

    /**
     * Update configuration for all monitor types.
     */
    public static updateConfig(config: MonitorConfig): void {
        if (this.httpMonitor) {
            this.httpMonitor.updateConfig(config);
        }
        if (this.portMonitor) {
            this.portMonitor.updateConfig(config);
        }
    }

    /**
     * Get all available monitor types.
     */
    public static getAvailableTypes(): Site["monitors"][0]["type"][] {
        return ["http", "port"];
    }
}
