import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import type { EnhancedMonitoringDependencies } from "../EnhancedMonitoringDependencies";
import type { StatusUpdateMonitorCheckResult } from "../MonitorStatusUpdateService";
import type { MonitorCheckResult } from "../types";

import {
    createMonitorCheckContext,
    type MonitorCheckContext,
} from "../checkContext";
import { resolveStatusUpdateDetails } from "../utils/monitorCheckResultNormalization";

/**
 * Performs a direct check without operation correlation.
 *
 * @remarks
 * This is used for manual checks and other scenarios where we intentionally do
 * not participate in operation correlation.
 */
export async function performDirectCheck(args: {
    readonly emitStatusChangeEvents: (
        site: Site,
        originalMonitor: Monitor,
        freshMonitorWithHistory: Site["monitors"][0],
        checkResult: StatusUpdateMonitorCheckResult
    ) => Promise<void>;
    readonly eventEmitter: EnhancedMonitoringDependencies["eventEmitter"];
    readonly fetchFreshMonitorWithHistory: (
        monitorId: string
    ) => Promise<Site["monitors"][0] | undefined>;
    readonly isManualCheck: boolean;
    readonly logger: Logger;
    readonly monitor: Monitor;
    readonly monitorRepository: EnhancedMonitoringDependencies["monitorRepository"];
    readonly runServiceCheck: (args: {
        readonly context: MonitorCheckContext;
        readonly operationId: string;
    }) => Promise<{
        readonly checkResult: StatusUpdateMonitorCheckResult;
        readonly serviceResult: MonitorCheckResult;
    }>;
    readonly saveHistoryEntry: (
        monitor: Monitor,
        checkResult: StatusUpdateMonitorCheckResult
    ) => Promise<void>;
    readonly signal?: AbortSignal;
    readonly site: Site;
}): Promise<StatusUpdate | undefined> {
    const {
        emitStatusChangeEvents,
        eventEmitter,
        fetchFreshMonitorWithHistory,
        isManualCheck,
        logger,
        monitor,
        monitorRepository,
        runServiceCheck,
        saveHistoryEntry,
        signal,
        site,
    } = args;

    try {
        const context = createMonitorCheckContext({
            isManualCheck,
            monitor,
            operationId: "direct-check",
            ...(signal ? { signal } : {}),
            site,
        });

        const { checkResult, serviceResult } = await runServiceCheck({
            context,
            operationId: "direct-check",
        });

        // For manual checks on paused monitors, preserve the paused status.
        const finalStatus =
            isManualCheck && monitor.status === "paused"
                ? "paused"
                : serviceResult.status;

        // Save history entry for direct checks too (always save actual result).
        await saveHistoryEntry(monitor, checkResult);

        // Update monitor directly (bypass operation correlation for manual
        // checks). For manual checks on paused monitors, don't update the
        // status.
        const updateData: Partial<Monitor> = {
            lastChecked: checkResult.timestamp,
            responseTime: serviceResult.responseTime,
        };

        // Only update status if not a manual check on a paused monitor.
        if (!(isManualCheck && monitor.status === "paused")) {
            updateData.status = serviceResult.status;
        }

        const fallbackMonitor: Monitor = {
            ...monitor,
            lastChecked: checkResult.timestamp,
            responseTime: serviceResult.responseTime,
            status: updateData.status ?? monitor.status,
        };

        const statusUpdateBase: StatusUpdate = {
            details: resolveStatusUpdateDetails(
                finalStatus === "paused"
                    ? { status: finalStatus }
                    : {
                          status: finalStatus,
                          ...(typeof serviceResult.details === "string"
                              ? { serviceDetails: serviceResult.details }
                              : {}),
                      }
            ),
            monitor: fallbackMonitor,
            monitorId: monitor.id,
            previousStatus: monitor.status,
            responseTime: serviceResult.responseTime,
            site,
            siteIdentifier: site.identifier,
            status: finalStatus,
            timestamp: checkResult.timestamp.toISOString(),
        };

        await monitorRepository.update(monitor.id, updateData);

        const freshMonitorWithHistory = await fetchFreshMonitorWithHistory(
            monitor.id
        );

        if (!freshMonitorWithHistory) {
            return statusUpdateBase;
        }

        const statusUpdate: StatusUpdate = {
            ...statusUpdateBase,
            monitor: freshMonitorWithHistory,
        };

        const didStatusChange =
            statusUpdate.status !== statusUpdate.previousStatus;

        // Emit proper typed events like the traditional monitoring system.
        if (didStatusChange) {
            await eventEmitter.emitTyped(
                "monitor:status-changed",
                statusUpdate
            );
        }

        // Emit monitor up/down events using the same canonical helper used by
        // correlated checks.
        //
        // Preserve existing behavior: manual checks on paused monitors do not
        // emit up/down events.
        if (
            didStatusChange &&
            (!isManualCheck || monitor.status !== "paused")
        ) {
            await emitStatusChangeEvents(
                site,
                monitor,
                freshMonitorWithHistory,
                checkResult
            );
        }

        return statusUpdate;
    } catch (error) {
        logger.error(`Direct monitor check failed for ${monitor.id}`, error);
        return undefined;
    }
}
