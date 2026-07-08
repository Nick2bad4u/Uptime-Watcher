import type { Site } from "@shared/types";

import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import { createOwnDataRecordSchema } from "@shared/validation/ownDataRecordSchema";
import * as z from "zod";

import { monitorSchema } from "./monitorSchemas";
import { siteIdentifierSchema, siteNameSchema } from "./siteFieldSchemas";

/**
 * Current supported import/export version.
 *
 * @remarks
 * This is used for user-driven JSON import/export flows (not cloud backup).
 */
const importExportVersionSchema: z.ZodLiteral<"1.0"> = z.literal("1.0");

const isoLastCheckedSchema = z
    .string()
    .trim()
    .pipe(z.iso.datetime())
    .transform((value) => new Date(value));

function normalizeSerializedMonitorDates(value: unknown): unknown {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return value;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, "lastChecked");
    if (
        !descriptor?.enumerable ||
        !("value" in descriptor) ||
        typeof descriptor.value !== "string"
    ) {
        return value;
    }

    const parsedLastChecked = isoLastCheckedSchema.safeParse(descriptor.value);
    if (!parsedLastChecked.success) {
        return value;
    }

    const normalized = createNullPrototypeObject<Record<string, unknown>>();
    for (const key of Object.keys(value)) {
        const entry = Object.getOwnPropertyDescriptor(value, key);
        if (!entry?.enumerable || !("value" in entry)) {
            continue;
        }

        Object.defineProperty(normalized, key, {
            configurable: true,
            enumerable: true,
            value:
                key === "lastChecked" ? parsedLastChecked.data : entry.value,
            writable: true,
        });
    }

    return normalized;
}

const importExportMonitorSchema: z.ZodType<Site["monitors"][0]> = z.preprocess(
    normalizeSerializedMonitorDates,
    monitorSchema
);

/**
 * Type for a site record inside import payloads.
 */
export interface ImportSite {
    readonly identifier: string;
    readonly monitoring?: boolean | undefined;
    readonly monitors?: Site["monitors"] | undefined;
    readonly name?: string | undefined;
}

/**
 * Schema for a site record inside import payloads.
 *
 * @remarks
 * Import is intentionally more permissive than {@link siteSchema} to allow users
 * to bring partial data into the app and let the database layer apply defaults
 * where appropriate.
 */
const importSiteSchema: z.ZodType<ImportSite> = z
    .object({
        identifier: siteIdentifierSchema,
        monitoring: z.boolean().optional(),
        monitors: z.array(importExportMonitorSchema).optional(),
        name: siteNameSchema.optional(),
    })
    .strict();

const exportSiteSchema = z
    .object({
        identifier: siteIdentifierSchema,
        monitoring: z.boolean(),
        monitors: z.array(importExportMonitorSchema),
        name: siteNameSchema,
    })
    .strict();

/**
 * Schema for JSON imports.
 *
 * @remarks
 * We accept optional metadata fields so we can evolve the format without
 * breaking older exports.
 */
export interface ImportData {
    readonly exportedAt?: string | undefined;
    readonly settings?: Record<string, string> | undefined;
    readonly sites: ImportSite[];
    readonly version?: string | undefined;
}

const settingKeySchema = z.string().refine((key) => key.trim().length > 0, {
    message: "Setting key is required",
});
const settingsSchema = createOwnDataRecordSchema(
    z.string().trim(),
    settingKeySchema
);

const importDataSchema: z.ZodType<ImportData> = z
    .object({
        exportedAt: z.string().trim().optional(),
        settings: settingsSchema.optional(),
        sites: z.array(importSiteSchema),
        version: z.string().trim().optional(),
    })
    .strict();

/**
 * Schema for JSON exports.
 */
export interface ExportData {
    readonly exportedAt: string;
    readonly settings?: Record<string, string> | undefined;
    readonly sites: Site[];
    readonly version: "1.0";
}

const exportDataSchema: z.ZodType<ExportData> = z
    .object({
        exportedAt: z.string().trim().min(1),
        settings: settingsSchema.optional(),
        sites: z.array(exportSiteSchema),
        version: importExportVersionSchema,
    })
    .strict();

/**
 * Structured details for a failed import payload validation.
 *
 * @remarks
 * We expose both a high-level message and a list of issue strings so the UI can
 * show a concise summary while logs/debug views can provide more actionable
 * detail.
 */
export interface ImportValidationFailure {
    /** Flattened issue strings (path + message) for display/logging. */
    readonly issues: readonly string[];
    /** Human-friendly explanation of why validation failed. */
    readonly message: string;
}

/**
 * Validates imported JSON payloads.
 *
 * @returns The parsed payload if valid, otherwise a structured failure.
 */
export function validateImportData(
    value: unknown
):
    | { error: ImportValidationFailure; ok: false }
    | { ok: true; value: ImportData } {
    const result = importDataSchema.safeParse(value);

    if (result.success) {
        return { ok: true, value: result.data };
    }

    const issues = formatZodIssues(result.error.issues);

    return {
        error: {
            issues,
            message: "Import data did not match the expected format.",
        },
        ok: false,
    };
}

/**
 * Validates exported JSON payloads.
 *
 * @remarks
 * This is used primarily for internal sanity checks.
 */
export function validateExportData(value: unknown): value is ExportData {
    return exportDataSchema.safeParse(value).success;
}
