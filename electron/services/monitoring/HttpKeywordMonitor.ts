/**
 * HTTP keyword monitor service built on the shared HTTP core.
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

function getTrimmedKeyword(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

/**
 * Runtime configuration contract for HTTP keyword monitor instances.
 *
 * @internal
 */
type HttpKeywordMonitorConfig = Monitor & { type: "http-keyword" };

const behavior: HttpMonitorBehavior<"http-keyword", { keyword: string }> = {
    evaluateResponse: ({ context, response, responseTime }) => {
        const body =
            typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data);
        const normalizedBody = body.toLowerCase();
        const normalizedKeyword = context.keyword.toLowerCase();
        const containsKeyword = normalizedBody.includes(normalizedKeyword);

        if (containsKeyword) {
            return {
                details: `Keyword "${context.keyword}" found`,
                responseTime,
                status: "up",
            };
        }

        return {
            details: `Keyword "${context.keyword}" not found`,
            responseTime,
            status: "degraded",
        };
    },
    operationLabel: "HTTP keyword check",
    scope: "HttpKeywordMonitor",
    type: "http-keyword",
    validateMonitorSpecifics: (monitor: HttpKeywordMonitorConfig) => {
        const keyword = getTrimmedKeyword(monitor.bodyKeyword);

        if (!keyword) {
            return {
                kind: "error",
                result: createMonitorErrorResult(
                    "Monitor missing or invalid keyword",
                    0
                ),
            };
        }

        return {
            context: { keyword },
            kind: "context",
        };
    },
};

type HttpKeywordMonitorConstructor = new (
    config?: MonitorServiceConfig
) => HttpMonitorServiceInstance;

const HttpKeywordMonitorBase: HttpKeywordMonitorConstructor =
    ((): HttpKeywordMonitorConstructor => {
        try {
            return buildMonitorFactory(
                () =>
                    createHttpMonitorService<
                        "http-keyword",
                        { keyword: string }
                    >(behavior),
                "HttpKeywordMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * HTTP keyword monitor service powered by the shared HTTP core.
 */
export class HttpKeywordMonitor extends HttpKeywordMonitorBase {}
