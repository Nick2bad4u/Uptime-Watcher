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
import { monitorIdSchema } from "@shared/validation/monitorFieldSchemas";
import { createOwnDataRecordSchema } from "@shared/validation/ownDataRecordSchema";
import { siteIdentifierSchema } from "@shared/validation/siteFieldSchemas";
import { epochMsSchema } from "@shared/validation/timestampSchemas";
import { objectEntries } from "ts-extras";
import * as z from "zod";

export const CLOUD_SYNC_SNAPSHOT_VERSION = 1 as const;
const CLOUD_SYNC_STATE_ENTITY_TYPES = [
    "monitor",
    "settings",
    "site",
] as const;

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
        fields: createOwnDataRecordSchema(cloudSyncFieldValueSchema),
    })
    .strict();

const cloudSyncStateInternalSchema = z
    .object({
        monitor: createOwnDataRecordSchema(cloudSyncEntityStateSchema),
        settings: createOwnDataRecordSchema(cloudSyncEntityStateSchema),
        site: createOwnDataRecordSchema(cloudSyncEntityStateSchema),
    })
    .strict()
    .superRefine((state, ctx) => {
        for (const entityType of CLOUD_SYNC_STATE_ENTITY_TYPES) {
            for (const [entityId, entity] of objectEntries(state[entityType])) {
                const idSchema =
                    entityType === "monitor"
                        ? monitorIdSchema
                        : entityType === "site"
                          ? siteIdentifierSchema
                          : undefined;

                if (idSchema && !idSchema.safeParse(entityId).success) {
                    ctx.addIssue({
                        code: "custom",
                        message: `${entityType} entityId is invalid`,
                        path: [
                            entityType,
                            entityId,
                            "entityId",
                        ],
                    });
                }

                if (entity.entityId !== entityId) {
                    ctx.addIssue({
                        code: "custom",
                        message: "entityId must match its state map key",
                        path: [
                            entityType,
                            entityId,
                            "entityId",
                        ],
                    });
                }

                if (entity.entityType !== entityType) {
                    ctx.addIssue({
                        code: "custom",
                        message: "entityType must match its state map",
                        path: [
                            entityType,
                            entityId,
                            "entityType",
                        ],
                    });
                }
            }
        }
    });

/** Runtime schema for validating {@link CloudSyncState}. */
const cloudSyncStateSchema: z.ZodType<CloudSyncState> =
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
const cloudSyncSnapshotSchema: z.ZodType<CloudSyncSnapshot> = z
    .object({
        createdAt: epochMsSchema,
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
