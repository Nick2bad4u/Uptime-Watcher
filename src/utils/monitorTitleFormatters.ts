/**
 * Client-side monitor type suffix formatters.
 * This provides dynamic suffix generation for monitor types in the frontend.
 */

import { Monitor } from "@shared/types";

/**
 * Type for monitor title suffix formatter functions
 */
export type TitleSuffixFormatter = (monitor: Monitor) => string;

/**
 * Registry of title suffix formatters for different monitor types
 */
const titleSuffixFormatters: Record<string, TitleSuffixFormatter> = {
    http: (monitor: Monitor) => {
        const url = monitor.url as string;
        return url ? ` (${url})` : "";
    },
    port: (monitor: Monitor) => {
        const host = monitor.host as string;
        const port = monitor.port as number;
        return host && port ? ` (${host}:${port})` : "";
    },
};

/**
 * Format title suffix for a monitor dynamically
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
 * Get title suffix formatter for a monitor type
 */
export function getTitleSuffixFormatter(monitorType: string): TitleSuffixFormatter | undefined {
    // eslint-disable-next-line security/detect-object-injection
    return titleSuffixFormatters[monitorType];
}

/**
 * Register a title suffix formatter for a monitor type
 */
export function registerTitleSuffixFormatter(monitorType: string, formatter: TitleSuffixFormatter): void {
    // eslint-disable-next-line security/detect-object-injection
    titleSuffixFormatters[monitorType] = formatter;
}
