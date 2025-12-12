/**
 * Optimistic status-update snapshot handling.
 *
 * @remarks
 * Manual check operations can return an immediate {@link StatusUpdate} snapshot
 * (including updated monitor/site details). This module converts that snapshot
 * into the same enriched shape used by the event-driven incremental update
 * pipeline.
 */

import type { Site, StatusUpdate } from "@shared/types";

import { isDevelopment } from "@shared/utils/environment";

import { logger } from "../../../services/logger";
import {
    mergeMonitorStatusChange,
    type MonitorStatusChangedEvent,
} from "./statusUpdateMerge";

/**
 * Minimal status update payload needed to perform an optimistic site merge.
 *
 * @remarks
 * Represents the subset of {@link StatusUpdate} fields consumed by
 * {@link applyStatusUpdateSnapshot}. Site and monitor snapshots are optional to
 * accommodate legacy IPC payloads that lacked enriched data, while still
 * allowing current callers to provide the full structure.
 */
export type StatusUpdateSnapshotPayload = Partial<
    Omit<StatusUpdate, "monitorId" | "siteIdentifier" | "status" | "timestamp">
> &
    Pick<StatusUpdate, "monitorId" | "siteIdentifier" | "status" | "timestamp">;

type StatusUpdateSnapshotContext = Required<
    Pick<StatusUpdate, "monitor" | "site">
>;

const hasSnapshotContext = (
    payload: StatusUpdateSnapshotPayload
): payload is StatusUpdateSnapshotContext & StatusUpdateSnapshotPayload =>
    Boolean(
        "monitor" in payload &&
        "site" in payload &&
        payload["monitor"] &&
        payload["site"]
    );

/**
 * Apply a status update snapshot to the provided site collection.
 *
 * @remarks
 * Converts a {@link StatusUpdate} containing full monitor and site snapshots
 * into the enriched monitor status change structure consumed by the
 * orchestrated status update handler. This enables optimistic UI updates when
 * manual checks return immediately from IPC invocations.
 *
 * @param sites - Current site collection from the store.
 * @param statusUpdate - Snapshot emitted from manual check operations.
 *
 * @returns Updated site collection reflecting the provided status update.
 */
export const applyStatusUpdateSnapshot = (
    sites: Site[],
    statusUpdate: StatusUpdateSnapshotPayload
): Site[] => {
    if (!hasSnapshotContext(statusUpdate)) {
        if (isDevelopment()) {
            logger.debug(
                "[StatusUpdateHandler] Received status update without site or monitor context; skipping optimistic merge",
                {
                    monitorId: statusUpdate.monitorId,
                    siteIdentifier: statusUpdate.siteIdentifier,
                }
            );
        }

        return sites;
    }

    const parsedTimestamp = Date.parse(statusUpdate.timestamp);
    const timestamp = Number.isFinite(parsedTimestamp)
        ? new Date(parsedTimestamp).toISOString()
        : new Date().toISOString();

    const { monitor, site } = statusUpdate;

    const event: MonitorStatusChangedEvent = {
        ...statusUpdate,
        monitor,
        site,
        timestamp,
    };

    return mergeMonitorStatusChange(sites, event);
};
