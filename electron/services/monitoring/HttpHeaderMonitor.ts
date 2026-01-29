/**
 * HTTP header monitor service built on the shared HTTP core.
 */

import type { Monitor } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import { isRecord as isSharedRecord } from "@shared/utils/typeHelpers";

import type { MonitorServiceConfig } from "./types";

import { logger } from "../../utils/logger";
import {
    createHttpMonitorService,
    type HttpMonitorBehavior,
    type HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import { createMonitorErrorResult } from "./shared/monitorServiceHelpers";

const TRIMMED_HEADER_VALUE_MAX_LENGTH = 2048;

function getTrimmedString(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

function normalizeHeaderName(value: string): string {
    return value.trim().toLowerCase();
}

function normalizeHeaderValue(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length > TRIMMED_HEADER_VALUE_MAX_LENGTH) {
        return `${trimmed.slice(0, TRIMMED_HEADER_VALUE_MAX_LENGTH)}…`;
    }

    return trimmed;
}

function resolveHeaderValue(headers: unknown, name: string): null | string {
    const normalizedName = normalizeHeaderName(name);
    if (!isSharedRecord(headers)) {
        return null;
    }

    const rawValue = headers[normalizedName];

    if (rawValue === undefined || rawValue === null) {
        return null;
    }

    if (Array.isArray(rawValue)) {
        return rawValue.map(String).join(", ");
    }

    if (typeof rawValue === "string") {
        return rawValue;
    }

    if (typeof rawValue === "number" || typeof rawValue === "boolean") {
        return String(rawValue);
    }

    if (rawValue instanceof Date) {
        return rawValue.toISOString();
    }

    try {
        return JSON.stringify(rawValue);
    } catch (error: unknown) {
        logger.warn(
            "[HttpHeaderMonitor] Unable to serialise header value",
            ensureError(error)
        );
        return "[unserializable]";
    }
}

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
        const resolvedValue = resolveHeaderValue(
            response.headers,
            context.headerName
        );

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
        const headerName = getTrimmedString(monitor.headerName);
        const expectedValue = getTrimmedString(monitor.expectedHeaderValue);

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

const HttpHeaderMonitorBase: HttpHeaderMonitorConstructor = ((): HttpHeaderMonitorConstructor => {
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
