import type { CloudBackupEntry } from "@shared/types/cloud";

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { isPresent } from "ts-extras";

import type { CloudObjectEntry } from "./CloudStorageProvider.types";

import { logger } from "../../../utils/logger";
import { tryParseCloudBackupMetadataFileBuffer } from "./CloudBackupMetadataFile";

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

    const entries = await Promise.all(
        metadataObjects.map(
            async (metadataObject): Promise<CloudBackupEntry | null> => {
                try {
                    const backupKey = metadataObject.key.slice(
                        0,
                        -".metadata.json".length
                    );

                    // If the underlying backup blob is missing, the metadata is
                    // effectively orphaned and the backup cannot be restored.
                    // Hide it from the UI to avoid offering broken restore paths.
                    if (!objectKeys.has(backupKey)) {
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
            }
        )
    );

    return entries
        .filter(isPresent)
        .toSorted((a, b) => b.metadata.createdAt - a.metadata.createdAt);
}
