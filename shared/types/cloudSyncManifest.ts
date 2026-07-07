/**
 * Cloud sync manifest types (ADR-015/ADR-016).
 */

import {
    type CloudEncryptionConfig,
    cloudEncryptionConfigSchema,
} from "@shared/types/cloudEncryption";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { isValidPersistedDeviceId } from "@shared/validation/persistedDeviceIdValidation";
import { epochMsSchema } from "@shared/validation/timestampSchemas";
import { objectEntries } from "ts-extras";
import * as z from "zod";

export const CLOUD_SYNC_MANIFEST_VERSION = 1 as const;

const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

const deviceCompactionSchema = z
    .object({
        compactedUpToOpId: z.int().min(-1).max(MAX_SAFE_INT),
        lastSeenAt: epochMsSchema,
    })
    .strict();

const cloudSyncManifestInternalSchema = z
    .object({
        // Accept arbitrary JSON object keys and sanitize them in
        // parseCloudSyncManifest().
        devices: z.record(z.string(), deviceCompactionSchema),
        encryption: cloudEncryptionConfigSchema.optional(),
        lastCompactionAt: epochMsSchema.optional(),
        latestSnapshotKey: z.string().min(1).optional(),
        manifestVersion: z.literal(CLOUD_SYNC_MANIFEST_VERSION),
        resetAt: epochMsSchema.optional(),
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

export interface CloudSyncManifestDeviceCompaction {
    compactedUpToOpId: number;
    lastSeenAt: number;
}

/**
 * Remote manifest holding pointers and compaction metadata.
 */
export interface CloudSyncManifest {
    devices: Record<string, CloudSyncManifestDeviceCompaction>;
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
 * Builds a manifest device map that is safe for remote-derived device IDs.
 */
export function createCloudSyncManifestDevices(
    entries: readonly [string, CloudSyncManifestDeviceCompaction][] = []
): CloudSyncManifest["devices"] {
    const devices = createNullPrototypeObject<CloudSyncManifest["devices"]>();
    for (const [deviceId, meta] of entries) {
        setCloudSyncManifestDevice(devices, deviceId, meta);
    }

    return devices;
}

/**
 * Writes a manifest device entry as an own data property.
 */
export function setCloudSyncManifestDevice(
    devices: CloudSyncManifest["devices"],
    deviceId: string,
    meta: CloudSyncManifestDeviceCompaction
): void {
    Object.defineProperty(devices, deviceId, {
        configurable: true,
        enumerable: true,
        value: meta,
        writable: true,
    });
}

/**
 * Runtime schema for validating {@link CloudSyncManifest}.
 */
const cloudSyncManifestSchema: z.ZodType<CloudSyncManifest> =
    cloudSyncManifestInternalSchema.transform((manifest) =>
        normalizeCloudSyncManifest(manifest)
    );

function normalizeCloudSyncManifest(
    manifest: z.infer<typeof cloudSyncManifestInternalSchema>
): CloudSyncManifest {
    const validEntries = objectEntries(manifest.devices).filter(([deviceId]) =>
        isValidPersistedDeviceId(deviceId)
    );

    const limited =
        validEntries.length > MAX_MANIFEST_DEVICES
            ? validEntries
                  .toSorted(([, a], [, b]) => b.lastSeenAt - a.lastSeenAt)
                  .slice(0, MAX_MANIFEST_DEVICES)
            : validEntries;

    return {
        ...manifest,
        devices: createCloudSyncManifestDevices(limited),
    };
}

/**
 * Parses and validates a manifest payload.
 */
export function parseCloudSyncManifest(candidate: unknown): CloudSyncManifest {
    return cloudSyncManifestSchema.parse(candidate);
}
