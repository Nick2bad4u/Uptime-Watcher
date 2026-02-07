/**
 * HTTP JSON monitor service built on the shared HTTP core.
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
    extractJsonValueAtPath,
    isParseFailure,
    parseJsonPayload,
    stringifyJsonValue,
} from "./shared/httpMonitorJsonUtils";
import { getTrimmedNonEmptyString } from "./shared/httpMonitorStringUtils";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import { createMonitorErrorResult } from "./shared/monitorServiceHelpers";

/**
 * Runtime configuration contract for HTTP JSON monitor instances.
 *
 * @internal
 */
type HttpJsonMonitorConfig = Monitor & { type: "http-json" };

const behavior: HttpMonitorBehavior<
    "http-json",
    { expectedValue: string; jsonPath: string }
> = {
    evaluateResponse: ({ context, response, responseTime }) => {
        const parseResult = parseJsonPayload(response.data, (error) => {
            logger.warn("[HttpJsonMonitor] Failed to parse JSON payload", {
                message: ensureError(error).message,
            });
        });

        if (isParseFailure(parseResult)) {
            const { error } = parseResult;
            return {
                details: `JSON parsing failed: ${error.message}`,
                responseTime,
                status: "degraded",
            };
        }

        const actualValue = extractJsonValueAtPath(
            parseResult.payload,
            context.jsonPath
        );

        if (actualValue === undefined) {
            return {
                details: `JSON path "${context.jsonPath}" not found`,
                responseTime,
                status: "degraded",
            };
        }

        const actualAsString = stringifyJsonValue(actualValue, (error) => {
            logger.warn("[HttpJsonMonitor] Failed to serialise JSON value", {
                message: ensureError(error).message,
            });
        });
        if (actualAsString === context.expectedValue) {
            return {
                details: `JSON path "${context.jsonPath}" matched expected value`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `JSON path "${context.jsonPath}" mismatch (expected "${context.expectedValue}", received "${actualAsString}")`,
            responseTime,
            status: "degraded",
        };
    },
    operationLabel: "HTTP JSON check",
    scope: "HttpJsonMonitor",
    type: "http-json",
    validateMonitorSpecifics: (monitor: HttpJsonMonitorConfig) => {
        const jsonPath = getTrimmedNonEmptyString(monitor.jsonPath);
        const expectedValue = getTrimmedNonEmptyString(
            monitor.expectedJsonValue
        );

        if (!jsonPath) {
            return {
                kind: "error",
                result: createMonitorErrorResult(
                    "Monitor missing or invalid JSON path",
                    0
                ),
            };
        }

        if (!expectedValue) {
            return {
                kind: "error",
                result: createMonitorErrorResult(
                    "Monitor missing or invalid expected JSON value",
                    0
                ),
            };
        }

        return {
            context: {
                expectedValue,
                jsonPath,
            },
            kind: "context",
        };
    },
};

type HttpJsonMonitorConstructor = new (
    config?: MonitorServiceConfig
) => HttpMonitorServiceInstance;

const HttpJsonMonitorBase: HttpJsonMonitorConstructor =
    ((): HttpJsonMonitorConstructor => {
        try {
            return buildMonitorFactory(
                () =>
                    createHttpMonitorService<
                        "http-json",
                        { expectedValue: string; jsonPath: string }
                    >(behavior),
                "HttpJsonMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * HTTP JSON monitor service driven by the shared HTTP core.
 */
export class HttpJsonMonitor extends HttpJsonMonitorBase {}
