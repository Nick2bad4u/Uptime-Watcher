/**
 * Shared HTTP monitor core that centralizes request handling, retry logic, and
 * response logging for HTTP-derived monitor services.
 *
 * @remarks
 * This module provides a factory for creating concrete monitor services that
 * share identical request and retry infrastructure while allowing custom
 * validation and response evaluation logic. Existing HTTP monitor variants
 * supply lightweight strategies that plug into this core.
 */

import type { Site } from "@shared/types";
import type { AxiosInstance, AxiosResponse } from "axios";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorConfig,
} from "../types";

import {
    DEFAULT_REQUEST_TIMEOUT,
    RETRY_BACKOFF,
    USER_AGENT,
} from "../../../constants";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { handleCheckError, isCancellationError } from "../utils/errorHandling";
import { createHttpClient } from "../utils/httpClient";
import { getSharedHttpRateLimiter } from "../utils/httpRateLimiter";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
    validateMonitorUrl,
} from "./monitorServiceHelpers";

declare module "axios" {
    interface AxiosError {
        responseTime?: number;
    }

    interface AxiosResponse {
        responseTime?: number;
    }

    interface InternalAxiosRequestConfig {
        metadata?: {
            startTime: number;
        };
    }
}

/**
 * Narrowed monitor type helper keyed by monitor "type" literal.
 */
type MonitorByType<TType extends Site["monitors"][number]["type"]> =
    Site["monitors"][number] & { type: TType };

/**
 * Type guard that narrows a monitor instance to the provided monitor type.
 */
function isMonitorOfType<TType extends Site["monitors"][number]["type"]>(
    monitor: Site["monitors"][number],
    type: TType
): monitor is MonitorByType<TType> {
    return monitor.type === type;
}

/**
 * Result returned by monitor-specific validation logic.
 */
type MonitorValidationResult<TContext> =
    | { context: TContext; kind: "context" }
    | { kind: "error"; result: MonitorCheckResult };

export type HttpMonitorServiceInstance = IMonitorService & {
    getConfig: () => MonitorConfig;
};

/**
 * Behaviour contract required to plug a monitor variant into the shared core.
 */
export interface HttpMonitorBehavior<
    TType extends Site["monitors"][number]["type"],
    TMonitor extends MonitorByType<TType>,
    TContext,
> {
    /** Maps a successful HTTP response onto a monitor check result. */
    readonly evaluateResponse: (args: {
        context: TContext;
        monitor: TMonitor;
        response: AxiosResponse;
        responseTime: number;
    }) => MonitorCheckResult | Promise<MonitorCheckResult>;
    /** Human-readable label describing the operation (used in retry metadata). */
    readonly operationLabel: string;
    /** Scope label used for structured logging (e.g. "HttpMonitor"). */
    readonly scope: string;
    /** Literal monitor type handled by the concrete service. */
    readonly type: TType;
    /**
     * Validates monitor-specific configuration, returning execution context or
     * a pre-built error result when validation fails.
     */
    readonly validateMonitorSpecifics: (
        monitor: TMonitor
    ) => MonitorValidationResult<TContext>;
}

/**
 * Factory that produces HTTP monitor services backed by the shared core.
 */
export function createHttpMonitorService<
    TType extends Site["monitors"][number]["type"],
    TMonitor extends MonitorByType<TType>,
    TContext,
>(
    behavior: HttpMonitorBehavior<TType, TMonitor, TContext>
): new (config?: MonitorConfig) => HttpMonitorServiceInstance {
    const rateLimiter = getSharedHttpRateLimiter();

    interface SingleCheckParams {
        context: TContext;
        monitor: TMonitor;
        signal?: AbortSignal;
        timeout: number;
        url: string;
    }

    return class HttpMonitorServiceAdapter implements IMonitorService {
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

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Narrowed through isMonitorOfType guard
            const typedMonitor = monitor as TMonitor;
            const validation = behavior.validateMonitorSpecifics(typedMonitor);

            if (validation.kind === "error") {
                return validation.result;
            }

            const urlValidationError = validateMonitorUrl(typedMonitor);
            if (urlValidationError) {
                return createMonitorErrorResult(urlValidationError, 0);
            }

            const { retryAttempts, timeout } = extractMonitorConfig(
                typedMonitor,
                this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
            );

            const url = typedMonitor.url ?? "";

            const retryParams = {
                context: validation.context,
                maxRetries: retryAttempts,
                monitor: typedMonitor,
                ...(signal ? { signal } : {}),
                timeout,
                url,
            } satisfies {
                context: TContext;
                maxRetries: number;
                monitor: TMonitor;
                signal?: AbortSignal;
                timeout: number;
                url: string;
            };

            return rateLimiter.schedule(url, () =>
                this.performCheckWithRetry(retryParams)
            );
        }

        private async performCheckWithRetry(params: {
            context: TContext;
            maxRetries: number;
            monitor: TMonitor;
            signal?: AbortSignal;
            timeout: number;
            url: string;
        }): Promise<MonitorCheckResult> {
            const { context, maxRetries, monitor, signal, timeout, url } =
                params;

            try {
                if (signal?.aborted) {
                    throw new Error("Operation was aborted");
                }

                const totalAttempts = maxRetries + 1;
                const operationName = `${behavior.operationLabel} for ${url}`;

                const singleCheckParams = {
                    context,
                    monitor,
                    ...(signal ? { signal } : {}),
                    timeout,
                    url,
                } satisfies {
                    context: TContext;
                    monitor: TMonitor;
                    signal?: AbortSignal;
                    timeout: number;
                    url: string;
                };

                return await withOperationalHooks(
                    () => this.executeSingleCheck(singleCheckParams),
                    {
                        failureLogLevel: (encounteredError) =>
                            isCancellationError(encounteredError)
                                ? "warn"
                                : "error",
                        initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                        maxRetries: totalAttempts,
                        operationName,
                        ...(isDev() && {
                            onRetry: (attempt: number, error: Error): void => {
                                const errorMessage =
                                    error instanceof Error
                                        ? error.message
                                        : String(error);
                                logger.debug(
                                    `[${behavior.scope}] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                                );
                            },
                        }),
                    }
                );
            } catch (error) {
                return handleCheckError(error, url);
            }
        }

        private async executeSingleCheck(
            params: SingleCheckParams
        ): Promise<MonitorCheckResult> {
            const { context, monitor, signal, timeout, url } = params;
            if (isDev()) {
                logger.debug(
                    `[${behavior.scope}] Checking URL: ${url} with timeout: ${timeout}ms`
                );
            }
            const response = await this.makeRequest(url, timeout, signal);
            const responseTime = response.responseTime ?? 0;

            if (isDev()) {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.MONITOR_RESPONSE_TIME,
                        {
                            responseTime,
                            status: response.status,
                            url,
                        }
                    )
                );
            }

            return behavior.evaluateResponse({
                context,
                monitor,
                response,
                responseTime,
            });
        }

        protected async performSingleHealthCheck(
            params: SingleCheckParams
        ): Promise<MonitorCheckResult>;

        protected async performSingleHealthCheck(
            url: string,
            timeout: number,
            signal?: AbortSignal
        ): Promise<MonitorCheckResult>;

        protected async performSingleHealthCheck(
            paramsOrUrl: SingleCheckParams | string,
            timeout?: number,
            signal?: AbortSignal
        ): Promise<MonitorCheckResult> {
            if (typeof paramsOrUrl === "string") {
                if (behavior.type !== "http") {
                    throw new Error(
                        `${behavior.scope} requires monitor context for direct performSingleHealthCheck invocation`
                    );
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Legacy testing path constructs minimal monitor stub for compatibility
                const compatibilityMonitor = {
                    type: behavior.type,
                    url: paramsOrUrl,
                } as TMonitor;
                const validation =
                    behavior.validateMonitorSpecifics(compatibilityMonitor);

                if (validation.kind === "error") {
                    return validation.result;
                }

                const compatibilityParams: SingleCheckParams = {
                    context: validation.context,
                    monitor: compatibilityMonitor,
                    timeout:
                        timeout ??
                        this.config.timeout ??
                        DEFAULT_REQUEST_TIMEOUT,
                    url: paramsOrUrl,
                    ...(signal ? { signal } : {}),
                };

                return this.executeSingleCheck(compatibilityParams);
            }

            return this.executeSingleCheck(paramsOrUrl);
        }

        private async makeRequest(
            url: string,
            timeout: number,
            signal?: AbortSignal
        ): Promise<AxiosResponse> {
            const signals = [AbortSignal.timeout(timeout)];
            if (signal) {
                signals.push(signal);
            }

            return this.axiosInstance.get(url, {
                signal: AbortSignal.any(signals),
                timeout,
            });
        }

        public constructor(config: MonitorConfig = {}) {
            this.config = {
                timeout: DEFAULT_REQUEST_TIMEOUT,
                userAgent: USER_AGENT,
                ...config,
            };

            this.axiosInstance = createHttpClient({
                timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
                userAgent: this.config.userAgent ?? USER_AGENT,
            });
        }

        public getConfig(): MonitorConfig {
            return { ...this.config };
        }

        public getType(): Site["monitors"][0]["type"] {
            return behavior.type;
        }

        public updateConfig(config: Partial<MonitorConfig>): void {
            const nextConfig: MonitorConfig = { ...this.config };
            const remaining = { ...config } as Partial<MonitorConfig>;
            delete remaining.timeout;
            delete remaining.userAgent;

            if (Object.hasOwn(config, "timeout")) {
                const { timeout } = config;
                if (
                    timeout !== undefined &&
                    (typeof timeout !== "number" ||
                        !Number.isFinite(timeout) ||
                        timeout <= 0)
                ) {
                    throw new Error(
                        "Invalid timeout: must be a positive number"
                    );
                }

                if (timeout === undefined) {
                    delete nextConfig.timeout;
                } else {
                    nextConfig.timeout = timeout;
                }
            }

            if (Object.hasOwn(config, "userAgent")) {
                const { userAgent } = config;
                if (userAgent !== undefined && typeof userAgent !== "string") {
                    throw new Error("Invalid userAgent: must be a string");
                }

                if (userAgent === undefined) {
                    delete nextConfig.userAgent;
                } else {
                    nextConfig.userAgent = userAgent;
                }
            }

            Object.assign(nextConfig, remaining);

            this.config = nextConfig;

            this.axiosInstance = createHttpClient({
                timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
                userAgent: this.config.userAgent ?? USER_AGENT,
            });
        }
    };
}
