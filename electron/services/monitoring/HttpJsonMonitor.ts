/**
 * HTTP JSON monitor service built on the shared HTTP core.
 */

/* eslint-disable ex/no-unhandled -- Monitor factory construction is deterministic and safe */

import type { Monitor } from "@shared/types";

import type { MonitorConfig } from "./types";

import { logger } from "../../utils/logger";
import {
    createHttpMonitorService,
    type HttpMonitorBehavior,
    type HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";
import { createMonitorErrorResult } from "./shared/monitorServiceHelpers";

function getTrimmedString(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toError(value: unknown): Error {
    return value instanceof Error ? value : new Error(String(value));
}

function extractValueAtPath(payload: unknown, path: string): unknown {
    if (payload === null || payload === undefined) {
        return undefined;
    }

    const segments = path.split(".").filter((segment) => segment.length > 0);
    let current: unknown = payload;

    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }

        const tokens = segment
            .split("[")
            .map((token) => token.replace("]", ""));
        const [firstToken, ...indexTokens] = tokens;
        const propertyToken = firstToken ?? "";

        if (propertyToken.length > 0) {
            if (!isRecord(current)) {
                return undefined;
            }

            current = current[propertyToken];
        }

        for (const indexToken of indexTokens) {
            if (indexToken.length === 0) {
                return undefined;
            }

            const parsedIndex = Number.parseInt(indexToken, 10);
            if (Number.isNaN(parsedIndex)) {
                return undefined;
            }

            if (!Array.isArray(current)) {
                return undefined;
            }

            current = current[parsedIndex];
        }
    }

    return current;
}

function stringifyValue(value: unknown): string {
    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (value === null) {
        return "null";
    }

    try {
        return JSON.stringify(value);
    } catch (error) {
        logger.warn("[HttpJsonMonitor] Failed to serialise JSON value", {
            error,
        });
        return "[unserializable]";
    }
}

function parsePayload(
    data: unknown
): { error: Error; ok: false } | { ok: true; payload: unknown } {
    if (typeof data === "string") {
        try {
            return {
                ok: true,
                payload: JSON.parse(data),
            };
        } catch (error) {
            logger.warn("[HttpJsonMonitor] Failed to parse JSON payload", {
                error,
            });
            return {
                error: toError(error),
                ok: false,
            };
        }
    }

    return { ok: true, payload: data };
}

function isParseError(
    result: ReturnType<typeof parsePayload>
): result is { error: Error; ok: false } {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- Literal comparison keeps type guard exhaustive
    return result.ok === false;
}

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
        const parseResult = parsePayload(response.data);

        if (isParseError(parseResult)) {
            const { error } = parseResult;
            return {
                details: `JSON parsing failed: ${error.message}`,
                responseTime,
                status: "degraded",
            };
        }

        const actualValue = extractValueAtPath(
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

        const actualAsString = stringifyValue(actualValue);
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
        const jsonPath = getTrimmedString(monitor.jsonPath);
        const expectedValue = getTrimmedString(monitor.expectedJsonValue);

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

const HttpJsonMonitorBase: new (
    config?: MonitorConfig
) => HttpMonitorServiceInstance = buildMonitorFactory(
    () =>
        createHttpMonitorService<
            "http-json",
            { expectedValue: string; jsonPath: string }
        >(behavior),
    "HttpJsonMonitor"
);

/**
 * HTTP JSON monitor service driven by the shared HTTP core.
 */
export class HttpJsonMonitor extends HttpJsonMonitorBase {}

/* eslint-enable ex/no-unhandled -- Re-enable global exception handling linting */
