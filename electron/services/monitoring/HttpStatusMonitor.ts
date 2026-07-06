/**
 * HTTP status monitor service built on the shared HTTP core.
 */

import type { Monitor } from "@shared/types";
import type { Constructor } from "type-fest";

import { isValidInteger } from "@shared/validation/validatorUtils";
import { isInteger } from "ts-extras";

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

function resolveExpectedStatusCode(value: unknown): number | undefined {
    if (typeof value === "number") {
        return isInteger(value) ? value : undefined;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (
            trimmed.startsWith("+") ||
            trimmed.startsWith("-") ||
            !isValidInteger(trimmed)
        ) {
            return undefined;
        }

        const parsed = Number.parseInt(trimmed, 10);
        return Number.isSafeInteger(parsed) ? parsed : undefined;
    }

    return undefined;
}

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
            const expectedStatus = resolveExpectedStatusCode(
                monitor.expectedStatusCode
            );

            if (
                typeof expectedStatus !== "number" ||
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

type HttpStatusMonitorConstructor = Constructor<
    HttpMonitorServiceInstance,
    [config?: MonitorServiceConfig]
>;

const HttpStatusMonitorBase: HttpStatusMonitorConstructor = buildMonitorFactory(
    () =>
        createHttpMonitorService<"http-status", { expectedStatus: number }>(
            behavior
        ),
    "HttpStatusMonitor"
);

/**
 * HTTP status monitor service that validates response codes via the shared
 * core.
 */
export class HttpStatusMonitor extends HttpStatusMonitorBase {}
