import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";

import { ensureError } from "@shared/utils/errorHandling";

import type { CloudSyncEngine } from "../../sync/SyncEngine";
import type { CloudStorageProvider } from "../providers/CloudStorageProvider.types";

import { ProviderCloudSyncTransport } from "../../sync/ProviderCloudSyncTransport";

interface DeletionFailure {
    key: string;
    message: string;
}

async function deleteObjectsBestEffort(args: {
    concurrency: number;
    keys: readonly string[];
    provider: CloudStorageProvider;
}): Promise<{ deleted: number; failures: DeletionFailure[] }> {
    const failures: DeletionFailure[] = [];
    let deleted = 0;

    const { concurrency, keys, provider } = args;
    const workerCount = Math.max(1, Math.min(concurrency, keys.length));
    let index = 0;

    const workers = Array.from({ length: workerCount }, async () => {
        while (true) {
            const currentIndex = index;
            index += 1;
            const key = keys[currentIndex];
            if (key === undefined) {
                break;
            }

            try {
                // eslint-disable-next-line no-await-in-loop -- Worker loop performs sequential deletes to avoid provider rate limits.
                await provider.deleteObject(key);
                deleted += 1;
            } catch (error) {
                failures.push({
                    key,
                    message: ensureError(error).message,
                });
            }
        }
    });

    await Promise.all(workers);
    return { deleted, failures };
}

/**
 * Resets remote sync state by writing a new manifest with
 * {@link CloudSyncResetResult.resetAt} and re-seeding remote data from the
 * current device.
 *
 * @remarks
 * - This does **not** require perfect deletion of legacy objects because
 *   `manifest.resetAt` ensures older operation objects are ignored.
 * - The remote encryption config (if present) is preserved.
 */
export async function resetProviderCloudSyncState(args: {
    provider: CloudStorageProvider;
    syncEngine: CloudSyncEngine;
}): Promise<CloudSyncResetResult> {
    const startedAt = Date.now();
    const { provider, syncEngine } = args;

    const transport = ProviderCloudSyncTransport.create(provider);
    const remoteManifest =
        (await transport.readManifest()) ??
        ProviderCloudSyncTransport.createEmptyManifest();

    const resetAt = Date.now();

    const syncObjects = await provider.listObjects("sync/");
    const keysToDelete = syncObjects.map((entry) => entry.key);

    const deletionResult = await deleteObjectsBestEffort({
        concurrency: 4,
        keys: keysToDelete,
        provider,
    });

    const nextManifest = {
        ...ProviderCloudSyncTransport.createEmptyManifest(),
        ...(remoteManifest.encryption
            ? { encryption: remoteManifest.encryption }
            : {}),
        resetAt,
    };

    await transport.writeManifest(nextManifest);
    const seeded = await syncEngine.syncNow(provider);

    return {
        completedAt: Date.now(),
        deletedObjects: deletionResult.deleted,
        failedDeletions: deletionResult.failures,
        resetAt,
        ...(seeded.snapshotKey
            ? { seededSnapshotKey: seeded.snapshotKey }
            : {}),
        startedAt,
    };
}
