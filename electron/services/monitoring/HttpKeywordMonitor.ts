import { ensureError } from "@shared/utils/errorHandling";

import type {
    HttpMonitorBehavior,
    HttpMonitorServiceInstance,
} from "./shared/httpMonitorCore";
import type { MonitorByType } from "./shared/monitorCoreHelpers";
import type { MonitorServiceConfig } from "./types";

import { createHttpMonitorService } from "./shared/httpMonitorCore";
import { resolveRequiredMonitorStringContext } from "./shared/httpMonitorStringUtils";
import { buildMonitorFactory } from "./shared/monitorFactoryUtils";

type HttpKeywordMonitorConfig = MonitorByType<"http-keyword">;

interface HttpKeywordMonitorValidationContext {
    keyword: string;
}

const HTTP_KEYWORD_MONITOR_BEHAVIOR: HttpMonitorBehavior<
    "http-keyword",
    HttpKeywordMonitorValidationContext
> = {
    evaluateResponse: ({ context, response, responseTime }) => {
        const responseBody =
            typeof response.data === "string" ? response.data : "";
        const hasKeyword = responseBody.includes(context.keyword);

        return {
            details: hasKeyword
                ? `Keyword "${context.keyword}" found in response`
                : `Keyword "${context.keyword}" not found in response`,
            responseTime,
            status: hasKeyword ? "up" : "degraded",
        } as const;
    },
    operationLabel: "HTTP keyword check",
    scope: "HttpKeywordMonitor",
    type: "http-keyword",
    validateMonitorSpecifics: (monitor: HttpKeywordMonitorConfig) =>
        resolveRequiredMonitorStringContext({
            errorMessage: "Monitor missing or invalid keyword",
            onValue: (keyword) => ({ keyword }),
            value: monitor.bodyKeyword,
        }),
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
                        HttpKeywordMonitorValidationContext
                    >(HTTP_KEYWORD_MONITOR_BEHAVIOR),
                "HttpKeywordMonitor"
            );
        } catch (error) {
            throw ensureError(error);
        }
    })();

/**
 * Monitors whether a configured keyword appears in an HTTP response body.
 *
 * @remarks
 * This monitor is useful for validating textual markers in dynamic pages or
 * API responses where status codes alone are insufficient.
 */
export class HttpKeywordMonitor extends HttpKeywordMonitorBase {}
