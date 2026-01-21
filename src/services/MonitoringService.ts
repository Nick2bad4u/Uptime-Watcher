/**
 * Monitoring service layer for handling all monitoring-related operations.
 *
 * @remarks
 * This service provides a renderer-facing abstraction over the typed
 * `monitoring` preload domain. It ensures the Electron bridge is initialized
 * before making IPC calls and applies consistent error handling patterns.
 *
 * The service supports both specific monitor operations and site-wide
 * operations:
 *
 * - Individual monitor control via monitor ID.
 * - Site-wide operations affecting all monitors of a site.
 *
 * @example
 *
 * ```typescript
 * // Start monitoring for a specific monitor
 * await MonitoringService.startMonitoringForMonitor(
 *     "site-123",
 *     "monitor-456"
 * );
 *
 * // Start monitoring for all monitors of a site
 * await MonitoringService.startMonitoringForSite("site-123");
 *
 * // Stop a specific monitor
 * await MonitoringService.stopMonitoringForMonitor(
 *     "site-123",
 *     "monitor-456"
 * );
 * ```
 */

import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
    StatusUpdate,
} from "@shared/types";
import type { UnknownRecord } from "type-fest";
import type * as z from "zod";

import { ApplicationError } from "@shared/utils/errorHandling";
import { validateStatusUpdate } from "@shared/validation/guards";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

// eslint-disable-next-line ex/no-unhandled -- Module-level initialization should fail fast when preload wiring is invalid.
const { ensureInitialized, wrap } = getIpcServiceHelpers("MonitoringService", {
    bridgeContracts: [
        {
            domain: "monitoring",
            methods: [
                "checkSiteNow",
                "startMonitoring",
                "startMonitoringForMonitor",
                "startMonitoringForSite",
                "stopMonitoring",
                "stopMonitoringForMonitor",
                "stopMonitoringForSite",
            ],
        },
    ],
});

/**
 * Resolves a candidate value to a non-empty identifier string.
 *
 * @remarks
 * Used to avoid logging ambiguous `undefined` or whitespace-only identifiers
 * when constructing error messages for failed status updates.
 *
 * @param candidate - Value that may contain an identifier.
 * @param fallback - Fallback identifier used when {@link candidate} is not a
 *   non-empty string.
 *
 * @returns The trimmed identifier when {@link candidate} is a non-empty string;
 *   otherwise the provided {@link fallback}.
 */
const resolveIdentifier = (candidate: unknown, fallback: string): string => {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate;
    }

    return fallback;
};

/**
 * Logs an invalid status update and throws a descriptive error.
 *
 * @remarks
 * This helper augments the provided {@link metadata} with validation issues from
 * the {@link ZodError} and emits a structured error log entry before throwing.
 * The thrown {@link Error} message includes resolved `monitorId` and
 * `siteIdentifier` values for easier correlation in logs.
 *
 * @param error - The {@link ZodError} instance describing validation failures
 *   for the status update.
 * @param metadata - Additional contextual fields such as `monitorId` and
 *   `siteIdentifier` included in the log payload.
 *
 * @returns This function never returns; it always throws.
 *
 * @throws {@link Error} Always throws an error describing which monitor and
 *   site produced the invalid status update. The original {@link ZodError} is
 *   attached as the `cause`.
 */
const logInvalidStatusUpdateAndThrow = (
    error: z.ZodError,
    metadata: UnknownRecord
): never => {
    logger.error(
        "[MonitoringService] Invalid status update returned after checkSiteNow",
        error,
        {
            ...metadata,
            issues: error.issues,
        }
    );

    const { monitorId, siteIdentifier } = metadata;
    const resolvedMonitorId = resolveIdentifier(monitorId, "unknown");
    const resolvedSiteIdentifier = resolveIdentifier(siteIdentifier, "unknown");
    throw new ApplicationError({
        cause: error,
        code: "RENDERER_SERVICE_INVALID_PAYLOAD",
        details: {
            ...metadata,
            issues: error.issues,
            operation: "checkSiteNow",
            serviceName: "MonitoringService",
        },
        message: `[MonitoringService] checkSiteNow returned an invalid status update for monitor ${resolvedMonitorId} of site ${resolvedSiteIdentifier}`,
    });
};

/**
 * Contract for renderer-facing monitoring operations.
 *
 * @remarks
 * All operations are asynchronous and delegate to the `monitoring` preload
 * domain. Implementations must ensure the Electron bridge is initialized before
 * invoking any underlying channel.
 */
interface MonitoringServiceContract {
    /**
     * Performs an immediate manual check for a specific monitor.
     */
    checkSiteNow: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<StatusUpdate | undefined>;
    /**
     * Ensures the monitoring bridge is initialized prior to IPC usage.
     */
    initialize: () => Promise<void>;
    /**
     * Starts monitoring across all configured sites.
     */
    startMonitoring: () => Promise<MonitoringStartSummary>;
    /**
     * Starts monitoring for a single monitor within a site.
     */
    startMonitoringForMonitor: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /**
     * Starts monitoring for every monitor within the specified site.
     */
    startMonitoringForSite: (siteIdentifier: string) => Promise<void>;
    /**
     * Stops monitoring across all configured sites.
     */
    stopMonitoring: () => Promise<MonitoringStopSummary>;
    /**
     * Stops monitoring for a specific monitor within a site.
     */
    stopMonitoringForMonitor: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /**
     * Stops monitoring for every monitor belonging to the specified site.
     */
    stopMonitoringForSite: (siteIdentifier: string) => Promise<void>;
}

/**
 * Facade for managing monitoring operations through Electron IPC.
 *
 * @remarks
 * This service offers a high-level interface for starting and stopping
 * monitoring globally, per-site, and per-monitor, as well as performing manual
 * checks via {@link MonitoringService.checkSiteNow}. It validates returned
 * {@link StatusUpdate} payloads and monitoring summaries before exposing them to
 * callers, and logs structured diagnostics when backend operations fail or
 * return invalid data.
 */
export const MonitoringService: MonitoringServiceContract = {
    /**
     * Performs an immediate manual check for a specific monitor.
     *
     * @remarks
     * The raw status update returned by the backend is validated with
     * {@link validateStatusUpdate}. When validation fails, the service logs a
     * detailed error and throws, rather than returning potentially malformed
     * data. Optional fields such as `details`, `previousStatus`, and
     * `responseTime` are preserved when present.
     *
     * @param siteIdentifier - Identifier of the site containing the monitor.
     * @param monitorId - Identifier of the monitor to check.
     *
     * @returns A promise that resolves with the latest {@link StatusUpdate} when
     *   available, or `undefined` when the backend reports no new data.
     *
     * @throws {@link Error} When the backend returns an invalid status update
     *   payload or the IPC bridge encounters an unexpected error.
     */
    checkSiteNow: wrap(
        "checkSiteNow",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<StatusUpdate | undefined> => {
            const rawStatusUpdate = await api.monitoring.checkSiteNow(
                siteIdentifier,
                monitorId
            );

            if (rawStatusUpdate === undefined) {
                return undefined;
            }

            const validationResult = validateStatusUpdate(rawStatusUpdate);

            if (!validationResult.success) {
                return logInvalidStatusUpdateAndThrow(validationResult.error, {
                    monitorId,
                    siteIdentifier,
                });
            }

            const { data } = validationResult;
            const normalizedUpdate: StatusUpdate = {
                monitor: data.monitor,
                monitorId: data.monitorId,
                site: data.site,
                siteIdentifier: data.siteIdentifier,
                status: data.status,
                timestamp: data.timestamp,
            };

            if (data.details !== undefined) {
                normalizedUpdate.details = data.details;
            }

            if (data.previousStatus !== undefined) {
                normalizedUpdate.previousStatus = data.previousStatus;
            }

            if (data.responseTime !== undefined) {
                normalizedUpdate.responseTime = data.responseTime;
            }

            return normalizedUpdate;
        }
    ),
    /**
     * Ensures the preload bridge is ready before invoking monitoring APIs.
     *
     * @remarks
     * Call this during application startup to avoid paying the bridge
     * initialization cost on the first monitoring operation.
     *
     * @returns A promise that resolves when the `monitoring` bridge is ready
     *   for use.
     *
     * @throws {@link Error} When the Electron environment is unavailable or the
     *   preload bridge cannot be initialized.
     */
    initialize: ensureInitialized,
    /**
     * Starts monitoring across all configured sites.
     *
     * @remarks
     * When the backend reports partial failures, a warning is logged but the
     * operation may still be considered successful if `isMonitoring` is `true`.
     * If `isMonitoring` remains `false`, this method throws an {@link Error}
     * whose `summary` property contains the {@link MonitoringStartSummary} for
     * further inspection.
     *
     * @returns A promise that resolves with a cloned
     *   {@link MonitoringStartSummary} describing the outcome of the global
     *   start request.
     *
     * @throws {@link Error} When the backend declines to start global
     *   monitoring or no eligible monitors are available.
     */
    startMonitoring: wrap(
        "startMonitoring",
        async (api): Promise<MonitoringStartSummary> => {
            const summary = await api.monitoring.startMonitoring();

            if (summary.partialFailures) {
                logger.warn(
                    "[MonitoringService] Global monitoring start completed with partial failures",
                    summary
                );
            }

            if (!summary.isMonitoring) {
                const message =
                    summary.attempted === 0
                        ? "No eligible monitors were available to start. Configure at least one monitor and try again."
                        : `Failed to start monitoring across all sites: ${summary.succeeded}/${summary.attempted} monitors activated.`;

                logger.error(
                    "[MonitoringService] Global monitoring start failed",
                    summary
                );

                throw new ApplicationError({
                    code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                    details: {
                        operation: "startMonitoring",
                        serviceName: "MonitoringService",
                        summary,
                    },
                    message: `[MonitoringService] ${message}`,
                });
            }

            return { ...summary };
        }
    ),
    /**
     * Starts monitoring for a single monitor within a site.
     *
     * @param siteIdentifier - Identifier of the site that owns the monitor.
     * @param monitorId - Identifier of the monitor to start.
     *
     * @returns A promise that resolves when the backend reports success.
     *
     * @throws {@link Error} When the backend reports failure for the targeted
     *   monitor.
     */
    startMonitoringForMonitor: wrap(
        "startMonitoringForMonitor",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            const success = await api.monitoring.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            if (!success) {
                throw new ApplicationError({
                    code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                    details: {
                        monitorId,
                        operation: "startMonitoringForMonitor",
                        serviceName: "MonitoringService",
                        siteIdentifier,
                    },
                    message: `[MonitoringService] Failed to start monitoring for monitor ${monitorId} of site ${siteIdentifier}: backend returned false`,
                });
            }
        }
    ),
    /**
     * Starts monitoring for every monitor within the specified site.
     *
     * @param siteIdentifier - Identifier of the site whose monitors should
     *   begin monitoring.
     *
     * @returns A promise that resolves when the backend reports success.
     *
     * @throws {@link Error} When the backend declines the request.
     */
    startMonitoringForSite: wrap(
        "startMonitoringForSite",
        async (api, siteIdentifier: string): Promise<void> => {
            const success =
                await api.monitoring.startMonitoringForSite(siteIdentifier);

            if (!success) {
                throw new ApplicationError({
                    code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                    details: {
                        operation: "startMonitoringForSite",
                        serviceName: "MonitoringService",
                        siteIdentifier,
                    },
                    message: `[MonitoringService] Failed to start monitoring for site ${siteIdentifier}: backend returned false`,
                });
            }
        }
    ),
    /**
     * Stops monitoring across all configured sites.
     *
     * @remarks
     * When the backend reports partial failures, a warning is logged but the
     * operation may still be considered successful if `isMonitoring` becomes
     * `false`. If monitoring remains active, this method throws an {@link Error}
     * whose `summary` property contains the {@link MonitoringStopSummary} for
     * further debugging.
     *
     * @returns A promise that resolves with a cloned
     *   {@link MonitoringStopSummary} describing the outcome of the global stop
     *   request.
     *
     * @throws {@link Error} When the backend declines to stop global monitoring
     *   or no running monitors can be located.
     */
    stopMonitoring: wrap(
        "stopMonitoring",
        async (api): Promise<MonitoringStopSummary> => {
            const summary = await api.monitoring.stopMonitoring();

            if (summary.partialFailures) {
                logger.warn(
                    "[MonitoringService] Global monitoring stop completed with partial failures",
                    summary
                );
            }

            if (summary.isMonitoring) {
                const message =
                    summary.attempted === 0
                        ? "Monitoring remained active because no running monitors were located."
                        : `Failed to stop monitoring across all sites: ${summary.failed}/${summary.attempted} monitors remained active.`;

                logger.error(
                    "[MonitoringService] Global monitoring stop failed",
                    summary
                );

                throw new ApplicationError({
                    code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                    details: {
                        operation: "stopMonitoring",
                        serviceName: "MonitoringService",
                        summary,
                    },
                    message: `[MonitoringService] ${message}`,
                });
            }

            return { ...summary };
        }
    ),
    /**
     * Stops monitoring for a specific monitor within a site.
     *
     * @param siteIdentifier - Identifier of the site that owns the monitor.
     * @param monitorId - Identifier of the monitor to stop.
     *
     * @returns A promise that resolves when the backend reports success.
     *
     * @throws {@link Error} When the backend reports failure for the targeted
     *   monitor.
     */
    stopMonitoringForMonitor: wrap(
        "stopMonitoringForMonitor",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            const success = await api.monitoring.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            if (!success) {
                throw new ApplicationError({
                    code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                    details: {
                        monitorId,
                        operation: "stopMonitoringForMonitor",
                        serviceName: "MonitoringService",
                        siteIdentifier,
                    },
                    message: `[MonitoringService] Failed to stop monitoring for monitor ${monitorId} of site ${siteIdentifier}: backend returned false`,
                });
            }
        }
    ),
    /**
     * Stops monitoring for every monitor belonging to the specified site.
     *
     * @param siteIdentifier - Identifier of the site whose monitors should stop
     *   monitoring.
     *
     * @returns A promise that resolves when the backend reports success.
     *
     * @throws {@link Error} When the backend declines the request.
     */
    stopMonitoringForSite: wrap(
        "stopMonitoringForSite",
        async (api, siteIdentifier: string): Promise<void> => {
            const success =
                await api.monitoring.stopMonitoringForSite(siteIdentifier);

            if (!success) {
                throw new ApplicationError({
                    code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                    details: {
                        operation: "stopMonitoringForSite",
                        serviceName: "MonitoringService",
                        siteIdentifier,
                    },
                    message: `[MonitoringService] Failed to stop monitoring for site ${siteIdentifier}: backend returned false`,
                });
            }
        }
    ),
};
