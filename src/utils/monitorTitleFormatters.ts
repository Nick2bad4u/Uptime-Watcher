import type { Monitor, MonitorType } from "@shared/types";

import { validateMonitorType } from "@shared/utils/validation";

/** Function that produces a human-readable suffix for monitor titles. */
export type TitleSuffixFormatter = (monitor: Monitor) => string;

const isMonitorTypeKey = (candidate: string): candidate is MonitorType =>
    validateMonitorType(candidate);

const defaultMonitorTitleSuffixFormatters: Partial<
    Record<MonitorType, TitleSuffixFormatter>
> = {
    "cdn-edge-consistency": (monitor) => {
        if (monitor.baselineUrl) {
            return ` (${monitor.baselineUrl})`;
        }

        if (monitor.replicaStatusUrl) {
            return ` (${monitor.replicaStatusUrl})`;
        }

        return "";
    },
    dns: (monitor) =>
        monitor.host && monitor.recordType
            ? ` (${monitor.recordType} ${monitor.host})`
            : "",
    http: (monitor) => (monitor.url ? ` (${monitor.url})` : ""),
    "http-header": (monitor) => (monitor.url ? ` (${monitor.url})` : ""),
    "http-json": (monitor) => (monitor.url ? ` (${monitor.url})` : ""),
    "http-keyword": (monitor) => (monitor.url ? ` (${monitor.url})` : ""),
    "http-latency": (monitor) => (monitor.url ? ` (${monitor.url})` : ""),
    "http-status": (monitor) => {
        if (monitor.url) {
            return ` (${monitor.url})`;
        }

        if (monitor.primaryStatusUrl) {
            return ` (${monitor.primaryStatusUrl})`;
        }

        if (monitor.replicaStatusUrl) {
            return ` (${monitor.replicaStatusUrl})`;
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
            return ` (${monitor.primaryStatusUrl})`;
        }

        if (monitor.replicaStatusUrl) {
            return ` (${monitor.replicaStatusUrl})`;
        }

        return "";
    },
    "server-heartbeat": (monitor) => (monitor.url ? ` (${monitor.url})` : ""),
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
        monitor.url ? ` (${monitor.url})` : "",
};

const monitorTitleSuffixFormatters: Partial<
    Record<MonitorType, TitleSuffixFormatter>
> = { ...defaultMonitorTitleSuffixFormatters };

const customMonitorTitleSuffixFormatters = new Map<
    string,
    TitleSuffixFormatter
>();

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
    for (const key of Object.keys(monitorTitleSuffixFormatters)) {
        if (isMonitorTypeKey(key)) {
            Reflect.deleteProperty(monitorTitleSuffixFormatters, key);
        }
    }

    Object.assign(
        monitorTitleSuffixFormatters,
        defaultMonitorTitleSuffixFormatters
    );
    customMonitorTitleSuffixFormatters.clear();
}
