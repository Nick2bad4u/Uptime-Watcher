/**
 * Replication monitor service leveraging the shared remote monitor core for
 * request orchestration and retry handling.
 */

import type { Monitor } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import { performance } from "node:perf_hooks";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "./types";

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

const MINIMUM_LAG_THRESHOLD_SECONDS = 0;

interface ReplicationMonitorContext {
    primaryUrl: string;
    replicaUrl: string;
    thresholdSeconds: number;
    timestampField: string;
}

type ReplicationMonitorInstance = Monitor & { type: "replication" };

function resolveLagThreshold(
    monitor: ReplicationMonitorInstance,
    serviceConfig: MonitorServiceConfig
): number {
    return resolveMonitorNumericOverride({
        fallbackValue: MINIMUM_LAG_THRESHOLD_SECONDS,
        minimumValue: MINIMUM_LAG_THRESHOLD_SECONDS,
        monitor,
        monitorFieldName: "maxReplicationLagSeconds",
        serviceConfig,
    });
}

function evaluateTimestamp(
    payload: RemoteEndpointPayload,
    field: string,
    responseTime: number,
    role: "Primary" | "Replica"
): MonitorCheckResult | { kind: "ok"; timestamp: number } {
    const timestamp = normalizeTimestampValue(
        extractNestedFieldValue(payload.data, field)
    );

    if (timestamp === undefined) {
        return createMonitorErrorResult(
            `${role} timestamp field '${field}' missing or invalid`,
            responseTime
        );
    }

    return { kind: "ok", timestamp };
}

const behavior: RemoteMonitorBehavior<
    "replication",
    ReplicationMonitorContext
> = {
    executeCheck: async ({ context, fetchEndpoint, signal, timeout }) => {
        const started = performance.now();
        const [primary, replica] = await Promise.all([
            fetchEndpoint(context.primaryUrl, timeout, signal),
            fetchEndpoint(context.replicaUrl, timeout, signal),
        ]);

        const primaryEvaluation = evaluateTimestamp(
            primary,
            context.timestampField,
            Math.round(performance.now() - started),
            "Primary"
        );
        if ("status" in primaryEvaluation) {
            return primaryEvaluation;
        }

        const replicaEvaluation = evaluateTimestamp(
            replica,
            context.timestampField,
            Math.round(performance.now() - started),
            "Replica"
        );
        if ("status" in replicaEvaluation) {
            return replicaEvaluation;
        }

        const primaryTimestamp = primaryEvaluation.timestamp;
        const replicaTimestamp = replicaEvaluation.timestamp;

        const lagMilliseconds = Math.abs(primaryTimestamp - replicaTimestamp);
        const lagSeconds = lagMilliseconds / 1000;
        const responseTime = Math.round(performance.now() - started);

        if (lagSeconds <= context.thresholdSeconds) {
            return {
                details: `Replication lag ${lagSeconds.toFixed(2)}s within threshold ${context.thresholdSeconds}s`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Replication lag ${lagSeconds.toFixed(2)}s exceeds threshold ${context.thresholdSeconds}s`,
            responseTime,
            status: "degraded",
        };
    },
    failureLogLevel: "warn",
    getOperationName: (context) =>
        `Replication lag check for ${context.primaryUrl}`,
    resolveConfiguration: (monitor, serviceConfig) => {
        const primaryUrlResult = resolveRequiredMonitorUrlField(
            monitor,
            "primaryStatusUrl",
            "Primary status URL is required for replication monitors"
        );
        if (!primaryUrlResult.ok) {
            return {
                kind: "error",
                message: primaryUrlResult.message,
            };
        }
        const { value: primaryUrl } = primaryUrlResult;

        const replicaUrlResult = resolveRequiredMonitorUrlField(
            monitor,
            "replicaStatusUrl",
            "Replica status URL is required for replication monitors"
        );
        if (!replicaUrlResult.ok) {
            return {
                kind: "error",
                message: replicaUrlResult.message,
            };
        }
        const { value: replicaUrl } = replicaUrlResult;

        const timestampFieldResult = resolveRequiredMonitorStringField(
            monitor,
            "replicationTimestampField",
            "Replication timestamp field is required"
        );
        if (!timestampFieldResult.ok) {
            return {
                kind: "error",
                message: timestampFieldResult.message,
            };
        }
        const { value: timestampField } = timestampFieldResult;

        const thresholdSeconds = resolveLagThreshold(monitor, serviceConfig);

        return {
            context: {
                primaryUrl,
                replicaUrl,
                thresholdSeconds,
                timestampField,
            },
            kind: "success",
        };
    },
    scope: "ReplicationMonitor",
    type: "replication",
};

type ReplicationMonitorConstructor = new (
    config?: MonitorServiceConfig
) => IMonitorService;

const ReplicationMonitorBase: ReplicationMonitorConstructor =
    ((): ReplicationMonitorConstructor => {
        try {
            return buildMonitorFactory(
                () =>
                    createRemoteMonitorService<
                        "replication",
                        ReplicationMonitorContext
                    >(behavior),
                "ReplicationMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * Replication monitor service built atop the shared remote monitor core.
 */
export class ReplicationMonitor extends ReplicationMonitorBase {}
