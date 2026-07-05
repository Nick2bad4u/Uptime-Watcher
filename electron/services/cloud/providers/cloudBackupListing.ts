import type { CloudBackupEntry } from "@shared/types/cloud";

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { isPresent, setHas, stringSplit } from "ts-extras";

import type { CloudObjectEntry } from "./CloudStorageProvider.types";

import { logger } from "../../../utils/logger";
import {
    MAX_CLOUD_BACKUP_METADATA_FILE_BYTES,
    tryParseCloudBackupMetadataFileBuffer,
} from "./CloudBackupMetadataFile";

export const CLOUD_BACKUP_METADATA_READ_CONCURRENCY = 8;

interface ResultSlot<T> {
    readonly value: T;
}

function assertCompletedResults<T>(
    results: (ResultSlot<T> | undefined)[]
): asserts results is ResultSlot<T>[] {
    if (results.some((result) => !isPresent(result))) {
        throw new Error(
            "cloudBackupListing: internal error (missing metadata result)"
        );
    }
}

async function mapWithBoundedConcurrency<T, R>(args: {
    readonly concurrency: number;
    readonly items: readonly T[];
    readonly task: (item: T) => Promise<R>;
}): Promise<R[]> {
    const { concurrency, items, task } = args;

    if (items.length === 0) {
        return [];
    }

    const workerCount = Math.max(1, Math.min(concurrency, items.length));
    const results = Array.from(
        { length: items.length },
        (): ResultSlot<R> | undefined => undefined
    );
    let nextIndex = 0;

    const workers = Array.from({ length: workerCount }, async () => {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;

            const item = items[currentIndex];
            if (!isPresent(item)) {
                throw new Error(
                    "cloudBackupListing: internal error (missing metadata object)"
                );
            }

            // eslint-disable-next-line no-await-in-loop -- Worker loop performs bounded provider IO.
            results[currentIndex] = { value: await task(item) };
        }
    });

    await Promise.all(workers);
    assertCompletedResults(results);
    return results.map((result) => result.value);
}

/**
 * Lists backups by discovering metadata objects and hydrating them.
 *
 * @remarks
 * Several providers expose the same pattern:
 *
 * 1. List objects
 * 2. Filter for metadata objects
 * 3. Download metadata JSON
 * 4. Map to {@link CloudBackupEntry}
 *
 * This helper centralizes that logic so providers don't drift.
 */
export async function listBackupsFromMetadataObjects(args: {
    readonly downloadObjectBuffer: (key: string) => Promise<Buffer>;
    readonly objects: readonly CloudObjectEntry[];
}): Promise<CloudBackupEntry[]> {
    const objectKeys = new Set(args.objects.map((entry) => entry.key));

    const metadataObjects = args.objects.filter((entry) =>
        entry.key.endsWith(".metadata.json")
    );

    const entries = await mapWithBoundedConcurrency({
        concurrency: CLOUD_BACKUP_METADATA_READ_CONCURRENCY,
        items: metadataObjects,
        task: async (metadataObject): Promise<CloudBackupEntry | null> => {
            try {
                const backupKey = metadataObject.key.slice(
                    0,
                    -".metadata.json".length
                );

                // If the underlying backup blob is missing, the metadata is effectively orphaned and the backup cannot be restored.
                // Hide it from the UI to avoid offering broken restore paths.
                if (!setHas(objectKeys, backupKey)) {
                    logger.warn(
                        "[cloudBackupListing] Backup metadata is orphaned; skipping",
                        {
                            backupKey,
                            key: metadataObject.key,
                            message:
                                "Metadata sidecar exists without the corresponding backup object.",
                        }
                    );
                    return null;
                }

                if (
                    metadataObject.sizeBytes >
                    MAX_CLOUD_BACKUP_METADATA_FILE_BYTES
                ) {
                    logger.warn(
                        "[cloudBackupListing] Backup metadata is too large; skipping",
                        {
                            key: metadataObject.key,
                            maxSizeBytes: MAX_CLOUD_BACKUP_METADATA_FILE_BYTES,
                            message:
                                "Backup metadata sidecar exceeded the maximum supported size.",
                            sizeBytes: metadataObject.sizeBytes,
                        }
                    );
                    return null;
                }

                const metadataBuffer = await args.downloadObjectBuffer(
                    metadataObject.key
                );

                const parsed =
                    tryParseCloudBackupMetadataFileBuffer(metadataBuffer);

                if (!parsed) {
                    logger.warn(
                        "[cloudBackupListing] Backup metadata is invalid; skipping",
                        {
                            key: metadataObject.key,
                            message:
                                "Backup metadata buffer contained invalid JSON or did not match the expected schema.",
                        }
                    );
                    return null;
                }

                if (parsed.key !== backupKey) {
                    logger.warn(
                        "[cloudBackupListing] Backup metadata key mismatch; skipping",
                        {
                            backupKey,
                            key: metadataObject.key,
                            message:
                                "Backup metadata key does not match its sidecar object path.",
                            metadataKey: parsed.key,
                        }
                    );
                    return null;
                }

                const expectedFileName = stringSplit(backupKey, "/").pop() ?? "";
                if (
                    expectedFileName.length > 0 &&
                    parsed.fileName !== expectedFileName
                ) {
                    logger.warn(
                        "[cloudBackupListing] Backup metadata fileName mismatch; skipping",
                        {
                            expectedFileName,
                            key: metadataObject.key,
                            message:
                                "Backup metadata fileName does not match its backup object path.",
                            metadataFileName: parsed.fileName,
                        }
                    );
                    return null;
                }

                return parsed;
            } catch (error) {
                logger.warn(
                    "[cloudBackupListing] Failed to read/parse backup metadata; skipping",
                    {
                        key: metadataObject.key,
                        message: getUserFacingErrorDetail(error),
                    }
                );
                return null;
            }
        },
    });

    return entries
        .filter(isPresent)
        .toSorted((a, b) => b.metadata.createdAt - a.metadata.createdAt);
}
