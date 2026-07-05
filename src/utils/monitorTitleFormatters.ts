import type { Monitor, MonitorType } from "@shared/types";

import { getSafeUrlForLogging } from "@shared/utils/urlSafety";
import { validateMonitorType } from "@shared/utils/validation";
import { objectAssign, objectKeys } from "ts-extras";

/** Function that produces a human-readable suffix for monitor titles. */
export type TitleSuffixFormatter = (monitor: Monitor) => string;

const isMonitorTypeKey = (candidate: string): candidate is MonitorType =>
    validateMonitorType(candidate);

const hasExplicitPath = (url: string): boolean => {
    const schemeEnd = url.indexOf("://");
    if (schemeEnd === -1) {
        return false;
    }

    let cursor = schemeEnd + 3;
    while (cursor < url.length) {
        const char = url[cursor];
        if (char === "/" || char === "?" || char === "#") {
            return char === "/";
        }

        cursor += 1;
    }

    return false;
};

const getSafeUrlForDisplay = (url: string): string => {
    const safeUrl = getSafeUrlForLogging(url);
    if (!hasExplicitPath(url) && safeUrl.endsWith("/")) {
        return safeUrl.slice(0, -1);
    }

    return safeUrl;
};

const formatUrlSuffix = (url: string | undefined): string =>
    url ? ` (${getSafeUrlForDisplay(url)})` : "";

const defaultMonitorTitleSuffixFormatters: Partial<
    Record<MonitorType, TitleSuffixFormatter>
> = {
    "cdn-edge-consistency": (monitor) => {
        if (monitor.baselineUrl) {
            return formatUrlSuffix(monitor.baselineUrl);
        }

        if (monitor.replicaStatusUrl) {
            return formatUrlSuffix(monitor.replicaStatusUrl);
        }

        return "";
    },
    dns: (monitor) =>
        monitor.host && monitor.recordType
            ? ` (${monitor.recordType} ${monitor.host})`
            : "",
    http: (monitor) => formatUrlSuffix(monitor.url),
    "http-header": (monitor) => formatUrlSuffix(monitor.url),
    "http-json": (monitor) => formatUrlSuffix(monitor.url),
    "http-keyword": (monitor) => formatUrlSuffix(monitor.url),
    "http-latency": (monitor) => formatUrlSuffix(monitor.url),
    "http-status": (monitor) => {
        if (monitor.url) {
            return formatUrlSuffix(monitor.url);
        }

        if (monitor.primaryStatusUrl) {
            return formatUrlSuffix(monitor.primaryStatusUrl);
        }

        if (monitor.replicaStatusUrl) {
            return formatUrlSuffix(monitor.replicaStatusUrl);
        }

        return "";
    },
    ping: (monitor) => (monitor.host ? ` (${monitor.host})` : ""),
    port: (monitor) =>
        monitor.host && monitor.port
            ? ` (${monitor.host}:${monitor.port})`
            : "",
    replication: (monitor) => {
        if (monitor.primaryStatusUrl) {
            return formatUrlSuffix(monitor.primaryStatusUrl);
        }

        if (monitor.replicaStatusUrl) {
            return formatUrlSuffix(monitor.replicaStatusUrl);
        }

        return "";
    },
    "server-heartbeat": (monitor) => formatUrlSuffix(monitor.url),
    ssl: (monitor) => {
        if (!monitor.host) {
            return "";
        }

        if (monitor.port) {
            return ` (${monitor.host}:${monitor.port})`;
        }

        return ` (${monitor.host})`;
    },
    "websocket-keepalive": (monitor) =>
        formatUrlSuffix(monitor.url),
};

const monitorTitleSuffixFormatters: Partial<
    Record<MonitorType, TitleSuffixFormatter>
> = { ...defaultMonitorTitleSuffixFormatters };

const customMonitorTitleSuffixFormatters = new Map<
    string,
    TitleSuffixFormatter
>();

/**
 * Formats a title suffix for the provided monitor configuration.
 */
export function formatTitleSuffix(monitor: Monitor): string {
    const formatter = getTitleSuffixFormatter(monitor.type);
    if (!formatter) {
        return "";
    }

    const suffix = formatter(monitor);
    if (!suffix || suffix.length === 0) {
        return "";
    }

    return suffix;
}

/**
 * Retrieves a suffix formatter for a given monitor type.
 */
export function getTitleSuffixFormatter(
    monitorType: string
): TitleSuffixFormatter | undefined {
    if (validateMonitorType(monitorType)) {
        return monitorTitleSuffixFormatters[monitorType];
    }

    return customMonitorTitleSuffixFormatters.get(monitorType);
}

/**
 * Registers a custom formatter for either built-in or user-defined monitor
 * types.
 */
export function registerTitleSuffixFormatter(
    monitorType: string,
    formatter: TitleSuffixFormatter
): void {
    if (validateMonitorType(monitorType)) {
        monitorTitleSuffixFormatters[monitorType] = formatter;
        return;
    }

    customMonitorTitleSuffixFormatters.set(monitorType, formatter);
}

/**
 * Restores the formatter registry to the default state.
 */
export function resetMonitorTitleSuffixFormatters(): void {
    for (const key of objectKeys(monitorTitleSuffixFormatters)) {
        if (isMonitorTypeKey(key)) {
            Reflect.deleteProperty(monitorTitleSuffixFormatters, key);
        }
    }

    objectAssign(
        monitorTitleSuffixFormatters,
        defaultMonitorTitleSuffixFormatters
    );
    customMonitorTitleSuffixFormatters.clear();
}
