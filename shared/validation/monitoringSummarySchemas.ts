/**
 * Monitoring lifecycle summary schemas and validators.
 *
 * @remarks
 * Defines runtime validation for monitoring start/stop summaries returned over
 * IPC. These schemas ensure renderer-facing payloads match the shared type
 * contracts before use.
 */

import type {
    MonitoringOperationSummary,
    MonitoringStartSummary,
    MonitoringStopSummary,
} from "@shared/types";

import * as z from "zod";

const nonNegativeIntSchema = z.int().nonnegative();

const monitoringOperationSummaryInternalSchema = z
    .object({
        attempted: nonNegativeIntSchema,
        failed: nonNegativeIntSchema,
        isMonitoring: z.boolean(),
        partialFailures: z.boolean(),
        siteCount: nonNegativeIntSchema,
        skipped: nonNegativeIntSchema,
        succeeded: nonNegativeIntSchema,
    })
    .strict()
    .superRefine((value, ctx) => {
        if (value.attempted !== value.succeeded + value.failed) {
            ctx.addIssue({
                code: "custom",
                message: "attempted must equal succeeded plus failed",
                path: ["attempted"],
            });
        }

        if (
            value.partialFailures !== (value.succeeded > 0 && value.failed > 0)
        ) {
            ctx.addIssue({
                code: "custom",
                message:
                    "partialFailures must reflect mixed successes and failures",
                path: ["partialFailures"],
            });
        }
    });

/** Zod schema for {@link MonitoringOperationSummary}. */
export const monitoringOperationSummarySchema: z.ZodType<MonitoringOperationSummary> =
    monitoringOperationSummaryInternalSchema;

const monitoringStartSummaryInternalSchema =
    monitoringOperationSummaryInternalSchema
        .extend({
            alreadyActive: z.boolean(),
        })
        .strict();

/** Zod schema for {@link MonitoringStartSummary}. */
export const monitoringStartSummarySchema: z.ZodType<MonitoringStartSummary> =
    monitoringStartSummaryInternalSchema;

const monitoringStopSummaryInternalSchema =
    monitoringOperationSummaryInternalSchema
        .extend({
            alreadyInactive: z.boolean(),
        })
        .strict();

/** Zod schema for {@link MonitoringStopSummary}. */
export const monitoringStopSummarySchema: z.ZodType<MonitoringStopSummary> =
    monitoringStopSummaryInternalSchema;

/**
 * Validates an unknown payload against {@link MonitoringOperationSummary}.
 */
export const validateMonitoringOperationSummary = (
    value: unknown
): ReturnType<typeof monitoringOperationSummarySchema.safeParse> =>
    monitoringOperationSummarySchema.safeParse(value);

/**
 * Validates an unknown payload against {@link MonitoringStartSummary}.
 */
export const validateMonitoringStartSummary = (
    value: unknown
): ReturnType<typeof monitoringStartSummarySchema.safeParse> =>
    monitoringStartSummarySchema.safeParse(value);

/**
 * Validates an unknown payload against {@link MonitoringStopSummary}.
 */
export const validateMonitoringStopSummary = (
    value: unknown
): ReturnType<typeof monitoringStopSummarySchema.safeParse> =>
    monitoringStopSummarySchema.safeParse(value);
