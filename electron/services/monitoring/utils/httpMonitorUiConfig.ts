import type { Monitor } from "@shared/types";

import type { MonitorUIConfig } from "../monitorUiConfig";

/**
 * UI overrides for HTTP/HTTPS-like monitor types.
 */
export type HttpMonitorUiOverrides = Partial<MonitorUIConfig>;

/**
 * Creates a title suffix resolver for a monitor type that has a URL.
 */
export function createUrlSuffixResolver(
    type: string
): (monitor: Monitor) => string {
    return (monitor: Monitor) => {
        const hasMatchingType = monitor.type === type;
        const urlValue = monitor.url;

        if (!hasMatchingType || typeof urlValue !== "string") {
            return "";
        }

        return urlValue.length > 0 ? ` (${urlValue})` : "";
    };
}

/**
 * Creates the standard UI config for HTTP-like monitor types.
 */
export function createHttpMonitorUiConfig(
    type: string,
    overrides: HttpMonitorUiOverrides = {}
): MonitorUIConfig {
    const {
        detailFormats,
        display,
        formatDetail,
        formatTitleSuffix,
        helpTexts,
        supportsAdvancedAnalytics,
        supportsResponseTime,
    } = overrides;

    return {
        ...(detailFormats ? { detailFormats } : {}),
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
            ...display,
        },
        ...(formatDetail ? { formatDetail } : {}),
        formatTitleSuffix: formatTitleSuffix ?? createUrlSuffixResolver(type),
        ...(helpTexts ? { helpTexts } : {}),
        ...(supportsAdvancedAnalytics === undefined
            ? {}
            : { supportsAdvancedAnalytics }),
        ...(supportsResponseTime === undefined ? {} : { supportsResponseTime }),
    };
}
