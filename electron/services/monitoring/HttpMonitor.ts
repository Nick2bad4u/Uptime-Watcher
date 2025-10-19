/**
 * Provides HTTP/HTTPS monitoring for web endpoint health checks using the
 * shared HTTP monitor core.
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
import { determineMonitorStatus } from "./utils/httpStatusUtils";

type HttpMonitorConfig = Monitor & { type: "http" };

const behavior: HttpMonitorBehavior<"http", HttpMonitorConfig, undefined> = {
    evaluateResponse: ({ response, responseTime }) => {
        const status = determineMonitorStatus(response.status);

        return {
            ...(status === "down" && { error: `HTTP ${response.status}` }),
            details: String(response.status),
            responseTime,
            status,
        };
    },
    operationLabel: "HTTP check",
    scope: "HttpMonitor",
    type: "http",
    validateMonitorSpecifics: () => ({
        context: undefined,
        kind: "context",
    }),
};

const HttpMonitorBase: new (
    config?: MonitorConfig
) => HttpMonitorServiceInstance = buildMonitorFactory(
    () =>
        createHttpMonitorService<"http", HttpMonitorConfig, undefined>(
            behavior
        ),
    "HttpMonitor"
);

/**
 * HTTP monitor service that performs health checks via the shared core.
 */
export class HttpMonitor extends HttpMonitorBase {}

/* eslint-enable ex/no-unhandled -- Re-enable global exception handling linting */
