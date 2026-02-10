/**
 * Default interval remediation for monitors.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to keep the main manager class focused
 * on lifecycle orchestration.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { withDatabaseOperation } from "../../utils/operationalHooks";

/**
 * Remediation dependencies for {@link applyDefaultIntervalsOperation}.
 *
 * @public
 */
export interface ApplyDefaultIntervalsDependencies {
    readonly databaseService: DatabaseService;
    readonly logger: Logger;
    readonly monitorRepository: MonitorRepository;
    readonly sitesCache: StandardizedCache<Site>;
}

/**
 * Ensures every monitor in the site respects the shared minimum interval.
 *
 * @param args - Operation arguments.
 */
export async function applyDefaultIntervalsOperation(args: {
    readonly defaultCheckIntervalMs: number;
    readonly dependencies: ApplyDefaultIntervalsDependencies;
    readonly shouldApplyDefaultInterval: (
        monitor: Site["monitors"][0]
    ) => boolean;
    readonly site: Site;
}): Promise<void> {
    const {
        defaultCheckIntervalMs,
        dependencies,
        shouldApplyDefaultInterval,
        site,
    } = args;

    dependencies.logger.debug(
        interpolateLogTemplate(
            LOG_TEMPLATES.debug.MONITOR_MANAGER_INTERVALS_SETTING,
            {
                identifier: site.identifier,
            }
        )
    );

    const monitorsNeedingRemediation = site.monitors.filter(
        (monitor): monitor is Site["monitors"][0] & { id: string } =>
            Boolean(monitor.id) && shouldApplyDefaultInterval(monitor)
    );

    if (monitorsNeedingRemediation.length === 0) {
        dependencies.logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.MONITOR_MANAGER_VALID_MONITORS,
                {
                    identifier: site.identifier,
                }
            )
        );
        return;
    }

    await withDatabaseOperation(
        () =>
            dependencies.databaseService.executeTransaction((db) => {
                const monitorTx =
                    dependencies.monitorRepository.createTransactionAdapter(db);

                for (const monitor of monitorsNeedingRemediation) {
                    monitorTx.update(monitor.id, {
                        checkInterval: defaultCheckIntervalMs,
                    });

                    dependencies.logger.debug(
                        interpolateLogTemplate(
                            LOG_TEMPLATES.debug.MONITOR_INTERVALS_APPLIED,
                            {
                                interval: defaultCheckIntervalMs / 1000,
                                monitorId: monitor.id,
                            }
                        )
                    );
                }

                return Promise.resolve();
            }),
        "monitor-manager-apply-default-interval",
        undefined,
        {
            identifier: site.identifier,
            interval: defaultCheckIntervalMs,
            monitorCount: monitorsNeedingRemediation.length,
        }
    );

    for (const monitor of monitorsNeedingRemediation) {
        monitor.checkInterval = defaultCheckIntervalMs;
    }

    const updatedSite: Site = {
        ...site,
        monitors: Array.from(site.monitors),
    };

    site.monitors = updatedSite.monitors;

    dependencies.sitesCache.set(site.identifier, updatedSite);

    dependencies.logger.info(
        interpolateLogTemplate(
            LOG_TEMPLATES.services.MONITOR_MANAGER_APPLYING_INTERVALS,
            {
                identifier: site.identifier,
            }
        )
    );
}
