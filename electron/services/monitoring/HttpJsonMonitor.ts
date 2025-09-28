/**
 * HTTP JSON monitor service that validates JSON responses against expected
 * values using dot-notation paths.
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

function getTrimmedString(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toError(value: unknown): Error {
    return value instanceof Error ? value : new Error(String(value));
}

function extractValueAtPath(payload: unknown, path: string): unknown {
    if (payload === null || payload === undefined) {
        return undefined;
    }

    const segments = path.split(".").filter((segment) => segment.length > 0);
    let current: unknown = payload;

    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }

        const tokens = segment
            .split("[")
            .map((token) => token.replace("]", ""));
        const [firstToken, ...indexTokens] = tokens;
        const propertyToken = firstToken ?? "";

        if (propertyToken.length > 0) {
            if (!isRecord(current)) {
                return undefined;
            }

            current = current[propertyToken];
        }

        for (const indexToken of indexTokens) {
            if (indexToken.length === 0) {
                return undefined;
            }

            const parsedIndex = Number.parseInt(indexToken, 10);
            if (Number.isNaN(parsedIndex)) {
                return undefined;
            }

            if (!Array.isArray(current)) {
                return undefined;
            }

            current = current[parsedIndex];
        }
    }

    return current;
}

function stringifyValue(value: unknown): string {
    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (value === null) {
        return "null";
    }

    try {
        return JSON.stringify(value);
    } catch (error) {
        logger.warn("[HttpJsonMonitor] Failed to serialise JSON value", {
            error,
        });
        return "[unserializable]";
    }
}

export class HttpJsonMonitor implements IMonitorService {
    private static readonly rateLimiter = getSharedHttpRateLimiter();

    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "http-json") {
            throw new Error(
                `HttpJsonMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const jsonPath = getTrimmedString(monitor.jsonPath);
        const expectedValue = getTrimmedString(monitor.expectedJsonValue);

        if (!jsonPath) {
            return createMonitorErrorResult(
                "Monitor missing or invalid JSON path",
                0
            );
        }

        if (!expectedValue) {
            return createMonitorErrorResult(
                "Monitor missing or invalid expected JSON value",
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
        return HttpJsonMonitor.rateLimiter.schedule(url, () =>
            this.performJsonCheckWithRetry(
                url,
                jsonPath,
                expectedValue,
                timeout,
                retryAttempts,
                signal
            )
        );
    }

    private async performJsonCheckWithRetry(
        url: string,
        jsonPath: string,
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
                    this.performSingleJsonCheck(
                        url,
                        jsonPath,
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
                    operationName: `HTTP JSON check for ${url}`,
                    ...(isDev() && {
                        onRetry: (attempt: number, error: Error): void => {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : String(error);
                            logger.debug(
                                `[HttpJsonMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                            );
                        },
                    }),
                }
            );
        } catch (error) {
            return handleCheckError(error, url);
        }
    }

    private async performSingleJsonCheck(
        url: string,
        jsonPath: string,
        expectedValue: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const response = await this.makeRequest(url, timeout, signal);
        const responseTime = response.responseTime ?? 0;
        const parseResult = this.parsePayload(response.data);

        if (!parseResult.ok) {
            const parseError =
                "error" in parseResult
                    ? parseResult.error
                    : new Error("Unknown JSON parse error");
            return {
                details: `JSON parsing failed: ${parseError.message}`,
                responseTime,
                status: "degraded",
            };
        }

        const { payload } = parseResult;
        const actualValue = extractValueAtPath(payload, jsonPath);

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

        if (actualValue === undefined) {
            return {
                details: `JSON path "${jsonPath}" not found`,
                responseTime,
                status: "degraded",
            };
        }

        const actualAsString = stringifyValue(actualValue);
        if (actualAsString === expectedValue) {
            return {
                details: `JSON path "${jsonPath}" matched expected value`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `JSON path "${jsonPath}" mismatch (expected "${expectedValue}", received "${actualAsString}")`,
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

    private parsePayload(
        data: AxiosResponse["data"]
    ): { error: Error; ok: false } | { ok: true; payload: unknown } {
        if (typeof data === "string") {
            try {
                return {
                    ok: true,
                    payload: JSON.parse(data),
                };
            } catch (error) {
                logger.warn("[HttpJsonMonitor] Failed to parse JSON payload", {
                    error,
                });
                return {
                    error: toError(error),
                    ok: false,
                };
            }
        }

        return {
            ok: true,
            payload: data,
        };
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
        return "http-json";
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
