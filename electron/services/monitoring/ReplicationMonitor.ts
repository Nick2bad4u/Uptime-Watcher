/**
 * Replication monitor service.
 *
 * @remarks
 * Validates replication lag between a primary and replica status endpoint by
 * comparing timestamp fields. Reports degraded status when lag exceeds the
 * configured threshold and down status when required data is unavailable.
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

interface EndpointPayload {
    data: unknown;
    responseTime: number;
}

interface ResolvedReplicationConfig {
    primaryUrl: string;
    replicaUrl: string;
    timestampField: string;
}

const MINIMUM_LAG_THRESHOLD_SECONDS = 0;

export class ReplicationMonitor implements IMonitorService {
    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "replication") {
            throw new Error(
                `ReplicationMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const resolvedConfiguration = this.resolveConfiguration(monitor);
        if ("error" in resolvedConfiguration) {
            return createMonitorErrorResult(resolvedConfiguration.error, 0);
        }

        const { primaryUrl, replicaUrl, timestampField } =
            resolvedConfiguration;
        const thresholdSeconds = this.resolveLagThreshold(monitor);
        const { retryAttempts, timeout } = extractMonitorConfig(
            monitor,
            this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
        );

        try {
            return await withOperationalHooks(
                () =>
                    this.performReplicationCheck(
                        primaryUrl,
                        replicaUrl,
                        timestampField,
                        thresholdSeconds,
                        timeout,
                        signal
                    ),
                {
                    failureLogLevel: "warn",
                    maxRetries: retryAttempts + 1,
                    operationName: `Replication lag check for ${primaryUrl}`,
                }
            );
        } catch (error) {
            const normalized = ensureError(error);
            logger.warn(
                `[ReplicationMonitor] Replication check failed for ${primaryUrl}`,
                normalized
            );
            return {
                ...createMonitorErrorResult(normalized.message, 0),
                details: normalized.message,
            };
        }
    }

    private async performReplicationCheck(
        primaryUrl: string,
        replicaUrl: string,
        timestampField: string,
        thresholdSeconds: number,
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const started = performance.now();

        const [primary, replica] = await Promise.all([
            this.fetchStatusPayload(primaryUrl, timeout, signal),
            this.fetchStatusPayload(replicaUrl, timeout, signal),
        ]);

        const primaryTimestamp = normalizeTimestampValue(
            extractNestedFieldValue(primary.data, timestampField)
        );
        if (primaryTimestamp === undefined) {
            return createMonitorErrorResult(
                `Primary timestamp field '${timestampField}' missing or invalid`,
                Math.round(performance.now() - started)
            );
        }

        const replicaTimestamp = normalizeTimestampValue(
            extractNestedFieldValue(replica.data, timestampField)
        );
        if (replicaTimestamp === undefined) {
            return createMonitorErrorResult(
                `Replica timestamp field '${timestampField}' missing or invalid`,
                Math.round(performance.now() - started)
            );
        }

        const lagMilliseconds = Math.abs(primaryTimestamp - replicaTimestamp);
        const lagSeconds = lagMilliseconds / 1000;
        const responseTime = Math.round(performance.now() - started);

        if (lagSeconds <= thresholdSeconds) {
            return {
                details: `Replication lag ${lagSeconds.toFixed(2)}s within threshold ${thresholdSeconds}s`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Replication lag ${lagSeconds.toFixed(2)}s exceeds threshold ${thresholdSeconds}s`,
            responseTime,
            status: "degraded",
        };
    }

    private async fetchStatusPayload(
        url: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<EndpointPayload> {
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
                `Failed to fetch ${url}: ${normalizedFetchError.message}`,
                { cause: fetchError }
            );
        }
    }

    private resolveConfiguration(
        monitor: Site["monitors"][0]
    ): ResolvedReplicationConfig | { error: string } {
        const primaryCandidate = Reflect.get(monitor, "primaryStatusUrl");
        if (
            typeof primaryCandidate !== "string" ||
            !isValidUrl(primaryCandidate)
        ) {
            return {
                error: "Primary status URL is required for replication monitors",
            };
        }

        const replicaCandidate = Reflect.get(monitor, "replicaStatusUrl");
        if (
            typeof replicaCandidate !== "string" ||
            !isValidUrl(replicaCandidate)
        ) {
            return {
                error: "Replica status URL is required for replication monitors",
            };
        }

        const timestampCandidate = Reflect.get(
            monitor,
            "replicationTimestampField"
        );
        if (
            typeof timestampCandidate !== "string" ||
            timestampCandidate.trim().length === 0
        ) {
            return { error: "Replication timestamp field is required" };
        }

        return {
            primaryUrl: primaryCandidate.trim(),
            replicaUrl: replicaCandidate.trim(),
            timestampField: timestampCandidate.trim(),
        };
    }

    private resolveLagThreshold(monitor: Site["monitors"][0]): number {
        const monitorValue = Reflect.get(
            monitor,
            "maxReplicationLagSeconds"
        ) as unknown;
        if (
            typeof monitorValue === "number" &&
            Number.isFinite(monitorValue) &&
            monitorValue >= MINIMUM_LAG_THRESHOLD_SECONDS
        ) {
            return monitorValue;
        }

        if (Object.hasOwn(this.config, "maxReplicationLagSeconds")) {
            const candidate = Reflect.get(
                this.config,
                "maxReplicationLagSeconds"
            ) as unknown;
            if (
                typeof candidate === "number" &&
                Number.isFinite(candidate) &&
                candidate >= MINIMUM_LAG_THRESHOLD_SECONDS
            ) {
                return candidate;
            }
        }

        return MINIMUM_LAG_THRESHOLD_SECONDS;
    }

    public constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
        this.axiosInstance = createHttpClient(this.config);
    }

    public getType(): MonitorType {
        return "replication";
    }

    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
        this.axiosInstance = createHttpClient(this.config);
    }
}
