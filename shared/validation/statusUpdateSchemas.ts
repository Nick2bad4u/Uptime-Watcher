import type { MonitorStatus, StatusUpdate } from "@shared/types";
import type {
    MonitorSchemaType,
    SiteSchemaType,
} from "@shared/types/schemaTypes";

import * as z from "zod";

import { monitorIdSchema } from "./monitorFieldSchemas";
import { monitorSchema } from "./monitorSchemas";
import { siteIdentifierSchema } from "./siteFieldSchemas";
import { siteSchema } from "./siteSchemas";
import { monitorStatusEnumValues } from "./statusValidationPrimitives";

/**
 * Schema ensuring that timestamp fields contain ISO 8601 date strings.
 */
const isoTimestampSchema: z.ZodType<string> = z
    .string()
    .trim()
    .pipe(
        z.iso.datetime({
            error: "Timestamp must be a valid ISO 8601 string",
        })
    );

export const safeParseIsoTimestamp = (
    value: unknown
): ReturnType<typeof isoTimestampSchema.safeParse> =>
    isoTimestampSchema.safeParse(value);

type MonitorStatusEnumSchema = z.ZodType<MonitorStatus>;

type StatusUpdateSchema = z.ZodObject<{
    details: z.ZodOptional<z.ZodString>;
    monitor: MonitorSchemaType;
    monitorId: z.ZodType<string>;
    previousStatus: z.ZodOptional<MonitorStatusEnumSchema>;
    responseTime: z.ZodOptional<z.ZodNumber>;
    site: SiteSchemaType;
    siteIdentifier: z.ZodType<string>;
    status: MonitorStatusEnumSchema;
    timestamp: z.ZodType<string>;
}>;

/**
 * Constructs the canonical {@link StatusUpdate} validation schema.
 *
 * @returns A strict `z.ZodObject` that models the full status update payload
 *   exchanged between renderer and orchestrator layers.
 */
const createStatusUpdateSchema = (): StatusUpdateSchema =>
    z
        .object({
            details: z.string().trim().optional(),
            monitor: monitorSchema,
            monitorId: monitorIdSchema,
            previousStatus: z.enum(monitorStatusEnumValues).optional(),
            responseTime: z.int().min(-1).optional(),
            site: siteSchema,
            siteIdentifier: siteIdentifierSchema,
            status: z.enum(monitorStatusEnumValues),
            timestamp: isoTimestampSchema,
        })
        .strict()
        .superRefine((value, context) => {
            if (value.monitorId !== value.monitor.id) {
                context.addIssue({
                    code: "custom",
                    message: "monitorId must match monitor.id",
                    path: ["monitorId"],
                });
            }

            if (value.siteIdentifier !== value.site.identifier) {
                context.addIssue({
                    code: "custom",
                    message: "siteIdentifier must match site.identifier",
                    path: ["siteIdentifier"],
                });
            }

            const isMonitorPresentInSite = value.site.monitors.some(
                (monitor) => monitor.id === value.monitorId
            );

            if (!isMonitorPresentInSite) {
                context.addIssue({
                    code: "custom",
                    message:
                        "monitorId must reference a monitor in site.monitors",
                    path: ["monitorId"],
                });
            }
        });

/**
 * Zod schema validating canonical status update payloads.
 *
 * @remarks
 * Generated via {@link createStatusUpdateSchema} to keep type inference in sync
 * with the runtime schema definition.
 */
const statusUpdateSchema: ReturnType<typeof createStatusUpdateSchema> =
    createStatusUpdateSchema();

// NOTE: Some downstream consumers (e.g. preload bridges) rely on `safeParse`
// returning the shared `StatusUpdate` interface. With `--isolatedDeclarations`
// and strict settings, Zod's inferred output type for complex discriminated
// monitor/site unions can become noisy (e.g. optionalizing required fields).
// The runtime schema is the source of truth; we cast the type for ergonomic, stable typing across IPC boundaries.

export const typedStatusUpdateSchema: z.ZodType<StatusUpdate> =
    statusUpdateSchema;
