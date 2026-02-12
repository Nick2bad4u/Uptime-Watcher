import type { Monitor } from "@shared/types";

/**
 * Creates a stable signature representing a monitor's configuration.
 *
 * @remarks
 * Used for detecting newly-added monitors that do not yet have IDs. Excludes
 * runtime properties like status/lastChecked/responseTime.
 */
export function createMonitorSignature(monitor: Monitor): string {
    return [
        `type:${monitor.type}`,
        `host:${monitor.host ?? ""}`,
        `port:${monitor.port ?? ""}`,
        `url:${monitor.url ?? ""}`,
        `checkInterval:${monitor.checkInterval}`,
        `timeout:${monitor.timeout}`,
        `retryAttempts:${monitor.retryAttempts}`,
    ].join("|");
}

/**
 * Builds a monitor update payload while preserving runtime state.
 *
 * @remarks
 * We intentionally preserve monitoring/status fields from the existing monitor
 * so that configuration edits do not reset runtime monitoring state.
 */
export function buildMonitorUpdateData(
    newMonitor: Monitor,
    existingMonitor: Monitor
): Partial<Monitor> {
    const updateData: Partial<Monitor> = {
        checkInterval: newMonitor.checkInterval,
        monitoring: existingMonitor.monitoring,
        retryAttempts: newMonitor.retryAttempts,
        status: existingMonitor.status,
        timeout: newMonitor.timeout,
        type: newMonitor.type,
    };

    // Only update optional fields if they are defined
    if (newMonitor.host !== undefined) {
        updateData.host = newMonitor.host;
    }
    if (newMonitor.port !== undefined) {
        updateData.port = newMonitor.port;
    }
    if (newMonitor.url !== undefined) {
        updateData.url = newMonitor.url;
    }

    // DNS-specific fields for DNS monitor support
    if (newMonitor.recordType !== undefined) {
        updateData.recordType = newMonitor.recordType;
    }
    if (newMonitor.expectedValue !== undefined) {
        updateData.expectedValue = newMonitor.expectedValue;
    }

    return updateData;
}
