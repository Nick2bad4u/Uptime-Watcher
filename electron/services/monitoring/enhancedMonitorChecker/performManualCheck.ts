/**
 * Manual-check execution for
 * {@link electron/services/monitoring/EnhancedMonitorChecker#EnhancedMonitorChecker}.
 *
 * @remarks
 * Manual checks intentionally bypass operation correlation. They cancel any
 * correlated operation, then use the shared per-monitor gate so the cancelled
 * operation finishes unwinding before direct-check side effects begin.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

import type { EnhancedMonitoringDependencies } from "../EnhancedMonitoringDependencies";

import { createTimeoutSignal } from "../shared/abortSignalUtils";
import { resolveMonitorBaseTimeoutMs } from "../shared/timeoutUtils";
import { runExclusiveMonitorCheck } from "../MonitorExecutionFence";

/**
 * Executes a manual monitor check.
 *
 * @param args - Operation arguments.
 */
export async function performManualCheckOperation(args: {
    readonly config: Pick<
        EnhancedMonitoringDependencies,
        "monitorRepository" | "operationRegistry"
    >;
    readonly monitor: Monitor;
    readonly monitorId: string;
    readonly performDirectCheck: (
        site: Site,
        monitor: Monitor,
        isManual: boolean,
        signal: AbortSignal
    ) => Promise<StatusUpdate | undefined>;
    readonly signal: AbortSignal | undefined;
    readonly site: Site;
}): Promise<StatusUpdate | undefined> {
    const { config, monitorId, performDirectCheck, signal, site } = args;

    // Manual checks can race with scheduled correlated checks.
    // Cancel correlated operations to avoid overlapping writes.
    config.operationRegistry.cancelOperations(monitorId);

    return runExclusiveMonitorCheck({
        monitorId,
        operation: async () => {
            const currentMonitor =
                await config.monitorRepository.findByIdentifier(monitorId);
            if (!currentMonitor) {
                return undefined;
            }

            // Clear persisted correlation state only after the cancelled check
            // has finished its own persistence and cleanup work.
            await config.monitorRepository.clearActiveOperations(monitorId);

            const timeoutSignal = createTimeoutSignal(
                resolveMonitorBaseTimeoutMs(currentMonitor.timeout),
                signal
            );

            return performDirectCheck(
                site,
                currentMonitor,
                true,
                timeoutSignal
            );
        },
        skipIfBusy: false,
    });
}
