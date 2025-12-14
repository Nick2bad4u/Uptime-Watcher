/**
 * Preview information shown before executing a destructive remote sync reset.
 */
export interface CloudSyncResetPreviewDevice {
    /** Device identifier from the object key path. */
    deviceId: string;
    /** Newest createdAtEpochMs observed in op object keys for this device. */
    newestCreatedAtEpochMs?: number | undefined;
    /** Oldest createdAtEpochMs observed in op object keys for this device. */
    oldestCreatedAtEpochMs?: number | undefined;
    /** Count of operation log objects for this device. */
    operationObjectCount: number;
}

/**
 * Preview information shown before executing a destructive remote sync reset.
 */
export interface CloudSyncResetPreview {
    /** Known device IDs present in the remote manifest. */
    deviceIds: string[];
    /** Epoch timestamp when the preview was generated. */
    fetchedAt: number;
    /** Latest snapshot key from the manifest, if any. */
    latestSnapshotKey?: string | undefined;
    /** Device IDs observed in operation object keys. */
    operationDeviceIds: string[];
    /** Estimated number of operation log objects. */
    operationObjectCount: number;
    /** Number of other/unclassified objects under `sync/` (not ops/snapshots). */
    otherObjectCount: number;
    /** Per-device operation object breakdown. */
    perDevice: CloudSyncResetPreviewDevice[];
    /** Current remote manifest reset marker, if any. */
    resetAt?: number | undefined;
    /** Estimated number of snapshot objects. */
    snapshotObjectCount: number;
    /** Total number of remote objects under `sync/`. */
    syncObjectCount: number;
}
