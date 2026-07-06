/**
 * Strategy execution and normalization for monitor checks.
 *
 * @remarks
 * Extracted from
 * {@link electron/services/monitoring/EnhancedMonitorChecker#EnhancedMonitorChecker}
 * so the class can stay focused on orchestration (correlation, timeouts,
 * persistence, and event emission).
 *
 * This helper is the canonical code path for executing monitor strategies and
 * coercing any invalid or thrown results into a stable
 * {@link StatusUpdateMonitorCheckResult}.
 *
 * @packageDocumentation
 */

import { ensureError } from "@shared/utils/errorHandling";
import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import type { MonitorCheckContext } from "../checkContext";
import type { StatusUpdateMonitorCheckResult } from "../MonitorStatusUpdateService";
import type { MonitorStrategyRegistry } from "../strategies/MonitorStrategyRegistry";
import type { MonitorCheckResult } from "../types";

import { monitorLogger as logger } from "../../../utils/logger";
import {
    buildStatusUpdateMonitorCheckResult,
    isValidServiceResult,
    toFailure,
} from "../utils/monitorCheckResultNormalization";

/**
 * Executes a monitor strategy and returns both the raw service result and the
 * normalized {@link StatusUpdateMonitorCheckResult}.
 *
 * @param args - Execution arguments.
 */
export async function runServiceCheckOperation(args: {
    readonly context: MonitorCheckContext;
    readonly operationId: string;
    readonly strategyRegistry: MonitorStrategyRegistry;
}): Promise<{
    readonly checkResult: StatusUpdateMonitorCheckResult;
    readonly serviceResult: MonitorCheckResult;
}> {
    try {
        const raw: unknown = await args.strategyRegistry.execute(
            args.context.monitor,
            args.context
        );

        const serviceResult = isValidServiceResult(raw)
            ? raw
            : toFailure("Invalid monitor check result");

        return {
            checkResult: buildStatusUpdateMonitorCheckResult({
                monitorId: args.context.monitor.id,
                operationId: args.operationId,
                serviceResult,
            }),
            serviceResult,
        };
    } catch (error) {
        const safeError = ensureError(error);
        const safeMonitorId =
            getSafeIdentifierForLogging(args.context.monitor.id) ??
            args.context.monitor.id;
        logger.error(
            `Monitor check failed for ${safeMonitorId}`,
            safeError
        );

        const serviceResult = toFailure(getUserFacingErrorDetail(error));

        return {
            checkResult: buildStatusUpdateMonitorCheckResult({
                monitorId: args.context.monitor.id,
                operationId: args.operationId,
                serviceResult,
            }),
            serviceResult,
        };
    }
}
