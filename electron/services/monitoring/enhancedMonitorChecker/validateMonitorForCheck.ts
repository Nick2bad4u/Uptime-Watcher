import type { Monitor, Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

/**
 * Validates a monitor before attempting a check.
 */
export function validateMonitorForCheck(
    logger: Logger,
    monitor: Monitor | undefined,
    site: Site,
    monitorId: string
): monitor is Monitor {
    if (!monitor) {
        logger.error(
            `Monitor not found for id: ${monitorId} on site: ${site.identifier}`
        );
        return false;
    }

    if (!monitor.id) {
        logger.error(`Monitor missing id for ${site.identifier}, skipping check.`);
        return false;
    }

    return true;
}
