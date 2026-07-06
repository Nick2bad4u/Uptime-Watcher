/**
 * Monitor start/stop helpers for
 * {@link electron/services/monitoring/EnhancedMonitorChecker#EnhancedMonitorChecker}.
 *
 * @remarks
 * Extracted from `EnhancedMonitorChecker.ts` to keep the checker focused on
 * check execution (direct vs correlated) while centralizing state toggling and
 * event emission.
 *
 * @packageDocumentation
 */

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";

import type { EnhancedMonitoringDependencies } from "../EnhancedMonitoringDependencies";

import { monitorLogger as logger } from "../../../utils/logger";

type ToggleMonitoringDependencies = Pick<
    EnhancedMonitoringDependencies,
    "eventEmitter" | "monitorRepository" | "operationRegistry"
>;

interface ToggleMonitoringOperationArgs {
    readonly dependencies: ToggleMonitoringDependencies;
    readonly monitorId: string;
    readonly siteIdentifier: string;
}

type ToggleMonitoringAction = "start" | "stop";

interface ToggleMonitoringConfig {
    readonly action: ToggleMonitoringAction;
    readonly failureVerb: ToggleMonitoringAction;
    readonly logTemplate: string;
    readonly monitoring: boolean;
}

const getSafeIdentifier = (identifier: string): string =>
    getSafeIdentifierForLogging(identifier) ?? identifier;

const emitMonitoringToggled = async (
    args: ToggleMonitoringOperationArgs,
    action: ToggleMonitoringAction
): Promise<void> => {
    const { dependencies, monitorId, siteIdentifier } = args;
    const timestamp = Date.now();

    if (action === "start") {
        await dependencies.eventEmitter.emitTyped("internal:monitor:started", {
            identifier: siteIdentifier,
            monitorId,
            operation: "started",
            timestamp,
        });
        return;
    }

    await dependencies.eventEmitter.emitTyped("internal:monitor:stopped", {
        identifier: siteIdentifier,
        monitorId,
        operation: "stopped",
        reason: "user",
        timestamp,
    });
};

const runToggleMonitoringOperation = async (
    args: ToggleMonitoringOperationArgs,
    config: ToggleMonitoringConfig
): Promise<boolean> => {
    const { dependencies, monitorId, siteIdentifier } = args;
    const safeMonitorId = getSafeIdentifier(monitorId);
    const safeSiteIdentifier = getSafeIdentifier(siteIdentifier);

    try {
        dependencies.operationRegistry.cancelOperations(monitorId);

        await dependencies.monitorRepository.update(monitorId, {
            activeOperations: [],
            monitoring: config.monitoring,
        });

        logger.info(
            interpolateLogTemplate(config.logTemplate, {
                monitorId: safeMonitorId,
                siteIdentifier: safeSiteIdentifier,
            })
        );

        await emitMonitoringToggled(args, config.action);

        return true;
    } catch (error) {
        logger.error(
            `Failed to ${config.failureVerb} monitoring for monitor ${safeMonitorId}`,
            error
        );
        return false;
    }
};

/**
 * Enables monitoring for a monitor.
 *
 * @param args - Operation arguments.
 */
export const startMonitoringOperation = (
    args: ToggleMonitoringOperationArgs
): Promise<boolean> =>
    runToggleMonitoringOperation(args, {
        action: "start",
        failureVerb: "start",
        logTemplate: LOG_TEMPLATES.services.MONITOR_STARTED,
        monitoring: true,
    });

/**
 * Disables monitoring for a monitor.
 *
 * @param args - Operation arguments.
 */
export const stopMonitoringOperation = (
    args: ToggleMonitoringOperationArgs
): Promise<boolean> =>
    runToggleMonitoringOperation(args, {
        action: "stop",
        failureVerb: "stop",
        logTemplate: LOG_TEMPLATES.services.MONITOR_STOPPED,
        monitoring: false,
    });
