/**
 * Manual-check execution for {@link EnhancedMonitorChecker}.
 *
 * @remarks
 * Manual checks intentionally bypass operation correlation, but they can race
 * with scheduled correlated checks. To avoid overlapping writes, manual checks
 * cancel correlated operations and clear `activeOperations` before proceeding.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

import type { EnhancedMonitoringDependencies } from "../EnhancedMonitoringDependencies";

import { createTimeoutSignal } from "../shared/abortSignalUtils";
import { resolveMonitorBaseTimeoutMs } from "../shared/timeoutUtils";

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
    const { config, monitor, monitorId, performDirectCheck, signal, site } = args;

    // Manual checks can race with scheduled correlated checks.
    // Cancel correlated operations to avoid overlapping writes.
    config.operationRegistry.cancelOperations(monitorId);

    // Ensure active operation IDs don't accumulate if a cancelled
    // operation never settles.
    await config.monitorRepository.clearActiveOperations(monitorId);

    const timeoutSignal = createTimeoutSignal(
        resolveMonitorBaseTimeoutMs(monitor.timeout),
        signal
    );

    return performDirectCheck(site, monitor, true, timeoutSignal);
}
