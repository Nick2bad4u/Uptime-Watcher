/**
 * Manual check operation helpers.
 *
 * @remarks
 * Extracted from {@link MonitorManager} to keep the manager focused on lifecycle
 * orchestration.
 *
 * @packageDocumentation
 */

import type { Site, StatusUpdate } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

/**
 * Dependencies required for {@link checkSiteManuallyOperation}.
 *
 * @public
 */
export interface CheckSiteManuallyDependencies {
    readonly checkMonitor: (
        site: Site,
        monitorId: string,
        isManual: boolean
    ) => Promise<StatusUpdate | undefined>;
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    readonly logger: Logger;
    readonly sitesCache: StandardizedCache<Site>;
}

/**
 * Triggers a manual check for a site monitor and emits completion events.
 *
 * @param args - Operation arguments.
 */
export async function checkSiteManuallyOperation(args: {
    readonly dependencies: CheckSiteManuallyDependencies;
    readonly identifier: string;
    readonly monitorId: string | undefined;
}): Promise<StatusUpdate | undefined> {
    const { dependencies, identifier, monitorId } = args;

    // Use enhanced monitoring for manual checks when a target monitor is
    // specified.
    if (monitorId) {
        const site = dependencies.sitesCache.get(identifier);
        if (site) {
            const result = await dependencies.checkMonitor(
                site,
                monitorId,
                true
            );

            // Only emit event if result is available
            if (result) {
                await dependencies.eventEmitter.emitTyped(
                    "internal:monitor:manual-check-completed",
                    {
                        identifier,
                        monitorId,
                        operation: "manual-check-completed",
                        result,
                        timestamp: Date.now(),
                    }
                );
            }

            return result;
        }
    }

    // For site-wide checks without specific monitorId, check the first monitor.
    const site = dependencies.sitesCache.get(identifier);
    if (!site?.monitors.length) {
        dependencies.logger.warn(
            interpolateLogTemplate(
                LOG_TEMPLATES.warnings.SITE_NOT_FOUND_MANUAL,
                {
                    identifier,
                }
            )
        );
        return undefined;
    }

    const firstMonitorId = site.monitors.find((monitor) =>
        Boolean(monitor.id)
    )?.id;
    if (firstMonitorId) {
        return checkSiteManuallyOperation({
            dependencies,
            identifier,
            monitorId: firstMonitorId,
        });
    }

    return undefined;
}
