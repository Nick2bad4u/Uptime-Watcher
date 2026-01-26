/**
 * Per-monitor setup helpers for newly added monitors.
 *
 * @remarks
 * Extracted from {@link MonitorManager}.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import { interpolateLogTemplate, LOG_TEMPLATES } from "@shared/utils/logTemplates";

import { logger } from "../../utils/logger";

/**
 * Applies default intervals and optional auto-start for new monitors.
 *
 * @param args - Operation arguments.
 */
export async function setupIndividualNewMonitorsOperation(args: {
    readonly autoStartNewMonitors: (
        site: Site,
        newMonitors: Site["monitors"]
    ) => Promise<void>;
    readonly defaultCheckIntervalMs: number;
    readonly newMonitors: Site["monitors"];
    readonly shouldApplyDefaultInterval: (monitor: Site["monitors"][0]) => boolean;
    readonly site: Site;
}): Promise<void> {
    const {
        autoStartNewMonitors,
        defaultCheckIntervalMs,
        newMonitors,
        shouldApplyDefaultInterval,
        site,
    } = args;

    for (const monitor of newMonitors) {
        if (shouldApplyDefaultInterval(monitor)) {
            monitor.checkInterval = defaultCheckIntervalMs;
            logger.debug(
                `[MonitorManager] Applied default interval ${monitor.checkInterval}ms to new monitor: ${monitor.id}`
            );
        }
    }

    if (site.monitoring) {
        await autoStartNewMonitors(site, newMonitors);
        return;
    }

    logger.debug(
        interpolateLogTemplate(LOG_TEMPLATES.debug.MONITOR_MANAGER_SKIP_AUTO_START, {
            identifier: site.identifier,
        })
    );
}
