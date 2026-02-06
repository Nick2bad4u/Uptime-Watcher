/**
 * Utilities for handling site-vs-monitor scoped orchestrator operations.
 */

/** Supported monitoring operation kinds that can be site- or monitor-scoped. */
export type MonitorScopedOperationKind = "start" | "stop";

/**
 * Standardized error-context metadata for operations that can target an entire
 * site or a specific monitor.
 */
export interface MonitorScopedOperationContext {
    readonly code: string;
    readonly details: {
        readonly identifier: string;
        readonly monitorId?: string;
    };
    readonly isMonitorScoped: boolean;
    readonly message: string;
    readonly operation: string;
}

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.length > 0;

/**
 * Builds consistent error context metadata for monitoring operations that can
 * target either a whole site or a specific monitor.
 */
export function buildMonitorScopedOperationContext(args: {
    identifier: string;
    kind: MonitorScopedOperationKind;
    monitorId: string | undefined;
}): MonitorScopedOperationContext {
    const { identifier, kind, monitorId } = args;
    const isMonitorScoped = isNonEmptyString(monitorId);
    const details = isMonitorScoped
        ? { identifier, monitorId }
        : { identifier };

    if (kind === "start") {
        return {
            code: isMonitorScoped
                ? "ORCHESTRATOR_START_MONITORING_FOR_MONITOR_FAILED"
                : "ORCHESTRATOR_START_MONITORING_FOR_SITE_FAILED",
            details,
            isMonitorScoped,
            message: isMonitorScoped
                ? `Failed to start monitoring for monitor ${monitorId} on site ${identifier}`
                : `Failed to start monitoring for site ${identifier}`,
            operation: isMonitorScoped
                ? "orchestrator.startMonitoringForMonitor"
                : "orchestrator.startMonitoringForSite",
        };
    }

    return {
        code: isMonitorScoped
            ? "ORCHESTRATOR_STOP_MONITORING_FOR_MONITOR_FAILED"
            : "ORCHESTRATOR_STOP_MONITORING_FOR_SITE_FAILED",
        details,
        isMonitorScoped,
        message: isMonitorScoped
            ? `Failed to stop monitoring for monitor ${monitorId} on site ${identifier}`
            : `Failed to stop monitoring for site ${identifier}`,
        operation: isMonitorScoped
            ? "orchestrator.stopMonitoringForMonitor"
            : "orchestrator.stopMonitoringForSite",
    };
}
