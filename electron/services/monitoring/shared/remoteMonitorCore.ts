/**
 * Shared remote monitor core centralizing configuration handling, retry
 * orchestration, and JSON endpoint fetching for replication and heartbeat
 * monitors.
 */

import type { Site } from "@shared/types";
import type { Constructor } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { getSafeUrlForLogging } from "@shared/utils/urlSafety";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "../types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../../constants";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { createTimeoutSignal } from "./abortSignalUtils";
import {
    buildMonitorExecutionBaseArgsWithOptionalSignal,
    deriveMonitorTiming,
    ensureMonitorType,
    type MonitorByType,
} from "./monitorCoreHelpers";
import { createMonitorRetryPlan } from "./monitorRetryUtils";
import { MonitorServiceAdapterBase } from "./monitorServiceAdapterBase";
import {
    createMonitorErrorResult,
    normalizeResponseTime,
} from "./monitorServiceHelpers";
import {
    createMonitorServiceRuntimeState,
    updateMonitorServiceRuntimeState,
} from "./monitorServiceRuntimeState";

/**
 * Narrowed monitor type helper keyed by monitor "type" literal.
 */
class InvalidJsonResponseError extends Error {
    public constructor(url: string, error: unknown) {
        const normalized = ensureError(error);
        super(
            `Invalid JSON response from ${getSafeUrlForLogging(url)}: ${normalized.message}`,
            {
                cause: error,
            }
        );
        this.name = "InvalidJsonResponseError";
    }
}

function createInvalidJsonError(url: string, error: unknown): Error {
    return new InvalidJsonResponseError(url, error);
}

function createFetchError(url: string, error: unknown): Error {
    const normalized = ensureError(error);
    return new Error(
        `Failed to fetch ${getSafeUrlForLogging(url)}: ${normalized.message}`,
        {
            cause: error,
        }
    );
}

function parseRemoteEndpointPayload(url: string, data: unknown): unknown {
    if (typeof data !== "string") {
        return data;
    }

    if (data.length === 0) {
        return {};
    }

    try {
        return JSON.parse(data);
    } catch (parseError) {
        throw createInvalidJsonError(url, parseError);
    }
}

/**
 * JSON payload returned from remote endpoints.
 */
export interface RemoteEndpointPayload {
    data: unknown;
    responseTime: number;
}

/**
 * Result produced while resolving monitor-specific configuration.
 */
export type RemoteMonitorConfigResult<TContext> =
    { context: TContext; kind: "success" } | { kind: "error"; message: string };

/**
 * Behaviour contract required to integrate a remote monitor with the shared
 * core.
 */
export interface RemoteMonitorBehavior<
    TType extends Site["monitors"][number]["type"],
    TContext,
> {
    /** Executes the monitor-specific check logic. */
    readonly executeCheck: (args: {
        context: TContext;
        fetchEndpoint: (
            url: string,
            timeout: number,
            signal?: AbortSignal
        ) => Promise<RemoteEndpointPayload>;
        signal?: AbortSignal;
        timeout: number;
    }) => Promise<MonitorCheckResult>;
    /** Optional override for the failure log level used by the retry wrapper. */
    readonly failureLogLevel?: Parameters<
        typeof withOperationalHooks
    >[1]["failureLogLevel"];
    /** Human readable operation name for logging and retry metadata. */
    readonly getOperationName: (context: TContext) => string;
    /** Resolves monitor-specific configuration and validation. */
    readonly resolveConfiguration: (
        monitor: MonitorByType<TType>,
        serviceConfig: MonitorServiceConfig
    ) => RemoteMonitorConfigResult<TContext>;
    /** Scope label used for structured logging (e.g. "ReplicationMonitor"). */
    readonly scope: string;
    /** Literal monitor type handled by the concrete service. */
    readonly type: TType;
}

/**
 * Factory that produces remote monitor services backed by the shared core.
 */
export function createRemoteMonitorService<
    TType extends Site["monitors"][number]["type"],
    TContext,
>(
    behavior: RemoteMonitorBehavior<TType, TContext>
): Constructor<IMonitorService, [config?: MonitorServiceConfig]> {
    return class RemoteMonitorServiceAdapter extends MonitorServiceAdapterBase<TType> {
        public async check(
            monitor: Site["monitors"][0],
            signal?: AbortSignal
        ): Promise<MonitorCheckResult> {
            const typedMonitor = ensureMonitorType(
                monitor,
                behavior.type,
                behavior.scope
            );
            const configuration = behavior.resolveConfiguration(
                typedMonitor,
                this.config
            );

            if (configuration.kind === "error") {
                return createMonitorErrorResult(configuration.message, 0);
            }

            const { retryAttempts, timeout } = deriveMonitorTiming(
                typedMonitor,
                this.config
            );
            const { totalAttempts } = createMonitorRetryPlan(retryAttempts);

            const operationName = behavior.getOperationName(
                configuration.context
            );

            try {
                const executionArgs = {
                    ...buildMonitorExecutionBaseArgsWithOptionalSignal({
                        context: configuration.context,
                        signal,
                        timeout,
                    }),
                    fetchEndpoint: (
                        url: string,
                        endpointTimeout: number,
                        endpointSignal?: AbortSignal
                    ): Promise<RemoteEndpointPayload> =>
                        this.fetchJsonPayload(
                            url,
                            endpointTimeout,
                            endpointSignal
                        ),
                } satisfies {
                    context: TContext;
                    fetchEndpoint: (
                        url: string,
                        timeout: number,
                        signal?: AbortSignal
                    ) => Promise<RemoteEndpointPayload>;
                    signal?: AbortSignal;
                    timeout: number;
                };

                return await withOperationalHooks(
                    () => behavior.executeCheck(executionArgs),
                    {
                        failureLogLevel: behavior.failureLogLevel ?? "warn",
                        maxRetries: totalAttempts,
                        operationName,
                        ...(executionArgs.signal && {
                            signal: executionArgs.signal,
                        }),
                    }
                );
            } catch (error) {
                const normalized = ensureError(error);
                logger.warn(
                    `[${behavior.scope}] ${operationName} failed`,
                    normalized
                );
                return {
                    ...createMonitorErrorResult(normalized.message, 0),
                    details: normalized.message,
                };
            }
        }

        private async fetchJsonPayload(
            url: string,
            timeout: number,
            signal?: AbortSignal
        ): Promise<RemoteEndpointPayload> {
            const combinedSignal = createTimeoutSignal(timeout, signal);

            try {
                const response = await this.axiosInstance.get<unknown>(url, {
                    signal: combinedSignal,
                    timeout,
                });
                const parsed = parseRemoteEndpointPayload(url, response.data);

                return {
                    data: parsed,
                    responseTime: normalizeResponseTime(
                        response.responseTime,
                        timeout
                    ),
                };
            } catch (fetchError) {
                if (fetchError instanceof InvalidJsonResponseError) {
                    throw fetchError;
                }

                throw createFetchError(url, fetchError);
            }
        }

        public constructor(config: MonitorServiceConfig = {}) {
            const state = createMonitorServiceRuntimeState({
                config,
                defaultTimeoutMs: DEFAULT_REQUEST_TIMEOUT,
            });

            super({
                axiosInstance: state.axiosInstance,
                config: state.config,
                type: behavior.type,
            });
        }

        public updateConfig(config: Partial<MonitorServiceConfig>): void {
            const state = updateMonitorServiceRuntimeState({
                currentConfig: this.config,
                defaultTimeoutMs: DEFAULT_REQUEST_TIMEOUT,
                update: config,
            });

            this.config = state.config;
            this.axiosInstance = state.axiosInstance;
        }
    };
}
