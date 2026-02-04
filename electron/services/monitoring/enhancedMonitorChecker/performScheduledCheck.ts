/**
 * Scheduled-check execution for {@link EnhancedMonitorChecker}.
 *
 * @remarks
 * Scheduled checks are correlation-aware and should be skipped when a monitor
 * is not marked as `monitoring`.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

/**
 * Executes a non-manual (scheduled) monitor check.
 *
 * @param args - Operation arguments.
 */
export async function performScheduledCheckOperation(args: {
    readonly logger: Logger;
    readonly monitor: Monitor;
    readonly monitorId: string;
    readonly performCorrelatedCheck: (
        site: Site,
        monitor: Monitor,
        monitorId: string,
        externalSignal?: AbortSignal
    ) => Promise<StatusUpdate | undefined>;
    readonly signal: AbortSignal | undefined;
    readonly site: Site;
}): Promise<StatusUpdate | undefined> {
    const { logger, monitor, monitorId, performCorrelatedCheck, signal, site } =
        args;

    if (!monitor.monitoring) {
        logger.debug(
            `Monitor ${monitorId} is not monitoring, skipping check (manual: false)`
        );
        return undefined;
    }

    return performCorrelatedCheck(site, monitor, monitorId, signal);
}
