/**
 * Auto-start policy helpers for monitor scheduling.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to keep the manager focused on lifecycle
 * orchestration.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import { isDev } from "../../electronUtils";

/**
 * Auto-starts eligible monitors for a site that has just been loaded.
 *
 * @remarks
 * Site-level monitoring acts as a master switch. When enabled, only monitors
 * with `monitor.monitoring === true` will be started.
 *
 * @param args - Operation arguments.
 */
export async function autoStartMonitoringIfAppropriateOperation(args: {
    readonly logger: Logger;
    readonly site: Site;
    readonly startMonitoringForSite: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<boolean>;
}): Promise<void> {
    const { logger, site, startMonitoringForSite } = args;

    logger.debug(
        `[MonitorManager] Evaluating auto-start for site: ${site.identifier} (site.monitoring: ${site.monitoring})`
    );

    // Site-level monitoring acts as a master switch
    if (!site.monitoring) {
        logger.debug(
            `[MonitorManager] Site monitoring disabled, skipping all monitors for site: ${site.identifier}`
        );
        return;
    }

    // Only process sites that have monitors
    if (site.monitors.length === 0) {
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.MONITOR_MANAGER_NO_MONITORS_FOUND,
                {
                    identifier: site.identifier,
                }
            )
        );
        return;
    }

    logger.debug(
        interpolateLogTemplate(
            LOG_TEMPLATES.debug.MONITOR_MANAGER_AUTO_STARTING_SITE,
            {
                identifier: site.identifier,
            }
        )
    );

    // Start only monitors that have monitoring enabled (respecting individual
    // monitor states) - run in parallel for better performance.
    const startPromises = site.monitors.map(async (monitor) => {
        if (monitor.id && monitor.monitoring) {
            await startMonitoringForSite(site.identifier, monitor.id);

            if (isDev()) {
                logger.debug(
                    `[MonitorManager] Auto-started monitoring for monitor ${monitor.id} with interval ${monitor.checkInterval}ms`
                );
            }
            return;
        }

        if (monitor.id && !monitor.monitoring) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_MANAGER_SKIP_INDIVIDUAL,
                    {
                        monitorId: monitor.id,
                    }
                )
            );
            return;
        }

        // Monitor has no valid ID or is in an unknown state
        logger.warn(
            "[MonitorManager] Skipping monitor without valid ID or in unknown state"
        );
    });

    await Promise.all(startPromises);

    logger.info(
        interpolateLogTemplate(
            LOG_TEMPLATES.services.MONITOR_MANAGER_AUTO_STARTING,
            {
                identifier: site.identifier,
            }
        )
    );
}

/**
 * Auto-starts eligible monitors that have just been added to a site.
 *
 * @param args - Operation arguments.
 */
export async function autoStartNewMonitorsOperation(args: {
    readonly logger: Logger;
    readonly newMonitors: Site["monitors"];
    readonly siteIdentifier: string;
    readonly startMonitoringForSite: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<boolean>;
}): Promise<void> {
    const { logger, newMonitors, siteIdentifier, startMonitoringForSite } =
        args;

    // Start new monitors in parallel for better performance
    const startPromises = newMonitors.map(async (monitor) => {
        if (monitor.id && monitor.monitoring) {
            await startMonitoringForSite(siteIdentifier, monitor.id);
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_AUTO_STARTED,
                    {
                        monitorId: monitor.id,
                    }
                )
            );
            return;
        }

        if (monitor.id && !monitor.monitoring) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_MANAGER_SKIP_NEW_INDIVIDUAL,
                    {
                        monitorId: monitor.id,
                    }
                )
            );
        }
    });

    await Promise.all(startPromises);
}
