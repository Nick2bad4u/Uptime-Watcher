/**
 * Shared state synchronization type definitions.
 *
 * @remarks
 * Describes the cross-process contracts used by the state synchronization
 * domain. Runtime schemas and parsing helpers are exported to guarantee data
 * integrity between the preload bridge, renderer, and main process layers.
 */

import type { Site } from "@shared/types";

import { siteSchema } from "@shared/validation/siteSchemas";
import * as z from "zod";

/**
 * Minimal site snapshot used for state-sync *bookkeeping*.
 *
 * @remarks
 * Some infrastructure layers (e.g. IPC status tracking) only need the site
 * identifiers to compute counts and detect membership changes. Using this
 * lightweight type avoids unsafe casts such as `({ identifier }) as Site`.
 *
 * This type is **not** a replacement for full {@link Site} payloads used by
 * renderer state reconciliation.
 *
 * @public
 */
export type SiteIdentifierSnapshot = Pick<Site, "identifier">;

/**
 * Zod schema validating {@link SiteIdentifierSnapshot} payloads.
 */
export const siteIdentifierSnapshotSchema: z.ZodType<SiteIdentifierSnapshot> =
    z
        .object({
            identifier: z.string().min(1),
        })
        .strict();

const STATE_SYNC_SOURCE_VALUES = [
    "cache",
    "database",
    "frontend",
] as const;

/**
 * Union of all valid state synchronization sources.
 *
 * @public
 */
export type StateSyncSource = (typeof STATE_SYNC_SOURCE_VALUES)[number];

const stateSyncSourceSchemaInternal: z.ZodType<StateSyncSource> = z.enum(
    STATE_SYNC_SOURCE_VALUES
);

/**
 * Zod schema describing valid state synchronization sources.
 */
export const stateSyncSourceSchema: typeof stateSyncSourceSchemaInternal =
    stateSyncSourceSchemaInternal;

/**
 * Enumerated state synchronization sources for cross-layer consistency.
 *
 * @public
 */
export const STATE_SYNC_SOURCE: Readonly<{
    readonly CACHE: StateSyncSource;
    readonly DATABASE: StateSyncSource;
    readonly FRONTEND: StateSyncSource;
}> = Object.freeze({
    CACHE: "cache",
    DATABASE: "database",
    FRONTEND: "frontend",
});

/**
 * Ordered list of valid synchronization sources.
 *
 * @public
 */
export const STATE_SYNC_SOURCES: readonly StateSyncSource[] = Object.freeze(
    Array.from(STATE_SYNC_SOURCE_VALUES)
);

const STATE_SYNC_ACTION_VALUES = [
    "bulk-sync",
    "delete",
    "update",
] as const;

/**
 * Union of all supported state synchronization lifecycle actions.
 *
 * @public
 */
export type StateSyncAction = (typeof STATE_SYNC_ACTION_VALUES)[number];

const stateSyncActionSchemaInternal: z.ZodType<StateSyncAction> = z.enum(
    STATE_SYNC_ACTION_VALUES
);

/**
 * Zod schema describing valid state synchronization lifecycle actions.
 */
export const stateSyncActionSchema: typeof stateSyncActionSchemaInternal =
    stateSyncActionSchemaInternal;

/**
 * Enumerated state synchronization lifecycle actions.
 *
 * @public
 */
export const STATE_SYNC_ACTION: Readonly<{
    readonly BULK_SYNC: StateSyncAction;
    readonly DELETE: StateSyncAction;
    readonly UPDATE: StateSyncAction;
}> = Object.freeze({
    BULK_SYNC: "bulk-sync",
    DELETE: "delete",
    UPDATE: "update",
});

/**
 * Ordered list of valid synchronization actions.
 *
 * @public
 */
export const STATE_SYNC_ACTIONS: readonly StateSyncAction[] =
    STATE_SYNC_ACTION_VALUES;

const siteOutputSchema: z.ZodType<Site> = siteSchema.transform(
    (site): Site => site
);

const stateSyncSitesSchema: z.ZodType<Site[]> = z.array(siteOutputSchema);

/**
 * Zod schema validating state synchronization status summaries.
 */
const stateSyncStatusSummarySchemaInternal: z.ZodType<{
    lastSyncAt?: null | number;
    siteCount: number;
    source: StateSyncSource;
    synchronized: boolean;
}> = z
    .object({
        lastSyncAt: z.number().int().nonnegative().nullable(),
        siteCount: z.number().int().nonnegative(),
        source: stateSyncSourceSchema,
        synchronized: z.boolean(),
    })
    .strict();

/**
 * Zod schema validating state synchronization status summaries.
 */
export const stateSyncStatusSummarySchema: typeof stateSyncStatusSummarySchemaInternal =
    stateSyncStatusSummarySchemaInternal;

/**
 * Zod schema validating full synchronization results.
 */
const stateSyncFullSyncResultSchemaInternal: z.ZodType<{
    completedAt: number;
    revision: number;
    siteCount: number;
    sites: Site[];
    source: StateSyncSource;
    synchronized: boolean;
}> = z
    .object({
        completedAt: z.number().int().nonnegative(),
        revision: z.number().int().nonnegative(),
        siteCount: z.number().int().nonnegative(),
        sites: stateSyncSitesSchema,
        source: stateSyncSourceSchema,
        synchronized: z.boolean(),
    })
    .strict()
    .superRefine((value, ctx) => {
        if (value.sites.length !== value.siteCount) {
            ctx.addIssue({
                code: "custom",
                message: "siteCount must equal the number of serialized sites",
                path: ["siteCount"],
            });
        }
    });

/**
 * Structured delta describing how the site collection changed during a sync.
 *
 * @remarks
 * This delta is intentionally lightweight: it contains only the *next* site
 * snapshots for additions/updates and the identifiers for removals.
 *
 * Keeping deltas free of "previous" snapshots avoids duplicating large site
 * payloads across IPC boundaries and encourages consumers to derive diffs
 * locally when needed.
 *
 * @public
 */
export interface SiteSyncDelta {
    /** Collection of newly added sites. */
    addedSites: Site[];
    /** Identifiers corresponding to removed sites. */
    removedSiteIdentifiers: string[];
    /** Next snapshots for sites that changed between syncs. */
    updatedSites: Site[];
}

const siteSyncDeltaSchemaInternal: z.ZodType<SiteSyncDelta> = z
    .object({
        addedSites: stateSyncSitesSchema,
        removedSiteIdentifiers: z.array(z.string().min(1)),
        updatedSites: stateSyncSitesSchema,
    })
    .strict();

/**
 * Zod schema validating full synchronization results.
 */
export const stateSyncFullSyncResultSchema: typeof stateSyncFullSyncResultSchemaInternal =
    stateSyncFullSyncResultSchemaInternal;

/**
 * Zod schema describing valid {@link SiteSyncDelta} payloads.
 */
export const siteSyncDeltaSchema: typeof siteSyncDeltaSchemaInternal =
    siteSyncDeltaSchemaInternal;

/**
 * Summary returned from a `getSyncStatus` request.
 *
 * @remarks
 * `lastSyncAt` is `null` when no synchronization has completed yet. Consumers
 * should treat `null` as "not yet synced" rather than `0` or `undefined`.
 *
 * @public
 */
export type StateSyncStatusSummary = z.infer<
    typeof stateSyncStatusSummarySchema
>;

/**
 * Result returned from a `requestFullSync` invocation.
 *
 * @public
 */
export type StateSyncFullSyncResult = z.infer<
    typeof stateSyncFullSyncResultSchema
>;

/**
 * Safe parse result type for {@link StateSyncStatusSummary} payloads.
 */
export type StateSyncStatusSummaryParseResult = ReturnType<
    typeof stateSyncStatusSummarySchema.safeParse
>;

/**
 * Safe parse result type for {@link StateSyncFullSyncResult} payloads.
 */
export type StateSyncFullSyncResultParseResult = ReturnType<
    typeof stateSyncFullSyncResultSchema.safeParse
>;

/**
 * Type guard to check if a value is a valid {@link StateSyncStatusSummary}.
 *
 * @param candidate - Value to validate.
 *
 * @returns `true` when the value conforms to the schema.
 */
export function isStateSyncStatusSummary(
    candidate: unknown
): candidate is StateSyncStatusSummary {
    return stateSyncStatusSummarySchema.safeParse(candidate).success;
}

/**
 * Parses a candidate into a {@link StateSyncStatusSummary}.
 *
 * @param candidate - Value to parse.
 *
 * @returns The validated summary when successful.
 *
 * @throws {@link z.ZodError} When validation fails.
 */
export function parseStateSyncStatusSummary(
    candidate: unknown
): StateSyncStatusSummary {
    return stateSyncStatusSummarySchema.parse(candidate);
}

/**
 * Safely parses a candidate into a {@link StateSyncStatusSummary}.
 *
 * @param candidate - Value to validate.
 *
 * @returns Safe parse result describing success or failure.
 */
export function safeParseStateSyncStatusSummary(
    candidate: unknown
): StateSyncStatusSummaryParseResult {
    return stateSyncStatusSummarySchema.safeParse(candidate);
}

/**
 * Type guard to check if a value is a valid {@link StateSyncFullSyncResult}.
 *
 * @param candidate - Value to validate.
 *
 * @returns `true` when the value conforms to the schema.
 */
export function isStateSyncFullSyncResult(
    candidate: unknown
): candidate is StateSyncFullSyncResult {
    return stateSyncFullSyncResultSchema.safeParse(candidate).success;
}

/**
 * Parses a candidate into a {@link StateSyncFullSyncResult}.
 *
 * @param candidate - Value to parse.
 *
 * @returns The validated full sync result when successful.
 *
 * @throws {@link z.ZodError} When validation fails.
 */
export function parseStateSyncFullSyncResult(
    candidate: unknown
): StateSyncFullSyncResult {
    return stateSyncFullSyncResultSchema.parse(candidate);
}

/**
 * Safely parses a candidate into a {@link StateSyncFullSyncResult}.
 *
 * @param candidate - Value to validate.
 *
 * @returns Safe parse result describing success or failure.
 */
export function safeParseStateSyncFullSyncResult(
    candidate: unknown
): StateSyncFullSyncResultParseResult {
    return stateSyncFullSyncResultSchema.safeParse(candidate);
}
