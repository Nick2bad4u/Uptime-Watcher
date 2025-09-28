/**
 * HTTP latency monitor service that ensures response times remain below a
 * configured threshold.
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
} from "./types";

import {
    DEFAULT_REQUEST_TIMEOUT,
    RETRY_BACKOFF,
    USER_AGENT,
} from "../../constants";
import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { withOperationalHooks } from "../../utils/operationalHooks";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
    validateMonitorUrl,
} from "./shared/monitorServiceHelpers";
import { handleCheckError, isCancellationError } from "./utils/errorHandling";
import { createHttpClient } from "./utils/httpClient";
import { getSharedHttpRateLimiter } from "./utils/httpRateLimiter";

function getThreshold(value: unknown): null | number {
    if (typeof value !== "number") {
        return null;
    }

    if (!Number.isFinite(value) || value <= 0) {
        return null;
    }

    return value;
}

export class HttpLatencyMonitor implements IMonitorService {
    private static readonly rateLimiter = getSharedHttpRateLimiter();

    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "http-latency") {
            throw new Error(
                `HttpLatencyMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const threshold = getThreshold(monitor.maxResponseTime);
        if (threshold === null) {
            return createMonitorErrorResult(
                "Monitor missing or invalid maximum response time",
                0
            );
        }

        const validationError = validateMonitorUrl(monitor);
        if (validationError) {
            return createMonitorErrorResult(validationError, 0);
        }

        const { retryAttempts, timeout } = extractMonitorConfig(
            monitor,
            this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
        );

        const url = monitor.url ?? "";
        return HttpLatencyMonitor.rateLimiter.schedule(url, () =>
            this.performLatencyCheckWithRetry(
                url,
                threshold,
                timeout,
                retryAttempts,
                signal
            )
        );
    }

    private async performLatencyCheckWithRetry(
        url: string,
        threshold: number,
        timeout: number,
        maxRetries: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        try {
            if (signal?.aborted) {
                throw new Error("Operation was aborted");
            }

            const totalAttempts = maxRetries + 1;

            return await withOperationalHooks(
                () =>
                    this.performSingleLatencyCheck(
                        url,
                        threshold,
                        timeout,
                        signal
                    ),
                {
                    failureLogLevel: (encounteredError) =>
                        isCancellationError(encounteredError)
                            ? "warn"
                            : "error",
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: totalAttempts,
                    operationName: `HTTP latency check for ${url}`,
                    ...(isDev() && {
                        onRetry: (attempt: number, error: Error): void => {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : String(error);
                            logger.debug(
                                `[HttpLatencyMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                            );
                        },
                    }),
                }
            );
        } catch (error) {
            return handleCheckError(error, url);
        }
    }

    private async performSingleLatencyCheck(
        url: string,
        threshold: number,
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
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

        if (responseTime <= threshold) {
            return {
                details: `Response time ${responseTime}ms within ${threshold}ms threshold`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Response time ${responseTime}ms exceeded ${threshold}ms threshold`,
            responseTime,
            status: "degraded",
        };
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
            timeout: DEFAULT_REQUEST_TIMEOUT,
            userAgent: USER_AGENT,
            ...config,
        });
    }

    public getType(): Site["monitors"][0]["type"] {
        return "http-latency";
    }

    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };

        this.axiosInstance = createHttpClient({
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
            userAgent: this.config.userAgent ?? USER_AGENT,
        });
    }
}
