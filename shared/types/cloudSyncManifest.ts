/**
 * Cloud sync manifest types (ADR-015/ADR-016).
 */

import {
    type CloudEncryptionConfig,
    cloudEncryptionConfigSchema,
} from "@shared/types/cloudEncryption";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { isValidPersistedDeviceId } from "@shared/validation/persistedDeviceIdValidation";
import * as z from "zod";

export const CLOUD_SYNC_MANIFEST_VERSION = 1 as const;

const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

const deviceCompactionSchema = z
    .object({
        compactedUpToOpId: z.int().min(-1).max(MAX_SAFE_INT),
        lastSeenAt: z.int().nonnegative().max(MAX_SAFE_INT),
    })
    .strict();

const cloudSyncManifestInternalSchema = z
    .object({
        // Accept arbitrary JSON object keys and sanitize them in
        // parseCloudSyncManifest().
        devices: z.record(z.string(), deviceCompactionSchema),
        encryption: cloudEncryptionConfigSchema.optional(),
        lastCompactionAt: z.int().nonnegative().max(MAX_SAFE_INT).optional(),
        latestSnapshotKey: z.string().min(1).optional(),
        manifestVersion: z.literal(CLOUD_SYNC_MANIFEST_VERSION),
        resetAt: z.int().nonnegative().max(MAX_SAFE_INT).optional(),
        syncSchemaVersion: z.literal(CLOUD_SYNC_SCHEMA_VERSION),
    })
    .strict();

/**
 * Maximum number of device entries we will persist in the manifest.
 *
 * @remarks
 * A remote provider could contain a corrupt or malicious manifest with a huge
 * number of device keys. Even if the manifest stays under the byte limit, a
 * large device map can cause unnecessary CPU/memory work and bloat future
 * writes. We cap the map and keep the most recently seen devices.
 */
const MAX_MANIFEST_DEVICES = 512;

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
    cloudSyncManifestInternalSchema;

/**
 * Parses and validates a manifest payload.
 */
export function parseCloudSyncManifest(candidate: unknown): CloudSyncManifest {
    const parsed = cloudSyncManifestInternalSchema.parse(candidate);

    const validEntries = Object.entries(parsed.devices).filter(
        ([deviceId]) => isValidPersistedDeviceId(deviceId)
    );

    const limited =
        validEntries.length > MAX_MANIFEST_DEVICES
            ? validEntries
                  .toSorted(([, a], [, b]) => b.lastSeenAt - a.lastSeenAt)
                  .slice(0, MAX_MANIFEST_DEVICES)
            : validEntries;

    if (limited.length === Object.keys(parsed.devices).length) {
        return parsed;
    }

    // IMPORTANT: Avoid Object.fromEntries with untrusted keys. Even if keys are
    // validated, defense-in-depth matters and null-prototype records avoid
    // prototype pollution edge cases.
    //
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Null-prototype record used as plain map.
    const devices = Object.create(null) as CloudSyncManifest["devices"];
    for (const [deviceId, meta] of limited) {
        Object.defineProperty(devices, deviceId, {
            configurable: true,
            enumerable: true,
            value: meta,
            writable: true,
        });
    }

    return {
        ...parsed,
        devices,
    };
}
