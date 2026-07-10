import type { Site } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import { setHas } from "ts-extras";

import type { MonitoringConfig } from "../../services/database/interfaces";
import { blockMonitorChecks } from "../../services/monitoring/MonitorExecutionFence";

interface MonitorMutationTarget {
    readonly identifier: string;
    readonly monitorId: string;
}

async function restoreStoppedMonitors(args: {
    monitoringConfig: MonitoringConfig;
    stoppedMonitors: readonly MonitorMutationTarget[];
}): Promise<Error[]> {
    const restorationErrors: Error[] = [];

    for (const target of args.stoppedMonitors.toReversed()) {
        try {
            // eslint-disable-next-line no-await-in-loop -- Rollback must preserve reverse stop order.
            const wasRestored = await args.monitoringConfig.startMonitoring(
                target.identifier,
                target.monitorId
            );
            if (!wasRestored) {
                restorationErrors.push(
                    new Error("Failed to restore monitor after site mutation")
                );
            }
        } catch (error: unknown) {
            restorationErrors.push(ensureError(error));
        }
    }

    return restorationErrors;
}

async function withMonitorsStopped<T>(args: {
    monitoringConfig: MonitoringConfig;
    operation: () => Promise<T>;
    targets: readonly MonitorMutationTarget[];
}): Promise<T> {
    const stoppedMonitors: MonitorMutationTarget[] = [];
    const releaseCheckBlock = blockMonitorChecks(
        args.targets.map(({ monitorId }) => monitorId)
    );
    let isCheckBlockReleased = false;
    const releaseCheckBlockOnce = (): void => {
        if (isCheckBlockReleased) {
            return;
        }
        isCheckBlockReleased = true;
        releaseCheckBlock();
    };

    try {
        for (const target of args.targets) {
            // eslint-disable-next-line no-await-in-loop -- Stops are ordered so partial failure can be rolled back deterministically.
            const wasStopped = await args.monitoringConfig.stopMonitoring(
                target.identifier,
                target.monitorId
            );
            if (!wasStopped) {
                throw new Error("Failed to stop monitor before site mutation");
            }
            stoppedMonitors.push(target);
        }

        return await args.operation();
    } catch (error: unknown) {
        const normalizedError = ensureError(error);
        releaseCheckBlockOnce();
        const restorationErrors = await restoreStoppedMonitors({
            monitoringConfig: args.monitoringConfig,
            stoppedMonitors,
        });

        if (restorationErrors.length > 0) {
            throw new AggregateError(
                [normalizedError, ...restorationErrors],
                "Site mutation failed and monitor scheduling could not be fully restored",
                { cause: error }
            );
        }

        throw normalizedError;
    } finally {
        releaseCheckBlockOnce();
    }
}

/**
 * Stops monitors removed by a full site update before persistence.
 *
 * @remarks
 * If stopping or persistence fails, every monitor already stopped by this
 * operation is restarted before the original failure is propagated.
 */
export async function withRemovedMonitorsStopped<T>(args: {
    identifier: string;
    monitoringConfig: MonitoringConfig;
    nextMonitors: Site["monitors"];
    operation: () => Promise<T>;
    originalMonitors: Site["monitors"];
}): Promise<T> {
    const nextMonitorIds = new Set(
        args.nextMonitors.map(({ id }) => id).filter(Boolean)
    );
    const removedMonitorIds = args.originalMonitors
        .map(({ id }) => id)
        .filter((id) => id.length > 0 && !setHas(nextMonitorIds, id));

    return withMonitorsStopped({
        monitoringConfig: args.monitoringConfig,
        operation: args.operation,
        targets: removedMonitorIds.map((monitorId) => ({
            identifier: args.identifier,
            monitorId,
        })),
    });
}

/** Stops and blocks every monitor while a multi-site mutation executes. */
export async function withSitesMonitorsStopped<T>(args: {
    monitoringConfig: MonitoringConfig;
    operation: () => Promise<T>;
    sites: readonly Site[];
}): Promise<T> {
    return withMonitorsStopped({
        monitoringConfig: args.monitoringConfig,
        operation: args.operation,
        targets: args.sites.flatMap((site) =>
            site.monitors
                .filter(({ id }) => id.length > 0)
                .map(({ id }) => ({
                    identifier: site.identifier,
                    monitorId: id,
                }))
        ),
    });
}
