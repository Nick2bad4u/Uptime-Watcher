/**
 * New-monitor setup helpers.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to keep the manager focused on
 * orchestration.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import { logger } from "../../utils/logger";

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

    logger.debug(
        interpolateLogTemplate(
            LOG_TEMPLATES.debug.MONITOR_MANAGER_SETUP_MONITORS,
            {
                count: newMonitorIds.length,
                identifier: site.identifier,
            }
        )
    );

    const newMonitors = site.monitors.filter(
        (monitor) => monitor.id && newMonitorIds.includes(monitor.id)
    );

    if (newMonitors.length === 0) {
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.MONITOR_MANAGER_VALID_MONITORS,
                {
                    identifier: site.identifier,
                }
            )
        );
        return;
    }

    await setupIndividualNewMonitors(site, newMonitors);

    logger.info(
        `[MonitorManager] Completed setup for ${newMonitors.length} new monitors in site: ${site.identifier}`
    );
}
