/**
 * Monitor operation registry for tracking and correlating monitoring operations.
 *
 * @remarks
 * This service provides operation correlation to prevent race conditions between
 * monitor state changes and delayed check operations. Each monitoring operation
 * is assigned a unique ID and tracked throughout its lifecycle.
 *
 * @packageDocumentation
 */

import { interpolateLogTemplate, LOG_TEMPLATES } from "../../../shared/utils/logTemplates";
import { monitorLogger as logger } from "../../utils/logger";

/**
 * Interface for monitor check operations.
 *
 * @remarks
 * Represents a single monitoring check operation with correlation ID
 * and cancellation support.
 *
 * @public
 */
export interface MonitorCheckOperation {
    /** Cancellation flag */
    cancelled: boolean;
    /** Unique operation ID */
    id: string;
    /** When operation started */
    initiatedAt: Date;
    /** Monitor being checked */
    monitorId: string;
}

/**
 * Interface for monitor check results.
 *
 * @remarks
 * Links check results back to their originating operation for validation.
 *
 * @public
 */
export interface MonitorCheckResult {
    /** Monitor that was checked */
    monitorId: string;
    /** Links to operation */
    operationId: string;
    /** Response time if successful */
    responseTime?: number;
    /** Check result */
    status: "down" | "up";
    /** When check completed */
    timestamp: Date;
}

/**
 * Registry for tracking active monitoring operations.
 *
 * @remarks
 * Provides operation correlation and cancellation capabilities to prevent
 * race conditions between monitor state changes and check operations.
 *
 * @public
 */
export class MonitorOperationRegistry {
    private readonly activeOperations: Map<string, MonitorCheckOperation> = new Map();

    /**
     * Cancel all operations for a specific monitor.
     *
     * @param monitorId - ID of monitor to cancel operations for
     */
    cancelOperations(monitorId: string): void {
        let cancelledCount = 0;
        for (const [, operation] of this.activeOperations) {
            if (operation.monitorId === monitorId) {
                operation.cancelled = true;
                cancelledCount++;
            }
        }

        if (cancelledCount > 0) {
            logger.debug(
                interpolateLogTemplate(LOG_TEMPLATES.debug.OPERATION_CANCELLED, { count: cancelledCount, monitorId })
            );
        }
    }

    /**
     * Complete and remove an operation from the registry.
     *
     * @param operationId - ID of operation to complete
     */
    completeOperation(operationId: string): void {
        const operation = this.activeOperations.get(operationId);
        if (operation) {
            this.activeOperations.delete(operationId);
            logger.debug(
                interpolateLogTemplate(LOG_TEMPLATES.debug.OPERATION_COMPLETED, {
                    monitorId: operation.monitorId,
                    operationId,
                })
            );
        }
    }

    /**
     * Get all active operations (for cleanup purposes).
     *
     * @returns Map of all active operations
     */
    getActiveOperations(): Map<string, MonitorCheckOperation> {
        return this.activeOperations;
    }

    /**
     * Get a specific operation by ID.
     *
     * @param operationId - ID of operation to retrieve
     * @returns Operation if found, undefined otherwise
     */
    getOperation(operationId: string): MonitorCheckOperation | undefined {
        return this.activeOperations.get(operationId);
    }

    /**
     * Initiate a new check operation for a monitor.
     *
     * @param monitorId - ID of monitor to check
     * @returns Unique operation ID
     */
    initiateCheck(monitorId: string): string {
        let operationId: string;
        let attempts = 0;
        do {
            operationId = crypto.randomUUID();
            attempts++;
            // Incredibly unlikely, but retry if collision
        } while (this.activeOperations.has(operationId) && attempts < 5);

        if (this.activeOperations.has(operationId)) {
            throw new Error("Failed to generate a unique operation ID after multiple attempts.");
        }

        const operation: MonitorCheckOperation = {
            cancelled: false,
            id: operationId,
            initiatedAt: new Date(),
            monitorId,
        };

        this.activeOperations.set(operationId, operation);
        logger.debug(`Initiated operation ${operationId} for monitor ${monitorId}`);
        return operationId;
    }

    /**
     * Validate that an operation is still active and not cancelled.
     *
     * @param operationId - ID of operation to validate
     * @returns True if operation is valid and not cancelled
     */
    validateOperation(operationId: string): boolean {
        const operation = this.activeOperations.get(operationId);
        return Boolean(operation && !operation.cancelled);
    }
}

/**
 * Singleton instance of the operation registry.
 *
 * @public
 */
export const operationRegistry: MonitorOperationRegistry = new MonitorOperationRegistry();
