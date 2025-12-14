/**
 * Cloud sync manifest types (ADR-015/ADR-016).
 */

import {
    type CloudEncryptionConfig,
    cloudEncryptionConfigSchema,
} from "@shared/types/cloudEncryption";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import * as z from "zod";

export const CLOUD_SYNC_MANIFEST_VERSION = 1 as const;

const deviceCompactionSchema = z
    .object({
        compactedUpToOpId: z.number().int().min(-1),
        lastSeenAt: z.number().int().nonnegative(),
    })
    .strict();

const cloudSyncManifestSchemaInternal = z
    .object({
        devices: z.record(z.string().min(1), deviceCompactionSchema),
        encryption: cloudEncryptionConfigSchema.optional(),
        lastCompactionAt: z.number().int().nonnegative().optional(),
        latestSnapshotKey: z.string().min(1).optional(),
        manifestVersion: z.literal(CLOUD_SYNC_MANIFEST_VERSION),
        resetAt: z.number().int().nonnegative().optional(),
        syncSchemaVersion: z.literal(CLOUD_SYNC_SCHEMA_VERSION),
    })
    .strict();

/**
 * Remote manifest holding pointers and compaction metadata.
 */
export interface CloudSyncManifest {
    devices: Record<
        string,
        {
            compactedUpToOpId: number;
            lastSeenAt: number;
        }
    >;
    /** Optional remote encryption configuration (non-secret). */
    encryption?: CloudEncryptionConfig | undefined;
    /** Timestamp (epoch ms) of last compaction/snapshot. */
    lastCompactionAt?: number | undefined;
    /** Provider key for the latest snapshot. */
    latestSnapshotKey?: string | undefined;
    manifestVersion: typeof CLOUD_SYNC_MANIFEST_VERSION;
    /**
     * Optional epoch timestamp indicating the remote sync history was reset.
     *
     * @remarks
     * When set, op objects with a createdAtEpochMs prior to this value are
     * ignored.
     */
    resetAt?: number | undefined;
    syncSchemaVersion: typeof CLOUD_SYNC_SCHEMA_VERSION;
}

/**
 * Runtime schema for validating {@link CloudSyncManifest}.
 */
export const cloudSyncManifestSchema: z.ZodType<CloudSyncManifest> =
    cloudSyncManifestSchemaInternal;

/**
 * Parses and validates a manifest payload.
 */
export function parseCloudSyncManifest(candidate: unknown): CloudSyncManifest {
    return cloudSyncManifestSchemaInternal.parse(candidate);
}
