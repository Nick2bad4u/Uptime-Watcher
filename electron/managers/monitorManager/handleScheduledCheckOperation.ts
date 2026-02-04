/**
 * Scheduled check handler for {@link MonitorManager}.
 *
 * @remarks
 * Extracted to keep `MonitorManager.ts` focused on lifecycle orchestration.
 * This helper:
 *
 * - Loads the target site from cache
 * - Runs an enhanced monitor check
 * - Logs warnings/errors consistently
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

/**
 * Runs a scheduled check for a monitor.
 *
 * @param args - Operation arguments.
 */
export async function handleScheduledCheckOperation(args: {
    readonly checker: {
        readonly checkMonitor: (
            site: Site,
            monitorId: string,
            isManualCheck: boolean,
            signal: AbortSignal
        ) => Promise<unknown>;
    };
    readonly logger: Logger;
    readonly monitorId: string;
    readonly signal: AbortSignal;
    readonly siteIdentifier: string;
    readonly sitesCache: StandardizedCache<Site>;
}): Promise<void> {
    const { checker, logger, monitorId, signal, siteIdentifier, sitesCache } =
        args;

    const site = sitesCache.get(siteIdentifier);
    if (!site) {
        logger.warn(
            interpolateLogTemplate(
                LOG_TEMPLATES.warnings.SITE_NOT_FOUND_SCHEDULED,
                {
                    siteIdentifier,
                }
            )
        );
        return;
    }

    try {
        await checker.checkMonitor(site, monitorId, false, signal);
    } catch (error) {
        logger.error(
            interpolateLogTemplate(
                LOG_TEMPLATES.errors.MONITOR_CHECK_ENHANCED_FAILED,
                { monitorId }
            ),
            error
        );
    }
}
