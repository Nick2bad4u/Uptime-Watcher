import type { SiteSchemaType } from "@shared/types/schemaTypes";
import type { ValidationResult } from "@shared/types/validation";
import type { Jsonify } from "type-fest";

import * as z from "zod";

import { monitorSchema } from "./monitorSchemas";

/**
 * Zod schema for site data.
 *
 * @remarks
 * Validates site identifier, name, monitoring flag, and an array of monitors.
 */
export const siteSchema: SiteSchemaType = z
    .object({
        identifier: z
            .string()
            .min(1, "Site identifier is required")
            .max(100, "Site identifier too long"),
        monitoring: z.boolean(),
        monitors: z
            .array(monitorSchema)
            .min(1, "At least one monitor is required"),
        name: z
            .string()
            .min(1, "Site name is required")
            .max(200, "Site name too long"),
    })
    .strict();

/**
 * Type representing a validated site.
 *
 * @see {@link siteSchema}
 */
export type Site = z.infer<typeof siteSchema>;
/** JSON-safe representation of a validated site. */
export type SiteJson = Jsonify<Site>;

/**
 * Validates site data using the shared Zod schema.
 *
 * @remarks
 * Validates the complete site structure, including every monitor. Metadata in
 * the {@link ValidationResult} mirrors key site attributes such as monitor count
 * and identifier.
 *
 * @param data - The site data to validate.
 *
 * @returns The validation result object for the site.
 */
export function validateSiteData(data: unknown): ValidationResult {
    try {
        const validData = siteSchema.parse(data);
        return {
            data: validData,
            errors: [],
            metadata: {
                monitorCount: validData.monitors.length,
                siteIdentifier: validData.identifier,
            },
            success: true,
            warnings: [],
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map(
                (issue) => `${issue.path.join(".")}: ${issue.message}`
            );

            return {
                errors,
                metadata: {},
                success: false,
                warnings: [],
            };
        }

        return {
            errors: [
                `Validation failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            ],
            metadata: {},
            success: false,
            warnings: [],
        };
    }
}
