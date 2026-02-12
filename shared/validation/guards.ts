/**
 * Shared runtime validation guards for renderer and main process code.
 *
 * @remarks
 * Provides reusable helpers built on top of the canonical Zod schemas so
 * runtime checks remain in sync with the shared type definitions.
 */

import type * as z from "zod";

import type { Site } from "../types";

import { siteSchema } from "./siteSchemas";
import { typedStatusUpdateSchema as statusUpdateSchema } from "./statusUpdateSchemas";

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
 * @returns The Zod {@link https://zod.dev/?id=safeparse | SafeParseReturnType}
 *   describing validation success and, when successful, the inferred
 *   {@link Site} instance.
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
 * Validates an unknown payload against the canonical
 * {@link shared/types#StatusUpdate | StatusUpdate} schema.
 */
export type StatusUpdateParseResult = ReturnType<
    typeof statusUpdateSchema.safeParse
>;

export const validateStatusUpdate = (value: unknown): StatusUpdateParseResult =>
    statusUpdateSchema.safeParse(value);

const siteSnapshotsSchema: z.ZodType<Site[]> = siteSchema.array();

/**
 * Validates an unknown payload against the canonical `Site[]` schema.
 *
 * @remarks
 * This mirrors the return shape of other guards in this module by returning the
 * Zod {@link https://zod.dev/?id=safeparse | SafeParseReturnType}. Consumers
 * that need per-index diagnostics can derive indices from
 * `result.error.issues[*].path[0]`.
 */
export type SiteSnapshotsParseResult = ReturnType<
    typeof siteSnapshotsSchema.safeParse
>;

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
    values: unknown
): SiteSnapshotsParseResult => siteSnapshotsSchema.safeParse(values);
