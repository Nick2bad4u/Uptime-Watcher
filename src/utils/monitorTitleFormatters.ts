/**
 * Client-side monitor type suffix formatters. This provides dynamic suffix
 * generation for monitor types in the frontend.
 */

// Import shared Monitor type from shared validation schemas
import type { Monitor } from "@shared/types";

/**
 * Type for monitor title suffix formatter functions
 *
 * @param monitor - Monitor object to generate suffix for
 *
 * @returns Formatted suffix string for display
 *
 * @public
 */

export type TitleSuffixFormatter = (monitor: Monitor) => string;

/**
 * Registry of title suffix formatters for different monitor types
 *
 * @internal
 */
const titleSuffixFormatters: Record<string, TitleSuffixFormatter> = {
    "cdn-edge-consistency": (monitor: Monitor) => {
        const { baselineUrl } = monitor;
        return baselineUrl ? ` (${baselineUrl})` : "";
    },
    dns: (monitor: Monitor) => {
        const { host, recordType } = monitor;
        return host && recordType ? ` (${recordType} ${host})` : "";
    },
    http: (monitor: Monitor) => {
        const { url } = monitor;
        return url ? ` (${url})` : "";
    },
    "http-header": (monitor: Monitor) =>
        monitor.url ? ` (${monitor.url})` : "",
    "http-json": (monitor: Monitor) => (monitor.url ? ` (${monitor.url})` : ""),
    "http-keyword": (monitor: Monitor) =>
        monitor.url ? ` (${monitor.url})` : "",
    "http-latency": (monitor: Monitor) =>
        monitor.url ? ` (${monitor.url})` : "",
    "http-status": (monitor: Monitor) =>
        monitor.url ? ` (${monitor.url})` : "",
    ping: (monitor: Monitor) => (monitor.host ? ` (${monitor.host})` : ""),
    port: (monitor: Monitor) => {
        const { host } = monitor;
        const { port } = monitor;
        return host && port ? ` (${host}:${port})` : "";
    },
    replication: (monitor: Monitor) => {
        const { primaryStatusUrl, replicaStatusUrl } = monitor;
        if (primaryStatusUrl) {
            return ` (${primaryStatusUrl})`;
        }
        if (replicaStatusUrl) {
            return ` (${replicaStatusUrl})`;
        }
        return "";
    },
    "server-heartbeat": (monitor: Monitor) =>
        monitor.url ? ` (${monitor.url})` : "",
    ssl: (monitor: Monitor) => {
        const { host, port } = monitor;
        if (!host) {
            return "";
        }
        const portSuffix = port ? `:${port}` : "";
        return ` (${host}${portSuffix})`;
    },
    "websocket-keepalive": (monitor: Monitor) =>
        monitor.url ? ` (${monitor.url})` : "",
};

/**
 * Get title suffix formatter for a monitor type
 *
 * @remarks
 * Used internally by formatTitleSuffix to retrieve the appropriate formatter
 * function for a given monitor type.
 *
 * @param monitorType - Type of monitor to get formatter for
 *
 * @returns Formatter function if available, undefined otherwise
 *
 * @public
 */
export function getTitleSuffixFormatter(
    monitorType: string
): TitleSuffixFormatter | undefined {
    return Object.hasOwn(titleSuffixFormatters, monitorType)
        ? titleSuffixFormatters[monitorType]
        : undefined;
}

/**
 * Format title suffix for a monitor dynamically
 *
 * @remarks
 * Uses the monitor type to find an appropriate formatter and generate a
 * descriptive suffix for display purposes (e.g., URL for HTTP monitors).
 *
 * @param monitor - Monitor object to generate suffix for
 *
 * @returns Formatted suffix string, or empty string if no formatter available
 *
 * @public
 */
export function formatTitleSuffix(monitor: Monitor): string {
    const formatter = getTitleSuffixFormatter(monitor.type);
    if (formatter) {
        return formatter(monitor);
    }

    // Fallback to empty string if no formatter is registered
    return "";
}

/**
 * Register a title suffix formatter for a monitor type.
 *
 * @remarks
 * This function allows dynamic registration of title suffix formatters for
 * different monitor types. The formatter function will be called with a monitor
 * object and should return a string suffix to be appended to monitor titles for
 * display purposes. If a formatter already exists for the monitor type, it will
 * be replaced with the new formatter.
 *
 * @example
 *
 * ```typescript
 * registerTitleSuffixFormatter(
 *     "custom",
 *     (monitor) => ` (${monitor.customField})`
 * );
 * ```
 *
 * @param monitorType - The monitor type identifier to register formatter for
 * @param formatter - The formatter function that takes a monitor and returns a
 *   suffix string
 */
export function registerTitleSuffixFormatter(
    monitorType: string,
    formatter: TitleSuffixFormatter
): void {
    titleSuffixFormatters[monitorType] = formatter;
}
