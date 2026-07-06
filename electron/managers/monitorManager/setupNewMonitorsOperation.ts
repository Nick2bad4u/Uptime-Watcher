/**
 * New-monitor setup helpers.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to keep
 * the manager focused on orchestration.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { arrayIncludes, isEmpty } from "ts-extras";

import { logger } from "../../utils/logger";

const getSafeIdentifier = (identifier: string): string =>
    getSafeIdentifierForLogging(identifier) ?? identifier;

/**
 * Applies default configuration for monitors newly attached to a site.
 *
 * @param args - Operation arguments.
 */
export async function setupNewMonitorsOperation(args: {
    readonly newMonitorIds: string[];
    readonly setupIndividualNewMonitors: (
        site: Site,
        newMonitors: Site["monitors"]
    ) => Promise<void>;
    readonly site: Site;
}): Promise<void> {
    const { newMonitorIds, setupIndividualNewMonitors, site } = args;
    const safeSiteIdentifier = getSafeIdentifier(site.identifier);

    logger.debug(
        interpolateLogTemplate(
            LOG_TEMPLATES.debug.MONITOR_MANAGER_SETUP_MONITORS,
            {
                count: newMonitorIds.length,
                identifier: safeSiteIdentifier,
            }
        )
    );

    const newMonitors = site.monitors.filter(
        (monitor) => monitor.id && arrayIncludes(newMonitorIds, monitor.id)
    );

    if (isEmpty(newMonitors)) {
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.MONITOR_MANAGER_VALID_MONITORS,
                {
                    identifier: safeSiteIdentifier,
                }
            )
        );
        return;
    }

    await setupIndividualNewMonitors(site, newMonitors);

    logger.info(
        `[MonitorManager] Completed setup for ${newMonitors.length} new monitors in site: ${safeSiteIdentifier}`
    );
}
