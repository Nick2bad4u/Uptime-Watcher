/**
 * Replication monitor service leveraging the shared remote monitor core for
 * request orchestration and retry handling.
 */

/* eslint-disable ex/no-unhandled -- Monitor factory construction is deterministic and safe */

import type { Monitor } from "@shared/types";

import { isValidUrl } from "@shared/validation/validatorUtils";
import { performance } from "node:perf_hooks";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorConfig,
} from "./types";

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

interface ReplicationMonitorConfig extends Monitor {
    maxReplicationLagSeconds?: number;
    primaryStatusUrl?: string;
    replicaStatusUrl?: string;
    replicationTimestampField?: string;
    type: "replication";
}

function resolveLagThreshold(
    monitor: ReplicationMonitorConfig,
    serviceConfig: MonitorConfig
): number {
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

    if (Object.hasOwn(serviceConfig, "maxReplicationLagSeconds")) {
        const candidate = Reflect.get(
            serviceConfig,
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
    resolveConfiguration: (
        monitor: ReplicationMonitorConfig,
        serviceConfig: MonitorConfig
    ) => {
        const primaryCandidate = Reflect.get(monitor, "primaryStatusUrl");
        if (typeof primaryCandidate !== "string") {
            return {
                kind: "error",
                message:
                    "Primary status URL is required for replication monitors",
            };
        }
        const primaryUrl = primaryCandidate.trim();
        if (!isValidUrl(primaryUrl)) {
            return {
                kind: "error",
                message:
                    "Primary status URL is required for replication monitors",
            };
        }

        const replicaCandidate = Reflect.get(monitor, "replicaStatusUrl");
        if (typeof replicaCandidate !== "string") {
            return {
                kind: "error",
                message:
                    "Replica status URL is required for replication monitors",
            };
        }
        const replicaUrl = replicaCandidate.trim();
        if (!isValidUrl(replicaUrl)) {
            return {
                kind: "error",
                message:
                    "Replica status URL is required for replication monitors",
            };
        }

        const timestampCandidate = Reflect.get(
            monitor,
            "replicationTimestampField"
        );
        if (typeof timestampCandidate !== "string") {
            return {
                kind: "error",
                message: "Replication timestamp field is required",
            };
        }
        const timestampField = timestampCandidate.trim();
        if (timestampField.length === 0) {
            return {
                kind: "error",
                message: "Replication timestamp field is required",
            };
        }

        const thresholdSeconds = resolveLagThreshold(monitor, serviceConfig);

        return {
            context: {
                primaryUrl,
                replicaUrl,
                thresholdSeconds,
                timestampField,
            },
            kind: "context",
        };
    },
    scope: "ReplicationMonitor",
    type: "replication",
};

const ReplicationMonitorBase: new (config?: MonitorConfig) => IMonitorService =
    buildMonitorFactory(
        () =>
            createRemoteMonitorService<
                "replication",
                ReplicationMonitorContext
            >(behavior),
        "ReplicationMonitor"
    );

/**
 * Replication monitor service built atop the shared remote monitor core.
 */
export class ReplicationMonitor extends ReplicationMonitorBase {}

/* eslint-enable ex/no-unhandled -- Re-enable global exception handling linting */
