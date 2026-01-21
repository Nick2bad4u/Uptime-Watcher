/**
 * Server heartbeat monitor service leveraging the shared remote monitor core
 * for request orchestration and retry handling.
 */

/* eslint-disable ex/no-unhandled -- Monitor factory construction is deterministic and safe */

import type { Monitor } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import { isValidUrl } from "@shared/validation/validatorUtils";
import { performance } from "node:perf_hooks";

import type { IMonitorService, MonitorServiceConfig } from "./types";

import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import {
    createMonitorErrorResult,
    extractNestedFieldValue,
    normalizeTimestampValue,
} from "./shared/monitorServiceHelpers";
import {
    createRemoteMonitorService,
    type RemoteEndpointPayload,
    type RemoteMonitorBehavior,
} from "./shared/remoteMonitorCore";

const DEFAULT_MAX_DRIFT_SECONDS = 60;

type ServerHeartbeatMonitorInstance = Monitor & {
    type: "server-heartbeat";
};

interface ServerHeartbeatContext {
    expectedStatus: string;
    maxDriftSeconds: number;
    statusField: string;
    timestampField: string;
    url: string;
}

function resolveMaxDriftSeconds(
    monitor: ServerHeartbeatMonitorInstance,
    serviceConfig: MonitorServiceConfig
): number {
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

    if (Object.hasOwn(serviceConfig, "heartbeatMaxDriftSeconds")) {
        const candidate = Reflect.get(
            serviceConfig,
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

const behavior: RemoteMonitorBehavior<
    "server-heartbeat",
    ServerHeartbeatContext
> = {
    executeCheck: async ({ context, fetchEndpoint, signal, timeout }) => {
        const started = performance.now();
        const payload = await (async (): Promise<RemoteEndpointPayload> => {
            try {
                return await fetchEndpoint(context.url, timeout, signal);
            } catch (fetchError) {
                const normalized = ensureError(fetchError);
                throw new Error(
                    `Failed to fetch heartbeat: ${normalized.message}`,
                    {
                        cause: fetchError,
                    }
                );
            }
        })();

        const statusValue = extractNestedFieldValue(
            payload.data,
            context.statusField
        );
        if (typeof statusValue !== "string") {
            return createMonitorErrorResult(
                `Heartbeat status field '${context.statusField}' missing or invalid`,
                payload.responseTime
            );
        }

        const timestampValue = normalizeTimestampValue(
            extractNestedFieldValue(payload.data, context.timestampField)
        );
        if (timestampValue === undefined) {
            return createMonitorErrorResult(
                `Heartbeat timestamp field '${context.timestampField}' missing or invalid`,
                payload.responseTime
            );
        }

        const driftSeconds = Math.abs(Date.now() - timestampValue) / 1000;
        const responseTime = Math.round(performance.now() - started);

        const detailSegments = [
            `Status: ${statusValue}`,
            `Drift: ${driftSeconds.toFixed(2)}s (max ${context.maxDriftSeconds}s)`,
        ];

        if (
            statusValue === context.expectedStatus &&
            driftSeconds <= context.maxDriftSeconds
        ) {
            return {
                details: detailSegments.join("; "),
                responseTime,
                status: "up",
            };
        }

        const isStatusMismatch = statusValue !== context.expectedStatus;
        const isDriftExceeded = driftSeconds > context.maxDriftSeconds;
        const details = detailSegments.join("; ");

        return {
            ...(isStatusMismatch && {
                error: `Expected heartbeat status '${context.expectedStatus}' but received '${statusValue}'`,
            }),
            details,
            responseTime,
            status: isStatusMismatch || isDriftExceeded ? "degraded" : "up",
        };
    },
    failureLogLevel: "warn",
    getOperationName: (context) => `Server heartbeat check for ${context.url}`,
    resolveConfiguration: (monitor, serviceConfig) => {
        const urlCandidate = Reflect.get(monitor, "url") as unknown;
        if (typeof urlCandidate !== "string") {
            return {
                kind: "error",
                message: "Heartbeat monitor requires a valid URL",
            };
        }
        const url = urlCandidate.trim();
        if (!isValidUrl(url)) {
            return {
                kind: "error",
                message: "Heartbeat monitor requires a valid URL",
            };
        }

        const statusFieldCandidate = Reflect.get(
            monitor,
            "heartbeatStatusField"
        ) as unknown;
        if (typeof statusFieldCandidate !== "string") {
            return {
                kind: "error",
                message: "Heartbeat status field is required",
            };
        }
        const statusField = statusFieldCandidate.trim();
        if (statusField.length === 0) {
            return {
                kind: "error",
                message: "Heartbeat status field is required",
            };
        }

        const timestampFieldCandidate = Reflect.get(
            monitor,
            "heartbeatTimestampField"
        ) as unknown;
        if (typeof timestampFieldCandidate !== "string") {
            return {
                kind: "error",
                message: "Heartbeat timestamp field is required",
            };
        }
        const timestampField = timestampFieldCandidate.trim();
        if (timestampField.length === 0) {
            return {
                kind: "error",
                message: "Heartbeat timestamp field is required",
            };
        }

        const expectedStatusCandidate = Reflect.get(
            monitor,
            "heartbeatExpectedStatus"
        ) as unknown;
        if (typeof expectedStatusCandidate !== "string") {
            return {
                kind: "error",
                message: "Heartbeat expected status is required",
            };
        }
        const expectedStatus = expectedStatusCandidate.trim();
        if (expectedStatus.length === 0) {
            return {
                kind: "error",
                message: "Heartbeat expected status is required",
            };
        }

        const maxDriftSeconds = resolveMaxDriftSeconds(monitor, serviceConfig);

        return {
            context: {
                expectedStatus,
                maxDriftSeconds,
                statusField,
                timestampField,
                url,
            },
            kind: "success",
        };
    },
    scope: "ServerHeartbeatMonitor",
    type: "server-heartbeat",
};

const ServerHeartbeatMonitorBase: new (
    config?: MonitorServiceConfig
) => IMonitorService = buildMonitorFactory(
    () =>
        createRemoteMonitorService<"server-heartbeat", ServerHeartbeatContext>(
            behavior
        ),
    "ServerHeartbeatMonitor"
);

/**
 * Server heartbeat monitor service built atop the shared remote monitor core.
 */
export class ServerHeartbeatMonitor extends ServerHeartbeatMonitorBase {}

/* eslint-enable ex/no-unhandled -- Re-enable global exception handling linting */
