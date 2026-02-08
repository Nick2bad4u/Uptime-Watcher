/**
 * Helpers for constructing status update payloads and telemetry objects.
 */

import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";
import type { Site, StatusUpdate } from "@shared/types";

import type { SitesTelemetryPayload } from "./operationHelpers";
import type { MonitorStatusChangedEvent } from "./statusUpdateMerge";

/**
 * Builds a {@link StatusUpdate} payload from a monitor status change event.
 */
export function buildStatusUpdatePayload(args: {
    event: MonitorStatusChangedEvent;
    site: Site;
}): StatusUpdate {
    const { event, site } = args;

    const payload: StatusUpdate = {
        monitor: event.monitor,
        monitorId: event.monitorId,
        site,
        siteIdentifier: event.siteIdentifier,
        status: event.status,
        timestamp: new Date(event.timestamp).toISOString(),
    };

    if (event.details !== undefined) {
        payload.details = event.details;
    }

    if (event.previousStatus !== undefined) {
        payload.previousStatus = event.previousStatus;
    }

    if (event.responseTime !== undefined) {
        payload.responseTime = event.responseTime;
    }

    return payload;
}

type MonitoringLifecycleEvent =
    | RendererEventPayloadMap["monitoring:started"]
    | RendererEventPayloadMap["monitoring:stopped"];

/**
 * Builds a telemetry payload for monitoring lifecycle events.
 */
export function buildMonitoringLifecycleTelemetry(args: {
    event: MonitoringLifecycleEvent;
    phase: "started" | "stopped";
}): SitesTelemetryPayload {
    const { event, phase } = args;

    const monitorCountValue = event.monitorCount;
    const siteCountValue = event.siteCount;
    const timestampValue = event["timestamp"];
    const { activeMonitors } = event;
    const { reason } = event;

    const monitorCount =
        typeof monitorCountValue === "number" ? monitorCountValue : undefined;
    const siteCount =
        typeof siteCountValue === "number" ? siteCountValue : undefined;
    const timestamp =
        typeof timestampValue === "number" ? timestampValue : undefined;

    return {
        phase,
        ...(timestamp === undefined ? {} : { timestamp }),
        ...(monitorCount === undefined ? {} : { monitorCount }),
        ...(siteCount === undefined ? {} : { siteCount }),
        ...(typeof activeMonitors === "number" ? { activeMonitors } : {}),
        ...(typeof reason === "string" ? { reason } : {}),
    } satisfies SitesTelemetryPayload;
}
