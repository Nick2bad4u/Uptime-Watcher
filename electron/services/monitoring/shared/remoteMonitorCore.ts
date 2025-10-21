/**
 * Shared remote monitor core centralizing configuration handling, retry
 * orchestration, and JSON endpoint fetching for replication and heartbeat
 * monitors.
 */

import type { Site } from "@shared/types";
import type { AxiosInstance } from "axios";

import { ensureError } from "@shared/utils/errorHandling";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorConfig,
} from "../types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../../constants";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { createHttpClient } from "../utils/httpClient";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
} from "./monitorServiceHelpers";

/**
 * Narrowed monitor type helper keyed by monitor "type" literal.
 */
type MonitorByType<TType extends Site["monitors"][number]["type"]> =
    Site["monitors"][number] & { type: TType };

function isMonitorOfType<TType extends Site["monitors"][number]["type"]>(
    monitor: Site["monitors"][number],
    type: TType
): monitor is MonitorByType<TType> {
    return monitor.type === type;
}

function createInvalidJsonError(url: string, error: unknown): Error {
    const normalized = ensureError(error);
    normalized.message = `Invalid JSON response from ${url}: ${normalized.message}`;
    return normalized;
}

function createFetchError(url: string, error: unknown): Error {
    const normalized = ensureError(error);
    normalized.message = `Failed to fetch ${url}: ${normalized.message}`;
    return normalized;
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
type RemoteMonitorConfigResult<TContext> =
    | { context: TContext; kind: "context" }
    | { kind: "error"; message: string };

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
        serviceConfig: MonitorConfig
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
): new (config?: MonitorConfig) => IMonitorService {
    return class RemoteMonitorServiceAdapter implements IMonitorService {
        private axiosInstance: AxiosInstance;

        private config: MonitorConfig;

        public async check(
            monitor: Site["monitors"][0],
            signal?: AbortSignal
        ): Promise<MonitorCheckResult> {
            if (!isMonitorOfType(monitor, behavior.type)) {
                throw new Error(
                    `${behavior.scope} cannot handle monitor type: ${monitor.type}`
                );
            }

            const typedMonitor = monitor;
            const configuration = behavior.resolveConfiguration(
                typedMonitor,
                this.config
            );

            if (configuration.kind === "error") {
                return createMonitorErrorResult(configuration.message, 0);
            }

            const { retryAttempts, timeout } = extractMonitorConfig(
                typedMonitor,
                this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
            );

            const operationName = behavior.getOperationName(
                configuration.context
            );

            try {
                const executionArgs = {
                    context: configuration.context,
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
                    timeout,
                    ...(signal ? { signal } : {}),
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
                        maxRetries: retryAttempts + 1,
                        operationName,
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
            const signals: AbortSignal[] = [AbortSignal.timeout(timeout)];
            if (signal) {
                signals.push(signal);
            }

            const combinedSignal = AbortSignal.any(signals);

            try {
                const response = await this.axiosInstance.get<unknown>(url, {
                    signal: combinedSignal,
                    timeout,
                });

                const rawData: unknown = response.data;
                let parsed: unknown = rawData;

                if (typeof rawData === "string") {
                    if (rawData.length === 0) {
                        parsed = {};
                    } else {
                        try {
                            parsed = JSON.parse(rawData);
                        } catch (parseError) {
                            throw createInvalidJsonError(url, parseError);
                        }
                    }
                }

                return {
                    data: parsed,
                    responseTime: response.responseTime ?? timeout,
                };
            } catch (fetchError) {
                throw createFetchError(url, fetchError);
            }
        }

        public constructor(config: MonitorConfig = {}) {
            this.config = {
                timeout: DEFAULT_REQUEST_TIMEOUT,
                ...config,
            };
            this.axiosInstance = createHttpClient(this.config);
        }

        public getType(): Site["monitors"][0]["type"] {
            return behavior.type;
        }

        public updateConfig(config: Partial<MonitorConfig>): void {
            this.config = {
                ...this.config,
                ...config,
            };
            this.axiosInstance = createHttpClient(this.config);
        }
    };
}
