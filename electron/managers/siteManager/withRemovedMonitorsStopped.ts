import type { Site } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import { setHas } from "ts-extras";

import type { MonitoringConfig } from "../../services/database/interfaces";

async function restoreStoppedMonitors(args: {
    identifier: string;
    monitoringConfig: MonitoringConfig;
    stoppedMonitorIds: readonly string[];
}): Promise<Error[]> {
    const restorationErrors: Error[] = [];

    for (const monitorId of args.stoppedMonitorIds.toReversed()) {
        try {
            // eslint-disable-next-line no-await-in-loop -- Rollback must preserve reverse stop order.
            await args.monitoringConfig.startMonitoring(
                args.identifier,
                monitorId
            );
        } catch (error: unknown) {
            restorationErrors.push(ensureError(error));
        }
    }

    return restorationErrors;
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
    const stoppedMonitorIds: string[] = [];

    try {
        for (const monitorId of removedMonitorIds) {
            // eslint-disable-next-line no-await-in-loop -- Stops are ordered so partial failure can be rolled back deterministically.
            const wasStopped = await args.monitoringConfig.stopMonitoring(
                args.identifier,
                monitorId
            );
            if (wasStopped) {
                stoppedMonitorIds.push(monitorId);
            }
        }

        return await args.operation();
    } catch (error: unknown) {
        const normalizedError = ensureError(error);
        const restorationErrors = await restoreStoppedMonitors({
            identifier: args.identifier,
            monitoringConfig: args.monitoringConfig,
            stoppedMonitorIds,
        });

        if (restorationErrors.length > 0) {
            throw new AggregateError(
                [normalizedError, ...restorationErrors],
                "Site update failed and removed monitor scheduling could not be fully restored",
                { cause: error }
            );
        }

        throw normalizedError;
    }
}
