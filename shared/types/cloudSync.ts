/**
 * Multi-device cloud sync types (ADR-016).
 *
 * @remarks
 * This module defines the _provider-neutral_ operation log and snapshot payload
 * shapes used for true multi-device sync.
 *
 * It intentionally does **not** reference the local SQLite schema, because
 * SQLite is a persistence mechanism rather than a sync protocol.
 *
 * The first implementation slice focuses on:
 *
 * - A JSON-safe operation format
 * - Deterministic last-write-wins ordering
 * - Runtime validation via Zod
 *
 * Higher-level domain operations (sites/monitors/settings) can be layered on
 * top of these primitives.
 */

import type { JsonValue as TypeFestJsonValue } from "type-fest";

import * as z from "zod";

/**
 * Current sync schema version.
 *
 * @remarks
 * Bump only when introducing a breaking change to the sync payload model.
 */
export const CLOUD_SYNC_SCHEMA_VERSION = 1 as const;

const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

/**
 * JSON value type that is safe to serialize across processes/providers.
 *
 * @public
 */
export type JsonValue = TypeFestJsonValue;

const jsonValueInternalSchema: z.ZodType<JsonValue> = z.lazy(() =>
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(jsonValueInternalSchema),
        z.record(z.string(), jsonValueInternalSchema),
    ])
);

/**
 * Zod schema validating {@link JsonValue}.
 */
export const jsonValueSchema: z.ZodType<JsonValue> = jsonValueInternalSchema;

const entityTypeValues = [
    "site",
    "monitor",
    "settings",
] as const;

/**
 * Entity type names supported by the generic sync primitives.
 *
 * @remarks
 * These are _not_ the same as local database tables.
 */
export type CloudSyncEntityType = (typeof entityTypeValues)[number];

const cloudSyncEntityTypeInternalSchema: z.ZodType<CloudSyncEntityType> =
    z.enum(entityTypeValues);

/**
 * Zod schema validating {@link CloudSyncEntityType}.
 */
export const cloudSyncEntityTypeSchema: typeof cloudSyncEntityTypeInternalSchema =
    cloudSyncEntityTypeInternalSchema;

/**
 * Common write ordering key.
 *
 * @remarks
 * Ordering is deterministic:
 *
 * 1. Higher timestamp wins.
 * 2. Tie-breaker: lexicographic `deviceId`.
 * 3. Tie-breaker (same device): higher `opId` wins.
 */
export interface CloudSyncWriteKey {
    /** Device identifier that produced the write. */
    readonly deviceId: string;
    /** Monotonic per-device operation id. */
    readonly opId: number;
    /** Unix epoch milliseconds (UTC). */
    readonly timestamp: number;
}

const cloudSyncWriteKeyInternalSchema: z.ZodType<CloudSyncWriteKey> = z
    .object({
        deviceId: z.string().min(1),
        opId: z.int().nonnegative().max(MAX_SAFE_INT),
        timestamp: z.int().nonnegative().max(MAX_SAFE_INT),
    })
    .strict();

/**
 * Zod schema validating {@link CloudSyncWriteKey}.
 */
export const cloudSyncWriteKeySchema: z.ZodType<CloudSyncWriteKey> =
    cloudSyncWriteKeyInternalSchema;
/**
 * Operation emitted to the per-device append-only log.
 */
export interface CloudSyncSetFieldOperation {
    readonly deviceId: string;
    readonly entityId: string;
    readonly entityType: CloudSyncEntityType;
    readonly field: string;
    readonly kind: "set-field";
    readonly opId: number;
    readonly syncSchemaVersion: typeof CLOUD_SYNC_SCHEMA_VERSION;
    readonly timestamp: number;
    readonly value: JsonValue;
}

/**
 * Delete/tombstone operation for an entity.
 */
export interface CloudSyncDeleteEntityOperation {
    readonly deviceId: string;
    readonly entityId: string;
    readonly entityType: CloudSyncEntityType;
    readonly kind: "delete-entity";
    readonly opId: number;
    readonly syncSchemaVersion: typeof CLOUD_SYNC_SCHEMA_VERSION;
    readonly timestamp: number;
}

/**
 * Operation emitted to the per-device append-only log.
 */
export type CloudSyncOperation =
    | CloudSyncDeleteEntityOperation
    | CloudSyncSetFieldOperation;

const setFieldOperationSchema = z
    .object({
        deviceId: z.string().min(1),
        entityId: z.string().min(1),
        entityType: cloudSyncEntityTypeInternalSchema,
        opId: z.int().nonnegative().max(MAX_SAFE_INT),
        syncSchemaVersion: z.literal(CLOUD_SYNC_SCHEMA_VERSION),
        timestamp: z.int().nonnegative().max(MAX_SAFE_INT),
    })
    .strict();

const cloudSyncBaseOperationSchema = setFieldOperationSchema;

const setFieldOperationSchemaTyped = cloudSyncBaseOperationSchema
    .extend({
        field: z.string().min(1),
        kind: z.literal("set-field"),
        value: jsonValueInternalSchema,
    })
    .strict() satisfies z.ZodType<CloudSyncSetFieldOperation>;

const deleteEntityOperationSchema = cloudSyncBaseOperationSchema
    .extend({
        kind: z.literal("delete-entity"),
    })
    .strict() satisfies z.ZodType<CloudSyncDeleteEntityOperation>;

const cloudSyncOperationInternalSchema: z.ZodType<CloudSyncOperation> =
    z.discriminatedUnion("kind", [
        deleteEntityOperationSchema,
        setFieldOperationSchemaTyped,
    ]);

/**
 * Zod schema validating {@link CloudSyncOperation}.
 */
export const cloudSyncOperationSchema: typeof cloudSyncOperationInternalSchema =
    cloudSyncOperationInternalSchema;

/**
 * Parses a candidate into a {@link CloudSyncOperation}.
 *
 * @throws Z.ZodError - When validation fails.
 */
export function parseCloudSyncOperation(
    candidate: unknown
): CloudSyncOperation {
    return cloudSyncOperationSchema.parse(candidate);
}

/**
 * Compares two write keys using ADR-016's deterministic ordering.
 *
 * @returns
 *
 *   - Negative when `a` should be applied before `b`
 *   - Positive when `a` should be applied after `b`
 *   - Zero when considered equal
 */
export function compareCloudSyncWriteKey(
    a: CloudSyncWriteKey,
    b: CloudSyncWriteKey
): number {
    if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
    }

    const deviceCompare = a.deviceId.localeCompare(b.deviceId);
    if (deviceCompare !== 0) {
        return deviceCompare;
    }

    return a.opId - b.opId;
}
