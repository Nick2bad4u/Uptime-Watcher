import type { Monitor } from "@shared/types";

const wrapSuffix = (value: string): string =>
    value.length > 0 ? ` (${value})` : "";

type MonitorTitleSuffixResolver = (monitor: Monitor) => string;

/**
 * Creates a monitor-type gated title suffix resolver.
 *
 * @remarks
 * Several monitor types share the same control-flow:
 *
 * 1. Ensure the monitor "type" matches
 * 2. Derive a suffix string from monitor fields
 * 3. Wrap the suffix in parentheses (or return empty string)
 *
 * Centralizing that boilerplate keeps each exported factory focused on the
 * monitor-specific formatting logic.
 */
function createMonitorTypeTitleSuffixResolver(args: {
    monitorType: string;
    resolve: (monitor: Monitor) => string;
}): MonitorTitleSuffixResolver {
    return (monitor: Monitor): string => {
        if (monitor.type !== args.monitorType) {
            return "";
        }

        return wrapSuffix(args.resolve(monitor));
    };
}

/**
 * Creates a title suffix resolver for monitor types that should display host.
 */
export function createHostTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return createMonitorTypeTitleSuffixResolver({
        monitorType: args.monitorType,
        resolve: (monitor) =>
            typeof monitor.host === "string" ? monitor.host : "",
    });
}

/**
 * Creates a title suffix resolver for host:port monitor types.
 */
export function createHostPortTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return createMonitorTypeTitleSuffixResolver({
        monitorType: args.monitorType,
        resolve: (monitor) => {
            const host = typeof monitor.host === "string" ? monitor.host : "";
            const port =
                typeof monitor.port === "number" ? monitor.port : undefined;

            if (host.length === 0 || port === undefined) {
                return "";
            }

            return `${host}:${port}`;
        },
    });
}

/**
 * Creates a title suffix resolver for DNS monitor types that should display
 * recordType + host.
 */
export function createRecordTypeHostTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return createMonitorTypeTitleSuffixResolver({
        monitorType: args.monitorType,
        resolve: (monitor) => {
            const host = typeof monitor.host === "string" ? monitor.host : "";
            const recordType =
                typeof monitor.recordType === "string"
                    ? monitor.recordType
                    : "";

            if (host.length === 0 || recordType.length === 0) {
                return "";
            }

            return `${recordType} ${host}`;
        },
    });
}

/**
 * Creates a title suffix resolver for TLS/SSL monitor types.
 */
export function createTlsTitleSuffixResolver(args: {
    monitorType: string;
}): (monitor: Monitor) => string {
    return createMonitorTypeTitleSuffixResolver({
        monitorType: args.monitorType,
        resolve: (monitor) => {
            const host =
                typeof monitor.host === "string" ? monitor.host.trim() : "";
            if (host.length === 0) {
                return "";
            }

            const portSuffix =
                typeof monitor.port === "number" ? `:${monitor.port}` : "";

            return `${host}${portSuffix}`;
        },
    });
}
