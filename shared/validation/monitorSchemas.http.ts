/**
 * HTTP-family monitor schema builders.
 *
 * @remarks
 * This module exports factory functions only. The public constants are defined
 * in `monitorSchemas.ts` to satisfy repository rules that disallow re-exporting
 * imported values.
 */

import type {
    BaseMonitorSchemaType,
    HttpHeaderMonitorSchemaType,
    HttpJsonMonitorSchemaType,
    HttpKeywordMonitorSchemaType,
    HttpLatencyMonitorSchemaType,
    HttpMonitorSchemaType,
    HttpStatusMonitorSchemaType,
} from "@shared/types/schemaTypes";

import * as z from "zod";

import { VALIDATION_CONSTRAINTS } from "./monitorSchemas.common";

interface HttpMonitorSchemaBaseArgs {
    readonly baseMonitorSchema: BaseMonitorSchemaType;
    readonly httpUrlSchema: z.ZodString;
}

interface HttpHeaderMonitorSchemaArgs extends HttpMonitorSchemaBaseArgs {
    readonly httpHeaderNameSchema: z.ZodString;
    readonly httpHeaderValueSchema: z.ZodString;
}

interface HttpJsonMonitorSchemaArgs extends HttpMonitorSchemaBaseArgs {
    readonly jsonPathSchema: z.ZodString;
}

/** Creates the HTTP monitor schema. */
export function createHttpMonitorSchema(
    args: HttpMonitorSchemaBaseArgs
): HttpMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            followRedirects: z.boolean().optional(),
            type: z.literal("http"),
            url: args.httpUrlSchema,
        })
        .strict();
}

/** Creates the HTTP header monitor schema. */
export function createHttpHeaderMonitorSchema(
    args: HttpHeaderMonitorSchemaArgs
): HttpHeaderMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            expectedHeaderValue: args.httpHeaderValueSchema,
            followRedirects: z.boolean().optional(),
            headerName: args.httpHeaderNameSchema,
            type: z.literal("http-header"),
            url: args.httpUrlSchema,
        })
        .strict();
}

/** Creates the HTTP keyword monitor schema. */
export function createHttpKeywordMonitorSchema(
    args: HttpMonitorSchemaBaseArgs
): HttpKeywordMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            bodyKeyword: z
                .string()
                .min(1, "Keyword is required")
                .max(1024, "Keyword must be 1024 characters or fewer")
                .refine((keyword) => keyword.trim().length > 0, {
                    error: "Keyword is required",
                }),
            followRedirects: z.boolean().optional(),
            type: z.literal("http-keyword"),
            url: args.httpUrlSchema,
        })
        .strict();
}

/** Creates the HTTP JSON monitor schema. */
export function createHttpJsonMonitorSchema(
    args: HttpJsonMonitorSchemaArgs
): HttpJsonMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            expectedJsonValue: z
                .string()
                .min(1, "Expected JSON value is required")
                .max(2048, "Expected JSON value must be 2048 characters or fewer")
                .refine((value) => value.trim().length > 0, {
                    error: "Expected JSON value is required",
                }),
            followRedirects: z.boolean().optional(),
            jsonPath: args.jsonPathSchema,
            type: z.literal("http-json"),
            url: args.httpUrlSchema,
        })
        .strict();
}

/** Creates the HTTP status monitor schema. */
export function createHttpStatusMonitorSchema(
    args: HttpMonitorSchemaBaseArgs
): HttpStatusMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            expectedStatusCode: z
                .int("Status code must be an integer")
                .min(100, "Status code must be between 100 and 599")
                .max(599, "Status code must be between 100 and 599"),
            followRedirects: z.boolean().optional(),
            type: z.literal("http-status"),
            url: args.httpUrlSchema,
        })
        .strict();
}

/** Creates the HTTP latency monitor schema. */
export function createHttpLatencyMonitorSchema(
    args: HttpMonitorSchemaBaseArgs
): HttpLatencyMonitorSchemaType {
    return args.baseMonitorSchema
        .extend({
            followRedirects: z.boolean().optional(),
            maxResponseTime: z
                .number()
                .min(1, "Maximum response time must be at least 1 millisecond")
                .max(
                    VALIDATION_CONSTRAINTS.TIMEOUT.MAX,
                    "Maximum response time cannot exceed 300 seconds"
                ),
            type: z.literal("http-latency"),
            url: args.httpUrlSchema,
        })
        .strict();
}
