/**
 * HTTP header monitor service built on the shared HTTP core.
 */

import type { Monitor } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";

import type { MonitorServiceConfig } from "./types";

import { logger } from "../../utils/logger";
import {
    createHttpMonitorService,
    type HttpMonitorBehavior,
    type HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import {
    getTrimmedNonEmptyString,
    normalizeHeaderValue,
    resolveHeaderValue,
} from "./shared/httpMonitorStringUtils";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import { createMonitorErrorResult } from "./shared/monitorServiceHelpers";

/**
 * Runtime configuration contract for HTTP header monitor instances.
 *
 * @internal
 */
type HttpHeaderMonitorConfig = Monitor & { type: "http-header" };

const behavior: HttpMonitorBehavior<
    "http-header",
    { expectedValue: string; headerName: string }
> = {
    evaluateResponse: ({ context, response, responseTime }) => {
        const resolvedValue = resolveHeaderValue({
            headerName: context.headerName,
            headers: response.headers,
            onSerializeError: (error) => {
                logger.warn(
                    "[HttpHeaderMonitor] Unable to serialise header value",
                    ensureError(error)
                );
            },
        });

        if (resolvedValue === null) {
            return {
                details: `Header "${context.headerName}" not found`,
                responseTime,
                status: "degraded",
            };
        }

        const normalizedActual = normalizeHeaderValue(resolvedValue);
        const normalizedExpected = normalizeHeaderValue(context.expectedValue);

        if (normalizedActual === normalizedExpected) {
            return {
                details: `Header "${context.headerName}" matched expected value`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Header "${context.headerName}" mismatch (expected "${normalizedExpected}", received "${normalizedActual}")`,
            responseTime,
            status: "degraded",
        };
    },
    operationLabel: "HTTP header check",
    scope: "HttpHeaderMonitor",
    type: "http-header",
    validateMonitorSpecifics: (monitor: HttpHeaderMonitorConfig) => {
        const headerName = getTrimmedNonEmptyString(monitor.headerName);
        const expectedValue = getTrimmedNonEmptyString(
            monitor.expectedHeaderValue
        );

        if (!headerName) {
            return {
                kind: "error",
                result: createMonitorErrorResult(
                    "Monitor missing or invalid header name",
                    0
                ),
            };
        }

        if (!expectedValue) {
            return {
                kind: "error",
                result: createMonitorErrorResult(
                    "Monitor missing or invalid expected header value",
                    0
                ),
            };
        }

        return {
            context: {
                expectedValue,
                headerName,
            },
            kind: "context",
        };
    },
};

type HttpHeaderMonitorConstructor = new (
    config?: MonitorServiceConfig
) => HttpMonitorServiceInstance;

const HttpHeaderMonitorBase: HttpHeaderMonitorConstructor =
    ((): HttpHeaderMonitorConstructor => {
        try {
            return buildMonitorFactory(
                () =>
                    createHttpMonitorService<
                        "http-header",
                        { expectedValue: string; headerName: string }
                    >(behavior),
                "HttpHeaderMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * HTTP header monitor service powered by the shared HTTP core.
 */
export class HttpHeaderMonitor extends HttpHeaderMonitorBase {}
