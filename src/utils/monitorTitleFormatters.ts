import type { Monitor, MonitorType } from "@shared/types";

import { getSafeUrlForDisplay } from "@shared/utils/urlSafety";
import { validateMonitorType } from "@shared/utils/validation";

/** Function that produces a human-readable suffix for monitor titles. */
type TitleSuffixFormatter = (monitor: Monitor) => string;

const getUrlString = (url: unknown): string => {
    if (
        typeof url === "bigint" ||
        typeof url === "boolean" ||
        typeof url === "number" ||
        typeof url === "string"
    ) {
        return url ? String(url) : "";
    }

    return "";
};

const formatUrlSuffix = (url: unknown): string => {
    const urlString = getUrlString(url);
    return urlString ? ` (${getSafeUrlForDisplay(urlString)})` : "";
};

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
    "websocket-keepalive": (monitor) => formatUrlSuffix(monitor.url),
};

/**
 * Formats a title suffix for the provided monitor configuration.
 */
export function formatTitleSuffix(monitor: Monitor): string {
    const formatter = validateMonitorType(monitor.type)
        ? defaultMonitorTitleSuffixFormatters[monitor.type]
        : undefined;
    if (!formatter) {
        return "";
    }

    const suffix = formatter(monitor);
    if (!suffix || suffix.length === 0) {
        return "";
    }

    return suffix;
}
