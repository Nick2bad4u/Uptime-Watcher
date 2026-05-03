import type { Monitor } from "@shared/types";

import { arrayJoin, isDefined } from "ts-extras";

/**
 * Creates a stable signature representing a monitor's configuration.
 *
 * @remarks
 * Used for detecting newly-added monitors that do not yet have IDs. Excludes
 * runtime properties like status/lastChecked/responseTime.
 */
export function createMonitorSignature(monitor: Monitor): string {
    return arrayJoin(
        [
            `type:${monitor.type}`,
            `host:${monitor.host ?? ""}`,
            `port:${monitor.port ?? ""}`,
            `url:${monitor.url ?? ""}`,
            `checkInterval:${monitor.checkInterval}`,
            `timeout:${monitor.timeout}`,
            `retryAttempts:${monitor.retryAttempts}`,
        ],
        "|"
    );
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
    if (isDefined(newMonitor.host)) {
        updateData.host = newMonitor.host;
    }
    if (isDefined(newMonitor.port)) {
        updateData.port = newMonitor.port;
    }
    if (isDefined(newMonitor.url)) {
        updateData.url = newMonitor.url;
    }

    // DNS-specific fields for DNS monitor support
    if (isDefined(newMonitor.recordType)) {
        updateData.recordType = newMonitor.recordType;
    }
    if (isDefined(newMonitor.expectedValue)) {
        updateData.expectedValue = newMonitor.expectedValue;
    }

    return updateData;
}
