/**
 * Helpers for resuming monitor sessions after application restart.
 *
 * @remarks
 * This module is intentionally dependency-light and side-effect free. It is
 * used by {@link MonitoringLifecycleCoordinator} to keep coordinator logic
 * focused on orchestration rather than data-wrangling.
 */

import type { Monitor, Site } from "@shared/types";

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

    const resumePromises = candidates.map(async ({ monitor, site }) => {
        try {
            const success = await startMonitoringForSite(
                site.identifier,
                monitor.id
            );

            if (success) {
                logger.debug(
                    `[MonitoringLifecycleCoordinator] Successfully resumed monitoring for monitor: ${site.identifier}/${monitor.id}`
                );
            } else {
                logger.warn(
                    `[MonitoringLifecycleCoordinator] Failed to resume monitoring for monitor: ${site.identifier}/${monitor.id}`
                );
            }

            return success;
        } catch (error) {
            logger.error(
                `[MonitoringLifecycleCoordinator] Error resuming monitoring for monitor ${site.identifier}/${monitor.id}:`,
                error
            );
            return false;
        }
    });

    const results = await Promise.allSettled(resumePromises);
    const succeeded = results.filter(
        (result) => result.status === "fulfilled" && result.value
    ).length;

    return {
        attempted: candidates.length,
        succeeded,
    };
}
