import type { Monitor, Site, StatusUpdate } from "@shared/types";

import type { EnhancedMonitorCheckConfig } from "../EnhancedMonitorChecker";
import type { StatusUpdateMonitorCheckResult } from "../MonitorStatusUpdateService";

import { resolveStatusUpdateDetails } from "../utils/monitorCheckResultNormalization";
import { emitStatusChangeEvents } from "./emitStatusChangeEvents";

/**
 * Handles a successful correlated check by hydrating fresh monitor state and
 * emitting status-change events.
 */
export async function handleSuccessfulCheck(args: {
    readonly checkResult: StatusUpdateMonitorCheckResult;
    readonly eventEmitter: EnhancedMonitorCheckConfig["eventEmitter"];
    readonly fetchFreshMonitorWithHistory: (
        monitorId: string
    ) => Promise<Site["monitors"][0] | undefined>;
    readonly monitor: Monitor;
    readonly site: Site;
}): Promise<StatusUpdate | undefined> {
    const {
        checkResult,
        eventEmitter,
        fetchFreshMonitorWithHistory,
        monitor,
        site,
    } = args;

    const freshMonitorWithHistory = await fetchFreshMonitorWithHistory(
        checkResult.monitorId
    );

    if (!freshMonitorWithHistory) {
        return undefined;
    }

    const details = resolveStatusUpdateDetails({
        status: checkResult.status,
    });

    const statusUpdate: StatusUpdate = {
        details,
        monitor: freshMonitorWithHistory,
        monitorId: checkResult.monitorId,
        previousStatus: monitor.status,
        responseTime: checkResult.responseTime,
        site,
        siteIdentifier: site.identifier,
        status: checkResult.status,
        timestamp: checkResult.timestamp.toISOString(),
    };

    const didStatusChange = statusUpdate.status !== statusUpdate.previousStatus;

    // Emit proper typed events like the traditional monitoring system
    if (didStatusChange) {
        await eventEmitter.emitTyped("monitor:status-changed", statusUpdate);

        await emitStatusChangeEvents({
            checkResult,
            eventEmitter,
            freshMonitor: freshMonitorWithHistory,
            originalMonitor: monitor,
            site,
        });
    }

    return statusUpdate;
}
