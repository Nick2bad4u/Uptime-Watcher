/**
 * Client-side monitor type suffix formatters.
 * This provides dynamic suffix generation for monitor types in the frontend.
 */

// Import shared Monitor type from shared validation schemas
import { Monitor } from "@shared/types";

/**
 * Type for monitor title suffix formatter functions
 *
 * @param monitor - Monitor object to generate suffix for
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
 *
 * @param monitor - Monitor object to generate suffix for
 * @returns Formatted suffix string, or empty string if no formatter available
 *
 * @remarks
 * Uses the monitor type to find an appropriate formatter and generate
 * a descriptive suffix for display purposes (e.g., URL for HTTP monitors).
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
 * Get title suffix formatter for a monitor type
 *
 * @param monitorType - Type of monitor to get formatter for
 * @returns Formatter function if available, undefined otherwise
 *
 * @remarks
 * Used internally by formatTitleSuffix to retrieve the appropriate
 * formatter function for a given monitor type.
 *
 * @public
 */
export function getTitleSuffixFormatter(monitorType: string): TitleSuffixFormatter | undefined {
    return titleSuffixFormatters[monitorType];
}

/**
 * Register a title suffix formatter for a monitor type.
 *
 * @param monitorType - The monitor type identifier to register formatter for
 * @param formatter - The formatter function that takes a monitor and returns a suffix string
 *
 * @remarks
 * This function allows dynamic registration of title suffix formatters for different monitor types.
 * The formatter function will be called with a monitor object and should return a string suffix
 * to be appended to monitor titles for display purposes. If a formatter already exists for the
 * monitor type, it will be replaced with the new formatter.
 *
 * @example
 * ```typescript
 * registerTitleSuffixFormatter("custom", (monitor) => ` (${monitor.customField})`);
 * ```
 */
export function registerTitleSuffixFormatter(monitorType: string, formatter: TitleSuffixFormatter): void {
    titleSuffixFormatters[monitorType] = formatter;
}
