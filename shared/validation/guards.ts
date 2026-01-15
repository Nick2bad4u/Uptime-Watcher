/**
 * Shared runtime validation guards for renderer and main process code.
 *
 * @remarks
 * Provides reusable helpers built on top of the canonical Zod schemas so
 * runtime checks remain in sync with the shared type definitions.
 */

import type { ExclusifyUnion } from "type-fest";
import type * as z from "zod";

import type { Site } from "../types";

import { siteSchema } from "./siteSchemas";
import { statusUpdateSchema } from "./statusUpdateSchemas";

/**
 * Canonical schema for site update payloads.
 *
 * @remarks
 * Site identifiers are treated as immutable (primary key). Updates may only
 * modify the remaining fields, and unknown keys are rejected.
 */
type SiteUpdateBase = Omit<Site, "identifier">;

type SiteUpdate = {
    readonly [Key in keyof SiteUpdateBase]?: SiteUpdateBase[Key] | undefined;
};

const siteUpdateSchema: z.ZodType<SiteUpdate> = siteSchema
    .omit({ identifier: true })
    .partial()
    .strict();
/**
 * Validates an unknown payload against the canonical {@link Site} schema.
 *
 * @param value - Payload returned from an external boundary (e.g. IPC).
 *
 * @returns The Zod {@link SafeParseReturnType} describing validation success
 *   and, when successful, the inferred {@link Site} instance.
 */
export type SiteSnapshotParseResult = ReturnType<typeof siteSchema.safeParse>;

export const validateSiteSnapshot = (value: unknown): SiteSnapshotParseResult =>
    siteSchema.safeParse(value);

/**
 * Validates an unknown payload against the canonical site update schema.
 */
export type SiteUpdateParseResult = ReturnType<
    typeof siteUpdateSchema.safeParse
>;

export const validateSiteUpdate = (value: unknown): SiteUpdateParseResult =>
    siteUpdateSchema.safeParse(value);

/**
 * Validates an unknown payload against the canonical {@link StatusUpdate}
 * schema.
 */
export type StatusUpdateParseResult = ReturnType<
    typeof statusUpdateSchema.safeParse
>;

export const validateStatusUpdate = (value: unknown): StatusUpdateParseResult =>
    statusUpdateSchema.safeParse(value);

/**
 * Describes a validation failure for an individual site snapshot.
 */
export interface SiteSnapshotValidationIssue {
    /** Detailed Zod error information for diagnostics. */
    readonly error: z.ZodError<Site>;
    /** Index of the invalid snapshot within the original collection. */
    readonly index: number;
    /** The original value that failed validation. */
    readonly value: unknown;
}

type SiteSnapshotCollectionParseVariant =
    | {
          readonly data: Site[];
          readonly errors: [];
          readonly status: "success";
      }
    | {
          readonly data: Site[];
          readonly errors: SiteSnapshotValidationIssue[];
          readonly status: "failure";
      };

/**
 * Result shape returned when validating a collection of site snapshots.
 */
export type SiteSnapshotCollectionParseResult =
    ExclusifyUnion<SiteSnapshotCollectionParseVariant>;

/**
 * @remarks
 * Validates a collection of candidate site snapshots and aggregates
 * diagnostics.
 *
 * @param values - Collection of unknown payloads to validate.
 *
 * @returns Structured result containing the validated snapshots and any
 *   validation issues.
 */
export const validateSiteSnapshots = (
    values: readonly unknown[]
): SiteSnapshotCollectionParseResult => {
    const errors: SiteSnapshotValidationIssue[] = [];
    const data: Site[] = [];

    values.forEach((value, index) => {
        const result = siteSchema.safeParse(value);

        if (result.success) {
            data.push(result.data);
            return;
        }

        errors.push({
            error: result.error,
            index,
            value,
        });
    });

    if (errors.length === 0) {
        return {
            data,
            errors: [],
            status: "success",
        } satisfies SiteSnapshotCollectionParseResult;
    }

    return {
        data,
        errors,
        status: "failure",
    } satisfies SiteSnapshotCollectionParseResult;
};
