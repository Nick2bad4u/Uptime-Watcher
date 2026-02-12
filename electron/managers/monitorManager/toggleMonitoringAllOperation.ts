/**
 * Global monitoring toggle operations.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to
 * centralize the cross-site start/stop orchestration, error shaping, and
 * lifecycle event emission.
 *
 * @packageDocumentation
 */

import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
} from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { EnhancedLifecycleConfig } from "../MonitorManagerEnhancedLifecycle";

/**
 * Starts monitoring across all sites.
 */
export async function startMonitoringAllOperation(args: {
    readonly config: EnhancedLifecycleConfig;
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    readonly isMonitoring: boolean;
    readonly logger: Logger;
    readonly startAllMonitoringEnhanced: (
        config: EnhancedLifecycleConfig,
        isMonitoring: boolean
    ) => Promise<MonitoringStartSummary>;
}): Promise<MonitoringStartSummary> {
    const {
        config,
        eventEmitter,
        isMonitoring,
        logger,
        startAllMonitoringEnhanced,
    } = args;

    const summary = await startAllMonitoringEnhanced(config, isMonitoring);

    if (summary.partialFailures) {
        logger.warn(
            "[MonitorManager] startMonitoring completed with partial failures",
            summary
        );
    }

    if (
        !summary.isMonitoring &&
        summary.attempted > 0 &&
        !summary.alreadyActive
    ) {
        logger.error(
            "[MonitorManager] No monitors transitioned to an active state during startMonitoring",
            summary
        );

        const error = new Error(
            "Failed to start monitoring: no monitors reported as active"
        );

        // Attach summary for upstream error handling and diagnostics.
        (error as Error & { summary?: MonitoringStartSummary }).summary =
            summary;
        throw error;
    }

    if (summary.isMonitoring || summary.alreadyActive) {
        await eventEmitter.emitTyped("internal:monitor:started", {
            identifier: "all",
            operation: "started",
            summary,
            timestamp: Date.now(),
        });
    }

    return summary;
}

/**
 * Stops monitoring across all sites.
 */
export async function stopMonitoringAllOperation(args: {
    readonly config: EnhancedLifecycleConfig;
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    readonly logger: Logger;
    readonly stopAllMonitoringEnhanced: (
        config: EnhancedLifecycleConfig
    ) => Promise<MonitoringStopSummary>;
}): Promise<MonitoringStopSummary> {
    const { config, eventEmitter, logger, stopAllMonitoringEnhanced } = args;

    const summary = await stopAllMonitoringEnhanced(config);

    if (summary.partialFailures) {
        logger.warn(
            "[MonitorManager] stopMonitoring completed with partial failures",
            summary
        );
    }

    if (
        summary.isMonitoring &&
        summary.attempted > 0 &&
        !summary.alreadyInactive
    ) {
        logger.error(
            "[MonitorManager] Some monitors failed to stop during stopMonitoring",
            summary
        );

        const error = new Error(
            "Failed to stop monitoring: one or more monitors remain active"
        );

        (error as Error & { summary?: MonitoringStopSummary }).summary =
            summary;
        throw error;
    }

    await eventEmitter.emitTyped("internal:monitor:stopped", {
        identifier: "all",
        operation: "stopped",
        reason: "user",
        summary,
        timestamp: Date.now(),
    });

    return summary;
}
