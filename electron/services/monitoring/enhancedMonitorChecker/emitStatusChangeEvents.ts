import type { Site } from "@shared/types";
import type {
    MonitorDownEventData,
    MonitorLifecycleEventData,
    MonitorUpEventData,
} from "@shared/types/events";

import type { EnhancedMonitorCheckConfig } from "../EnhancedMonitorChecker";
import type { StatusUpdateMonitorCheckResult } from "../MonitorStatusUpdateService";

/**
 * Emits monitor up/down events for a status change.
 */
export async function emitStatusChangeEvents(args: {
    readonly checkResult: StatusUpdateMonitorCheckResult;
    readonly eventEmitter: EnhancedMonitorCheckConfig["eventEmitter"];
    readonly freshMonitor: Site["monitors"][0];
    readonly originalMonitor: Site["monitors"][0];
    readonly site: Site;
}): Promise<void> {
    const { checkResult, eventEmitter, freshMonitor, originalMonitor, site } =
        args;

    const isoTimestamp = checkResult.timestamp.toISOString();
    const lifecycleBase: MonitorLifecycleEventData = {
        details: checkResult.details ?? "",
        monitor: freshMonitor,
        monitorId: freshMonitor.id,
        previousStatus: originalMonitor.status,
        responseTime: checkResult.responseTime,
        site,
        siteIdentifier: site.identifier,
        status: checkResult.status,
        timestamp: isoTimestamp,
    };

    if (checkResult.status === "up" && originalMonitor.status !== "up") {
        const payload: MonitorUpEventData = {
            ...lifecycleBase,
            status: "up",
        };
        await eventEmitter.emitTyped("monitor:up", payload);
        return;
    }

    if (checkResult.status === "down" && originalMonitor.status !== "down") {
        const payload: MonitorDownEventData = {
            ...lifecycleBase,
            status: "down",
        };
        await eventEmitter.emitTyped("monitor:down", payload);
    }
}
