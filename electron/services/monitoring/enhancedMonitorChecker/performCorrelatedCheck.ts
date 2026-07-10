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
import { runExclusiveMonitorCheck } from "../MonitorExecutionFence";

/**
 * Performs a correlated monitor check using an operation coordinator.
 */
export async function performCorrelatedCheck(args: {
    readonly cleanupFailedOperation: (
        monitorId: string,
        operationId: string
    ) => Promise<void>;
    readonly executeMonitorCheck: (
        context: MonitorCheckContext & { operationId: string }
    ) => Promise<StatusUpdateMonitorCheckResult>;
    readonly externalSignal?: AbortSignal;
    readonly handleSuccessfulCheck: (
        site: Site,
        monitor: Monitor,
        checkResult: StatusUpdateMonitorCheckResult
    ) => Promise<StatusUpdate | undefined>;
    readonly isOperationValid: (operationId: string) => boolean;
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
        cleanupFailedOperation,
        executeMonitorCheck,
        externalSignal,
        handleSuccessfulCheck,
        isOperationValid,
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
                if (!isOperationValid(operationId)) {
                    await cleanupFailedOperation(monitorId, operationId);
                    return undefined;
                }

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
                await cleanupFailedOperation(monitorId, operationId);
            }

            return undefined;
        },
        skipIfBusy: true,
    });
}
