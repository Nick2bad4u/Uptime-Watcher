/**
 * Site setup helpers.
 *
 * @remarks
 * Extracted from {@link MonitorManager}.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

/**
 * Prepares a site for scheduling by applying default cadence and auto-start
 * rules.
 *
 * @param args - Operation arguments.
 */
export async function setupSiteForMonitoringOperation(args: {
    readonly applyDefaultIntervals: (site: Site) => Promise<void>;
    readonly autoStartMonitoringIfAppropriate: (site: Site) => Promise<void>;
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    readonly site: Site;
}): Promise<void> {
    const {
        applyDefaultIntervals,
        autoStartMonitoringIfAppropriate,
        eventEmitter,
        site,
    } = args;

    await applyDefaultIntervals(site);

    // Note: Initial checks are handled by MonitorScheduler when monitoring starts.
    await autoStartMonitoringIfAppropriate(site);

    await eventEmitter.emitTyped("internal:monitor:site-setup-completed", {
        identifier: site.identifier,
        operation: "site-setup-completed",
        timestamp: Date.now(),
    });
}
