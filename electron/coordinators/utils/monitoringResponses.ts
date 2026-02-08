import type { UptimeEvents } from "../../events/eventTypes";

/**
 * Builds the payload for a start-monitoring response event.
 */
export function buildStartMonitoringResponse(args: {
    identifier: string;
    monitorId?: string;
    success: boolean;
}): UptimeEvents["internal:site:start-monitoring-response"] {
    return {
        identifier: args.identifier,
        operation: "start-monitoring-response",
        success: args.success,
        timestamp: Date.now(),
        ...(args.monitorId ? { monitorId: args.monitorId } : {}),
    };
}

/**
 * Builds the payload for a stop-monitoring response event.
 */
export function buildStopMonitoringResponse(args: {
    identifier: string;
    monitorId?: string;
    success: boolean;
}): UptimeEvents["internal:site:stop-monitoring-response"] {
    return {
        identifier: args.identifier,
        operation: "stop-monitoring-response",
        success: args.success,
        timestamp: Date.now(),
        ...(args.monitorId ? { monitorId: args.monitorId } : {}),
    };
}

/**
 * Builds the payload for a restart-monitoring response event.
 */
export function buildRestartMonitoringResponse(args: {
    identifier: string;
    monitorId: string;
    success: boolean;
}): UptimeEvents["internal:site:restart-monitoring-response"] {
    return {
        identifier: args.identifier,
        monitorId: args.monitorId,
        operation: "restart-monitoring-response",
        success: args.success,
        timestamp: Date.now(),
    };
}

/**
 * Builds the payload for an is-monitoring-active response event.
 */
export function buildIsMonitoringActiveResponse(args: {
    identifier: string;
    isActive: boolean;
    monitorId: string;
}): UptimeEvents["internal:site:is-monitoring-active-response"] {
    return {
        identifier: args.identifier,
        isActive: args.isActive,
        monitorId: args.monitorId,
        operation: "is-monitoring-active-response",
        timestamp: Date.now(),
    };
}
