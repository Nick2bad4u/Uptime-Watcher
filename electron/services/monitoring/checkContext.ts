import type { Monitor, Site } from "@shared/types";

/**
 * Shared context passed through monitor checking strategies.
 */
export interface MonitorCheckContext {
    readonly isManualCheck?: boolean;
    readonly monitor: Monitor;
    readonly operationId?: string;
    readonly signal?: AbortSignal;
    readonly site: Site;
}

/**
 * Input options accepted by {@link createMonitorCheckContext}.
 */
export interface MonitorCheckContextOptions {
    readonly isManualCheck?: boolean;
    readonly monitor: Monitor;
    readonly operationId?: string;
    readonly signal?: AbortSignal;
    readonly site: Site;
}

/**
 * Builds a stable {@link MonitorCheckContext} object used by monitor strategies.
 */
export const createMonitorCheckContext = (
    options: MonitorCheckContextOptions
): MonitorCheckContext => ({
    monitor: options.monitor,
    site: options.site,
    ...(options.operationId ? { operationId: options.operationId } : {}),
    ...(options.isManualCheck ? { isManualCheck: options.isManualCheck } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
});
