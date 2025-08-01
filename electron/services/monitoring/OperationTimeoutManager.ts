/**
 * Operation timeout manager for monitoring operations.
 *
 * @remarks
 * Manages timeouts for monitoring operations to prevent resource leaks
 * and ensure stale operations are properly cleaned up.
 *
 * @packageDocumentation
 */

import { monitorLogger as logger } from "../../utils/logger";
import { MonitorOperationRegistry } from "./MonitorOperationRegistry";

/**
 * Manages timeouts for monitoring operations.
 *
 * @remarks
 * Provides automatic cleanup of operations that exceed their timeout
 * period, preventing resource leaks and ensuring system stability.
 *
 * @public
 */
export class OperationTimeoutManager {
    private readonly timeouts: Map<string, NodeJS.Timeout> = new Map();

    /**
     * Creates a new OperationTimeoutManager.
     *
     * @param operationRegistry - Registry for managing operations
     */
    constructor(private readonly operationRegistry: MonitorOperationRegistry) {}

    /**
     * Clear a timeout for a specific operation.
     *
     * @param operationId - ID of operation to clear timeout for
     */
    clearTimeout(operationId: string): void {
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
    scheduleTimeout(operationId: string, timeoutMs: number): void {
        const timeout = setTimeout(() => {
            this.handleTimeout(operationId);
        }, timeoutMs);

        this.timeouts.set(operationId, timeout);
        logger.debug(`Scheduled timeout for operation ${operationId} (${timeoutMs}ms)`);
    }

    /**
     * Handle timeout of an operation.
     *
     * @param operationId - ID of operation that timed out
     */
    private handleTimeout(operationId: string): void {
        const operation = this.operationRegistry.getOperation(operationId);
        if (operation && !operation.cancelled) {
            logger.warn(`Operation ${operationId} timed out, cancelling`);
            this.operationRegistry.cancelOperations(operation.monitorId);
        }

        this.clearTimeout(operationId);
    }
}
