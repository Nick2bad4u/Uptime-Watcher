/**
 * Server heartbeat monitor service leveraging the shared remote monitor core
 * for request orchestration and retry handling.
 */

import type { Monitor } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import { performance } from "node:perf_hooks";

import type { IMonitorService, MonitorServiceConfig } from "./types";

import {
    resolveMonitorNumericOverride,
    resolveRequiredMonitorStringField,
    resolveRequiredMonitorUrlField,
} from "./shared/monitorConfigValueResolvers";
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
    return resolveMonitorNumericOverride({
        fallbackValue: DEFAULT_MAX_DRIFT_SECONDS,
        minimumValue: 0,
        monitor,
        monitorFieldName: "heartbeatMaxDriftSeconds",
        serviceConfig,
    });
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
        const urlResult = resolveRequiredMonitorUrlField(
            monitor,
            "url",
            "Heartbeat monitor requires a valid URL"
        );
        if (!urlResult.ok) {
            return {
                kind: "error",
                message: urlResult.message,
            };
        }
        const { value: url } = urlResult;

        const statusFieldResult = resolveRequiredMonitorStringField(
            monitor,
            "heartbeatStatusField",
            "Heartbeat status field is required"
        );
        if (!statusFieldResult.ok) {
            return {
                kind: "error",
                message: statusFieldResult.message,
            };
        }
        const { value: statusField } = statusFieldResult;

        const timestampFieldResult = resolveRequiredMonitorStringField(
            monitor,
            "heartbeatTimestampField",
            "Heartbeat timestamp field is required"
        );
        if (!timestampFieldResult.ok) {
            return {
                kind: "error",
                message: timestampFieldResult.message,
            };
        }
        const { value: timestampField } = timestampFieldResult;

        const expectedStatusResult = resolveRequiredMonitorStringField(
            monitor,
            "heartbeatExpectedStatus",
            "Heartbeat expected status is required"
        );
        if (!expectedStatusResult.ok) {
            return {
                kind: "error",
                message: expectedStatusResult.message,
            };
        }
        const { value: expectedStatus } = expectedStatusResult;

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

type ServerHeartbeatMonitorConstructor = new (
    config?: MonitorServiceConfig
) => IMonitorService;

const ServerHeartbeatMonitorBase: ServerHeartbeatMonitorConstructor =
    ((): ServerHeartbeatMonitorConstructor => {
        try {
            return buildMonitorFactory(
                () =>
                    createRemoteMonitorService<
                        "server-heartbeat",
                        ServerHeartbeatContext
                    >(behavior),
                "ServerHeartbeatMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * Server heartbeat monitor service built atop the shared remote monitor core.
 */
export class ServerHeartbeatMonitor extends ServerHeartbeatMonitorBase {}
