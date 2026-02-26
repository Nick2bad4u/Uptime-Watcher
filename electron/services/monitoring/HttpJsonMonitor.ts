import { ensureError } from "@shared/utils/errorHandling";

import type {
    HttpMonitorBehavior,
    HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import type { MonitorByType } from "./shared/monitorCoreHelpers";
import type { MonitorServiceConfig } from "./types";

import { createHttpMonitorService } from "./shared/httpMonitorCore";
import {
    extractJsonValueAtPath,
    isParseFailure,
    parseJsonPayload,
    stringifyJsonValue,
} from "./shared/httpMonitorJsonUtils";
import { resolveRequiredMonitorStringContext } from "./shared/httpMonitorStringUtils";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";

type HttpJsonMonitorConfig = MonitorByType<"http-json">;

interface HttpJsonMonitorValidationContext {
    expectedValue: string;
    jsonPath: string;
}

const HTTP_JSON_MONITOR_BEHAVIOR: HttpMonitorBehavior<
    "http-json",
    HttpJsonMonitorValidationContext
> = {
    evaluateResponse: ({ context, response, responseTime }) => {
        const parsed = parseJsonPayload(response.data);

        if (isParseFailure(parsed)) {
            return {
                details: "JSON parsing failed",
                responseTime,
                status: "degraded",
            } as const;
        }

        const extracted = extractJsonValueAtPath(
            parsed.payload,
            context.jsonPath
        );

        if (extracted === undefined) {
            return {
                details: `JSON path '${context.jsonPath}' not found in response`,
                responseTime,
                status: "degraded",
            } as const;
        }

        const normalizedValue = stringifyJsonValue(extracted);
        if (normalizedValue !== context.expectedValue) {
            return {
                details: `JSON value mismatch at path '${context.jsonPath}': expected '${context.expectedValue}' but got '${normalizedValue}'`,
                responseTime,
                status: "degraded",
            } as const;
        }

        return {
            details: `JSON value matched expected value at path '${context.jsonPath}'`,
            responseTime,
            status: "up",
        } as const;
    },
    operationLabel: "HTTP JSON check",
    scope: "HttpJsonMonitor",
    type: "http-json",
    validateMonitorSpecifics: (monitor: HttpJsonMonitorConfig) => {
        const jsonPathResult = resolveRequiredMonitorStringContext({
            errorMessage: "Monitor missing or invalid JSON path",
            onValue: (value) => value,
            value: monitor.jsonPath,
        });
        if (jsonPathResult.kind === "error") {
            return jsonPathResult;
        }

        const expectedValueResult = resolveRequiredMonitorStringContext({
            errorMessage: "Monitor missing or invalid expected JSON value",
            onValue: (value) => value,
            value: monitor.expectedJsonValue,
        });
        if (expectedValueResult.kind === "error") {
            return expectedValueResult;
        }

        return {
            context: {
                expectedValue: expectedValueResult.context,
                jsonPath: jsonPathResult.context,
            },
            kind: "context",
        } as const;
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
                        HttpJsonMonitorValidationContext
                    >(HTTP_JSON_MONITOR_BEHAVIOR),
                "HttpJsonMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * Monitors a JSON response path against an expected stringified value.
 */
export class HttpJsonMonitor extends HttpJsonMonitorBase {}
