/**
 * Monitor start/stop helpers for {@link EnhancedMonitorChecker}.
 *
 * @remarks
 * Extracted from `EnhancedMonitorChecker.ts` to keep the checker focused on
 * check execution (direct vs correlated) while centralizing state toggling and
 * event emission.
 *
 * @packageDocumentation
 */

import { interpolateLogTemplate, LOG_TEMPLATES } from "@shared/utils/logTemplates";

import type { EnhancedMonitoringDependencies } from "../EnhancedMonitoringDependencies";

import { monitorLogger as logger } from "../../../utils/logger";

/**
 * Enables monitoring for a monitor.
 *
 * @param args - Operation arguments.
 */
export async function startMonitoringOperation(args: {
    readonly dependencies: Pick<
        EnhancedMonitoringDependencies,
        "eventEmitter" | "monitorRepository" | "operationRegistry"
    >;
    readonly monitorId: string;
    readonly siteIdentifier: string;
}): Promise<boolean> {
    const { dependencies, monitorId, siteIdentifier } = args;

    try {
        // Cancel any existing operations for this monitor
        dependencies.operationRegistry.cancelOperations(monitorId);

        // Update monitor state to monitoring
        await dependencies.monitorRepository.update(monitorId, {
            activeOperations: [],
            monitoring: true,
        });

        logger.info(
            interpolateLogTemplate(LOG_TEMPLATES.services.MONITOR_STARTED, {
                monitorId,
                siteIdentifier,
            })
        );

        // Emit event
        await dependencies.eventEmitter.emitTyped("internal:monitor:started", {
            identifier: siteIdentifier,
            monitorId,
            operation: "started",
            timestamp: Date.now(),
        });

        return true;
    } catch (error) {
        logger.error(`Failed to start monitoring for monitor ${monitorId}`, error);
        return false;
    }
}

/**
 * Disables monitoring for a monitor.
 *
 * @param args - Operation arguments.
 */
export async function stopMonitoringOperation(args: {
    readonly dependencies: Pick<
        EnhancedMonitoringDependencies,
        "eventEmitter" | "monitorRepository" | "operationRegistry"
    >;
    readonly monitorId: string;
    readonly siteIdentifier: string;
}): Promise<boolean> {
    const { dependencies, monitorId, siteIdentifier } = args;

    try {
        // Cancel all active operations for this monitor
        dependencies.operationRegistry.cancelOperations(monitorId);

        // Update monitor state to not monitoring
        await dependencies.monitorRepository.update(monitorId, {
            activeOperations: [],
            monitoring: false,
        });

        logger.info(
            interpolateLogTemplate(LOG_TEMPLATES.services.MONITOR_STOPPED, {
                monitorId,
                siteIdentifier,
            })
        );

        // Emit event
        await dependencies.eventEmitter.emitTyped("internal:monitor:stopped", {
            identifier: siteIdentifier,
            monitorId,
            operation: "stopped",
            reason: "user",
            timestamp: Date.now(),
        });

        return true;
    } catch (error) {
        logger.error(`Failed to stop monitoring for monitor ${monitorId}`, error);
        return false;
    }
}
