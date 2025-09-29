/**
 * Server heartbeat monitor service.
 *
 * @remarks
 * Validates that a heartbeat endpoint reports an expected status value and that
 * the reported timestamp is within an acceptable drift threshold.
 */

import type { MonitorType, Site } from "@shared/types";
import type { AxiosInstance } from "axios";

import { ensureError } from "@shared/utils/errorHandling";
import { isValidUrl } from "@shared/validation/validatorUtils";
import { performance } from "node:perf_hooks";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { logger } from "../../utils/logger";
import { withOperationalHooks } from "../../utils/operationalHooks";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
    extractNestedFieldValue,
    normalizeTimestampValue,
} from "./shared/monitorServiceHelpers";
import { createHttpClient } from "./utils/httpClient";

interface HeartbeatPayload {
    data: unknown;
    responseTime: number;
}

interface ResolvedHeartbeatConfig {
    expectedStatus: string;
    statusField: string;
    timestampField: string;
    url: string;
}

const DEFAULT_MAX_DRIFT_SECONDS = 60;

export class ServerHeartbeatMonitor implements IMonitorService {
    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "server-heartbeat") {
            throw new Error(
                `ServerHeartbeatMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const resolvedConfig = this.resolveConfiguration(monitor);
        if ("error" in resolvedConfig) {
            return createMonitorErrorResult(resolvedConfig.error, 0);
        }

        const { expectedStatus, statusField, timestampField, url } =
            resolvedConfig;
        const maxDriftSeconds = this.resolveMaxDriftSeconds(monitor);
        const { retryAttempts, timeout } = extractMonitorConfig(
            monitor,
            this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
        );

        try {
            return await withOperationalHooks(
                () =>
                    this.performHeartbeatCheck(
                        url,
                        statusField,
                        timestampField,
                        expectedStatus,
                        maxDriftSeconds,
                        timeout,
                        signal
                    ),
                {
                    failureLogLevel: "warn",
                    maxRetries: retryAttempts + 1,
                    operationName: `Server heartbeat check for ${url}`,
                }
            );
        } catch (error) {
            const normalized = ensureError(error);
            logger.warn(
                `[ServerHeartbeatMonitor] Heartbeat check failed for ${url}`,
                normalized
            );
            return {
                ...createMonitorErrorResult(normalized.message, 0),
                details: normalized.message,
            };
        }
    }

    private async performHeartbeatCheck(
        url: string,
        statusField: string,
        timestampField: string,
        expectedStatus: string,
        maxDriftSeconds: number,
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const started = performance.now();

        const payload = await this.fetchHeartbeatPayload(url, timeout, signal);

        const statusValue = extractNestedFieldValue(payload.data, statusField);
        if (typeof statusValue !== "string") {
            return createMonitorErrorResult(
                `Heartbeat status field '${statusField}' missing or invalid`,
                payload.responseTime
            );
        }

        const timestampValue = normalizeTimestampValue(
            extractNestedFieldValue(payload.data, timestampField)
        );
        if (timestampValue === undefined) {
            return createMonitorErrorResult(
                `Heartbeat timestamp field '${timestampField}' missing or invalid`,
                payload.responseTime
            );
        }

        const driftSeconds = Math.abs(Date.now() - timestampValue) / 1000;
        const responseTime = Math.round(performance.now() - started);

        const detailSegments: string[] = [
            `Status: ${statusValue}`,
            `Drift: ${driftSeconds.toFixed(2)}s (max ${maxDriftSeconds}s)`,
        ];

        if (statusValue === expectedStatus && driftSeconds <= maxDriftSeconds) {
            return {
                details: detailSegments.join("; "),
                responseTime,
                status: "up",
            };
        }

        const isStatusMismatch = statusValue !== expectedStatus;
        const isDriftExceeded = driftSeconds > maxDriftSeconds;

        const details = detailSegments.join("; ");

        return {
            details,
            responseTime,
            status: isStatusMismatch || isDriftExceeded ? "degraded" : "up",
            ...(isStatusMismatch && {
                error: `Expected heartbeat status '${expectedStatus}' but received '${statusValue}'`,
            }),
        };
    }

    private async fetchHeartbeatPayload(
        url: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<HeartbeatPayload> {
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
                        const normalizedParseError = ensureError(parseError);
                        throw new Error(
                            `Invalid JSON response from ${url}: ${normalizedParseError.message}`,
                            { cause: parseError }
                        );
                    }
                }
            }

            return {
                data: parsed,
                responseTime: response.responseTime ?? timeout,
            };
        } catch (fetchError) {
            const normalizedFetchError = ensureError(fetchError);
            throw new Error(
                `Failed to fetch heartbeat from ${url}: ${normalizedFetchError.message}`,
                { cause: fetchError }
            );
        }
    }

    private resolveConfiguration(
        monitor: Site["monitors"][0]
    ): ResolvedHeartbeatConfig | { error: string } {
        const urlCandidate = Reflect.get(monitor, "url");
        if (typeof urlCandidate !== "string" || !isValidUrl(urlCandidate)) {
            return { error: "Heartbeat monitor requires a valid URL" };
        }

        const statusFieldCandidate = Reflect.get(
            monitor,
            "heartbeatStatusField"
        );
        if (
            typeof statusFieldCandidate !== "string" ||
            statusFieldCandidate.trim().length === 0
        ) {
            return { error: "Heartbeat status field is required" };
        }

        const timestampFieldCandidate = Reflect.get(
            monitor,
            "heartbeatTimestampField"
        );
        if (
            typeof timestampFieldCandidate !== "string" ||
            timestampFieldCandidate.trim().length === 0
        ) {
            return { error: "Heartbeat timestamp field is required" };
        }

        const expectedStatusCandidate = Reflect.get(
            monitor,
            "heartbeatExpectedStatus"
        );
        if (
            typeof expectedStatusCandidate !== "string" ||
            expectedStatusCandidate.trim().length === 0
        ) {
            return { error: "Heartbeat expected status is required" };
        }

        return {
            expectedStatus: expectedStatusCandidate.trim(),
            statusField: statusFieldCandidate.trim(),
            timestampField: timestampFieldCandidate.trim(),
            url: urlCandidate.trim(),
        };
    }

    private resolveMaxDriftSeconds(monitor: Site["monitors"][0]): number {
        const monitorValue = Reflect.get(
            monitor,
            "heartbeatMaxDriftSeconds"
        ) as unknown;
        if (
            typeof monitorValue === "number" &&
            Number.isFinite(monitorValue) &&
            monitorValue >= 0
        ) {
            return monitorValue;
        }

        if (Object.hasOwn(this.config, "heartbeatMaxDriftSeconds")) {
            const candidate = Reflect.get(
                this.config,
                "heartbeatMaxDriftSeconds"
            ) as unknown;
            if (
                typeof candidate === "number" &&
                Number.isFinite(candidate) &&
                candidate >= 0
            ) {
                return candidate;
            }
        }

        return DEFAULT_MAX_DRIFT_SECONDS;
    }

    public constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
        this.axiosInstance = createHttpClient(this.config);
    }

    public getType(): MonitorType {
        return "server-heartbeat";
    }

    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
        this.axiosInstance = createHttpClient(this.config);
    }
}
