/**
 * HTTP status monitor service built on the shared HTTP core.
 */

/* eslint-disable ex/no-unhandled -- Monitor factory construction is deterministic and safe */

import type { Monitor } from "@shared/types";

import type { MonitorConfig } from "./types";

import {
    createHttpMonitorService,
    type HttpMonitorBehavior,
    type HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import { createMonitorErrorResult } from "./shared/monitorServiceHelpers";

type HttpStatusMonitorConfig = Monitor & { type: "http-status" };

const behavior: HttpMonitorBehavior<
    "http-status",
    HttpStatusMonitorConfig,
    { expectedStatus: number }
> = {
    evaluateResponse: ({ context, response, responseTime }) => {
        if (response.status === context.expectedStatus) {
            return {
                details: `HTTP ${response.status}`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Expected ${context.expectedStatus}, received ${response.status}`,
            responseTime,
            status: "degraded",
        };
    },
    operationLabel: "HTTP status check",
    scope: "HttpStatusMonitor",
    type: "http-status",
    validateMonitorSpecifics: (monitor: HttpStatusMonitorConfig) => {
        const expectedStatus = Number(monitor.expectedStatusCode);

        if (
            !Number.isInteger(expectedStatus) ||
            expectedStatus < 100 ||
            expectedStatus > 599
        ) {
            return {
                kind: "error",
                result: createMonitorErrorResult(
                    "Monitor missing or invalid expected status code",
                    0
                ),
            };
        }

        return {
            context: { expectedStatus },
            kind: "context",
        };
    },
};

const HttpStatusMonitorBase: new (
    config?: MonitorConfig
) => HttpMonitorServiceInstance = buildMonitorFactory(
    () =>
        createHttpMonitorService<
            "http-status",
            HttpStatusMonitorConfig,
            { expectedStatus: number }
        >(behavior),
    "HttpStatusMonitor"
);

/**
 * HTTP status monitor service that validates response codes via the shared
 * core.
 */
export class HttpStatusMonitor extends HttpStatusMonitorBase {}

/* eslint-enable ex/no-unhandled -- Re-enable global exception handling linting */
