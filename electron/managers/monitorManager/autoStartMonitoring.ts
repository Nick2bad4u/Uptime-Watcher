/**
 * Auto-start policy helpers for monitor scheduling.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to keep
 * the manager focused on lifecycle orchestration.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { isEmpty } from "ts-extras";

import { MONITOR_START_CONCURRENCY } from "../../constants";
import { isDev } from "../../electronUtils";
import { mapWithConcurrency } from "../../utils/boundedConcurrency";

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
    if (isEmpty(site.monitors)) {
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

    // Start only monitors that have monitoring enabled while bounding fanout
    // for large imported/restored site definitions.
    await mapWithConcurrency({
        concurrency: MONITOR_START_CONCURRENCY,
        items: site.monitors,
        task: async (monitor) => {
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
        },
    });

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

    await mapWithConcurrency({
        concurrency: MONITOR_START_CONCURRENCY,
        items: newMonitors,
        task: async (monitor) => {
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
        },
    });
}
