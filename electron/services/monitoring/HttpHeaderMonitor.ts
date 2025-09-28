/**
 * HTTP header monitor service that validates the presence and value of a
 * specific HTTP response header.
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

const TRIMMED_HEADER_VALUE_MAX_LENGTH = 2048;

function getTrimmedString(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

function normalizeHeaderName(value: string): string {
    return value.trim().toLowerCase();
}

function normalizeHeaderValue(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length > TRIMMED_HEADER_VALUE_MAX_LENGTH) {
        return `${trimmed.slice(0, TRIMMED_HEADER_VALUE_MAX_LENGTH)}…`;
    }

    return trimmed;
}

function resolveHeaderValue(
    headers: AxiosResponse["headers"],
    name: string
): null | string {
    const normalizedName = normalizeHeaderName(name);
    const rawValue = (headers as Record<string, unknown>)[normalizedName];

    if (rawValue === undefined || rawValue === null) {
        return null;
    }

    if (Array.isArray(rawValue)) {
        return rawValue.map(String).join(", ");
    }

    if (typeof rawValue === "string") {
        return rawValue;
    }

    if (typeof rawValue === "number" || typeof rawValue === "boolean") {
        return String(rawValue);
    }

    if (rawValue instanceof Date) {
        return rawValue.toISOString();
    }

    try {
        return JSON.stringify(rawValue);
    } catch (error) {
        logger.warn("[HttpHeaderMonitor] Unable to serialise header value", {
            error,
        });
        return "[unserializable]";
    }
}

export class HttpHeaderMonitor implements IMonitorService {
    private static readonly rateLimiter = getSharedHttpRateLimiter();

    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "http-header") {
            throw new Error(
                `HttpHeaderMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const headerName = getTrimmedString(monitor.headerName);
        const expectedValue = getTrimmedString(monitor.expectedHeaderValue);

        if (!headerName) {
            return createMonitorErrorResult(
                "Monitor missing or invalid header name",
                0
            );
        }

        if (!expectedValue) {
            return createMonitorErrorResult(
                "Monitor missing or invalid expected header value",
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
        return HttpHeaderMonitor.rateLimiter.schedule(url, () =>
            this.performHeaderCheckWithRetry(
                url,
                headerName,
                expectedValue,
                timeout,
                retryAttempts,
                signal
            )
        );
    }

    private async performHeaderCheckWithRetry(
        url: string,
        headerName: string,
        expectedValue: string,
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
                    this.performSingleHeaderCheck(
                        url,
                        headerName,
                        expectedValue,
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
                    operationName: `HTTP header check for ${url}`,
                    ...(isDev() && {
                        onRetry: (attempt: number, error: Error): void => {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : String(error);
                            logger.debug(
                                `[HttpHeaderMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                            );
                        },
                    }),
                }
            );
        } catch (error) {
            return handleCheckError(error, url);
        }
    }

    private async performSingleHeaderCheck(
        url: string,
        headerName: string,
        expectedValue: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const response = await this.makeRequest(url, timeout, signal);
        const responseTime = response.responseTime ?? 0;
        const resolvedValue = resolveHeaderValue(response.headers, headerName);
        const normalizedExpected = normalizeHeaderValue(expectedValue);

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

        if (resolvedValue === null) {
            return {
                details: `Header "${headerName}" not found`,
                responseTime,
                status: "degraded",
            };
        }

        const normalizedActual = normalizeHeaderValue(resolvedValue);
        if (normalizedActual === normalizedExpected) {
            return {
                details: `Header "${headerName}" matched expected value`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Header "${headerName}" mismatch (expected "${normalizedExpected}", received "${normalizedActual}")`,
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
        return "http-header";
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
