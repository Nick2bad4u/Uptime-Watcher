/**
 * Helpers for resuming monitor sessions after app restart.
 *
 * @remarks
 * This module is intentionally dependency-light and side-effect free. It is
 * used by {@link MonitoringLifecycleCoordinator} to keep coordinator logic
 * focused on orchestration rather than data-wrangling.
 */

import type { Monitor, Site } from "@shared/types";

import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";

import { MONITOR_START_CONCURRENCY } from "../../constants";
import { mapWithConcurrency } from "../../utils/boundedConcurrency";

/** A monitor + site pair that should have monitoring resumed. */
export interface MonitorResumptionCandidate {
    readonly monitor: Monitor;
    readonly site: Site;
}

/** Minimal logger surface used by the resumption helpers. */
export interface MonitoringResumptionLogger {
    readonly debug: (message: string) => void;
    readonly error: (message: string, error?: unknown) => void;
    readonly info: (message: string) => void;
    readonly warn: (message: string) => void;
}

const getSafeIdentifier = (identifier: string): string =>
    getSafeIdentifierForLogging(identifier) ?? identifier;

const getSafeMonitorLabel = (site: Site, monitor: Monitor): string =>
    `${getSafeIdentifier(site.identifier)}/${getSafeIdentifier(monitor.id)}`;

/**
 * Collects monitors that should have their monitoring resumed.
 */
export function collectMonitorsToResume(
    sites: readonly Site[]
): MonitorResumptionCandidate[] {
    const monitorsToResume: MonitorResumptionCandidate[] = [];

    for (const site of sites) {
        if (site.monitoring) {
            for (const monitor of site.monitors) {
                if (monitor.monitoring) {
                    monitorsToResume.push({ monitor, site });
                }
            }
        }
    }

    return monitorsToResume;
}

/**
 * Attempts to resume monitoring for each candidate.
 */
export async function resumeMonitoringCandidates(args: {
    candidates: readonly MonitorResumptionCandidate[];
    logger: MonitoringResumptionLogger;
    startMonitoringForSite: (
        identifier: string,
        monitorId?: string
    ) => Promise<boolean>;
}): Promise<{ attempted: number; succeeded: number }> {
    const { candidates, logger, startMonitoringForSite } = args;

    const results = await mapWithConcurrency({
        concurrency: MONITOR_START_CONCURRENCY,
        items: candidates,
        task: async ({ monitor, site }) => {
            const safeMonitorLabel = getSafeMonitorLabel(site, monitor);

            try {
                const isSuccess = await startMonitoringForSite(
                    site.identifier,
                    monitor.id
                );

                if (isSuccess) {
                    logger.debug(
                        `[MonitoringLifecycleCoordinator] Successfully resumed monitoring for monitor: ${safeMonitorLabel}`
                    );
                } else {
                    logger.warn(
                        `[MonitoringLifecycleCoordinator] Failed to resume monitoring for monitor: ${safeMonitorLabel}`
                    );
                }

                return isSuccess;
            } catch (error) {
                logger.error(
                    `[MonitoringLifecycleCoordinator] Error resuming monitoring for monitor ${safeMonitorLabel}:`,
                    error
                );
                return false;
            }
        },
    });

    const succeeded = results.filter(Boolean).length;

    return {
        attempted: candidates.length,
        succeeded,
    };
}
