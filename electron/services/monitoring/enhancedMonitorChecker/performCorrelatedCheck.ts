import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { StatusUpdateMonitorCheckResult } from "../MonitorStatusUpdateService";

import {
    createMonitorCheckContext,
    type MonitorCheckContext,
} from "../checkContext";

interface MonitorCheckQueueEntry {
    readonly completion: Promise<void>;
}

const activeMonitorChecks = new Map<string, MonitorCheckQueueEntry>();

/**
 * Runs a check with per-monitor exclusivity.
 *
 * @remarks
 * Correlated checks retain their existing single-flight behavior by skipping
 * when the monitor is busy. Manual checks use the same gate without skipping,
 * allowing them to wait for a cancelled correlated check to finish unwinding.
 */
export async function runExclusiveMonitorCheck<T>(args: {
    readonly monitorId: string;
    readonly operation: () => Promise<T>;
    readonly skipIfBusy: boolean;
}): Promise<T | undefined> {
    const { monitorId, operation, skipIfBusy } = args;
    const previousEntry = activeMonitorChecks.get(monitorId);

    if (previousEntry && skipIfBusy) {
        return undefined;
    }

    let releaseEntry: () => void = () => undefined;
    const entry: MonitorCheckQueueEntry = {
        completion: new Promise<void>((resolve) => {
            releaseEntry = resolve;
        }),
    };
    activeMonitorChecks.set(monitorId, entry);

    try {
        if (previousEntry) {
            await previousEntry.completion;
        }

        return await operation();
    } finally {
        releaseEntry();
        if (activeMonitorChecks.get(monitorId) === entry) {
            activeMonitorChecks.delete(monitorId);
        }
    }
}

/**
 * Performs a correlated monitor check using an operation coordinator.
 */
export async function performCorrelatedCheck(args: {
    readonly cleanupOperation: (operationId: string) => void;
    readonly executeMonitorCheck: (
        context: MonitorCheckContext & { operationId: string }
    ) => Promise<StatusUpdateMonitorCheckResult>;
    readonly externalSignal?: AbortSignal;
    readonly handleSuccessfulCheck: (
        site: Site,
        monitor: Monitor,
        checkResult: StatusUpdateMonitorCheckResult
    ) => Promise<StatusUpdate | undefined>;
    readonly logger: Logger;
    readonly monitor: Monitor;
    readonly monitorId: string;
    readonly saveHistoryEntry: (
        monitor: Monitor,
        checkResult: StatusUpdateMonitorCheckResult
    ) => Promise<void>;
    readonly setupOperationCorrelation: (
        monitor: Monitor,
        options?: { readonly additionalSignals?: AbortSignal[] }
    ) => Promise<undefined | { operationId: string; signal: AbortSignal }>;
    readonly site: Site;
    readonly updateMonitorStatus: (
        checkResult: StatusUpdateMonitorCheckResult
    ) => Promise<boolean>;
}): Promise<StatusUpdate | undefined> {
    const {
        cleanupOperation,
        executeMonitorCheck,
        externalSignal,
        handleSuccessfulCheck,
        logger,
        monitor,
        monitorId,
        saveHistoryEntry,
        setupOperationCorrelation,
        site,
        updateMonitorStatus,
    } = args;

    return runExclusiveMonitorCheck({
        monitorId,
        operation: async () => {
            const operationResult = await setupOperationCorrelation(monitor, {
                ...(externalSignal && {
                    additionalSignals: [externalSignal],
                }),
            });
            if (!operationResult) {
                return undefined;
            }

            const { operationId, signal: operationSignal } = operationResult;

            const context: MonitorCheckContext & { operationId: string } = {
                ...createMonitorCheckContext({
                    monitor,
                    operationId,
                    signal: operationSignal,
                    site,
                }),
                operationId,
            };

            logger.info(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_CHECK_START,
                    {
                        monitorId: getSafeIdentifierForLogging(monitor.id),
                        operationId,
                        siteIdentifier: getSafeIdentifierForLogging(
                            site.identifier
                        ),
                    }
                )
            );

            try {
                const checkResult = await executeMonitorCheck(context);
                await saveHistoryEntry(monitor, checkResult);

                const isUpdated = await updateMonitorStatus(checkResult);
                if (isUpdated) {
                    return await handleSuccessfulCheck(
                        site,
                        monitor,
                        checkResult
                    );
                }
            } catch (error) {
                logger.error("Monitor check failed", error, {
                    monitorId: getSafeIdentifierForLogging(monitorId),
                });
                cleanupOperation(operationId);
            }

            return undefined;
        },
        skipIfBusy: true,
    });
}
