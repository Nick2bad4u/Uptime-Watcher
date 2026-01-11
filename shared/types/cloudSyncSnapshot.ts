/**
 * Cloud sync snapshot types (ADR-016).
 */

import type { CloudSyncState } from "@shared/types/cloudSyncState";

import {
    CLOUD_SYNC_SCHEMA_VERSION,
    cloudSyncEntityTypeSchema,
    cloudSyncWriteKeySchema,
    jsonValueSchema,
} from "@shared/types/cloudSync";
import * as z from "zod";

export const CLOUD_SYNC_SNAPSHOT_VERSION = 1 as const;

const cloudSyncFieldValueSchema = z
    .object({
        value: jsonValueSchema,
        write: cloudSyncWriteKeySchema,
    })
    .strict();

const cloudSyncEntityStateSchema = z
    .object({
        deleted: cloudSyncWriteKeySchema.optional(),
        entityId: z.string().min(1),
        entityType: cloudSyncEntityTypeSchema,
        fields: z.record(z.string().min(1), cloudSyncFieldValueSchema),
    })
    .strict();

const cloudSyncStateInternalSchema = z
    .object({
        monitor: z.record(z.string().min(1), cloudSyncEntityStateSchema),
        settings: z.record(z.string().min(1), cloudSyncEntityStateSchema),
        site: z.record(z.string().min(1), cloudSyncEntityStateSchema),
    })
    .strict();

/** Runtime schema for validating {@link CloudSyncState}. */
export const cloudSyncStateSchema: z.ZodType<CloudSyncState> =
    cloudSyncStateInternalSchema;

/**
 * A compacted snapshot of the derived sync state.
 */
export interface CloudSyncSnapshot {
    createdAt: number;
    snapshotVersion: typeof CLOUD_SYNC_SNAPSHOT_VERSION;
    state: CloudSyncState;
    syncSchemaVersion: typeof CLOUD_SYNC_SCHEMA_VERSION;
}

/** Runtime schema for validating {@link CloudSyncSnapshot}. */
export const cloudSyncSnapshotSchema: z.ZodType<CloudSyncSnapshot> = z
    .object({
        createdAt: z.int().nonnegative(),
        snapshotVersion: z.literal(CLOUD_SYNC_SNAPSHOT_VERSION),
        state: cloudSyncStateSchema,
        syncSchemaVersion: z.literal(CLOUD_SYNC_SCHEMA_VERSION),
    })
    .strict();

/**
 * Parses and validates a candidate snapshot.
 */
export function parseCloudSyncSnapshot(candidate: unknown): CloudSyncSnapshot {
    return cloudSyncSnapshotSchema.parse(candidate);
}
