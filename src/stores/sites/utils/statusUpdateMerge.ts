/**
 * Status update merge utilities.
 *
 * @remarks
 * These helpers keep the merge strategy used by the status update pipeline
 * isolated from subscription wiring and snapshot conversion.
 */

import type { Monitor, Site } from "@shared/types";
import type { MonitorStatusChangedEventData } from "@shared/types/events";

import { isDevelopment } from "@shared/utils/environment";
import { mergeMonitorSnapshots } from "@shared/utils/siteSnapshots";

import { logger } from "../../../services/logger";

/**
 * Monitor status changed event data structure enriched with full snapshots.
 *
 * @remarks
 * This represents the actual data structure sent from the backend when a
 * monitor's status changes. Includes the complete monitor and site objects with
 * updated history for efficient incremental updates.
 *
 * @internal
 */
export type MonitorStatusChangedEvent = MonitorStatusChangedEventData & {
    /** Complete monitor snapshot with refreshed history. */
    monitor: Monitor;
    /** Site context required for notification workflows. */
    site: Site;
};

/**
 * Merges a monitor status change event into the current store site list.
 *
 * @remarks
 * The merge strategy is intentionally conservative:
 *
 * - Only the matching monitor is replaced
 * - History is preserved when the event delivers an empty history array (which
 *   can happen for certain backend paths)
 *
 * @param sites - Current sites array.
 * @param event - Enriched status change event.
 *
 * @returns Updated sites array.
 */
export function mergeMonitorStatusChange(
    sites: Site[],
    event: MonitorStatusChangedEvent
): Site[] {
    return sites.map((site) => {
        if (site.identifier !== event.siteIdentifier) {
            return site;
        }

        const monitorExists = site.monitors.some(
            (monitor) => monitor.id === event.monitorId
        );

        if (!monitorExists && isDevelopment()) {
            logger.debug(
                `Monitor ${event.monitorId} not found in site ${event.siteIdentifier}`
            );
        }

        const updatedMonitors = site.monitors.map((monitor) => {
            if (monitor.id !== event.monitorId) {
                return monitor;
            }

            // The status update payload carries the fresh monitor snapshot on
            // `event.monitor`. The embedded `event.site` can legitimately lag
            // behind (tests and some backend paths build it from the existing
            // store snapshot), so we always merge using the monitor snapshot.
            return mergeMonitorSnapshots(monitor, event.monitor);
        });

        return {
            ...site,
            monitors: updatedMonitors,
        };
    });
}
