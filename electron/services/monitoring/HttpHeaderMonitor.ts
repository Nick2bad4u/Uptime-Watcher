import { ensureError } from "@shared/utils/errorHandling";

import type {
    HttpMonitorBehavior,
    HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import type { MonitorByType } from "./shared/monitorCoreHelpers";
import type { MonitorServiceConfig } from "./types";

import { createHttpMonitorService } from "./shared/httpMonitorCore";
import {
    normalizeHeaderValue,
    resolveHeaderValue,
    resolveRequiredMonitorStringContext,
} from "./shared/httpMonitorStringUtils";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";

type HttpHeaderMonitorConfig = MonitorByType<"http-header">;

interface HttpHeaderMonitorValidationContext {
    expectedValue: string;
    headerName: string;
}

function isStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) && value.every((item) => typeof item === "string")
    );
}

function toStringHeaderRecord(
    headers: Record<string, unknown>
): Record<string, string | string[] | undefined> {
    const normalizedHeaders: Record<string, string | string[] | undefined> = {};

    for (const [key, value] of Object.entries(headers)) {
        if (
            typeof value === "string" ||
            value === undefined ||
            isStringArray(value)
        ) {
            normalizedHeaders[key] = value;
        }
    }

    return normalizedHeaders;
}

const HTTP_HEADER_MONITOR_BEHAVIOR: HttpMonitorBehavior<
    "http-header",
    HttpHeaderMonitorValidationContext
> = {
    evaluateResponse: ({ context, response, responseTime }) => {
        const headerValue = resolveHeaderValue(
            toStringHeaderRecord(response.headers),
            context.headerName
        );

        if (!headerValue) {
            return {
                details: `Expected header '${context.headerName}' not found in response`,
                responseTime,
                status: "degraded",
            } as const;
        }

        const normalizedValue = normalizeHeaderValue(headerValue);
        if (normalizedValue !== context.expectedValue) {
            return {
                details: `Header '${context.headerName}' mismatch: expected '${context.expectedValue}' but found '${normalizedValue}'`,
                responseTime,
                status: "degraded",
            } as const;
        }

        return {
            details: `Header '${context.headerName}' matched expected value`,
            responseTime,
            status: "up",
        } as const;
    },
    operationLabel: "HTTP header check",
    scope: "HttpHeaderMonitor",
    type: "http-header",
    validateMonitorSpecifics: (monitor: HttpHeaderMonitorConfig) => {
        const headerNameResult = resolveRequiredMonitorStringContext({
            errorMessage: "Monitor missing or invalid header name",
            onValue: (value) => value,
            value: monitor.headerName,
        });
        if (headerNameResult.kind === "error") {
            return headerNameResult;
        }

        const expectedValueResult = resolveRequiredMonitorStringContext({
            errorMessage: "Monitor missing or invalid expected header value",
            onValue: (value) => value,
            value: monitor.expectedHeaderValue,
        });
        if (expectedValueResult.kind === "error") {
            return expectedValueResult;
        }

        return {
            context: {
                expectedValue: expectedValueResult.context,
                headerName: headerNameResult.context,
            },
            kind: "context",
        } as const;
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
                        HttpHeaderMonitorValidationContext
                    >(HTTP_HEADER_MONITOR_BEHAVIOR),
                "HttpHeaderMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * Monitors an HTTP response header against an expected normalized value.
 */
export class HttpHeaderMonitor extends HttpHeaderMonitorBase {}
