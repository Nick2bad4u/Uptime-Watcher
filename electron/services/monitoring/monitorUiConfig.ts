import type { Monitor } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

/**
 * Shared monitor UI configuration shape that is serialized across IPC.
 */
export type SharedMonitorUiConfig = NonNullable<MonitorTypeConfig["uiConfig"]>;

/**
 * Extended UI configuration used by the renderer when displaying monitors.
 *
 * @remarks
 * Augments the shared monitor type configuration with additional metadata that
 * is only meaningful to the desktop renderer layer.
 */
export interface MonitorUIConfig extends SharedMonitorUiConfig {
    /** Chart data formatters */
    chartFormatters?: {
        advanced?: boolean;
        responseTime?: boolean;
        uptime?: boolean;
    };
    /** Detail formats with optional history formatter */
    detailFormats?: SharedMonitorUiConfig["detailFormats"] & {
        historyDetail?: (details: string) => string;
    };
    /** Detail label formatter function name */
    detailLabelFormatter?: string;
    /** Display preferences including optional port display */
    display?: SharedMonitorUiConfig["display"] & {
        showPort?: boolean;
    };
    /** Function to format detail display in history */
    formatDetail?: (details: string) => string;
    /** Function to format title suffix for history charts */
    formatTitleSuffix?: (monitor: Monitor) => string;
}
