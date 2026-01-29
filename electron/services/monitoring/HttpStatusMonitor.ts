/**
 * HTTP status monitor service built on the shared HTTP core.
 */

import type { Monitor } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";

import type { MonitorServiceConfig } from "./types";

import {
    createHttpMonitorService,
    type HttpMonitorBehavior,
    type HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import { createMonitorErrorResult } from "./shared/monitorServiceHelpers";

/**
 * Runtime configuration contract for HTTP status monitor instances.
 *
 * @internal
 */
type HttpStatusMonitorConfig = Monitor & { type: "http-status" };

const behavior: HttpMonitorBehavior<"http-status", { expectedStatus: number }> =
    {
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

type HttpStatusMonitorConstructor = new (
    config?: MonitorServiceConfig
) => HttpMonitorServiceInstance;

const HttpStatusMonitorBase: HttpStatusMonitorConstructor = ((): HttpStatusMonitorConstructor => {
    try {
        return buildMonitorFactory(
            () =>
                createHttpMonitorService<"http-status", { expectedStatus: number }>(
                    behavior
                ),
            "HttpStatusMonitor"
        );
    } catch (error) {
        throw ensureError(error);
    }
})();

/**
 * HTTP status monitor service that validates response codes via the shared
 * core.
 */
export class HttpStatusMonitor extends HttpStatusMonitorBase {}
