/**
 * Result returned by the remote sync reset maintenance operation.
 */
export interface CloudSyncResetResult {
    completedAt: number;
    deletedObjects: number;
    failedDeletions: Array<{ key: string; message: string }>;
    resetAt: number;
    seededSnapshotKey?: string | undefined;
    startedAt: number;
}
