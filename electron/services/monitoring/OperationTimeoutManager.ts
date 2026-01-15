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

import type { MonitorRepository } from "../database/MonitorRepository";
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

    private readonly monitorRepository: MonitorRepository;

    private readonly timeouts = new Map<string, NodeJS.Timeout>();

    /**
     * Handle timeout of an operation.
     *
     * @param operationId - ID of operation that timed out
     */
private async handleTimeout(operationId: string): Promise<void> {
        const operation = this.operationRegistry.getOperation(operationId);
        if (!operation) {
            this.clearTimeout(operationId);
            return;
        }

        if (!operation.signal.aborted) {
            logger.warn(
                interpolateLogTemplate(
                    LOG_TEMPLATES.warnings.OPERATION_TIMEOUT,
                    { operationId }
                )
            );

            // Preserve existing behaviour: a timeout indicates the monitor is
            // in a bad state; cancel correlated operations.
            this.operationRegistry.cancelOperations(operation.monitorId);
        }

        // Ensure stale operation IDs don't accumulate in persistent storage.
        try {
            await this.monitorRepository.clearActiveOperations(
                operation.monitorId
            );
        } catch (error) {
            logger.warn(
                `Failed to clear active operations for monitor ${operation.monitorId}`,
                error
            );
        } finally {
            // Always remove this operation from the registry (even if already
            // aborted). Otherwise aborted operations can leak indefinitely when
            // the underlying work never settles.
            this.operationRegistry.completeOperation(operationId);
            this.clearTimeout(operationId);
        }
    }

/**
     * Creates a new OperationTimeoutManager.
     *
     * @param operationRegistry - Registry for managing operations
     * @param monitorRepository - Repository used to clear stale active operation IDs
     */
    public constructor(
        operationRegistry: MonitorOperationRegistry,
        monitorRepository: MonitorRepository
    ) {
        this.operationRegistry = operationRegistry;
        this.monitorRepository = monitorRepository;
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
        // If a timeout was already scheduled for this operation, replace it.
        // Without clearing, the old timer can still fire later and cancel the
        // operation unexpectedly.
        this.clearTimeout(operationId);

        const timeout = setTimeout(() => {
            void this.handleTimeout(operationId);
        }, timeoutMs);

        this.timeouts.set(operationId, timeout);
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.OPERATION_TIMEOUT_SCHEDULED,
                { operationId, timeoutMs }
            )
        );
    }



}
