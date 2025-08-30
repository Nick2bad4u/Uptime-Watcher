/**
 * Operation timeout manager for monitoring operations.
 *
 * @remarks
 * Manages timeouts for monitoring operations to prevent resource leaks and
 * ensure stale operations are properly cleaned up.
 *
 * @packageDocumentation
 */

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { MonitorOperationRegistry } from "./MonitorOperationRegistry";

import { monitorLogger as logger } from "../../utils/logger";

/**
 * Manages timeouts for monitoring operations.
 *
 * @remarks
 * Provides automatic cleanup of operations that exceed their timeout period,
 * preventing resource leaks and ensuring system stability.
 *
 * @public
 */
export class OperationTimeoutManager {
    /**
     * Registry for managing operations
     */
    private readonly operationRegistry: MonitorOperationRegistry;

    private readonly timeouts = new Map<string, NodeJS.Timeout>();

    /**
     * Creates a new OperationTimeoutManager.
     *
     * @param operationRegistry - Registry for managing operations
     */
    public constructor(operationRegistry: MonitorOperationRegistry) {
        this.operationRegistry = operationRegistry;
    }

    /**
     * Clear a timeout for a specific operation.
     *
     * @param operationId - ID of operation to clear timeout for
     */
    public clearTimeout(operationId: string): void {
        const timeout = this.timeouts.get(operationId);
        if (timeout) {
            clearTimeout(timeout);
            this.timeouts.delete(operationId);
            logger.debug(`Cleared timeout for operation ${operationId}`);
        }
    }

    /**
     * Schedule a timeout for an operation.
     *
     * @param operationId - ID of operation to timeout
     * @param timeoutMs - Timeout duration in milliseconds
     */
    public scheduleTimeout(operationId: string, timeoutMs: number): void {
        const timeout = setTimeout(() => {
            this.handleTimeout(operationId);
        }, timeoutMs);

        this.timeouts.set(operationId, timeout);
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.OPERATION_TIMEOUT_SCHEDULED,
                { operationId, timeoutMs }
            )
        );
    }

    /**
     * Handle timeout of an operation.
     *
     * @param operationId - ID of operation that timed out
     */
    private handleTimeout(operationId: string): void {
        const operation = this.operationRegistry.getOperation(operationId);
        if (operation && !operation.signal.aborted) {
            logger.warn(
                interpolateLogTemplate(
                    LOG_TEMPLATES.warnings.OPERATION_TIMEOUT,
                    { operationId }
                )
            );
            this.operationRegistry.cancelOperations(operation.monitorId);
        }

        this.clearTimeout(operationId);
    }
}
