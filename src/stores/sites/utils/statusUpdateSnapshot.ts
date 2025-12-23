import type { Monitor, MonitorStatus, Site } from "@shared/types";

import { isDevelopment } from "@shared/utils/environment";

import { logger } from "../../../services/logger";
import {
    mergeMonitorStatusChange,
    type MonitorStatusChangedEvent,
} from "./statusUpdateMerge";

/**
 * Status update payload used by the renderer to apply an optimistic snapshot
 * update to the site store.
 *
 * @remarks
 * This payload is intentionally *not* typed as {@link StatusUpdate} because the
 * shared {@link StatusUpdate} type intersects an index signature, which causes
 * strict TS configs (e.g. `noPropertyAccessFromIndexSignature`) and some lint
 * rules to fight normal property access.
 */
export interface StatusUpdateSnapshotPayload {
    readonly error?: string;
    /** Optional snapshot of the monitor at update-time. */
    readonly monitor?: Monitor;
    readonly monitorId: string;
    /** Optional previous status; falls back to {@link status} when absent. */
    readonly previousStatus?: MonitorStatus;
    readonly responseTime?: number;
    /** Optional snapshot of the site at update-time. */
    readonly site?: Site;

    readonly siteIdentifier: string;

    readonly status: MonitorStatus;
    /**
     * @remarks
     * Across IPC boundaries this may arrive as an ISO string, while internal
     * calls may provide a {@link Date}. Both are supported.
     */
    readonly timestamp: Date | string;
}

/**
 * Applies an incoming status update snapshot to the current sites array.
 *
 * @remarks
 * This function is pure and returns either the original `sites` reference (when
 * no update can be applied) or a new array with the relevant monitor/site
 * updated.
 */
export const applyStatusUpdateSnapshot = (
    sites: Site[],
    statusUpdate: StatusUpdateSnapshotPayload
): Site[] => {
    const {
        error,
        monitor,
        monitorId,
        previousStatus,
        responseTime,
        site,
        siteIdentifier,
        status,
        timestamp: rawTimestamp,
    } = statusUpdate;

    const parsedTimestamp = Date.parse(String(rawTimestamp));
    const timestamp = Number.isFinite(parsedTimestamp)
        ? new Date(parsedTimestamp).toISOString()
        : new Date().toISOString();

    const resolvedPreviousStatus = previousStatus ?? status;
    const resolvedResponseTime = responseTime ?? monitor?.responseTime ?? 0;

    if (!monitor || !site) {
        if (isDevelopment()) {
            logger.debug(
                "Received status update without site or monitor context; skipping optimistic merge",
                {
                    monitorId,
                    siteIdentifier,
                }
            );
        }

        return sites;
    }

    const event: MonitorStatusChangedEvent = {
        error,
        monitor,
        monitorId,
        previousStatus: resolvedPreviousStatus,
        responseTime: resolvedResponseTime,
        site,
        siteIdentifier,
        status,
        timestamp,
    };

    return mergeMonitorStatusChange(sites, event);
};
