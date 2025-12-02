/**
 * HTTP latency monitor service built on the shared HTTP core.
 */

/* eslint-disable ex/no-unhandled -- Monitor factory construction is deterministic and safe */

import type { Monitor } from "@shared/types";

import type { MonitorServiceConfig } from "./types";

import {
    createHttpMonitorService,
    type HttpMonitorBehavior,
    type HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import { createMonitorErrorResult } from "./shared/monitorServiceHelpers";

function getThreshold(value: unknown): null | number {
    if (typeof value !== "number") {
        return null;
    }

    if (!Number.isFinite(value) || value <= 0) {
        return null;
    }

    return value;
}

/**
 * Runtime configuration contract for HTTP latency monitor instances.
 *
 * @internal
 */
type HttpLatencyMonitorConfig = Monitor & { type: "http-latency" };

const behavior: HttpMonitorBehavior<"http-latency", { threshold: number }> = {
    evaluateResponse: ({ context, responseTime }) => {
        if (responseTime <= context.threshold) {
            return {
                details: `Response time ${responseTime}ms within ${context.threshold}ms threshold`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Response time ${responseTime}ms exceeded ${context.threshold}ms threshold`,
            responseTime,
            status: "degraded",
        };
    },
    operationLabel: "HTTP latency check",
    scope: "HttpLatencyMonitor",
    type: "http-latency",
    validateMonitorSpecifics: (monitor: HttpLatencyMonitorConfig) => {
        const threshold = getThreshold(monitor.maxResponseTime);

        if (threshold === null) {
            return {
                kind: "error",
                result: createMonitorErrorResult(
                    "Monitor missing or invalid maximum response time",
                    0
                ),
            };
        }

        return {
            context: { threshold },
            kind: "context",
        };
    },
};

const HttpLatencyMonitorBase: new (
    config?: MonitorServiceConfig
) => HttpMonitorServiceInstance = buildMonitorFactory(
    () =>
        createHttpMonitorService<"http-latency", { threshold: number }>(
            behavior
        ),
    "HttpLatencyMonitor"
);

/**
 * HTTP latency monitor service driven by the shared HTTP core.
 */
export class HttpLatencyMonitor extends HttpLatencyMonitorBase {}

/* eslint-enable ex/no-unhandled -- Re-enable global exception handling linting */
