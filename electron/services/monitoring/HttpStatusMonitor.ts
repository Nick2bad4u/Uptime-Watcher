/**
 * HTTP status monitor service that verifies the response status code of an
 * HTTP/HTTPS endpoint.
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
 * Monitor service ensuring HTTP status codes match expectations.
 */
export class HttpStatusMonitor implements IMonitorService {
    private static readonly rateLimiter = getSharedHttpRateLimiter();

    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "http-status") {
            throw new Error(
                `HttpStatusMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const expectedStatus = Number(monitor.expectedStatusCode);
        if (
            !Number.isInteger(expectedStatus) ||
            expectedStatus < 100 ||
            expectedStatus > 599
        ) {
            return createMonitorErrorResult(
                "Monitor missing or invalid expected status code",
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
        return HttpStatusMonitor.rateLimiter.schedule(url, () =>
            this.performStatusCheckWithRetry(
                url,
                expectedStatus,
                timeout,
                retryAttempts,
                signal
            )
        );
    }

    private async performStatusCheckWithRetry(
        url: string,
        expectedStatus: number,
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
                    this.performSingleStatusCheck(
                        url,
                        expectedStatus,
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
                    operationName: `HTTP status check for ${url}`,
                    ...(isDev() && {
                        onRetry: (attempt: number, error: Error): void => {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : String(error);
                            logger.debug(
                                `[HttpStatusMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                            );
                        },
                    }),
                }
            );
        } catch (error) {
            return handleCheckError(error, url);
        }
    }

    private async performSingleStatusCheck(
        url: string,
        expectedStatus: number,
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

        if (response.status === expectedStatus) {
            return {
                details: `HTTP ${response.status}`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Expected ${expectedStatus}, received ${response.status}`,
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
        return "http-status";
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
