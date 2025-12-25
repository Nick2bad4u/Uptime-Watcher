/**
 * CDN edge consistency monitor service.
 *
 * @remarks
 * Compares responses from CDN edge endpoints against an origin baseline to
 * detect drift in status codes or content. Uses hashing to compare response
 * bodies and reports mismatches or connectivity issues as degraded results
 * while surfacing hard failures as down status.
 */

import type { MonitorType, Site } from "@shared/types";
import type { AxiosInstance } from "axios";

import { ensureError } from "@shared/utils/errorHandling";
import { isValidUrl } from "@shared/validation/validatorUtils";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { logger } from "../../utils/logger";
import { withOperationalHooks } from "../../utils/operationalHooks";
import { createTimeoutSignal } from "./shared/abortSignalUtils";
import {
    createMonitorConfig,
    createMonitorErrorResult,
    parseMonitorUrlList,
} from "./shared/monitorServiceHelpers";
import { createHttpClient } from "./utils/httpClient";

interface EndpointSuccessResult {
    hash: string;
    responseTime: number;
    status: number;
    success: true;
}

interface EndpointFailureResult {
    error: string;
    responseTime: number;
    success: false;
}

type EndpointResult = EndpointFailureResult | EndpointSuccessResult;

interface EdgeResult {
    endpoint: string;
    result: EndpointResult;
}

const HASH_ALGORITHM = "sha256";

/**
 * CDN edge consistency monitor implementation.
 */
export class CdnEdgeConsistencyMonitor implements IMonitorService {
    private axiosInstance: AxiosInstance;

    private config: MonitorServiceConfig;

    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "cdn-edge-consistency") {
            throw new Error(
                `CdnEdgeConsistencyMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const validationError = this.validateConfiguration(monitor);
        if (validationError) {
            return createMonitorErrorResult(validationError, 0);
        }

        const baselineUrl = monitor.baselineUrl?.trim() ?? "";
        const edgeEndpoints = parseMonitorUrlList(monitor.edgeLocations ?? "");

        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });

        try {
            return await withOperationalHooks(
                () =>
                    this.performConsistencyCheck(
                        baselineUrl,
                        edgeEndpoints,
                        timeout,
                        signal
                    ),
                {
                    failureLogLevel: "warn",
                    maxRetries: retryAttempts + 1,
                    operationName: `CDN edge consistency check for ${baselineUrl}`,
                }
            );
        } catch (error) {
            const normalized = ensureError(error);
            logger.warn(
                `[CdnEdgeConsistencyMonitor] Consistency check failed for ${baselineUrl}`,
                normalized
            );
            return {
                ...createMonitorErrorResult(normalized.message, 0),
                details: normalized.message,
            };
        }
    }

    private async performConsistencyCheck(
        baselineUrl: string,
        edgeEndpoints: string[],
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const startTime = performance.now();

        const baselineResult = await this.fetchEndpoint(
            baselineUrl,
            timeout,
            signal
        );

        if (!baselineResult.success) {
            const baselineError =
                "error" in baselineResult
                    ? baselineResult.error
                    : "Unknown baseline failure";
            throw new Error(`Baseline request failed: ${baselineError}`);
        }

        const edgeResults = await Promise.all(
            edgeEndpoints.map(
                async (endpoint): Promise<EdgeResult> => ({
                    endpoint,
                    result: await this.fetchEndpoint(endpoint, timeout, signal),
                })
            )
        );

        const failureResults = edgeResults.filter(
            (entry): entry is EdgeResult & { result: EndpointFailureResult } =>
                !entry.result.success
        );

        if (failureResults.length === edgeEndpoints.length) {
            const failureSummary = failureResults
                .map((entry) => `${entry.endpoint}: ${entry.result.error}`)
                .join("; ");
            throw new Error(
                failureSummary.length > 0
                    ? failureSummary
                    : "All edge requests failed"
            );
        }

        const mismatchResults = edgeResults.filter(
            (entry): entry is EdgeResult & { result: EndpointSuccessResult } =>
                entry.result.success &&
                (entry.result.status !== baselineResult.status ||
                    entry.result.hash !== baselineResult.hash)
        );

        const responseTime = Math.round(performance.now() - startTime);

        if (failureResults.length === 0 && mismatchResults.length === 0) {
            return {
                details: `All ${edgeEndpoints.length} edge endpoints match baseline (${baselineResult.status})`,
                responseTime,
                status: "up",
            };
        }

        const detailSegments: string[] = [];

        if (mismatchResults.length > 0) {
            const mismatchList = mismatchResults
                .map((entry) => entry.endpoint)
                .join(", ");
            detailSegments.push(
                `${mismatchResults.length} edge(s) differ from baseline: ${mismatchList}`
            );
        }

        if (failureResults.length > 0) {
            const failureList = failureResults
                .map((entry) => `${entry.endpoint} (${entry.result.error})`)
                .join(", ");
            detailSegments.push(
                `${failureResults.length} edge(s) unavailable: ${failureList}`
            );
        }

        const failureSummary =
            failureResults.length > 0
                ? failureResults
                      .map(
                          (entry) => `${entry.endpoint}: ${entry.result.error}`
                      )
                      .join("; ")
                : undefined;

        const degradedResult: MonitorCheckResult = {
            details: detailSegments.join("; "),
            responseTime,
            status: "degraded",
        };

        if (failureSummary) {
            degradedResult.error = failureSummary;
        }

        return degradedResult;
    }

    private async fetchEndpoint(
        url: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<EndpointResult> {
        const combinedSignal = createTimeoutSignal(timeout, signal);

        try {
            const response = await this.axiosInstance.get<ArrayBuffer>(url, {
                responseType: "arraybuffer",
                signal: combinedSignal,
                timeout,
            });

            const rawData = response.data;
            const buffer =
                rawData instanceof ArrayBuffer
                    ? Buffer.from(rawData)
                    : Buffer.from(String(rawData));
            const hash = createHash(HASH_ALGORITHM)
                .update(buffer)
                .digest("hex");

            return {
                hash,
                responseTime: response.responseTime ?? timeout,
                status: response.status,
                success: true,
            };
        } catch (error) {
            const normalized = ensureError(error);

            let responseTime = timeout;
            if (
                typeof error === "object" &&
                error !== null &&
                "responseTime" in error
            ) {
                const candidate = Reflect.get(error, "responseTime");
                if (
                    typeof candidate === "number" &&
                    Number.isFinite(candidate)
                ) {
                    responseTime = Math.max(0, Math.round(candidate));
                }
            }

            return {
                error: normalized.message,
                responseTime,
                success: false,
            };
        }
    }

    private validateConfiguration(
        monitor: Site["monitors"][0]
    ): string | undefined {
        if (!monitor.baselineUrl || !isValidUrl(monitor.baselineUrl)) {
            return "Baseline URL is required for CDN edge consistency monitors";
        }

        const edges = parseMonitorUrlList(monitor.edgeLocations ?? "");
        if (edges.length === 0) {
            return "At least one edge endpoint is required";
        }

        for (const edge of edges) {
            if (!isValidUrl(edge)) {
                return `Invalid edge endpoint URL: ${String(edge)}`;
            }
        }

        return undefined;
    }

    public constructor(config: MonitorServiceConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
        this.axiosInstance = createHttpClient(this.config);
    }

    public getType(): MonitorType {
        return "cdn-edge-consistency";
    }

    public updateConfig(config: Partial<MonitorServiceConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
        this.axiosInstance = createHttpClient(this.config);
    }
}
