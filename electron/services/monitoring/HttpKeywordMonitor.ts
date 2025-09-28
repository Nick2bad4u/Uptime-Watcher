/**
 * HTTP keyword monitor service that verifies the presence of specific content
 * within an HTTP/HTTPS response body.
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

/**
 * Monitor service for ensuring an HTTP response contains a required keyword.
 */
function getTrimmedKeyword(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

export class HttpKeywordMonitor implements IMonitorService {
    private static readonly rateLimiter = getSharedHttpRateLimiter();

    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "http-keyword") {
            throw new Error(
                `HttpKeywordMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const keyword = getTrimmedKeyword(monitor.bodyKeyword);

        if (!keyword) {
            return createMonitorErrorResult(
                "Monitor missing or invalid keyword",
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
        return HttpKeywordMonitor.rateLimiter.schedule(url, () =>
            this.performKeywordCheckWithRetry(
                url,
                keyword,
                timeout,
                retryAttempts,
                signal
            )
        );
    }

    private async performKeywordCheckWithRetry(
        url: string,
        keyword: string,
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
                    this.performSingleKeywordCheck(
                        url,
                        keyword,
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
                    operationName: `HTTP keyword check for ${url}`,
                    ...(isDev() && {
                        onRetry: (attempt: number, error: Error): void => {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : String(error);
                            logger.debug(
                                `[HttpKeywordMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                            );
                        },
                    }),
                }
            );
        } catch (error) {
            return handleCheckError(error, url);
        }
    }

    private async performSingleKeywordCheck(
        url: string,
        keyword: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const response = await this.makeRequest(url, timeout, signal);
        const responseTime = response.responseTime ?? 0;
        const body =
            typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data);
        const normalizedBody = body.toLowerCase();
        const normalizedKeyword = keyword.toLowerCase();
        const containsKeyword = normalizedBody.includes(normalizedKeyword);

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

        if (containsKeyword) {
            return {
                details: `Keyword "${keyword}" found`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Keyword "${keyword}" not found`,
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

    public getConfig(): MonitorConfig {
        return { ...this.config };
    }

    public getType(): Site["monitors"][0]["type"] {
        return "http-keyword";
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
