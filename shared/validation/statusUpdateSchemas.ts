import type { MonitorStatus, StatusUpdate } from "@shared/types";
import type {
    MonitorSchemaType,
    SiteSchemaType,
} from "@shared/types/schemaTypes";

import * as z from "zod";

import { monitorSchema } from "./monitorSchemas";
import { siteSchema } from "./siteSchemas";
import { monitorStatusEnumValues } from "./statusValidationPrimitives";

/**
 * Schema ensuring that timestamp fields contain ISO 8601 date strings.
 *
 * @remarks
 * Uses {@link Date.parse} for validation, mirroring the parsing strategy used
 * throughout the application when interpreting status update timestamps.
 */
const isoTimestampSchema: z.ZodType<string> = z
    .string()
    .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Timestamp must be a valid ISO 8601 string"
    );

type MonitorStatusEnumSchema = z.ZodType<MonitorStatus>;

type StatusUpdateSchema = z.ZodObject<{
    details: z.ZodOptional<z.ZodString>;
    monitor: MonitorSchemaType;
    monitorId: z.ZodString;
    previousStatus: z.ZodOptional<MonitorStatusEnumSchema>;
    responseTime: z.ZodOptional<z.ZodNumber>;
    site: SiteSchemaType;
    siteIdentifier: z.ZodString;
    status: MonitorStatusEnumSchema;
    timestamp: z.ZodType<string>;
}>;

/**
 * Constructs the canonical {@link StatusUpdate} validation schema.
 *
 * @returns A strict {@link z.ZodObject} that models the full status update
 *   payload exchanged between renderer and orchestrator layers.
 */
const createStatusUpdateSchema = (): StatusUpdateSchema =>
    z
        .object({
            details: z.string().optional(),
            monitor: monitorSchema,
            monitorId: z.string().min(1, "Monitor identifier is required"),
            previousStatus: z.enum(monitorStatusEnumValues).optional(),
            responseTime: z.number().optional(),
            site: siteSchema,
            siteIdentifier: z
                .string()
                .min(1, "Site identifier is required for status updates"),
            status: z.enum(monitorStatusEnumValues),
            timestamp: isoTimestampSchema,
        })
        .strict();

/**
 * Zod schema validating canonical status update payloads.
 *
 * @remarks
 * Generated via {@link createStatusUpdateSchema} to keep type inference in sync
 * with the runtime schema definition.
 */
export const statusUpdateSchema: ReturnType<typeof createStatusUpdateSchema> =
    createStatusUpdateSchema();

/**
 * Compile-time assertion verifying {@link statusUpdateSchema} alignment with the
 * {@link StatusUpdate} TypeScript interface.
 */
export type StatusUpdateSchemaConformanceCheck =
    z.infer<typeof statusUpdateSchema> extends StatusUpdate
        ? StatusUpdate extends z.infer<typeof statusUpdateSchema>
            ? true
            : never
        : never;
