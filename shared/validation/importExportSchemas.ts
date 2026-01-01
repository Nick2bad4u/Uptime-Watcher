import type { Site } from "@shared/types";

import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

import { monitorSchema } from "./monitorSchemas";
import { siteIdentifierSchema, siteNameSchema } from "./siteFieldSchemas";
import { siteSchema } from "./siteSchemas";

/**
 * Current supported import/export version.
 *
 * @remarks
 * This is used for user-driven JSON import/export flows (not cloud backup).
 */
export const importExportVersionSchema: z.ZodLiteral<"1.0"> = z.literal("1.0");

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
 * to bring partial data into the application and let the database layer apply
 * defaults where appropriate.
 */
export const importSiteSchema: z.ZodType<ImportSite> = z
    .object({
        identifier: siteIdentifierSchema,
        monitoring: z.boolean().optional(),
        monitors: z.array(monitorSchema).min(1).optional(),
        name: siteNameSchema.optional(),
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

export const importDataSchema: z.ZodType<ImportData> = z
    .object({
        exportedAt: z.string().optional(),
        settings: z.record(z.string(), z.string()).optional(),
        sites: z.array(importSiteSchema).min(1),
        version: z.string().optional(),
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

export const exportDataSchema: z.ZodType<ExportData> = z
    .object({
        exportedAt: z.string().min(1),
        settings: z.record(z.string(), z.string()).optional(),
        sites: z.array(siteSchema).min(1),
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
