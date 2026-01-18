/**
 * Monitor operation registry for tracking and correlating monitoring operations
 * using AbortController.
 *
 * @remarks
 * This service provides operation correlation to prevent race conditions
 * between monitor state changes and delayed check operations. Each monitoring
 * operation is assigned a unique ID and tracked throughout its lifecycle using
 * native AbortController for cancellation.
 *
 * @packageDocumentation
 */

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import { monitorLogger as logger } from "../../utils/logger";
import { mergeAbortSignals } from "./shared/abortSignalUtils";

/**
 * Interface for monitor check operations.
 *
 * @remarks
 * Represents a single monitoring check operation with correlation ID and
 * AbortController-based cancellation support.
 *
 * @public
 */
export interface MonitorCheckOperation {
    /** AbortController for this operation */
    abortController: AbortController;
    /** Unique operation ID */
    id: string;
    /** When operation started */
    initiatedAt: Date;
    /** Monitor being checked */
    monitorId: string;
    /** AbortSignal for easy access */
    signal: AbortSignal;
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
    status: "degraded" | "down" | "up";
    /** When check completed */
    timestamp: Date;
}

/**
 * Registry for tracking active monitoring operations.
 *
 * @remarks
 * Provides operation correlation and AbortController-based cancellation
 * capabilities to prevent race conditions between monitor state changes and
 * check operations.
 *
 * @public
 */
export class MonitorOperationRegistry {
    private readonly activeOperations = new Map<
        string,
        MonitorCheckOperation
    >();

    /**
     * Returns whether the registry currently tracks any outstanding operation
     * for the given monitor.
     *
     * @remarks
     * This is used by correlated/scheduled checks to enforce a single-flight
     * policy per monitor. The check intentionally treats aborted-but-not-yet-
     * cleaned-up operations as outstanding so that we do not start additional
     * work while the previous check is still unwinding.
     */
    public hasOutstandingOperation(monitorId: string): boolean {
        for (const operation of this.activeOperations.values()) {
            if (operation.monitorId === monitorId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns the operation IDs currently associated with the provided monitor.
     */
    public getOutstandingOperationIds(monitorId: string): string[] {
        const ids: string[] = [];
        for (const [operationId, operation] of this.activeOperations) {
            if (operation.monitorId === monitorId) {
                ids.push(operationId);
            }
        }

        return ids;
    }

    /**
     * Cancel all operations for a specific monitor.
     *
     * @param monitorId - ID of monitor to cancel operations for
     */
    public cancelOperations(monitorId: string): void {
        let cancelledCount = 0;
        for (const [, operation] of this.activeOperations) {
            if (
                operation.monitorId === monitorId &&
                !operation.signal.aborted
            ) {
                operation.abortController.abort("Monitor cancelled");
                cancelledCount++;
            }
        }

        if (cancelledCount > 0) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.OPERATION_CANCELLED,
                    { count: cancelledCount, monitorId }
                )
            );
        }
    }

    /**
     * Complete and remove an operation from the registry.
     *
     * @param operationId - ID of operation to complete
     */
    public completeOperation(operationId: string): void {
        const operation = this.activeOperations.get(operationId);
        if (operation) {
            // Abort the operation if it's still running
            if (!operation.signal.aborted) {
                operation.abortController.abort("Operation completed");
            }
            this.activeOperations.delete(operationId);
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.OPERATION_COMPLETED,
                    {
                        monitorId: operation.monitorId,
                        operationId,
                    }
                )
            );
        }
    }

    /**
     * Get all active operations (for cleanup/inspection purposes).
     *
     * @remarks
     * Returns a defensive copy so callers cannot mutate internal registry
     * state. Use {@link completeOperation} / {@link cancelOperations} for
     * lifecycle changes.
     *
     * @returns Map clone containing all active operations
     */
    public getActiveOperations(): Map<string, MonitorCheckOperation> {
        return new Map(this.activeOperations);
    }

    /**
     * Get a specific operation by ID.
     *
     * @param operationId - ID of operation to retrieve
     *
     * @returns Operation if found, undefined otherwise
     */
    public getOperation(
        operationId: string
    ): MonitorCheckOperation | undefined {
        return this.activeOperations.get(operationId);
    }

    /**
     * Initiate a new check operation for a monitor.
     *
     * @param monitorId - ID of monitor to check
     * @param options - Optional configuration for the operation
     *
     * @returns Object containing operation ID and abort signal
     */
    public initiateCheck(
        monitorId: string,
        options?: {
            /** Additional signals to combine with operation signal */
            additionalSignals?: AbortSignal[];
            /** Timeout in milliseconds */
            timeoutMs?: number;
        }
    ): { operationId: string; signal: AbortSignal } {
        // eslint-disable-next-line no-useless-assignment -- Variable initialized to satisfy init-declarations rule, even though immediately reassigned
        let operationId = "";
        let attempts = 0;
        do {
            operationId = crypto.randomUUID();
            attempts++;
            // Incredibly unlikely, but retry if collision
        } while (this.activeOperations.has(operationId) && attempts < 5);

        if (this.activeOperations.has(operationId)) {
            throw new Error(
                "Failed to generate a unique operation ID after multiple attempts."
            );
        }

        const abortController = new AbortController();
        const { signal: baseSignal } = abortController;

        const signal = mergeAbortSignals({
            baseSignal,
            ...(options?.additionalSignals
                ? { additionalSignals: options.additionalSignals }
                : {}),
            ...(typeof options?.timeoutMs === "number"
                ? { timeoutMs: options.timeoutMs }
                : {}),
        });

        const operation: MonitorCheckOperation = {
            abortController,
            id: operationId,
            initiatedAt: new Date(),
            monitorId,
            signal,
        };

        this.activeOperations.set(operationId, operation);
        logger.debug(
            `Initiated operation ${operationId} for monitor ${monitorId}`
        );

        return { operationId, signal };
    }

    /**
     * Validate that an operation is still active and not aborted.
     *
     * @param operationId - ID of operation to validate
     *
     * @returns True if operation is valid and not aborted
     */
    public validateOperation(operationId: string): boolean {
        const operation = this.activeOperations.get(operationId);
        return Boolean(operation && !operation.signal.aborted);
    }
}
