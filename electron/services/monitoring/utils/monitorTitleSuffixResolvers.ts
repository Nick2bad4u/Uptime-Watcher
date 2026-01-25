import type { Monitor } from "@shared/types";

const wrapSuffix = (value: string): string =>
    value.length > 0 ? ` (${value})` : "";

/**
 * Creates a title suffix resolver for monitor types that should display host.
 */
export function createHostTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return (monitor: Monitor): string => {
        if (monitor.type !== args.monitorType) {
            return "";
        }

        const host = typeof monitor.host === "string" ? monitor.host : "";
        return wrapSuffix(host);
    };
}

/**
 * Creates a title suffix resolver for host:port monitor types.
 */
export function createHostPortTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return (monitor: Monitor): string => {
        if (monitor.type !== args.monitorType) {
            return "";
        }

        const host = typeof monitor.host === "string" ? monitor.host : "";
        const port = typeof monitor.port === "number" ? monitor.port : undefined;

        if (host.length === 0 || port === undefined) {
            return "";
        }

        return wrapSuffix(`${host}:${port}`);
    };
}

/**
 * Creates a title suffix resolver for DNS monitor types that should display
 * recordType + host.
 */
export function createRecordTypeHostTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return (monitor: Monitor): string => {
        if (monitor.type !== args.monitorType) {
            return "";
        }

        const host = typeof monitor.host === "string" ? monitor.host : "";
        const recordType =
            typeof monitor.recordType === "string" ? monitor.recordType : "";

        if (host.length === 0 || recordType.length === 0) {
            return "";
        }

        return wrapSuffix(`${recordType} ${host}`);
    };
}

/**
 * Creates a title suffix resolver for TLS/SSL monitor types.
 */
export function createTlsTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return (monitor: Monitor): string => {
        if (monitor.type !== args.monitorType) {
            return "";
        }

        const host = typeof monitor.host === "string" ? monitor.host.trim() : "";
        if (host.length === 0) {
            return "";
        }

        const portSuffix =
            typeof monitor.port === "number" ? `:${monitor.port}` : "";

        return wrapSuffix(`${host}${portSuffix}`);
    };
}
