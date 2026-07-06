import type { Monitor, Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";

const getSafeIdentifier = (identifier: string): string =>
    getSafeIdentifierForLogging(identifier) ?? identifier;

/**
 * Validates a monitor before attempting a check.
 */
export function validateMonitorForCheck(
    logger: Logger,
    monitor: Monitor | undefined,
    site: Site,
    monitorId: string
): monitor is Monitor {
    const safeMonitorId = getSafeIdentifier(monitorId);
    const safeSiteIdentifier = getSafeIdentifier(site.identifier);

    if (!monitor) {
        logger.error(
            `Monitor not found for id: ${safeMonitorId} on site: ${safeSiteIdentifier}`
        );
        return false;
    }

    if (!monitor.id) {
        logger.error(
            `Monitor missing id for ${safeSiteIdentifier}, skipping check.`
        );
        return false;
    }

    return true;
}
