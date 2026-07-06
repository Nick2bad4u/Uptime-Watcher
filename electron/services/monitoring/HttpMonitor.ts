/**
 * Provides HTTP/HTTPS monitoring for web endpoint health checks using the
 * shared HTTP monitor core.
 */

import type { Constructor } from "type-fest";
import { determineMonitorStatus } from "@shared/utils/httpStatusUtils";

import type { MonitorServiceConfig } from "./types";

import {
    createHttpMonitorService,
    type HttpMonitorBehavior,
    type HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";

const behavior: HttpMonitorBehavior<"http", undefined> = {
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

type HttpMonitorConstructor = Constructor<
    HttpMonitorServiceInstance,
    [config?: MonitorServiceConfig]
>;

const HttpMonitorBase: HttpMonitorConstructor = buildMonitorFactory(
    () => createHttpMonitorService<"http", undefined>(behavior),
    "HttpMonitor"
);

/**
 * HTTP monitor service that performs health checks via the shared core.
 */
export class HttpMonitor extends HttpMonitorBase {}
