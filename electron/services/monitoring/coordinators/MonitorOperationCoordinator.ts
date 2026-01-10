import type { Monitor } from "@shared/types";

import type { MonitorRepository } from "../../database/MonitorRepository";
import type { MonitorOperationRegistry } from "../MonitorOperationRegistry";
import type { OperationTimeoutManager } from "../OperationTimeoutManager";

import { monitorLogger as logger } from "../../../utils/logger";
import {
    DEFAULT_MONITOR_TIMEOUT_SECONDS,
    MONITOR_TIMEOUT_BUFFER_MS,
    SECONDS_TO_MS_MULTIPLIER,
} from "../constants";

/**
 * Dependencies required for coordinating monitor operations.
 */
export interface MonitorOperationCoordinatorConfig {
    readonly monitorRepository: MonitorRepository;
    readonly operationRegistry: MonitorOperationRegistry;
    readonly timeoutManager: OperationTimeoutManager;
}

/**
 * Handle returned when a monitor operation has been scheduled.
 */
export interface MonitorOperationHandle {
    readonly monitorId: string;
    readonly operationId: string;
    readonly signal: AbortSignal;
    readonly timeoutMs: number;
}

/**
 * Coordinates correlated monitor operations, registry entries, and timeouts.
 */
export class MonitorOperationCoordinator {
    private readonly monitorRepository: MonitorOperationCoordinatorConfig["monitorRepository"];

    private readonly operationRegistry: MonitorOperationCoordinatorConfig["operationRegistry"];

    private readonly timeoutManager: MonitorOperationCoordinatorConfig["timeoutManager"];

    public async initiateOperation(
        monitor: Monitor,
        options?: { readonly additionalSignals?: AbortSignal[] }
    ): Promise<MonitorOperationHandle | undefined> {
        if (!monitor.id) {
            logger.error("Cannot initiate operation for monitor without ID");
            return undefined;
        }

        const timeoutMs = this.resolveTimeout(monitor);
        const operationResult = this.operationRegistry.initiateCheck(
            monitor.id,
            {
                timeoutMs,
                ...(options?.additionalSignals
                    ? { additionalSignals: options.additionalSignals }
                    : {}),
            }
        );

        this.timeoutManager.scheduleTimeout(
            operationResult.operationId,
            timeoutMs
        );

        try {
            const updatedActiveOperations = [
                ...(monitor.activeOperations ?? []),
                operationResult.operationId,
            ];
            await this.monitorRepository.update(monitor.id, {
                activeOperations: updatedActiveOperations,
            });
        } catch (error) {
            logger.error(
                `Failed to add operation ${operationResult.operationId} to monitor ${monitor.id}`,
                error
            );
            this.cleanupOperation(operationResult.operationId);
            return undefined;
        }

        return {
            monitorId: monitor.id,
            operationId: operationResult.operationId,
            signal: operationResult.signal,
            timeoutMs,
        } satisfies MonitorOperationHandle;
    }

    public constructor(config: MonitorOperationCoordinatorConfig) {
        this.monitorRepository = config.monitorRepository;
        this.operationRegistry = config.operationRegistry;
        this.timeoutManager = config.timeoutManager;
    }

    public cleanupOperation(operationId: string): void {
        this.operationRegistry.completeOperation(operationId);
        this.timeoutManager.clearTimeout(operationId);
    }

    private resolveTimeout(monitor: Monitor): number {
        const monitorTimeoutMs =
            monitor.timeout ||
            DEFAULT_MONITOR_TIMEOUT_SECONDS * SECONDS_TO_MS_MULTIPLIER;
        return monitorTimeoutMs + MONITOR_TIMEOUT_BUFFER_MS;
    }
}
