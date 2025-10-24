/**
 * Shared runtime validation guards for renderer and main process code.
 *
 * @remarks
 * Provides reusable helpers built on top of the canonical Zod schemas so
 * runtime checks remain in sync with the shared type definitions.
 */

import type { ZodError } from "zod";

import type { Site } from "../types";

import { siteSchema } from "./schemas";

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
 * Describes a validation failure for an individual site snapshot.
 */
export interface SiteSnapshotValidationIssue {
    /** Detailed Zod error information for diagnostics. */
    readonly error: ZodError<Site>;
    /** Index of the invalid snapshot within the original collection. */
    readonly index: number;
    /** The original value that failed validation. */
    readonly value: unknown;
}

/**
 * Result shape returned when validating a collection of site snapshots.
 */
export interface SiteSnapshotCollectionParseResult {
    /** Successfully parsed site snapshots. */
    readonly data: Site[];
    /** Detailed issues for any snapshots that failed validation. */
    readonly errors: SiteSnapshotValidationIssue[];
    /**
     * Indicates whether every snapshot in the collection passed validation.
     */
    readonly success: boolean;
}

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

    return {
        data,
        errors,
        success: errors.length === 0,
    };
};
