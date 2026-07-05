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
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
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

function getEnumerableOwnStringEntries(
    value: unknown
): [string, unknown][] | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }

    const entries: [string, unknown][] = [];
    for (const key of Object.keys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor?.enumerable && "value" in descriptor) {
            entries.push([key, descriptor.value]);
        }
    }

    return entries;
}

function createSafeRecordSchema<T>(
    valueSchema: z.ZodType<T>
): z.ZodType<Record<string, T>> {
    return z
        .custom<Record<string, unknown>>(
            (value) => getEnumerableOwnStringEntries(value) !== null,
            "Expected a record"
        )
        .superRefine((value, ctx) => {
            const entries = getEnumerableOwnStringEntries(value);
            if (!entries) {
                return;
            }

            for (const [key, entry] of entries) {
                if (key.length === 0) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Record keys must be non-empty strings",
                        path: [key],
                    });
                    continue;
                }

                const parsed = valueSchema.safeParse(entry);
                if (!parsed.success) {
                    for (const issue of parsed.error.issues) {
                        ctx.addIssue({
                            code: "custom",
                            message: issue.message,
                            path: [
                                key,
                                ...issue.path,
                            ],
                        });
                    }
                }
            }
        })
        .transform((value) => {
            const result = createNullPrototypeObject<Record<string, T>>();
            for (const [key, entry] of getEnumerableOwnStringEntries(value) ??
                []) {
                Object.defineProperty(result, key, {
                    configurable: true,
                    enumerable: true,
                    value: valueSchema.parse(entry),
                    writable: true,
                });
            }

            return result;
        });
}

const cloudSyncEntityStateSchema = z
    .object({
        deleted: cloudSyncWriteKeySchema.optional(),
        entityId: z.string().min(1),
        entityType: cloudSyncEntityTypeSchema,
        fields: createSafeRecordSchema(cloudSyncFieldValueSchema),
    })
    .strict();

const cloudSyncStateInternalSchema = z
    .object({
        monitor: createSafeRecordSchema(cloudSyncEntityStateSchema),
        settings: createSafeRecordSchema(cloudSyncEntityStateSchema),
        site: createSafeRecordSchema(cloudSyncEntityStateSchema),
    })
    .strict()
    .superRefine((state, ctx) => {
        for (const entityType of CLOUD_SYNC_STATE_ENTITY_TYPES) {
            for (const [entityId, entity] of objectEntries(state[entityType])) {
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
