import type * as z from "zod";

import {
    httpHeaderMonitorSchema,
    httpJsonMonitorSchema,
    httpKeywordMonitorSchema,
    httpLatencyMonitorSchema,
    httpStatusMonitorSchema,
    monitorSchemas,
} from "@shared/validation/monitorSchemas";

import type { HttpMonitorRegistration } from "../MonitorTypeRegistry.types";

import { HttpHeaderMonitor } from "../HttpHeaderMonitor";
import { HttpJsonMonitor } from "../HttpJsonMonitor";
import { HttpKeywordMonitor } from "../HttpKeywordMonitor";
import { HttpLatencyMonitor } from "../HttpLatencyMonitor";
import { HttpMonitor } from "../HttpMonitor";
import { HttpStatusMonitor } from "../HttpStatusMonitor";

/**
 * Registers the built-in HTTP monitor types.
 *
 * @remarks
 * Extracted from `MonitorTypeRegistry.ts` to reduce file size. This module
 * intentionally avoids runtime imports from `MonitorTypeRegistry` to prevent
 * circular dependencies (it only uses type-only imports).
 */
export function registerHttpMonitorTypes(deps: {
    readonly registerHttpMonitorDefinition: (definition: HttpMonitorRegistration) => void;
    readonly toZodType: (schema: z.ZodType) => z.ZodType;
}): void {
    deps.registerHttpMonitorDefinition({
        description:
            "Monitors HTTP/HTTPS endpoints for availability and response time",
        displayName: "HTTP (Website/API)",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "example.com or 192.168.1.1",
                required: true,
                type: "url",
            },
        ],
        serviceFactory: () => new HttpMonitor(),
        type: "http",
        uiOverrides: {
            detailFormats: {
                analyticsLabel: "HTTP Response Time",
                historyDetail: (details: string) => `Response Code: ${details}`,
            },
            formatDetail: (details: string) => `Response Code: ${details}`,
            helpTexts: {
                primary: "Enter the full URL including http:// or https://",
                secondary:
                    "The monitor will check this URL according to your monitoring interval",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas.http,
        version: "1.0.0",
    });

    deps.registerHttpMonitorDefinition({
        description:
            "Validates that an HTTP/HTTPS response includes a specific header value.",
        displayName: "HTTP Header Match",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://example.com",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "Header to inspect in the HTTP response (case-insensitive).",
                label: "Header Name",
                name: "headerName",
                placeholder: "x-powered-by",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "Expected value for the header after trimming whitespace.",
                label: "Expected Header Value",
                name: "expectedHeaderValue",
                placeholder: "Express",
                required: true,
                type: "text",
            },
        ],
        serviceFactory: () => new HttpHeaderMonitor(),
        type: "http-header",
        uiOverrides: {
            detailFormats: {
                historyDetail: (details: string) => details,
            },
            formatDetail: (details: string) => details,
            helpTexts: {
                primary:
                    "Provide the response header name and expected value to monitor.",
                secondary:
                    "Comparison is case-sensitive after trimming whitespace from both values.",
            },
            supportsResponseTime: true,
        },
        validationSchema: deps.toZodType(httpHeaderMonitorSchema),
        version: "1.0.0",
    });

    deps.registerHttpMonitorDefinition({
        description:
            "Monitors HTTP/HTTPS endpoints and ensures the response body contains a required keyword.",
        displayName: "HTTP Keyword Match",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "example.com or 192.168.1.1",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "Enter the keyword that must appear in the response body (case-insensitive)",
                label: "Keyword",
                name: "bodyKeyword",
                placeholder: "status: ok",
                required: true,
                type: "text",
            },
        ],
        serviceFactory: () => new HttpKeywordMonitor(),
        type: "http-keyword",
        uiOverrides: {
            detailFormats: {
                analyticsLabel: "HTTP Keyword Response Time",
                historyDetail: (details: string) => `Keyword Check: ${details}`,
            },
            formatDetail: (details: string) => details,
            helpTexts: {
                primary: "Enter the keyword to look for in the response body",
                secondary:
                    "The response body is searched case-insensitively for the provided keyword.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: deps.toZodType(httpKeywordMonitorSchema),
        version: "1.0.0",
    });

    deps.registerHttpMonitorDefinition({
        description:
            "Validates JSON responses from HTTP/HTTPS endpoints by comparing values at specific paths.",
        displayName: "HTTP JSON Match",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://api.example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "Use dot notation with optional indexes (e.g., data.items[0].status).",
                label: "JSON Path",
                name: "jsonPath",
                placeholder: "data.status",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "Expected value at the specified JSON path after trimming whitespace.",
                label: "Expected Value",
                name: "expectedJsonValue",
                placeholder: "ok",
                required: true,
                type: "text",
            },
        ],
        serviceFactory: () => new HttpJsonMonitor(),
        type: "http-json",
        uiOverrides: {
            detailFormats: {
                historyDetail: (details: string) => details,
            },
            formatDetail: (details: string) => details,
            helpTexts: {
                primary:
                    "Provide the JSON path and expected value to validate in the response body.",
                secondary:
                    "Paths support nested properties and numeric indexes such as metadata.servers[0].status.",
            },
            supportsResponseTime: true,
        },
        validationSchema: deps.toZodType(httpJsonMonitorSchema),
        version: "1.0.0",
    });

    deps.registerHttpMonitorDefinition({
        description:
            "Monitors HTTP/HTTPS endpoints and verifies the response status code matches the expected value.",
        displayName: "HTTP Status Code",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "example.com or 192.168.1.1",
                required: true,
                type: "url",
            },
            {
                helpText: "Enter the expected HTTP status code (100-599)",
                label: "Expected Status Code",
                max: 599,
                min: 100,
                name: "expectedStatusCode",
                placeholder: "200",
                required: true,
                type: "number",
            },
        ],
        serviceFactory: () => new HttpStatusMonitor(),
        type: "http-status",
        uiOverrides: {
            detailFormats: {
                analyticsLabel: "HTTP Status Response Time",
                historyDetail: (details: string) => `Status Check: ${details}`,
            },
            formatDetail: (details: string) => details,
            helpTexts: {
                primary: "Enter the expected HTTP status code for this endpoint",
                secondary:
                    "The monitor compares the response status with the expected status each run.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: deps.toZodType(httpStatusMonitorSchema),
        version: "1.0.0",
    });

    deps.registerHttpMonitorDefinition({
        description:
            "Tracks HTTP/HTTPS response times and warns when latency exceeds a configurable threshold.",
        displayName: "HTTP Latency Threshold",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://status.example.com",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "Maximum allowable response time in milliseconds before the monitor is marked degraded.",
                label: "Max Response Time (ms)",
                name: "maxResponseTime",
                placeholder: "1500",
                required: true,
                type: "number",
            },
        ],
        serviceFactory: () => new HttpLatencyMonitor(),
        type: "http-latency",
        uiOverrides: {
            detailFormats: {
                historyDetail: (details: string) => details,
            },
            formatDetail: (details: string) => details,
            helpTexts: {
                primary:
                    "Set the response time threshold that should trigger a degraded status.",
                secondary:
                    "Response times at or below the threshold report as healthy; higher values are degraded.",
            },
            supportsResponseTime: true,
        },
        validationSchema: deps.toZodType(httpLatencyMonitorSchema),
        version: "1.0.0",
    });
}
